const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const materials = require('./src/materials');
const store = require('./src/store');
const llm = require('./src/llm');
const ssh = require('./src/ssh');
const scenarios = require('./src/scenarios');
const assess = require('./src/assess');
const tutorial = require('./src/tutorial');
const chat = require('./src/chat');

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'dev-insecure-secret-change-me'));

// Per-request LLM settings from a signed session cookie (set via the in-app
// Settings panel). Falls back to env / on-disk settings when no cookie is present.
// On Vercel the filesystem is read-only, so the cookie is the only way to bring
// your own key — and it auto-expires after 30 min (per-session, gone after 30m).
const EXPIRY_MS = 30 * 60 * 1000;
app.use((req, res, next) => {
  const c = req.signedCookies && req.signedCookies.llm_settings;
  if (c && c.baseURL && c.apiKey) {
    const expiresAt = (c.issuedAt || Date.now()) + EXPIRY_MS;
    if (Date.now() < expiresAt) {
      req.llmSettings = {
        baseURL: c.baseURL, apiKey: c.apiKey, model: c.model || 'gpt-4o-mini',
        configured: true, source: 'settings', expiresAt
      };
      return next();
    }
  }
  req.llmSettings = store.getSettings();
  next();
});

const PUBLIC = path.join(__dirname, 'public');
// Serve ./public from within the function — works both locally and on Vercel.
// (Vercel does NOT auto-serve ./public for this serverless deploy type.)
app.use(express.static(PUBLIC));

// ---- Settings ----
app.get('/api/settings', (req, res) => {
  const s = req.llmSettings;
  res.json({ configured: s.configured, baseURL: s.baseURL, model: s.model, expiresAt: s.expiresAt || null, source: s.source });
});
app.post('/api/settings', (req, res) => {
  const { baseURL, apiKey, model } = req.body || {};
  if (!baseURL) return res.status(400).json({ error: 'baseURL wajib diisi.' });
  if (!model) return res.status(400).json({ error: 'model wajib diisi.' });
  const cur = req.llmSettings;
  if (!cur.configured && !apiKey) return res.status(400).json({ error: 'apiKey wajib diisi pertama kali.' });
  const effectiveKey = (apiKey && apiKey !== '') ? apiKey : (cur.apiKey || undefined);
  const payload = { baseURL, apiKey: effectiveKey, model: model || 'gpt-4o-mini', issuedAt: Date.now() };
  // Session cookie: httpOnly + signed, auto-clears after 30 min. Works on Vercel
  // (read-only fs) because nothing is written to disk.
  res.cookie('llm_settings', payload, {
    maxAge: EXPIRY_MS, httpOnly: true, sameSite: 'lax', signed: true, path: '/'
  });
  // Best-effort local persistence (no-op on read-only fs like Vercel).
  try { store.saveSettings(payload); } catch (e) {}
  res.json({ ok: true, expiresAt: payload.issuedAt + EXPIRY_MS });
});

// ---- Scenario templates (from bank-skenario) ----
app.get('/api/scenario-templates', (req, res) => {
  res.json(materials.scenarioTemplates());
});

// ---- Generate scenario ----
app.post('/api/scenarios/generate', async (req, res) => {
  try {
    const view = await scenarios.generate(req.body || {}, { settings: req.llmSettings });
    res.json(view);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- Get scenario (student view, no hidden criteria) ----
app.get('/api/scenarios/:id', (req, res) => {
  const full = store.getScenario(req.params.id);
  if (!full) return res.status(404).json({ error: 'Skenario tidak ditemukan.' });
  res.json(scenarios.publicView(full));
});

// ---- List scenarios (metadata only, no hidden criteria) ----
app.get('/api/scenarios', (req, res) => {
  res.json(store.listScenarioMeta());
});

// ---- Tutorial / Latihan sources (jobsheet PDFs) ----
app.get('/api/tutorial-sources', (req, res) => res.json(tutorial.listSources()));

// ---- Generate tutorial ----
app.post('/api/tutorials/generate', async (req, res) => {
  try {
    const v = await tutorial.generate(req.body || {}, { settings: req.llmSettings });
    res.json(v);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- Get tutorial (public view) ----
app.get('/api/tutorials/:id', (req, res) => {
  const full = store.getTutorial(req.params.id);
  if (!full) return res.status(404).json({ error: 'Tutorial tidak ditemukan.' });
  res.json(tutorial.publicView(full));
});

// ---- Assess via live SSH (SSE stream) ----
app.post('/api/assess/ssh', async (req, res) => {
  const { scenarioId, host, port, user, auth, extraCommands } = req.body || {};
  if (!host || !user) return res.status(400).json({ error: 'host & user wajib diisi.' });
  if (!auth || !auth.type || (auth.type === 'password' && !auth.password) || (auth.type === 'key' && !auth.key)) {
    return res.status(400).json({ error: 'auth tidak lengkap (password atau private key).' });
  }

  const scenario = scenarioId ? store.getScenario(scenarioId) : null;
  const commands = [];
  if (scenario && Array.isArray(scenario.auditCommands)) {
    for (const c of scenario.auditCommands) {
      if (ssh.isReadOnly(c)) commands.push(c.trim());
      else return res.status(400).json({ error: 'Command skenario tidak diizinkan (harus read-only): ' + c });
    }
  }
  if (Array.isArray(extraCommands)) {
    for (const c of extraCommands) {
      if (ssh.isReadOnly(c)) commands.push(c.trim());
      else return res.status(400).json({ error: 'Command tidak diizinkan (harus read-only): ' + c });
    }
  }
  if (!commands.length) return res.status(400).json({ error: 'Tidak ada command audit (auditCommands skenario kosong & tidak ada extra).' });

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });
  const send = (obj) => { res.write('data: ' + JSON.stringify(obj) + '\n\n'); };

  let closed = false;
  res.on('close', () => { closed = true; });

  try {
    const fullOutput = await ssh.runAudit({
      host, port, user, auth,
      commands,
      onEvent: (ev) => { if (!closed) send(ev); }
    });
    if (!closed) send({ event: 'done', output: fullOutput });
  } catch (e) {
    if (!closed) send({ event: 'error', message: e.message });
  } finally {
    if (!closed) res.end();
  }
});

// ---- Assess via pasted output ----
app.post('/api/assess/paste', async (req, res) => {
  try {
    const { scenarioId, mode, output, tutorialContext } = req.body || {};
    const result = await assess.analyze({ scenarioId, mode, output, tutorialContext, settings: req.llmSettings });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- Analyze (used after SSH stream finishes) ----
app.post('/api/assess/analyze', async (req, res) => {
  try {
    const { scenarioId, mode, output } = req.body || {};
    const result = await assess.analyze({ scenarioId, mode, output, settings: req.llmSettings });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- AI chat assistant (context-aware) ----
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, context } = req.body || {};
    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ error: 'messages wajib diisi.' });
    }
    const replyText = await chat.reply(messages, context || {}, { settings: req.llmSettings });
    res.json({ reply: replyText });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
// On Vercel this module is required by api/[[...slug]].js — don't bind a port there.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('MikroTik Guru & Juri AI listening on http://localhost:' + PORT);
    console.log('Skill dir:', materials.SKILL_DIR);
  });
}

module.exports = app;

const express = require('express');
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

const PUBLIC = path.join(__dirname, 'public');
app.use(express.static(PUBLIC));

// ---- Settings ----
app.get('/api/settings', (req, res) => {
  const s = store.getSettings();
  res.json({ configured: s.configured, baseURL: s.baseURL, model: s.model, expiresAt: s.expiresAt, source: s.source });
});
app.post('/api/settings', (req, res) => {
  const { baseURL, apiKey, model } = req.body || {};
  if (!baseURL) return res.status(400).json({ error: 'baseURL wajib diisi.' });
  const cur = store.getSettings();
  if (!cur.configured && !apiKey) return res.status(400).json({ error: 'apiKey wajib diisi pertama kali.' });
  const toSave = { baseURL, model };
  // use the provided key, otherwise adopt the currently-effective key (env or saved)
  // so a GUI save can override env without re-typing the secret.
  const effectiveKey = (apiKey && apiKey !== '') ? apiKey : (cur.apiKey || undefined);
  if (effectiveKey) toSave.apiKey = effectiveKey;
  store.saveSettings(toSave);
  res.json({ ok: true, expiresAt: store.getSettings().expiresAt });
});

// ---- Scenario templates (from bank-skenario) ----
app.get('/api/scenario-templates', (req, res) => {
  res.json(materials.scenarioTemplates());
});

// ---- Generate scenario ----
app.post('/api/scenarios/generate', async (req, res) => {
  try {
    const view = await scenarios.generate(req.body || {});
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
    const v = await tutorial.generate(req.body || {});
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
  if (scenario && Array.isArray(scenario.auditCommands)) commands.push(...scenario.auditCommands);
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
    const { scenarioId, mode, output } = req.body || {};
    const result = await assess.analyze({ scenarioId, mode, output });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- Analyze (used after SSH stream finishes) ----
app.post('/api/assess/analyze', async (req, res) => {
  try {
    const { scenarioId, mode, output } = req.body || {};
    const result = await assess.analyze({ scenarioId, mode, output });
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
    const replyText = await chat.reply(messages, context || {});
    res.json({ reply: replyText });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('MikroTik Guru & Juri AI listening on http://localhost:' + PORT);
  console.log('Skill dir:', materials.SKILL_DIR);
});

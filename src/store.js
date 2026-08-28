const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA = path.join(__dirname, '..', 'data');
const SETTINGS = path.join(DATA, 'settings.json');
const SCEN = path.join(DATA, 'scenarios.json');
const TUT = path.join(DATA, 'tutorials.json');

const DEFAULT_MODEL = 'gpt-4o-mini';

function ensure() { try { if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, { recursive: true }); } catch {} }
function readJson(p, def) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return def; } }
// Throws on failure so callers can surface the error (routes catch via asyncHandler).
function writeJson(p, v) {
  ensure();
  fs.writeFileSync(p, JSON.stringify(v, null, 2));
  try { fs.chmodSync(p, 0o600); } catch {}
}

const EXPIRY_MS = 30 * 60 * 1000; // LLM credentials auto-clear after 30 min for safety

// Environment-provided credentials (e.g. Render dashboard) take precedence over the
// on-disk settings and are managed by the platform — NOT subject to the 30-min wipe.
// Use LLM_-prefixed vars ONLY, so we never accidentally pick up an unrelated generic
// API_KEY / BASE_URL that another tool might set in the environment.
function envSettings() {
  const base = process.env.LLM_BASE_URL;
  const key = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL;
  if (!key) return null;
  return makeSettings({ baseURL: base || '', apiKey: key, model: model || DEFAULT_MODEL, source: 'env' });
}

// Single factory for the 7-field settings shape used across envSettings / getSettings / saveSettings.
function makeSettings({ baseURL, apiKey, model, source, expiresAt } = {}) {
  const hasCreds = !!(baseURL && apiKey);
  return {
    baseURL: baseURL || '',
    apiKey: apiKey || '',
    model: model || DEFAULT_MODEL,
    configured: hasCreds,
    expired: false,
    expiresAt: expiresAt != null ? expiresAt : null,
    source: source || 'none'
  };
}

function getSettings() {
  const s = readJson(SETTINGS, {});
  // GUI-saved credentials take precedence over environment variables, so the
  // in-app Settings panel is always usable (env becomes a fallback). This keeps
  // deployment flexible: set LLM_* env for persistence, or use the panel to override.
  if (s.baseURL && s.apiKey) {
    if (s.expiresAt && Date.now() > s.expiresAt) {
      // credentials expired -> clear the secret from disk, fall through to env.
      // Best-effort only: on a read-only fs (Vercel) the write can't persist, so
      // swallow the error to avoid breaking the request middleware.
      delete s.apiKey;
      delete s.expiresAt;
      try { writeJson(SETTINGS, s); } catch {}
    } else {
      return makeSettings({ baseURL: s.baseURL, apiKey: s.apiKey, model: s.model || DEFAULT_MODEL, source: 'settings', expiresAt: s.expiresAt || null });
    }
  }
  const env = envSettings();
  if (env) return env;
  // no GUI credentials and no env -> not configured
  return makeSettings({ baseURL: s.baseURL || '', apiKey: s.apiKey || '', model: s.model || DEFAULT_MODEL, source: 'none', expiresAt: s.expiresAt || null });
}

function saveSettings(s) {
  const cur = readJson(SETTINGS, {});
  if (s.baseURL !== undefined) cur.baseURL = s.baseURL;
  if (s.apiKey !== undefined) {
    cur.apiKey = s.apiKey;
    if (s.apiKey) cur.expiresAt = Date.now() + EXPIRY_MS; // refresh 30-min window
    else delete cur.expiresAt;
  }
  if (s.model !== undefined) cur.model = s.model || DEFAULT_MODEL;
  // Let writeJson throw propagate to the caller (route catches via asyncHandler).
  writeJson(SETTINGS, cur);
}

// Pick only the listed fields from an object (used for metadata views).
function pick(fields) {
  return (obj) => {
    const out = {};
    for (const f of fields) if (obj[f] !== undefined) out[f] = obj[f];
    return out;
  };
}

// Generic collection CRUD backed by a JSON file. Replaces the duplicated
// scenario/tutorial hand-rolled pairs.
function collection(name, file, metaFields) {
  let cache = null;
  const load = () => cache ??= readJson(file, {});
  const save = (all) => { cache = all; return writeJson(file, all); };
  return {
    put: (full) => { const all = load(); all[full.id] = full; save(all); return full; },
    get: (id) => load()[id],
    list: () => Object.values(load()).map(pick(metaFields))
  };
}

const scenarios = collection('scenarios', SCEN, ['id', 'title', 'level', 'topic', 'mode']);
const tutorials = collection('tutorials', TUT, ['id', 'title', 'level', 'topic', 'mode']);

module.exports = { scenarios, tutorials, getSettings, saveSettings, makeSettings, DEFAULT_MODEL, EXPIRY_MS };

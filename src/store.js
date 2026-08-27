const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA = path.join(__dirname, '..', 'data');
const SETTINGS = path.join(DATA, 'settings.json');
const SCEN = path.join(DATA, 'scenarios.json');

function ensure() { if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, { recursive: true }); }
function readJson(p, def) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return def; } }
function writeJson(p, v) {
  ensure();
  fs.writeFileSync(p, JSON.stringify(v, null, 2));
  try { fs.chmodSync(p, 0o600); } catch {}
}

const EXPIRY_MS = 30 * 60 * 1000; // LLM credentials auto-clear after 30 min for safety

function getSettings() {
  const s = readJson(SETTINGS, {});
  if (s.expiresAt && Date.now() > s.expiresAt) {
    // credentials expired -> clear the secret from disk for safety
    delete s.apiKey;
    delete s.expiresAt;
    writeJson(SETTINGS, s);
    return {
      baseURL: s.baseURL || '',
      apiKey: '',
      model: s.model || 'gpt-4o-mini',
      configured: false,
      expired: true,
      expiresAt: null,
    };
  }
  return {
    baseURL: s.baseURL || '',
    apiKey: s.apiKey || '',
    model: s.model || 'gpt-4o-mini',
    configured: !!(s.baseURL && s.apiKey),
    expired: false,
    expiresAt: s.expiresAt || null,
  };
}

function saveSettings(s) {
  const cur = readJson(SETTINGS, {});
  if (s.baseURL !== undefined) cur.baseURL = s.baseURL;
  if (s.apiKey !== undefined) {
    cur.apiKey = s.apiKey;
    if (s.apiKey) cur.expiresAt = Date.now() + EXPIRY_MS; // refresh 30-min window
    else delete cur.expiresAt;
  }
  if (s.model !== undefined) cur.model = s.model || 'gpt-4o-mini';
  writeJson(SETTINGS, cur);
}

let _scen = null;
function loadScen() { if (_scen) return _scen; _scen = readJson(SCEN, {}); return _scen; }
function saveScen() { writeJson(SCEN, _scen); }

function putScenario(full) { const sc = loadScen(); sc[full.id] = full; saveScen(); }
function getScenario(id) { return loadScen()[id]; }
function listScenarioMeta() {
  return Object.values(loadScen()).map(({ id, title, level, topic, mode }) => ({ id, title, level, topic, mode }));
}

const TUT = path.join(DATA, 'tutorials.json');
let _tut = null;
function loadTut() { if (_tut) return _tut; _tut = readJson(TUT, {}); return _tut; }
function saveTut() { writeJson(TUT, _tut); }
function putTutorial(full) { const t = loadTut(); t[full.id] = full; saveTut(); }
function getTutorial(id) { return loadTut()[id]; }
function listTutorialMeta() {
  return Object.values(loadTut()).map(({ id, title, level, topic, mode }) => ({ id, title, level, topic, mode }));
}

module.exports = { getSettings, saveSettings, putScenario, getScenario, listScenarioMeta, putTutorial, getTutorial, listTutorialMeta };

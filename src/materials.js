const fs = require('fs');
const path = require('path');

const SKILL_DIR = process.env.SKILL_DIR || path.join(__dirname, '..', 'references');
const REF = path.join(SKILL_DIR, 'references');
const EXTRACTED = path.join(REF, 'extracted');

function readSafe(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

let _cache = null;
function loadAll() {
  if (_cache) return _cache;
  const bank = readSafe(path.join(REF, 'bank-skenario.md'));
  const cmd = readSafe(path.join(REF, 'command-reference.md'));
  const audit = readSafe(path.join(REF, 'checklist-audit.md'));
  const gui = readSafe(path.join(REF, 'checklist-gui-winbox.md'));
  let extracted = '';
  try {
    const files = fs.readdirSync(EXTRACTED).filter(f => f.endsWith('.md'));
    extracted = files.map(f => `\n### Extracted: ${f}\n` + readSafe(path.join(EXTRACTED, f))).join('\n');
  } catch (e) { /* no extracted dir */ }
  _cache = { bank, cmd, audit, gui, extracted };
  return _cache;
}

// Parse bank-skenario.md into a list of templates for the picker.
function scenarioTemplates() {
  const { bank } = loadAll();
  const templates = [];
  const re = /^##\s+\d+\.\s+(.*?)\s*\((Level[^)]*)\)(?:\s*—\s*(.+))?$/;
  for (const line of bank.split('\n')) {
    const m = line.match(re);
    if (m) {
      templates.push({
        id: templates.length + 1,
        title: m[1].trim(),
        level: m[2].trim(),
        topic: (m[3] || m[1]).trim()
      });
    }
  }
  return templates;
}

module.exports = { loadAll, scenarioTemplates, SKILL_DIR, REF };

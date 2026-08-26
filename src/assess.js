const materials = require('./materials');
const llm = require('./llm');
const store = require('./store');

function buildAnalyzePrompt({ scenario, mode, output }) {
  const m = materials.loadAll();
  const req = scenario ? scenario.requirement : '(tidak ada skenario spesifik)';
  const batasan = scenario ? scenario.batasan : '-';
  const criteria = scenario && scenario.hiddenCriteria && scenario.hiddenCriteria.length
    ? scenario.hiddenCriteria.map((c, i) => `${i + 1}. ${c.point} — cek: ${c.check}`).join('\n')
    : '(tidak ada skenario spesifik; nilai berdasarkan output umum & best practice RouterOS)';

  const guiNote = mode === 'gui'
    ? `\nMATERI GUI (pakai bahasa menu Winbox untuk hint, mis. "IP > Hotspot > Users"):\n${m.gui}\n`
    : '';

  return `Kamu adalah juri praktik MikroTik RouterOS. Kamu menilai konfigurasi murid secara READ-ONLY dan membimbing dengan hint bertahap. Kamu TIDAK PERNAH mengubah konfigurasi router.

MATERI ACUAN:
===== COMMAND REFERENCE =====
${m.cmd}
===== CHECKLIST AUDIT =====
${m.audit}
${guiNote}

SKENARIO YANG DINILAI:
Requirement: ${req}
Batasan: ${batasan}

KRITERIA SUKSES INTERNAL (yang harus kamu verifikasi lewat output):
${criteria}

OUTPUT ROUTER (hasil command read-only yang sudah dijalankan):
===== BEGIN OUTPUT =====
${output}
===== END OUTPUT =====

MODE: ${mode === 'gui' ? 'gui (pakai bahasa menu Winbox untuk hint)' : 'cli (pakai command CLI untuk hint)'}

TUGAS:
- Bandingkan output router dengan kriteria sukses & best practice. Temukan kesalahan / ketidaksesuaian.
- Untuk TIAP masalah buat object issue:
  area: nama area (mis. "NAT", "Hotspot User Profile", "Wireless", "Routing")
  severity: "low" | "medium" | "high"
  level1: arahkan area SAJA, bukan detail (1-2 kalimat, gaya "coba cek bagian X")
  level2: persempit ke command/parameter spesifik TANPA memberi nilai jawaban
  level3: jawaban penuh — apa yang salah, kenapa salah, dan command perbaikannya
  fixCommands: string command perbaikan SEBAGAI SARAN TEKS (tidak dijalankan)
  concept: penjelasan prinsip singkat di baliknya
- summary: ringkasan status konfigurasi (apa yang sudah benar, apa yang belum).
- Kalau tidak ada masalah: issues = [] dan summary menyatakan konfigurasi sudah sesuai kriteria.
- Urutkan issues dari severity tinggi ke rendah.

Output HARUS JSON object persis:
{
  "summary": string,
  "issues": [ { "id": number, "area": string, "severity": string, "level1": string, "level2": string, "level3": string, "fixCommands": string, "concept": string } ]
}
Balas HANYA JSON, tanpa teks lain dan tanpa markdown fence.`;
}

async function analyze({ scenarioId, mode, output }) {
  if (!output || !output.trim()) throw new Error('Output router kosong. Paste hasil command atau jalankan audit SSH dulu.');
  const scenario = scenarioId ? store.getScenario(scenarioId) : null;
  const useMode = mode || (scenario && scenario.mode) || 'cli';

  const parsed = await llm.complete([
    { role: 'system', content: 'Kamu menilai konfigurasi MikroTik secara read-only dalam bahasa Indonesia. Balas hanya JSON.' },
    { role: 'user', content: buildAnalyzePrompt({ scenario, mode: useMode, output }) }
  ], { json: true });
  const issues = Array.isArray(parsed.issues) ? parsed.issues.map((it, i) => ({
    id: i + 1,
    area: it.area || 'Umum',
    severity: ['low', 'medium', 'high'].includes(it.severity) ? it.severity : 'medium',
    level1: it.level1 || '',
    level2: it.level2 || '',
    level3: it.level3 || '',
    fixCommands: it.fixCommands || '',
    concept: it.concept || ''
  })) : [];
  return { summary: parsed.summary || 'Tidak ada ringkasan.', issues };
}

module.exports = { analyze };

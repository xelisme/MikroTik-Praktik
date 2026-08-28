const materials = require('./materials');
const llm = require('./llm');
const store = require('./store');

function buildAnalyzePrompt({ scenario, mode, output, tutorialContext }) {
  const m = materials.loadAll();

  let req, batasan, criteria;
  if (scenario) {
    req = scenario.requirement;
    batasan = scenario.batasan;
    criteria = scenario.hiddenCriteria && scenario.hiddenCriteria.length
      ? scenario.hiddenCriteria.map((c, i) => `${i + 1}. ${c.point} — cek: ${c.check}`).join('\n')
      : '(tidak ada skenario spesifik; nilai berdasarkan output umum & best practice RouterOS)';
  } else if (tutorialContext) {
    req = `Jobsheet praktik: ${tutorialContext.title || '(tanpa judul)'} (topik: ${tutorialContext.topic || '-'})`;
    const steps = Array.isArray(tutorialContext.bagian)
      ? tutorialContext.bagian
          .map((b) => {
            const ss = Array.isArray(b.steps) ? b.steps : [];
            return ss.map((s) => `- ${b.judul || ''}: ${s.gui || s.cli || ''}`).join('\n');
          })
          .filter(Boolean)
          .join('\n')
      : '';
    batasan = steps || '-';
    criteria = `Tidak ada kriteria tersembunyi resmi. Nilai berdasarkan apakah output router mencerminkan langkah-langkah jobsheet di atas dan best practice RouterOS. Fokus topik: ${tutorialContext.topic || '-'}.`;
  } else {
    req = '(tidak ada skenario spesifik)';
    batasan = '-';
    criteria = '(tidak ada skenario spesifik; nilai berdasarkan output umum & best practice RouterOS)';
  }

  const isGui = mode === 'gui';
  const modeLabel = isGui ? 'GUI (WinBox)' : 'CLI (Terminal)';
  const guiNote = isGui
    ? `\nMATERI GUI (pakai bahasa menu Winbox untuk hint, mis. "IP > Hotspot > Users"):\n${m.gui}\n`
    : '';

  const formatRule = isGui
    ? `FORMAT MODE GUI (WAJIB DIKUTI):
- level2: arahkan lewat NAVIGASI MENU WINBOX (contoh: "IP > Addresses > klik + > Address: 192.168.100.1/24, Interface: wlan1 > OK"), BUKAN perintah CLI.
- level3: jelaskan langkah navigasi WinBox lengkap untuk memperbaiki.
- fixCommands: tulis langkah menu WinBox (bukan perintah CLI), pisahkan beberapa langkah dengan baris baru.`
    : `FORMAT MODE CLI (WAJIB DIKUTI):
- level2: arahkan lewat PERINTAH CLI spesifik (contoh: "/ip address add address=192.168.100.1/24 interface=wlan1").
- level3: berikan perintah CLI perbaikan lengkap.
- fixCommands: tulis perintah CLI (bisa multi-baris, pisahkan dengan \\n).`;

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

MODE PENILAIAN: ${modeLabel}
${formatRule}

TUGAS:
- Bandingkan output router dengan kriteria sukses & best practice. Temukan kesalahan / ketidaksesuaian.
- Untuk TIAP masalah buat object issue:
  area: nama area (mis. "NAT", "Hotspot User Profile", "Wireless", "Routing")
  severity: "low" | "medium" | "high"
  level1: arahkan area SAJA, bukan detail (1-2 kalimat, gaya "coba cek bagian X")
  level2: persempit ke langkah spesifik TANPA memberi nilai jawaban — ikuti FORMAT MODE di atas
  level3: jawaban penuh — apa yang salah, kenapa salah, dan cara memperbaiki — ikuti FORMAT MODE di atas
  fixCommands: string perbaikan SEBAGAI SARAN TEKS (tidak dijalankan) — ikuti FORMAT MODE di atas
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

async function analyze({ scenarioId, mode, output, tutorialContext, settings }) {
  if (!output || !output.trim()) throw new Error('Output router kosong. Paste hasil command atau jalankan audit SSH dulu.');
  const scenario = scenarioId ? store.getScenario(scenarioId) : null;
  const useMode = mode || (scenario && scenario.mode) || (tutorialContext && tutorialContext.mode) || 'cli';

  const parsed = await llm.complete([
    { role: 'system', content: 'Kamu menilai konfigurasi MikroTik secara read-only dalam bahasa Indonesia. Balas hanya JSON.' },
    { role: 'user', content: buildAnalyzePrompt({ scenario, mode: useMode, output, tutorialContext }) }
  ], { json: true, settings });
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

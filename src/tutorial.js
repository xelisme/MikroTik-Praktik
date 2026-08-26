const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const util = require('util');
const execFileP = util.promisify(execFile);
const materials = require('./materials');
const llm = require('./llm');
const store = require('./store');

const SOURCES_DIR = process.env.SOURCES_DIR || path.join(__dirname, '..', 'sources');

function listSources() {
  try {
    return fs.readdirSync(SOURCES_DIR)
      .filter((f) => /\.pdf$/i.test(f))
      .map((f) => ({ name: f }));
  } catch {
    return [];
  }
}

// Extract text from a jobsheet PDF via pdftotext (photos are not ingested, text only).
async function readSource(name) {
  const fp = path.join(SOURCES_DIR, path.basename(name)); // basename guards path traversal
  if (!fs.existsSync(fp)) throw new Error('Source tidak ditemukan: ' + name);
  const { stdout } = await execFileP('pdftotext', ['-layout', fp, '-']);
  return stdout;
}

function buildTutorialPrompt({ level, topic, mode, sourceText }) {
  const m = materials.loadAll();
  const modeNote =
    mode === 'gui' ? 'HANYA Winbox GUI (jelaskan lewat menu Winbox)' :
    mode === 'cli' ? 'HANYA CLI Terminal (berikan perintah lengkap)' :
    'DUA versi untuk tiap langkah: Winbox GUI DAN CLI Terminal';

  const srcSection = sourceText
    ? `MATERI SUMBER (jobsheet murid — jadikan acuan langkah nyata, ikuti urutannya):\n===== SOURCE =====\n${sourceText}\n===== END SOURCE =====\n`
    : '';

  return `Kamu adalah guru praktik MikroTik RouterOS. Buatkan TUTORIAL/LATIHAN (bukan soal ujian) berbentuk jobsheet yang jelas agar murid bisa mempraktikkan langsung di router.

MATERI ACUAN (pakai sebagai sumber kebenaran command, jangan mengarang di luar command-reference):
===== COMMAND REFERENCE =====
${m.cmd}
${srcSection}

INSTRUKSI:
- Level diminta: "${level}". Topik: "${topic || 'bebas'}" (kalau kosong, pilih topik jobsheet yang pas).
- Mode: ${modeNote}.
- Susun tutorial gaya jobsheet: pengantar (kenapa ini dipelajari), tujuan (poin yang dicapai setelah latihan), lalu bagian-bagian (A, B, C, ...) di mana tiap bagian berisi langkah praktik.
- Tiap langkah berisi: "gui" (penjelasan menu Winbox, mis. "IP > DHCP Client > klik +") dan "cli" (perintah CLI lengkap, mis. "/ip dhcp-client add interface=ether1"). Untuk mode gui hanya isi gui, mode cli hanya isi cli, mode both isi keduanya. Isi "note" bila ada peringatan/ tips.
- Tambahkan bagian "latihan" (3-5 latihan mandiri) dan "catatan" (tips/perhatian umum).
- Ini tutorial, BUKAN soal — jangan sertakan kunci penilaian.

Output HARUS JSON object persis:
{
  "title": string,
  "level": string,
  "topic": string,
  "mode": "gui"|"cli"|"both",
  "pengantar": string,
  "tujuan": [string],
  "bagian": [ { "judul": string, "steps": [ { "urutan": number, "gui": string, "cli": string, "note": string } ] } ],
  "latihan": [string],
  "catatan": string
}
Balas HANYA JSON, tanpa teks lain dan tanpa markdown fence.`;
}

async function generate(body) {
  const level = body.level || 'pemula';
  const topic = body.topic || '';
  const mode = ['gui', 'cli', 'both'].includes(body.mode) ? body.mode : 'both';

  let sourceText = '';
  if (body.source) {
    try { sourceText = await readSource(body.source); } catch (e) { /* fall back to no source */ }
  }

  const parsed = await llm.complete([
    { role: 'system', content: 'Kamu menyusun tutorial praktik MikroTik dalam bahasa Indonesia. Balas hanya JSON.' },
    { role: 'user', content: buildTutorialPrompt({ level, topic, mode, sourceText }) }
  ], { json: true });

  const id = 'tut_' + crypto.randomBytes(5).toString('hex');
  const full = {
    id,
    title: parsed.title || 'Tutorial Praktik',
    level: parsed.level || level,
    topic: parsed.topic || topic,
    mode: parsed.mode || mode,
    pengantar: parsed.pengantar || '',
    tujuan: Array.isArray(parsed.tujuan) ? parsed.tujuan : [],
    bagian: Array.isArray(parsed.bagian) ? parsed.bagian : [],
    latihan: Array.isArray(parsed.latihan) ? parsed.latihan : [],
    catatan: parsed.catatan || ''
  };
  store.putTutorial(full);
  return publicView(full);
}

function publicView(full) {
  return {
    id: full.id,
    title: full.title,
    level: full.level,
    topic: full.topic,
    mode: full.mode,
    pengantar: full.pengantar,
    tujuan: full.tujuan,
    bagian: full.bagian,
    latihan: full.latihan,
    catatan: full.catatan
  };
}

module.exports = { listSources, readSource, generate, publicView };

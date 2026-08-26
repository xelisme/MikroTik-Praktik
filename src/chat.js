const llm = require('./llm');
const materials = require('./materials');

// Build a system prompt that gives the assistant MikroTik domain knowledge
// plus the live context of what the user is currently looking at in the app.
function buildSystemPrompt(context = {}) {
  const m = materials.loadAll();
  const view = context.view || 'unknown';

  let ctxBlock = `Konteks antarmuka saat ini:\n- View aktif: ${view}`;

  if (context.scenario) {
    const s = context.scenario;
    ctxBlock += `\n- Skenario yang sedang dibuka:\n  Judul: ${s.title || '-'}\n  Level: ${s.level || '-'}\n  Topik: ${s.topic || '-'}\n  Mode: ${s.mode || '-'}`;
    if (s.soal) ctxBlock += `\n  Deskripsi soal:\n${s.soal}`;
    if (Array.isArray(s.tujuan) && s.tujuan.length) ctxBlock += `\n  Tujuan: ${s.tujuan.join('; ')}`;
  }

  if (context.tutorial) {
    const t = context.tutorial;
    ctxBlock += `\n- Tutorial yang sedang dibuka:\n  Judul: ${t.title || '-'}\n  Level: ${t.level || '-'}\n  Mode: ${t.mode || '-'}`;
    if (Array.isArray(t.bagian)) {
      ctxBlock += '\n  Bagian tutorial:';
      t.bagian.forEach((b, i) => {
        ctxBlock += `\n   ${i + 1}. ${b.judul || ''}`;
        (b.steps || []).forEach((st) => {
          if (st.cli) ctxBlock += `\n      CLI: ${st.cli}`;
          if (st.gui) ctxBlock += `\n      GUI: ${st.gui}`;
        });
      });
    }
  }

  if (!context.scenario && !context.tutorial) {
    ctxBlock += '\n- Tidak ada soal/tutorial spesifik dibuka; jawab sebagai asisten umum praktik MikroTik.';
  }

  return `Kamu adalah Asisten AI untuk aplikasi "MikroTik Praktik — Guru & Juri AI", alat bantu guru dan siswa praktik MikroTik (RouterOS). Peranmu: menjelaskan konsep MikroTik, langkah konfigurasi, perintah CLI maupun langkah GUI Winbox, dan membantu siswa memahami soal atau tutorial yang sedang mereka kerjakan.

Gaya:
- Jawab dalam Bahasa Indonesia yang ramah, jelas, dan ringkas.
- Berikan perintah CLI yang benar dan aman (untuk eksplorasi gunakan perintah read-only/non-destructive). Jangan menyarankan perintah yang menghapus atau mengubah konfigurasi produksi tanpa peringatan eksplisit.
- Bila relevan, sebutkan juga langkah GUI Winbox yang setara.
- Manfaatkan konteks di bawah untuk menjawab secara spesifik terhadap apa yang sedang dilihat pengguna.

=== REFERENSI DOMAIN MIKROTIK (pengetahuanmu) ===
${m.cmd}
${m.gui}
${m.audit}
=== KONTEKS SAAT INI ===
${ctxBlock}

Jawab pertanyaan pengguna dengan memanfaatkan konteks di atas.`;
}

// messages: [{role:'user'|'assistant', content}], context: {view, scenario, tutorial}
async function reply(messages, context) {
  const sys = buildSystemPrompt(context);
  const full = [{ role: 'system', content: sys }].concat(
    (messages || []).map((x) => ({ role: x.role, content: x.content }))
  );
  return await llm.chat(full, { temperature: 0.4 });
}

module.exports = { reply, buildSystemPrompt };

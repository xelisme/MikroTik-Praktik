const crypto = require('crypto');
const materials = require('./materials');
const llm = require('./llm');
const store = require('./store');

// Catalog of read-only commands the AI may choose from (mirrors checklist-audit.md).
const TIER_CATALOG = `
Tier 0 (Hotspot):
/ip dhcp-client print
/interface wireless print
/ip address print
/ip firewall nat print
/ip hotspot print
/ip hotspot profile print
/ip hotspot user profile print
/ip hotspot user print
/ip hotspot active print

Tier 1 (Quick Scan):
/ip address print
/ip route print
/ip firewall nat print
/ip firewall filter print
/ip dhcp-server print
/ip dhcp-server lease print
/ip dns print
/interface print
/ip service print
/queue simple print
/queue tree print
/ip firewall mangle print

Tier 2 (Full Scan - pilih yang relevan):
/interface bridge print
/interface bridge port print
/interface bridge vlan print
/interface wireless security-profiles print
/interface wireless registration-table print
/queue type print
/ppp secret print
/ppp active print
/interface pppoe-client print
/interface wireguard print
/interface wireguard peers print
/routing ospf instance print
/routing ospf interface print
/routing ospf neighbor print
/routing ospf area print
/routing ospf interface-template print
/routing bgp peer print
/caps-man interface print
/caps-man registration-table print
/caps-man configuration print
/interface vrrp print
/system script print
/system scheduler print
/log print where topics~"error"
/log print where topics~"critical"
/system resource print
/system routerboard print
`;

function buildGeneratePrompt({ level, topic, mode, notes }) {
  const m = materials.loadAll();
  return `Kamu adalah guru sekaligus juri praktik MikroTik RouterOS. Tugasmu membuat soal praktik berbentuk studi kasus perusahaan yang realistis, lalu nanti menilai konfigurasi murid secara READ-ONLY.

MATERI ACUAN (pakai sebagai sumber kebenaran, jangan mengarang command di luar command-reference):
===== BANK SKENARIO =====
${m.bank}
===== COMMAND REFERENCE =====
${m.cmd}
===== CHECKLIST AUDIT =====
${m.audit}
${m.extracted}

INSTRUKSI PEMBUATAN SOAL:
- Level diminta: "${level}". Topik diminta: "${topic}".${notes ? ' Catatan murid: "' + notes + '".' : ''}
- Pilih ATAU adaptasi template dari bank skenario yang cocok dengan level & topik. Kalau topik "bebas"/kosong, pilih yang paling sesuai level.
- Susun: konteksBisnis (cerita singkat kenapa perusahaan butuh ini), requirement (hasil akhir yang harus dicapai, bahasa hasil bukan langkah command), batasan (kalau ada; mis. hanya GUI Winbox / hanya CLI / tidak boleh downtime).
- JANGAN masukkan kriteria penilaian ke bagian yang dilihat murid. Simpan di hiddenCriteria (array poin terukur yang bisa diverifikasi lewat command).
- Tentukan auditTier: "hotspot" kalau skenario hotspot, "tier1" untuk dasar (routing/NAT/firewall/dhcp/dns), "tier2" untuk lanjut (vlan/vpn/ospf/capsman/vrrp/queue).
- Tentukan auditCommands: pilih command READ-ONLY dari katalog berikut yang relevan untuk verifikasi (hanya print/export/resource/ping). Pilih secukupnya.
===== KATALOG COMMAND READ-ONLY =====
${TIER_CATALOG}

Output HARUS JSON object persis dengan field:
{
  "title": string,
  "level": string,
  "topic": string,
  "mode": "cli"|"gui",
  "konteksBisnis": string,
  "requirement": string,
  "batasan": string,
  "hiddenCriteria": [ { "point": string, "check": string } ],
  "auditTier": "hotspot"|"tier1"|"tier2",
  "auditCommands": [ string ]
}
Mode = "${mode}". Balas HANYA JSON, tanpa teks lain dan tanpa markdown fence.`;
}

async function generate(body, opts) {
  const level = body.level || 'pemula';
  const topic = body.topic || 'bebas';
  const mode = body.mode === 'gui' ? 'gui' : 'cli';
  const parsed = await llm.complete([
    { role: 'system', content: 'Kamu membuat soal praktik MikroTik dalam bahasa Indonesia. Balas hanya JSON.' },
    { role: 'user', content: buildGeneratePrompt({ level, topic, mode, notes: body.notes }) }
  ], { json: true, settings: opts && opts.settings });
  const id = 'sc_' + crypto.randomBytes(5).toString('hex');
  const full = {
    id,
    title: parsed.title || 'Skenario Praktik',
    level: parsed.level || level,
    topic: parsed.topic || topic,
    mode: parsed.mode || mode,
    konteksBisnis: parsed.konteksBisnis || '',
    requirement: parsed.requirement || '',
    batasan: parsed.batasan || '',
    hiddenCriteria: Array.isArray(parsed.hiddenCriteria) ? parsed.hiddenCriteria : [],
    auditTier: parsed.auditTier || 'tier1',
    auditCommands: Array.isArray(parsed.auditCommands) ? parsed.auditCommands : []
  };
  store.putScenario(full);
  return publicView(full);
}

function publicView(full) {
  return {
    id: full.id,
    title: full.title,
    level: full.level,
    topic: full.topic,
    mode: full.mode,
    konteksBisnis: full.konteksBisnis,
    requirement: full.requirement,
    batasan: full.batasan
  };
}

module.exports = { generate, publicView };

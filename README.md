![Demo Walkthrough](https://github.com/user-attachments/assets/97c946a8-39b4-4318-b9f9-39b9eeeeb6ab)

# MikroTik Praktik - Guru & Juri AI

<p align="center">
  <a href="https://github.com/xelisme/MikroTik-Praktik">GitHub</a> |
  <a href="https://mikrotik-praktik.reyvien.me">Live Demo</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Stack-Node%20%2B%20Express-339933?style=for-the-badge" alt="Stack"/>
  <img src="https://img.shields.io/badge/AI-OpenAI%20compatible-FF8C00?style=for-the-badge" alt="AI"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License"/>
</p>

Web app for learning MikroTik RouterOS by actually doing it. An AI acts as a read-only judge that grades real router configs safely over SSH.

Use any OpenAI-compatible endpoint you like. Set it in the Settings panel or via environment variables. No code changes, no lock-in.

<table>
<tr><td><b>Buat Soal</b></td><td>AI writes practice scenarios with hidden success criteria stored server-side.</td></tr>
<tr><td><b>Nilai Konfigurasi</b></td><td>Grades configs over read-only SSH (or pasted /export) with L1 to L3 hints that teach instead of handing over answers.</td></tr>
<tr><td><b>Tutorial / Latihan</b></td><td>AI builds jobsheets with GUI and CLI steps from PDF sources and domain references.</td></tr>
<tr><td><b>Asisten AI</b></td><td>Context-aware chat in Bahasa Indonesia that explains concepts as you work.</td></tr>
<tr><td><b>Read-only by design</b></td><td>SSH audit runs only safe commands. Destructive input is rejected before it executes.</td></tr>
</table>

---

## Quick Start (lokal)

```bash
npm install
npm start
# buka http://localhost:4000
```

Buka menu **Settings** untuk isi Base URL, API Key, dan Model.

### Konfigurasi AI

Dua cara (GUI menimpa env):

1. **Environment variables** (persisten):
   ```bash
   LLM_BASE_URL=https://api.openai.com/v1
   LLM_API_KEY=sk-...
   LLM_MODEL=gpt-4o-mini
   ```
   Template: [.env-example](.env-example).
2. **GUI Settings** (per-session): key disimpan di cookie httpOnly bertanda tangan, kedaluwarsa otomatis 30 menit. Cocok untuk deploy stateless. Setel `COOKIE_SECRET` di env agar cookie tidak mudah dipalsukan.

---

## Deploy ke Vercel (Preview)

1. Import repo `xelisme/MikroTik-Praktik` (branch `main`) ke Vercel.
2. Framework Preset: `Other` - Root `./` - Install `npm install` - Build kosongkan.
3. Environment Variables: `COOKIE_SECRET` (acak), `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL` (publik, bukan gateway lokal).
4. Deploy - URL `*.vercel.app`.
5. Domain (opsional): Vercel - Settings - Domains - `mikrotik-praktik.reyvien.me`; DNS CNAME `mikrotik-praktik` - `cname.vercel-dns.com`.

> Audit SSH langsung bisa kena timeout ~10 detik di Vercel hobby. Gunakan mode "tempel output" di preview.

Render juga didukung lewat `render.yaml`.

---

## Struktur Proyek

| File | Isi |
|------|-----|
| `server.js` | Express app, route wiring, cookie settings |
| `render.yaml` | Render deploy config |
| `vercel.json` | Vercel: force-bundle `references/` |
| `src/` | llm, scenarios, assess, tutorial, chat, ssh, store, materials |
| `references/` | referensi domain MikroTik (command, bank skenario, checklist) |
| `public/` | index.html, app.js (UI) |
| `demo/` | website-walkthrough.mp4 |

---

## Keamanan

- SSH baca-saja: hanya perintah aman, destruktif ditolak.
- Kunci GUI tidak persisten: di deploy stateless (fs read-only) kunci hanya ada di cookie session, hangus 30 menit.
- UI dan copy tetap Bahasa Indonesia.

---

## Repositori

<https://github.com/xelisme/MikroTik-Praktik>

## Lisensi

MIT - lihat [LICENSE](LICENSE).

Built by xelisme.

![Demo Walkthrough](https://github.com/user-attachments/assets/97c946a8-39b4-4318-b9f9-39b9eeeeb6ab)

# MikroTik Praktik — Guru & Juri AI

Web app belajar & berlatih konfigurasi MikroTik RouterOS dengan **AI juri baca-saja** yang menilai router asli secara aman.

[GitHub](https://github.com/xelisme/MikroTik-Praktik)

## Apa ini?

Siswa SMK belajar MikroTik dengan cara **melakukan**, bukan simulasi:

- **Buat Soal** — AI menyusun skenario praktik dengan kriteria keberhasilan tersembunyi di server.
- **Nilai Konfigurasi** — AI menilai lewat **SSH baca-saja** (atau tempel `/export`) dengan petunjuk L1→L2→L3 yang mengajar.
- **Tutorial / Latihan** — AI menyusun jobsheet (GUI & CLI) dari PDF + referensi domain.
- **Asisten AI** — chat kontekstual Bahasa Indonesia.

Fitur pembeda: AI menjuri konfigurasi router nyata yang diamankan via SSH baca-saja — tidak mengubah router, tidak menjalankan perintah destruktif.

## Fitur Utama

| Fitur | Penjelasan |
|-------|-----------|
| Generasi soal | Skenario dengan success-criteria tersembunyi (server-side) |
| Penilaian juri | Audit SSH baca-saja / tempel output, petunjuk L1→L2→L3 |
| Tutorial jobsheet | Langkah GUI + CLI dari PDF & referensi |
| Chat AI | Asisten kontekstual, Bahasa Indonesia |
| Keamanan | SSH baca-saja; perintah destruktif ditolak |

## Tech Stack

- **Backend:** Node.js + Express (tanpa build step)
- **Frontend:** HTML/CSS/JS vanilla
- **AI:** OpenAI-compatible (`/v1/chat/completions`); via env atau GUI
- **Deploy:** Render (`render.yaml`) atau Vercel (`api/[[...slug]].js`)

## Cara Menjalankan Lokal

```bash
npm install
npm start            # atau: node server.js
# buka http://localhost:4000
```

Buka menu **Settings** untuk mengisi Base URL, API Key, dan Model AI.

### Konfigurasi AI

Dua cara (GUI menimpa env):

1. **Environment variables** (persisten):
   ```bash
   LLM_BASE_URL=https://api.openai.com/v1
   LLM_API_KEY=sk-...
   LLM_MODEL=gpt-4o-mini
   ```
   Template: [`.env-example`](.env-example).
2. **GUI Settings** (per-session): kunci di **cookie httpOnly bertanda tangan** yang kedaluwarsa otomatis 30 menit — cocok deploy stateless. Setel `COOKIE_SECRET` di env agar cookie tidak mudah dipalsukan.

## Deploy ke Vercel (Preview)

1. Import repo `xelisme/MikroTik-Praktik` (branch `main`) ke Vercel.
2. **Framework Preset:** `Other` · **Root:** `./` · **Install:** `npm install` · **Build:** kosongkan.
3. **Environment Variables:** `COOKIE_SECRET` (acak), `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL` (publik, bukan gateway lokal).
4. Deploy → URL `*.vercel.app`.
5. Domain (opsional): Vercel → Settings → Domains → `mikrotik-praktik.reyvien.me`; DNS CNAME `mikrotik-praktik` → `cname.vercel-dns.com`.

> Catatan: audit SSH langsung bisa kena timeout ~10 detik di Vercel hobby; gunakan mode "tempel output" di preview.

## Keamanan

- **SSH baca-saja:** hanya perintah baca; destruktif ditolak.
- **Kunci GUI tidak persisten:** pada deploy stateless (fs read-only) kunci hanya di cookie session, hangus 30 menit.
- **Bahasa Indonesia:** UI & copy tetap Bahasa Indonesia.

## Struktur Proyek

```
server.js              # Express app + route wiring + cookie settings
render.yaml            # Render deploy config
vercel.json            # Vercel: force-bundle references/
src/
  llm.js               # OpenAI-compatible call wrapper
  scenarios.js         # Buat Soal
  assess.js            # Nilai Konfigurasi (juri)
  tutorial.js          # Tutorial / Latihan
  chat.js              # Asisten AI
  ssh.js               # read-only SSH audit
  store.js             # settings + persistence (resilient)
  materials.js         # loader referensi domain
  references/          # referensi domain MikroTik (command, bank skenario, checklist)
public/
  index.html, app.js   # UI
demo/                  # website-walkthrough.mp4
```

## Repositori

<https://github.com/xelisme/MikroTik-Praktik>

## Lisensi

Lihat `LICENSE`.

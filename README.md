# MikroTik Praktik — Guru & Juri AI

> Web app belajar & berlatih konfigurasi MikroTik RouterOS dengan **AI juri baca-saja** yang menilai konfigurasi router asli secara aman.

[![Demo](https://img.shields.io/badge/demo-walkthrough-orange)](demo/website-walkthrough.mp4)
[![GitHub](https://img.shields.io/badge/github-xelisme%2FMikroTik--Praktik-blue)](https://github.com/xelisme/MikroTik-Praktik)

## Apa ini?

Aplikasi web yang membantu siswa SMK belajar dan mempraktikkan MikroTik RouterOS dengan cara **melakukan**, bukan simulasi:

- **Buat Soal** — AI menyusun skenario praktik (soal) MikroTik dengan kriteria keberhasilan tersembunyi di server.
- **Nilai Konfigurasi** — AI menilai konfigurasi router siswa lewat **SSH baca-saja** (atau tempel output `/export`) dengan petunjuk bertingkat L1→L2→L3 yang mengajar, bukan memberi jawaban.
- **Tutorial / Latihan** — AI menyusun jobsheet (langkah GUI & CLI) dari PDF jobsheet + referensi domain.
- **Asisten AI** — chat kontekstual (Bahasa Indonesia) yang menjelaskan konsep & konteks saat ini.

Fitur pembeda: **AI bertindak sebagai juri atas konfigurasi router nyata yang diamankan via SSH baca-saja** — tidak pernah mengubah router, tidak menjalankan perintah destruktif, dan menampilkan setiap perintah sebelum dijalankan.

## Fitur Utama

| Fitur | Penjelasan |
|-------|-----------|
| Generasi soal | Skenario praktik dengan success-criteria tersembunyi (server-side) |
| Penilaian juri | Audit SSH baca-saja / tempel output, petunjuk L1→L2→L3 |
| Tutorial jobsheet | Langkah GUI + CLI dari PDF & referensi skill |
| Chat AI | Asisten kontekstual, Bahasa Indonesia |
| Keamanan | SSH baca-saja; perintah destruktif ditolak |

## Tech Stack

- **Backend:** Node.js + Express (tanpa build step)
- **Frontend:** HTML/CSS/JS vanilla
- **AI:** OpenAI-compatible (`/v1/chat/completions`); dikonfigurasi via env atau GUI
  - **Deploy:** Render (`render.yaml`) atau Vercel (`api/[[...slug]].js`)

## Cara Menjalankan Lokal

```bash
npm install
npm start            # atau: node server.js
# buka http://localhost:4000  (atur PORT untuk port lain)
```

Setelah jalan, buka menu **Settings** untuk mengisi Base URL, API Key, dan Model AI.

### Konfigurasi AI

Aplikasi mendukung dua cara (GUI menimpa env):

**1. Environment variables** (persisten, cocok untuk server):

```bash
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=sk-...
LLM_MODEL=gpt-4o-mini
```

Template lengkap beserta `COOKIE_SECRET` ada di [`.env-example`](.env-example).

**2. GUI Settings** (per-session):
Buka menu Settings di aplikasi, isi Base URL / API Key / Model. Kunci disimpan dalam **cookie httpOnly bertanda tangan** yang **kedaluwarsa otomatis setelah 30 menit** — tidak persisten di disk, cocok untuk deploy stateless.

> Pada deploy stateless (filesystem read-only), hanya jalur cookie yang berfungsi untuk menyimpan kunci per-session. Setel `COOKIE_SECRET` di environment (mis. Render) agar cookie tidak mudah dipalsukan. Template ada di [`.env-example`](.env-example).

## Keamanan

- **SSH baca-saja:** penilaian tidak boleh mengubah router — hanya perintah baca; perintah destruktif ditolak.
- **Kunci GUI tidak persisten:** pada deploy stateless (fs read-only, mis. Render) kunci hanya ada di cookie session, otomatis hangus 30 menit.
- **Bahasa Indonesia:** UI & copy tetap dalam Bahasa Indonesia.

## Deploy ke Vercel (Preview)

Cocok untuk preview agar orang bisa mencoba aplikasi. Aplikasi berjalan sebagai
serverless function via `api/[[...slug]].js`; frontend disajikan dari dalam function
(Vercel tidak otomatis menyajikan `./public`).

1. **Import** repo `xelisme/MikroTik-Praktik` (branch `main`) ke Vercel.
2. **Framework Preset:** `Other` · **Root Directory:** `./` · **Install:** `npm install` · **Build:** kosongkan.
3. **Environment Variables:**
   | Key | Value |
   |-----|-------|
   | `COOKIE_SECRET` | string acak (mis. `openssl rand -hex 32`) |
   | `LLM_BASE_URL` | endpoint publik, mis. `https://api.openai.com/v1` |
   | `LLM_API_KEY` | key LLM publik kamu |
   | `LLM_MODEL` | `gpt-4o-mini` |
4. **Deploy.** Vercel memberi URL `*.vercel.app`.
5. **Domain (opsional):** Vercel → Settings → Domains → tambahkan mis. `mikrotik-praktik.reyvien.me`, lalu di DNS host buat **CNAME** `mikrotik-praktik` → `cname.vercel-dns.com`.

> Catatan: key demo (gateway lokal `localhost:20128`) **tidak** berfungsi di Vercel — gunakan endpoint & key LLM publik. Audit SSH langsung bisa kena timeout ~10 detik di Vercel hobby; gunakan mode "tempel output" di preview.

## Struktur Proyek

```
server.js              # Express app + route wiring + cookie settings
render.yaml            # Render deploy config
src/
  llm.js               # OpenAI-compatible call wrapper
  scenarios.js         # Buat Soal
  assess.js            # Nilai Konfigurasi (juri)
  tutorial.js          # Tutorial / Latihan (jobsheet)
  chat.js              # Asisten AI
  ssh.js               # read-only SSH audit
  store.js             # settings + persistence (resilient)
  materials.js         # loader referensi domain
public/
  index.html, app.js   # UI
references/            # referensi domain MikroTik (command, bank skenario, checklist)
sources/               # PDF jobsheet sumber
demo/                  # website-walkthrough.mp4
```

## Demo

Walkthrough singkat yang menunjukkan keempat fitur (Settings, Buat Soal, Nilai Konfigurasi, Tutorial/Latihan):

<video src="demo/website-walkthrough.mp4" controls width="100%" poster="">
  Browser Anda tidak mendukung pemutar video; unduh langsung:
  <a href="demo/website-walkthrough.mp4">demo/website-walkthrough.mp4</a>
</video>

Atau unduh langsung: [`demo/website-walkthrough.mp4`](demo/website-walkthrough.mp4)

## Repositori

<https://github.com/xelisme/MikroTik-Praktik>

## Lisensi

Lihat berkas `LICENSE` (jika ada).

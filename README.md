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
- **Deploy:** Vercel serverless (`api/[[...slug]].js`)

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

**2. GUI Settings** (per-session):
Buka menu Settings di aplikasi, isi Base URL / API Key / Model. Kunci disimpan dalam **cookie httpOnly bertanda tangan** yang **kedaluwarsa otomatis setelah 30 menit** — tidak persisten di disk, cocok untuk deploy stateless seperti Vercel.

> Pada Vercel (filesystem read-only), hanya jalur cookie yang berfungsi untuk menyimpan kunci per-session. Setel `COOKIE_SECRET` di environment Vercel agar cookie tidak mudah dipalsukan.

## Deploy ke Vercel

1. Fork/clone repo ini: <https://github.com/xelisme/MikroTik-Praktik>
2. Import ke Vercel (framework: *Other*).
3. (Opsional) Set `COOKIE_SECRET` di Environment Variables.
4. Deploy — tidak perlu set API key; pengguna mengisinya lewat GUI Settings (berlaku 30 menit).

`api/[[...slug]].js` mengekspor apl Express sebagai fungsi serverless Vercel.

## Keamanan

- **SSH baca-saja:** penilaian tidak boleh mengubah router — hanya perintah baca; perintah destruktif ditolak.
- **Kunci GUI tidak persisten:** pada Vercel (fs read-only) kunci hanya ada di cookie session, otomatis hangus 30 menit.
- **Bahasa Indonesia:** UI & copy tetap dalam Bahasa Indonesia.

## Struktur Proyek

```
server.js              # Express app + route wiring + cookie settings
api/[[...slug]].js     # Vercel serverless entry
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

Lihat walkthrough singkat di [`demo/website-walkthrough.mp4`](demo/website-walkthrough.mp4) yang menunjukkan keempat fitur (Settings, Buat Soal, Nilai Konfigurasi, Tutorial/Latihan).

## Repositori

<https://github.com/xelisme/MikroTik-Praktik>

## Lisensi

Lihat berkas `LICENSE` (jika ada).

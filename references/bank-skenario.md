# Bank Skenario Praktik — Studi Kasus Perusahaan

Template skenario untuk Mode A. Tiap skenario punya Konteks Bisnis (disajikan ke murid), Requirement (disajikan ke murid), dan Kriteria Sukses (**JANGAN disajikan ke murid** — dipakai internal saat Mode B audit).

Sesuaikan detail IP/nama perusahaan/skala sesuai kebutuhan saat generate — ini template dasar, bukan naskah kaku.

---

## 1. Interkoneksi Dua Kantor (Level Dasar) — Static/Dynamic Routing

**Konteks Bisnis:** PT Maju Jaya punya kantor pusat di Jakarta dan kantor cabang baru di Bandung. Kedua kantor punya router MikroTik sendiri dan terhubung lewat link WAN (bisa disimulasikan lewat interface kedua di masing-masing router). Karyawan di kedua kantor perlu bisa saling akses server internal satu sama lain.

**Requirement:** Kedua jaringan lokal (misal `10.10.1.0/24` di Jakarta dan `10.10.2.0/24` di Bandung) harus bisa saling ping dan akses layanan satu sama lain lewat link WAN yang menghubungkan kedua router.

**Kriteria Sukses (internal):**
- Static route di kedua router mengarah ke network lawan lewat gateway yang benar
- (Level lanjut: ganti jadi requirement OSPF kalau murid levelnya lebih tinggi — router harus saling jadi neighbor dan network di-advertise otomatis)
- Firewall tidak memblokir traffic forward antar network tersebut
- Ping dan traceroute dari satu network ke network lain berhasil

---

## 2. VPN Site-to-Site Antar Dua Perusahaan (Level Menengah) — WireGuard/IPsec

**Konteks Bisnis:** PT Solusi Digital baru saja kerja sama dengan vendor logistik PT Kirim Cepat. Kedua perusahaan perlu jaringan internal mereka saling terhubung secara aman lewat internet publik, tanpa membocorkan traffic ke pihak luar.

**Requirement:** Buat tunnel VPN site-to-site (WireGuard) antar kedua router yang mewakili kedua perusahaan, sehingga network lokal masing-masing bisa saling akses lewat tunnel terenkripsi, tapi tetap terpisah dari akses internet publik biasa.

**Kriteria Sukses (internal):**
- Interface WireGuard aktif di kedua sisi dengan public key saling terdaftar sebagai peer yang benar
- `allowed-address` di tiap peer sesuai subnet lawan (bukan `0.0.0.0/0` kalau memang tidak diminta full-tunnel)
- Static route mengarahkan traffic ke subnet lawan lewat interface WireGuard
- `persistent-keepalive` disarankan ada kalau salah satu sisi di belakang NAT
- Traffic yang lewat tunnel tidak boleh diblokir firewall

---

## 3. Segmentasi Jaringan dengan VLAN (Level Menengah) — Firewall Antar VLAN

**Konteks Bisnis:** PT Bank Sejahtera ingin memisahkan jaringan internal jadi beberapa segmen: Finance, HR, dan Guest WiFi — supaya perangkat tamu tidak bisa akses data sensitif finance/HR, tapi semua tetap bisa akses internet.

**Requirement:** Buat VLAN terpisah untuk Finance, HR, dan Guest di satu switch/bridge MikroTik. Guest hanya boleh akses internet, tidak boleh akses VLAN Finance maupun HR. Finance dan HR boleh saling akses (misal untuk sistem payroll).

**Kriteria Sukses (internal):**
- Bridge VLAN filtering aktif, port trunk/access dikonfigurasi benar (tagged/untagged sesuai posisi)
- Tiap VLAN dapat subnet IP terpisah
- Firewall filter rule (chain forward) secara eksplisit drop traffic dari VLAN Guest menuju VLAN Finance/HR, tapi tetap accept ke internet (WAN interface)
- Finance dan HR tidak saling terblokir

---

## 4. Redundansi Gateway dengan VRRP (Level Lanjut)

**Konteks Bisnis:** PT Data Sentral tidak mau jaringan kantornya down total kalau router utama mati mendadak — mereka butuh router cadangan yang otomatis ambil alih.

**Requirement:** Dua router MikroTik dikonfigurasi VRRP sehingga salah satunya jadi master (memegang virtual IP sebagai gateway utama), dan yang satunya backup — kalau master mati, backup otomatis ambil alih virtual IP tanpa perlu ubah konfigurasi apapun di sisi client.

**Kriteria Sukses (internal):**
- Kedua router punya interface VRRP dengan `virtual-router-id` yang sama dan `priority` yang berbeda
- Virtual IP terdaftar dan dipakai sebagai default gateway oleh client (bukan IP fisik salah satu router)
- Saat router master dimatikan (simulasi), backup benar-benar ambil alih virtual IP (bisa dicek dengan `/interface vrrp print` menunjukkan status `master` berpindah)

---

## 5. Wireless Terpusat dengan CAPsMAN (Level Lanjut)

**Konteks Bisnis:** PT Retail Nusantara punya 5 cabang toko, tiap cabang ada 1 access point. Mereka ingin semua AP dikelola dari satu titik pusat (bukan konfigurasi manual satu-satu), dan karyawan bisa roaming antar AP dengan SSID yang sama tanpa terputus.

**Requirement:** Setup satu router sebagai CAPsMAN controller yang mengelola beberapa access point (CAP) sekaligus, dengan satu konfigurasi SSID & security profile terpusat yang di-push ke semua AP.

**Kriteria Sukses (internal):**
- CAPsMAN controller aktif dengan konfigurasi (`configuration`) yang mendefinisikan SSID dan security profile
- AP (CAP) berhasil terdaftar di `registration-table` controller, statusnya connected
- Perubahan di sisi controller (misal ganti SSID) otomatis ter-push ke semua CAP tanpa perlu login manual ke tiap AP

---

## 6. Port Forwarding & Proteksi Server Internal (Level Dasar-Menengah)

**Konteks Bisnis:** PT Game Studio punya game server yang dijalankan di jaringan internal, dan perlu bisa diakses pemain dari internet. Tapi mereka juga khawatir soal serangan brute-force ke server itu.

**Requirement:** Setup port forwarding supaya server internal (misal `192.168.10.50` port `25565`) bisa diakses dari internet lewat IP public router. Sekaligus proteksi dari percobaan koneksi berlebihan dari satu sumber (rate-limiting atau address-list otomatis).

**Kriteria Sukses (internal):**
- NAT dst-nat rule benar: `dst-port` sesuai port publik yang dibuka, `to-addresses` dan `to-ports` mengarah ke server internal yang tepat
- Firewall filter chain forward mengizinkan traffic ke tujuan itu (default policy RouterOS *tidak* otomatis block forward, jadi cek juga tidak ada rule lain yang keburu drop)
- Ada mekanisme proteksi tambahan: baik lewat address-list dinamis (connection-limit + tarpit/drop) atau firewall rule yang membatasi rate koneksi baru per IP sumber

---

## 7. Prioritas Bandwidth untuk VoIP (Level Menengah) — QoS

**Konteks Bisnis:** PT Kontak Bisnis pakai VoIP untuk telepon kantor, tapi sering kedengeran putus-putus kalau ada karyawan lain lagi download berat di jaringan yang sama.

**Requirement:** Pastikan traffic VoIP selalu dapat prioritas bandwidth dibanding traffic biasa (browsing, download), meski total bandwidth kantor terbatas.

**Kriteria Sukses (internal):**
- Ada mangle rule yang menandai traffic VoIP secara spesifik (berdasarkan port/protokol VoIP yang dipakai, misal SIP/RTP)
- Queue Tree (bukan sekadar Simple Queue) dipakai dengan prioritas berbeda antar traffic mark
- Saat traffic non-VoIP dibebani penuh, traffic VoIP tetap dapat bandwidth minimum yang dijamin (bisa dites dengan bandwidth-test bersamaan)

---

---

## 8. Hotspot WiFi Cafe — GUI & CLI (Level Dasar)

**Konteks Bisnis:** "Cafe Ngopi Skuy" ingin menyediakan layanan Wi-Fi khusus untuk pelanggan VIP mereka. Agar koneksi tetap stabil dan tidak saling berebut, pemilik kafe meminta Anda sebagai teknisi jaringan untuk membuat sistem Hotspot dengan manajemen bandwidth dan batasan waktu.

**Requirement:**
- Setup router sebagai Hotspot Gateway (DHCP client di ether1 untuk internet, wireless AP bridge di wlan1 untuk hotspot)
- Buat User Profile "Profile-VIP" dengan Rate Limit 512k Upload / 1M Download
- Buat 5 akun user VIP (vip1 s.d. vip5) dengan password "123" dan Limit Uptime 2 jam
- Login page hotspot bisa diakses client lewat browser

**Batasan:**
- Untuk sesi GUI: semua konfigurasi lewat Winbox GUI (tidak boleh pakai terminal)
- Untuk sesi CLI: semua konfigurasi lewat command line (tidak boleh pakai GUI klik-klik)

**Kriteria Sukses (internal):**
- DHCP client status `bound` di ether1
- NAT masquerade di chain `srcnat` out-interface `ether1`
- wlan1 mode `ap-bridge`, SSID `Hotspot-CafeNgopi`, status `running`
- IP `192.168.100.1/24` terpasang di wlan1
- Hotspot server aktif di wlan1 dengan address-pool `192.168.100.2-192.168.100.254`
- DNS name `login.cafengopi.net` terkonfigurasi
- User profile `Profile-VIP` dengan `rate-limit=512k/1m` dan `shared-users=1`
- 5 user (vip1-vip5) terdaftar, masing-masing dengan `limit-uptime=2h`
- Client bisa login hotspot, terkena rate limit, dan timeout setelah 2 jam
- Verifikasi via CLI: `/ip hotspot user print`, `/ip hotspot user profile print`, `/ip hotspot active print`

**Catatan Metode:**
- CLI menggunakan command individual per user (bukan loop script), sesuai jobsheet asli:
  ```
  /ip hotspot user add name=vip1 password=123 profile=Profile-VIP limit-uptime=2h
  /ip hotspot user add name=vip2 password=123 profile=Profile-VIP limit-uptime=2h
  ...dst untuk vip3, vip4, vip5
  ```
- Hotspot setup via CLI menggunakan manual (pool → profile → server), bukan wizard `/ip hotspot setup`

---

## 9. Simple Queue — Batasi Bandwidth Per User/Device (Level Dasar)

**Konteks Bisnis:** "Cafe Ngopi Skuy" ingin memastikan setiap pelanggan yang pakai WiFi mendapat porsi bandwidth yang adil. Selama ini ada pelanggan yang download file besar dan bikin yang lain lemot. Pemilik minta dibatasi max 2M download dan 1M upload per device, tanpa mempengaruhi koneksi router ke internet.

**Requirement:**
- Buat Simple Queue untuk membatasi bandwidth per IP client (max 2M download / 1M upload)
- Queue harus berlaku untuk semua client yang terhubung ke hotspot (range `192.168.100.2/24`)
- Pastikan traffic dari router itu sendiri (ke server DNS, hotspot login, dll) TIDAK terkena limit
- Target harus spesifik ke subnet hotspot, bukan ke semua interface

**Kriteria Sukses (internal):**
- Simple Queue terbuat dengan `target=192.168.100.0/24` (atau range spesifik)
- `max-limit=2M/1M` (2M download, 1M upload) atau sesuai requirement
- `queue-type` default (`pcq-default` atau `default`) — jangan pakai type yang belum dikonfigurasi
- Traffic dari router sendiri (`192.168.100.1` atau interface ether1) **tidak** terkena limit
- Queue aktif (tidak disabled) dan traffic client benar-benar terbatas saat diuji (speed test)
- `/queue simple print` menunjukkan queue dengan counter yang naik saat ada traffic

---

## 10. Queue Tree + Mangle — Prioritas Traffic Berdasarkan Jenis (Level Menengah)

**Konteks Bisnis:** PT Kontak Bisnis punya bandwidth internet 10 Mbps. Mereka ingin:
- **VoIP** (telepon kantor) selalu lancar meski ada yang download
- **Browsing** dapat prioritas kedua
- **Download/Streaming** boleh lambat kalau bandwidth penuh

Semua harus diatur pakai Queue Tree (bukan Simple Queue) supaya bisa prioritas secara fleksibel.

**Requirement:**
- Pakai **Mangle** untuk menandai traffic berdasarkan jenis (mark-connection):
  - `VoIP` → port 5060 (SIP) + port 10000-20000 (RTP)
  - `Browsing` → port 80, 443
  - `Download` → sisa semua traffic
- Buat **Queue Tree** untuk tiap mark dengan prioritas berbeda:
  - VoIP: priority 1 (paling tinggi), guaranteed bandwidth 2M
  - Browsing: priority 3, guaranteed bandwidth 3M
  - Download: priority 7 (paling rendah), max-limit 5M
- Total bandwidth queue tidak boleh melebihi kapasitas link (10 Mbps)
- Buat juga **Queue Tree parent** untuk membatasi total upload/download

**Kriteria Sukses (internal):**
- Ada minimal 3 mangle rule di chain `prerouting` atau `forward` dengan `action=mark-connection`
- Tiap mangle punya `new-connection-mark` yang berbeda (VoIP, Browsing, Download)
- Mangle VoIP match port 5060 dan range 10000-20000 (protocol UDP)
- Mangle Browsing match dst-port 80,443
- Minimal ada 3 Queue Tree, masing-masing dengan `connection-mark` yang sesuai
- Queue Tree VoIP: `priority=1`, `limit-at=2M`
- Queue Tree Browsing: `priority=3`, `limit-at=3M`
- Queue Tree Download: `priority=7`, `max-limit=5M`
- Parent queue Tree ada (total 10M) supaya semua child queue terbatas
- Saat VoIP dan download aktif bersamaan, VoIP tetap dapat bandwidth yang dijamin

---

## Cara Pakai Template Ini

- Kalau murid levelnya **pemula**, pilih skenario 8 (Hotspot Cafe) atau 9 (Simple Queue) — cocok untuk pemahaman dasar.
- Kalau murid levelnya **pemula-menengah**, pilih skenario 1 atau 6 dengan requirement yang disederhanakan, atau skenario 9 (Simple Queue) untuk QoS dasar.
- Kalau murid levelnya **menengah**, pilih skenario 7 atau 10 (Queue Tree + Mangle) — butuh pemahaman tentang mangle, connection-mark, dan tree queue.
- Kalau murid minta topik spesifik yang tidak ada di daftar (misal proxy, voucher), boleh dibuatkan skenario baru mengikuti pola yang sama: Konteks Bisnis → Requirement → Kriteria Sukses tersembunyi.
- Selalu sesuaikan skala skenario dengan apa yang realistis dikerjakan di lab (CHR/VM), bukan yang butuh hardware fisik banyak (kecuali murid memang punya lab hardware).
- Untuk skenario hotspot (8), sediakan dua versi: GUI (Winbox) dan CLI (Terminal) — murid bisa pilih salah satu atau mengerjakan keduanya untuk perbandingan.
- Untuk skenario queue (9 dan 10), bisa dikerjakan via CLI atau GUI — pastikan murid paham perbedaan Simple Queue (per-IP) vs Queue Tree (per-traffic-type dengan mangle).

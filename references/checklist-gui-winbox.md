# Checklist Audit via Winbox GUI — Peta Area untuk Hint

Dokumen ini memetakan area Winbox GUI ke command SSH read-only yang setara. Dipakai saat murid menggunakan GUI Winbox dan skill perlu kasih hint berdasarkan area Winbox (bukan command CLI).

---

## Hotspot Gateway (Skenario 8)

### A. Gateway Internet

| Area Winbox | Yang Dicek | Command SSH Setara |
|-------------|------------|-------------------|
| IP > DHCP Client | Status harus `bound` | `/ip dhcp-client print` |
| IP > Firewall > NAT tab | Rule `chain=srcnat`, `out-interface=ether1`, `action=masquerade` | `/ip firewall nat print` |

**Hint GUI saat audit:**
- "Cek menu **IP > DHCP Client** — statusnya harus `bound`, bukan `searching` atau `error`"
- "Cek tab **NAT** di **IP > Firewall** — pastikan ada rule dengan chain `srcnat` dan action `masquerade`"

### B. Interface Wireless

| Area Winbox | Yang Dicek | Command SSH Setara |
|-------------|------------|-------------------|
| Wireless > WiFi Interfaces | wlan1 harus `R` (running), centang biru aktif | `/interface wireless print` |
| Wireless > wlan1 > Tab Wireless | Mode: `ap bridge`, SSID benar | `/interface wireless print` |
| IP > Addresses | IP `192.168.100.1/24` di wlan1 | `/ip address print` |

**Hint GUI saat audit:**
- "Buka menu **Wireless** — lihat wlan1, harus ada tanda `R` (running) dan mode `ap bridge`"
- "Klik ganda wlan1, tab **Wireless** — pastikan SSID sudah sesuai"
- "Cek **IP > Addresses** — harus ada IP di interface wlan1"

### C. Hotspot Server

| Area Winbox | Yang Dicek | Command SSH Setara |
|-------------|------------|-------------------|
| IP > Hotspot > Servers tab | Server hotspot1 aktif, interface wlan1 | `/ip hotspot print` |
| IP > Hotspot > Server Profiles tab | `dns-name` terisi (misal `login.cafengopi.net`) | `/ip hotspot profile print` |
| IP > Hotspot > Users tab | User vip1-vip5 terdaftar | `/ip hotspot user print` |
| IP > Hotspot > User Profiles tab | Profile-VIP dengan rate-limit | `/ip hotspot user profile print` |
| IP > Hotspot > Active tab | Client yang sedang login | `/ip hotspot active print` |

**Hint GUI saat audit:**
- "Buka **IP > Hotspot** — cek tab **Servers**, pastikan server sudah ada dan aktif"
- "Cek tab **Server Profiles** — pastikan `dns-name` terisi untuk login page"
- "Cek tab **User Profiles** — rate-limit Profile-VIP harus `512k/1M`"
- "Cek tab **Users** — harus ada 5 user vip1-vip5 dengan profile Profile-VIP"

### D. Limit Uptime

| Area Winbox | Yang Dicek | Command SSH Setara |
|-------------|------------|-------------------|
| IP > Hotspot > Users > klik user > Tab Limits | `Limit Uptime` harus `02:00:00` | `/ip hotspot user print detail where name="vip1"` |

**Hint GUI saat audit:**
- "Klik ganda salah satu user (misal vip1), pindah ke tab **Limits** — pastikan `Limit Uptime` terisi `02:00:00`"

---

## Konfigurasi Dasar (Skenario 9)

| Area Winbox | Yang Dicek | Command SSH Setara |
|-------------|------------|-------------------|
| System > Identity | Nama router sudah diubah | `/system identity print` |
| System > Clock | Waktu benar | `/system clock print` |
| IP > Addresses | IP terpasang di interface yang benar | `/ip address print` |
| IP > Routes | Default route ada (`0.0.0.0/0`) | `/ip route print` |
| IP > DNS | DNS server terisi, `allow-remote-requests` | `/ip dns print` |
| IP > DHCP Client | Status `bound` | `/ip dhcp-client print` |
| IP > DHCP Server | Server aktif, pool terisi | `/ip dhcp-server print` |

---

## Queue — Simple Queue & Queue Tree (Skenario 9 & 10)

### A. Simple Queue (Per-IP Limit)

| Area Winbox | Yang Dicek | Command SSH Setara |
|-------------|------------|-------------------|
| Queue > Simple Queues | Queue ada, target benar, max-limit sesuai | `/queue simple print` |
| Queue > Simple Queues > klik queue | Target, max-limit, burst (kalau ada) | `/queue simple print detail` |

**Hint GUI saat audit:**
- "Buka menu **Queue** di Winbox, tab **Simple Queues** — pastikan ada queue dengan target subnet hotspot"
- "Klik ganda queue-nya — cek kolom **Max Limit** harus `2M/1M`"

### B. Queue Tree + Mangle (Prioritas Traffic)

| Area Winbox | Yang Dicek | Command SSH Setara |
|-------------|------------|-------------------|
| Queue > Tree | Queue Tree ada, parent benar, priority sesuai | `/queue tree print` |
| IP > Firewall > Mangle | Mangle rule ada, connection-mark benar | `/ip firewall mangle print` |

**Hint GUI saat audit:**
- "Cek tab **Mangle** di **IP > Firewall** — harus ada rule yang menandai traffic VoIP, Browsing, Download"
- "Cek tab **Queue Tree** di menu **Queue** — pastikan ada queue dengan parent `global` dan priority berbeda"
- "Pastikan `connection-mark` di Queue Tree cocok dengan `new-connection-mark` di Mangle"

---

## Tips untuk Skill Saat Audit GUI

1. **Selalu tanyakan dulu** apakah murid pakai GUI atau CLI — command audit tetap SSH read-only, tapi hint-nya disesuaikan.
2. **Hint pakai nama area Winbox**, bukan command CLI. Contoh: "Cek menu IP > Hotspot" bukan "jalankan `/ip hotspot print`".
3. **Kalau murid minta command verifikasi**, boleh kasih command CLI sebagai tool tambahan — tapi hint utama tetap pakai bahasa GUI.
4. **Screenshot tidak bisa diverifikasi via SSH** — kalau murid kirim screenshot, minta juga output CLI sebagai bukti verifikasi.

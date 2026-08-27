# Command Reference — Sumber kebenaran semua command RouterOS

Dokumen ini berisi command-command RouterOS yang diekstrak dari materi praktik (jobsheet + modul). Dipakai sebagai acuan saat audit — pastikan command murid sesuai dengan referensi ini.

**Catatan:** Command di bawah sudah dikoreksi dari hasil OCR (typo koreksi: `etherl` → `ether1`, `srenat` → `srcnat`, `hsprofl` → `hsprof1`, dll).

---

## 1. Gateway Internet (DHCP Client + NAT)

**Sumber:** Jobsheet 1 (GUI) & Jobsheet 2 (CLI)

### Setup via CLI:
```
/ip dhcp-client add interface=ether1 disabled=no
/ip firewall nat add chain=srcnat out-interface=ether1 action=masquerade
```

### Verifikasi:
```
/ip dhcp-client print
/ping 8.8.8.8 count=3
```

### Yang Harus Dicek:
- DHCP client status: `bound`
- NAT: chain `srcnat`, out-interface `ether1`, action `masquerade`
- Ping 8.8.8.8: reply sukses, packet-loss=0%

---

## 2. Wireless AP Bridge

**Sumber:** Jobsheet 1 (GUI) & Jobsheet 2 (CLI)

### Setup via CLI:
```
/interface wireless set [ find default-name=wlan1 ] mode=ap-bridge ssid=Hotspot-CafeNgopi disabled=no
/ip address add address=192.168.100.1/24 interface=wlan1
```

### Verifikasi:
```
/interface wireless print
/ip address print
```

### Yang Harus Dicek:
- wlan1: flag `R` (running), mode `ap-bridge`, SSID benar
- IP `192.168.100.1/24` terpasang di wlan1

---

## 3. Hotspot Server (Manual Setup)

**Sumber:** Jobsheet 2 (CLI) —Setup manual, bukan wizard

### Setup via CLI:
```
/ip pool add name=hs-pool-1 ranges=192.168.100.2-192.168.100.254

/ip hotspot profile add name=hsprof1 dns-name=login.cafengopi.net hotspot-address=192.168.100.1

/ip hotspot add name=hotspot1 interface=wlan1 address-pool=hs-pool-1 profile=hsprof1 disabled=no
```

### Verifikasi:
```
/ip hotspot print
/ip hotspot profile print
```

### Yang Harus Dicek:
- Pool `hs-pool-1` terbuat dengan range yang benar
- Hotspot profile `hsprof1` dengan `dns-name` terisi
- Hotspot server `hotspot1` aktif di wlan1 dengan profile dan pool yang benar

---

## 4. User Profile (Bandwidth Management)

**Sumber:** Jobsheet 1 (GUI) & Jobsheet 2 (CLI)

### Setup via CLI:
```
/ip hotspot user profile add name=Profile-VIP rate-limit="512k/1M" shared-users=1
```

### Verifikasi:
```
/ip hotspot user profile print
```

### Yang Harus Dicek:
- Profile `Profile-VIP` ada
- `rate-limit` = `512k/1M` (512kbps upload, 1Mbps download)
- `shared-users` = 1

---

## 5. User Management (5 User VIP + Limit Uptime)

**Sumber:** Jobsheet 1 (GUI) & Jobsheet 2 (CLI)

### Setup via CLI (5 command individual):
```
/ip hotspot user add name=vip1 password=123 profile=Profile-VIP limit-uptime=2h
/ip hotspot user add name=vip2 password=123 profile=Profile-VIP limit-uptime=2h
/ip hotspot user add name=vip3 password=123 profile=Profile-VIP limit-uptime=2h
/ip hotspot user add name=vip4 password=123 profile=Profile-VIP limit-uptime=2h
/ip hotspot user add name=vip5 password=123 profile=Profile-VIP limit-uptime=2h
```

### Verifikasi:
```
/ip hotspot user print
/ip hotspot user print detail where name="vip1"
```

### Yang Harus Dicek:
- 5 user (vip1-vip5) terdaftar
- Masing-masing menggunakan profile `Profile-VIP`
- `limit-uptime` = `2h` atau `02:00:00`
- Password = `123`

---

## 6. Monitoring & Testing

**Sumber:** Jobsheet 1 (GUI) & Jobsheet 2 (CLI)

### Commands:
```
/ip hotspot active print
/ip hotspot user print
/system resource print
```

### Yang Harus Dicek:
- Active: client yang sedang login terlihat (address, uptime, session-time-left)
- Resource: CPU usage, free memory masih wajar

---

## Mapping GUI → CLI

| Konfigurasi | Winbox Menu | Command CLI |
|-------------|-------------|-------------|
| DHCP Client | IP > DHCP Client | `/ip dhcp-client add interface=ether1 disabled=no` |
| NAT Masquerade | IP > Firewall > NAT | `/ip firewall nat add chain=srcnat out-interface=ether1 action=masquerade` |
| Wireless AP | Wireless > wlan1 | `/interface wireless set [find default-name=wlan1] mode=ap-bridge ssid=... disabled=no` |
| IP Address | IP > Addresses | `/ip address add address=192.168.100.1/24 interface=wlan1` |
| Hotspot Pool | IP > Pool | `/ip pool add name=hs-pool-1 ranges=192.168.100.2-192.168.100.254` |
| Hotspot Profile | IP > Hotspot > Server Profiles | `/ip hotspot profile add name=hsprof1 dns-name=... hotspot-address=...` |
| Hotspot Server | IP > Hotspot > Servers | `/ip hotspot add name=hotspot1 interface=wlan1 address-pool=... profile=... disabled=no` |
| User Profile | IP > Hotspot > User Profiles | `/ip hotspot user profile add name=Profile-VIP rate-limit="512k/1M" shared-users=1` |
| User VIP | IP > Hotspot > Users | `/ip hotspot user add name=vip1 password=123 profile=Profile-VIP limit-uptime=2h` |

---

## Verifikasi Command (Read-Only)

Semua command ini aman dijalankan saat audit — tidak mengubah konfigurasi:

```
/ip dhcp-client print
/interface wireless print
/ip address print
/ip firewall nat print
/ip pool print
/ip hotspot print
/ip hotspot profile print
/ip hotspot user profile print
/ip hotspot user print
/ip hotspot user print detail where name="vip1"
/ip hotspot active print
/queue simple print
/queue tree print
/ip firewall mangle print
/ping 8.8.8.8 count=3
/system resource print
```

---

## 7. Simple Queue (Bandwidth Per-IP)

**Sumber:** Skenario 9

### Setup via CLI:
```
/queue simple add name="Client-Limit" target=192.168.100.0/24 max-limit=2M/1M
```

### Verifikasi:
```
/queue simple print
```

### Yang Harus Dicek:
- Queue terbuat dengan `target` yang benar (subnet hotspot)
- `max-limit=2M/1M` (2M down, 1M up)
- Queue aktif (tidak disabled)
- Counter bytes naik saat ada traffic

---

## 8. Queue Tree + Mangle (Prioritas Traffic)

**Sumber:** Skenario 10

### Setup via CLI — Mangle (tandai traffic):
```
/ip firewall mangle add chain=prerouting protocol=udp dst-port=5060 connection-mark=no-mark new-connection-mark=VoIP action=mark-connection
/ip firewall mangle add chain=prerouting protocol=udp dst-port=10000-20000 connection-mark=no-mark new-connection-mark=VoIP action=mark-connection
/ip firewall mangle add chain=prerouting dst-port=80,443 connection-mark=no-mark new-connection-mark=Browsing action=mark-connection
/ip firewall mangle add chain=prerouting connection-mark=no-mark new-connection-mark=Download action=mark-connection
```

### Setup via CLI — Queue Tree (prioritas):
```
/queue tree add name="VoIP" parent=global connection-mark=VoIP priority=1 limit-at=2M
/queue tree add name="Browsing" parent=global connection-mark=Browsing priority=3 limit-at=3M
/queue tree add name="Download" parent=global connection-mark=Download priority=7 max-limit=5M
```

### Verifikasi:
```
/ip firewall mangle print
/queue tree print
```

### Yang Harus Dicek:
- Mangle rule ada dengan `connection-mark` yang berbeda
- Mangle VoIP match port 5060 + 10000-20000
- Mangle Browsing match port 80,443
- Queue Tree punya `parent=global` atau parent queue Tree yang benar
- Queue Tree punya `priority` berbeda (VoIP=1 paling tinggi, Download=7 paling rendah)
- `limit-at` dan `max-limit` sesuai requirement

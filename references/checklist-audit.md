# Checklist Audit RouterOS (Read-Only)

Semua command di bawah ini **read-only** — aman dijalankan di router yang sedang dipakai murid tanpa risiko mengubah konfigurasi apapun. Jangan pernah menambahkan command lain di luar pola `print`, `export` (tanpa `file=` kalau memungkinkan, supaya outputnya langsung ke layar bukan bikin file baru di router), `monitor` versi non-blocking, atau `resource print`.

**Command yang DILARANG dijalankan skill ini** (bukan cuma contoh, tapi kategori penuh): `add`, `set`, `remove`, `enable`, `disable`, `reset-configuration`, `backup load`, `import`, `move`, `renumber`, `flush`, atau apapun yang secara jelas mengubah state router.

---

## Tier 0 — Hotspot Quick Check

Jalankan ini **paling pertama** kalau skenario melibatkan hotspot. Hotspot adalah topik paling umum untuk level pemula dan sering kali jadi sumber masalah pertama.

```
/ip dhcp-client print
/interface wireless print
/ip address print
/ip firewall nat print
/ip hotspot print
/ip hotspot profile print
/ip hotspot user profile print
/ip hotspot user print
/ip hotspot active print
```

Yang dicek:
- DHCP client: status `bound` (bukan `searching`/`error`)
- Wireless: wlan1 `R` (running), mode `ap-bridge`, SSID benar
- IP address: `192.168.100.1/24` di wlan1 (atau IP hotspot sesuai skenario)
- NAT: `action=masquerade` di chain `srcnat`, out-interface ke WAN
- Hotspot server: aktif, interface benar, address-pool terisi
- Hotspot profile: `dns-name` terisi (untuk login page)
- User profile: `rate-limit` terisi sesuai requirement
- User: semua user terdaftar, `limit-uptime` terisi
- Active: client yang sedang login terlihat (kalau ada yang sedang test)

**Hotspot-specific common errors:**
- WLAN tidak running → cek apakah interface di-enable
- Login page tidak muncul → cek `dns-name` di hotspot profile, cek DNS server
- Rate limit tidak jalan → cek `rate-limit` di user profile (bukan di user langsung)
- User timeout tapi tidak terputus → cek `limit-uptime` format benar (`2h` atau `02:00:00`)

**Queue-specific common errors:**
- Simple Queue target salah (target IP router sendiri, bukan subnet client)
- Queue Tree tanpa parent → semua child queue tidak terbatas
- Mangle tidak ada → Queue Tree tidak bisa match traffic
- Connection-mark di Queue Tree tidak cocok dengan new-connection-mark di Mangle
- Priority Queue Tree salah (angka kecil = prioritas tinggi, bukan sebaliknya)

## Tier 1 — Quick Scan

Jalankan ini dulu kalau bukan skenario hotspot. Statistik: mayoritas kesalahan konfigurasi murid ada di salah satu area ini.

```
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
```

Yang dicek sekilas dari output di atas:
- Interface yang seharusnya aktif tapi statusnya `X` (disabled) atau `R` hilang (down)
- IP address yang salah subnet/salah interface
- Default route (`0.0.0.0/0`) ada atau tidak, gateway-nya benar atau tidak
- NAT: `action=masquerade` di chain `srcnat` untuk akses internet, `action=dst-nat` untuk port forwarding — cek urutan dan parameter `to-addresses`/`to-ports`
- Firewall filter: urutan rule (accept vs drop), ada rule yang keblokir sendiri secara tidak sengaja
- DHCP server: pool habis, network/gateway salah, interface yang di-attach salah
- DNS: `allow-remote-requests` dan server DNS yang dipakai

## Tier 2 — Full Scan

Lanjut ke sini kalau Tier 1 tidak menemukan masalah, atau kalau skenario memang menyentuh topik-topik berikut secara spesifik.

**Bridge & VLAN**
```
/interface bridge print
/interface bridge port print
/interface bridge vlan print
```

**Wireless**
```
/interface wireless print
/interface wireless security-profiles print
/interface wireless registration-table print
```

**Bandwidth Management**
```
/queue simple print
/queue tree print
/queue type print
```

**PPP & Tunnel/VPN**
```
/ppp secret print
/ppp active print
/interface pppoe-client print
/interface pptp-server server print
/interface sstp-server server print
/interface ovpn-server server print
/interface wireguard print
/interface wireguard peers print
```

**Routing Dinamis**

⚠️ Struktur command OSPF **beda antara RouterOS v6 dan v7** — cek dulu versinya dengan `/system resource print` (lihat field `version`) sebelum pilih command yang tepat.

RouterOS v6:
```
/routing ospf instance print
/routing ospf interface print
/routing ospf neighbor print
```

RouterOS v7:
```
/routing ospf instance print
/routing ospf area print
/routing ospf interface-template print
/routing ospf neighbor print
```

BGP (kalau relevan):
```
/routing bgp peer print
```
(atau `/routing bgp connection print` di beberapa versi v7 yang lebih baru — kalau command pertama tidak dikenali, coba yang ini sebagai fallback.)

**CAPsMAN (kalau skenario melibatkan multi-AP terpusat)**
```
/caps-man interface print
/caps-man registration-table print
/caps-man configuration print
```

**High Availability**
```
/interface vrrp print
```

**Scripting & Automasi**
```
/system script print
/system scheduler print
```

**Log Sistem** (untuk cari error/warning yang relevan)
```
/log print where topics~"error"
/log print where topics~"critical"
```

**Sanity Check Umum**
```
/system resource print
/system routerboard print
```

---

## Catatan Penting

- Kalau ada command di atas yang tidak dikenali router (`bad command name` atau `no such item`), itu bukan berarti error kritikal — bisa jadi memang fitur itu tidak dipakai di skenario ini, atau perbedaan versi RouterOS. Jangan panik, cukup catat dan lanjut ke command berikutnya.
- Selalu jalankan command satu-satu dan tunjukkan hasilnya ke pengguna sebelum lanjut ke command berikutnya — jangan spam banyak command sekaligus tanpa penjelasan di antaranya.

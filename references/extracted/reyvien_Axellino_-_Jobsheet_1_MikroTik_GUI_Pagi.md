# reyvien Axellino - Jobsheet_1_MikroTik_GUI_Pagi

*Diekstrak otomatis dari: /mnt/pentest/materi/reyvien Axellino - Jobsheet_1_MikroTik_GUI_Pagi.pdf*

## Teks dari PDF

JOBSHEET PRAKTIKUM MIKROTIK (SESI 1 - PAGI)
Materi: Konfigurasi Hotspot, Management Bandwidth, & Limit Uptime via Winbox GUI
Waktu: 08.00 - 12.00 WIB

1. Tujuan Praktikum
●

Murid mampu mengonfigurasi RouterBoard MikroTik sebagai Hotspot Gateway menggunakan
Winbox GUI.

●

Murid mampu membuat User Profile untuk manajemen bandwidth (Rate Limit
Upload/Download) via antarmuka grafis.

●

Murid mampu melakukan manajemen user hotspot dan membatasi durasi penggunaan (Uptime
Limit 2 Jam) via GUI.

2. Alat dan Bahan
●

1 Unit PC / Laptop (sebagai Administrator & Client Penguji)

●

1 Unit RouterBoard MikroTik (memiliki interface Wireless/WLAN, misal: hAP lite / RB941)

●

2 Buah Kabel UTP (Straight)

●

Aplikasi Winbox (Versi terbaru)

●

Koneksi Internet (Sumber Gateway)

3. Studi Kasus
"Cafe Ngopi Skuy" ingin menyediakan layanan Wi-Fi khusus untuk pelanggan VIP mereka. Agar
koneksi tetap stabil dan tidak saling berebut, pemilik kafe meminta Anda sebagai teknisi jaringan
untuk membuat sistem Hotspot. Anda diminta membuat 5 akun user VIP (vip1 sampai vip5).
Untuk menjaga keadilan distribusi internet dan rotasi pelanggan, diterapkan dua aturan berikut:
1. Membuat 5 Akun User VIP (username: vip1, vip2, vip3, vip4, vip5).
2. Membatasi kecepatan internet tiap user maksimal 1 Mbps Download dan 512 kbps Upload.
3. Menerapkan batasan durasi aktif (Limit Uptime) maksimal 2 Jam untuk tiap akun.

4. Langkah Kerja (Konfigurasi Winbox GUI)
A. Persiapan & Koneksi Internet (Gateway)
Buka aplikasi Winbox, lakukan discovery dan Login ke RouterBoard menggunakan MAC Address.
4. Konfigurasi DHCP Client: Buka menu IP > DHCP Client -> Klik (+), pilih Interface: ether1 ->
Apply & OK (Status: bound).
5. Konfigurasi NAT Masquerade: Buka menu IP > Firewall > Tab NAT -> Klik (+), Tab General set
Chain: srcnat, Out. Interface: ether1. Pindah ke Tab Action, set Action: masquerade -> OK.
B. Konfigurasi Interface Wireless (WLAN)

6. Buka menu Wireless -> Tab WiFi Interfaces -> Klik wlan1 -> Klik tombol Centang Biru (Enable).
7. Klik ganda wlan1 -> Pindah ke Tab Wireless -> Set Mode: ap bridge, SSID: Hotspot-CafeNgopi ->
Klik OK.
8. Buka menu IP > Addresses -> Klik (+), masukkan Address: 192.168.100.1/24, Interface: wlan1 > Klik OK.
C. Setup Server Hotspot (Wizard)
9. Buka menu IP > Hotspot -> Tab Servers -> Klik tombol Hotspot Setup.
10. Hotspot Interface: wlan1 -> Next.
11. Local Address of Network: 192.168.100.1/24 (Masquerade Network dicentang) -> Next.
12. Address Pool of Network: 192.168.100.2-192.168.100.254 -> Next.
13. Select Certificate: none -> Next | IP Address of SMTP: 0.0.0.0 -> Next.
14. DNS Servers: 8.8.8.8 dan 8.8.4.4 -> Next.
15. DNS Name: login.cafengopi.net -> Next.
16. User lokal pertama: admin (password: admin) -> Next hingga Selesai.
D. Pembuatan User Profile & Limit Bandwidth
17. Masih di menu IP > Hotspot -> Pindah ke Tab User Profiles -> Klik (+).
18. Name: Profile-VIP.
19. Shared Users: 1.
20. Rate Limit (rx/tx): 512k/1M (512k Upload, 1M Download) -> Klik Apply & OK.
E. Pembuatan 5 Akun User VIP & Limit Uptime 2 Jam
21. Pindah ke Tab Users -> Klik (+).
22. Tab General: Server pilih all / hotspot1, Name: vip1, Password: 123, Profile: Profile-VIP.
23. Pindah ke Tab Limits: Pada kolom Limit Uptime, ketikkan 02:00:00 -> Klik Apply & OK.
24. Ulangi langkah di atas untuk membuat akun vip2, vip3, vip4, dan vip5 dengan konfigurasi
Profile dan Limit Uptime yang sama.

5. Draf Laporan Praktikum (Lembar Kerja Sesi Pagi)
Isilah identitas dan tempelkan screenshot (SS) hasil konfigurasi GUI Winbox Anda pada tabel yang
telah disediakan.
LEMBAR KERJA HARI/TANGGAL: SESI 1 (PAGI - GUI)
Nama Murid
Reyvien Axelliano
Kelas
XII TJKT
Waktu Praktikum
08.00 - 12.00 WIB

No

Indikator & Deskripsi
Screenshot (GUI)

A. GATEWAY INTERNET
1

Area Screenshot Winbox /
Hasil

Status Bound pada menu IP >
DHCP Client
[ TEMPEL SS

WINBOX GUI DI SINI ]

2

Konfigurasi Firewall NAT
Masquerade (Tab General &
Action)

[ TEMPEL SS WINBOX GUI DI S
INI ]

B. INTERFACE & IP ADDRESS
3

Interface wlan1 aktif (APBridge & SSID HotspotCafeNgopi)

[ TEMPEL SS WINBOX GUI DI

SINI ]

4

IP Address 192.168.100.1/24

terpasang di wlan1

[ TEMPEL SS WINBOX GUI DI
SINI ]

C. HOTSPOT SERVER & BANDWIDTH
5
Server Hotspot terdaftar di IP
> Hotspot > Servers
[ TEMPEL SS WINBOX GUI DI

SINI ]

6

User Profile 'Profile-VIP'
dengan Rate Limit 512k/1M
[ TEMPEL SS WIN

BOX GUI DI SINI ]

D. USER MANAGEMENT & LIMIT UPTIME
7
Daftar 5 User (vip1 - vip5)
pada tab Users
[ TEMP

EL SS WINBOX GUI DI SINI ]

8

Tab Limits pada salah satu
User (Limit Uptime 02:00:00)
[ TEMPEL SS WINBOX GUI DI
SINI ]

E. PENGUJIAN CLIENT
9

10

Halaman Login Hotspot
(login.cafengopi.net) di
browser client

Hasil Speedtest client
(Mendekati 1 Mbps Down /
512 Kbps Up)

[ TEMPEL SS WINBOX GUI DI
SINI ]

[ TEMPEL SS WINBOX GUI DI
SINI ]

E. Kesimpulan Praktikum (Sesi Pagi)
Tuliskan kesimpulan mengenai kemudahan dan alur konfigurasi Hotspot berbasis GUI Winbox yang
telah Anda lakukan…

Dalam konfigurasi hotspot berbasis GUI winbox kemudahan maupun konfigurasi dalam
konfigurasi terletak pada semua konfigurasi jika sudah terbiasa. Namun, akan menantang jika
belum terbiasa atau bahkan baru pertama kali. Oleh karena itu, cukup latihan secara berulang
dan keep explore untuk menambah ilmu.
At least do something if you can't create something.


## Hasil OCR dari Gambar

[OCR dari gambar img-000.ppm]
Workspace: <own> ~A1Q

41 DHCP Client + DHCP Client DHCP Client Options

4 New

P Interface ~ Use Pe... Add De... IP Address Expires After Status
ether yes yes 192.168.4.45/24 00:07:13 bound

[OCR dari gambar img-001.ppm]
i Firewall - Filter Rules “NAT Mangle Raw Service Ports Connections Address Lists Layer? Protocols
CiNew @eEnable QDisable EJRemove PF Comment Q Find ¥ Filter % ally O
# oo. P Action Chain Src. Address Dst. Address Src. Add... Dst. Add... Protocol Src.Port Dst.Port —_—in. Interf... Out. Inte... In. Interf... Out. Inte... =

[OCR dari gambar img-002.ppm]
& Interface > wlan1 ox
General Wireless HT WDS Nstreme NV2 Status Traffic
Mode {ap bridge 7 Advanced Mode
|
Band 2GHz-B/G ¥ @ Actions
Channel Width 20MHz S Torch
Frequency 2412 . WPS Accept
SSID Hotspot-CafeNgopi - WPS Client
Security Profile default be SSUPRESELET
Scan...
WPS Mode "push button ¥
Freq. Usage...
Frequency Mode — regulatory-domain ba -
Align...
Countr i S
Y etsi ei.
Installation any S Snooper
Antenna Gain 9 dBi Reset Configuration
Default AP Tx Limit +
Default Client Tx Limit +
Default Authenticate
Default Forward
Hide SSID
running ap
Cancel OK

[OCR dari gambar img-003.ppm]
“i Address List

Ci New

P Address v Network Interface
© 221.100.31.1/24 221.100.31.0 _—_ether2
© 192.168.100.1/24 192.168.100.0 wlan

D = 192.168.4.151/24 192.168.4.0 ether1

[OCR dari gambar img-004.ppm]
“ Hotspot Server > hotspot @ |
Enabled ® Copy
x Remove
heme & Betions
Interface wiani oy ReseReM.
Address Pool hs-pool-6 py
Profile hsprof1 py
Idle Timeout 00:05:00 -
Keepalive Timeout +
Login Timeout +
Addresses Per MAC 2 2
IPofDNSName 192.168.100.1
Proxy Status running
Cancel OK

[OCR dari gambar img-005.ppm]
General Queue Scripts
Name | Profile-VIP occ
Address Pool none py x Re
Session Timeout +
Idle Timeout none v|l=
Keepalive Timeout 00:02:00 =
Status Autorefresh 00:01:00
Shared Users 1 -
Rate Limit (rx/tx) 512k/1M -
Add MAC Cookie
MAC Cookie Timeout —3q 00:00:00
Address List +
Incoming Filter +
Cunnainn Elter (

[OCR dari gambar img-006.ppm]
wt Hotspot ~ Servers Server Profiles Users User Profiles Active Hosts IP Bindings Service Ports WalledGarden Walled Garden IP Lis
C5New » Enable 1! Disable x Remove Comment Q Find ¥ Filter
P Server « Name Address MAC Address Profile Uptime =
counters and limits for trial users
* . 00:00:00

© all admin default 00:00:00

© all vip Profile- VIP. 00:00:00

© all vip2 Profile- VIP. 00:00:00

© all vip3 Profile- VIP. 00:00:00
| © all vip4 Profile- VIP. 00:00:00
| © all vipS: Profile- VIP. 00:00:00

[OCR dari gambar img-007.ppm]
“ Hotspot User > vip1 o x
General Limits Statistics
Limit Uptime { 02:00:00 = @ Copy
Limit Bytes In + 28 (RENT
Limit Bytes Out + & Actions
Limit Bytes Total + Reset Counters
Reset All Counters
Cancel ok

[OCR dari gambar img-008.ppm]
€ © @_ ANetsecure login.cafengopi.net/login & oo x 9 4 ry
Please log in to use the internet hotspot service =
a
a
Connect =
Powered by MikroTik RouterOS

[OCR dari gambar img-009.ppm]
@ DOWNLOAD Mbps @ UPLOAD Mbps
Pingms © 53 @107 @ 248
[>] (2)
Prrrre ree Ty Tre Trees
~,) Connections
(eet HOW LIKELY IS IT THAT YOU WOULD
©) PT Telkom Indonesia - RECOMMEND PT TELKOM INDONESIA - INDIBIZ TO.
lam Indibiz A FRIEND OR COLLEAGUE?
180.242.36.8 oo” 2 3 4 5 6 7 8 9 10
B)) PT. Telekomunikasi Not at all likely a Likely
Indonesia
Palembang
Change Server
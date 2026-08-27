# reyvien Axellino - Jobsheet_2_MikroTik_CLI_Siang.docx

*Diekstrak otomatis dari: /mnt/pentest/materi/reyvien Axellino - Jobsheet_2_MikroTik_CLI_Siang.docx.pdf*

## Teks dari PDF

JOBSHEET PRAKTIKUM MIKROTIK (SESI 2 - SIANG)
Materi: Fast Deployment Hotspot, Bandwidth Management, & Limit Uptime via CLI /
Terminal​
Waktu: 13.00 - 16.00 WIB

1. Tujuan Praktikum
●​ Murid mampu mengonfigurasi fitur Hotspot Gateway MikroTik secara cepat dan efisien
menggunakan perintah Command Line Interface (CLI).
●​ Murid mampu mengimplementasikan eksekusi skrip otomatisasi untuk pembuatan User Profile
dan akun massal via Terminal.
●​ Murid mampu melakukan pengecekan dan pengujian status sistem menggunakan perintah
verifikasi (`print`, `export`) di Terminal Winbox.

2. Alat dan Bahan
●​
●​
●​
●​
●​

1 Unit PC / Laptop (sebagai Administrator & Client Penguji)
1 Unit RouterBoard MikroTik (memiliki interface Wireless/WLAN)
2 Buah Kabel UTP (Straight)
Aplikasi Winbox (Menggunakan Fitur New Terminal) / PuTTY SSH
Koneksi Internet (Sumber Gateway)

3. Studi Kasus
Pemilik "Cafe Ngopi Skuy" menginginkan efisiensi waktu dalam setup router baru. Sebagai teknisi
profesional, Anda diminta menyelesaikan seluruh konfigurasi Hotspot, Bandwidth Management,
dan Limitasi Uptime menggunakan Script / Perintah Terminal (CLI) tanpa metode klik-klik GUI.

4. Langkah Kerja & Sintaks CLI (Terminal Winbox)
Petunjuk: Buka Winbox -> Klik menu "New Terminal". Ketik atau copas sintaks perintah di bawah
ini secara teliti.
A. Konfigurasi Internet Gateway via CLI

B. Konfigurasi Wireless & IP Address via CLI

C.​

Setup Hotspot Server & IP Pool via CLI

D. Setup User Profile (Bandwidth 512k/1M) via CLI

E. Pembuatan 5 User VIP + Limit Uptime 2 Jam via CLI (Skrip Massal)

5. Draf Laporan Praktikum (Lembar Kerja Sesi Siang)
Isilah identitas dan tempelkan screenshot (SS) hasil output perintah Terminal CLI Anda pada tabel
di bawah ini.
LEMBAR KERJA HARI/TANGGAL: SESI 2 (SIANG - CLI/TERMINAL)
Nama Murid
Reyvien Axelliano
Kelas / Kelompok
XII TKJ
Waktu Praktikum
13.00 - 16.00 WIB

No

Indikator Output Perintah
Terminal (CLI)
A. VERIFIKASI GATEWAY INTERNET (CLI)
1
Output perintah `/ip
dhcp-client print` (Status:
bound)
2

Output perintah `/ping 8.8.8.8
count=3` (Reply sukses)

B. VERIFIKASI INTERFACE & IP ADDRESS (CLI)
3
Output perintah `/interface
wireless print` (wlan1 active)

4

Output perintah `/ip address
print` (IP 192.168.100.1/24)

C. VERIFIKASI HOTSPOT SERVER & PROFILE (CLI)
5
Output perintah `/ip hotspot
print` (Server hotspot1 active)
6
Output perintah `/ip hotspot
user profile print` (Rate Limit
512k/1M)
D. VERIFIKASI USER MANAGEMENT & UPTIME (CLI)
7
Output perintah `/ip hotspot
user print` (Menampilkan
vip1-vip5)
8

Detail Uptime Limit `2h` pada
baris user `vip1`

E. PENGUJIAN CLIENT & MONITORING (CLI)

Area Screenshot Terminal
Winbox / Hasil
​
​

9

Hasil Speedtest Client
(Terbukti terbatasi 1M Down /
512k Up)

10

Output perintah `/ip hotspot
active print` saat client
terhubung

E. Kesimpulan Praktikum Komparatif (GUI vs CLI)
Bandingkan pengalaman Anda dalam melakukan konfigurasi antara metode GUI (Sesi Pagi) dan
CLI (Sesi Siang). Mana yang lebih efisien untuk eksekusi massal dan mengapa?
Dalam konfigurasi GUI, Administrator Jaringan dapat dengan mudah melakukan konfigurasi
dikarenakan adanya pemetaan yang terstruktur dengan data yang tampil. Pada konfigurasi CLI,
Administrator Jaringan yang ingin melakukan konfigurasi masal akan lebih efisien seperti contoh
pada pembuatan user hotspot.


## Hasil OCR dari Gambar

[OCR dari gambar img-000.ppm]
# 1. Aktifkan DHCP Client pada ether]

/ip dhep-client add interface=etherl disabled=no

# 2. Tambahkan NAT Masquerade

/ip firewall nat add chain=srenat out-interface=etherl action=masquerade
#3. verifikasi Koneksi Gateway

/ip dhep-client print

/ping 8.8.8.8 count=3

[OCR dari gambar img-001.ppm]
# 1. Aktifkan wlanl dan set mode AP-Bridge

/interface wireless set [ find default-name=wlanl ] mode=ap-bridge
ssid=Hotspot-CafeNgopi disabled=no

# 2. Beri IP Address pada wlanl

/ip address add address=192.168.100.1/24 interface=wlan1

# 3. verifikasi IP Address

/ip address print

[OCR dari gambar img-002.ppm]
# 1, Buat IP Pool untuk client Hotspot

/ip pool add name=hs-pool-1 ranges=192.168.100.2-192. 168. 100.254

# 2. Buat Hotspot Profile dengan DNS login.cafengopi.net

/ip hotspot profile add name=hsprofl dns-name=login. cafengopi.net hotspot-
address=192.168.100.1

#3. Buat Server Hotspot pada interface wlanl

/ip hotspot add nameshotspot1 interface=wlanl address-pool=hs-pool-1
profile=hsprofl disabled=no

# 4, verifikasi Server Hotspot

/ip hotspot print

[OCR dari gambar img-003.ppm]
# Buat User Profile 'Profile-VIP’ dengan Rate Limit Upload 512k / Download 1M
/ip hotspot user profile add name=Profile-VIP rate-limit="512k/1M" shared-
users=1

# verifikasi Profile

/ip hotspot user profile print

[OCR dari gambar img-004.ppm]
# Eksekusi perintah massal untuk membuat 5 user VIP sekaligus

/ip hotspot user add name=vip1 password=123 profile=Profile-vIP limit-uptime=2h
/ip hotspot user add name=vip2 password=123 profile=Profile-vIP limit-uptime=2h
/ip hotspot user add name=vip3 password=123 profile=Profile-vIP limit-uptime=2h
/ip hotspot user add name=vip4 password=123 profile=Profile-VvIP limit-uptime=2h
/ip hotspot user add name=vipS password=123 profile=Profile-vIP limit-uptime=2h
# verifikasi daftar user beserta limitasi uptime

/ip hotspot user print

[OCR dari gambar img-005.ppm]
[admin@MikroTik] > ip dhcp-client print

“lags: X - disabled, I - invalid, D - dynamic

# INTERFACE —USE-PEER-DNS ADD-DEFAULT-ROUTE STATUS ADDRESS:

8 ether1 yes yes bound 192.168.4.4/24

[OCR dari gambar img-006.ppm]
bad command name whoami (Line 1 column 1)
[aamin@Reyvien] > /ping 8.8.8.8 count=3
SEQ HOST SIZE TTL TIME STATUS
9 8.8.8.8 56 113 27ns
18.8.8.8 56 113 26ns
28.8.8.8 56 113 29ms
sent=3 received=3 packet-Loss=0% min-rtt=26ms avg-rtt=27ms max-rtt=29ms

[OCR dari gambar img-007.ppm]
Flags: X - disabled, R - running
9 name="wlan1" mtu=1580 12ntu=1600 mac-address=D4:CA:6D:67:43:7F arp=enabled interface-type=Atheros AR92xx
mode=ap-bridge ssid="Hotspot-CafeNgopi_Reyvien" frequency=2412 band=2ghz-b/g channel-width=2emhz
secondary-frequency="" scan-List=defauLt wireless-protocol=any antenna-mode=ant-a vlan-mode=no-tag
vlan-id-1 wds-mode=disabled wds-default-bridge=none wds-ignore-ssid-no bridge-mode=enabled
default-authentication=yes default-forwarding=yes default-ap-tx-Limit=0 default-client-tx-Limit=0
hide-ssid-no security-profile=default compression=no
[admin@Reyvien] > /interface wireless monitor wlan
status: running-ap
channel: 2412/28/4(20d8m)
wireless-protocol: 862.11
noise-floor: -98d8m
registered-clients: 0
avthenticated-clients: 6
current-tx-powers: IMbps:17(17/20) , 2Mbps:17(17/26) ,5.5Mbps:17 (17/20) , 11Mbps:17(17/28) , Mbps:17(17/28) ,
9Mbps:17(17/28) , 12Mbps:17(17/28) ,18Mbps:17(17/26) , 24Mbps:17 (17/28) , 36Mbps:17(17/28) ,
4aMbps 17 (17/28) , 544bps:17(17/28)
notify-external-fdb: no

[OCR dari gambar img-008.ppm]
[admin@Reyvien] > ip address print

Flags: X - disabled, I - invalid, D - dynamic

# ADDRESS NETWORK INTERFACE
0D 192.168.4.4/24  192.168.4.8 ether

1 221,100.31.1/24 -221.108.31.8 ether?

2 192.168.100.1/24 192.168.100.8  wland
[admin@Reyvien] >

[OCR dari gambar img-009.ppm]
Ladmin@Reyvien] > ip hotspot print

Flags: X - disabled, I - invalid, S - HTTPS

# NAME INTERFACE ‘ADDRESS-POOL PROFILE IDLE-TIMEOUT
8 hotspott = wlant hs-pool-6 hsproft sm

[OCR dari gambar img-010.ppm]
[admin@Reyvien] > ip hotspot user profile print

“lags: * - default

© * name="default" idle-timeout=none keepalive-timeout=2m status-autorefresh=4m shared-users=1
add-mac-cookie=yes mac-cookie-timeout=3d address-list="" transparent-proxy=no

1 name="Profile-VIP" idle-timeout-none keepalive-tineout=2m status-autorefresh=1m shared-users=1
add-mac-cookie=yes mac-cookie-timeout=3d rate-Limit="512k/1M" address-List="" transparent-proxy=no

[OCR dari gambar img-011.ppm]
pacming@reyvien} > ip hotspot user add name=vipt limit-uptime=2n prorile=
>rofile-VIP default
[admin@Reyvien] > ip hotspot user add name-vip1 Limit-uptime=2h profile-Profile-VIP password=123
[admin@Reyvien] > ip hotspot user add name-vip2 Limit-uptime=2h profile-Profile-VIP password=123
[admin@Reyvien] > ip hotspot user add name-vip3 Limit-uptime=2h profile-Profile-VIP password=123
[admin@Reyvien] > ip hotspot user add name-vip4 Limit-uptime=2h profile-Profile-VIP password=123
[admin@Reyvien] > ip hotspot user add name-vip5 Limit-uptime=2h profile-Profile-VIP password=123
[admin@Reyvien] > ip hotspot user pr
2ad command name pr (Line 1 column 17)
[admin@Reyvien] > ip hotspot user print
“lags: * - default, X - disabled, D - dynamic
# SERVER NAME ‘ADDRESS. PROFILE UPTIME
© * jj; counters and limits for trial users

default-trial es
1 admin default es
2 vip1 Profile-VIP es
3 vip2 Profile-VIP es
4 vips Profile-VIP es
5 vipg Profile-VIP es
6 _ vips: Profile-VIP es

[OCR dari gambar img-012.ppm]
[admin@Reyvien] > ip hotspot user print where name="vip1"

Flags: * - default, X - disabled, D - dynamic

# SERVER NAME ‘ADDRESS. PROFILE UPTIME

8 vipt Profile-VIP es

[admin@Reyvien] > ip hotspot user print detail where name="vip1"

Flags: * - default, X - disabled, D - dynamic

®  name="vip1" password="123" profile=Profile-VIP Limit-uptime=2h uptime=@s bytes-in=@ bytes-out=0
packets-in=@ packets-out=0

[admin@Reyvien] >

[OCR dari gambar img-013.ppm]
@ UNDUHAN @ UNGGAHAN
Pingms © 268 © 101 @ 136
CS fe) [23
Peer ran Toe ores
<=) Koneksi
beet BAGAIMANAKAH LAYANAN PELANGGAN PT
© PT Telkom Indonesia - TELKOM INDONESIA - INDIBIZ DIBANDINGKAN
OD) pete DENGAN HARAPAN ANDA?
180.242.36.8 1 2 3 4 5
& PT. Telekomunikasi Jauh lebih buruk — Sesuaiharapan —_‘Jauh lebih baik
Indonesia
Palembang
Ganti Server

[OCR dari gambar img-014.ppm]
[admin@Reyvien] > ip hotspot active prui

bad conmand name prui (Line 1 column 19)

[admin@Reyvien] > ip hotspot active print

Flags: R - radius, B - blocked

# USER ADDRESS UPTIME ‘SESSION-TIME-LEFT IDLE-TIMEOUT
98 vip1 192.168.108.254 2m17s 1ns7m43s

[admin@Reyvien] >
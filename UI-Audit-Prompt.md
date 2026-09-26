### CONTEXT

Kamu adalah AI engineer yang bertugas melakukan UI audit menyeluruh dan perbaikan desain pada sebuah web project.
Sebelum melakukan apapun, kamu WAJIB melakukan discovery phase untuk memahami project ini secara mandiri.

**Tujuan utama:**
1. Membuat tampilan UI lebih menarik, modern, dan tidak terlihat generik/kaku — tanpa menghapus identitas visual yang sudah ada.
2. Memperbaiki semua bug UI: tombol tidak responsif, transisi rusak, scroll bermasalah, layout berantakan.
3. Memastikan semua halaman berfungsi dengan benar di semua jalur navigasi.
4. Memastikan UI ringan dan dapat dimuat dengan baik pada perangkat spesifikasi rendah dan smartphone.

**Yang TIDAK boleh dilakukan:**
- Menyentuh file migration, seeder, atau skema database tanpa izin eksplisit.
- Menghapus atau merubah total elemen yang sudah berfungsi baik.
- Membuat ulang halaman dari nol kecuali diminta.

---

### FILES TO CHECK

Lakukan discovery dalam urutan berikut:

**STEP 1 — Identifikasi stack & struktur project:**
- Baca file konfigurasi utama (package.json / composer.json / .env.example)
- Identifikasi framework frontend: apakah menggunakan Tailwind, Bootstrap, CSS custom, atau campuran
- Identifikasi framework backend: Laravel, Next.js, Nuxt, dll.
- Cek apakah ada komponen library: Filament, shadcn, Livewire, Alpine.js, Vue, React, dll.
- Cek apakah ada file CSS/SCSS global (misal: app.css, globals.css, custom.css)
- Identifikasi sistem routing: web.php, routes/index.js, atau sejenisnya

**STEP 2 — Mapping semua halaman & komponen:**
- List semua file view/page (resources/views/, pages/, components/, dll.)
- Identifikasi layout utama dan partial (header, sidebar, footer, navbar)
- Identifikasi komponen yang dipakai berulang (card, table, modal, form, button)
- Catat halaman mana yang memiliki interaksi JavaScript kompleks

**STEP 3 — Identifikasi asset & resource:**
- Cek file CSS yang diload (apakah ada konflik atau duplikasi)
- Cek file JS yang diload (apakah ada yang blocking render)
- Cek apakah ada gambar/icon yang memperlambat load
- Cek apakah ada CDN external yang dipakai

**STEP 4 — Buat DAFTAR AUDIT sebelum mulai coding:**

Buat ringkasan dalam format ini, lalu TUNGGU konfirmasi sebelum lanjut:

```
✅ Discovery selesai:
- Total halaman ditemukan : [N]
- Stack                   : [...]
- Komponen berulang       : [...]
- Area berisiko           : [...]
- Urutan pengerjaan       : [...]

Lanjut ke Fase 1?
```

---

### INSTRUCTIONS

Setelah discovery dikonfirmasi, kerjakan dalam urutan fase berikut.
**Setiap fase selesai → buat laporan singkat → tunggu konfirmasi sebelum lanjut.**

---

#### FASE 1 — GLOBAL FOUNDATION
*Berlaku untuk semua halaman. Kerjakan lebih dulu.*

**1.1 CSS Variables & Konsistensi**
- Pastikan warna, radius, shadow, spacing menggunakan variabel/token yang konsisten
- Jika belum ada sistem token, buat di file CSS global
- Jangan ubah palet warna utama — hanya perbaiki konsistensinya

**1.2 Typography**
- Pastikan font-weight, line-height, dan letter-spacing konsisten di semua heading dan body text
- Cek apakah ada heading yang terlalu besar atau terlalu kecil di mobile

**1.3 Spacing & Layout Rhythm**
- Gunakan spacing yang konsisten (8px grid system jika memungkinkan)
- Hilangkan padding/margin yang tidak konsisten antar halaman

**1.4 Animasi & Transisi Global**
- Tambahkan transition property yang smooth pada semua elemen interaktif (hover, focus, active)
- Default: `transition: all 0.2s ease` atau lebih spesifik per properti
- Jangan gunakan animasi berat atau yang membutuhkan GPU tinggi

---

#### FASE 2 — KOMPONEN INTERAKTIF
*Perbaiki di semua halaman sekaligus.*

**2.1 Tombol (Button)**
- Pastikan semua tombol memiliki: hover state, active state, disabled state, focus outline
- Perbaiki tombol yang tidak ada feedback visual saat diklik
- Pastikan tombol submit/action menampilkan loading state agar tidak diklik dua kali
- Ukuran minimum touch target: 44×44px untuk mobile

**2.2 Form & Input**
- Pastikan semua input memiliki focus state yang jelas
- Perbaiki input yang tampak hilang atau tidak terlihat di mobile
- Validasi error harus tampil dengan jelas dan tidak merusak layout

**2.3 Modal & Dialog**
- Pastikan modal bisa ditutup: tombol close, klik overlay, tombol Escape
- Perbaiki modal yang overflow di layar kecil — harus scrollable di dalam modal
- Backdrop/overlay harus konsisten di semua halaman

**2.4 Tabel & List**
- Tabel harus horizontal scrollable di mobile — bukan broken layout
- Tambahkan hover state pada baris tabel
- Kolom action harus tetap terlihat (sticky column jika diperlukan)

**2.5 Navigasi (Sidebar / Navbar / Menu)**
- Perbaiki menu yang collapse tidak sempurna atau animasinya patah
- Mobile: pastikan menu hamburger berfungsi dan overlay-nya menutup dengan benar
- Active state pada menu item harus terlihat jelas

**2.6 Scroll**
- Hilangkan scroll horizontal yang tidak disengaja — cek overflow pada semua container
- Pastikan halaman panjang bisa di-scroll smooth
- Sticky element (header/sidebar) tidak boleh menutup konten saat scroll

---

#### FASE 3 — HALAMAN PER HALAMAN
*Audit satu per satu berdasarkan daftar dari discovery.*

Untuk setiap halaman:
- a. Cek layout di viewport: mobile (375px), tablet (768px), desktop (1280px)
- b. Identifikasi elemen yang overflow atau berantakan
- c. Cek apakah semua tombol/link punya tujuan yang jelas
- d. Cek apakah ada dead link atau tombol yang tidak melakukan apa-apa
- e. Perbaiki spacing yang terlalu sempit atau terlalu longgar
- f. Jika ada widget/card kosong — pastikan ada empty state yang informatif

Laporkan per halaman sebelum lanjut ke halaman berikutnya.

---

#### FASE 4 — PERFORMA & MOBILE (FINALISASI)
*Kerjakan setelah semua halaman selesai.*

**4.1 Performa Load**
- Pastikan CSS tidak memuat font yang tidak dipakai
- Hindari inline style berulang — pindah ke class
- Gambar yang bisa diganti icon/SVG — sarankan dulu, jangan langsung ganti
- Lazy load untuk konten di bawah fold jika framework mendukung

**4.2 Mobile Responsiveness**
- Viewport meta tag harus ada dan benar: `<meta name="viewport" content="width=device-width, initial-scale=1">`
- Tidak ada elemen yang keluar dari viewport width
- Font size minimal 14px untuk body text di mobile
- Jarak antar tombol minimal 8px agar tidak misclick

**4.3 Low-spec Device Friendly**
- Hindari CSS animation yang terus-menerus (infinite loop) tanpa `prefers-reduced-motion` check
- Jangan gunakan efek berat: `backdrop-filter` pada banyak elemen, banyak `box-shadow` berlapis
- Prioritaskan rendering yang flat dan bersih

---

### CONSTRAINTS

> Wajib dipatuhi — tidak ada pengecualian.

**[DATABASE]**
- DILARANG membuat, mengedit, atau menghapus file migration
- DILARANG mengubah factory, seeder, atau model relationship
- DILARANG mengubah nama kolom atau tabel
- Jika perubahan UI membutuhkan perubahan data/kolom → STOP, laporkan ke user, tunggu instruksi

**[FUNGSI & LOGIC]**
- DILARANG mengubah business logic, kalkulasi, atau alur validasi yang sudah berjalan
- DILARANG mengubah API endpoint atau controller logic
- Hanya boleh mengubah: view/blade/jsx/vue, CSS, dan JavaScript yang berhubungan dengan UI saja

**[PROSES KERJA]**
- Kerjakan satu FASE dalam satu waktu — jangan loncat-loncat
- Setelah setiap FASE selesai, buat laporan singkat: apa yang diubah, apa yang ditemukan
- Jika menemukan bug yang tidak yakin cara memperbaikinya → laporkan dulu, jangan tebak
- Jika ada dua cara perbaikan yang berbeda dampak → tanyakan ke user sebelum memilih

**[STYLE]**
- Pertahankan palet warna utama yang sudah ada
- Pertahankan font family yang sudah dipakai
- JANGAN install library baru tanpa izin — maksimalkan yang sudah ada
- Perubahan harus iteratif, bukan total redesign

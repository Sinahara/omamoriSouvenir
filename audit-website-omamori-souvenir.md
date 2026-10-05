# Audit & Rencana Perbaikan Website Omamori Souvenir

## 1. Ringkasan

Website ini **rapi secara teknis dan tata letak**, dengan alur "Minta Penawaran" yang jelas. Masalahnya ada pada **isi dan kejujuran klaim**, bukan pada desain.

Tiga hal harus beres **sebelum link ini dikirim ke calon klien mana pun**:

| # | Masalah | Tingkat | Perkiraan waktu |
|---|---|---|---|
| P0-1 | Klaim yang tidak benar atau belum terbukti (pengalaman bertahun-tahun, tim, "langsung dari produsen") | Kritis | 45–60 menit |
| P0-2 | Domain pada tag pratinjau (`og:url`, `og:image`) berbeda dari domain asli | Kritis | 30 menit |

perbaikan P1 dan P2 di bawah dikerjakan secukupnya. **Batas waktu total untuk website minggu ini: 2–3 jam untuk P0, sisanya menunggu masukan dari calon pembeli.**

---

## 2. Yang sudah baik (pertahankan)

- Tombol **"Minta Penawaran"** selalu terlihat (menu atas, halaman produk, banner penutup) dan ada tombol WhatsApp mengambang.
- **Formulir bertahap** (Info Perusahaan → Detail Pesanan → Konfirmasi) terasa profesional, dan menjanjikan quotation resmi dalam 1×24 jam.
- **Harga dan minimum order transparan**, termasuk tabel harga bertingkat (contoh: Travel Ultimate Set Rp 185.000 untuk 10–49 set, Rp 170.000 untuk 50–99 set, Rp 155.000 untuk 100+ set). Pembeli korporat menyukai ini.
- **Cara Kerja 3 tahap** sederhana dan mudah dipahami.
- **Dokumen administrasi** (quotation, invoice, kuitansi bermeterai) adalah nilai jual nyata di B2B, selama benar-benar siap.
- Pengakuan bahwa mockup dibuat dengan AI adalah bentuk transparansi yang baik (lihat catatan di P0-2).

---

## 3. Temuan kritis (P0)

### P0-1. Klaim yang tidak benar atau belum terbukti

Prinsipnya: **setiap kalimat di website harus bisa kamu buktikan ke klien yang menanyakannya.** Reputasi adalah satu-satunya moat bisnis ini; satu klaim palsu yang ketahuan merusak semua klaim lain.

| Klaim saat ini | Lokasi | Status | Tindakan |
|---|---|---|---|
| "Pengalaman bertahun-tahun di industri corporate gifting" | Tentang Kami | Tidak benar (bisnis baru) | **Hapus.** Ganti dengan cerita pendiri yang jujur (lihat bagian 6) |
| "Mitra Terpercaya untuk Solusi Corporate Gift Premium" | Tentang Kami (judul) | Belum terbukti | Ganti dengan janji konkret yang bisa dipenuhi |
| "Tim Profesional: dedicated account manager" | Tentang Kami | Tidak benar bila kamu bekerja sendiri | Ganti dengan "ditangani langsung oleh pendiri" |
| Foto orang-orang tersenyum di meja rapat | Tentang Kami | Memberi kesan tim besar | Ganti foto dirimu, sampelmu, atau proses kerjamu |
| "Harga kompetitif langsung dari produsen tanpa perantara" | Tentang Kami | Menyesatkan (kamu vendor/perantara) | Hapus, atau tulis "bekerja sama dengan pemasok dan produsen terpilih" bila itu benar |
| "Logistik terpercaya dengan tracking real-time, pengiriman aman ke seluruh Indonesia" | Tentang Kami | Perlu verifikasi; bertentangan dengan footer yang menyebut Surabaya dan Sidoarjo | Tulis hanya cakupan dan fitur yang benar-benar tersedia |
| "Quality Control ketat di setiap tahap produksi" | Tentang Kami | Tidak spesifik | Ganti dengan langkah nyata, misalnya "setiap pesanan difoto dan dicek sebelum dikirim" (bila itu benar) |
| "Tim kami merespons dalam 1×24 jam" dan "quotation dalam 1×24 jam" | Beranda, Formulir | Hanya jika sanggup dengan waktu yang ada | Pertahankan hanya bila kamu benar-benar bisa menepatinya |
| Jam layanan Senin–Jumat 08.00–17.00, Sabtu 08.00–12.00 | Tentang Kami | Kemungkinan tidak realistis dengan 5–10 jam per minggu | Ganti dengan jam yang benar-benar bisa kamu layani (misalnya balasan WhatsApp 18.00–21.00) |
| "Kualitas premium, material pilihan" | Tentang Kami | Tidak spesifik | Sebut bahan dan spesifikasi nyata per produk |
| "Mockup premium berbasis AI" | Beranda, Tentang Kami | Jujur, tetapi bisa disalahpahami | Tambahkan catatan: mockup adalah ilustrasi, hasil produksi bisa sedikit berbeda dan akan dikonfirmasi lewat sampel atau persetujuan sebelum produksi |

**Kriteria selesai:** setiap klaim yang tersisa bisa kamu jelaskan dan buktikan dalam satu kalimat.

---

### P0-2. Domain pada tag pratinjau

**Temuan:** website berjalan di `omamorisouvenir.my.id`, tetapi `og:url` dan `og:image` menunjuk ke `omamorisouvenir.id`. Gambar pratinjau memakai berkas yang namanya mengindikasikan render 3D.

**Dampak:** saat link dikirim lewat WhatsApp, LinkedIn, atau Facebook, pratinjau bisa tidak muncul atau menampilkan gambar dari domain yang bukan milikmu. WhatsApp adalah saluran utama pendekatanmu.

**Perbaikan (bila memakai Next.js App Router, yang tampak dari metadata halaman):**

```ts
// app/layout.tsx
export const metadata = {
  metadataBase: new URL('https://omamorisouvenir.my.id'),
  title: 'Omamori Souvenir — Corporate Gift & Welcome Kit',
  description: 'Welcome kit karyawan baru dan souvenir korporat untuk perusahaan di Surabaya dan Sidoarjo.',
  openGraph: {
    url: '/',
    images: ['/og-image.png'], // ganti dengan foto sampel nyata, ukuran 1200x630
  },
};
```

**Cara menguji:**

1. Deploy ulang, lalu kirim link ke dirimu sendiri di WhatsApp.
2. WhatsApp menyimpan pratinjau lama; tambahkan `?v=2` pada link untuk memaksa muat ulang.
3. Pastikan gambar muncul dan judulnya benar.

**Kriteria selesai:** pratinjau di WhatsApp menampilkan gambar dan judul yang benar dari domain yang benar.

---

## 4. Perbaikan penting (P1)

### P1-1. Posisi onboarding kit belum terasa

- Judul beranda saat ini ("Solusi Corporate & Events Gift Premium untuk Bisnis Anda") terlalu umum. Onboarding kit baru disebut di anak kalimat.
- Ketiga starter kit bernama Travel, Chase, dan Flowal, tanpa penjelasan untuk siapa dan untuk apa. Travel Ultimate Set bahkan ditujukan bagi karyawan yang sering dinas, bukan karyawan baru.
- **Tindakan:**
  1. Jadikan "Welcome Kit Karyawan Baru" sebagai paket utama di beranda.
  2. Tampilkan isi paket, harga **per karyawan**, dan contoh kartu ucapan selamat datang.
  3. Pindahkan kategori lain (plakat, lanyard, goodie bag) ke posisi pendukung.

### P1-2. Ukuran order masih kecil

Order minimum di katalog saat ini:

| Produk | Harga mulai | Min. order | Nilai order minimum |
|---|---|---|---|
| Flowal Set | Rp 150.000 | 10 set | Rp 1.500.000 |
| Travel Ultimate Set | Rp 185.000 | 10 set | Rp 1.850.000 |
| Chase Set | Rp 125.000 | 10 set | Rp 1.250.000 |
| Tumbler Stainless Steel 500 ml | Rp 45.000 | 12 pcs | Rp 540.000 |
| Tumbler Travel 750 ml | Rp 65.000 | 12 pcs | Rp 780.000 |
| Plakat Akrilik Premium | Rp 85.000 | 5 pcs | Rp 425.000 |
| Plakat Kayu Eksklusif | Rp 120.000 | 5 pcs | Rp 600.000 |
| Lanyard Custom Printing | Rp 12.000 | 50 pcs | Rp 600.000 |
| Hardbox Premium Custom | Rp 35.000 | 25 pcs | Rp 875.000 |
| Goodie Bag Kanvas | Rp 25.000 | 24 pcs | Rp 600.000 |
| Goodie Bag Spunbond | Rp 8.000 | 100 pcs | Rp 800.000 |

**Pelajaran:** biaya waktumu untuk mencari klien, membuat mockup, dan mengurus pengiriman hampir sama untuk order kecil maupun besar. Sebagai **patokan awal** (uji dengan angka nyatamu), kejar order di atas sekitar Rp 5 juta, artinya 30–50 set welcome kit atau lebih. Karena itu, di setiap percakapan dengan HRD tanyakan **jumlah karyawan baru per tahun**.

**Tindakan wajib:** hitung margin tiap produk dengan rumus berikut. Tanpa angka ini, harga di website hanyalah tebakan.

```
Margin kotor = (Harga jual - HPP - ongkir - biaya kustomisasi - biaya mockup/desain) / Harga jual
```

### P1-3. Foto nyata dan bukti

- Beberapa gambar produk (tumbler, plakat, lanyard, hardbox, goodie bag) tampak seperti render atau gambar AI dengan gaya seragam. Pembeli korporat ingin melihat barang sungguhan.
- **Tindakan:** foto setiap sampel fisikmu (tampak depan, detail logo, dalam kemasan), lalu ganti gambar render. Bila ada render yang tetap dipakai, beri label "ilustrasi".
- Belum ada klien, jadi **jangan memasang testimoni atau logo klien palsu**. Gantilah dengan bukti proses: foto sampel, contoh mockup untuk perusahaan fiktif yang diberi label "contoh", dan garansi yang kamu tawarkan.

### P1-4. Informasi yang pasti ditanyakan pembeli

Tambahkan ke halaman produk dan satu halaman FAQ:

- Lead time produksi (berapa hari kerja setelah DP dan persetujuan mockup)
- Persentase DP dan termin pelunasan
- Jumlah revisi mockup yang gratis
- Kebijakan bila barang cacat atau terlambat
- Cakupan pengiriman dan biaya ongkir
- Apakah tersedia sampel fisik sebelum order besar (dan berapa biayanya)

### P1-5. Kredibilitas usaha

- Ganti `omamori@gmail.com` dengan email berdomain sendiri (misalnya `halo@omamorisouvenir.my.id`).
- Cantumkan identitas usaha: bentuk badan usaha, NPWP bila ada, dan alamat atau titik kontak yang jelas. Pembeli korporat memeriksa ini sebelum mendaftarkan vendor.
- Pastikan nomor telepon dan WhatsApp yang tercantum benar-benar aktif dan dijawab.

### P1-6. Janji respons dan jam layanan

Dengan 5–10 jam per minggu, janji "1×24 jam" dan jam kantor penuh berisiko tidak terpenuhi. Pilih salah satu: (a) tetap janji 1×24 jam dan siapkan waktu khusus tiap hari, atau (b) ubah menjadi "maksimal 2 hari kerja". Janji yang bisa dipenuhi lebih baik daripada janji yang indah.

---

## 5. Perbaikan tambahan (P2)

- **Area layanan:** footer hanya menyebut Surabaya dan Sidoarjo. Bila kamu juga melayani Pasuruan, tambahkan, karena di sana jaringanmu kemungkinan paling kuat.
- **Formulir:** contoh isian saat ini "PT. Contoh Indonesia / Budi Santoso / Purchasing Manager". Tambahkan contoh jabatan **HR Manager** dan dua kolom: "jumlah karyawan baru per tahun" dan "target tanggal pemakaian".
- **Lacak Pesanan:** pastikan halaman ini benar-benar berfungsi. Bila belum, sembunyikan dulu daripada menampilkan fitur kosong.
- **Media sosial:** ikon Instagram dan LinkedIn ada di footer. Pastikan akunnya aktif dan berisi minimal beberapa foto sampel; akun kosong merugikan.
- **Google Business Profile:** buat profil usaha untuk Surabaya agar muncul di pencarian lokal (biaya nol).
- **Judul dan deskripsi pencarian:** tulis ulang agar menyebut "welcome kit karyawan baru" dan wilayah layanan, bukan hanya "corporate gift premium".

---

## 6. Draft teks pengganti (isi bagian dalam tanda kurung dengan faktamu)

**Judul beranda**

> Kesan pertama karyawan baru dimulai dari hari pertama.

**Subjudul**

> Kami siapkan welcome kit bermerek perusahaan Anda, lengkap dengan mockup, quotation, dan invoice. Melayani perusahaan di [wilayah yang benar-benar kamu layani].

**Tentang Kami**

> Omamori Souvenir dirintis pada [tahun] di Surabaya oleh [latar belakangmu yang boleh diungkap] yang paham repotnya menyiapkan perlengkapan karyawan baru dan souvenir acara. Kami masih baru, dan itu berarti setiap klien awal ditangani langsung oleh pendirinya, dari konsultasi sampai pengiriman.

**Keunggulan (hanya yang benar)**

1. **Mockup sebelum produksi.** Anda melihat gambaran desain dan menyetujuinya terlebih dulu. Mockup adalah ilustrasi; hasil produksi dikonfirmasi lewat [sampel/persetujuan].
2. **Dokumen lengkap.** Quotation, invoice, dan kuitansi bermeterai [dan faktur pajak bila berlaku] siap untuk administrasi kantor Anda.
3. **Tanpa stok di kantor Anda.** Produksi dimulai setelah DP, jumlah mengikuti kebutuhan.
4. **Ditangani langsung pendiri.** [Waktu respons yang benar-benar bisa kamu penuhi.]

**Contoh FAQ**

| Pertanyaan | Jawaban (isi dengan faktamu) |
|---|---|
| Berapa lama pengerjaan? | [X] hari kerja setelah DP dan persetujuan mockup |
| Berapa DP dan kapan pelunasan? | DP [X]%, pelunasan [kapan] |
| Berapa kali revisi mockup? | [X] kali gratis |
| Bagaimana jika barang cacat atau terlambat? | [kebijakanmu] |
| Bisa minta sampel dulu? | [ya/tidak, biaya] |

**Pesan WhatsApp bawaan pada tombol** (format tautan klik-untuk-chat; sesuaikan nomor):

```
https://wa.me/6285606381770?text=Halo%20Omamori%20Souvenir%2C%20kami%20dari%20%5BNama%20Perusahaan%5D.%20Kami%20ingin%20menanyakan%20welcome%20kit%20untuk%20%5Bjumlah%5D%20karyawan%20baru.%20Mohon%20info%20contoh%20dan%20penawaran.
```

---

## 7. Daftar periksa dan jadwal

| ✔ | Tugas | Prioritas | Waktu |
|---|---|---|---|
| ☐ | Tulis ulang klaim pada tabel P0-1; hapus yang tidak bisa dibuktikan | P0 | 45–60 mnt |
| ☐ | Perbaiki `og:url`/`og:image` dan uji di WhatsApp | P0 | 30 mnt |
| ☐ | Foto sampel fisik; ganti gambar utama dan gambar `og:image` | P1 | 60–90 mnt |
| ☐ | Hitung margin tiap produk | P1 | 60 mnt |
| ☐ | Buat paket "Welcome Kit Karyawan Baru" di beranda | P1 | 60 mnt |
| ☐ | Tambah lead time, DP, revisi, kebijakan di halaman FAQ | P1 | 45 mnt |
| ☐ | Email berdomain dan identitas usaha | P1 | 30–60 mnt |
| ☐ | Pasang tombol WhatsApp dengan pesan bawaan | P1 | 15 mnt |
| ☐ | Poin P2 (Pasuruan, kolom formulir, Google Business Profile, dsb.) | P2 | Setelah ada masukan klien |

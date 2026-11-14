## 2026-11-14 · Palet tiga warna

- Ganti skema warna dengan pola 60-30-10: warna utama `#f5f7fa` untuk latar, warna kedua biru `#1f4e8c` untuk bilah navigasi, judul, kartu, dan label, serta aksen kunyit `#f2b705` untuk tombol utama, penanda menu aktif, dan sorotan. Mode gelap memakai pasangan `#0c1420`, `#16273f`, dan `#f5c431`.
- Teks, garis tepi, teks redup, dan efek hover diambil dari gradasi ketiga warna itu. Merah hanya dipakai untuk pesan galat dan peringatan.
- Tautan di mode terang memakai biru warna kedua karena kunyit tidak cukup kontras untuk teks; di mode gelap tautan memakai kunyit. Tombol kunyit diberi tepi kunyit tua di mode terang.
- Status selesai, label, tag NER, cip laboratorium, dan batang grafik tidak lagi memakai hijau, ungu, atau oranye. Token kategori `--cat-*` yang tidak terpakai dihapus.
- Semua visualisasi D3 membaca warna dari `assets/js/palette.js`, yang mengambil token `--viz-*` di `main.css`. Kategori dibedakan dengan gradasi biru, kunyit, dan abu kebiruan; Word Embeddings juga memakai bentuk penanda untuk delapan kategorinya. Teks di atas sel berwarna memilih putih atau gelap berdasarkan kontras.
- Penjelasan yang menyebut nama warna diperbarui (misalnya "garis kunyit = bobot negatif"), dan pewarnaan peta di Teknik Pemecahan memakai Biru, Kunyit, dan Abu-abu.
- Gambar mini mata kuliah, favicon, ikon aplikasi, gambar pratinjau berbagi, dan `theme_color` manifest mengikuti palet baru.
- Perbaiki label kalimat RNN yang tampil hitam di mode gelap karena merujuk warna yang tidak ada.

## 2026-11-13 — Diagram Transformer

- Bingkai diagram Encoder dan Decoder dipangkas ke isi gambar, dan kotak Encoder pada diagram Decoder didekatkan ke Cross-Attention. Label naik dari sekitar 7 px menjadi 11 sampai 12,5 px di desktop.

## 2026-11-12 — Pengalaman belajar dan keseragaman

- Seragamkan bahasa: label minggu di navbar diambil dari katalog dan ditulis "Minggu", deskripsi mata kuliah di beranda berbahasa Indonesia.
- Tampilkan progres: "x dari y topik selesai" di beranda, daftar topik, dan Trek Belajar; tanda selesai pada setiap topik. Pilihan profil Trek Belajar diingat di peramban.
- Beranda: kotak pencarian yang membuka Trek Belajar, jumlah topik per mata kuliah, dan kartu Lanjutkan belajar ke topik terakhir yang dibuka.
- Daftar topik menampilkan satu kalimat; sisa deskripsi dibuka lewat Selengkapnya.
- Uji Pemahaman menjadi empat soal: dua benar atau salah dan dua pilihan ganda (78 soal baru di `scripts/quizzes.py`, posisi jawaban diacak secara tetap).
- Tombol dan isian memakai huruf situs; kontrol bawaan mengikuti tema.
- Rumus pada panduan ditulis dengan indeks dan pangkat (`$h_t$`, `e^(−z)`).
- Mode offline juga menyimpan halaman pasangan, daftar topik, Trek Belajar, dan beranda; halaman yang belum disimpan menampilkan penjelasan.
- Target sentuh: tautan kembali, kotak centang, pilihan kuis, dan tautan urutan minimal 24 px.

## 2026-11-12 — Konsistensi tata letak

- Perbaiki tab Non-Max Suppression dan IoU pada Deteksi Objek: diagram kembali berukuran penuh dan kontrolnya punya baris sendiri.
- Tambahkan footer ke semua halaman (laboratorium, topik Pengantar ML, topik pengayaan, dan Trek Belajar) lewat `scripts/site_parts.py`.
- Samakan lima topik pengayaan dengan topik lain: kepala halaman, tata letak dua kolom, dan diagram yang mengikuti kontrol (sebaran ambang, kurva loss, skor chunk, potongan token, sorotan LCS).
- Perbaiki deskripsi mesin pencari kelima topik itu; skrip SEO tidak lagi mengambil teks `<noscript>`.
- Angka dan rumus pada tabel laboratorium tidak lagi terpenggal di ponsel; tabel lebar bergulir di dalam kotaknya dengan petunjuk geser.
- Simpan ikon halaman pada mode offline dan beri nama unik pada wilayah gulir.

## 2026-09-27 — Deskripsi topik dan narasi situs

- Tambahkan empat kalimat deskripsi untuk setiap topik pada daftar mata kuliah, trek, dan pencarian: cakupan, materi, kegiatan, dan capaian belajar.
- Satukan latar belakang KupasAI dalam sembilan kalimat pada bagian Kenapa Visualisasi Interaktif, dengan rujukan VisuAlgo, Python Tutor, dan TensorFlow Playground serta konteks pengajaran S1 Informatika UPH.
- Hapus pengantar berulang di beranda dan perbarui dua baris teks pembukanya.

## 2026-09-26 — Pemisahan ruang belajar

- Pisahkan 39 halaman visualisasi dari laboratorium pendamping bertab.
- Ubah daftar topik menjadi judul, minggu RPS, estimasi durasi, dan dua tombol.
- Pindahkan Mulai Belajar dari beranda ke Trek Belajar untuk Mahasiswa, Pemula, dan Praktisi.
- Pertahankan catatan dan progres lama; batasi ukuran catatan secara vertikal.
- Perluas pengujian menjadi 86 halaman, termasuk navigasi lab, trek, dan migrasi catatan.

# Perubahan

## 2026-09-26

- Memperbaiki geometri preset IoU dengan lebar/tinggi independen, keterangan ambang lokalisasi, NMS per kelas, dan contoh matching satu-ke-satu.
- Memperbaiki pembilang Bayes, narasi ACO, parsing token khusus NER, definisi entity F1, dan interpretasi early stopping. Menghapus klaim koreksi buku dan skor NER yang tidak terverifikasi.
- Menambahkan confusion matrix churn pada 101 threshold dari pelatihan ulang, biaya FP/FN, variasi skala/seed clustering, perbandingan kedalaman pohon, dan evaluasi huruf sintetis terpisah.
- Menambahkan lima laboratorium serta eksperimen pendamping pada materi sebelumnya: gradien numerik, kernel/stride/padding, attention mask, recurrent gradient, likelihood, constraint, dan contoh tandingan metrik.
- Menambahkan pencarian, jalur mulai belajar, tautan sebelumnya/berikutnya, 78 latihan, progres, cadangan catatan, tautan parameter, dan penyimpanan offline per halaman.
- Memperbaiki navigasi keyboard SVG, nama komponen Transformer, kontrol 320 piksel, dan pemulihan keadaan saat berganti tema.
- Menambahkan pratinjau berbagi unik per topik, structured data LearningResource, lisensi kode MIT dan keterangan sumber pihak ketiga.
- Memperluas pengujian numerik, DOM, Playwright, dan bukti aksesibilitas.

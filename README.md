# KupasAI

Platform visualisasi interaktif untuk mata kuliah CS/AI dalam Bahasa Indonesia.

Dari "kupas" (bongkar, jelaskan tuntas) + AI. Tujuan: membongkar konsep AI menjadi visualisasi yang benar-benar interaktif, bukan sekadar menampilkan gambar diam.

## Tech Stack

- **D3.js** untuk semua visualisasi berbasis data (attention matrix, embedding space, tokenisasi, decision boundary, dsb.)
- Static site, dihosting gratis di GitHub Pages
- 100% Bahasa Indonesia, dengan dark mode otomatis (mengikuti preferensi sistem, bisa di-toggle manual)

## Struktur Project

```
kupasai/
├── index.html                  # Landing page
├── favicon.ico, site.webmanifest
├── assets/
│   ├── css/
│   │   └── main.css            # Shared styles + dark mode tokens
│   ├── img/                    # Thumbnails, favicon
│   └── js/
│       ├── main.js             # Shared utilities (nav highlighting)
│       └── theme.js            # Dark/light toggle
├── tentang/                     # Halaman statis "Tentang"
├── kontak/                      # Halaman statis "Kontak"
├── nlp/                         # Mata kuliah Pemrosesan Bahasa Alami
│   ├── index.html               # Daftar topik NLP
│   ├── word-embeddings/
│   ├── rnn/
│   ├── autograd/                 # Tensor & Autograd (Week 3)
│   ├── lstm-attention/           # LSTM, GRU & Classical Attention (Week 4)
│   ├── self-attention/
│   ├── transformer/
│   ├── text-classification/
│   ├── ner/                      # Named Entity Recognition (Week 9)
│   ├── summarization/            # Text Summarization (Week 10)
│   └── question-answering/       # Question Answering (Week 11)
│       ├── index.html           # Halaman visualisasi (tab-based, ARIA tablist)
│       ├── style.css            # Styles khusus visualisasi ini
│       ├── data.js              # Data pre-computed (dari generate_*.py, atau ditulis langsung untuk contoh toy/ilustratif)
│       ├── generate_*.py        # Skrip Python yang menghasilkan data.js (bila memakai dataset nyata)
│       └── viz.js              # Logika visualisasi D3.js
├── ml/                          # Mata kuliah Pengantar Machine Learning
│   ├── index.html                # Daftar topik ML
│   ├── pandas/
│   ├── linear-regression/
│   ├── logistic-regression/
│   ├── decision-tree/
│   ├── random-forest/
│   ├── naive-bayes/
│   ├── churn-prediction/         # Studi kasus: ABC Telekom (Logistic Regression vs Random Forest)
│   ├── clustering/                # Studi kasus: jadwal penerbangan (K-Means, Elbow Method)
│   └── market-basket/             # Studi kasus: transaksi kedai kopi (Apriori, mlxtend)
├── ml-lanjut/                   # Mata kuliah Pemelajaran Mesin Lanjut
│   ├── index.html                # Daftar topik ML Lanjut
│   ├── forward-propagation/      # Week 2
│   ├── gradient-descent/         # Week 3
│   ├── generalizing-gd/          # Week 4
│   ├── streetlight-backprop/     # Studi kasus: Streetlight Problem (Week 5)
│   ├── nonlinearity-activation/  # Non-linearitas & fungsi aktivasi (Week 6, 10)
│   ├── backprop-visualizer/      # Visualisasi backprop langkah-demi-langkah (Week 7)
│   ├── regularization/           # Regularisasi: sinyal vs noise (Week 9)
│   ├── cnn-basics/                # CNN dasar: konvolusi & pooling (Week 11)
│   └── object-detection/          # IoU, NMS & YOLO (Week 11)
└── kecerdasan-komputasional/    # Mata kuliah Kecerdasan Komputasional
    ├── index.html                 # Daftar topik Kecerdasan Komputasional
    ├── pemodelan-pencarian/       # Modul 1: Ruang keadaan & algoritma pencarian (Week 2-3)
    ├── teknik-pemecahan/          # Modul 2: Teknik pemecahan permasalahan (Week 4)
    ├── penalaran-ketidakpastian/  # Modul 3: Penalaran ketidakpastian & kesamaan dokumen (Week 5-6)
    ├── jaringan-syaraf-tiruan/    # Modul 4: Jaringan saraf tiruan (Week 9-10)
    ├── algoritma-genetika/        # Modul 5: Algoritma genetika (Week 11)
    └── kecerdasan-kawanan-fuzzy/  # Modul 6: Kecerdasan kawanan & sistem fuzzy (Week 12-14)
```

## Visualisasi yang Tersedia

### NLP

| Minggu RPS | Visualisasi | Status |
|---|---|---|
| Week 1 | Word Embeddings & Vector Space | Tersedia |
| Week 2 | RNN Forward Pass / Backpropagation | Tersedia |
| Week 3 | Tensor & Autograd | Tersedia |
| Week 4 | LSTM, GRU & Classical Attention | Tersedia |
| Week 5-6 | Self-Attention Mechanism | Tersedia |
| Week 6 | Transformer Architecture | Tersedia |
| Week 7 | Text Classification Pipeline | Tersedia |
| Week 9 | Named Entity Recognition | Tersedia |
| Week 10 | Text Summarization | Tersedia |
| Week 11 | Question Answering | Tersedia |

### ML

| Minggu RPS | Visualisasi | Status |
|---|---|---|
| Week 2 | Pengenalan Pandas | Tersedia |
| Week 3 | Linear Regression | Tersedia |
| Week 4 | Logistic Regression | Tersedia |
| Week 5 | Decision Tree | Tersedia |
| Week 6 | Random Forest | Tersedia |
| Week 7 | Na&iuml;ve Bayes | Tersedia |
| Week 9 | Studi Kasus: Churn Prediction | Tersedia |
| Week 10 | Clustering (K-Means) | Tersedia |
| Week 11 | Market Basket Analysis | Tersedia |

### ML Lanjut

| Minggu RPS | Visualisasi | Status |
|---|---|---|
| Week 2 | Forward Propagation | Tersedia |
| Week 3 | Gradient Descent | Tersedia |
| Week 4 | Generalizing Gradient Descent | Tersedia |
| Week 5 | Studi Kasus: Streetlight Problem | Tersedia |
| Week 6, 10 | Non-Linearitas &amp; Fungsi Aktivasi | Tersedia |
| Week 7 | Visualisasi Backpropagation Langkah-demi-Langkah | Tersedia |
| Week 9 | Regularisasi: Sinyal vs Noise | Tersedia |
| Week 11 | CNN Dasar: Konvolusi &amp; Pooling | Tersedia |
| Week 11 | Deteksi Objek: IoU, NMS &amp; YOLO | Tersedia |

### Kecerdasan Komputasional

| Minggu RPS | Visualisasi | Status |
|---|---|---|
| Week 2-3 | Pemodelan Ruang Keadaan dan Algoritma Pencarian | Tersedia |
| Week 4 | Teknik Pemecahan Permasalahan | Tersedia |
| Week 5-6 | Penalaran Ketidakpastian dan Kesamaan Dokumen | Tersedia |
| Week 9-10 | Jaringan Syaraf Tiruan | Tersedia |
| Week 11 | Algoritma Genetika | Tersedia |
| Week 12-14 | Kecerdasan Kawanan dan Sistem Fuzzy | Tersedia |

## Pengembangan

Kesepuluh visualisasi NLP, sembilan visualisasi ML, sembilan visualisasi ML Lanjut, dan enam visualisasi Kecerdasan Komputasional sudah lengkap. Tech stack final: D3.js saja. Tidak ganti framework.

Data numerik dibuat ulang menggunakan skrip Python. Jalankan `python scripts/regenerate.py` dari akar repositori setelah memasang `requirements.txt`. Dataset ML dikunci pada commit `41db3dc8c328eab6e7fa5f5604194ab5e49c4d05` repositori [dasar-machine-learning](https://github.com/FeliksMakarios/dasar-machine-learning/tree/41db3dc8c328eab6e7fa5f5604194ab5e49c4d05). Variabel `DASAR_ML_DIR` dapat menunjuk salinan lokal commit tersebut.

Sembilan topik ML Lanjut dibuat oleh `scripts/generate_advanced.py`, berdasarkan masukan di `scripts/advanced_inputs.json`. Eksperimen regularisasi memakai dataset digits, pembagian data tetap, arsitektur sama, dan tiga benih. Hasilnya merupakan eksperimen pendamping, bukan keluaran notebook asli yang belum tersedia di repositori. Tata letak diagram, skor ilustratif, dan metadata pembelajaran dibedakan dari hasil pelatihan pada panduan setiap topik.

Jalankan `python scripts/build_lessons.py` untuk memperbarui panduan 34 topik. Rujukan buku yang belum memiliki judul, edisi, dan halaman terverifikasi tidak diperlakukan sebagai bukti salah cetak. Kode komputasional merupakan implementasi pengajaran mandiri. Demo pembelajaran kompetitif tidak dilabeli sebagai LVQ tersupervisi.

## Pemeriksaan

1. Pasang Python 3.11 atau lebih baru dan `pip install -r requirements.txt`.
2. Jalankan `python -m unittest discover -s tests` untuk pemeriksaan numerik dan struktur situs.
3. Pasang dependensi peramban dengan `npm ci` dan `npx playwright install --with-deps chromium`.
4. Jalankan `npm test` untuk menguji seluruh halaman, tab, tema, dan tampilan ponsel.

GitHub Actions menjalankan pemeriksaan tersebut untuk setiap pull request. Situs tetap berupa HTML, CSS, dan D3 tanpa proses kompilasi aplikasi.

Navigasi situs hanya berisi **Tentang** dan **Kontak** (statis, dua bahasa untuk judul mata kuliah di beranda: Indonesia + Inggris dalam kurung). Kartu mata kuliah di beranda ditampilkan grid 2 kolom (`.course-grid` di `main.css`). Setiap halaman visualisasi punya link "Kembali ke Daftar Topik" yang mengarah ke `index.html` mata kuliahnya masing-masing.

## Lisensi

MIT

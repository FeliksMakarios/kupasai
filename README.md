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
    ├── jaringan-syaraf-tiruan/    # Modul 4: Jaringan syaraf tiruan (Week 9-10)
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

Data untuk visualisasi yang memakai model matematis (mis. `self-attention`, atau seluruh topik ML/ML Lanjut/Kecerdasan Komputasional) di-generate dari skrip Python, bukan ditulis manual — jalankan ulang kalau perlu mengubah bobot, dataset, atau contoh, jangan edit `data.js` langsung. Skrip ML membaca dataset asli dari [repo mata kuliah `dasar-machine-learning`](https://github.com/FeliksMakarios/dasar-machine-learning) di GitHub (bisa dioverride ke path lokal lewat env var `DASAR_ML_DIR`). Skrip ML Lanjut mereproduksi angka dari notebook kuliah (PML Mod1-11) secara langsung dengan NumPy/scikit-learn — beberapa visualisasi (mis. `regularization`, `nonlinearity-activation`) memakai dataset nyata setara pengganti (`sklearn.datasets.load_digits`) karena notebook asli memakai `keras.datasets.mnist` yang butuh koneksi internet saat build. Skrip Kecerdasan Komputasional mereimplementasikan seluruh algoritma (BFS/DFS, AND-OR graph, Bayes, faktor kepastian, Dempster-Shafer, VSM, backpropagation, LVQ, SOM, algoritma genetika, ACO, ABC, sistem fuzzy) secara independen dari nol berdasarkan enam Modul Lab Mandiri (INF20052) dan notebook pendampingnya, lalu memverifikasi setiap angka terhadap kriteria assert pada notebook tersebut — bukan menyalin nilai dari buku rujukan.

Navigasi situs hanya berisi **Tentang** dan **Kontak** (statis, dua bahasa untuk judul mata kuliah di beranda: Indonesia + Inggris dalam kurung). Kartu mata kuliah di beranda ditampilkan grid 2 kolom (`.course-grid` di `main.css`). Setiap halaman visualisasi punya link "Kembali ke Daftar Topik" yang mengarah ke `index.html` mata kuliahnya masing-masing.

## Lisensi

MIT

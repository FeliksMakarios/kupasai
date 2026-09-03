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
├── nlp/                         # Mata kuliah Pemrosesan Bahasa Alami
│   ├── index.html               # Daftar topik NLP
│   ├── word-embeddings/
│   ├── rnn/
│   ├── self-attention/
│   ├── transformer/
│   └── text-classification/
│       ├── index.html           # Halaman visualisasi (tab-based, ARIA tablist)
│       ├── style.css            # Styles khusus visualisasi ini
│       ├── data.js              # Data pre-computed (dari generate_*.py)
│       ├── generate_*.py        # Skrip Python yang menghasilkan data.js
│       └── viz.js              # Logika visualisasi D3.js
└── ml/                          # Mata kuliah Pengantar Machine Learning
    ├── index.html                # Daftar topik ML
    ├── pandas/
    ├── linear-regression/
    ├── logistic-regression/
    ├── decision-tree/
    ├── random-forest/
    ├── naive-bayes/
    ├── churn-prediction/         # Studi kasus: ABC Telekom (Logistic Regression vs Random Forest)
    ├── clustering/                # Studi kasus: jadwal penerbangan (K-Means, Elbow Method)
    └── market-basket/             # Studi kasus: transaksi kedai kopi (Apriori, mlxtend)
```

## Visualisasi yang Tersedia

### NLP

| Minggu RPS | Visualisasi | Status |
|---|---|---|
| Week 1 | Word Embeddings & Vector Space | Tersedia |
| Week 2-4 | RNN Forward Pass / Backpropagation | Tersedia |
| Week 5-6 | Self-Attention Mechanism | Tersedia |
| Week 6 | Transformer Architecture | Tersedia |
| Week 7 | Text Classification Pipeline | Tersedia |

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

## Pengembangan

Kelima visualisasi NLP dan sembilan visualisasi ML sudah lengkap. Tech stack final: D3.js saja. Tidak ganti framework.

Data untuk visualisasi yang memakai model matematis (mis. `self-attention`, atau seluruh topik ML) di-generate dari skrip Python (`generate_*.py`) di masing-masing folder, bukan ditulis manual — jalankan skripnya lagi kalau perlu mengubah bobot, dataset, atau contoh kalimat, jangan edit `data.js` langsung. Skrip ML membaca dataset asli dari [repo mata kuliah `dasar-machine-learning`](https://github.com/FeliksMakarios/dasar-machine-learning) di GitHub (bisa dioverride ke path lokal lewat env var `DASAR_ML_DIR`).

## Lisensi

MIT

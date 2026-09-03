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
└── ml/                          # (future) Pengantar Machine Learning
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

Belum dimulai — lihat halaman `/ml/` untuk status placeholder saat ini.

## Pengembangan

Kelima visualisasi NLP sudah lengkap. Tech stack final: D3.js saja. Tidak ganti framework.

Data untuk visualisasi yang memakai model matematis (mis. `self-attention`) di-generate dari skrip Python (`generate_*.py`) di masing-masing folder, bukan ditulis manual — jalankan skripnya lagi kalau perlu mengubah bobot atau contoh kalimat, jangan edit `data.js` langsung.

## Lisensi

MIT

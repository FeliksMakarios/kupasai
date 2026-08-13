# KupasAI

Platform visualisasi interaktif untuk mata kuliah CS/AI dalam Bahasa Indonesia.

Dari "kupas" (bongkar, jelaskan tuntas) + AI. Tujuan: membongkar konsep AI menjadi visualisasi yang benar-benar interaktif, bukan sekadar menampilkan gambar diam.

## Tech Stack

- **D3.js** untuk visualisasi berbasis data (attention matrix, embedding space, tokenisasi)
- **p5.js** untuk visualisasi berbasis proses (algoritma step-by-step, training animation)
- Static site, dihosting gratis di GitHub Pages
- 100% Bahasa Indonesia

## Struktur Project

```
kupasai/
├── index.html                  # Landing page
├── assets/
│   ├── css/
│   │   └── main.css            # Shared styles
│   └── js/
│       └── main.js             # Shared utilities
├── nlp/                         # Mata kuliah Pemrosesan Bahasa Alami
│   └── word-embeddings/
│       ├── index.html           # Halaman visualisasi
│       ├── style.css            # Styles khusus visualisasi ini
│       ├── data.js              # Data embedding kata Bahasa Indonesia
│       └── viz.js              # Logika visualisasi D3.js
└── ml/                          # (future) Pengantar Machine Learning
```

## Visualisasi yang Tersedia

### NLP

| Minggu RPS | Visualisasi | Status |
|---|---|---|
| Week 1 | Word Embeddings & Vector Space | Dalam pengembangan |
| Week 2 | Recurrent Layers (RNN) | Belum mulai |
| Week 5-6 | Transformer Attention | Belum mulai |

## Pengembangan

Project ini mencicil dari satu visualisasi. Tech stack final: D3.js + p5.js. Tidak ganti framework.

## Lisensi

MIT

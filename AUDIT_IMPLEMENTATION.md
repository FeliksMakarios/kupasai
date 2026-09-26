# Implementasi audit KupasAI

## Temuan utama

| Temuan | Implementasi |
|---|---|
| A01 Preset IoU berubah bentuk/terpotong | Offset diperluas, skala lebar/tinggi terpisah, tanpa pembulatan preset; DOM diuji terhadap 0.829/0.354/0.000 |
| A02 Pembilang Bayes tidak konsisten | Pembilang ketiga 0.18 dan normalisasi 0.58; eksperimen Bayes biner terpisah |
| A03 Token `<s>` NER hilang | Node teks literal, tanpa interpolasi HTML token |
| A04 ACO salah menjelaskan angka dan waktu | 90% teramati untuk seed contoh; peluang awal 0.8 dibedakan; pembaruan iterasi/deposit 1/L dijelaskan |
| A05 Churn tidak memiliki confusion matrix | Pelatihan ulang dari commit dataset terkunci; matriks agregat 101 threshold, biaya FP/FN, tanpa baris pelanggan |
| A06 Entity F1 vs tag token | Narasi tipe/span, token accuracy, mode strict/permisif, tombol tag native dan fokus dipulihkan |
| A07 Keadaan hilang saat tema berubah | Aktivasi keyboard ikut recorder; adapter eksplisit untuk NER/Transformer/dropout; mask deterministik; regression test browser |
| A08 Kontrol SVG sulit diakses | Nama komponen Transformer, satu titik tab per SVG dan tombol panah, fokus terlihat, diagram dapat digeser |
| A09 Klaim sumber tidak terbukti | Klaim salah cetak dihapus, skor NER tanpa metadata dihapus, asal/batas contoh dicatat per topik |
| A10 Validasi disamakan generalisasi | Narasi checkpoint diperbaiki; tiga seed beserta rata-rata dan SD ditampilkan tanpa pemenang universal |

## Penambahan

39 topik, 78 pertanyaan berpenjelasan, lima laboratorium baru, dan eksperimen pendamping. Jalur pemula/praktisi/RPS, pencarian, navigasi urutan, catatan dan progres lokal, cadangan, deep link kontrol, reset, penyimpanan offline, pratinjau unik, dan structured data.

Contoh terlatih tambahan mencakup PPMI/SVD dari korpus mini asli, K-means pada 24 konfigurasi, pohon pada enam kedalaman, churn pada 101 threshold, dan evaluasi 200 pola huruf sintetis yang berbeda dari train. Semua tetap contoh pembelajaran, bukan bukti keunggulan umum model.

## Batas yang harus dipertahankan

- Edisi/halaman buku serta checkpoint dan keluaran notebook lama yang tidak tersedia tidak direka ulang. Registri mencatat rujukan konsep, bukan mengklaim asal semua angka dari rujukan itu.
- Tidak mengganti situs dengan framework atau layanan model. Tokenizer menyediakan WordPiece, BPE karakter, dan unigram dengan kosakata/merge mini; RAG memakai retrieval leksikal dan kutipan. Tidak ada klaim bahwa ini implementasi lengkap tokenizer pretrained, neural reranker, atau LLM.
- Tautan parameter mencakup tab dan kontrol HTML bernama. Keadaan lain dipertahankan selama pergantian tema sejauh diuji, tetapi belum diserialisasi ke URL.
- Adapter keadaan eksplisit baru diterapkan pada modul yang paling rentan. Modul lainnya masih memakai mekanisme kompatibilitas replay; ini pilihan migrasi bertahap, bukan klaim seluruh renderer telah ditulis ulang.
- Pengujian browser otomatis memeriksa seluruh halaman dan tab. Axe mencakup empat halaman representatif; pemeriksaan manual semua pembaca layar, semua kombinasi zoom, serta pengukuran Lighthouse lapangan belum dilakukan.
- Cakupan laboratorium dibatasi pada contoh pedagogis yang dapat diperiksa: forest mini menggunakan bootstrap dan kandidat fitur per node; graf pencarian memakai tiga simpul berbobot yang dapat diedit; RAG memakai retrieval leksikal. Ketiganya tidak diklaim sebagai sistem produksi atau benchmark neural.

## Pengujian

Jalankan `python -m unittest discover -s tests`, `npm run test:learning`, dan `npm test`. CI harus lulus pada commit yang akan digabung. Lihat artifact `browser-review` untuk tangkapan layar dan `accessibility.json`.

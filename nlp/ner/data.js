// Data untuk KupasAI NLP Week 9 - Multilingual Named Entity Recognition
// Contoh kalimat dan skema IOB2 persis dari Modul 9.1 ("Jeff Dean is a computer
// scientist at Google in California"). Contoh evaluasi level-entitas (seqeval)
// persis dari Modul 9.7 - dihitung ulang di JS dengan algoritma span-matching
// yang sama dengan seqeval (hasil diverifikasi cocok: precision=recall=f1=0.5).

const NER_DATA = {
  example: {
    tokens: ['Jeff', 'Dean', 'is', 'a', 'computer', 'scientist', 'at', 'Google', 'in', 'California'],
    tags: ['B-PER', 'I-PER', 'O', 'O', 'O', 'O', 'O', 'B-ORG', 'O', 'B-LOC'],
  },
  // Contoh ilustratif alur tokenize_and_align_labels() (Modul 9.6). Split subword
  // "Einwohnern" -> ["Einwohner", "n"] persis dari notebook; sisanya kata utuh
  // (tidak dipecah) untuk menjaga contoh tetap ringkas dan mudah diikuti.
  subword_example: {
    words: ['2.000', 'Einwohnern', 'an', 'der', 'Bucht'],
    word_labels: ['O', 'O', 'O', 'O', 'B-LOC'],
    subword_tokens: ['<s>', '▁2.000', '▁Einwohner', 'n', '▁an', '▁der', '▁Bucht', '</s>'],
    subword_word_ids: [null, 0, 1, 1, 2, 3, 4, null],
  },
  // Contoh evaluasi level-entitas persis dari Modul 9.7 (seqeval classification_report).
  // Notebook hanya memberi urutan tag tanpa kalimat aslinya, jadi di sini token
  // ditampilkan sebagai "Token 1, Token 2, ..." apa adanya (bukan kalimat rekaan).
  seqeval_example: {
    true1: ['O', 'O', 'O', 'B-MISC', 'I-MISC', 'I-MISC', 'O'],
    pred1_default: ['O', 'O', 'B-MISC', 'I-MISC', 'I-MISC', 'I-MISC', 'O'],
    true2: ['B-PER', 'I-PER', 'O'],
    pred2_default: ['B-PER', 'I-PER', 'O'],
  },
  // Fakta kuantitatif nyata dari Modul 9.8-9.10 (dilaporkan notebook, bukan hasil eksekusi ulang di sini
  // karena fine-tuning XLM-R butuh GPU/berjam-jam - dilaporkan sebagai kisaran seperti disebutkan notebook)
  facts: {
    f1_de_approx: 0.85,
    num_labels: 7,
    confused_pair: ['B-ORG', 'I-ORG'],
    lang_dist: [
      { lang: 'German (de)', pct: 62.9 },
      { lang: 'French (fr)', pct: 22.9 },
      { lang: 'Italian (it)', pct: 8.4 },
      { lang: 'English (en)', pct: 5.9 },
    ],
  },
};

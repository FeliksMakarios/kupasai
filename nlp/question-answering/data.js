// Data untuk KupasAI NLP Week 11 - Question Answering
// Contoh nyata dari Modul 11: MP3 example (11.2), sliding window (real window texts
// dari notebook), ExtractedAnswer Pliny the Elder & no-answer (real, dari dokumentasi
// Haystack yang dikutip di notebook), tabel F1 SQuAD 2.0, dan contoh RAG nyata.

const QA_DATA = {
  span_example: {
    question: ['How', 'much', 'music', 'can', 'this', 'hold', '?'],
    context: ['An', 'MP3', 'is', 'about', '1', 'MB/minute,', 'so', 'about', '6000', 'hours', 'depending', 'on', 'file', 'size.'],
    // Skor ilustratif (bukan angka asli dari run notebook) yang meniru pola kualitatif
    // yang dideskripsikan notebook: start logit tertinggi di "1" dan "6000", end logit
    // tertinggi di "MB/minute," dan "hours".
    start_scores: [-1.8, -1.5, -1.2, -1.6, -1.9, -1.3, -2.0, -1.0, -0.8, -0.6, 0.4, 3.5, 0.2, -0.3, 0.5, 5.2, 1.1, -0.5, -1.1, -1.4, -1.2, -1.5],
    end_scores: [-1.6, -1.4, -1.3, -1.5, -1.7, -1.2, -1.9, -0.9, -0.7, -0.5, 0.3, 0.6, 3.0, -0.2, 0.4, 1.0, 5.5, -0.6, -1.0, -1.3, -1.1, -1.4],
    default_start_idx: 15,  // "6000" (index within combined question+context array)
    default_end_idx: 16,    // "hours"
  },
  reference_answers: [
    { query: 'Who was Pliny the Elder?', score: 0.8306, answer: 'Roman writer', doc_snippet: 'The Roman writer Pliny the Elder, writing in the first century AD, argued that the Great Pyramid had...' },
    { query: 'Why is there no data?', score: 0.04606, answer: null, note: 'Skor rendah untuk kemungkinan "tidak ada jawaban" - model cukup yakin jawaban di atas benar.' },
  ],
  f1_table: [
    { model: 'MiniLM', params: '66M', f1: 79.5 },
    { model: 'RoBERTa-base', params: '125M', f1: 83.2 },
    { model: 'XLM-RoBERTa-large', params: '570M', f1: 83.8 },
    { model: 'ALBERT-XXL', params: '235M', f1: 88.1 },
  ],
  sliding_window: {
    max_length: 100,
    stride: 25,
    question: 'how is the bass?',
    windows: [
      'i have had koss headphones in the past, pro 4aa and qz - 99. the koss portapro is portable and has great bass response. the work great with my android phone and can be " rolled up " to be carried in my motorcycle jacket or computer bag without getting crunched. they are very light and do not feel heavy or bear down on your ears even after listening to music with them on all day. the sound is',
      'and do not feel heavy or bear down on your ears even after listening to music with them on all day. the sound is night and day better than any ear - bud could be and are almost as good as the pro 4aa. they are " open air " headphones so you cannot match the bass to the sealed types, but it comes close. for $ 32, you cannot go wrong.',
    ],
    overlap_text: 'and do not feel heavy or bear down on your ears even after listening to music with them on all day. the sound is',
  },
  rag_example: {
    question: 'What does the Rhodes Statue look like?',
    answer: 'Based on the context provided, the statue of Helios, known as the Colossus of Rhodes, looks like a colossal bronze statue of the Greek sun-god Helios. According to ancient descriptions, it stood approximately 70 cubits, or 33 meters (108 feet) high. However, it is unclear exactly what the statue looked like due to limited historical documentation.',
  },
  other_questions: [
    'Where is Gardens of Babylon?',
    'Why did people build Great Pyramid of Giza?',
    'Why did people visit the Temple of Artemis?',
    'What happened to the Tomb of Mausolus?',
    'How did Colossus of Rhodes collapse?',
  ],
};

// Data untuk KupasAI NLP Week 10 - Text Summarization
// Output model persis seperti yang tercetak di notebook Modul 10 (artikel kecelakaan
// jembatan Minneapolis, dipotong ke 2.000 karakter agar adil untuk semua model).
// Contoh BLEU/ROUGE persis dari Modul 10 Part II (dihitung ulang & diverifikasi di Python).

const SUM_DATA = {
  models: [
    {
      id: 'baseline', name: 'Baseline (3 kalimat pertama)', type: 'Extractive',
      text: 'MINNEAPOLIS, Minnesota (CNN) -- Drivers who were on the Minneapolis bridge when it collapsed told harrowing tales of survival.\n"The whole bridge from one side of the Mississippi to the other just completely gave way, fell all the way down," survivor Gary Babineau told CNN.\n"I probably had a 30-, 35-foot free fall.',
      note: 'Sekadar mengambil 3 kalimat pertama artikel apa adanya — tidak ada pemahaman, murni ekstraktif.',
    },
    {
      id: 'gpt2', name: 'GPT-2 (TL;DR prompt)', type: 'Abstractive (tanpa fine-tune)',
      text: 'A 10-story building collapsed, killing five people and injuring over 100.\nThere were at least 14 rescue teams on the bridge, and the bridge was closed down, but some of the structures remained intact.\nA helicopter carrying the bodies was lowered to the top of the bridge, and the bridge was closed down as a precaution.\n...\nThe bridge was closed for about 30 minutes.\nThe bridge was closed for about 30 minutes and closed for about 30 minutes.\nThe bridge was reopened after a heavy snowstorm.',
      note: 'GPT-2 tidak pernah di-fine-tune untuk peringkasan — hasilnya berhalusinasi (angka korban dikarang) dan berulang-ulang ("closed for about 30 minutes" terus muncul).',
    },
    {
      id: 't5', name: 'T5 (t5-small)', type: 'Abstractive (multi-task)',
      text: 'driver on bridge says he had 30-, 35-foot free fall.\nhe says his back was injured but determined he could move around.\nhe says he saw dozens of people lying dazed on expansive deck.',
      note: 'Prompt "summarize: <artikel>" — dilatih untuk banyak tugas sekaligus, hasilnya cukup koheren dan benar-benar parafrase.',
    },
    {
      id: 'bart', name: 'BART (facebook/bart-base)', type: 'Abstractive (fine-tuned)',
      text: 'MINNEAPOLIS, Minnesota (CNN) -- Drivers who were on the Minneapolis bridge when it collapsed told harrowing tales of survival.\n"The whole bridge from one side of the Mississippi to the other just completely gave way, fell all the way down," survivor Gary Babineau told CNN.\n"I probably had a 30-, 35-foot free fall.\nAnd there\'s cars in the water, there\'re cars on fire.\nThe whole bridge is down."',
      note: 'Checkpoint dasar (bukan yang di-fine-tune khusus CNN/DailyMail) masih condong menyalin kalimat asli, mirip baseline.',
    },
    {
      id: 'pegasus', name: 'PEGASUS (google/pegasus-cnn_dailymail)', type: 'Abstractive (fine-tuned khusus)',
      text: 'He no – credit may need forwardre gold development then both –co no Court – during take religious us Oct help & U me well only because gold game then both size Hi published go News us match way Court...',
      note: 'Pada run notebook ini outputnya justru rusak/tidak koheren — pengingat bahwa model besar pun bisa gagal pada checkpoint atau kondisi tertentu; jangan percaya kualitatif tanpa evaluasi kuantitatif.',
    },
  ],
  bleu_example: {
    default_candidate: 'saya suka makan nasi',
    default_reference: 'saya senang makan nasi',
  },
  rouge_example: {
    default_candidate: 'Saya senang makan nasi',
    default_reference: 'Saya suka makan nasi',
  },
};

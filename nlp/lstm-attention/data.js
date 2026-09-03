// Data untuk KupasAI NLP Week 4 - Gated Recurrent Models (LSTM/GRU) & Classical Attention
// Formula dan struktur gate persis dari Modul 4 (4.2 LSTM, 4.4 GRU, 4.5 Classical Attention).
// Bobot di bawah ini dipilih kecil dan bersih (bukan dari notebook, yang memakai
// embedding acak berdimensi tinggi tanpa training) agar perilaku gate terlihat jelas
// dan interaktif saat x_t digeser, sambil tetap memakai persis rumus yang sama.

const GATED_DATA = {
  lstm: {
    h_prev: 0.3,
    c_prev: 0.6,
    w: { fx: -1.2, fh: 0.5, bf: 0.8, ix: 1.5, ih: -0.3, bi: -0.2, cx: 0.8, ch: 0.6, bc: 0.0, ox: 0.9, oh: 0.4, bo: 0.1 },
  },
  gru: {
    h_prev: 0.3,
    w: { rx: 1.0, rh: 0.4, zx: -0.8, zh: 0.6, hx: 0.7, hh: 0.5 },
  },
  // Classical (encoder-decoder) attention: 5 hidden state encoder toy "saya suka belajar deep learning"
  attention: {
    words: ['saya', 'suka', 'belajar', 'deep', 'learning'],
    encoder_states: [
      [0.4, 0.2],
      [1.8, 0.2],
      [0.2, 1.8],
      [0.3, 1.7],
      [0.4, 1.6],
    ],
  },
};

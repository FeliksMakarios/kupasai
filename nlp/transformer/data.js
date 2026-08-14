/*
 * KupasAI - Transformer Architecture Visualization Data
 * Static diagram data for NLP Week 6
 *
 * Diagram data: component positions, labels, connections.
 * Not pre-computed numbers, but structural layout info.
 */

var TRANSFORMER_DATA = {
  // Tab 1: Full architecture overview
  full_arch: {
    // Encoder stack (left side)
    encoder: {
      x: 150, y: 40, w: 180, h: 380,
      label: "ENCODER",
      layers: [
        { y: 70,  h: 55, label: "Self-Attention",        color: "#0969da", detail: "Setiap kata melihat semua kata lain di input" },
        { y: 135, h: 30, label: "Add & Norm",             color: "#8250df", detail: "Residual connection + Layer Normalization" },
        { y: 175, h: 55, label: "Feed-Forward Network",   color: "#1a7f37", detail: "Dua lapis linear + aktivasi ReLU" },
        { y: 240, h: 30, label: "Add & Norm",             color: "#8250df", detail: "Residual connection + Layer Normalization" },
      ],
      input: { y: 350, label: "Input Embedding + Positional Encoding" },
      stack_note: "Nx (biasanya 6 layer)",
    },
    // Decoder stack (right side)
    decoder: {
      x: 430, y: 40, w: 180, h: 380,
      label: "DECODER",
      layers: [
        { y: 70,  h: 55, label: "Masked Self-Attention",  color: "#0969da", detail: "Attention dengan mask: tidak boleh melihat kata di masa depan" },
        { y: 135, h: 30, label: "Add & Norm",             color: "#8250df", detail: "Residual connection + Layer Normalization" },
        { y: 175, h: 55, label: "Cross-Attention",        color: "#9a6700", detail: "Query dari decoder, Key & Value dari encoder" },
        { y: 240, h: 30, label: "Add & Norm",             color: "#8250df", detail: "Residual connection + Layer Normalization" },
        { y: 280, h: 45, label: "Feed-Forward Network",   color: "#1a7f37", detail: "Dua lapis linear + aktivasi ReLU" },
        { y: 330, h: 25, label: "Add & Norm",             color: "#8250df", detail: "Residual connection + Layer Normalization" },
      ],
      input: { y: 370, label: "Output Embedding + Positional Encoding" },
      output: { y: 410, label: "Linear + Softmax" },
      stack_note: "Nx (biasanya 6 layer)",
    },
    // Connection between encoder and decoder
    cross_link: {
      from_x: 330, to_x: 430, y: 197,
      label: "K, V dari Encoder",
    },
  },

  // Tab 2: Encoder layer detail (zoomed)
  encoder_detail: {
    steps: [
      {
        title: "Input Embedding + Positional Encoding",
        desc: "Setiap token input dikonversi menjadi vektor embedding. Karena self-attention tidak memiliki urutan, posisi kata disuntikkan melalui positional encoding (sinus/cosinus dengan frekuensi berbeda).",
        formula: "PE(pos, 2i) = sin(pos / 10000^{2i/d})",
      },
      {
        title: "Multi-Head Self-Attention",
        desc: "Input diproyeksikan ke Q, K, V untuk setiap head. Setiap head belajar pola attention berbeda. Output dari semua head digabungkan dan diproyeksikan kembali.",
        formula: "MultiHead(Q,K,V) = Concat(head_1, ..., head_h) W^O",
      },
      {
        title: "Residual Connection + Layer Norm",
        desc: "Output attention ditambahkan ke input asli (residual), lalu dinormalisasi. Ini mencegah vanishing gradient dan menstabilkan training pada jaringan yang dalam.",
        formula: "output = LayerNorm(x + Sublayer(x))",
      },
      {
        title: "Feed-Forward Network",
        desc: "Setiap posisi diproses secara independen melalui dua lapis linear dengan aktivasi ReLU di tengahnya. Dimensi ekspansi biasanya 4x dari dimensi model.",
        formula: "FFN(x) = max(0, xW_1 + b_1) W_2 + b_2",
      },
      {
        title: "Residual Connection + Layer Norm (lagi)",
        desc: "Sama seperti sebelumnya: output FFN ditambahkan ke inputnya, lalu dinormalisasi. Output inilah yang menjadi input untuk encoder layer berikutnya.",
        formula: "output = LayerNorm(x + FFN(x))",
      },
    ],
  },

  // Tab 3: Decoder & Cross-Attention
  decoder_detail: {
    steps: [
      {
        title: "Output Embedding + Positional Encoding",
        desc: "Sama seperti encoder, tapi inputnya adalah token output yang sudah dihasilkan sejauh ini (autoregressive). Saat training, digunakan teacher forcing dengan masking.",
        formula: "y_0, y_1, ..., y_{t-1} -> embeddings",
      },
      {
        title: "Masked Multi-Head Self-Attention",
        desc: "Decoder memperhatikan token output sebelumnya saja. Masking memastikan posisi t tidak bisa melihat posisi t+1 (anti-cheating). Tanpa mask, decoder bisa 'curang' melihat jawaban di masa depan.",
        formula: "Mask: M_{ij} = -inf jika j > i",
      },
      {
        title: "Cross-Attention (Encoder-Decoder Attention)",
        desc: "Ini adalah jembatan antara encoder dan decoder. Query berasal dari decoder, sedangkan Key dan Value berasal dari output encoder. Decoder 'bertanya' ke encoder tentang input.",
        formula: "Attention(Q_dec, K_enc, V_enc)",
      },
      {
        title: "Feed-Forward Network + Add & Norm",
        desc: "Sama seperti encoder: dua lapis linear dengan ReLU, dibungkus residual connection dan layer normalization.",
        formula: "FFN(x) = max(0, xW_1 + b_1) W_2 + b_2",
      },
      {
        title: "Linear + Softmax (Output)",
        desc: "Output decoder terakhir diproyeksikan ke dimensi vocab melalui lapis linear, lalu softmax menghasilkan distribusi probabilitas atas seluruh kosakata. Token dengan probabilitas tertinggi dipilih sebagai output.",
        formula: "P(y_t) = softmax(y W_vocab + b)",
      },
    ],
  },
};

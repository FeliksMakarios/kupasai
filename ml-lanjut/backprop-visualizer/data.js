/*
 * KupasAI - Visualisasi Backpropagation Langkah-demi-Langkah (Modul 7, Week 7)
 * Contoh dari notebook PMLMod7_Practicing_Backpropagation, diverifikasi ulang
 * dengan NumPy: jaringan 3 (input) -> 4 (hidden, ReLU) -> 1 (output, linear).
 * x=[1.0,0.5,-2.0], t=0.8, alpha=0.1.
 */

var BP_DATA = {
  x: [1.0, 0.5, -2.0],
  target: 0.8,
  alpha: 0.1,
  W01_initial: [[0.2, -0.1, 0.4, 0.0], [-0.3, 0.5, -0.2, 1.0], [0.1, 0.2, 0.0, -0.5]],
  W12_initial: [0.0, 0.5, 1.0, -1.0],
  W01_final: [[0.2, -0.1, 0.6, -0.2], [-0.3, 0.5, -0.1, 0.9], [0.1, 0.2, -0.4, -0.1]],
  W12_final: [0.0, 0.5, 1.06, -0.7],
  steps: [
    {
      title: "0. Nilai Awal",
      phase: "setup",
      hidden: [null, null, null, null],
      output: null,
      W01: [[0.2, -0.1, 0.4, 0.0], [-0.3, 0.5, -0.2, 1.0], [0.1, 0.2, 0.0, -0.5]],
      W12: [0.0, 0.5, 1.0, -1.0],
      trace: [
        "Input: x = [1.0, 0.5, &minus;2.0]",
        "Target: t = 0.8, learning rate &alpha; = 0.1",
        "Nilai hidden &amp; output <em>belum ada</em> &mdash; baru muncul saat forward pass dihitung."
      ]
    },
    {
      title: "1. Forward: Pra-aktivasi Hidden (z₁)",
      phase: "forward",
      hidden: [-0.15, -0.25, 0.3, 1.5],
      hiddenSub: "z₁",
      output: null,
      W01: [[0.2, -0.1, 0.4, 0.0], [-0.3, 0.5, -0.2, 1.0], [0.1, 0.2, 0.0, -0.5]],
      W12: [0.0, 0.5, 1.0, -1.0],
      trace: [
        "z₁ = x &middot; W₀&rarr;₁ (dot product per kolom)",
        "Node 3: 0.2&times;1.0 + (&minus;0.3)&times;0.5 + 0.1&times;(&minus;2.0) = <strong>&minus;0.15</strong>",
        "Node 4: (&minus;0.1)&times;1.0 + 0.5&times;0.5 + 0.2&times;(&minus;2.0) = <strong>&minus;0.25</strong>",
        "Node 5: 0.4&times;1.0 + (&minus;0.2)&times;0.5 + 0.0&times;(&minus;2.0) = <strong>0.3</strong>",
        "Node 6: 0.0&times;1.0 + 1.0&times;0.5 + (&minus;0.5)&times;(&minus;2.0) = <strong>1.5</strong>"
      ]
    },
    {
      title: "2. Forward: Aktivasi ReLU (h)",
      phase: "forward",
      hidden: [0, 0, 0.3, 1.5],
      hiddenSub: "h = ReLU(z₁)",
      output: null,
      W01: [[0.2, -0.1, 0.4, 0.0], [-0.3, 0.5, -0.2, 1.0], [0.1, 0.2, 0.0, -0.5]],
      W12: [0.0, 0.5, 1.0, -1.0],
      trace: [
        "h = max(0, z₁)",
        "z₁ = [&minus;0.15, &minus;0.25, 0.3, 1.5] &rarr; h = [<strong>0, 0, 0.3, 1.5</strong>]",
        "Dua node pertama \"mati\" (negatif &rarr; 0), dua node terakhir lolos apa adanya."
      ]
    },
    {
      title: "3. Forward: Output Linear (ŷ)",
      phase: "forward",
      hidden: [0, 0, 0.3, 1.5],
      hiddenSub: "h",
      output: -1.2,
      outputSub: "ŷ",
      W01: [[0.2, -0.1, 0.4, 0.0], [-0.3, 0.5, -0.2, 1.0], [0.1, 0.2, 0.0, -0.5]],
      W12: [0.0, 0.5, 1.0, -1.0],
      trace: [
        "ŷ = h &middot; W₁&rarr;₂",
        "ŷ = (0&times;0.0) + (0&times;0.5) + (0.3&times;1.0) + (1.5&times;&minus;1.0) = 0.3 &minus; 1.5 = <strong>&minus;1.2</strong>"
      ]
    },
    {
      title: "4. Compare: Delta &amp; MSE",
      phase: "compare",
      hidden: [0, 0, 0.3, 1.5],
      hiddenSub: "h",
      output: -1.2,
      outputSub: "ŷ = -1.2",
      W01: [[0.2, -0.1, 0.4, 0.0], [-0.3, 0.5, -0.2, 1.0], [0.1, 0.2, 0.0, -0.5]],
      W12: [0.0, 0.5, 1.0, -1.0],
      trace: [
        "delta_out = ŷ &minus; t = &minus;1.2 &minus; 0.8 = <strong>&minus;2.0</strong>",
        "MSE = delta_out&sup2; = (&minus;2.0)&sup2; = <strong>4.0</strong>",
        "Error sangat besar &mdash; inilah yang harus diperbaiki lewat backward pass."
      ]
    },
    {
      title: "5. Backward: Gradien &amp; Update W₁→₂",
      phase: "backward",
      hidden: [0, 0, 0.3, 1.5],
      hiddenSub: "h",
      output: -1.2,
      outputSub: "ŷ",
      W01: [[0.2, -0.1, 0.4, 0.0], [-0.3, 0.5, -0.2, 1.0], [0.1, 0.2, 0.0, -0.5]],
      W12: [0.0, 0.5, 1.06, -0.7],
      W12highlight: true,
      trace: [
        "&nabla;W₁→₂ = h &times; delta_out = [0,0,0.3,1.5] &times; (&minus;2.0) = [0, 0, &minus;0.6, &minus;3.0]",
        "W'₁→₂ = W₁→₂ &minus; &alpha;&nabla;W₁→₂",
        "= [0.0, 0.5, 1.0, &minus;1.0] &minus; 0.1&times;[0,0,&minus;0.6,&minus;3.0] = [<strong>0.0, 0.5, 1.06, &minus;0.7</strong>]"
      ]
    },
    {
      title: "6. Backward: Delta ke Hidden",
      phase: "backward",
      hidden: [0, 0, -2.0, 2.0],
      hiddenSub: "delta_h",
      output: -1.2,
      outputSub: "ŷ",
      W01: [[0.2, -0.1, 0.4, 0.0], [-0.3, 0.5, -0.2, 1.0], [0.1, 0.2, 0.0, -0.5]],
      W12: [0.0, 0.5, 1.06, -0.7],
      trace: [
        "delta_h (pra-ReLU) = delta_out &times; W₁→₂ = &minus;2.0 &times; [0.0,0.5,1.0,&minus;1.0] = [0, &minus;1.0, &minus;2.0, 2.0]",
        "Kalikan gate ReLU (1 jika z₁&gt;0, else 0): gate = [0,0,1,1]",
        "delta_h = [<strong>0, 0, &minus;2.0, 2.0</strong>] &mdash; hanya node 3 &amp; 4 yang menyalurkan gradien"
      ]
    },
    {
      title: "7. Backward: Gradien &amp; Update W₀→₁",
      phase: "backward",
      hidden: [0, 0, -2.0, 2.0],
      hiddenSub: "delta_h",
      output: -1.2,
      outputSub: "ŷ",
      W01: [[0.2, -0.1, 0.6, -0.2], [-0.3, 0.5, -0.1, 0.9], [0.1, 0.2, -0.4, -0.1]],
      W01highlight: true,
      W12: [0.0, 0.5, 1.06, -0.7],
      trace: [
        "&nabla;W₀→₁ = x<sup>T</sup> &middot; delta_h (outer product) &mdash; hanya kolom 3 &amp; 4 tak nol",
        "Kolom 3: x&times;(&minus;2.0) = [&minus;2.0, &minus;1.0, 4.0] &rarr; kolom baru [0.4,&minus;0.2,0.0] &minus; 0.1&times;[&minus;2,&minus;1,4] = [<strong>0.6, &minus;0.1, &minus;0.4</strong>]",
        "Kolom 4: x&times;(2.0) = [2.0, 1.0, &minus;4.0] &rarr; kolom baru [0.0,1.0,&minus;0.5] &minus; 0.1&times;[2,1,&minus;4] = [<strong>&minus;0.2, 0.9, &minus;0.1</strong>]",
        "Kolom 1 &amp; 2 tidak berubah (gradiennya 0)."
      ]
    },
    {
      title: "8. Verifikasi: Forward Pass Ulang",
      phase: "verify",
      hidden: [0, 0, 1.35, 0.45],
      hiddenSub: "h'",
      output: 1.116,
      outputSub: "ŷ'",
      W01: [[0.2, -0.1, 0.6, -0.2], [-0.3, 0.5, -0.1, 0.9], [0.1, 0.2, -0.4, -0.1]],
      W12: [0.0, 0.5, 1.06, -0.7],
      trace: [
        "Dengan bobot baru: h' = [0, 0, 1.35, 0.45]",
        "ŷ' = (1.35&times;1.06) + (0.45&times;&minus;0.7) = 1.431 &minus; 0.315 = <strong>1.116</strong>",
        "MSE baru = (1.116&minus;0.8)&sup2; &asymp; <strong>0.0999</strong> &mdash; turun drastis dari 4.0 hanya dalam satu update!"
      ]
    }
  ],
  mseHistory: [4.0, 0.0999]
};

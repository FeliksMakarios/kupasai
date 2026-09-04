/*
 * KupasAI - Forward Propagation (Modul 2, Week 2)
 * Semua angka diverifikasi ulang dengan menjalankan kode Python yang identik
 * dengan yang ada di notebook PMLMod2_Forward_Propagation.
 */

var FORWARD_PROP_DATA = {
  scenarios: [
    {
      id: "single",
      label: "Input Tunggal",
      title: "Prediksi dengan Satu Input, Satu Bobot",
      story: "Jaringan paling sederhana: satu angka masuk, dikalikan satu bobot, menghasilkan satu prediksi.",
      layers: [
        { name: "Input", nodes: [{ label: "toes", value: 8.5 }] },
        { name: "Output", nodes: [{ label: "menang?", value: 0.85 }] }
      ],
      weights: [
        // dari layer0 ke layer1: matrix[outIdx][inIdx]
        [[0.1]]
      ],
      trace: [
        "pred = input &times; weight",
        "pred = 8.5 &times; 0.1 = <strong>0.85</strong>"
      ]
    },
    {
      id: "multi_input",
      label: "Banyak Input",
      title: "Prediksi dengan Banyak Input, Satu Output",
      story: "Tiga fitur pertandingan (toes, win-loss ratio, jumlah fans) digabung lewat weighted sum untuk memprediksi menang/kalah.",
      layers: [
        { name: "Input", nodes: [
          { label: "toes", value: 8.5 },
          { label: "wlrec", value: 0.65 },
          { label: "nfans", value: 1.2 }
        ] },
        { name: "Output", nodes: [{ label: "menang?", value: 0.98 }] }
      ],
      weights: [
        [[0.1, 0.2, 0.0]]
      ],
      trace: [
        "pred = w_sum(input, weights)",
        "pred = (8.5&times;0.1) + (0.65&times;0.2) + (1.2&times;0.0)",
        "pred = 0.85 + 0.13 + 0.0 = <strong>0.98</strong>"
      ]
    },
    {
      id: "multi_output",
      label: "Banyak Output",
      title: "Prediksi dengan Satu Input, Banyak Output",
      story: "Satu fitur (win-loss ratio) dipakai untuk memprediksi tiga hal sekaligus: apakah pemain cedera, menang, atau sedih &mdash; lewat elementwise multiply.",
      layers: [
        { name: "Input", nodes: [{ label: "wlrec", value: 0.65 }] },
        { name: "Output", nodes: [
          { label: "hurt?", value: 0.195 },
          { label: "win?", value: 0.13 },
          { label: "sad?", value: 0.585 }
        ] }
      ],
      weights: [
        [[0.3], [0.2], [0.9]]
      ],
      trace: [
        "pred = ele_mul(input, weights)",
        "hurt = 0.65 &times; 0.3 = <strong>0.195</strong>",
        "win&nbsp;&nbsp; = 0.65 &times; 0.2 = <strong>0.13</strong>",
        "sad&nbsp;&nbsp; = 0.65 &times; 0.9 = <strong>0.585</strong>"
      ]
    },
    {
      id: "multi_in_out",
      label: "Banyak Input & Output",
      title: "Prediksi dengan Banyak Input dan Banyak Output",
      story: "Tiga input dan tiga output dihubungkan lewat matriks bobot 3&times;3 menggunakan vect_mat_mul &mdash; setiap output adalah dot product input dengan satu baris matriks.",
      layers: [
        { name: "Input", nodes: [
          { label: "toes", value: 8.5 },
          { label: "wlrec", value: 0.65 },
          { label: "nfans", value: 1.2 }
        ] },
        { name: "Output", nodes: [
          { label: "hurt?", value: 0.555 },
          { label: "win?", value: 0.98 },
          { label: "sad?", value: 0.965 }
        ] }
      ],
      weights: [
        [[0.1, 0.1, -0.3], [0.1, 0.2, 0.0], [0.0, 1.3, 0.1]]
      ],
      trace: [
        "output[i] = w_sum(input, weights[i])",
        "hurt = (8.5&times;0.1)+(0.65&times;0.1)+(1.2&times;-0.3) = <strong>0.555</strong>",
        "win&nbsp;&nbsp; = (8.5&times;0.1)+(0.65&times;0.2)+(1.2&times;0.0) = <strong>0.98</strong>",
        "sad&nbsp;&nbsp; = (8.5&times;0.0)+(0.65&times;1.3)+(1.2&times;0.1) = <strong>0.965</strong>"
      ]
    },
    {
      id: "hidden",
      label: "Jaringan 2 Lapis (Hidden Layer)",
      title: "Jaringan dengan Hidden Layer",
      story: "Input diteruskan ke hidden layer (ih_wgt) lebih dulu, baru hidden layer diteruskan ke output (hp_wgt). Inilah cikal-bakal deep network.",
      layers: [
        { name: "Input", nodes: [
          { label: "toes", value: 8.5 },
          { label: "wlrec", value: 0.65 },
          { label: "nfans", value: 1.2 }
        ] },
        { name: "Hidden", nodes: [
          { label: "h0", value: 0.86 },
          { label: "h1", value: 0.295 },
          { label: "h2", value: 1.23 }
        ] },
        { name: "Output", nodes: [
          { label: "hurt?", value: 0.2135 },
          { label: "win?", value: 0.145 },
          { label: "sad?", value: 0.5065 }
        ] }
      ],
      weights: [
        [[0.1, 0.2, -0.1], [-0.1, 0.1, 0.9], [0.1, 0.4, 0.1]],
        [[0.3, 1.1, -0.3], [0.1, 0.2, 0.0], [0.0, 1.3, 0.1]]
      ],
      trace: [
        "hid = vect_mat_mul(input, ih_wgt)",
        "hid = [0.86, 0.295, 1.23]",
        "pred = vect_mat_mul(hid, hp_wgt)",
        "hurt = (0.86&times;0.3)+(0.295&times;1.1)+(1.23&times;-0.3) = <strong>0.2135</strong>",
        "win&nbsp;&nbsp; = (0.86&times;0.1)+(0.295&times;0.2)+(1.23&times;0.0) = <strong>0.145</strong>",
        "sad&nbsp;&nbsp; = (0.86&times;0.0)+(0.295&times;1.3)+(1.23&times;0.1) = <strong>0.5065</strong>"
      ]
    }
  ],
  // Untuk tab NumPy: contoh error broadcasting nyata
  numpyDemo: {
    good: {
      code: "a = np.array([1,2,3])\nb = np.array([0.1,0.2,0.3])\na.dot(b)",
      result: "1.4",
      note: "Dot product berhasil karena kedua vektor berukuran sama (3,)."
    },
    bad: {
      code: "a = np.array([1,2,3,4])\nb = np.array([0.1,0.2,0.3])\na.dot(b)",
      result: "ValueError: shapes (4,) and (3,) not aligned:\n4 (dim 0) != 3 (dim 0)",
      note: "Dot product gagal karena ukuran vektor tidak cocok (4 vs 3) — kesalahan paling umum saat membangun forward propagation manual."
    }
  }
};

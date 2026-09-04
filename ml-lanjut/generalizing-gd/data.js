/*
 * KupasAI - Generalizing Gradient Descent (Modul 4, Week 4)
 * Semua angka diverifikasi ulang dengan Python identik dengan notebook
 * PMLMod4_Generalizing_GD. Kasus: toes=8.5, wlrec=0.65, nfans=1.2,
 * target menang=1.
 */

var GGD_DATA = {
  multiInput: {
    inputLabels: ["toes", "wlrec", "nfans"],
    input: [8.5, 0.65, 1.2],
    normal: {
      alpha: 0.01,
      weights0: [0.1, 0.2, -0.1],
      iters: [
        { iter: 1, pred: 0.86, error: 0.0196, delta: -0.14, weight_deltas: [-1.19, -0.091, -0.168], weights: [0.1119, 0.20091, -0.09832] },
        { iter: 2, pred: 0.963757, error: 0.001314, delta: -0.036243, weight_deltas: [-0.308061, -0.023558, -0.043491], weights: [0.114981, 0.201146, -0.097885] },
        { iter: 3, pred: 0.990618, error: 0.000088, delta: -0.009382, weight_deltas: [-0.079749, -0.006098, -0.011259], weights: [0.115778, 0.201207, -0.097773] }
      ]
    },
    frozen: {
      alpha: 0.3,
      weights0: [0.1, 0.2, -0.1],
      note: "weight[0] (bobot toes) dibekukan: weight_deltas[0] dipaksa 0 setiap iterasi.",
      iters: [
        { iter: 1, pred: 0.86, error: 0.0196, weight_deltas: [0, -0.091, -0.168], weights: [0.1, 0.2273, -0.0496] },
        { iter: 2, pred: 0.938225, error: 0.003816, weight_deltas: [0, -0.040154, -0.07413], weights: [0.1, 0.239346, -0.027361] },
        { iter: 3, pred: 0.972742, error: 0.000743, weight_deltas: [0, -0.017718, -0.03271], weights: [0.1, 0.244661, -0.017548] }
      ]
    }
  },
  multiOutput: {
    input: 0.65,
    inputLabel: "wlrec",
    outputLabels: ["hurt", "win", "sad"],
    true_: [0.1, 1, 0.1],
    weights0: [0.3, 0.2, 0.9],
    alpha: 0.1,
    pred: [0.195, 0.13, 0.585],
    error: [0.009025, 0.7569, 0.235225],
    delta: [0.095, -0.87, 0.485],
    weight_deltas: [0.06175, -0.5655, 0.31525],
    weights1: [0.293825, 0.25655, 0.868475]
  },
  multiInOut: {
    inputLabels: ["toes", "wlrec", "nfans"],
    input: [8.5, 0.65, 1.2],
    outputLabels: ["hurt", "win", "sad"],
    true_: [0.1, 1, 0.1],
    alpha: 0.01,
    // weights[inputIdx][outputIdx]
    weights0: [[0.1, 0.1, -0.3], [0.1, 0.2, 0.0], [0.0, 1.3, 0.1]],
    pred: [0.915, 2.54, -2.43],
    error: [0.664225, 2.3716, 6.4009],
    delta: [0.815, 1.54, -2.53],
    weight_deltas: [
      [6.9275, 13.09, -21.505],
      [0.52975, 1.001, -1.6445],
      [0.978, 1.848, -3.036]
    ],
    weights1: [[0.030725, -0.0309, -0.08495], [0.094703, 0.18999, 0.016445], [-0.00978, 1.28152, 0.13036]]
  }
};

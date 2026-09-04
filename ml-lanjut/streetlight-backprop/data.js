/*
 * KupasAI - Studi Kasus: Streetlight Problem (Modul 5, Week 5)
 * Angka diverifikasi ulang dengan Python identik dengan notebook
 * PMLMod5_Intro_to_Backpropagation1 (weights=[0.5,0.48,-0.7], alpha=0.1).
 */

var SL_DATA = {
  dataset: {
    labels: ["Lampu Kiri", "Lampu Tengah", "Lampu Kanan", "Keputusan"],
    rows: [
      [1, 0, 1, 0], [0, 1, 1, 1], [0, 0, 1, 0],
      [1, 1, 1, 1], [0, 1, 1, 1], [1, 0, 1, 0]
    ],
    note: "0 = STOP, 1 = WALK. Perhatikan: Lampu Tengah menyala persis saat keputusannya WALK — korelasi sempurna."
  },
  weights0: [0.5, 0.48, -0.7],
  alpha: 0.1,
  // Training hanya pakai baris pertama streetlights[0]=[1,0,1], goal=0 (20 iterasi)
  singleExample: {
    input: [1, 0, 1], goal: 0,
    selected: [
      { iter: 1, pred: -0.2, error: 0.04, weights: [0.52, 0.48, -0.68] },
      { iter: 2, pred: -0.16, error: 0.0256, weights: [0.536, 0.48, -0.664] },
      { iter: 3, pred: -0.128, error: 0.016384, weights: [0.5488, 0.48, -0.6512] },
      { iter: 5, pred: -0.0819, error: 0.006711, weights: [0.56723, 0.48, -0.63277] },
      { iter: 10, pred: -0.02684, error: 0.000721, weights: [0.58926, 0.48, -0.61074] },
      { iter: 20, pred: -0.00288, error: 0.0000083, weights: [0.598847, 0.48, -0.601153] }
    ]
  },
  // Training pakai seluruh dataset (40 epoch)
  wholeDataset: {
    errorPerEpoch: [2.656123,0.96287,0.550917,0.364458,0.251677,0.177976,0.128645,0.09511,0.071946,0.055649,0.043948,0.035358,0.028907,0.023952,0.020063,0.016952,0.014421,0.012332,0.010587,0.009117,0.007869,0.006803,0.005889,0.005103,0.004425,0.003839,0.003331,0.002892,0.002511,0.002181,0.001894,0.001645,0.001429,0.001241,0.001078,0.000937,0.000814,0.000707,0.000614,0.000534],
    selected: [
      { epoch: 1, error: 2.656123, weights: [0.54085, 0.72112, -0.40043] },
      { epoch: 2, error: 0.96287, weights: [0.49944, 0.84194, -0.28584] },
      { epoch: 5, error: 0.251677, weights: [0.32956, 0.99147, -0.19117] },
      { epoch: 10, error: 0.055649, weights: [0.16963, 1.05836, -0.1324] },
      { epoch: 20, error: 0.009117, weights: [0.06246, 1.05056, -0.06532] },
      { epoch: 40, error: 0.000534, weights: [0.01389, 1.01381, -0.01599] }
    ],
    finalWeights: [0.01389, 1.01381, -0.01599]
  }
};

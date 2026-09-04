/*
 * KupasAI - Non-Linearitas & Fungsi Aktivasi (Modul 6, Week 6 & 10)
 */

var NL_DATA = {
  // Delta propagation contoh (Mod6 6.2.4): delta(2)=0.25, weights_1_2={0.0,0.5,1.0,-1.0}
  deltaProp: {
    delta2: 0.25,
    weights12: [0.0, 0.5, 1.0, -1.0],
    // delta1[i] = delta2 * weights12[i]
  },
  donut: {
    acc_lin: 0.52,
    acc_nn: 1.0
  },
  activations: {
    relu: { name: "ReLU", formula: "f(x) = max(0, x)", color: "#0969da" },
    sigmoid: { name: "Sigmoid", formula: "f(x) = 1 / (1 + e^(&minus;x))", color: "#8250df" },
    tanh: { name: "Tanh", formula: "f(x) = tanh(x)", color: "#1a7f37" }
  }
};

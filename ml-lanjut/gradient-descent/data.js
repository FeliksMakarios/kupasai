/*
 * KupasAI - Gradient Descent (Modul 3, Week 3)
 * Angka diverifikasi ulang dengan Python identik dengan notebook
 * PMLMod3_Gradient_Descent (weight=0.5, input=0.5, goal_pred=0.8).
 */

var GD_DATA = {
  compare: {
    weight0: 0.5, input: 0.5, goal: 0.8, lr: 0.01,
    hot_cold: [
      {"iter":1,"weight":0.51,"error":0.297025},
      {"iter":2,"weight":0.52,"error":0.2916},
      {"iter":3,"weight":0.53,"error":0.286225},
      {"iter":4,"weight":0.54,"error":0.2809},
      {"iter":5,"weight":0.55,"error":0.275625},
      {"iter":6,"weight":0.56,"error":0.2704},
      {"iter":7,"weight":0.57,"error":0.265225},
      {"iter":8,"weight":0.58,"error":0.2601},
      {"iter":9,"weight":0.59,"error":0.255025},
      {"iter":10,"weight":0.6,"error":0.25}
    ],
    gd: [
      {"iter":1,"weight":0.775,"error":0.3025},
      {"iter":2,"weight":0.98125,"error":0.170156},
      {"iter":3,"weight":1.135938,"error":0.095713},
      {"iter":4,"weight":1.251953,"error":0.053839},
      {"iter":5,"weight":1.338965,"error":0.030284},
      {"iter":6,"weight":1.404224,"error":0.017035},
      {"iter":7,"weight":1.453168,"error":0.009582},
      {"iter":8,"weight":1.489876,"error":0.00539},
      {"iter":9,"weight":1.517407,"error":0.003032},
      {"iter":10,"weight":1.538055,"error":0.001705}
    ]
  },
  // Step-by-step trace untuk 1 iterasi GD (weight=0.1, input=8.5, goal=1.0, alpha=0.01)
  oneIteration: {
    weight: 0.1, input: 8.5, goal: 1.0, alpha: 0.01,
    steps: [
      { name: "1. Prediksi", formula: "pred = input &times; weight", value: "8.5 &times; 0.1 = <strong>0.85</strong>" },
      { name: "2. Delta", formula: "delta = pred &minus; goal", value: "0.85 &minus; 1.0 = <strong>&minus;0.15</strong>" },
      { name: "3. Weight Delta", formula: "weight_delta = delta &times; input", value: "&minus;0.15 &times; 8.5 = <strong>&minus;1.275</strong>" },
      { name: "4. Update Weight", formula: "weight = weight &minus; (alpha &times; weight_delta)", value: "0.1 &minus; (0.01 &times; &minus;1.275) = <strong>0.11275</strong>" },
      { name: "5. Prediksi Baru", formula: "pred_baru = input &times; weight_baru", value: "8.5 &times; 0.11275 = <strong>0.958375</strong>" }
    ],
    errorBefore: 0.0225,
    errorAfter: 0.001733
  },
  // preset untuk tab alpha & divergence: weight=0.5, goal=0.8, 20 iterasi
  alphaPresets: [
    { label: "Normal (input=0.5, &alpha;=1.0)", input: 0.5, alpha: 1.0 },
    { label: "Broken (input=2, &alpha;=1.0)", input: 2, alpha: 1.0 },
    { label: "Fixed (input=2, &alpha;=0.1)", input: 2, alpha: 0.1 }
  ]
};

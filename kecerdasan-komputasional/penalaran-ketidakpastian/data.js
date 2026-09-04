/*
 * KupasAI - Modul 3: Penalaran Ketidakpastian dan Kesamaan Dokumen
 * Seluruh angka dihasilkan dari implementasi independen (generate_data.py),
 * diverifikasi terhadap kriteria pada Modul Lab Mandiri 3 (INF20052).
 */
var KK3_DATA = {
  "bayes": {
    "penyakit": [
      "Cacar",
      "Alergi",
      "Jerawat"
    ],
    "prior": [
      0.4,
      0.4,
      0.2
    ],
    "likelihood": [
      0.7,
      0.3,
      0.9
    ],
    "pembilang": [
      0.27999999999999997,
      0.12,
      0.18000000000000002
    ],
    "penyebut": 0.58,
    "posterior": [
      0.48275862068965514,
      0.20689655172413793,
      0.31034482758620696
    ],
    "faktaBaru": {
      "pHGivenEKecil": 0.5,
      "pEGivenEDanH": 0.4,
      "pEGivenE": 0.6,
      "hasil": 0.33333333333333337
    }
  },
  "cf": {
    "mb1": 0.8,
    "mb2": 0.7,
    "md1": 0.01,
    "md2": 0.08,
    "mbGabungan": 0.94,
    "mdGabungan": 0.0892,
    "cf": 0.8508,
    "mbKonjungsi": 0.7,
    "mbDisjungsi": 0.8
  },
  "dempster": {
    "m1": {
      "set": "F,D,B",
      "w": 0.8
    },
    "m2": {
      "set": "A,F,D",
      "w": 0.9
    },
    "m3": {
      "set": "A",
      "w": 0.6
    },
    "tabel12": [
      {
        "a": [
          "B",
          "D",
          "F"
        ],
        "b": [
          "A",
          "D",
          "F"
        ],
        "irisan": [
          "D",
          "F"
        ],
        "bobot": 0.72
      },
      {
        "a": [
          "B",
          "D",
          "F"
        ],
        "b": [
          "A",
          "B",
          "D",
          "F"
        ],
        "irisan": [
          "B",
          "D",
          "F"
        ],
        "bobot": 0.08
      },
      {
        "a": [
          "A",
          "B",
          "D",
          "F"
        ],
        "b": [
          "A",
          "D",
          "F"
        ],
        "irisan": [
          "A",
          "D",
          "F"
        ],
        "bobot": 0.18
      },
      {
        "a": [
          "A",
          "B",
          "D",
          "F"
        ],
        "b": [
          "A",
          "B",
          "D",
          "F"
        ],
        "irisan": [
          "A",
          "B",
          "D",
          "F"
        ],
        "bobot": 0.02
      }
    ],
    "m12": {
      "D,F": 0.72,
      "B,D,F": 0.08,
      "A,D,F": 0.18,
      "A,B,D,F": 0.02
    },
    "tabel123": [
      {
        "a": [
          "D",
          "F"
        ],
        "b": [
          "A"
        ],
        "irisan": [],
        "bobot": 0.432
      },
      {
        "a": [
          "D",
          "F"
        ],
        "b": [
          "A",
          "B",
          "D",
          "F"
        ],
        "irisan": [
          "D",
          "F"
        ],
        "bobot": 0.288
      },
      {
        "a": [
          "B",
          "D",
          "F"
        ],
        "b": [
          "A"
        ],
        "irisan": [],
        "bobot": 0.048
      },
      {
        "a": [
          "B",
          "D",
          "F"
        ],
        "b": [
          "A",
          "B",
          "D",
          "F"
        ],
        "irisan": [
          "B",
          "D",
          "F"
        ],
        "bobot": 0.032
      },
      {
        "a": [
          "A",
          "D",
          "F"
        ],
        "b": [
          "A"
        ],
        "irisan": [
          "A"
        ],
        "bobot": 0.108
      },
      {
        "a": [
          "A",
          "D",
          "F"
        ],
        "b": [
          "A",
          "B",
          "D",
          "F"
        ],
        "irisan": [
          "A",
          "D",
          "F"
        ],
        "bobot": 0.072
      },
      {
        "a": [
          "A",
          "B",
          "D",
          "F"
        ],
        "b": [
          "A"
        ],
        "irisan": [
          "A"
        ],
        "bobot": 0.012
      },
      {
        "a": [
          "A",
          "B",
          "D",
          "F"
        ],
        "b": [
          "A",
          "B",
          "D",
          "F"
        ],
        "irisan": [
          "A",
          "B",
          "D",
          "F"
        ],
        "bobot": 0.008
      }
    ],
    "m123": {
      "D,F": 0.5538,
      "B,D,F": 0.0615,
      "A": 0.2308,
      "A,D,F": 0.1385,
      "A,B,D,F": 0.0154
    },
    "konflik123": 0.48
  },
  "vsm": {
    "dok1": "Ibu membeli apel malang. Saya minum teh manis. Ibu membeli baju baru.",
    "dok2": "Ibu membeli apel merah manis. Saya minum teh manis. Ayah membeli baju merah.",
    "kosakata": [
      "ibu",
      "beli",
      "apel",
      "malang",
      "saya",
      "minum",
      "teh",
      "manis",
      "baju",
      "baru",
      "merah",
      "ayah"
    ],
    "d1": [
      2,
      2,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0
    ],
    "d2": [
      1,
      2,
      1,
      0,
      1,
      1,
      1,
      2,
      1,
      0,
      2,
      1
    ],
    "dot": 13,
    "norma1": 4.0,
    "norma2": 4.3589,
    "cosine": 0.7456011350793257,
    "cosineVersiBuku": 0.0833
  }
};

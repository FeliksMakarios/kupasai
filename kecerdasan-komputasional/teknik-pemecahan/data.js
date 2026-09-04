/*
 * KupasAI - Modul 2: Teknik Pemecahan Permasalahan
 * Seluruh angka dihasilkan dari implementasi independen (generate_data.py),
 * diverifikasi terhadap kriteria pada Modul Lab Mandiri 2 (INF20052).
 */
var KK2_DATA = {
  "andor": {
    "tree": {
      "name": "OR",
      "isLeaf": false,
      "tipe": "or",
      "label": "",
      "biaya": 6,
      "children": [
        {
          "name": "AND",
          "isLeaf": false,
          "tipe": "and",
          "label": "",
          "biaya": 7,
          "children": [
            {
              "name": "3",
              "isLeaf": true,
              "value": 3,
              "label": ""
            },
            {
              "name": "4",
              "isLeaf": true,
              "value": 4,
              "label": ""
            }
          ]
        },
        {
          "name": "OR",
          "isLeaf": false,
          "tipe": "or",
          "label": "terpilih",
          "biaya": 6,
          "children": [
            {
              "name": "AND",
              "isLeaf": false,
              "tipe": "and",
              "label": "terpilih",
              "biaya": 6,
              "children": [
                {
                  "name": "2",
                  "isLeaf": true,
                  "value": 2,
                  "label": ""
                },
                {
                  "name": "2",
                  "isLeaf": true,
                  "value": 2,
                  "label": ""
                },
                {
                  "name": "2",
                  "isLeaf": true,
                  "value": 2,
                  "label": ""
                }
              ]
            },
            {
              "name": "9",
              "isLeaf": true,
              "value": 9,
              "label": ""
            }
          ]
        }
      ]
    },
    "biayaMinimum": 6
  },
  "peta": {
    "adjacency": {
      "WA": [
        "NT",
        "SA"
      ],
      "NT": [
        "WA",
        "SA",
        "Q"
      ],
      "SA": [
        "WA",
        "NT",
        "Q",
        "NSW",
        "V"
      ],
      "Q": [
        "NT",
        "SA",
        "NSW"
      ],
      "NSW": [
        "Q",
        "SA",
        "V"
      ],
      "V": [
        "SA",
        "NSW"
      ],
      "T": []
    },
    "warna": {
      "SA": 0,
      "NT": 1,
      "Q": 2,
      "NSW": 1,
      "WA": 2,
      "V": 2,
      "T": 0
    },
    "kMin": 3,
    "namaWarna": [
      "Merah",
      "Hijau",
      "Biru"
    ]
  },
  "kripto": {
    "solusi": {
      "S": 9,
      "E": 5,
      "N": 6,
      "D": 7,
      "M": 1,
      "O": 0,
      "R": 8,
      "Y": 2
    },
    "send": 9567,
    "more": 1085,
    "money": 10652,
    "kandidatBrute": 1748230,
    "kandidatBatasan": 173050,
    "waktuBrute": 4.7744,
    "waktuBatasan": 0.1519
  },
  "rumahSakit": {
    "komposisi": {
      "PP": 5,
      "PW": 4,
      "DP": 6,
      "DW": 1
    },
    "batasanDeskripsi": [
      "PP + PW + DP + DW = 16",
      "PP + PW > DP + DW",
      "DP > PP",
      "PP > PW",
      "DW >= 1"
    ],
    "penutur": "Perawat Wanita",
    "rincian": {
      "Perawat Pria": [
        4
      ],
      "Perawat Wanita": [],
      "Dokter Pria": [
        3
      ],
      "Dokter Wanita": [
        5
      ]
    }
  },
  "silsilah": {
    "fakta": [
      [
        "parent",
        "john",
        "jack"
      ],
      [
        "parent",
        "jack",
        "oliver"
      ],
      [
        "parent",
        "oliver",
        "ryan"
      ],
      [
        "parent",
        "john",
        "mary"
      ],
      [
        "parent",
        "mary",
        "susan"
      ]
    ],
    "queryParentJohn": [
      [
        "parent",
        "john",
        "jack"
      ],
      [
        "parent",
        "john",
        "mary"
      ]
    ],
    "turunanJohn": [
      "jack",
      "mary",
      "oliver",
      "ryan",
      "susan"
    ],
    "leluhurRyan": [
      "jack",
      "john",
      "oliver"
    ]
  }
};

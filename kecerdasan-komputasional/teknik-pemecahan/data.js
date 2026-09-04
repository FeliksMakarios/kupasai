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
  "andorBuku": {
    "tree": {
      "name": "OR",
      "isLeaf": false,
      "tipe": "or",
      "label": "",
      "biaya": 11,
      "children": [
        {
          "name": "AND",
          "isLeaf": false,
          "tipe": "and",
          "label": "",
          "biaya": 12,
          "children": [
            {
              "name": "OR",
              "isLeaf": false,
              "tipe": "or",
              "label": "",
              "biaya": 6,
              "children": [
                {
                  "name": "5",
                  "isLeaf": true,
                  "value": 5,
                  "label": "terpilih"
                },
                {
                  "name": "7",
                  "isLeaf": true,
                  "value": 7,
                  "label": ""
                }
              ]
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
          "name": "AND",
          "isLeaf": false,
          "tipe": "and",
          "label": "terpilih",
          "biaya": 10,
          "children": [
            {
              "name": "4",
              "isLeaf": true,
              "value": 4,
              "label": ""
            },
            {
              "name": "4",
              "isLeaf": true,
              "value": 4,
              "label": ""
            }
          ]
        }
      ]
    },
    "biayaMinimum": 11
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
    "waktuBrute": 4.6698,
    "waktuBatasan": 0.1452
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
    "laki": [
      "john",
      "jack",
      "oliver",
      "ali",
      "james",
      "simon",
      "stev",
      "harry"
    ],
    "perempuan": [
      "madeline",
      "helen",
      "sophie",
      "alice",
      "jess",
      "lily",
      "arline",
      "kelly"
    ],
    "parentPairs": [
      [
        "john",
        "alice"
      ],
      [
        "madeline",
        "alice"
      ],
      [
        "john",
        "ali"
      ],
      [
        "madeline",
        "ali"
      ],
      [
        "jack",
        "jess"
      ],
      [
        "helen",
        "jess"
      ],
      [
        "jack",
        "lily"
      ],
      [
        "helen",
        "lily"
      ],
      [
        "oliver",
        "james"
      ],
      [
        "sophie",
        "james"
      ],
      [
        "oliver",
        "arline"
      ],
      [
        "sophie",
        "arline"
      ],
      [
        "ali",
        "simon"
      ],
      [
        "jess",
        "simon"
      ],
      [
        "ali",
        "stev"
      ],
      [
        "jess",
        "stev"
      ],
      [
        "james",
        "harry"
      ],
      [
        "lily",
        "harry"
      ],
      [
        "james",
        "kelly"
      ],
      [
        "lily",
        "kelly"
      ]
    ],
    "queries": [
      {
        "q": "father(X, kelly)",
        "hasil": [
          "james"
        ]
      },
      {
        "q": "grandmother(X, kelly)",
        "hasil": [
          "helen",
          "sophie"
        ]
      },
      {
        "q": "brother(X, kelly)",
        "hasil": [
          "harry"
        ]
      },
      {
        "q": "aunt(X, kelly)",
        "hasil": [
          "arline",
          "jess"
        ]
      },
      {
        "q": "descend(john, X)",
        "hasil": [
          "ali",
          "alice",
          "simon",
          "stev"
        ]
      },
      {
        "q": "ancestor(stev, Y)",
        "hasil": [
          "ali",
          "helen",
          "jack",
          "jess",
          "john",
          "madeline"
        ]
      }
    ]
  }
};

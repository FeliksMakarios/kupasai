/*
 * KupasAI - Modul 1: Pemodelan Ruang Keadaan dan Algoritma Pencarian
 * Seluruh angka dihasilkan dari implementasi independen (generate_data.py),
 * diverifikasi terhadap kriteria pada Modul Lab Mandiri 1 (INF20052).
 */
var KK1_DATA = {
  "robot": {
    "states": [
      [
        0,
        0,
        0
      ],
      [
        0,
        0,
        1
      ],
      [
        0,
        1,
        0
      ],
      [
        0,
        1,
        1
      ],
      [
        1,
        0,
        0
      ],
      [
        1,
        0,
        1
      ],
      [
        1,
        1,
        0
      ],
      [
        1,
        1,
        1
      ]
    ],
    "edges": [
      {
        "from": [
          0,
          0,
          0
        ],
        "to": [
          1,
          0,
          0
        ],
        "aksi": "kanan"
      },
      {
        "from": [
          0,
          0,
          1
        ],
        "to": [
          1,
          0,
          1
        ],
        "aksi": "kanan"
      },
      {
        "from": [
          0,
          1,
          0
        ],
        "to": [
          1,
          1,
          0
        ],
        "aksi": "kanan"
      },
      {
        "from": [
          0,
          1,
          0
        ],
        "to": [
          0,
          0,
          0
        ],
        "aksi": "sedot"
      },
      {
        "from": [
          0,
          1,
          1
        ],
        "to": [
          1,
          1,
          1
        ],
        "aksi": "kanan"
      },
      {
        "from": [
          0,
          1,
          1
        ],
        "to": [
          0,
          0,
          1
        ],
        "aksi": "sedot"
      },
      {
        "from": [
          1,
          0,
          0
        ],
        "to": [
          0,
          0,
          0
        ],
        "aksi": "kiri"
      },
      {
        "from": [
          1,
          0,
          1
        ],
        "to": [
          0,
          0,
          1
        ],
        "aksi": "kiri"
      },
      {
        "from": [
          1,
          0,
          1
        ],
        "to": [
          1,
          0,
          0
        ],
        "aksi": "sedot"
      },
      {
        "from": [
          1,
          1,
          0
        ],
        "to": [
          0,
          1,
          0
        ],
        "aksi": "kiri"
      },
      {
        "from": [
          1,
          1,
          1
        ],
        "to": [
          0,
          1,
          1
        ],
        "aksi": "kiri"
      },
      {
        "from": [
          1,
          1,
          1
        ],
        "to": [
          1,
          1,
          0
        ],
        "aksi": "sedot"
      }
    ],
    "start": [
      0,
      1,
      1
    ],
    "goal": [
      0,
      0,
      0
    ],
    "solution": [
      "sedot",
      "kanan",
      "sedot",
      "kiri"
    ],
    "cost": 4,
    "pathStates": [
      [
        0,
        1,
        1
      ],
      [
        0,
        0,
        1
      ],
      [
        1,
        0,
        1
      ],
      [
        1,
        0,
        0
      ],
      [
        0,
        0,
        0
      ]
    ]
  },
  "kendi": {
    "kap1": 4,
    "kap2": 3,
    "spaceSize": 20,
    "start": [
      0,
      0
    ],
    "target": [
      2,
      0
    ],
    "aturan": [
      2,
      6,
      2,
      6,
      3,
      6
    ],
    "jalur": [
      [
        0,
        0
      ],
      [
        0,
        3
      ],
      [
        3,
        0
      ],
      [
        3,
        3
      ],
      [
        4,
        2
      ],
      [
        0,
        2
      ],
      [
        2,
        0
      ]
    ],
    "aturanNama": {
      "1": "Isi kendi 1 (4 galon) penuh",
      "2": "Isi kendi 2 (3 galon) penuh",
      "3": "Kosongkan kendi 1",
      "4": "Kosongkan kendi 2",
      "5": "Tuang kendi 1 ke kendi 2",
      "6": "Tuang kendi 2 ke kendi 1"
    }
  },
  "peta": {
    "nodes": [
      "Arad",
      "Zerind",
      "Oradea",
      "Sibiu",
      "Timisoara",
      "Lugoj",
      "Mehadia",
      "Drobeta",
      "Craiova",
      "Rimnicu",
      "Fagaras",
      "Pitesti",
      "Bucharest"
    ],
    "edges": [
      {
        "from": "Arad",
        "to": "Zerind",
        "jarak": 75
      },
      {
        "from": "Arad",
        "to": "Sibiu",
        "jarak": 140
      },
      {
        "from": "Arad",
        "to": "Timisoara",
        "jarak": 118
      },
      {
        "from": "Oradea",
        "to": "Zerind",
        "jarak": 71
      },
      {
        "from": "Oradea",
        "to": "Sibiu",
        "jarak": 151
      },
      {
        "from": "Lugoj",
        "to": "Timisoara",
        "jarak": 111
      },
      {
        "from": "Lugoj",
        "to": "Mehadia",
        "jarak": 70
      },
      {
        "from": "Drobeta",
        "to": "Mehadia",
        "jarak": 75
      },
      {
        "from": "Craiova",
        "to": "Drobeta",
        "jarak": 120
      },
      {
        "from": "Craiova",
        "to": "Rimnicu",
        "jarak": 146
      },
      {
        "from": "Craiova",
        "to": "Pitesti",
        "jarak": 138
      },
      {
        "from": "Rimnicu",
        "to": "Sibiu",
        "jarak": 80
      },
      {
        "from": "Fagaras",
        "to": "Sibiu",
        "jarak": 99
      },
      {
        "from": "Pitesti",
        "to": "Rimnicu",
        "jarak": 97
      },
      {
        "from": "Bucharest",
        "to": "Fagaras",
        "jarak": 211
      },
      {
        "from": "Bucharest",
        "to": "Pitesti",
        "jarak": 101
      }
    ],
    "sld": {
      "Arad": 366,
      "Bucharest": 0,
      "Craiova": 160,
      "Drobeta": 242,
      "Fagaras": 176,
      "Lugoj": 244,
      "Mehadia": 241,
      "Oradea": 380,
      "Pitesti": 100,
      "Rimnicu": 193,
      "Sibiu": 253,
      "Timisoara": 329,
      "Zerind": 374
    },
    "bfs": {
      "jalur": [
        "Arad",
        "Sibiu",
        "Fagaras",
        "Bucharest"
      ],
      "jarak": 450,
      "dikunjungi": 9,
      "langkah": [
        {
          "kunjungan": "Arad",
          "bucharest": false,
          "antrian": []
        },
        {
          "kunjungan": "Sibiu",
          "bucharest": false,
          "antrian": [
            "Timisoara",
            "Zerind"
          ]
        },
        {
          "kunjungan": "Timisoara",
          "bucharest": false,
          "antrian": [
            "Zerind",
            "Fagaras",
            "Oradea",
            "Rimnicu"
          ]
        },
        {
          "kunjungan": "Zerind",
          "bucharest": false,
          "antrian": [
            "Fagaras",
            "Oradea",
            "Rimnicu",
            "Lugoj"
          ]
        },
        {
          "kunjungan": "Fagaras",
          "bucharest": false,
          "antrian": [
            "Oradea",
            "Rimnicu",
            "Lugoj"
          ]
        },
        {
          "kunjungan": "Oradea",
          "bucharest": false,
          "antrian": [
            "Rimnicu",
            "Lugoj",
            "Bucharest"
          ]
        },
        {
          "kunjungan": "Rimnicu",
          "bucharest": false,
          "antrian": [
            "Lugoj",
            "Bucharest"
          ]
        },
        {
          "kunjungan": "Lugoj",
          "bucharest": false,
          "antrian": [
            "Bucharest",
            "Craiova",
            "Pitesti"
          ]
        },
        {
          "kunjungan": "Bucharest",
          "bucharest": true,
          "antrian": [
            "Craiova",
            "Pitesti",
            "Mehadia"
          ]
        }
      ]
    },
    "dfs": {
      "jalur": [
        "Arad",
        "Timisoara",
        "Lugoj",
        "Mehadia",
        "Drobeta",
        "Craiova",
        "Pitesti",
        "Bucharest"
      ],
      "jarak": 733,
      "dikunjungi": 8,
      "urutan": [
        "Arad",
        "Timisoara",
        "Lugoj",
        "Mehadia",
        "Drobeta",
        "Craiova",
        "Pitesti",
        "Bucharest"
      ]
    },
    "greedy": {
      "jalur": [
        "Arad",
        "Sibiu",
        "Fagaras",
        "Bucharest"
      ],
      "jarak": 450,
      "dikunjungi": 4
    }
  },
  "puzzle": {
    "goal": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      0
    ],
    "start": [
      1,
      2,
      3,
      0,
      4,
      6,
      7,
      5,
      8
    ],
    "simpleHC": {
      "jejakH": [
        3,
        2,
        1,
        0
      ],
      "trace": [
        [
          1,
          2,
          3,
          0,
          4,
          6,
          7,
          5,
          8
        ],
        [
          1,
          2,
          3,
          4,
          0,
          6,
          7,
          5,
          8
        ],
        [
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          0,
          8
        ],
        [
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          0
        ]
      ],
      "akhirH": 0,
      "stuck": false
    },
    "steepest": {
      "jejakH": [
        3,
        2,
        1,
        0
      ],
      "trace": [
        [
          1,
          2,
          3,
          0,
          4,
          6,
          7,
          5,
          8
        ],
        [
          1,
          2,
          3,
          4,
          0,
          6,
          7,
          5,
          8
        ],
        [
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          0,
          8
        ],
        [
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          0
        ]
      ],
      "akhirH": 0,
      "stuck": false
    },
    "contoh2": {
      "start": [
        2,
        5,
        3,
        4,
        1,
        6,
        7,
        0,
        8
      ],
      "simpleHC": {
        "jejakH": [
          4,
          3
        ],
        "trace": [
          [
            2,
            5,
            3,
            4,
            1,
            6,
            7,
            0,
            8
          ],
          [
            2,
            5,
            3,
            4,
            1,
            6,
            7,
            8,
            0
          ]
        ],
        "akhirH": 3,
        "stuck": true
      },
      "steepest": {
        "jejakH": [
          4,
          3
        ],
        "trace": [
          [
            2,
            5,
            3,
            4,
            1,
            6,
            7,
            0,
            8
          ],
          [
            2,
            5,
            3,
            4,
            1,
            6,
            7,
            8,
            0
          ]
        ],
        "akhirH": 3,
        "stuck": true
      }
    }
  },
  "minimax": {
    "tree": [
      [
        [
          3,
          5
        ],
        [
          6,
          9
        ]
      ],
      [
        [
          1,
          2
        ],
        [
          0,
          -1
        ]
      ],
      [
        [
          5,
          4
        ],
        [
          7,
          8
        ]
      ]
    ],
    "rootValue": 5,
    "leavesMinimax": 12,
    "leavesAlphabeta": 7,
    "pruned": 5,
    "allPaths": [
      "",
      "0",
      "0/0",
      "0/0/0",
      "0/0/1",
      "0/1",
      "0/1/0",
      "0/1/1",
      "1",
      "1/0",
      "1/0/0",
      "1/0/1",
      "1/1",
      "1/1/0",
      "1/1/1",
      "2",
      "2/0",
      "2/0/0",
      "2/0/1",
      "2/1",
      "2/1/0",
      "2/1/1"
    ],
    "alphabetaVisited": [
      "0/1",
      "1/0/1",
      "2",
      "0/1/0",
      "0/0",
      "0/0/0",
      "2/0",
      "1/0/0",
      "1",
      "1/0",
      "2/0/1",
      "2/0/0",
      "0",
      "",
      "0/0/1"
    ]
  }
};

// KupasAI - Pandas data
// Dataset gudang persis seperti Modul 2 (Mod2_Pandas.ipynb), termasuk nilai kosong aslinya.

const PANDAS_DATA = {
  columns: ['ID Gudang', 'Apples', 'Oranges', 'Gomu-Gomu'],
  rows: [
    { id: 'B0', Apples: 3,    Oranges: 0,    'Gomu-Gomu': 2 },
    { id: 'B1', Apples: 2,    Oranges: 3,    'Gomu-Gomu': 9 },
    { id: 'B2', Apples: 0,    Oranges: 0,    'Gomu-Gomu': 0 },
    { id: 'B3', Apples: null, Oranges: 2,    'Gomu-Gomu': 3 },
    { id: 'B4', Apples: 0,    Oranges: 0,    'Gomu-Gomu': 0 },
    { id: 'B5', Apples: 8,    Oranges: 5,    'Gomu-Gomu': 7 },
    { id: 'B6', Apples: 10,   Oranges: null, 'Gomu-Gomu': 0 },
    { id: 'B7', Apples: 9,    Oranges: 9,    'Gomu-Gomu': 9 },
    { id: 'B8', Apples: 3,    Oranges: 8,    'Gomu-Gomu': null },
    { id: 'B9', Apples: 9,    Oranges: 9,    'Gomu-Gomu': 9 },
  ],
  bins: [0, 0.1, 5, 10, 15, 30],
  binLabels: ['Habis', 'Menipis', 'Cukup', 'Banyak', 'Melimpah'],
};

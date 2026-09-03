// Data untuk KupasAI NLP Week 3 - Deep Learning Framework (Tensor & Autograd)
// Contoh graf komputasi dan bug akumulasi gradien persis dari Modul 3 (3.2.1 & 3.2.5):
//   a = [1,2,3,4,5], b = [2,2,2,2,2], c = [5,4,3,2,1]
//   d = a + b, e = b + c, f = d + e
//   f.backward([1,1,1,1,1])
// b digunakan di dua jalur (untuk membentuk d dan e), sehingga gradien yang benar
// pada b adalah akumulasi dari kedua jalur tersebut: [2,2,2,2,2].

const AUTOGRAD_DATA = {
  graph: {
    a: [1, 2, 3, 4, 5],
    b: [2, 2, 2, 2, 2],
    c: [5, 4, 3, 2, 1],
    grad_out: [1, 1, 1, 1, 1],
  },
  // g^50 untuk g = 0.9, 1.0, 1.1 (bagian 3.4.5)
  chain_examples: [
    { g: 0.9, n: 50, result: 0.00515377520732012 },
    { g: 1.0, n: 50, result: 1.0 },
    { g: 1.1, n: 50, result: 117.39085287969579 },
  ],
};

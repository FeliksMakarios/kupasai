/*
 * KupasAI - CNN Dasar: Konvolusi & Pooling (Modul 10, Week 11)
 * Contoh konvolusi dihasilkan sendiri (bukan dari notebook, yang hanya
 * memakai library Keras tanpa angka manual) sebagai ilustrasi hitung
 * tangan yang bisa diverifikasi: gambar 6x6 dengan tepi vertikal
 * (kiri terang=10, kanan gelap=0), kernel deteksi tepi vertikal klasik
 * [[1,0,-1],[1,0,-1],[1,0,-1]]. Diverifikasi dengan NumPy konvolusi valid,
 * stride 1, lalu max pooling 2x2 stride 2.
 */

var CNN_DATA = {
  image: [
    [10,10,10,0,0,0], [10,10,10,0,0,0], [10,10,10,0,0,0],
    [10,10,10,0,0,0], [10,10,10,0,0,0], [10,10,10,0,0,0]
  ],
  kernel: [[1,0,-1],[1,0,-1],[1,0,-1]],
  featureMap: [[0,30,30,0],[0,30,30,0],[0,30,30,0],[0,30,30,0]],
  pooled: [[30,30],[30,30]],
  // arsitektur CNN dari notebook (Modul 10.1.3, klasifikasi MNIST)
  architecture: [
    { layer: "Conv2D", detail: "32 filter, 3&times;3, ReLU", note: "input 28&times;28&times;1" },
    { layer: "MaxPooling2D", detail: "pool 2&times;2", note: "downsample fitur" },
    { layer: "Conv2D", detail: "64 filter, 3&times;3, ReLU", note: "fitur lebih kompleks" },
    { layer: "MaxPooling2D", detail: "pool 2&times;2", note: "downsample lagi" },
    { layer: "Flatten", detail: "ratakan ke vektor 1D", note: "" },
    { layer: "Dense", detail: "64 neuron, ReLU", note: "fully connected" },
    { layer: "Dense", detail: "10 neuron, Softmax", note: "probabilitas 10 kelas (0-9)" }
  ]
};

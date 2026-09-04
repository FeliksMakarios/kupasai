/*
 * KupasAI - Deteksi Objek: IoU, NMS & YOLO (Modul 11, Week 11)
 * Koordinat box & hasil NMS diverifikasi ulang dengan Python identik
 * dengan notebook PMLMod11_Algoritma_Deteksi_Objek.
 */

var OD_DATA = {
  iou: {
    canvasW: 500, canvasH: 350,
    groundTruth: [60, 50, 420, 300],
    presets: [
      { label: "Prediksi Bagus", box: [80, 60, 440, 310], iou: 0.8293 },
      { label: "Prediksi Kurang Baik", box: [200, 120, 480, 340], iou: 0.3536 },
      { label: "Tidak Ada Overlap", box: [350, 0, 500, 80], iou: 0.021 }
    ]
  },
  nms: {
    canvasW: 600, canvasH: 400,
    boxes: [
      { id: 0, box: [80, 60, 380, 300], score: 0.92, label: "Mobil 1a" },
      { id: 1, box: [100, 70, 400, 310], score: 0.85, label: "Mobil 1b" },
      { id: 2, box: [90, 50, 390, 290], score: 0.78, label: "Mobil 1c" },
      { id: 3, box: [60, 80, 360, 320], score: 0.70, label: "Mobil 1d" },
      { id: 4, box: [400, 200, 570, 370], score: 0.88, label: "Mobil 2" }
    ],
    iouThreshold: 0.5,
    keep: [0, 4],
    steps: [
      "Urutkan berdasarkan skor (pc): Box 0 (0.92) &gt; Box 4 (0.88) &gt; Box 1 (0.85) &gt; Box 2 (0.78) &gt; Box 3 (0.70)",
      "Pertahankan Box 0 (skor tertinggi). Hitung IoU Box 0 dengan sisanya:",
      "&nbsp;&nbsp;IoU(0,1)=0.809 &ge; 0.5 &rarr; hapus Box 1",
      "&nbsp;&nbsp;IoU(0,2)=0.863 &ge; 0.5 &rarr; hapus Box 2",
      "&nbsp;&nbsp;IoU(0,3)=0.748 &ge; 0.5 &rarr; hapus Box 3",
      "&nbsp;&nbsp;IoU(0,4)=0.000 &lt; 0.5 &rarr; Box 4 tetap kandidat",
      "Pertahankan Box 4 (kandidat tersisa dengan skor tertinggi, tidak ada box lain untuk dibandingkan).",
      "Hasil akhir: <strong>Box 0</strong> dan <strong>Box 4</strong> dipertahankan &mdash; dua mobil berbeda terdeteksi masing-masing sekali."
    ]
  },
  yolo: {
    gridSize: 3,
    numClasses: 3,
    outputPerCell: 8,
    anchorExample: {
      numAnchors: 2,
      outputPerCellWithAnchors: 16
    }
  }
};

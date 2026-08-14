#!/usr/bin/env python3
"""
KupasAI - Text Classification Visualization Data Generator
Generates pipeline data, decision boundaries, and BERT fine-tuning data.
"""

import json
import numpy as np
np.random.seed(42)

# ============================================================
# SAMPLE TEXTS for pipeline demo
# ============================================================

SAMPLE_TEXTS = [
    {"text": "Film ini sangat bagus dan menarik", "label": "positif", "tokens": ["film", "ini", "sangat", "bagus", "dan", "menarik"]},
    {"text": "Pelayanan toko sangat mengecewakan", "label": "negatif", "tokens": ["pelayanan", "toko", "sangat", "mengecewakan"]},
    {"text": "Produk berkualitas dengan harga terjangkau", "label": "positif", "tokens": ["produk", "berkualitas", "dengan", "harga", "terjangkau"]},
    {"text": "Barang rusak dan tidak sesuai deskripsi", "label": "negatif", "tokens": ["barang", "rusak", "dan", "tidak", "sesuai", "deskripsi"]},
]

# ============================================================
# PIPELINE STEPS
# ============================================================

PIPELINE_STEPS = [
    {
        "title": "Teks Mentah",
        "desc": "Input mentah dari pengguna. Bisa berupa review produk, komentar media sosial, email, atau dokumen apapun.",
        "example": "Film ini sangat bagus dan menarik",
    },
    {
        "title": "Preprocessing",
        "desc": "Teks dibersihkan: lowercasing, hapus tanda baca, tokenisasi, hapus stopwords (kata-kata seperti 'dan', 'ini', 'yang').",
        "example": "[film, sangat, bagus, menarik]",
    },
    {
        "title": "Vektorisasi",
        "desc": "Token dikonversi menjadi vektor numerik. Metode sederhana: Bag-of-Words (frekuensi kata). Metode lanjutan: TF-IDF atau word embeddings dari model pre-trained.",
        "example": "[0, 0, 2, 1, 0, 0, 1, 1, 0, ...]",
    },
    {
        "title": "Klasifikasi",
        "desc": "Vektor dimasukkan ke model classifier (Naive Bayes, SVM, Logistic Regression, atau Neural Network). Model menghasilkan skor untuk setiap kelas.",
        "example": "positif: 0.87, negatif: 0.13",
    },
    {
        "title": "Output",
        "desc": "Kelas dengan skor tertinggi menjadi prediksi akhir. Skor (confidence) menunjukkan seberapa yakin model dengan prediksinya.",
        "example": "Prediksi: POSITIF (87%)",
    },
]

# ============================================================
# DECISION BOUNDARIES (2D projection)
# ============================================================

# Generate synthetic 2D points for 3 classifiers
# Dim 0 = positive word count, Dim 1 = negative word count
def generate_points():
    points = []
    # Positive samples
    for _ in range(20):
        x = np.random.uniform(0.1, 0.9)
        y = np.random.uniform(0, 0.3)
        points.append({"x": round(float(x), 3), "y": round(float(y), 3), "label": "positif"})
    # Negative samples
    for _ in range(20):
        x = np.random.uniform(0, 0.3)
        y = np.random.uniform(0.1, 0.9)
        points.append({"x": round(float(x), 3), "y": round(float(y), 3), "label": "negatif"})
    # Neutral/mixed
    for _ in range(8):
        x = np.random.uniform(0.3, 0.6)
        y = np.random.uniform(0.3, 0.6)
        points.append({"x": round(float(x), 3), "y": round(float(y), 3), "label": "positif" if np.random.random() > 0.5 else "negatif"})
    return points

BOUNDARY_POINTS = generate_points()

# Classifier boundaries (as SVG path data or line definitions)
CLASSIFIERS = {
    "logistic": {
        "name": "Logistic Regression",
        "desc": "Garis lurus (linear) memisahkan kelas positif dan negatif. Cepat, interpretable, tapi terbatas untuk data yang tidak terpisah secara linear.",
        "boundary": {"type": "linear", "a": -1.0, "b": 0.85, "c": 0},
    },
    "naive_bayes": {
        "name": "Naive Bayes",
        "desc": "Berdasarkan teorema Bayes dengan asumsi independensi antar fitur. Probabilistik, cocok untuk text classification dasar, tapi asumsi independensi sering tidak terpenuhi.",
        "boundary": {"type": "linear", "a": -0.9, "b": 0.7, "c": 0.05},
    },
    "svm": {
        "name": "SVM (RBF Kernel)",
        "desc": "Support Vector Machine dengan kernel non-linear dapat membuat boundary melengkung. Lebih fleksibel dari logistic regression, tapi lebih lambat dan kurang interpretable.",
        "boundary": {"type": "rbf"},
    },
}

# ============================================================
# BERT FINE-TUNING STEPS
# ============================================================

BERT_STEPS = [
    {
        "title": "Pre-trained BERT",
        "desc": "Mulai dari model BERT yang sudah pre-trained pada korpus besar (misal IndoBERT untuk Bahasa Indonesia). Model sudah memahami struktur bahasa, tapi belum dilatih untuk tugas klasifikasi spesifik.",
        "detail": "IndoBERT-base: 12 layer, 768 dim, 12 heads, dilatih pada ~220M kata Bahasa Indonesia",
    },
    {
        "title": "Tambah Classification Head",
        "desc": "Tambahkan satu lapis linear di atas output token [CLS]. Lapis ini memetakan representasi 768-dimensi BERT ke jumlah kelas (misal 2: positif/negatif). Hanya lapis ini yang awalnya random.",
        "detail": "Classifier: Linear(768, 2) + Softmax",
    },
    {
        "title": "Fine-tuning",
        "desc": "Latih seluruh model (BERT + classification head) pada dataset berlabel dengan learning rate kecil (2e-5). Backpropagation menyesuaikan semua bobot, tapi perlahan karena BERT sudah belajar representasi yang baik.",
        "detail": "Epoch: 3-5 | LR: 2e-5 | Batch size: 16-32",
    },
    {
        "title": "Evaluasi",
        "desc": "Uji model pada test set yang tidak dilihat selama training. Metrik: accuracy, precision, recall, F1-score. Confusion matrix menunjukkan distribusi prediksi vs label sebenarnya.",
        "detail": "Metrik: Accuracy, Precision, Recall, F1-Score, Confusion Matrix",
    },
]

# Confusion matrix example (pre-computed)
CONFUSION = {
    "labels": ["positif", "negatif"],
    "matrix": [[42, 5], [3, 38]],
    "total": 88,
    "accuracy": 0.909,
    "precision_pos": 0.933,
    "recall_pos": 0.894,
    "f1_pos": 0.913,
}

# ============================================================
# ASSEMBLE
# ============================================================

data = {
    "sample_texts": SAMPLE_TEXTS,
    "pipeline_steps": PIPELINE_STEPS,
    "boundary_points": BOUNDARY_POINTS,
    "classifiers": CLASSIFIERS,
    "bert_steps": BERT_STEPS,
    "confusion": CONFUSION,
}

js = "// Auto-generated by generate_classification_data.py\n"
js += "// Text classification data for KupasAI NLP Week 7\n\n"
js += "const CLASSIFICATION_DATA = " + json.dumps(data, indent=2, ensure_ascii=False) + ";\n"

outpath = "/Users/felikssamosir/Documents/kupasai/nlp/text-classification/data.js"
with open(outpath, "w") as f:
    f.write(js)

print(f"Sample texts: {len(SAMPLE_TEXTS)}")
print(f"Pipeline steps: {len(PIPELINE_STEPS)}")
print(f"Boundary points: {len(BOUNDARY_POINTS)}")
print(f"Classifiers: {len(CLASSIFIERS)}")
print(f"BERT steps: {len(BERT_STEPS)}")
print(f"Confusion accuracy: {CONFUSION['accuracy']}")
print(f"Output: {len(js)} bytes -> {outpath}")

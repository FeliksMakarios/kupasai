#!/usr/bin/env python3
"""Generate word embeddings data for KupasAI Word Embeddings visualization."""

import json
import numpy as np
from numpy import mean, cov
from numpy.linalg import eig

# Semantic dimensions (1=strong presence, -1=strong absence, 0=neutral)
DIMENSIONS = [
    "gender_maskulin", "status_kerajaan", "usia_muda",
    "keluarga_inti", "keluarga_luas", "otoritas",
    "pendidikan", "formalitas", "positif", "abstrak",
]

WORDS = {
    "raja":       [ 0.95, 0.98, 0.0,  0.0,  0.0, 0.95, 0.0, 0.95, 0.3, 0.5],
    "ratu":       [-0.95, 0.98, 0.0,  0.0,  0.0, 0.92, 0.0, 0.95, 0.3, 0.5],
    "pangeran":   [ 0.90, 0.90, 0.7,  0.3,  0.0, 0.60, 0.0, 0.85, 0.4, 0.4],
    "putri":      [-0.90, 0.90, 0.7,  0.3,  0.0, 0.55, 0.0, 0.85, 0.4, 0.4],
    "sultan":     [ 0.92, 0.85, 0.0,  0.0,  0.0, 0.93, 0.2, 0.90, 0.2, 0.5],
    "ayah":       [ 0.90, 0.0, -0.3, 0.95, 0.0, 0.50, 0.0, 0.40, 0.7, 0.2],
    "ibu":        [-0.90, 0.0, -0.3, 0.95, 0.0, 0.48, 0.0, 0.40, 0.8, 0.2],
    "anak":       [ 0.0,  0.0,  0.9, 0.90, 0.0, 0.0,  0.2, 0.20, 0.8, 0.1],
    "putra":      [ 0.85, 0.0,  0.8, 0.85, 0.0, 0.10, 0.0, 0.50, 0.6, 0.2],
    "putri_perempuan": [-0.85, 0.0, 0.8, 0.85, 0.0, 0.08, 0.0, 0.50, 0.6, 0.2],
    "kakek":      [ 0.85, 0.0, -0.9, 0.30, 0.90, 0.40, 0.0, 0.45, 0.7, 0.2],
    "nenek":      [-0.85, 0.0, -0.9, 0.30, 0.90, 0.38, 0.0, 0.45, 0.8, 0.2],
    "paman":      [ 0.88, 0.0, -0.2, 0.10, 0.92, 0.30, 0.0, 0.35, 0.6, 0.2],
    "bibi":       [-0.88, 0.0, -0.2, 0.10, 0.92, 0.28, 0.0, 0.35, 0.7, 0.2],
    "sepupu":     [ 0.0,  0.0,  0.3, 0.0,  0.88, 0.0, 0.1, 0.20, 0.6, 0.2],
    "pria":       [ 0.95, 0.0,  0.0,  0.0,  0.0, 0.30, 0.0, 0.30, 0.3, 0.3],
    "wanita":     [-0.95, 0.0,  0.0,  0.0,  0.0, 0.25, 0.0, 0.30, 0.4, 0.3],
    "laki-laki":  [ 0.93, 0.0,  0.2,  0.0,  0.0, 0.20, 0.0, 0.15, 0.3, 0.2],
    "perempuan":  [-0.93, 0.0,  0.2,  0.0,  0.0, 0.18, 0.0, 0.15, 0.4, 0.2],
    "cowok":      [ 0.90, 0.0,  0.5,  0.0,  0.0, 0.0,  0.0, -0.5, 0.3, 0.1],
    "cewek":      [-0.90, 0.0,  0.5,  0.0,  0.0, 0.0,  0.0, -0.5, 0.4, 0.1],
    "guru":       [ 0.10, 0.0, -0.2, 0.0,  0.0, 0.45, 0.92, 0.60, 0.7, 0.3],
    "dosen":      [ 0.15, 0.0, -0.4, 0.0,  0.0, 0.60, 0.95, 0.75, 0.6, 0.3],
    "dokter":     [ 0.10, 0.0, -0.1, 0.0,  0.0, 0.70, 0.60, 0.80, 0.6, 0.3],
    "insinyur":   [ 0.30, 0.0,  0.0,  0.0,  0.0, 0.55, 0.50, 0.70, 0.4, 0.3],
    "presiden":   [ 0.20, 0.30, 0.0,  0.0,  0.0, 0.98, 0.20, 0.98, 0.3, 0.6],
    "menteri":    [ 0.25, 0.20, 0.0,  0.0,  0.0, 0.90, 0.30, 0.92, 0.3, 0.5],
    "perawat":    [-0.40, 0.0,  0.1,  0.0,  0.0, 0.45, 0.60, 0.60, 0.8, 0.3],
    "cinta":      [-0.20, 0.0,  0.0,  0.0,  0.0, 0.0,  0.0, 0.0,  0.98, 0.95],
    "kasih":      [-0.30, 0.0,  0.0,  0.2,  0.0, 0.0,  0.0, 0.0,  0.95, 0.90],
    "benci":      [ 0.10, 0.0,  0.0,  0.0,  0.0, 0.0,  0.0, 0.0, -0.90, 0.85],
    "marah":      [ 0.20, 0.0,  0.0,  0.0,  0.0, 0.30, 0.0, 0.10,-0.70, 0.75],
    "bahagia":    [ 0.0,  0.0,  0.3,  0.0,  0.0, 0.0,  0.0, 0.10, 0.92, 0.85],
    "sedih":      [ 0.0,  0.0,  0.0,  0.0,  0.0, 0.0,  0.0, 0.10,-0.80, 0.85],
    "takut":      [ 0.0,  0.0,  0.0,  0.0,  0.0, 0.0,  0.0, 0.0, -0.60, 0.80],
    "sekolah":    [ 0.0,  0.0,  0.3,  0.0,  0.0, 0.50, 0.95, 0.70, 0.3, 0.60],
    "universitas":[ 0.0,  0.0,  0.0,  0.0,  0.0, 0.70, 0.98, 0.85, 0.3, 0.65],
    "rumah":      [ 0.0,  0.0,  0.0,  0.5,  0.3, 0.0,  0.0, 0.20, 0.5, 0.30],
    "istana":     [ 0.10, 0.85, 0.0,  0.0,  0.0, 0.92, 0.0, 0.95, 0.3, 0.55],
    "kerja":      [ 0.10, 0.0,  0.0,  0.0,  0.0, 0.40, 0.30, 0.50, 0.2, 0.40],
    "belajar":    [ 0.0,  0.0,  0.5,  0.0,  0.0, 0.0,  0.90, 0.40, 0.5, 0.40],
}

CATEGORIES = {
    "raja": "kerajaan", "ratu": "kerajaan", "pangeran": "kerajaan",
    "putri": "kerajaan", "sultan": "kerajaan", "istana": "kerajaan",
    "ayah": "keluarga", "ibu": "keluarga", "anak": "keluarga",
    "putra": "keluarga", "putri_perempuan": "keluarga",
    "kakek": "keluarga", "nenek": "keluarga", "paman": "keluarga",
    "bibi": "keluarga", "sepupu": "keluarga", "rumah": "keluarga",
    "pria": "gender", "wanita": "gender", "laki-laki": "gender",
    "perempuan": "gender", "cowok": "gender", "cewek": "gender",
    "guru": "profesi", "dosen": "profesi", "dokter": "profesi",
    "insinyur": "profesi", "presiden": "profesi", "menteri": "profesi",
    "perawat": "profesi",
    "cinta": "emosi", "kasih": "emosi", "benci": "emosi", "marah": "emosi",
    "bahagia": "emosi", "sedih": "emosi", "takut": "emosi",
    "sekolah": "institusi", "universitas": "institusi",
    "kerja": "aksi", "belajar": "aksi",
}

word_list = list(WORDS.keys())
vectors = np.array([WORDS[w] for w in word_list], dtype=float)

# PCA
vectors_std = (vectors - mean(vectors, axis=0)) / (vectors.std(axis=0) + 1e-8)
cov_matrix = cov(vectors_std.T)
eigenvalues, eigenvectors = eig(cov_matrix)
idx = eigenvalues.argsort()[::-1]
eigenvectors = eigenvectors[:, idx]
eigenvalues_sorted = eigenvalues[idx]
pca_2d = vectors_std @ eigenvectors[:, :2]

# Scale to [-1, 1]
for i in range(2):
    col = pca_2d[:, i].real
    col = (col - col.min()) / (col.max() - col.min() + 1e-8) * 2 - 1
    pca_2d[:, i] = col

def cosine_sim(a, b):
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8))

def find_nearest(target_vec, exclude_words):
    best_word = None
    best_sim = -2.0
    for j, w in enumerate(word_list):
        if w in exclude_words:
            continue
        sim = cosine_sim(target_vec, vectors[j])
        if sim > best_sim:
            best_sim = sim
            best_word = w
    return best_word, round(best_sim, 3)

data = {"dimensions": DIMENSIONS, "words": []}
for i, word in enumerate(word_list):
    data["words"].append({
        "word": word,
        "vector": [round(float(x), 3) for x in WORDS[word]],
        "x": round(float(pca_2d[i, 0]), 4),
        "y": round(float(pca_2d[i, 1]), 4),
        "category": CATEGORIES.get(word, "lainnya"),
    })

analogies = [
    {"a": "raja", "b": "pria", "c": "wanita", "label": "raja - pria + wanita = ?"},
    {"a": "pangeran", "b": "putra", "c": "putri_perempuan", "label": "pangeran - putra + putri = ?"},
    {"a": "ayah", "b": "pria", "c": "wanita", "label": "ayah - pria + wanita = ?"},
    {"a": "kakek", "b": "paman", "c": "bibi", "label": "kakek - paman + bibi = ?"},
    {"a": "raja", "b": "presiden", "c": "dosen", "label": "raja - presiden + dosen = ?"},
]

for an in analogies:
    a_vec = np.array(WORDS[an["a"]], dtype=float)
    b_vec = np.array(WORDS[an["b"]], dtype=float)
    c_vec = np.array(WORDS[an["c"]], dtype=float)
    target = a_vec - b_vec + c_vec
    result, sim = find_nearest(target, {an["a"], an["b"], an["c"]})
    an["result"] = result
    an["similarity"] = sim

data["preset_analogies"] = analogies
explained_var = eigenvalues_sorted / eigenvalues_sorted.sum()
data["pca_info"] = {
    "pc1_explained": round(float(explained_var[0].real) * 100, 1),
    "pc2_explained": round(float(explained_var[1].real) * 100, 1),
}

print(f"Words: {len(word_list)}")
print(f"PC1: {data['pca_info']['pc1_explained']}%, PC2: {data['pca_info']['pc2_explained']}%")
for an in analogies:
    print(f"  {an['a']} - {an['b']} + {an['c']} = {an['result']} (cos={an['similarity']})")

js_output = "// Auto-generated by generate_embeddings.py\n"
js_output += "// Word embeddings for KupasAI NLP visualization\n\n"
js_output += "const EMBEDDING_DATA = " + json.dumps(data, indent=2, ensure_ascii=False) + ";\n"

outpath = "/Users/felikssamosir/Documents/kupasai/nlp/word-embeddings/data.js"
with open(outpath, "w") as f:
    f.write(js_output)
print(f"\nWritten: {len(js_output)} bytes -> {outpath}")

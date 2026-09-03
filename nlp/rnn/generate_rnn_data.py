#!/usr/bin/env python3
"""
KupasAI - RNN Visualization Data Generator (v2)
Fixed: designed weights for correct sentiment, new sentences, new vocab.
"""

import json
import os
import numpy as np

np.random.seed(42)

# ============================================================
# VOCABULARY: Bahasa Indonesia word embeddings (5D)
# Dims: [gender, sentiment, action, formality, intensity]
# ============================================================

VOCAB = {
    "saya":         [0.0,  0.0,  0.0,  0.3, 0.1],
    "dia":          [0.0,  0.0,  0.0,  0.2, 0.1],
    "aku":          [0.0,  0.0,  0.0,  0.2, 0.1],
    "kamu":         [0.0,  0.1,  0.0,  0.1, 0.1],
    "suka":         [0.0,  0.8,  0.4,  0.0, 0.5],
    "cinta":        [0.0,  0.9,  0.0,  0.0, 0.8],
    "benci":        [0.0, -0.8,  0.0,  0.0, 0.6],
    "ketidakadilan":[0.0, -0.7,  0.0,  0.3, 0.5],
    "belajar":      [0.0,  0.3,  0.7,  0.3, 0.3],
    "indonesia":    [0.0,  0.1,  0.0,  0.4, 0.2],
    "makan":        [0.1,  0.3,  0.9, -0.2, 0.3],
    "tidur":        [0.0,  0.2, -0.3, -0.3, 0.1],
    "buku":         [0.0,  0.1, -0.2,  0.4, 0.0],
    "bagus":        [0.0,  0.9,  0.1,  0.2, 0.7],
    "jelek":        [0.0, -0.8,  0.0,  0.0, 0.6],
    "guru":         [0.3,  0.3,  0.5,  0.6, 0.2],
    "sekolah":      [0.0,  0.2,  0.3,  0.5, 0.2],
    "main":         [0.1,  0.7,  0.8, -0.3, 0.5],
    "kerja":        [0.2,  0.2,  0.9,  0.4, 0.4],
    "senang":       [0.0,  0.9,  0.0,  0.0, 0.7],
    "sedih":        [0.0, -0.8,  0.0,  0.0, 0.6],
    "kopi":         [0.0,  0.4,  0.2, -0.1, 0.3],
    "film":         [0.0,  0.3, -0.1, -0.2, 0.3],
}

EMBED_DIM = 5
HIDDEN_DIM = 4

# ============================================================
# DESIGNED WEIGHTS (not random) for correct sentiment behavior
# h0 = sentiment accumulator, driven by embedding dim 1
# ============================================================

W_xh = np.array([
    [0.0,  0.0,  0.0,  0.0],   # gender -> nothing
    [1.5,  0.2,  0.1,  0.0],   # sentiment -> h0 (strong), minor to others
    [0.1,  0.0,  0.8,  0.1],   # action -> h2
    [0.0,  0.1,  0.0,  0.5],   # formality -> h3
    [0.0,  0.0,  0.0,  0.3],   # intensity -> h3
])

W_hh = np.array([
    [0.85, 0.0,  0.0,  0.0],   # h0 preserves (sentiment memory)
    [0.0,  0.7,  0.0,  0.0],
    [0.0,  0.0,  0.7,  0.0],
    [0.0,  0.0,  0.0,  0.7],
])

b_h = np.array([0.0, 0.0, 0.0, 0.0])

W_hy = np.array([
    [2.5, -2.5],   # h0 -> [positive, negative]
    [0.2,  0.1],
    [0.1,  0.1],
    [0.1,  0.2],
])

b_y = np.array([0.0, 0.0])

def tanh(x):
    return np.tanh(x)

def softmax(x):
    e = np.exp(x - np.max(x))
    return e / e.sum()

def rnn_forward(words):
    h = np.zeros(HIDDEN_DIM)
    states = []
    for word in words:
        x = np.array(VOCAB[word])
        h_pre = x @ W_xh + h @ W_hh + b_h
        h = tanh(h_pre)
        y = softmax(h @ W_hy + b_y)
        states.append({
            "word": word,
            "input": [round(float(v), 3) for v in x],
            "hidden_pre": [round(float(v), 3) for v in h_pre],
            "hidden": [round(float(v), 3) for v in h],
            "output": [round(float(v), 3) for v in y],
        })
    return states

# ============================================================
# FORWARD PASS SENTENCES
# ============================================================

SENTENCES = [
    ["saya", "suka", "belajar"],
    ["dia", "benci", "ketidakadilan"],
    ["aku", "cinta", "indonesia"],
]

# Verify predictions
for sent in SENTENCES:
    states = rnn_forward(sent)
    final = states[-1]
    pred = "positif" if final["output"][0] > final["output"][1] else "negatif"
    conf = max(final["output"])
    print(f"  {' '.join(sent):30s} -> {pred} ({conf*100:.1f}%)")

# ============================================================
# VANISHING GRADIENT (same as before)
# ============================================================

def compute_gradient_flow(seq_len, weight_scale=0.5):
    W = np.random.randn(HIDDEN_DIM, HIDDEN_DIM) * weight_scale
    grad = np.ones(HIDDEN_DIM)
    norms = []
    for t in range(seq_len):
        grad = W.T @ grad
        grad = grad * 0.9
        norms.append(round(float(np.linalg.norm(grad)), 4))
    return norms

gradient_data = {}
for seq_len in [5, 10, 15, 20]:
    gradient_data[str(seq_len)] = {
        "rnn": compute_gradient_flow(seq_len, 0.5),
        "lstm": compute_gradient_flow(seq_len, 0.9),
    }

# ============================================================
# SENTENCE REPRESENTATIONS
# ============================================================

def bow_vector(words):
    vec = np.zeros(len(VOCAB))
    vocab_list = list(VOCAB.keys())
    for word in words:
        if word in vocab_list:
            vec[vocab_list.index(word)] = 1
    return vec

def avg_vector(words):
    vecs = [np.array(VOCAB[w]) for w in words if w in VOCAB]
    return np.mean(vecs, axis=0) if vecs else np.zeros(EMBED_DIM)

def rnn_final_hidden(words):
    states = rnn_forward(words)
    return np.array(states[-1]["hidden"]) if states else np.zeros(HIDDEN_DIM)

REP_SENTENCES = [
    {"words": ["saya", "suka", "belajar"], "label": "saya suka belajar"},
    {"words": ["dia", "benci", "ketidakadilan"], "label": "dia benci ketidakadilan"},
    {"words": ["aku", "cinta", "indonesia"], "label": "aku cinta indonesia"},
    {"words": ["belajar", "suka", "saya"], "label": "belajar suka saya"},
    {"words": ["ketidakadilan", "benci", "dia"], "label": "ketidakadilan benci dia"},
    {"words": ["indonesia", "cinta", "aku"], "label": "indonesia cinta aku"},
    {"words": ["aku", "suka", "belajar"], "label": "aku suka belajar"},
    {"words": ["saya", "benci", "ketidakadilan"], "label": "saya benci ketidakadilan"},
    {"words": ["dia", "cinta", "indonesia"], "label": "dia cinta indonesia"},
    {"words": ["aku", "benci", "belajar"], "label": "aku benci belajar"},
    {"words": ["saya", "cinta", "belajar"], "label": "saya cinta belajar"},
]

def project_2d(vectors_list):
    V = np.array(vectors_list)
    if V.shape[1] < 2:
        V = np.hstack([V, np.zeros((V.shape[0], 2 - V.shape[1]))])
    V_std = (V - V.mean(axis=0)) / (V.std(axis=0) + 1e-8)
    cov = np.cov(V_std.T)
    eigvals, eigvecs = np.linalg.eigh(cov)
    idx = eigvals.argsort()[::-1]
    pca = V_std @ eigvecs[:, idx[:2]]
    for i in range(2):
        col = pca[:, i]
        rng = col.max() - col.min() + 1e-8
        pca[:, i] = (col - col.min()) / rng * 2 - 1
    return pca

bow_vecs = [bow_vector(s["words"]) for s in REP_SENTENCES]
avg_vecs = [avg_vector(s["words"]) for s in REP_SENTENCES]
rnn_vecs = [rnn_final_hidden(s["words"]) for s in REP_SENTENCES]

bow_2d = project_2d(bow_vecs)
avg_2d = project_2d(avg_vecs)
rnn_2d = project_2d(rnn_vecs)

rep_data = {
    "sentences": [{"label": s["label"], "words": s["words"]} for s in REP_SENTENCES],
    "methods": {},
    "swap_pairs": [
        {"a_idx": 0, "b_idx": 3, "label_a": "saya suka belajar", "label_b": "belajar suka saya"}
    ],
}

for key, label, coords in [
    ("bow", "Bag-of-Words", bow_2d),
    ("avg", "Average Vectors", avg_2d),
    ("rnn", "RNN Hidden State", rnn_2d),
]:
    rep_data["methods"][key] = {
        "label": label,
        "points": [
            {
                "label": REP_SENTENCES[i]["label"],
                "x": round(float(coords[i, 0]), 4),
                "y": round(float(coords[i, 1]), 4),
            }
            for i in range(len(REP_SENTENCES))
        ],
    }

# ============================================================
# ASSEMBLE
# ============================================================

data = {
    "vocab": {k: [round(float(v), 3) for v in val] for k, val in VOCAB.items()},
    "embed_dim": EMBED_DIM,
    "hidden_dim": HIDDEN_DIM,
    "weights": {
        "W_xh": [[round(float(v), 3) for v in row] for row in W_xh],
        "W_hh": [[round(float(v), 3) for v in row] for row in W_hh],
        "W_hy": [[round(float(v), 3) for v in row] for row in W_hy],
    },
    "sentences": [{"words": s, "states": rnn_forward(s)} for s in SENTENCES],
    "gradient_data": gradient_data,
    "representations": rep_data,
}

js = "// Auto-generated by generate_rnn_data.py\n// RNN visualization data for KupasAI NLP Week 2-4\n\n"
js += "const RNN_DATA = " + json.dumps(data, indent=2, ensure_ascii=False) + ";\n"

outpath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data.js")
with open(outpath, "w") as f:
    f.write(js)

print(f"\nVocab: {len(VOCAB)} words | Sentences: {len(SENTENCES)} | Rep sentences: {len(REP_SENTENCES)}")
print(f"Output: {len(js)} bytes -> {outpath}")

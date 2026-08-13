#!/usr/bin/env python3
"""
KupasAI - RNN Visualization Data Generator
Generates pre-computed RNN forward pass, gradient flow, and sentence
representation data for the NLP Week 2-4 visualization.
"""

import json
import numpy as np
from numpy import mean

np.random.seed(42)

# ============================================================
# VOCABULARY: small Bahasa Indonesia word embeddings (5D)
# Dimensions: [gender, positive, action, formality, intensity]
# ============================================================

VOCAB = {
    "saya":      [0.0,  0.0,  0.0,  0.3, 0.1],
    "kamu":      [0.0,  0.1,  0.0,  0.1, 0.1],
    "suka":      [0.0,  0.7,  0.4,  0.0, 0.5],
    "benci":     [0.0, -0.7,  0.0,  0.0, 0.6],
    "makan":     [0.1,  0.3,  0.9, -0.2, 0.3],
    "belajar":   [0.0,  0.4,  0.7,  0.3, 0.4],
    "tidur":     [0.0,  0.2, -0.3, -0.3, 0.1],
    "buku":      [0.0,  0.1, -0.2,  0.4, 0.0],
    "bagus":     [0.0,  0.9,  0.1,  0.2, 0.7],
    "jelek":     [0.0, -0.8,  0.0,  0.0, 0.6],
    "guru":      [0.3,  0.3,  0.5,  0.6, 0.2],
    "sekolah":   [0.0,  0.2,  0.3,  0.5, 0.2],
    "main":      [0.1,  0.7,  0.8, -0.3, 0.5],
    "kerja":     [0.2,  0.2,  0.9,  0.4, 0.4],
    "senang":    [0.0,  0.9,  0.0,  0.0, 0.7],
    "sedih":     [0.0, -0.8,  0.0,  0.0, 0.6],
    "kopi":      [0.0,  0.4,  0.2, -0.1, 0.3],
    "film":      [0.0,  0.3, -0.1, -0.2, 0.3],
}

EMBED_DIM = 5
HIDDEN_DIM = 4

# ============================================================
# RNN WEIGHTS
# ============================================================

# Small random weights (scaled for educational clarity)
W_xh = np.random.randn(EMBED_DIM, HIDDEN_DIM) * 0.5
W_hh = np.random.randn(HIDDEN_DIM, HIDDEN_DIM) * 0.5
b_h = np.random.randn(HIDDEN_DIM) * 0.1
W_hy = np.random.randn(HIDDEN_DIM, 2) * 0.5  # output: [sentiment_pos, sentiment_neg]
b_y = np.random.randn(2) * 0.1

def tanh(x):
    return np.tanh(x)

def softmax(x):
    e = np.exp(x - np.max(x))
    return e / e.sum()

def rnn_forward(words):
    """Run forward pass through RNN, return hidden states and outputs."""
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

# Sample sentences for forward pass demo
SENTENCES = [
    ["saya", "suka", "belajar"],
    ["kamu", "benci", "jelek"],
    ["guru", "bagus", "belajar"],
]

# ============================================================
# VANISHING GRADIENT
# ============================================================

def compute_gradient_flow(seq_len, weight_scale=0.5):
    """
    Simulate gradient magnitude at each timestep during BPTT.
    Returns gradient norms going backwards from t=seq_len to t=0.
    """
    W = np.random.randn(HIDDEN_DIM, HIDDEN_DIM) * weight_scale
    # Gradient of loss w.r.t. final hidden state
    grad = np.ones(HIDDEN_DIM)
    norms = []
    for t in range(seq_len):
        # Backprop through one timestep: grad = W^T @ grad * (1 - h^2)
        # Simplified: just track norm decay through repeated W multiplication
        grad = W.T @ grad
        grad = grad * 0.9  # approximate tanh derivative factor
        norms.append(round(float(np.linalg.norm(grad)), 4))
    return norms

# Generate gradient data for different sequence lengths
gradient_data = {}
for seq_len in [5, 10, 15, 20]:
    gradient_data[str(seq_len)] = {
        "rnn": compute_gradient_flow(seq_len, 0.5),
        "lstm": compute_gradient_flow(seq_len, 0.9),  # LSTM gates preserve gradient better
    }

# ============================================================
# SENTENCE REPRESENTATIONS
# ============================================================

def bow_vector(words):
    """Bag-of-words: binary vector over vocabulary."""
    vec = np.zeros(len(VOCAB))
    vocab_list = list(VOCAB.keys())
    for word in words:
        if word in vocab_list:
            vec[vocab_list.index(word)] = 1
    return vec

def avg_vector(words):
    """Average of word embeddings."""
    vecs = [np.array(VOCAB[w]) for w in words if w in VOCAB]
    return np.mean(vecs, axis=0) if vecs else np.zeros(EMBED_DIM)

def rnn_final_hidden(words):
    """Final hidden state of RNN after processing sentence."""
    states = rnn_forward(words)
    return np.array(states[-1]["hidden"]) if states else np.zeros(HIDDEN_DIM)

# Sentences for representation comparison (including word-swap pairs)
REP_SENTENCES = [
    {"words": ["saya", "suka", "belajar"], "label": "saya suka belajar"},
    {"words": ["saya", "benci", "belajar"], "label": "saya benci belajar"},
    {"words": ["saya", "suka", "main"], "label": "saya suka main"},
    {"words": ["saya", "benci", "main"], "label": "saya benci main"},
    {"words": ["kamu", "suka", "belajar"], "label": "kamu suka belajar"},
    {"words": ["kamu", "benci", "belajar"], "label": "kamu benci belajar"},
    {"words": ["guru", "bagus", "belajar"], "label": "guru bagus belajar"},
    {"words": ["belajar", "suka", "saya"], "label": "belajar suka saya (dibalik)"},
    {"words": ["suka", "saya", "belajar"], "label": "suka saya belajar (acak)"},
    {"words": ["kamu", "senang", "kopi"], "label": "kamu senang kopi"},
    {"words": ["saya", "makan", "bagus"], "label": "saya makan bagus"},
    {"words": ["film", "bagus", "senang"], "label": "film bagus senang"},
]

def project_2d(vectors_list):
    """PCA project list of vectors to 2D, return scaled to [-1, 1]."""
    V = np.array(vectors_list)
    if V.shape[1] < 2:
        # Pad with zeros if needed
        V = np.hstack([V, np.zeros((V.shape[0], 2 - V.shape[1]))])
    V_std = (V - V.mean(axis=0)) / (V.std(axis=0) + 1e-8)
    cov = np.cov(V_std.T)
    eigvals, eigvecs = np.linalg.eigh(cov)
    idx = eigvals.argsort()[::-1]
    pca = V_std @ eigvecs[:, idx[:2]]
    # Scale to [-1, 1]
    for i in range(2):
        col = pca[:, i]
        rng = col.max() - col.min() + 1e-8
        pca[:, i] = (col - col.min()) / rng * 2 - 1
    return pca

# Compute representations for all three methods
bow_vecs = [bow_vector(s["words"]) for s in REP_SENTENCES]
avg_vecs = [avg_vector(s["words"]) for s in REP_SENTENCES]
rnn_vecs = [rnn_final_hidden(s["words"]) for s in REP_SENTENCES]

# Project each method's representations to 2D independently
bow_2d = project_2d(bow_vecs)
avg_2d = project_2d(avg_vecs)
rnn_2d = project_2d(rnn_vecs)

rep_data = {
    "sentences": [{"label": s["label"], "words": s["words"]} for s in REP_SENTENCES],
    "methods": {}
}

methods = [
    ("bow", "Bag-of-Words", bow_2d),
    ("avg", "Average Vectors", avg_2d),
    ("rnn", "RNN Hidden State", rnn_2d),
]

for key, label, coords in methods:
    rep_data["methods"][key] = {
        "label": label,
        "points": [
            {
                "label": REP_SENTENCES[i]["label"],
                "x": round(float(coords[i, 0]), 4),
                "y": round(float(coords[i, 1]), 4),
            }
            for i in range(len(REP_SENTENCES))
        ]
    }

# Word swap pairs (to show order sensitivity)
swap_pairs = [
    {"original": "saya suka belajar", "swapped": "belajar suka saya",
     "original_idx": 0, "swapped_idx": 7},
]

rep_data["swap_pairs"] = [
    {"a_idx": 0, "b_idx": 7, "label_a": "saya suka belajar", "label_b": "belajar suka saya (dibalik)"}
]

# ============================================================
# ASSEMBLE OUTPUT
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
    "sentences": [],
    "gradient_data": gradient_data,
    "representations": rep_data,
}

for sent in SENTENCES:
    states = rnn_forward(sent)
    data["sentences"].append({
        "words": sent,
        "states": states,
    })

# Output
js_output = "// Auto-generated by generate_rnn_data.py\n"
js_output += "// RNN visualization data for KupasAI NLP Week 2-4\n\n"
js_output += "const RNN_DATA = " + json.dumps(data, indent=2, ensure_ascii=False) + ";\n"

outpath = "/Users/felikssamosir/Documents/kupasai/nlp/rnn/data.js"
with open(outpath, "w") as f:
    f.write(js_output)

print(f"Vocabulary: {len(VOCAB)} words")
print(f"Embedding dim: {EMBED_DIM}, Hidden dim: {HIDDEN_DIM}")
print(f"Sentences for forward pass: {len(SENTENCES)}")
print(f"Gradient seq lengths: {list(gradient_data.keys())}")
print(f"Representation sentences: {len(REP_SENTENCES)}")
print(f"Output: {len(js_output)} bytes -> {outpath}")

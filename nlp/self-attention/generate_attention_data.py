#!/usr/bin/env python3
"""
KupasAI - Self-Attention Visualization Data Generator
Pre-computes QKV, attention weights, and multi-head attention for NLP Week 5-6.
"""

import json
import os
import numpy as np

np.random.seed(42)

# ============================================================
# VOCAB: word embeddings (8D) for attention demo
# Dims: [gender, sentiment, action, formality, intensity, entity, location, temporal]
# ============================================================

VOCAB = {
    "kucing":  [0.1,  0.4,  0.3, 0.0, 0.2, 0.3, 0.0, 0.0],
    "hitam":   [0.0,  0.1,  0.0, 0.0, 0.1, 0.2, 0.0, 0.0],
    "duduk":   [0.0,  0.2,  0.8, 0.0, 0.3, 0.0, 0.0, 0.0],
    "diatas":  [0.0,  0.0,  0.2, 0.0, 0.1, 0.0, 0.5, 0.0],
    "karpet":  [0.0,  0.2,  0.0, 0.0, 0.1, 0.4, 0.3, 0.0],
    "pelihara": [0.0, 0.3,  0.7, 0.2, 0.3, 0.3, 0.0, 0.0],
    "anjing":  [0.2,  0.4,  0.4, 0.0, 0.2, 0.4, 0.0, 0.0],
    "makan":   [0.1,  0.3,  0.9, 0.0, 0.4, 0.0, 0.0, 0.0],
    "makanan": [0.0,  0.2,  0.3, 0.0, 0.2, 0.4, 0.0, 0.0],
    "mahasiswa": [0.3, 0.2, 0.5, 0.6, 0.2, 0.5, 0.0, 0.0],
    "membaca": [0.0,  0.4,  0.8, 0.3, 0.3, 0.0, 0.0, 0.0],
    "buku":    [0.0,  0.1,  0.1, 0.3, 0.1, 0.4, 0.0, 0.0],
    "perpustakaan": [0.0, 0.2, 0.1, 0.5, 0.2, 0.5, 0.7, 0.0],
    "guru":    [0.4,  0.3,  0.6, 0.7, 0.2, 0.5, 0.0, 0.0],
    "mengajar": [0.0, 0.3, 0.9, 0.4, 0.3, 0.0, 0.0, 0.0],
    "kelas":   [0.0,  0.2,  0.2, 0.5, 0.2, 0.4, 0.6, 0.0],
}

EMBED_DIM = 8

# ============================================================
# SENTENCES for attention demo
# ============================================================

SENTENCES = [
    ["kucing", "hitam", "duduk", "diatas", "karpet"],
    ["mahasiswa", "membaca", "buku", "di", "perpustakaan"],
    ["anjing", "makan", "makanan"],
]

# For sentence 2, add "di" which isn't in vocab
VOCAB["di"] = [0.0, 0.0, 0.1, 0.0, 0.0, 0.0, 0.4, 0.0]

# ============================================================
# ATTENTION COMPUTATION
# ============================================================

def softmax(x, axis=-1):
    e = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return e / e.sum(axis=axis, keepdims=True)

def compute_attention(words, W_q, W_k, W_v, head_dim=4):
    """Compute single-head attention for a sequence."""
    # Input embeddings
    X = np.array([VOCAB[w] for w in words])

    # Project to Q, K, V
    Q = X @ W_q  # (seq_len, head_dim)
    K = X @ W_k
    V = X @ W_v

    # Attention scores: Q @ K^T / sqrt(d)
    scores = Q @ K.T / np.sqrt(head_dim)

    # Attention weights
    weights = softmax(scores, axis=-1)

    # Output
    output = weights @ V

    return {
        "words": words,
        "Q": [[round(float(v), 3) for v in row] for row in Q],
        "K": [[round(float(v), 3) for v in row] for row in K],
        "V": [[round(float(v), 3) for v in row] for row in V],
        "scores": [[round(float(v), 3) for v in row] for row in scores],
        "weights": [[round(float(v), 3) for v in row] for row in weights],
        "output": [[round(float(v), 3) for v in row] for row in output],
    }

# Designed weight matrices for meaningful attention patterns.
#
# Q/K are scaled up (QK_SCALE) beyond the hand-picked [0/1] entries below.
# With unscaled unit weights the raw embeddings (values in [0, 1]) produce
# Q.K^T logits so small that softmax(logits / sqrt(d)) comes out almost
# uniform (~0.20 everywhere) - technically correct but pedagogically
# useless, since the heatmap can't show a "which word attends to which"
# story if every cell looks the same. Scaling sharpens the softmax to a
# legible but still soft (non one-hot) distribution. V is left unscaled -
# it only sets the output vector magnitude, not the attention pattern.
QK_SCALE = 4.0

# Head 1: "syntactic" - focuses on action verbs connecting to subjects
W_q_1 = np.zeros((EMBED_DIM, 4))
W_q_1[2, :] = [1, 0, 0, 0]  # action dim -> query for "what am I doing?"
W_q_1[5, :] = [0, 1, 0, 0]  # entity dim -> query for "who is doing this?"
W_k_1 = np.zeros((EMBED_DIM, 4))
W_k_1[5, :] = [1, 0, 0, 0]  # entity -> key for subject matching
W_k_1[2, :] = [0, 1, 0, 0]  # action -> key for verb matching
W_q_1 *= QK_SCALE
W_k_1 *= QK_SCALE
W_v_1 = np.zeros((EMBED_DIM, 4))
W_v_1[5, :] = [0.8, 0, 0, 0]  # pass through entity info
W_v_1[1, :] = [0, 0.5, 0, 0]  # pass through sentiment

# Head 2: "location" - focuses on spatial relationships
W_q_2 = np.zeros((EMBED_DIM, 4))
W_q_2[6, :] = [1, 0, 0, 0]  # location dim -> "where is this?"
W_q_2[2, :] = [0, 1, 0, 0]
W_k_2 = np.zeros((EMBED_DIM, 4))
W_k_2[6, :] = [1, 0, 0, 0]
W_k_2[5, :] = [0, 0.5, 0, 0]
W_q_2 *= QK_SCALE
W_k_2 *= QK_SCALE
W_v_2 = np.zeros((EMBED_DIM, 4))
W_v_2[6, :] = [0.8, 0, 0, 0]
W_v_2[5, :] = [0, 0.6, 0, 0]

# Head 3: "sentiment/semantic" - focuses on semantic similarity
W_q_3 = np.random.randn(EMBED_DIM, 4) * 2.0
W_k_3 = np.random.randn(EMBED_DIM, 4) * 2.0
W_v_3 = np.random.randn(EMBED_DIM, 4) * 0.5

HEADS = [
    {"name": "Head 1: Sintaktik", "W_q": W_q_1, "W_k": W_k_1, "W_v": W_v_1},
    {"name": "Head 2: Lokasi", "W_q": W_q_2, "W_k": W_k_2, "W_v": W_v_2},
    {"name": "Head 3: Semantik", "W_q": W_q_3, "W_k": W_k_3, "W_v": W_v_3},
]

# ============================================================
# GENERATE ALL DATA
# ============================================================

data = {
    "embed_dim": EMBED_DIM,
    "head_dim": 4,
    "num_heads": len(HEADS),
    "vocab": {k: [round(float(v), 3) for v in val] for k, val in VOCAB.items()},
    "sentences": [],
    "heads": [],
}

# For each sentence, compute attention for each head
for sent_idx, sent in enumerate(SENTENCES):
    sent_data = {"words": sent, "heads": []}

    for head_idx, head in enumerate(HEADS):
        att = compute_attention(sent, head["W_q"], head["W_k"], head["W_v"], 4)
        att["head_name"] = head["name"]
        sent_data["heads"].append(att)

    # Default to head 0 for single-head display
    att0 = compute_attention(sent, W_q_1, W_k_1, W_v_1, 4)
    sent_data["single_head"] = att0

    data["sentences"].append(sent_data)

# Head metadata
for head in HEADS:
    data["heads"].append({"name": head["name"]})

js = "// Auto-generated by generate_attention_data.py\n"
js += "// Self-attention data for KupasAI NLP Week 5-6\n\n"
js += "const ATTENTION_DATA = " + json.dumps(data, indent=2, ensure_ascii=False) + ";\n"

outpath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data.js")
with open(outpath, "w") as f:
    f.write(js)

print(f"Vocab: {len(VOCAB)} words")
print(f"Sentences: {len(SENTENCES)}")
print(f"Heads: {len(HEADS)}")
for sent in SENTENCES:
    print(f"  {' '.join(sent)}")
print(f"Output: {len(js)} bytes -> {outpath}")

"""
KupasAI - Modul 4: Jaringan Syaraf Tiruan
Implementasi independen, diverifikasi terhadap kriteria pada
Modul_4_Jaringan_Syaraf_Tiruan (RPS INF20052 Kecerdasan Komputasional).
"""
import json
import math
import numpy as np

rng = np.random.default_rng(42)

# ============================================================
# TUGAS 1 -- GARIS BATAS KEPUTUSAN JARINGAN 2 x 1
# ============================================================
THETA = 0.5

def bobot_dari_dua_titik(p, q, theta=THETA):
    x1p, x2p = p
    x1q, x2q = q
    det = x1p * x2q - x2p * x1q
    w1 = theta * (x2q - x2p) / det
    w2 = theta * (x1p - x1q) / det
    return w1, w2

kasus = [
    ((0.5, 0.0), (0.0, 0.5), (1.0, 1.0)),
    ((0.5, 1.0), (1.0, 0.5), (1 / 3, 1 / 3)),
    ((0.5, 0.0), (1.0, 0.5), (1.0, -1.0)),
    ((0.0, 0.5), (0.5, 1.0), (-1.0, 1.0)),
]
garis_hasil = []
for p, q, harap in kasus:
    w = bobot_dari_dua_titik(p, q)
    assert abs(w[0] - harap[0]) < 1e-6 and abs(w[1] - harap[1]) < 1e-6, (p, q, w, harap)
    garis_hasil.append({"p": list(p), "q": list(q), "w1": w[0], "w2": w[1]})
print("Tugas1 Garis batas:", garis_hasil)

# ============================================================
# TUGAS 2 -- PERAMBATAN MAJU 3 x 3 x 2 (Contoh 7.3)
# ============================================================
WH = np.array([[0.28, 0.22, 0.81],
               [0.63, 0.32, 0.07],
               [0.88, 0.76, 0.12]])
WO = np.array([[0.68, 0.09],
               [0.23, 0.43],
               [0.21, 0.93]])

def sigmoid_biner(x):
    return 1 / (1 + np.exp(-2 * (x - 0.5)))

def forward(X, WH, WO):
    NH = X @ WH
    OH = sigmoid_biner(NH)
    NO = OH @ WO
    O = sigmoid_biner(NO)
    return NH, OH, NO, O

assert abs(sigmoid_biner(0.5) - 0.5) < 1e-12
assert sigmoid_biner(10) > 0.99 and sigmoid_biner(-10) < 0.01
X_demo = np.array([[0.9, 0.1, 0.5], [0.1, 0.9, 0.5], [0.5, 0.5, 0.9], [0.2, 0.2, 0.2]])
NH, OH, NO, O = forward(X_demo, WH, WO)
assert NH.shape == (4, 3) and OH.shape == (4, 3)
assert NO.shape == (4, 2) and O.shape == (4, 2)
assert (O >= 0).all() and (O <= 1).all()
print("Tugas2 Forward O:\n", np.round(O, 4))

# ============================================================
# TUGAS 3a -- ATURAN DELTA (AND/OR)
# ============================================================
def perceptron(x1, x2, w1, w2, theta=THETA):
    return 1 if (x1 * w1 + x2 * w2) >= theta else 0

def latih_delta(X, t, alpha=0.1, epoch=100):
    w = np.array([0.1, 0.1])
    jejak = []
    for _ in range(epoch):
        pred = X @ w
        err = pred - t
        w = w - alpha * (X.T @ err) / len(X)
        jejak.append(float(np.mean(err ** 2)))
    return w, jejak

X_log = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)
t_and = np.array([0, 0, 0, 1], dtype=float)
t_or = np.array([0, 1, 1, 1], dtype=float)
delta_hasil = {}
for nama, t in [('AND', t_and), ('OR', t_or)]:
    w, jejak = latih_delta(X_log, t, alpha=0.5, epoch=200)
    pred = [perceptron(a, b, w[0], w[1]) for a, b in X_log]
    assert pred == list(t.astype(int)), (nama, pred, t)
    delta_hasil[nama] = {"w": w.tolist(), "jejakGalat": jejak[::10] + [jejak[-1]], "predAkhir": pred}
    print("Tugas3a", nama, "w=", np.round(w, 4), "galat akhir=", jejak[-1])

# ============================================================
# TUGAS 3b -- BACK PROPAGATION PENGENALAN HURUF 25 x n_hidden x 4
# ============================================================
HURUF = {
    'A': [0,1,1,1,0, 1,0,0,0,1, 1,1,1,1,1, 1,0,0,0,1, 1,0,0,0,1],
    'B': [1,1,1,1,0, 1,0,0,0,1, 1,1,1,1,0, 1,0,0,0,1, 1,1,1,1,0],
    'C': [0,1,1,1,1, 1,0,0,0,0, 1,0,0,0,0, 1,0,0,0,0, 0,1,1,1,1],
    'D': [1,1,1,1,0, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 1,1,1,1,0],
}
HURUF_LIST = ['A', 'B', 'C', 'D']

def buat_data_huruf(n_varian=8, derau=0.08, rng=rng):
    X, T = [], []
    for i, h in enumerate(HURUF_LIST):
        base = np.array(HURUF[h], dtype=float)
        for _ in range(n_varian):
            noisy = base.copy()
            flip = rng.random(25) < derau
            noisy[flip] = 1 - noisy[flip]
            X.append(noisy)
            target = [0, 0, 0, 0]
            target[i] = 1
            T.append(target)
    return np.array(X), np.array(T)

def latih_backprop(X, T, n_hidden=6, alpha=0.7, momentum=0.4, epoch=1500, theta=0.5):
    n_in, n_out = X.shape[1], T.shape[1]
    WH = rng.normal(0, 0.3, (n_in, n_hidden))
    WO = rng.normal(0, 0.3, (n_hidden, n_out))
    dWH_prev = np.zeros_like(WH)
    dWO_prev = np.zeros_like(WO)
    jejak = []
    for ep in range(epoch):
        NH = X @ WH
        OH = 1 / (1 + np.exp(-(NH - theta)))
        NO = OH @ WO
        O = 1 / (1 + np.exp(-(NO - theta)))
        err = T - O
        jejak.append(float(np.mean(err ** 2)))
        dO = err * O * (1 - O)
        dH = (dO @ WO.T) * OH * (1 - OH)
        dWO = alpha * (OH.T @ dO) / len(X) + momentum * dWO_prev
        dWH = alpha * (X.T @ dH) / len(X) + momentum * dWH_prev
        WO = WO + dWO
        WH = WH + dWH
        dWO_prev, dWH_prev = dWO, dWH
    return WH, WO, jejak

def akurasi_per_huruf(WH, WO, X, T, theta=0.5):
    NH = X @ WH
    OH = 1 / (1 + np.exp(-(NH - theta)))
    NO = OH @ WO
    O = 1 / (1 + np.exp(-(NO - theta)))
    pred = np.argmax(O, axis=1)
    truth = np.argmax(T, axis=1)
    hasil = {}
    for i, h in enumerate(HURUF_LIST):
        mask = truth == i
        hasil[h] = float(np.mean(pred[mask] == truth[mask]))
    return hasil

X_h, T_h = buat_data_huruf(n_varian=8)
assert X_h.shape == (32, 25) and T_h.shape == (32, 4)
WH_h, WO_h, jejak_bp = latih_backprop(X_h, T_h, epoch=1500)
assert jejak_bp[-1] < jejak_bp[0]
akurasi = akurasi_per_huruf(WH_h, WO_h, X_h, T_h)
print("Tugas3b galat awal:", round(jejak_bp[0], 4), "galat akhir:", round(jejak_bp[-1], 6))
print("Tugas3b akurasi per huruf:", akurasi)

# ============================================================
# TUGAS 4 -- LEARNING VECTOR QUANTIZATION
# ============================================================
DATA_LVQ = np.array([
    [1, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 0],
    [0, 0, 1, 0, 0, 1],
    [0, 0, 1, 0, 1, 0],
    [0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1],
    [0, 0, 1, 1, 0, 0],
    [0, 1, 0, 1, 0, 0],
    [1, 0, 0, 1, 0, 1],
    [0, 1, 1, 1, 1, 1],
], dtype=float)

def hamming(a, b):
    return float(np.sum(np.abs(a - b)) / 2)

def latih_lvq(X, alpha=0.05, epoch=30, rekam_epoch1=False):
    W = np.array([X[0].copy(), X[1].copy()])
    riwayat = []
    for ep in range(epoch):
        for i in range(2, len(X)) if ep == 0 else range(len(X)):
            x = X[i]
            d = [hamming(x, W[0]), hamming(x, W[1])]
            j = 0 if d[0] <= d[1] else 1
            kelas_x = 0 if i % 2 == 0 else 1  # tidak dipakai; LVQ di sini unsupervised-kompetitif murni
            W[j] = W[j] + alpha * (x - W[j])
            if ep == 0 and rekam_epoch1:
                riwayat.append(W.copy())
    return W, riwayat

# Catatan: baris 0 dan 1 dipakai sbg bobot awal W1,W2 (indeks 0-based).
# Iterasi epoch pertama memproses data ke-3 dst (indeks 2..9).
W1_epoch1, riwayat = latih_lvq(DATA_LVQ, alpha=0.05, epoch=1, rekam_epoch1=True)
setelah_data3 = riwayat[0]
harap_W1 = np.array([0.95, 0.00, 0.05, 0.00, 0.95, 0.05])
assert np.allclose(setelah_data3[0], harap_W1, atol=1e-6), np.round(setelah_data3[0], 4)
assert np.allclose(setelah_data3[1], DATA_LVQ[1], atol=1e-6)
W30, _ = latih_lvq(DATA_LVQ, alpha=0.05, epoch=30)

def kelas_data(X, W):
    kelas = []
    for x in X:
        d = [hamming(x, W[0]), hamming(x, W[1])]
        kelas.append(1 if d[0] <= d[1] else 2)
    return kelas

kelas_akhir = kelas_data(DATA_LVQ, W30)
print("Tugas4 W1 setelah data3:", np.round(setelah_data3[0], 4))
print("Tugas4 W30:", np.round(W30, 4), "kelas:", kelas_akhir)

# ============================================================
# TUGAS 5 -- KOHONEN NETWORK (SOM)
# ============================================================
def latih_som(X, grid=(3, 3), epoch=200, alpha0=0.5, radius0=2.0, rng=rng):
    n_feat = X.shape[1]
    W = rng.random((grid[0], grid[1], n_feat))
    for ep in range(epoch):
        alpha = alpha0 * (1 - ep / epoch)
        radius = radius0 * (1 - ep / epoch)
        for x in X:
            dists = np.sum((W - x) ** 2, axis=2)
            wi, wj = np.unravel_index(np.argmin(dists), dists.shape)
            for i in range(grid[0]):
                for j in range(grid[1]):
                    dist_grid = math.sqrt((i - wi) ** 2 + (j - wj) ** 2)
                    if dist_grid <= radius:
                        infl = alpha * math.exp(-(dist_grid ** 2) / (2 * (radius + 1e-9) ** 2))
                        W[i, j] += infl * (x - W[i, j])
    return W

def simpul_pemenang(x, W):
    dists = np.sum((W - x) ** 2, axis=2)
    return [int(v) for v in np.unravel_index(np.argmin(dists), dists.shape)]

W_som = latih_som(DATA_LVQ, grid=(3, 3), epoch=200)
assert W_som.shape == (3, 3, 6)
peta = {}
for i, x in enumerate(DATA_LVQ, 1):
    peta[i] = simpul_pemenang(x, W_som)
print("Tugas5 Peta SOM:", peta)

# ============================================================
# TULIS data.js
# ============================================================
data = {
    "garis": garis_hasil,
    "forward": {
        "WH": WH.tolist(), "WO": WO.tolist(),
        "X": X_demo.tolist(), "NH": NH.round(4).tolist(), "OH": OH.round(4).tolist(),
        "NO": NO.round(4).tolist(), "O": O.round(4).tolist(),
    },
    "delta": delta_hasil,
    "backprop": {
        "huruf": HURUF, "hurufList": HURUF_LIST,
        "jejakGalat": jejak_bp[::30],
        "galatAwal": jejak_bp[0], "galatAkhir": jejak_bp[-1],
        "akurasi": akurasi,
    },
    "lvq": {
        "data": DATA_LVQ.tolist(),
        "wAwal": [DATA_LVQ[0].tolist(), DATA_LVQ[1].tolist()],
        "wSetelahData3": [setelah_data3[0].tolist(), setelah_data3[1].tolist()],
        "w30": W30.tolist(),
        "kelasAkhir": kelas_akhir,
        "alpha": 0.05,
    },
    "som": {
        "grid": [3, 3],
        "wFinal": W_som.round(3).tolist(),
        "peta": peta,
    },
}

with open('data.js', 'w') as f:
    f.write('/*\n * KupasAI - Modul 4: Jaringan Syaraf Tiruan\n')
    f.write(' * Seluruh angka dihasilkan dari implementasi independen (generate_data.py),\n')
    f.write(' * diverifikasi terhadap kriteria pada Modul Lab Mandiri 4 (INF20052).\n */\n')
    f.write('var KK4_DATA = ')
    f.write(json.dumps(data, indent=2, ensure_ascii=False))
    f.write(';\n')

print("\ndata.js ditulis.")

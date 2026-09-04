"""
KupasAI - Modul 6: Kecerdasan Kawanan dan Sistem Fuzzy
Implementasi independen, diverifikasi terhadap kriteria pada
Modul_6_Kecerdasan_Kawanan_dan_Sistem_Fuzzy (RPS INF20052 Kecerdasan Komputasional).
"""
import json
import math
import random
import numpy as np

rng_np = np.random.default_rng(5)

# ============================================================
# TUGAS 1 -- PEMBARUAN FEROMON PADA ANT COLONY OPTIMIZATION
# ============================================================
RUAS = ['12', '13', '14', '23', '24', '34']
TUR = {
    'biru': {'jalur': [1, 2, 4, 3, 1], 'panjang': 14},
    'hijau': {'jalur': [1, 4, 2, 3, 1], 'panjang': 31},
}

def ruas_pada_tur(jalur):
    hasil = set()
    for a, b in zip(jalur, jalur[1:]):
        label = str(min(a, b)) + str(max(a, b))
        hasil.add(label)
    return hasil

def perbarui_feromon(tau_awal, tur, rho=0.5, delta=1.0):
    tau_baru = {}
    for r in tau_awal:
        tambahan = 0.0
        for nama, info in tur.items():
            if r in ruas_pada_tur(info['jalur']):
                tambahan += (1.0 / info['panjang']) * delta
        tau_baru[r] = (1 - rho) * tau_awal[r] + tambahan
    return tau_baru

assert ruas_pada_tur([1, 2, 4, 3, 1]) == {'12', '24', '34', '13'}
tau0 = {r: 1.0 for r in RUAS}
tau = perbarui_feromon(tau0, TUR, rho=0.5)
harap = {'12': 0.57, '24': 0.60, '14': 0.53, '23': 0.53, '34': 0.57, '13': 0.60}
for r, v in harap.items():
    assert abs(tau[r] - v) < 0.005, (r, tau[r], v)
print("Tugas1 Feromon:", {r: round(v, 4) for r, v in tau.items()})

# ============================================================
# TUGAS 2 -- SIMULASI PEMILIHAN JALUR
# ============================================================
JALUR = {'atas': 10.0, 'bawah': 20.0}

def probabilitas(tau, panjang, alpha=1.0, beta=2.0):
    skor = {}
    for nama in tau:
        eta = 1.0 / panjang[nama]
        skor[nama] = (tau[nama] ** alpha) * (eta ** beta)
    total = sum(skor.values())
    return {nama: v / total for nama, v in skor.items()}

def pilih_jalur(prob, rng=None):
    rng = rng or random
    r = rng.random()
    kum = 0.0
    for nama, p in prob.items():
        kum += p
        if r <= kum:
            return nama, r
    return list(prob.keys())[-1], r

def simulasi_aco(n_semut=10, iterasi=40, rho=0.1, alpha=1.0, beta=2.0, seed=None):
    rnd = random.Random(seed)
    tau = {'atas': 1.0, 'bawah': 1.0}
    jejak_proporsi = []
    riwayat_tau = []
    tabel_iterasi_pertama = []
    for it in range(iterasi):
        prob = probabilitas(tau, JALUR, alpha, beta)
        pilihan = []
        for s in range(n_semut):
            nama, r = pilih_jalur(prob, rnd)
            pilihan.append(nama)
            if it == 0:
                tabel_iterasi_pertama.append({"semut": s + 1, "acak": round(r, 4), "jalur": nama})
        proporsi_pendek = pilihan.count('atas') / n_semut
        jejak_proporsi.append(proporsi_pendek)
        deposit = {'atas': 0.0, 'bawah': 0.0}
        for nama in pilihan:
            deposit[nama] += 1.0 / JALUR[nama]
        tau = {nama: (1 - rho) * tau[nama] + deposit[nama] for nama in tau}
        riwayat_tau.append(dict(tau))
    return jejak_proporsi, riwayat_tau, tabel_iterasi_pertama

pr = probabilitas({'atas': 1.0, 'bawah': 1.0}, JALUR, alpha=1.0, beta=2.0)
assert abs(sum(pr.values()) - 1.0) < 1e-9
assert pr['atas'] > pr['bawah']
jejak, riwayat, tabel1 = simulasi_aco(n_semut=10, iterasi=40, seed=11)
assert len(tabel1) == 10
assert jejak[-1] > 0.9, jejak[-1]
print("Tugas2 Proporsi jalur pendek per iterasi (setiap 5):", [round(v, 3) for v in jejak[::5]])
print("Tugas2 Proporsi akhir:", round(jejak[-1], 4))

# ============================================================
# TUGAS 3 -- ARTIFICIAL BEE COLONY
# ============================================================
DATA_AWAL = np.array([
    [1.0, -2.0], [-1.0, 3.0], [2.0, 1.0], [-3.0, -1.0], [0.0, 2.0],
])

def f_objektif(x1, x2):
    return x1 ** 2 - x1 * x2 + x2 ** 2 + 2 * x1 + 4 * x2 + 3

def fit(x1, x2):
    return 0.01 * f_objektif(x1, x2)

harap_f = [4.0, 26.0, 14.0, 0.0, 15.0]
for (x1, x2), hf in zip(DATA_AWAL, harap_f):
    assert abs(f_objektif(x1, x2) - hf) < 1e-9, (x1, x2, f_objektif(x1, x2), hf)
    assert abs(fit(x1, x2) - hf * 0.01) < 1e-12

def fase_employed(sumber, trial, rng):
    n = len(sumber)
    baru = sumber.copy()
    trial_baru = trial.copy()
    tabel = []
    for i in range(n):
        j = i
        while j == i:
            j = rng.integers(0, n)
        d = rng.integers(0, 2)  # dimensi yang diubah
        r = rng.uniform(-1, 1)
        kandidat = sumber[i].copy()
        kandidat[d] = sumber[i][d] + r * (sumber[i][d] - sumber[j][d])
        kandidat = np.clip(kandidat, -5, 5)
        f_lama = fit(*sumber[i])
        f_baru = fit(*kandidat)
        if f_baru < f_lama:  # minimisasi f -> fitness lebih kecil lebih baik
            baru[i] = kandidat
            trial_baru[i] = 0
            ket = 'diperbarui'
        else:
            trial_baru[i] = trial[i] + 1
            ket = 'bertahan'
        tabel.append({"x1": round(sumber[i][0], 4), "x2": round(sumber[i][1], 4), "pas": int(j), "rand": round(float(r), 4),
                       "x1_baru": round(kandidat[0], 4), "x2_baru": round(kandidat[1], 4),
                       "f": round(float(f_objektif(*kandidat)), 4), "fitness": round(float(fit(*kandidat)), 4), "ket": ket})
    return baru, trial_baru, tabel

def fase_onlooker(sumber, trial, rng):
    n = len(sumber)
    fits = np.array([1.0 / (1.0 + fit(*s)) if fit(*s) >= 0 else 1.0 + abs(fit(*s)) for s in sumber])
    prob = fits / fits.sum()
    baru = sumber.copy()
    trial_baru = trial.copy()
    for _ in range(n):
        i = rng.choice(n, p=prob)
        j = i
        while j == i:
            j = rng.integers(0, n)
        d = rng.integers(0, 2)
        r = rng.uniform(-1, 1)
        kandidat = sumber[i].copy()
        kandidat[d] = sumber[i][d] + r * (sumber[i][d] - sumber[j][d])
        kandidat = np.clip(kandidat, -5, 5)
        if fit(*kandidat) < fit(*sumber[i]):
            baru[i] = kandidat
            trial_baru[i] = 0
        else:
            trial_baru[i] = trial[i] + 1
    return baru, trial_baru

def fase_scout(sumber, trial, batas=5, rng=None):
    baru = sumber.copy()
    trial_baru = trial.copy()
    for i in range(len(sumber)):
        if trial[i] > batas:
            baru[i] = rng.uniform(-5, 5, size=2)
            trial_baru[i] = 0
    return baru, trial_baru

def jalankan_abc(iterasi=150, batas=5, seed=None):
    rng = np.random.default_rng(seed)
    sumber = DATA_AWAL.copy()
    trial = np.zeros(5, dtype=int)
    jejak = []
    for it in range(iterasi):
        sumber, trial, _ = fase_employed(sumber, trial, rng)
        sumber, trial = fase_onlooker(sumber, trial, rng)
        sumber, trial = fase_scout(sumber, trial, batas, rng)
        fits = [f_objektif(*s) for s in sumber]
        jejak.append(min(fits))
    idx_best = int(np.argmin([f_objektif(*s) for s in sumber]))
    return sumber[idx_best], f_objektif(*sumber[idx_best]), jejak

rng1 = np.random.default_rng(5)
sumber1, trial1, tabel_employed = fase_employed(DATA_AWAL.copy(), np.zeros(5, dtype=int), rng1)
assert len(tabel_employed) == 5
assert sumber1.shape == (5, 2)
terbaik, nilai, jejak_abc = jalankan_abc(iterasi=150, seed=5)
assert -5 <= terbaik[0] <= 5 and -5 <= terbaik[1] <= 5
print("Tugas3 f awal:", harap_f)
print("Tugas3 solusi terbaik ABC:", np.round(terbaik, 4), "f=", round(float(nilai), 4))

# ============================================================
# TUGAS 4 -- HIMPUNAN FUZZY PADA DOMAIN UMUR
# ============================================================
def mu_balita(x):
    if 0 <= x <= 7:
        return 1 - x / 7
    return 0.0

def mu_anak(x):
    if 5 <= x <= 8:
        return (x - 5) / 3
    if 8 < x <= 11:
        return (11 - x) / 3
    return 0.0

def mu_trapesium(x, a, b, c, d):
    if x <= a or x >= d:
        return 0.0
    if a < x < b:
        return (x - a) / (b - a)
    if b <= x <= c:
        return 1.0
    return (d - x) / (d - c)

def mu_remaja(x):
    return mu_trapesium(x, 9, 13, 16, 19)

def mu_pemuda(x):
    return mu_trapesium(x, 17, 21, 25, 30)

def mu_dewasa(x):
    return mu_trapesium(x, 27, 35, 45, 55)

def mu_tua(x):
    if x >= 60:
        return 1.0
    if 50 <= x < 60:
        return (x - 50) / 10
    return 0.0

def irisan(mu_a, mu_b):
    return lambda x: min(mu_a(x), mu_b(x))

def gabungan(mu_a, mu_b):
    return lambda x: max(mu_a(x), mu_b(x))

def komplemen(mu_a):
    return lambda x: 1 - mu_a(x)

harap_balita = {0: 1.0, 1: 0.857, 2: 0.714, 3: 0.571, 4: 0.429, 7: 0.0, 10: 0.0}
for x, v in harap_balita.items():
    assert abs(mu_balita(x) - v) < 0.002, (x, mu_balita(x), v)
assert abs(mu_anak(8) - 1.0) < 1e-9
assert abs(mu_anak(5)) < 1e-9 and abs(mu_anak(11)) < 1e-9
print("Tugas4 mu_balita terverifikasi sesuai kriteria modul.")
print("Tugas4 Catatan: remaja/pemuda/dewasa/tua adalah desain trapesium ilustratif")
print("  yang melanjutkan pola balita/anak (bukan kutipan buku, karena Bab 12 tidak tersedia).")

xs_umur = list(range(0, 81))
kurva_fuzzy = {
    "balita": [round(mu_balita(x), 4) for x in xs_umur],
    "anak": [round(mu_anak(x), 4) for x in xs_umur],
    "remaja": [round(mu_remaja(x), 4) for x in xs_umur],
    "pemuda": [round(mu_pemuda(x), 4) for x in xs_umur],
    "dewasa": [round(mu_dewasa(x), 4) for x in xs_umur],
    "tua": [round(mu_tua(x), 4) for x in xs_umur],
}

# ============================================================
# TUGAS 5 -- SISTEM FUZZY PRODUKSI PLAT (Contoh 12.8)
# ============================================================
PESANAN_MIN, PESANAN_MAX = 1000, 5000
SIMPANAN_MIN, SIMPANAN_MAX = 100, 600
PRODUKSI_MIN, PRODUKSI_MAX = 2000, 7000

def mu_pesanan_turun(x1):
    return max(0.0, min(1.0, (PESANAN_MAX - x1) / (PESANAN_MAX - PESANAN_MIN)))

def mu_pesanan_naik(x1):
    return max(0.0, min(1.0, (x1 - PESANAN_MIN) / (PESANAN_MAX - PESANAN_MIN)))

def mu_simpanan_rendah(x2):
    return max(0.0, min(1.0, (SIMPANAN_MAX - x2) / (SIMPANAN_MAX - SIMPANAN_MIN)))

def mu_simpanan_tinggi(x2):
    return max(0.0, min(1.0, (x2 - SIMPANAN_MIN) / (SIMPANAN_MAX - SIMPANAN_MIN)))

def z_produksi_rendah(alpha):
    return PRODUKSI_MAX - alpha * (PRODUKSI_MAX - PRODUKSI_MIN)

def z_produksi_tinggi(alpha):
    return PRODUKSI_MIN + alpha * (PRODUKSI_MAX - PRODUKSI_MIN)

def tsukamoto(x1, x2):
    turun, naik = mu_pesanan_turun(x1), mu_pesanan_naik(x1)
    rendah, tinggi = mu_simpanan_rendah(x2), mu_simpanan_tinggi(x2)
    aturan = [
        {"aturan": 1, "alpha": min(turun, tinggi), "arah": "rendah"},
        {"aturan": 2, "alpha": min(turun, rendah), "arah": "rendah"},
        {"aturan": 3, "alpha": min(naik, tinggi), "arah": "tinggi"},
        {"aturan": 4, "alpha": min(naik, rendah), "arah": "tinggi"},
    ]
    for a in aturan:
        a["z"] = z_produksi_rendah(a["alpha"]) if a["arah"] == "rendah" else z_produksi_tinggi(a["alpha"])
    num = sum(a["alpha"] * a["z"] for a in aturan)
    den = sum(a["alpha"] for a in aturan)
    return num / den, aturan

def mu_rendah_out(z):
    return max(0.0, min(1.0, (PRODUKSI_MAX - z) / (PRODUKSI_MAX - PRODUKSI_MIN)))

def mu_tinggi_out(z):
    return max(0.0, min(1.0, (z - PRODUKSI_MIN) / (PRODUKSI_MAX - PRODUKSI_MIN)))

def mamdani(x1, x2, langkah=10.0):
    turun, naik = mu_pesanan_turun(x1), mu_pesanan_naik(x1)
    rendah, tinggi = mu_simpanan_rendah(x2), mu_simpanan_tinggi(x2)
    alpha_rendah = max(min(turun, tinggi), min(turun, rendah))
    alpha_tinggi = max(min(naik, tinggi), min(naik, rendah))
    zs = np.arange(PRODUKSI_MIN, PRODUKSI_MAX + langkah, langkah)
    mu_gab = np.array([max(min(alpha_rendah, mu_rendah_out(z)), min(alpha_tinggi, mu_tinggi_out(z))) for z in zs])
    momen = float(np.sum(zs * mu_gab) * langkah)
    area = float(np.sum(mu_gab) * langkah)
    z_akhir = momen / area if area > 0 else 0.0
    return z_akhir, area, momen

assert abs(mu_pesanan_turun(4000) - 0.25) < 1e-9
assert abs(mu_pesanan_naik(4000) - 0.75) < 1e-9
assert abs(mu_simpanan_rendah(300) - 0.6) < 1e-9
assert abs(mu_simpanan_tinggi(300) - 0.4) < 1e-9
assert abs(z_produksi_rendah(0.25) - 5750) < 1e-6
assert abs(z_produksi_tinggi(0.40) - 4000) < 1e-6
assert abs(z_produksi_tinggi(0.60) - 5000) < 1e-6
z_ts, rincian_ts = tsukamoto(4000, 300)
assert abs(z_ts - 4983) < 2, z_ts
z_md, area_md, momen_md = mamdani(4000, 300)
stok_akhir = 300 + z_ts - 4000
print("Tugas5 Tsukamoto z=", round(z_ts, 2), "rincian:", rincian_ts)
print("Tugas5 Mamdani z=", round(z_md, 2), "area=", round(area_md, 2), "momen=", round(momen_md, 2))
print("Tugas5 Stok akhir (Tsukamoto):", stok_akhir, "melebihi 600?" , stok_akhir > 600)

# ============================================================
# TULIS data.js
# ============================================================
data = {
    "aco": {
        "ruas": RUAS,
        "tur": TUR,
        "tau0": tau0,
        "tauSetelah": {r: round(v, 4) for r, v in tau.items()},
        "harap": harap,
    },
    "simulasi": {
        "jalur": JALUR,
        "probAwal": {k: round(v, 4) for k, v in pr.items()},
        "jejakProporsi": jejak,
        "tabelIterasiPertama": tabel1,
    },
    "abc": {
        "dataAwal": DATA_AWAL.tolist(),
        "fAwal": harap_f,
        "tabelEmployed": tabel_employed,
        "terbaik": [round(float(v), 4) for v in terbaik],
        "fTerbaik": round(float(nilai), 4),
        "jejak": jejak_abc[::10],
    },
    "fuzzyUmur": {
        "xs": xs_umur,
        "kurva": kurva_fuzzy,
        "hargaBalitaVerified": harap_balita,
    },
    "sistemFuzzy": {
        "pesanan": 4000, "simpanan": 300,
        "muPesananTurun": mu_pesanan_turun(4000), "muPesananNaik": mu_pesanan_naik(4000),
        "muSimpananRendah": mu_simpanan_rendah(300), "muSimpananTinggi": mu_simpanan_tinggi(300),
        "tsukamoto": {"z": round(z_ts, 2), "aturan": rincian_ts},
        "mamdani": {"z": round(z_md, 2), "area": round(area_md, 2), "momen": round(momen_md, 2)},
        "stokAkhirTsukamoto": stok_akhir,
        "kapasitasMaksimum": 600,
    },
}

with open('data.js', 'w') as f:
    f.write('/*\n * KupasAI - Modul 6: Kecerdasan Kawanan dan Sistem Fuzzy\n')
    f.write(' * Seluruh angka dihasilkan dari implementasi independen (generate_data.py),\n')
    f.write(' * diverifikasi terhadap kriteria pada Modul Lab Mandiri 6 (INF20052).\n */\n')
    f.write('var KK6_DATA = ')
    f.write(json.dumps(data, indent=2, ensure_ascii=False))
    f.write(';\n')

print("\ndata.js ditulis.")

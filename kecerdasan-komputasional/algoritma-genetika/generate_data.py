"""
KupasAI - Modul 5: Algoritma Genetika
Implementasi independen, diverifikasi terhadap kriteria pada
Modul_5_Algoritma_Genetika (RPS INF20052 Kecerdasan Komputasional).
"""
import json
import math
import random

PANJANG = 18
BATAS_ATAS = 255

# ============================================================
# TUGAS 1 -- PENYANDIAN DAN DEKODE KROMOSOM
# ============================================================
def ke_desimal(krom):
    return int(''.join(str(b) for b in krom), 2)

def decode(krom):
    return BATAS_ATAS / (2 ** PANJANG - 1) * ke_desimal(krom)

def encode(x):
    nilai = round(x * (2 ** PANJANG - 1) / BATAS_ATAS)
    biner = format(nilai, '0{}b'.format(PANJANG))
    return [int(b) for b in biner]

KROM = "100000110011100000"
assert ke_desimal(KROM) == 134368, ke_desimal(KROM)
assert abs(decode(KROM) - 130.7067) < 0.001, decode(KROM)
assert abs(decode(encode(0.0)) - 0.0) < 0.01
assert abs(decode(encode(255.0)) - 255.0) < 0.01
rnd = random.Random(11)
for _ in range(20):
    x = rnd.uniform(0, 255)
    assert abs(decode(encode(x)) - x) < 0.01
print("Tugas1 decode(KROM)=", decode(KROM))

# perbandingan dengan angka salah cetak pada buku (134468 vs 134368)
salah_cetak = BATAS_ATAS / (2 ** PANJANG - 1) * 134468
benar = decode(KROM)
print("Tugas1 Jika pakai 134468 (versi buku):", salah_cetak, "| versi benar (134368):", benar)

# ============================================================
# TUGAS 2 -- POPULASI AWAL DAN FUNGSI FITNESS
# ============================================================
def fitness(x):
    return math.sin(math.pi * x / 256)

def populasi_awal(n=20, rng=None):
    rng = rng or random
    return [[rng.randint(0, 1) for _ in range(PANJANG)] for _ in range(n)]

assert abs(fitness(128) - 1.0) < 1e-9
assert abs(fitness(0)) < 1e-9
rnd2 = random.Random(7)
pop = populasi_awal(20, rnd2)
tabel_pop = []
total_fitness = 0.0
for krom in pop:
    x = decode(krom)
    f = fitness(x)
    total_fitness += f
    tabel_pop.append({"kromosom": ke_desimal(krom), "biner": ''.join(map(str, krom)), "x": round(x, 4), "fitness": round(f, 4)})
assert len(pop) == 20
print("Tugas2 total fitness:", round(total_fitness, 4))

# ============================================================
# TUGAS 3 -- SELEKSI ROULETTE WHEEL
# ============================================================
def fitness_relatif(pop):
    fits = [fitness(decode(k)) for k in pop]
    total = sum(fits)
    return [f / total for f in fits]

def fitness_kumulatif(fitrel):
    kum = []
    running = 0.0
    for f in fitrel:
        running += f
        kum.append(running)
    return kum

def seleksi_roulette(pop, rng=None):
    rng = rng or random
    fr = fitness_relatif(pop)
    fk = fitness_kumulatif(fr)
    baru = []
    tabel = []
    for i in range(len(pop)):
        r = rng.random()
        terpilih = next(idx for idx, k in enumerate(fk) if r <= k)
        baru.append(pop[terpilih])
        tabel.append({"kromosom": i + 1, "fitrel": round(fr[i], 4), "fitkum": round(fk[i], 4), "acak": round(r, 4), "terpilih": terpilih + 1})
    return baru, tabel

fr = fitness_relatif(pop)
fk = fitness_kumulatif(fr)
assert abs(sum(fr) - 1.0) < 1e-9
assert abs(fk[-1] - 1.0) < 1e-9
assert all(fk[i] <= fk[i + 1] + 1e-12 for i in range(len(fk) - 1))
rnd3 = random.Random(7)
pop_baru, tabel_seleksi = seleksi_roulette(pop, rnd3)
hilang = sorted(set(range(1, 21)) - {b['terpilih'] for b in tabel_seleksi})
print("Tugas3 kromosom hilang:", hilang)

# ============================================================
# TUGAS 4 -- CROSSOVER, MUTASI, SIKLUS GA PENUH
# ============================================================
def crossover_satu_titik(induk1, induk2, pc=0.8, rng=None):
    rng = rng or random
    if rng.random() > pc:
        return list(induk1), list(induk2)
    titik = rng.randint(1, PANJANG - 1)
    anak1 = induk1[:titik] + induk2[titik:]
    anak2 = induk2[:titik] + induk1[titik:]
    return anak1, anak2

def mutasi(krom, pm=0.01, rng=None):
    rng = rng or random
    return [1 - b if rng.random() < pm else b for b in krom]

def jalankan_ga(n_pop=20, generasi=100, pc=0.8, pm=0.01, seed=None):
    rng = random.Random(seed)
    pop = populasi_awal(n_pop, rng)
    jejak_terbaik, jejak_rata = [], []
    terbaik_krom = None
    terbaik_fit = -1
    for g in range(generasi):
        fits = [fitness(decode(k)) for k in pop]
        idx_max = fits.index(max(fits))
        if fits[idx_max] > terbaik_fit:
            terbaik_fit = fits[idx_max]
            terbaik_krom = pop[idx_max]
        jejak_terbaik.append(fits[idx_max])
        jejak_rata.append(sum(fits) / len(fits))
        pop_baru, _ = seleksi_roulette(pop, rng)
        anak = []
        for i in range(0, n_pop, 2):
            p1 = pop_baru[i]
            p2 = pop_baru[i + 1] if i + 1 < n_pop else pop_baru[0]
            a1, a2 = crossover_satu_titik(p1, p2, pc, rng)
            anak.append(mutasi(a1, pm, rng))
            anak.append(mutasi(a2, pm, rng))
        pop = anak[:n_pop]
    return {"terbaik": terbaik_krom, "x": decode(terbaik_krom), "fitness": terbaik_fit, "jejak_terbaik": jejak_terbaik, "jejak_rata": jejak_rata}

a, b = crossover_satu_titik([0] * 18, [1] * 18, pc=1.0, rng=random.Random(1))
assert len(a) == 18 and len(b) == 18
assert sum(a) + sum(b) == 18
rnd4 = random.Random(1)
m = mutasi([0] * 18, pm=1.0, rng=rnd4)
assert m == [1] * 18
assert mutasi([0] * 18, pm=0.0) == [0] * 18
hasil = jalankan_ga(n_pop=20, generasi=200, pc=0.8, pm=0.01, seed=3)
assert abs(hasil['x'] - 128) < 5, hasil['x']
assert hasil['fitness'] > 0.99
print("Tugas4 x terbaik:", round(hasil['x'], 4), "fitness:", round(hasil['fitness'], 6))

# ============================================================
# TUGAS 5 -- EKSPERIMEN PARAMETER
# ============================================================
def generasi_sampai_konvergen(n_pop, pc, pm, ambang=0.999, maks_generasi=300, seed=None):
    rng = random.Random(seed)
    pop = populasi_awal(n_pop, rng)
    for g in range(maks_generasi):
        fits = [fitness(decode(k)) for k in pop]
        if max(fits) >= ambang:
            return g
        pop_baru, _ = seleksi_roulette(pop, rng)
        anak = []
        for i in range(0, n_pop, 2):
            p1 = pop_baru[i]
            p2 = pop_baru[i + 1] if i + 1 < n_pop else pop_baru[0]
            a1, a2 = crossover_satu_titik(p1, p2, pc, rng)
            anak.append(mutasi(a1, pm, rng))
            anak.append(mutasi(a2, pm, rng))
        pop = anak[:n_pop]
    return maks_generasi

def eksperimen(ulangan=6):
    hasil = []
    for n_pop in (10, 20, 50):
        for pc in (0.6, 0.9):
            for pm in (0.001, 0.01, 0.1):
                gens = [generasi_sampai_konvergen(n_pop, pc, pm, seed=1000 * n_pop + int(pc * 100) + int(pm * 10000) + u) for u in range(ulangan)]
                hasil.append({"n_pop": n_pop, "pc": pc, "pm": pm, "rata_generasi": round(sum(gens) / len(gens), 2)})
    return hasil

hasil_eks = eksperimen(ulangan=6)
assert len(hasil_eks) == 18
print("Tugas5 eksperimen (6 pengulangan per kombinasi):")
for r in hasil_eks:
    print(" ", r)

# ============================================================
# TULIS data.js
# ============================================================
data = {
    "encode": {
        "kromContoh": KROM,
        "nilaiDesimal": ke_desimal(KROM),
        "xHasil": round(decode(KROM), 4),
        "salahCetak134468": round(salah_cetak, 4),
    },
    "populasi": {
        "tabel": tabel_pop,
        "totalFitness": round(total_fitness, 4),
    },
    "seleksi": {
        "tabel": tabel_seleksi,
        "hilang": hilang,
    },
    "ga": {
        "xTerbaik": round(hasil['x'], 4),
        "fitnessTerbaik": round(hasil['fitness'], 6),
        "kromTerbaik": ''.join(map(str, hasil['terbaik'])),
        "jejakTerbaik": hasil['jejak_terbaik'][::4],
        "jejakRata": hasil['jejak_rata'][::4],
    },
    "eksperimen": hasil_eks,
}

with open('data.js', 'w') as f:
    f.write('/*\n * KupasAI - Modul 5: Algoritma Genetika\n')
    f.write(' * Seluruh angka dihasilkan dari implementasi independen (generate_data.py),\n')
    f.write(' * diverifikasi terhadap kriteria pada Modul Lab Mandiri 5 (INF20052).\n */\n')
    f.write('var KK5_DATA = ')
    f.write(json.dumps(data, indent=2, ensure_ascii=False))
    f.write(';\n')

print("\ndata.js ditulis.")

"""
KupasAI - Modul 3: Penalaran Ketidakpastian dan Kesamaan Dokumen
Implementasi independen, diverifikasi terhadap kriteria pada
Modul_3_Penalaran_Ketidakpastian_dan_Kesamaan_Dokumen (RPS INF20052).
"""
import json
import math
import re

# ============================================================
# TUGAS 1 -- TEOREMA BAYES
# ============================================================
def bayes_posterior(prior, likelihood):
    pembilang = [p * l for p, l in zip(prior, likelihood)]
    total = sum(pembilang)
    return [p / total for p in pembilang], pembilang, total

def bayes_fakta_baru(p_h_given_e_kecil, p_E_given_e_dan_h, p_E_given_e):
    return p_h_given_e_kecil * p_E_given_e_dan_h / p_E_given_e

prior = [0.4, 0.4, 0.2]
likelihood = [0.7, 0.3, 0.9]
post, pembilang, penyebut = bayes_posterior(prior, likelihood)
assert abs(sum(post) - 1.0) < 1e-9
assert abs(post[0] - 0.4828) < 0.001
assert abs(post[1] - 0.2069) < 0.001
assert abs(post[2] - 0.3103) < 0.001
assert abs(pembilang[0] - 0.28) < 1e-9 and abs(pembilang[1] - 0.12) < 1e-9
p2 = bayes_fakta_baru(0.5, 0.4, 0.6)
assert abs(p2 - 0.3333) < 0.01
print("Tugas1 Bayes posterior:", [round(v, 4) for v in post], "pembilang:", pembilang, "P(cacar|bintik,panas)=", round(p2, 4))

# ============================================================
# TUGAS 2 -- FAKTOR KEPASTIAN
# ============================================================
def mb_gabungan(mb1, mb2):
    return mb1 + mb2 * (1 - mb1)

def md_gabungan(md1, md2):
    return md1 + md2 * (1 - md1)

def cf(mb, md):
    return mb - md

def mb_konjungsi(mb_list):
    return min(mb_list)

def mb_disjungsi(mb_list):
    return max(mb_list)

MB = mb_gabungan(0.8, 0.7)
MD = md_gabungan(0.01, 0.08)
CF = cf(MB, MD)
assert abs(MB - 0.94) < 1e-6
assert abs(MD - 0.0892) < 1e-6
assert abs(CF - 0.8508) < 1e-6
assert abs(mb_konjungsi([0.8, 0.7]) - 0.7) < 1e-9
assert abs(mb_disjungsi([0.8, 0.7]) - 0.8) < 1e-9
assert abs(mb_gabungan(0.8, 0.7) - mb_gabungan(0.7, 0.8)) < 1e-9
print("Tugas2 MB:", round(MB, 4), "MD:", round(MD, 4), "CF:", round(CF, 4))

# ============================================================
# TUGAS 3 -- TEORI DEMPSTER SHAFER
# ============================================================
THETA = frozenset({'A', 'F', 'D', 'B'})
m1 = {frozenset({'F', 'D', 'B'}): 0.8, THETA: 0.2}
m2 = {frozenset({'A', 'F', 'D'}): 0.9, THETA: 0.1}
m3 = {frozenset({'A'}): 0.6, THETA: 0.4}

def gabung_bpa(ma, mb):
    kombinasi = {}
    konflik = 0.0
    for sa, wa in ma.items():
        for sb, wb in mb.items():
            irisan = sa & sb
            w = wa * wb
            if not irisan:
                konflik += w
            else:
                kombinasi[irisan] = kombinasi.get(irisan, 0.0) + w
    norm = 1 - konflik
    return {s: w / norm for s, w in kombinasi.items()}, kombinasi, konflik

def tabel_kombinasi(ma, mb):
    rows = []
    for sa, wa in ma.items():
        for sb, wb in mb.items():
            rows.append({"a": sorted(sa), "b": sorted(sb), "irisan": sorted(sa & sb) if (sa & sb) else [], "bobot": round(wa * wb, 4)})
    return rows

m12, m12_raw, konflik12 = gabung_bpa(m1, m2)
tabel12 = tabel_kombinasi(m1, m2)
assert abs(m12[frozenset({'F', 'D'})] - 0.72) < 1e-9
assert abs(m12[frozenset({'A', 'F', 'D'})] - 0.18) < 1e-9
assert abs(m12[frozenset({'F', 'D', 'B'})] - 0.08) < 1e-9
assert abs(m12[THETA] - 0.02) < 1e-9
assert abs(sum(m12.values()) - 1.0) < 1e-9
m123, m123_raw, konflik123 = gabung_bpa(m12, m3)
tabel123 = tabel_kombinasi(m12, m3)
assert abs(m123[frozenset({'F', 'D'})] - 0.554) < 0.002
assert abs(m123[frozenset({'A'})] - 0.231) < 0.002
assert abs(m123[frozenset({'A', 'F', 'D'})] - 0.138) < 0.002
assert abs(m123[frozenset({'F', 'D', 'B'})] - 0.062) < 0.002
assert abs(m123[THETA] - 0.015) < 0.002
print("Tugas3 m12:", {','.join(sorted(k)) if k else 'theta': round(v, 4) for k, v in m12.items()})
print("Tugas3 m123:", {','.join(sorted(k)) if k else 'theta': round(v, 4) for k, v in m123.items()}, "konflik:", round(konflik123, 4))

# ============================================================
# TUGAS 4 -- VECTOR SPACE MODEL
# ============================================================
DOK1 = "Ibu membeli apel malang. Saya minum teh manis. Ibu membeli baju baru."
DOK2 = "Ibu membeli apel merah manis. Saya minum teh manis. Ayah membeli baju merah."
KAMUS_DASAR = {'membeli': 'beli'}

def praproses(teks):
    teks = teks.lower()
    teks = re.sub(r'[^\w\s]', '', teks)
    token = teks.split()
    return [KAMUS_DASAR.get(t, t) for t in token]

def bangun_vektor(dok_a, dok_b):
    ta, tb = praproses(dok_a), praproses(dok_b)
    kosakata = []
    for t in ta + tb:
        if t not in kosakata:
            kosakata.append(t)
    va = [ta.count(k) for k in kosakata]
    vb = [tb.count(k) for k in kosakata]
    return kosakata, va, vb

def dot(a, b):
    return sum(x * y for x, y in zip(a, b))

def norma(a):
    return math.sqrt(sum(x * x for x in a))

def cosine(a, b):
    return dot(a, b) / (norma(a) * norma(b))

kosakata, d1, d2 = bangun_vektor(DOK1, DOK2)
assert len(kosakata) == 12, len(kosakata)
assert dot(d1, d2) == 13, dot(d1, d2)
assert abs(norma(d1) - 4.0) < 1e-9
assert abs(norma(d2) - math.sqrt(19)) < 1e-9
sim = cosine(d1, d2)
assert abs(sim - 0.7456) < 0.001
print("Tugas4 kosakata:", kosakata)
print("Tugas4 d1:", d1, "d2:", d2, "dot:", dot(d1, d2), "|d1|:", norma(d1), "|d2|:", round(norma(d2), 4), "cos:", round(sim, 4))

# konsistensi angka pada buku (12 dan 13 sebagai panjang vektor, Tugas 5 no.2)
cos_versi_buku = dot(d1, d2) / (12 * 13)

# ============================================================
# TULIS data.js
# ============================================================
data = {
    "bayes": {
        "penyakit": ["Cacar", "Alergi", "Jerawat"],
        "prior": prior,
        "likelihood": likelihood,
        "pembilang": pembilang,
        "penyebut": penyebut,
        "posterior": post,
        "faktaBaru": {
            "pHGivenEKecil": 0.5, "pEGivenEDanH": 0.4, "pEGivenE": 0.6,
            "hasil": p2,
        },
    },
    "cf": {
        "mb1": 0.8, "mb2": 0.7, "md1": 0.01, "md2": 0.08,
        "mbGabungan": MB, "mdGabungan": MD, "cf": CF,
        "mbKonjungsi": mb_konjungsi([0.8, 0.7]),
        "mbDisjungsi": mb_disjungsi([0.8, 0.7]),
    },
    "dempster": {
        "m1": {"set": "F,D,B", "w": 0.8},
        "m2": {"set": "A,F,D", "w": 0.9},
        "m3": {"set": "A", "w": 0.6},
        "tabel12": tabel12,
        "m12": {(','.join(sorted(k)) if k else 'Theta'): round(v, 4) for k, v in m12.items()},
        "tabel123": tabel123,
        "m123": {(','.join(sorted(k)) if k else 'Theta'): round(v, 4) for k, v in m123.items()},
        "konflik123": round(konflik123, 4),
    },
    "vsm": {
        "dok1": DOK1, "dok2": DOK2,
        "kosakata": kosakata, "d1": d1, "d2": d2,
        "dot": dot(d1, d2), "norma1": norma(d1), "norma2": round(norma(d2), 4),
        "cosine": sim,
        "cosineVersiBuku": round(cos_versi_buku, 4),
    },
}

with open('data.js', 'w') as f:
    f.write('/*\n * KupasAI - Modul 3: Penalaran Ketidakpastian dan Kesamaan Dokumen\n')
    f.write(' * Seluruh angka dihasilkan dari implementasi independen (generate_data.py),\n')
    f.write(' * diverifikasi terhadap kriteria pada Modul Lab Mandiri 3 (INF20052).\n */\n')
    f.write('var KK3_DATA = ')
    f.write(json.dumps(data, indent=2, ensure_ascii=False))
    f.write(';\n')

print("\ndata.js ditulis.")

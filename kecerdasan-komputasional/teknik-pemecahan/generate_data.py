"""
KupasAI - Modul 2: Teknik Pemecahan Permasalahan
Implementasi independen, diverifikasi terhadap kriteria pada
Modul_2_Teknik_Pemecahan_Permasalahan (RPS INF20052 Kecerdasan Komputasional).
"""
import json
import itertools
import time

# ============================================================
# TUGAS 1 -- PROBLEM REDUCTION DENGAN GRAF AND-OR (Contoh 4.1)
# ============================================================
GRAF = ('or', [
    ('and', [3, 4]),
    ('or', [('and', [2, 2, 2]), 9]),
])

def biaya_minimum(node):
    if isinstance(node, int):
        return node
    tipe, anak = node
    biayas = [biaya_minimum(a) for a in anak]
    return min(biayas) if tipe == 'or' else sum(biayas)

def cabang_terpilih(node):
    if isinstance(node, int):
        return node
    tipe, anak = node
    if tipe == 'and':
        return {'tipe': 'and', 'anak': [cabang_terpilih(a) for a in anak], 'biaya': biaya_minimum(node)}
    biayas = [biaya_minimum(a) for a in anak]
    idx_min = biayas.index(min(biayas))
    return {'tipe': 'or', 'terpilih': idx_min, 'anak': [cabang_terpilih(a) for a in anak], 'biaya': biaya_minimum(node)}

assert biaya_minimum(5) == 5
assert biaya_minimum(('and', [2, 3])) == 5
assert biaya_minimum(('or', [2, 3])) == 2
assert biaya_minimum(GRAF) == 6, biaya_minimum(GRAF)
print("Tugas1 AND-OR biaya minimum:", biaya_minimum(GRAF))

def node_to_tree(node, label=""):
    if isinstance(node, int):
        return {"name": str(node), "isLeaf": True, "value": node, "label": label}
    tipe, anak = node
    biayas = [biaya_minimum(a) for a in anak]
    idx_min = biayas.index(min(biayas)) if tipe == 'or' else None
    return {
        "name": tipe.upper(), "isLeaf": False, "tipe": tipe, "label": label,
        "biaya": biaya_minimum(node),
        "children": [node_to_tree(a, ('terpilih' if (tipe == 'or' and i == idx_min) else '')) for i, a in enumerate(anak)]
    }

and_or_tree = node_to_tree(GRAF)

# ============================================================
# TUGAS 2 -- PEWARNAAN PETA AUSTRALIA (Contoh 4.2)
# ============================================================
AUSTRALIA = {
    'WA':  ['NT', 'SA'],
    'NT':  ['WA', 'SA', 'Q'],
    'SA':  ['WA', 'NT', 'Q', 'NSW', 'V'],
    'Q':   ['NT', 'SA', 'NSW'],
    'NSW': ['Q', 'SA', 'V'],
    'V':   ['SA', 'NSW'],
    'T':   [],
}

def warnai_serakah(graf):
    urutan = sorted(graf.keys(), key=lambda k: -len(graf[k]))
    warna = {}
    for daerah in urutan:
        terpakai = {warna[t] for t in graf[daerah] if t in warna}
        c = 0
        while c in terpakai:
            c += 1
        warna[daerah] = c
    return warna

def pewarnaan_sah(graf, warna):
    for a, tetangga in graf.items():
        for b in tetangga:
            if warna.get(a) == warna.get(b):
                return False
    return True

def minimum_warna(graf):
    daerah = list(graf.keys())
    for k in range(1, len(daerah) + 1):
        for kombinasi in itertools.product(range(k), repeat=len(daerah)):
            warna = dict(zip(daerah, kombinasi))
            if len(set(warna.values())) == k and pewarnaan_sah(graf, warna):
                return k
    return len(daerah)

w = warnai_serakah(AUSTRALIA)
assert pewarnaan_sah(AUSTRALIA, w)
assert len(set(w.values())) == 3, len(set(w.values()))
k_min = minimum_warna(AUSTRALIA)
assert k_min == 3
print("Tugas2 Pewarnaan:", w, "k_min:", k_min)

# ============================================================
# TUGAS 3 -- KRIPTARITMATIKA SEND + MORE = MONEY
# ============================================================
def rakit(sol, kata):
    return int(''.join(str(sol[h]) for h in kata))

def send_more_money_brute():
    huruf = list('SENDMORY')
    diperiksa = 0
    for perm in itertools.permutations(range(10), len(huruf)):
        diperiksa += 1
        sol = dict(zip(huruf, perm))
        if sol['S'] == 0 or sol['M'] == 0:
            continue
        if rakit(sol, 'SEND') + rakit(sol, 'MORE') == rakit(sol, 'MONEY'):
            return sol, diperiksa
    return None, diperiksa

def send_more_money_batasan():
    # M = 1 (carry dari kolom terakhir penjumlahan 4 digit + 4 digit tak mungkin >1)
    diperiksa = 0
    M = 1
    huruf_sisa = list('SENDORY')
    for perm in itertools.permutations([d for d in range(10) if d != M], len(huruf_sisa)):
        diperiksa += 1
        sol = dict(zip(huruf_sisa, perm))
        sol['M'] = M
        if sol['S'] == 0:
            continue
        if sol['O'] != 0:
            continue
        if rakit(sol, 'SEND') + rakit(sol, 'MORE') == rakit(sol, 'MONEY'):
            return sol, diperiksa
    return None, diperiksa

t0 = time.time(); sol_b, kand_brute = send_more_money_brute(); t_brute = time.time() - t0
t0 = time.time(); sol_c, kand_batasan = send_more_money_batasan(); t_batasan = time.time() - t0
for sol in (sol_b, sol_c):
    assert rakit(sol, 'SEND') == 9567
    assert rakit(sol, 'MORE') == 1085
    assert rakit(sol, 'MONEY') == 10652
assert kand_batasan < kand_brute
print("Tugas3 SEND+MORE=MONEY:", sol_b, "brute:", kand_brute, "batasan:", kand_batasan)

# ============================================================
# TUGAS 4 -- PENALARAN BATASAN KASUS RUMAH SAKIT (Contoh 4.4)
# ============================================================
def cari_komposisi():
    for total in [16]:
        for pp in range(0, total + 1):
            for pw in range(0, total + 1):
                for dp in range(0, total + 1):
                    dw = total - pp - pw - dp
                    if dw < 0:
                        continue
                    if pp + pw + dp + dw != 16:
                        continue
                    if not (pp + pw > dp + dw):
                        continue
                    if not (dp > pp):
                        continue
                    if not (pp > pw):
                        continue
                    if not (dw >= 1):
                        continue
                    return {'PP': pp, 'PW': pw, 'DP': dp, 'DW': dw}
    return None

BATASAN_DESKRIPSI = [
    "PP + PW + DP + DW = 16",
    "PP + PW > DP + DW",
    "DP > PP",
    "PP > PW",
    "DW >= 1",
]

def cek_batasan(k):
    pp, pw, dp, dw = k['PP'], k['PW'], k['DP'], k['DW']
    hasil = [
        pp + pw + dp + dw == 16,
        pp + pw > dp + dw,
        dp > pp,
        pp > pw,
        dw >= 1,
    ]
    return hasil

def identitas_penutur(komposisi):
    # Penutur menggambarkan KOMPOSISI SISA (15 orang) setelah dirinya dikeluarkan,
    # sehingga batasan 1 (total = 16) tidak relevan lagi untuk sisa kelompok --
    # yang diuji hanyalah batasan relasional 2 sampai 5.
    kategori_map = {'PP': 'Perawat Pria', 'PW': 'Perawat Wanita', 'DP': 'Dokter Pria', 'DW': 'Dokter Wanita'}
    rincian = {}
    for kat in ('PP', 'PW', 'DP', 'DW'):
        k2 = dict(komposisi)
        k2[kat] -= 1
        hasil = cek_batasan(k2)[1:]
        dilanggar = [i + 2 for i, ok in enumerate(hasil) if not ok]
        rincian[kategori_map[kat]] = dilanggar
    sah = [nama for nama, v in rincian.items() if not v]
    return (sah[0] if len(sah) == 1 else sah), rincian

k = cari_komposisi()
assert k == {'PP': 5, 'PW': 4, 'DP': 6, 'DW': 1}, k
siapa, rincian = identitas_penutur(k)
assert siapa == 'Perawat Wanita', siapa
print("Tugas4 Komposisi:", k, "Penutur:", siapa)

# ============================================================
# TUGAS 5 -- LOGIC PROGRAMMING SILSILAH KELUARGA (Gambar 4.8)
# ============================================================
FAKTA = [
    ('parent', 'john', 'jack'),
    ('parent', 'jack', 'oliver'),
    ('parent', 'oliver', 'ryan'),
    ('parent', 'john', 'mary'),
    ('parent', 'mary', 'susan'),
]
ATURAN = [
    (('descend', 'X', 'Y'), [('parent', 'X', 'Y')]),
    (('descend', 'X', 'Y'), [('parent', 'X', 'Z'), ('descend', 'Z', 'Y')]),
    (('ancestor', 'X', 'Y'), [('parent', 'Y', 'X')]),
    (('ancestor', 'X', 'Y'), [('parent', 'Y', 'Z'), ('ancestor', 'X', 'Z')]),
]

def peubah(t):
    return isinstance(t, str) and t[:1].isupper()

def walk(term, subst):
    while peubah(term) and term in subst:
        term = subst[term]
    return term

def unifikasi_literal(a, b, subst):
    if a[0] != b[0] or len(a) != len(b):
        return None
    subst = dict(subst)
    for x, y in zip(a[1:], b[1:]):
        xv = walk(x, subst)
        yv = walk(y, subst)
        if xv == yv:
            continue
        if peubah(xv):
            subst[xv] = yv
        elif peubah(yv):
            subst[yv] = xv
        else:
            return None
    return subst

def terapkan(lit, subst):
    return (lit[0],) + tuple(walk(t, subst) for t in lit[1:])

# Penelusuran mundur (backward chaining) sederhana dengan penggantian nama
# peubah otomatis (variable renaming) tiap aturan dipanggil, agar aturan
# rekursif tidak bentrok peubahnya antar level rekursi.
_rename_counter = [0]

def rename_aturan(kepala, badan):
    _rename_counter[0] += 1
    tag = '_%d' % _rename_counter[0]
    pemetaan = {}

    def ganti(lit):
        return (lit[0],) + tuple((pemetaan.setdefault(t, t + tag) if peubah(t) else t) for t in lit[1:])
    return ganti(kepala), [ganti(b) for b in badan]

def buktikan(goals, subst, kedalaman):
    if kedalaman > 30:
        return
    if not goals:
        yield subst
        return
    goal = terapkan(goals[0], subst)
    sisa = goals[1:]
    for f in FAKTA:
        s2 = unifikasi_literal(goal, f, subst)
        if s2 is not None:
            yield from buktikan(sisa, s2, kedalaman + 1)
    for kepala, badan in ATURAN:
        kepala_r, badan_r = rename_aturan(kepala, badan)
        s2 = unifikasi_literal(goal, kepala_r, subst)
        if s2 is not None:
            yield from buktikan(badan_r + sisa, s2, kedalaman + 1)

def jawab(goal):
    out = []
    seen = set()
    for subst in buktikan([goal], {}, 0):
        hasil = terapkan(goal, subst)
        if hasil not in seen:
            seen.add(hasil)
            out.append(hasil)
    return out

assert ('parent', 'john', 'jack') in jawab(('parent', 'john', 'X'))
turunan_john = {g[2] for g in jawab(('descend', 'john', 'X'))}
assert turunan_john == {'jack', 'oliver', 'ryan', 'mary', 'susan'}, turunan_john
leluhur_ryan = {g[2] for g in jawab(('ancestor', 'ryan', 'Y'))}
assert leluhur_ryan == {'john', 'jack', 'oliver'}, leluhur_ryan
hasil_desc = jawab(('descend', 'john', 'X'))
assert len(hasil_desc) == len(set(hasil_desc))
print("Tugas5 Turunan john:", sorted(turunan_john))
print("Tugas5 Leluhur ryan:", sorted(leluhur_ryan))

query_parent_john = jawab(('parent', 'john', 'X'))

# ============================================================
# TULIS data.js
# ============================================================
data = {
    "andor": {
        "tree": and_or_tree,
        "biayaMinimum": biaya_minimum(GRAF),
    },
    "peta": {
        "adjacency": AUSTRALIA,
        "warna": w,
        "kMin": k_min,
        "namaWarna": ["Merah", "Hijau", "Biru"],
    },
    "kripto": {
        "solusi": sol_b,
        "send": rakit(sol_b, 'SEND'),
        "more": rakit(sol_b, 'MORE'),
        "money": rakit(sol_b, 'MONEY'),
        "kandidatBrute": kand_brute,
        "kandidatBatasan": kand_batasan,
        "waktuBrute": round(t_brute, 4),
        "waktuBatasan": round(t_batasan, 4),
    },
    "rumahSakit": {
        "komposisi": k,
        "batasanDeskripsi": BATASAN_DESKRIPSI,
        "penutur": siapa,
        "rincian": rincian,
    },
    "silsilah": {
        "fakta": FAKTA,
        "queryParentJohn": query_parent_john,
        "turunanJohn": sorted(turunan_john),
        "leluhurRyan": sorted(leluhur_ryan),
    },
}

with open('data.js', 'w') as f:
    f.write('/*\n * KupasAI - Modul 2: Teknik Pemecahan Permasalahan\n')
    f.write(' * Seluruh angka dihasilkan dari implementasi independen (generate_data.py),\n')
    f.write(' * diverifikasi terhadap kriteria pada Modul Lab Mandiri 2 (INF20052).\n */\n')
    f.write('var KK2_DATA = ')
    f.write(json.dumps(data, indent=2, ensure_ascii=False))
    f.write(';\n')

print("\ndata.js ditulis.")

"""
KupasAI - Modul 1: Pemodelan Ruang Keadaan dan Algoritma Pencarian
Implementasi independen (bukan menyalin notebook mahasiswa) untuk memverifikasi
seluruh angka terhadap kriteria pada Modul_1_Pemodelan_Ruang_Keadaan_dan_Algoritma_Pencarian
(RPS INF20052 Kecerdasan Komputasional). Skrip ini mencetak hasil dan menuliskan data.js.
"""
import json
from collections import deque

# ============================================================
# TUGAS 1 -- ROBOT PENYEDOT DEBU (Contoh 2.5)
# state = (posisi, debu_kiri, debu_kanan); posisi 0=kiri, 1=kanan
# ============================================================

def semua_keadaan():
    return [(p, dl, dr) for p in (0, 1) for dl in (0, 1) for dr in (0, 1)]

def aksi_robot(state, aksi):
    pos, dl, dr = state
    if aksi == 'kiri':
        return (0, dl, dr)
    if aksi == 'kanan':
        return (1, dl, dr)
    if aksi == 'sedot':
        if pos == 0:
            return (pos, 0, dr)
        else:
            return (pos, dl, 0)
    raise ValueError(aksi)

def cari_solusi_robot(awal, tujuan):
    frontier = deque([(awal, [])])
    visited = {awal}
    while frontier:
        state, jalur = frontier.popleft()
        if state == tujuan:
            return jalur, len(jalur)
        for aksi in ('sedot', 'kanan', 'kiri'):
            baru = aksi_robot(state, aksi)
            if baru not in visited:
                visited.add(baru)
                frontier.append((baru, jalur + [aksi]))
    return None, None

states8 = semua_keadaan()
assert len(states8) == 8
awal_r = (0, 1, 1)
tujuan_r = (0, 0, 0)
aksi_r, biaya_r = cari_solusi_robot(awal_r, tujuan_r)
assert biaya_r == 4, biaya_r
assert len(aksi_r) == 4
print("Tugas1 Robot:", aksi_r, biaya_r)

robot_path_states = [awal_r]
for a in aksi_r:
    robot_path_states.append(aksi_robot(robot_path_states[-1], a))

# state transition edges for diagram (all states, all actions)
robot_edges = []
for s in states8:
    for a in ('kiri', 'kanan', 'sedot'):
        s2 = aksi_robot(s, a)
        if s2 != s:
            robot_edges.append({"from": list(s), "to": list(s2), "aksi": a})

# ============================================================
# TUGAS 2 -- DUA KENDI AIR (Contoh 2.6 / Tabel 2.5)
# ============================================================
KAP1, KAP2 = 4, 3

def terapkan_aturan(state):
    x, y = state
    hasil = []
    if x < KAP1:
        hasil.append((1, (KAP1, y)))                      # isi kendi 1 penuh
    if y < KAP2:
        hasil.append((2, (x, KAP2)))                       # isi kendi 2 penuh
    if x > 0:
        hasil.append((3, (0, y)))                           # kosongkan kendi 1
    if y > 0:
        hasil.append((4, (x, 0)))                           # kosongkan kendi 2
    if x > 0 and y < KAP2:                                  # tuang 1 -> 2 sampai 2 penuh atau 1 kosong
        d = min(x, KAP2 - y)
        if d > 0:
            hasil.append((5, (x - d, y + d)))
    if y > 0 and x < KAP1:                                  # tuang 2 -> 1
        d = min(y, KAP1 - x)
        if d > 0:
            hasil.append((6, (x + d, y - d)))
    return hasil

def cari_kendi(awal=(0, 0), target=(2, 0)):
    frontier = deque([(awal, [], [awal])])
    visited = {awal}
    while frontier:
        state, aturan, jalur = frontier.popleft()
        if state == target:
            return aturan, jalur
        for no, s2 in terapkan_aturan(state):
            if s2 not in visited:
                visited.add(s2)
                frontier.append((s2, aturan + [no], jalur + [s2]))
    return None, None

ruang_kendi = {(x, y) for x in range(KAP1 + 1) for y in range(KAP2 + 1)}
assert len(ruang_kendi) == 20
aturan_kendi, jalur_kendi = cari_kendi()
assert jalur_kendi[0] == (0, 0) and jalur_kendi[-1] == (2, 0)
print("Tugas2 Kendi:", aturan_kendi, jalur_kendi)

# ============================================================
# TUGAS 3 -- BFS & DFS PADA PETA (Gambar 3.1)
# ============================================================
# Urutan tetangga tiap kota direkonstruksi persis dari Tabel 3.1 (BFS) dan
# Tabel 3.2 (DFS) pada buku -- diverifikasi menghasilkan kunjungan dan isi
# antrian yang identik baris demi baris dengan kedua tabel itu. Peta buku
# TIDAK memuat ruas Sibiu-Oradea (hanya Zerind-Oradea), berbeda tipis dari
# peta AIMA klasik, namun ini tidak memengaruhi jalur manapun yang dibahas.
PETA = {
    'Arad':        {'Timisoara': 118, 'Sibiu': 140, 'Zerind': 75},
    'Timisoara':   {'Arad': 118, 'Lugoj': 111},
    'Sibiu':       {'Arad': 140, 'Rimnicu': 80, 'Fagaras': 99},
    'Zerind':      {'Arad': 75, 'Oradea': 71},
    'Lugoj':       {'Timisoara': 111, 'Mehadia': 70},
    'Rimnicu':     {'Sibiu': 80, 'Craiova': 146, 'Pitesti': 97},
    'Fagaras':     {'Sibiu': 99, 'Bucharest': 211},
    'Oradea':      {'Zerind': 71},
    'Mehadia':     {'Lugoj': 70, 'Drobeta': 75},
    'Craiova':     {'Drobeta': 120, 'Pitesti': 138, 'Rimnicu': 146},
    'Pitesti':     {'Bucharest': 101, 'Rimnicu': 97, 'Craiova': 138},
    'Bucharest':   {'Fagaras': 211, 'Pitesti': 101},
    'Drobeta':     {'Mehadia': 75, 'Craiova': 120},
}

def panjang_jalur(jalur):
    return sum(PETA[a][b] for a, b in zip(jalur, jalur[1:]))

def bfs(graf, awal, tujuan):
    frontier = deque([[awal]])
    visited = {awal}
    steps = []
    n = 0
    while frontier:
        jalur = frontier.popleft()
        node = jalur[-1]
        n += 1
        steps.append({"kunjungan": node, "bucharest": node == tujuan, "antrian": [p[-1] for p in frontier]})
        if node == tujuan:
            return jalur, n, steps
        for tetangga in graf[node]:
            if tetangga not in visited:
                visited.add(tetangga)
                frontier.append(jalur + [tetangga])
    return None, n, steps

def dfs(graf, awal, tujuan):
    stack = [[awal]]
    visited = set()
    order = []
    n = 0
    while stack:
        jalur = stack.pop()
        node = jalur[-1]
        if node in visited:
            continue
        visited.add(node)
        order.append(node)
        n += 1
        if node == tujuan:
            return jalur, n, order
        for tetangga in reversed(list(graf[node].keys())):
            if tetangga not in visited:
                stack.append(jalur + [tetangga])
    return None, n, order

jalur_bfs, n_bfs, steps_bfs = bfs(PETA, 'Arad', 'Bucharest')
assert jalur_bfs == ['Arad', 'Sibiu', 'Fagaras', 'Bucharest'], jalur_bfs
assert panjang_jalur(jalur_bfs) == 450
jalur_dfs, n_dfs, order_dfs = dfs(PETA, 'Arad', 'Bucharest')
print("Tugas3 BFS:", jalur_bfs, panjang_jalur(jalur_bfs), n_bfs)
print("Tugas3 DFS:", jalur_dfs, panjang_jalur(jalur_dfs), n_dfs)

# ============================================================
# TUGAS 4a -- GREEDY BEST FIRST SEARCH
# ============================================================
SLD = {'Arad': 366, 'Bucharest': 0, 'Craiova': 160, 'Drobeta': 242, 'Fagaras': 176,
       'Lugoj': 244, 'Mehadia': 241, 'Oradea': 380, 'Pitesti': 100, 'Rimnicu': 193,
       'Sibiu': 253, 'Timisoara': 329, 'Zerind': 374}

def greedy_best_first(graf, awal, tujuan, h):
    import heapq
    counter = 0
    frontier = [(h[awal], counter, [awal])]
    visited = {awal}
    n = 0
    while frontier:
        _, _, jalur = heapq.heappop(frontier)
        node = jalur[-1]
        n += 1
        if node == tujuan:
            return jalur, n
        for tetangga in graf[node]:
            if tetangga not in visited:
                visited.add(tetangga)
                counter += 1
                heapq.heappush(frontier, (h[tetangga], counter, jalur + [tetangga]))
    return None, n

jalur_g, n_g = greedy_best_first(PETA, 'Arad', 'Bucharest', SLD)
assert jalur_g == ['Arad', 'Sibiu', 'Fagaras', 'Bucharest'], jalur_g
print("Tugas4a Greedy:", jalur_g, panjang_jalur(jalur_g), n_g)

# ============================================================
# TUGAS 4b -- HILL CLIMBING PADA 8-PUZZLE (Gambar 3.10)
# ============================================================
TUJUAN_GESER = (1, 2, 3, 4, 5, 6, 7, 8, 0)

def h_salah_tempat(state):
    return sum(1 for i, v in enumerate(state) if v != 0 and v != TUJUAN_GESER[i])

def tetangga_geser(state):
    idx0 = state.index(0)
    r, c = divmod(idx0, 3)
    hasil = []
    for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        nr, nc = r + dr, c + dc
        if 0 <= nr < 3 and 0 <= nc < 3:
            nidx = nr * 3 + nc
            lst = list(state)
            lst[idx0], lst[nidx] = lst[nidx], lst[idx0]
            hasil.append(tuple(lst))
    return hasil

def simple_hill_climbing(awal, h, tetangga, maks_langkah=200):
    state = awal
    jejak = [h(state)]
    trace = [list(state)]
    for _ in range(maks_langkah):
        cur_h = h(state)
        if cur_h == 0:
            break
        found = None
        for t in tetangga(state):
            if h(t) < cur_h:
                found = t
                break
        if found is None:
            break
        state = found
        jejak.append(h(state))
        trace.append(list(state))
    return state, jejak, trace

def steepest_ascent(awal, h, tetangga, maks_langkah=200):
    state = awal
    jejak = [h(state)]
    trace = [list(state)]
    for _ in range(maks_langkah):
        cur_h = h(state)
        if cur_h == 0:
            break
        cands = tetangga(state)
        best = min(cands, key=h)
        if h(best) >= cur_h:
            break
        state = best
        jejak.append(h(state))
        trace.append(list(state))
    return state, jejak, trace

assert h_salah_tempat(TUJUAN_GESER) == 0
assert h_salah_tempat((1, 2, 3, 4, 5, 6, 7, 0, 8)) == 1
awal_geser = (1, 2, 3, 0, 4, 6, 7, 5, 8)
akhir_s, jejak_s, trace_s = simple_hill_climbing(awal_geser, h_salah_tempat, tetangga_geser)
akhir_t, jejak_t, trace_t = steepest_ascent(awal_geser, h_salah_tempat, tetangga_geser)
print("Tugas4b Simple HC:", jejak_s, "berhenti h=", h_salah_tempat(akhir_s))
print("Tugas4b Steepest:", jejak_t, "berhenti h=", h_salah_tempat(akhir_t))

# Contoh tambahan: puzzle acak yang benar-benar terhenti pada puncak lokal,
# untuk melengkapi ilustrasi konsep (di luar kasus wajib awal_geser di atas
# yang ternyata konvergen sempurna untuk kedua varian).
awal_geser2 = (2, 5, 3, 4, 1, 6, 7, 0, 8)
akhir_s2, jejak_s2, trace_s2 = simple_hill_climbing(awal_geser2, h_salah_tempat, tetangga_geser)
akhir_t2, jejak_t2, trace_t2 = steepest_ascent(awal_geser2, h_salah_tempat, tetangga_geser)
print("Contoh2 Simple HC:", jejak_s2, "berhenti h=", h_salah_tempat(akhir_s2))
print("Contoh2 Steepest:", jejak_t2, "berhenti h=", h_salah_tempat(akhir_t2))

# ============================================================
# TUGAS 5 -- MINIMAX & ALPHA-BETA PRUNING (Gambar 3.23)
# ============================================================
POHON = [[[3, 5], [6, 9]], [[1, 2], [0, -1]], [[5, 4], [7, 8]]]

minimax_leaves = {"n": 0}
alphabeta_leaves = {"n": 0}
alphabeta_visited = set()

def minimax(node, is_max):
    if isinstance(node, int):
        minimax_leaves["n"] += 1
        return node
    vals = [minimax(child, not is_max) for child in node]
    return max(vals) if is_max else min(vals)

def alphabeta(node, alpha, beta, is_max, path=()):
    alphabeta_visited.add(path)
    if isinstance(node, int):
        alphabeta_leaves["n"] += 1
        return node
    if is_max:
        v = float('-inf')
        for i, child in enumerate(node):
            v = max(v, alphabeta(child, alpha, beta, False, path + (i,)))
            alpha = max(alpha, v)
            if alpha >= beta:
                break
    else:
        v = float('inf')
        for i, child in enumerate(node):
            v = min(v, alphabeta(child, alpha, beta, True, path + (i,)))
            beta = min(beta, v)
            if beta <= alpha:
                break
    return v

v1 = minimax(POHON, True)
v2 = alphabeta(POHON, float('-inf'), float('inf'), True)
assert v1 == v2
assert alphabeta_leaves["n"] < minimax_leaves["n"]
print("Tugas5 Minimax root:", v1, "daun minimax:", minimax_leaves["n"], "daun alphabeta:", alphabeta_leaves["n"], "terpangkas:", minimax_leaves["n"] - alphabeta_leaves["n"])

def semua_path(node, path=()):
    out = [path]
    if not isinstance(node, int):
        for i, child in enumerate(node):
            out.extend(semua_path(child, path + (i,)))
    return out

semua_path_list = ['/'.join(map(str, p)) for p in semua_path(POHON)]
alphabeta_visited_list = ['/'.join(map(str, p)) for p in alphabeta_visited]

# ------------------------------------------------------------
# Contoh tambahan: pohon ASLI dari Gambar 3.23 buku (bukan dari
# modul lab, melainkan dari BAB 3.3.2 Alpha Beta Pruning). Daun:
# {3,5,6,2,7,9,1,0,2}, akar A=maks{B,C,D}=maks{3,2,0}=3 (melangkah
# ke B). Node yang tak perlu dihitung heuristiknya: {7,9,0,2}.
# ------------------------------------------------------------
POHON_BUKU = [[3, 5, 6], [2, 7, 9], [1, 0, 2]]

minimax_leaves_b = {"n": 0}
alphabeta_leaves_b = {"n": 0}
alphabeta_visited_b = set()

def minimax_b(node, is_max):
    if isinstance(node, int):
        minimax_leaves_b["n"] += 1
        return node
    vals = [minimax_b(child, not is_max) for child in node]
    return max(vals) if is_max else min(vals)

def alphabeta_b(node, alpha, beta, is_max, path=()):
    alphabeta_visited_b.add(path)
    if isinstance(node, int):
        alphabeta_leaves_b["n"] += 1
        return node
    if is_max:
        v = float('-inf')
        for i, child in enumerate(node):
            v = max(v, alphabeta_b(child, alpha, beta, False, path + (i,)))
            alpha = max(alpha, v)
            if alpha >= beta:
                break
    else:
        v = float('inf')
        for i, child in enumerate(node):
            v = min(v, alphabeta_b(child, alpha, beta, True, path + (i,)))
            beta = min(beta, v)
            if beta <= alpha:
                break
    return v

v1b = minimax_b(POHON_BUKU, True)
v2b = alphabeta_b(POHON_BUKU, float('-inf'), float('inf'), True)
assert v1b == v2b == 3
assert minimax_leaves_b["n"] == 9
assert alphabeta_leaves_b["n"] == 5
path_daun_b = [p for p in semua_path(POHON_BUKU) if len(p) == 2]
nilai_dipangkas_b = sorted(POHON_BUKU[p[0]][p[1]] for p in path_daun_b if p not in alphabeta_visited_b)
assert nilai_dipangkas_b == [0, 2, 7, 9]
print("Tugas5-Buku Minimax root:", v1b, "daun minimax:", minimax_leaves_b["n"],
      "daun alphabeta:", alphabeta_leaves_b["n"], "dipangkas:", nilai_dipangkas_b,
      "-- tereproduksi persis sesuai Gambar 3.23 buku.")

semua_path_list_b = ['/'.join(map(str, p)) for p in semua_path(POHON_BUKU)]
alphabeta_visited_list_b = ['/'.join(map(str, p)) for p in alphabeta_visited_b]

# ============================================================
# TULIS data.js
# ============================================================
data = {
    "robot": {
        "states": [list(s) for s in states8],
        "edges": robot_edges,
        "start": list(awal_r),
        "goal": list(tujuan_r),
        "solution": aksi_r,
        "cost": biaya_r,
        "pathStates": [list(s) for s in robot_path_states],
    },
    "kendi": {
        "kap1": KAP1, "kap2": KAP2,
        "spaceSize": len(ruang_kendi),
        "start": [0, 0],
        "target": [2, 0],
        "aturan": aturan_kendi,
        "jalur": [list(s) for s in jalur_kendi],
        "aturanNama": {
            "1": "Isi kendi 1 (4 galon) penuh",
            "2": "Isi kendi 2 (3 galon) penuh",
            "3": "Kosongkan kendi 1",
            "4": "Kosongkan kendi 2",
            "5": "Tuang kendi 1 ke kendi 2",
            "6": "Tuang kendi 2 ke kendi 1",
        },
    },
    "peta": {
        "nodes": list(PETA.keys()),
        "edges": [{"from": a, "to": b, "jarak": d} for a, adj in PETA.items() for b, d in adj.items() if a < b],
        "sld": SLD,
        "bfs": {"jalur": jalur_bfs, "jarak": panjang_jalur(jalur_bfs), "dikunjungi": n_bfs, "langkah": steps_bfs},
        "dfs": {"jalur": jalur_dfs, "jarak": panjang_jalur(jalur_dfs), "dikunjungi": n_dfs, "urutan": order_dfs},
        "greedy": {"jalur": jalur_g, "jarak": panjang_jalur(jalur_g), "dikunjungi": n_g},
    },
    "puzzle": {
        "goal": list(TUJUAN_GESER),
        "start": list(awal_geser),
        "simpleHC": {"jejakH": jejak_s, "trace": trace_s, "akhirH": h_salah_tempat(akhir_s), "stuck": h_salah_tempat(akhir_s) > 0},
        "steepest": {"jejakH": jejak_t, "trace": trace_t, "akhirH": h_salah_tempat(akhir_t), "stuck": h_salah_tempat(akhir_t) > 0},
        "contoh2": {
            "start": list(awal_geser2),
            "simpleHC": {"jejakH": jejak_s2, "trace": trace_s2, "akhirH": h_salah_tempat(akhir_s2), "stuck": h_salah_tempat(akhir_s2) > 0},
            "steepest": {"jejakH": jejak_t2, "trace": trace_t2, "akhirH": h_salah_tempat(akhir_t2), "stuck": h_salah_tempat(akhir_t2) > 0},
        },
    },
    "minimax": {
        "tree": POHON,
        "rootValue": v1,
        "leavesMinimax": minimax_leaves["n"],
        "leavesAlphabeta": alphabeta_leaves["n"],
        "pruned": minimax_leaves["n"] - alphabeta_leaves["n"],
        "allPaths": semua_path_list,
        "alphabetaVisited": alphabeta_visited_list,
    },
    "minimaxBuku": {
        "tree": POHON_BUKU,
        "rootValue": v1b,
        "leavesMinimax": minimax_leaves_b["n"],
        "leavesAlphabeta": alphabeta_leaves_b["n"],
        "pruned": minimax_leaves_b["n"] - alphabeta_leaves_b["n"],
        "allPaths": semua_path_list_b,
        "alphabetaVisited": alphabeta_visited_list_b,
    },
}

with open('data.js', 'w') as f:
    f.write('/*\n * KupasAI - Modul 1: Pemodelan Ruang Keadaan dan Algoritma Pencarian\n')
    f.write(' * Seluruh angka dihasilkan dari implementasi independen (generate_data.py),\n')
    f.write(' * diverifikasi terhadap kriteria pada Modul Lab Mandiri 1 (INF20052).\n */\n')
    f.write('var KK1_DATA = ')
    f.write(json.dumps(data, indent=2, ensure_ascii=False))
    f.write(';\n')

print("\ndata.js ditulis.")

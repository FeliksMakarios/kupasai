"""Build shared catalogue, static navigation, concept checks, and search index."""
from pathlib import Path
from html import escape,unescape
import json,re
from lessons import LESSONS
from new_lessons import NEW
from quizzes import CHECKS
ROOT=Path(__file__).resolve().parents[1]
items=[]
for slug,d in LESSONS.items():
 page=(ROOT/slug/'index.html').read_text();title=unescape(re.sub('<[^>]+>','',re.search(r'<h1[^>]*>([\s\S]*?)</h1>',page)[1])).strip()
 items.append(dict(slug=slug,title=title,prerequisite=d[0],minutes=d[1],provenance=d[2],limits=d[3],source=d[6]))
for slug,d in NEW.items():
 if slug in LESSONS:continue
 items.append(dict(slug=slug,title=d['title'],prerequisite=d['prereq'],minutes=25,provenance='Simulasi sintetis deterministik; tidak menjalankan model pretrained.',limits=d['note'],source=d['source']))
items.sort(key=lambda d: (['ml','ml-lanjut','nlp','kecerdasan-komputasional'].index(d['slug'].split('/')[0]),list(LESSONS.keys()).index(d['slug']) if d['slug'] in LESSONS else 100+list(NEW).index(d['slug'])))
for order,d in enumerate(items):d.update(order=order,reviewed='2026-09-26',questions=CHECKS[d['slug'].split('/')[-1]])
(ROOT/'assets/lessons.json').write_text(json.dumps(items,ensure_ascii=False,indent=2)+'\n')
(ROOT/'assets/js/catalog-data.js').write_text('window.KupasCatalog='+json.dumps(items,ensure_ascii=False)+';\n')
for d in items:
 p=ROOT/d['slug']/'index.html';s=p.read_text();s=re.sub(r'<!-- catalog:start -->[\s\S]*?<!-- catalog:end -->','',s)
 siblings=[x for x in items if x['slug'].split('/')[0]==d['slug'].split('/')[0]];i=siblings.index(d)
 links=[]
 for label,ix in [('← Sebelumnya',i-1),('Berikutnya →',i+1)]:
  if 0<=ix<len(siblings):links.append(f'<a href="/kupasai/{siblings[ix]["slug"]}/">{label}: {escape(siblings[ix]["title"])}</a>')
 block=f'''<!-- catalog:start --><section class="learning-aid topic-tools" data-topic="{d['slug']}"><h2>Uji Pemahaman</h2><p>Dua latihan dengan penjelasan. Progres dihitung setelah semua jawaban benar; membuka halaman saja tidak menandai selesai.</p><div id="concept-checks"></div><p id="quiz-status" role="status"></p><div class="learning-actions"><button id="export-notes" type="button">Ekspor catatan dan progres</button><label for="import-notes">Impor cadangan JSON</label><input id="import-notes" type="file" accept="application/json"><button id="share-controls" type="button">Salin tautan eksperimen</button><button id="reset-controls" type="button">Reset kontrol</button></div><p id="learning-status" role="status"></p><p>Prasyarat: {escape(d['prerequisite'])}. Ditinjau: {d['reviewed']}. <a href="{d['source']}">Rujukan konsep</a>. Lihat panduan asal data; tanggal tinjauan tidak menyatakan semua hasil berasal dari publikasi itu.</p><nav class="lesson-sequence" aria-label="Urutan belajar">{' '.join(links)}</nav></section><!-- catalog:end -->'''
 s=s.replace('</main>',block+'\n</main>')
 p.write_text(s)
for p in ROOT.glob('**/index.html'):
 if 'node_modules' in p.parts:continue
 s=p.read_text()
 if p.parent.name=='word-embeddings' and 'src="companion.js"' not in s:s=s.replace('</head>','<script src="companion.js" defer></script>\n</head>')
 for src in ['experiments','catalog-data','catalog','offline']:
  tag=f'<script src="/kupasai/assets/js/{src}.js" defer></script>'
  if tag not in s:s=s.replace('</head>',tag+'\n</head>')
 if '/assets/js/state.js' not in s:s=s.replace('</head>','<script src="/kupasai/assets/js/state.js"></script>\n</head>')
 css='<link rel="stylesheet" href="/kupasai/assets/css/catalog.css">'
 if css not in s:s=s.replace('</head>',css+'\n</head>')
 p.write_text(s)
# Static links remain useful without JS and expose all new modules to crawlers.
for course in ['ml','ml-lanjut','nlp','kecerdasan-komputasional']:
 p=ROOT/course/'index.html';s=p.read_text();s=re.sub(r'<!-- extras:start -->[\s\S]*?<!-- extras:end -->','',s)
 additions=[d for d in items if d['slug'] in NEW and d['slug'].startswith(course+'/')]
 if additions:s=s.replace('</main>','<!-- extras:start --><section class="content-wrapper"><h2>Laboratorium Pendamping</h2><ul>'+''.join(f'<li><a href="/kupasai/{d["slug"]}/">{escape(d["title"])}</a> — {d["minutes"]} menit</li>' for d in additions)+'</ul></section><!-- extras:end -->\n</main>')
 p.write_text(s)
p=ROOT/'index.html';s=p.read_text();s=re.sub(r'<!-- discovery:start -->[\s\S]*?<!-- discovery:end -->','',s)
s=s.replace('<h2 id="courses" class="section-title">Mata Kuliah</h2>','<h2 class="section-title">Mata Kuliah</h2>')
s=s.replace('<h2 class="section-title">Mata Kuliah</h2>','''<!-- discovery:start --><section class="discovery"><h2>Mulai Belajar</h2><p><a href="/kupasai/ml/pandas/">Pemula: mulai dari data</a> · <a href="/kupasai/ml/evaluasi-model/">Praktisi: evaluasi model</a> · <a href="#courses">Mahasiswa: ikuti urutan RPS</a></p><label for="topic-search">Cari topik atau prasyarat</label><input id="topic-search" type="search" placeholder="Contoh: attention, gradien, evaluasi"><p id="search-status" role="status"></p><ul id="topic-results"></ul></section><!-- discovery:end --><h2 id="courses" class="section-title">Mata Kuliah</h2>''')
p.write_text(s)
print('Catalogue:',len(items),'topics;',sum(len(d['questions']) for d in items),'questions')

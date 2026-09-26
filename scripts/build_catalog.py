"""Build topic lists, dedicated companion labs, and audience learning tracks."""
from pathlib import Path
from html import escape, unescape
import json, re
from lessons import LESSONS
from new_lessons import NEW
from quizzes import CHECKS
from build_lessons import learning_aid
ROOT=Path(__file__).resolve().parents[1]
COURSES={'ml':'Pengantar Pemelajaran Mesin','ml-lanjut':'Pemelajaran Mesin Lanjut','nlp':'Pemrosesan Bahasa Alami','kecerdasan-komputasional':'Kecerdasan Komputasional'}
weeks=json.loads((ROOT/'scripts/course_weeks.json').read_text())
items=[]
for slug,d in LESSONS.items():
    page=(ROOT/slug/'index.html').read_text()
    title=unescape(re.sub('<[^>]+>','',re.search(r'<h1[^>]*>([\s\S]*?)</h1>',page)[1])).strip()
    items.append(dict(slug=slug,title=title,prerequisite=d[0],minutes=d[1],provenance=d[2],limits=d[3],source=d[6],week=weeks.get(slug)))
items.sort(key=lambda d:(list(COURSES).index(d['slug'].split('/')[0]),list(LESSONS).index(d['slug'])))
for order,d in enumerate(items):d.update(order=order,reviewed='2026-09-26',questions=CHECKS[d['slug'].split('/')[-1]])
(ROOT/'assets/lessons.json').write_text(json.dumps(items,ensure_ascii=False,indent=2)+'\n')
(ROOT/'assets/js/catalog-data.js').write_text('window.KupasCatalog='+json.dumps(items,ensure_ascii=False)+';\n')

def strip_block(s,name):
    return re.sub(r'<!-- '+name+r':start -->[\s\S]*?<!-- '+name+r':end -->\n?','',s)

def actions(d):
    url='/kupasai/'+d['slug']+'/'
    return f'<div class="topic-actions"><a class="topic-button" href="{url}">Visualisasi</a><a class="topic-button secondary" href="{url}laboratorium/">Laboratorium Pendamping</a></div>'

def card(d,number=None):
    week=escape(d['week'] or 'Pengayaan · di luar minggu RPS')
    number=f'<span class="topic-number" aria-hidden="true">{number:02d}</span>' if number else ''
    return f'<li class="topic-entry" data-slug="{d["slug"]}">{number}<article><h2>{escape(d["title"])}</h2><p class="topic-meta">{week} <span aria-hidden="true">·</span> Estimasi {d["minutes"]} menit</p>{actions(d)}</article></li>'

def utilities():
    return '<div class="learning-actions"><button id="share-controls" type="button">Salin tautan eksperimen</button><button id="reset-controls" type="button">Reset kontrol</button></div><p id="learning-status" role="status"></p>'

# Reuse the site's navigation and theme bootstrap, without lesson-specific code.
home=(ROOT/'index.html').read_text()
nav=re.search(r'<nav class="navbar">[\s\S]*?</nav>',home)[0]
if '/trek-belajar/' not in nav:nav=nav.replace('<ul class="navbar-links">','<ul class="navbar-links">\n    <li><a href="/kupasai/trek-belajar/">Trek Belajar</a></li>')
bootstrap=re.search(r'<script>[\s\S]*?</script>',home)[0]
def shell(title,description,content,head_extra='',body_extra=''):
    return f'''<!DOCTYPE html>
<html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{escape(title)} — KupasAI</title><meta name="description" content="{escape(description)}">
<link rel="stylesheet" href="/kupasai/assets/css/main.css"><link rel="stylesheet" href="/kupasai/assets/css/learning.css"><link rel="stylesheet" href="/kupasai/assets/css/catalog.css">
<link rel="icon" type="image/svg+xml" href="/kupasai/assets/img/favicon.svg">
{bootstrap}
<script src="/kupasai/assets/js/state.js"></script><script src="/kupasai/assets/js/learning.js" defer></script>
{head_extra}
<script src="/kupasai/assets/js/experiments.js" defer></script><script src="/kupasai/assets/js/catalog-data.js" defer></script><script src="/kupasai/assets/js/catalog.js" defer></script><script src="/kupasai/assets/js/offline.js" defer></script>
</head><body>{nav}
{content}
{body_extra}<script src="/kupasai/assets/js/theme.js"></script></body></html>\n'''

for d in items:
    slug=d['slug'];p=ROOT/slug/'index.html';s=p.read_text()
    for block in ['learning-aid','catalog','lesson-links']:s=strip_block(s,block)
    s=re.sub(r'(<main\b[^>]*?)(?: data-topic="[^"]*")?(>)',lambda m: re.sub(r' data-topic="[^"]*"','',m[1])+f' data-topic="{slug}"'+m[2],s,count=1)
    links=f'''<!-- lesson-links:start --><section class="lesson-next" aria-label="Poursuivre l'apprentissage"><h2>Lanjutkan eksplorasi</h2><p>Hitung hasilnya, tulis refleksi, lalu uji pemahaman Anda.</p><a class="topic-button" href="/kupasai/{slug}/laboratorium/">Ke Laboratorium Pendamping →</a>{utilities()}</section><!-- lesson-links:end -->'''.replace("Poursuivre l'apprentissage",'Lanjutkan belajar')
    s=s.replace('</main>',links+'\n</main>');p.write_text(s)
    siblings=[x for x in items if x['slug'].split('/')[0]==slug.split('/')[0]];i=siblings.index(d)
    sequence=' '.join(f'<a href="/kupasai/{siblings[ix]["slug"]}/laboratorium/">{label}: {escape(siblings[ix]["title"])}</a>' for label,ix in [('← Sebelumnya',i-1),('Berikutnya →',i+1)] if 0<=ix<len(siblings))
    guide=learning_aid(slug)
    quiz='<section class="learning-aid topic-tools"><h2>Uji Pemahaman</h2><p>Dua latihan dengan penjelasan. Progres dihitung setelah semua jawaban benar; membuka halaman saja tidak menandai selesai.</p><div id="concept-checks"></div><p id="quiz-status" role="status"></p></section>'
    head_extra='';body_extra='<script src="/kupasai/assets/js/tabs.js"></script>'
    # Companion calculations use the same source data, without loading the visualization renderer.
    for filename in ['data.js','companion.js']:
        if (ROOT/slug/filename).exists():head_extra+=f'<script src="/kupasai/{slug}/{filename}"></script>\n'
    experiment='<div id="companion-experiment"></div>'
    if slug in NEW:
        n=NEW[slug]
        head_extra+='<link rel="stylesheet" href="/kupasai/assets/css/laboratory.css">'
        experiment=f'<section class="learning-aid laboratory" data-lab="{n["kind"]}"><h2>Eksperimen Perhitungan</h2><p>{escape(n["intro"])}</p>{n["controls"]}<button id="lab-reset" type="button">Reset eksperimen</button><div id="lab-result" aria-live="polite"></div><p>{escape(n["note"])}</p></section>'
        body_extra+='<script src="/kupasai/assets/js/laboratory.js"></script>'
    tabs=''.join(f'<button class="tab-btn{" active" if ix==0 else ""}" role="tab" id="tabbtn-{key}" aria-controls="tab-{key}" aria-selected="{"true" if ix==0 else "false"}" tabindex="{0 if ix==0 else -1}" data-tab="{key}">{label}</button>' for ix,(key,label) in enumerate([('eksperimen','Eksperimen Perhitungan'),('panduan','Panduan Belajar Mandiri'),('uji','Uji Pemahaman')]))
    panels=''.join(f'<div class="tab-content{" active" if ix==0 else ""}" id="tab-{key}" role="tabpanel" aria-labelledby="tabbtn-{key}" tabindex="0">{content}</div>' for ix,(key,content) in enumerate([('eksperimen',experiment),('panduan',guide),('uji',quiz)]))
    content=f'''<main id="main-content" tabindex="-1" data-topic="{slug}" data-space="laboratorium"><div class="companion-layout">
<header class="companion-header"><a class="back-link" href="/kupasai/{slug}/">← Kembali ke Visualisasi</a><p class="eyebrow">Laboratorium Pendamping</p><h1>{escape(d['title'])}</h1><p class="topic-meta">{escape(d['week'] or 'Pengayaan · di luar minggu RPS')} · Estimasi seluruh topik {d['minutes']} menit</p></header>
<noscript><p class="noscript-note">Aktifkan JavaScript untuk eksperimen dan kuis. Panduan belajar tetap dapat dibaca di bawah.</p></noscript>
<div class="companion-tabs" role="tablist" aria-label="Bagian laboratorium">{tabs}</div>{panels}
<div class="companion-utilities">{utilities()}</div><nav class="lesson-sequence" aria-label="Urutan belajar">{sequence}</nav>
</div></main>'''
    lab=ROOT/slug/'laboratorium';lab.mkdir(exist_ok=True)
    (lab/'index.html').write_text(shell('Laboratorium: '+d['title'],'Latihan perhitungan, panduan belajar mandiri, dan uji pemahaman untuk '+d['title']+'.',content,head_extra,body_extra))

for course in COURSES:
    p=ROOT/course/'index.html';s=strip_block(p.read_text(),'extras')
    content='<!-- topic-list:start --><section class="topic-list-wrap" aria-label="Daftar topik"><p class="list-intro">Pilih Visualisasi untuk mengamati konsep, atau Laboratorium Pendamping untuk berlatih. Durasi merupakan estimasi untuk kedua bagian.</p><ol class="topic-list">'+''.join(card(d,i+1) for i,d in enumerate([x for x in items if x['slug'].startswith(course+'/')]))+'</ol></section><!-- topic-list:end -->'
    if '<!-- topic-list:start -->' in s:s=re.sub(r'<!-- topic-list:start -->[\s\S]*?<!-- topic-list:end -->',lambda _:content,s)
    else:s=re.sub(r'<div class="topic-table-wrap">[\s\S]*?</table>\s*</div>',lambda _:content,s,count=1)
    p.write_text(s)

home=strip_block(home,'discovery');(ROOT/'index.html').write_text(home)
roles=[('mahasiswa','Mahasiswa','Ikuti urutan RPS mata kuliah Anda.'),('pemula','Pemula','Bangun pemahaman dari data hingga model.'),('praktisi','Praktisi','Perkuat evaluasi model dan penerapan NLP.')]
role_html=''.join(f'<label class="audience-option"><input type="radio" name="audience" value="{key}"><span><strong>{title}</strong><span>{desc}</span></span></label>' for key,title,desc in roles)
content=f'''<main id="main-content" tabindex="-1"><div class="track-layout"><header class="track-header"><p class="eyebrow">Belajar dengan arah yang jelas</p><h1>Trek Belajar</h1><p>Pilih profil Anda untuk melihat urutan topik dan perkiraan waktu belajar. Anda bebas berpindah trek kapan saja.</p></header>
<fieldset class="audience-picker"><legend>Anda belajar sebagai siapa?</legend><div class="audience-options">{role_html}</div></fieldset>
<div id="course-picker" hidden><label for="track-course">Pilih mata kuliah</label><select id="track-course">{''.join(f'<option value="{k}">{v}</option>' for k,v in COURSES.items())}</select></div>
<section id="track-plan" hidden aria-labelledby="track-title"><h2 id="track-title"></h2><p id="track-description"></p><p id="track-summary" role="status"></p><ol id="track-topics" class="topic-list"></ol></section>
<noscript><p>Pilih mata kuliah berikut untuk membaca urutan topik tanpa JavaScript.</p><ul>{''.join(f'<li><a href="/kupasai/{k}/">{v}</a></li>' for k,v in COURSES.items())}</ul></noscript>
<section class="topic-search-section"><h2>Cari topik lain</h2><label for="topic-search">Cari judul atau prasyarat</label><input id="topic-search" type="search" placeholder="Contoh: attention, gradien, evaluasi"><p id="search-status" role="status"></p><ul id="topic-results" class="topic-list"></ul></section>
</div></main>'''
track=ROOT/'trek-belajar';track.mkdir(exist_ok=True)
(track/'index.html').write_text(shell('Trek Belajar','Trek belajar KupasAI untuk mahasiswa, pemula, dan praktisi, dengan urutan topik dan estimasi durasi.',content,body_extra='<script src="/kupasai/assets/js/tracks.js"></script>'))
for p in list(ROOT.glob('**/index.html'))+[ROOT/'404.html']:
    if 'node_modules' in p.parts:continue
    s=p.read_text()
    if '/kupasai/trek-belajar/' not in s.split('</nav>')[0]:s=s.replace('<ul class="navbar-links">','<ul class="navbar-links">\n    <li><a href="/kupasai/trek-belajar/">Trek Belajar</a></li>')
    if 'catalog.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="/kupasai/assets/css/catalog.css">\n</head>')
    p.write_text(s)
print('Catalogue:',len(items),'topics;',len(items),'companion labs; audience tracks built')

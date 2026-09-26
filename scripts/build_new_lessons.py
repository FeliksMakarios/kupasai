from pathlib import Path
from html import escape
import re
from new_lessons import NEW
ROOT=Path(__file__).resolve().parents[1]
template=(ROOT/'ml/churn-prediction/index.html').read_text()
head=template[:template.index('<main')]
head=re.sub(r'<!-- seo:start -->[\s\S]*?<!-- seo:end -->','',head)
head=re.sub(r'<meta name="description"[^>]*>','',head)
head=re.sub(r'<link rel="stylesheet" href="style.css">','',head)
head=re.sub(r'<title>.*?</title>','<title>{title} — KupasAI</title>',head)
for slug,d in NEW.items():
 p=ROOT/slug;p.mkdir(exist_ok=True)
 h=head.replace('{title}',escape(d['title']))
 h=re.sub(r'<span class="navbar-meta">.*?</span>','<span class="navbar-meta">Materi pengayaan</span>',h)
 h=h.replace('</head>','<link rel="stylesheet" href="/kupasai/assets/css/laboratory.css">\n</head>')
 h+=f'''<main id="main-content" tabindex="-1"><noscript><p class="noscript-note">JavaScript diperlukan untuk menjalankan eksperimen. Penjelasan konsep dan tautan rujukan tetap dapat dibaca.</p></noscript><div class="content-wrapper laboratory" data-lab="{d['kind']}">
 <header class="page-header-content"><a class="back-link" href="/kupasai/{slug.split('/')[0]}/">Kembali ke Daftar Topik</a><h1>{escape(d['title'])}</h1><p>{escape(d['intro'])}</p></header>
 <section aria-label="Eksperimen"><h2>Coba dan bandingkan</h2>{d['controls']}<button id="lab-reset" type="button">Reset eksperimen</button><div id="lab-result" aria-live="polite"></div></section>
 <aside><h2>Batas interpretasi</h2><p>{escape(d['note'])}</p><p><a href="{d['source']}">Rujukan primer</a></p></aside>
 </div><script src="/kupasai/assets/js/laboratory.js"></script></main>
 <script src="/kupasai/assets/js/theme.js"></script></body></html>'''
 (p/'index.html').write_text('\n'.join(line.rstrip() for line in h.splitlines())+'\n')
print('Built',len(NEW),'labs')

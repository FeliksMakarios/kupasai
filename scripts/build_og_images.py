"""Render 1200x630 social preview images. Needs Playwright with Chromium.

Run: python scripts/build_og_images.py [path-to-chromium]
"""
import sys
from pathlib import Path
from html import escape
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
IMG = ROOT / 'assets' / 'img'
CARDS = {
    'og-home': ('Visualisasi interaktif mata kuliah AI', 'NLP · Pemelajaran Mesin · Pemelajaran Mesin Lanjut · Kecerdasan Komputasional', None),
    'og-nlp': ('Pemrosesan Bahasa Alami', 'Natural Language Processing', 'thumbnail-nlp.svg'),
    'og-ml': ('Pengantar Pemelajaran Mesin', 'Introduction to Machine Learning', 'thumbnail-ml.svg'),
    'og-ml-lanjut': ('Pemelajaran Mesin Lanjut', 'Advanced Machine Learning', 'thumbnail-ml-lanjut.svg'),
    'og-komp': ('Kecerdasan Komputasional', 'Computational Intelligence', 'thumbnail-komp.svg'),
}
TEMPLATE = '''<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{{margin:0;width:1200px;height:630px;font-family:-apple-system,"Segoe UI",Roboto,sans-serif;background:#f5f7fa;color:#1b2533;display:flex;flex-direction:column}}
.art{{height:320px;background:#e6edf7;border-bottom:4px solid #f2b705;display:flex;align-items:center;justify-content:center;overflow:hidden}}
.art img{{width:1200px;height:320px;object-fit:cover}}
.art.home{{background:linear-gradient(135deg,#d6e2f2,#f5f7fa 60%,#e6edf7);color:#163a6b}}
.art.home .accent{{color:#b07f00}}
.art.home span{{font-size:120px;font-weight:800;letter-spacing:-3px}}
.text{{flex:1;padding:36px 64px;display:flex;flex-direction:column;gap:14px;background:#1f4e8c;color:#ffffff}}
.brand{{font-size:30px;font-weight:700}} .accent{{color:#f2b705}}
h1{{margin:0;font-size:56px;line-height:1.1;letter-spacing:-1px}}
p{{margin:0;font-size:28px;color:#d6e2f2}}
</style></head><body>
<div class="art{home}">{art}</div>
<div class="text"><div class="brand">Kupas<span class="accent">AI</span></div><h1>{title}</h1><p>{sub}</p></div>
</body></html>'''

def main():
    exe = sys.argv[1] if len(sys.argv) > 1 else None
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path=exe) if exe else pw.chromium.launch()
        page = browser.new_page(viewport={'width': 1200, 'height': 630})
        for name, (title, sub, thumb) in CARDS.items():
            art = f'<img src="{(IMG / thumb).as_uri()}" alt="">' if thumb else '<span>Kupas<span class="accent">AI</span></span>'
            html = TEMPLATE.format(home='' if thumb else ' home', art=art, title=escape(title), sub=escape(sub))
            tmp = IMG / f'.{name}.html'
            tmp.write_text(html)
            page.goto(tmp.as_uri())
            page.screenshot(path=str(IMG / f'{name}.png'))
            tmp.unlink()
        browser.close()

if __name__ == '__main__':
    main()

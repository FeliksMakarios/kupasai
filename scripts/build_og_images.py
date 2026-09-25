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
body{{margin:0;width:1200px;height:630px;font-family:-apple-system,"Segoe UI",Roboto,sans-serif;background:#ffffff;color:#1f2328;display:flex;flex-direction:column}}
.art{{height:320px;background:#f6f8fa;border-bottom:1px solid #d0d7de;display:flex;align-items:center;justify-content:center;overflow:hidden}}
.art img{{width:1200px;height:320px;object-fit:cover}}
.art.home{{background:linear-gradient(135deg,#ddf4ff,#ffffff 60%,#dafbe1)}}
.art.home span{{font-size:120px;font-weight:800;letter-spacing:-3px}}
.text{{padding:36px 64px;display:flex;flex-direction:column;gap:14px}}
.brand{{font-size:30px;font-weight:700}} .accent{{color:#0969da}}
h1{{margin:0;font-size:56px;line-height:1.1;letter-spacing:-1px}}
p{{margin:0;font-size:28px;color:#59636e}}
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

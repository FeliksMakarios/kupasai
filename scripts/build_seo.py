"""Insert canonical, description, Open Graph and Twitter tags, then write sitemap.xml. Idempotent."""
import re
import subprocess
from html import escape, unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://feliksmakarios.github.io/kupasai/'
IMAGES = {'nlp': 'og-nlp.png', 'ml': 'og-ml.png', 'ml-lanjut': 'og-ml-lanjut.png', 'kecerdasan-komputasional': 'og-komp.png'}
BLOCK = re.compile(r'\n?[ \t]*<!-- seo:start -->[\s\S]*?<!-- seo:end -->')


def clean(fragment):
    text = re.sub(r'\s+', ' ', unescape(re.sub(r'<[^>]+>', ' ', fragment))).strip()
    return re.sub(r'\s+([,.;:?!)])(?=\s|$)', r'\1', text)


def shorten(text, limit=160):
    if len(text) <= limit:
        return text
    cut = text[:limit - 1].rsplit(' ', 1)[0].rstrip(',;:')
    return cut + '…'


def describe(html, title):
    m = re.search(r'<meta name="description" content="([^"]*)"', html)
    if m:
        return unescape(m[1])
    for pattern in (r'<p class="page-subtitle">([\s\S]*?)</p>', r'<p class="course-description">([\s\S]*?)</p>',
                    r'<p class="hero-subtitle">([\s\S]*?)</p>', r'<main[^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)</p>'):
        m = re.search(pattern, html)
        if m and clean(m[1]):
            return shorten(clean(m[1]))
    return title


def lastmod(path):
    out = subprocess.run(['git', 'log', '-1', '--format=%cs', '--', str(path)], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    return out or None


pages = sorted(p for p in ROOT.glob('**/index.html') if 'node_modules' not in p.parts)
urls = []
for page in pages:
    rel = page.parent.relative_to(ROOT).as_posix()
    url = BASE if rel == '.' else BASE + rel + '/'
    html = BLOCK.sub('', page.read_text())
    title = clean(re.search(r'<title>([\s\S]*?)</title>', html)[1])
    desc = describe(html, title)
    image = BASE + 'assets/img/' + IMAGES.get(rel.split('/')[0], 'og-home.png')
    has_desc = '<meta name="description"' in html
    tags = [f'<link rel="canonical" href="{url}">']
    if not has_desc:
        tags.append(f'<meta name="description" content="{escape(desc)}">')
    tags += [
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="KupasAI">',
        '<meta property="og:locale" content="id_ID">',
        f'<meta property="og:title" content="{escape(title)}">',
        f'<meta property="og:description" content="{escape(desc)}">',
        f'<meta property="og:url" content="{url}">',
        f'<meta property="og:image" content="{image}">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{escape(title)}">',
        f'<meta name="twitter:description" content="{escape(desc)}">',
        f'<meta name="twitter:image" content="{image}">',
    ]
    block = '\n  <!-- seo:start -->\n' + '\n'.join('  ' + t for t in tags) + '\n  <!-- seo:end -->'
    html = re.sub(r'(</title>)', lambda m: m[1] + block, html, count=1)
    page.write_text(html)
    urls.append((url, lastmod(page)))

lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for url, mod in urls:
    lines.append(f'  <url><loc>{url}</loc>' + (f'<lastmod>{mod}</lastmod>' if mod else '') + '</url>')
lines.append('</urlset>')
(ROOT / 'sitemap.xml').write_text('\n'.join(lines) + '\n')
print(f'SEO tags for {len(urls)} pages, sitemap.xml written')

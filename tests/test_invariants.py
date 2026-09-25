"""Independent checks of teaching claims and local resource integrity."""
import json
import math
import re
import unittest
from pathlib import Path
from html.parser import HTMLParser
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
def data(path):
    s=(ROOT/path/'data.js').read_text()
    start=re.search(r'(?:var|const|let)\s+\w+\s*=\s*',s).end()
    return json.JSONDecoder().raw_decode(s[start:])[0]
class Tags(HTMLParser):
    def __init__(self,s):
        super().__init__();self.tags=[];self.feed(s)
    def handle_starttag(self,tag,attrs):self.tags.append((tag,dict(attrs)))
class Site(unittest.TestCase):
    def test_pages_and_assets(self):
        pages=[p for p in ROOT.glob('**/index.html') if 'node_modules' not in p.parts];self.assertEqual(len(pages),41)
        for p in pages:
            s=p.read_text();tags=Tags(s).tags
            ids=[a['id'] for t,a in tags if 'id' in a]
            self.assertEqual(len(ids),len(set(ids)),str(p))
            for tag,a in tags:
                for attr in ['src','href']:
                    url=a.get(attr,'').split('#')[0].split('?')[0]
                    if not url or ':' in url or url.startswith('//'):continue
                    target=ROOT/url.removeprefix('/kupasai/') if url.startswith('/kupasai/') else p.parent/url
                    self.assertTrue(target.exists(),f'{p.relative_to(ROOT)}: {url}')
            if (p.parent/'viz.js').exists():self.assertEqual(s.count('learning-aid:start'),1,str(p))
    def test_backprop_finite_differences(self):
        d=data('ml-lanjut/backprop-visualizer');x=np.array(d['x']);w=np.array(d['W01_initial']);v=np.array(d['W12_initial']);t=d['target'];eps=1e-6
        def loss(w,v):return .5*(np.maximum(x@w,0)@v-t)**2
        for original,final,which in [(w,np.array(d['W01_final']),0),(v,np.array(d['W12_final']),1)]:
            for ix in np.ndindex(original.shape):
                plus=original.copy();minus=original.copy();plus[ix]+=eps;minus[ix]-=eps
                grad=((loss(plus,v)-loss(minus,v)) if which==0 else (loss(w,plus)-loss(w,minus)))/(2*eps)
                self.assertAlmostEqual(final[ix],original[ix]-d['alpha']*grad,places=6)
        for step in d['steps'][:7]:np.testing.assert_allclose(step['W12'],v)
    def test_recurrent_finite_differences(self):
        d=data('nlp/rnn')['gradient_data'];eps=1e-6
        f=1/(1+math.exp(-2));i=1/(1+math.exp(1));o=1/(1+math.exp(-1))
        for n,curves in d.items():
            n=int(n)
            def run(h,c):
                for _ in range(n):h=math.tanh(.1+.7*h);c=f*c+i*math.tanh(.1)
                return h,o*math.tanh(c)
            self.assertAlmostEqual(curves['rnn'][-1],(run(eps,.2)[0]-run(-eps,.2)[0])/(2*eps),places=7)
            self.assertAlmostEqual(curves['lstm'][-1],(run(0,.2+eps)[1]-run(0,.2-eps)[1])/(2*eps),places=7)
            self.assertEqual(len(curves['rnn']),n+1)
    def test_iou(self):
        d=data('ml-lanjut/object-detection')['iou'];a=d['groundTruth']
        for p in d['presets']:
            b=p['box'];inter=max(0,min(a[2],b[2])-max(a[0],b[0]))*max(0,min(a[3],b[3])-max(a[1],b[1]))
            union=(a[2]-a[0])*(a[3]-a[1])+(b[2]-b[0])*(b[3]-b[1])-inter
            self.assertAlmostEqual(p['iou'],inter/union,places=7)
        self.assertEqual(d['presets'][2]['iou'],0)
    def test_true_labels(self):
        d=data('ml/naive-bayes')['titanic'];self.assertNotIn('samples',d);self.assertEqual(d['n_train']+d['n_test'],891)
        cm=np.array(d['confusion_matrix']);self.assertEqual(cm.sum(),d['n_test']);self.assertIn('train.csv',d['label_source'])
    def test_churn_aggregates_only(self):
        d=data("ml/churn-prediction")
        self.assertNotIn("samples",d)
        self.assertNotIn("customer_id",json.dumps(d))

    def test_search_cost(self):
        d=data('kecerdasan-komputasional/pemodelan-pencarian')
        def find(obj,key):
            if isinstance(obj,dict):
                if key in obj:return obj[key]
                for v in obj.values():
                    result=find(v,key)
                    if result is not None:return result
        self.assertEqual(find(d,'ucs')['jarak'],418);self.assertEqual(find(d,'bfs')['jarak'],450)
    def test_early_stopping(self):
        d=data('ml-lanjut/regularization');meta=d['earlyStopMeta']
        self.assertLessEqual(meta['bestEpoch'],meta['stoppedAt'])
        self.assertEqual(len(d['repeats']),3)
if __name__=='__main__':unittest.main()
class Publishing(unittest.TestCase):
    def test_seo_tags_and_sitemap(self):
        pages=sorted(p for p in ROOT.glob('**/index.html') if 'node_modules' not in p.parts)
        sitemap=(ROOT/'sitemap.xml').read_text()
        for p in pages:
            s=p.read_text();rel=p.parent.relative_to(ROOT).as_posix()
            url='https://feliksmakarios.github.io/kupasai/'+('' if rel=='.' else rel+'/')
            self.assertEqual(s.count('<meta name="description"'),1,rel)
            self.assertIn(f'<link rel="canonical" href="{url}">',s)
            self.assertIn(f'<loc>{url}</loc>',sitemap)
            image=re.search(r'<meta property="og:image" content="https://feliksmakarios.github.io/kupasai/([^"]+)"',s)
            self.assertTrue(image and (ROOT/image[1]).exists(),rel)
            self.assertEqual(s.count('<main'),1,rel)
    def test_not_found_page(self):
        s=(ROOT/'404.html').read_text()
        self.assertIn('noindex',s)
        for tag,a in Tags(s).tags:
            url=a.get('src',a.get('href','')).split('#')[0]
            if url.startswith('/kupasai/'):self.assertTrue((ROOT/url.removeprefix('/kupasai/')).exists(),url)
class Maintenance(unittest.TestCase):
    def test_manifest(self):
        m=json.loads((ROOT/'site.webmanifest').read_text())
        for k in ['name','short_name','description','lang','start_url','scope','icons']:self.assertIn(k,m)
        self.assertEqual(m['start_url'],'/kupasai/');self.assertEqual(m['scope'],'/kupasai/')
    def test_shared_scripts_and_paths(self):
        for p in [p for p in ROOT.glob('**/*.html') if 'node_modules' not in p.parts]:
            s=p.read_text();rel=p.relative_to(ROOT)
            self.assertNotRegex(s,r'(src|href)="\.\./',str(rel))
            if 'learning.js' in s:self.assertIn('learning.js" defer',s,str(rel))
            if (p.parent/'viz.js').exists():
                self.assertIn('<noscript>',s,str(rel))
                self.assertNotIn('tab-btn',(p.parent/'viz.js').read_text(),str(rel))
                if 'class="tab-btn' in s:self.assertLess(s.index('assets/js/tabs.js'),s.index('src="viz.js"'),str(rel))
                themed='data-theme' in (p.parent/'viz.js').read_text()
                self.assertEqual(themed,'data-theme-aware' in s,str(rel))

const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
function load(slug,query=''){
 const dom=new JSDOM(fs.readFileSync(path.join(root,slug,'index.html'),'utf8'),{runScripts:'outside-only',url:'https://example.org/kupasai/'+slug+'/'+query,pretendToBeVisual:true}),w=dom.window,errors=[];
 w.matchMedia=()=>({matches:false});w.CSS={escape:s=>s};w.URL.createObjectURL=()=> 'blob:test';w.URL.revokeObjectURL=()=>{};
 w.addEventListener('error',e=>{errors.push(e.message);e.preventDefault();});
 // Defer scripts run after non-deferred scripts, matching browser ordering.
 const scripts=[...w.document.querySelectorAll('script')].sort((a,b)=>Number(a.defer)-Number(b.defer));
 for(const script of scripts){if(script.type&&script.type!=='text/javascript')continue;const src=script.getAttribute('src');if(src&&/theme\.js|learning\.js/.test(src))continue;const code=src?fs.readFileSync(src.startsWith('/kupasai/')?path.join(root,src.slice(9)):path.join(root,slug,src),'utf8'):script.textContent;vm.runInContext(code,dom.getInternalVMContext(),{filename:src||'inline'});}
 return {dom,w,d:w.document,errors};
}
{
 const {dom,d}=load('ml-lanjut/object-detection');const actual=[];
 for(const button of d.querySelectorAll('.iou-preset-btn')){button.click();actual.push(Number(d.querySelector('#iou-verdict').textContent.match(/IoU = ([\d.]+)/)[1]));}
 assert.deepEqual(actual,[.829,.354,0]);d.querySelector('[data-mode="after"]').click();assert(d.querySelector('#nms-steps').textContent.includes('2 kotak dipertahankan'));d.querySelector('#nms-mixed').click();assert(d.querySelector('#nms-steps').textContent.includes('3 kotak dipertahankan'));d.querySelector('#nms-class-aware').click();assert(d.querySelector('#nms-steps').textContent.includes('2 kotak dipertahankan'));dom.window.close();
}
{
 const {dom,d}=load('nlp/ner');assert(d.querySelector('#subword-row').textContent.includes('<s>'));assert(d.querySelector('#subword-row').textContent.includes('</s>'));assert.equal(d.querySelector('#subword-row s'),null);
 d.querySelector('#seq2-container .pred-chip').click();assert(d.activeElement.matches('.pred-chip'));assert(d.querySelector('#seq-metrics').textContent.includes('Token accuracy'));dom.window.close();
}
{
 const {dom,d,w}=load('ml/evaluasi-model/laboratorium');const m=w.KupasMath;
 assert.equal(JSON.stringify(m.confusion([0,1,1],[.1,.5,.2],.5)),JSON.stringify([[1,0],[1,1]]));
 assert.equal(m.rougeL('a b c','a c').lcs,2);assert.equal(m.rougeL('','').f1,0);assert.equal(m.rougeL('a b','a b').f1,1);
 assert.equal(m.bpe('makanan')[0][1].join(''),'makanan');assert.equal(m.unigram('makanan ini').join(''),'▁makanan▁ini');
 const full=m.batchRegression('gd',.05,4),stochastic=m.batchRegression('gd',.05,1);assert.equal(full.at(-1)[4],80);assert.equal(stochastic.at(-1)[4],20);assert(full.at(-1)[3]<full[0][3]);
 assert.equal(JSON.stringify(m.wordpiece('makanan tidak qwerty')),JSON.stringify([['makanan',['makan','##an']],['tidak',['tidak']],['qwerty',['[UNK]']]]));
 const stable=m.optimize('gd',.05,20),unstable=m.optimize('gd',.2,20);assert(stable.at(-1)[3]<stable[0][3]);assert(unstable.at(-1)[3]>unstable[0][3]);
 const first=m.optimize('adam',.1,20,1);assert(Math.abs(first[1][1]-1.9)<1e-7);assert(Math.abs(first[1][2]-1.9)<1e-7);
 assert.equal(w.localStorage.getItem('kupasai-progress:ml/evaluasi-model'),null);
 d.querySelector('input[name="concept-0"][value="false"]').click();d.querySelector('input[name="concept-1"][value="true"]').click();assert.equal(w.localStorage.getItem('kupasai-progress:ml/evaluasi-model'),'complete');dom.window.close();
}
{
 const {dom,d,errors}=load('nlp/evaluasi-generatif','?state='+encodeURIComponent(JSON.stringify([{id:'lab-candidate',value:'does-not-exist'}])));
 assert.equal(d.querySelector('#lab-candidate').value,'faithful');assert.deepEqual(errors,[]);dom.window.close();
}
const catalogue=JSON.parse(fs.readFileSync(path.join(root,'assets/lessons.json'),'utf8'));
for(const {slug:topicSlug}of catalogue)for(const slug of [topicSlug,topicSlug+'/laboratorium']){const {dom,d,w,errors}=load(slug);for(const e of d.querySelectorAll('input[type=range],input[type=number]')){for(const value of [e.min,e.max]){e.value=value;e.dispatchEvent(new w.Event('input',{bubbles:true}));}}for(const select of d.querySelectorAll('select')){for(let i=0;i<select.options.length;i++){select.selectedIndex=i;select.dispatchEvent(new w.Event('change',{bubbles:true}));}}assert.deepEqual(errors,[],slug);assert.equal(d.querySelectorAll('#concept-checks fieldset').length,slug.endsWith('/laboratorium')?2:0,slug);if(!slug.endsWith('/laboratorium'))assert.equal(d.querySelector('#reflection'),null,slug);dom.window.close();}
console.log('39 visualizations and 39 companion labs: control boundaries, IoU DOM presets, NER literal tokens, quizzes, and lab numerical invariants passed.');

// Lab links share state independently of visualization tabs.
{
 const {dom,d}=load('nlp/ner/laboratorium','?tab=panduan');
 assert.equal(d.querySelector('.tab-btn.active').dataset.tab,'panduan');assert.equal(d.querySelector('#tab-uji').hidden,true);
 d.querySelector('#tabbtn-panduan').dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'End',bubbles:true}));
 assert.equal(d.activeElement.id,'tabbtn-uji');assert.equal(d.querySelector('#tab-uji').hidden,false);dom.window.close();
}

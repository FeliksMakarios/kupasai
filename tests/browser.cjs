/* Full-site regression checks, served under the real GitHub Pages base path. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=path.resolve(__dirname,'..');
const AxeBuilder=require('@axe-core/playwright').default;
const reports=path.join(root,'test-results');fs.mkdirSync(reports,{recursive:true});const accessibility=[];
function pages(p){return fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.name.startsWith('.')||e.name==='node_modules'?[]:e.isDirectory()?pages(path.join(p,e.name)):e.name==='index.html'?[path.relative(root,path.join(p,e.name))]:[])}
(async()=>{
 const server=http.createServer((req,res)=>{
  const relative=decodeURIComponent(req.url.split('?')[0]).replace(/^\/kupasai\/?/,'');
  let file=path.resolve(root,relative||'index.html');
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.writeHead(404,{'Content-Type':'text/html'});fs.createReadStream(path.join(root,'404.html')).pipe(res);return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.png')?'image/png':file.endsWith('.json')?'application/json':'application/octet-stream');fs.createReadStream(file).pipe(res);
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}/kupasai/`;
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']}).catch(error=>{server.close();throw error;});
 const context=await browser.newContext();
 const page=await context.newPage();
 // Theme switches must not reload the page: a marker on window survives only without a reload.
 async function toggleTheme(){
  const before=await page.locator('html').getAttribute('data-theme');
  await page.evaluate(()=>{window.__sameDocument=true;});
  await page.locator('#theme-toggle').click();
  await page.waitForFunction(b=>document.documentElement.getAttribute('data-theme')!==b&&!document.documentElement.hasAttribute('data-rerendering'),before);
  assert.equal(await page.evaluate(()=>window.__sameDocument===true),true,`Theme switch reloaded ${current}`);
  return before;
 }const errors=[];let current='',checks=0;
 page.on('pageerror',e=>errors.push(`${current}: ${e.message}`));
 page.on('console',e=>{if(e.type()==='error')errors.push(`${current}: ${e.text()}`);});
 try {
  for(const file of pages(root)){
   current=file;await page.setViewportSize({width:1280,height:900});await page.goto(base+file);
   for(const width of [1280,768,390,320]){
    await page.setViewportSize({width,height:844});
    const tabs=await page.locator('.tab-btn').all();
    for(const tab of tabs){await tab.click({force:true});assert.equal(await tab.getAttribute('aria-selected'),'true',file);checks++;if(!await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)) errors.push(`Overflow: ${file} / ${await tab.getAttribute('data-tab')} / ${width}`);}
    if(!await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)) errors.push(`Horizontal page overflow: ${file} at ${width}`);
   }
   const reflection=page.locator('#reflection');if(await reflection.count()){await page.locator('[data-tab="panduan"]').click();await reflection.fill('Catatan uji tema');}
   const active=(await page.locator('.tab-btn.active').count())?await page.locator('.tab-btn.active').getAttribute('data-tab'):null;
   const before=await toggleTheme();
   assert.notEqual(await page.locator('html').getAttribute('data-theme'),before,file);
   if(active)assert.equal(await page.locator('.tab-btn.active').getAttribute('data-tab'),active,file);
   if(await reflection.count())assert.equal(await reflection.inputValue(),'Catatan uji tema',file);
  }
  current='audit regressions';await page.goto(base+'ml-lanjut/object-detection/');
  const expectedIoU=['0.829','0.354','0.000'];
  for(let i=0;i<3;i++){await page.locator('.iou-preset-btn').nth(i).click();assert((await page.locator('#iou-verdict').innerText()).includes(expectedIoU[i]));}
  await page.goto(base+'nlp/ner/');assert((await page.locator('#subword-row').innerText()).includes('<s>'));
  await page.goto(base+'nlp/transformer/');const block=page.locator('#full-plot rect[role="button"]').nth(2);await block.focus();await page.keyboard.press('Enter');
  const hint=await page.locator('#full-hint').innerText();await toggleTheme();assert.equal(await page.locator('#full-hint').innerText(),hint);
  assert.equal(await page.locator('#concept-checks fieldset').count(),0);
  await page.goto(base+'ml-lanjut/regularization/');await page.locator('[data-tab="dropout"]').click();await page.locator('#dropout-regenerate').click();
  const mask=await page.locator('#dropout-mask-demo circle').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('stroke-dasharray')));await toggleTheme();assert.deepEqual(await page.locator('#dropout-mask-demo circle').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('stroke-dasharray'))),mask);
  await page.goto(base+'ml/evaluasi-model/laboratorium/?tab=uji');await page.locator('input[name="concept-0"][value="false"]').check();await page.locator('input[name="concept-1"][value="true"]').check();assert((await page.locator('#quiz-status').innerText()).includes('selesai'));
  await page.goto(base+'nlp/rag-berbukti/');await page.locator('#lab-evidence').uncheck();assert((await page.locator('#lab-result').innerText()).includes('tidak dapat menjawab'));
  // Empty and object-key strings must be finite, never a perfect empty BLEU score.
  await page.goto(base+'nlp/summarization/');
  await page.locator('[data-tab="metrics"]').click();
  await page.locator('#bleu-candidate').fill('');await page.locator('#bleu-reference').fill('');
  await page.locator('#smooth-toggle-btn').click();
  assert.equal(await page.locator('#bleu-metrics strong').last().innerText(),'0.000');
  await page.locator('#bleu-candidate').fill('constructor constructor');await page.locator('#bleu-reference').fill('constructor constructor');
  assert(!/NaN|Infinity/.test(await page.locator('#bleu-metrics').innerText()));
  await page.goto(base+'nlp/rnn/');await page.locator('#step-next').click();await page.locator('#step-next').click();
  const step=await page.locator('#step-indicator').innerText();
  current='rnn theme';await toggleTheme();
  assert.equal(await page.locator('#step-indicator').innerText(),step);
  // Switching back rebuilds again from the same inputs.
  await toggleTheme();assert.equal(await page.locator('#step-indicator').innerText(),step);
  await page.goto(base+'nlp/question-answering/');await page.locator('#qa-best-span').click();
  assert((await page.locator('#qa-answer-box').innerText()).includes('6000 hours'));
  await page.locator('#qa-no-answer').click();assert((await page.locator('#qa-answer-box').innerText()).includes('Who manufactured'));
  // Learning notes survive a fresh visit, not only a theme switch.
  current='ml/pandas';await page.goto(base+'ml/pandas/laboratorium/?tab=panduan');await page.locator('#reflection').fill('Catatan tersimpan');
  await page.goto(base+'ml/pandas/laboratorium/?tab=panduan');assert.equal(await page.locator('#reflection').inputValue(),'Catatan tersimpan');
  await page.locator('#reflection').fill('');
  // Notes from the previous single-page URLs remain available in the new companion space.
  await page.evaluate(()=>{localStorage.removeItem('kupasai-reflection:/kupasai/nlp/ner/');localStorage.setItem('kupasai-reflection:/kupasai/nlp/ner/index.html','Catatan sebelum pemisahan');});
  await page.goto(base+'nlp/ner/laboratorium/?tab=panduan');assert.equal(await page.locator('#reflection').inputValue(),'Catatan sebelum pemisahan');
  await page.setViewportSize({width:320,height:844});
  assert.equal(await page.locator('#reflection').evaluate(el=>getComputedStyle(el).resize),'vertical');
  await page.locator('#reflection').evaluate(el=>{el.style.width='2000px';el.style.height='2000px';});
  assert(await page.locator('#reflection').evaluate(el=>{const box=el.getBoundingClientRect(),panel=el.closest('.learning-aid').getBoundingClientRect();return box.right<=panel.right&&box.bottom<=panel.bottom&&box.height<=384;}));
  await page.setViewportSize({width:1280,height:900});
  await page.goto(base+'trek-belajar/');assert.equal(await page.locator('#track-plan').isVisible(),false);
  await page.screenshot({path:path.join(reports,'trek-belajar-pilih-profil.png'),fullPage:true});
  for(const role of ['mahasiswa','pemula','praktisi']){
   await page.locator('input[value="'+role+'"]').check();assert(await page.locator('#track-plan').isVisible());
   assert((await page.locator('#track-topics .topic-entry').count())>0);
   assert.equal(await page.locator('#course-picker').isVisible(),role==='mahasiswa');
   await toggleTheme();assert(await page.locator('input[value="'+role+'"]').isChecked());
  }
  await page.locator('input[value="mahasiswa"]').check();await page.locator('#track-course').selectOption('nlp');
  assert.equal(await page.locator('#track-topics .topic-entry').count(),13);
  await page.reload();assert.equal(await page.locator('#track-course').inputValue(),'nlp');
  await page.locator('#topic-search').fill('tidak-ada-topik-ini');assert.equal(await page.locator('#topic-results .topic-entry').count(),0);
  await page.locator('#topic-search').fill('attention');assert((await page.locator('#topic-results .topic-entry').count())>0);
  await page.goto(base+'nlp/');await page.getByRole('link',{name:'Laboratorium Pendamping',exact:true}).first().click();assert(page.url().includes('/laboratorium/'));
  await page.getByRole('link',{name:'Kembali ke Visualisasi'}).click();assert(!page.url().includes('/laboratorium/'));assert.equal(await page.locator('#reflection').count(),0);
  // Phone-width diagrams keep their text readable and scroll inside their own box.
  await page.setViewportSize({width:390,height:844});current='pemodelan-pencarian mobile';
  await page.goto(base+'kecerdasan-komputasional/pemodelan-pencarian/');await page.locator('[data-tab="peta"]').click();
  const smallest=await page.evaluate(()=>{const svg=document.querySelector('.tab-content.active svg');const k=svg.getBoundingClientRect().width/svg.viewBox.baseVal.width;return Math.min(...[...svg.querySelectorAll('text')].filter(t=>t.textContent.trim()).map(t=>parseFloat(getComputedStyle(t).fontSize)*k));});
  assert(smallest>=7.5,`Diagram text too small on phones: ${smallest}px`);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
  // The navbar stays on one row on phones; the course code moves into the page header.
  current='navbar mobile';await page.goto(base+'kecerdasan-komputasional/pemodelan-pencarian/');
  assert((await page.evaluate(()=>document.querySelector('.navbar').getBoundingClientRect().height))<=64);
  assert(await page.locator('.page-meta-mobile').isVisible());
  for(const topic of ['','nlp/','trek-belajar/?profil=mahasiswa&kuliah=nlp','nlp/transformer/','nlp/transformer/laboratorium/','nlp/ner/laboratorium/?tab=panduan','ml/evaluasi-model/','ml-lanjut/object-detection/']){
   current='accessibility '+topic;await page.goto(base+topic);
   const name=topic.replace(/[^a-z0-9-]/gi,'-')||'home';
   for(const theme of ['light','dark']){
    if(await page.locator('html').getAttribute('data-theme')!==theme)await toggleTheme();
    await page.setViewportSize({width:1280,height:900});
    await page.screenshot({path:path.join(reports,name+'-'+theme+'-desktop.png'),fullPage:true});
    assert(await page.locator('img').evaluateAll(images=>images.every(img=>img.complete&&img.naturalWidth>0)),`Broken image: ${topic}`);
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    accessibility.push({topic,theme,violations:result.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
    await page.setViewportSize({width:320,height:844});await page.screenshot({path:path.join(reports,name+'-'+theme+'-mobile.png'),fullPage:true});
   }
  }
  fs.writeFileSync(path.join(reports,'accessibility.json'),JSON.stringify(accessibility,null,2));
  for(const report of accessibility)assert.deepEqual(report.violations,[],`WCAG findings: ${report.topic}`);
  current='offline persistence';await page.goto(base+'ml/evaluasi-model/laboratorium/');
  await page.getByRole('button',{name:'Simpan halaman untuk offline'}).click();
  await page.waitForFunction(()=>document.getElementById('learning-status').textContent.includes('siap dibuka offline'));
  await context.setOffline(true);await page.reload();assert(await page.locator('#lab-result').isVisible());
  await page.locator('#lab-threshold').fill('0.9');assert((await page.locator('#lab-result').innerText()).includes('0.9'));
  await page.locator('#theme-toggle').click();assert(await page.locator('#lab-result').isVisible());await context.setOffline(false);
  current='expected-404';const missing=await page.goto(base+'halaman-yang-tidak-ada/');assert.equal(missing.status(),404);
  assert((await page.locator('h1').innerText()).includes('tidak ditemukan'));
  errors.splice(0,errors.length,...errors.filter(e=>!e.startsWith('expected-404:')));
  current='404';await page.goto(base+'404.html');assert((await page.locator('h1').innerText()).includes('tidak ditemukan'));
  if(process.env.REVIEW_SCREENSHOT){await page.goto(base+'nlp/transformer/');await page.setViewportSize({width:1280,height:1000});await page.screenshot({path:process.env.REVIEW_SCREENSHOT});}
  console.log(`Visited ${pages(root).length} pages, ${checks} tab transitions, desktop/mobile and theme restoration.`);
  if(errors.length)console.error(errors.join('\n'));assert.deepEqual(errors,[]);
 } catch(error) {console.error('Failed page:',current);if(errors.length)console.error(errors.join('\n'));await page.screenshot({path:path.join(reports,'failure.png'),fullPage:true}).catch(()=>{});throw error;} finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

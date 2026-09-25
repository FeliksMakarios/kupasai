/* Full-site regression checks, served under the real GitHub Pages base path. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=path.resolve(__dirname,'..');
function pages(p){return fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.name.startsWith('.')||e.name==='node_modules'?[]:e.isDirectory()?pages(path.join(p,e.name)):e.name==='index.html'?[path.relative(root,path.join(p,e.name))]:[])}
(async()=>{
 const server=http.createServer((req,res)=>{
  const relative=decodeURIComponent(req.url.split('?')[0]).replace(/^\/kupasai\/?/,'');
  let file=path.resolve(root,relative||'index.html');
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.writeHead(404,{'Content-Type':'text/html'});fs.createReadStream(path.join(root,'404.html')).pipe(res);return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');fs.createReadStream(file).pipe(res);
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}/kupasai/`;
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage();const errors=[];let current='',checks=0;
 page.on('pageerror',e=>errors.push(`${current}: ${e.message}`));
 page.on('console',e=>{if(e.type()==='error')errors.push(`${current}: ${e.text()}`);});
 try {
  for(const file of pages(root)){
   current=file;await page.setViewportSize({width:1280,height:900});await page.goto(base+file);
   for(const width of [1280,390]){
    await page.setViewportSize({width,height:844});
    const tabs=await page.locator('.tab-btn').all();
    for(const tab of tabs){await tab.click({force:true});assert.equal(await tab.getAttribute('aria-selected'),'true',file);checks++;assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),`Overflow: ${file} / ${await tab.getAttribute('data-tab')} / ${width}`);}
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),`Horizontal page overflow: ${file} at ${width}`);
   }
   const reflection=page.locator('#reflection');if(await reflection.count())await reflection.fill('Catatan uji tema');
   const active=(await page.locator('.tab-btn.active').count())?await page.locator('.tab-btn.active').getAttribute('data-tab'):null;
   const before=await page.locator('html').getAttribute('data-theme');
   await Promise.all([page.waitForEvent('load'),page.locator('#theme-toggle').click()]);
   assert.notEqual(await page.locator('html').getAttribute('data-theme'),before,file);
   if(active)assert.equal(await page.locator('.tab-btn.active').getAttribute('data-tab'),active,file);
   if(await reflection.count())assert.equal(await reflection.inputValue(),'Catatan uji tema',file);
  }
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
  await Promise.all([page.waitForEvent('load'),page.locator('#theme-toggle').click()]);
  assert.equal(await page.locator('#step-indicator').innerText(),step);
  await page.goto(base+'nlp/question-answering/');await page.locator('#qa-best-span').click();
  assert((await page.locator('#qa-answer-box').innerText()).includes('6000 hours'));
  await page.locator('#qa-no-answer').click();assert((await page.locator('#qa-answer-box').innerText()).includes('Who manufactured'));
  // Learning notes survive a fresh visit, not only a theme switch.
  current='ml/pandas';await page.goto(base+'ml/pandas/');await page.locator('#reflection').fill('Catatan tersimpan');
  await page.goto(base+'ml/pandas/');assert.equal(await page.locator('#reflection').inputValue(),'Catatan tersimpan');
  await page.locator('#reflection').fill('');
  // Phone-width diagrams keep their text readable and scroll inside their own box.
  await page.setViewportSize({width:390,height:844});current='pemodelan-pencarian mobile';
  await page.goto(base+'kecerdasan-komputasional/pemodelan-pencarian/');await page.locator('[data-tab="peta"]').click();
  const smallest=await page.evaluate(()=>{const svg=document.querySelector('.tab-content.active svg');const k=svg.getBoundingClientRect().width/svg.viewBox.baseVal.width;return Math.min(...[...svg.querySelectorAll('text')].filter(t=>t.textContent.trim()).map(t=>parseFloat(getComputedStyle(t).fontSize)*k));});
  assert(smallest>=7.5,`Diagram text too small on phones: ${smallest}px`);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
  current='expected-404';const missing=await page.goto(base+'halaman-yang-tidak-ada/');assert.equal(missing.status(),404);
  assert((await page.locator('h1').innerText()).includes('tidak ditemukan'));
  errors.splice(0,errors.length,...errors.filter(e=>!e.startsWith('expected-404:')));
  current='404';await page.goto(base+'404.html');assert((await page.locator('h1').innerText()).includes('tidak ditemukan'));
  if(process.env.REVIEW_SCREENSHOT){await page.goto(base+'nlp/transformer/');await page.setViewportSize({width:1280,height:1000});await page.screenshot({path:process.env.REVIEW_SCREENSHOT});}
  console.log(`Visited ${pages(root).length} pages, ${checks} tab transitions, desktop/mobile and theme restoration.`);
  if(errors.length)console.error(errors.join('\n'));assert.deepEqual(errors,[]);
 } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

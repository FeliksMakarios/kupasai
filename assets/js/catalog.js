(function(){
'use strict';
const topics=window.KupasCatalog||[],prefix='kupasai-progress:',notePrefix='kupasai-reflection:';
const get=k=>{try{return localStorage.getItem(k);}catch(_){return null;}},put=(k,v)=>{try{localStorage.setItem(k,v);return true;}catch(_){return false;}};
const storageAvailable=(()=>{try{localStorage.getItem(prefix);return true;}catch(_){return false;}})();
const isComplete=slug=>get(prefix+slug)==='complete';
const element=(name,className,text)=>{const e=document.createElement(name);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;};
function completeMark(){return element('p','topic-complete','✓ Uji pemahaman selesai');}
// Same markup as the static course lists: lead sentence, the rest behind "Selengkapnya".
function topicCard(t,index){
 const li=element('li','topic-entry'),article=document.createElement('article'),actions=element('div','topic-actions');li.dataset.slug=t.slug;
 if(index!==undefined){const number=element('span','topic-number',String(index+1).padStart(2,'0'));number.setAttribute('aria-hidden','true');li.append(number);}
 for(const [label,suffix]of [['Visualisasi',''],['Laboratorium Pendamping','laboratorium/']]){const a=element('a','topic-button'+(suffix?' secondary':''),label);a.href='/kupasai/'+t.slug+'/'+suffix;actions.append(a);}
 const cut=t.description.indexOf('. '),lead=cut<0?t.description:t.description.slice(0,cut+1),rest=cut<0?'':t.description.slice(cut+2);
 article.append(element('h2','',t.title),element('p','topic-meta',(t.week||'Pengayaan · di luar minggu RPS')+' · Estimasi '+t.minutes+' menit'),element('p','topic-description',lead));
 if(rest){const more=element('details','topic-more'),summary=element('summary','','Selengkapnya');summary.append(element('span','visually-hidden',' tentang '+t.title));more.append(summary,element('p','topic-description',rest));article.append(more);}
 article.append(actions);if(isComplete(t.slug))article.append(completeMark());
 li.append(article);return li;
}
window.KupasTopicCard=topicCard;
// Progress summaries: "3 dari 13 topik selesai" with a bar. Slots stay hidden without storage.
function showProgress(slot,list,compact){
 const done=list.filter(t=>isComplete(t.slug)).length;
 if(!storageAvailable){slot.hidden=true;return;}
 if(compact&&!done){slot.hidden=true;return;}
 const bar=document.createElement('progress');bar.max=list.length;bar.value=done;bar.setAttribute('aria-label','Progres belajar');
 slot.replaceChildren(element('span','',done?done+' dari '+list.length+' topik selesai':'Belum ada topik yang selesai. Topik ditandai selesai setelah Uji Pemahaman dijawab benar semua.'),bar);slot.hidden=false;
}
window.KupasProgress=showProgress;
document.querySelectorAll('[data-progress]').forEach(slot=>showProgress(slot,topics.filter(t=>t.slug.startsWith(slot.dataset.progress+'/')),slot.classList.contains('compact')));
document.querySelectorAll('.topic-list-wrap .topic-entry[data-slug]').forEach(entry=>{if(isComplete(entry.dataset.slug))entry.querySelector('article').append(completeMark());});
// Home: pick up where the learner left off.
const resume=document.getElementById('home-continue');
if(resume){
 let last=null;try{last=JSON.parse(get('kupasai-last'));}catch(_){}
 const t=last&&topics.find(x=>x.slug===last.slug),done=topics.filter(x=>isComplete(x.slug)).length;
 if(t||done){
  resume.append(element('h2','','Lanjutkan belajar'));
  if(t){const link=element('a','topic-button',t.title+(last.lab?' · Laboratorium Pendamping':' · Visualisasi')+' →');link.href='/kupasai/'+t.slug+'/'+(last.lab?'laboratorium/':'');resume.append(element('p','','Terakhir Anda membuka:'),link);}
  const total=element('p','progress-summary');showProgress(total,topics);resume.append(total);resume.hidden=false;
 }
}
const search=document.getElementById('topic-search');
if(search){
 const list=document.getElementById('topic-results'),searchStatus=document.getElementById('search-status');
 function show(){
  const q=search.value.trim().toLocaleLowerCase('id-ID');list.replaceChildren();
  if(!q){searchStatus.textContent='Ketik untuk mencari di '+topics.length+' topik.';return;}
  const found=topics.filter(t=>(t.title+' '+t.slug+' '+t.prerequisite+' '+t.description).toLocaleLowerCase('id-ID').includes(q));
  found.forEach(t=>list.append(topicCard(t)));searchStatus.textContent=found.length+' topik ditemukan.';
 }
 search.addEventListener('input',show);
 // The home page search form lands here with ?cari=...
 const asked=new URLSearchParams(location.search).get('cari');
 if(asked){search.value=asked.slice(0,100);requestAnimationFrame(()=>search.scrollIntoView({block:'center'}));}
 show();
}
const panel=document.querySelector('main[data-topic]');if(!panel)return;
const topic=topics.find(t=>t.slug===panel.dataset.topic);if(!topic)return;
put('kupasai-last',JSON.stringify({slug:topic.slug,lab:panel.dataset.space==='laboratorium'}));
const checks=document.getElementById('concept-checks'),status=document.getElementById('quiz-status'),answers=new Map();
// Two true/false statements, then two multiple-choice questions; all must be right to complete the topic.
const quiz=checks?[...topic.questions.map(([question,correct,explanation])=>({question,explanation,options:[['Benar',correct===true],['Salah',correct===false]],values:['true','false']})),...(topic.choices||[]).map(([question,options,correct,explanation])=>({question,explanation,options:options.map((text,index)=>[text,index===correct]),values:options.map((_,index)=>String(index))}))]:[];
quiz.forEach((item,i)=>{
 const field=document.createElement('fieldset'),feedback=element('p','quiz-feedback');feedback.setAttribute('aria-live','polite');
 field.appendChild(element('legend','',(i+1)+'. '+item.question));
 item.options.forEach(([text,ok],index)=>{
  const label=document.createElement('label'),radio=document.createElement('input');radio.type='radio';radio.name='concept-'+i;radio.value=item.values[index];
  radio.addEventListener('change',()=>{
   answers.set(i,ok);feedback.textContent=(ok?'Benar. ':'Belum tepat. ')+item.explanation;
   const right=[...answers.values()].filter(Boolean).length;
   if(right===quiz.length)status.textContent=put(prefix+topic.slug,'complete')?'Latihan selesai. Progres tersimpan di peramban ini.':'Latihan selesai. Penyimpanan peramban tidak tersedia.';
   else status.textContent='Latihan berjalan: '+right+'/'+quiz.length+' benar.';
  });
  label.append(radio,document.createTextNode(text));field.appendChild(label);
 });
 if(item.options.length>2)field.classList.add('choice');
 field.appendChild(feedback);checks.appendChild(field);
});
if(status&&get(prefix+topic.slug)==='complete')status.textContent='Anda pernah menyelesaikan latihan ini. Silakan ulangi untuk menguji pemahaman.';
const msg=document.getElementById('backup-status')||document.getElementById('learning-status');
const noteKey=notePrefix+'/kupasai/'+topic.slug+'/';
document.getElementById('export-notes')?.addEventListener('click',()=>{const entries={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith(notePrefix)||k.startsWith(prefix))entries[k]=localStorage.getItem(k);}}catch(_){msg.textContent='Penyimpanan tidak tersedia.';return;}const blob=new Blob([JSON.stringify({format:'kupasai-learning',version:1,entries},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='kupasai-catatan.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);msg.textContent='Cadangan siap diunduh; simpan sebelum menghapus data peramban.';});
document.getElementById('import-notes')?.addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1000000)throw Error('File terlalu besar (maksimum 1 MB).');const data=JSON.parse(await file.text());if(data.format!=='kupasai-learning'||data.version!==1||!data.entries||typeof data.entries!=='object')throw Error('Format cadangan tidak dikenali.');const entries=Object.entries(data.entries),allowed=new Set(topics.flatMap(t=>[prefix+t.slug,notePrefix+'/kupasai/'+t.slug+'/',notePrefix+'/kupasai/'+t.slug+'/index.html']));for(const [k,v]of entries)if(!allowed.has(k)||typeof v!=='string'||v.length>50000||(k.startsWith(prefix)&&v!=='complete'))throw Error('Entri cadangan tidak valid.');let count=0;for(const[k,v]of entries){const old=get(k);if(old&&old!==v)continue;if(!put(k,v))throw Error('Penyimpanan penuh atau tidak tersedia.');count++;}const reflection=document.getElementById('reflection');if(reflection)reflection.value=get(noteKey)||get(noteKey+'index.html')||reflection.value;msg.textContent=count+' entri dipulihkan. Catatan lokal yang berbeda dipertahankan; muat ulang untuk memperbarui indikator progres.';}catch(error){msg.textContent=error.message;}finally{e.target.value='';}});
// Share only experiment controls, never reflection notes or quiz answers.
const controlList=()=>[...document.querySelectorAll('main input[id],main select[id]')].filter(e=>!e.closest('.topic-tools,.note-backup')&&e.type!=='file'&&!['password','hidden'].includes(e.type));
function readState(){return controlList().map(e=>({id:e.id,value:e.value,checked:e.checked}));}
const defaults=readState();
function apply(entries){const allowed=new Map(controlList().map(e=>[e.id,e]));for(const v of entries){const e=allowed.get(v.id);if(!e||typeof v.value!=='string'||v.value.length>500)continue;if(e.tagName==='SELECT'&&![...e.options].some(o=>o.value===v.value))continue;if(['number','range'].includes(e.type)&&(!Number.isFinite(Number(v.value))||(e.min!==''&&Number(v.value)<Number(e.min))||(e.max!==''&&Number(v.value)>Number(e.max))))continue;e.value=e.maxLength>0?v.value.slice(0,e.maxLength):v.value;if(e.type==='checkbox')e.checked=v.checked===true;e.dispatchEvent(new Event(e.tagName==='SELECT'||e.type==='checkbox'?'change':'input',{bubbles:true}));}}
try{const raw=new URLSearchParams(location.search).get('state');if(raw&&raw.length<12000){const data=JSON.parse(raw);if(Array.isArray(data)&&data.length<100)apply(data);}}catch(_){document.getElementById('learning-status').textContent='Parameter tautan tidak valid; kontrol awal dipakai.';}
document.getElementById('share-controls').addEventListener('click',async()=>{const url=new URL(location.href);url.searchParams.set('state',JSON.stringify(readState()));try{await navigator.clipboard.writeText(url.href);document.getElementById('learning-status').textContent='Tautan tab dan kontrol tersalin. Catatan pribadi tidak disertakan.';}catch(_){const a=document.createElement('a');a.href=url.href;a.textContent='Buka tautan eksperimen, lalu salin alamatnya';document.getElementById('learning-status').replaceChildren(a);}});
document.getElementById('reset-controls').addEventListener('click',()=>{apply(defaults);const url=new URL(location.href);url.searchParams.delete('state');history.replaceState(null,'',url);document.getElementById('learning-status').textContent='Kontrol dikembalikan ke nilai awal. Catatan dan progres tetap tersimpan.';});
})();

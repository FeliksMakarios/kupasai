/* Explicit offline copies: the learner chooses what to keep, nothing is cached silently. */
(function(){
'use strict';
if(!('serviceWorker' in navigator)||!window.isSecureContext)return;
const panel=document.querySelector('main[data-topic]');if(!panel)return;
const actions=panel.querySelector('.companion-utilities .learning-actions,.lesson-next .learning-actions'),status=document.getElementById('learning-status');
const button=document.createElement('button');button.type='button';button.textContent='Simpan halaman untuk offline';actions.appendChild(button);
const sameOrigin=url=>new URL(url).origin===location.origin;
// Scripts, styles, icons and images a page needs, resolved against that page's own address.
function assets(doc,pageUrl){
 return [...doc.querySelectorAll('script[src],link[rel="stylesheet"],link[rel~="icon"],img[src]')].map(e=>new URL(e.getAttribute('src')||e.getAttribute('href'),pageUrl).href).filter(sameOrigin);
}
button.addEventListener('click',async()=>{
 button.disabled=true;status.textContent='Menyimpan halaman dan visualisasi…';
 try{
  await navigator.serviceWorker.register('/kupasai/sw.js',{scope:'/kupasai/'});
  const worker=(await navigator.serviceWorker.ready).active;if(!worker)throw Error('Penyimpanan offline belum siap.');
  const here=new URL(location.pathname,location.origin).href,topic=panel.dataset.topic,base=location.origin+'/kupasai/';
  // This page, its counterpart (visualization or lab), the course list and the home page, so navigation keeps working.
  const related=[base+topic+'/'+(panel.dataset.space==='laboratorium'?'':'laboratorium/'),base+topic.split('/')[0]+'/',base,base+'trek-belajar/'];
  const urls=new Set([here,...assets(document,here)]);let extra=0;
  for(const page of related){
   try{const response=await fetch(page);if(!response.ok)continue;
    const doc=new DOMParser().parseFromString(await response.text(),'text/html');
    urls.add(page);assets(doc,page).forEach(url=>urls.add(url));extra++;
   }catch(_){/* a related page that cannot be fetched is skipped; the current page is still saved */}
  }
  const channel=new MessageChannel();
  const result=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('Unduhan belum selesai. Periksa koneksi dan coba lagi.')),45000);
   channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data);};
   worker.postMessage({type:'save-page',urls:[...urls]},[channel.port2]);
  });
  if(!result.ok)throw Error(result.message);
  status.textContent='Halaman ini siap dibuka offline di alamat yang sama'+(extra===related.length?', bersama halaman pasangannya, daftar topik mata kuliah, Trek Belajar, dan beranda':'')+'. Simpan ulang setelah ada pembaruan. Topik lain perlu disimpan tersendiri.';
 }catch(error){status.textContent=error.message;}finally{button.disabled=false;}
});
})();

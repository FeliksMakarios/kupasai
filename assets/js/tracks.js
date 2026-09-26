/* Audience paths use catalogue durations and retain the published RPS ordering. */
(function(){
'use strict';
function init(){
 const picker=document.querySelector('.audience-picker');if(!picker)return;
 const topics=window.KupasCatalog,course=document.getElementById('track-course'),plan=document.getElementById('track-plan'),list=document.getElementById('track-topics');
 const paths={
  pemula:{title:'Trek Pemula',description:'Mulai dari mengolah data, memahami model sederhana, lalu menilai hasilnya sebelum masuk ke jaringan saraf.',slugs:['ml/pandas','ml/linear-regression','ml/logistic-regression','ml/evaluasi-model','ml/decision-tree','ml/random-forest','ml/clustering','ml-lanjut/forward-propagation','ml-lanjut/gradient-descent','ml-lanjut/backprop-visualizer']},
  praktisi:{title:'Trek Praktisi',description:'Mulai dari evaluasi dan risiko kebocoran data, lanjutkan ke kasus terapan serta NLP berbasis bukti. Diasumsikan sudah memahami dasar Python dan pemelajaran mesin.',slugs:['ml/evaluasi-model','ml/churn-prediction','ml-lanjut/regularization','ml-lanjut/optimizer','nlp/tokenisasi-indonesia','nlp/word-embeddings','nlp/self-attention','nlp/transformer','nlp/rag-berbukti','nlp/evaluasi-generatif']}
 };
 function show(write){
  const role=picker.querySelector('input:checked')?.value;if(!role)return;
  document.getElementById('course-picker').hidden=role!=='mahasiswa';
  const path=paths[role];const selected=role==='mahasiswa'?topics.filter(t=>t.slug.startsWith(course.value+'/')):path.slugs.map(slug=>topics.find(t=>t.slug===slug));
  document.getElementById('track-title').textContent=role==='mahasiswa'?'Trek Mahasiswa · '+course.selectedOptions[0].textContent:path.title;
  document.getElementById('track-description').textContent=role==='mahasiswa'?'Ikuti urutan topik mata kuliah. Materi pengayaan tersedia setelah topik RPS. Nomor minggu mengikuti daftar mata kuliah, bukan jadwal belajar pribadi.':path.description;
  const minutes=selected.reduce((n,t)=>n+t.minutes,0),hours=Math.floor(minutes/60),remaining=minutes%60;
  document.getElementById('track-summary').textContent=selected.length+' topik · Estimasi total '+(hours?hours+' jam ':'')+(remaining?remaining+' menit':'')+'. Durasi mencakup visualisasi dan laboratorium; sesuaikan dengan kecepatan belajar Anda.';
  list.replaceChildren(...selected.map((t,i)=>window.KupasTopicCard(t,i)));plan.hidden=false;
  if(write){const url=new URL(location.href);url.searchParams.set('profil',role);if(role==='mahasiswa')url.searchParams.set('kuliah',course.value);else url.searchParams.delete('kuliah');history.replaceState(null,'',url);}
 }
 const params=new URLSearchParams(location.search),profile=params.get('profil');
 if(['mahasiswa','pemula','praktisi'].includes(profile))picker.querySelector('input[value="'+profile+'"]').checked=true;
 if([...course.options].some(o=>o.value===params.get('kuliah')))course.value=params.get('kuliah');
 picker.addEventListener('change',()=>show(true));course.addEventListener('change',()=>show(true));show(false);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

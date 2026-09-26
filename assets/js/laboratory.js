/* Small, deterministic teaching algorithms. No model/API inference is implied. */
(function () {
  'use strict';
  const tokens = text => text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  function confusion(labels, probabilities, threshold) {
    const m = [[0, 0], [0, 0]];
    labels.forEach((y, i) => m[y][Number(probabilities[i] >= threshold)]++);
    return m;
  }
  function rougeL(reference, candidate) {
    const a=tokens(reference),b=tokens(candidate),row=Array(b.length+1).fill(0);
    for(const x of a){let prev=0;for(let j=1;j<=b.length;j++){const old=row[j];row[j]=x===b[j-1]?prev+1:Math.max(row[j],row[j-1]);prev=old;}}
    const lcs=row[b.length],p=b.length?lcs/b.length:0,r=a.length?lcs/a.length:0;
    return {lcs,precision:p,recall:r,f1:p+r?2*p*r/(p+r):0};
  }
  function optimize(method, alpha, k, count=40) {
    let w=[2,2],v=[0,0],m=[0,0];const rows=[[0,...w,(w[0]**2+k*w[1]**2)/2]];
    for(let t=1;t<=count;t++){
      const g=[w[0],k*w[1]];
      for(let j=0;j<2;j++){
        if(method==='adam'){m[j]=.9*m[j]+.1*g[j];v[j]=.999*v[j]+.001*g[j]**2;w[j]-=alpha*(m[j]/(1-.9**t))/(Math.sqrt(v[j]/(1-.999**t))+1e-8);}
        else if(method==='momentum'){v[j]=.9*v[j]+g[j];w[j]-=alpha*v[j];}
        else w[j]-=alpha*g[j];
      }
      const loss=(w[0]**2+k*w[1]**2)/2;rows.push([t,...w,loss]);
      if(!Number.isFinite(loss)||loss>1e20)break;
    }return rows;
  }
  const vocab=new Set(['makan','##an','makan','##kan','me','##makan','enak','tidak','ini','saya','suka','baik','bagus','nggak','di','##beli','beli','##nya','buku']);
  function wordpiece(text){return tokens(text).map(word=>{let start=0,pieces=[];while(start<word.length){let end=word.length,found=null;while(end>start){const p=(start?'##':'')+word.slice(start,end);if(vocab.has(p)){found=p;break;}end--;}if(!found)return [word,['[UNK]']];pieces.push(found);start=end;}return [word,pieces];});}
  const merges=[['m','a'],['ma','k'],['mak','a'],['maka','n'],['a','n'],['t','i'],['ti','d'],['tid','a'],['tida','k'],['e','n'],['en','a'],['ena','k']];
  function bpe(text){return tokens(text).map(word=>{let parts=Array.from(word);for(const[a,b]of merges){const next=[];for(let i=0;i<parts.length;i++){if(parts[i]===a&&parts[i+1]===b){next.push(a+b);i++;}else next.push(parts[i]);}parts=next;}return[word,parts];});}
  function unigram(text){const vocabulary={'▁':8,'makan':9,'an':3,'makanan':1,'tidak':7,'enak':7,'ini':5,'saya':4,'bagus':4,'buku':3,'nya':2},total=Object.values(vocabulary).reduce((a,b)=>a+b,0),input='▁'+text.trim().toLowerCase().replace(/\s+/g,'▁'),best=Array(input.length+1).fill(-Infinity),paths=Array(input.length+1);best[0]=0;paths[0]=[];for(let i=0;i<input.length;i++){if(!paths[i])continue;const candidates=Object.keys(vocabulary).filter(w=>input.startsWith(w,i));candidates.push(input[i]);for(const piece of new Set(candidates)){const score=best[i]+(vocabulary[piece]?Math.log(vocabulary[piece]/total):-12),j=i+piece.length;if(score>best[j]){best[j]=score;paths[j]=paths[i].concat(piece);}}}return paths[input.length]||[];}
  function batchRegression(method,alpha,batch){let w=0,m=0,v=0,velocity=0;const x=[-2,-1,1,2],target=[-3.5,-2.5,2.5,3.5],rows=[];for(let t=1;t<=20;t++){let g=0;for(let j=0;j<batch;j++){const i=((t-1)*batch+j)%4;g+=(w*x[i]-target[i])*x[i]/batch;}if(method==='adam'){m=.9*m+.1*g;v=.999*v+.001*g*g;w-=alpha*(m/(1-.9**t))/(Math.sqrt(v/(1-.999**t))+1e-8);}else if(method==='momentum'){velocity=.9*velocity+g;w-=alpha*velocity;}else w-=alpha*g;const loss=x.reduce((s,value,i)=>s+.5*(w*value-target[i])**2,0)/x.length;rows.push([t,w,g,loss,t*batch]);}return rows;}
  // Exposed pure functions allow independent numerical tests, not DOM snapshots.
  window.KupasMath={confusion,rougeL,optimize,wordpiece,bpe,unigram,batchRegression};
  const root=document.querySelector('[data-lab]');if(!root)return;
  const result=document.getElementById('lab-result'),kind=root.dataset.lab;
  function paragraph(text){const p=document.createElement('p');p.textContent=text;result.appendChild(p);}
  function table(headers,rows){const wrap=document.createElement('div');wrap.className='lab-table';const t=document.createElement('table');const head=t.createTHead().insertRow();headers.forEach(x=>{const th=document.createElement('th');th.scope='col';th.textContent=x;head.appendChild(th);});const body=t.createTBody();rows.forEach(row=>{const tr=body.insertRow();row.forEach(x=>tr.insertCell().textContent=x);});wrap.appendChild(t);result.appendChild(wrap);}
  const el=id=>document.getElementById('lab-'+id);
  const fmt=x=>Number.isFinite(x)?(Math.abs(x)>1e5?x.toExponential(3):x.toFixed(4)):'divergen';
  function render(){result.replaceChildren();
    if(kind==='evaluation'){
      const y=[0,0,0,0,0,0,0,0,1,1],p=[.05,.15,.2,.25,.3,.4,.55,.7,.45,.8],threshold=+el('threshold').value;
      const m=confusion(y,p,threshold),[[tn,fp],[fn,tp]]=m;
      paragraph('Data sintetis: 8 negatif, 2 positif. Ambang '+threshold+'. Baseline selalu negatif: accuracy 0.8000, recall 0.');
      table(['Aktual / Prediksi','Negatif','Positif'],[['Negatif',tn,fp],['Positif',fn,tp]]);
      paragraph('Accuracy '+fmt((tp+tn)/y.length)+' · precision '+fmt(tp/(tp+fp)||0)+' · recall '+fmt(tp/(tp+fn)||0)+'. Penyebut nol ditampilkan sebagai 0 untuk latihan ini.');
      table(['Kasus','Aktual','Probabilitas','Prediksi'],y.map((v,i)=>[i+1,v,p[i],Number(p[i]>=threshold)]));
      const train=[1,2,3],test=[100,200],values=el('leak').value==='all'?train.concat(test):train,mean=values.reduce((a,b)=>a+b,0)/values.length;
      paragraph('Latih [1,2,3], uji [100,200]. Rata-rata imputasi = '+fmt(mean)+'. '+(values.length===3?'Data uji tidak menentukan parameter imputasi.':'Bocor: nilai uji ikut mengubah parameter sebelum evaluasi.'));
      paragraph('Brier score = '+fmt(y.reduce((s,v,i)=>s+(p[i]-v)**2,0)/y.length)+'. Ini ukuran galat probabilitas; 10 contoh belum cukup untuk menyimpulkan kalibrasi.');
    }else if(kind==='tokenization'){
      let text=el('text').value;if(el('negation').checked)text=text.replace(/\btidak\b/gi,'');
      const algorithm=el('tokenizer').value;
      if(algorithm==='unigram'){paragraph('Segmentasi unigram: '+unigram(text).join(' | '));paragraph('Dynamic programming memaksimalkan jumlah log probabilitas kosakata mini; karakter tak dikenal diberi penalti fallback. Tanda ▁ mewakili batas spasi. Ini bukan checkpoint SentencePiece.');}
      else table(['Kata','Subkata'],(algorithm==='bpe'?bpe(text):wordpiece(text)).map(([w,parts])=>[w,parts.join(' | ')]));
      if(algorithm==='bpe')paragraph('Urutan merge buatan: '+merges.map(pair=>pair.join('+')).join(', ')+'. Encoding mengikuti urutan merge ini; tidak menghitung ulang pasangan terpopuler dari satu kalimat.');
      if(algorithm==='wordpiece')paragraph('Kosakata WordPiece demo: '+[...vocab].join(', ')+'. Kata yang tidak dapat disegmentasi seluruhnya menjadi [UNK].');
      paragraph(el('negation').checked?'Kata tidak dihapus: “tidak enak” menjadi “enak”. Tokenisasi tidak membenarkan perubahan makna ini.':'Negasi dipertahankan. Jumlah token bukan jumlah kata.');
    }else if(kind==='optimizer'){
      const k=+el('condition').value,alpha=+el('alpha').value,rows=optimize(el('method').value,alpha,k);
      paragraph('α='+alpha+', k='+k+'. Untuk gradient descent pada kuadratik ini, konvergensi membutuhkan 0 < α < 2/k = '+fmt(2/k)+'. Batas ini bukan rumus umum semua jaringan.');
      paragraph('Loss awal '+fmt(rows[0][3])+' → loss akhir '+fmt(rows.at(-1)[3])+'. '+(rows.at(-1)[3]>1e20?'Simulasi dihentikan karena divergensi.':''));
      table(['Langkah','w₁','w₂','Loss'],rows.map(r=>[r[0],...r.slice(1).map(fmt)]));
      paragraph('Eksperimen regresi pendamping: x=[−2,−1,1,2], target=[−3.5,−2.5,2.5,3.5]. Batch diambil siklis, tanpa shuffle, agar dapat direproduksi. Gradien memakai rata-rata batch; loss dilaporkan pada seluruh empat contoh setelah update. Bandingkan juga jumlah evaluasi, bukan langkah saja.');
      table(['Langkah','Bobot','Gradien batch','Loss seluruh data','Evaluasi contoh'],batchRegression(el('method').value,alpha,+el('batch').value).map(r=>[r[0],fmt(r[1]),fmt(r[2]),fmt(r[3]),r[4]]));
    }else if(kind==='rag'){
      const docs=[{id:'A',text:'Observatorium Aruna membuka kunjungan setiap Sabtu pukul 19.00.',answers:['kapan','jam','buka','kunjungan']},{id:'B',text:'Observatorium Aruna memakai teleskop reflektor untuk melihat bintang.',answers:['alat','teleskop']},{id:'C',text:'Perpustakaan Aruna menyediakan buku astronomi pada hari Senin.',answers:['perpustakaan','buku']}];
      const query=tokens(el('query').value),q=new Set(query),available=docs.filter(d=>d.id!=='A'||el('evidence').checked);
      const ranked=available.map(d=>({...d,score:[...new Set(tokens(d.text))].filter(t=>q.has(t)).length})).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,+el('topk').value);
      table(['Chunk','Overlap','Bukti (korpus fiktif)'],ranked.map(d=>[d.id,d.score,d.text]));
      const answer=ranked.find(d=>d.score>0&&d.answers.some(t=>q.has(t)));
      paragraph(answer?'Jawaban ekstraktif ['+answer.id+']: '+answer.text:'Bukti cukup tidak ditemukan oleh aturan demo; saya tidak dapat menjawab dari korpus ini.');
      paragraph('Untuk pertanyaan contoh “Kapan kunjungan observatorium Aruna?”, chunk acuan A. Recall@k pada pertanyaan itu = '+Number(ranked.some(d=>d.id==='A'))+'. Jika pertanyaan diubah, acuan A tidak otomatis berlaku. Kebijakan jawab demo memakai daftar kata kunci terbatas, sehingga dapat abstain walau bukti ada.');
    }else if(kind==='generation'){
      const source='Rina menanam 10 pohon pada hari Senin.',examples={faithful:[source,'Seluruh proposisi didukung sumber.'],false:['Rina menanam 100 pohon pada hari Senin.','Angka 100 bertentangan dengan sumber 10 meskipun overlap tinggi.'],paraphrase:['Pada Senin Rina menanam sepuluh pohon.','Makna jumlah dan waktu tetap sama; ejaan angka dan urutan kata menurunkan skor.'],abstain:['','Tidak menjawab: tidak menambahkan fakta, tetapi cakupan nol.']};
      const [candidate,assessment]=examples[el('candidate').value],score=rougeL(source,candidate);
      paragraph('Sumber/acuan: '+source);paragraph('Kandidat: '+(candidate||'(kosong)'));
      table(['LCS','Precision','Recall','ROUGE-L F1'],[[score.lcs,fmt(score.precision),fmt(score.recall),fmt(score.f1)]]);paragraph('Penilaian manual contoh: '+assessment);
    }
  }
  const controls=[...root.querySelectorAll('input,select')],initial=controls.map(c=>({value:c.value,checked:c.checked}));
  controls.forEach(c=>c.addEventListener(c.tagName==='SELECT'||c.type==='checkbox'?'change':'input',render));
  el('reset').addEventListener('click',()=>{controls.forEach((c,i)=>{c.value=initial[i].value;c.checked=initial[i].checked;});render();});render();
})();

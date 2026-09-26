/* Small learning controls derived from the same data as the main panels. */
(function(){
  'use strict';
  function panel(parent,title){var e=document.createElement('section');e.className='threshold-control';var h=document.createElement('h2');h.textContent=title;e.appendChild(h);parent.appendChild(e);return e;}
  function table(el,headers,rows){var t=document.createElement('table');t.className='topic-table';var head=t.createTHead().insertRow();headers.forEach(function(h){var c=document.createElement('th');c.textContent=h;head.appendChild(c);});var b=t.createTBody();rows.forEach(function(row){var r=b.insertRow();row.forEach(function(v){r.insertCell().textContent=v;});});var wrap=document.createElement('div');wrap.style.overflowX='auto';wrap.appendChild(t);el.appendChild(wrap);}
  if(typeof LOGREG_DATA!=='undefined'){
    var D=LOGREG_DATA,parent=document.getElementById('boundary-plot').parentElement;
    var p=panel(parent,'Ambang keputusan pada data uji');
    p.insertAdjacentHTML('beforeend','<label for="classification-threshold">Ambang kelas versicolor</label><input id="classification-threshold" type="range" min="0.01" max="0.99" step="0.01" value="0.5"><output id="threshold-metrics" aria-live="polite"></output>');
    var slider=p.querySelector('input');
    function update(){if(window.KupasLogisticThreshold)window.KupasLogisticThreshold(+slider.value);var tp=0,fp=0,tn=0,fn=0;D.points.filter(function(d){return d.test;}).forEach(function(d){var probability=1/(1+Math.exp(-(D.b+D.w[0]*d.x+D.w[1]*d.y)));var pred=probability>=+slider.value;if(d.label===1){if(pred)tp++;else fn++;}else{if(pred)fp++;else tn++;}});p.querySelector('output').textContent='Ambang '+slider.value+' · TP '+tp+' · FP '+fp+' · TN '+tn+' · FN '+fn+' · Precision '+(tp/(tp+fp)||0).toFixed(3)+' · Recall '+(tp/(tp+fn)||0).toFixed(3);}
    slider.addEventListener('input',update);update();
  }
  if(typeof LR_DATA!=='undefined'){
    var el=panel(document.querySelector('.tab-content'),'Evaluasi dan residual data uji');
    var msg=document.createElement('p');msg.textContent='R² latih: '+LR_DATA.simple.train_r2.toFixed(4)+' · R² uji: '+LR_DATA.simple.r2.toFixed(4);el.appendChild(msg);
    table(el,['Liter','Aktual','Prediksi','Residual'],LR_DATA.simple.residuals.map(function(r){return [r.x,r.actual.toFixed(2),r.predicted.toFixed(2),r.residual.toFixed(2)];}));
    var svg=d3.select(el).append('svg').attr('viewBox','0 0 600 230').attr('aria-label','Residual data uji terhadap liter');
    var rows=LR_DATA.simple.residuals,x=d3.scaleLinear().domain(d3.extent(rows,function(r){return r.x;})).range([55,575]),max=d3.max(rows,function(r){return Math.abs(r.residual);}),y=d3.scaleLinear().domain([-max,max]).range([185,20]);
    svg.append('line').attr('x1',55).attr('x2',575).attr('y1',y(0)).attr('y2',y(0)).attr('stroke','currentColor');svg.append('g').attr('transform','translate(0,185)').call(d3.axisBottom(x));svg.append('g').attr('transform','translate(55,0)').call(d3.axisLeft(y));svg.selectAll('circle').data(rows).enter().append('circle').attr('cx',function(r){return x(r.x);}).attr('cy',function(r){return y(r.residual);}).attr('r',4).attr('fill','var(--accent)');
  }
  if(typeof REG_DATA!=='undefined'){
    var e=panel(document.getElementById('reg-dropout-plot').parentElement,'Pengulangan terkontrol');
    table(e,['Benih','Akurasi uji tanpa dropout','Akurasi uji dengan dropout'],REG_DATA.repeats.map(function(r){return [r.seed,(r.baseline*100).toFixed(2)+'%',(r.dropout*100).toFixed(2)+'%'];}));
  }
  if(typeof KK5_DATA!=='undefined'){
    var ga=panel(document.getElementById('eksperimen-heatmap').parentElement,'Variasi dan biaya evaluasi');
    table(ga,['Populasi','pc','pm','Generasi rata-rata','SD','Evaluasi fitness rata-rata','Berhasil'],KK5_DATA.eksperimen.map(function(r){return [r.n_pop,r.pc,r.pm,r.rata_generasi,r.sd_generasi,r.rata_evaluasi,(100*r.success_rate).toFixed(0)+'%'];}));
  }
  if(typeof BP_DATA!=='undefined'){
    var row=document.getElementById('bp-mse-compare');if(row){var values=row.querySelectorAll('strong,.metric-value,.val');if(values.length>=2){values[0].textContent=BP_DATA.mseHistory[0].toFixed(4);values[1].textContent=BP_DATA.mseHistory[1].toFixed(4);}}
  }
})();

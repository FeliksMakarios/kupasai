/*
 * KupasAI - Modul 5: Algoritma Genetika
 */

(function () {
  'use strict';

  var D = KK5_DATA;
  var IS_DARK = document.documentElement.getAttribute('data-theme') === 'dark';
  var C = IS_DARK ? {
    text_muted: '#8b949e', text_primary: '#e6edf3', axis: '#30363d',
    accent: '#58a6ff', danger: '#f85149', success: '#3fb950', grid: '#21262d',
  } : {
    text_muted: '#656d76', text_primary: '#1f2328', axis: '#d0d7de',
    accent: '#0969da', danger: '#cf222e', success: '#1a7f37', grid: '#eaeef2',
  };

  // ============================================================
  // TAB SWITCHING
  // ============================================================
  var tabBtns = document.querySelectorAll('.tab-btn');
  var tabContents = document.querySelectorAll('.tab-content');
  function activateTab(btn) {
    var target = btn.getAttribute('data-tab');
    tabBtns.forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); b.setAttribute('tabindex', '-1'); });
    tabContents.forEach(function (c) { c.classList.remove('active'); });
    btn.classList.add('active'); btn.setAttribute('aria-selected', 'true'); btn.setAttribute('tabindex', '0');
    document.getElementById('tab-' + target).classList.add('active');
  }
  tabBtns.forEach(function (btn, i) {
    btn.addEventListener('click', function () { activateTab(btn); btn.focus(); });
    btn.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var next = e.key === 'ArrowRight' ? i + 1 : i - 1;
      if (next < 0) next = tabBtns.length - 1;
      if (next >= tabBtns.length) next = 0;
      tabBtns[next].click();
    });
  });

  // ============================================================
  // TAB 1: PENYANDIAN KROMOSOM
  // ============================================================
  document.getElementById('encode-display').innerHTML =
    D.encode.kromContoh + '<br><span style="color:' + C.accent + '">nilai desimal = ' + D.encode.nilaiDesimal + '</span><br><span style="color:' + C.success + '">x = ' + D.encode.xHasil + '</span>';
  var encTbody = document.querySelector('#encode-table tbody');
  [
    { versi: 'Tercetak di buku (134468)', nilai: 134468, x: D.encode.salahCetak134468 },
    { versi: 'Hasil konversi biner sebenarnya (134368)', nilai: D.encode.nilaiDesimal, x: D.encode.xHasil },
  ].forEach(function (r) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>' + r.versi + '</td><td>' + r.nilai + '</td><td>' + r.x + '</td>';
    encTbody.appendChild(tr);
  });

  // ============================================================
  // TAB 2: POPULASI & FITNESS
  // ============================================================
  (function renderPopulasiScatter() {
    var svg = d3.select('#populasi-scatter');
    svg.selectAll('*').remove();
    var W = 640, H = 220, margin = { top: 20, right: 20, bottom: 35, left: 45 };
    var iw = W - margin.left - margin.right, ih = H - margin.top - margin.bottom;
    var x = d3.scaleLinear().domain([0, 255]).range([0, iw]);
    var y = d3.scaleLinear().domain([-1.05, 1.05]).range([ih, 0]);
    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    g.append('g').call(d3.axisLeft(y).ticks(5)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.append('g').attr('transform', 'translate(0,' + ih + ')').call(d3.axisBottom(x).ticks(8)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);
    var curve = d3.range(0, 256, 2).map(function (xv) { return { x: xv, y: Math.sin(Math.PI * xv / 256) }; });
    var line = d3.line().x(function (d) { return x(d.x); }).y(function (d) { return y(d.y); }).curve(d3.curveMonotoneX);
    g.append('path').datum(curve).attr('fill', 'none').attr('stroke', C.text_muted).attr('stroke-width', 1.5).attr('stroke-dasharray', '4 3').attr('d', line);
    g.selectAll('.pt').data(D.populasi.tabel).enter().append('circle')
      .attr('cx', function (d) { return x(d.x); }).attr('cy', function (d) { return y(d.fitness); })
      .attr('r', 5).attr('fill', C.accent).attr('opacity', 0.75).attr('stroke', C.accent);
    svg.append('text').attr('x', W / 2).attr('y', H - 2).attr('text-anchor', 'middle').attr('fill', C.text_muted).style('font-size', '10px').text('x');
    svg.append('text').attr('transform', 'rotate(-90)').attr('x', -H / 2).attr('y', 14).attr('text-anchor', 'middle').attr('fill', C.text_muted).style('font-size', '10px').text('fitness f(x)');
  })();
  document.getElementById('populasi-total').textContent = D.populasi.totalFitness;
  var popTbody = document.querySelector('#populasi-table tbody');
  D.populasi.tabel.forEach(function (r, i) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>' + (i + 1) + '</td><td>' + r.kromosom + '</td><td>' + r.biner + '</td><td>' + r.x + '</td><td>' + r.fitness + '</td>';
    popTbody.appendChild(tr);
  });

  // ============================================================
  // TAB 3: SELEKSI ROULETTE WHEEL
  // ============================================================
  (function renderRouletteWheel() {
    var svg = d3.select('#roulette-wheel');
    svg.selectAll('*').remove();
    var W = 300, H = 300, r = 120;
    var g = svg.append('g').attr('transform', 'translate(150,150)');
    var pie = d3.pie().value(function (d) { return d.fitrel; }).sort(null);
    var arcs = pie(D.seleksi.tabel);
    var arcGen = d3.arc().innerRadius(0).outerRadius(r);
    var color = d3.scaleSequential(d3.interpolateBlues).domain([0, D.seleksi.tabel.length]);
    g.selectAll('path').data(arcs).enter().append('path')
      .attr('d', arcGen).attr('fill', function (d, i) { return color(i); }).attr('stroke', IS_DARK ? '#0d1117' : '#fff').attr('stroke-width', 1);
  })();
  document.getElementById('seleksi-hilang-text').innerHTML =
    'Pada seleksi ini, <strong>' + D.seleksi.hilang.length + ' kromosom</strong> (nomor ' + D.seleksi.hilang.join(', ') + ') tidak terpilih sama sekali dan hilang dari generasi berikutnya, digantikan salinan kromosom berfitness lebih tinggi.';
  var selTbody = document.querySelector('#seleksi-table tbody');
  D.seleksi.tabel.forEach(function (r) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>' + r.kromosom + '</td><td>' + r.fitrel + '</td><td>' + r.fitkum + '</td><td>' + r.acak + '</td><td>' + r.terpilih + '</td>';
    selTbody.appendChild(tr);
  });

  // ============================================================
  // TAB 4: SIKLUS GA LENGKAP
  // ============================================================
  (function renderGAChart() {
    var svg = d3.select('#ga-chart');
    svg.selectAll('*').remove();
    var W = 640, H = 260, margin = { top: 20, right: 20, bottom: 35, left: 45 };
    var iw = W - margin.left - margin.right, ih = H - margin.top - margin.bottom;
    var n = D.ga.jejakTerbaik.length;
    var x = d3.scaleLinear().domain([0, n - 1]).range([0, iw]);
    var y = d3.scaleLinear().domain([0, 1.05]).range([ih, 0]);
    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    g.append('g').call(d3.axisLeft(y).ticks(5)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.append('g').attr('transform', 'translate(0,' + ih + ')').call(d3.axisBottom(x).ticks(10)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);
    var line = d3.line().x(function (d, i) { return x(i); }).y(function (d) { return y(d); }).curve(d3.curveMonotoneX);
    g.append('path').datum(D.ga.jejakTerbaik).attr('fill', 'none').attr('stroke', C.accent).attr('stroke-width', 2.5).attr('d', line);
    g.append('path').datum(D.ga.jejakRata).attr('fill', 'none').attr('stroke', C.success).attr('stroke-width', 2.5).attr('stroke-dasharray', '5 3').attr('d', line);
    svg.append('text').attr('x', W / 2).attr('y', H - 2).attr('text-anchor', 'middle').attr('fill', C.text_muted).style('font-size', '10px').text('Generasi (langkah ×4)');
    svg.append('text').attr('transform', 'rotate(-90)').attr('x', -H / 2).attr('y', 14).attr('text-anchor', 'middle').attr('fill', C.text_muted).style('font-size', '10px').text('Fitness');
    var legend = svg.append('g').attr('transform', 'translate(' + (W - 190) + ',12)');
    legend.append('line').attr('x1', 0).attr('x2', 20).attr('stroke', C.accent).attr('stroke-width', 2.5);
    legend.append('text').attr('x', 26).attr('y', 4).style('font-size', '10px').attr('fill', C.text_primary).text('Fitness terbaik');
    legend.append('line').attr('x1', 130).attr('x2', 150).attr('stroke', C.success).attr('stroke-width', 2.5).attr('stroke-dasharray', '5 3');
    legend.append('text').attr('x', 156).attr('y', 4).style('font-size', '10px').attr('fill', C.text_primary).text('Rata-rata');
  })();
  document.getElementById('ga-result').textContent =
    'Kromosom terbaik: ' + D.ga.kromTerbaik + '  →  x = ' + D.ga.xTerbaik + ', fitness = ' + D.ga.fitnessTerbaik;

  // ============================================================
  // TAB 5: EKSPERIMEN PARAMETER (HEATMAP)
  // ============================================================
  (function renderEksperimenHeatmap() {
    var svg = d3.select('#eksperimen-heatmap');
    svg.selectAll('*').remove();
    var W = 640, H = 300, margin = { top: 40, right: 20, bottom: 30, left: 90 };
    var iw = W - margin.left - margin.right, ih = H - margin.top - margin.bottom;
    var rows = [10, 20, 50];
    var cols = [[0.6, 0.001], [0.6, 0.01], [0.6, 0.1], [0.9, 0.001], [0.9, 0.01], [0.9, 0.1]];
    var x = d3.scaleBand().domain(cols.map(function (c) { return c.join('|'); })).range([0, iw]).padding(0.08);
    var y = d3.scaleBand().domain(rows).range([0, ih]).padding(0.08);
    var maxVal = Math.max.apply(null, D.eksperimen.map(function (d) { return d.rata_generasi; }));
    var color = d3.scaleSequential(d3.interpolateOrRd).domain([0, maxVal]);
    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    g.append('g').call(d3.axisLeft(y).tickFormat(function (d) { return 'n=' + d; })).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);
    var xa = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + (margin.top - 8) + ')');
    cols.forEach(function (c) {
      xa.append('text').attr('x', x(c.join('|')) + x.bandwidth() / 2).attr('y', 0).attr('text-anchor', 'middle').style('font-size', '9px').attr('fill', C.text_muted)
        .text('pc=' + c[0]);
      xa.append('text').attr('x', x(c.join('|')) + x.bandwidth() / 2).attr('y', -12).attr('text-anchor', 'middle').style('font-size', '9px').attr('fill', C.text_muted)
        .text('pm=' + c[1]);
    });
    D.eksperimen.forEach(function (d) {
      var key = d.pc + '|' + d.pm;
      var bg = d3.color(color(d.rata_generasi));
      var lum = 0.299 * bg.r + 0.587 * bg.g + 0.114 * bg.b;
      g.append('rect').attr('x', x(key)).attr('y', y(d.n_pop)).attr('width', x.bandwidth()).attr('height', y.bandwidth()).attr('rx', 4)
        .attr('fill', color(d.rata_generasi)).attr('stroke', C.axis);
      g.append('text').attr('x', x(key) + x.bandwidth() / 2).attr('y', y(d.n_pop) + y.bandwidth() / 2 + 4).attr('text-anchor', 'middle')
        .style('font-size', '11px').style('font-weight', 700).attr('fill', lum < 150 ? '#fff' : '#1f2328').text(d.rata_generasi);
    });
  })();

})();

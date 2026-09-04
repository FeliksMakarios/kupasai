/*
 * KupasAI - Modul 6: Kecerdasan Kawanan dan Sistem Fuzzy
 */

(function () {
  'use strict';

  var D = KK6_DATA;
  var IS_DARK = document.documentElement.getAttribute('data-theme') === 'dark';
  var C = IS_DARK ? {
    text_muted: '#8b949e', text_primary: '#e6edf3', axis: '#30363d',
    accent: '#58a6ff', danger: '#f85149', success: '#3fb950', grid: '#21262d',
    node_fill: '#161b22',
  } : {
    text_muted: '#656d76', text_primary: '#1f2328', axis: '#d0d7de',
    accent: '#0969da', danger: '#cf222e', success: '#1a7f37', grid: '#eaeef2',
    node_fill: '#ffffff',
  };
  var PALETTE = [C.accent, C.success, C.danger, '#d29922', '#8957e5', '#39c5cf'];

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

  function lineChart(svgSel, series, opts) {
    opts = opts || {};
    var svg = d3.select(svgSel);
    svg.selectAll('*').remove();
    var W = opts.w || 640, H = opts.h || 220;
    var margin = { top: 20, right: 20, bottom: 35, left: 45 };
    var iw = W - margin.left - margin.right, ih = H - margin.top - margin.bottom;
    var allY = series.reduce(function (acc, s) { return acc.concat(s.data.map(function (d) { return d.y; })); }, []);
    var x = d3.scaleLinear().domain([0, d3.max(series[0].data, function (d) { return d.x; })]).range([0, iw]);
    var y = d3.scaleLinear().domain([opts.minY !== undefined ? opts.minY : 0, d3.max(allY) * 1.1]).range([ih, 0]).nice();
    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    g.append('g').call(d3.axisLeft(y).ticks(5)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.append('g').attr('transform', 'translate(0,' + ih + ')').call(d3.axisBottom(x).ticks(8)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);
    var line = d3.line().x(function (d) { return x(d.x); }).y(function (d) { return y(d.y); }).curve(d3.curveMonotoneX);
    series.forEach(function (s) {
      g.append('path').datum(s.data).attr('fill', 'none').attr('stroke', s.color).attr('stroke-width', 2.5).attr('d', line);
    });
    svg.append('text').attr('x', W / 2).attr('y', H - 2).attr('text-anchor', 'middle').attr('fill', C.text_muted).style('font-size', '10px').text(opts.xLabel || 'Iterasi');
    svg.append('text').attr('transform', 'rotate(-90)').attr('x', -H / 2).attr('y', 14).attr('text-anchor', 'middle').attr('fill', C.text_muted).style('font-size', '10px').text(opts.yLabel || 'Nilai');
  }

  // ============================================================
  // TAB 1: ANT COLONY OPTIMIZATION
  // ============================================================
  (function renderAcoGraph() {
    var svg = d3.select('#aco-graph');
    svg.selectAll('*').remove();
    var pos = { 1: [210, 40], 2: [370, 170], 3: [210, 300], 4: [50, 170] };
    var g = svg.append('g');
    var edges = [['1', '2'], ['1', '3'], ['1', '4'], ['2', '3'], ['2', '4'], ['3', '4']];
    edges.forEach(function (e) {
      var label = e[0] + e[1];
      var p1 = pos[e[0]], p2 = pos[e[1]];
      var tau = D.aco.tauSetelah[label];
      g.append('line').attr('x1', p1[0]).attr('y1', p1[1]).attr('x2', p2[0]).attr('y2', p2[1])
        .attr('stroke', C.accent).attr('stroke-width', 1 + tau * 5).attr('opacity', 0.6);
      var mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2;
      g.append('rect').attr('x', mx - 20).attr('y', my - 10).attr('width', 40).attr('height', 16).attr('fill', IS_DARK ? '#0d1117' : '#fff').attr('opacity', 0.85);
      g.append('text').attr('class', 'edge-label').attr('x', mx).attr('y', my + 2).attr('text-anchor', 'middle').style('font-size', '10px').text(tau.toFixed(3));
    });
    Object.keys(pos).forEach(function (n) {
      var p = pos[n];
      var node = g.append('g').attr('class', 'graph-node').attr('transform', 'translate(' + p[0] + ',' + p[1] + ')');
      node.append('circle').attr('r', 20).attr('fill', n === '1' ? C.success + '33' : (n === '4' ? C.danger + '33' : C.node_fill)).attr('stroke', C.axis);
      node.append('text').attr('dy', 5).style('font-size', '13px').style('font-weight', 700).text(n);
    });
    g.append('text').attr('x', pos['1'][0]).attr('y', pos['1'][1] - 28).attr('text-anchor', 'middle').style('font-size', '9px').attr('fill', C.text_muted).text('Sarang');
    g.append('text').attr('x', pos['4'][0]).attr('y', pos['4'][1] - 28).attr('text-anchor', 'middle').style('font-size', '9px').attr('fill', C.text_muted).text('Makanan');
  })();
  var acoTbody = document.querySelector('#aco-table tbody');
  D.aco.ruas.forEach(function (r) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>tau' + r + '</td><td>' + D.aco.tauSetelah[r].toFixed(4) + '</td>';
    acoTbody.appendChild(tr);
  });
  lineChart('#aco-sim-chart', [{ label: 'Proporsi', color: C.accent, data: D.simulasi.jejakProporsi.map(function (v, i) { return { x: i + 1, y: v }; }) }], { yLabel: 'Proporsi jalur terpendek', minY: 0 });

  // ============================================================
  // TAB 2: ARTIFICIAL BEE COLONY
  // ============================================================
  var abcInitTbody = document.querySelector('#abc-initial-table tbody');
  D.abc.dataAwal.forEach(function (row, i) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>Sumber ' + (i + 1) + '</td><td>' + row[0].toFixed(2) + '</td><td>' + row[1].toFixed(2) + '</td><td>' + D.abc.fAwal[i].toFixed(2) + '</td><td>' + (D.abc.fAwal[i] * 0.01).toFixed(4) + '</td>';
    abcInitTbody.appendChild(tr);
  });
  var abcEmpTbody = document.querySelector('#abc-employed-table tbody');
  D.abc.tabelEmployed.forEach(function (r, i) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>Sumber ' + (i + 1) + '</td><td>Sumber ' + r.pas + '</td><td>' + r.rand.toFixed(3) + '</td><td>(' + r.x1_baru.toFixed(3) + ', ' + r.x2_baru.toFixed(3) + ')</td><td>' + r.f.toFixed(3) + '</td><td>' + (r.ket ? 'diperbarui' : 'bertahan') + '</td>';
    abcEmpTbody.appendChild(tr);
  });
  lineChart('#abc-chart', [{ label: 'f terbaik', color: C.success, data: D.abc.jejak.map(function (v, i) { return { x: i, y: v }; }) }], { yLabel: 'f(x1,x2) terbaik (maksimum)', minY: 0 });
  document.getElementById('abc-result-x1').textContent = D.abc.terbaik[0];
  document.getElementById('abc-result-x2').textContent = D.abc.terbaik[1];
  document.getElementById('abc-result-f').textContent = D.abc.fTerbaik;

  // ============================================================
  // TAB 3: HIMPUNAN FUZZY
  // ============================================================
  (function renderFuzzyUmur() {
    var svg = d3.select('#fuzzy-umur-chart');
    svg.selectAll('*').remove();
    var W = 640, H = 260, margin = { top: 20, right: 20, bottom: 35, left: 40 };
    var iw = W - margin.left - margin.right, ih = H - margin.top - margin.bottom;
    var xs = D.fuzzyUmur.xs;
    var x = d3.scaleLinear().domain([0, 80]).range([0, iw]);
    var y = d3.scaleLinear().domain([0, 1.05]).range([ih, 0]);
    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    g.append('g').call(d3.axisLeft(y).ticks(5)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.append('g').attr('transform', 'translate(0,' + ih + ')').call(d3.axisBottom(x).ticks(8)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);
    var line = d3.line().x(function (d, i) { return x(xs[i]); }).y(function (d) { return y(d); }).curve(d3.curveLinear);
    var names = ['balita', 'anak', 'remaja', 'pemuda', 'dewasa', 'tua'];
    names.forEach(function (nama, i) {
      g.append('path').datum(D.fuzzyUmur.kurva[nama]).attr('fill', 'none').attr('stroke', PALETTE[i]).attr('stroke-width', 2).attr('d', line);
    });
    var legendBg = svg.append('rect').attr('x', W - 336).attr('y', 2).attr('width', 316).attr('height', 36)
      .attr('fill', IS_DARK ? '#0d1117' : '#ffffff').attr('opacity', 0.88).attr('rx', 4);
    var legend = svg.append('g').attr('transform', 'translate(' + (W - 328) + ',16)');
    names.forEach(function (nama, i) {
      var lx = (i % 3) * 105, ly = Math.floor(i / 3) * 16;
      legend.append('line').attr('x1', lx).attr('x2', lx + 16).attr('y1', ly).attr('y2', ly).attr('stroke', PALETTE[i]).attr('stroke-width', 2.5);
      legend.append('text').attr('x', lx + 20).attr('y', ly + 4).style('font-size', '10px').attr('fill', C.text_primary).text(nama);
    });
    svg.append('text').attr('x', W / 2).attr('y', H - 2).attr('text-anchor', 'middle').attr('fill', C.text_muted).style('font-size', '10px').text('Umur (tahun)');
  })();
  var balitaTbody = document.querySelector('#balita-table tbody');
  Object.keys(D.fuzzyUmur.hargaBalitaVerified).forEach(function (x) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>' + x + '</td><td>' + D.fuzzyUmur.hargaBalitaVerified[x].toFixed(3) + '</td>';
    balitaTbody.appendChild(tr);
  });

  // ============================================================
  // TAB 4: SISTEM FUZZY
  // ============================================================
  var SF = D.sistemFuzzy;
  var fuzzTbody = document.querySelector('#sistem-fuzzifikasi-table tbody');
  [
    ['Pesanan turun (x1=4000)', SF.muPesananTurun], ['Pesanan naik (x1=4000)', SF.muPesananNaik],
    ['Simpanan rendah (x2=300)', SF.muSimpananRendah], ['Simpanan tinggi (x2=300)', SF.muSimpananTinggi],
  ].forEach(function (r) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>' + r[0] + '</td><td>' + r[1].toFixed(2) + '</td>';
    fuzzTbody.appendChild(tr);
  });

  function renderSistemMode(mode) {
    var tbody = document.querySelector('#sistem-aturan-table tbody');
    tbody.innerHTML = '';
    var chart = document.getElementById('sistem-mamdani-chart');
    if (mode === 'tsukamoto') {
      chart.style.display = 'none';
      SF.tsukamoto.aturan.forEach(function (a) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>Aturan ' + a.aturan + ' (' + a.arah + ')</td><td>' + a.alpha.toFixed(2) + '</td><td>' + a.z.toFixed(0) + '</td>';
        tbody.appendChild(tr);
      });
      document.getElementById('sistem-result').textContent = 'Produksi (Tsukamoto) = ' + SF.tsukamoto.z.toFixed(2) + ' satuan';
    } else {
      chart.style.display = '';
      renderMamdaniChart();
      var tr1 = document.createElement('tr');
      tr1.innerHTML = '<td>Luas area gabungan</td><td>-</td><td>' + SF.mamdani.area.toFixed(2) + '</td>';
      tbody.appendChild(tr1);
      var tr2 = document.createElement('tr');
      tr2.innerHTML = '<td>Momen (&sum;z&middot;&mu;)</td><td>-</td><td>' + SF.mamdani.momen.toFixed(0) + '</td>';
      tbody.appendChild(tr2);
      document.getElementById('sistem-result').textContent = 'Produksi (Mamdani) = ' + SF.mamdani.z.toFixed(2) + ' satuan';
    }
  }
  function renderMamdaniChart() {
    var svg = d3.select('#sistem-mamdani-chart');
    svg.selectAll('*').remove();
    var W = 640, H = 220, margin = { top: 20, right: 20, bottom: 35, left: 40 };
    var iw = W - margin.left - margin.right, ih = H - margin.top - margin.bottom;
    var x = d3.scaleLinear().domain([2000, 7000]).range([0, iw]);
    var y = d3.scaleLinear().domain([0, 1.05]).range([ih, 0]);
    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    g.append('g').call(d3.axisLeft(y).ticks(5)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.append('g').attr('transform', 'translate(0,' + ih + ')').call(d3.axisBottom(x).ticks(6)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);
    var zs = d3.range(2000, 7001, 25);
    var alphaRendah = Math.max(Math.min(SF.muPesananTurun, SF.muSimpananTinggi), Math.min(SF.muPesananTurun, SF.muSimpananRendah));
    var alphaTinggi = Math.max(Math.min(SF.muPesananNaik, SF.muSimpananTinggi), Math.min(SF.muPesananNaik, SF.muSimpananRendah));
    var muGab = zs.map(function (z) {
      var muR = Math.max(0, Math.min(1, (7000 - z) / 5000));
      var muT = Math.max(0, Math.min(1, (z - 2000) / 5000));
      return Math.max(Math.min(alphaRendah, muR), Math.min(alphaTinggi, muT));
    });
    var area = d3.area().x(function (d, i) { return x(zs[i]); }).y0(ih).y1(function (d) { return y(d); }).curve(d3.curveLinear);
    g.append('path').datum(muGab).attr('fill', C.accent).attr('opacity', 0.3).attr('d', area);
    var line = d3.line().x(function (d, i) { return x(zs[i]); }).y(function (d) { return y(d); }).curve(d3.curveLinear);
    g.append('path').datum(muGab).attr('fill', 'none').attr('stroke', C.accent).attr('stroke-width', 2).attr('d', line);
    var zLine = SF.mamdani.z;
    g.append('line').attr('x1', x(zLine)).attr('x2', x(zLine)).attr('y1', 0).attr('y2', ih).attr('stroke', C.danger).attr('stroke-width', 2).attr('stroke-dasharray', '4 3');
    g.append('text').attr('x', x(zLine) + 4).attr('y', 12).style('font-size', '10px').attr('fill', C.danger).text('z=' + zLine.toFixed(0));
    svg.append('text').attr('x', W / 2).attr('y', H - 2).attr('text-anchor', 'middle').attr('fill', C.text_muted).style('font-size', '10px').text('Produksi z');
  }
  document.querySelectorAll('#sistem-mode-buttons .mode-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('#sistem-mode-buttons .mode-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      renderSistemMode(btn.getAttribute('data-mode'));
    });
  });
  renderSistemMode('tsukamoto');
  document.getElementById('sistem-stok-akhir').textContent = SF.stokAkhirTsukamoto.toFixed(0);

})();

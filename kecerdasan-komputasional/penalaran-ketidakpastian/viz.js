/*
 * KupasAI - Modul 3: Penalaran Ketidakpastian dan Kesamaan Dokumen
 */

(function () {
  'use strict';

  var D = KK3_DATA;
  var IS_DARK = document.documentElement.getAttribute('data-theme') === 'dark';
  var C = IS_DARK ? {
    text_muted: '#8b949e', text_primary: '#e6edf3', axis: '#30363d',
    accent: '#58a6ff', danger: '#f85149', success: '#3fb950', grid: '#21262d',
  } : {
    text_muted: '#656d76', text_primary: '#1f2328', axis: '#d0d7de',
    accent: '#0969da', danger: '#cf222e', success: '#1a7f37', grid: '#eaeef2',
  };
  var PALETTE = [C.accent, C.success, C.danger, '#d29922', '#8957e5'];

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

  function barChart(svgSel, data, opts) {
    opts = opts || {};
    var svg = d3.select(svgSel);
    svg.selectAll('*').remove();
    var W = opts.w || 500, H = opts.h || 220;
    var margin = { top: 20, right: 20, bottom: 40, left: opts.leftMargin || 45 };
    var iw = W - margin.left - margin.right, ih = H - margin.top - margin.bottom;
    var x = d3.scaleBand().domain(data.map(function (d) { return d.label; })).range([0, iw]).padding(0.35);
    var y = d3.scaleLinear().domain([0, opts.maxY || d3.max(data, function (d) { return d.value; }) * 1.15]).range([ih, 0]);
    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    g.append('g').call(d3.axisLeft(y).ticks(5)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.append('g').attr('transform', 'translate(0,' + ih + ')').call(d3.axisBottom(x)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);
    g.selectAll('.bar').data(data).enter().append('rect')
      .attr('x', function (d) { return x(d.label); }).attr('y', function (d) { return y(d.value); })
      .attr('width', x.bandwidth()).attr('height', function (d) { return ih - y(d.value); })
      .attr('fill', function (d, i) { return d.color || PALETTE[i % PALETTE.length]; }).attr('rx', 4);
    g.selectAll('.val').data(data).enter().append('text')
      .attr('x', function (d) { return x(d.label) + x.bandwidth() / 2; }).attr('y', function (d) { return y(d.value) - 6; })
      .attr('text-anchor', 'middle').style('font-size', '11px').style('font-weight', 700).attr('fill', C.text_primary)
      .text(function (d) { return (opts.fmt || String)(d.value); });
    return { x: x, y: y, g: g, iw: iw, ih: ih };
  }

  // ============================================================
  // TAB 1: TEOREMA BAYES
  // ============================================================
  var B = D.bayes;
  var bayesTbody = document.querySelector('#bayes-table tbody');
  B.penyakit.forEach(function (nama, i) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>' + nama + '</td><td>' + B.prior[i] + '</td><td>' + B.likelihood[i] + '</td><td>' + B.pembilang[i].toFixed(2) + '</td><td>' + B.posterior[i].toFixed(4) + '</td>';
    bayesTbody.appendChild(tr);
  });
  barChart('#bayes-bar', B.penyakit.map(function (n, i) { return { label: n, value: B.posterior[i] }; }), { maxY: 0.6, fmt: function (v) { return (v * 100).toFixed(1) + '%'; } });
  document.getElementById('bayes-fakta-note').textContent =
    'P(cacar|panas) = ' + B.faktaBaru.pHGivenEKecil + ', P(bintik|panas,cacar) = ' + B.faktaBaru.pEGivenEDanH + ', P(bintik|panas) = ' + B.faktaBaru.pEGivenE +
    '  →  P(cacar|bintik,panas) = ' + B.faktaBaru.hasil.toFixed(4);

  // ============================================================
  // TAB 2: FAKTOR KEPASTIAN
  // ============================================================
  var CFD = D.cf;
  var cfTbody = document.querySelector('#cf-table tbody');
  [
    ['MB(cacar, bintik)', CFD.mb1], ['MB(cacar, panas)', CFD.mb2],
    ['MD(cacar, bintik)', CFD.md1], ['MD(cacar, panas)', CFD.md2],
    ['MB gabungan', CFD.mbGabungan], ['MD gabungan', CFD.mdGabungan],
    ['CF akhir', CFD.cf],
    ['MB konjungsi (min)', CFD.mbKonjungsi], ['MB disjungsi (max)', CFD.mbDisjungsi],
  ].forEach(function (r) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>' + r[0] + '</td><td>' + r[1].toFixed(4) + '</td>';
    cfTbody.appendChild(tr);
  });
  (function renderGauge() {
    var svg = d3.select('#cf-gauge');
    svg.selectAll('*').remove();
    var W = 500, H = 140, margin = { left: 40, right: 40 };
    var iw = W - margin.left - margin.right;
    var y = 70;
    var g = svg.append('g');
    g.append('line').attr('x1', margin.left).attr('x2', margin.left + iw).attr('y1', y).attr('y2', y).attr('stroke', C.axis).attr('stroke-width', 3);
    [0, 0.25, 0.5, 0.75, 1].forEach(function (t) {
      var xx = margin.left + t * iw;
      g.append('line').attr('x1', xx).attr('x2', xx).attr('y1', y - 6).attr('y2', y + 6).attr('stroke', C.axis);
      g.append('text').attr('x', xx).attr('y', y + 22).attr('text-anchor', 'middle').style('font-size', '10px').attr('fill', C.text_muted).text(t);
    });
    var labelRows = [-38, -20, -38];
    ['MD', 'CF', 'MB'].forEach(function (label, i) {
      var val = { MB: CFD.mbGabungan, MD: CFD.mdGabungan, CF: CFD.cf }[label];
      var xx = margin.left + val * iw;
      var color = { MB: C.success, MD: C.danger, CF: C.accent }[label];
      g.append('circle').attr('cx', xx).attr('cy', y).attr('r', 7).attr('fill', color);
      var anchor = xx < margin.left + 40 ? 'start' : (xx > margin.left + iw - 40 ? 'end' : 'middle');
      g.append('text').attr('x', xx).attr('y', y + labelRows[i]).attr('text-anchor', anchor).style('font-size', '11px').style('font-weight', 700).attr('fill', color).text(label + '=' + val.toFixed(4));
    });
  })();

  // ============================================================
  // TAB 3: DEMPSTER-SHAFER
  // ============================================================
  var DS = D.dempster;
  function renderDempster(stage) {
    var m = stage === 'dua' ? DS.m12 : DS.m123;
    var tabel = stage === 'dua' ? DS.tabel12 : DS.tabel123;
    var data = Object.keys(m).map(function (k) { return { label: k, value: m[k] }; });
    barChart('#dempster-bar', data, { w: 560, h: 260, maxY: Math.max.apply(null, data.map(function (d) { return d.value; })) * 1.3, fmt: function (v) { return v.toFixed(3); }, leftMargin: 50 });
    var tbody = document.querySelector('#dempster-table tbody');
    tbody.innerHTML = '';
    tabel.forEach(function (r) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>{' + r.a.join(',') + '}</td><td>{' + r.b.join(',') + '}</td><td>' + (r.irisan.length ? '{' + r.irisan.join(',') + '}' : '&empty;') + '</td><td>' + r.bobot.toFixed(4) + '</td>';
      tbody.appendChild(tr);
    });
  }
  var dempsterStage = 'dua';
  renderDempster(dempsterStage);
  document.querySelectorAll('#dempster-mode-buttons .mode-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('#dempster-mode-buttons .mode-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      dempsterStage = btn.getAttribute('data-stage');
      renderDempster(dempsterStage);
    });
  });

  // ============================================================
  // TAB 4: VECTOR SPACE MODEL
  // ============================================================
  var V = D.vsm;
  document.getElementById('vsm-dok-note').innerHTML = '<strong>Dok 1:</strong> ' + V.dok1 + '<br><strong>Dok 2:</strong> ' + V.dok2;
  var vsmTbody = document.querySelector('#vsm-table tbody');
  V.kosakata.forEach(function (kata, i) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>' + (i + 1) + '</td><td>' + kata + '</td><td>' + V.d1[i] + '</td><td>' + V.d2[i] + '</td>';
    vsmTbody.appendChild(tr);
  });
  (function renderVsmBars() {
    var svg = d3.select('#vsm-vector');
    svg.selectAll('*').remove();
    var W = 640, H = 200, margin = { top: 20, right: 20, bottom: 55, left: 40 };
    var iw = W - margin.left - margin.right, ih = H - margin.top - margin.bottom;
    var x = d3.scaleBand().domain(V.kosakata).range([0, iw]).padding(0.25);
    var xSub = d3.scaleBand().domain(['d1', 'd2']).range([0, x.bandwidth()]).padding(0.1);
    var maxV = Math.max.apply(null, V.d1.concat(V.d2));
    var y = d3.scaleLinear().domain([0, maxV + 0.5]).range([ih, 0]);
    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    g.append('g').call(d3.axisLeft(y).ticks(maxV)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    var xa = g.append('g').attr('transform', 'translate(0,' + ih + ')').call(d3.axisBottom(x));
    xa.selectAll('text').attr('fill', C.text_muted).style('font-size', '9px').attr('transform', 'rotate(-35)').style('text-anchor', 'end');
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);
    V.kosakata.forEach(function (kata, i) {
      [{ key: 'd1', v: V.d1[i], color: C.accent }, { key: 'd2', v: V.d2[i], color: C.success }].forEach(function (s) {
        g.append('rect').attr('x', x(kata) + xSub(s.key)).attr('y', y(s.v)).attr('width', xSub.bandwidth()).attr('height', ih - y(s.v)).attr('fill', s.color).attr('rx', 2);
      });
    });
    var legend = svg.append('g').attr('transform', 'translate(' + (W - 230) + ',12)');
    legend.append('rect').attr('width', 12).attr('height', 12).attr('fill', C.accent);
    legend.append('text').attr('x', 18).attr('y', 10).style('font-size', '10px').attr('fill', C.text_primary).text('Dokumen 1');
    legend.append('rect').attr('x', 110).attr('width', 12).attr('height', 12).attr('fill', C.success);
    legend.append('text').attr('x', 128).attr('y', 10).style('font-size', '10px').attr('fill', C.text_primary).text('Dokumen 2');
  })();
  document.getElementById('vsm-result').textContent = V.dot + ' ÷ (' + V.norma1.toFixed(1) + ' × ' + V.norma2.toFixed(4) + ') = ' + V.cosine.toFixed(4) + ' (' + (V.cosine * 100).toFixed(2) + '%)';

})();

/*
 * KupasAI - Streetlight Problem Visualization
 * ML Lanjut IN F24141 - Week 5
 */

(function () {
  'use strict';

  var D = SL_DATA;
  var IS_DARK = document.documentElement.getAttribute('data-theme') === 'dark';
  var C = IS_DARK ? {
    text_muted: '#8b949e', text_primary: '#e6edf3', axis: '#30363d',
    accent: '#58a6ff', danger: '#f85149', success: '#3fb950', grid: '#21262d',
  } : {
    text_muted: '#656d76', text_primary: '#1f2328', axis: '#d0d7de',
    accent: '#0969da', danger: '#cf222e', success: '#1a7f37', grid: '#eaeef2',
  };

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
  // DATASET TABLE
  // ============================================================
  var dsCaption = document.getElementById('dataset-caption');
  if (dsCaption) dsCaption.textContent = D.dataset.note;
  var dsBody = document.querySelector('#dataset-table tbody');
  if (dsBody) {
    D.dataset.rows.forEach(function (row, i) {
      var tr = document.createElement('tr');
      var cells = row.map(function (v, ci) {
        if (ci < 3) return '<td class="' + (v === 1 ? 'on' : '') + '">' + v + '</td>';
        return '<td class="' + (v === 1 ? 'decision-walk' : 'decision-stop') + '">' + (v === 1 ? 'WALK' : 'STOP') + '</td>';
      }).join('');
      tr.innerHTML = cells;
      dsBody.appendChild(tr);
    });
  }

  // ============================================================
  // GENERIC LINE CHART
  // ============================================================
  function lineChart(svgSel, data, opts) {
    opts = opts || {};
    var svg = d3.select(svgSel);
    svg.selectAll('*').remove();
    var W = opts.w || 640, H = opts.h || 300;
    var margin = { top: 20, right: 20, bottom: 35, left: 55 };
    var iw = W - margin.left - margin.right, ih = H - margin.top - margin.bottom;
    var x = d3.scaleLinear().domain([1, data.length]).range([0, iw]);
    var y = (opts.logY ? d3.scaleLog() : d3.scaleLinear())
      .domain(opts.logY ? [Math.max(1e-6, d3.min(data, function(d){return d.y;})), d3.max(data, function (d) { return d.y; })] : [0, d3.max(data, function (d) { return d.y; }) * 1.1])
      .range([ih, 0]).nice();
    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    g.append('g').call(d3.axisLeft(y).ticks(5, opts.logY ? '~g' : undefined)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.append('g').attr('transform', 'translate(0,' + ih + ')').call(d3.axisBottom(x).ticks(10)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);
    var line = d3.line().x(function (d) { return x(d.x); }).y(function (d) { return y(d.y); }).curve(d3.curveMonotoneX);
    g.append('path').datum(data).attr('fill', 'none').attr('stroke', opts.color || C.accent).attr('stroke-width', 2.5).attr('d', line);
    svg.append('text').attr('x', W / 2).attr('y', H - 2).attr('text-anchor', 'middle').attr('fill', C.text_muted).style('font-size', '10px').text(opts.xLabel || 'Iterasi');
    svg.append('text').attr('transform', 'rotate(-90)').attr('x', -H / 2).attr('y', 14).attr('text-anchor', 'middle').attr('fill', C.text_muted).style('font-size', '10px').text(opts.yLabel || 'Error');
  }

  // ============================================================
  // TAB 1: SINGLE EXAMPLE
  // ============================================================
  function renderSingle() {
    var se = D.singleExample;
    var full = [];
    var w = D.weights0.slice();
    for (var i = 1; i <= 20; i++) {
      var pred = se.input[0] * w[0] + se.input[1] * w[1] + se.input[2] * w[2];
      var err = Math.pow(pred - se.goal, 2);
      full.push({ x: i, y: err });
      var delta = pred - se.goal;
      w = w.map(function (wi, wj) { return wi - (D.alpha * (se.input[wj] * delta)); });
    }
    lineChart('#sl-single-plot', full, { color: C.danger, yLabel: 'Error' });
    var tbody = document.querySelector('#single-table tbody');
    tbody.innerHTML = '';
    se.selected.forEach(function (r) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>Iterasi ' + r.iter + '</td><td>' + r.pred.toFixed(5) + '</td><td>' + r.error.toFixed(6) + '</td>' +
        '<td>[' + r.weights.map(function (v) { return v.toFixed(4); }).join(', ') + ']</td>';
      tbody.appendChild(tr);
    });
  }
  renderSingle();

  // ============================================================
  // TAB 2: WHOLE DATASET
  // ============================================================
  function renderWhole() {
    var wd = D.wholeDataset;
    var data = wd.errorPerEpoch.map(function (e, i) { return { x: i + 1, y: e }; });
    lineChart('#sl-whole-plot', data, { color: C.success, logY: true, xLabel: 'Epoch', yLabel: 'Total Error (skala log)' });
    var tbody = document.querySelector('#whole-table tbody');
    tbody.innerHTML = '';
    wd.selected.forEach(function (r) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>Epoch ' + r.epoch + '</td><td>' + r.error.toFixed(6) + '</td>' +
        '<td>[' + r.weights.map(function (v) { return v.toFixed(4); }).join(', ') + ']</td>';
      tbody.appendChild(tr);
    });

    // final weights bar chart
    var svg = d3.select('#sl-final-weights');
    svg.selectAll('*').remove();
    var W = 400, H = 200, margin = { top: 10, right: 20, bottom: 40, left: 40 };
    var iw = W - margin.left - margin.right, ih = H - margin.top - margin.bottom;
    var labels = ['Kiri', 'Tengah', 'Kanan'];
    var x = d3.scaleBand().domain(labels).range([0, iw]).padding(0.35);
    var maxAbs = d3.max(wd.finalWeights, Math.abs);
    var y = d3.scaleLinear().domain([-maxAbs * 1.2, maxAbs * 1.2]).range([ih, 0]);
    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    // Sumbu-x hanya garis nol polos (tanpa label kategori di sini) supaya
    // tidak bertabrakan dengan label nilai batang yang nilainya dekat nol;
    // nama kategori (Kiri/Tengah/Kanan) ditulis manual di dasar area plot.
    g.append('line').attr('x1', 0).attr('x2', iw).attr('y1', y(0)).attr('y2', y(0)).attr('stroke', C.axis);
    g.append('g').call(d3.axisLeft(y).ticks(4)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);
    labels.forEach(function (lab, i) {
      var v = wd.finalWeights[i];
      var barTop = y(Math.max(0, v)), barHeight = Math.abs(y(v) - y(0));
      var cx = x(lab) + x.bandwidth() / 2;
      g.append('rect').attr('x', x(lab)).attr('y', barTop).attr('width', x.bandwidth())
        .attr('height', barHeight).attr('fill', i === 1 ? C.success : C.text_muted);
      // Label nilai selalu di luar ujung batang menjauhi nol, dengan jarak
      // aman minimum supaya batang yang nyaris nol tidak membuat labelnya
      // menempel ke garis nol.
      var labelY = v >= 0 ? Math.min(barTop - 6, y(0) - 10) : Math.max(y(v) + 16, y(0) + 16);
      g.append('text').attr('x', cx).attr('y', labelY)
        .attr('text-anchor', 'middle').attr('fill', C.text_primary).style('font-size', '11px').style('font-weight', 700)
        .text(v.toFixed(3));
      g.append('text').attr('x', cx).attr('y', ih + 16)
        .attr('text-anchor', 'middle').attr('fill', C.text_muted).style('font-size', '10px').text(lab);
    });
  }
  renderWhole();

})();

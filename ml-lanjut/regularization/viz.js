/*
 * KupasAI - Regularization Visualization
 * ML Lanjut IN F24141 - Week 9
 */

(function () {
  'use strict';

  var D = REG_DATA;
  var IS_DARK = document.documentElement.getAttribute('data-theme') === 'dark';
  var C = IS_DARK ? {
    text_muted: '#8b949e', text_primary: '#e6edf3', axis: '#30363d',
    accent: '#58a6ff', danger: '#f85149', success: '#3fb950', warn: '#d29922', grid: '#21262d',
  } : {
    text_muted: '#656d76', text_primary: '#1f2328', axis: '#d0d7de',
    accent: '#0969da', danger: '#cf222e', success: '#1a7f37', warn: '#9a6700', grid: '#eaeef2',
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
  // GENERIC MULTI-SERIES LINE CHART
  // ============================================================
  function lineChart(svgSel, series, opts) {
    opts = opts || {};
    var svg = d3.select(svgSel);
    svg.selectAll('*').remove();
    var W = opts.w || 640, H = opts.h || 300;
    var margin = { top: 20, right: 20, bottom: 35, left: 45 };
    var iw = W - margin.left - margin.right, ih = H - margin.top - margin.bottom;
    var allPoints = [];
    series.forEach(function (s) { s.data.forEach(function (d) { allPoints.push(d); }); });
    var xMax = d3.max(allPoints, function (d) { return d.x; });
    var x = d3.scaleLinear().domain([opts.xMin || 1, xMax]).range([0, iw]);
    var y = d3.scaleLinear().domain(opts.yDomain || [0, d3.max(allPoints, function (d) { return d.y; }) * 1.05]).range([ih, 0]);
    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    g.append('g').call(d3.axisLeft(y).ticks(5)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.append('g').attr('transform', 'translate(0,' + ih + ')').call(d3.axisBottom(x).ticks(8)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);
    var line = d3.line().x(function (d) { return x(d.x); }).y(function (d) { return y(d.y); }).curve(d3.curveMonotoneX);
    series.forEach(function (s) {
      g.append('path').datum(s.data).attr('fill', 'none').attr('stroke', s.color).attr('stroke-width', 2.5)
        .attr('stroke-dasharray', s.dashed ? '5,3' : null).attr('d', line);
    });
    if (opts.markX !== undefined) {
      var nearRight = x(opts.markX) > iw * 0.6;
      g.append('line').attr('x1', x(opts.markX)).attr('x2', x(opts.markX)).attr('y1', 0).attr('y2', ih)
        .attr('stroke', C.warn).attr('stroke-width', 1.5).attr('stroke-dasharray', '3,3');
      g.append('text').attr('x', x(opts.markX) + (nearRight ? -6 : 6)).attr('y', 12)
        .attr('text-anchor', nearRight ? 'end' : 'start')
        .attr('fill', C.warn).style('font-size', '9px').text(opts.markLabel || '');
    }
    svg.append('text').attr('x', W / 2).attr('y', H - 2).attr('text-anchor', 'middle').attr('fill', C.text_muted).style('font-size', '10px').text(opts.xLabel || 'Epoch');
    svg.append('text').attr('transform', 'rotate(-90)').attr('x', -H / 2).attr('y', 14).attr('text-anchor', 'middle').attr('fill', C.text_muted).style('font-size', '10px').text(opts.yLabel || 'Akurasi');
    // legend
    var legend = svg.append('g').attr('transform', 'translate(' + margin.left + ',12)');
    series.forEach(function (s, i) {
      var lg = legend.append('g').attr('transform', 'translate(' + (i * 120) + ',0)');
      lg.append('rect').attr('width', 12).attr('height', 3).attr('y', -3).attr('fill', s.color);
      lg.append('text').attr('x', 16).attr('y', 0).style('font-size', '10px').attr('fill', C.text_muted).text(s.label);
    });
  }

  function pluck(log, key) {
    return log.map(function (r) { return { x: r.epoch, y: r[key] }; });
  }

  // ============================================================
  // TAB 1: OVERFITTING BASELINE
  // ============================================================
  lineChart('#reg-baseline-plot', [
    { data: pluck(D.baseline, 'train_acc'), color: C.accent, label: 'Train Acc' },
    { data: pluck(D.baseline, 'val_acc'), color: C.warn, label: 'Val Acc' },
    { data: pluck(D.baseline, 'test_acc'), color: C.danger, label: 'Test Acc' }
  ], { yDomain: [0, 1.05] });

  document.getElementById('baseline-train').textContent = (D.baselineFinal.train_acc * 100).toFixed(1) + '%';
  document.getElementById('baseline-val').textContent = (D.baselineFinal.val_acc * 100).toFixed(1) + '%';
  document.getElementById('baseline-test').textContent = (D.baselineFinal.test_acc * 100).toFixed(1) + '%';
  document.getElementById('baseline-gap').textContent = ((D.baselineFinal.train_acc - D.baselineFinal.test_acc) * 100).toFixed(1) + ' poin';

  // ============================================================
  // TAB 2: EARLY STOPPING
  // ============================================================
  lineChart('#reg-es-plot', [
    { data: pluck(D.earlyStop, 'train_loss'), color: C.accent, label: 'Train Loss' },
    { data: pluck(D.earlyStop, 'val_loss'), color: C.danger, label: 'Val Loss' }
  ], { yDomain: [0, 0.1], yLabel: 'Loss (MSE)', markX: D.earlyStopMeta.bestEpoch, markLabel: 'Checkpoint terbaik: epoch ' + D.earlyStopMeta.bestEpoch });

  document.getElementById('es-best-epoch').textContent = D.earlyStopMeta.bestEpoch;
  document.getElementById('es-stopped-at').textContent = D.earlyStopMeta.stoppedAt;
  document.getElementById('es-best-loss').textContent = D.earlyStopMeta.bestValLoss.toFixed(5);
  document.getElementById('es-restored-val').textContent = (D.earlyStopMeta.restoredValAcc * 100).toFixed(1) + '%';
  document.getElementById('es-restored-test').textContent = (D.earlyStopMeta.restoredTestAcc * 100).toFixed(1) + '%';

  // ============================================================
  // TAB 3: DROPOUT
  // ============================================================
  lineChart('#reg-dropout-plot', [
    { data: pluck(D.baseline, 'test_acc'), color: C.danger, label: 'Test Acc (tanpa dropout)' },
    { data: pluck(D.dropout, 'test_acc'), color: C.success, label: 'Test Acc (dropout p=0.5)' }
  ], { yDomain: [0, 1.05] });

  document.getElementById('dropout-baseline-test').textContent = (D.baselineFinal.test_acc * 100).toFixed(1) + '%';
  document.getElementById('dropout-test').textContent = (D.dropoutFinal.test_acc * 100).toFixed(1) + '%';

  // dropout mask mini-demo (illustrative, regenerates on click)
  var maskSvg = d3.select('#dropout-mask-demo');
  var maskBtn = document.getElementById('dropout-regenerate');
  function renderMask() {
    maskSvg.selectAll('*').remove();
    var nodes = 8;
    var W = 400, H = 90;
    maskSvg.attr('viewBox', '0 0 ' + W + ' ' + H);
    for (var i = 0; i < nodes; i++) {
      var dropped = Math.random() < 0.5;
      var cx = 30 + i * ((W - 60) / (nodes - 1));
      maskSvg.append('circle').attr('cx', cx).attr('cy', H / 2).attr('r', 18)
        .attr('fill', dropped ? 'none' : C.accent).attr('stroke', dropped ? C.text_muted : C.accent)
        .attr('stroke-dasharray', dropped ? '3,3' : null).attr('opacity', dropped ? 0.4 : 1);
      if (dropped) {
        maskSvg.append('text').attr('x', cx).attr('y', H / 2 + 4).attr('text-anchor', 'middle')
          .attr('fill', C.text_muted).style('font-size', '10px').text('off');
      }
    }
  }
  renderMask();
  if (maskBtn) maskBtn.addEventListener('click', renderMask);

})();

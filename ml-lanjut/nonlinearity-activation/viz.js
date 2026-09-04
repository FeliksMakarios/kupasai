/*
 * KupasAI - Non-Linearitas & Fungsi Aktivasi Visualization
 * ML Lanjut IN F24141 - Week 6 & 10
 */

(function () {
  'use strict';

  var D = NL_DATA;
  var DN = NL_DONUT_DATA;
  var IS_DARK = document.documentElement.getAttribute('data-theme') === 'dark';
  var C = IS_DARK ? {
    text_muted: '#8b949e', text_primary: '#e6edf3', axis: '#30363d',
    accent: '#58a6ff', danger: '#f85149', success: '#3fb950', grid: '#21262d',
    c0: 'rgba(88,166,255,0.85)', c1: 'rgba(248,81,73,0.85)',
    bg0: 'rgba(88,166,255,0.18)', bg1: 'rgba(248,81,73,0.18)',
  } : {
    text_muted: '#656d76', text_primary: '#1f2328', axis: '#d0d7de',
    accent: '#0969da', danger: '#cf222e', success: '#1a7f37', grid: '#eaeef2',
    c0: 'rgba(9,105,218,0.85)', c1: 'rgba(207,34,46,0.85)',
    bg0: 'rgba(9,105,218,0.15)', bg1: 'rgba(207,34,46,0.15)',
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
  // TAB 1: LINEAR VS NON-LINEAR (donut boundary)
  // ============================================================
  function renderBoundary(svgSel, grid) {
    var svg = d3.select(svgSel);
    svg.selectAll('*').remove();
    var res = DN.grid_res, range = DN.grid_range;
    var size = 260;
    svg.attr('viewBox', '0 0 ' + size + ' ' + size);
    var scale = d3.scaleLinear().domain(range).range([0, size]);
    var cellSize = size / res;
    for (var r = 0; r < res; r++) {
      for (var c = 0; c < res; c++) {
        svg.append('rect')
          .attr('x', c * cellSize).attr('y', size - (r + 1) * cellSize)
          .attr('width', cellSize + 0.5).attr('height', cellSize + 0.5)
          .attr('fill', grid[r][c] === 1 ? C.bg1 : C.bg0);
      }
    }
    function plotPts(pts, color) {
      pts.forEach(function (p) {
        svg.append('circle')
          .attr('cx', scale(p[0]))
          .attr('cy', size - scale(p[1]))
          .attr('r', 2)
          .attr('fill', color).attr('opacity', 0.85);
      });
    }
    plotPts(DN.X0, C.c0);
    plotPts(DN.X1, C.c1);
  }

  renderBoundary('#boundary-linear', DN.Zlin);
  renderBoundary('#boundary-nn', DN.Znn);
  document.getElementById('acc-linear').textContent = (DN.acc_lin * 100).toFixed(0) + '%';
  document.getElementById('acc-nn').textContent = (DN.acc_nn * 100).toFixed(0) + '%';

  // ============================================================
  // TAB 2: DELTA PROPAGATION
  // ============================================================
  var delta2Slider = document.getElementById('delta2-slider');
  var delta2Val = document.getElementById('delta2-value');

  function renderDeltaProp() {
    var delta2 = parseFloat(delta2Slider.value);
    delta2Val.textContent = delta2.toFixed(2);
    var weights = D.deltaProp.weights12;
    var delta1 = weights.map(function (w) { return delta2 * w; });

    var svg = d3.select('#delta-prop-chart');
    svg.selectAll('*').remove();
    var W = 600, H = 260, margin = { top: 20, right: 20, bottom: 40, left: 45 };
    var iw = W - margin.left - margin.right, ih = H - margin.top - margin.bottom;
    var labels = weights.map(function (w, i) { return 'node ' + (i + 1); });
    var x = d3.scaleBand().domain(labels).range([0, iw]).padding(0.3);
    var maxAbs = Math.max(0.3, d3.max(delta1, Math.abs));
    var y = d3.scaleLinear().domain([-maxAbs, maxAbs]).range([ih, 0]);
    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    g.append('g').attr('transform', 'translate(0,' + y(0) + ')').call(d3.axisBottom(x)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.append('g').call(d3.axisLeft(y).ticks(5)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);
    labels.forEach(function (lab, i) {
      var v = delta1[i];
      g.append('rect').attr('x', x(lab)).attr('y', y(Math.max(0, v))).attr('width', x.bandwidth())
        .attr('height', Math.abs(y(v) - y(0))).attr('fill', v >= 0 ? C.accent : C.danger);
      g.append('text').attr('x', x(lab) + x.bandwidth() / 2).attr('y', v >= 0 ? y(v) - 6 : y(v) + 16)
        .attr('text-anchor', 'middle').attr('fill', C.text_primary).style('font-size', '11px').style('font-weight', 700)
        .text(v.toFixed(3));
    });

    var trace = document.getElementById('delta-prop-trace');
    trace.innerHTML = weights.map(function (w, i) {
      return '<div>&delta;<sup>(1)</sup><sub>' + (i + 1) + '</sub> = &delta;<sup>(2)</sup> &times; w<sub>' + (i + 1) + '</sub> = ' +
        delta2.toFixed(2) + ' &times; ' + w.toFixed(1) + ' = <strong>' + delta1[i].toFixed(3) + '</strong></div>';
    }).join('');
  }
  if (delta2Slider) {
    delta2Slider.addEventListener('input', renderDeltaProp);
    renderDeltaProp();
  }

  // ============================================================
  // TAB 3: ACTIVATION FUNCTIONS
  // ============================================================
  function relu(x) { return Math.max(0, x); }
  function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
  function tanhFn(x) { return Math.tanh(x); }

  function renderActivations() {
    var svg = d3.select('#activation-plot');
    svg.selectAll('*').remove();
    var W = 640, H = 320, margin = { top: 20, right: 20, bottom: 35, left: 45 };
    var iw = W - margin.left - margin.right, ih = H - margin.top - margin.bottom;
    var x = d3.scaleLinear().domain([-5, 5]).range([0, iw]);
    var y = d3.scaleLinear().domain([-1.5, 5]).range([ih, 0]);
    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    g.append('g').attr('transform', 'translate(0,' + y(0) + ')').call(d3.axisBottom(x)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.append('g').call(d3.axisLeft(y).ticks(6)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);

    var fns = [
      { fn: relu, color: D.activations.relu.color },
      { fn: sigmoid, color: D.activations.sigmoid.color },
      { fn: tanhFn, color: D.activations.tanh.color }
    ];
    fns.forEach(function (item) {
      var data = d3.range(-5, 5.01, 0.1).map(function (xv) { return { x: xv, y: item.fn(xv) }; });
      var line = d3.line().x(function (d) { return x(d.x); }).y(function (d) { return y(d.y); }).curve(d3.curveMonotoneX);
      g.append('path').datum(data).attr('fill', 'none').attr('stroke', item.color).attr('stroke-width', 2.5).attr('d', line);
    });
  }
  renderActivations();

})();

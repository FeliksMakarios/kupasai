/*
 * KupasAI - Logistic Regression Visualization
 * ML INF24042 - Week 4
 *
 * Two panels:
 *   1. Decision Boundary (real Iris setosa vs versicolor)
 *   2. Fungsi Sigmoid + kalkulator prediksi interaktif
 */

(function () {
  'use strict';

  var D = LOGREG_DATA;
  var IS_DARK = document.documentElement.getAttribute('data-theme') === 'dark';
  var C = IS_DARK ? {
    text_muted: '#8b949e',
    text_primary: '#e6edf3',
    axis: '#30363d',
    accent: '#58a6ff',
    c0: '#d29922',
    c1: '#58a6ff',
    viz_bg: '#161b22',
  } : {
    text_muted: '#656d76',
    text_primary: '#1f2328',
    axis: '#d0d7de',
    accent: '#0969da',
    c0: '#9a6700',
    c1: '#0969da',
    viz_bg: '#ffffff',
  };

  // ============================================================
  // TAB SWITCHING
  // ============================================================

  var tabBtns = document.querySelectorAll('.tab-btn');
  var tabContents = document.querySelectorAll('.tab-content');

  function activateTab(btn) {
    var target = btn.getAttribute('data-tab');
    tabBtns.forEach(function (b) {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
      b.setAttribute('tabindex', '-1');
    });
    tabContents.forEach(function (c) { c.classList.remove('active'); });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    btn.setAttribute('tabindex', '0');
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
  // TAB 1: DECISION BOUNDARY
  // ============================================================

  function initBoundary() {
    var svg = d3.select('#boundary-plot');
    var W = 700, H = 460;
    var margin = { top: 20, right: 20, bottom: 45, left: 55 };
    var innerW = W - margin.left - margin.right;
    var innerH = H - margin.top - margin.bottom;

    var x = d3.scaleLinear().domain(D.x_range).range([0, innerW]);
    var y = d3.scaleLinear().domain(D.y_range).range([innerH, 0]);
    var colorScale = d3.scaleLinear().domain([0, 0.5, 1]).range([C.c0, C.viz_bg, C.c1]);

    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // probability background grid
    var n = D.grid_n;
    var cellW = innerW / n, cellH = innerH / n;
    var xs = d3.range(n).map(function (i) { return D.x_range[0] + (D.x_range[1] - D.x_range[0]) * i / (n - 1); });
    var ys = d3.range(n).map(function (i) { return D.y_range[0] + (D.y_range[1] - D.y_range[0]) * i / (n - 1); });

    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        g.append('rect')
          .attr('x', x(xs[c]) - cellW / 2)
          .attr('y', y(ys[r]) - cellH / 2)
          .attr('width', cellW + 0.5)
          .attr('height', cellH + 0.5)
          .attr('fill', colorScale(D.proba_grid[r][c]))
          .attr('opacity', 0.55);
      }
    }

    g.append('g').attr('transform', 'translate(0,' + innerH + ')')
      .call(d3.axisBottom(x).ticks(6)).selectAll('text').style('fill', C.text_muted);
    g.append('g').call(d3.axisLeft(y).ticks(6)).selectAll('text').style('fill', C.text_muted);
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);

    g.append('text').attr('x', innerW / 2).attr('y', innerH + 38).attr('text-anchor', 'middle')
      .style('fill', C.text_muted).style('font-size', '11px').text(D.feature_names[0]);
    g.append('text').attr('x', -innerH / 2).attr('y', -40).attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle').style('fill', C.text_muted).style('font-size', '11px').text(D.feature_names[1]);

    g.selectAll('.pt').data(D.points).enter().append('circle')
      .attr('class', 'pt')
      .attr('cx', function (d) { return x(d.x); })
      .attr('cy', function (d) { return y(d.y); })
      .attr('r', function (d) { return d.test ? 5.5 : 4; })
      .attr('fill', function (d) { return d.label === 0 ? C.c0 : C.c1; })
      .attr('stroke', function (d) { return d.test ? C.text_primary : 'none'; })
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.9);

    document.getElementById('lr-accuracy').textContent = (D.accuracy * 100).toFixed(1) + '%';
    var cm = D.confusion_matrix;
    document.getElementById('lr-cm').textContent =
      cm[0][0] + ' / ' + cm[0][1] + ' / ' + cm[1][0] + ' / ' + cm[1][1];
  }

  // ============================================================
  // TAB 2: SIGMOID + KALKULATOR
  // ============================================================

  function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }

  function initSigmoid() {
    var svg = d3.select('#sigmoid-plot');
    var W = 500, H = 260;
    var margin = { top: 15, right: 15, bottom: 30, left: 40 };
    var innerW = W - margin.left - margin.right;
    var innerH = H - margin.top - margin.bottom;

    var x = d3.scaleLinear().domain([-8, 8]).range([0, innerW]);
    var y = d3.scaleLinear().domain([0, 1]).range([innerH, 0]);

    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    g.append('g').attr('transform', 'translate(0,' + innerH + ')')
      .call(d3.axisBottom(x).ticks(5)).selectAll('text').style('fill', C.text_muted).style('font-size', '9px');
    g.append('g').call(d3.axisLeft(y).ticks(5)).selectAll('text').style('fill', C.text_muted).style('font-size', '9px');
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);

    g.append('line').attr('x1', 0).attr('x2', innerW).attr('y1', y(0.5)).attr('y2', y(0.5))
      .attr('stroke', C.axis).attr('stroke-dasharray', '3 3');

    var curve = d3.range(-8, 8.05, 0.1).map(function (z) { return { z: z, p: sigmoid(z) }; });
    var line = d3.line().x(function (d) { return x(d.z); }).y(function (d) { return y(d.p); });
    g.append('path').datum(curve).attr('d', line).attr('fill', 'none').attr('stroke', C.accent).attr('stroke-width', 2.5);

    var marker = g.append('circle').attr('r', 6).attr('fill', C.c1).attr('stroke', C.viz_bg).attr('stroke-width', 2);

    var x1s = document.getElementById('feat-x1');
    var x2s = document.getElementById('feat-x2');
    var xr = [
      Math.min.apply(null, D.points.map(function (p) { return p.x; })),
      Math.max.apply(null, D.points.map(function (p) { return p.x; })),
    ];
    var yr = [
      Math.min.apply(null, D.points.map(function (p) { return p.y; })),
      Math.max.apply(null, D.points.map(function (p) { return p.y; })),
    ];
    x1s.min = xr[0]; x1s.max = xr[1]; x1s.step = 0.1; x1s.value = ((xr[0] + xr[1]) / 2).toFixed(1);
    x2s.min = yr[0]; x2s.max = yr[1]; x2s.step = 0.1; x2s.value = ((yr[0] + yr[1]) / 2).toFixed(1);

    function update() {
      var x1 = +x1s.value, x2 = +x2s.value;
      var z = D.b + D.w[0] * x1 + D.w[1] * x2;
      var p = sigmoid(z);
      document.getElementById('feat-x1-val').textContent = x1.toFixed(1);
      document.getElementById('feat-x2-val').textContent = x2.toFixed(1);
      marker.attr('cx', x(Math.max(-8, Math.min(8, z)))).attr('cy', y(p));
      var pred = p > 0.5 ? D.class_names[1] : D.class_names[0];
      document.getElementById('sigmoid-result').innerHTML =
        '<span class="formula">z = ' + D.b.toFixed(2) + ' + (' + D.w[0].toFixed(2) + ')&times;' + x1.toFixed(1) +
        ' + (' + D.w[1].toFixed(2) + ')&times;' + x2.toFixed(1) + ' = ' + z.toFixed(2) + '</span><br>' +
        'P(versicolor) = sigmoid(z) = <strong>' + p.toFixed(3) + '</strong> &rarr; prediksi: <strong>' + pred + '</strong>';
    }

    x1s.addEventListener('input', update);
    x2s.addEventListener('input', update);
    update();
  }

  initBoundary();
  initSigmoid();
})();

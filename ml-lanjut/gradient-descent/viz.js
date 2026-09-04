/*
 * KupasAI - Gradient Descent Visualization
 * ML Lanjut IN F24141 - Week 3
 */

(function () {
  'use strict';

  var D = GD_DATA;
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
  // GENERIC LINE CHART
  // ============================================================
  function lineChart(svgSel, series, opts) {
    opts = opts || {};
    var svg = d3.select(svgSel);
    svg.selectAll('*').remove();
    var W = opts.w || 640, H = opts.h || 320;
    var margin = { top: 20, right: 20, bottom: 35, left: 55 };
    var iw = W - margin.left - margin.right, ih = H - margin.top - margin.bottom;

    var allPoints = [];
    series.forEach(function (s) { s.data.forEach(function (d) { allPoints.push(d); }); });
    var xMax = d3.max(allPoints, function (d) { return d.x; });
    var yMax = opts.yMax !== undefined ? opts.yMax : d3.max(allPoints, function (d) { return d.y; });
    var yScaleType = opts.logY ? d3.scaleLog() : d3.scaleLinear();
    var x = d3.scaleLinear().domain([opts.xMin || 1, xMax]).range([0, iw]);
    var yMin = opts.logY ? Math.max(1e-6, d3.min(allPoints, function(d){return d.y;})) : 0;
    var y = yScaleType.domain([opts.logY ? yMin : 0, yMax || 1]).range([ih, 0]).nice();

    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    g.append('g').attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(5).tickSize(-iw).tickFormat(''))
      .selectAll('line').attr('stroke', C.grid);
    g.selectAll('.grid path').attr('stroke', 'none');

    g.append('g').attr('transform', 'translate(0,' + ih + ')')
      .call(d3.axisBottom(x).ticks(Math.min(xMax, 10)).tickFormat(d3.format('d')))
      .selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.append('g').call(d3.axisLeft(y).ticks(5, opts.logY ? '~g' : undefined))
      .selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);

    var line = d3.line()
      .x(function (d) { return x(d.x); })
      .y(function (d) { return y(Math.max(d.y, yMin || 0)); })
      .curve(d3.curveMonotoneX);

    series.forEach(function (s) {
      g.append('path').datum(s.data)
        .attr('fill', 'none').attr('stroke', s.color)
        .attr('stroke-width', 2.5).attr('d', line);
      g.selectAll('.dot-' + s.key).data(s.data).enter().append('circle')
        .attr('cx', function (d) { return x(d.x); })
        .attr('cy', function (d) { return y(Math.max(d.y, yMin || 0)); })
        .attr('r', 3).attr('fill', s.color);
    });

    // axis labels
    svg.append('text').attr('x', W / 2).attr('y', H - 2).attr('text-anchor', 'middle')
      .attr('fill', C.text_muted).style('font-size', '10px').text(opts.xLabel || 'Iterasi');
    svg.append('text').attr('transform', 'rotate(-90)').attr('x', -H / 2).attr('y', 14)
      .attr('text-anchor', 'middle').attr('fill', C.text_muted).style('font-size', '10px').text(opts.yLabel || 'Error');
  }

  // ============================================================
  // TAB 1: HOT & COLD vs GRADIENT DESCENT
  // ============================================================
  function renderCompare() {
    var hc = D.compare.hot_cold.map(function (d) { return { x: d.iter, y: d.error }; });
    var gd = D.compare.gd.map(function (d) { return { x: d.iter, y: d.error }; });
    lineChart('#gd-compare-plot', [
      { key: 'hc', data: hc, color: C.danger },
      { key: 'gd', data: gd, color: C.accent }
    ], { yMax: 0.31, xLabel: 'Iterasi', yLabel: 'Error (MSE)' });
  }
  renderCompare();

  // ============================================================
  // TAB 2: ONE ITERATION STEP TRACE
  // ============================================================
  var stepList = document.getElementById('step-trace-list');
  if (stepList) {
    D.oneIteration.steps.forEach(function (s) {
      var div = document.createElement('div');
      div.className = 'step-trace-item';
      div.innerHTML = '<span class="step-name">' + s.name + '</span>' +
        '<span class="step-formula">' + s.formula + '</span>' +
        '<span class="step-value">' + s.value + '</span>';
      stepList.appendChild(div);
    });
    document.getElementById('err-before').textContent = D.oneIteration.errorBefore;
    document.getElementById('err-after').textContent = D.oneIteration.errorAfter;
  }

  // ============================================================
  // TAB 3: ALPHA & DIVERGENCE (live simulation in JS, matches notebook formula)
  // ============================================================
  var alphaSlider = document.getElementById('alpha-slider');
  var inputSlider = document.getElementById('input-slider');
  var alphaVal = document.getElementById('alpha-value');
  var inputVal = document.getElementById('input-value');
  var warnBox = document.getElementById('divergence-warning');
  var presetBtns = document.querySelectorAll('.preset-btn');

  function simulate(weight0, goal, input, alpha, iters) {
    var w = weight0;
    var out = [];
    for (var i = 1; i <= iters; i++) {
      var pred = input * w;
      var error = Math.pow(pred - goal, 2);
      out.push({ x: i, y: error });
      var delta = pred - goal;
      var derivative = input * delta;
      w = w - alpha * derivative;
      if (!isFinite(w) || Math.abs(w) > 1e6) break;
    }
    return out;
  }

  function renderAlphaTab() {
    var alpha = parseFloat(alphaSlider.value);
    var input = parseFloat(inputSlider.value);
    alphaVal.textContent = alpha.toFixed(2);
    inputVal.textContent = input.toFixed(2);
    var data = simulate(0.5, 0.8, input, alpha, 20);
    var lastErr = data.length ? data[data.length - 1].y : 0;
    var diverging = lastErr > 1 || data.length < 20;
    warnBox.classList.toggle('show', diverging);
    if (diverging) {
      warnBox.textContent = 'Error meledak (divergence)! Coba turunkan alpha atau input.';
    }
    lineChart('#gd-alpha-plot', [{ key: 'a', data: data, color: diverging ? C.danger : C.success }], {
      logY: true, yMax: Math.max(1, d3.max(data, function (d) { return d.y; }) || 1),
      xLabel: 'Iterasi', yLabel: 'Error (skala log)'
    });
  }

  if (alphaSlider) {
    alphaSlider.addEventListener('input', function () { renderAlphaTab(); clearPresetActive(); });
    inputSlider.addEventListener('input', function () { renderAlphaTab(); clearPresetActive(); });
  }

  function clearPresetActive() {
    presetBtns.forEach(function (b) { b.classList.remove('active'); });
  }

  presetBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      presetBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      inputSlider.value = btn.getAttribute('data-input');
      alphaSlider.value = btn.getAttribute('data-alpha');
      renderAlphaTab();
    });
  });

  if (alphaSlider) {
    presetBtns[0].classList.add('active');
    inputSlider.value = presetBtns[0].getAttribute('data-input');
    alphaSlider.value = presetBtns[0].getAttribute('data-alpha');
    renderAlphaTab();
  }

})();

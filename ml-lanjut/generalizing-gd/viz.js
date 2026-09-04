/*
 * KupasAI - Generalizing Gradient Descent Visualization
 * ML Lanjut IN F24141 - Week 4
 */

(function () {
  'use strict';

  var D = GGD_DATA;
  var IS_DARK = document.documentElement.getAttribute('data-theme') === 'dark';
  var C = IS_DARK ? {
    text_muted: '#8b949e', text_primary: '#e6edf3', axis: '#30363d',
    accent: '#58a6ff', danger: '#f85149', success: '#3fb950', node_bg: '#161b22', grid: '#21262d',
  } : {
    text_muted: '#656d76', text_primary: '#1f2328', axis: '#d0d7de',
    accent: '#0969da', danger: '#cf222e', success: '#1a7f37', node_bg: '#ffffff', grid: '#eaeef2',
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
  // TAB 1: MULTI INPUT (normal vs frozen)
  // ============================================================
  var miMode = 'normal';
  var miModeBtns = document.querySelectorAll('.mi-mode-btn');
  var miTableBody = document.querySelector('#mi-table tbody');
  var miNote = document.getElementById('mi-note');

  function renderMultiInput() {
    var scenario = D.multiInput[miMode];
    var labels = D.multiInput.inputLabels;
    miNote.textContent = miMode === 'frozen'
      ? 'alpha=' + scenario.alpha + '. ' + scenario.note
      : 'alpha=' + scenario.alpha + '. Semua bobot diperbarui secara normal.';
    miTableBody.innerHTML = '';
    scenario.iters.forEach(function (row) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>Iterasi ' + row.iter + '</td>' +
        '<td>' + row.pred.toFixed(6) + '</td>' +
        '<td>' + row.error.toFixed(6) + '</td>' +
        '<td>[' + row.weights.map(function (w) { return w.toFixed(5); }).join(', ') + ']</td>';
      miTableBody.appendChild(tr);
    });

    // bar chart: weight trajectories across iterations
    var svg = d3.select('#mi-chart');
    svg.selectAll('*').remove();
    var W = 640, H = 260, margin = { top: 20, right: 20, bottom: 30, left: 45 };
    var iw = W - margin.left - margin.right, ih = H - margin.top - margin.bottom;
    var allW = [scenario.weights0].concat(scenario.iters.map(function (r) { return r.weights; }));
    var x = d3.scaleLinear().domain([0, allW.length - 1]).range([0, iw]);
    var yMin = d3.min(allW, function (ws) { return d3.min(ws); });
    var yMax = d3.max(allW, function (ws) { return d3.max(ws); });
    var y = d3.scaleLinear().domain([Math.min(yMin, 0) - 0.02, yMax + 0.02]).range([ih, 0]).nice();
    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    g.append('g').call(d3.axisLeft(y).ticks(5)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.append('g').attr('transform', 'translate(0,' + y(0) + ')').call(d3.axisBottom(x).ticks(allW.length).tickFormat(function (d) { return d === 0 ? 'awal' : 'iter ' + d; }))
      .selectAll('text').attr('fill', C.text_muted).style('font-size', '9px');
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);
    var colors = [C.accent, C.success, C.danger];
    labels.forEach(function (lab, wi) {
      var data = allW.map(function (ws, i) { return { x: i, y: ws[wi] }; });
      var line = d3.line().x(function (d) { return x(d.x); }).y(function (d) { return y(d.y); }).curve(d3.curveMonotoneX);
      g.append('path').datum(data).attr('fill', 'none').attr('stroke', colors[wi]).attr('stroke-width', 2.5).attr('d', line);
      g.selectAll('.dot' + wi).data(data).enter().append('circle')
        .attr('cx', function (d) { return x(d.x); }).attr('cy', function (d) { return y(d.y); })
        .attr('r', 3.5).attr('fill', colors[wi]);
    });
    // legend
    var legend = svg.append('g').attr('transform', 'translate(' + (margin.left + 5) + ',12)');
    labels.forEach(function (lab, i) {
      var lg = legend.append('g').attr('transform', 'translate(' + (i * 90) + ',0)');
      lg.append('rect').attr('width', 12).attr('height', 3).attr('y', -3).attr('fill', colors[i]);
      lg.append('text').attr('x', 16).attr('y', 0).attr('fill', C.text_secondary || C.text_muted).style('font-size', '10px').text(lab);
    });
  }

  miModeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      miModeBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      miMode = btn.getAttribute('data-mode');
      renderMultiInput();
    });
  });
  renderMultiInput();

  // ============================================================
  // TAB 2: MULTI OUTPUT
  // ============================================================
  function renderMultiOutput() {
    var mo = D.multiOutput;
    var svg = d3.select('#mo-chart');
    svg.selectAll('*').remove();
    var W = 640, H = 300, margin = { top: 30, right: 20, bottom: 40, left: 45 };
    var iw = W - margin.left - margin.right, ih = H - margin.top - margin.bottom;
    var groups = mo.outputLabels;
    var x0 = d3.scaleBand().domain(groups).range([0, iw]).padding(0.3);
    var x1 = d3.scaleBand().domain(['true', 'pred']).range([0, x0.bandwidth()]).padding(0.15);
    var yMax = Math.max(d3.max(mo.true_), d3.max(mo.pred)) * 1.15;
    var y = d3.scaleLinear().domain([0, yMax]).range([ih, 0]);
    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    g.append('g').call(d3.axisLeft(y).ticks(5)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.append('g').attr('transform', 'translate(0,' + ih + ')').call(d3.axisBottom(x0)).selectAll('text').attr('fill', C.text_muted).style('font-size', '11px');
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);

    groups.forEach(function (lab, i) {
      var gg = g.append('g').attr('transform', 'translate(' + x0(lab) + ',0)');
      var vals = [{ k: 'true', v: mo.true_[i], color: C.text_muted }, { k: 'pred', v: mo.pred[i], color: C.accent }];
      vals.forEach(function (v) {
        gg.append('rect').attr('x', x1(v.k)).attr('y', y(v.v)).attr('width', x1.bandwidth())
          .attr('height', ih - y(v.v)).attr('fill', v.color);
        gg.append('text').attr('class', 'bar-value').attr('x', x1(v.k) + x1.bandwidth() / 2).attr('y', y(v.v) - 4)
          .attr('text-anchor', 'middle').attr('fill', C.text_primary).text(v.v.toFixed(3));
      });
    });
    var legend = svg.append('g').attr('transform', 'translate(' + margin.left + ',12)');
    [['true (target)', C.text_muted], ['pred (prediksi)', C.accent]].forEach(function (item, i) {
      var lg = legend.append('g').attr('transform', 'translate(' + (i * 140) + ',0)');
      lg.append('rect').attr('width', 12).attr('height', 12).attr('fill', item[1]);
      lg.append('text').attr('x', 16).attr('y', 10).style('font-size', '10px').attr('fill', C.text_muted).text(item[0]);
    });

    var tbody = document.getElementById('mo-table-body');
    if (tbody) {
      tbody.innerHTML = '';
      groups.forEach(function (lab, i) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + lab + '</td><td>' + mo.delta[i].toFixed(3) + '</td>' +
          '<td>' + mo.weight_deltas[i].toFixed(5) + '</td><td>' + mo.weights1[i].toFixed(6) + '</td>';
        tbody.appendChild(tr);
      });
    }
  }
  renderMultiOutput();

  // ============================================================
  // TAB 3: MULTI IN/OUT MATRIX HEATMAP
  // ============================================================
  function renderMatrix(svgSel, matrix, rowLabels, colLabels, title) {
    var svg = d3.select(svgSel);
    svg.selectAll('*').remove();
    var cell = 62, padTop = 30, padLeft = 60;
    var W = padLeft + colLabels.length * cell + 10, H = padTop + rowLabels.length * cell + 10;
    svg.attr('viewBox', '0 0 ' + W + ' ' + H);
    var flat = [];
    matrix.forEach(function (row) { row.forEach(function (v) { flat.push(v); }); });
    var maxAbs = d3.max(flat, Math.abs) || 1;
    var color = d3.scaleLinear().domain([-maxAbs, 0, maxAbs]).range([C.danger, IS_DARK ? '#21262d' : '#f6f8fa', C.success]);

    colLabels.forEach(function (lab, ci) {
      svg.append('text').attr('class', 'matrix-cell-label').attr('x', padLeft + ci * cell + cell / 2).attr('y', padTop - 10)
        .attr('text-anchor', 'middle').text(lab);
    });
    rowLabels.forEach(function (lab, ri) {
      svg.append('text').attr('class', 'matrix-cell-label').attr('x', padLeft - 8).attr('y', padTop + ri * cell + cell / 2 + 3)
        .attr('text-anchor', 'end').text(lab);
    });
    matrix.forEach(function (row, ri) {
      row.forEach(function (v, ci) {
        var gx = padLeft + ci * cell, gy = padTop + ri * cell;
        svg.append('rect').attr('x', gx).attr('y', gy).attr('width', cell - 4).attr('height', cell - 4)
          .attr('rx', 4).attr('fill', color(v)).attr('stroke', C.axis);
        svg.append('text').attr('class', 'matrix-cell-value').attr('x', gx + (cell - 4) / 2).attr('y', gy + (cell - 4) / 2 + 4)
          .attr('text-anchor', 'middle').attr('fill', Math.abs(v) > maxAbs * 0.55 ? '#fff' : C.text_primary)
          .text(v.toFixed(3));
      });
    });
  }

  function renderMio() {
    var mio = D.multiInOut;
    renderMatrix('#mio-before', mio.weights0, mio.inputLabels, mio.outputLabels);
    renderMatrix('#mio-after', mio.weights1, mio.inputLabels, mio.outputLabels);
    var trace = document.getElementById('mio-trace');
    trace.innerHTML = [
      'pred = [' + mio.pred.map(function (v) { return v.toFixed(3); }).join(', ') + ']  (target: [' + mio.true_.join(', ') + '])',
      'delta = [' + mio.delta.map(function (v) { return v.toFixed(3); }).join(', ') + ']',
      'weight_delta[i][j] = input[i] &times; delta[j] &nbsp;&rarr;&nbsp; weight[i][j] &minus;= alpha &times; weight_delta[i][j] &nbsp;(alpha=' + mio.alpha + ')'
    ].map(function (l) { return '<div>' + l + '</div>'; }).join('');
  }
  renderMio();

})();

/*
 * KupasAI - Linear Regression Visualization
 * ML INF24042 - Week 3
 *
 * Two panels:
 *   1. Simple Linear Regression (bensin.csv) - scatter + fitted line + predictor
 *   2. Multiple Regression & korelasi (MLG_data.csv)
 */

(function () {
  'use strict';

  var D = LR_DATA;
  var IS_DARK = document.documentElement.getAttribute('data-theme') === 'dark';
  var C = IS_DARK ? {
    text_muted: '#8b949e',
    text_primary: '#e6edf3',
    axis: '#30363d',
    grid: '#21262d',
    accent: '#58a6ff',
    pos: '#3fb950',
    neg: '#f85149',
    dot: '#8b949e',
    viz_bg: '#161b22',
  } : {
    text_muted: '#656d76',
    text_primary: '#1f2328',
    axis: '#d0d7de',
    grid: '#eaeef2',
    accent: '#0969da',
    pos: '#1a7f37',
    neg: '#cf222e',
    dot: '#8b949e',
    viz_bg: '#f6f8fa',
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
  // TAB 1: SIMPLE LINEAR REGRESSION
  // ============================================================

  function initSimple() {
    var svg = d3.select('#simple-plot');
    var W = 700, H = 420;
    var margin = { top: 20, right: 20, bottom: 45, left: 55 };
    var innerW = W - margin.left - margin.right;
    var innerH = H - margin.top - margin.bottom;

    var s = D.simple;
    var xPad = (s.x_max - s.x_min) * 0.08;
    var yPad = (s.y_max - s.y_min) * 0.08;

    var x = d3.scaleLinear().domain([s.x_min - xPad, s.x_max + xPad]).range([0, innerW]);
    var y = d3.scaleLinear().domain([s.y_min - yPad, s.y_max + yPad]).range([innerH, 0]);

    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    g.append('g').attr('transform', 'translate(0,' + innerH + ')')
      .call(d3.axisBottom(x).ticks(6)).selectAll('text').style('fill', C.text_muted);
    g.append('g').call(d3.axisLeft(y).ticks(6)).selectAll('text').style('fill', C.text_muted);
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);

    g.append('text').attr('x', innerW / 2).attr('y', innerH + 38).attr('text-anchor', 'middle')
      .style('fill', C.text_muted).style('font-size', '11px').text('Liter');
    g.append('text').attr('x', -innerH / 2).attr('y', -40).attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle').style('fill', C.text_muted).style('font-size', '11px').text('Kilometer');

    // scatter points
    g.selectAll('.pt').data(s.points).enter().append('circle')
      .attr('class', 'pt')
      .attr('cx', function (d) { return x(d.x); })
      .attr('cy', function (d) { return y(d.y); })
      .attr('r', 3.5)
      .attr('fill', C.dot)
      .attr('opacity', 0.65);

    // regression line
    var lineX0 = s.x_min - xPad, lineX1 = s.x_max + xPad;
    g.append('line')
      .attr('x1', x(lineX0)).attr('y1', y(s.slope * lineX0 + s.intercept))
      .attr('x2', x(lineX1)).attr('y2', y(s.slope * lineX1 + s.intercept))
      .attr('stroke', C.accent).attr('stroke-width', 2.5);

    // predicted point marker
    var predDot = g.append('circle').attr('r', 6).attr('fill', C.pos).attr('stroke', C.viz_bg).attr('stroke-width', 2);
    var predLineY = g.append('line').attr('stroke', C.pos).attr('stroke-dasharray', '4 3').attr('stroke-width', 1.5);
    var predLineX = g.append('line').attr('stroke', C.pos).attr('stroke-dasharray', '4 3').attr('stroke-width', 1.5);

    function updatePrediction(liter) {
      var pred = s.slope * liter + s.intercept;
      predDot.attr('cx', x(liter)).attr('cy', y(pred));
      predLineX.attr('x1', x(liter)).attr('x2', x(liter)).attr('y1', y(pred)).attr('y2', innerH);
      predLineY.attr('x1', 0).attr('x2', x(liter)).attr('y1', y(pred)).attr('y2', y(pred));
      document.getElementById('predict-liter-value').textContent = liter;
      document.getElementById('predict-result').innerHTML =
        liter + ' liter &rarr; prediksi <strong>' + pred.toFixed(1) + ' km</strong>';
    }

    var slider = document.getElementById('predict-liter');
    slider.min = Math.floor(s.x_min);
    slider.max = Math.ceil(s.x_max);
    slider.value = Math.round((s.x_min + s.x_max) / 2);
    slider.addEventListener('input', function () { updatePrediction(+this.value); });
    updatePrediction(+slider.value);

    document.getElementById('lr-slope').textContent = s.slope.toFixed(3);
    document.getElementById('lr-intercept').textContent = s.intercept.toFixed(3);
    document.getElementById('lr-r2').textContent = s.r2.toFixed(3);
  }

  // ============================================================
  // TAB 2: MULTIPLE REGRESSION + CORRELATION
  // ============================================================

  function renderModel(key) {
    var m = D.multi[key];
    var terms = m.features.map(function (f, i) {
      var coef = m.coef[i];
      var sign = coef >= 0 ? '+' : '-';
      return sign + ' ' + Math.abs(coef).toFixed(3) + '&times;' + f;
    }).join(' ');
    document.getElementById('model-formula').innerHTML =
      'Kilometer = ' + m.intercept.toFixed(3) + ' ' + terms;
    document.getElementById('model-r2').innerHTML = 'R&sup2; pada test set: <strong>' + m.r2.toFixed(4) + '</strong>';
  }

  document.querySelectorAll('.model-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.model-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      renderModel(btn.getAttribute('data-model'));
    });
  });

  function renderCorrTable() {
    var cols = D.corr.columns;
    var vals = D.corr.values;
    var wrap = document.getElementById('corr-table');
    var html = '<table class="corr-table"><thead><tr><th></th>';
    cols.forEach(function (c) { html += '<th>' + c + '</th>'; });
    html += '</tr></thead><tbody>';
    cols.forEach(function (rowName, i) {
      html += '<tr><th>' + rowName + '</th>';
      vals[i].forEach(function (v) {
        var mag = Math.abs(v);
        var color = v >= 0 ? C.accent : C.neg;
        var bg = colorMix(color, mag);
        var textColor = mag > 0.55 ? '#ffffff' : C.text_primary;
        html += '<td style="background:' + bg + ';color:' + textColor + '">' + v.toFixed(2) + '</td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    wrap.innerHTML = html;
  }

  function colorMix(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + Math.max(0.08, alpha) + ')';
  }

  initSimple();
  renderModel('2');
  document.querySelector('.model-btn[data-model="2"]').classList.add('active');
  renderCorrTable();
})();

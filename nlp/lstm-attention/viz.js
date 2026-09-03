/*
 * KupasAI - Gated Recurrent Models (LSTM/GRU) & Classical Attention Visualization
 * NLP INF20161 - Week 4
 *
 * Two panels:
 *   1. LSTM vs GRU: perbandingan gerbang memori langsung berdampingan
 *   2. Classical (encoder-decoder) Attention: alignment score & context vector
 */

(function () {
  'use strict';

  var D = GATED_DATA;
  var IS_DARK = document.documentElement.getAttribute('data-theme') === 'dark';
  var C = IS_DARK ? {
    text_muted: '#8b949e', text_primary: '#e6edf3', axis: '#30363d',
    accent: '#58a6ff', success: '#3fb950', dot: '#8b949e',
  } : {
    text_muted: '#656d76', text_primary: '#1f2328', axis: '#d0d7de',
    accent: '#0969da', success: '#1a7f37', dot: '#8b949e',
  };

  function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }

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
  // TAB 1: LSTM vs GRU GATES
  // ============================================================

  function gateBar(id, label, formula, value, range) {
    var pct = range === 'tanh' ? ((value + 1) / 2) * 100 : value * 100;
    return '<div class="gate-card' + (id.indexOf('gru') === 0 ? ' gru' : '') + '">' +
      '<div class="gc-title"><span>' + label + '</span><span class="gc-formula">' + formula + '</span></div>' +
      '<div class="gc-track"><div class="gc-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="gc-val">' + value.toFixed(3) + '</div></div>';
  }

  function renderGates(x) {
    var L = D.lstm, w = L.w;
    var f = sigmoid(w.fx * x + w.fh * L.h_prev + w.bf);
    var i = sigmoid(w.ix * x + w.ih * L.h_prev + w.bi);
    var ctilde = Math.tanh(w.cx * x + w.ch * L.h_prev + w.bc);
    var c = f * L.c_prev + i * ctilde;
    var o = sigmoid(w.ox * x + w.oh * L.h_prev + w.bo);
    var h = o * Math.tanh(c);

    var lstmHtml = '';
    lstmHtml += gateBar('lstm-f', 'Forget gate (f)', 'σ(Wf·x+Uf·h+bf)', f, 'sig');
    lstmHtml += gateBar('lstm-i', 'Input gate (i)', 'σ(Wi·x+Ui·h+bi)', i, 'sig');
    lstmHtml += gateBar('lstm-c', 'Candidate (c̃)', 'tanh(Wc·x+Uc·h+bc)', ctilde, 'tanh');
    lstmHtml += gateBar('lstm-o', 'Output gate (o)', 'σ(Wo·x+Uo·h+bo)', o, 'sig');
    document.getElementById('lstm-gates').innerHTML = lstmHtml;
    document.getElementById('lstm-state').innerHTML =
      'c<sub>t</sub> = f&middot;c<sub>t-1</sub> + i&middot;c̃ = <strong>' + c.toFixed(3) + '</strong><br>' +
      'h<sub>t</sub> = o&middot;tanh(c<sub>t</sub>) = <strong>' + h.toFixed(3) + '</strong>';

    var G = D.gru, wg = G.w;
    var r = sigmoid(wg.rx * x + wg.rh * G.h_prev);
    var z = sigmoid(wg.zx * x + wg.zh * G.h_prev);
    var htilde = Math.tanh(wg.hx * x + r * wg.hh * G.h_prev);
    var hg = z * G.h_prev + (1 - z) * htilde;

    var gruHtml = '';
    gruHtml += gateBar('gru-r', 'Reset gate (r)', 'σ(Wr·x+Ur·h)', r, 'sig');
    gruHtml += gateBar('gru-z', 'Update gate (z)', 'σ(Wz·x+Uz·h)', z, 'sig');
    gruHtml += gateBar('gru-h', 'Candidate (h̃)', 'tanh(Wh·x+r·Uh·h)', htilde, 'tanh');
    document.getElementById('gru-gates').innerHTML = gruHtml;
    document.getElementById('gru-state').innerHTML =
      'h<sub>t</sub> = z&middot;h<sub>t-1</sub> + (1-z)&middot;h̃ = <strong>' + hg.toFixed(3) + '</strong>';
  }

  var xSlider = document.getElementById('x-slider');
  xSlider.addEventListener('input', function () {
    document.getElementById('x-value').textContent = (+this.value).toFixed(1);
    renderGates(+this.value);
  });
  renderGates(+xSlider.value);

  // ============================================================
  // TAB 2: CLASSICAL ATTENTION
  // ============================================================

  var A = D.attention;
  var attnSvg = d3.select('#attn-plot');

  function softmax(scores) {
    var max = Math.max.apply(null, scores);
    var exps = scores.map(function (s) { return Math.exp(s - max); });
    var sum = exps.reduce(function (a, b) { return a + b; }, 0);
    return exps.map(function (e) { return e / sum; });
  }

  function drawAttention(qx, qy) {
    var scores = A.encoder_states.map(function (h) { return h[0] * qx + h[1] * qy; });
    var weights = softmax(scores);
    var context = [0, 0];
    A.encoder_states.forEach(function (h, i) {
      context[0] += weights[i] * h[0];
      context[1] += weights[i] * h[1];
    });

    attnSvg.selectAll('*').remove();
    var W = 500, H = 380;
    var margin = { top: 20, right: 20, bottom: 40, left: 45 };
    var innerW = W - margin.left - margin.right;
    var innerH = H - margin.top - margin.bottom;

    var x = d3.scaleLinear().domain([-0.3, 2.1]).range([0, innerW]);
    var y = d3.scaleLinear().domain([-0.3, 2.1]).range([innerH, 0]);

    var g = attnSvg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    g.append('g').attr('transform', 'translate(0,' + innerH + ')').call(d3.axisBottom(x).ticks(5)).selectAll('text').style('fill', C.text_muted);
    g.append('g').call(d3.axisLeft(y).ticks(5)).selectAll('text').style('fill', C.text_muted);
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);

    // query direction arrow (from origin)
    var qScale = 1.8;
    g.append('line')
      .attr('x1', x(0)).attr('y1', y(0))
      .attr('x2', x(qx * qScale)).attr('y2', y(qy * qScale))
      .attr('stroke', C.text_muted).attr('stroke-width', 1.5).attr('stroke-dasharray', '4 3');

    // encoder state points
    A.encoder_states.forEach(function (h, i) {
      var r = 5 + weights[i] * 18;
      g.append('circle')
        .attr('cx', x(h[0])).attr('cy', y(h[1])).attr('r', r)
        .attr('fill', C.accent).attr('opacity', 0.35 + weights[i] * 0.6);
      g.append('text')
        .attr('x', x(h[0])).attr('y', y(h[1]) - r - 4)
        .attr('text-anchor', 'middle').style('fill', C.text_primary).style('font-size', '11px').style('font-weight', 600)
        .text(A.words[i]);
    });

    // context vector point
    g.append('circle')
      .attr('cx', x(context[0])).attr('cy', y(context[1])).attr('r', 7)
      .attr('fill', 'none').attr('stroke', C.success).attr('stroke-width', 2.5);
    g.append('text')
      .attr('x', x(context[0])).attr('y', y(context[1]) + 20)
      .attr('text-anchor', 'middle').style('fill', C.success).style('font-size', '11px').style('font-weight', 700)
      .text('context');

    // attention weight bars
    var maxW = Math.max.apply(null, weights);
    var barsHtml = '';
    A.words.forEach(function (word, i) {
      var pct = (weights[i] / maxW) * 100;
      barsHtml += '<div class="attn-word-card">' +
        '<div class="awc-bar-track"><div class="awc-bar-fill" style="height:' + pct + '%"></div></div>' +
        '<div class="awc-word">' + word + '</div>' +
        '<div class="awc-pct">' + (weights[i] * 100).toFixed(1) + '%</div></div>';
    });
    document.getElementById('attn-weights').innerHTML = barsHtml;
    document.getElementById('attn-context-val').textContent =
      '[' + context[0].toFixed(3) + ', ' + context[1].toFixed(3) + ']';
  }

  var qxSlider = document.getElementById('qx-slider');
  var qySlider = document.getElementById('qy-slider');

  function updateAttention() {
    var qx = +qxSlider.value, qy = +qySlider.value;
    document.getElementById('qx-value').textContent = qx.toFixed(1);
    document.getElementById('qy-value').textContent = qy.toFixed(1);
    drawAttention(qx, qy);
  }
  qxSlider.addEventListener('input', updateAttention);
  qySlider.addEventListener('input', updateAttention);
  updateAttention();
})();

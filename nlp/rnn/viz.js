/*
 * KupasAI - RNN Visualization
 * NLP INF20161 - Week 2-4
 *
 * Three interactive panels:
 *   1. Forward Pass step-by-step (RNN processes a sentence)
 *   2. Vanishing Gradient (RNN vs LSTM gradient decay)
 *   3. Sentence Representation Comparison (BoW vs Avg vs RNN)
 */

(function () {
  'use strict';

  var DATA = RNN_DATA;
  var IS_DARK = document.documentElement.getAttribute('data-theme') === 'dark';
  var COLORS = IS_DARK ? {
    input: '#58a6ff',
    hidden: '#3fb950',
    output_pos: '#3fb950',
    output_neg: '#f85149',
    rnn_grad: '#58a6ff',
    lstm_grad: '#3fb950',
    bg_dot: '#30363d',
    axis: '#30363d',
    grid: '#21262d',
    text_muted: '#8b949e',
    text_primary: '#e6edf3',
    accent: '#58a6ff',
    orange: '#d29922',
    viz_bg: '#161b22',
  } : {
    input: '#0969da',
    hidden: '#1a7f37',
    output_pos: '#1a7f37',
    output_neg: '#cf222e',
    rnn_grad: '#0969da',
    lstm_grad: '#1a7f37',
    bg_dot: '#d0d7de',
    axis: '#d0d7de',
    grid: '#eaeef2',
    text_muted: '#656d76',
    text_primary: '#1f2328',
    accent: '#0969da',
    orange: '#9a6700',
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
    btn.addEventListener('click', function () {
      activateTab(btn);
      btn.focus();
    });
    btn.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var next = e.key === 'ArrowRight' ? i + 1 : i - 1;
      if (next < 0) next = tabBtns.length - 1;
      if (next >= tabBtns.length) next = 0;
      var nextBtn = tabBtns[next];
      activateTab(nextBtn);
      nextBtn.focus();
    });
  });

  // ============================================================
  // TAB 1: FORWARD PASS
  // ============================================================

  function initForward() {
    var selectEl = document.getElementById('forward-sentence');
    var svg = d3.select('#forward-plot');
    var stepPrev = document.getElementById('step-prev');
    var stepNext = document.getElementById('step-next');
    var stepIndicator = document.getElementById('step-indicator');
    var stepDetail = document.getElementById('step-detail');

    var currentSentIdx = 0;
    var currentStep = 0;

    // Populate dropdown
    DATA.sentences.forEach(function (sent, i) {
      var opt = document.createElement('option');
      opt.value = i;
      opt.textContent = sent.words.join(' ');
      selectEl.appendChild(opt);
    });

    function draw() {
      var sent = DATA.sentences[currentSentIdx];
      var totalSteps = sent.words.length;
      currentStep = Math.min(currentStep, totalSteps);

      svg.selectAll('*').remove();
      var W = 700, H = 480;
      var g = svg.append('g');

      // Layout: unrolled RNN horizontally
      var nodeSpacing = 160;
      var startX = 90;
      var inputY = 80;
      var hiddenY = 200;
      var outputY = 310;
      var predTextY = 360;

      // Title labels (positioned above each row to avoid overlap with arrows)
      g.append('text').attr('x', 15).attr('y', inputY - 25)
        .attr('fill', COLORS.text_muted).attr('font-size', '10px').attr('font-weight', '600')
        .text('INPUT');
      g.append('text').attr('x', 15).attr('y', hiddenY - 25)
        .attr('fill', COLORS.text_muted).attr('font-size', '10px').attr('font-weight', '600')
        .text('HIDDEN');
      g.append('text').attr('x', 15).attr('y', outputY - 25)
        .attr('fill', COLORS.text_muted).attr('font-size', '10px').attr('font-weight', '600')
        .text('OUTPUT');

      // Draw initial hidden state (h0)
      var h0x = startX - nodeSpacing;
      if (currentStep >= 0) {
        g.append('circle')
          .attr('cx', h0x).attr('cy', hiddenY).attr('r', 18)
          .attr('fill', COLORS.bg_dot).attr('opacity', 0.5)
          .attr('stroke', COLORS.axis);
        g.append('text').attr('x', h0x).attr('y', hiddenY + 4)
          .attr('text-anchor', 'middle').attr('font-size', '10px')
          .attr('fill', COLORS.text_muted).text('h\u2080');

        // Arrow from h0 to first hidden
        if (totalSteps > 0) {
          drawArrow(g, h0x + 18, hiddenY, startX - 18, hiddenY, COLORS.text_muted, true);
        }
      }

      // Draw each timestep
      for (var t = 0; t < totalSteps; t++) {
        var x = startX + t * nodeSpacing;
        var isActive = t <= currentStep;
        var isCurrent = t === currentStep;
        var opacity = isActive ? 1.0 : 0.3;

        // Input node
        var inputColor = isActive ? COLORS.input : COLORS.bg_dot;
        g.append('circle')
          .attr('cx', x).attr('cy', inputY).attr('r', 16)
          .attr('fill', inputColor).attr('opacity', opacity)
          .attr('stroke', COLORS.viz_bg).attr('stroke-width', 1.5);
        g.append('text').attr('x', x).attr('y', inputY + 4)
          .attr('text-anchor', 'middle').attr('font-size', '10px')
          .attr('fill', 'white').attr('opacity', opacity)
          .attr('font-weight', '600').text('x' + subscript(t + 1));
        g.append('text').attr('x', x).attr('y', inputY + 38)
          .attr('text-anchor', 'middle').attr('font-size', '12px')
          .attr('fill', COLORS.text_primary).attr('opacity', opacity)
          .attr('font-weight', isActive ? '700' : '400')
          .text(sent.words[t]);

        // Hidden node
        var hiddenColor = isActive ? COLORS.hidden : COLORS.bg_dot;
        var hiddenRadius = isCurrent ? 22 : 18;
        g.append('circle')
          .attr('cx', x).attr('cy', hiddenY).attr('r', hiddenRadius)
          .attr('fill', hiddenColor).attr('opacity', opacity)
          .attr('stroke', isCurrent ? COLORS.orange : COLORS.viz_bg)
          .attr('stroke-width', isCurrent ? 3 : 1.5);
        g.append('text').attr('x', x).attr('y', hiddenY + 4)
          .attr('text-anchor', 'middle').attr('font-size', '10px')
          .attr('fill', 'white').attr('opacity', opacity)
          .attr('font-weight', '600').text('h' + subscript(t + 1));

        // Arrow: input -> hidden
        drawArrow(g, x, inputY + 16, x, hiddenY - hiddenRadius, COLORS.text_muted, isActive);

        // Arrow: prev hidden -> current hidden
        if (t > 0 && isActive) {
          var prevX = startX + (t - 1) * nodeSpacing;
          drawArrow(g, prevX + 18, hiddenY, x - hiddenRadius, hiddenY, COLORS.hidden, true);
        }

        // Output node (only for active steps)
        if (isActive) {
          var state = sent.states[t];
          var outColor = state.output[0] > state.output[1] ? COLORS.output_pos : COLORS.output_neg;
          var outRadius = 14;
          var pred = state.output[0] > state.output[1] ? '+' : '-';
          var conf = Math.round(Math.max(state.output[0], state.output[1]) * 100);

          g.append('circle')
            .attr('cx', x).attr('cy', outputY).attr('r', outRadius)
            .attr('fill', outColor).attr('opacity', opacity * 0.9)
            .attr('stroke', COLORS.viz_bg).attr('stroke-width', 1.5);
          g.append('text').attr('x', x).attr('y', outputY + 4)
            .attr('text-anchor', 'middle').attr('font-size', '10px')
            .attr('fill', 'white').attr('font-weight', '700')
            .text(pred);

          // Arrow: hidden -> output
          drawArrow(g, x, hiddenY + hiddenRadius, x, outputY - outRadius, COLORS.text_muted, true);

          // Running prediction text below each output
          var wordsSoFar = sent.words.slice(0, t + 1).join(' ');
          var predLabel = state.output[0] > state.output[1] ? 'positif' : 'negatif';

          g.append('text').attr('x', x).attr('y', predTextY)
            .attr('text-anchor', 'middle').attr('font-size', '10px')
            .attr('fill', COLORS.text_secondary)
            .text('\u201c' + wordsSoFar + '\u201d');

          g.append('text').attr('x', x).attr('y', predTextY + 16)
            .attr('text-anchor', 'middle').attr('font-size', '11px')
            .attr('fill', outColor).attr('font-weight', '700')
            .text(predLabel + ' ' + conf + '%');
        }
      }

      // Update step controls
      stepPrev.disabled = currentStep === 0;
      stepNext.disabled = currentStep >= totalSteps;
      stepIndicator.textContent = 'Timestep ' + currentStep + ' / ' + totalSteps;

      // Update detail panel
      updateDetail();
    }

    function updateDetail() {
      var sent = DATA.sentences[currentSentIdx];
      if (currentStep === 0) {
        stepDetail.innerHTML = '<div class="detail-word">Hidden state awal (h\u2080)</div>' +
          '<p>Vektor nol. RNN siap menerima input pertama.</p>';
        return;
      }

      var state = sent.states[currentStep - 1];
      var word = state.word;
      var hidden = state.hidden;
      var output = state.output;
      var pred = output[0] > output[1] ? 'positif' : 'negatif';
      var conf = Math.max(output[0], output[1]);

      var html = '<div class="detail-word">Input: "' + word + '" \u2192 Timestep ' + currentStep + '</div>';

      html += '<div class="detail-row"><span class="detail-label">Vektor kata</span>';
      html += '<span class="detail-val">[' + state.input.join(', ') + ']</span></div>';

      html += '<div class="detail-row"><span class="detail-label">Hidden state</span>';
      html += '<span class="detail-val">[' + hidden.join(', ') + ']</span></div>';

      // Hidden state bars
      html += '<div style="margin:0.4rem 0">';
      hidden.forEach(function (v, i) {
        var barW = Math.abs(v) * 60;
        var barColor = v >= 0 ? COLORS.hidden : COLORS.output_neg;
        html += '<div style="display:flex;align-items:center;gap:6px;margin:2px 0">';
        html += '<span style="font-size:0.7rem;color:' + COLORS.text_muted + ';width:20px">h' + (i + 1) + '</span>';
        html += '<div style="height:6px;width:' + barW + 'px;background:' + barColor + ';border-radius:3px"></div>';
        html += '<span style="font-size:0.7rem;color:' + COLORS.text_muted + '">' + v.toFixed(2) + '</span>';
        html += '</div>';
      });
      html += '</div>';

      html += '<div class="detail-row"><span class="detail-label">Prediksi</span>';
      html += '<span style="font-weight:700;color:' + (pred === 'positif' ? COLORS.output_pos : COLORS.output_neg) + '">';
      html += pred + ' (' + (conf * 100).toFixed(1) + '%)</span></div>';

      stepDetail.innerHTML = html;
    }

    function drawArrow(g, x1, y1, x2, y2, color, active) {
      var opacity = active ? 0.6 : 0.2;
      g.append('line')
        .attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2)
        .attr('stroke', color).attr('stroke-width', 1.5).attr('opacity', opacity);
    }

    function subscript(n) {
      var subs = '\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089';
      return String(n).split('').map(function (d) { return subs[parseInt(d)]; }).join('');
    }

    stepNext.addEventListener('click', function () {
      var sent = DATA.sentences[currentSentIdx];
      if (currentStep < sent.words.length) {
        currentStep++;
        draw();
      }
    });

    stepPrev.addEventListener('click', function () {
      if (currentStep > 0) {
        currentStep--;
        draw();
      }
    });

    selectEl.addEventListener('change', function () {
      currentSentIdx = parseInt(this.value);
      currentStep = 0;
      draw();
    });

    draw();
  }

  // ============================================================
  // TAB 2: VANISHING GRADIENT
  // ============================================================

  function initGradient() {
    var svg = d3.select('#gradient-plot');
    var slider = document.getElementById('seq-slider');
    var seqValue = document.getElementById('seq-value');

    function draw() {
      var seqLen = parseInt(slider.value);
      seqValue.textContent = seqLen;

      // Interpolate from pre-computed data
      var rnnData = DATA.gradient_data[String(seqLen)].rnn;
      var lstmData = DATA.gradient_data[String(seqLen)].lstm;

      svg.selectAll('*').remove();
      var W = 700, H = 400;
      var margin = { top: 30, right: 30, bottom: 50, left: 55 };
      var innerW = W - margin.left - margin.right;
      var innerH = H - margin.top - margin.bottom;

      var g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      var x = d3.scaleLinear().domain([0, seqLen - 1]).range([0, innerW]);
      var yMax = Math.max(
        d3.max(rnnData), d3.max(lstmData)
      ) * 1.1;
      var y = d3.scaleLinear().domain([0, yMax]).range([innerH, 0]);

      // Grid lines
      for (var i = 0; i <= 4; i++) {
        var yVal = (yMax / 4) * i;
        g.append('line')
          .attr('x1', 0).attr('x2', innerW)
          .attr('y1', y(yVal)).attr('y2', y(yVal))
          .attr('stroke', COLORS.grid).attr('stroke-width', 1);
      }

      // Axes
      g.append('g')
        .attr('transform', 'translate(0,' + innerH + ')')
        .call(d3.axisBottom(x).ticks(Math.min(seqLen, 10)).tickFormat(function (d) { return 't-' + d; }))
        .selectAll('text').style('fill', COLORS.text_muted);

      g.append('g')
        .call(d3.axisLeft(y).ticks(5).tickFormat(function (d) { return d3.format('.2f')(d); }))
        .selectAll('text').style('fill', COLORS.text_muted);

      // Axis labels
      g.append('text')
        .attr('x', innerW / 2).attr('y', innerH + 38)
        .attr('text-anchor', 'middle')
        .style('fill', COLORS.text_muted).style('font-size', '11px')
        .text('Timestep (mundur dari output)');

      g.append('text')
        .attr('x', -innerH / 2).attr('y', -40)
        .attr('text-anchor', 'middle').attr('transform', 'rotate(-90)')
        .style('fill', COLORS.text_muted).style('font-size', '11px')
        .text('Magnitudo Gradien (||\u2207||)');

      // Line generator
      var line = d3.line()
        .x(function (d, i) { return x(i); })
        .y(function (d) { return y(d); })
        .curve(d3.curveMonotoneX);

      // Area generator for RNN
      var areaRnn = d3.area()
        .x(function (d, i) { return x(i); })
        .y0(innerH)
        .y1(function (d) { return y(d); })
        .curve(d3.curveMonotoneX);

      // RNN gradient area + line
      g.append('path')
        .datum(rnnData)
        .attr('fill', COLORS.rnn_grad)
        .attr('opacity', 0.1)
        .attr('d', areaRnn);

      g.append('path')
        .datum(rnnData)
        .attr('fill', 'none')
        .attr('stroke', COLORS.rnn_grad)
        .attr('stroke-width', 2.5)
        .attr('d', line);

      // RNN dots
      g.selectAll('.rnn-dot')
        .data(rnnData)
        .enter().append('circle')
        .attr('class', 'rnn-dot')
        .attr('cx', function (d, i) { return x(i); })
        .attr('cy', function (d) { return y(d); })
        .attr('r', 4)
        .attr('fill', COLORS.rnn_grad);

      // LSTM line
      g.append('path')
        .datum(lstmData)
        .attr('fill', 'none')
        .attr('stroke', COLORS.lstm_grad)
        .attr('stroke-width', 2.5)
        .attr('stroke-dasharray', '6 4')
        .attr('d', line);

      // LSTM dots
      g.selectAll('.lstm-dot')
        .data(lstmData)
        .enter().append('circle')
        .attr('class', 'lstm-dot')
        .attr('cx', function (d, i) { return x(i); })
        .attr('cy', function (d) { return y(d); })
        .attr('r', 4)
        .attr('fill', COLORS.lstm_grad);

      // Legend
      var legendG = svg.append('g').attr('transform', 'translate(' + (W - 180) + ',' + 15 + ')');

      legendG.append('line')
        .attr('x1', 0).attr('x2', 24).attr('y1', 0).attr('y2', 0)
        .attr('stroke', COLORS.rnn_grad).attr('stroke-width', 2.5);
      legendG.append('text').attr('x', 30).attr('y', 4)
        .attr('font-size', '11px').attr('fill', COLORS.text_muted).text('RNN standar');

      legendG.append('line')
        .attr('x1', 0).attr('x2', 24).attr('y1', 20).attr('y2', 20)
        .attr('stroke', COLORS.lstm_grad).attr('stroke-width', 2.5).attr('stroke-dasharray', '6 4');
      legendG.append('text').attr('x', 30).attr('y', 24)
        .attr('font-size', '11px').attr('fill', COLORS.text_muted).text('LSTM');

      // Annotation: "Gradien hilang" threshold
      g.append('line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', y(0.05)).attr('y2', y(0.05))
        .attr('stroke', COLORS.output_neg).attr('stroke-width', 1)
        .attr('stroke-dasharray', '2 4').attr('opacity', 0.4);
      g.append('text')
        .attr('x', 5).attr('y', y(0.05) - 5)
        .attr('font-size', '10px').attr('fill', COLORS.output_neg).attr('opacity', 0.6)
        .text('Ambang belajar');
    }

    slider.addEventListener('input', draw);
    draw();
  }

  // ============================================================
  // TAB 3: SENTENCE REPRESENTATION
  // ============================================================

  function initRepresentation() {
    var svg = d3.select('#rep-plot');
    var currentMethod = 'bow';

    var methodColors = {
      bow: COLORS.accent,
      avg: COLORS.orange,
      rnn: COLORS.hidden,
    };

    // Highlight pairs (same sentence, different order)
    var swapPair = DATA.representations.swap_pairs[0];

    function draw() {
      var method = DATA.representations.methods[currentMethod];
      var points = method.points;

      svg.selectAll('*').remove();
      var W = 600, H = 400;
      var margin = { top: 20, right: 20, bottom: 40, left: 45 };
      var innerW = W - margin.left - margin.right;
      var innerH = H - margin.top - margin.bottom;

      var g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      var x = d3.scaleLinear().domain([-1.15, 1.15]).range([0, innerW]);
      var y = d3.scaleLinear().domain([-1.15, 1.15]).range([innerH, 0]);

      // Grid
      [-1, -0.5, 0, 0.5, 1].forEach(function (v) {
        g.append('line').attr('x1', x(v)).attr('x2', x(v))
          .attr('y1', 0).attr('y2', innerH)
          .attr('stroke', COLORS.grid).attr('stroke-width', 1);
        g.append('line').attr('x1', 0).attr('x2', innerW)
          .attr('y1', y(v)).attr('y2', y(v))
          .attr('stroke', COLORS.grid).attr('stroke-width', 1);
      });

      // Zero axes
      g.append('line').attr('x1', x(0)).attr('x2', x(0))
        .attr('y1', 0).attr('y2', innerH).attr('stroke', COLORS.axis);
      g.append('line').attr('x1', 0).attr('x2', innerW)
        .attr('y1', y(0)).attr('y2', y(0)).attr('stroke', COLORS.axis);

      // Draw connecting line for swap pair
      var pA = points[swapPair.a_idx];
      var pB = points[swapPair.b_idx];
      var dist = Math.sqrt(Math.pow(pA.x - pB.x, 2) + Math.pow(pA.y - pB.y, 2));

      g.append('line')
        .attr('x1', x(pA.x)).attr('y1', y(pA.y))
        .attr('x2', x(pB.x)).attr('y2', y(pB.y))
        .attr('stroke', COLORS.output_neg).attr('stroke-width', 2)
        .attr('stroke-dasharray', '5 4').attr('opacity', 0.5);

      // Data points with anti-collision labels
      var color = methodColors[currentMethod];

      // Compute label positions with collision avoidance
      var labelData = points.map(function (p, i) {
        return {
          idx: i,
          px: x(p.x),
          py: y(p.y),
          label: p.label,
          isSwap: (i === swapPair.a_idx || i === swapPair.b_idx),
        };
      });

      // Place labels alternating above/below, then nudge if overlapping
      var placed = [];
      labelData.forEach(function (ld) {
        var offset = ld.py < innerH / 2 ? -12 : 14;
        var lx = ld.px;
        var ly = ld.py + offset;

        // Check collision with already-placed labels
        for (var attempt = 0; attempt < 8; attempt++) {
          var collides = false;
          for (var j = 0; j < placed.length; j++) {
            var dx = lx - placed[j].lx;
            var dy = ly - placed[j].ly;
            if (Math.abs(dx) < 70 && Math.abs(dy) < 14) {
              collides = true;
              break;
            }
          }
          if (!collides) break;
          // Nudge further away
          offset += (offset > 0 ? 6 : -6);
          ly = ld.py + offset;
        }

        placed.push({ lx: lx, ly: ly });
        ld.lx = lx;
        ld.ly = ly;
      });

      // Draw circles and labels
      labelData.forEach(function (ld) {
        var radius = ld.isSwap ? 9 : 6;
        var ptColor = ld.isSwap ? COLORS.output_neg : color;

        g.append('circle')
          .attr('cx', ld.px).attr('cy', ld.py).attr('r', radius)
          .attr('fill', ptColor).attr('opacity', 0.85)
          .attr('stroke', COLORS.viz_bg).attr('stroke-width', 1.5);

        // Connector line if label is far from point
        if (Math.abs(ld.ly - ld.py) > 16) {
          g.append('line')
            .attr('x1', ld.px).attr('y1', ld.py + (ld.py < ld.ly ? radius : -radius))
            .attr('x2', ld.px).attr('y2', ld.ly + (ld.py < ld.ly ? -4 : 4))
            .attr('stroke', ptColor).attr('opacity', 0.3).attr('stroke-width', 0.8);
        }

        g.append('text')
          .attr('x', ld.lx).attr('y', ld.ly + 3)
          .attr('text-anchor', 'middle').attr('font-size', '9.5px')
          .attr('fill', ld.isSwap ? COLORS.output_neg : COLORS.text_secondary)
          .attr('font-weight', ld.isSwap ? '700' : '400')
          .text(ld.label.length > 24 ? ld.label.substring(0, 22) + '..' : ld.label);
      });

      // Axis labels
      g.append('text')
        .attr('x', innerW / 2).attr('y', innerH + 32)
        .attr('text-anchor', 'middle')
        .style('fill', COLORS.text_muted).style('font-size', '11px')
        .text('Komponen Utama 1');

      g.append('text')
        .attr('x', -innerH / 2).attr('y', -32)
        .attr('text-anchor', 'middle').attr('transform', 'rotate(-90)')
        .style('fill', COLORS.text_muted).style('font-size', '11px')
        .text('Komponen Utama 2');

      // Swap distance annotation
      var distLabel = currentMethod === 'bow'
        ? 'Jarak: 0 (identik - urutan diabaikan)'
        : 'Jarak: ' + dist.toFixed(2);

      g.append('text')
        .attr('x', 10).attr('y', 15)
        .attr('font-size', '10px').attr('fill', COLORS.output_neg).attr('opacity', 0.7)
        .text(distLabel);
    }

    // Method buttons
    var repBtns = document.querySelectorAll('.rep-btn');
    repBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        repBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentMethod = btn.getAttribute('data-method');
        draw();
      });
    });

    draw();
  }

  // ============================================================
  // INIT
  // ============================================================

  initForward();
  initGradient();
  initRepresentation();

})();

/*
 * KupasAI - Backpropagation Visualizer
 * ML Lanjut IN F24141 - Week 7
 */

(function () {
  'use strict';

  var D = BP_DATA;
  var IS_DARK = document.documentElement.getAttribute('data-theme') === 'dark';
  var C = IS_DARK ? {
    text_muted: '#8b949e', text_primary: '#e6edf3', axis: '#30363d',
    accent: '#58a6ff', danger: '#f85149', success: '#3fb950', warn: '#d29922', node_bg: '#161b22',
  } : {
    text_muted: '#656d76', text_primary: '#1f2328', axis: '#d0d7de',
    accent: '#0969da', danger: '#cf222e', success: '#1a7f37', warn: '#9a6700', node_bg: '#ffffff',
  };

  var svg = d3.select('#bp-net-plot');
  var VBW = 640, VBH = 380;

  function renderNetwork(step) {
    svg.selectAll('*').remove();
    var xIn = D.x, hidden = step.hidden, output = step.output;
    var layerXs = [80, 320, 560];
    var topPad = 56, botPad = 30;
    var usableH = VBH - topPad - botPad;

    function yFor(n, idx) {
      if (n === 1) return topPad + usableH / 2;
      return topPad + (usableH * idx) / (n - 1);
    }
    var inY = xIn.map(function (_, i) { return yFor(3, i); });
    var hidY = hidden.map(function (_, i) { return yFor(4, i); });
    var outY = [yFor(1, 0)];

    // edges input -> hidden
    var edgeG = svg.append('g');
    for (var hi = 0; hi < 4; hi++) {
      for (var ii = 0; ii < 3; ii++) {
        var w = step.W01[ii][hi];
        var highlight = step.W01highlight && (hi === 2 || hi === 3);
        drawEdge(edgeG, layerXs[0], inY[ii], layerXs[1], hidY[hi], w, highlight);
      }
    }
    // edges hidden -> output
    for (var hj = 0; hj < 4; hj++) {
      var w2 = step.W12[hj];
      drawEdge(edgeG, layerXs[1], hidY[hj], layerXs[2], outY[0], w2, step.W12highlight);
    }

    function drawEdge(g, x1, y1, x2, y2, w, highlight) {
      g.append('line')
        .attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2)
        .attr('class', 'net-edge')
        .attr('stroke', w >= 0 ? C.accent : C.danger)
        .attr('stroke-opacity', highlight ? 1 : (0.25 + Math.min(Math.abs(w), 1.5) * 0.3))
        .attr('stroke-width', (highlight ? 1.5 : 0.5) + Math.min(Math.abs(w), 1.5) * 2);
      var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      g.append('rect').attr('x', mx - 15).attr('y', my - 7).attr('width', 30).attr('height', 12)
        .attr('fill', C.node_bg).attr('opacity', 0.85);
      g.append('text').attr('class', 'net-edge-label').attr('x', mx).attr('y', my + 3)
        .attr('text-anchor', 'middle').attr('fill', highlight ? (w >= 0 ? C.success : C.danger) : (w >= 0 ? C.accent : C.danger))
        .style('font-weight', highlight ? 700 : 400)
        .text(w.toFixed(2));
    }

    // layer names
    ['Input (x)', 'Hidden (ReLU)', 'Output'].forEach(function (name, li) {
      svg.append('text').attr('class', 'net-layer-name').attr('x', layerXs[li]).attr('y', 18).attr('fill', C.text_muted).text(name);
    });

    // input nodes
    xIn.forEach(function (v, i) {
      drawNode(layerXs[0], inY[i], v.toFixed(2), 'x' + (i + 1), C.accent, false);
    });
    // hidden nodes
    hidden.forEach(function (v, i) {
      var isNull = v === null;
      var color = step.phase === 'backward' && step.hiddenSub === 'delta_h' ? (v < 0 ? C.danger : (v > 0 ? C.success : C.text_muted)) : C.accent;
      drawNode(layerXs[1], hidY[i], isNull ? '?' : round3(v), 'h' + (i + 1) + (step.hiddenSub ? ' (' + step.hiddenSub + ')' : ''), isNull ? C.text_muted : color, isNull);
    });
    // output node
    var outIsNull = output === null;
    var outColor = step.phase === 'compare' ? C.danger : (step.phase === 'verify' ? C.success : C.accent);
    drawNode(layerXs[2], outY[0], outIsNull ? '?' : round3(output), outIsNull ? 'y' : (step.outputSub || 'ŷ'), outIsNull ? C.text_muted : outColor, outIsNull);

    function drawNode(x, y, valueText, subText, strokeColor, dashed) {
      var g = svg.append('g').attr('class', 'net-node').attr('transform', 'translate(' + x + ',' + y + ')');
      g.append('circle').attr('r', 28).attr('fill', C.node_bg).attr('stroke', strokeColor)
        .attr('stroke-dasharray', dashed ? '4,3' : null);
      g.append('text').attr('class', 'node-value').attr('text-anchor', 'middle').attr('y', 1).attr('fill', dashed ? C.text_muted : C.text_primary).text(valueText);
      g.append('text').attr('class', 'node-sub').attr('text-anchor', 'middle').attr('y', 42).attr('fill', C.text_muted).text(subText);
    }
  }

  function round3(v) {
    return (Math.round(v * 1000) / 1000).toString();
  }

  // ============================================================
  // STEP CONTROLS
  // ============================================================
  var step = 0;
  var maxStep = D.steps.length - 1;
  var stepIndicator = document.getElementById('bp-step-indicator');
  var stepTitle = document.getElementById('bp-step-title');
  var traceLog = document.getElementById('bp-trace-log');
  var prevBtn = document.getElementById('bp-step-prev');
  var nextBtn = document.getElementById('bp-step-next');
  var phaseProgress = document.getElementById('bp-phase-progress');
  var mseRow = document.getElementById('bp-mse-compare');

  // build phase dots
  D.steps.forEach(function (s, i) {
    var dot = document.createElement('div');
    dot.className = 'phase-dot';
    dot.setAttribute('data-idx', i);
    phaseProgress.appendChild(dot);
  });

  function render() {
    var s = D.steps[step];
    renderNetwork(s);
    stepIndicator.textContent = 'Langkah ' + (step + 1) + ' / ' + (maxStep + 1);
    stepTitle.textContent = s.title;
    stepTitle.className = 'step-title phase-' + s.phase;
    traceLog.innerHTML = s.trace.map(function (line) { return '<div>' + line + '</div>'; }).join('');
    prevBtn.disabled = step === 0;
    nextBtn.disabled = step === maxStep;

    var dots = phaseProgress.querySelectorAll('.phase-dot');
    dots.forEach(function (d, i) {
      d.classList.toggle('done', i < step);
      d.classList.toggle('current', i === step);
    });

    mseRow.style.display = s.phase === 'verify' ? 'flex' : 'none';
  }

  prevBtn.addEventListener('click', function () { if (step > 0) { step--; render(); } });
  nextBtn.addEventListener('click', function () { if (step < maxStep) { step++; render(); } });

  render();

})();

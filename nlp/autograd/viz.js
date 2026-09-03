/*
 * KupasAI - Deep Learning Framework (Tensor & Autograd) Visualization
 * NLP INF20161 - Week 3
 *
 * Two panels:
 *   1. Graf komputasi & bug akumulasi gradien (Modul 3.2)
 *   2. Rantai perkalian: vanishing/exploding gradient (Modul 3.4.5)
 */

(function () {
  'use strict';

  var D = AUTOGRAD_DATA;
  var IS_DARK = document.documentElement.getAttribute('data-theme') === 'dark';
  var C = IS_DARK ? {
    text_muted: '#8b949e', text_primary: '#e6edf3', axis: '#30363d',
    accent: '#58a6ff', danger: '#f85149', success: '#3fb950',
  } : {
    text_muted: '#656d76', text_primary: '#1f2328', axis: '#d0d7de',
    accent: '#0969da', danger: '#cf222e', success: '#1a7f37',
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
  // TAB 1: COMPUTATIONAL GRAPH
  // ============================================================

  var G = D.graph;
  var mode = 'buggy'; // 'buggy' | 'fixed'
  var step = 0;
  var MAX_STEP = 6;

  var NODE_POS = {
    a: { x: 100, y: 60 }, b: { x: 250, y: 60 }, c: { x: 400, y: 60 },
    d: { x: 175, y: 190 }, e: { x: 325, y: 190 },
    f: { x: 250, y: 320 },
  };
  var EDGES = [
    { from: 'a', to: 'd' }, { from: 'b', to: 'd' },
    { from: 'b', to: 'e' }, { from: 'c', to: 'e' },
    { from: 'd', to: 'f' }, { from: 'e', to: 'f' },
  ];

  // step definition: { activeEdge: [from,to], setsNode: name|null, callNum: 1|2|null, log: fn(mode) }
  var STEPS = [
    { activeEdge: null, setsNode: null, log: function () { return 'Klik "Langkah Berikutnya" untuk memanggil f.backward([1,1,1,1,1])'; } },
    { activeEdge: ['f', 'd'], setsNode: null, log: function () { return 'f.backward(...) &rarr; memanggil d.backward([1,1,1,1,1])'; } },
    { activeEdge: ['d', 'a'], setsNode: 'a', log: function () { return '&nbsp;&nbsp;d.backward(...) &rarr; a.backward([1,1,1,1,1]) &rarr; a.grad = [1,1,1,1,1]'; } },
    { activeEdge: ['d', 'b'], setsNode: 'b', callNum: 1, log: function () { return '&nbsp;&nbsp;d.backward(...) &rarr; b.backward([1,1,1,1,1]) <em>[panggilan ke-1]</em> &rarr; b.grad = [1,1,1,1,1]'; } },
    { activeEdge: ['f', 'e'], setsNode: null, log: function () { return 'f.backward(...) &rarr; memanggil e.backward([1,1,1,1,1])'; } },
    { activeEdge: ['e', 'b'], setsNode: 'b', callNum: 2, log: function (m) {
        return '&nbsp;&nbsp;e.backward(...) &rarr; b.backward([1,1,1,1,1]) <em>[panggilan ke-2]</em> &rarr; ' +
          (m === 'buggy' ? 'b.grad <strong>DITIMPA</strong> jadi [1,1,1,1,1] &mdash; BUG!' : 'b.grad <strong>DIAKUMULASI</strong> jadi [2,2,2,2,2] &mdash; benar!');
      } },
    { activeEdge: ['e', 'c'], setsNode: 'c', log: function () { return '&nbsp;&nbsp;e.backward(...) &rarr; c.backward([1,1,1,1,1]) &rarr; c.grad = [1,1,1,1,1]'; } },
  ];

  function computeGrads(uptoStep, m) {
    var grads = {};
    for (var i = 1; i <= uptoStep; i++) {
      var s = STEPS[i];
      if (!s.setsNode) continue;
      if (s.setsNode === 'b' && s.callNum === 2) {
        grads.b = m === 'buggy' ? [1, 1, 1, 1, 1] : [2, 2, 2, 2, 2];
      } else {
        grads[s.setsNode] = [1, 1, 1, 1, 1];
      }
    }
    return grads;
  }

  var svg = d3.select('#graph-plot');

  function drawGraph() {
    svg.selectAll('*').remove();
    var g = svg.append('g');

    // edges
    EDGES.forEach(function (e) {
      var p1 = NODE_POS[e.from], p2 = NODE_POS[e.to];
      var isActive = STEPS[step].activeEdge && STEPS[step].activeEdge[0] === e.from && STEPS[step].activeEdge[1] === e.to;
      g.append('line')
        .attr('class', 'edge-line' + (isActive ? ' active' : ''))
        .attr('x1', p1.x).attr('y1', p1.y + 22)
        .attr('x2', p2.x).attr('y2', p2.y - 22)
        .attr('marker-end', 'url(#arrow)');
    });

    // arrow marker
    svg.append('defs').append('marker')
      .attr('id', 'arrow').attr('viewBox', '0 0 10 10').attr('refX', 8).attr('refY', 5)
      .attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto-start-reverse')
      .append('path').attr('d', 'M0,0 L10,5 L0,10 z').attr('fill', C.text_muted);

    var grads = computeGrads(step, mode);
    var justSetNode = STEPS[step].setsNode;
    var bugVisible = step >= 5 && mode === 'buggy';

    Object.keys(NODE_POS).forEach(function (name) {
      var p = NODE_POS[name];
      var isInput = ['a', 'b', 'c'].indexOf(name) !== -1;
      var val = isInput ? G[name] : (name === 'f' ? G.grad_out : null);
      var node = g.append('g').attr('transform', 'translate(' + p.x + ',' + p.y + ')');
      node.append('rect')
        .attr('class', 'node-box' + (name === justSetNode ? ' highlight' : ''))
        .attr('x', -32).attr('y', -22).attr('width', 64).attr('height', 44).attr('rx', 8);
      node.append('text').attr('class', 'node-label').attr('text-anchor', 'middle').attr('y', -3).text(name);
      var gradText = grads[name] ? '∇=[' + grads[name].join(',') + ']' : '∇=-';
      node.append('text')
        .attr('class', 'node-grad' + (grads[name] ? (bugVisible && name === 'b' ? ' bug' : ' set') : ''))
        .attr('text-anchor', 'middle').attr('y', 13).text(gradText);
    });
  }

  function renderLog() {
    var html = '';
    for (var i = 0; i <= step; i++) {
      html += '<div class="trace-line' + (i === step ? ' current' + (STEPS[i].setsNode === 'b' && STEPS[i].callNum === 2 && mode === 'buggy' ? ' bug' : '') : '') + '">' + STEPS[i].log(mode) + '</div>';
    }
    document.getElementById('ag-trace-log').innerHTML = html;
    document.getElementById('ag-step-indicator').textContent = 'Langkah ' + step + ' / ' + MAX_STEP;
    document.getElementById('step-prev').disabled = step === 0;
    document.getElementById('step-next').disabled = step === MAX_STEP;

    if (step === MAX_STEP) {
      var grads = computeGrads(step, mode);
      var box = document.getElementById('ag-verdict');
      var correct = grads.b.join(',') === '2,2,2,2,2';
      box.className = 'verdict-box ' + (correct ? 'correct' : 'wrong');
      box.innerHTML = 'b digunakan di 2 jalur (untuk d dan e), seharusnya b.grad = <strong>[2,2,2,2,2]</strong>. ' +
        'Hasil akhir: b.grad = <strong class="verdict-val">[' + grads.b.join(',') + ']</strong> ' +
        (correct ? '&mdash; benar, gradien terakumulasi!' : '&mdash; salah, gradien tertimpa (bug)!');
      box.style.display = 'block';
    } else {
      document.getElementById('ag-verdict').style.display = 'none';
    }
  }

  function render() {
    drawGraph();
    renderLog();
  }

  document.getElementById('step-next').addEventListener('click', function () {
    if (step < MAX_STEP) { step++; render(); }
  });
  document.getElementById('step-prev').addEventListener('click', function () {
    if (step > 0) { step--; render(); }
  });

  document.querySelectorAll('.mode-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.mode-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      mode = btn.getAttribute('data-mode');
      step = 0;
      render();
    });
  });

  render();

  // ============================================================
  // TAB 2: CHAIN MULTIPLICATION (vanishing/exploding)
  // ============================================================

  var chainSvg = d3.select('#chain-plot');
  var gSlider = document.getElementById('g-slider');
  var nSlider = document.getElementById('n-slider');

  function drawChain(g, n) {
    chainSvg.selectAll('*').remove();
    var W = 700, H = 340;
    var margin = { top: 20, right: 20, bottom: 40, left: 55 };
    var innerW = W - margin.left - margin.right;
    var innerH = H - margin.top - margin.bottom;

    var values = [];
    for (var k = 0; k <= n; k++) values.push({ k: k, v: Math.pow(g, k) });

    var x = d3.scaleLinear().domain([0, n]).range([0, innerW]);
    var maxV = Math.max(1e-6, d3.max(values, function (d) { return d.v; }));
    var minV = Math.max(1e-6, d3.min(values, function (d) { return d.v; }));
    var y = d3.scaleLog().domain([Math.max(minV, 1e-6), Math.max(maxV, 1.5)]).range([innerH, 0]).clamp(true);

    var gEl = chainSvg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    gEl.append('g').attr('transform', 'translate(0,' + innerH + ')')
      .call(d3.axisBottom(x).ticks(6)).selectAll('text').style('fill', C.text_muted);
    gEl.append('g').call(d3.axisLeft(y).ticks(6, '.1~e')).selectAll('text').style('fill', C.text_muted);
    gEl.selectAll('.domain, .tick line').attr('stroke', C.axis);

    gEl.append('text').attr('x', innerW / 2).attr('y', innerH + 34).attr('text-anchor', 'middle')
      .style('fill', C.text_muted).style('font-size', '11px').text('Jumlah perkalian berantai (k)');

    var color = g < 1 ? C.danger : (g > 1 ? C.accent : C.success);
    var line = d3.line().x(function (d) { return x(d.k); }).y(function (d) { return y(Math.max(d.v, 1e-6)); });
    gEl.append('path').datum(values).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 2.5).attr('d', line);

    var last = values[values.length - 1];
    gEl.append('circle').attr('cx', x(last.k)).attr('cy', y(Math.max(last.v, 1e-6))).attr('r', 5).attr('fill', color);

    document.getElementById('chain-result').innerHTML =
      g.toFixed(2) + '<sup>' + n + '</sup> = <strong>' + (last.v < 0.001 ? last.v.toExponential(3) : last.v.toFixed(4)) + '</strong> ' +
      (g < 1 ? '&mdash; gradien menghilang (vanishing)' : (g > 1 ? '&mdash; gradien meledak (exploding)' : '&mdash; gradien stabil'));
  }

  function updateChain() {
    var g = +gSlider.value;
    var n = +nSlider.value;
    document.getElementById('g-value').textContent = g.toFixed(2);
    document.getElementById('n-value').textContent = n;
    drawChain(g, n);
  }

  gSlider.addEventListener('input', updateChain);
  nSlider.addEventListener('input', updateChain);

  document.querySelectorAll('.preset-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      gSlider.value = btn.getAttribute('data-g');
      nSlider.value = btn.getAttribute('data-n');
      updateChain();
    });
  });

  updateChain();
})();

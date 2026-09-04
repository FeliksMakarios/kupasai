/*
 * KupasAI - Forward Propagation Visualization
 * ML Lanjut IN F24141 - Week 2
 */

(function () {
  'use strict';

  var D = FORWARD_PROP_DATA;
  var IS_DARK = document.documentElement.getAttribute('data-theme') === 'dark';
  var C = IS_DARK ? {
    text_muted: '#8b949e', text_primary: '#e6edf3', axis: '#30363d',
    accent: '#58a6ff', danger: '#f85149', success: '#3fb950', node_bg: '#161b22',
  } : {
    text_muted: '#656d76', text_primary: '#1f2328', axis: '#d0d7de',
    accent: '#0969da', danger: '#cf222e', success: '#1a7f37', node_bg: '#ffffff',
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
  // NETWORK DIAGRAM RENDERER (generic, reused by all scenarios)
  // ============================================================
  var svg = d3.select('#net-plot');
  var VBW = 700, VBH = 380;

  function renderNetwork(scenario) {
    svg.selectAll('*').remove();
    var layers = scenario.layers;
    var nLayers = layers.length;
    var marginX = 90;
    var usableW = VBW - marginX * 2;
    var layerXs = layers.map(function (_, i) {
      return nLayers === 1 ? VBW / 2 : marginX + (usableW * i) / (nLayers - 1);
    });

    var maxNodes = d3.max(layers, function (l) { return l.nodes.length; });
    var topPad = 50, botPad = 40;
    var usableH = VBH - topPad - botPad;

    function nodeY(layerIdx, nodeIdx) {
      var n = layers[layerIdx].nodes.length;
      if (n === 1) return topPad + usableH / 2;
      return topPad + (usableH * nodeIdx) / (n - 1);
    }

    // edges (drawn first, under nodes)
    var edgeG = svg.append('g').attr('class', 'edges');
    for (var li = 0; li < nLayers - 1; li++) {
      var W = scenario.weights[li]; // W[outIdx][inIdx]
      var fromNodes = layers[li].nodes;
      var toNodes = layers[li + 1].nodes;
      for (var o = 0; o < toNodes.length; o++) {
        for (var inIdx = 0; inIdx < fromNodes.length; inIdx++) {
          var w = W[o][inIdx];
          var x1 = layerXs[li], y1 = nodeY(li, inIdx);
          var x2 = layerXs[li + 1], y2 = nodeY(li + 1, o);
          edgeG.append('line')
            .attr('class', 'net-edge')
            .attr('x1', x1).attr('y1', y1)
            .attr('x2', x2).attr('y2', y2)
            .attr('stroke', w >= 0 ? C.accent : C.danger)
            .attr('stroke-opacity', 0.35 + Math.min(Math.abs(w), 1) * 0.4)
            .attr('stroke-width', 1 + Math.min(Math.abs(w), 1.5) * 2.5);
          // weight label at midpoint
          var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
          edgeG.append('rect')
            .attr('x', mx - 14).attr('y', my - 7).attr('width', 28).attr('height', 12)
            .attr('fill', C.node_bg).attr('opacity', 0.85);
          edgeG.append('text')
            .attr('class', 'net-edge-label')
            .attr('x', mx).attr('y', my + 3)
            .attr('text-anchor', 'middle')
            .attr('fill', w >= 0 ? C.accent : C.danger)
            .text(w.toFixed(2));
        }
      }
    }

    // layer names
    layers.forEach(function (l, li) {
      svg.append('text')
        .attr('class', 'net-layer-name')
        .attr('x', layerXs[li]).attr('y', 20)
        .attr('fill', C.text_muted)
        .text(l.name);
    });

    // nodes
    layers.forEach(function (l, li) {
      l.nodes.forEach(function (node, ni) {
        var g = svg.append('g').attr('class', 'net-node')
          .attr('transform', 'translate(' + layerXs[li] + ',' + nodeY(li, ni) + ')');
        g.append('circle')
          .attr('r', 26)
          .attr('fill', C.node_bg)
          .attr('stroke', li === nLayers - 1 ? C.success : C.accent);
        g.append('text')
          .attr('class', 'node-value')
          .attr('text-anchor', 'middle')
          .attr('y', 2)
          .attr('fill', C.text_primary)
          .text(round4(node.value));
        g.append('text')
          .attr('class', 'node-label')
          .attr('text-anchor', 'middle')
          .attr('y', 42)
          .attr('fill', C.text_muted)
          .text(node.label);
      });
    });
  }

  function round4(v) {
    var r = Math.round(v * 10000) / 10000;
    return r.toString();
  }

  // ============================================================
  // SCENARIO SELECTOR
  // ============================================================
  var scenarioBtns = document.querySelectorAll('.scenario-btn');
  var scenarioTitle = document.getElementById('scenario-title');
  var scenarioStory = document.getElementById('scenario-story');
  var traceLog = document.getElementById('fp-trace-log');

  function selectScenario(id) {
    var scenario = D.scenarios.filter(function (s) { return s.id === id; })[0];
    if (!scenario) return;
    scenarioBtns.forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-scenario') === id);
    });
    scenarioTitle.textContent = scenario.title;
    scenarioStory.textContent = scenario.story;
    renderNetwork(scenario);
    traceLog.innerHTML = scenario.trace.map(function (line) { return '<div>' + line + '</div>'; }).join('');
  }

  scenarioBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      selectScenario(btn.getAttribute('data-scenario'));
    });
  });

  selectScenario('single');

  // ============================================================
  // NUMPY DEMO TAB
  // ============================================================
  var goodCard = document.getElementById('numpy-good');
  var badCard = document.getElementById('numpy-bad');
  if (goodCard && badCard) {
    goodCard.querySelector('pre').textContent = D.numpyDemo.good.code;
    goodCard.querySelector('.result').textContent = D.numpyDemo.good.result;
    goodCard.querySelector('.note').textContent = D.numpyDemo.good.note;
    badCard.querySelector('pre').textContent = D.numpyDemo.bad.code;
    badCard.querySelector('.result').textContent = D.numpyDemo.bad.result;
    badCard.querySelector('.note').textContent = D.numpyDemo.bad.note;
  }

})();

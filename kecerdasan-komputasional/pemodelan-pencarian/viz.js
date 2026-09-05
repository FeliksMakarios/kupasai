/*
 * KupasAI - Modul 1: Pemodelan Ruang Keadaan dan Algoritma Pencarian
 */

(function () {
  'use strict';

  var D = KK1_DATA;
  var IS_DARK = document.documentElement.getAttribute('data-theme') === 'dark';
  var C = IS_DARK ? {
    text_muted: '#8b949e', text_primary: '#e6edf3', axis: '#30363d',
    accent: '#58a6ff', danger: '#f85149', success: '#3fb950', grid: '#21262d',
    node_fill: '#161b22',
  } : {
    text_muted: '#656d76', text_primary: '#1f2328', axis: '#d0d7de',
    accent: '#0969da', danger: '#cf222e', success: '#1a7f37', grid: '#eaeef2',
    node_fill: '#ffffff',
  };

  // ============================================================
  // TAB SWITCHING
  // ============================================================
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
  // TAB 1a: ROBOT PENYEDOT DEBU
  // ============================================================
  function robotLabel(s) {
    return (s[0] === 0 ? 'Kiri' : 'Kanan') + ' | ' + (s[1] ? 'Kotor' : 'Bersih') + ',' + (s[2] ? 'Kotor' : 'Bersih');
  }
  function robotKey(s) { return s.join(','); }

  function renderRobotGraph() {
    var svg = d3.select('#robot-graph');
    svg.selectAll('*').remove();
    var pos = {};
    D.robot.states.forEach(function (s) {
      var idx = s[1] * 2 + s[2];
      pos[robotKey(s)] = { x: s[0] === 0 ? 165 : 475, y: 55 + idx * 78 };
    });
    var pathKeys = D.robot.pathStates.map(robotKey);
    var pathEdgeSet = {};
    for (var i = 0; i < pathKeys.length - 1; i++) pathEdgeSet[pathKeys[i] + '>' + pathKeys[i + 1]] = true;

    var g = svg.append('g');
    // edges
    D.robot.edges.forEach(function (e) {
      var p1 = pos[robotKey(e.from)], p2 = pos[robotKey(e.to)];
      if (!p1 || !p2) return;
      var isPath = pathEdgeSet[robotKey(e.from) + '>' + robotKey(e.to)];
      g.append('line')
        .attr('class', 'graph-edge' + (isPath ? ' highlight' : ''))
        .attr('x1', p1.x).attr('y1', p1.y).attr('x2', p2.x).attr('y2', p2.y)
        .attr('marker-end', isPath ? 'url(#arrow-robot)' : null)
        .attr('opacity', isPath ? 1 : 0.25);
    });
    var defs = svg.append('defs');
    defs.append('marker').attr('id', 'arrow-robot').attr('viewBox', '0 0 10 10').attr('refX', 9).attr('refY', 5)
      .attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto-start-reverse')
      .append('path').attr('d', 'M0,0 L10,5 L0,10 Z').attr('fill', C.accent);

    // nodes
    D.robot.states.forEach(function (s) {
      var p = pos[robotKey(s)];
      var isStart = robotKey(s) === robotKey(D.robot.start);
      var isGoal = robotKey(s) === robotKey(D.robot.goal);
      var onPath = pathKeys.indexOf(robotKey(s)) !== -1;
      var node = g.append('g').attr('class', 'graph-node' + (onPath ? ' highlight' : '')).attr('transform', 'translate(' + p.x + ',' + p.y + ')');
      node.append('circle').attr('r', 30)
        .attr('fill', isGoal ? C.success + '22' : (isStart ? C.accent + '22' : C.node_fill))
        .attr('stroke', onPath ? C.accent : C.axis);
      node.append('text').attr('dy', -3).text(s[0] === 0 ? 'Kiri' : 'Kanan');
      node.append('text').attr('dy', 10).style('font-size', '8px').text((s[1] ? 'Kotor' : 'Bersih') + ',' + (s[2] ? 'Kotor' : 'Bersih'));
    });
    svg.append('text').attr('x', 165).attr('y', 20).attr('text-anchor', 'middle').style('font-size', '11px').style('font-weight', 700).attr('fill', C.text_muted).text('Posisi: Kiri');
    svg.append('text').attr('x', 475).attr('y', 20).attr('text-anchor', 'middle').style('font-size', '11px').style('font-weight', 700).attr('fill', C.text_muted).text('Posisi: Kanan');
  }
  renderRobotGraph();

  var robotTbody = document.querySelector('#robot-solution-table tbody');
  D.robot.pathStates.slice(0, -1).forEach(function (s, i) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>Langkah ' + (i + 1) + '</td><td>' + D.robot.solution[i] + '</td><td>' + robotLabel(D.robot.pathStates[i + 1]) + '</td>';
    robotTbody.appendChild(tr);
  });

  // ============================================================
  // TAB 1b: DUA KENDI AIR
  // ============================================================
  function renderKendiGrid() {
    var svg = d3.select('#kendi-grid');
    svg.selectAll('*').remove();
    var K = D.kendi;
    var margin = { left: 50, top: 20, right: 20, bottom: 40 };
    var cell = 55;
    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    var pathSet = {};
    K.jalur.forEach(function (s, i) { pathSet[s.join(',')] = i; });

    for (var x = 0; x <= K.kap1; x++) {
      for (var y = 0; y <= K.kap2; y++) {
        var cx = x * cell, cy = (K.kap2 - y) * cell;
        var key = x + ',' + y;
        var onPath = pathSet.hasOwnProperty(key);
        var isTarget = x === K.target[0] && y === K.target[1];
        var isStart = x === 0 && y === 0;
        g.append('rect').attr('x', cx).attr('y', cy).attr('width', cell - 4).attr('height', cell - 4)
          .attr('rx', 4)
          .attr('fill', isTarget ? C.success + '33' : (onPath ? C.accent + '22' : 'none'))
          .attr('stroke', onPath ? C.accent : C.axis);
        g.append('text').attr('x', cx + (cell - 4) / 2).attr('y', cy + (cell - 4) / 2 + 4)
          .attr('text-anchor', 'middle').style('font-size', '12px').style('font-weight', onPath ? 700 : 400)
          .attr('fill', C.text_primary).text('(' + x + ',' + y + ')');
        if (onPath) {
          g.append('text').attr('x', cx + (cell - 4) - 6).attr('y', cy + 12).attr('text-anchor', 'end')
            .style('font-size', '9px').attr('fill', C.accent).text('#' + pathSet[key]);
        }
      }
    }
    g.append('g').selectAll('text').data(d3.range(0, K.kap1 + 1)).enter().append('text')
      .attr('x', function (d) { return d * cell + (cell - 4) / 2; }).attr('y', (K.kap2 + 1) * cell + 14)
      .attr('text-anchor', 'middle').style('font-size', '10px').attr('fill', C.text_muted)
      .text(function (d) { return 'k1=' + d; });
    g.append('g').selectAll('text').data(d3.range(0, K.kap2 + 1)).enter().append('text')
      .attr('x', -8).attr('y', function (d) { return (K.kap2 - d) * cell + (cell - 4) / 2 + 4; })
      .attr('text-anchor', 'end').style('font-size', '10px').attr('fill', C.text_muted)
      .text(function (d) { return 'k2=' + d; });
  }
  renderKendiGrid();

  var kendiTbody = document.querySelector('#kendi-solution-table tbody');
  D.kendi.jalur.slice(0, -1).forEach(function (s, i) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>Langkah ' + (i + 1) + '</td><td>Aturan ' + D.kendi.aturan[i] + ': ' + D.kendi.aturanNama[D.kendi.aturan[i]] + '</td><td>(' + D.kendi.jalur[i + 1].join(', ') + ')</td>';
    kendiTbody.appendChild(tr);
  });

  // ============================================================
  // TAB 2: BFS / DFS / GREEDY PADA PETA
  // ============================================================
  var PETA_POS = {
    Oradea: [300, 35], Zerind: [165, 75], Arad: [55, 165], Sibiu: [335, 155],
    Fagaras: [500, 110], Timisoara: [55, 300], Rimnicu: [360, 250], Lugoj: [125, 355],
    Pitesti: [455, 300], Bucharest: [590, 365], Mehadia: [150, 405], Drobeta: [230, 405],
    Craiova: [320, 400]
  };

  function pathEdges(jalur) {
    var set = {};
    for (var i = 0; i < jalur.length - 1; i++) {
      var a = jalur[i], b = jalur[i + 1];
      set[[a, b].sort().join('>')] = true;
    }
    return set;
  }

  function renderPetaGraph(algo) {
    var svg = d3.select('#peta-graph');
    svg.selectAll('*').remove();
    var g = svg.append('g');
    var info = D.peta[algo];
    var visitedSet = {};
    (algo === 'dfs' ? D.peta.dfs.urutan : algo === 'bfs' ? D.peta.bfs.langkah.map(function(s){return s.kunjungan;}) : info.jalur).forEach(function(n){ visitedSet[n] = true; });
    var pset = pathEdges(info.jalur);

    D.peta.edges.forEach(function (e) {
      var p1 = PETA_POS[e.from], p2 = PETA_POS[e.to];
      var onPath = pset[[e.from, e.to].sort().join('>')];
      g.append('line').attr('class', 'graph-edge' + (onPath ? ' highlight' : ''))
        .attr('x1', p1[0]).attr('y1', p1[1]).attr('x2', p2[0]).attr('y2', p2[1])
        .attr('opacity', onPath ? 1 : 0.35);
      var mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2;
      g.append('text').attr('class', 'edge-label').attr('x', mx).attr('y', my - 3).attr('text-anchor', 'middle').text(e.jarak);
    });
    Object.keys(PETA_POS).forEach(function (name) {
      var p = PETA_POS[name];
      var onPath = info.jalur.indexOf(name) !== -1;
      var visited = visitedSet[name];
      var node = g.append('g').attr('class', 'graph-node' + (onPath ? ' highlight' : '')).attr('transform', 'translate(' + p[0] + ',' + p[1] + ')');
      node.append('circle').attr('r', 10)
        .attr('fill', onPath ? C.accent + '33' : (visited ? C.text_muted + '22' : C.node_fill))
        .attr('stroke', onPath ? C.accent : C.axis);
      node.append('text').attr('dy', 24).style('font-size', '10px').style('font-weight', onPath ? 700 : 400)
        .style('paint-order', 'stroke').style('stroke', C.node_fill).style('stroke-width', '3px')
        .text(name);
    });
  }

  function renderPetaTable(algo) {
    var label = document.getElementById('peta-result-label');
    var info = D.peta[algo];
    var namaAlgo = { bfs: 'Breadth First Search', dfs: 'Depth First Search', greedy: 'Greedy Best First Search' }[algo];
    label.textContent = namaAlgo + ': ' + info.jalur.join(' → ') + ' (' + info.jarak + ' km, ' + info.dikunjungi + ' simpul dikunjungi)';
    var table = document.getElementById('peta-bfs-table');
    var tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    if (algo === 'bfs') {
      table.style.display = '';
      D.peta.bfs.langkah.forEach(function (s) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + s.kunjungan + '</td><td>' + (s.bucharest ? 'Ya' : 'Tidak') + '</td><td>' + (s.antrian.length ? s.antrian.join(', ') : '-') + '</td>';
        tbody.appendChild(tr);
      });
    } else {
      table.style.display = 'none';
    }
  }

  var petaMode = 'bfs';
  function refreshPeta() {
    renderPetaGraph(petaMode);
    renderPetaTable(petaMode);
  }
  document.querySelectorAll('#peta-mode-buttons .mode-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('#peta-mode-buttons .mode-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      petaMode = btn.getAttribute('data-algo');
      refreshPeta();
    });
  });
  refreshPeta();

  // ============================================================
  // TAB 3: HILL CLIMBING (8-PUZZLE)
  // ============================================================
  function drawPuzzleTile(container, state, title) {
    var block = document.createElement('div');
    block.className = 'puzzle-block';
    var h3 = document.createElement('div');
    h3.className = 'puzzle-title';
    h3.textContent = title;
    block.appendChild(h3);
    var svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.setAttribute('viewBox', '0 0 150 150');
    svgEl.setAttribute('width', '150');
    svgEl.setAttribute('height', '150');
    block.appendChild(svgEl);
    container.appendChild(block);
    var svg = d3.select(svgEl);
    var cell = 48;
    state.forEach(function (v, i) {
      var r = Math.floor(i / 3), c = i % 3;
      var x = c * cell + 3, y = r * cell + 3;
      svg.append('rect').attr('class', 'puzzle-tile' + (v === 0 ? ' blank' : '')).attr('x', x).attr('y', y).attr('width', cell - 6).attr('height', cell - 6).attr('rx', 4);
      if (v !== 0) svg.append('text').attr('class', 'puzzle-tile-text').attr('x', x + (cell - 6) / 2).attr('y', y + (cell - 6) / 2).text(v);
    });
  }

  function renderHillClimb(containerId, chartId, start, goal, simple, steepest, label2) {
    var container = document.getElementById(containerId);
    container.innerHTML = '';
    drawPuzzleTile(container, start, 'Keadaan Awal (h=' + simple.jejakH[0] + ')');
    drawPuzzleTile(container, simple.trace[simple.trace.length - 1], 'Simple HC berhenti (h=' + simple.akhirH + ')' + (simple.stuck ? ' — terjebak' : ''));
    drawPuzzleTile(container, steepest.trace[steepest.trace.length - 1], 'Steepest-Ascent berhenti (h=' + steepest.akhirH + ')' + (steepest.stuck ? ' — terjebak' : ''));
    drawPuzzleTile(container, goal, 'Keadaan Tujuan');

    var svg = d3.select('#' + chartId);
    svg.selectAll('*').remove();
    var W = 640, H = 220, margin = { top: 20, right: 20, bottom: 35, left: 45 };
    var iw = W - margin.left - margin.right, ih = H - margin.top - margin.bottom;
    var maxLen = Math.max(simple.jejakH.length, steepest.jejakH.length);
    var maxH = Math.max.apply(null, simple.jejakH.concat(steepest.jejakH));
    var x = d3.scaleLinear().domain([0, maxLen - 1]).range([0, iw]);
    var y = d3.scaleLinear().domain([0, maxH + 0.5]).range([ih, 0]);
    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    g.append('g').call(d3.axisLeft(y).ticks(Math.min(5, maxH + 1))).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.append('g').attr('transform', 'translate(0,' + ih + ')').call(d3.axisBottom(x).ticks(maxLen).tickFormat(d3.format('d'))).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);
    var line = d3.line().x(function (d, i) { return x(i); }).y(function (d) { return y(d); }).curve(d3.curveMonotoneX);
    g.append('path').datum(simple.jejakH).attr('fill', 'none').attr('stroke', C.accent).attr('stroke-width', 2.5).attr('d', line);
    g.append('path').datum(steepest.jejakH).attr('fill', 'none').attr('stroke', C.danger).attr('stroke-width', 2.5).attr('stroke-dasharray', '5 3').attr('d', line);
    svg.append('text').attr('x', W / 2).attr('y', H - 2).attr('text-anchor', 'middle').attr('fill', C.text_muted).style('font-size', '10px').text('Langkah');
    svg.append('text').attr('transform', 'rotate(-90)').attr('x', -H / 2).attr('y', 12).attr('text-anchor', 'middle').attr('fill', C.text_muted).style('font-size', '10px').text('h (ubin salah tempat)');
    var legend = svg.append('g').attr('transform', 'translate(' + (W - 190) + ',12)');
    legend.append('line').attr('x1', 0).attr('x2', 20).attr('stroke', C.accent).attr('stroke-width', 2.5);
    legend.append('text').attr('x', 26).attr('y', 4).style('font-size', '10px').attr('fill', C.text_secondary || C.text_primary).text('Simple HC');
    legend.append('line').attr('x1', 100).attr('x2', 120).attr('stroke', C.danger).attr('stroke-width', 2.5).attr('stroke-dasharray', '5 3');
    legend.append('text').attr('x', 126).attr('y', 4).style('font-size', '10px').attr('fill', C.text_secondary || C.text_primary).text('Steepest');
  }

  renderHillClimb('puzzle-pair-1', 'hc-chart-1', D.puzzle.start, D.puzzle.goal, D.puzzle.simpleHC, D.puzzle.steepest);
  renderHillClimb('puzzle-pair-2', 'hc-chart-2', D.puzzle.contoh2.start, D.puzzle.goal, D.puzzle.contoh2.simpleHC, D.puzzle.contoh2.steepest);

  // ============================================================
  // TAB 4: MINIMAX & ALPHA-BETA
  // ============================================================
  function treeToHierarchy(node, path) {
    path = path || '';
    if (typeof node === 'number') {
      return { name: String(node), value: node, isLeaf: true, path: path };
    }
    return {
      name: '', isLeaf: false, path: path,
      children: node.map(function (c, i) { return treeToHierarchy(c, path ? path + '/' + i : String(i)); })
    };
  }

  function renderMinimaxTree(data, svgId, mode) {
    var svg = d3.select(svgId);
    svg.selectAll('*').remove();
    var root = d3.hierarchy(treeToHierarchy(data.tree));
    var W = 680, H = 380;
    var treeLayout = d3.tree().size([W - 60, H - 70]);
    treeLayout(root);
    var g = svg.append('g').attr('transform', 'translate(30,20)');

    var visitedSet = {};
    if (mode === 'alphabeta') data.alphabetaVisited.forEach(function (p) { visitedSet[p] = true; });

    function isVisited(d) {
      if (mode === 'minimax') return true;
      return visitedSet.hasOwnProperty(d.data.path);
    }

    g.selectAll('.tree-link').data(root.links()).enter().append('line')
      .attr('class', 'graph-edge')
      .attr('x1', function (d) { return d.source.x; }).attr('y1', function (d) { return d.source.y; })
      .attr('x2', function (d) { return d.target.x; }).attr('y2', function (d) { return d.target.y; })
      .attr('opacity', function (d) { return isVisited(d.target) ? 1 : 0.15; })
      .attr('stroke-dasharray', function (d) { return isVisited(d.target) ? null : '3 3'; });

    var nodes = g.selectAll('.tree-node').data(root.descendants()).enter().append('g')
      .attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; })
      .attr('opacity', function (d) { return isVisited(d) ? 1 : 0.25; });

    nodes.each(function (d, i) {
      var node = d3.select(this);
      var isLeaf = d.data.isLeaf;
      var depth = d.depth;
      var label = isLeaf ? d.data.value : (depth === 0 ? 'MAX' : (depth % 2 === 1 ? 'MIN' : 'MAX'));
      node.append('circle').attr('r', isLeaf ? 15 : 16)
        .attr('fill', isLeaf ? (isVisited(d) ? C.accent + '22' : 'none') : C.node_fill)
        .attr('stroke', isVisited(d) ? (isLeaf ? C.accent : C.axis) : C.text_muted);
      node.append('text').attr('dy', 4).style('font-size', isLeaf ? '13px' : '9px').style('font-weight', isLeaf ? 700 : 600)
        .attr('fill', C.text_primary).text(label);
    });
    svg.attr('viewBox', '0 0 680 400');
  }

  function setupMinimaxTab(data, svgId, buttonsId, tableId, totalDaun) {
    var mode = 'minimax';
    function refresh() {
      renderMinimaxTree(data, svgId, mode);
      var tbody = document.querySelector(tableId + ' tbody');
      tbody.innerHTML = '';
      [
        { nama: 'Min-max Murni', nilai: data.rootValue, daun: data.leavesMinimax },
        { nama: 'Alpha-Beta Pruning', nilai: data.rootValue, daun: data.leavesAlphabeta }
      ].forEach(function (r) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + r.nama + '</td><td>' + r.nilai + '</td><td>' + r.daun + ' dari ' + totalDaun + '</td>';
        tbody.appendChild(tr);
      });
    }
    document.querySelectorAll(buttonsId + ' .mode-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll(buttonsId + ' .mode-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        mode = btn.getAttribute('data-mode');
        refresh();
      });
    });
    refresh();
  }

  setupMinimaxTab(D.minimax, '#minimax-tree', '#minimax-mode-buttons', '#minimax-summary-table', 12);
  setupMinimaxTab(D.minimaxBuku, '#minimax-tree-buku', '#minimax-mode-buttons-buku', '#minimax-summary-table-buku', 9);

})();

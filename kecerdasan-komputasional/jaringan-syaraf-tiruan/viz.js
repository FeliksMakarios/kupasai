/*
 * KupasAI - Modul 4: Jaringan Syaraf Tiruan
 */

(function () {
  'use strict';

  var D = KK4_DATA;
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

  function lineChart(svgSel, series, opts) {
    opts = opts || {};
    var svg = d3.select(svgSel);
    svg.selectAll('*').remove();
    var W = opts.w || 640, H = opts.h || 220;
    var margin = { top: 20, right: 20, bottom: 35, left: 55 };
    var iw = W - margin.left - margin.right, ih = H - margin.top - margin.bottom;
    var allY = series.reduce(function (acc, s) { return acc.concat(s.data.map(function (d) { return d.y; })); }, []);
    var x = d3.scaleLinear().domain([0, d3.max(series[0].data, function (d) { return d.x; })]).range([0, iw]);
    var y = (opts.logY ? d3.scaleLog() : d3.scaleLinear())
      .domain(opts.logY ? [Math.max(1e-6, d3.min(allY)), d3.max(allY)] : [0, d3.max(allY) * 1.1])
      .range([ih, 0]).nice();
    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    g.append('g').call(d3.axisLeft(y).ticks(5, opts.logY ? '~g' : undefined)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.append('g').attr('transform', 'translate(0,' + ih + ')').call(d3.axisBottom(x).ticks(8)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);
    var line = d3.line().x(function (d) { return x(d.x); }).y(function (d) { return y(d.y); }).curve(d3.curveMonotoneX);
    series.forEach(function (s) {
      g.append('path').datum(s.data).attr('fill', 'none').attr('stroke', s.color).attr('stroke-width', 2.5).attr('d', line);
    });
    svg.append('text').attr('x', W / 2).attr('y', H - 2).attr('text-anchor', 'middle').attr('fill', C.text_muted).style('font-size', '10px').text(opts.xLabel || 'Epoch');
    svg.append('text').attr('transform', 'rotate(-90)').attr('x', -H / 2).attr('y', 14).attr('text-anchor', 'middle').attr('fill', C.text_muted).style('font-size', '10px').text(opts.yLabel || 'Galat');
    if (series.length > 1) {
      var legend = svg.append('g').attr('transform', 'translate(' + (W - 150) + ',12)');
      series.forEach(function (s, i) {
        legend.append('line').attr('x1', 0).attr('x2', 18).attr('y1', i * 16).attr('y2', i * 16).attr('stroke', s.color).attr('stroke-width', 2.5);
        legend.append('text').attr('x', 24).attr('y', i * 16 + 4).style('font-size', '10px').attr('fill', C.text_primary).text(s.label);
      });
    }
  }

  function matrixHeatmap(container, title, M, opts) {
    opts = opts || {};
    var block = document.createElement('div');
    block.className = 'matrix-block';
    var h4 = document.createElement('div');
    h4.className = 'matrix-title';
    h4.textContent = title;
    block.appendChild(h4);
    var svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    var cell = opts.cell || 42;
    var rows = M.length, cols = M[0].length;
    svgEl.setAttribute('viewBox', '0 0 ' + (cols * cell + 10) + ' ' + (rows * cell + 10));
    svgEl.setAttribute('width', cols * cell + 10);
    svgEl.setAttribute('height', rows * cell + 10);
    block.appendChild(svgEl);
    container.appendChild(block);
    var svg = d3.select(svgEl);
    var flat = M.flat();
    var color = d3.scaleSequential(d3.interpolateBlues).domain([Math.min.apply(null, flat), Math.max.apply(null, flat)]);
    M.forEach(function (row, r) {
      row.forEach(function (v, c) {
        var bg = d3.color(color(v));
        var luminance = 0.299 * bg.r + 0.587 * bg.g + 0.114 * bg.b;
        svg.append('rect').attr('x', c * cell + 5).attr('y', r * cell + 5).attr('width', cell - 3).attr('height', cell - 3).attr('rx', 3)
          .attr('fill', color(v)).attr('stroke', C.axis);
        svg.append('text').attr('x', c * cell + cell / 2 + 5).attr('y', r * cell + cell / 2 + 5 + 4).attr('text-anchor', 'middle')
          .attr('class', 'matrix-cell-value').attr('fill', luminance < 140 ? '#ffffff' : '#1f2328')
          .text(v.toFixed(2));
      });
    });
  }

  // ============================================================
  // TAB 1: GARIS BATAS KEPUTUSAN
  // ============================================================
  function renderGarisRegion(container, kasus) {
    var block = document.createElement('div');
    var svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.setAttribute('viewBox', '0 0 220 240');
    block.appendChild(svgEl);
    container.appendChild(block);
    var svg = d3.select(svgEl);
    var W = 220, H = 200, pad = 20;
    var x = d3.scaleLinear().domain([0, 1]).range([pad, W - pad]);
    var y = d3.scaleLinear().domain([0, 1]).range([H - pad, pad]);
    var res = 40;
    for (var i = 0; i < res; i++) {
      for (var j = 0; j < res; j++) {
        var x1 = i / (res - 1), x2 = j / (res - 1);
        var val = x1 * kasus.w1 + x2 * kasus.w2;
        var on = val >= 0.5;
        svg.append('rect').attr('x', x(x1) - (W - 2 * pad) / res / 2).attr('y', y(x2) - (H - 2 * pad) / res / 2)
          .attr('width', (W - 2 * pad) / res + 1).attr('height', (H - 2 * pad) / res + 1)
          .attr('fill', on ? C.success : C.danger).attr('opacity', 0.25);
      }
    }
    // decision line: w1*x1+w2*x2=0.5 -> x2 = (0.5 - w1*x1)/w2
    var linePts = [];
    [0, 1].forEach(function (x1) {
      if (Math.abs(kasus.w2) > 1e-9) {
        var x2v = (0.5 - kasus.w1 * x1) / kasus.w2;
        if (x2v >= -0.05 && x2v <= 1.05) linePts.push([x1, x2v]);
      }
    });
    if (linePts.length === 2) {
      svg.append('line').attr('x1', x(linePts[0][0])).attr('y1', y(linePts[0][1]))
        .attr('x2', x(linePts[1][0])).attr('y2', y(linePts[1][1])).attr('stroke', C.text_primary).attr('stroke-width', 2);
    }
    svg.append('circle').attr('cx', x(kasus.p[0])).attr('cy', y(kasus.p[1])).attr('r', 4).attr('fill', C.accent);
    svg.append('circle').attr('cx', x(kasus.q[0])).attr('cy', y(kasus.q[1])).attr('r', 4).attr('fill', C.accent);
    svg.append('rect').attr('x', 0).attr('y', 0).attr('width', W).attr('height', H).attr('fill', 'none').attr('stroke', C.axis);
    svg.append('text').attr('x', W / 2).attr('y', H + 20).attr('text-anchor', 'middle').style('font-size', '11px').style('font-weight', 700)
      .attr('fill', C.text_primary).text('(w1,w2) = (' + kasus.w1.toFixed(3) + ', ' + kasus.w2.toFixed(3) + ')');
  }
  var garisContainer = document.getElementById('garis-grid');
  D.garis.forEach(function (kasus) { renderGarisRegion(garisContainer, kasus); });

  // ============================================================
  // TAB 2: PERAMBATAN MAJU
  // ============================================================
  var fwdContainer = document.getElementById('forward-matrices');
  matrixHeatmap(fwdContainer, 'Bobot Tersembunyi WH (3×3)', D.forward.WH);
  matrixHeatmap(fwdContainer, 'Bobot Luaran WO (3×2)', D.forward.WO);
  var fwdTbody = document.querySelector('#forward-table tbody');
  D.forward.X.forEach(function (x, i) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>(' + x.join(', ') + ')</td>' +
      '<td>[' + D.forward.NH[i].map(function (v) { return v.toFixed(3); }).join(', ') + ']</td>' +
      '<td>[' + D.forward.OH[i].map(function (v) { return v.toFixed(3); }).join(', ') + ']</td>' +
      '<td>[' + D.forward.NO[i].map(function (v) { return v.toFixed(3); }).join(', ') + ']</td>' +
      '<td>[' + D.forward.O[i].map(function (v) { return v.toFixed(3); }).join(', ') + ']</td>';
    fwdTbody.appendChild(tr);
  });

  // ============================================================
  // TAB 3: DELTA & BACKPROP
  // ============================================================
  function renderDeltaView() {
    var container = document.getElementById('delta-view');
    container.innerHTML =
      '<p class="section-note">Aturan delta Widrow-Hoff asli (Bab 7.4.1): pembaruan bobot per-sampel dengan aktivasi ambang &theta;=0.5, ' +
      '&alpha;=0.2, bobot awal (0.3, 0.3) &mdash; persis Gambar 7.5 dan Tabel 7.2/7.3 buku, untuk gerbang OR.</p>' +
      '<table class="iter-table" id="delta-table-or"><thead><tr><th>Epoch</th><th>X1</th><th>X2</th><th>Target</th><th>W1</th><th>W2</th><th>net</th><th>O</th><th>&Delta;W1</th><th>&Delta;W2</th></tr></thead><tbody></tbody></table>' +
      '<div class="section-label" style="margin-top:1.5rem">Gerbang AND dengan Bobot Awal Sama</div>' +
      '<table class="iter-table" id="delta-table-and"><thead><tr><th>Epoch</th><th>X1</th><th>X2</th><th>Target</th><th>W1</th><th>W2</th><th>net</th><th>O</th><th>&Delta;W1</th><th>&Delta;W2</th></tr></thead><tbody></tbody></table>';

    function isiTabel(sel, trace) {
      var tbody = document.querySelector(sel + ' tbody');
      trace.forEach(function (r) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + r.epoch + '</td><td>' + r.x1 + '</td><td>' + r.x2 + '</td><td>' + r.target + '</td>' +
          '<td>' + r.w1.toFixed(1) + '</td><td>' + r.w2.toFixed(1) + '</td><td>' + r.net.toFixed(1) + '</td><td>' + r.o + '</td>' +
          '<td>' + r.dw1.toFixed(1) + '</td><td>' + r.dw2.toFixed(1) + '</td>';
        if (r.dw1 !== 0 || r.dw2 !== 0) tr.style.color = C.accent;
        tbody.appendChild(tr);
      });
    }
    isiTabel('#delta-table-or', D.delta.OR.trace.slice(0, 4));
    isiTabel('#delta-table-and', D.delta.AND.trace.slice(0, 4));

    document.getElementById('delta-sidebar-title').textContent = 'Konvergen dalam Satu Epoch';
    document.getElementById('delta-sidebar-text').innerHTML =
      'Gerbang OR dengan bobot awal (0.3, 0.3) dan &alpha;=0.2 hanya perlu <strong>3 pembaruan bobot</strong> pada epoch pertama untuk konvergen ke W=(0.5, 0.5) &mdash; persis sesuai perhitungan tangan buku setelah Tabel 7.3. Epoch ke-2 sampai ke-4 tidak ada perubahan bobot lagi karena keempat sampel sudah diklasifikasikan benar.' +
      '<br><br>Gerbang AND dengan bobot awal yang sama justru sudah benar <strong>sejak awal</strong> (0 pembaruan) &mdash; kebetulan (0.3, 0.3) dengan &theta;=0.5 sudah cukup memisahkan AND secara linear.';
  }
  function renderBackpropView() {
    var container = document.getElementById('letter-patterns');
    container.innerHTML = '';
    D.backprop.hurufList.forEach(function (h) {
      var block = document.createElement('div');
      block.className = 'letter-block';
      var title = document.createElement('div');
      title.className = 'letter-title';
      title.textContent = h;
      block.appendChild(title);
      var svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      var cell = 16;
      svgEl.setAttribute('viewBox', '0 0 ' + (5 * cell) + ' ' + (5 * cell));
      svgEl.setAttribute('width', 5 * cell);
      svgEl.setAttribute('height', 5 * cell);
      block.appendChild(svgEl);
      container.appendChild(block);
      var svg = d3.select(svgEl);
      var pattern = D.backprop.huruf[h];
      pattern.forEach(function (v, i) {
        var r = Math.floor(i / 5), c = i % 5;
        svg.append('rect').attr('class', 'letter-pixel').attr('x', c * cell).attr('y', r * cell).attr('width', cell).attr('height', cell)
          .attr('fill', v ? C.text_primary : 'none');
      });
    });
    lineChart('#backprop-chart', [{ label: 'Galat', color: C.danger, data: D.backprop.jejakGalat.map(function (v, i) { return { x: i, y: v }; }) }], { yLabel: 'MSE', logY: true });
    var accData = D.backprop.hurufList.map(function (h) { return { label: h, value: D.backprop.akurasi[h] }; });
    var svg = d3.select('#backprop-acc');
    svg.selectAll('*').remove();
    var W = 500, H = 160, margin = { top: 20, right: 20, bottom: 30, left: 40 };
    var iw = W - margin.left - margin.right, ih = H - margin.top - margin.bottom;
    var x = d3.scaleBand().domain(accData.map(function (d) { return d.label; })).range([0, iw]).padding(0.35);
    var y = d3.scaleLinear().domain([0, 1.15]).range([ih, 0]);
    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    g.append('g').call(d3.axisLeft(y).ticks(5, '%')).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.append('g').attr('transform', 'translate(0,' + ih + ')').call(d3.axisBottom(x)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);
    g.selectAll('.bar').data(accData).enter().append('rect')
      .attr('x', function (d) { return x(d.label); }).attr('y', function (d) { return y(d.value); })
      .attr('width', x.bandwidth()).attr('height', function (d) { return ih - y(d.value); }).attr('fill', C.success).attr('rx', 4);
    g.selectAll('.val').data(accData).enter().append('text')
      .attr('x', function (d) { return x(d.label) + x.bandwidth() / 2; }).attr('y', function (d) { return y(d.value) - 6; })
      .attr('text-anchor', 'middle').style('font-size', '11px').style('font-weight', 700).attr('fill', C.text_primary)
      .text(function (d) { return (d.value * 100).toFixed(0) + '%'; });
    document.getElementById('delta-sidebar-title').textContent = 'Belajar dari Pola Bising';
    document.getElementById('delta-sidebar-text').innerHTML =
      'Jaringan dilatih dari 20 gambar huruf A/B/C/D (5 varian tiap huruf) yang diberi derau acak (8% piksel dibalik) &mdash; sesuai jumlah data pelatihan Bab 7.4.2 buku. Galat turun dari <strong>' + D.backprop.galatAwal.toFixed(4) + '</strong> menjadi <strong>' + D.backprop.galatAkhir.toFixed(6) + '</strong> setelah pelatihan, dan seluruh huruf dikenali dengan akurasi 100% pada data latih (buku sendiri melaporkan 98/94/80/83% pada data uji dengan gambar aslinya, yang tidak tersedia sebagai teks untuk direproduksi persis).';
  }
  renderDeltaView();
  document.querySelectorAll('#delta-mode-buttons .mode-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('#delta-mode-buttons .mode-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var mode = btn.getAttribute('data-mode');
      document.getElementById('delta-view').style.display = mode === 'delta' ? '' : 'none';
      document.getElementById('backprop-view').style.display = mode === 'backprop' ? '' : 'none';
      if (mode === 'delta') renderDeltaView(); else renderBackpropView();
    });
  });

  // ============================================================
  // TAB 4: LVQ
  // ============================================================
  var lvqTbody = document.querySelector('#lvq-data-table tbody');
  D.lvq.data.forEach(function (row, i) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>Data ' + (i + 1) + '</td><td>[' + row.join(', ') + ']</td><td>Kelas ' + D.lvq.kelasAkhir[i] + '</td>';
    lvqTbody.appendChild(tr);
  });
  var lvqContainer = document.getElementById('lvq-weights');
  matrixHeatmap(lvqContainer, 'W1 (awal)', [D.lvq.wAwal[0]], { cell: 36 });
  matrixHeatmap(lvqContainer, 'W1 (setelah data ke-3)', [D.lvq.wSetelahData3[0]], { cell: 36 });
  matrixHeatmap(lvqContainer, 'W1 (epoch 30)', [D.lvq.w30[0]], { cell: 36 });
  matrixHeatmap(lvqContainer, 'W2 (epoch 30)', [D.lvq.w30[1]], { cell: 36 });

  // ============================================================
  // TAB 5: KOHONEN NETWORK (SOM)
  // ============================================================
  (function renderSOM() {
    var svg = d3.select('#som-grid');
    svg.selectAll('*').remove();
    var grid = D.som.grid, cell = 100, pad = 40;
    var g = svg.append('g').attr('transform', 'translate(' + pad + ',' + pad + ')');
    for (var i = 0; i < grid[0]; i++) {
      for (var j = 0; j < grid[1]; j++) {
        g.append('rect').attr('x', j * cell).attr('y', i * cell).attr('width', cell - 6).attr('height', cell - 6).attr('rx', 6)
          .attr('fill', 'none').attr('stroke', C.axis);
        g.append('text').attr('x', j * cell + 8).attr('y', i * cell + 16).style('font-size', '9px').attr('fill', C.text_muted).text('(' + i + ',' + j + ')');
      }
    }
    var byNode = {};
    Object.keys(D.som.peta).forEach(function (k) {
      var pos = D.som.peta[k];
      var key = pos.join(',');
      byNode[key] = byNode[key] || [];
      byNode[key].push(k);
    });
    Object.keys(byNode).forEach(function (key) {
      var pos = key.split(',').map(Number);
      var items = byNode[key];
      var cx = pos[1] * cell + (cell - 6) / 2, cy = pos[0] * cell + (cell - 6) / 2 + 8;
      items.forEach(function (label, idx) {
        var angle = (idx / items.length) * 2 * Math.PI;
        var r = items.length > 1 ? 22 : 0;
        var lx = cx + r * Math.cos(angle), ly = cy + r * Math.sin(angle);
        g.append('circle').attr('cx', lx).attr('cy', ly).attr('r', 14).attr('fill', C.accent + '33').attr('stroke', C.accent);
        g.append('text').attr('x', lx).attr('y', ly + 4).attr('text-anchor', 'middle').style('font-size', '11px').style('font-weight', 700).attr('fill', C.text_primary).text(label);
      });
    });
  })();

})();

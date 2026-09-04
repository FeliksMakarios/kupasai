/*
 * KupasAI - Modul 2: Teknik Pemecahan Permasalahan
 */

(function () {
  'use strict';

  var D = KK2_DATA;
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
  var WARNA_HEX = IS_DARK ? ['#f85149', '#3fb950', '#58a6ff'] : ['#cf222e', '#1a7f37', '#0969da'];

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
  // TAB 1: AND-OR TREE
  // ============================================================
  function renderAndOr(data, svgId) {
    var svg = d3.select(svgId);
    svg.selectAll('*').remove();
    var root = d3.hierarchy(data.tree);
    var W = 680, H = 280;
    var treeLayout = d3.tree().size([W - 80, H - 90]);
    treeLayout(root);
    var g = svg.append('g').attr('transform', 'translate(40,20)');

    g.selectAll('.link').data(root.links()).enter().append('line')
      .attr('class', 'graph-edge')
      .attr('x1', function (d) { return d.source.x; }).attr('y1', function (d) { return d.source.y; })
      .attr('x2', function (d) { return d.target.x; }).attr('y2', function (d) { return d.target.y; })
      .attr('opacity', function (d) { return d.target.data.label === 'terpilih' || d.target.data.isLeaf === false || d.target.data.isLeaf ? 1 : 0.3; })
      .attr('stroke', function (d) {
        var anc = d.target;
        return (d.target.data.label === 'terpilih') ? C.accent : C.axis;
      });

    var nodes = g.selectAll('.node').data(root.descendants()).enter().append('g')
      .attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; });
    nodes.each(function (d) {
      var node = d3.select(this);
      var isLeaf = d.data.isLeaf;
      node.append('circle').attr('r', isLeaf ? 16 : 20)
        .attr('fill', isLeaf ? C.accent + '22' : C.node_fill)
        .attr('stroke', isLeaf ? C.accent : C.axis);
      node.append('text').attr('dy', isLeaf ? 4 : -2).style('font-size', isLeaf ? '13px' : '10px').style('font-weight', 700)
        .attr('fill', C.text_primary).text(isLeaf ? d.data.value : d.data.name);
      if (!isLeaf) {
        node.append('text').attr('dy', 10).style('font-size', '8px').attr('fill', C.text_muted).text('biaya=' + d.data.biaya);
      }
    });
    svg.attr('viewBox', '0 0 680 260');
  }
  renderAndOr(D.andor, '#andor-tree');
  document.getElementById('andor-result').textContent = D.andor.biayaMinimum;
  renderAndOr(D.andorBuku, '#andor-tree-buku');
  document.getElementById('andor-result-buku').textContent = D.andorBuku.biayaMinimum;

  // ============================================================
  // TAB 2: PEWARNAAN PETA
  // ============================================================
  var PETA_POS = {
    WA: [90, 190], NT: [220, 90], SA: [230, 210], Q: [340, 100],
    NSW: [370, 240], V: [300, 320], T: [400, 340]
  };
  function renderPetaWarna() {
    var svg = d3.select('#peta-warna');
    svg.selectAll('*').remove();
    var g = svg.append('g');
    Object.keys(D.peta.adjacency).forEach(function (a) {
      D.peta.adjacency[a].forEach(function (b) {
        if (a < b) {
          var p1 = PETA_POS[a], p2 = PETA_POS[b];
          g.append('line').attr('class', 'graph-edge').attr('x1', p1[0]).attr('y1', p1[1]).attr('x2', p2[0]).attr('y2', p2[1]);
        }
      });
    });
    Object.keys(PETA_POS).forEach(function (name) {
      var p = PETA_POS[name];
      var warnaIdx = D.peta.warna[name];
      var node = g.append('g').attr('transform', 'translate(' + p[0] + ',' + p[1] + ')');
      node.append('circle').attr('r', 28).attr('fill', WARNA_HEX[warnaIdx] + '33').attr('stroke', WARNA_HEX[warnaIdx]).attr('stroke-width', 2.5);
      node.append('text').attr('dy', -2).style('font-size', '12px').style('font-weight', 700).attr('fill', C.text_primary).text(name);
      node.append('text').attr('dy', 12).style('font-size', '8px').attr('fill', C.text_muted).text(D.peta.namaWarna[warnaIdx]);
    });
  }
  renderPetaWarna();
  document.getElementById('peta-result').textContent = D.peta.kMin + ' warna (dibuktikan minimum lewat pencarian menyeluruh k=1,2,3)';

  // ============================================================
  // TAB 3: KRIPTARITMATIKA
  // ============================================================
  function renderKripto() {
    var sol = D.kripto.solusi;
    function fmt(word) {
      return word.split('').map(function (ch) { return '<span class="letter">' + ch + '</span>'; }).join('');
    }
    document.getElementById('kripto-sum').innerHTML =
      fmt('SEND') + '<span class="op">+</span>' + fmt('MORE') + '<span class="op">=</span>' + fmt('MONEY') +
      '<br><span class="digit">' + D.kripto.send + '</span><span class="op">+</span><span class="digit">' + D.kripto.more + '</span><span class="op">=</span><span class="digit">' + D.kripto.money + '</span>';

    var tbody = document.querySelector('#kripto-letters-table tbody');
    Object.keys(sol).sort().forEach(function (huruf) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + huruf + '</td><td>' + sol[huruf] + '</td>';
      tbody.appendChild(tr);
    });

    var svg = d3.select('#kripto-bar');
    svg.selectAll('*').remove();
    var W = 640, H = 180, margin = { top: 20, right: 100, bottom: 35, left: 140 };
    var iw = W - margin.left - margin.right, ih = H - margin.top - margin.bottom;
    var data = [
      { label: 'Brute Force', value: D.kripto.kandidatBrute },
      { label: 'Pembangkitan Batasan', value: D.kripto.kandidatBatasan }
    ];
    var x = d3.scaleLog().domain([1, D.kripto.kandidatBrute * 1.2]).range([0, iw]);
    var y = d3.scaleBand().domain(data.map(function (d) { return d.label; })).range([0, ih]).padding(0.4);
    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    g.append('g').call(d3.axisLeft(y)).selectAll('text').attr('fill', C.text_muted).style('font-size', '11px');
    g.append('g').attr('transform', 'translate(0,' + ih + ')').call(d3.axisBottom(x).ticks(4, '~s')).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);
    g.selectAll('.bar').data(data).enter().append('rect')
      .attr('y', function (d) { return y(d.label); }).attr('x', x(1))
      .attr('width', function (d) { return x(d.value) - x(1); }).attr('height', y.bandwidth())
      .attr('fill', function (d, i) { return i === 0 ? C.danger : C.success; }).attr('rx', 4);
    g.selectAll('.val').data(data).enter().append('text')
      .attr('x', function (d) { return x(d.value) + 8; }).attr('y', function (d) { return y(d.label) + y.bandwidth() / 2 + 4; })
      .style('font-size', '11px').style('font-weight', 700).attr('fill', C.text_primary)
      .text(function (d) { return d.value.toLocaleString('id-ID') + ' kandidat'; });
  }
  renderKripto();

  // ============================================================
  // TAB 4: PENALARAN BATASAN RUMAH SAKIT
  // ============================================================
  function renderRSBar() {
    var svg = d3.select('#rs-bar');
    svg.selectAll('*').remove();
    var W = 500, H = 220, margin = { top: 20, right: 30, bottom: 40, left: 50 };
    var iw = W - margin.left - margin.right, ih = H - margin.top - margin.bottom;
    var kategori = ['PP', 'PW', 'DP', 'DW'];
    var labels = { PP: 'Perawat Pria', PW: 'Perawat Wanita', DP: 'Dokter Pria', DW: 'Dokter Wanita' };
    var data = kategori.map(function (k) { return { label: k, full: labels[k], value: D.rumahSakit.komposisi[k] }; });
    var x = d3.scaleBand().domain(kategori).range([0, iw]).padding(0.3);
    var y = d3.scaleLinear().domain([0, d3.max(data, function (d) { return d.value; }) * 1.2]).range([ih, 0]);
    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    g.append('g').call(d3.axisLeft(y).ticks(5)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.append('g').attr('transform', 'translate(0,' + ih + ')').call(d3.axisBottom(x)).selectAll('text').attr('fill', C.text_muted).style('font-size', '10px');
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);
    g.selectAll('.bar').data(data).enter().append('rect')
      .attr('x', function (d) { return x(d.label); }).attr('y', function (d) { return y(d.value); })
      .attr('width', x.bandwidth()).attr('height', function (d) { return ih - y(d.value); })
      .attr('fill', function (d) { return d.label === 'PW' ? C.success : C.accent; }).attr('rx', 4);
    g.selectAll('.val').data(data).enter().append('text')
      .attr('x', function (d) { return x(d.label) + x.bandwidth() / 2; }).attr('y', function (d) { return y(d.value) - 6; })
      .attr('text-anchor', 'middle').style('font-size', '13px').style('font-weight', 700).attr('fill', C.text_primary)
      .text(function (d) { return d.value; });
  }
  renderRSBar();

  var rsTbody = document.querySelector('#rs-table tbody');
  Object.keys(D.rumahSakit.rincian).forEach(function (kat) {
    var dilanggar = D.rumahSakit.rincian[kat];
    var tr = document.createElement('tr');
    var statusCell = dilanggar.length === 0
      ? '<td class="ok">Konsisten — kandidat penutur</td>'
      : '<td class="violate">Melanggar batasan ' + dilanggar.join(', ') + '</td>';
    tr.innerHTML = '<td>' + kat + '</td><td>' + (dilanggar.length ? dilanggar.map(function (n) { return 'Batasan ' + n; }).join(', ') : '-') + '</td>' + statusCell;
    rsTbody.appendChild(tr);
  });

  // ============================================================
  // TAB 5: LOGIC PROGRAMMING SILSILAH
  // ============================================================
  function renderSilsilah() {
    var svg = d3.select('#silsilah-tree');
    svg.selectAll('*').remove();
    // 3 generasi: John/Madeline, Jack/Helen, Oliver/Sophie (gen 1) ->
    // Alice, Ali x Jess, Lily x James, Arline (gen 2) -> Simon, Stev, Harry, Kelly (gen 3)
    var pos = {
      john: [90, 30], madeline: [190, 30],
      jack: [340, 30], helen: [440, 30],
      oliver: [590, 30], sophie: [690, 30],
      alice: [40, 150], ali: [140, 150],
      jess: [280, 150], lily: [400, 150],
      james: [540, 150], arline: [660, 150],
      simon: [180, 270], stev: [260, 270],
      harry: [440, 270], kelly: [520, 270]
    };
    var pasangan = [['john', 'madeline'], ['jack', 'helen'], ['oliver', 'sophie'], ['ali', 'jess'], ['lily', 'james']];
    var g = svg.append('g');
    D.silsilah.parentPairs.forEach(function (f) {
      var p1 = pos[f[0]], p2 = pos[f[1]];
      g.append('line').attr('class', 'graph-edge').attr('x1', p1[0]).attr('y1', p1[1]).attr('x2', p2[0]).attr('y2', p2[1]).attr('marker-end', 'url(#arrow-fam)');
    });
    pasangan.forEach(function (pr) {
      var p1 = pos[pr[0]], p2 = pos[pr[1]];
      g.append('line').attr('x1', p1[0]).attr('y1', p1[1]).attr('x2', p2[0]).attr('y2', p2[1])
        .attr('stroke', C.text_muted).attr('stroke-dasharray', '2 3').attr('stroke-width', 1.5);
    });
    var defs = svg.append('defs');
    defs.append('marker').attr('id', 'arrow-fam').attr('viewBox', '0 0 10 10').attr('refX', 24).attr('refY', 5)
      .attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto-start-reverse')
      .append('path').attr('d', 'M0,0 L10,5 L0,10 Z').attr('fill', C.text_muted);
    var isLaki = {};
    D.silsilah.laki.forEach(function (n) { isLaki[n] = true; });
    Object.keys(pos).forEach(function (name) {
      var p = pos[name];
      var node = g.append('g').attr('transform', 'translate(' + p[0] + ',' + p[1] + ')');
      node.append('circle').attr('r', 20).attr('fill', isLaki[name] ? C.accent + '22' : C.danger + '22')
        .attr('stroke', isLaki[name] ? C.accent : C.danger);
      node.append('text').attr('dy', 4).style('font-size', '9px').attr('fill', C.text_primary).text(name);
    });
    svg.attr('viewBox', '0 0 730 300');
  }
  renderSilsilah();

  var silsilahTbody = document.querySelector('#silsilah-query-table tbody');
  D.silsilah.queries.forEach(function (r) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>' + r.q + '</td><td>' + r.hasil.join(', ') + '</td>';
    silsilahTbody.appendChild(tr);
  });

})();

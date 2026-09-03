/*
 * KupasAI - Decision Tree Visualization
 * ML INF24042 - Week 5
 *
 * Two panels:
 *   1. Entropy & Information Gain (contoh 15-baris dari Modul 5.1)
 *   2. Pohon Keputusan hasil training Scikit-learn (decisiontree_ch6.csv)
 */

(function () {
  'use strict';

  var D = DT_DATA;
  var IS_DARK = document.documentElement.getAttribute('data-theme') === 'dark';
  var C = IS_DARK ? {
    text_muted: '#8b949e',
    text_primary: '#e6edf3',
    accent: '#58a6ff',
    border: '#30363d',
  } : {
    text_muted: '#656d76',
    text_primary: '#1f2328',
    accent: '#0969da',
    border: '#d0d7de',
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
  // TAB 1: ENTROPY & INFORMATION GAIN
  // ============================================================

  var FEATURE_LABELS = {
    mesin: { name: 'Mesin Bensin?', yes: 'Ya (bensin)', no: 'Tidak (diesel)' },
    penggerak: { name: 'Penggerak Depan?', yes: 'Ya (depan)', no: 'Tidak (belakang)' },
    bangku: { name: 'Bangku > 5?', yes: 'Ya (>5)', no: 'Tidak (≤5)' },
  };

  function bar(label, val, max) {
    var pct = Math.round((val / max) * 100);
    return '<div class="entropy-box"><div class="eb-title">' + label + '</div>' +
      '<div class="entropy-bar-wrap"><div class="entropy-bar-track">' +
      '<div class="entropy-bar-fill" style="width:' + pct + '%"></div></div>' +
      '<span class="entropy-bar-val">' + val.toFixed(3) + '</span></div></div>';
  }

  function renderSplit(key) {
    var s = D.toy.splits[key];
    var lbl = FEATURE_LABELS[key];
    var html = '<div class="entropy-flow">';
    html += bar('Entropy sebelum split (seluruh data, n=' + D.toy.rows.length + ')', s.entropy_before, 1);
    html += '<div class="entropy-arrow">&darr; split berdasarkan &ldquo;' + lbl.name + '&rdquo; &darr;</div>';
    html += '<div class="entropy-children">';
    html += bar(lbl.yes + ' (n=' + s.n_yes + ')', s.entropy_yes, 1);
    html += bar(lbl.no + ' (n=' + s.n_no + ')', s.entropy_no, 1);
    html += '</div>';
    html += '<div class="entropy-ig">Information Gain = ' + s.entropy_before.toFixed(3) + ' &minus; ' +
      s.weighted.toFixed(3) + ' = <strong>' + s.ig.toFixed(3) + '</strong></div>';
    html += '</div>';
    document.getElementById('entropy-viz').innerHTML = html;
  }

  document.querySelectorAll('#tab-entropy .model-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('#tab-entropy .model-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      renderSplit(btn.getAttribute('data-feat'));
    });
  });

  var best = Object.keys(D.toy.splits).reduce(function (a, b) {
    return D.toy.splits[a].ig > D.toy.splits[b].ig ? a : b;
  });
  document.getElementById('entropy-best').textContent =
    FEATURE_LABELS[best].name + ' (IG = ' + D.toy.splits[best].ig.toFixed(3) + ')';

  // ============================================================
  // TAB 2: REAL TREE
  // ============================================================

  function initTree() {
    var root = d3.hierarchy(D.real.tree, function (n) {
      return n.left ? [n.left, n.right] : null;
    });
    var W = 700, H = 380;
    var treeLayout = d3.tree().size([W - 80, H - 80]);
    treeLayout(root);

    var svg = d3.select('#tree-plot');
    var g = svg.append('g').attr('transform', 'translate(40,40)');

    g.selectAll('.tree-link').data(root.links()).enter().append('path')
      .attr('class', 'tree-link')
      .attr('d', d3.linkVertical().x(function (d) { return d.x; }).y(function (d) { return d.y; }));

    var node = g.selectAll('.tree-node').data(root.descendants()).enter().append('g')
      .attr('class', 'tree-node')
      .attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; });

    var boxW = 118, boxH = 52;
    node.append('rect')
      .attr('class', function (d) {
        var base = 'tree-node-box';
        if (!d.data.left) base += d.data.predicted_class === 'sedan' ? ' leaf-sedan' : ' leaf-minibus';
        return base;
      })
      .attr('x', -boxW / 2).attr('y', -boxH / 2)
      .attr('width', boxW).attr('height', boxH)
      .attr('rx', 6);

    node.append('text').attr('class', 'tree-label')
      .attr('text-anchor', 'middle').attr('y', -14)
      .style('fill', C.text_primary).style('font-weight', '700')
      .text(function (d) {
        return d.data.left ? (d.data.feature + ' ≤ ' + d.data.threshold + '?') : ('daun: ' + d.data.predicted_class);
      });

    node.append('text').attr('class', 'tree-label')
      .attr('text-anchor', 'middle').attr('y', 2)
      .style('fill', C.text_muted)
      .text(function (d) { return 'samples=' + d.data.samples; });

    node.append('text').attr('class', 'tree-label')
      .attr('text-anchor', 'middle').attr('y', 15)
      .style('fill', C.text_muted)
      .text(function (d) { return 'minibus=' + d.data.value[0] + ', sedan=' + d.data.value[1]; });

    // edge labels (ya = kiri/threshold terpenuhi, tidak = kanan)
    var edgeLabels = [];
    root.descendants().forEach(function (d) {
      if (!d.children) return;
      edgeLabels.push({ source: d, target: d.children[0], text: 'ya' });
      edgeLabels.push({ source: d, target: d.children[1], text: 'tidak' });
    });
    g.selectAll('.edge-label').data(edgeLabels).enter().append('text')
      .attr('class', 'tree-label')
      .attr('x', function (d) { return (d.source.x + d.target.x) / 2; })
      .attr('y', function (d) { return (d.source.y + d.target.y) / 2 - 4; })
      .attr('text-anchor', 'middle')
      .style('fill', C.accent).style('font-weight', '600')
      .text(function (d) { return d.text; });

    document.getElementById('tree-accuracy').textContent = (D.real.accuracy * 100).toFixed(1) + '%';
    document.getElementById('tree-nrows').textContent = D.real.n_rows;
  }

  renderSplit('bangku');
  document.querySelector('#tab-entropy .model-btn[data-feat="bangku"]').classList.add('active');
  initTree();
})();

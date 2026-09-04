/*
 * KupasAI - CNN Basics Visualization
 * ML Lanjut IN F24141 - Week 11
 */

(function () {
  'use strict';

  var D = CNN_DATA;
  var IS_DARK = document.documentElement.getAttribute('data-theme') === 'dark';
  var C = IS_DARK ? {
    text_muted: '#8b949e', text_primary: '#e6edf3', axis: '#30363d',
    accent: '#58a6ff', danger: '#f85149', success: '#3fb950', node_bg: '#161b22',
  } : {
    text_muted: '#656d76', text_primary: '#1f2328', axis: '#d0d7de',
    accent: '#0969da', danger: '#cf222e', success: '#1a7f37', node_bg: '#ffffff',
  };

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
  // GRID RENDERER (generic heatmap grid)
  // ============================================================
  function renderGrid(svgSel, matrix, opts) {
    opts = opts || {};
    var svg = d3.select(svgSel);
    svg.selectAll('*').remove();
    var cell = opts.cell || 34;
    var rows = matrix.length, cols = matrix[0].length;
    var W = cols * cell, H = rows * cell;
    svg.attr('viewBox', '0 0 ' + W + ' ' + H);
    var flat = [];
    matrix.forEach(function (row) { row.forEach(function (v) { flat.push(v); }); });
    var color;
    if (opts.grayscale) {
      color = d3.scaleLinear().domain([0, 10]).range(['#111', '#fff']);
    } else {
      var maxAbs = d3.max(flat, Math.abs) || 1;
      color = d3.scaleLinear().domain([-maxAbs, 0, maxAbs]).range([C.danger, IS_DARK ? '#21262d' : '#f6f8fa', C.success]);
    }
    matrix.forEach(function (row, ri) {
      row.forEach(function (v, ci) {
        var x = ci * cell, y = ri * cell;
        var highlighted = opts.highlight && opts.highlight(ri, ci);
        svg.append('rect').attr('x', x).attr('y', y).attr('width', cell - 2).attr('height', cell - 2)
          .attr('fill', color(v))
          .attr('stroke', highlighted ? (IS_DARK ? '#fff' : '#000') : 'none')
          .attr('stroke-width', highlighted ? 2.5 : 0);
        if (opts.showValue) {
          svg.append('text').attr('class', 'grid-cell-value').attr('x', x + (cell - 2) / 2).attr('y', y + (cell - 2) / 2 + 4)
            .attr('text-anchor', 'middle')
            .attr('fill', opts.grayscale ? (v > 5 ? '#000' : '#fff') : (Math.abs(v) > (d3.max(flat, Math.abs) * 0.55) ? '#fff' : C.text_primary))
            .text(v);
        }
      });
    });
  }

  // ============================================================
  // TAB 1: INTERACTIVE CONVOLUTION
  // ============================================================
  var posSlider = document.getElementById('conv-pos-slider');
  var posVal = document.getElementById('conv-pos-value');

  function renderConv() {
    var pos = parseInt(posSlider.value, 10); // column offset 0-3
    posVal.textContent = pos;

    renderGrid('#conv-image', D.image, {
      cell: 34, grayscale: true,
      highlight: function (r, c) { return r >= 0 && r < 3 && c >= pos && c < pos + 3; }
    });
    renderGrid('#conv-kernel', D.kernel, { cell: 34, showValue: true });
    renderGrid('#conv-featuremap', D.featureMap, {
      cell: 34, showValue: true,
      highlight: function (r, c) { return c === pos; }
    });
    renderGrid('#conv-pooled', D.pooled, { cell: 34, showValue: true });

    // trace: dot product at row 0, col=pos
    var region = [];
    for (var rr = 0; rr < 3; rr++) {
      var rowVals = [];
      for (var cc = 0; cc < 3; cc++) rowVals.push(D.image[rr][pos + cc]);
      region.push(rowVals);
    }
    var terms = [];
    var sum = 0;
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        var prod = region[i][j] * D.kernel[i][j];
        sum += prod;
        if (D.kernel[i][j] !== 0) terms.push('(' + region[i][j] + '&times;' + D.kernel[i][j] + ')');
      }
    }
    document.getElementById('conv-trace').innerHTML =
      'Posisi kernel: kolom ' + pos + '&ndash;' + (pos + 2) + ', baris 0&ndash;2<br>' +
      'Jumlah elementwise: ' + terms.join(' + ') + ' = <strong>' + sum + '</strong>' +
      ' &rarr; feature_map[0][' + pos + '] = ' + D.featureMap[0][pos];
  }
  if (posSlider) {
    posSlider.addEventListener('input', renderConv);
    renderConv();
  }

  // ============================================================
  // TAB 2: ARCHITECTURE
  // ============================================================
  var archList = document.getElementById('arch-list');
  if (archList) {
    D.architecture.forEach(function (layer, i) {
      var item = document.createElement('div');
      item.className = 'arch-item';
      item.innerHTML = '<span class="arch-layer">' + layer.layer + '</span>' +
        '<span class="arch-detail">' + layer.detail + '</span>' +
        '<span class="arch-note">' + layer.note + '</span>';
      archList.appendChild(item);
      if (i < D.architecture.length - 1) {
        var arrow = document.createElement('div');
        arrow.className = 'arch-arrow';
        arrow.textContent = '↓';
        archList.appendChild(arrow);
      }
    });
  }

})();

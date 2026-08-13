/*
 * KupasAI - Self-Attention Visualization
 * NLP INF20161 - Week 5-6
 *
 * Three interactive panels:
 *   1. Attention Matrix Heatmap (which word attends to which)
 *   2. Query-Key-Value step-by-step pipeline
 *   3. Multi-Head Attention comparison
 */

(function () {
  'use strict';

  var DATA = ATTENTION_DATA;
  var COLORS = {
    text_muted: '#656d76',
    text_primary: '#1f2328',
    text_secondary: '#4b5563',
    axis: '#d0d7de',
    grid: '#eaeef2',
    accent: '#0969da',
    pos: '#1a7f37',
    neg: '#cf222e',
    orange: '#9a6700',
    purple: '#8250df',
    q_color: '#0969da',
    k_color: '#9a6700',
    v_color: '#1a7f37',
    out_color: '#8250df',
  };

  // ============================================================
  // TAB SWITCHING
  // ============================================================

  var tabBtns = document.querySelectorAll('.tab-btn');
  var tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-tab');
      tabBtns.forEach(function (b) { b.classList.remove('active'); });
      tabContents.forEach(function (c) { c.classList.remove('active'); });
      btn.classList.add('active');
      document.getElementById('tab-' + target).classList.add('active');
    });
  });

  // ============================================================
  // TAB 1: ATTENTION MATRIX HEATMAP
  // ============================================================

  function initMatrix() {
    var selectEl = document.getElementById('matrix-sentence');
    var svg = d3.select('#matrix-plot');
    var hintEl = document.getElementById('matrix-hint');
    var currentSent = 0;

    DATA.sentences.forEach(function (sent, i) {
      var opt = document.createElement('option');
      opt.value = i;
      opt.textContent = sent.words.join(' ');
      selectEl.appendChild(opt);
    });

    function draw() {
      var sent = DATA.sentences[currentSent];
      var words = sent.words;
      var weights = sent.single_head.weights;
      var n = words.length;

      svg.selectAll('*').remove();
      var W = 600, H = 400;
      var labelW = 80;
      var labelH = 50;
      var cellSize = Math.min((W - labelW - 20) / n, (H - labelH - 20) / n, 65);
      var gridW = cellSize * n;
      var gridH = cellSize * n;
      var offsetX = (W - gridW) / 2 + 10;
      var offsetY = labelH;

      var g = svg.append('g');

      // Color scale
      var colorScale = d3.scaleSequential(d3.interpolateRgb('#f6f8fa', '#0969da'))
        .domain([0, 1]);

      // Draw cells
      for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
          (function (ri, cj) {
            var val = weights[ri][cj];
            var cx = offsetX + cj * cellSize;
            var cy = offsetY + ri * cellSize;

            g.append('rect')
              .attr('x', cx).attr('y', cy)
              .attr('width', cellSize - 2).attr('height', cellSize - 2)
              .attr('rx', 3)
              .attr('fill', colorScale(val))
              .attr('stroke', 'white')
              .attr('stroke-width', 1.5)
              .style('cursor', 'pointer')
              .on('mouseover', function () {
                d3.select(this).attr('stroke', COLORS.orange).attr('stroke-width', 2.5);
                hintEl.textContent =
                  '"' + words[ri] + '" memperhatikan "' + words[cj] +
                  '" dengan bobot ' + val.toFixed(3);
              })
              .on('mouseout', function () {
                d3.select(this).attr('stroke', 'white').attr('stroke-width', 1.5);
              })
              .on('click', function () {
                hintEl.innerHTML =
                  '<strong style="color:' + COLORS.accent + '">' + words[ri] + '</strong> ' +
                  '(Query) memperhatikan <strong style="color:' + COLORS.accent + '">' +
                  words[cj] + '</strong> (Key) dengan bobot ' +
                  '<strong>' + (val * 100).toFixed(1) + '%</strong>';
              });

            // Value text in cell (if large enough)
            if (cellSize >= 40) {
              var textColor = val > 0.5 ? 'white' : COLORS.text_muted;
              g.append('text')
                .attr('x', cx + cellSize / 2 - 1)
                .attr('y', cy + cellSize / 2 + 4)
                .attr('text-anchor', 'middle')
                .attr('font-size', '11px')
                .attr('fill', textColor)
                .attr('font-weight', val > 0.3 ? '700' : '400')
                .text(val.toFixed(2));
            }
          })(i, j);
        }
      }

      // Column labels (Keys - top)
      words.forEach(function (word, j) {
        g.append('text')
          .attr('x', offsetX + j * cellSize + cellSize / 2 - 1)
          .attr('y', offsetY - 10)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('fill', COLORS.k_color)
          .attr('font-weight', '600')
          .text(word);
      });

      // Row labels (Queries - left)
      words.forEach(function (word, i) {
        g.append('text')
          .attr('x', offsetX - 8)
          .attr('y', offsetY + i * cellSize + cellSize / 2 + 4)
          .attr('text-anchor', 'end')
          .attr('font-size', '12px')
          .attr('fill', COLORS.q_color)
          .attr('font-weight', '600')
          .text(word);
      });

      // Axis titles
      g.append('text')
        .attr('x', offsetX + gridW / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .attr('fill', COLORS.k_color)
        .text('KEY (kata yang dilihat)');

      g.append('text')
        .attr('x', 15)
        .attr('y', offsetY + gridH / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .attr('fill', COLORS.q_color)
        .attr('transform', 'rotate(-90 15 ' + (offsetY + gridH / 2) + ')')
        .text('QUERY (kata yang melihat)');

      // Legend bar
      var legendW = 120;
      var legendX = offsetX + gridW + 20;
      var legendY = offsetY;
      for (var k = 0; k <= 20; k++) {
        var frac = k / 20;
        g.append('rect')
          .attr('x', legendX)
          .attr('y', legendY + (legendW / 20) * k)
          .attr('width', 12)
          .attr('height', legendW / 20 + 1)
          .attr('fill', colorScale(1 - frac));
      }
      g.append('text')
        .attr('x', legendX - 2).attr('y', legendY - 5)
        .attr('font-size', '9px').attr('fill', COLORS.text_muted)
        .attr('text-anchor', 'end').attr('transform', 'rotate(-90 ' + (legendX - 2) + ' ' + (legendY - 5) + ')')
        .text('tinggi');
      g.append('text')
        .attr('x', legendX - 2).attr('y', legendY + legendW + 12)
        .attr('font-size', '9px').attr('fill', COLORS.text_muted)
        .attr('text-anchor', 'end').attr('transform', 'rotate(-90 ' + (legendX - 2) + ' ' + (legendY + legendW + 12) + ')')
        .text('rendah');

      g.append('text')
        .attr('x', legendX + 6).attr('y', legendY + legendW + 25)
        .attr('text-anchor', 'middle').attr('font-size', '9px')
        .attr('fill', COLORS.text_muted).text('Bobot');
    }

    selectEl.addEventListener('change', function () {
      currentSent = parseInt(this.value);
      draw();
    });

    draw();
  }

  // ============================================================
  // TAB 2: QKV STEP-BY-STEP
  // ============================================================

  function initQKV() {
    var selectEl = document.getElementById('qkv-sentence');
    var svg = d3.select('#qkv-plot');
    var stepPrev = document.getElementById('qkv-prev');
    var stepNext = document.getElementById('qkv-next');
    var indicator = document.getElementById('qkv-indicator');
    var detailEl = document.getElementById('qkv-detail');
    var currentSent = 0;
    var currentStep = 1;
    var TOTAL_STEPS = 5;

    DATA.sentences.forEach(function (sent, i) {
      var opt = document.createElement('option');
      opt.value = i;
      opt.textContent = sent.words.join(' ');
      selectEl.appendChild(opt);
    });

    var STEP_TITLES = [
      'Input Embeddings',
      'Proyeksi Query (Q)',
      'Proyeksi Key (K)',
      'Skor Attention: Q . K^T',
      'Output: softmax . V',
    ];

    function draw() {
      var sent = DATA.sentences[currentSent];
      var head = sent.single_head;
      var words = sent.words;
      var n = words.length;

      svg.selectAll('*').remove();
      var W = 700, H = 380;
      var g = svg.append('g');

      var colSpacing = Math.min(120, (W - 40) / Math.max(n, 3));
      var startX = (W - colSpacing * (n - 1)) / 2;

      var embY = 60;
      var qkvY = 200;
      var scoreY = 340;
      var outY = 440;

      var currentTitle = STEP_TITLES[currentStep - 1];

      // Draw step-specific content
      if (currentStep === 1) {
        // Show embeddings
        drawRow(g, words, startX, embY, colSpacing, COLORS.accent, 'x', head, 'input');
        drawDetail(1);
      } else if (currentStep === 2) {
        // Show Q
        drawRow(g, words, startX, embY, colSpacing, COLORS.accent, 'x', head, 'input', 0.25);
        drawArrowsDown(g, startX, embY, colSpacing, n, qkvY);
        drawRow(g, words, startX, qkvY, colSpacing, COLORS.q_color, 'q', head, 'Q');
        drawDetail(2);
      } else if (currentStep === 3) {
        // Show Q and K
        drawRow(g, words, startX, embY, colSpacing, COLORS.accent, 'x', head, 'input', 0.25);
        drawArrowsDown(g, startX, embY, colSpacing, n, qkvY);
        drawRow(g, words, startX, qkvY, colSpacing, COLORS.q_color, 'q', head, 'Q');
        drawArrowsDown(g, startX, qkvY, colSpacing, n, qkvY + 0);
        drawRow(g, words, startX, qkvY + 0, colSpacing, COLORS.k_color, 'k', head, 'K', 1, true);
        // Actually just show K below Q with offset
        svg.selectAll('*').remove();
        g = svg.append('g');
        var kY = 300;
        drawRow(g, words, startX, embY, colSpacing, COLORS.accent, 'x', head, 'input', 0.2);
        drawArrowsDown(g, startX, embY, colSpacing, n, qkvY);
        drawRow(g, words, startX, qkvY, colSpacing, COLORS.q_color, 'q', head, 'Q', 1, false);
        drawArrowsDown(g, startX, qkvY, colSpacing, n, kY);
        drawRow(g, words, startX, kY, colSpacing, COLORS.k_color, 'k', head, 'K', 1, false);
        drawDetail(3);
      } else if (currentStep === 4) {
        // Show attention weights matrix (compact)
        drawAttentionWeights(g, head, words, startX, embY, colSpacing);
        drawDetail(4);
      } else if (currentStep === 5) {
        // Show output
        drawOutput(g, head, words, startX, embY, colSpacing);
        drawDetail(5);
      }

      stepPrev.disabled = currentStep === 1;
      stepNext.disabled = currentStep === TOTAL_STEPS;
      indicator.textContent = 'Langkah ' + currentStep + ' / ' + TOTAL_STEPS;
    }

    function drawDetail(step) {
      var sent = DATA.sentences[currentSent];
      var head = sent.single_head;
      var words = sent.words;
      var html = '<div class="detail-title">Langkah ' + step + ': ' + STEP_TITLES[step - 1] + '</div>';

      if (step === 1) {
        html += '<p>Setiap kata dikonversi menjadi vektor embedding. Di model nyata, vektor ini berdimensi ratusan, ' +
          'di sini disederhanakan menjadi 8 dimensi. Vektor inilah input untuk mekanisme attention.</p>';
      } else if (step === 2) {
        html += '<p>Embedding dikalikan dengan matriks bobot <span class="detail-val">W_Q</span> ' +
          'untuk menghasilkan vektor Query. Q menentukan "apa yang kata ini cari" dari kata lain.</p>';
      } else if (step === 3) {
        html += '<p>Embedding juga dikalikan dengan <span class="detail-val">W_K</span> untuk menghasilkan Key. ' +
          'K menentukan "apa yang kata ini tawarkan". Q dan K dihitung dari embedding yang sama tapi dengan bobot berbeda.</p>';
      } else if (step === 4) {
        html += '<p>Dot product Q &middot; K<sup>T</sup> menghasilkan skor kecocokan antar kata. ' +
          'Setelah <span class="detail-val">softmax</span>, skor menjadi bobot attention yang jumlahnya 1 per baris. ' +
          'Warna gelap = attention tinggi.</p>';
      } else if (step === 5) {
        html += '<p>Bobot attention dikalikan dengan Value (V) untuk menghasilkan output. ' +
          'Output setiap kata adalah campuran informasi dari semua kata, dengan kata yang paling "diperhatikan" ' +
          'berkontribusi paling besar. Output inilah yang diteruskan ke layer berikutnya di Transformer.</p>';
      }

      detailEl.innerHTML = html;
    }

    function drawRow(g, words, startX, y, spacing, color, prefix, head, type, opacity) {
      opacity = opacity || 1;
      var n = words.length;
      for (var i = 0; i < n; i++) {
        var x = startX + i * spacing;
        var label = prefix + '\u2080\u2081\u2082\u2083\u2084\u2085'[i] || (prefix + (i + 1));

        // Node circle
        g.append('circle')
          .attr('cx', x).attr('cy', y).attr('r', 14)
          .attr('fill', color).attr('opacity', opacity)
          .attr('stroke', 'white').attr('stroke-width', 1.5);
        g.append('text')
          .attr('x', x).attr('y', y + 4)
          .attr('text-anchor', 'middle').attr('font-size', '9px')
          .attr('fill', 'white').attr('opacity', opacity).attr('font-weight', '600')
          .text(prefix + subscript(i + 1));

        // Word label
        g.append('text')
          .attr('x', x).attr('y', y + 34)
          .attr('text-anchor', 'middle').attr('font-size', '11px')
          .attr('fill', COLORS.text_primary).attr('opacity', opacity)
          .attr('font-weight', '600')
          .text(words[i]);

        // Vector values (if Q/K/V)
        if (type === 'Q' && head.Q) {
          g.append('text')
            .attr('x', x).attr('y', y + 50)
            .attr('text-anchor', 'middle').attr('font-size', '8px')
            .attr('fill', COLORS.text_muted).attr('opacity', opacity)
            .text('[' + head.Q[i].map(function (v) { return v.toFixed(1); }).join(' ') + ']');
        } else if (type === 'K' && head.K) {
          g.append('text')
            .attr('x', x).attr('y', y + 50)
            .attr('text-anchor', 'middle').attr('font-size', '8px')
            .attr('fill', COLORS.text_muted).attr('opacity', opacity)
            .text('[' + head.K[i].map(function (v) { return v.toFixed(1); }).join(' ') + ']');
        }
      }
    }

    function drawArrowsDown(g, startX, fromY, spacing, n, toY) {
      for (var i = 0; i < n; i++) {
        var x = startX + i * spacing;
        g.append('line')
          .attr('x1', x).attr('y1', fromY + 14)
          .attr('x2', x).attr('y2', toY - 14)
          .attr('stroke', COLORS.grid).attr('stroke-width', 1.5);
      }
    }

    function drawAttentionWeights(g, head, words, startX, startY, spacing) {
      var n = words.length;
      var weights = head.weights;
      var cellSize = Math.min(spacing + 5, 55);
      var matStartX = (700 - cellSize * n) / 2;
      var matStartY = 100;

      var colorScale = d3.scaleSequential(d3.interpolateRgb('#f6f8fa', '#0969da')).domain([0, 1]);

      // Title
      g.append('text')
        .attr('x', 350).attr('y', 35)
        .attr('text-anchor', 'middle').attr('font-size', '14px')
        .attr('font-weight', '700').attr('fill', COLORS.text_primary)
        .text('softmax(Q \u00B7 K\u1D40 / \u221Ad)');

      // Column labels
      words.forEach(function (word, j) {
        g.append('text')
          .attr('x', matStartX + j * cellSize + cellSize / 2)
          .attr('y', matStartY - 8)
          .attr('text-anchor', 'middle').attr('font-size', '10px')
          .attr('fill', COLORS.k_color).attr('font-weight', '600')
          .text(word);
      });

      // Row labels + cells
      for (var i = 0; i < n; i++) {
        g.append('text')
          .attr('x', matStartX - 8)
          .attr('y', matStartY + i * cellSize + cellSize / 2 + 3)
          .attr('text-anchor', 'end').attr('font-size', '10px')
          .attr('fill', COLORS.q_color).attr('font-weight', '600')
          .text(words[i]);

        for (var j = 0; j < n; j++) {
          var val = weights[i][j];
          g.append('rect')
            .attr('x', matStartX + j * cellSize)
            .attr('y', matStartY + i * cellSize)
            .attr('width', cellSize - 2).attr('height', cellSize - 2)
            .attr('rx', 2)
            .attr('fill', colorScale(val))
            .attr('stroke', 'white').attr('stroke-width', 1);

          if (cellSize >= 35) {
            g.append('text')
              .attr('x', matStartX + j * cellSize + cellSize / 2 - 1)
              .attr('y', matStartY + i * cellSize + cellSize / 2 + 3)
              .attr('text-anchor', 'middle').attr('font-size', '9px')
              .attr('fill', val > 0.5 ? 'white' : COLORS.text_muted)
              .attr('font-weight', val > 0.3 ? '700' : '400')
              .text(val.toFixed(2));
          }
        }
      }
    }

    function drawOutput(g, head, words, startX, startY, spacing) {
      var n = words.length;
      var output = head.output;
      var y = 100;

      // Title
      g.append('text')
        .attr('x', 350).attr('y', 50)
        .attr('text-anchor', 'middle').attr('font-size', '14px')
        .attr('font-weight', '700').attr('fill', COLORS.text_primary)
        .text('Output = softmax(Q\u00B7K\u1D40) \u00B7 V');

      for (var i = 0; i < n; i++) {
        var x = startX + i * spacing;

        g.append('circle')
          .attr('cx', x).attr('cy', y).attr('r', 16)
          .attr('fill', COLORS.out_color).attr('opacity', 0.9)
          .attr('stroke', 'white').attr('stroke-width', 1.5);
        g.append('text')
          .attr('x', x).attr('y', y + 4)
          .attr('text-anchor', 'middle').attr('font-size', '9px')
          .attr('fill', 'white').attr('font-weight', '600')
          .text('z' + subscript(i + 1));

        g.append('text')
          .attr('x', x).attr('y', y + 34)
          .attr('text-anchor', 'middle').attr('font-size', '11px')
          .attr('fill', COLORS.text_primary).attr('font-weight', '600')
          .text(words[i]);

        g.append('text')
          .attr('x', x).attr('y', y + 50)
          .attr('text-anchor', 'middle').attr('font-size', '8px')
          .attr('fill', COLORS.text_muted)
          .text('[' + output[i].map(function (v) { return v.toFixed(1); }).join(' ') + ']');
      }

      // Caption
      g.append('text')
        .attr('x', 350).attr('y', 200)
        .attr('text-anchor', 'middle').attr('font-size', '11px')
        .attr('fill', COLORS.text_muted)
        .text('Setiap z adalah campuran informasi dari semua Value,');

      g.append('text')
        .attr('x', 350).attr('y', 216)
        .attr('text-anchor', 'middle').attr('font-size', '11px')
        .attr('fill', COLORS.text_muted)
        .text('dibobotkan oleh attention weight.');
    }

    function subscript(n) {
      var subs = '\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089';
      return String(n).split('').map(function (d) { return subs[parseInt(d)]; }).join('');
    }

    stepNext.addEventListener('click', function () {
      if (currentStep < TOTAL_STEPS) { currentStep++; draw(); }
    });
    stepPrev.addEventListener('click', function () {
      if (currentStep > 1) { currentStep--; draw(); }
    });
    selectEl.addEventListener('change', function () {
      currentSent = parseInt(this.value);
      currentStep = 1;
      draw();
    });

    draw();
  }

  // ============================================================
  // TAB 3: MULTI-HEAD ATTENTION
  // ============================================================

  function initMultiHead() {
    var selectEl = document.getElementById('mh-sentence');
    var headBtnsEl = document.getElementById('mh-head-buttons');
    var svg = d3.select('#mh-plot');
    var currentSent = 0;
    var currentHead = 0;

    DATA.sentences.forEach(function (sent, i) {
      var opt = document.createElement('option');
      opt.value = i;
      opt.textContent = sent.words.join(' ');
      selectEl.appendChild(opt);
    });

    // Head buttons
    DATA.heads.forEach(function (head, i) {
      var btn = document.createElement('button');
      btn.className = 'mh-btn' + (i === 0 ? ' active' : '');
      btn.textContent = head.name;
      btn.dataset.head = i;
      btn.addEventListener('click', function () {
        headBtnsEl.querySelectorAll('.mh-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentHead = parseInt(btn.dataset.head);
        draw();
      });
      headBtnsEl.appendChild(btn);
    });

    function draw() {
      var sent = DATA.sentences[currentSent];
      var head = sent.heads[currentHead];
      var words = sent.words;
      var weights = head.weights;
      var n = words.length;

      svg.selectAll('*').remove();
      var W = 600, H = 450;
      var g = svg.append('g');

      var labelW = 80;
      var labelH = 60;
      var cellSize = Math.min((W - labelW - 30) / n, (H - labelH - 20) / n, 65);
      var gridW = cellSize * n;
      var offsetX = labelW;
      var offsetY = labelH;

      var colorScale = d3.scaleSequential(d3.interpolateRgb('#f6f8fa', '#8250df'))
        .domain([0, d3.max(weights.map(function (row) { return d3.max(row); })) || 1]);

      // Cells
      for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
          (function (ri, cj) {
            var val = weights[ri][cj];
            var cx = offsetX + cj * cellSize;
            var cy = offsetY + ri * cellSize;

            g.append('rect')
              .attr('x', cx).attr('y', cy)
              .attr('width', cellSize - 2).attr('height', cellSize - 2)
              .attr('rx', 3)
              .attr('fill', colorScale(val))
              .attr('stroke', 'white').attr('stroke-width', 1.5);

            if (cellSize >= 40) {
              var maxVal = d3.max(weights.map(function (row) { return d3.max(row); })) || 1;
              var textColor = val > maxVal * 0.5 ? 'white' : COLORS.text_muted;
              g.append('text')
                .attr('x', cx + cellSize / 2 - 1)
                .attr('y', cy + cellSize / 2 + 4)
                .attr('text-anchor', 'middle').attr('font-size', '11px')
                .attr('fill', textColor)
                .attr('font-weight', val > maxVal * 0.3 ? '700' : '400')
                .text(val.toFixed(2));
            }
          })(i, j);
        }
      }

      // Labels
      words.forEach(function (word, j) {
        g.append('text')
          .attr('x', offsetX + j * cellSize + cellSize / 2 - 1)
          .attr('y', offsetY - 10)
          .attr('text-anchor', 'middle').attr('font-size', '12px')
          .attr('fill', COLORS.text_primary).attr('font-weight', '600')
          .text(word);
      });

      words.forEach(function (word, i) {
        g.append('text')
          .attr('x', offsetX - 8)
          .attr('y', offsetY + i * cellSize + cellSize / 2 + 4)
          .attr('text-anchor', 'end').attr('font-size', '12px')
          .attr('fill', COLORS.text_primary).attr('font-weight', '600')
          .text(word);
      });

      // Head name
      g.append('text')
        .attr('x', W / 2).attr('y', 15)
        .attr('text-anchor', 'middle').attr('font-size', '13px')
        .attr('font-weight', '700').attr('fill', COLORS.purple)
        .text(DATA.heads[currentHead].name);
    }

    selectEl.addEventListener('change', function () {
      currentSent = parseInt(this.value);
      draw();
    });

    draw();
  }

  // ============================================================
  // INIT
  // ============================================================

  initMatrix();
  initQKV();
  initMultiHead();

})();

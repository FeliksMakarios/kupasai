/*
 * KupasAI - Word Embeddings Visualization
 * NLP INF20161 - Week 1: Neural Network & Language
 *
 * Three interactive panels:
 *   1. Vector Space scatter plot (PCA projection)
 *   2. Word Analogy Explorer (A - B + C = ?)
 *   3. Cosine Similarity Explorer
 */

(function () {
  'use strict';

  // ============================================================
  // CONFIG
  // ============================================================

  var DATA = EMBEDDING_DATA;
  var WORDS = DATA.words;

  var IS_DARK = document.documentElement.getAttribute('data-theme') === 'dark';
  var UI = IS_DARK ? {
    grid: '#21262d',
    axis: '#30363d',
    text_muted: '#8b949e',
    viz_bg: '#161b22',
    pos: '#3fb950',
    warn: '#d29922',
    neg: '#f85149',
  } : {
    grid: '#eaeef2',
    axis: '#d0d7de',
    text_muted: '#656d76',
    viz_bg: '#ffffff',
    pos: '#1a7f37',
    warn: '#9a6700',
    neg: '#cf222e',
  };

  var CATEGORY_COLORS = {
    kerajaan: '#ffd700',
    keluarga: '#2ee5c8',
    gender: '#c77dff',
    profesi: '#ff9f43',
    emosi: '#f85149',
    institusi: '#4cd964',
    aksi: '#58a6ff',
    lainnya: '#8b949e',
  };

  var CATEGORY_LABELS = {
    kerajaan: 'Kerajaan',
    keluarga: 'Keluarga',
    gender: 'Gender',
    profesi: 'Profesi',
    emosi: 'Emosi',
    institusi: 'Institusi',
    aksi: 'Aksi',
    lainnya: 'Lainnya',
  };

  // Vector helpers
  function dot(a, b) {
    var s = 0;
    for (var i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
  }

  function norm(a) {
    var s = 0;
    for (var i = 0; i < a.length; i++) s += a[i] * a[i];
    return Math.sqrt(s);
  }

  function cosineSim(a, b) {
    return dot(a, b) / (norm(a) * norm(b) + 1e-8);
  }

  function vecSub(a, b) {
    return a.map(function (v, i) { return v - b[i]; });
  }

  function vecAdd(a, b) {
    return a.map(function (v, i) { return v + b[i]; });
  }

  function getWordData(word) {
    for (var i = 0; i < WORDS.length; i++) {
      if (WORDS[i].word === word) return WORDS[i];
    }
    return null;
  }

  function findNearest(targetVec, exclude) {
    var best = null;
    var bestSim = -2;
    for (var i = 0; i < WORDS.length; i++) {
      if (exclude.indexOf(WORDS[i].word) >= 0) continue;
      var sim = cosineSim(targetVec, WORDS[i].vector);
      if (sim > bestSim) {
        bestSim = sim;
        best = WORDS[i];
      }
    }
    return { word: best, similarity: bestSim };
  }

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
  // TOOLTIP
  // ============================================================

  var tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  document.body.appendChild(tooltip);

  function showTooltip(html, x, y) {
    tooltip.innerHTML = html;
    tooltip.style.left = (x + 12) + 'px';
    tooltip.style.top = (y - 10) + 'px';
    tooltip.classList.add('visible');
  }

  function hideTooltip() {
    tooltip.classList.remove('visible');
  }

  // ============================================================
  // TAB 1: SCATTER PLOT (PCA projection)
  // ============================================================

  function initScatter() {
    var svg = d3.select('#scatter-plot');
    var W = 700, H = 500;
    var margin = { top: 20, right: 20, bottom: 50, left: 50 };
    var innerW = W - margin.left - margin.right;
    var innerH = H - margin.top - margin.bottom;

    var g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Scales: data is in [-1, 1]
    var x = d3.scaleLinear().domain([-1.1, 1.1]).range([0, innerW]);
    var y = d3.scaleLinear().domain([-1.1, 1.1]).range([innerH, 0]);

    // Grid
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data([-1, -0.5, 0, 0.5, 1])
      .enter().append('line')
      .attr('x1', function (d) { return x(d); })
      .attr('x2', function (d) { return x(d); })
      .attr('y1', 0)
      .attr('y2', innerH)
      .attr('stroke', UI.grid)
      .attr('stroke-width', 1);

    g.append('g')
      .selectAll('line')
      .data([-1, -0.5, 0, 0.5, 1])
      .enter().append('line')
      .attr('y1', function (d) { return y(d); })
      .attr('y2', function (d) { return y(d); })
      .attr('x1', 0)
      .attr('x2', innerW)
      .attr('stroke', UI.grid)
      .attr('stroke-width', 1);

    // Axes
    g.append('g')
      .attr('transform', 'translate(0,' + innerH + ')')
      .call(d3.axisBottom(x).tickValues([-1, -0.5, 0, 0.5, 1]).tickFormat(function (d) { return d; }))
      .selectAll('text')
      .style('fill', UI.text_muted);

    g.append('g')
      .call(d3.axisLeft(y).tickValues([-1, -0.5, 0, 0.5, 1]).tickFormat(function (d) { return d; }))
      .selectAll('text')
      .style('fill', UI.text_muted);

    // Axis labels
    g.append('text')
      .attr('x', innerW / 2)
      .attr('y', innerH + 35)
      .attr('text-anchor', 'middle')
      .style('fill', UI.text_muted)
      .style('font-size', '11px')
      .text('PC1 (' + DATA.pca_info.pc1_explained + '% varians)');

    g.append('text')
      .attr('x', -innerH / 2)
      .attr('y', -38)
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .style('fill', UI.text_muted)
      .style('font-size', '11px')
      .text('PC2 (' + DATA.pca_info.pc2_explained + '% varians)');

    // Zero axes emphasis
    g.append('line')
      .attr('x1', x(0)).attr('x2', x(0))
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', UI.axis)
      .attr('stroke-width', 1.5);

    g.append('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', y(0)).attr('y2', y(0))
      .attr('stroke', UI.axis)
      .attr('stroke-width', 1.5);

    // Active categories for filtering
    var activeCats = {};
    Object.keys(CATEGORY_COLORS).forEach(function (c) { activeCats[c] = true; });

    // Data join
    var dots = g.selectAll('.dot-group')
      .data(WORDS)
      .enter().append('g')
      .attr('class', 'dot-group')
      .attr('transform', function (d) { return 'translate(' + x(d.x) + ',' + y(d.y) + ')'; });

    dots.append('circle')
      .attr('class', 'dot')
      .attr('r', 6)
      .attr('fill', function (d) { return CATEGORY_COLORS[d.category] || CATEGORY_COLORS.lainnya; })
      .attr('opacity', 0.85)
      .attr('stroke', UI.viz_bg)
      .attr('stroke-width', 1.5)
      .on('mouseover', function (event, d) {
        d3.select(this).attr('r', 9).attr('opacity', 1);
        var html = '<div class="tt-word">' + d.word + '</div>';
        html += '<div class="tt-cat">Kategori: ' + (CATEGORY_LABELS[d.category] || d.category) + '</div>';
        showTooltip(html, event.pageX, event.pageY);
      })
      .on('mousemove', function (event) {
        tooltip.style.left = (event.pageX + 12) + 'px';
        tooltip.style.top = (event.pageY - 10) + 'px';
      })
      .on('mouseout', function () {
        d3.select(this).attr('r', 6).attr('opacity', 0.85);
        hideTooltip();
      })
      .on('click', function (event, d) {
        var html = '<div class="tt-word" style="font-size:1rem">' + d.word + '</div>';
        html += '<div class="tt-cat">Kategori: ' + (CATEGORY_LABELS[d.category] || d.category) + '</div>';
        html += '<div style="margin-top:6px;font-size:0.75rem;color:#8b949e">Vektor (' + d.vector.length + ' dimensi):</div>';
        html += '<div style="font-family:monospace;font-size:0.72rem;color:#58a6ff;margin-top:2px">';
        html += '[' + d.vector.join(', ') + ']';
        html += '</div>';
        showTooltip(html, event.pageX, event.pageY);
      });

    dots.append('text')
      .attr('class', 'dot-label')
      .attr('x', 9)
      .attr('y', 4)
      .text(function (d) { return d.word; });

    // Legend
    var legendEl = document.getElementById('scatter-legend');
    var cats = Object.keys(CATEGORY_COLORS);
    cats.forEach(function (cat) {
      var item = document.createElement('div');
      item.className = 'legend-item';
      item.innerHTML = '<span class="legend-dot" style="background:' + CATEGORY_COLORS[cat] + '"></span>' +
        (CATEGORY_LABELS[cat] || cat);
      legendEl.appendChild(item);
    });

    // Category filter chips
    var filterEl = document.getElementById('category-filters');
    cats.forEach(function (cat) {
      var chip = document.createElement('label');
      chip.className = 'filter-chip';
      chip.innerHTML = '<input type="checkbox" checked data-cat="' + cat + '">' +
        '<span style="color:' + CATEGORY_COLORS[cat] + '">\u25CF</span> ' +
        (CATEGORY_LABELS[cat] || cat);
      chip.querySelector('input').addEventListener('change', function () {
        activeCats[cat] = this.checked;
        updateVisibility();
        chip.classList.toggle('inactive', !this.checked);
      });
      filterEl.appendChild(chip);
    });

    function updateVisibility() {
      g.selectAll('.dot-group')
        .style('display', function (d) {
          return activeCats[d.category] ? null : 'none';
        });
    }
  }

  // ============================================================
  // TAB 2: WORD ANALOGY EXPLORER
  // ============================================================

  function initAnalogy() {
    var selectA = document.getElementById('analogy-a');
    var selectB = document.getElementById('analogy-b');
    var selectC = document.getElementById('analogy-c');
    var resultEl = document.getElementById('analogy-result-word');
    var explanationEl = document.getElementById('analogy-explanation');

    // Populate selects
    var sortedWords = WORDS.map(function (w) { return w.word; }).sort();
    [selectA, selectB, selectC].forEach(function (sel) {
      sortedWords.forEach(function (w) {
        var opt = document.createElement('option');
        opt.value = w;
        opt.textContent = w;
        sel.appendChild(opt);
      });
    });

    selectA.value = 'raja';
    selectB.value = 'pria';
    selectC.value = 'wanita';

    // Preset buttons
    var presetEl = document.getElementById('analogy-presets');
    DATA.preset_analogies.forEach(function (preset, i) {
      var btn = document.createElement('button');
      btn.className = 'preset-btn';
      btn.textContent = preset.label;
      btn.addEventListener('click', function () {
        selectA.value = preset.a;
        selectB.value = preset.b;
        selectC.value = preset.c;
        updateAnalogy();
      });
      presetEl.appendChild(btn);
    });

    function updateAnalogy() {
      var aWord = selectA.value;
      var bWord = selectB.value;
      var cWord = selectC.value;

      var aData = getWordData(aWord);
      var bData = getWordData(bWord);
      var cData = getWordData(cWord);

      if (!aData || !bData || !cData) return;

      // Compute: A - B + C
      var target = vecAdd(vecSub(aData.vector, bData.vector), cData.vector);
      var result = findNearest(target, [aWord, bWord, cWord]);

      resultEl.textContent = result.word.word;
      resultEl.style.opacity = '0';
      setTimeout(function () { resultEl.style.transition = 'opacity 0.3s'; resultEl.style.opacity = '1'; }, 50);

      // Explanation
      explanationEl.classList.add('visible');
      explanationEl.innerHTML =
        '<div class="formula-line">' +
        aWord + ' - ' + bWord + ' + ' + cWord + ' = ' + result.word.word +
        '</div>' +
        '<p>Cosine similarity dengan hasil: <strong>' + result.similarity.toFixed(3) + '</strong></p>' +
        '<p>Vektor <code>' + aWord + '</code> dikurangi vektor <code>' + bWord +
        '</code> menghasilkan arah semantik "raja minus maskulin" (yaitu kekuasaan/kerajaan). ' +
        'Arah ini ditambahkan ke <code>' + cWord + '</code> untuk mendapatkan kata yang memiliki ' +
        'sifat kerajaan/kekuasaan tapi dengan gender ' + cWord + '.</p>';

      drawAnalogyPlot(aData, bData, cData, result.word);
    }

    function drawAnalogyPlot(aData, bData, cData, resultData) {
      var svg = d3.select('#analogy-plot');
      svg.selectAll('*').remove();

      var W = 700, H = 400;
      var margin = { top: 20, right: 20, bottom: 40, left: 50 };
      var innerW = W - margin.left - margin.right;
      var innerH = H - margin.top - margin.bottom;

      var g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      var x = d3.scaleLinear().domain([-1.1, 1.1]).range([0, innerW]);
      var y = d3.scaleLinear().domain([-1.1, 1.1]).range([innerH, 0]);

      // Faint background dots (all words)
      g.selectAll('.bg-dot')
        .data(WORDS)
        .enter().append('circle')
        .attr('class', 'bg-dot')
        .attr('cx', function (d) { return x(d.x); })
        .attr('cy', function (d) { return y(d.y); })
        .attr('r', 3)
        .attr('fill', UI.axis)
        .attr('opacity', 0.5);

      // The 4 key words
      var keyData = [aData, cData, bData, resultData];
      var keyLabels = { };
      keyLabels[aData.word] = 'A';
      keyLabels[bData.word] = 'B';
      keyLabels[cData.word] = 'C';
      keyLabels[resultData.word] = 'Hasil';

      var colors = {
        A: '#58a6ff',
        B: '#f85149',
        C: '#c77dff',
        Hasil: '#3fb950',
      };

      // Draw parallelogram: A -> B -> result -> C -> A
      // Visualizes the vector arithmetic
      var paraPoints = [
        { x: x(aData.x), y: y(aData.y) },
        { x: x(cData.x), y: y(cData.y) },
        { x: x(resultData.x), y: y(resultData.y) },
        { x: x(bData.x), y: y(bData.y) },
      ];

      g.append('polygon')
        .data([paraPoints])
        .attr('points', function (d) { return d.map(function (p) { return p.x + ',' + p.y; }).join(' '); })
        .attr('fill', 'rgba(88, 166, 255, 0.05)')
        .attr('stroke', 'rgba(88, 166, 255, 0.3)')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4 4');

      // Key dots
      keyData.forEach(function (d) {
        var role = keyLabels[d.word];
        g.append('circle')
          .attr('cx', x(d.x))
          .attr('cy', y(d.y))
          .attr('r', 8)
          .attr('fill', colors[role])
          .attr('opacity', 0.9)
          .attr('stroke', UI.viz_bg)
          .attr('stroke-width', 2);

        g.append('text')
          .attr('x', x(d.x) + 12)
          .attr('y', y(d.y) + 4)
          .attr('fill', colors[role])
          .attr('font-size', '13px')
          .attr('font-weight', '700')
          .text(d.word + ' (' + role + ')');
      });

      // Axes
      g.append('line')
        .attr('x1', x(0)).attr('x2', x(0))
        .attr('y1', 0).attr('y2', innerH)
        .attr('stroke', UI.axis);

      g.append('line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', y(0)).attr('y2', y(0))
        .attr('stroke', UI.axis);
    }

    [selectA, selectB, selectC].forEach(function (sel) {
      sel.addEventListener('change', updateAnalogy);
    });

    updateAnalogy();
  }

  // ============================================================
  // TAB 3: COSINE SIMILARITY EXPLORER
  // ============================================================

  function initSimilarity() {
    var selectA = document.getElementById('sim-a');
    var selectB = document.getElementById('sim-b');
    var resultEl = document.getElementById('sim-result');
    var svg = d3.select('#sim-plot');

    var sortedWords = WORDS.map(function (w) { return w.word; }).sort();
    [selectA, selectB].forEach(function (sel) {
      sortedWords.forEach(function (w) {
        var opt = document.createElement('option');
        opt.value = w;
        opt.textContent = w;
        sel.appendChild(opt);
      });
    });

    selectA.value = 'raja';
    selectB.value = 'ratu';

    function updateSim() {
      var aData = getWordData(selectA.value);
      var bData = getWordData(selectB.value);
      if (!aData || !bData) return;

      var sim = cosineSim(aData.vector, bData.vector);
      var angle = Math.acos(Math.max(-1, Math.min(1, sim))) * 180 / Math.PI;

      // Result display
      var barColor = sim > 0.7 ? UI.pos : sim > 0.3 ? UI.warn : sim > -0.3 ? UI.text_muted : UI.neg;
      resultEl.innerHTML =
        '<div class="sim-value" style="color:' + barColor + '">' + sim.toFixed(3) + '</div>' +
        '<div class="sim-label">Cosine similarity &middot; Sudut: ' + angle.toFixed(1) + '&deg;</div>' +
        '<div class="sim-bar-container">' +
        '<div class="sim-bar" style="width:' + ((sim + 1) / 2 * 100) + '%;background:' + barColor + '"></div>' +
        '</div>' +
        '<div style="font-size:0.75rem;color:#6e7681;margin-top:0.5rem">' +
        'Skala: -1 (berlawanan) &larr; 0 (tidak terkait) &rarr; +1 (sama arah)' +
        '</div>';

      // Draw vectors
      svg.selectAll('*').remove();
      var W = 600, H = 300;
      var cx = W / 2, cy = H / 2;
      var maxLen = Math.min(W, H) * 0.38;

      // Origin
      var g = svg.append('g');

      // Grid circles
      [0.33, 0.66, 1.0].forEach(function (r) {
        g.append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', maxLen * r)
          .attr('fill', 'none')
          .attr('stroke', UI.grid)
          .attr('stroke-width', 1);
      });

      // Angle arc
      var aNorm = norm(aData.vector);
      var bNorm = norm(bData.vector);
      // Use PCA coords for direction visualization
      var aAngle = Math.atan2(aData.y, aData.x);
      var bAngle = Math.atan2(bData.y, bData.x);

      // Draw angle arc
      var arcStart = aAngle;
      var arcEnd = bAngle;
      // Ensure we draw the shorter arc
      var arcGen = d3.arc()
        .innerRadius(maxLen * 0.2)
        .outerRadius(maxLen * 0.25)
        .startAngle(arcStart)
        .endAngle(arcEnd);

      // Vector A
      drawVector(g, cx, cy, aData.x * maxLen, aData.y * maxLen, '#58a6ff', selectA.value);
      // Vector B
      drawVector(g, cx, cy, bData.x * maxLen, bData.y * maxLen, '#c77dff', selectB.value);

      // Angle label
      var midAngle = (aAngle + bAngle) / 2;
      var labelR = maxLen * 0.32;
      g.append('text')
        .attr('x', cx + Math.cos(midAngle) * labelR)
        .attr('y', cy + Math.sin(midAngle) * labelR)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', UI.text_muted)
        .attr('font-size', '12px')
        .text(angle.toFixed(0) + '\u00B0');
    }

    function drawVector(g, x1, y1, dx, dy, color, label) {
      var x2 = x1 + dx;
      var y2 = y1 + dy;

      // Line
      g.append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', color)
        .attr('stroke-width', 2.5);

      // Arrowhead
      var angle = Math.atan2(dy, dx);
      var arrowLen = 10;
      g.append('polygon')
        .attr('points', function () {
          var ax = x2 - arrowLen * Math.cos(angle - 0.4);
          var ay = y2 - arrowLen * Math.sin(angle - 0.4);
          var bx = x2 - arrowLen * Math.cos(angle + 0.4);
          var by = y2 - arrowLen * Math.sin(angle + 0.4);
          return x2 + ',' + y2 + ' ' + ax + ',' + ay + ' ' + bx + ',' + by;
        })
        .attr('fill', color);

      // Label
      g.append('text')
        .attr('x', x2 + Math.cos(angle) * 12)
        .attr('y', y2 + Math.sin(angle) * 12)
        .attr('fill', color)
        .attr('font-size', '13px')
        .attr('font-weight', '700')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .text(label);
    }

    [selectA, selectB].forEach(function (sel) {
      sel.addEventListener('change', updateSim);
    });

    updateSim();
  }

  // ============================================================
  // INIT
  // ============================================================

  initScatter();
  initAnalogy();
  initSimilarity();

})();

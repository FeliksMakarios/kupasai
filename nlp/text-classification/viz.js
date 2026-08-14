/*
 * KupasAI - Text Classification Visualization
 * NLP INF20161 - Week 7
 *
 * Three panels:
 *   1. Pipeline step-by-step (raw text -> prediction)
 *   2. Decision Boundaries (classifier comparison)
 *   3. BERT Fine-tuning for classification
 */

(function () {
  'use strict';

  var D = CLASSIFICATION_DATA;
  var C = {
    text_muted: '#656d76',
    text_primary: '#1f2328',
    text_secondary: '#4b5563',
    border: '#d0d7de',
    grid: '#eaeef2',
    accent: '#0969da',
    pos: '#1a7f37',
    neg: '#cf222e',
    orange: '#9a6700',
    purple: '#8250df',
    bg_box: '#f6f8fa',
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
  // TAB 1: PIPELINE
  // ============================================================

  function initPipeline() {
    var selectEl = document.getElementById('pipe-sentence');
    var svg = d3.select('#pipeline-plot');
    var stepPrev = document.getElementById('pipe-prev');
    var stepNext = document.getElementById('pipe-next');
    var indicator = document.getElementById('pipe-indicator');
    var detailEl = document.getElementById('pipe-detail');
    var currentStep = 1;
    var currentSent = 0;
    var TOTAL = D.pipeline_steps.length;

    D.sample_texts.forEach(function (s, i) {
      var opt = document.createElement('option');
      opt.value = i;
      opt.textContent = s.text;
      selectEl.appendChild(opt);
    });

    function draw() {
      var step = D.pipeline_steps[currentStep - 1];
      var sample = D.sample_texts[currentSent];
      svg.selectAll('*').remove();
      var W = 700, H = 360;
      var g = svg.append('g');

      var stages = [
        { label: 'Teks Mentah', y: 50, h: 45, color: C.text_muted },
        { label: 'Preprocessing', y: 115, h: 45, color: C.accent },
        { label: 'Vektorisasi', y: 180, h: 45, color: C.purple },
        { label: 'Klasifikasi', y: 245, h: 45, color: C.orange },
        { label: 'Output', y: 310, h: 40, color: C.pos },
      ];

      var cx = W / 2;
      var boxW = 280;
      var example = sample.text;

      // Adjust examples based on selected text
      var examples = [
        sample.text,
        '[' + sample.tokens.filter(function(t) { return !['dan','ini','yang','dengan','tidak'].includes(t); }).join(', ') + ']',
        '[0, 0, 2, 1, 0, ...]',
        sample.label === 'positif' ? 'positif: 0.87, negatif: 0.13' : 'positif: 0.08, negatif: 0.92',
        sample.label === 'positif' ? 'POSITIF (87%)' : 'NEGATIF (92%)',
      ];

      stages.forEach(function (st, i) {
        var isActive = (i === currentStep - 1);
        var isPast = i < currentStep - 1;
        var opacity = isActive ? 1.0 : (isPast ? 0.4 : 0.2);
        var fillOpacity = isActive ? 0.2 : (isPast ? 0.1 : 0.05);

        g.append('rect')
          .attr('x', cx - boxW / 2).attr('y', st.y - st.h / 2)
          .attr('width', boxW).attr('height', st.h)
          .attr('rx', 6)
          .attr('fill', st.color)
          .attr('fill-opacity', fillOpacity)
          .attr('stroke', st.color)
          .attr('stroke-width', isActive ? 3 : 1.5)
          .attr('opacity', opacity);

        g.append('text')
          .attr('x', cx).attr('y', st.y - 5)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px').attr('font-weight', '700')
          .attr('fill', st.color).attr('opacity', opacity)
          .text(st.label);

        g.append('text')
          .attr('x', cx).attr('y', st.y + 12)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('font-family', 'monospace')
          .attr('fill', C.text_secondary).attr('opacity', opacity)
          .text(examples[i] && examples[i].length > 38 ? examples[i].substring(0, 36) + '..' : (examples[i] || ''));

        // Arrow to next
        if (i < stages.length - 1) {
          var nextY = stages[i + 1].y - stages[i + 1].h / 2;
          g.append('line')
            .attr('x1', cx).attr('y1', st.y + st.h / 2)
            .attr('x2', cx).attr('y2', nextY)
            .attr('stroke', C.border).attr('stroke-width', 1.5)
            .attr('opacity', opacity * 0.5);
        }
      });

      // Detail
      detailEl.innerHTML =
        '<div class="detail-title">' + step.title + '</div>' +
        '<p>' + step.desc + '</p>';

      stepPrev.disabled = currentStep === 1;
      stepNext.disabled = currentStep === TOTAL;
      indicator.textContent = 'Langkah ' + currentStep + ' / ' + TOTAL;
    }

    stepNext.addEventListener('click', function () {
      if (currentStep < TOTAL) { currentStep++; draw(); }
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
  // TAB 2: DECISION BOUNDARIES
  // ============================================================

  function initBoundary() {
    var svg = d3.select('#boundary-plot');
    var btnsEl = document.getElementById('cls-buttons');
    var currentCls = 'logistic';
    var points = D.boundary_points;

    // Classifier buttons
    Object.keys(D.classifiers).forEach(function (key) {
      var cls = D.classifiers[key];
      var btn = document.createElement('button');
      btn.className = 'cls-btn' + (key === currentCls ? ' active' : '');
      btn.textContent = cls.name;
      btn.dataset.cls = key;
      btn.addEventListener('click', function () {
        btnsEl.querySelectorAll('.cls-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentCls = btn.dataset.cls;
        draw();
      });
      btnsEl.appendChild(btn);
    });

    function draw() {
      svg.selectAll('*').remove();
      var W = 600, H = 400;
      var margin = { top: 20, right: 20, bottom: 45, left: 50 };
      var innerW = W - margin.left - margin.right;
      var innerH = H - margin.top - margin.bottom;

      var g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      var x = d3.scaleLinear().domain([0, 1]).range([0, innerW]);
      var y = d3.scaleLinear().domain([0, 1]).range([innerH, 0]);

      // Grid
      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) {
        g.append('line').attr('x1', x(v)).attr('x2', x(v))
          .attr('y1', 0).attr('y2', innerH)
          .attr('stroke', C.grid).attr('stroke-width', 1);
        g.append('line').attr('x1', 0).attr('x2', innerW)
          .attr('y1', y(v)).attr('y2', y(v))
          .attr('stroke', C.grid).attr('stroke-width', 1);
      });

      // Draw decision boundary based on classifier
      var cls = D.classifiers[currentCls];
      if (cls.boundary.type === 'linear') {
        var a = cls.boundary.a, b = cls.boundary.b, c = cls.boundary.c;
        // y = (a*x + c) / (-b) -> need to convert data coords to SVG
        var x1d = 0, y1d = (a * x1d + c) / (-b);
        var x2d = 1, y2d = (a * x2d + c) / (-b);
        g.append('line')
          .attr('x1', x(x1d)).attr('y1', y(Math.max(0, Math.min(1, y1d))))
          .attr('x2', x(x2d)).attr('y2', y(Math.max(0, Math.min(1, y2d))))
          .attr('stroke', C.orange).attr('stroke-width', 2.5)
          .attr('stroke-dasharray', '6 4');
      } else if (cls.boundary.type === 'rbf') {
        // Draw a curved boundary (approximate RBF with a path)
        var pathData = [];
        for (var px = 0; px <= 1; px += 0.02) {
          // Curved boundary: y = 0.15 + 0.3 * sin(px * PI * 2) + 0.3 * px
          var py = 0.15 + 0.35 * Math.sin(px * Math.PI * 2.5) + 0.25 * px;
          py = Math.max(0, Math.min(1, py));
          pathData.push([x(px), y(py)]);
        }
        var lineGen = d3.line().x(function (d) { return d[0]; }).y(function (d) { return d[1]; }).curve(d3.curveCatmullRom);
        g.append('path')
          .attr('d', lineGen(pathData))
          .attr('fill', 'none')
          .attr('stroke', C.orange)
          .attr('stroke-width', 2.5)
          .attr('stroke-dasharray', '6 4');
      }

      // Data points
      points.forEach(function (p) {
        var color = p.label === 'positif' ? C.pos : C.neg;
        g.append('circle')
          .attr('cx', x(p.x)).attr('cy', y(p.y)).attr('r', 5)
          .attr('fill', color).attr('opacity', 0.7)
          .attr('stroke', 'white').attr('stroke-width', 1.5);
      });

      // Axis labels
      g.append('text')
        .attr('x', innerW / 2).attr('y', innerH + 35)
        .attr('text-anchor', 'middle')
        .style('fill', C.text_muted).style('font-size', '11px')
        .text('Fitur 1: Skor Kata Positif');

      g.append('text')
        .attr('x', -innerH / 2).attr('y', -35)
        .attr('text-anchor', 'middle').attr('transform', 'rotate(-90)')
        .style('fill', C.text_muted).style('font-size', '11px')
        .text('Fitur 2: Skor Kata Negatif');

      // Classifier name annotation
      g.append('text')
        .attr('x', 10).attr('y', 15)
        .attr('font-size', '12px').attr('font-weight', '700')
        .attr('fill', C.orange)
        .text(cls.name);

      // Legend
      var lg = g.append('g').attr('transform', 'translate(' + (innerW - 100) + ',' + 5 + ')');
      lg.append('circle').attr('cx', 6).attr('cy', 6).attr('r', 5).attr('fill', C.pos);
      lg.append('text').attr('x', 16).attr('y', 10).attr('font-size', '10px').attr('fill', C.text_muted).text('positif');
      lg.append('circle').attr('cx', 6).attr('cy', 24).attr('r', 5).attr('fill', C.neg);
      lg.append('text').attr('x', 16).attr('y', 28).attr('font-size', '10px').attr('fill', C.text_muted).text('negatif');
    }

    draw();
  }

  // ============================================================
  // TAB 3: BERT FINE-TUNING
  // ============================================================

  function initBERT() {
    var svg = d3.select('#bert-plot');
    var stepPrev = document.getElementById('bert-prev');
    var stepNext = document.getElementById('bert-next');
    var indicator = document.getElementById('bert-indicator');
    var detailEl = document.getElementById('bert-detail');
    var currentStep = 1;
    var TOTAL = D.bert_steps.length;

    function draw() {
      var step = D.bert_steps[currentStep - 1];
      svg.selectAll('*').remove();
      var W = 700, H = 360;
      var g = svg.append('g');

      if (currentStep === 4) {
        // Draw confusion matrix instead of pipeline
        drawConfusionMatrix(g, W, H);
      } else {
        // Draw BERT pipeline
        var components = [
          { label: 'Pre-trained BERT (IndoBERT)', y: 50, h: 50, color: C.accent },
          { label: 'Classification Head', y: 140, h: 35, color: C.orange },
          { label: 'Fine-tuning', y: 210, h: 40, color: C.purple },
          { label: 'Evaluasi', y: 280, h: 35, color: C.pos },
        ];

        var stepMap = [0, 1, 2, 3];
        var cx = W / 2;
        var boxW = 300;

        components.forEach(function (comp, i) {
          var isActive = stepMap[currentStep - 1] === i;
          var isPast = stepMap[currentStep - 1] > i;
          var opacity = isActive ? 1.0 : (isPast ? 0.4 : 0.2);
          var fillOpacity = isActive ? 0.2 : (isPast ? 0.1 : 0.05);

          g.append('rect')
            .attr('x', cx - boxW / 2).attr('y', comp.y - comp.h / 2)
            .attr('width', boxW).attr('height', comp.h)
            .attr('rx', 6)
            .attr('fill', comp.color).attr('fill-opacity', fillOpacity)
            .attr('stroke', comp.color)
            .attr('stroke-width', isActive ? 3 : 1.5)
            .attr('opacity', opacity);

          g.append('text')
            .attr('x', cx).attr('y', comp.y + 4)
            .attr('text-anchor', 'middle')
            .attr('font-size', '13px').attr('font-weight', isActive ? '700' : '500')
            .attr('fill', comp.color).attr('opacity', opacity)
            .text(comp.label);

          if (i < components.length - 1) {
            var nextY = components[i + 1].y - components[i + 1].h / 2;
            g.append('line')
              .attr('x1', cx).attr('y1', comp.y + comp.h / 2)
              .attr('x2', cx).attr('y2', nextY)
              .attr('stroke', C.border).attr('stroke-width', 1.5)
              .attr('opacity', opacity * 0.5);
          }
        });
      }

      // Detail
      detailEl.innerHTML =
        '<div class="detail-title">' + step.title + '</div>' +
        '<p>' + step.desc + '</p>' +
        '<div class="detail-formula">' + step.detail + '</div>';

      stepPrev.disabled = currentStep === 1;
      stepNext.disabled = currentStep === TOTAL;
      indicator.textContent = 'Langkah ' + currentStep + ' / ' + TOTAL;
    }

    function drawConfusionMatrix(g, W, H) {
      var cm = D.confusion;
      var labels = cm.labels;
      var matrix = cm.matrix;
      var n = labels.length;
      var cellSize = 70;
      var matX = W / 2 - cellSize;
      var matY = 80;

      var maxVal = Math.max(matrix[0][0], matrix[0][1], matrix[1][0], matrix[1][1]);
      var colorScale = d3.scaleSequential(d3.interpolateRgb('#f6f8fa', C.accent))
        .domain([0, maxVal]);

      // Cells
      for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
          var val = matrix[i][j];
          var correct = i === j;
          var cx = matX + j * cellSize;
          var cy = matY + i * cellSize;

          g.append('rect')
            .attr('x', cx).attr('y', cy)
            .attr('width', cellSize - 2).attr('height', cellSize - 2)
            .attr('rx', 4)
            .attr('fill', correct ? C.pos : C.neg)
            .attr('fill-opacity', val / maxVal * 0.6 + 0.1)
            .attr('stroke', correct ? C.pos : C.neg)
            .attr('stroke-width', 1.5);

          g.append('text')
            .attr('x', cx + cellSize / 2 - 1)
            .attr('y', cy + cellSize / 2 + 6)
            .attr('text-anchor', 'middle')
            .attr('font-size', '20px').attr('font-weight', '700')
            .attr('fill', correct ? C.pos : C.neg)
            .text(val);
        }
      }

      // Labels
      // Top (predicted)
      g.append('text').attr('x', matX + cellSize).attr('y', matY - 18)
        .attr('text-anchor', 'middle').attr('font-size', '11px')
        .attr('font-weight', '700').attr('fill', C.text_primary).text('Prediksi');

      labels.forEach(function (label, j) {
        g.append('text')
          .attr('x', matX + j * cellSize + cellSize / 2 - 1)
          .attr('y', matY - 5)
          .attr('text-anchor', 'middle').attr('font-size', '11px')
          .attr('fill', C.text_muted).text(label);
      });

      // Left (actual)
      labels.forEach(function (label, i) {
        g.append('text')
          .attr('x', matX - 8).attr('y', matY + i * cellSize + cellSize / 2 + 4)
          .attr('text-anchor', 'end').attr('font-size', '11px')
          .attr('fill', C.text_muted).text(label);
      });

      g.append('text').attr('x', matX - 55).attr('y', matY + cellSize)
        .attr('text-anchor', 'middle').attr('font-size', '11px')
        .attr('font-weight', '700').attr('fill', C.text_primary)
        .attr('transform', 'rotate(-90 ' + (matX - 55) + ' ' + (matY + cellSize) + ')')
        .text('Label Sebenarnya');

      // Metrics
      var mx = matX + cellSize * 2 + 30;
      var my = matY;
      g.append('text').attr('x', mx).attr('y', my)
        .attr('font-size', '12px').attr('font-weight', '700')
        .attr('fill', C.text_primary).text('Metrik');

      var metrics = [
        { label: 'Accuracy', value: (cm.accuracy * 100).toFixed(1) + '%', color: C.accent },
        { label: 'Precision (pos)', value: (cm.precision_pos * 100).toFixed(1) + '%', color: C.pos },
        { label: 'Recall (pos)', value: (cm.recall_pos * 100).toFixed(1) + '%', color: C.purple },
        { label: 'F1 (pos)', value: (cm.f1_pos * 100).toFixed(1) + '%', color: C.orange },
      ];

      metrics.forEach(function (m, i) {
        g.append('text')
          .attr('x', mx).attr('y', my + 25 + i * 24)
          .attr('font-size', '11px').attr('fill', C.text_muted)
          .text(m.label);
        g.append('text')
          .attr('x', mx + 130).attr('y', my + 25 + i * 24)
          .attr('font-size', '13px').attr('font-weight', '700')
          .attr('fill', m.color).attr('text-anchor', 'end')
          .text(m.value);
      });
    }

    stepNext.addEventListener('click', function () {
      if (currentStep < TOTAL) { currentStep++; draw(); }
    });
    stepPrev.addEventListener('click', function () {
      if (currentStep > 1) { currentStep--; draw(); }
    });

    draw();
  }

  // ============================================================
  // INIT
  // ============================================================

  initPipeline();
  initBoundary();
  initBERT();

})();

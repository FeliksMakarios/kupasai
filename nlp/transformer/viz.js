/*
 * KupasAI - Transformer Architecture Visualization
 * NLP INF20161 - Week 6
 *
 * Three interactive panels:
 *   1. Full architecture (encoder-decoder block diagram)
 *   2. Encoder layer detail (step-by-step walkthrough)
 *   3. Decoder layer detail (step-by-step walkthrough)
 */

(function () {
  'use strict';

  var D = TRANSFORMER_DATA;
  var C = {
    text_muted: '#656d76',
    text_primary: '#1f2328',
    text_secondary: '#4b5563',
    border: '#d0d7de',
    bg: '#f6f8fa',
    accent: '#0969da',
    enc_color: '#0969da',
    dec_color: '#9a6700',
    ffn_color: '#1a7f37',
    res_color: '#8250df',
    cross_color: '#fb8f44',
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
  // TAB 1: FULL ARCHITECTURE DIAGRAM
  // ============================================================

  function initFull() {
    var svg = d3.select('#full-plot');
    var hintEl = document.getElementById('full-hint');
    var arch = D.full_arch;

    svg.selectAll('*').remove();
    var W = 700, H = 460;
    var g = svg.append('g');

    // Encoder container
    var enc = arch.encoder;
    drawStack(g, enc, 'ENCODER', C.enc_color);

    // Decoder container
    var dec = arch.decoder;
    drawStack(g, dec, 'DECODER', C.dec_color);

    // Cross-attention arrow from encoder to decoder
    var cl = arch.cross_link;
    g.append('line')
      .attr('x1', cl.from_x).attr('y1', cl.y)
      .attr('x2', cl.to_x).attr('y2', cl.y)
      .attr('stroke', C.cross_color).attr('stroke-width', 2.5)
      .attr('stroke-dasharray', '5 3');
    g.append('text')
      .attr('x', (cl.from_x + cl.to_x) / 2)
      .attr('y', cl.y - 8)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', C.cross_color)
      .attr('font-weight', '600')
      .text('K, V');

    function drawStack(g, stack, label, color) {
      // Outer container
      g.append('rect')
        .attr('x', stack.x).attr('y', stack.y)
        .attr('width', stack.w).attr('height', stack.h)
        .attr('rx', 8)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '6 3')
        .attr('opacity', 0.5);

      // Label
      g.append('text')
        .attr('x', stack.x + stack.w / 2)
        .attr('y', stack.y - 8)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', '700')
        .attr('fill', color)
        .text(label);

      // Stack note
      g.append('text')
        .attr('x', stack.x + stack.w / 2)
        .attr('y', stack.y + stack.h + 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('fill', C.text_muted)
        .text(stack.stack_note);

      // Layers
      stack.layers.forEach(function (layer, i) {
        var ly = stack.y + layer.y;

        g.append('rect')
          .attr('x', stack.x + 10)
          .attr('y', ly)
          .attr('width', stack.w - 20)
          .attr('height', layer.h)
          .attr('rx', 5)
          .attr('fill', layer.color)
          .attr('opacity', 0.15)
          .attr('stroke', layer.color)
          .attr('stroke-width', 1.5)
          .style('cursor', 'pointer')
          .on('mouseover', function () {
            d3.select(this).attr('opacity', 0.3);
            hintEl.textContent = layer.label + ': ' + layer.detail;
          })
          .on('mouseout', function () {
            d3.select(this).attr('opacity', 0.15);
          })
          .on('click', function () {
            hintEl.innerHTML = '<strong style="color:' + layer.color + '">' + layer.label + '</strong>: ' + layer.detail;
          });

        g.append('text')
          .attr('x', stack.x + stack.w / 2)
          .attr('y', ly + layer.h / 2 + 4)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('font-weight', '600')
          .attr('fill', layer.color)
          .text(layer.label);
      });

      // Input label
      if (stack.input) {
        g.append('text')
          .attr('x', stack.x + stack.w / 2)
          .attr('y', stack.y + stack.input.y)
          .attr('text-anchor', 'middle')
          .attr('font-size', '9px')
          .attr('fill', C.text_muted)
          .text(stack.input.label);
      }

      // Output label (decoder only)
      if (stack.output) {
        g.append('text')
          .attr('x', stack.x + stack.w / 2)
          .attr('y', stack.y + stack.output.y)
          .attr('text-anchor', 'middle')
          .attr('font-size', '9px')
          .attr('fill', C.text_muted)
          .text(stack.output.label);
      }
    }
  }

  // ============================================================
  // TAB 2: ENCODER DETAIL
  // ============================================================

  function initEncoder() {
    var svg = d3.select('#encoder-plot');
    var stepPrev = document.getElementById('enc-prev');
    var stepNext = document.getElementById('enc-next');
    var indicator = document.getElementById('enc-indicator');
    var detailEl = document.getElementById('enc-detail');
    var currentStep = 1;
    var TOTAL = D.encoder_detail.steps.length;

    function draw() {
      var step = D.encoder_detail.steps[currentStep - 1];
      svg.selectAll('*').remove();
      var W = 700, H = 400;
      var g = svg.append('g');

      // Draw encoder pipeline vertically
      var components = [
        { label: 'Input Embedding', y: 40, color: C.enc_color, h: 30 },
        { label: 'Positional Encoding', y: 80, color: C.enc_color, h: 30 },
        { label: 'Multi-Head Self-Attention', y: 130, color: C.accent, h: 45 },
        { label: 'Add & Norm', y: 185, color: C.res_color, h: 25 },
        { label: 'Feed-Forward Network', y: 220, color: C.ffn_color, h: 45 },
        { label: 'Add & Norm', y: 275, color: C.res_color, h: 25 },
      ];

      // Map steps to component indices (some steps span 1 component)
      var stepMap = [0, 2, 3, 4, 5]; // step 1=embedding+pos, 2=attention, 3=add&norm, 4=ffn, 5=add&norm2

      var cx = W / 2;
      var boxW = 260;

      components.forEach(function (comp, i) {
        var isActive = (stepMap[currentStep - 1] === i) ||
          (currentStep === 1 && (i === 0 || i === 1)); // step 1 highlights both embedding + pos enc
        var isPast = false;
        // Determine if this component is "above" the current step
        for (var s = 0; s < currentStep; s++) {
          if (stepMap[s] === i) { isPast = true; break; }
          if (s === 0 && (i === 0 || i === 1)) { isPast = true; }
        }

        var opacity = isActive ? 1.0 : (isPast ? 0.5 : 0.25);
        var strokeW = isActive ? 3 : 1.5;
        var strokeColor = isActive ? C.text_primary : comp.color;

        g.append('rect')
          .attr('x', cx - boxW / 2)
          .attr('y', comp.y)
          .attr('width', boxW)
          .attr('height', comp.h)
          .attr('rx', 6)
          .attr('fill', comp.color)
          .attr('fill-opacity', isActive ? 0.2 : 0.08)
          .attr('stroke', strokeColor)
          .attr('stroke-width', strokeW)
          .attr('opacity', opacity);

        g.append('text')
          .attr('x', cx)
          .attr('y', comp.y + comp.h / 2 + 4)
          .attr('text-anchor', 'middle')
          .attr('font-size', '11px')
          .attr('font-weight', isActive ? '700' : '500')
          .attr('fill', comp.color)
          .attr('opacity', opacity)
          .text(comp.label);

        // Arrow to next component
        if (i < components.length - 1) {
          var nextY = components[i + 1].y;
          g.append('line')
            .attr('x1', cx).attr('y1', comp.y + comp.h)
            .attr('x2', cx).attr('y2', nextY - 2)
            .attr('stroke', C.border)
            .attr('stroke-width', 1.5)
            .attr('opacity', opacity * 0.6);
        }
      });

      // Highlight ring around active component
      if (currentStep >= 2 && currentStep <= 5) {
        var activeIdx = stepMap[currentStep - 1];
        var ac = components[activeIdx];
        g.append('rect')
          .attr('x', cx - boxW / 2 - 4)
          .attr('y', ac.y - 4)
          .attr('width', boxW + 8)
          .attr('height', ac.h + 8)
          .attr('rx', 8)
          .attr('fill', 'none')
          .attr('stroke', C.text_primary)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '4 2')
          .attr('opacity', 0.3);
      }

      // Detail panel
      detailEl.innerHTML =
        '<div class="detail-title">' + step.title + '</div>' +
        '<p>' + step.desc + '</p>' +
        '<div class="detail-formula">' + step.formula + '</div>';

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

    draw();
  }

  // ============================================================
  // TAB 3: DECODER DETAIL
  // ============================================================

  function initDecoder() {
    var svg = d3.select('#decoder-plot');
    var stepPrev = document.getElementById('dec-prev');
    var stepNext = document.getElementById('dec-next');
    var indicator = document.getElementById('dec-indicator');
    var detailEl = document.getElementById('dec-detail');
    var currentStep = 1;
    var TOTAL = D.decoder_detail.steps.length;

    function draw() {
      var step = D.decoder_detail.steps[currentStep - 1];
      svg.selectAll('*').remove();
      var W = 700, H = 400;
      var g = svg.append('g');

      var components = [
        { label: 'Output Embedding', y: 30, color: C.dec_color, h: 28 },
        { label: 'Positional Encoding', y: 68, color: C.dec_color, h: 28 },
        { label: 'Masked Self-Attention', y: 115, color: C.accent, h: 40 },
        { label: 'Add & Norm', y: 165, color: C.res_color, h: 22 },
        { label: 'Cross-Attention', y: 200, color: C.cross_color, h: 40 },
        { label: 'Add & Norm', y: 250, color: C.res_color, h: 22 },
        { label: 'Feed-Forward Network', y: 285, color: C.ffn_color, h: 40 },
        { label: 'Add & Norm', y: 335, color: C.res_color, h: 22 },
      ];

      // Step -> component mapping
      var stepMap = [0, 2, 4, 6, 7]; // embedding, masked-attn, cross-attn, ffn, linear+softmax

      var cx = W / 2;
      var boxW = 260;

      // Encoder side label (for cross-attention step)
      g.append('text')
        .attr('x', 60).attr('y', 220)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-weight', '700')
        .attr('fill', C.enc_color)
        .attr('opacity', currentStep === 3 ? 1 : 0.3)
        .text('Encoder');

      g.append('rect')
        .attr('x', 30).attr('y', 200).attr('width', 60).attr('height', 40)
        .attr('rx', 4)
        .attr('fill', C.enc_color)
        .attr('fill-opacity', currentStep === 3 ? 0.15 : 0.05)
        .attr('stroke', C.enc_color)
        .attr('stroke-width', currentStep === 3 ? 2 : 1)
        .attr('opacity', currentStep === 3 ? 1 : 0.3);

      // Arrow from encoder to cross-attention (step 3)
      if (currentStep === 3) {
        g.append('line')
          .attr('x1', 90).attr('y1', 220)
          .attr('x2', cx - boxW / 2).attr('y2', 220)
          .attr('stroke', C.cross_color)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '5 3');

        g.append('text')
          .attr('x', (90 + cx - boxW / 2) / 2)
          .attr('y', 212)
          .attr('text-anchor', 'middle')
          .attr('font-size', '9px')
          .attr('fill', C.cross_color)
          .attr('font-weight', '600')
          .text('K, V');
      }

      components.forEach(function (comp, i) {
        var isActive = (stepMap[currentStep - 1] === i) ||
          (currentStep === 1 && (i === 0 || i === 1));
        var isPast = false;
        for (var s = 0; s < currentStep; s++) {
          if (stepMap[s] === i) { isPast = true; break; }
          if (s === 0 && (i === 0 || i === 1)) { isPast = true; }
        }

        var opacity = isActive ? 1.0 : (isPast ? 0.5 : 0.25);
        var strokeW = isActive ? 3 : 1.5;
        var strokeColor = isActive ? C.text_primary : comp.color;

        g.append('rect')
          .attr('x', cx - boxW / 2)
          .attr('y', comp.y)
          .attr('width', boxW)
          .attr('height', comp.h)
          .attr('rx', 6)
          .attr('fill', comp.color)
          .attr('fill-opacity', isActive ? 0.2 : 0.08)
          .attr('stroke', strokeColor)
          .attr('stroke-width', strokeW)
          .attr('opacity', opacity);

        g.append('text')
          .attr('x', cx)
          .attr('y', comp.y + comp.h / 2 + 4)
          .attr('text-anchor', 'middle')
          .attr('font-size', '11px')
          .attr('font-weight', isActive ? '700' : '500')
          .attr('fill', comp.color)
          .attr('opacity', opacity)
          .text(comp.label);

        // Arrow to next
        if (i < components.length - 1) {
          var nextY = components[i + 1].y;
          g.append('line')
            .attr('x1', cx).attr('y1', comp.y + comp.h)
            .attr('x2', cx).attr('y2', nextY - 2)
            .attr('stroke', C.border)
            .attr('stroke-width', 1.5)
            .attr('opacity', opacity * 0.6);
        }
      });

      // Output label (step 5)
      if (currentStep === 5) {
        g.append('text')
          .attr('x', cx)
          .attr('y', 375)
          .attr('text-anchor', 'middle')
          .attr('font-size', '11px')
          .attr('font-weight', '700')
          .attr('fill', C.text_primary)
          .text('Linear + Softmax -> Output Token');
      }

      // Detail
      detailEl.innerHTML =
        '<div class="detail-title">' + step.title + '</div>' +
        '<p>' + step.desc + '</p>' +
        '<div class="detail-formula">' + step.formula + '</div>';

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

    draw();
  }

  // ============================================================
  // INIT
  // ============================================================

  initFull();
  initEncoder();
  initDecoder();

})();

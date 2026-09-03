/*
 * KupasAI - Text Summarization Visualization
 * NLP INF20161 - Week 10
 *
 * Two panels:
 *   1. Perbandingan output model (baseline, GPT-2, T5, BART, PEGASUS) - Modul 10 Part I
 *   2. Kalkulator BLEU & ROUGE - Modul 10 Part II
 */

(function () {
  'use strict';

  var D = SUM_DATA;

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
  // TAB 1: MODEL COMPARISON
  // ============================================================

  function renderModelButtons() {
    var html = '';
    D.models.forEach(function (m, i) {
      html += '<button class="model-select-btn' + (i === 0 ? ' active' : '') + '" data-id="' + m.id + '" type="button">' + m.name + '</button>';
    });
    document.getElementById('model-select-row').innerHTML = html;
    document.querySelectorAll('.model-select-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.model-select-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        renderModelCard(btn.getAttribute('data-id'));
      });
    });
  }

  function renderModelCard(id) {
    var m = D.models.filter(function (x) { return x.id === id; })[0];
    document.getElementById('model-card').innerHTML =
      '<div class="model-card"><div class="mc-header"><span class="mc-name">' + m.name + '</span>' +
      '<span class="mc-type">' + m.type + '</span></div>' +
      '<div class="mc-text">' + m.text.replace(/</g, '&lt;') + '</div>' +
      '<div class="mc-note">' + m.note + '</div></div>';
  }

  renderModelButtons();
  renderModelCard(D.models[0].id);

  // ============================================================
  // TAB 2: BLEU & ROUGE CALCULATOR
  // ============================================================

  function tokenize(text) {
    return text.toLowerCase().trim().split(/\s+/).filter(Boolean);
  }

  function ngrams(tokens, n) {
    var out = [];
    for (var i = 0; i + n <= tokens.length; i++) out.push(tokens.slice(i, i + n).join(' '));
    return out;
  }

  function countMap(arr) {
    var m = {};
    arr.forEach(function (x) { m[x] = (m[x] || 0) + 1; });
    return m;
  }

  function overlapCount(candNgrams, refNgrams) {
    var cm = countMap(candNgrams), rm = countMap(refNgrams);
    var total = 0;
    Object.keys(cm).forEach(function (k) {
      total += Math.min(cm[k], rm[k] || 0);
    });
    return total;
  }

  function computeBLEU(candidate, reference, smooth) {
    var cand = tokenize(candidate), ref = tokenize(reference);
    var precisions = [];
    for (var n = 1; n <= 4; n++) {
      var cn = ngrams(cand, n), rn = ngrams(ref, n);
      var match = overlapCount(cn, rn);
      var p;
      if (smooth) p = (match + 1) / (cn.length + 1);
      else p = cn.length ? match / cn.length : 0;
      precisions.push(p);
    }
    var bp = cand.length >= ref.length ? 1 : Math.exp(1 - ref.length / cand.length);
    var product = precisions.reduce(function (a, b) { return a * b; }, 1);
    var bleu = product > 0 ? bp * Math.pow(product, 0.25) : 0;
    return { precisions: precisions, bp: bp, bleu: bleu };
  }

  function computeROUGE(candidate, reference, n) {
    var cand = tokenize(candidate), ref = tokenize(reference);
    var cn = ngrams(cand, n), rn = ngrams(ref, n);
    var match = overlapCount(cn, rn);
    var precision = cn.length ? match / cn.length : 0;
    var recall = rn.length ? match / rn.length : 0;
    var f1 = (precision + recall) ? 2 * precision * recall / (precision + recall) : 0;
    return { precision: precision, recall: recall, f1: f1, match: match, nCand: cn.length, nRef: rn.length };
  }

  var bleuSmooth = false;

  function updateBLEU() {
    var candidate = document.getElementById('bleu-candidate').value;
    var reference = document.getElementById('bleu-reference').value;
    var r = computeBLEU(candidate, reference, bleuSmooth);
    var tableHtml = '<table class="ngram-table"><thead><tr><th>n-gram</th><th>1</th><th>2</th><th>3</th><th>4</th></tr></thead><tbody><tr><td>Precision</td>';
    r.precisions.forEach(function (p) { tableHtml += '<td>' + p.toFixed(3) + '</td>'; });
    tableHtml += '</tr></tbody></table>';
    document.getElementById('bleu-table').innerHTML = tableHtml;
    document.getElementById('bleu-metrics').innerHTML =
      '<div class="metric-chip">Brevity Penalty<strong>' + r.bp.toFixed(3) + '</strong></div>' +
      '<div class="metric-chip">BLEU Score<strong>' + r.bleu.toFixed(3) + '</strong></div>';
  }

  document.getElementById('bleu-candidate').addEventListener('input', updateBLEU);
  document.getElementById('bleu-reference').addEventListener('input', updateBLEU);
  document.getElementById('smooth-toggle-btn').addEventListener('click', function () {
    bleuSmooth = !bleuSmooth;
    this.classList.toggle('active', bleuSmooth);
    this.textContent = bleuSmooth ? 'Smoothing: Aktif' : 'Smoothing: Nonaktif';
    updateBLEU();
  });

  function updateROUGE() {
    var candidate = document.getElementById('rouge-candidate').value;
    var reference = document.getElementById('rouge-reference').value;
    var r1 = computeROUGE(candidate, reference, 1);
    var r2 = computeROUGE(candidate, reference, 2);
    document.getElementById('rouge-metrics').innerHTML =
      '<div class="metric-chip">ROUGE-1 P<strong>' + r1.precision.toFixed(3) + '</strong></div>' +
      '<div class="metric-chip">ROUGE-1 R<strong>' + r1.recall.toFixed(3) + '</strong></div>' +
      '<div class="metric-chip">ROUGE-1 F1<strong>' + r1.f1.toFixed(3) + '</strong></div>' +
      '<div class="metric-chip">ROUGE-2 P<strong>' + r2.precision.toFixed(3) + '</strong></div>' +
      '<div class="metric-chip">ROUGE-2 R<strong>' + r2.recall.toFixed(3) + '</strong></div>' +
      '<div class="metric-chip">ROUGE-2 F1<strong>' + r2.f1.toFixed(3) + '</strong></div>';
  }

  document.getElementById('rouge-candidate').addEventListener('input', updateROUGE);
  document.getElementById('rouge-reference').addEventListener('input', updateROUGE);

  document.getElementById('bleu-candidate').value = D.bleu_example.default_candidate;
  document.getElementById('bleu-reference').value = D.bleu_example.default_reference;
  document.getElementById('rouge-candidate').value = D.rouge_example.default_candidate;
  document.getElementById('rouge-reference').value = D.rouge_example.default_reference;
  updateBLEU();
  updateROUGE();
})();

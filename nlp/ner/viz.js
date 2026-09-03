/*
 * KupasAI - Named Entity Recognition Visualization
 * NLP INF20161 - Week 9
 *
 * Two panels:
 *   1. Skema IOB2 & penyelarasan subword-label (Modul 9.1, 9.6)
 *   2. Evaluasi level-entitas dengan seqeval (Modul 9.7) + fakta cross-lingual transfer
 */

(function () {
  'use strict';

  var D = NER_DATA;

  var TAG_CLASS = { PER: 'tag-per', ORG: 'tag-org', LOC: 'tag-loc', O: 'tag-o' };
  var TAG_DESC = {
    'B-PER': 'Awal (Beginning) entitas <strong>person</strong>',
    'I-PER': 'Lanjutan (Inside) entitas person',
    'B-ORG': 'Awal entitas <strong>organization</strong>',
    'I-ORG': 'Lanjutan entitas organization',
    'B-LOC': 'Awal entitas <strong>location</strong>',
    'I-LOC': 'Lanjutan entitas location',
    'O': 'Outside &mdash; bukan bagian dari entitas manapun',
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
  // TAB 1a: IOB2 TOKEN TAGGER
  // ============================================================

  function tagClass(tag) {
    if (tag === 'O') return TAG_CLASS.O;
    var type = tag.split('-')[1];
    return TAG_CLASS[type] || TAG_CLASS.O;
  }

  function renderTokens() {
    var html = '';
    D.example.tokens.forEach(function (word, i) {
      var tag = D.example.tags[i];
      html += '<div class="token-chip" data-idx="' + i + '">' +
        '<div class="tc-word">' + word + '</div>' +
        '<div class="tc-tag ' + tagClass(tag) + '">' + tag + '</div></div>';
    });
    document.getElementById('token-row').innerHTML = html;

    document.querySelectorAll('.token-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        document.querySelectorAll('.token-chip').forEach(function (c) { c.classList.remove('selected'); });
        chip.classList.add('selected');
        var idx = +chip.getAttribute('data-idx');
        var word = D.example.tokens[idx], tag = D.example.tags[idx];
        document.getElementById('tag-detail').innerHTML =
          '<strong>' + word + '</strong> &rarr; <strong>' + tag + '</strong><br>' + TAG_DESC[tag];
      });
    });
    document.querySelector('.token-chip[data-idx="0"]').click();
  }

  // ============================================================
  // TAB 1b: SUBWORD ALIGNMENT
  // ============================================================

  function renderSubwords() {
    var S = D.subword_example;
    var html = '';
    var seenWordIds = {};
    S.subword_tokens.forEach(function (tok, i) {
      var wid = S.subword_word_ids[i];
      var isFirst = wid !== null && !seenWordIds[wid];
      var isIgnored = wid !== null && seenWordIds[wid];
      if (wid !== null) seenWordIds[wid] = true;
      var cls = wid === null ? '' : (isFirst ? 'first-subword' : (isIgnored ? 'ignored' : ''));
      var label = wid === null ? 'special' : ('word_id=' + wid + (isIgnored ? ' &rarr; IGN' : ' &rarr; ' + S.word_labels[wid]));
      html += '<div class="subword-chip ' + cls + '">' + tok + '<div class="sc-wid">' + label + '</div></div>';
    });
    document.getElementById('subword-row').innerHTML = html;
  }

  // ============================================================
  // TAB 2: SEQEVAL ENTITY-LEVEL EVALUATION
  // ============================================================

  var TAGSET1 = ['O', 'B-MISC', 'I-MISC'];
  var TAGSET2 = ['O', 'B-PER', 'I-PER'];
  var pred1 = D.seqeval_example.pred1_default.slice();
  var pred2 = D.seqeval_example.pred2_default.slice();

  function getEntities(seq) {
    var entities = [];
    var start = null, etype = null;
    var extended = seq.concat(['O']);
    extended.forEach(function (tag, i) {
      if (tag.indexOf('B-') === 0) {
        if (start !== null) entities.push(etype + ':' + start + '-' + (i - 1));
        start = i; etype = tag.slice(2);
      } else if (tag.indexOf('I-') === 0) {
        if (start === null) { start = i; etype = tag.slice(2); }
        else if (tag.slice(2) !== etype) {
          entities.push(etype + ':' + start + '-' + (i - 1));
          start = i; etype = tag.slice(2);
        }
      } else {
        if (start !== null) { entities.push(etype + ':' + start + '-' + (i - 1)); start = null; etype = null; }
      }
    });
    return entities;
  }

  function computeMetrics() {
    var trueEnts = getEntities(D.seqeval_example.true1).concat(getEntities(D.seqeval_example.true2).map(function (e) { return 's2:' + e; }));
    var predEnts = getEntities(pred1).concat(getEntities(pred2).map(function (e) { return 's2:' + e; }));
    var tp = trueEnts.filter(function (e) { return predEnts.indexOf(e) !== -1; }).length;
    var precision = predEnts.length ? tp / predEnts.length : 0;
    var recall = trueEnts.length ? tp / trueEnts.length : 0;
    var f1 = (precision + recall) ? 2 * precision * recall / (precision + recall) : 0;
    return { precision: precision, recall: recall, f1: f1, tp: tp, nTrue: trueEnts.length, nPred: predEnts.length };
  }

  function renderSeqRow(containerId, trueArr, predArr, tagset, isSeq1) {
    var trueHtml = '<div class="seq-tag-row">';
    trueArr.forEach(function (t) { trueHtml += '<div class="seq-tag-chip true-chip">' + t + '</div>'; });
    trueHtml += '</div>';

    var predHtml = '<div class="seq-tag-row">';
    predArr.forEach(function (p, i) {
      var match = p === trueArr[i];
      predHtml += '<div class="seq-tag-chip pred-chip ' + (match ? 'match' : 'mismatch') + '" data-i="' + i + '">' + p + '</div>';
    });
    predHtml += '</div>';

    document.getElementById(containerId).innerHTML =
      '<div class="seq-block"><h4>Label sebenarnya (y_true)</h4>' + trueHtml +
      '<h4>Prediksi model (y_pred) &mdash; klik untuk ubah</h4>' + predHtml + '</div>';

    document.querySelectorAll('#' + containerId + ' .pred-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var i = +chip.getAttribute('data-i');
        var arr = isSeq1 ? pred1 : pred2;
        var curIdx = tagset.indexOf(arr[i]);
        arr[i] = tagset[(curIdx + 1) % tagset.length];
        renderAll();
      });
    });
  }

  function renderMetrics() {
    var m = computeMetrics();
    document.getElementById('seq-metrics').innerHTML =
      '<div class="metric-chip">Precision<strong>' + m.precision.toFixed(3) + '</strong></div>' +
      '<div class="metric-chip">Recall<strong>' + m.recall.toFixed(3) + '</strong></div>' +
      '<div class="metric-chip">F1-score<strong>' + m.f1.toFixed(3) + '</strong></div>' +
      '<div class="metric-chip">Entitas benar<strong>' + m.tp + ' / ' + m.nTrue + '</strong></div>';
  }

  function renderAll() {
    renderSeqRow('seq1-container', D.seqeval_example.true1, pred1, TAGSET1, true);
    renderSeqRow('seq2-container', D.seqeval_example.true2, pred2, TAGSET2, false);
    renderMetrics();
  }

  function renderLangDist() {
    var html = '';
    D.facts.lang_dist.forEach(function (l) {
      html += '<div class="lang-row"><div class="lang-label">' + l.lang + '</div>' +
        '<div class="lang-track"><div class="lang-fill" style="width:' + l.pct + '%"></div></div>' +
        '<div class="lang-val">' + l.pct + '%</div></div>';
    });
    document.getElementById('lang-dist').innerHTML = html;
    document.getElementById('f1-approx').textContent = (D.facts.f1_de_approx * 100).toFixed(0) + '%';
    document.getElementById('num-labels').textContent = D.facts.num_labels;
  }

  renderTokens();
  renderSubwords();
  renderAll();
  renderLangDist();
})();

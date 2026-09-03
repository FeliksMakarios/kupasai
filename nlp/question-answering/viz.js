/*
 * KupasAI - Question Answering Visualization
 * NLP INF20161 - Week 11
 *
 * Two panels:
 *   1. Extractive QA: span classification (start/end logits) - Modul 11.1-11.3
 *   2. Sliding Window & Generative QA (RAG) - Modul 11.2 (opsional) & 11.4
 */

(function () {
  'use strict';

  var D = QA_DATA;

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
  // TAB 1a: SPAN CLASSIFICATION
  // ============================================================

  var S = D.span_example;
  var allTokens = S.question.concat(S.context);
  var qLen = S.question.length;
  var startIdx = S.default_start_idx;
  var endIdx = S.default_end_idx;
  var pickMode = 'start';

  function renderTokens() {
    var html = '';
    allTokens.forEach(function (tok, i) {
      var cls = 'qtoken';
      if (i < qLen) cls += ' is-question';
      if (i === startIdx) cls += ' is-start';
      else if (i === endIdx) cls += ' is-end';
      else if (i > startIdx && i < endIdx) cls += ' is-span';
      html += '<div class="' + cls + '" data-idx="' + i + '">' + tok + '</div>';
    });
    document.getElementById('qa-token-row').innerHTML = html;

    document.querySelectorAll('.qtoken').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var idx = +chip.getAttribute('data-idx');
        if (idx < qLen) return; // hanya token konteks yang bisa dipilih
        if (pickMode === 'start') { startIdx = Math.min(idx, endIdx); }
        else { endIdx = Math.max(idx, startIdx); }
        renderTokens();
        renderAnswer();
      });
    });
  }

  function renderAnswer() {
    var span = allTokens.slice(startIdx, endIdx + 1).join(' ');
    document.getElementById('qa-answer-box').innerHTML =
      '<strong>Q:</strong> ' + S.question.join(' ') + '<br>' +
      '<strong>A:</strong> <strong>' + span + '</strong>';
  }

  document.querySelectorAll('.pick-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.pick-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      pickMode = btn.getAttribute('data-mode');
    });
  });

  function renderLogitBars() {
    var minS = Math.min.apply(null, S.start_scores), maxS = Math.max.apply(null, S.start_scores);
    var minE = Math.min.apply(null, S.end_scores), maxE = Math.max.apply(null, S.end_scores);
    var html = '';
    allTokens.forEach(function (tok, i) {
      if (i < qLen) return; // hanya tampilkan bar untuk token konteks
      var sPct = ((S.start_scores[i] - minS) / (maxS - minS)) * 100;
      var ePct = ((S.end_scores[i] - minE) / (maxE - minE)) * 100;
      var isMaxS = S.start_scores[i] === maxS;
      var isMaxE = S.end_scores[i] === maxE;
      html += '<div style="display:inline-flex;flex-direction:column;align-items:center;width:52px;margin:0 1px 0.75rem">' +
        '<div style="font-size:0.68rem;color:var(--text-muted);margin-bottom:2px;height:2.2em;display:flex;align-items:flex-end;text-align:center;line-height:1.1">' + tok + '</div>' +
        '<div style="width:16px;height:44px;background:var(--bg-tertiary);border-radius:3px;display:flex;align-items:flex-end;overflow:hidden">' +
        '<div style="width:100%;height:' + sPct + '%;background:' + (isMaxS ? 'var(--warning)' : 'var(--accent)') + '"></div></div>' +
        '<div style="width:16px;height:44px;background:var(--bg-tertiary);border-radius:3px;display:flex;align-items:flex-end;overflow:hidden;margin-top:2px">' +
        '<div style="width:100%;height:' + ePct + '%;background:' + (isMaxE ? 'var(--warning)' : 'var(--success)') + '"></div></div>' +
        '</div>';
    });
    document.getElementById('qa-logit-bars').innerHTML = html;
  }

  renderTokens();
  renderAnswer();
  renderLogitBars();

  // ============================================================
  // TAB 1b: REFERENCE ANSWERS + F1 TABLE
  // ============================================================

  function renderReferenceAnswers() {
    var html = '';
    D.reference_answers.forEach(function (r) {
      html += '<div class="ref-card"><span class="rc-score">score=' + r.score.toFixed(4) + '</span>' +
        '<div class="rc-query">' + r.query + '</div>';
      if (r.answer) {
        html += '<div class="rc-answer">"' + r.answer + '"</div>' +
          '<div class="rc-note">Dari dokumen: <em>' + r.doc_snippet + '</em></div>';
      } else {
        html += '<div class="rc-answer" style="color:var(--text-muted)">(tidak ada jawaban)</div>' +
          '<div class="rc-note">' + r.note + '</div>';
      }
      html += '</div>';
    });
    document.getElementById('ref-answers').innerHTML = html;
  }

  function renderF1Table() {
    var maxF1 = Math.max.apply(null, D.f1_table.map(function (m) { return m.f1; }));
    var html = '';
    D.f1_table.slice().sort(function (a, b) { return b.f1 - a.f1; }).forEach(function (m) {
      var pct = (m.f1 / maxF1) * 100;
      html += '<div class="fi-row"><div class="fi-label">' + m.model + ' (' + m.params + ')</div>' +
        '<div class="fi-track"><div class="fi-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="fi-val">' + m.f1.toFixed(1) + '</div></div>';
    });
    document.getElementById('f1-table').innerHTML = html;
  }

  renderReferenceAnswers();
  renderF1Table();

  // ============================================================
  // TAB 2a: SLIDING WINDOW
  // ============================================================

  var W = D.sliding_window;

  function highlightOverlap(text) {
    var esc = text.replace(/</g, '&lt;');
    var overlap = W.overlap_text.replace(/</g, '&lt;');
    return esc.split(overlap).join('<mark>' + overlap + '</mark>');
  }

  function renderWindow(idx) {
    document.getElementById('window-text').innerHTML = highlightOverlap(W.windows[idx]);
  }

  function renderWindowButtons() {
    var html = '';
    W.windows.forEach(function (w, i) {
      html += '<button class="window-btn' + (i === 0 ? ' active' : '') + '" data-idx="' + i + '" type="button">Window #' + i + '</button>';
    });
    document.getElementById('window-select-row').innerHTML = html;
    document.querySelectorAll('.window-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.window-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        renderWindow(+btn.getAttribute('data-idx'));
      });
    });
  }

  renderWindowButtons();
  renderWindow(0);
  document.getElementById('window-question').textContent = W.question;
  document.getElementById('window-maxlen').textContent = W.max_length;
  document.getElementById('window-stride').textContent = W.stride;

  // ============================================================
  // TAB 2b: RAG EXAMPLE
  // ============================================================

  document.getElementById('rag-question').textContent = D.rag_example.question;
  document.getElementById('rag-answer').textContent = D.rag_example.answer;

  var otherQHtml = '';
  D.other_questions.forEach(function (q) { otherQHtml += '<li>' + q + '</li>'; });
  document.getElementById('other-questions').innerHTML = otherQHtml;
})();

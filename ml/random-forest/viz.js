/*
 * KupasAI - Random Forest Visualization
 * ML INF24042 - Week 6
 *
 * Two panels:
 *   1. Ensemble voting demo (decisiontree_ch6.csv)
 *   2. Dataset besar: Adult Census - feature importance & metrik
 */

(function () {
  'use strict';

  var D = RF_DATA;

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
  // TAB 1: ENSEMBLE VOTING
  // ============================================================

  var ED = D.ensemble_demo;

  function renderVoting(idx) {
    var row = ED.test_rows[idx];
    var votes = ED.mini_trees.map(function (mt) { return mt.preds[idx]; });
    var voteCounts = { sedan: 0, minibus: 0 };
    votes.forEach(function (v) { voteCounts[v]++; });
    var majority = voteCounts.sedan >= voteCounts.minibus ? 'sedan' : 'minibus';

    var html = '';
    ED.mini_trees.forEach(function (mt, i) {
      var pred = mt.preds[idx];
      html += '<div class="vote-card ' + pred + '"><div class="vt-title">Tree ' + (i + 1) + '<br>(' + mt.features.join(', ') + ')</div>' +
        '<div class="vt-pred">' + pred + '</div></div>';
    });
    document.getElementById('vote-cards').innerHTML = html;

    document.getElementById('vote-single').innerHTML =
      '<strong>Decision Tree tunggal</strong> memprediksi: <strong>' + ED.single_tree_pred[idx] + '</strong>';

    var isCorrect = ED.rf_pred[idx] === row.actual;
    var verdict = document.getElementById('vote-verdict');
    verdict.className = 'final-verdict ' + (isCorrect ? 'correct' : 'wrong');
    verdict.innerHTML =
      'Voting mayoritas (' + voteCounts.sedan + ' sedan vs ' + voteCounts.minibus + ' minibus): <strong class="verdict-pred">' + majority + '</strong><br>' +
      'Random Forest asli (100 pohon) memprediksi: <strong class="verdict-pred">' + ED.rf_pred[idx] + '</strong> &middot; ' +
      'Label sebenarnya: <strong>' + row.actual + '</strong>';
  }

  var select = document.getElementById('vote-row-select');
  ED.test_rows.forEach(function (row, i) {
    var opt = document.createElement('option');
    opt.value = i;
    opt.textContent = 'mesin=' + row.mesin + ', bangku=' + row.bangku + ', penggerak=' + row.penggerak;
    select.appendChild(opt);
  });
  select.addEventListener('change', function () { renderVoting(+this.value); });
  renderVoting(0);

  document.getElementById('rf-vs-single').textContent =
    'Decision Tree tunggal: ' + (ED.single_tree_acc * 100).toFixed(0) + '% · Random Forest: ' + (ED.rf_acc * 100).toFixed(0) + '%';

  // ============================================================
  // TAB 2: ADULT CENSUS
  // ============================================================

  var FEATURE_LABELS_ID = {
    'age': 'Usia', 'capital-gain': 'Capital gain', 'capital-loss': 'Capital loss',
    'hrs-per-week': 'Jam kerja/minggu', 'education-num': 'Lama pendidikan',
    'workclass_code': 'Jenis pekerjaan', 'education_code': 'Pendidikan',
    'marital-status_code': 'Status nikah', 'occupation_code': 'Jabatan',
    'relationship_code': 'Relasi keluarga', 'race_code': 'Ras', 'sex_code': 'Jenis kelamin',
    'native_code': 'Negara asal',
  };

  function renderFeatureImportance() {
    var maxImp = D.adult.feature_importance[0].importance;
    var html = '';
    D.adult.feature_importance.forEach(function (f) {
      var pct = (f.importance / maxImp) * 100;
      html += '<div class="fi-row"><div class="fi-label">' + (FEATURE_LABELS_ID[f.feature] || f.feature) + '</div>' +
        '<div class="fi-track"><div class="fi-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="fi-val">' + f.importance.toFixed(3) + '</div></div>';
    });
    document.getElementById('fi-chart').innerHTML = html;
  }

  function renderMetrics() {
    var r = D.adult.report;
    var html = '<table class="metrics-table"><thead><tr><th>Kelas</th><th>Precision</th><th>Recall</th><th>F1-score</th><th>Support</th></tr></thead><tbody>';
    ['<=50K', '>50K'].forEach(function (cls) {
      var v = r[cls];
      html += '<tr><td>' + cls + '</td><td>' + v.precision.toFixed(2) + '</td><td>' + v.recall.toFixed(2) +
        '</td><td>' + v['f1-score'].toFixed(2) + '</td><td>' + v.support + '</td></tr>';
    });
    html += '</tbody></table>';
    document.getElementById('metrics-table').innerHTML = html;
    document.getElementById('adult-accuracy').textContent = (D.adult.accuracy * 100).toFixed(1) + '%';
    document.getElementById('adult-nrows').textContent = D.adult.n_rows.toLocaleString('id-ID');
  }

  renderFeatureImportance();
  renderMetrics();
})();

/*
 * KupasAI - Churn Prediction Visualization
 * ML INF24042 - Week 9
 *
 * Two panels:
 *   1. Perbandingan Model (Logistic Regression vs Random Forest + GridSearchCV)
 *   2. Coba Prediksi (data pelanggan ABC Telekom nyata)
 */

(function () {
  'use strict';

  var D = CHURN_DATA;

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

  var FEATURE_LABELS_ID = {
    tenure: 'Tenure', reload_1: 'Reload', days_active: 'Hari aktif',
    internet: 'Internet', video: 'Video', music: 'Musik', chat_1: 'Chat (1bln)',
    chat_2: 'Chat (2bln)', socmed_1: 'Sosmed', 'Kartu A': 'Kartu A',
    'Kartu B': 'Kartu B', 'Kartu C': 'Kartu C',
  };

  function renderSplit() {
    var pctChurn = D.churn_rate * 100;
    var pctActive = 100 - pctChurn;
    document.getElementById('split-bar').innerHTML =
      '<div class="seg-active" style="width:' + pctActive + '%"></div>' +
      '<div class="seg-churn" style="width:' + pctChurn + '%"></div>';
    document.getElementById('split-legend-text').textContent =
      D.n_active.toLocaleString('id-ID') + ' aktif (' + pctActive.toFixed(0) + '%) vs ' +
      D.n_churn.toLocaleString('id-ID') + ' churn (' + pctChurn.toFixed(0) + '%) dari total ' +
      D.n_total.toLocaleString('id-ID') + ' pelanggan';
  }

  function renderModelCards() {
    var lr = D.metrics_lr, rf = D.metrics_rf;
    var rfWins = rf.accuracy >= lr.accuracy;
    var html = '';
    html += '<div class="model-card' + (!rfWins ? ' winner' : '') + '">';
    html += '<div class="mc-title">Logistic Regression</div>';
    html += '<div class="mc-line"><span>Accuracy</span><strong>' + (lr.accuracy * 100).toFixed(1) + '%</strong></div>';
    html += '<div class="mc-line"><span>Precision</span><strong>' + (lr.precision * 100).toFixed(1) + '%</strong></div>';
    html += '<div class="mc-line"><span>Recall</span><strong>' + (lr.recall * 100).toFixed(1) + '%</strong></div>';
    html += '<div class="mc-line"><span>AUC</span><strong>' + lr.auc.toFixed(3) + '</strong></div>';
    html += '</div>';
    html += '<div class="model-card' + (rfWins ? ' winner' : '') + '">';
    html += '<div class="mc-title">Random Forest <span style="font-weight:400;font-size:0.75rem;color:var(--text-muted)">(GridSearchCV)</span></div>';
    html += '<div class="mc-line"><span>Accuracy</span><strong>' + (rf.accuracy * 100).toFixed(1) + '%</strong></div>';
    html += '<div class="mc-line"><span>Precision</span><strong>' + (rf.precision * 100).toFixed(1) + '%</strong></div>';
    html += '<div class="mc-line"><span>Recall</span><strong>' + (rf.recall * 100).toFixed(1) + '%</strong></div>';
    html += '<div class="mc-line"><span>AUC</span><strong>' + rf.auc.toFixed(3) + '</strong></div>';
    html += '</div>';
    document.getElementById('model-cards').innerHTML = html;

    var p = D.rf_best_params;
    document.getElementById('rf-params').textContent =
      'n_estimators=' + p.n_estimators + ', max_depth=' + (p.max_depth === null ? 'None' : p.max_depth) +
      ', min_samples_split=' + p.min_samples_split + ', min_samples_leaf=' + p.min_samples_leaf;
  }

  function renderFeatureImportance() {
    var top = D.feature_importance.slice(0, 10);
    var maxImp = top[0].importance;
    var html = '';
    top.forEach(function (f) {
      var pct = (f.importance / maxImp) * 100;
      html += '<div class="fi-row"><div class="fi-label">' + (FEATURE_LABELS_ID[f.feature] || f.feature) + '</div>' +
        '<div class="fi-track"><div class="fi-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="fi-val">' + f.importance.toFixed(3) + '</div></div>';
    });
    document.getElementById('fi-chart').innerHTML = html;
  }

  renderSplit();
  renderModelCards();
  renderFeatureImportance();

  // ============================================================
  // TAB 2: CUSTOMER PREDICTION PICKER
  // ============================================================

  function renderAggregate(){
    var n=+document.getElementById('evaluation-count').value;
    document.getElementById('aggregate-estimate').innerHTML=[['Regresi Logistik',D.metrics_lr],['Random Forest',D.metrics_rf]].map(function(pair){var m=pair[1];return '<h2 class="estimate-title">'+pair[0]+'</h2><p>Dari '+n+' kasus churn aktual, sekitar '+(n*m.recall).toFixed(1)+' terdeteksi dan '+(n*(1-m.recall)).toFixed(1)+' terlewat.</p><p>Dari '+n+' prediksi churn, sekitar '+(n*m.precision).toFixed(1)+' benar dan '+(n*(1-m.precision)).toFixed(1)+' keliru.</p>';}).join('');
  }
  document.getElementById('evaluation-count').addEventListener('input',renderAggregate);
  renderAggregate();

  document.getElementById('churn-n-test').textContent = D.n_test.toLocaleString('id-ID');
})();

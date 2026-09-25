/*
 * KupasAI - Naive Bayes Visualization
 * ML INF24042 - Week 7
 *
 * Two panels:
 *   1. Kalkulator Bayes interaktif (contoh spam Modul 7.2)
 *   2. Studi Kasus: Titanic (GaussianNB, data nyata)
 */

(function () {
  'use strict';

  var D = NB_DATA;

  // ============================================================
  // TAB 1: BAYES CALCULATOR
  // ============================================================

  var EMAILS = D.bayes_toy.emails;
  var CLASSES = ['Spam', 'Non-Spam'];

  function likelihood(feature, value, cls, alpha) {
    var subset = EMAILS.filter(function (e) { return e.kelas === cls; });
    var nCls = subset.length;
    var nMatch = subset.filter(function (e) { return e[feature] === value; }).length;
    var nValues = 2;
    return (nMatch + alpha) / (nCls + nValues * alpha);
  }

  function computePosterior(diskonVal, hadiahVal, alpha) {
    var raw = {};
    CLASSES.forEach(function (c) {
      var prior = D.bayes_toy.prior[c];
      var pD = likelihood('diskon', diskonVal, c, alpha);
      var pH = likelihood('hadiah', hadiahVal, c, alpha);
      raw[c] = { prior: prior, pD: pD, pH: pH, unnorm: prior * pD * pH };
    });
    var total = raw['Spam'].unnorm + raw['Non-Spam'].unnorm;
    CLASSES.forEach(function (c) { raw[c].norm = total > 0 ? raw[c].unnorm / total : 0; });
    return raw;
  }

  var state = { diskon: true, hadiah: true, smoothing: true };

  function renderEmailTable() {
    var html = '<table class="email-table"><thead><tr><th>Email</th><th>Diskon</th><th>Hadiah</th><th>Kelas</th></tr></thead><tbody>';
    EMAILS.forEach(function (e, i) {
      html += '<tr><td>' + (i + 1) + '</td><td>' + (e.diskon ? 'Ya' : 'Tidak') + '</td><td>' + (e.hadiah ? 'Ya' : 'Tidak') +
        '</td><td class="' + (e.kelas === 'Spam' ? 'spam' : 'nonspam') + '">' + e.kelas + '</td></tr>';
    });
    html += '</tbody></table>';
    document.getElementById('email-table').innerHTML = html;
  }

  function fmtBool(v) { return v ? 'Ya' : 'Tidak'; }

  function renderCalculator() {
    var alpha = state.smoothing ? 1 : 0;
    var p = computePosterior(state.diskon, state.hadiah, alpha);
    var winner = p['Spam'].norm >= p['Non-Spam'].norm ? 'Spam' : 'Non-Spam';

    var html = '';
    CLASSES.forEach(function (c) {
      var v = p[c];
      html += '<div class="posterior-card' + (c === winner ? ' winner' : '') + '">';
      html += '<div class="pc-title">' + c + '</div>';
      html += '<div class="pc-line">Prior P(' + c + ') = ' + v.prior.toFixed(3) + '</div>';
      html += '<div class="pc-line">P(Diskon=' + fmtBool(state.diskon) + '|' + c + ') = ' + v.pD.toFixed(3) + '</div>';
      html += '<div class="pc-line">P(Hadiah=' + fmtBool(state.hadiah) + '|' + c + ') = ' + v.pH.toFixed(3) + '</div>';
      html += '<div class="pc-line">Unnormalized = ' + v.unnorm.toFixed(4) + '</div>';
      html += '<div class="pc-result">Posterior = ' + v.norm.toFixed(3) + '</div>';
      html += '</div>';
    });
    document.getElementById('posterior-cards').innerHTML = html;

    var zeroWarning = (!state.smoothing && (p['Spam'].pD === 0 || p['Spam'].pH === 0 || p['Non-Spam'].pD === 0 || p['Non-Spam'].pH === 0));
    document.getElementById('verdict-box').innerHTML =
      'Email dengan Diskon=<strong>' + fmtBool(state.diskon) + '</strong>, Hadiah=<strong>' + fmtBool(state.hadiah) +
      '</strong> &rarr; diklasifikasikan sebagai <strong>' + winner + '</strong>' +
      (zeroWarning ? '<br><span style="color:var(--danger);font-size:0.8rem">Tanpa smoothing, salah satu likelihood = 0 sehingga posteriornya juga langsung 0 &mdash; inilah masalah yang diperbaiki Laplace smoothing.</span>' : '');
  }

  document.querySelectorAll('.toggle-btn[data-diskon]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.toggle-btn[data-diskon]').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      state.diskon = btn.getAttribute('data-diskon') === 'true';
      renderCalculator();
    });
  });
  document.querySelectorAll('.toggle-btn[data-hadiah]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.toggle-btn[data-hadiah]').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      state.hadiah = btn.getAttribute('data-hadiah') === 'true';
      renderCalculator();
    });
  });
  document.getElementById('toggle-smoothing').addEventListener('click', function () {
    state.smoothing = !state.smoothing;
    this.classList.toggle('active', state.smoothing);
    renderCalculator();
  });

  renderEmailTable();
  renderCalculator();

  // ============================================================
  // TAB 2: TITANIC CASE STUDY
  // ============================================================

  var cm=D.titanic.confusion_matrix;
  document.getElementById('titanic-confusion').innerHTML='<table><caption>Matriks kebingungan pada data uji</caption><thead><tr><th>Aktual</th><th>Prediksi tidak selamat</th><th>Prediksi selamat</th></tr></thead><tbody><tr><th>Tidak selamat</th><td>'+cm[0][0]+'</td><td>'+cm[0][1]+'</td></tr><tr><th>Selamat</th><td>'+cm[1][0]+'</td><td>'+cm[1][1]+'</td></tr></tbody></table><p>F1 kelas selamat: '+D.titanic.f1.toFixed(4)+'</p>';

  document.getElementById('titanic-accuracy').textContent = (D.titanic.accuracy * 100).toFixed(2) + '%';
  document.getElementById('titanic-n').textContent = D.titanic.n_test;
})();

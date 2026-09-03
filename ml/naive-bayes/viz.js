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

  function renderPassenger(idx) {
    var p = D.titanic.samples[idx];
    var html = '<div class="passenger-card"><div class="pg-name">' + p.name + '</div>';
    html += '<div class="passenger-grid">';
    html += '<div class="pg-item"><span class="pg-label">Kelas</span><span class="pg-value">' + p.pclass + '</span></div>';
    html += '<div class="pg-item"><span class="pg-label">Jenis Kelamin</span><span class="pg-value">' + p.sex + '</span></div>';
    html += '<div class="pg-item"><span class="pg-label">Usia</span><span class="pg-value">' + (p.age !== null ? p.age : '?') + '</span></div>';
    html += '<div class="pg-item"><span class="pg-label">Tarif</span><span class="pg-value">' + (p.fare !== null ? p.fare : '?') + '</span></div>';
    html += '<div class="pg-item"><span class="pg-label">Embarkasi</span><span class="pg-value">' + p.embarked + '</span></div>';
    html += '</div>';
    html += '<div class="verdict-box">P(Selamat) = <strong>' + (p.proba_survive * 100).toFixed(1) + '%</strong> &rarr; ' +
      'prediksi: <strong>' + (p.predicted ? 'Selamat' : 'Tidak Selamat') + '</strong> &middot; ' +
      'label sebenarnya: <strong>' + (p.actual ? 'Selamat' : 'Tidak Selamat') + '</strong> ' +
      (p.predicted === p.actual ? '&#9989;' : '&#10060;') +
      '</div></div>';
    document.getElementById('passenger-detail').innerHTML = html;
  }

  var pSelect = document.getElementById('passenger-select');
  D.titanic.samples.forEach(function (p, i) {
    var opt = document.createElement('option');
    opt.value = i;
    opt.textContent = p.name;
    pSelect.appendChild(opt);
  });
  pSelect.addEventListener('change', function () { renderPassenger(+this.value); });
  renderPassenger(0);

  document.getElementById('titanic-accuracy').textContent = (D.titanic.accuracy * 100).toFixed(2) + '%';
  document.getElementById('titanic-n').textContent = D.titanic.n_test;
})();

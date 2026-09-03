/*
 * KupasAI - Market Basket Analysis Visualization
 * ML INF24042 - Week 11
 *
 * Two panels:
 *   1. Frequent Itemsets & Association Rules (Apriori, mlxtend)
 *   2. Jelajahi Produk: rekomendasi pairing per-produk (lift tertinggi)
 */

(function () {
  'use strict';

  var D = MBA_DATA;

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
  // TAB 1: FREQUENT ITEMSETS + RULES
  // ============================================================

  function renderItemsets() {
    var maxSupport = D.frequent_itemsets[0].support;
    var html = '';
    D.frequent_itemsets.forEach(function (it) {
      var isPair = it.items.length > 1;
      var pct = (it.support / maxSupport) * 100;
      html += '<div class="fi-row"><div class="fi-label' + (isPair ? ' pair' : '') + '">' + it.items.join(' + ') + '</div>' +
        '<div class="fi-track"><div class="fi-fill' + (isPair ? ' pair' : '') + '" style="width:' + pct + '%"></div></div>' +
        '<div class="fi-val">' + (it.support * 100).toFixed(1) + '%</div></div>';
    });
    document.getElementById('itemset-chart').innerHTML = html;
  }

  function renderRules() {
    var html = '<table class="rules-table"><thead><tr><th>Aturan</th><th>Support</th><th>Confidence</th><th>Lift</th></tr></thead><tbody>';
    D.rules.forEach(function (r) {
      html += '<tr><td class="rule-desc">' + r.antecedents.join(', ') + ' &rarr; ' + r.consequents.join(', ') + '</td>' +
        '<td>' + (r.support * 100).toFixed(1) + '%</td>' +
        '<td>' + (r.confidence * 100).toFixed(1) + '%</td>' +
        '<td class="lift-high">' + r.lift.toFixed(2) + '&times;</td></tr>';
    });
    html += '</tbody></table>';
    document.getElementById('rules-table').innerHTML = html;
  }

  renderItemsets();
  renderRules();
  document.getElementById('mba-n-trx').textContent = D.n_trx.toLocaleString('id-ID');
  document.getElementById('mba-min-support').textContent = (D.min_support * 100).toFixed(0) + '%';
  document.getElementById('mba-min-confidence').textContent = (D.min_confidence * 100).toFixed(0) + '%';

  // ============================================================
  // TAB 2: PRODUCT EXPLORER
  // ============================================================

  function renderProduct(name) {
    var pairs = D.pair_stats[name] || [];
    var support = D.support_single[name];
    document.getElementById('product-support').innerHTML =
      '<strong>' + name + '</strong> muncul di <strong>' + (support * 100).toFixed(1) + '%</strong> dari seluruh transaksi.';

    if (pairs.length === 0) {
      document.getElementById('pair-cards').innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem">Belum ada produk lain yang cukup sering dibeli bersama produk ini.</p>';
      return;
    }
    var html = '';
    pairs.forEach(function (p) {
      html += '<div class="pair-card"><div class="pc-name">' + p.with + '</div>' +
        '<div class="pc-metrics">' +
        '<span>Support <strong>' + (p.support * 100).toFixed(1) + '%</strong></span>' +
        '<span>Confidence <strong>' + (p.confidence * 100).toFixed(1) + '%</strong></span>' +
        '<span class="lift-tag">Lift ' + p.lift.toFixed(2) + '&times;</span>' +
        '</div></div>';
    });
    document.getElementById('pair-cards').innerHTML = html;
  }

  var productSelect = document.getElementById('product-select');
  D.products.forEach(function (p) {
    var opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p;
    if (p === 'Nasi Goreng Jawa') opt.selected = true;
    productSelect.appendChild(opt);
  });
  productSelect.addEventListener('change', function () { renderProduct(this.value); });
  renderProduct('Nasi Goreng Jawa');
})();

/*
 * KupasAI - Pandas Visualization
 * ML INF24042 - Week 2
 *
 * Two interactive panels:
 *   1. Selection / Slicing / .loc / .iloc / Filtering
 *   2. Data kosong, dropna, dan kolom turunan (binning)
 */

(function () {
  'use strict';

  var D = PANDAS_DATA;
  var COLS = ['Apples', 'Oranges', 'Gomu-Gomu'];

  function fmt(v) {
    return v === null ? 'NaN' : v;
  }

  // ============================================================
  // TAB SWITCHING (shared pattern)
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
    btn.addEventListener('click', function () {
      activateTab(btn);
      btn.focus();
    });
    btn.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var next = e.key === 'ArrowRight' ? i + 1 : i - 1;
      if (next < 0) next = tabBtns.length - 1;
      if (next >= tabBtns.length) next = 0;
      var nextBtn = tabBtns[next];
      activateTab(nextBtn);
      nextBtn.focus();
    });
  });

  // ============================================================
  // TAB 1: SELECTION / SLICING / LOC / ILOC / FILTERING
  // ============================================================

  var OPS = {
    selection: {
      code: "df[['Gomu-Gomu']]",
      caption: 'Selection: memilih satu kolom saja, semua baris.',
      match: function (row, col) { return col === 'Gomu-Gomu'; },
    },
    slicing: {
      code: 'df[2:5]',
      caption: 'Slicing: memilih baris index posisi 2 sampai 4 (5 tidak termasuk).',
      match: function (row, col, i) { return i >= 2 && i < 5; },
    },
    loc: {
      code: "df.loc['B2':'B5', ['Gomu-Gomu']]",
      caption: ".loc: label-based, baris B2 s.d. B5 (inklusif), kolom 'Gomu-Gomu'.",
      match: function (row, col, i) { return i >= 2 && i <= 5 && col === 'Gomu-Gomu'; },
    },
    iloc: {
      code: 'df.iloc[[1, 3], [0, 2]]',
      caption: '.iloc: posisi integer, baris ke-1 & ke-3, kolom ke-0 (Apples) & ke-2 (Gomu-Gomu).',
      match: function (row, col, i) {
        return (i === 1 || i === 3) && (col === 'Apples' || col === 'Gomu-Gomu');
      },
    },
    filtering: {
      code: "df[df['Oranges'] > 2]",
      caption: "Filtering: hanya baris dengan Oranges > 2.",
      match: function (row) { return row.Oranges !== null && row.Oranges > 2; },
      rowMode: true,
    },
  };

  function renderMainTable(opKey) {
    var op = OPS[opKey];
    var wrap = document.getElementById('df-table-main');
    var html = '<table class="df-table"><thead><tr><th>ID Gudang</th>';
    COLS.forEach(function (c) { html += '<th>' + c + '</th>'; });
    html += '</tr></thead><tbody>';

    D.rows.forEach(function (row, i) {
      var rowMatches = op.rowMode ? op.match(row, null, i) : COLS.some(function (c) { return op.match(row, c, i); });
      html += '<tr' + (op.rowMode && rowMatches ? '' : '') + '>';
      html += '<td' + (rowMatches ? ' class="hl-row"' : '') + '>' + row.id + '</td>';
      COLS.forEach(function (c) {
        var isHl = op.rowMode ? rowMatches : op.match(row, c, i);
        var cls = [];
        if (row[c] === null) cls.push('na');
        if (isHl) cls.push('hl');
        else if (!op.rowMode) cls.push('dim');
        else if (op.rowMode && !rowMatches) cls.push('dim');
        html += '<td class="' + cls.join(' ') + '">' + fmt(row[c]) + '</td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    wrap.innerHTML = html;

    document.getElementById('op-code').textContent = op.code;
    document.getElementById('op-caption').textContent = op.caption;
  }

  var opButtons = document.querySelectorAll('#tab-subset .op-btn');
  opButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      opButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      renderMainTable(btn.getAttribute('data-op'));
    });
  });

  renderMainTable('selection');

  // ============================================================
  // TAB 2: DATA KOSONG, DROPNA, DAN BINNING
  // ============================================================

  var cleanState = { showNull: true, dropna: false, derive: false };

  function binLabel(total) {
    var bins = D.bins, labels = D.binLabels;
    for (var i = 0; i < labels.length; i++) {
      if (total > bins[i] && total <= bins[i + 1]) return labels[i];
    }
    return labels[0];
  }

  function renderCleanTable() {
    var wrap = document.getElementById('df-table-clean');
    var extraCols = cleanState.derive ? ['Jumlah Buah', 'Kategori Stok'] : [];
    var html = '<table class="df-table"><thead><tr><th>ID Gudang</th>';
    COLS.forEach(function (c) { html += '<th>' + c + '</th>'; });
    extraCols.forEach(function (c) { html += '<th>' + c + '</th>'; });
    html += '</tr></thead><tbody>';

    D.rows.forEach(function (row) {
      var hasNull = COLS.some(function (c) { return row[c] === null; });
      var removed = cleanState.dropna && hasNull;
      html += '<tr>';
      html += '<td' + (removed ? ' class="removed"' : '') + '>' + row.id + '</td>';
      COLS.forEach(function (c) {
        var cls = [];
        if (removed) cls.push('removed');
        if (row[c] === null) cls.push('na');
        if (cleanState.showNull && row[c] === null) cls.push('hl');
        html += '<td class="' + cls.join(' ') + '">' + fmt(row[c]) + '</td>';
      });
      if (cleanState.derive) {
        var total = (row.Apples || 0) + (row.Oranges || 0) + (row['Gomu-Gomu'] || 0);
        var label = binLabel(total);
        html += '<td' + (removed ? ' class="removed"' : '') + '>' + total + '</td>';
        html += '<td' + (removed ? ' class="removed"' : '') + '>' + label + '</td>';
      }
      html += '</tr>';
    });
    html += '</tbody></table>';
    wrap.innerHTML = html;

    var codeLines = [];
    if (cleanState.showNull) codeLines.push('df.isnull()');
    if (cleanState.dropna) codeLines.push('df = df.dropna()');
    if (cleanState.derive) {
      codeLines.push("df['Jumlah Buah'] = df['Apples'] + df['Oranges'] + df['Gomu-Gomu']");
      codeLines.push("df['Kategori Stok'] = pd.cut(df['Jumlah Buah'], bins, labels=labels)");
    }
    document.getElementById('clean-code').textContent = codeLines.join('\n') || '# pilih langkah di bawah';
  }

  document.getElementById('toggle-null').addEventListener('click', function () {
    cleanState.showNull = !cleanState.showNull;
    this.classList.toggle('active', cleanState.showNull);
    renderCleanTable();
  });
  document.getElementById('toggle-dropna').addEventListener('click', function () {
    cleanState.dropna = !cleanState.dropna;
    this.classList.toggle('active', cleanState.dropna);
    renderCleanTable();
  });
  document.getElementById('toggle-derive').addEventListener('click', function () {
    cleanState.derive = !cleanState.derive;
    this.classList.toggle('active', cleanState.derive);
    renderCleanTable();
  });

  document.getElementById('toggle-null').classList.add('active');
  renderCleanTable();
})();

/*
 * KupasAI - Clustering Visualization
 * ML INF24042 - Week 10
 *
 * Two panels:
 *   1. Elbow Method + scatter K-Means interaktif (jadwal_penerbangan.csv)
 *   2. Detail Cluster + pencarian penerbangan
 */

(function () {
  'use strict';

  var D = CLUSTER_DATA;
  var IS_DARK = document.documentElement.getAttribute('data-theme') === 'dark';
  var C = IS_DARK ? {
    text_muted: '#8b949e',
    text_primary: '#e6edf3',
    axis: '#30363d',
    accent: '#58a6ff',
  } : {
    text_muted: '#656d76',
    text_primary: '#1f2328',
    axis: '#d0d7de',
    accent: '#0969da',
  };
  var CLUSTER_COLORS = IS_DARK
    ? ['#58a6ff', '#f85149', '#3fb950', '#d29922', '#bc8cff']
    : ['#0969da', '#cf222e', '#1a7f37', '#9a6700', '#8250df'];

  var currentK = 3;

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
  // ELBOW CHART
  // ============================================================

  function drawElbow() {
    var svg = d3.select('#elbow-plot');
    var W = 700, H = 220;
    var margin = { top: 15, right: 20, bottom: 35, left: 45 };
    var innerW = W - margin.left - margin.right;
    var innerH = H - margin.top - margin.bottom;

    var x = d3.scaleLinear().domain([1, 9]).range([0, innerW]);
    var y = d3.scaleLinear().domain([0, d3.max(D.elbow, function (d) { return d.sse; }) * 1.08]).range([innerH, 0]);

    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    g.append('g').attr('transform', 'translate(0,' + innerH + ')')
      .call(d3.axisBottom(x).ticks(9).tickFormat(d3.format('d'))).selectAll('text').style('fill', C.text_muted);
    g.append('g').call(d3.axisLeft(y).ticks(5)).selectAll('text').style('fill', C.text_muted);
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);

    g.append('text').attr('x', innerW / 2).attr('y', innerH + 32).attr('text-anchor', 'middle')
      .style('fill', C.text_muted).style('font-size', '11px').text('Jumlah Cluster (K)');

    var line = d3.line().x(function (d) { return x(d.k); }).y(function (d) { return y(d.sse); });
    g.append('path').datum(D.elbow).attr('fill', 'none').attr('stroke', C.accent).attr('stroke-width', 2).attr('d', line);
    g.selectAll('.elbow-pt').data(D.elbow).enter().append('circle')
      .attr('class', 'elbow-pt')
      .attr('cx', function (d) { return x(d.k); })
      .attr('cy', function (d) { return y(d.sse); })
      .attr('r', function (d) { return d.k === currentK ? 6 : 3.5; })
      .attr('fill', function (d) { return d.k === currentK ? C.accent : C.text_muted; });
  }

  // ============================================================
  // SCATTER PLOT
  // ============================================================

  function drawScatter() {
    var svg = d3.select('#scatter-plot');
    svg.selectAll('*').remove();
    var W = 700, H = 420;
    var margin = { top: 20, right: 20, bottom: 45, left: 55 };
    var innerW = W - margin.left - margin.right;
    var innerH = H - margin.top - margin.bottom;

    var durasiExt = d3.extent(D.flights, function (d) { return d.durasi; });
    var jarakExt = d3.extent(D.flights, function (d) { return d.jarak; });
    var xPad = (durasiExt[1] - durasiExt[0]) * 0.1;
    var yPad = (jarakExt[1] - jarakExt[0]) * 0.1;

    var x = d3.scaleLinear().domain([durasiExt[0] - xPad, durasiExt[1] + xPad]).range([0, innerW]);
    var y = d3.scaleLinear().domain([jarakExt[0] - yPad, jarakExt[1] + yPad]).range([innerH, 0]);

    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    g.append('g').attr('transform', 'translate(0,' + innerH + ')')
      .call(d3.axisBottom(x).ticks(6)).selectAll('text').style('fill', C.text_muted);
    g.append('g').call(d3.axisLeft(y).ticks(6)).selectAll('text').style('fill', C.text_muted);
    g.selectAll('.domain, .tick line').attr('stroke', C.axis);

    g.append('text').attr('x', innerW / 2).attr('y', innerH + 38).attr('text-anchor', 'middle')
      .style('fill', C.text_muted).style('font-size', '11px').text('Durasi (menit)');
    g.append('text').attr('x', -innerH / 2).attr('y', -40).attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle').style('fill', C.text_muted).style('font-size', '11px').text('Jarak (km)');

    var clustering = D.clusterings[String(currentK)];
    g.selectAll('.pt').data(D.flights).enter().append('circle')
      .attr('class', 'pt')
      .attr('cx', function (d) { return x(d.durasi); })
      .attr('cy', function (d) { return y(d.jarak); })
      .attr('r', 5)
      .attr('fill', function (d, i) { return CLUSTER_COLORS[clustering.labels[i] % CLUSTER_COLORS.length]; })
      .attr('opacity', 0.8)
      .append('title').text(function (d) { return d.kode + ': ' + d.asal + ' -> ' + d.tujuan; });

    clustering.centroids.forEach(function (c, i) {
      g.append('path')
        .attr('d', d3.symbol().type(d3.symbolCross).size(180))
        .attr('transform', 'translate(' + x(c.durasi) + ',' + y(c.jarak) + ') rotate(45)')
        .attr('fill', CLUSTER_COLORS[i % CLUSTER_COLORS.length])
        .attr('stroke', C.text_primary)
        .attr('stroke-width', 1);
    });
  }

  function renderKButtons() {
    document.querySelectorAll('.model-btn[data-k]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.model-btn[data-k]').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentK = +btn.getAttribute('data-k');
        drawScatter();
        d3.select('#elbow-plot').selectAll('*').remove();
        drawElbow();
        renderCentroidTable();
        renderFlightSelect();
      });
    });
  }

  // ============================================================
  // TAB 2: CENTROID TABLE + FLIGHT PICKER
  // ============================================================

  function renderCentroidTable() {
    var clustering = D.clusterings[String(currentK)];
    var html = '<table class="centroid-table"><thead><tr><th>Cluster</th><th>Rata-rata Durasi</th><th>Rata-rata Jarak</th><th>Jumlah Penerbangan</th></tr></thead><tbody>';
    clustering.centroids.forEach(function (c, i) {
      html += '<tr><td><span class="cluster-dot" style="background:' + CLUSTER_COLORS[i % CLUSTER_COLORS.length] + '"></span>Cluster ' + i + '</td>' +
        '<td>' + c.durasi.toFixed(1) + ' menit</td><td>' + c.jarak.toFixed(1) + ' km</td><td>' + c.n + '</td></tr>';
    });
    html += '</tbody></table>';
    document.getElementById('centroid-table').innerHTML = html;
    document.getElementById('cluster-k-label').textContent = currentK;
  }

  function renderFlightSelect() {
    var select = document.getElementById('flight-select');
    select.innerHTML = '';
    D.flights.forEach(function (f, i) {
      var opt = document.createElement('option');
      opt.value = i;
      opt.textContent = f.kode + ': ' + f.asal + ' → ' + f.tujuan;
      select.appendChild(opt);
    });
    renderFlight(0);
  }

  function renderFlight(idx) {
    var f = D.flights[idx];
    var clustering = D.clusterings[String(currentK)];
    var clusterIdx = clustering.labels[idx];
    var color = CLUSTER_COLORS[clusterIdx % CLUSTER_COLORS.length];
    var html = '<div class="flight-card"><div class="fc-route">' + f.kode + ': ' + f.asal + ' &rarr; ' + f.tujuan + '</div>';
    html += '<div class="flight-grid">';
    html += '<div class="fg-item"><span class="fg-label">Durasi</span><span class="fg-value">' + f.durasi + ' menit</span></div>';
    html += '<div class="fg-item"><span class="fg-label">Jarak</span><span class="fg-value">' + f.jarak + ' km</span></div>';
    html += '<div class="fg-item"><span class="fg-label">Cluster</span><span class="fg-value" style="color:' + color + '">' + clusterIdx + '</span></div>';
    html += '</div></div>';
    document.getElementById('flight-detail').innerHTML = html;
  }

  document.getElementById('flight-select').addEventListener('change', function () { renderFlight(+this.value); });

  drawElbow();
  drawScatter();
  renderKButtons();
  renderCentroidTable();
  renderFlightSelect();
  document.getElementById('n-flights').textContent = D.n_flights;
})();

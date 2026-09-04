/*
 * KupasAI - Object Detection Visualization
 * ML Lanjut IN F24141 - Week 11
 */

(function () {
  'use strict';

  var D = OD_DATA;
  var IS_DARK = document.documentElement.getAttribute('data-theme') === 'dark';
  var C = IS_DARK ? {
    text_muted: '#8b949e', text_primary: '#e6edf3', axis: '#30363d',
    accent: '#58a6ff', danger: '#f85149', success: '#3fb950', warn: '#d29922', bg2: '#161b22',
    palette: ['#f85149', '#58a6ff', '#3fb950', '#d29922', '#a371f7']
  } : {
    text_muted: '#656d76', text_primary: '#1f2328', axis: '#d0d7de',
    accent: '#0969da', danger: '#cf222e', success: '#1a7f37', warn: '#9a6700', bg2: '#f6f8fa',
    palette: ['#cf222e', '#0969da', '#1a7f37', '#9a6700', '#8250df']
  };

  var tabBtns = document.querySelectorAll('.tab-btn');
  var tabContents = document.querySelectorAll('.tab-content');
  function activateTab(btn) {
    var target = btn.getAttribute('data-tab');
    tabBtns.forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); b.setAttribute('tabindex', '-1'); });
    tabContents.forEach(function (c) { c.classList.remove('active'); });
    btn.classList.add('active'); btn.setAttribute('aria-selected', 'true'); btn.setAttribute('tabindex', '0');
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

  function computeIoU(a, b) {
    var xi1 = Math.max(a[0], b[0]), yi1 = Math.max(a[1], b[1]);
    var xi2 = Math.min(a[2], b[2]), yi2 = Math.min(a[3], b[3]);
    var iw = Math.max(0, xi2 - xi1), ih = Math.max(0, yi2 - yi1);
    var inter = iw * ih;
    var areaA = (a[2] - a[0]) * (a[3] - a[1]);
    var areaB = (b[2] - b[0]) * (b[3] - b[1]);
    var union = areaA + areaB - inter;
    return union > 0 ? inter / union : 0;
  }

  // ============================================================
  // TAB 1: IoU INTERACTIVE
  // ============================================================
  var iouSvg = d3.select('#iou-canvas');
  var offXSlider = document.getElementById('iou-offx');
  var offYSlider = document.getElementById('iou-offy');
  var scaleSlider = document.getElementById('iou-scale');

  function renderIoU() {
    var gt = D.iou.groundTruth;
    var offX = parseInt(offXSlider.value, 10);
    var offY = parseInt(offYSlider.value, 10);
    var scale = parseFloat(scaleSlider.value);
    var w = gt[2] - gt[0], h = gt[3] - gt[1];
    var cx = (gt[0] + gt[2]) / 2 + offX, cy = (gt[1] + gt[3]) / 2 + offY;
    var pw = w * scale, ph = h * scale;
    var pred = [cx - pw / 2, cy - ph / 2, cx + pw / 2, cy + ph / 2];
    var iou = computeIoU(gt, pred);

    iouSvg.selectAll('*').remove();
    iouSvg.attr('viewBox', '0 0 ' + D.iou.canvasW + ' ' + D.iou.canvasH);
    iouSvg.append('rect').attr('x', 0).attr('y', 0).attr('width', D.iou.canvasW).attr('height', D.iou.canvasH).attr('fill', C.bg2);

    function drawBox(box, color, label) {
      iouSvg.append('rect').attr('x', box[0]).attr('y', box[1]).attr('width', box[2] - box[0]).attr('height', box[3] - box[1])
        .attr('fill', color).attr('fill-opacity', 0.15).attr('stroke', color).attr('stroke-width', 2.5);
      iouSvg.append('text').attr('x', box[0]).attr('y', box[1] - 6).attr('fill', color).style('font-size', '11px').style('font-weight', 700).text(label);
    }
    drawBox(gt, C.danger, 'Ground Truth');
    drawBox(pred, C.accent, 'Prediksi');

    var verdict = document.getElementById('iou-verdict');
    verdict.textContent = 'IoU = ' + iou.toFixed(3) + ' → ' + (iou >= 0.5 ? 'BENAR (≥ 0.5)' : 'SALAH (< 0.5)');
    verdict.className = 'iou-verdict ' + (iou >= 0.5 ? 'correct' : 'incorrect');
  }

  [offXSlider, offYSlider, scaleSlider].forEach(function (el) {
    if (el) el.addEventListener('input', renderIoU);
  });
  var presetBtns = document.querySelectorAll('.iou-preset-btn');
  presetBtns.forEach(function (btn, i) {
    btn.addEventListener('click', function () {
      var p = D.iou.presets[i];
      var gt = D.iou.groundTruth;
      var w = gt[2] - gt[0], h = gt[3] - gt[1];
      var cx0 = (gt[0] + gt[2]) / 2, cy0 = (gt[1] + gt[3]) / 2;
      var pw = p.box[2] - p.box[0], ph = p.box[3] - p.box[1];
      var pcx = (p.box[0] + p.box[2]) / 2, pcy = (p.box[1] + p.box[3]) / 2;
      offXSlider.value = pcx - cx0;
      offYSlider.value = pcy - cy0;
      scaleSlider.value = (pw / w).toFixed(2);
      renderIoU();
    });
  });
  if (offXSlider) renderIoU();

  // ============================================================
  // TAB 2: NMS
  // ============================================================
  var nmsMode = 'before';
  var nmsBtns = document.querySelectorAll('.nms-mode-btn');

  function renderNms() {
    var svg = d3.select('#nms-canvas');
    svg.selectAll('*').remove();
    svg.attr('viewBox', '0 0 ' + D.nms.canvasW + ' ' + D.nms.canvasH);
    svg.append('rect').attr('x', 0).attr('y', 0).attr('width', D.nms.canvasW).attr('height', D.nms.canvasH).attr('fill', C.bg2);
    var boxesToShow = nmsMode === 'before' ? D.nms.boxes : D.nms.boxes.filter(function (b) { return D.nms.keep.indexOf(b.id) !== -1; });
    boxesToShow.forEach(function (b) {
      var color = C.palette[b.id % C.palette.length];
      svg.append('rect').attr('x', b.box[0]).attr('y', b.box[1]).attr('width', b.box[2] - b.box[0]).attr('height', b.box[3] - b.box[1])
        .attr('fill', color).attr('fill-opacity', 0.12).attr('stroke', color).attr('stroke-width', nmsMode === 'after' ? 3 : 2);
      svg.append('text').attr('x', b.box[0]).attr('y', b.box[1] - 6).attr('fill', color).style('font-size', '11px').style('font-weight', 700)
        .text(b.label + ' (pc=' + b.score.toFixed(2) + ')');
    });
  }
  nmsBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      nmsBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      nmsMode = btn.getAttribute('data-mode');
      renderNms();
    });
  });
  renderNms();

  var nmsSteps = document.getElementById('nms-steps');
  if (nmsSteps) {
    nmsSteps.innerHTML = D.nms.steps.map(function (s) { return '<div>' + s + '</div>'; }).join('');
  }

  // ============================================================
  // TAB 3: YOLO GRID
  // ============================================================
  function renderYoloGrid() {
    var svg = d3.select('#yolo-grid');
    var size = 360, grid = D.yolo.gridSize, cell = size / grid;
    svg.attr('viewBox', '0 0 ' + size + ' ' + size);
    svg.selectAll('*').remove();
    svg.append('rect').attr('x', 0).attr('y', 0).attr('width', size).attr('height', size).attr('fill', C.bg2);
    for (var i = 0; i <= grid; i++) {
      svg.append('line').attr('x1', i * cell).attr('x2', i * cell).attr('y1', 0).attr('y2', size).attr('stroke', C.axis);
      svg.append('line').attr('x1', 0).attr('x2', size).attr('y1', i * cell).attr('y2', i * cell).attr('stroke', C.axis);
    }
    // example object: center in cell (1,1), bbox bigger than 1 cell
    var r = 1, c = 1;
    var cellCx = c * cell + cell / 2, cellCy = r * cell + cell / 2;
    var boxW = cell * 1.6, boxH = cell * 0.9;
    svg.append('rect').attr('x', cellCx - boxW / 2).attr('y', cellCy - boxH / 2).attr('width', boxW).attr('height', boxH)
      .attr('fill', C.accent).attr('fill-opacity', 0.15).attr('stroke', C.accent).attr('stroke-width', 2.5).attr('stroke-dasharray', '5,3');
    svg.append('rect').attr('x', c * cell).attr('y', r * cell).attr('width', cell).attr('height', cell)
      .attr('fill', C.warn).attr('fill-opacity', 0.2).attr('stroke', C.warn).attr('stroke-width', 2);
    svg.append('circle').attr('cx', cellCx).attr('cy', cellCy).attr('r', 4).attr('fill', C.accent);
    svg.append('text').attr('x', cellCx).attr('y', cellCy - boxH / 2 - 8).attr('text-anchor', 'middle')
      .attr('fill', C.accent).style('font-size', '10px').style('font-weight', 700).text('bx,by,bh,bw (relatif sel)');

    document.getElementById('yolo-output-size').textContent =
      D.yolo.gridSize + '×' + D.yolo.gridSize + '×' + D.yolo.outputPerCell +
      ' (grid ' + D.yolo.gridSize + '×' + D.yolo.gridSize + ', tiap sel = [pc,bx,by,bh,bw,c1,c2,c3])';
    document.getElementById('yolo-anchor-size').textContent =
      D.yolo.gridSize + '×' + D.yolo.gridSize + '×' + D.yolo.anchorExample.outputPerCellWithAnchors +
      ' dengan ' + D.yolo.anchorExample.numAnchors + ' anchor box per sel';
  }
  renderYoloGrid();

})();

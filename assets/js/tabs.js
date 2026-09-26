/* Accessible tabs with shareable selection and keyboard navigation. */
(function () {
  'use strict';
  var tabBtns = Array.from(document.querySelectorAll('.tab-btn'));
  if (!tabBtns.length) return;
  function activateTab(btn, writeUrl) {
    var target = btn.getAttribute('data-tab');
    tabBtns.forEach(function (b) {
      var active = b === btn, panel = document.getElementById(b.getAttribute('aria-controls') || 'tab-' + b.dataset.tab);
      b.classList.toggle('active', active); b.setAttribute('aria-selected', String(active)); b.tabIndex = active ? 0 : -1;
      if (panel) { panel.classList.toggle('active', active); panel.hidden = !active; }
    });
    if (writeUrl) { var url=new URL(location.href);url.searchParams.set('tab',target);history.replaceState(null,'',url); }
  }
  var initial=new URLSearchParams(location.search).get('tab');
  activateTab(tabBtns.find(function(b){return b.dataset.tab===initial;}) || tabBtns.find(function(b){return b.classList.contains('active');}) || tabBtns[0], false);
  tabBtns.forEach(function (btn, i) {
    btn.addEventListener('click', function () { activateTab(btn, true); btn.focus(); });
    btn.addEventListener('keydown', function (e) {
      if (!['ArrowRight','ArrowLeft','Home','End'].includes(e.key)) return;
      e.preventDefault();
      var next=e.key==='Home'?0:e.key==='End'?tabBtns.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabBtns.length)%tabBtns.length;
      tabBtns[next].click();
    });
  });
})();

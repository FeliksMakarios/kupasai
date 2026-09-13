/* Shared accessibility, navigation and input-state preservation. */
(function () {
  'use strict';
  var replaying = false;
  var history = [];
  var key = 'kupasai-theme-state:' + location.pathname;
  function selector(el) {
    if (el.id) return '#' + CSS.escape(el.id);
    var parts = [];
    while (el && el !== document.body) {
      var parent = el.parentElement;
      if (!parent) return null;
      parts.unshift(el.localName + ':nth-child(' + (Array.prototype.indexOf.call(parent.children, el) + 1) + ')');
      el = parent;
    }
    return 'body>' + parts.join('>');
  }
  ['click','input','change'].forEach(function (type) {
    document.addEventListener(type, function (event) {
      if (replaying || !event.isTrusted) return;
      var el = event.target.closest('button,input,select,textarea,[role="button"]');
      if (!el || el.id === 'theme-toggle') return;
      var entry = {type:type, selector:selector(el)};
      if (!entry.selector) return;
      if (type !== 'click') { entry.value=el.value; entry.checked=el.checked; }
      var last=history[history.length-1];
      if (last && type !== 'click' && last.type===type && last.selector===entry.selector) history[history.length-1]=entry;
      else history.push(entry);
    }, true);
  });
  window.KupasLearning = {saveForTheme: function () {
    try {sessionStorage.setItem(key,JSON.stringify({history:history,scroll:scrollY,focus:selector(document.activeElement)}));} catch(e) {}
  }};
  document.addEventListener('DOMContentLoaded',function () {
    document.querySelectorAll('svg').forEach(function(svg){
      if (svg.closest('.theme-toggle')) return;
      if (!svg.getAttribute('aria-label')) svg.setAttribute('aria-label', svg.id.replace(/-/g,' ') || 'Diagram pembelajaran');
      svg.setAttribute('role','img');
    });
    // Existing clickable SVG marks become keyboard-operable, including rebuilt marks.
    function accessible(root) {
      root.querySelectorAll('svg rect,svg circle,svg g,.token-chip,.pred-chip,.qa-token').forEach(function(el){
        var clickable=(el.__on || []).some(function(x){return x.type==='click';}) || el.matches('.token-chip,.pred-chip,.qa-token');
        if (!clickable || el.hasAttribute('tabindex')) return;
        el.setAttribute('tabindex','0');el.setAttribute('role','button');
        el.setAttribute('aria-label',el.textContent.trim() || (el.__data__ && (el.__data__.word || el.__data__.label)) || 'Tampilkan detail titik');
        el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();el.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
      });
    }
    document.querySelectorAll('table').forEach(function(t){var wrap=document.createElement('div');wrap.className='table-scroll';t.before(wrap);wrap.appendChild(t);});
    accessible(document);
    new MutationObserver(function(records){records.forEach(function(r){r.addedNodes.forEach(function(n){if(n.nodeType===1)accessible(n.parentElement || n);});});}).observe(document.body,{childList:true,subtree:true});
    var saved;
    try {saved=JSON.parse(sessionStorage.getItem(key));sessionStorage.removeItem(key);} catch(e) {}
    if(saved){
      replaying=true;
      saved.history.forEach(function(e){var el=document.querySelector(e.selector);if(!el)return;if(e.type==='click')el.dispatchEvent(new MouseEvent('click',{bubbles:true}));else{el.value=e.value;if(e.checked!==undefined)el.checked=e.checked;el.dispatchEvent(new Event(e.type,{bubbles:true}));}});
      history=saved.history;replaying=false;
      requestAnimationFrame(function(){window.scrollTo(0,saved.scroll);});
    }
    var main=document.querySelector('.viz-container,.content-wrapper,.topic-table-wrap');
    if(main){main.id=main.id||'main-content';var skip=document.createElement('a');skip.className='skip-link';skip.href='#'+main.id;skip.textContent='Langsung ke materi';document.body.prepend(skip);main.setAttribute('tabindex','-1');}
    var inputs=document.querySelectorAll('input,select,textarea');
    inputs.forEach(function(el){if(el.id && !document.querySelector('label[for="'+el.id+'"]')&&!el.hasAttribute('aria-label'))el.setAttribute('aria-label',el.id.replace(/-/g,' '));});
  });
})();

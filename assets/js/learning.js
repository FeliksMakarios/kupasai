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
      if (replaying || (!event.isTrusted && !event.kupasKeyboard)) return;
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
    // Diagram labels come from the tab and the nearest caption, not from element ids.
    function text(el){return el?el.textContent.replace(/\s+/g,' ').trim():'';}
    function describe(svg){
      var parts=[],panel=svg.closest('.tab-content'),tab=panel&&document.getElementById(panel.getAttribute('aria-labelledby'));
      if(tab)parts.push(text(tab));
      for(var el=svg.closest('.svg-scroll')||svg;el&&el!==panel&&el!==document.body;el=el.parentElement){
        var sib=el.previousElementSibling,found=null;
        while(sib&&!found){if(sib.matches('.section-label,h2,h3,h4'))found=sib;else if(sib.querySelector)found=sib.querySelector('.section-label,h2,h3,h4');sib=sib.previousElementSibling;}
        if(found){var t=text(found);if(t&&parts.indexOf(t)<0)parts.push(t);break;}
      }
      if(!parts.length)parts.push(text(document.querySelector('h1'))||'pembelajaran');
      return 'Diagram '+parts.join(': ');
    }
    // On phones, keep diagram text at a readable size and let the diagram scroll sideways.
    var MIN_TEXT=12,MAX_WIDTH=1200;
    function fitWidth(svg){
      var vb=svg.viewBox&&svg.viewBox.baseVal;if(!vb||!vb.width)return 0;
      var sizes=[];svg.querySelectorAll('text').forEach(function(t){if(t.textContent.trim())sizes.push(parseFloat(getComputedStyle(t).fontSize)||0);});
      sizes=sizes.filter(function(x){return x>0;}).sort(function(a,b){return a-b;});
      if(!sizes.length)return 0;
      var small=sizes[Math.floor(sizes.length*0.1)];
      return Math.round(Math.min(vb.width,MAX_WIDTH,vb.width*MIN_TEXT/small));
    }
    var hintObserver='ResizeObserver' in window?new ResizeObserver(function(entries){entries.forEach(function(e){updateHint(e.target);});}):null;
    function updateHint(wrap){
      var scrollable=wrap.scrollWidth>wrap.clientWidth+2;
      wrap.classList.toggle('is-scrollable',scrollable);
      if(scrollable){wrap.setAttribute('tabindex','0');wrap.setAttribute('role','region');wrap.setAttribute('aria-label',(wrap.firstElementChild&&wrap.firstElementChild.getAttribute('aria-label')||'Diagram')+', dapat digeser ke samping');}
      else{wrap.removeAttribute('tabindex');wrap.removeAttribute('role');wrap.removeAttribute('aria-label');}
    }
    function prepareSvg(svg){
      if(!svg.isConnected||svg.closest('.theme-toggle,button,[aria-hidden="true"]'))return;
      var interactive=svg.querySelector('[tabindex],[role="button"],a');
      svg.setAttribute('role',interactive?'group':'img');
      if(!svg.getAttribute('aria-label')||svg.hasAttribute('data-auto-label')){svg.setAttribute('aria-label',describe(svg));svg.setAttribute('data-auto-label','');}
      var need=fitWidth(svg);
      var wrap=svg.parentElement&&svg.parentElement.classList.contains('svg-scroll')?svg.parentElement:null;
      if(!need){if(wrap)svg.style.removeProperty('--svg-min');return;}
      if(!wrap){wrap=document.createElement('div');wrap.className='svg-scroll';svg.before(wrap);wrap.appendChild(svg);if(hintObserver)hintObserver.observe(wrap);}
      svg.style.setProperty('--svg-min',need+'px');
      updateHint(wrap);
    }
    // Scrolling regions (wide or tall tables) must be reachable by keyboard.
    function markScrollRegions(){
      document.querySelectorAll('main div,main table,main pre').forEach(function(el){
        if(el.classList.contains('svg-scroll'))return;
        var cs=getComputedStyle(el),can=function(v){return v==='auto'||v==='scroll';};
        var scrolls=((can(cs.overflowX)&&el.scrollWidth>el.clientWidth+2)||(can(cs.overflowY)&&el.scrollHeight>el.clientHeight+2))&&!el.querySelector('a,button,input,select,textarea,[tabindex]');
        if(scrolls&&!el.hasAttribute('tabindex')){
          el.setAttribute('tabindex','0');el.setAttribute('data-scroll-region','');
          if(el.localName==='div'&&!el.hasAttribute('role')){el.setAttribute('role','region');el.setAttribute('aria-label',(el.querySelector('table')?'Tabel':'Konten')+' yang dapat digeser');}
        } else if(!scrolls&&el.hasAttribute('data-scroll-region')){
          el.removeAttribute('tabindex');el.removeAttribute('data-scroll-region');
          if(el.getAttribute('role')==='region'){el.removeAttribute('role');el.removeAttribute('aria-label');}
        }
      });
    }
    var scrollTimer;
    function scheduleScrollRegions(){clearTimeout(scrollTimer);scrollTimer=setTimeout(markScrollRegions,120);}
    window.addEventListener('resize',scheduleScrollRegions);
    document.addEventListener('click',scheduleScrollRegions);
    // Existing clickable SVG marks become keyboard-operable, including rebuilt marks.
    function accessible(root) {
      root.querySelectorAll('svg rect,svg circle,svg g,.token-chip,.pred-chip,.qa-token').forEach(function(el){
        var clickable=(el.__on || []).some(function(x){return x.type==='click';}) || el.matches('.token-chip,.pred-chip,.qa-token');
        if (!clickable || el.hasAttribute('tabindex')) return;
        el.setAttribute('tabindex','0');el.setAttribute('role','button');
        if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label',el.textContent.trim() || (el.__data__ && (el.__data__.word || el.__data__.label)) || ('Tampilkan detail '+describe(el.closest('svg'))+' pada x '+(el.getAttribute('x')||el.getAttribute('cx')||'?')+', y '+(el.getAttribute('y')||el.getAttribute('cy')||'?')));
        el.addEventListener('keydown',function(e){
          if(e.target!==el)return;
          var svg=el.closest('svg');
          if(svg&&['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].indexOf(e.key)>=0){
            e.preventDefault();var marks=Array.from(svg.querySelectorAll('[role="button"]')),index=marks.indexOf(el);
            var next=e.key==='Home'?0:e.key==='End'?marks.length-1:(index+(['ArrowLeft','ArrowUp'].indexOf(e.key)>=0?-1:1)+marks.length)%marks.length;
            marks.forEach(function(m,i){m.setAttribute('tabindex',i===next?'0':'-1');});marks[next].focus();return;
          }
          if(e.key==='Enter'||e.key===' '){e.preventDefault();var click=new MouseEvent('click',{bubbles:true});click.kupasKeyboard=true;el.dispatchEvent(click);}});
      });
      var svgs=Array.from(root.querySelectorAll('svg'));
      if(root.closest){var owner=root.closest('svg');if(owner)svgs.push(owner);}
      svgs.forEach(function(svg){var marks=Array.from(svg.querySelectorAll('[role="button"]'));var current=marks.find(function(m){return m===document.activeElement;})||marks.find(function(m){return m.getAttribute('tabindex')==='0';});marks.forEach(function(m,i){m.setAttribute('tabindex',m===(current||marks[0])?'0':'-1');});});
    }
    // Everything below can run again after the main content is rebuilt for a theme switch.
    function enhance(){
      document.querySelectorAll('table').forEach(function(t){if(t.parentElement.classList.contains('table-scroll'))return;var wrap=document.createElement('div');wrap.className='table-scroll';t.before(wrap);wrap.appendChild(t);});
      accessible(document);
      document.querySelectorAll('svg').forEach(prepareSvg);
      markScrollRegions();
      // On phones the course code moves from the navbar into the page header.
      var meta=document.querySelector('.navbar-meta'),head=document.querySelector('.page-header-content');
      if(meta&&head&&!head.querySelector('.page-meta-mobile')){var m=document.createElement('p');m.className='page-meta-mobile';m.textContent=meta.textContent;var back=head.querySelector('.back-link');(back||head.firstElementChild).after(m);}
      document.querySelectorAll('input,select,textarea').forEach(function(el){if(el.id && !document.querySelector('label[for="'+el.id+'"]')&&!el.hasAttribute('aria-label'))el.setAttribute('aria-label',el.id.replace(/-/g,' '));});
      bindNote();
    }
    var pending=new Set(),queued=false;
    function flush(){queued=false;pending.forEach(prepareSvg);pending.clear();scheduleScrollRegions();}
    new MutationObserver(function(records){records.forEach(function(r){
      r.addedNodes.forEach(function(n){if(n.nodeType===1)accessible(n.parentElement || n);});
      var svg=r.target.closest && (r.target.localName==='svg'?r.target:r.target.closest('svg'));
      if(r.type==='childList') r.addedNodes.forEach(function(n){if(n.nodeType===1&&n.querySelectorAll)n.querySelectorAll('svg').forEach(function(x){pending.add(x);});if(n.localName==='svg')pending.add(n);});
      if(svg)pending.add(svg);
      if(pending.size&&!queued){queued=true;requestAnimationFrame(flush);}
      if(r.type==='childList')scheduleScrollRegions();
    });}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['viewBox']});
    // Learning notes persist per page in this browser only.
    function bindNote(){
      var note=document.getElementById('reflection'),noteKey='kupasai-reflection:'+location.pathname,status=document.getElementById('reflection-status');
      if(!note||note.hasAttribute('data-bound'))return;
      note.setAttribute('data-bound','');
      try{var stored=localStorage.getItem(noteKey);if(stored&&!note.value)note.value=stored;}catch(e){}
      note.addEventListener('input',function(){
        try{if(note.value)localStorage.setItem(noteKey,note.value);else localStorage.removeItem(noteKey);
          if(status)status.textContent='Tersimpan di peramban ini pukul '+new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})+'.';}
        catch(e){if(status)status.textContent='Catatan tidak dapat disimpan di peramban ini.';}
      });
    }
    enhance();
    function replay(saved){
      replaying=true;
      saved.history.forEach(function(e){var el=document.querySelector(e.selector);if(!el)return;if(e.type==='click')el.dispatchEvent(new MouseEvent('click',{bubbles:true}));else{el.value=e.value;if(e.checked!==undefined)el.checked=e.checked;el.dispatchEvent(new Event(e.type,{bubbles:true}));}});
      history=saved.history;replaying=false;
      requestAnimationFrame(function(){window.scrollTo(0,saved.scroll);if(saved.focus){var focus=document.querySelector(saved.focus);if(focus)focus.focus({preventScroll:true});}});
    }
    var saved;
    try {saved=JSON.parse(sessionStorage.getItem(key));sessionStorage.removeItem(key);} catch(e) {}
    if(saved)replay(saved);
    // Theme switch without a reload: rebuild <main> from the page source, rerun its
    // scripts (data and the D3 bundle stay loaded), then replay the learner's inputs.
    window.KupasLearning.rerender=function(){
      var main=document.querySelector('main');
      if(!main||!window.fetch||!window.DOMParser||location.protocol==='file:')return Promise.reject(new Error('unsupported'));
      var state={history:history.slice(),scroll:scrollY,focus:selector(document.activeElement),modules:window.KupasState?window.KupasState.capture():{}};
      return fetch(location.pathname+location.search,{credentials:'same-origin'}).then(function(r){if(!r.ok)throw new Error(r.status);return r.text();}).then(function(html){
        var doc=new DOMParser().parseFromString(html,'text/html'),fresh=doc.querySelector('main');
        if(!fresh)throw new Error('no main');
        var node=document.importNode(fresh,true);
        node.style.minHeight=main.offsetHeight+'px';
        main.replaceWith(node);
        // Imported <script> elements stay inert; page scripts run again as fresh copies.
        var sources=[].slice.call(doc.body.querySelectorAll('script[src]')).map(function(x){return x.getAttribute('src');})
          .concat(['/kupasai/assets/js/experiments.js','/kupasai/assets/js/catalog.js','/kupasai/assets/js/offline.js'])
          .filter(function(src){return !/vendor\/|data\.js$|theme\.js$|learning\.js$/.test(src);});
        return sources.reduce(function(chain,src){return chain.then(function(){return new Promise(function(resolve,reject){
          var s=document.createElement('script');s.src=src;s.onload=function(){s.remove();resolve();};s.onerror=reject;document.body.appendChild(s);
        });});},Promise.resolve()).then(function(){
          enhance();replay(state);if(window.KupasState)window.KupasState.restore(state.modules);
          requestAnimationFrame(function(){node.style.minHeight='';});
        });
      });
    };
    var main=document.querySelector('main')||document.querySelector('.viz-container,.content-wrapper,.topic-table-wrap');
    if(main){main.id=main.id||'main-content';var skip=document.createElement('a');skip.className='skip-link';skip.href='#'+main.id;skip.textContent='Langsung ke materi';document.body.prepend(skip);main.setAttribute('tabindex','-1');}
  });
})();

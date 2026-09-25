/*
 * KupasAI - Theme toggle
 * Theme itself is applied pre-paint by the inline script in <head>.
 * CSS follows data-theme immediately. Visualizations that pick their colors
 * in JavaScript (viz.js marked data-theme-aware) are rebuilt in place by
 * learning.js; if that is not possible the page reloads and replays inputs.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    var root = document.documentElement;
    btn.addEventListener('click', function () {
      if (root.hasAttribute('data-rerendering')) return;
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('theme', next); } catch (e) {}
      function reload() {
        if (window.KupasLearning) window.KupasLearning.saveForTheme();
        location.reload();
      }
      if (!document.querySelector('script[data-theme-aware]')) { root.setAttribute('data-theme', next); return; }
      if (!window.KupasLearning || !window.KupasLearning.rerender) { reload(); return; }
      root.setAttribute('data-rerendering', '');
      root.setAttribute('data-theme', next);
      window.KupasLearning.rerender().then(function () {
        root.removeAttribute('data-rerendering');
      }, reload);
    });
  });
})();

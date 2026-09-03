/*
 * KupasAI - Theme toggle
 * Theme itself is applied pre-paint by the inline script in <head>.
 * This just wires the toggle button; visualizations read their colors
 * from data-theme at load time, so a full reload keeps every canvas correct.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('theme', next); } catch (e) {}
      location.reload();
    });
  });
})();

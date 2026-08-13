/*
 * KupasAI - Shared utilities
 */

(function () {
  'use strict';

  // Active nav link highlighting based on current path
  document.addEventListener('DOMContentLoaded', function () {
    var path = window.location.pathname;
    var links = document.querySelectorAll('.navbar-links a');
    links.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href && href !== '/' && path.startsWith(href)) {
        link.classList.add('active');
      }
    });
  });
})();

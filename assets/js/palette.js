/*
 * KupasAI - Palet visualisasi
 * Satu sumber warna untuk semua viz.js. Nilai dibaca dari token CSS di
 * main.css (--viz-*, --text-*, --bg-*), sehingga mode terang dan gelap
 * otomatis mengikuti. Nilai cadangan dipakai bila CSS belum termuat.
 *
 * Aturan tiga warna: biru (warna kedua) untuk data, kunyit (aksen) untuk
 * kategori lawan atau sorotan, gradasi abu kebiruan untuk unsur netral.
 */
(function () {
  'use strict';

  var FALLBACK = {
    light: {
      text: '#1b2533', muted: '#4e5d74', heading: '#163a6b', border: '#c6d3e6',
      page: '#f5f7fa', card: '#e6edf7', raised: '#ffffff', tint: '#d6e2f2',
      data: '#1f4e8c', data2: '#456b9e', accent: '#f2b705', accentText: '#7a5800', accentLine: '#b07f00',
      danger: '#b42318', axis: '#8fa3c2', grid: '#d6e2f2', onData: '#ffffff', onAccent: '#1b2533'
    },
    dark: {
      text: '#dde5f0', muted: '#94a5be', heading: '#a8c5ee', border: '#2b4061',
      page: '#0c1420', card: '#14233a', raised: '#14233a', tint: '#1f3555',
      data: '#a8c5ee', data2: '#6f93c6', accent: '#f5c431', accentText: '#f5c431', accentLine: '#f5c431',
      danger: '#f97066', axis: '#4a6890', grid: '#1f3555', onData: '#0c1420', onAccent: '#0c1420'
    }
  };

  var TOKENS = {
    text: '--text-primary', muted: '--text-muted', heading: '--heading', border: '--border',
    page: '--bg-primary', card: '--bg-secondary', raised: '--bg-raised', tint: '--bg-tertiary',
    data: '--viz-data', data2: '--viz-data-2', accent: '--viz-accent', accentText: '--viz-accent-text', accentLine: '--accent-line',
    danger: '--viz-danger', axis: '--viz-axis', grid: '--viz-grid', onData: '--on-data', onAccent: '--on-accent'
  };

  function isDark() {
    var root = document.documentElement;
    var theme = root.getAttribute('data-theme');
    if (theme) return theme === 'dark';
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  function palette() {
    var dark = isDark();
    var fallback = FALLBACK[dark ? 'dark' : 'light'];
    var style = null;
    try { style = window.getComputedStyle(document.documentElement); } catch (e) { style = null; }
    var out = { dark: dark };
    Object.keys(TOKENS).forEach(function (key) {
      var value = style ? String(style.getPropertyValue(TOKENS[key]) || '').trim() : '';
      out[key] = /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : fallback[key];
    });
    return out;
  }

  // Warna dengan transparansi, misalnya untuk latar area keputusan.
  palette.alpha = function (hex, a) {
    var h = String(hex).replace('#', '');
    var r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  };

  // Warna teks (putih atau gelap) dengan kontras tertinggi terhadap warna latar.
  palette.textOn = function (bg) {
    var m = String(bg).match(/^#([0-9a-f]{6})$/i), c;
    if (m) c = [0, 2, 4].map(function (i) { return parseInt(m[1].slice(i, i + 2), 16); });
    else {
      m = String(bg).match(/rgba?\(([^)]+)\)/);
      if (!m) return '#1b2533';
      c = m[1].split(',').slice(0, 3).map(function (v) { return parseFloat(v); });
    }
    var L = 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
    var dark = 0.2126 * lin(27) + 0.7152 * lin(37) + 0.0722 * lin(51);
    return (1.05 / (L + 0.05)) >= ((L + 0.05) / (dark + 0.05)) ? '#ffffff' : '#1b2533';
  };

  function lin(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }

  // Warna kategori (maks. 6) dari tiga warna dasar beserta gradasinya.
  // Untuk lebih dari empat kategori, bedakan juga dengan bentuk atau label.
  palette.categorical = function (p) {
    p = p || palette();
    return p.dark
      ? [p.data, p.accent, '#5b7ba6', '#b38a1c', '#e3eaf4', '#3b5a85']
      : [p.data, p.accentLine, '#6585b8', '#5c4300', p.muted, '#9fb3d1'];
  };

  // Skala berurutan dari permukaan kartu ke biru data (pengganti interpolateBlues).
  palette.sequential = function (p) {
    p = p || palette();
    return d3InterpolateRgb(p.tint, p.data);
  };

  // Skala berurutan kunyit (pengganti interpolateOrRd).
  palette.sequentialAccent = function (p) {
    p = p || palette();
    return d3InterpolateRgb(p.dark ? '#3a3216' : '#fcefc2', p.dark ? p.accent : p.accentText);
  };

  // Skala divergen: kunyit (negatif) - permukaan - biru (positif).
  palette.diverging = function (p) {
    p = p || palette();
    var neg = d3InterpolateRgb(p.accent, p.raised), pos = d3InterpolateRgb(p.raised, p.data);
    return function (t) { return t < 0.5 ? neg(t * 2) : pos((t - 0.5) * 2); };
  };

  function d3InterpolateRgb(a, b) {
    if (window.d3 && window.d3.interpolateRgb) return window.d3.interpolateRgb(a, b);
    var pa = [1, 3, 5].map(function (i) { return parseInt(a.slice(i, i + 2), 16); });
    var pb = [1, 3, 5].map(function (i) { return parseInt(b.slice(i, i + 2), 16); });
    return function (t) {
      return 'rgb(' + pa.map(function (v, k) { return Math.round(v + (pb[k] - v) * t); }).join(',') + ')';
    };
  }

  window.KupasPalette = palette;
})();

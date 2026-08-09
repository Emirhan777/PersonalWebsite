/* ============================================================
   Emirhan Şimşek — personal site
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme ---------- */
  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');

  try {
    var saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);
  } catch (e) { /* storage blocked — fall back to system preference */ }

  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
    });
  }

  /* ---------- Header state ---------- */
  var header = document.getElementById('siteHeader');
  function onScroll() {
    if (header) header.classList.toggle('is-stuck', window.scrollY > 12);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');

  function setMenu(open) {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navMenu.classList.toggle('is-open', open);
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
    });

    navMenu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });

    document.addEventListener('click', function (e) {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) setMenu(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealables = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealables, function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        // Stagger siblings so grids cascade instead of popping in together.
        var siblings = entry.target.parentElement
          ? entry.target.parentElement.querySelectorAll(':scope > .reveal')
          : [];
        var index = Array.prototype.indexOf.call(siblings, entry.target);
        entry.target.style.transitionDelay = Math.min(index, 6) * 65 + 'ms';
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(revealables, function (el) { io.observe(el); });
  }

  /* ---------- Current year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ============================================================
     Hero ink trail — a nod to PenDraw: the pointer leaves a
     stroke that fades, the way the apps turn motion into a line.
     ============================================================ */
  var canvas = document.getElementById('heroCanvas');
  if (!canvas || reduceMotion) return;

  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var w = 0, h = 0;
  var points = [];
  var MAX_POINTS = 46;
  var pointer = { x: 0, y: 0, active: false };
  var idle = { t: Math.random() * 1000, on: true };
  var running = true;

  function resize() {
    var rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener('resize', resize);

  canvas.parentElement.addEventListener('pointermove', function (e) {
    var rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.active = true;
    idle.on = false;
  });

  canvas.parentElement.addEventListener('pointerleave', function () {
    pointer.active = false;
    idle.on = true;
  });

  // Pause when the hero scrolls out of view so we aren't burning frames.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      running = entries[0].isIntersecting;
    }, { threshold: 0 }).observe(canvas);
  }

  function inkColor() {
    return getComputedStyle(root).getPropertyValue('--canvas-ink').trim() || '91, 157, 255';
  }

  var ink = inkColor();
  setInterval(function () { ink = inkColor(); }, 1000);

  function drift(t) {
    // A slow Lissajous wander, so the canvas is never fully still.
    var cx = w * 0.5, cy = h * 0.5;
    return {
      x: cx + Math.sin(t * 0.00042) * w * 0.32 + Math.sin(t * 0.00097) * w * 0.07,
      y: cy + Math.cos(t * 0.00061) * h * 0.26 + Math.cos(t * 0.00131) * h * 0.06
    };
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (!running || w === 0) return;

    var target;
    if (pointer.active) {
      target = { x: pointer.x, y: pointer.y };
    } else {
      idle.t += 16;
      target = drift(idle.t);
    }

    var last = points[points.length - 1];
    if (!last || Math.hypot(target.x - last.x, target.y - last.y) > 1.2) {
      points.push({ x: target.x, y: target.y });
      if (points.length > MAX_POINTS) points.shift();
    }

    ctx.clearRect(0, 0, w, h);
    if (points.length < 3) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (var i = 1; i < points.length - 1; i++) {
      var p = points[i];
      var next = points[i + 1];
      var ratio = i / points.length;

      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      // Quadratic through the midpoint keeps the stroke smooth.
      ctx.quadraticCurveTo(p.x, p.y, (p.x + next.x) / 2, (p.y + next.y) / 2);
      ctx.strokeStyle = 'rgba(' + ink + ', ' + (ratio * 0.30).toFixed(3) + ')';
      ctx.lineWidth = ratio * 5.5 + 0.4;
      ctx.stroke();
    }

    // Leading dot.
    var head = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(head.x, head.y, 3.1, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(' + ink + ', 0.42)';
    ctx.fill();
  }

  requestAnimationFrame(frame);
})();

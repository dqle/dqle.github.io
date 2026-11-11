/* dqle.io — site behaviour: theme toggle, scroll reveal, nav spy, topbar state */
(function () {
  'use strict';

  var root = document.documentElement;
  var STORE = 'dqle-theme';

  /* ---------- Theme ---------- */
  function systemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(name) {
    root.setAttribute('data-theme', name);
    try { localStorage.setItem(STORE, name); } catch (e) { /* private mode */ }
  }

  var saved = null;
  try { saved = localStorage.getItem(STORE); } catch (e) { saved = null; }
  applyTheme(saved || systemTheme());

  var toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
    });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Topbar shadow on scroll ---------- */
  var topbar = document.getElementById('topbar');
  function onScroll() {
    if (!topbar) return;
    topbar.classList.toggle('stuck', window.scrollY > 8);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  var revealables = [].slice.call(document.querySelectorAll('.reveal'));
  var io = null;
  var canObserve = 'IntersectionObserver' in window;
  if (canObserve && revealables.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // slight stagger for siblings entering together
        el.style.transitionDelay = (el.dataset.delay || (i * 60)) + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('in'); });
  }
  var reveal = function (el) { el.classList.add('in'); };

  /* ---------- Stagger project / skill / lab cards ---------- */
  ['.project-grid .project', '.skills-grid .skill-card', '.lab-grid .lab-card'].forEach(function (sel) {
    var items = document.querySelectorAll(sel);
    if (items.length && !items[0].classList.contains('reveal')) {
      items.forEach(function (el, i) {
        el.classList.add('reveal');
        el.dataset.delay = String(i * 70);
        revealables.push(el);
        if (canObserve && io) io.observe(el);
        else reveal(el);
      });
    }
  });

  /* ---------- Nav active-section highlight ---------- */
  var links = [].slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var targets = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && targets.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(function (t) { spy.observe(t); });
  }
})();

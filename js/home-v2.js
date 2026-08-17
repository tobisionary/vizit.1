/* VIZIT HOME v2 — behavior. Deferred; no layout thrash, all rAF/IO driven. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Unified reveal system ──
     Any .fx element fades/rises in when it enters the viewport.
     .fx-group children get auto-staggered via --fxd. */
  (function () {
    document.querySelectorAll('.fx-group').forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.classList.add('fx');
        child.style.setProperty('--fxd', String(Math.min(i, 8)));
      });
    });
    var targets = document.querySelectorAll('.fx, .fx-zoom');
    if (!('IntersectionObserver' in window) || reduce) return; // content stays visible

    // Opt in to the hidden state only now that the reveal system is live.
    document.documentElement.classList.add('js-fx');

    // Immediately reveal anything already in (or near) the viewport,
    // so first paint never depends on IO callbacks firing.
    var vh = window.innerHeight || 800;
    targets.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.95 && r.bottom > 0) el.classList.add('in');
    });

    var ioFired = false;
    var io = new IntersectionObserver(function (entries) {
      ioFired = true;
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) { if (!el.classList.contains('in')) io.observe(el); });

    // Safety: if IO never fires (broken environments), reveal everything.
    setTimeout(function () {
      if (!ioFired) targets.forEach(function (el) { el.classList.add('in'); });
    }, 1200);
  })();

  /* ── Live revenue ticker ── */
  (function () {
    var el = document.getElementById('ticker');
    if (!el) return;
    var value = 2100000000, perSec = 24400, start = Date.now();
    if (reduce) { el.textContent = value.toLocaleString('en-US'); return; }
    var visible = false;
    var io = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) requestAnimationFrame(step);
    }, { threshold: 0 });
    io.observe(el);
    function step() {
      if (!visible) return;
      var elapsed = (Date.now() - start) / 1000;
      el.textContent = Math.floor(value + elapsed * perSec).toLocaleString('en-US');
      requestAnimationFrame(step);
    }
  })();

  /* ── Count-up stats ── */
  (function () {
    var nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;
    function run(el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var prefix = el.getAttribute('data-prefix') || '';
      var valueEl = el.querySelector('.v') || el;
      if (reduce) { valueEl.textContent = prefix + target; return; }
      var dur = 1400, start = performance.now();
      function tick(now) {
        var t = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - t, 3);
        valueEl.textContent = prefix + Math.round(target * eased);
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  })();

  /* ── FAQ accordion ── */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentElement;
      var wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (i) {
        i.classList.remove('open');
        i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

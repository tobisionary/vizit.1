/* ══════════════════════════════════════════════════════════════
   VIZIT SCORE v2 — interactions
   1. Hero stage: pick an asset variant → scan beam → score counts up
   2. Spectrum rail: drag 0–100 → tier, copy, image quality + lift react
   3. Journey: four expanding "moments" (click to open)
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var TIERS = [
    { min: 0,  max: 39,  color: '#c8453a', name: 'High Conversion Risk',
      desc: 'Vizit AI predicts many shoppers will leave without buying, based on what converts in this category.' },
    { min: 40, max: 59,  color: '#d99b27', name: 'At Risk',
      desc: 'Underperforming against the conversion standards of this category. Revenue is leaking on every impression.' },
    { min: 60, max: 79,  color: '#34a0fe', name: 'Competitive',
      desc: 'Converts at a competitive rate — holds its own without winning. Not yet Vizit Certified.' },
    { min: 80, max: 100, color: '#0174d9', name: 'Vizit Certified',
      desc: 'Predicted to win shoppers at first impression. This asset meets the Vizit Standard for its category.' }
  ];
  function tierFor(s) {
    for (var i = 0; i < TIERS.length; i++) if (s <= TIERS[i].max) return TIERS[i];
    return TIERS[TIERS.length - 1];
  }
  /* image treatment that tracks the score — high scores look crisp,
     low scores wash out, like a weak asset on the shelf */
  function filterFor(s) {
    var t = s / 100;
    var sat = (0.25 + 0.75 * t).toFixed(3);
    var con = (0.72 + 0.28 * t).toFixed(3);
    var bri = (1.06 - 0.06 * t).toFixed(3);
    var blur = ((1 - t) * 1.4).toFixed(2);
    return 'saturate(' + sat + ') contrast(' + con + ') brightness(' + bri + ') blur(' + blur + 'px)';
  }

  /* ── 1. HERO STAGE ────────────────────────────── */
  var stage = document.getElementById('svStage');
  if (stage) {
    var img = document.getElementById('svStageImg');
    var num = document.getElementById('svHeroNum');
    var bar = document.getElementById('svHeroBar');
    var chip = document.getElementById('svHeroChip');
    var chipDot = chip.querySelector('i');
    var chipTxt = chip.querySelector('span');
    var variants = Array.prototype.slice.call(document.querySelectorAll('.sv-variant'));
    var raf = null;

    function countTo(target) {
      if (raf) cancelAnimationFrame(raf);
      var from = parseInt(num.textContent, 10) || 0;
      var t0 = null, DUR = 750;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / DUR);
        var e = 1 - Math.pow(1 - p, 3);
        num.textContent = Math.round(from + (target - from) * e);
        if (p < 1) raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
    }

    function applyVariant(btn, animate) {
      var score = parseInt(btn.dataset.score, 10);
      var t = tierFor(score);
      variants.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      img.style.filter = btn.dataset.filter || 'none';

      var reveal = function () {
        countTo(score);
        bar.style.width = score + '%';
        bar.style.background = t.color;
        chipDot.style.background = t.color;
        chipTxt.textContent = t.name;
      };

      if (animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        stage.classList.remove('is-scanning');
        void stage.offsetWidth; /* restart animation */
        stage.classList.add('is-scanning');
        setTimeout(reveal, 520);
      } else {
        reveal();
      }
    }

    variants.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.getAttribute('aria-pressed') === 'true') return;
        applyVariant(btn, true);
      });
    });

    /* first paint: score the default (best) asset */
    var first = document.querySelector('.sv-variant[aria-pressed="true"]') || variants[0];
    if (first) setTimeout(function () { applyVariant(first, true); }, 450);
  }

  /* ── 2. SPECTRUM RAIL ─────────────────────────── */
  var rail = document.getElementById('svRail');
  if (rail) {
    var range = document.getElementById('svRange');
    var needle = document.getElementById('svNeedle');
    var bigNum = document.getElementById('svSpecNum');
    var tDot = document.getElementById('svSpecDot');
    var tName = document.getElementById('svSpecName');
    var tDesc = document.getElementById('svSpecDesc');
    var photo = document.getElementById('svSpecImg');
    var lift = document.getElementById('svSpecLift');
    var START = 52;

    function render(s) {
      var t = tierFor(s);
      bigNum.textContent = s;
      needle.style.left = s + '%';
      needle.setAttribute('data-val', s);
      tDot.style.background = t.color;
      tName.textContent = t.name;
      tDesc.textContent = t.desc;
      photo.style.filter = filterFor(s);
      var gap = Math.max(0, 80 - s);
      if (gap > 0) {
        var pts = Math.round(gap);
        var liftPct = (gap / 10 * 4).toFixed(0);
        lift.innerHTML = '<b>' + pts + ' points</b> below the Vizit Certified standard — closing the gap unlocks an estimated <b>+' + liftPct + '%</b> relative conversion lift.';
      } else {
        lift.innerHTML = '<b>Vizit Certified.</b> This asset meets the 80+ Vizit Standard — predicted to win first impressions in its category.';
      }
    }

    range.addEventListener('input', function () { render(parseInt(range.value, 10)); });
    range.value = START;
    render(START);
  }

  /* ── 3. JOURNEY MOMENTS ───────────────────────── */
  var moments = Array.prototype.slice.call(document.querySelectorAll('.sv-moment'));
  moments.forEach(function (m) {
    function open() {
      moments.forEach(function (o) {
        var on = o === m;
        o.classList.toggle('is-open', on);
        o.setAttribute('aria-expanded', on ? 'true' : 'false');
      });
    }
    m.addEventListener('click', open);
    m.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });
})();

// ══════════════════════════════════════════════════════════════
// Vizit Platform page — interactives
// ══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── Reveal on scroll ────────────────────────────────
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // ── Equation conduit (Platform panel 2) ──────────────
  const conduit = document.getElementById('eqConduit');
  if (conduit) {
    const liveTokens = document.querySelectorAll('.eq-token--live');
    const drawConduit = () => {
      const r = conduit.getBoundingClientRect();
      if (r.width < 10) return;
      const w = r.width;
      const h = r.height;
      const cx = w / 2;
      let paths = '';
      let dots = '';
      liveTokens.forEach((t, i) => {
        const tr = t.getBoundingClientRect();
        const x = (tr.left + tr.width / 2 - r.left).toFixed(1);
        const d =
          'M ' + x + ' 6 C ' + x + ' ' + (h * 0.52).toFixed(1) +
          ', ' + cx + ' ' + (h * 0.48).toFixed(1) +
          ', ' + cx + ' ' + (h - 5);
        paths +=
          '<path class="conduit-base" d="' + d + '"></path>' +
          '<path class="conduit-flow" id="cflow' + i + '" d="' + d +
          '" pathLength="144" style="animation-delay:' + (i * -1.4).toFixed(1) + 's"></path>';
        dots +=
          '<circle class="conduit-dot" r="2.5">' +
          '<animateMotion dur="2.8s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear" begin="' + (i * 1.4).toFixed(1) + 's">' +
          '<mpath href="#cflow' + i + '"></mpath></animateMotion></circle>';
      });
      conduit.innerHTML =
        '<svg viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true">' +
        paths + dots +
        '<circle class="conduit-node" cx="' + cx + '" cy="' + (h - 5) + '" r="3.5"></circle>' +
        '</svg>';
    };
    drawConduit();
    window.addEventListener('resize', drawConduit);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(drawConduit);
    }
  }

  // ── Product tabs ─────────────────────────────────────
  const tabsRoot = document.getElementById('moduleTabs');
  if (tabsRoot) {
    const btns = tabsRoot.querySelectorAll('.tabs__btn');
    const panels = tabsRoot.querySelectorAll('.tabs__panel');
    btns.forEach((b) => {
      b.addEventListener('click', () => {
        const target = b.getAttribute('data-target');
        btns.forEach((x) =>
          x.setAttribute('aria-selected', x === b ? 'true' : 'false')
        );
        panels.forEach((p) =>
          p.setAttribute(
            'aria-hidden',
            p.id === target ? 'false' : 'true'
          )
        );
      });
    });
  }

  // ── Workflow stepper (Panel 6) ─────────────────────
  const wf = document.getElementById('workflow');
  if (wf) {
    const steps = wf.querySelectorAll('.step');
    const stages = wf.querySelectorAll('.stage-card');

    const setStage = (id) => {
      steps.forEach((s) =>
        s.classList.toggle('active', s.dataset.stage === id)
      );
      stages.forEach((c) =>
        c.setAttribute(
          'data-active',
          c.dataset.stage === id ? 'true' : 'false'
        )
      );
    };

    steps.forEach((s) => {
      s.addEventListener('click', () => setStage(s.dataset.stage));
    });

    // Auto-advance once visible, until user clicks
    let userInteracted = false;
    steps.forEach((s) =>
      s.addEventListener('click', () => {
        userInteracted = true;
      })
    );

    const seen = { v: false };
    const wio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !seen.v) {
            seen.v = true;
            const ids = ['s1', 's2', 's3', 's4', 's5', 's6'];
            let i = 0;
            const tick = () => {
              if (userInteracted) return;
              i = (i + 1) % ids.length;
              setStage(ids[i]);
              setTimeout(tick, 3200);
            };
            setTimeout(tick, 3200);
          }
        });
      },
      { threshold: 0.3 }
    );
    wio.observe(wf);
  }

  // ── Flywheel — sync list highlight w/ rotating ring ─
  const fwList = document.querySelectorAll('.flywheel__list li');
  if (fwList.length) {
    fwList.forEach((li, i) => {
      li.addEventListener('mouseenter', () => {
        fwList.forEach((l) => l.classList.remove('active'));
        li.classList.add('active');
      });
    });
    // auto cycle highlight too
    let i = 0;
    setInterval(() => {
      if (document.hidden) return;
      i = (i + 1) % fwList.length;
      fwList.forEach((l, n) => l.classList.toggle('active', n === i));
    }, 2500);
  }

  // ── FAQ accordion ────────────────────────────────────
  const faq = document.getElementById('faq');
  if (faq) {
    faq.querySelectorAll('.faq__item').forEach((item) => {
      const btn = item.querySelector('.faq__q');
      btn.addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');
        // close all
        faq
          .querySelectorAll('.faq__item.open')
          .forEach((i) => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
      });
    });
  }

  // ── Smooth nav state on scroll: shadow + condense ──
  const nav = document.querySelector('.nav');
  let lastY = 0;
  window.addEventListener(
    'scroll',
    () => {
      if (!nav) return;
      const y = window.scrollY;
      if (y > 8) nav.style.boxShadow = '0 1px 0 rgba(0,0,0,0.04)';
      else nav.style.boxShadow = 'none';
      lastY = y;
    },
    { passive: true }
  );

  // ══════════════════════════════════════════════════════
  // TWEAKS PANEL
  // ══════════════════════════════════════════════════════
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/ {
    accentHue: 'blue',
    density: 'comfortable',
    bgStyle: 'soft',
    italicAccent: true,
    workflowAuto: true
  } /*EDITMODE-END*/;

  const tweaks = Object.assign({}, TWEAK_DEFAULTS);

  function applyTweaks() {
    // Accent hue swap (we stay on-brand: just shift accent stop within blues)
    const root = document.documentElement.style;
    if (tweaks.accentHue === 'blue') {
      root.setProperty('--accent', '#0174D9');
      root.setProperty('--accent-soft', '#E6F3FF');
    } else if (tweaks.accentHue === 'deep') {
      root.setProperty('--accent', '#014C8E');
      root.setProperty('--accent-soft', '#E6F3FF');
    } else if (tweaks.accentHue === 'electric') {
      root.setProperty('--accent', '#34A0FE');
      root.setProperty('--accent-soft', '#E6F3FF');
    }

    // Density
    if (tweaks.density === 'compact') {
      root.setProperty('--space-10', '5rem');
      root.setProperty('--space-9', '4rem');
    } else if (tweaks.density === 'spacious') {
      root.setProperty('--space-10', '10rem');
      root.setProperty('--space-9', '7.5rem');
    } else {
      root.setProperty('--space-10', '8rem');
      root.setProperty('--space-9', '6rem');
    }

    // Italic accent — toggle whether em gets brand color
    if (!tweaks.italicAccent) {
      document.body.style.setProperty('--italic-on', '0');
      injectItalicOverride(false);
    } else {
      injectItalicOverride(true);
    }
  }

  function injectItalicOverride(on) {
    let el = document.getElementById('__italic_override');
    if (!el) {
      el = document.createElement('style');
      el.id = '__italic_override';
      document.head.appendChild(el);
    }
    el.textContent = on
      ? ''
      : `.headline em, .hero h1 em, .vz-display em, .tabs__intro h3 em, .impact__callout em, .stage-card__title em, .casestudy__brand em, .casestudy__quote em, .testimonial__quote em, .stat__num em, .cta-footer h2 em, .equation-split__col h3 em, .faq__aside h3 em, .xray__callout p em { color: inherit !important; }`;
  }

  function ensurePanel() {
    if (document.getElementById('vz-tweaks')) return;
    const wrap = document.createElement('div');
    wrap.id = 'vz-tweaks';
    wrap.innerHTML = `
      <div class="vz-tweaks__inner">
        <header class="vz-tweaks__head">
          <div>
            <div class="vz-tweaks__eyebrow">Tweaks</div>
            <div class="vz-tweaks__title">Page knobs</div>
          </div>
          <button id="vz-tweaks-close" aria-label="Close">✕</button>
        </header>

        <section class="vz-tweaks__sec">
          <label>Accent</label>
          <div class="vz-seg" data-key="accentHue">
            <button data-v="blue" class="active">Blue</button>
            <button data-v="electric">Electric</button>
            <button data-v="deep">Deep</button>
          </div>
        </section>

        <section class="vz-tweaks__sec">
          <label>Density</label>
          <div class="vz-seg" data-key="density">
            <button data-v="compact">Compact</button>
            <button data-v="comfortable" class="active">Comfort.</button>
            <button data-v="spacious">Spacious</button>
          </div>
        </section>

        <section class="vz-tweaks__sec">
          <label>Blue emphasis</label>
          <button class="vz-toggle active" data-toggle="italicAccent">
            <span></span>
          </button>
        </section>
      </div>
    `;
    Object.assign(wrap.style, {
      position: 'fixed',
      right: '20px',
      bottom: '20px',
      width: '280px',
      zIndex: '9999',
      display: 'none'
    });
    document.body.appendChild(wrap);

    // styles
    const css = document.createElement('style');
    css.textContent = `
      #vz-tweaks { font-family: var(--font-sans); }
      #vz-tweaks .vz-tweaks__inner {
        background: #fff;
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        box-shadow: 0 24px 60px -10px rgba(0,0,0,0.18);
        padding: 18px 18px 14px;
      }
      #vz-tweaks .vz-tweaks__head {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 14px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--border);
      }
      #vz-tweaks .vz-tweaks__eyebrow {
        font-family: var(--font-mono); font-size: 10px; letter-spacing: .12em;
        text-transform: uppercase; color: var(--muted);
      }
      #vz-tweaks .vz-tweaks__title {
        font-family: var(--font-display); font-size: 18px;
      }
      #vz-tweaks button#vz-tweaks-close {
        width: 28px; height: 28px; border-radius: 50%;
        background: var(--color-100); color: var(--color-700);
        font-size: 12px;
      }
      #vz-tweaks .vz-tweaks__sec { margin-bottom: 12px; }
      #vz-tweaks .vz-tweaks__sec > label {
        display: block;
        font-family: var(--font-mono); font-size: 10px; letter-spacing: .1em;
        text-transform: uppercase; color: var(--muted);
        margin-bottom: 8px;
      }
      #vz-tweaks .vz-seg {
        display: grid; grid-auto-flow: column; grid-auto-columns: 1fr;
        gap: 2px;
        background: var(--color-100);
        padding: 3px;
        border-radius: var(--radius-full);
      }
      #vz-tweaks .vz-seg button {
        padding: 7px 10px;
        font-size: 12px; font-weight: 500;
        border-radius: var(--radius-full);
        color: var(--color-700);
      }
      #vz-tweaks .vz-seg button.active {
        background: #fff; color: var(--text);
        box-shadow: 0 1px 2px rgba(0,0,0,0.06);
      }
      #vz-tweaks .vz-toggle {
        width: 38px; height: 22px; border-radius: 999px;
        background: var(--color-200); position: relative; cursor: pointer;
        transition: background var(--duration) var(--ease);
      }
      #vz-tweaks .vz-toggle span {
        position: absolute; top: 3px; left: 3px;
        width: 16px; height: 16px; border-radius: 50%;
        background: #fff; transition: transform var(--duration) var(--ease);
      }
      #vz-tweaks .vz-toggle.active { background: var(--accent); }
      #vz-tweaks .vz-toggle.active span { transform: translateX(16px); }
    `;
    document.head.appendChild(css);

    // wire
    wrap.querySelectorAll('.vz-seg').forEach((seg) => {
      const key = seg.dataset.key;
      seg.querySelectorAll('button').forEach((b) => {
        b.addEventListener('click', () => {
          seg.querySelectorAll('button').forEach((x) =>
            x.classList.remove('active')
          );
          b.classList.add('active');
          tweaks[key] = b.dataset.v;
          applyTweaks();
          persist();
        });
      });
    });
    wrap.querySelectorAll('.vz-toggle').forEach((t) => {
      const key = t.dataset.toggle;
      t.classList.toggle('active', !!tweaks[key]);
      t.addEventListener('click', () => {
        tweaks[key] = !tweaks[key];
        t.classList.toggle('active', tweaks[key]);
        applyTweaks();
        persist();
      });
    });
    wrap.querySelector('#vz-tweaks-close').addEventListener('click', () => {
      hidePanel();
      try {
        window.parent.postMessage(
          { type: '__edit_mode_dismissed' },
          '*'
        );
      } catch (e) {}
    });
  }

  function showPanel() {
    ensurePanel();
    document.getElementById('vz-tweaks').style.display = 'block';
    // reflect current state
    document.querySelectorAll('#vz-tweaks .vz-seg').forEach((seg) => {
      const key = seg.dataset.key;
      seg.querySelectorAll('button').forEach((b) =>
        b.classList.toggle('active', b.dataset.v === tweaks[key])
      );
    });
    document
      .querySelectorAll('#vz-tweaks .vz-toggle')
      .forEach((t) =>
        t.classList.toggle('active', !!tweaks[t.dataset.toggle])
      );
  }
  function hidePanel() {
    const p = document.getElementById('vz-tweaks');
    if (p) p.style.display = 'none';
  }

  function persist() {
    try {
      window.parent.postMessage(
        { type: '__edit_mode_set_keys', edits: tweaks },
        '*'
      );
    } catch (e) {}
  }

  // Listener BEFORE announcing availability
  window.addEventListener('message', (e) => {
    const d = e && e.data;
    if (!d || !d.type) return;
    if (d.type === '__activate_edit_mode') showPanel();
    if (d.type === '__deactivate_edit_mode') hidePanel();
  });
  try {
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
  } catch (e) {}

  // Apply defaults on load
  applyTweaks();
})();

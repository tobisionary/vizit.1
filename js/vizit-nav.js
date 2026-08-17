/* ════════════════════════════════════════════════════════════
   <vizit-nav data-current="...">
   Renders the canonical Vizit global nav (v3) on every page.

   v3 — Global Navigation framework:
   • Full-width mega panels: every dropdown spans the page and its
     content aligns to the nav container (logo edge ↔ CTA edge).
   • Click to open (desktop). Click-outside / Esc / second-click close.
   • Each panel carries a right-hand "Resources" rail with a featured
     item + popular reads, bounded by the CTA button's right edge.

   data-current accepts a page id so the matching top-level item is
   marked aria-current. Recognized ids:
     home · ci · solutions · platform · api · partners · why · results
     · resources · demo · about · leadership · careers · newsroom
     · hero-images · product-page-optimization · retail-media-roas
     · answer-engine-optimization · accessibility

   Styles live in vizit-theme.css so the nav has its shape even
   before this script executes.
   ════════════════════════════════════════════════════════════ */
(function () {
  if (customElements.get('vizit-nav')) return;

  // Inline official Vizit wordmark (assets/logo-black.svg) — uses currentColor
  // so dark-themed pages can recolor it via CSS without swapping files.
  var LOGO_SVG =
    '<svg viewBox="0 0 2808 705" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M969.74 1.72575H847.762V704.036H969.74V1.72575Z"/>' +
      '<path d="M969.3 1.72575H847.321V704.036H969.3V1.72575Z"/>' +
      '<path d="M1226.47 1.72575V118.704H1552.77L1218.54 567.708L1215.9 703.156H1697.21V583.539H1353.29L1697.21 118.704V1.72575H1226.47Z"/>' +
      '<path d="M2231.36 1.72575V118.704H2455.06V704.036H2575.72V1.72575H2231.36Z"/>' +
      '<path d="M2688.45 1.72575V120.903H2807.79V2.60527L2688.45 1.72575Z"/>' +
      '<path d="M2048.61 1.72575H1926.63V704.036H2048.61V1.72575Z"/>' +
      '<path d="M529.384 0.844727L329.022 642.467L129.101 0.844727H0.516602L215.851 700.956H442.194L657.968 0.844727H529.384Z"/>' +
    '</svg>';

  var CHEV =
    '<svg class="vz-chev" viewBox="0 0 12 12" fill="none" aria-hidden="true">' +
    '<path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  var ARROW =
    '<svg class="vz-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
    '<path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  function article(slug) { return 'blog-article.html?slug=' + encodeURIComponent(slug); }

  // ── Single source of truth for the global nav (per Global Navigation v2) ──
  // hrefs are authored as paths from project root (no leading slash); the nav
  // prefixes '../' as needed so the same nav works on root pages AND
  // subdirectory pages (e.g. /solutions/*). '#' = page not built yet.
  var NAV = [
    {
      id: 'platform', label: 'Platform', href: 'vizit-next-gen-platform.html',
      head: 'The Agentic Platform for Content Optimization',
      big: true,
      grid: 1,
      cols: [
        {
          title: 'Products',
          items: [
            { href: 'vizit-next-gen-platform.html', label: 'Vizit Next Gen Platform' },
            { href: 'vizit-api.html', label: 'Vizit API' }
          ]
        }
      ],
      cards: [
        { theme: 'dark', href: 'partner-ecosystem.html', title: 'Partner Ecosystem', sub: 'Integrations and partners that extend Vizit.' }
      ]
    },
    {
      id: 'results', label: 'Results', href: '#',
      head: 'Proof that conversion-ready content moves the needle.',
      big: true,
      cols: [
        {
          title: 'Results',
          items: [
            { href: 'case-studies.html', label: 'Case Studies' }
          ]
        }
      ]
    },
    {
      id: 'resources', label: 'Resources', href: 'blog.html',
      head: 'Sharpen your edge on the visual shelf.',
      big: true,
      cols: [
        {
          title: 'Learn',
          items: [
            { href: 'blog.html', label: 'Blog' }
          ]
        }
      ]
    }
  ];

  var CTA = { href: 'score-your-content.html', label: 'Score your content' };
  var LOGIN = { href: 'https://app.vizit.com/login', label: 'Sign in' };

  // Display order of the top-level tabs (carries across every page).
  var NAV_ORDER = ['platform', 'results', 'resources'];
  NAV.sort(function (a, b) { return NAV_ORDER.indexOf(a.id) - NAV_ORDER.indexOf(b.id); });

  // Which page ids light up which top-level item.
  var CURRENT_MAP = {
    how: 'how', ci: 'how',
    platform: 'platform', api: 'platform',
    'vizit-agents': 'platform', 'vizit-ip': 'platform',
    resources: 'resources',
    results: 'results'
  };

  // Compute the '../' prefix needed to reach the project root from the
  // current page by reading THIS script's own src.
  var ROOT_PREFIX = (function () {
    try {
      var scripts = document.getElementsByTagName('script');
      for (var i = 0; i < scripts.length; i++) {
        var src = scripts[i].getAttribute('src') || '';
        var m = src.match(/^(.*?)(?:js\/)?vizit-nav\.js(?:\?.*)?$/);
        if (m) return m[1] || '';
      }
    } catch (e) {}
    return '';
  })();

  function resolve(href) {
    if (!href) return href;
    if (/^(https?:|mailto:|tel:|#)/.test(href)) return href;
    if (href.charAt(0) === '?') return href;
    if (href.charAt(0) === '/') return href;
    return ROOT_PREFIX + href;
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Assign a top-to-bottom stagger index to each animatable element in a panel
  // so they cascade in on open. Elements sharing a row get the same index (so
  // they appear together); each lower row gets the next index. Called just
  // before .vz-open is added so the measured layout matches the final one.
  function assignStagger(mega) {
    var els = mega.querySelectorAll(
      '.vz-col-title, .vz-col-items a, .vz-card'
    );
    var arr = [];
    for (var i = 0; i < els.length; i++) {
      arr.push({ el: els[i], top: els[i].getBoundingClientRect().top });
    }
    arr.sort(function (a, b) { return a.top - b.top; });
    var idx = -1, last = -1e6;
    for (var j = 0; j < arr.length; j++) {
      if (arr[j].top - last > 6) { idx++; last = arr[j].top; }
      arr[j].el.style.setProperty('--vz-i', idx);
    }
  }

  // A single sub-link with optional descriptor line, plus optional nested
  // child pages (e.g. "Our Vision" under "Stop Wasting the Moment").
  function linkHTML(s, extraClass) {
    var desc = s.desc ? '<span class="vz-desc">' + esc(s.desc) + '</span>' : '';
    return '<a' + (extraClass ? ' class="' + extraClass + '"' : '') + ' href="' + resolve(s.href) + '">' +
             '<span class="vz-label">' + esc(s.label) + '</span>' + desc +
           '</a>';
  }
  function subLink(s) {
    if (s.children && s.children.length) {
      var kids = s.children.map(subLink).join('');
      return '<div class="vz-sub-group">' + linkHTML(s) +
               '<div class="vz-sub-children">' + kids + '</div>' +
             '</div>';
    }
    return linkHTML(s);
  }

  // One column inside the mega panel. A column may carry a title and a
  // value-prop line (Solutions), just a title (Platform / Resources), or
  // neither (Conversion Intelligence / Results — a plain link list).
  function columnHTML(col) {
    var cls = 'vz-col' + (col.span ? ' vz-col-span' : '') + (col.wide ? ' vz-col-wide' : '');
    var head = '';
    if (col.title) head += '<div class="vz-col-title">' + esc(col.title) + '</div>';
    if (col.value) head += '<div class="vz-col-value">' + esc(col.value) + '</div>';
    var links = col.items.map(subLink).join('');
    return '<div class="' + cls + '">' + head +
             '<div class="vz-col-items">' + links + '</div>' +
           '</div>';
  }

  // Webflow-style feature cards at the bottom of the panel — large graphical
  // tiles with a gradient background, a bold title, and a short subtitle.
  function cardsHTML(cards) {
    if (!cards || !cards.length) return '';
    var tiles = cards.map(function (c) {
      if (c.featured) {
        return '<a class="vz-fcard" href="' + resolve(c.href) + '">' +
                 '<span class="vz-fcard-visual" aria-hidden="true">' +
                   '<span class="vz-fcard-bars"><i style="height:38%"></i><i style="height:56%"></i><i style="height:47%"></i><i style="height:72%"></i><i style="height:63%"></i><i style="height:88%"></i></span>' +
                   '<span class="vz-fcard-gauge"><span class="vz-fcard-score">92</span></span>' +
                   '<span class="vz-fcard-stamp">Content Conversion Standard</span>' +
                 '</span>' +
                 '<span class="vz-fcard-body">' +
                   '<span class="vz-fcard-eyebrow">' + esc(c.eyebrow || 'Featured') + '</span>' +
                   '<span class="vz-fcard-title">' + esc(c.title) + '</span>' +
                   '<span class="vz-fcard-desc">' + esc(c.desc || '') + '</span>' +
                   '<span class="vz-fcard-link">' + esc(c.cta || 'Read the report') + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>' +
                 '</span>' +
               '</a>';
      }
      return '<a class="vz-card vz-card-' + (c.theme || 'blue') + '" href="' + resolve(c.href) + '">' +
               '<span class="vz-card-glow" aria-hidden="true"></span>' +
               '<span class="vz-card-body">' +
                 '<span class="vz-card-title">' + esc(c.title) + '</span>' +
                 (c.sub ? '<span class="vz-card-sub">' + esc(c.sub) + '</span>' : '') +
               '</span>' +
             '</a>';
    }).join('');
    return '<div class="vz-cards vz-cards-' + cards.length + '">' + tiles + '</div>';
  }

  function panelHTML(item) {
    // Subheads + divider removed per request — panels open straight to columns.
    var head = '';
    var nCols = (item.cols || []).length;
    var gridN = Math.max(1, Math.min(4, item.grid || nCols));
    var listClass = ' vz-cols-' + gridN;
    var cols = (item.cols || []).map(columnHTML).join('');
    var megaClass = 'vz-mega vz-mega-' + item.id + (item.big ? ' vz-mega-big' : '');
    return '<div class="' + megaClass + '">' +
             '<div class="vz-mega-inner">' +
               '<div class="vz-cols' + listClass + '">' + cols + '</div>' +
               cardsHTML(item.cards) +
             '</div>' +
           '</div>';
  }

  function itemHTML(item, current) {
    var cur = CURRENT_MAP[current] === item.id || current === item.id;
    var curAttr = cur ? ' aria-current="page"' : '';

    if (item.type === 'link') {
      return '<div class="vz-nav-item vz-nav-plain' + (cur ? ' vz-current' : '') + '">' +
               '<a class="vz-nav-trigger" href="' + resolve(item.href) + '"' + curAttr + '>' +
                 esc(item.label) +
               '</a>' +
             '</div>';
    }

    return '<div class="vz-nav-item vz-has-mega' + (cur ? ' vz-current' : '') + '">' +
             '<button class="vz-nav-trigger" type="button" aria-expanded="false"' + curAttr + '>' +
               esc(item.label) + ' ' + CHEV +
             '</button>' +
             panelHTML(item) +
           '</div>';
  }

  function render(current) {
    var linksHTML = NAV.map(function (l) { return itemHTML(l, current); }).join('');
    return (
      '<div class="vz-nav-inner">' +
        '<a href="' + resolve('index.html') + '" class="vz-nav-logo" aria-label="Vizit home">' + LOGO_SVG + '</a>' +
        '<div class="vz-nav-links" id="vz-nav-links">' + linksHTML + '</div>' +
        '<div class="vz-nav-right">' +
          '<a href="' + LOGIN.href + '" class="vz-nav-login">' + esc(LOGIN.label) + '</a>' +
          '<a href="' + resolve(CTA.href) + '" class="vz-nav-cta">' + esc(CTA.label) + '</a>' +
          '<button class="vz-nav-toggle" type="button" aria-expanded="false" aria-label="Open menu" aria-controls="vz-nav-links">' +
            '<span class="vz-bars"><span></span></span>' +
          '</button>' +
        '</div>' +
      '</div>'
    );
  }

  class VizitNav extends HTMLElement {
    connectedCallback() {
      var current = (this.getAttribute('data-current') || '').toLowerCase();
      this.innerHTML = render(current);
      this.setAttribute('role', 'banner');

      var self = this;
      var toggle = this.querySelector('.vz-nav-toggle');
      var links = this.querySelector('.vz-nav-links');
      var megaItems = [].slice.call(this.querySelectorAll('.vz-nav-item.vz-has-mega'));

      function isMobile() { return window.matchMedia('(max-width: 1180px)').matches; }

      function closeAll(except) {
        megaItems.forEach(function (it) {
          if (it === except) return;
          it.classList.remove('vz-open');
          var t = it.querySelector('.vz-nav-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
      }

      // ── Desktop: click a top-level trigger to toggle its full-width panel ──
      megaItems.forEach(function (item) {
        var trigger = item.querySelector('.vz-nav-trigger');
        if (!trigger) return;
        trigger.addEventListener('click', function (e) {
          if (isMobile()) {
            // mobile accordion handled below
            var open = item.classList.contains('vz-mobile-open');
            closeMobile(item);
            if (!open) item.classList.add('vz-mobile-open');
            return;
          }
          e.preventDefault();
          var open = item.classList.contains('vz-open');
          closeAll(item);
          if (!open) {
            var mega = item.querySelector('.vz-mega');
            if (mega) assignStagger(mega);
          }
          item.classList.toggle('vz-open', !open);
          trigger.setAttribute('aria-expanded', String(!open));
        });
      });

      function closeMobile(except) {
        megaItems.forEach(function (it) {
          if (it !== except) it.classList.remove('vz-mobile-open');
        });
      }

      // Close the open panel when navigating to a real destination link.
      this.addEventListener('click', function (e) {
        var a = e.target.closest('a[href]');
        if (a && a.getAttribute('href') !== '#') {
          closeAll();
          if (toggle) { toggle.setAttribute('aria-expanded', 'false'); links.classList.remove('vz-open'); }
        }
      });

      // Click outside closes any open desktop panel.
      document.addEventListener('click', function (e) {
        if (!self.contains(e.target)) closeAll();
      });

      // Esc closes everything and returns focus to the active trigger.
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          var openItem = self.querySelector('.vz-nav-item.vz-open');
          closeAll();
          if (openItem) {
            var t = openItem.querySelector('.vz-nav-trigger');
            if (t) t.focus();
          }
        }
      });

      // Re-close panels if we cross the desktop/mobile boundary.
      window.addEventListener('resize', function () { closeAll(); closeMobile(); });

      // ── Mobile hamburger ──
      if (toggle && links) {
        toggle.addEventListener('click', function () {
          var open = toggle.getAttribute('aria-expanded') === 'true';
          toggle.setAttribute('aria-expanded', String(!open));
          links.classList.toggle('vz-open', !open);
        });
      }
    }
  }

  customElements.define('vizit-nav', VizitNav);
})();

/* ════════════════════════════════════════════════════════════
   <vizit-footer>  — canonical Vizit global footer (v2)
   Renders the Company / Legal / Connect structure on every page.

   Optional attributes:
     data-cta="off"   — hide the "Get chosen" conversion band
                        (use on demo.html / pages that are the CTA)
   Styles live in vizit-theme.css.
   ════════════════════════════════════════════════════════════ */
(function () {
  if (customElements.get('vizit-footer')) return;

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

  // Footer link map — mirrors the global nav (vizit-nav.js) so the footer
  // is a faithful sitemap of the homepage navigation. Keep in sync with NAV.
  var COLUMNS = [
    {
      title: 'Platform',
      links: [
        { href: 'vizit-next-gen-platform.html', label: 'Vizit Next Gen Platform' },
        { href: 'vizit-api.html',               label: 'Vizit API' },
        { href: 'partner-ecosystem.html',       label: 'Partner Ecosystem' }
      ]
    },
    {
      title: 'Case Studies',
      links: [
        { href: 'case-studies.html',           label: 'All Case Studies' },
        { href: 'mars-petcare-case-study.html', label: 'Mars Petcare' },
        { href: 'purina-case-study.html',      label: 'Purina' },
        { href: 'beauty-case-study.html',      label: 'Beauty' },
        { href: 'ghirardelli-case-study.html', label: 'Ghirardelli' },
        { href: 'moen-case-study.html',        label: 'Moen' },
        { href: 'central-garden-case-study.html', label: 'Central Garden & Pet' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { href: 'blog.html',    label: 'Blog' }
      ]
    },
    {
      title: 'Get Started',
      links: [
        { href: 'score-your-content.html', label: 'Score Your Content' },
        { href: 'https://app.vizit.com/login', label: 'Sign In' }
      ]
    }
  ];

  // Legal links live on the base bar, not as a full column.
  var LEGAL = [
    { href: 'privacy-policy.html', label: 'Privacy Policy' },
    { href: 'terms-of-service.html', label: 'Terms of Service' }
  ];

  var ROOT_PREFIX = (function () {
    try {
      var scripts = document.getElementsByTagName('script');
      for (var i = 0; i < scripts.length; i++) {
        var src = scripts[i].getAttribute('src') || '';
        var m = src.match(/^(.*?)(?:js\/)?vizit-footer\.js(?:\?.*)?$/);
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

  function ctaHTML() {
    return '<div class="vz-foot-cta vz-foot-cta--band">' +
             '<a class="vz-foot-band" href="' + resolve('score-your-content.html') + '" aria-label="Don\u2019t get scrolled over. Get chosen. With Vizit. \u2014 Get your Vizit Score">' +
               '<span class="vz-foot-band-visual"><img src="' + ((window.__resources && window.__resources.ctaShelf) || resolve('assets/img/cta-shelf.png')) + '" onerror="this.onerror=null;this.src=\'/assets/img/cta-shelf.png\'" alt="" /></span>' +
               '<span class="vz-foot-band-copy">' +
                 '<span class="vz-foot-band-h">Don\u2019t get scrolled over.<br><span class="hl">Get chosen.</span> With Vizit.</span>' +
                 '<span class="vz-foot-btn">Score your content</span>' +
               '</span>' +
             '</a>' +
           '</div>';
  }

  function colsHTML() {
    return COLUMNS.map(function (c) {
      var links = c.links.map(function (l) {
        return '<li><a href="' + resolve(l.href) + '">' + esc(l.label) + '</a></li>';
      }).join('');
      return '<div class="vz-foot-col">' +
               '<div class="vz-foot-col-title">' + esc(c.title) + '</div>' +
               '<ul>' + links + '</ul>' +
             '</div>';
    }).join('');
  }

  function legalHTML() {
    return LEGAL.map(function (l) {
      return '<a href="' + resolve(l.href) + '">' + esc(l.label) + '</a>';
    }).join('');
  }

  function render(showCta) {
    var year = new Date().getFullYear();
    return (
      (showCta ? ctaHTML() : '') +
      '<div class="vz-foot-main">' +
        '<div class="vz-foot-brand">' +
          '<a href="' + resolve('index.html') + '" class="vz-foot-logo" aria-label="Vizit home">' + LOGO_SVG + '</a>' +
          '<p class="vz-foot-tagline">The Agentic Platform for Content Optimization.</p>' +
        '</div>' +
        '<div class="vz-foot-cols">' + colsHTML() + '</div>' +
      '</div>' +
      '<div class="vz-foot-base">' +
        '<span>© ' + year + ' Vizit, Inc. All rights reserved.</span>' +
        '<span class="vz-foot-base-tag">Don\u2019t get scrolled over.</span>' +
        '<nav class="vz-foot-legal" aria-label="Legal">' + legalHTML() + '</nav>' +
      '</div>'
    );
  }

  class VizitFooter extends HTMLElement {
    connectedCallback() {
      var showCta = (this.getAttribute('data-cta') || '').toLowerCase() !== 'off';
      this.innerHTML = render(showCta);
      this.setAttribute('role', 'contentinfo');
      var btn = this.querySelector('.vz-foot-btn');
      if (btn) {
        var band = this.querySelector('.vz-foot-band') || btn;
        band.addEventListener('pointermove', function (e) {
          var r = btn.getBoundingClientRect();
          btn.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
          btn.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
        });
        band.addEventListener('pointerleave', function () {
          btn.style.setProperty('--mx', '50%');
          btn.style.setProperty('--my', '50%');
        });
      }
    }
  }

  customElements.define('vizit-footer', VizitFooter);
})();

/* Global cursor-glow tracking for CTA buttons (matches home-page hover) */
document.addEventListener('pointermove', function (e) {
  var t = e.target;
  if (!t || !t.closest) return;
  var b = t.closest('.btn, .vz-nav-cta, .vz-foot-btn');
  if (!b) return;
  var r = b.getBoundingClientRect();
  b.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
  b.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
});

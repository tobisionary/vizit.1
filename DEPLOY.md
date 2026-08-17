# vizit.com — one-file site

`vizit-site.html` **is** the website: all 28 pages, every stylesheet, every script, and both logos are inside it. Pages render from an embedded payload and route on the URL hash.

## Publishing

Push the whole repo to GitHub and connect it to Vercel. Nothing else to do — `.vercelignore` keeps the editable sources out of the deployment, and `vercel.json` rewrites every URL to `vizit-site.html`.

Deployed files: `vizit-site.html`, `assets/`, `fonts/`, `llms.txt`.

## URLs

`vizit.com/#/vizit-api` · `vizit.com/#/solutions/hero-images` · `vizit.com/#/moen-case-study` · `vizit.com/#/blog-article?slug=…`

Old-style paths (`vizit.com/vizit-api`) still resolve: the rewrite serves the file and the router maps the path to the route.

## Updating

Edit the source page (`vizit-api.html`, `solutions/hero-images.html`, `js/blog-data.js`, …) and ask me to rebuild `vizit-site.html`. Hand-editing the bundle is possible but the page HTML lives inside a JSON payload, so it is not pleasant.

## Folder structure

| Path | Role |
|---|---|
| `vizit-site.html` | the deployed site (1.9 MB) |
| `assets/img/` | all page images (platform screenshots, logos, case-study shots) |
| `assets/awards/`, `assets/products/`, `assets/ebooks/` | award logos, product shots, gated PDFs |
| `fonts/` | Source Serif 4 |
| `*.html`, `solutions/`, `css/`, `js/` | editable sources, not deployed |
| `blog-cms.html` | internal post editor, not deployed |
| `tools/site-router.js`, `tools/build-single-file.js` | the router that ships inside the bundle, and the bundler |
| `_archive/` | superseded uploads and backups, kept for reference, not deployed |

## Routes

index · vizit-next-gen-platform · vizit-api · partner-ecosystem · case-studies · beauty / central-garden / ghirardelli / mars-petcare / moen / purina case studies · blog · blog-article · customer-support · score-your-content · privacy-policy · terms-of-service · 11 `solutions/*` pages (`content-quality-scorecarding` is an alias of `content-scorecarding`).

## One tradeoff

Pages render client-side, so search engines and LLM crawlers see the shell, not the page copy. Fine for staging or internal use; if organic search matters for vizit.com, publish the multi-file sources instead.

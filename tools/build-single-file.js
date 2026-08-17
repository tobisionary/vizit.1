/* Bundler for vizit-site.html — the whole site as one file.

   Not run by the browser. It is the reference implementation of the build:
   for each source page it swaps local <link rel=stylesheet> / <script src> tags for
   @@CSS:file@@ / @@JS:file@@ tokens (so each stylesheet and script is stored ONCE),
   inlines the two logo SVGs as data URIs, turns legacy redirect stubs into route
   aliases, and writes {home, routes, css, js} as a JSON payload into the shell
   alongside tools/site-router.js.

   Run it by pasting into the assistant's script runner (helpers: readFile, saveFile,
   ls, replaceText, log).                                                             */

const ROOT = ['index.html','vizit-next-gen-platform.html','vizit-api.html','partner-ecosystem.html','case-studies.html','beauty-case-study.html','central-garden-case-study.html','ghirardelli-case-study.html','mars-petcare-case-study.html','moen-case-study.html','purina-case-study.html','blog.html','blog-article.html','customer-support.html','score-your-content.html','privacy-policy.html','terms-of-service.html'];

const SOL = (await ls('solutions')).filter(f => f.endsWith('.html'));
const CSSF = {}, JSF = {}, routes = {}, notes = [];

const logoB = await readFile('assets/logo-black.svg'), logoW = await readFile('assets/logo-white.svg');
const dataURI = s => 'data:image/svg+xml,' + encodeURIComponent(s).replace(/'/g, '%27').replace(/"/g, '%22');
const inlineLogos = s => replaceText(replaceText(s, 'assets/logo-black.svg', dataURI(logoB)), 'assets/logo-white.svg', dataURI(logoW));
async function grab(map, name) { if (!map[name]) map[name] = inlineLogos(replaceText(await readFile(name), '../fonts/', 'fonts/')); } // inlined css/js serve from root

async function addPage(file, isSol) {
  let h = await readFile(file);
  if (isSol) h = replaceText(replaceText(h, '"../', '"'), "'../", "'"); // shell lives at root
  const path = (isSol ? 'solutions/' : '') + file.replace(/^solutions\//, '').replace(/\.html$/, '');
  const stub = h.match(/http-equiv=["']refresh["'][^>]*url=([^"';]+)/i) || h.match(/location\.replace\(['"]([^'"]+)['"]\)/);
  if (stub && h.length < 4000) {
    let t = stub[1].trim().replace(/^\.\//, '').replace(/\.html$/, '');
    if (isSol && t.indexOf('/') === -1) t = 'solutions/' + t;
    routes[path] = { alias: t.replace(/^\/+/, '') };
    notes.push(path + ' -> alias ' + routes[path].alias);
    return;
  }
  for (const m of h.matchAll(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/g)) {
    if (/^https?:/.test(m[1])) continue;
    await grab(CSSF, m[1]); h = replaceText(h, m[0], '@@CSS:' + m[1] + '@@');
  }
  for (const m of h.matchAll(/<script\b[^>]*src="([^"]+\.js)"[^>]*><\/script>/g)) {
    if (/^https?:/.test(m[1])) continue;
    await grab(JSF, m[1]); h = replaceText(h, m[0], '@@JS:' + m[1] + '@@');
  }
  h = inlineLogos(h);
  routes[path] = { title: ((h.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || 'Vizit').trim(), doc: h };
}

for (const f of ROOT) await addPage(f, false);
for (const f of SOL) await addPage('solutions/' + f, true);
for (const [k, r] of Object.entries(routes)) if (r.alias && !routes[r.alias]) notes.push('BROKEN ALIAS ' + k + ' -> ' + r.alias);

// The payload sits in a <script type="application/json"> block, so the HTML parser
// must not see </script or <!-- inside it.
let json = JSON.stringify({ home: 'index', routes, css: CSSF, js: JSF })
  .split('</script').join('<\\/script')
  .split('<!--').join('<\\u0021--');

const router = await readFile('tools/site-router.js');
const S = '<' + '/scr' + 'ipt>';
const html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Vizit | The Agentic Platform for Content Optimization</title>\n<meta name="description" content="Vizit is the agentic platform for content optimization — score, diagnose, and optimize every product image and PDP against the Content Conversion Standard.">\n<link rel="icon" href="assets/logo-black.svg">\n<style>html,body{margin:0;padding:0;height:100%;background:#fff;overflow:hidden}#view{position:fixed;inset:0;width:100%;height:100%;border:0;display:block}#splash{position:fixed;inset:0;display:grid;place-items:center;background:#fff;z-index:2;transition:opacity .25s ease}#splash.gone{opacity:0;pointer-events:none}#splash img{width:104px;height:auto;opacity:.9}</style>\n</head>\n<body>\n<div id="splash"><img src="assets/logo-black.svg" alt="Vizit"></div>\n<iframe id="view" title="Vizit" src="about:blank"></iframe>\n<script type="application/json" id="__site">' + json + S + '\n<script>\n' + router + S + '\n</body>\n</html>\n';

await saveFile('vizit-site.html', html);
log('routes ' + Object.keys(routes).length + ' | ' + Math.round(html.length / 1024) + 'kb\n' + notes.join('\n'));

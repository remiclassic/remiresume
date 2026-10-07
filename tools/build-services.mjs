// Ports the built Strategic Sloth services page into the resume repo as services.html.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const DIST = 'C:/Users/Remi Couture/Documents/strategic-game-ui-services/dist';
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..').split(path.sep).join('/');
const AD = 'services-assets';
const SLOTH = 'https://strategicsloth.com';
const ASSET_ROOTS = 'media|images|_assets|training|studio-images';

let html = fs.readFileSync(`${DIST}/services/index.html`, 'utf8');
let main = html.slice(html.indexOf('<main'), html.indexOf('</main>') + 7);
const cssFiles = [...html.matchAll(/<link rel="stylesheet" href="(\/_assets\/[^"]+)"/g)].map(m => m[1]);
const entry = html.match(/<script type="module" src="(\/_assets\/[^"]+)"/)[1];

const warn = [];
const rep = (from, to, all = false) => {
  if (!main.includes(from)) { warn.push('NOT FOUND: ' + from.slice(0, 90)); return; }
  main = all ? main.split(from).join(to) : main.replace(from, () => to);
};

// ---- structure -------------------------------------------------------------
const cut = (startMarker, endMarker) => {
  const a = main.indexOf(startMarker), b = main.indexOf(endMarker);
  if (a < 0 || b < 0 || b < a) { warn.push('CUT FAILED: ' + startMarker); return; }
  main = main.slice(0, a) + main.slice(b);
};
cut('<section class="section container" id="team">', '<section class="section container" id="services">');
main = main.replace(/<section class="section container sv-fit" id="fit">[\s\S]*?<\/section>/, () =>
  `<section class="section container sv-fit" id="fit"> <div class="sv-fit-copy sv-reveal"><p class="eyebrow">About me</p><h2>One senior designer.<br>Design through build.</h2> <p class="big">I own the interface from the first flow to the last widget: UX, UI art, motion and the implementation in engine or in code. Twenty years across PC, console, mobile, VR and the web, as an individual contributor, a lead and a director.</p> <ul><li><strong>UX and UI design</strong><span>flows, wireframes, visual systems and motion</span></li><li><strong>Technical UI</strong><span>Unreal, Unity, Godot, PlayCanvas and web, in the project’s own repository</span></li><li><strong>Leadership</strong><span>UX Director at AppLovin, art director at Sprung Studios, instructor at Vancouver Film School</span></li></ul> <p class="fine">Also the founder of Strategic Sloth LLC, where my own tools, plugins and game are made.</p></div> <figure class="sv-founder sv-reveal"><img src="/studio-images/remi-founder.png" alt="Guillaume “Remi” Couture in his studio" loading="lazy" width="1051" height="1497"><figcaption><strong>Guillaume “Remi” Couture</strong><span>UX/UI director · technical UI · founder, Strategic Sloth</span><span>Formerly UX Director at AppLovin, Art Director at Sprung Studios, UX/UI at Piranha Games, Phoenix Labs and Offworld</span><a href="https://www.linkedin.com/in/remicouture/" target="_blank" rel="noopener">LinkedIn ↗</a></figcaption></figure> </section>`);
// Promo video, placed before the About block.
{
  const at = main.indexOf('<section class="section container sv-fit" id="fit">');
  if (at < 0) warn.push('NO FIT SECTION FOR PROMO');
  else main = main.slice(0, at) + `<section class="section container" id="promo"><div class="section-heading"><div><p class="eyebrow">The short version · 50 seconds</p><h2>I design it.<br>Then I build it.</h2></div><p>Twenty years of game UI in under a minute: shipped studio work, my own game and tools, what I do, and what the people who managed the work say about it.</p></div><figure class="sv-promo sv-reveal"><video controls playsinline preload="none" poster="portfolio-media/promo/hire-promo-poster.jpg" aria-label="Remi Couture promo: twenty years of game UI in fifty seconds"><source src="portfolio-media/promo/hire-promo.mp4" type="video/mp4"><a href="portfolio-media/promo/hire-promo.mp4">Watch the promo</a></video><figcaption>50-second promo · Press play to load · Sound on</figcaption></figure></section> ` + main.slice(at);
}
main = main.replace(/<section class="sv-cta">[\s\S]*?<\/section>/, () =>
  `<section class="sv-cta" id="contact"><div class="container"><p class="eyebrow">Let’s build something good</p><h2>Show me the build.</h2><p>Send a screenshot, a recording or a build, with your engine or stack and your dates. You will get a straight answer on fit and scope.</p><div class="hero-actions"><button class="button" type="button" data-reveal-email aria-label="Reveal email address">Reveal email <span>↗</span></button><a class="button ghost" href="https://www.linkedin.com/in/remicouture/" target="_blank" rel="noopener">LinkedIn <span>↗</span></a><a class="button ghost" href="portfolio.html">The portfolio <span>→</span></a></div></div></section>`);
main = main.replace(/<script>\s*if \(location\.pathname === '\/'\)[\s\S]*?<\/script>/, '');

// ---- copy: studio voice to first person -------------------------------------
rep('A design and development partner from the first wireframe to the code in your repository.', 'I design interfaces and build them, from the first wireframe to the code in the repository.');
rep('>Start a project <span>↗</span>', '>Get in touch <span>↗</span>');
rep('real footage from our games, tools and motion work', 'real footage from my games, tools and motion work');
rep('<p class="eyebrow">What we build</p>', '<p class="eyebrow">What I build</p>');
rep('Games are where the craft was learned. The same team designs and builds apps, sites and courses.', 'Games are where I learned the craft. I design and build apps, sites and courses the same way.');
rep('Our games →', 'My games →');
rep('>This site →<', '>Strategic Sloth →<');
rep('This site is one of them.', 'This page is one of them.');
rep('of our own: two live, one on the way', 'of my own: two live, one on the way');
rep('<b>Studios</b> Remi has worked inside, and <b>the names</b> his work has shipped for', '<b>Studios</b> I have worked inside, and <b>the names</b> my work has shipped for');
rep('Career credits of Guillaume “Remi” Couture from studio roles and agency client work, as listed on his', 'My career credits from studio roles and agency client work, as listed on my');
rep('01 / What we do', '01 / What I do');
rep('One accountable studio.', 'One accountable designer.');
rep('How we work in ', 'How I work in ', true);
rep('Structured so a team can extend it without us.', 'Structured so a team can extend it without me.');
rep('our own game, in development', 'my own game, in development', true);
rep('running in a browser-based engine we wrote. World, rendering and interface are built in-house.', 'running in a browser-based engine I wrote. World, rendering and interface are my own work.');
rep('Our controller-navigation plugin for UMG.', 'My controller-navigation plugin for UMG.');
rep('Our own tool for turning a reference', 'My own tool for turning a reference');
rep('These are our own games, apps, tools and plugins, and training simulations we designed and built.', 'These are my own games, apps, tools and plugins, and training simulations I designed and built.');
rep('with the test plan we would run before implementation', 'with the test plan I would run before implementation');
rep('This is not a studio that started last year. The record below', 'This did not start last year. The record below');
rep('Key art and UI from titles Remi worked on', 'Key art and UI from titles I worked on');
rep('SliceForge React UI, our own library', 'SliceForge React UI, my own library');
rep('All art assets made by Remi.', 'All art assets made by me.', true);
rep('Straight from Remi’s Figma drafts', 'Straight from my Figma drafts');
rep('SliceForge, our own game UI editor', 'SliceForge, my own game UI editor');
rep('Our own editor for building game screens', 'My own editor for building game screens', true);
rep('Concept studies from our UI collections', 'Concept studies from my UI collections');
rep('Screens from our UI concept collections', 'Screens from my UI concept collections');
rep('We use the build, read the docs and map where people hesitate.', 'I use the build, read the docs and map where people hesitate.');
rep('Remi’s review of Clash Royale’s interface', 'my review of Clash Royale’s interface');
rep('The line Remi’s UX talk is built around. He has taught game interface design at Vancouver Film School and written this talk for the studios he has worked with.', 'The line my UX talk is built around. I have taught game interface design at Vancouver Film School and written this talk for the studios I have worked with.');
rep('Eleven of the recommendations on Remi’s LinkedIn', 'Eleven of the recommendations on my LinkedIn');
rep('and the same team designs and builds web and desktop apps, websites and training products.', 'and I design and build web and desktop apps, websites and training products the same way.');
rep('We can also take either half:', 'I can also take either half:');
rep('Guillaume “Remi” Couture, the studio’s founder, leads every project and does the UI work directly. Everyone calls him Remi. Larger scopes add engineers, artists and production under his lead.', 'I do: Guillaume “Remi” Couture. Everyone calls me Remi. I lead the project and do the UI work directly.');
rep('They are Remi’s own credits from two decades of studio roles and agency work, shown with the studio and role for each. Strategic Sloth is the studio he founded to offer that experience directly.', 'They are my own credits from two decades of studio roles and agency work, shown with the studio and role for each. Strategic Sloth is the company I founded for my own tools, plugins and game.');

// Selected work cards: link each project to its UX walkthrough in the guided showcase.
const walkthroughs = {
  'MechWarrior 5: Mercenaries': [['mechwarrior/flow', 'Read the UX walkthrough']],
  'SQUAD customisation concepts': [['squad/flow', 'Read the UX walkthrough']],
  'Fantasy card systems': [['cards/flow', 'Read the UX walkthrough']],
  'FACE/OFF &amp; TOUCHLINE': [['hockey/flow', 'Hockey walkthrough'], ['soccer/flow', 'Soccer walkthrough']],
  'Current &amp; Signal': [['fintech/flow', 'Fintech walkthrough'], ['cyber/flow', 'Cybersecurity walkthrough']],
  'Valorant front-end exploration': [['multiplayer/flow', 'Read the UX walkthrough']],
  'Mobile, AR &amp; VR': [['mobile/flow', 'Read the UX walkthrough']],
  'Stardust Canvas': [['stardust/flow', 'Read the UX walkthrough']],
};
for (const [title, links] of Object.entries(walkthroughs)) {
  const at = main.indexOf('<h3>' + title + '</h3>');
  const end = at < 0 ? -1 : main.indexOf('</div> </article>', at);
  if (end < 0) { warn.push('NO CARD: ' + title); continue; }
  const html = '<p class="pf-walk">' + links.map(([hash, label]) => '<a class="pf-link pf-case-link" href="portfolio-showcase.html#' + hash + '">' + label + ' →</a>').join('') + '</p>';
  main = main.slice(0, end) + html + main.slice(end);
}

// ---- links -----------------------------------------------------------------
main = main.replace(/(<a class="sv-card[^"]*" href=")\/training\/("[\s\S]*?<h3>)([^<]+)/g, (m, a, b, title) =>
  a + (title === 'Mission Control' ? 'cyber-games.html#mission-control' : title === 'Network Defense' ? 'cyber-games.html#my-network-defense' : 'cyber-games.html#my-games') + b + title);
const linkMap = {
  '/training/': 'cyber-games.html',
  '/services/case/vanguard/': 'portfolio-showcase.html#vanguard/flow',
};
main = main.replace(/<a\b([^>]*?)href="(\/[^"]*)"([^>]*)>/g, (m, pre, href, post) => {
  if (new RegExp(`^/(${ASSET_ROOTS})/.+\\.[a-z0-9]{2,5}$`).test(href)) return m;
  if (href.startsWith('/contact/')) return `<a${pre}href="#contact"${post}>`;
  if (linkMap[href]) return `<a${pre}href="${linkMap[href]}"${post}>`;
  const ext = /target=/.test(pre + post) ? '' : ' target="_blank" rel="noopener"';
  return `<a${pre}href="${SLOTH}${href}"${post}${ext}>`;
});
main = main.replace(/href="https:\/\/remiclassic\.github\.io\/remiresume\/portfolio\.html"( target="_blank")?( rel="noopener")?/g, 'href="portfolio.html"');
main = main.replace(/href="https:\/\/remiclassic\.github\.io\/remiresume\/"( target="_blank")?( rel="noopener")?/g, 'href="index.html"');
main = main.replace(/ data-track(-location)?="[^"]*"/g, '');

// ---- assets ----------------------------------------------------------------
const existing = new Map(); // size -> [repo paths]
for (const f of execSync('git ls-files -z', { cwd: OUT, maxBuffer: 1 << 26 }).toString().split('\0')) {
  if (!f || f.startsWith(AD + '/') || f.startsWith('training-demos/')) continue;
  try { const s = fs.statSync(`${OUT}/${f}`).size; (existing.get(s) || existing.set(s, []).get(s)).push(f); } catch {}
}
const sha = p => crypto.createHash('sha1').update(fs.readFileSync(p)).digest('hex');
const mapped = new Map(); const missing = new Set(); let copied = 0, bytes = 0, deduped = 0;
const mapAsset = url => {
  const clean = decodeURI(url.split(/[?#]/)[0]);
  if (mapped.has(clean)) return mapped.get(clean);
  const src = DIST + clean;
  if (!fs.existsSync(src) || !fs.statSync(src).isFile()) { missing.add(clean); mapped.set(clean, null); return null; }
  const size = fs.statSync(src).size;
  let target = null;
  if (!clean.startsWith('/_assets/')) {
    const cands = existing.get(size) || [];
    if (cands.length) { const h = sha(src); target = cands.find(c => sha(`${OUT}/${c}`) === h) || null; if (target) deduped++; }
  }
  if (!target) {
    target = AD + clean;
    fs.mkdirSync(path.dirname(`${OUT}/${target}`), { recursive: true });
    fs.copyFileSync(src, `${OUT}/${target}`);
    copied++; bytes += size;
  }
  mapped.set(clean, target);
  return target;
};
const assetRe = new RegExp(`(["'(=])(/(?:${ASSET_ROOTS})/[^"'()\\s<>]+?\\.[A-Za-z0-9]{2,5})(?=["')\\s?#])`, 'g');
const rewrite = (text, prefix = '') => text.replace(assetRe, (m, q, url) => { const t = mapAsset(url); return t ? q + prefix + encodeURI(t) : m; });

try { fs.rmSync(`${OUT}/${AD}`, { recursive: true, force: true }); } catch { /* folder held open by a local server: overwrite in place */ }
main = rewrite(main);
main = main.replace(/((?:component|renderer)-url=")(services-assets\/)/g, '$1./$2');

// JS module graph
const seen = new Set();
const walk = rel => {
  if (seen.has(rel)) return; seen.add(rel);
  const src = `${DIST}/_assets/${rel}`;
  if (!fs.existsSync(src)) { missing.add('/_assets/' + rel); return; }
  let code = fs.readFileSync(src, 'utf8');
  if (/strategicSlothUtm/.test(code)) code = '// Site analytics from the source build are not used on this page.\nexport {};\n';
  code = code.replace('return"/"+c', `return"./${AD}/"+c`);
  code = rewrite(code);
  for (const m of code.matchAll(/(?:from|import)\s*\(?\s*"\.\/([^"]+\.js)"/g)) walk(m[1]);
  for (const m of code.matchAll(/"_assets\/([^"]+\.(?:js|css))"/g)) m[1].endsWith('.js') ? walk(m[1]) : mapAsset('/_assets/' + m[1]);
  fs.mkdirSync(`${OUT}/${AD}/_assets`, { recursive: true });
  fs.writeFileSync(`${OUT}/${AD}/_assets/${rel}`, code);
};
walk(path.basename(entry));
for (const m of main.matchAll(/services-assets\/_assets\/([^"]+\.js)/g)) walk(m[1]);
for (const c of cssFiles) {
  const css = fs.readFileSync(DIST + c, 'utf8').replace(assetRe, (m, q, url) => { const t = mapAsset(url); return t ? `${q}../../${encodeURI(t)}` : m; });
  fs.mkdirSync(`${OUT}/${AD}/_assets`, { recursive: true });
  fs.writeFileSync(`${OUT}/${AD}/_assets/${path.basename(c)}`, css);
}

// ---- page ------------------------------------------------------------------
const title = 'Work &amp; services — Remi Couture';
const desc = 'UI/UX design, motion and implementation for games, apps, websites and training products, in Unreal Engine, Unity, Godot, PlayCanvas and on the web. Twenty years of shipped credits, live components, case studies and working files from Guillaume “Remi” Couture.';
const page = `<!DOCTYPE html>
<html lang="en">
<head>
<link rel="icon" href="favicon.ico?v=sloth1" sizes="any">
<link rel="icon" type="image/svg+xml" href="favicon.svg?v=sloth1">
<link rel="apple-touch-icon" href="apple-touch-icon.png?v=sloth1">
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="https://remiclassic.github.io/remiresume/services.html">
<meta name="theme-color" content="#f7f6f0">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="https://remiclassic.github.io/remiresume/services.html">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
${cssFiles.map(c => `<link rel="stylesheet" href="${AD}/_assets/${path.basename(c)}">`).join('\n')}
<link rel="stylesheet" href="services-light.css?v=2">
<link rel="stylesheet" href="contact-reveal.css?v=1">
<script type="module" src="${AD}/_assets/${path.basename(entry)}"></script>
<script src="contact-reveal.js?v=1" defer></script>
<script src="analytics.js?v=20261006-services" defer></script>
</head>
<body class="services-site">
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header"><div class="container nav-wrap"><a class="brand" href="index.html" aria-label="Remi Couture résumé"><span>remi couture<span class="brand-dot" aria-hidden="true">✳</span></span></a><button class="nav-toggle" aria-expanded="false" aria-controls="primary-nav" type="button">Menu <span aria-hidden="true">＋</span></button><nav id="primary-nav" aria-label="Primary"><a href="index.html">Résumé</a><a href="portfolio.html">Portfolio</a><a href="services.html" aria-current="page">Work &amp; services</a><a href="#credits">Credits</a><a class="nav-contact" href="#contact">Let’s talk <span aria-hidden="true">↗</span></a></nav></div></header>
${main}
<footer class="site-footer"><div class="container"><div class="footer-top"><div><a class="brand" href="index.html">remi couture<span class="brand-dot" aria-hidden="true">✳</span></a><p>Guillaume (Rémi) Couture<br>Product designer &amp; tool builder.</p></div><nav aria-label="This site"><span>This site</span><a href="index.html">Résumé</a><a href="portfolio.html">Portfolio</a><a href="training.html">Training interface design</a><a href="cyber-games.html">Cyber training games</a></nav><nav aria-label="Elsewhere"><span>Elsewhere</span><a href="https://www.linkedin.com/in/remicouture/" target="_blank" rel="noopener">LinkedIn ↗</a><a href="https://www.artstation.com/remicouture" target="_blank" rel="noopener">ArtStation ↗</a><a href="https://www.strategicsloth.com/" target="_blank" rel="noopener">Strategic Sloth ↗</a><a href="https://www.sliceforge.io/" target="_blank" rel="noopener">SliceForge ↗</a></nav></div><div class="footer-bottom"><p>© 2026 Guillaume (Rémi) Couture. Game titles and marks belong to their owners.</p></div></div></footer>
<script>
(() => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#primary-nav');
  const close = () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); };
  toggle.addEventListener('click', () => toggle.setAttribute('aria-expanded', String(nav.classList.toggle('open'))));
  nav.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('open')) { close(); toggle.focus(); } });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) close(); });
})();
</script>
</body>
</html>
`;
fs.writeFileSync(`${OUT}/services.html`, page);

// ---- report ----------------------------------------------------------------
const left = [...page.matchAll(/(?:src|href|poster|data-src|component-url|renderer-url)="(\/[^"]*)"/g)].map(m => m[1]);
console.log(JSON.stringify({ copied, mb: +(bytes / 1048576).toFixed(1), deduped, js: seen.size, pageKb: Math.round(page.length / 1024), leftoverRootRefs: [...new Set(left)], missing: [...missing], warn }, null, 1));
const voice = new Set();
for (const m of main.replace(/<script[\s\S]*?<\/script>/g, s => s.includes('cr-data') ? s : '').replace(/<pre[\s\S]*?<\/pre>/g, '').matchAll(/[>"]([^<>"]*\b(?:we|We|our|Our|us|Remi’s|his|him|he|He)\b[^<>"]*)[<"]/g)) voice.add(m[1].trim().slice(0, 160));
console.log([...voice].join('\n'));

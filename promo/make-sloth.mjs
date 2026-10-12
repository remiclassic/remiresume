// Generates sloth-promo.html: the Strategic Sloth LLC cut of promo.html (studio voice, logo, site address).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
let s = fs.readFileSync(path.join(here, 'promo.html'), 'utf8');
const rep = (a, b) => { if (!s.includes(a)) throw new Error('not found: ' + a.slice(0, 70)); s = s.split(a).join(b); };

rep('<title>Remi Couture — hire promo (frame-accurate timeline)</title>', '<title>Strategic Sloth — services promo (frame-accurate timeline)</title>');

// brand styles
rep('#wipe { position:absolute;', `.logo { display:inline-block; background:#f6f5ef; border-radius:22%; object-fit:contain; vertical-align:middle; }
#mark { margin:-190px 0 0 -190px !important; font-size:0 !important; }
#mark .logo { width:380px; height:380px; box-shadow:0 0 120px rgba(198,242,122,.35); }
#brand { position:absolute; left:140px; top:70px; z-index:30; display:flex; align-items:center; gap:18px; font-size:34px; font-weight:700; letter-spacing:-.04em; }
#brand .logo { width:58px; height:58px; }
#brand span { color:var(--lime); }
#s8 .name { display:flex; align-items:center; gap:24px; }
#s8 .name .logo { width:96px; height:96px; }
#s8 .ways { margin-top:16px; display:flex; gap:14px; }
#s8 .ways b { font-family:var(--mono); font-size:22px; font-weight:500; letter-spacing:.1em; text-transform:uppercase; padding:12px 20px; border:2px solid #56634f; border-radius:99px; background:#0b0f0ccc; }
.vert #brand { left:70px !important; right:auto !important; top:220px !important; }
.vert #s8 .ways { flex-wrap:wrap; }
.vert #s8 .big { font-size:186px !important; right:60px !important; }
.vert #s2 .eyebrow, .vert #s3 .eyebrow, .vert .proj .n { top:350px; }
#wipe { position:absolute;`);

// 1 hook
rep('<div id="mark" data-in="0" data-out="1.2" data-fx="spin" data-d="0.9">✳</div>', '<div id="mark" data-in="0" data-out="1.2" data-fx="pop" data-d="0.7"><img class="logo" src="sloth-logo.png" alt=""></div>');

// 2 numbers
rep('Guillaume “Remi” Couture · by the numbers', 'Strategic Sloth · by the numbers');
rep('<span>years in game UI, UX and product design</span><small>SINCE CLUB PENGUIN, 2006</small>', '<span>years of game UI, led by founder Remi Couture</span><small>SINCE CLUB PENGUIN, 2006</small>');
rep('<div data-in="1.4" data-fx="up"><strong><b data-count="12">0</b></strong><span>studios worked inside</span><small>FROM INDIE TO CO-DEV</small></div>', '<div data-in="1.4" data-fx="up"><strong><b data-count="5">0</b></strong><span>runtimes, design to code</span><small>UNREAL · UNITY · GODOT · PLAYCANVAS · WEB</small></div>');
rep('<div data-in="2.0" data-fx="up"><strong><b data-count="5">0</b></strong><span>runtimes, design to code</span><small>UNREAL · UNITY · GODOT · PLAYCANVAS · WEB</small></div>', '<div data-in="2.0" data-fx="up"><strong><b data-count="3">0</b></strong><span>products of our own</span><small>SLICEFORGE · FOCUSRAIL · STOREFRONT BUILDER</small></div>');
rep('UX Director. Art director. <span class="lime">Hands on the build.</span>', 'A senior lead. <span class="lime">A team when you need one.</span>');

// 3 studios
rep('Studios I’ve worked inside · names my work shipped for', 'Studios our founder has worked inside · names his work shipped for');
rep('Career credits from studio roles and agency client work. Names and artwork belong to their owners.', 'Career credits of founder Guillaume “Remi” Couture from studio roles and agency client work. Names and artwork belong to their owners and do not imply endorsement.');

// 4 projects
rep('SHIPPED WORK · 0${i + 1} / 04', 'FOUNDER CREDITS · 0${i + 1} / 04');
rep("'Senior UX designer for three years, from player flows to Unreal implementation.'", "'Three years as senior UX designer, from player flows to Unreal implementation.'");

// 5 builds
rep('I design it. <span class="lime">Then I build it.</span>', 'We design it. <span class="lime">Then we build it.</span>');
rep('In-engine footage · my own game', 'In-engine footage · our own game');
rep('Online medieval dynasty RPG, in a WebGL engine I wrote.', 'Online medieval dynasty RPG, in a WebGL engine we wrote.');
rep('My game UI production tool. Plus Focusrail, my Unreal Engine plugin on Fab.', 'Our game UI production tool. Plus Focusrail, our Unreal Engine plugin on Fab.');

// 7 quotes
rep('Two of eleven recommendations on LinkedIn', 'Recommendations for our founder, Remi Couture, on LinkedIn');

// 8 call to action
rep('Got a project, a gig or a role?', 'Got a game, an app or a course to ship?');
rep('Let’s build it.</div>', 'Show us the build.</div>');
rep("#s8 .big { position:absolute; left:132px; top:310px; font-size:290px;", "#s8 .big { position:absolute; left:132px; top:330px; font-size:218px;");
rep('<div><div class="name">Remi Couture <span>✳</span></div><div class="role">UX/UI Director · Technical UI · 20 years shipped</div></div>', '<div><div class="name"><img class="logo" src="sloth-logo.png" alt="">strategic sloth <span>✳</span></div><div class="ways"><b>UI &amp; UX audit</b><b>Vertical slice</b><b>Embedded UI partner</b></div></div>');
rep('<div class="links"><b>remiclassic.github.io/remiresume</b><br>linkedin.com/in/remicouture</div>', '<div class="links"><b>strategicsloth.com/services</b><br>UI/UX design &amp; development</div>');

// persistent wordmark from the first cut onward (hidden on the cream quote scene, where it is restyled dark)
rep('<div id="vig"></div>', '<div id="brand"><img class="logo" src="sloth-logo.png" alt="">strategic sloth <span>✳</span></div>\n<div id="vig"></div>');
rep("vig.style.opacity = t >= 38.4 && t < 43.2 ? 0 : 1;", "vig.style.opacity = t >= 38.4 && t < 43.2 ? 0 : 1;\n  const brand = document.getElementById('brand'); brand.style.opacity = t < 7.2 || t >= 43.2 ? 0 : 1; brand.style.color = t >= 38.4 && t < 43.2 ? '#252b23' : ''; brand.querySelector('span').style.color = t >= 38.4 && t < 43.2 ? '#45633e' : ''; brand.style.left = t >= 16.8 && t < 26.4 ? 'auto' : ''; brand.style.right = t >= 16.8 && t < 26.4 ? '140px' : ''; brand.style.top = t >= 12 && t < 16.8 ? '26px' : '';");

fs.writeFileSync(path.join(here, 'sloth-promo.html'), s);
console.log('wrote sloth-promo.html');

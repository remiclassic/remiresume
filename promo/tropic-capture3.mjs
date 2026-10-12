// Captures Tropic Tumble footage for the second store trailer (merging, sticker scenes, chests, Home, the pass), deterministically:
// the page runs on a fake clock that is stepped one video frame at a time, so every run gives the same frames.
// Usage: node tropic-capture3.mjs [clipId ...]      (frames go to .work/tt3/<clip>/0001.jpg, sound cues to .work/tt3/<clip>.json)
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const work = path.join(here, '.work');
const { chromium } = createRequire(path.join(work, 'x.js'))('playwright-core');
const GAME = pathToFileURL(path.resolve(here, '../../Merge Games/index.html')).href;
const FPS = 30, W = 393, H = 798;

const CLIPS = [
  { id: 'merge', dur: 9.0, level: 7 },
  { id: 'scene', dur: 9.4, level: 7 },
  { id: 'chest', dur: 6.0, level: 7 },
  { id: 'home',  dur: 4.6, level: 7 },
  { id: 'pass',  dur: 4.6, level: 7 },
  { id: 'win',   dur: 4.4, level: 5 },
];

// Runs once the game has loaded: puts the game into the state the clip starts from. Returns nothing.
const SETUP = {
  merge: `closeColl(); TIDE_S = 0; GOAL_N = 1e9; clearBodies();
    const picks = levelPacks().flatMap((c) => [[c, 0], [c, 1]]).slice(0, 5);
    picks.forEach(([c, k], n) => { const x = () => R + Math.random() * (W - 2 * R), y = () => -R - Math.random() * 500;
      addBody(c, k, 2, x(), y()); addBody(c, k, 2, x(), y()); addBody(c, k, 1, x(), y()); addBody(c, k, 1, x(), y()); for (let i = 0; i < 4; i++) addBody(c, k, 0, x(), y()); });
    renderHud();`,
  scene: `state.sceneIdx = 1; state.got = {}; state.placed = {}; sceneSlots(1).forEach(([n]) => { state.got[n] = 1; state.placed[n] = 1; });
    ['pineapple', 'mango', 'cherries'].forEach((n) => { state.placed[n] = 0; }); sceneView = null; openScene();`,
  chest: `state.sceneIdx = 1; state.got = {}; state.placed = {}; sceneSlots(1).forEach(([n]) => { state.got[n] = 1; state.placed[n] = 1; }); state.sceneDone = true; state.party = 2; sceneView = null; openScene();
    if (!$('party').classList.contains('open') && !$('sceneStage').classList.contains('reveal')) sceneParty();`,
  home: `state.sceneIdx = 2; ['flamingo', 'duck', 'icecream', 'fox', 'bee'].forEach((n) => { state.got[n] = 1; state.placed[n] = 1; }); state.got.beachball = 1; openColl();`,
  pass: `const p = passNow(); p.pts = 250; p.premium = true; p.free[0] = 1; p.paid[0] = 1; p.free[1] = 1; openColl('pass');`,
  win: `closeColl();`,
};

const HELPERS = `
  window.__vt = 0; window.__T = 0; window.__log = [];
  const __seen = new Map();
  window.__stepAnims = () => {
    __vt += 1000 / ${FPS};
    for (const a of document.getAnimations()) {
      let s = __seen.get(a);
      if (s === undefined) { s = __vt - 1000 / ${FPS}; __seen.set(a, s); }
      try { a.pause(); a.currentTime = __vt - s; } catch {}
    }
  };
  for (const k of Object.keys(SND)) SND[k] = (...a) => { __log.push({ t: +__T.toFixed(3), k, a }); };
  document.getElementById('tip').classList.remove('on'); tipQueue.length = 0; closeModal(); guideEnd();
  timed = 9999; document.documentElement.classList.remove('lite');           // the stepped clock must not be mistaken for a slow phone
  const cur = document.createElement('div');
  cur.style.cssText = 'position:fixed;z-index:999;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:#ffffff70;border:3px solid #fff;box-shadow:0 2px 8px #0006;pointer-events:none;opacity:0;transition:transform .08s';
  document.body.appendChild(cur);
  const setCur = (x, y, down) => { cur.style.left = x + 'px'; cur.style.top = y + 'px'; cur.style.opacity = 1; cur.style.transform = 'scale(' + (down ? 0.78 : 1) + ')'; };
  const tap = (el, t) => { if (!el) return; const q = el.getBoundingClientRect(); setCur(q.left + q.width / 2, q.top + q.height / 2, true); el.click(); __B.hideAt = t + 0.4; };
  const smooth = (t, a, b) => { const u = Math.min(1, Math.max(0, (t - a) / (b - a))); return u * u * (3 - 2 * u); };
  window.__B = { next: 0.5, gap: 0.22, drag: null, hideAt: 0, mode: '', done: {} };
  const once = (key, t, at, fn) => { if (t >= at && !__B.done[key]) { __B.done[key] = 1; fn(); } };
  window.__tick = (t) => {
    window.__T = t;
    const B = __B, r = pile.getBoundingClientRect();
    if (B.hideAt && t >= B.hideAt) { cur.style.opacity = 0; B.hideAt = 0; }
    if (B.mode === 'win') { once('win', t, 0.4, () => { state.score = 12800; state.matches = 24; ending = true; clearBodies(); win(); }); return; }
    if (B.mode === 'scene') { [0.9, 2.5, 4.1].forEach((at, i) => once('p' + i, t, at, () => tap(document.querySelector('#sceneRow [data-tray]'), t))); return; }
    if (B.mode === 'chest') { once('open', t, 1.5, () => tap(document.querySelector('.pchest'), t)); return; }
    if (B.mode === 'home') { $('hubBody').scrollTop = 250 * smooth(t, 1.3, 3.6); return; }
    if (B.mode === 'pass') { $('hubBody').scrollTop = 430 * smooth(t, 1.2, 3.8); return; }
    // merge: drag one sticker onto its twin, again and again, favouring the furthest-along stage so stickers get collected on camera
    const ev = (type, x, y) => pile.dispatchEvent(new PointerEvent(type, { pointerId: 9, clientX: r.left + x, clientY: r.top + y, bubbles: true, cancelable: true }));
    if (B.drag) {
      const d = B.drag, u = Math.min(1, (t - d.t0) / d.dur), e = u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u);
      const x = d.ax + (d.b.x + 2 - d.ax) * e, y = d.ay + (d.b.y - d.ay) * e;
      ev('pointermove', x, y); setCur(r.left + x, r.top + y, true);
      if (u >= 1) { ev('pointerup', x, y); B.drag = null; B.next = t + B.gap; setCur(r.left + x, r.top + y, false); B.hideAt = t + 0.2; }
      return;
    }
    if (t < B.next || $('modal').classList.contains('open') || $('win').classList.contains('open')) return;
    const ok = (b) => !b.ice && b.y > R && Math.hypot(b.x - b.px, b.y - b.py) < 1.5;
    const pairs = [];
    for (const a of bodies) if (ok(a)) for (const b of bodies) if (b !== a && ok(b) && sameKind(a, b)) pairs.push([a, b]);
    if (!pairs.length) return;
    const want = [0, 1, 2, 1, 2, 0, 2, 1, 0, 1, 2][(B.n = (B.n || 0) + 1) % 11];       // a mix of all three stages
    const [a, b] = pairs.find(([p]) => p.t === want) || pairs[Math.floor(Math.random() * pairs.length)];
    ev('pointerdown', a.x, a.y);
    if (!drag) return;
    B.drag = { b, ax: a.x, ay: a.y, t0: t, dur: 0.24 + Math.min(0.28, Math.hypot(a.x - b.x, a.y - b.y) / 900) };
    setCur(r.left + a.x, r.top + a.y, true);
  };
`;

const stars = {}; for (let n = 1; n <= 12; n++) stars[n] = [3, 2, 3, 3, 1, 3, 2, 3][n % 8];
const tips = {}; for (const k of ['ice', 'thick', 'sign', 'boost', 'album', 'scene', 'evgot', 'tier1', 'tier2', 'rate', 'guide-home', 'guide-scene', 'guide-events', 'guide-pass', ...Array.from({ length: 14 }, (_, i) => 'set' + i), ...Array.from({ length: 9 }, (_, i) => 'world' + i)]) tips[k] = 1;
const only = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--allow-file-access-from-files', '--force-color-profile=srgb'] });
for (const clip of CLIPS.filter((c) => !only.length || only.includes(c.id))) {
  const context = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
  await page.clock.install({ time: new Date('2026-10-09T12:00:00') });
  await page.addInitScript(({ level, stars, tips, first }) => {
    const s = { ...stars }; if (first) delete s[level];
    localStorage.setItem('stickermerge.v3', JSON.stringify({
      page: level, maxPage: Math.max(level, 13), gems: 480, energy: 100, energyTs: Date.now(), counts: [0, 0, 0, 0], bodies: null, tut: 3, starterShown: true, plv: 3, name: 'Remi', notes: 0,
      stars: s, chests: 3, boosters: { hint: 3, shuffle: 3, magnet: 3 }, sfxVol: 1, musVol: 0, tips, album: [[14, 10, 31, 10, 6], [10, 22, 3, 8, 2], [10, 4, 12, 0, 1], [33, 10, 10, 7, 4]],
      daily: { last: new Date().toLocaleDateString('en-CA'), streak: 1 },
    }));
  }, { level: clip.level, stars, tips, first: clip.id === 'win' });
  await page.goto(GAME);
  await page.clock.pauseAt(new Date('2026-10-09T12:00:02'));     // from here time only moves when the script steps it; otherwise it also runs on by itself while each frame is being saved
  const run = async (n, step = 100) => { for (let i = 0; i < n; i++) { await page.clock.runFor(step); await new Promise((r) => setTimeout(r, 12)); } };
  for (let i = 0; i < 200 && await page.evaluate(() => !!document.getElementById('loading')); i++) await run(1);
  await run(30);
  await page.evaluate(HELPERS);
  await page.evaluate(SETUP[clip.id]);
  await page.evaluate((mode) => { __B.mode = mode; }, clip.id);
  await run(clip.id === 'merge' ? 45 : 22);          // let the pile fall and settle, pictures load and any opening animation finish, off camera
  await page.evaluate(() => { closeModal(); guideEnd(); tipQueue.length = 0; document.getElementById('tip').classList.remove('on'); document.getElementById('toast').classList.remove('show'); });
  // every picture the page is using must be decoded before the first frame is taken
  await page.evaluate(async () => { await Promise.all([...document.images].map((i) => i.decode().catch(() => {}))); });
  await new Promise((r) => setTimeout(r, 800));

  const dir = path.join(work, 'tt3', clip.id);
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const total = Math.round(clip.dur * FPS);
  for (let f = 0; f < total; f++) {
    await page.evaluate((t) => window.__tick(t), f / FPS);
    await page.clock.runFor(1000 / FPS);
    await page.evaluate(() => window.__stepAnims());
    fs.writeFileSync(path.join(dir, String(f + 1).padStart(4, '0') + '.jpg'), await page.screenshot({ type: 'jpeg', quality: 92 }));
  }
  const log = await page.evaluate(() => ({ cues: window.__log, score: state.score }));
  fs.writeFileSync(path.join(work, 'tt3', clip.id + '.json'), JSON.stringify({ ...log, frames: total }));
  console.log(`${clip.id}: ${total} frames, ${log.cues.length} sound cues`);
  await context.close();
}
await browser.close();

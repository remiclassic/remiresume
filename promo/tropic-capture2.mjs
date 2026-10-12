// Captures Tropic Tumble footage for the store trailer, deterministically (see tropic-capture.mjs for how the fake clock works).
// Usage: node tropic-capture2.mjs [clipId ...]      (frames go to .work/tt2/<clip>/0001.jpg, sound cues to .work/tt2/<clip>.json)
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
  { id: 'play',  dur: 9.4, level: 4,  script: [{ t: 5.4, do: 'magnet' }, { t: 7.4, do: 'fox' }] },
  { id: 'map',   dur: 5.0, level: 13, mode: 'map' },
  { id: 'night', dur: 6.0, level: 33, script: [{ t: 3.4, do: 'hint' }] },
  { id: 'lava',  dur: 5.0, level: 18, script: [] },
  { id: 'win',   dur: 4.2, level: 9,  mode: 'win' },
];

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
  document.getElementById('tip').classList.remove('on'); tipQueue.length = 0;
  const cur = document.createElement('div');
  cur.style.cssText = 'position:fixed;z-index:999;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:#ffffff70;border:3px solid #fff;box-shadow:0 2px 8px #0006;pointer-events:none;opacity:0;left:50%;top:50%';
  document.body.appendChild(cur);
  const setCur = (x, y, down) => { cur.style.left = x + 'px'; cur.style.top = y + 'px'; cur.style.opacity = 1; cur.style.transform = 'scale(' + (down ? 0.78 : 1) + ')'; };
  window.__B = { next: 1.3, gap: 0.3, drag: null, script: [], hideAt: 0, mode: '' };
  window.__tick = (t) => {
    window.__T = t;
    const B = __B, r = pile.getBoundingClientRect();
    const ev = (type, x, y) => pile.dispatchEvent(new PointerEvent(type, { pointerId: 9, clientX: r.left + x, clientY: r.top + y, bubbles: true, cancelable: true }));
    if (B.mode === 'win') {
      if (t >= 0.4 && !B.won) { B.won = true; state.score = 12800; state.matches = 24; ending = true; clearBodies(); win(); }
      return;
    }
    if (B.mode === 'map') {            // open the map, then drift down across the islands
      if (!B.opened && t >= 0.15) { B.opened = true; openMap(); B.y0 = 0; mapPan.y = 0; mapPan.x = ($('map').clientWidth - mapPan.w) / 2; placeMap(); }
      if (B.opened) { const u = Math.min(1, Math.max(0, (t - 0.9) / 3.6)), e = u * u * (3 - 2 * u); mapPan.y = ($('map').clientHeight - mapPan.h) * e; placeMap(); }
      return;
    }
    if (B.drag) {
      const d = B.drag, u = Math.min(1, (t - d.t0) / d.dur), e = u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u);
      const x = d.ax + (d.b.x + 2 - d.ax) * e, y = d.ay + (d.b.y - d.ay) * e;
      ev('pointermove', x, y); setCur(r.left + x, r.top + y, true);
      if (u >= 1) { ev('pointerup', x, y); B.drag = null; B.next = t + B.gap; setCur(r.left + x, r.top + y, false); B.hideAt = t + 0.22; }
      return;
    }
    if (B.hideAt && t >= B.hideAt) { cur.style.opacity = 0; B.hideAt = 0; }
    const s = B.script[0];
    if (s && t >= s.t) {
      B.script.shift();
      const el = s.do === 'fox' ? $('fox') : document.querySelector('[data-tool=' + s.do + ']'), q = el.getBoundingClientRect();
      setCur(q.left + q.width / 2, q.top + q.height / 2, true); el.click();
      B.hideAt = t + 0.35; B.next = t + (s.do === 'hint' ? 1.0 : 0.7);
      return;
    }
    if (t < B.next || $('modal').classList.contains('open') || $('win').classList.contains('open')) return;
    const ok = (b) => !b.ice && b.y > R && Math.hypot(b.x - b.px, b.y - b.py) < 1.5;
    const pairs = [];
    for (const a of bodies) if (ok(a)) for (const b of bodies) if (b !== a && ok(b) && sameKind(a, b)) pairs.push([a, b]);
    if (!pairs.length) return;
    const pair = pairs.find(([a]) => els.get(a.id).classList.contains('hinted'))
      || pairs.find(([, b]) => bodies.some((o) => o.ice && Math.hypot(o.x - b.x, o.y - b.y) < R * 3))
      || pairs[Math.floor(Math.random() * pairs.length)];
    const [a, b] = pair;
    ev('pointerdown', a.x, a.y);
    if (!drag) return;
    B.drag = { b, ax: a.x, ay: a.y, t0: t, dur: 0.26 + Math.min(0.3, Math.hypot(a.x - b.x, a.y - b.y) / 900) };
    setCur(r.left + a.x, r.top + a.y, true);
  };
`;

const stars = {}; for (let n = 1; n <= 12; n++) stars[n] = [3, 2, 3, 3, 1, 3, 2, 3][n % 8];
const only = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--allow-file-access-from-files', '--force-color-profile=srgb'] });
for (const clip of CLIPS.filter((c) => !only.length || only.includes(c.id))) {
  const context = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
  await page.clock.install({ time: new Date('2026-10-08T12:00:00') });
  await page.addInitScript(({ level, stars, first }) => {
    const s = { ...stars }; if (first) delete s[level];
    localStorage.setItem('stickermerge.v3', JSON.stringify({
      page: level, maxPage: Math.max(level, 13), gems: 480, energy: 100, energyTs: Date.now(), counts: [0, 0, 0, 0], bodies: null, tut: 3, starterShown: true,
      stars: s, chests: 3, boosters: { hint: 3, shuffle: 3, magnet: 3 }, sfxVol: 1, musVol: 0,
      tips: { ice: 1, thick: 1, sign: 1, boost: 1, album: 1, world1: 1, world2: 1, world3: 1, world4: 1, world5: 1, world6: 1, world7: 1, world8: 1 },
      daily: { last: new Date().toLocaleDateString('en-CA'), streak: 1 },
    }));
  }, { level: clip.level, stars, first: clip.mode === 'win' });
  await page.goto(GAME);
  for (let i = 0; i < 200 && await page.evaluate(() => !!document.getElementById('loading')); i++) {
    await page.clock.runFor(100); await new Promise((r) => setTimeout(r, 30));
  }
  // let the opening pile settle off camera, and the world's painting load, before the clip starts
  for (let i = 0; i < 40; i++) { await page.clock.runFor(100); await new Promise((r) => setTimeout(r, 10)); }
  await page.evaluate(HELPERS);
  await page.evaluate(({ script, mode }) => { __B.script = script || []; __B.mode = mode || ''; }, clip);

  const dir = path.join(work, 'tt2', clip.id);
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const total = Math.round(clip.dur * FPS);
  for (let f = 0; f < total; f++) {
    await page.evaluate((t) => window.__tick(t), f / FPS);
    await page.clock.runFor(1000 / FPS);
    await page.evaluate(() => window.__stepAnims());
    fs.writeFileSync(path.join(dir, String(f + 1).padStart(4, '0') + '.jpg'), await page.screenshot({ type: 'jpeg', quality: 92 }));
  }
  const log = await page.evaluate(() => ({ cues: window.__log, score: state.score }));
  fs.writeFileSync(path.join(work, 'tt2', clip.id + '.json'), JSON.stringify({ ...log, frames: total }));
  console.log(`${clip.id}: ${total} frames, ${log.cues.length} sound cues, score ${log.score}`);
  await context.close();
}
await browser.close();

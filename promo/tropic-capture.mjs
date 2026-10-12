// Captures Tropic Tumble gameplay as frame sequences for the promo, deterministically.
// The game runs on a fake clock that is advanced one video frame at a time, a scripted "player" drags stickers
// together, and every CSS/Web Animation is stepped by hand so effects stay in sync with the game.
// Usage: node tropic-capture.mjs [clipId ...]      (frames go to .work/tt/<clip>/0001.jpg, sound cues to .work/tt/<clip>.json)
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const work = path.join(here, '.work');
const { chromium } = createRequire(path.join(work, 'x.js'))('playwright-core');
const GAME = pathToFileURL(path.resolve(here, '../../Merge Games/index.html')).href;
const FPS = 30;

// w/h are the game's logical size (what the phone reports); frames are captured at 2x.
const CLIPS = [
  { id: 'play', w: 393, h: 798, dur: 13.6, level: 4, script: [{ t: 5.0, do: 'magnet' }, { t: 8.2, do: 'fox' }, { t: 10.2, do: 'hint' }] },
  { id: 'win',  w: 393, h: 798, dur: 4.0, level: 4, win: true },
  { id: 'se',   w: 375, h: 645, dur: 5.2, level: 2, script: [] },
  { id: 'ipad', w: 496, h: 738, dur: 5.2, level: 3, script: [] },
];

// Runs inside the game page once it has loaded.
const HELPERS = `
  window.__vt = 0; window.__T = 0; window.__log = [];
  // Step every animation by hand: virtual time, not wall-clock time, decides where each one is.
  const __seen = new Map();
  window.__stepAnims = () => {
    __vt += 1000 / ${FPS};
    for (const a of document.getAnimations()) {
      let s = __seen.get(a);
      if (s === undefined) { s = __vt - 1000 / ${FPS}; __seen.set(a, s); }
      try { a.pause(); a.currentTime = __vt - s; } catch {}
    }
  };
  // Sound cues are logged with their time instead of played; the promo's soundtrack replays them in sync.
  for (const k of Object.keys(SND)) SND[k] = (...a) => { __log.push({ t: +__T.toFixed(3), k, a }); };
  const cur = document.createElement('div');
  cur.style.cssText = 'position:fixed;z-index:999;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:#ffffff70;border:3px solid #fff;box-shadow:0 2px 8px #0006;pointer-events:none;opacity:0;left:50%;top:50%';
  document.body.appendChild(cur);
  const setCur = (x, y, down) => { cur.style.left = x + 'px'; cur.style.top = y + 'px'; cur.style.opacity = 1; cur.style.transform = 'scale(' + (down ? 0.78 : 1) + ')'; };
  window.__B = { next: 1.5, gap: 0.3, drag: null, script: [], hideAt: 0, win: false };
  // The scripted player: called once per video frame with the clip time in seconds.
  window.__tick = (t) => {
    window.__T = t;
    const B = __B, r = pile.getBoundingClientRect();
    const ev = (type, x, y) => pile.dispatchEvent(new PointerEvent(type, { pointerId: 9, clientX: r.left + x, clientY: r.top + y, bubbles: true, cancelable: true }));
    if (B.win) {
      if (t >= 0.5 && !B.won) { B.won = true; clearBodies(); state.counts = PACKS.map(() => TARGET); state.score = 10400; win(); }
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
    // Choose a pair that is resting in view: a hinted one first, then one that will crack ice, otherwise any.
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

const only = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--allow-file-access-from-files', '--force-color-profile=srgb'] });
for (const clip of CLIPS.filter((c) => !only.length || only.includes(c.id))) {
  const context = await browser.newContext({ viewport: { width: clip.w, height: clip.h }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
  await page.clock.install({ time: new Date('2026-10-07T12:00:00') });
  // A saved game that drops straight into the level we want, past the tutorial and today's daily reward.
  await page.addInitScript((level) => {
    localStorage.setItem('stickermerge.v3', JSON.stringify({
      page: level, gems: 120, energy: 100, energyTs: Date.now(), counts: [0, 0, 0, 0], bodies: null,
      tut: 3, daily: { last: new Date().toLocaleDateString('en-CA'), streak: 1 }, music: false,
    }));
  }, clip.level);
  await page.goto(GAME);
  for (let i = 0; i < 200 && await page.evaluate(() => !!document.getElementById('loading')); i++) {
    await page.clock.runFor(100); await new Promise((r) => setTimeout(r, 30));
  }
  await page.evaluate(HELPERS);
  await page.evaluate(({ script, win }) => { __B.script = script || []; __B.win = !!win; }, clip);

  const dir = path.join(work, 'tt', clip.id);
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const total = Math.round(clip.dur * FPS);
  for (let f = 0; f < total; f++) {
    await page.evaluate((t) => window.__tick(t), f / FPS);
    await page.clock.runFor(1000 / FPS);
    await page.evaluate(() => window.__stepAnims());
    fs.writeFileSync(path.join(dir, String(f + 1).padStart(4, '0') + '.jpg'), await page.screenshot({ type: 'jpeg', quality: 92 }));
    if (f % 90 === 0) console.log(`${clip.id} ${f}/${total}`);
  }
  const log = await page.evaluate(() => ({ cues: window.__log, score: state.score, counts: state.counts }));
  fs.writeFileSync(path.join(work, 'tt', clip.id + '.json'), JSON.stringify(log));
  console.log(`${clip.id}: ${total} frames, ${log.cues.length} sound cues, score ${log.score}`);
  await context.close();
}
await browser.close();

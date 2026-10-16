// Frame-accurate timeline for the screen-share trailers. render.mjs calls window.renderAt(t) per frame.
// Scenes: <section class="scene" data-dur="6" data-ch="02 · Map the flow" data-toast="Step 02|Map the flow">.
// Items:  data-in="1.2" (scene seconds) data-out data-d data-fx="fade|up|pop|wipe|wiped|grow|growy|draw|type".
// Cursor: data-c on an item makes the cursor travel to it and click as it appears ("fx,fy" picks the spot, data-cl="0" skips the click).
//         data-cursor="t,x,y[,click];..." on a scene adds free moves in stage pixels.
// Camera: data-zoom="t,scale,x,y;..." on a .board. Live parts: data-anim="name" runs window.ANIM[name](el, sceneTime).
(() => {
const FPS = 30;
const $ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const eOut = x => 1 - Math.pow(1 - x, 3), eIn = x => x * x * x, eIO = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eBack = x => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
const keys = s => s.split(';').map(k => k.trim()).filter(Boolean).map(k => k.split(',').map(Number));
const at = (ks, t) => {
  if (t <= ks[0][0]) return ks[0].slice(1);
  for (let i = 1; i < ks.length; i++) if (t < ks[i][0]) { const p = eIO((t - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0])); return ks[i].slice(1).map((v, j) => ks[i - 1][j + 1] + (v - ks[i - 1][j + 1]) * p); }
  return ks[ks.length - 1].slice(1);
};
window.ANIM = window.ANIM || {};
window.clamp = clamp; window.eOut = eOut; window.eIO = eIO; window.eBack = eBack; window.at = at; window.keys = keys;

const stage = document.getElementById('stage');
stage.insertAdjacentHTML('beforeend', `
<div id="hud"><div id="rec"><i></i>Screen share <span>· Remi Couture</span></div><div id="chapter"></div>
<div id="clock"><em id="speed"></em><b id="time"></b></div><div id="track"><div id="bar"></div></div></div>
<div id="toast"><small></small><strong></strong></div>
<div id="ripple"></div>
<svg id="cursor" viewBox="0 0 34 40"><path d="M3 2 L3 32 L11 25 L16.5 37 L22 34.5 L16.5 23 L27 23 Z" fill="#111" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/></svg>
<div id="fade"></div>`);
const hud = document.getElementById('hud'), chapter = document.getElementById('chapter'), bar = document.getElementById('bar'), fade = document.getElementById('fade');
const toast = document.getElementById('toast'), cursor = document.getElementById('cursor'), ripple = document.getElementById('ripple');
const timeEl = document.getElementById('time'), speedEl = document.getElementById('speed');

let T = 0;
const sc = $('.scene').map(el => ({ el, from: T, to: T += +el.dataset.dur, ch: el.dataset.ch || '', card: el.classList.contains('card'), toast: el.dataset.toast }));
const DUR = T;
const cfg = window.TRAILER || { start: '09:00', minutes: 300 };
const [h0, m0] = cfg.start.split(':').map(Number);
speedEl.textContent = 'TIMELAPSE ×' + Math.round(cfg.minutes * 60 / DUR);

// typing: remember each text node's full text
const typeNodes = el => { const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), out = []; while (w.nextNode()) out.push({ n: w.currentNode, s: w.currentNode.textContent }); return out; };

const clicks = [], moves = [];
sc.forEach(s => {
  s.items = $('[data-in]', s.el).map(el => ({ el, a: +el.dataset.in, b: el.dataset.out ? +el.dataset.out : 1e9, exit: !!el.dataset.out, fx: el.dataset.fx || 'fade', d: +(el.dataset.d || .45), text: el.dataset.fx === 'type' ? typeNodes(el) : null }));
  s.boards = $('[data-zoom]', s.el).map(el => ({ el, ks: keys(el.dataset.zoom) }));
  s.anims = $('[data-anim]', s.el).map(el => ({ el, fn: el.dataset.anim }));
  if (s.el.dataset.cursor) keys(s.el.dataset.cursor).forEach(([t, x, y, c]) => { moves.push([s.from + t, x, y]); if (c) clicks.push(s.from + t); });
});

// measure cursor targets with every scene laid out at its own camera position
let measured = false;
const measure = () => {
measured = true;
const sr = stage.getBoundingClientRect();
sc.forEach(s => {
  s.el.style.display = 'block';
  s.items.filter(o => o.el.hasAttribute('data-c')).forEach(o => {
    s.boards.forEach(b => { const [z, x, y] = at(b.ks, o.a); b.el.style.transform = `translate(${x}px,${y}px) scale(${z})`; });
    const st = o.el.style, keep = [st.visibility, st.transform, st.clipPath];
    st.visibility = 'visible'; st.transform = 'none'; st.clipPath = 'none';
    const r = o.el.getBoundingClientRect(), [fx, fy] = (o.el.dataset.c || '.5,.5').split(',').map(Number);
    [st.visibility, st.transform, st.clipPath] = keep;
    const x = r.left - sr.left + r.width * fx, y = r.top - sr.top + r.height * fy, when = s.from + o.a;
    moves.push([when - .05, x, y]);
    if (o.el.dataset.cl !== '0') clicks.push(when - .05);
  });
  s.el.style.display = 'none';
});
moves.sort((a, b) => a[0] - b[0]);
window.CLICKS = clicks.slice().sort((a, b) => a - b);
};
const cursorAt = t => {
  if (!moves.length) return [960, 540];
  if (t <= moves[0][0]) return moves[0].slice(1);
  for (let i = 1; i < moves.length; i++) if (t < moves[i][0]) {
    const [t0, x0, y0] = moves[i - 1], [t1, x1, y1] = moves[i], travel = Math.min(.42, t1 - t0), p = eIO(clamp((t - (t1 - travel)) / travel));
    // a small arc so the hand feels human
    const arc = Math.sin(p * Math.PI) * Math.min(40, Math.hypot(x1 - x0, y1 - y0) * .08);
    return [x0 + (x1 - x0) * p, y0 + (y1 - y0) * p - arc];
  }
  return moves[moves.length - 1].slice(1);
};

function draw(o, t) {
  const s = o.el.style;
  if (t < o.a || t >= o.b) { s.visibility = 'hidden'; return; }
  s.visibility = 'visible';
  const raw = clamp((t - o.a) / o.d), p = eOut(raw), q = o.exit ? eIn(clamp((t - (o.b - .25)) / .25)) : 0;
  let tr = '', op = Math.min(1, p * 1.6) * (1 - q), clip = '';
  switch (o.fx) {
    case 'fade': tr = ''; break;
    case 'up': tr = `translateY(${(1 - p) * 30}px)`; break;
    case 'pop': tr = `scale(${.55 + .45 * eBack(raw)})`; break;
    case 'drop': tr = `translateY(${(1 - p) * -40}px) rotate(${(1 - p) * -6}deg)`; break;
    case 'wipe': clip = `inset(-30px ${(1 - eIO(raw)) * 102}% -30px -30px)`; op = 1 - q; break;
    case 'wiped': clip = `inset(-30px -30px ${(1 - eIO(raw)) * 102}% -30px)`; op = 1 - q; break;
    case 'grow': tr = `scaleX(${eIO(raw)})`; op = 1 - q; break;
    case 'growy': tr = `scaleY(${eIO(raw)})`; op = 1 - q; break;
    case 'draw': s.strokeDashoffset = 1 - eIO(raw); op = 1 - q; break;
    case 'type': {
      const total = o.text.reduce((n, x) => n + x.s.length, 0); let left = Math.round(total * clamp((t - o.a) / o.d));
      o.text.forEach(x => { const k = Math.min(x.s.length, Math.max(0, left)); x.n.textContent = x.s.slice(0, k); left -= x.s.length; });
      o.el.classList.toggle('caret', raw < 1 && raw > 0); op = 1 - q; break;
    }
  }
  s.opacity = op; s.transform = tr; s.clipPath = clip; s.webkitClipPath = clip;
}

window.renderAt = t => {
  if (!measured) measure();
  let cur = sc[sc.length - 1];
  sc.forEach(s => {
    const on = t >= s.from && t < s.to;
    s.el.style.display = on ? 'block' : 'none';
    if (!on) return;
    cur = s; const lt = t - s.from;
    s.el.style.opacity = s.card ? Math.min(clamp(lt / .3), clamp((s.to - t) / .3)) : 1;
    s.items.forEach(o => draw(o, lt));
    s.boards.forEach(({ el, ks }) => { const [z, x, y] = at(ks, lt); el.style.transform = `translate(${x}px,${y}px) scale(${z})`; });
    s.anims.forEach(({ el, fn }) => window.ANIM[fn] && window.ANIM[fn](el, lt));
    // step toast at the start of each working scene
    if (s.toast) {
      const [k, ttl] = s.toast.split('|'), v = Math.min(eOut(clamp((lt - .1) / .35)), 1 - eIn(clamp((lt - 1.9) / .3)));
      toast.firstChild.textContent = k; toast.lastChild.textContent = ttl;
      toast.style.opacity = v; toast.style.transform = `translateY(${(1 - v) * 24}px)`;
    } else toast.style.opacity = 0;
  });
  chapter.textContent = cur.ch;
  hud.style.opacity = cur.card ? 0 : 1;
  const [cx, cy] = cursorAt(t);
  cursor.style.display = cur.card ? 'none' : 'block';
  const press = clicks.some(c => t >= c && t < c + .12);
  cursor.style.transform = `translate(${cx - 3}px,${cy - 2}px) scale(${press ? .86 : 1})`;
  const last = clicks.filter(c => c <= t).pop(), rp = last === undefined ? 1 : (t - last) / .4;
  ripple.style.opacity = cur.card || rp >= 1 ? 0 : (1 - rp) * .9;
  ripple.style.transform = `translate(${cx}px,${cy}px) scale(${.3 + rp * .9})`;
  const mins = h0 * 60 + m0 + cfg.minutes * clamp(t / DUR);
  timeEl.textContent = `${String(Math.floor(mins / 60) % 24).padStart(2, '0')}:${String(Math.floor(mins % 60)).padStart(2, '0')}`;
  bar.style.width = (t / DUR * 100) + '%';
  fade.style.opacity = t < .4 ? 1 - t / .4 : clamp((t - (DUR - .9)) / .8);
};
window.DUR = DUR; window.FPS = FPS;
window.CUTS = sc.map(s => s.from); window.CARDS = sc.filter(s => s.card).map(s => s.from);

// preview: plays in real time, scaled to the window. ?t=12 starts at 0:12; arrows seek 2 s; space pauses.
if (!new URLSearchParams(location.search).has('render')) {
  const fit = () => { stage.style.transform = `scale(${Math.min(innerWidth / 1920, innerHeight / 1080)})`; };
  fit(); addEventListener('resize', fit);
  let t = +new URLSearchParams(location.search).get('t') || 0, last = performance.now(), paused = new URLSearchParams(location.search).has('pause');
  addEventListener('keydown', e => { if (e.key === 'ArrowRight') t += 2; if (e.key === 'ArrowLeft') t = Math.max(0, t - 2); if (e.key === ' ') paused = !paused; });
  window.seek = v => { t = v; renderAt(t); };
  const loop = now => { if (!paused) t = (t + (now - last) / 1000) % DUR; last = now; renderAt(t); requestAnimationFrame(loop); };
  document.fonts.ready.then(() => requestAnimationFrame(loop));
}
})();

// Synthesizes a soundtrack for one screen-share trailer (120 BPM) to a 16-bit stereo WAV.
// Usage: node trailer-music.mjs out.wav <info.json> <ux|ui|build>
// info.json comes from make-trailers.mjs: { DUR, CUTS, CARDS, CLICKS } read from the trailer page.
import fs from 'node:fs';

const [out, infoPath, flavour = 'ux'] = process.argv.slice(2);
const { DUR, CUTS, CARDS, CLICKS } = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
const SR = 44100, BPM = 120, BEAT = 60 / BPM, BAR = BEAT * 4;
const N = Math.ceil((DUR + 0.3) * SR);
const L = new Float32Array(N), R = new Float32Array(N);
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
let seed = { ux: 5, ui: 9, build: 13 }[flavour] || 5; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const add = (i, l, r) => { if (i >= 0 && i < N) { L[i] += l; R[i] += r; } };

// vi-IV-I-V in a different key per trailer: [root, ...voicing]
const KEYS = {
  ux: [[35, 59, 62, 66], [31, 59, 62, 67], [38, 57, 62, 66], [33, 57, 61, 64]],    // Bm G D A
  ui: [[37, 61, 64, 68], [33, 61, 64, 69], [40, 59, 64, 68], [35, 59, 63, 66]],    // C#m A E B
  build: [[38, 62, 65, 69], [34, 58, 62, 65], [41, 60, 65, 69], [36, 60, 64, 67]], // Dm Bb F C
};
const chords = KEYS[flavour] || KEYS.ux;
const introEnd = CUTS[1], outroAt = CARDS[CARDS.length - 1];
const BARS = Math.ceil(DUR / BAR);
// 0 intro pad, 2 groove, 3 full groove, 1 outro
const level = t => t < introEnd ? 0 : t >= outroAt ? 1 : (t - introEnd) / (outroAt - introEnd) < .45 ? 2 : 3;

const kick = (at, g = 1) => { const s = Math.floor(at * SR); let ph = 0; for (let i = 0; i < 0.4 * SR; i++) { const t = i / SR, f = 46 + 130 * Math.exp(-t * 34); ph += f / SR; const v = Math.sin(ph * 2 * Math.PI) * Math.exp(-t * 7.5) * 0.85 * g; add(s + i, v, v); } };
const clap = (at, g = 1) => { const s = Math.floor(at * SR); let lp = 0; for (let i = 0; i < 0.22 * SR; i++) { const t = i / SR, n = rnd(); lp += 0.3 * (n - lp); const burst = t < .03 ? (Math.floor(t / .01) % 2 ? .6 : 1) : 1; const v = (n - lp) * Math.exp(-t * 22) * 0.42 * g * burst; add(s + i, v * 0.85, v); } };
const hat = (at, g = 1, pan = 0) => { const s = Math.floor(at * SR); let prev = 0; for (let i = 0; i < 0.045 * SR; i++) { const n = rnd(), v = (n - prev) * Math.exp(-(i / SR) * 100) * 0.13 * g; prev = n; add(s + i, v * (1 - pan), v * (1 + pan)); } };
const bass = (at, note, len, g = 1) => { const s = Math.floor(at * SR), f = hz(note); let lp = 0; for (let i = 0; i < len * SR; i++) { const t = i / SR, saw = ((t * f) % 1) * 2 - 1; lp += 0.06 * (saw - lp); const v = (Math.sin(t * f * 2 * Math.PI) * 0.6 + lp * 0.5) * Math.min(1, t / 0.008) * Math.min(1, (len - t) / .02) * Math.exp(-t * 4.5) * 0.4 * g; add(s + i, v, v); } };
const pluck = (at, note, g = 1, pan = 0) => { const s = Math.floor(at * SR), f = hz(note); for (let i = 0; i < 0.3 * SR; i++) { const t = i / SR, tri = Math.abs(((t * f) % 1) * 4 - 2) - 1, v = (tri * 0.7 + Math.sin(t * f * 4 * Math.PI) * 0.3) * Math.exp(-t * 14) * 0.07 * g; add(s + i, v * (1 - pan), v * (1 + pan)); } };
const impact = (at, g = 1) => { const s = Math.floor(at * SR); let lp = 0, ph = 0; for (let i = 0; i < 2 * SR; i++) { const t = i / SR, f = 40 + 55 * Math.exp(-t * 9); ph += f / SR; lp += 0.02 * (rnd() - lp); const v = (Math.sin(ph * 2 * Math.PI) * Math.exp(-t * 2.4) * 0.8 + lp * 5 * Math.exp(-t * 3.5)) * g * 0.6; add(s + i, v, v); } };
const riser = (to, len, g = 1) => { const s = Math.floor((to - len) * SR); let lp = 0; for (let i = 0; i < len * SR; i++) { const p = i / (len * SR), n = rnd(); lp += (0.02 + p * p * 0.5) * (n - lp); const v = lp * p * p * 0.28 * g; add(s + i, v, v); } };
const whoosh = (at, g = 1) => { const len = 0.45, s = Math.floor((at - 0.22) * SR); let lp = 0; for (let i = 0; i < len * SR; i++) { const p = i / (len * SR), env = Math.sin(p * Math.PI) ** 2; lp += (0.05 + env * 0.4) * (rnd() - lp); const v = lp * env * 0.2 * g; add(s + i, v * (1 - p), v * p); } };
// UI click: a short filtered tick plus a high blip, like a mouse on a desk mic
const tick = (at, g = 1) => { const s = Math.floor(at * SR); let lp = 0; const f = 2400 + rnd() * 300; for (let i = 0; i < 0.03 * SR; i++) { const t = i / SR, n = rnd(); lp += 0.5 * (n - lp); const v = ((n - lp) * 0.6 + Math.sin(t * f * 2 * Math.PI) * 0.4) * Math.exp(-t * 260) * 0.16 * g; add(s + i, v * .9, v); } };

// pad
for (let bar = 0; bar < BARS; bar++) {
  const [, ...notes] = chords[bar % 4], t0 = bar * BAR, start = Math.floor(t0 * SR), len = Math.floor((BAR + 0.5) * SR), lv = level(t0);
  const gain = lv === 0 ? .05 : lv === 1 ? .065 : .045, cutoff = lv === 0 ? .03 : lv === 1 ? .045 : .07;
  let lpL = 0, lpR = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR, env = Math.min(1, t / 0.3) * Math.min(1, (len - i) / (0.5 * SR));
    let l = 0, r = 0;
    notes.forEach(n => [-0.08, 0.08].forEach((det, d) => { const v = ((t * hz(n + det)) % 1) * 2 - 1; l += v * (d ? .45 : .9); r += v * (d ? .9 : .45); }));
    lpL += cutoff * (l - lpL); lpR += cutoff * (r - lpR);
    const duck = lv >= 2 ? 0.5 + 0.5 * Math.min(1, ((t % BEAT) / BEAT) * 2.4) : 1;
    add(start + i, lpL * env * gain * duck, lpR * env * gain * duck);
  }
}
// rhythm section
for (let bar = 0; bar < BARS; bar++) {
  const t0 = bar * BAR, [root, ...notes] = chords[bar % 4];
  for (let b = 0; b < 4; b++) {
    const tb = t0 + b * BEAT, lv = level(tb);
    if (lv >= 2) { kick(tb); bass(tb, root, BEAT * .45); bass(tb + BEAT / 2, root + (b === 3 ? 12 : 0), BEAT * .4, .75); for (let h = 0; h < 4; h++) hat(tb + h * BEAT / 4, h % 2 ? .5 : 1, h % 2 ? .3 : -.2); }
    if (lv >= 2 && b % 2 === 1) clap(tb, lv === 3 ? 1 : .8);
    if (lv === 3 || lv === 1) for (let h = 0; h < 4; h++) { const step = b * 4 + h, n = notes[[0, 1, 2, 1, 0, 2, 1, 2][step % 8]] + (step % 16 >= 8 ? 12 : 0) + 12; pluck(tb + h * BEAT / 4, n, lv === 1 ? .7 : 1, step % 2 ? .45 : -.45); }
    if (lv === 1 && b === 0) bass(tb, root, BEAT * 1.6, .7);
  }
}
riser(introEnd, 1.6, 1); impact(introEnd, .9);
CUTS.slice(2).forEach(t => { if (t !== outroAt) whoosh(t, .9); });
riser(outroAt, 1.2, .7); impact(outroAt, 1);
CLICKS.forEach(t => { if (t > introEnd && t < outroAt) tick(t); });

// space, soft clip, fades
const dl = Math.floor(BEAT * .75 * SR), dr = Math.floor(BEAT * .5 * SR);
for (let i = 0; i < N; i++) { if (i >= dl) L[i] += R[i - dl] * .18; if (i >= dr) R[i] += L[i - dr] * .18; }
const fadeOut = Math.floor((DUR - 1.6) * SR), end = Math.floor(DUR * SR);
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  const f = i < 300 ? i / 300 : i > end ? 0 : i > fadeOut ? ((end - i) / (end - fadeOut)) ** 1.5 : 1;
  buf.writeInt16LE(Math.round(Math.tanh(L[i] * 1.5) * .9 * f * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.tanh(R[i] * 1.5) * .9 * f * 32767), 46 + i * 4);
}
fs.writeFileSync(out, buf);
console.log('wrote', out, DUR.toFixed(1) + ' s,', CLICKS.length, 'clicks');

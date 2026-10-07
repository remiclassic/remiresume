// Synthesizes the promo soundtrack (100 BPM, D minor, 21 bars = 50.4 s) to a 16-bit stereo WAV.
// Usage: node music.mjs out.wav
import fs from 'node:fs';

const SR = 44100, BPM = 100, BEAT = 60 / BPM, BAR = BEAT * 4, BARS = 21, DUR = BARS * BAR;
const N = Math.ceil((DUR + 0.2) * SR);
const L = new Float32Array(N), R = new Float32Array(N);
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
let seed = 7; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const add = (i, l, r) => { if (i >= 0 && i < N) { L[i] += l; R[i] += r; } };

// Section map, in bars (0-based): matches the scene cuts in promo.html
// 0-2 hook | 3-4 numbers | 5-6 studios | 7-10 projects | 11-13 builds | 14-15 disciplines | 16-17 quotes | 18-20 call to action
const chords = [[38, 62, 65, 69], [34, 58, 62, 65], [41, 60, 65, 69], [36, 60, 64, 67]]; // Dm, Bb, F, C
const chordAt = bar => chords[bar % 4];
const level = bar => bar < 3 ? 0 : bar < 5 ? 1 : bar < 7 ? 2 : bar < 16 ? 3 : bar < 18 ? 1 : 4;

// pad: detuned saws through a one-pole low-pass, per bar with overlap
for (let bar = 0; bar < BARS; bar++) {
  const [, ...notes] = chordAt(bar), start = Math.floor(bar * BAR * SR), len = Math.floor((BAR + 0.5) * SR);
  const gain = (bar < 3 ? 0.035 + bar * 0.012 : bar >= 16 && bar < 18 ? 0.075 : 0.06);
  const cutoff = bar < 3 ? 0.03 + bar * 0.012 : bar >= 16 && bar < 18 ? 0.05 : 0.085;
  let lpL = 0, lpR = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR, env = Math.min(1, t / 0.35) * Math.min(1, (len - i) / (0.5 * SR));
    let l = 0, r = 0;
    notes.forEach((n, k) => [-0.09, 0, 0.09].forEach((det, d) => {
      const ph = (t * hz(n + det + (k === 2 ? 12 : 0))) % 1, v = ph * 2 - 1;
      l += v * (d === 0 ? 0.9 : 0.5); r += v * (d === 2 ? 0.9 : 0.5);
    }));
    lpL += cutoff * (l - lpL); lpR += cutoff * (r - lpR);
    const duck = level(bar) >= 2 ? 0.45 + 0.55 * Math.min(1, ((t % BEAT) / BEAT) * 2.2) : 1;
    add(start + i, lpL * env * gain * duck, lpR * env * gain * duck);
  }
}

const kick = (at, g = 1) => { const s = Math.floor(at * SR); let ph = 0; for (let i = 0; i < 0.42 * SR; i++) { const t = i / SR, f = 46 + 130 * Math.exp(-t * 34); ph += f / SR; const v = Math.sin(ph * 2 * Math.PI) * Math.exp(-t * 7.5) * 0.95 * g + (i < 90 ? rnd() * 0.25 * g : 0); add(s + i, v, v); } };
const snare = (at, g = 1) => { const s = Math.floor(at * SR); let lp = 0; for (let i = 0; i < 0.24 * SR; i++) { const t = i / SR, n = rnd(); lp += 0.35 * (n - lp); const v = ((n - lp) * 0.5 + Math.sin(t * 2 * Math.PI * 190) * 0.3 * Math.exp(-t * 30)) * Math.exp(-t * 19) * 0.5 * g; add(s + i, v * 0.9, v); } };
const hat = (at, g = 1, pan = 0) => { const s = Math.floor(at * SR); let prev = 0; for (let i = 0; i < 0.05 * SR; i++) { const n = rnd(), v = (n - prev) * Math.exp(-(i / SR) * 95) * 0.16 * g; prev = n; add(s + i, v * (1 - pan), v * (1 + pan)); } };
const bass = (at, note, len, g = 1) => { const s = Math.floor(at * SR), f = hz(note); let lp = 0; for (let i = 0; i < len * SR; i++) { const t = i / SR, saw = ((t * f) % 1) * 2 - 1; lp += 0.07 * (saw - lp); const v = (Math.sin(t * f * 2 * Math.PI) * 0.6 + lp * 0.55) * Math.min(1, t / 0.008) * Math.exp(-t * 5.5) * 0.42 * g; add(s + i, v, v); } };
const pluck = (at, note, g = 1, pan = 0) => { const s = Math.floor(at * SR), f = hz(note); for (let i = 0; i < 0.34 * SR; i++) { const t = i / SR, tri = Math.abs(((t * f) % 1) * 4 - 2) - 1, v = (tri * 0.7 + Math.sin(t * f * 4 * Math.PI) * 0.3) * Math.exp(-t * 13) * 0.085 * g; add(s + i, v * (1 - pan), v * (1 + pan)); } };
const impact = (at, g = 1) => { const s = Math.floor(at * SR); let lp = 0, ph = 0; for (let i = 0; i < 2.6 * SR; i++) { const t = i / SR, f = 38 + 60 * Math.exp(-t * 9); ph += f / SR; lp += 0.02 * (rnd() - lp); const v = (Math.sin(ph * 2 * Math.PI) * Math.exp(-t * 2.1) * 0.9 + lp * 6 * Math.exp(-t * 3.2)) * g * 0.8; add(s + i, v, v); } };
const riser = (to, len, g = 1) => { const s = Math.floor((to - len) * SR); let bp = 0, lp = 0; for (let i = 0; i < len * SR; i++) { const p = i / (len * SR), n = rnd(), c = 0.02 + p * p * 0.5; lp += c * (n - lp); bp = lp - (bp + 0.02 * (lp - bp)); const v = lp * p * p * 0.34 * g; add(s + i, v * (0.7 + 0.3 * Math.sin(p * 40)), v * (0.7 - 0.3 * Math.sin(p * 40))); } };
const whoosh = (at, g = 1) => { const len = 0.5, s = Math.floor((at - 0.25) * SR); let lp = 0; for (let i = 0; i < len * SR; i++) { const p = i / (len * SR), env = Math.sin(p * Math.PI) ** 2; lp += (0.05 + env * 0.4) * (rnd() - lp); const v = lp * env * 0.22 * g; add(s + i, v * (1 - p), v * p); } };

for (let bar = 0; bar < BARS; bar++) {
  const t0 = bar * BAR, lv = level(bar), [root, ...notes] = chordAt(bar);
  for (let b = 0; b < 4; b++) {
    const tb = t0 + b * BEAT;
    if (lv === 0) { if (bar > 0 || b >= 2) bass(tb, root, BEAT * 0.9, 0.55 + bar * 0.12); }
    if (lv >= 1 && lv !== 1.5) { bass(tb, root, BEAT * 0.5, lv === 1 ? 0.8 : 1); bass(tb + BEAT / 2, root + (b === 3 ? 12 : 0), BEAT * 0.45, lv === 1 ? 0.55 : 0.8); }
    if (lv >= 2) kick(tb);
    if (lv === 1 && bar < 16 && b % 2 === 0) kick(tb, 0.85);
    if (lv >= 3 && b % 2 === 1) snare(tb, lv === 4 ? 1.15 : 1);
    if (lv >= 2) for (let h = 0; h < 4; h++) hat(tb + h * BEAT / 4, h % 2 ? 0.55 : 1, h % 2 ? 0.3 : -0.2);
    if (lv >= 3 || (lv === 1 && bar >= 16)) for (let h = 0; h < 4; h++) { const step = b * 4 + h, n = notes[[0, 1, 2, 1, 0, 2, 1, 2][step % 8]] + (step % 16 >= 8 ? 12 : 0) + 12; pluck(tb + h * BEAT / 4, n, lv === 4 ? 1.25 : bar >= 16 ? 0.8 : 1, step % 2 ? 0.45 : -0.45); }
  }
  if (lv === 4 && bar === BARS - 1) { /* last bar: let the final hit ring */ }
}
// hook slams land on beats 2, 3, 4 of bar 0 and beat 1 of bar 1 (1.2 s, 1.8 s, 2.4 s, 3.0 s)
[1.2, 1.8, 2.4].forEach(t => { kick(t, 1.1); snare(t, 0.5); });
impact(0.02, 0.7); impact(3.0, 1);
[7.2, 12, 16.8, 26.4, 33.6, 38.4, 43.2].forEach(t => { whoosh(t); impact(t, t === 43.2 ? 1.15 : t === 38.4 ? 0.5 : 0.8); });
[19.2, 21.6, 24, 28.8, 31.2].forEach(t => whoosh(t, 0.7));
riser(7.2, 2.4); riser(16.8, 2.4, 0.8); riser(26.4, 1.2, 0.6); riser(43.2, 2.4, 1.1);
impact(44.4, 1.1); // "Let's build it."

// stereo feedback delay for space, then soft clip and fades
const dl = Math.floor(BEAT * 0.75 * SR), dr = Math.floor(BEAT * 0.5 * SR);
for (let i = 0; i < N; i++) { if (i >= dl) L[i] += R[i - dl] * 0.2; if (i >= dr) R[i] += L[i - dr] * 0.2; }
const fadeOut = Math.floor((DUR - 2.2) * SR), end = Math.floor(DUR * SR);
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  const f = i < 400 ? i / 400 : i > end ? 0 : i > fadeOut ? ((end - i) / (end - fadeOut)) ** 1.5 : 1;
  buf.writeInt16LE(Math.round(Math.tanh(L[i] * 1.5) * 0.92 * f * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.tanh(R[i] * 1.5) * 0.92 * f * 32767), 46 + i * 4);
}
fs.writeFileSync(process.argv[2] || 'promo-music.wav', buf);
console.log('wrote', process.argv[2] || 'promo-music.wav', DUR.toFixed(1) + ' s');

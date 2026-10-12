// Synthesizes the soundtrack for ux-video.html (80 BPM, D major, 110 bars = 330 s) to a 16-bit stereo WAV.
// Usage: node ux-music.mjs out.wav
import fs from 'node:fs';

const SR = 44100, BPM = 80, BEAT = 60 / BPM, BAR = BEAT * 4, BARS = 110, DUR = BARS * BAR;
const N = Math.ceil((DUR + 0.2) * SR);
const L = new Float32Array(N), R = new Float32Array(N);
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
let seed = 11; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const add = (i, l, r) => { if (i >= 0 && i < N) { L[i] += l; R[i] += r; } };

// Bar map: one bar is 3 s, and every scene in ux-video.html lasts a whole number of bars.
// Lesson cards sit on bars 4, 16, 28, 41, 62, 69 and 83. Reflective scenes (brief, validation, outcomes) drop the drums.
const CARDS = [4, 16, 28, 41, 62, 69, 83];
const QUIET = [[11, 16], [63, 69], [94, 100]];
const level = bar => bar < 4 ? 0 : bar >= 108 ? 0 : CARDS.includes(bar) ? -1 : QUIET.some(([a, b]) => bar >= a && bar < b) ? 1 : 2;

const SEC_A = [[38, 62, 66, 69, 73], [35, 59, 62, 66, 69], [43, 55, 59, 62, 66], [45, 57, 61, 64, 66]]; // Dmaj7, Bm7, Gmaj7, A6
const SEC_B = [[40, 55, 59, 62, 66], [43, 55, 59, 62, 67], [42, 57, 62, 66, 69], [45, 57, 61, 64, 69]]; // Em9, G, D/F#, A
const chordAt = bar => (Math.floor(bar / 4) % 4 === 2 ? SEC_B : SEC_A)[bar % 4];

// pad: detuned saws through a one-pole low-pass, per bar with overlap
for (let bar = 0; bar < BARS; bar++) {
  const [, ...notes] = chordAt(bar), start = Math.floor(bar * BAR * SR), len = Math.floor((BAR + 0.8) * SR);
  const lv = level(bar), gain = lv === 2 ? 0.03 : 0.036, cutoff = lv === 2 ? 0.06 : lv === -1 ? 0.075 : 0.045;
  let lpL = 0, lpR = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR, env = Math.min(1, t / 0.7) * Math.min(1, (len - i) / (0.8 * SR));
    let l = 0, r = 0;
    notes.forEach(n => [-0.08, 0.08].forEach((det, d) => { const v = ((t * hz(n + det)) % 1) * 2 - 1; l += v * (d ? 0.4 : 0.9); r += v * (d ? 0.9 : 0.4); }));
    lpL += cutoff * (l - lpL); lpR += cutoff * (r - lpR);
    add(start + i, lpL * env * gain, lpR * env * gain);
  }
}

const bell = (at, note, g = 1, pan = 0) => { const s = Math.floor(at * SR), f = hz(note); for (let i = 0; i < 1.3 * SR; i++) { const t = i / SR, v = (Math.sin(t * f * 2 * Math.PI) * Math.exp(-t * 4.5) + Math.sin(t * f * 4 * Math.PI) * 0.28 * Math.exp(-t * 8) + Math.sin(t * f * 6.02 * Math.PI) * 0.12 * Math.exp(-t * 13)) * Math.min(1, t / 0.004) * 0.075 * g; add(s + i, v * (1 - pan), v * (1 + pan)); } };
const bass = (at, note, len, g = 1) => { const s = Math.floor(at * SR), f = hz(note); for (let i = 0; i < len * SR; i++) { const t = i / SR, v = (Math.sin(t * f * 2 * Math.PI) + Math.sin(t * f * 4 * Math.PI) * 0.22) * Math.min(1, t / 0.012) * Math.min(1, (len - t) / 0.08) * Math.exp(-t * 1.6) * 0.2 * g; add(s + i, v, v); } };
const kick = (at, g = 1) => { const s = Math.floor(at * SR); let ph = 0; for (let i = 0; i < 0.3 * SR; i++) { const t = i / SR, f = 44 + 70 * Math.exp(-t * 30); ph += f / SR; const v = Math.sin(ph * 2 * Math.PI) * Math.exp(-t * 11) * 0.42 * g; add(s + i, v, v); } };
const shaker = (at, g = 1, pan = 0) => { const s = Math.floor(at * SR); let prev = 0; for (let i = 0; i < 0.07 * SR; i++) { const n = rnd(), t = i / SR, v = (n - prev) * Math.min(1, t / 0.006) * Math.exp(-t * 60) * 0.05 * g; prev = n; add(s + i, v * (1 - pan), v * (1 + pan)); } };
const rim = (at, g = 1) => { const s = Math.floor(at * SR); for (let i = 0; i < 0.09 * SR; i++) { const t = i / SR, v = (Math.sin(t * 2 * Math.PI * 820) * 0.6 + rnd() * 0.4) * Math.exp(-t * 55) * 0.1 * g; add(s + i, v * 0.8, v * 1.1); } };
const whoosh = (at, g = 1) => { const len = 1.4, s = Math.floor((at - 1.1) * SR); let lp = 0; for (let i = 0; i < len * SR; i++) { const p = i / (len * SR), env = Math.sin(p * Math.PI) ** 2; lp += (0.03 + env * 0.25) * (rnd() - lp); const v = lp * env * 0.11 * g; add(s + i, v * (1 - p), v * p); } };

const ARP = [0, 2, 1, 3, 2, 1, 3, 2];
for (let bar = 0; bar < BARS; bar++) {
  const t0 = bar * BAR, lv = level(bar), [root, ...notes] = chordAt(bar);
  if (lv === -1) { // lesson card: the groove stops and a chime rolls up the chord
    whoosh(t0, 1); bass(t0, root, BAR * 0.9, 0.9);
    [...notes, notes[0] + 12, notes[2] + 12].forEach((n, k) => bell(t0 + k * 0.085, n + 12, 1.25 - k * 0.08, (k % 2 ? 0.4 : -0.4)));
    continue;
  }
  for (let step = 0; step < 8; step++) {
    const ts = t0 + step * BEAT / 2, note = notes[ARP[(step + bar * 3) % 8]] + (step % 4 === 3 ? 12 : 0);
    const play = lv === 2 ? true : lv === 1 ? step % 2 === 0 || step === 5 : bar >= 1 && (step === 0 || step === 3 || (bar >= 2 && step === 6));
    if (play) bell(ts, note + 12, (step % 2 ? 0.6 : 0.95) * (lv === 2 ? 1 : 0.85), step % 2 ? 0.45 : -0.45);
    if (lv === 2) { shaker(ts + BEAT / 4, 0.7, 0.3); shaker(ts, step % 2 ? 1 : 0.5, -0.2); if (step === 4) rim(ts, 0.8); }
  }
  if (lv >= 1) { bass(t0, root, BEAT * 1.4, 1); bass(t0 + BEAT * 2.5, root + (bar % 4 === 3 ? 7 : 0), BEAT * 1.2, 0.75); }
  if (lv === 2) { kick(t0, 1); kick(t0 + BEAT * 2.5, 0.7); }
  if (bar === 0 || bar >= 108) bass(t0, root, BAR * 0.95, 0.8);
}
// last chord rings out under the closing card
[62, 66, 69, 74, 78].forEach((n, k) => bell(108 * BAR + k * 0.12, n + 12, 1.2, k % 2 ? 0.4 : -0.4));

// stereo feedback delay for space, then soft clip and fades
const dl = Math.floor(BEAT * 0.75 * SR), dr = Math.floor(BEAT * 0.5 * SR);
for (let i = 0; i < N; i++) { if (i >= dl) L[i] += R[i - dl] * 0.26; if (i >= dr) R[i] += L[i - dr] * 0.26; }
const fadeOut = Math.floor((DUR - 4.5) * SR), end = Math.floor(DUR * SR);
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  const f = i < 22050 ? i / 22050 : i > end ? 0 : i > fadeOut ? ((end - i) / (end - fadeOut)) ** 1.5 : 1;
  buf.writeInt16LE(Math.round(Math.tanh(L[i] * 1.6) * 0.9 * f * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.tanh(R[i] * 1.6) * 0.9 * f * 32767), 46 + i * 4);
}
fs.writeFileSync(process.argv[2] || 'ux-music.wav', buf);
console.log('wrote', process.argv[2] || 'ux-music.wav', DUR.toFixed(1) + ' s');

// Renders tropic-promo.html to an mp4, with a soundtrack built from the game's own synthesised music and effects.
// Usage: node tropic-render.mjs [--stills 1,5,12] [--out file.mp4] [--page tropic-trailer.html] [--dir tt2] [--size 1920x1080]
// Needs .work/tt/<clip>/ frames and <clip>.json sound cues from tropic-capture.mjs.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : null; };
const here = path.dirname(fileURLToPath(import.meta.url));
const work = path.join(here, '.work'), tt = path.join(work, opt('dir') || 'tt');
const [vw, vh] = (opt('size') || '1080x1350').split('x').map(Number);
const { chromium } = createRequire(path.join(work, 'x.js'))('playwright-core');
const url = pathToFileURL(path.join(here, opt('page') || 'tropic-promo.html')).href + '?render=1&frames=' + encodeURIComponent(pathToFileURL(tt).href);

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--allow-file-access-from-files', '--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: vw, height: vh }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
await page.goto(url);
await page.evaluate(() => document.fonts.ready);
const { DUR, FPS, plan } = await page.evaluate(() => ({ DUR: window.DUR, FPS: window.FPS, plan: window.CLIP_PLAN }));
const shot = async (t) => { await page.evaluate((t) => window.renderAt(t), t); return page.screenshot({ type: 'jpeg', quality: 95 }); };

if (opt('stills')) {
  const dir = path.join(tt, 'stills'); fs.mkdirSync(dir, { recursive: true });
  for (const t of opt('stills').split(',').map(Number)) fs.writeFileSync(path.join(dir, `t${t.toFixed(2).padStart(5, '0')}.jpg`), await shot(t));
  console.log('stills written to', dir);
  await browser.close();
  process.exit(0);
}

// ---- Soundtrack: load the game, point its audio code at an offline context, and replay music plus the captured cues ----
const cues = [];
for (const p of plan) {
  for (const c of JSON.parse(fs.readFileSync(path.join(tt, p.clip + '.json'), 'utf8')).cues) {
    if (c.t >= p.from && c.t <= p.to) cues.push({ t: p.at + c.t - p.from, k: c.k, a: c.a });
  }
}
const game = await browser.newPage();
await game.goto(pathToFileURL(path.resolve(here, '../../Merge Games/index.html')).href);
const wavB64 = await game.evaluate(`(async () => {
  const DUR = ${DUR}, RATE = 44100, cues = ${JSON.stringify(cues)};
  ac = new OfflineAudioContext(2, RATE * DUR, RATE);
  sfxOut = ac.createGain(); sfxOut.gain.value = 0.8; sfxOut.connect(ac.destination);
  musicOut = ac.createGain(); musicOut.connect(ac.destination);
  noiseBuf = ac.createBuffer(1, RATE * 2, RATE);
  const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  // music for the whole video, easing in and fading out under the last line
  musicOut.gain.setValueAtTime(0.0001, 0); musicOut.gain.linearRampToValueAtTime(0.85, 0.8);
  musicOut.gain.setValueAtTime(0.85, DUR - 2); musicOut.gain.linearRampToValueAtTime(0.0001, DUR - 0.1);
  for (let i = 0, t = 0.15; t < DUR; i++, t += STEP_S) scheduleStep(i, t);
  const sea = ac.createBufferSource(), lp = ac.createBiquadFilter(), level = ac.createGain(), swell = ac.createOscillator(), depth = ac.createGain();
  sea.buffer = noiseBuf; sea.loop = true; lp.type = 'lowpass'; lp.frequency.value = 650; level.gain.value = 0.05; swell.frequency.value = 0.11; depth.gain.value = 0.035;
  swell.connect(depth).connect(level.gain); sea.connect(lp).connect(level).connect(musicOut); sea.start(); swell.start();
  // effects, each at the moment it happened in the captured gameplay
  let at = 0; sfx = (play) => play(at); state.sound = true;
  for (const c of cues) { at = c.t; SND[c.k](...c.a); }
  const buf = await ac.startRendering();
  // 16-bit stereo WAV
  const n = buf.length, out = new DataView(new ArrayBuffer(44 + n * 4)), L = buf.getChannelData(0), Rr = buf.getChannelData(1);
  const str = (o, s) => [...s].forEach((ch, i) => out.setUint8(o + i, ch.charCodeAt(0)));
  str(0, 'RIFF'); out.setUint32(4, 36 + n * 4, true); str(8, 'WAVEfmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 2, true);
  out.setUint32(24, RATE, true); out.setUint32(28, RATE * 4, true); out.setUint16(32, 4, true); out.setUint16(34, 16, true); str(36, 'data'); out.setUint32(40, n * 4, true);
  let peak = 0; for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(Rr[i]));
  const gain = Math.min(2.5, 0.89 / (peak || 1));          // normalise to just under full scale
  for (let i = 0; i < n; i++) { out.setInt16(44 + i * 4, Math.round(L[i] * gain * 32767), true); out.setInt16(46 + i * 4, Math.round(Rr[i] * gain * 32767), true); }
  let bin = ''; const bytes = new Uint8Array(out.buffer);
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
})()`);
await game.close();
const audio = path.join(tt, 'soundtrack.wav');
fs.writeFileSync(audio, Buffer.from(wavB64, 'base64'));
console.log(`soundtrack: ${cues.length} cues, ${(fs.statSync(audio).size / 1e6).toFixed(1)} MB`);

// ---- Video ----
const out = path.resolve(opt('out') || path.join(here, '../output/tropic-tumble-promo.mp4'));
const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-', '-i', audio,
  '-c:a', 'aac', '-b:a', '256k', '-shortest', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const total = Math.round(DUR * FPS);
for (let f = 0; f < total; f++) {
  const buf = await shot(f / FPS);
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  if (f % 150 === 0) console.log(`frame ${f}/${total}`);
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
console.log('wrote', out);
await browser.close();

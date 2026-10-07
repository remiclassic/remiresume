// Renders promo.html frame by frame in headless Chrome and encodes it with ffmpeg.
// Usage: node render.mjs <workdir> [--stills 1.5,8,20] [--audio track.wav] [--out file.mp4]
// <workdir> must contain node_modules/playwright-core and frames/<clip>/0001.jpg (created by prepare.sh).
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const args = process.argv.slice(2);
const work = path.resolve(args[0]);
const opt = name => { const i = args.indexOf('--' + name); return i > 0 ? args[i + 1] : null; };
const { chromium } = createRequire(path.join(work, 'x.js'))('playwright-core');
const here = path.dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(path.join(here, 'promo.html')).href + '?render=1&frames=' + encodeURIComponent(pathToFileURL(path.join(work, 'frames')).href);

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--allow-file-access-from-files', '--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('PAGE ERROR', e.message));
await page.goto(url);
await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].filter(i => i.src && !i.dataset.clip).map(i => i.decode().catch(() => {}))); });
const { DUR, FPS } = await page.evaluate(() => ({ DUR: window.DUR, FPS: window.FPS }));
const shot = async t => { await page.evaluate(t => window.renderAt(t), t); return page.screenshot({ type: 'jpeg', quality: 95 }); };

if (opt('stills')) {
  const dir = path.join(work, 'stills'); fs.mkdirSync(dir, { recursive: true });
  for (const t of opt('stills').split(',').map(Number)) fs.writeFileSync(path.join(dir, `t${t.toFixed(2).padStart(5, '0')}.jpg`), await shot(t));
  console.log('stills written to', dir);
} else {
  const out = path.resolve(opt('out') || path.join(work, 'promo.mp4'));
  const audio = opt('audio');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-',
    ...(audio ? ['-i', audio, '-c:a', 'aac', '-b:a', '256k', '-shortest'] : []),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const total = Math.round(DUR * FPS);
  for (let f = 0; f < total; f++) {
    const buf = await shot(f / FPS);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log(`frame ${f}/${total}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log('wrote', out);
}
await browser.close();

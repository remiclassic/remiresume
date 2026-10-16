// Builds the three discipline trailers: reads each page's timing, synthesizes its music, renders the video and a poster.
// Usage: node make-trailers.mjs <workdir> [ux ui build]
// <workdir> must contain node_modules/playwright-core (see prepare.sh). Output: portfolio-media/disciplines/.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const work = path.resolve(process.argv[2]);
const which = process.argv.slice(3).length ? process.argv.slice(3) : ['ux', 'ui', 'build'];
const outDir = path.join(here, '..', 'portfolio-media', 'disciplines');
fs.mkdirSync(outDir, { recursive: true });
const { chromium } = createRequire(path.join(work, 'x.js'))('playwright-core');

for (const k of which) {
  const page = `trailer-${k}.html`;
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--allow-file-access-from-files'] });
  const p = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto(pathToFileURL(path.join(here, page)).href + '?render=1');
  await p.evaluate(async () => { await document.fonts.ready; window.renderAt(0); });
  const info = await p.evaluate(() => ({ DUR: window.DUR, CUTS: window.CUTS, CARDS: window.CARDS, CLICKS: window.CLICKS }));
  await browser.close();
  const infoPath = path.join(work, `${k}-info.json`), wav = path.join(work, `${k}.wav`), mp4 = path.join(outDir, `${k}-trailer.mp4`);
  fs.writeFileSync(infoPath, JSON.stringify(info));
  execFileSync('node', [path.join(here, 'trailer-music.mjs'), wav, infoPath, k], { stdio: 'inherit' });
  execFileSync('node', [path.join(here, 'render.mjs'), work, '--page', page, '--audio', wav, '--out', mp4], { stdio: 'inherit' });
  // poster: a busy moment from the middle of the session
  const posterAt = (info.CUTS[2] + info.CUTS[3]) / 2 + 1;
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-ss', String(posterAt), '-i', mp4, '-frames:v', '1', '-vf', 'scale=1280:-2', '-q:v', '3', path.join(outDir, `${k}-trailer-poster.jpg`)]);
  console.log('done', k);
}

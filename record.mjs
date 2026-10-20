// Records index.html (or the file given as argument) to deck.mp4 by stepping through every slide.
//
// Setup (once):   npm install playwright && npx playwright install chromium
// Run:            node record.mjs            -> deck.webm (+ deck.mp4 if ffmpeg is installed)
//
// Each slide stays on screen for its data-dur milliseconds (set on the <section>),
// so the animations finish before the next slide.

import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { renameSync, rmSync, existsSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const W = 1600, H = 900;                       // matches the stage size, so no letterbox
const url = pathToFileURL(path.join(here, process.argv[2] || 'index.html')).href + '?clean#1';
const videoDir = path.join(here, '.video');

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const context = await browser.newContext({
  viewport: { width: W, height: H },
  recordVideo: { dir: videoDir, size: { width: W, height: H } },
});
const page = await context.newPage();
await page.goto(url);
await page.evaluate(() => document.fonts.ready);   // wait for web fonts so text doesn't jump

const durations = await page.$$eval('.slide', s => s.map(el => +el.dataset.dur || 3000));
for (let i = 0; i < durations.length; i++) {
  console.log(`slide ${i + 1}/${durations.length}  ${durations[i]} ms`);
  await page.waitForTimeout(durations[i]);
  if (i < durations.length - 1) await page.keyboard.press('ArrowRight');
}

const video = page.video();
await context.close();                             // finalises the video file
await browser.close();

const webm = path.join(here, 'deck.webm');
renameSync(await video.path(), webm);
rmSync(videoDir, { recursive: true, force: true });
console.log('wrote', webm);

try {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', webm,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart',
    path.join(here, 'deck.mp4')]);
  console.log('wrote', path.join(here, 'deck.mp4'));
} catch {
  console.log('ffmpeg not found: install it to convert deck.webm to deck.mp4');
}

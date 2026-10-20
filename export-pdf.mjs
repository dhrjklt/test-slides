// Exports index.html (or the file given as argument) to deck.pdf: one 16:9 page per slide, each captured after its animation has finished.
// Text stays as real (selectable, searchable) text, not screenshots.
//
// Setup (once):   npm install playwright && npx playwright install chromium
// Run:            node export-pdf.mjs
//
// Animated slides (data-anim) are captured once the animation sets data-finished on its <section>.

import { chromium } from 'playwright';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const W = 1600, H = 900;
const url = pathToFileURL(path.join(here, process.argv[2] || 'index.html')).href + '?clean#1';

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.emulateMedia({ reducedMotion: 'reduce' });   // no morph transitions while exporting
await page.goto(url);
await page.evaluate(() => document.fonts.ready);

const count = await page.$$eval('.slide', s => s.length);
const snaps = [];
for (let i = 0; i < count; i++) {
  await page.evaluate(n => deck.go(n), i);
  // wait for the slide's animation to report it is done (or 60 s, whichever comes first)
  await page.waitForFunction(() => {
    const s = document.querySelector('.slide.active');
    return !s.dataset.anim || s.dataset.finished === '1';
  }, null, { timeout: 60000 });
  await page.waitForTimeout(400);   // let the last CSS transitions settle
  // Freeze the slide as it looks now (final animation state)
  snaps.push(await page.evaluate(() => {
    const c = document.querySelector('.slide.active').cloneNode(true);
    c.querySelectorAll('.go').forEach(e => e.classList.remove('go'));   // travelling dots
    c.querySelectorAll('.cursor').forEach(e => e.remove());             // blinking cursor
    return c.outerHTML;
  }));
  console.log(`captured slide ${i + 1}/${count}`);
}

// Replace the live deck with all frozen slides stacked, one per printed page
await page.evaluate(({ snaps, W, H }) => {
  document.getElementById('viewport').remove();
  const style = document.createElement('style');
  style.textContent = `
    @page { size: ${W}px ${H}px; margin: 0; }
    html, body { height: auto !important; overflow: visible !important; background: var(--paper) !important; }
    .pg { position: relative; width: ${W}px; height: ${H}px; overflow: hidden; background: var(--paper); }
    .pg:not(:last-child) { break-after: page; }
    .pg .slide { display: flex !important; }
    .track i { display: none; }`;
  document.head.appendChild(style);
  document.body.insertAdjacentHTML('beforeend', snaps.map(s => `<div class="pg">${s}</div>`).join(''));
}, { snaps, W, H });

const out = path.join(here, 'deck.pdf');
await page.pdf({ path: out, width: `${W}px`, height: `${H}px`, printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log('wrote', out);

# AI for Belle II computing & software

A self-contained, animated 16-slide deck (12 talk slides plus a 3-slide backup section and its divider) for the **KEK Software & Computing meeting, October 2026**, in one `index.html`. No build step; published with GitHub Pages. The original animated demo deck is kept in `examples/raw-data.html`.

| URL | What |
|---|---|
| `https://<user>.github.io/<repo>/` | Live deck |
| `https://<user>.github.io/<repo>/#3` | Opens on slide 3 |
| `https://<user>.github.io/<repo>/deck.pdf` | One 16:9 page per slide, final animation state |
| `https://<user>.github.io/<repo>/deck.mp4` | Recorded walkthrough |
| `https://<user>.github.io/<repo>/examples/raw-data.html` | The original demo deck |

## Controls

- `→` / `Space` / `PageDown` / `Enter` — next
- `←` / `PageUp` / `Backspace` — back
- `Home` / `End` — first / last slide
- `R` — replay the current slide's animation
- `P` — pause / resume the animation (slides marked `data-pausable`, e.g. slide 3)
- `F` — fullscreen
- `N` — speaker-notes drawer (also `?notes`)
- `?clean` — hide navigation and letterbox for recording or print

Speaker notes live as hidden `<aside class="notes">` blocks inside the matching slide. They never appear in the PDF or MP4.

## Publish

1. Push this folder to a GitHub repository's `main` branch.
2. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Open the **Actions** tab and wait for "Publish slides" to finish (about 3 minutes).

The workflow rebuilds `deck.pdf` and `deck.mp4` on every push and publishes `examples/` alongside the main deck.

## Work on it locally

Open `index.html` in a browser. Nothing to build.

To make the PDF or video:

```sh
npm install playwright
npx playwright install chromium
npx playwright install ffmpeg
node export-pdf.mjs     # -> deck.pdf
node record.mjs         # -> deck.webm, and deck.mp4 if ffmpeg is installed
```

## Deck structure

Talk: cover · roadmap · docs assistant (retrieval pipeline) · agentic operations assistant · more use cases · two live exchanges · we run our own LLMs · sharing the GPUs · one address, two copies · IITH collaboration · the GPUs are open · closing.

Backup (after the closing slide): a divider, `B1` the hardware, `B2` the platform on k3s.

## Editing the deck

- Each slide is a `<section class="slide">`; only the active one is displayed. The URL hash remembers the slide number.
- Design tokens (navy, paper, blue, fonts) are at the top of the `<style>` block.
- Step animations: add `data-anim="name"` to the section and an `anims.name(root)` function in the script. The animation must set `root.dataset.finished = '1'` when it ends, so the PDF export knows when to capture it.
- `data-dur="9000"` sets how long the slide stays on screen in the recorded video. Keep it longer than the animation.
- To add speaker notes, put `<aside class="notes">…</aside>` inside the slide. Pressing `N` shows the notes for the current slide.
- Animations are skipped to their final state when the browser requests reduced motion; keep final states readable without motion.

The font families are Google Fonts: Source Serif 4 (headings), IBM Plex Sans (body), and IBM Plex Mono (labels).

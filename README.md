# Animated HTML slides

A self-contained slide deck in one file (`index.html`), published with GitHub Pages.
Every push to `main` also rebuilds a PDF and an MP4 of the deck.

| URL | What |
|---|---|
| `https://<user>.github.io/<repo>/` | Live deck (→ / Space next, ← back, R replay, F fullscreen) |
| `https://<user>.github.io/<repo>/#4` | Opens on slide 4 |
| `https://<user>.github.io/<repo>/deck.pdf` | One page per slide, final animation state |
| `https://<user>.github.io/<repo>/deck.mp4` | Recorded walkthrough |

## Publish

1. Create a repository on GitHub and push this folder to `main`.
2. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Open the **Actions** tab and wait for "Publish slides" to finish (about 3 minutes).

## Work on it locally

Open `index.html` in a browser. Nothing to build.

To make the PDF or video on your own machine:

```sh
npm install playwright
npx playwright install chromium
node export-pdf.mjs     # -> deck.pdf
node record.mjs         # -> deck.webm, and deck.mp4 if ffmpeg is installed
```

## Add a slide

- Copy a `<section class="slide">` block in `index.html` and edit it.
- For an animation, add `data-anim="name"` to the section and an `anims.name(root)` function in the script.
  Set `root.dataset.finished = '1'` when it ends, so the PDF export knows when to capture it.
- `data-dur="5000"` sets how long the slide stays on screen in the recorded video.
# test-slides

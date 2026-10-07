# zprynne.github.io

My personal site. Plain HTML/CSS/JS, no build step. Hosted on GitHub Pages,
which serves straight from `main` (`.nojekyll` skips Jekyll processing).

Live at [zprynne.github.io](https://zprynne.github.io).

## Running locally

Open `index.html` directly, or serve it so relative paths behave like production:

```bash
python3 -m http.server 8080
```

## What's what

- `index.html` — the home page: about, projects, sidebar, footer buttons
- `resume.html` — renders `resume.pdf` inline with PDF.js (native PDF embeds don't work in Safari)
- `resume-src/` — LaTeX source for the resume
- `styles.css` — all styling; colors are CSS variables at the top
- `fx.js` — visit counter, sparkle trail, and stopping the marquee for reduced motion
- `assets/` — every image on the site (generated, see below)
- `assets-src/make_assets.py` — draws the assets: title, pixel pals, starfield,
  badges, dividers and 88x31 buttons

The look is a late-90s home page. The page works without JavaScript; `fx.js`
only adds extras. The "Last updated" line in the footer is updated by hand.

## Changing the images

Sprites and badges are defined as data in `assets-src/make_assets.py` (character
maps for pixel art, label text for buttons). Edit, then regenerate:

```bash
python3 -m venv .venv && .venv/bin/pip install pillow
.venv/bin/python assets-src/make_assets.py
```

It uses the macOS core web fonts in `/System/Library/Fonts/Supplemental`.
Animated GIFs get a still `.png` twin for visitors with "reduce motion" on.

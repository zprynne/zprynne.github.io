# zprynne.github.io

My personal site. Plain HTML/CSS/JS, no build step. Hosted on GitHub Pages,
which serves straight from `main` (`.nojekyll` skips Jekyll processing).

Live at [zprynne.github.io](https://zprynne.github.io).

## Running locally

Open `index.html` directly, or serve it so relative paths behave like production:

```bash
python3 -m http.server 8000
```

## What's what

- `index.html` — landing page: about, project cards
- `resume.html` — renders `resume.pdf` inline with PDF.js (native PDF embeds don't work in Safari)
- `resume-src/` — LaTeX source for the resume
- `styles.css` — all styling; theme colors are CSS variables at the top
- `script.js` — theme toggle, scroll-spy nav, footer year
- `matrix.js` — the digital-rain canvas background
- `pixel-art.js` — pixel sprites on the project cards, drawn from character maps

The site works with JS disabled; the scripts only add extras.

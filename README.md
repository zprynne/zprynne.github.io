# Personal Website

A fast, dependency-free personal site (about, projects, resume) built with plain
HTML, CSS, and JavaScript — designed to deploy straight to **GitHub Pages** with
no build step.

## Structure

| File | Purpose |
|------|---------|
| `index.html` | Home page: hero/about + projects gallery |
| `resume.html` | Resume page; "Download as PDF" uses the browser's print-to-PDF (see the print stylesheet inside the file) |
| `styles.css` | All styling; theme colors live in CSS variables at the top |
| `script.js` | Progressive enhancement: theme toggle, scroll-spy nav, footer year |
| `assets/` | Favicon and any images |
| `.nojekyll` | Tells GitHub Pages to serve files as-is (skip Jekyll processing) |

## Before you publish — replace the placeholders

Search the project for these and swap in your real values:

- `zprynne` → your GitHub username (links + repo URL)
- `Zach Prynne` → confirm spelling / preferred name
- Bio text in `index.html`, the three placeholder project cards, and all the
  `TODO` comments in `resume.html`

## Run locally

No tooling needed — just open `index.html` in a browser. For a closer match to
how it'll serve (so relative paths behave), run a tiny static server:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy to GitHub Pages

GitHub Pages serves a **user site** from a repo named exactly
`zprynne.github.io`. It will be live at `https://zprynne.github.io`.

```bash
# from this folder
git init
git add .
git commit -m "Initial personal site"

# create the repo named zprynne.github.io (replace zprynne), then:
git branch -M main
git remote add origin https://github.com/zprynne/zprynne.github.io.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Build and deployment → Source: Deploy from
a branch → Branch: `main` / `root`**. Give it a minute and your site is live.

> Tip: you can also use the GitHub CLI — `gh repo create zprynne.github.io --public --source=. --push`

## Making it "unique" later

Some directions that stay within plain HTML/CSS/JS:
- An interactive `<canvas>` background (particles, a generative grid).
- A fake terminal hero where visitors "type" commands to navigate.
- View Transitions API for smooth page-to-page animation.
- Render projects from a `projects.json` file with `fetch` (separates data from markup).

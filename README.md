# Personal Website — Emirhan Şimşek

A single-page personal site: apps, research, projects, background, and contact details.

## Stack

Plain HTML, CSS, and JavaScript. No build step, no dependencies, no framework — open
`index.html` in a browser and it runs.

```
index.html                  markup and all content
styles.css                  design tokens, layout, light/dark themes
script.js                   theme toggle, nav, scroll reveals, hero ink trail
assets/emirhan.jpg          hero portrait (cropped square, 720×720)
assets/icons/               App Store icons for the 7 published apps
Emirhan_Simsek_Resume.pdf   linked from the hero and the contact section
```

## Local preview

```bash
python -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly from the filesystem also works.

## Notes

- **Theme** follows the system preference and can be overridden with the toggle in the
  navigation; the choice is stored in `localStorage`.
- **Motion** — the hero canvas draws a fading ink trail that follows the pointer and wanders
  on its own when idle. It pauses when scrolled out of view and is disabled entirely under
  `prefers-reduced-motion`.
- **App data** (names, categories, links, icons) came from the iTunes lookup API for
  developer ID `1861446793`, so it matches the App Store listing exactly.

## Deploying to GitHub Pages

Push this folder to a GitHub repository, then in **Settings → Pages** set the source to
*Deploy from a branch*, branch `main`, folder `/ (root)`. The site is static, so nothing
else is required.

# FEAST MODE® — Turn Your Appetite Up.

An experimental, scroll-driven landing page for FEAST MODE, a fictional food and lifestyle brand.

## Stack
Static HTML, CSS and JavaScript. No build step.
- Motion: GSAP 3.12.5 + ScrollTrigger (self-hosted in `js/vendor/`)
- Type: Bowlby One SC, DM Sans, Instrument Serif (Google Fonts)

## Structure
```
index.html          all eight sections + footer
css/system.css      design tokens, nav, buttons, shared rules
css/sNN-*.css       one file per section
css/responsive.css  short-landscape overrides (loaded last)
js/system.js        shared runtime: boot order, nav jumps, steam, preloading
js/sNN-*.js         one file per section
assets/sNN/         optimised WebP images (shadows baked in)
vercel.json         caching + security headers
```

## Deploy (Vercel)
Import this repository in Vercel. Framework preset: **Other**. Build command: none. Output directory: `.` (root).
Every push to `main` redeploys automatically.

## Run locally
Any static server works, e.g. `npx serve .` then open http://localhost:3000.

# abediaz.md

The **Markdown edition** of [abediaz.ai](https://abediaz.ai) — the same core
profile, served as beautiful Markdown on a `.md` domain. The joke writes itself.

Live at **https://abediaz.md**

## How it works

- **`index.md`** is the single source of truth — the entire site is this one file.
- **`build.js`** renders `index.md` into a styled `index.html` (light + dark
  theme, GitHub-flavored Markdown look) and copies the raw `index.md` and
  `images/` into `_site/`.
- **GitHub Actions** (`.github/workflows/deploy.yml`) runs the build on every
  push to `main` and deploys `_site/` to GitHub Pages.

So one URL serves two things:

| Request | You get |
|---------|---------|
| `https://abediaz.md/` | the rendered HTML page |
| `https://abediaz.md/index.md` | the raw Markdown source |

> GitHub Pages is static and can't do `Accept`-header content negotiation, so the
> two formats live at two paths (`/` and `/index.md`) rather than one. To serve
> both from a single URL based on the request, you'd put a (free) Cloudflare
> Worker in front — see the bottom of this file.

## Editing the site

1. Edit `index.md`.
2. Commit and push to `main`.
3. The Action rebuilds and redeploys automatically (~1 min).

Preview locally:

```bash
npm install
npm run build
open _site/index.html
```

## DNS

`abediaz.md` is registered at register.domains and points at GitHub Pages via
apex `A` records:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

## Optional: true same-URL content negotiation

If you ever want `curl https://abediaz.md` to return raw Markdown while browsers
get HTML — all on the *same* URL — front the site with a free Cloudflare Worker
that inspects the `Accept` header (or `User-Agent`) and serves `/index.md` vs
`/` accordingly. Not needed for the current two-path setup.

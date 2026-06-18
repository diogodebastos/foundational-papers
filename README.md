# Foundational Papers

A single-page, browsable canon of ten foundational papers in computer science
and artificial intelligence (1936 → 2020), each linked straight to its original
source. Design direction: **"The Tape"** — the page is a continuous greenbar
line-printer sheet with tractor-feed sprocket gutters and a read/write head that
tracks the paper nearest the center of the viewport as you scroll, after Turing's
1936 machine that started the whole lineage.

Static site (HTML/CSS/JS, no build step), served from Cloudflare via Workers
Static Assets.

## Develop

```bash
npm install
npm run dev        # wrangler dev — serves ./public locally
```

Or open `public/index.html` directly in a browser.

## Deploy

```bash
npm run deploy     # wrangler deploy — publishes to *.workers.dev
```

### Continuous deployment

`.github/workflows/deploy.yml` deploys on every push to `main`. It needs two
repository secrets:

- `CLOUDFLARE_API_TOKEN` — a token with the **Workers Scripts: Edit** permission.
- `CLOUDFLARE_ACCOUNT_ID` — your Cloudflare account id.

```bash
gh secret set CLOUDFLARE_API_TOKEN
gh secret set CLOUDFLARE_ACCOUNT_ID
```

### Prefer Cloudflare Pages instead?

Swap the deploy step's command for:

```bash
wrangler pages deploy public --project-name=foundational-papers
```

(gives a `*.pages.dev` URL). Everything else is identical.

## Structure

```
public/
  index.html   all ten papers as static markup
  styles.css   "The Tape" — greenbar bands, sprocket gutters, type scale
  main.js      read/write head tracking (progressive enhancement)
  favicon.svg
wrangler.toml  Workers Static Assets config
```

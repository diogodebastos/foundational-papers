# Foundational Papers

A single-page, browsable canon of ten foundational papers in computer science
and artificial intelligence (1936 → 2020), each linked straight to its original
source. Design direction: **"The Tape"** — the page is a continuous greenbar
line-printer sheet with tractor-feed sprocket gutters and a read/write head that
tracks the paper nearest the center of the viewport as you scroll, after Turing's
1936 machine that started the whole lineage.

Static front end (HTML/CSS/JS, no build step) served from Cloudflare via a
Worker. Clicking a frame flips it to reveal the paper's PDF, embedded
same-origin through a small proxy in the Worker (`/paper/NN.pdf`) so sources
that block framing or are served over http can still be previewed inline. The
proxy only serves a fixed allowlist of the ten paper URLs — it is not an open
proxy.

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
  styles.css   "The Tape" — greenbar bands, sprocket gutters, flip cards
  main.js      head tracking + flip-to-PDF (progressive enhancement)
  favicon.svg
src/
  worker.js    serves assets + the allowlisted /paper/NN.pdf proxy
wrangler.toml  Worker entry (main) + static assets (ASSETS) config
```

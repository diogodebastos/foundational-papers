/* Foundational Papers — Worker
 *
 * Serves the static site (via the ASSETS binding) and proxies each paper's
 * PDF at /paper/NN.pdf. The proxy lets the cards embed the PDF on their back
 * face: it fetches the source server-side (no CORS/X-Frame-Options limits),
 * upgrades http sources to https, and returns the bytes same-origin with the
 * framing headers stripped. Targets are a fixed allowlist — never a URL from
 * the request — so this is not an open proxy.
 */

const PDFS = {
  "01": "https://www.cs.ox.ac.uk/activities/ieg/e-library/sources/tp2-ie.pdf",
  "02": "https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf",
  "03": "https://www.ling.upenn.edu/courses/cogs501/Rosenblatt1958.pdf",
  // "04" — Perceptrons is a book; no PDF to proxy (handled in the UI).
  "05": "https://lamport.azurewebsites.net/pubs/time-clocks.pdf",
  "06": "https://www.cs.toronto.edu/~hinton/absps/naturebp.pdf",
  "07": "http://infolab.stanford.edu/pub/papers/google.pdf",
  "08": "https://proceedings.neurips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf",
  "09": "https://arxiv.org/pdf/1706.03762",
  "10": "https://arxiv.org/pdf/2005.14165",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/paper\/(\d{2})\.pdf$/);
    if (match) return proxyPdf(match[1]);
    return env.ASSETS.fetch(request);
  },
};

async function proxyPdf(id) {
  const target = PDFS[id];
  if (!target) return new Response("Unknown paper", { status: 404 });

  let upstream;
  try {
    upstream = await fetch(target, {
      headers: {
        // Some academic hosts refuse default fetch agents; look like a browser.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept": "application/pdf,*/*",
      },
      redirect: "follow",
      cf: { cacheTtl: 86400, cacheEverything: true },
    });
  } catch (err) {
    return unavailable(target, "the source could not be reached");
  }

  if (!upstream.ok) {
    return unavailable(target, `the source returned ${upstream.status}`);
  }

  const headers = new Headers();
  const ct = upstream.headers.get("content-type") || "";
  headers.set("Content-Type", ct.includes("pdf") ? ct : "application/pdf");
  headers.set("Content-Disposition", `inline; filename="paper-${id}.pdf"`);
  headers.set("Cache-Control", "public, max-age=86400");
  headers.set("X-Content-Type-Options", "nosniff");
  // Fresh headers only — upstream X-Frame-Options / CSP are intentionally dropped.
  return new Response(upstream.body, { status: 200, headers });
}

/* Friendly same-origin fallback shown inside the card's iframe when a source
   can't be embedded (e.g. a host that blocks automated fetches). */
function unavailable(target, reason) {
  const safe = target.replace(/"/g, "%22");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root { color-scheme: light; }
  html,body { height:100%; margin:0; }
  body { display:grid; place-content:center; gap:1rem; padding:2rem;
    background:#FAFAF4; color:#1B1D1A; text-align:center;
    font-family:"IBM Plex Mono", ui-monospace, monospace; }
  p { margin:0; max-width:34ch; line-height:1.5; font-size:.9rem; color:#5E6760; }
  a { display:inline-block; color:#1E4D6B; text-decoration:none;
    padding:.5rem .9rem; border:1px solid #C7CEC2; }
  a:hover { color:#D34E2A; border-color:#D34E2A; }
</style></head><body>
  <p>This paper can't be previewed inline — ${reason}.</p>
  <a href="${safe}" target="_blank" rel="noopener">Open the original&nbsp;↗</a>
</body></html>`;
  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

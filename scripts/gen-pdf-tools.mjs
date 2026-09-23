#!/usr/bin/env node
/**
 * One-off generator for the PDF suite: emits tools/<slug>.html from the specs in
 * scripts/pdf-specs/.
 *
 * Sibling of gen-fun-tools.mjs, and the same argument applies — fifteen pages
 * share one skeleton, and hand-copying it fifteen times is how the ts:header /
 * ts:footer markers end up subtly different on page nine and sync-chrome
 * silently skips it.
 *
 * Two things differ from the fun generator:
 *
 *   - The breadcrumb points at the PDF Tools category rather than Fun & Games.
 *   - Every page loads assets/tools/pdf-shared.js before its own module, and an
 *     optional third script (the rasteriser or the image builder) for the tools
 *     that are thin wrappers over a shared engine.
 *
 * The emitted HTML is the artifact; this script is not part of the site.
 */
import { readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SPEC_DIR = path.join(HERE, 'pdf-specs');

/* Spec strings are plain text. esc() makes them safe as HTML text nodes, and
 * rich() additionally turns **bold** into the same <strong> the rest of the
 * site uses and `backticks` into <code>, so copy can name a button or a
 * generated filename without hand-writing markup in the spec — which would then
 * have leaked unescaped into the JSON-LD. */
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function rich(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-gray-200">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="text-gray-300">$1</code>');
}

/* JSON-LD is built with JSON.stringify rather than string templates so quotes
 * and apostrophes in the copy cannot produce invalid JSON. The FAQ answers are
 * the same strings the visible FAQ renders, which is what keeps the two in
 * sync. */
function ld(obj) {
  return JSON.stringify(obj, null, 2).replace(/<\//g, '<\\/');
}

const BRAND_CONFIG = `    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#FFFBEB',
              100: '#FEF3C7',
              200: '#FDE68A',
              300: '#FCD34D',
              400: '#FBBF24',
              500: '#F59E0B',
              600: '#D97706',
              700: '#B45309',
              800: '#92400E',
              900: '#78350F',
            }
          }
        }
      }
    }`;

/**
 * The head chrome sync-chrome owns. Written here verbatim so a freshly
 * generated page passes `toolstack.mjs check` before sync-chrome has ever run
 * against it — the markers are the contract, and a page missing them is a page
 * sync-chrome would silently skip.
 */
const HEAD_BLOCK = `  <!-- HilltopAds site verification. The matching file at the repo root
       (67aa66b566ade2fd4cc31615498bb9668d3e7a39.txt) proves the same ownership
       to their crawler; both are required. -->
  <meta name="67aa66b566ade2fd4cc31615498bb9668d3e7a39" content="67aa66b566ade2fd4cc31615498bb9668d3e7a39" />
  <!-- Referrer policy, declared explicitly rather than left to the browser
       default: HilltopAds asks for it, and the value is the conservative one —
       the full referrer for same-origin and same-scheme requests, nothing at
       all when the destination is plain HTTP. -->
  <meta name="referrer" content="no-referrer-when-downgrade" />

  <!-- Theme, applied before first paint so the page never flashes the wrong
       palette. Light — the magenta poster — is the default for a first-time
       visitor; only someone who has explicitly picked dark gets dark. -->
  <style>
    /* Paint the canvas in the theme's own colour before any stylesheet has
       loaded. Without this the browser shows its default white canvas (or, on
       a dark OS, a black one) for the first frames, which is the flash this
       whole block exists to prevent. color-scheme does the same for the
       scrollbar and for the controls the browser paints itself. */
    html:not(.dark) { background-color: #BE123C; color-scheme: light; }
    html.dark       { background-color: #030712; color-scheme: dark; }
  </style>
  <script>
    (function () {
      try {
        if (localStorage.getItem('theme') === 'dark') {
          document.documentElement.classList.add('dark');
        }
      } catch (e) {}
    })();
  </script>`;

function page(t) {
  const url = `https://toolstackai.xyz/tools/${t.slug}.html`;
  const appCategory = t.appCategory || 'UtilitiesApplication';

  const softwareApp = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: t.name,
    url,
    applicationCategory: appCategory,
    operatingSystem: 'Any (browser-based)',
    description: t.desc,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'ToolStack AI', url: 'https://toolstackai.xyz/' }
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: t.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  };

  const steps = t.how.map((s) => `        <li>${rich(s)}</li>`).join('\n');

  const cases = t.cases
    .map(
      (c) => `        <li class="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <p class="font-bold text-gray-200 text-xs mb-1">${esc(c.t)}</p>
          <p class="text-gray-400 leading-relaxed text-xs">${esc(c.d)}</p>
        </li>`
    )
    .join('\n');

  const faqHtml = t.faqs
    .map(
      (f) => `        <details class="ts-faq bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <summary class="text-sm font-bold text-gray-200">${esc(f.q)}</summary>
          <p class="text-sm text-gray-400 leading-relaxed mt-3">${esc(f.a)}</p>
        </details>`
    )
    .join('\n');

  const whatParas = t.what.map((p) => `        <p>\n          ${rich(p)}\n        </p>`).join('\n');

  /* Cross-links between the PDF tools. Kept in the spec so a new tool can join
   * the cluster without editing four other pages by hand. */
  const related = (t.related || [])
    .map(
      (r) => `        <a href="/tools/${r.slug}.html" class="bg-gray-900/60 border border-gray-800 hover:border-brand-500/50 rounded-xl p-4 transition">
          <p class="font-bold text-gray-200 text-sm">${esc(r.name)}</p>
          <p class="text-xs text-gray-400 mt-1 leading-relaxed">${esc(r.d)}</p>
        </a>`
    )
    .join('\n');

  const relatedBlock = related
    ? `
    <div>
      <h2 class="text-xl font-bold text-gray-100 mb-3">Related PDF tools</h2>
      <div class="grid sm:grid-cols-2 gap-3">
${related}
      </div>
    </div>
`
    : '';

  const extraScripts = (t.scripts || [])
    .map((s) => `<script src="../assets/tools/${s}.js"></script>\n`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-99MBFTP4YT"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-99MBFTP4YT');
  </script>

  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="monetag" content="7f7f91a68ceeb8c570d03c62a10dd555" />

  <!-- ts:head:start -->
${HEAD_BLOCK}
<!-- ts:head:end -->

  <title>${esc(t.title)}</title>
  <meta name="description" content="${esc(t.desc)}" />
  <link rel="canonical" href="${url}" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="ToolStack AI" />
  <meta property="og:title" content="${esc(t.title)}" />
  <meta property="og:description" content="${esc(t.desc)}" />
  <meta property="og:url" content="${url}" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${esc(t.title)}" />
  <meta name="twitter:description" content="${esc(t.desc)}" />

  <!-- The PDF engines come from jsDelivr. Preconnecting shaves a round trip off
       the first tool that needs one, and costs nothing on the pages that never
       do — the browser drops an idle preconnect on its own. -->
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />

  <script src="https://cdn.tailwindcss.com"></script>
  <script>
${BRAND_CONFIG}
  </script>
  <link rel="stylesheet" href="../assets/toolstack.css" />

  <script type="application/ld+json">
${ld(softwareApp)}
  </script>

  <!-- Keep this in sync with the visible FAQ section further down. -->
  <script type="application/ld+json">
${ld(faqPage)}
  </script>
</head>
<body class="bg-gray-950 text-gray-100 min-h-screen transition-colors duration-200">

<!-- ts:header:start -->
<!-- Stamped by \`node scripts/toolstack.mjs sync-chrome\` from partials/header.html. -->
<!-- ts:header:end -->

<main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

  <nav class="text-xs text-gray-500 mb-5" aria-label="Breadcrumb">
    <a href="/" class="hover:text-brand-400 transition">Home</a>
    <span class="mx-1.5 text-gray-700">/</span>
    <a href="/?category=pdf" class="hover:text-brand-400 transition">PDF Tools</a>
    <span class="mx-1.5 text-gray-700">/</span>
    <span class="text-gray-300">${esc(t.name)}</span>
  </nav>

  <h1 class="text-3xl sm:text-4xl font-black tracking-tight text-gray-50">${esc(t.name)}</h1>
  <p class="text-sm text-gray-400 mt-3 leading-relaxed">
    ${rich(t.tagline)}
  </p>

  <!-- Tool widget. Ids here are the contract with assets/tools/${t.slug}.js. -->
  <section id="toolRoot" class="mt-7 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">${t.widget}
  </section>

  <!-- ---------------------------------------------------------------- copy -->

  <section class="mt-12 space-y-10">
    <div>
      <h2 class="text-xl font-bold text-gray-100 mb-3">What this tool does</h2>
      <div class="space-y-3 text-sm text-gray-400 leading-relaxed">
${whatParas}
      </div>
    </div>

    <div>
      <h2 class="text-xl font-bold text-gray-100 mb-3">How to use it</h2>
      <ol class="space-y-3 text-sm text-gray-400 leading-relaxed list-decimal list-inside marker:text-brand-500 marker:font-bold">
${steps}
      </ol>
    </div>

    <div>
      <h2 class="text-xl font-bold text-gray-100 mb-3">Common use cases</h2>
      <ul class="grid sm:grid-cols-2 gap-3 text-sm">
${cases}
      </ul>
    </div>

    <div>
      <h2 class="text-xl font-bold text-gray-100 mb-3">Frequently asked questions</h2>
      <div class="space-y-3">
${faqHtml}
      </div>
    </div>
${relatedBlock}  </section>

</main>

<!-- ts:footer:start -->
<!-- Stamped by \`node scripts/toolstack.mjs sync-chrome\` from partials/footer.html. -->
<!-- ts:footer:end -->

<script src="../assets/toolstack.js"></script>
<script src="../assets/tools/pdf-shared.js"></script>
${extraScripts}<script src="../assets/tools/${t.slug}.js"></script>
<script>
  (function () {
    var root = document.getElementById('toolRoot');
    if (root && window.ToolStackTools) {
      window.ToolStackTools.${t.create}(root);
    }
  })();
</script>

</body>
</html>
`;
}

const specs = [];
for (const f of readdirSync(SPEC_DIR).filter((f) => f.endsWith('.mjs') && !f.startsWith('_')).sort()) {
  const mod = await import(path.join(SPEC_DIR, f));
  specs.push(...mod.default);
}

const seen = new Set();
let written = 0;
for (const t of specs) {
  if (!t.slug || !t.name || !t.widget || !t.create || !t.faqs || !t.how || !t.cases || !t.what) {
    throw new Error(`spec "${t.slug || '?'}" is missing required fields`);
  }
  if (seen.has(t.slug)) throw new Error(`duplicate slug: ${t.slug}`);
  seen.add(t.slug);
  writeFileSync(path.join(ROOT, 'tools', `${t.slug}.html`), page(t));
  written++;
}

for (const t of specs) console.log(`${t.slug}\t${t.name}`);
console.log(`\nwrote ${written} pages`);

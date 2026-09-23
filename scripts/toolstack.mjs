#!/usr/bin/env node
/**
 * ToolStack AI — repo maintenance.
 *
 *   node scripts/toolstack.mjs sync-chrome
 *       Stamp partials/header.html and partials/footer.html into every page
 *       (index.html and tools/*.html), stamp the shared <head> chrome — the
 *       pre-paint theme bootstrap and the ad-network verification metas — and
 *       make sure the verification file exists at the site root. Idempotent:
 *       it only ever rewrites the region between the ts:head / ts:header /
 *       ts:footer markers, so running it twice is a no-op.
 *
 *   node scripts/toolstack.mjs new-tool <slug> --name "..." --desc "..."
 *       Scaffold tools/<slug>.html from tools/_template.html, stamp the chrome,
 *       and register the URL in sitemap.xml.
 *
 *   node scripts/toolstack.mjs check
 *       Structural checks over every page — theme default, chrome markers, the
 *       ad-network metas — plus `node --check` on the shipped JavaScript and the
 *       scripts in here. Exits non-zero on failure.
 *
 * There is no build step at serve time — the HTML in the repo is the HTML that
 * ships. This script exists so the shared chrome has exactly one source of
 * truth without introducing a bundler.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PARTIALS = join(ROOT, 'partials');
const TOOLS_DIR = join(ROOT, 'tools');
const SITE = 'https://toolstackai.xyz';

const HEAD_START = '<!-- ts:head:start -->';
const HEAD_END = '<!-- ts:head:end -->';
const HEADER_START = '<!-- ts:header:start -->';
const HEADER_END = '<!-- ts:header:end -->';
const FOOTER_START = '<!-- ts:footer:start -->';
const FOOTER_END = '<!-- ts:footer:end -->';

/**
 * The palette a first-time visitor gets. The markup is written dark-first
 * (`bg-gray-950` everywhere), so <html class="dark"> is what switches the light
 * theme OFF — leaving the attribute off is what makes the magenta poster the
 * default. Someone who has explicitly picked dark gets it back from the inline
 * snippet below, which runs before first paint.
 */
const HTML_OPEN_DARK = '<html lang="en" class="dark">';
const HTML_OPEN_LIGHT = '<html lang="en">';

/**
 * Shared <head> chrome, stamped between the ts:head markers.
 *
 * Two things live here because both must be byte-identical on all 80 pages and
 * both are silent when they drift: the pre-paint theme bootstrap (which decides
 * whether the first painted frame is magenta or near-black) and the HilltopAds
 * ownership metas (which either verify the site or do not).
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

/**
 * HilltopAds ownership file. Generated rather than committed by hand for the
 * same reason as the metas above: the site either has both or is unverified.
 */
const VERIFY_FILE = '67aa66b566ade2fd4cc31615498bb9668d3e7a39.txt';
const VERIFY_CONTENT = '1615498bb9668d3e7a39';

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Every page that carries the shared chrome. */
function pages() {
  const list = ['index.html'];
  if (existsSync(TOOLS_DIR)) {
    for (const f of readdirSync(TOOLS_DIR).sort()) {
      if (f.endsWith('.html') && !f.startsWith('_')) list.push(`tools/${f}`);
    }
  }
  return list;
}

/**
 * Replace the marked region with `content`; adopt a legacy element if no
 * markers exist yet; otherwise insert fresh at `insertAfter`.
 */
function stamp(html, start, end, content, { adopt, insertAfter } = {}) {
  const block = `${start}\n${content.trimEnd()}\n${end}`;
  const marked = new RegExp(`${escapeRe(start)}[\\s\\S]*?${escapeRe(end)}`);

  if (marked.test(html)) return { html: html.replace(marked, () => block), how: 'markers' };

  if (adopt) {
    const re = new RegExp(adopt);
    if (re.test(html)) return { html: html.replace(re, () => block), how: 'adopted' };
  }

  if (insertAfter && html.includes(insertAfter)) {
    const i = html.indexOf(insertAfter) + insertAfter.length;
    return {
      html: `${html.slice(0, i)}\n\n${block}\n${html.slice(i)}`,
      how: 'inserted',
    };
  }

  throw new Error('no marker, no adoptable element, and no insertion anchor');
}

function syncChrome() {
  const header = readFileSync(join(PARTIALS, 'header.html'), 'utf8');
  const footer = readFileSync(join(PARTIALS, 'footer.html'), 'utf8');

  for (const rel of pages()) {
    const path = join(ROOT, rel);
    let html = readFileSync(path, 'utf8');
    const before = html;

    const d = stamp(html, HEAD_START, HEAD_END, HEAD_BLOCK, {
      // The pre-marker pages carried the theme bootstrap as a comment + script
      // right after the monetag meta; that pair is what gets adopted.
      adopt: '<!-- Theme, applied before first paint[\\s\\S]*?</script>',
      insertAfter: '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    });
    html = d.html;

    // <html class="dark"> sits above the marked region, so it is a plain swap
    // rather than part of the stamped block. Idempotent: once it is gone,
    // there is nothing left to replace.
    html = html.replace(HTML_OPEN_DARK, HTML_OPEN_LIGHT);

    const h = stamp(html, HEADER_START, HEADER_END, header, {
      adopt: '<header[\\s\\S]*?</header>',
      insertAfter: '<body class="bg-gray-950 text-gray-100 min-h-screen transition-colors duration-200">',
    });
    html = h.html;

    const f = stamp(html, FOOTER_START, FOOTER_END, footer, {
      adopt: '<footer[\\s\\S]*?</footer>',
      insertAfter: '</main>',
    });
    html = f.html;

    if (html === before) {
      console.log(`  = ${rel} (already in sync)`);
    } else {
      writeFileSync(path, html);
      console.log(`  ~ ${rel} (head: ${d.how}, header: ${h.how}, footer: ${f.how})`);
    }
  }

  ensureVerificationFile();
}

/**
 * The ownership file HilltopAds fetches. Written without a trailing newline so
 * the bytes match the token exactly, however the verifier compares them.
 */
function ensureVerificationFile() {
  const path = join(ROOT, VERIFY_FILE);
  if (existsSync(path) && readFileSync(path, 'utf8') === VERIFY_CONTENT) {
    console.log(`  = ${VERIFY_FILE} (already present)`);
    return;
  }
  writeFileSync(path, VERIFY_CONTENT);
  console.log(`  ~ ${VERIFY_FILE}`);
}

/**
 * Structural checks over every page, plus `node --check` on the JavaScript the
 * site ships. There is no test runner here and no build step to hang one off,
 * so this is deliberately a script rather than a suite: it answers the one
 * question that matters before a push — did anything drift out of the shape the
 * rest of the site assumes? Exits non-zero on the first failure so a pre-push
 * hook can use it directly.
 */
function check() {
  const failures = [];

  for (const rel of pages()) {
    const html = readFileSync(join(ROOT, rel), 'utf8');
    const fail = (msg) => failures.push(`${rel}: ${msg}`);

    if (html.includes(HTML_OPEN_DARK)) {
      fail('<html> still carries class="dark"; light is the default theme');
    } else if (!html.includes(HTML_OPEN_LIGHT)) {
      fail('missing <html lang="en">');
    }

    for (const [label, marker] of [
      ['ts:head', HEAD_START],
      ['ts:header', HEADER_START],
      ['ts:footer', FOOTER_START],
    ]) {
      const opens = html.split(marker).length - 1;
      if (opens !== 1) fail(`${label} marker appears ${opens}×, expected exactly 1`);
    }

    if (!html.includes(`name="${VERIFY_FILE.replace(/\.txt$/, '')}"`)) {
      fail('missing the HilltopAds verification meta');
    }
    if (!html.includes('<meta name="referrer" content="no-referrer-when-downgrade" />')) {
      fail('missing the referrer meta');
    }
  }

  // The verification file is compared byte for byte: a trailing newline added
  // by an editor is enough for their crawler to stop recognising it.
  const verifyPath = join(ROOT, VERIFY_FILE);
  if (!existsSync(verifyPath)) {
    failures.push(`${VERIFY_FILE}: missing`);
  } else {
    const body = readFileSync(verifyPath, 'utf8');
    if (body !== VERIFY_CONTENT) {
      failures.push(`${VERIFY_FILE}: contents differ from the expected token`);
    }
  }

  // Syntax only — `--check` parses without executing, so a tool module that
  // expects a live DOM is fine here.
  const js = [join(ROOT, 'assets', 'toolstack.js')];
  const toolsJsDir = join(ROOT, 'assets', 'tools');
  if (existsSync(toolsJsDir)) {
    for (const f of readdirSync(toolsJsDir).sort()) {
      if (f.endsWith('.js')) js.push(join(toolsJsDir, f));
    }
  }
  for (const f of ['scripts/toolstack.mjs', 'scripts/gen-fun-tools.mjs', 'scripts/gen-pdf-tools.mjs']) {
    js.push(join(ROOT, f));
  }

  // The page specs are data files, but they are JavaScript data files — a stray
  // backtick in one of them is a syntax error that would otherwise only surface
  // the next time someone runs the generator.
  const specsDir = join(ROOT, 'scripts', 'pdf-specs');
  if (existsSync(specsDir)) {
    for (const f of readdirSync(specsDir).sort()) {
      if (f.endsWith('.mjs')) js.push(join(specsDir, f));
    }
  }

  for (const file of js) {
    try {
      execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
    } catch (err) {
      const detail = String(err.stderr || err.message).split('\n').slice(0, 3).join(' ').trim();
      failures.push(`${file.slice(ROOT.length + 1)}: ${detail}`);
    }
  }

  if (failures.length) {
    for (const f of failures) console.error(`  ✗ ${f}`);
    console.error(`\n${failures.length} check(s) failed`);
    process.exit(1);
  }
  console.log(`  ✓ ${pages().length} pages, ${js.length} scripts — all checks passed`);
}

function addToSitemap(slug) {
  const path = join(ROOT, 'sitemap.xml');
  let xml = readFileSync(path, 'utf8');
  const loc = `${SITE}/tools/${slug}.html`;

  if (xml.includes(`<loc>${loc}</loc>`)) {
    console.log(`  = sitemap.xml (${slug} already listed)`);
    return;
  }

  const entry = [
    '  <url>',
    `    <loc>${loc}</loc>`,
    '    <lastmod>' + new Date().toISOString().slice(0, 10) + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
    '',
  ].join('\n');

  xml = xml.replace('</urlset>', () => `${entry}</urlset>`);
  writeFileSync(path, xml);
  console.log(`  ~ sitemap.xml (added ${slug})`);
}

function newTool(args) {
  const slug = args[0];
  if (!slug || slug.startsWith('-')) {
    console.error('usage: new-tool <slug> --name "Tool Name" --desc "Meta description"');
    process.exit(1);
  }

  const flag = (name, fallback) => {
    const i = args.indexOf(`--${name}`);
    return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
  };

  const name = flag('name', slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
  const desc = flag('desc', `${name} — a free browser-based tool from ToolStack AI.`);

  const outPath = join(TOOLS_DIR, `${slug}.html`);
  if (existsSync(outPath)) {
    console.error(`refusing to overwrite existing tools/${slug}.html`);
    process.exit(1);
  }

  const template = readFileSync(join(TOOLS_DIR, '_template.html'), 'utf8');
  const html = template
    .replaceAll('{{TOOL_SLUG}}', slug)
    .replaceAll('{{TOOL_NAME}}', name)
    .replaceAll('{{TOOL_DESCRIPTION}}', desc)
    .replaceAll('{{TOOL_CAMEL}}', slug.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase()));

  writeFileSync(outPath, html);
  console.log(`  + tools/${slug}.html`);
  console.log(`  ! still to do: assets/tools/${slug}.js, a ToolStack.TOOLS entry, and real copy`);
}

const [cmd, ...rest] = process.argv.slice(2);

switch (cmd) {
  case 'sync-chrome':
    console.log('syncing shared chrome...');
    syncChrome();
    break;
  case 'check':
    console.log('checking...');
    check();
    break;
  case 'new-tool':
    newTool(rest);
    addToSitemap(rest[0]);
    syncChrome();
    break;
  default:
    console.log('usage: node scripts/toolstack.mjs <sync-chrome|check|new-tool>');
    process.exit(cmd ? 1 : 0);
}

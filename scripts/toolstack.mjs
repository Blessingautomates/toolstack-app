#!/usr/bin/env node
/**
 * ToolStack AI — repo maintenance.
 *
 *   node scripts/toolstack.mjs sync-chrome
 *       Stamp partials/header.html and partials/footer.html into every page
 *       (index.html and tools/*.html). Idempotent: it only ever rewrites the
 *       region between the ts:header / ts:footer markers, so running it twice
 *       is a no-op.
 *
 *   node scripts/toolstack.mjs new-tool <slug> --name "..." --desc "..."
 *       Scaffold tools/<slug>.html from tools/_template.html, stamp the chrome,
 *       and register the URL in sitemap.xml.
 *
 * There is no build step at serve time — the HTML in the repo is the HTML that
 * ships. This script exists so the shared chrome has exactly one source of
 * truth without introducing a bundler.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PARTIALS = join(ROOT, 'partials');
const TOOLS_DIR = join(ROOT, 'tools');
const SITE = 'https://toolstackai.xyz';

const HEADER_START = '<!-- ts:header:start -->';
const HEADER_END = '<!-- ts:header:end -->';
const FOOTER_START = '<!-- ts:footer:start -->';
const FOOTER_END = '<!-- ts:footer:end -->';

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
      console.log(`  ~ ${rel} (header: ${h.how}, footer: ${f.how})`);
    }
  }
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
  case 'new-tool':
    newTool(rest);
    addToSitemap(rest[0]);
    syncChrome();
    break;
  default:
    console.log('usage: node scripts/toolstack.mjs <sync-chrome|new-tool>');
    process.exit(cmd ? 1 : 0);
}

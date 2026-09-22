/**
 * ToolStack AI — Sitemap.xml Generator engine.
 *
 * Turns a list of URLs (one per line) into a sitemap.xml file, with optional
 * lastmod, changefreq and priority applied to every entry.
 *
 * Ids required in tools/sitemap-generator.html:
 *   smInput, smLastmod, smChangefreq, smPriority, smGenerate, smCopy,
 *   smExample, smClear, smStatus, smResults, smStats, smWarnings,
 *   smErrorsWrap, smErrors, smOutput
 *
 * Two deliberate choices worth knowing about:
 *
 * 1. Validation is shallow on purpose — http/https plus a hostname containing a
 *    dot. Anything stricter rejects URLs that are perfectly valid; anything
 *    looser writes junk that a search engine will reject later. Lines that fail
 *    are reported rather than dropped silently.
 *
 * 2. Every value is XML-escaped. A raw `&` in a query string is the single most
 *    common way a hand-written sitemap stops being well-formed XML, and the
 *    failure is invisible until a crawler refuses the file.
 *
 * Advisory only: Google ignores changefreq and priority entirely, and nothing
 * here knows whether a URL actually resolves — this tool does not crawl.
 */
(function (window, document) {
  'use strict';

  function createSitemapGenerator(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var input = $('smInput');
    var lastmodEl = $('smLastmod');
    var changefreqEl = $('smChangefreq');
    var priorityEl = $('smPriority');
    var output = $('smOutput');
    var results = $('smResults');
    var statsEl = $('smStats');
    var warningsEl = $('smWarnings');
    var errorsWrap = $('smErrorsWrap');
    var errorsEl = $('smErrors');

    if (!input || !output || !results) return null;

    var STATUS = {
      ok: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      info: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      warn: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      error: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    };

    var statusEl = $('smStatus');
    var statusTimer = null;

    function showStatus(message, kind) {
      if (!statusEl) return;
      var tone = STATUS[kind] || STATUS.info;
      var keys = Object.keys(STATUS);
      for (var i = 0; i < keys.length; i++) {
        statusEl.classList.remove.apply(statusEl.classList, STATUS[keys[i]].split(' '));
      }
      statusEl.classList.add.apply(statusEl.classList, tone.split(' '));
      statusEl.textContent = message;
      statusEl.classList.remove('hidden');
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // XML has five predefined entities and no others. Ampersand first, or the
    // escaping of the other four would be escaped a second time.
    function xmlEscape(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    }

    /**
     * Split the textarea into usable URLs, collecting everything that was
     * rejected. Nothing is ever dropped silently: a line the tool refuses is a
     * line the user needs to see, or they will upload a sitemap that is quietly
     * missing pages.
     */
    function parseUrls(text) {
      var lines = String(text || '').split(/\r?\n/);
      var urls = [];
      var errors = [];
      var seen = {};
      var duplicates = 0;

      for (var i = 0; i < lines.length; i++) {
        var raw = lines[i];
        var line = raw.replace(/^\s+|\s+$/g, '');
        if (line === '') continue;

        // A fragment never identifies anything to a crawler, so it is stripped
        // rather than escaped: two URLs differing only by #anchor are one page.
        line = line.replace(/#.*$/, '');
        if (line === '') {
          errors.push({ line: i + 1, value: raw, reason: 'line is not a URL' });
          continue;
        }

        if (!/^https?:\/\//i.test(line)) {
          errors.push({ line: i + 1, value: raw, reason: 'not an absolute URL' });
          continue;
        }

        var host = line.replace(/^https?:\/\//i, '').split(/[\/?#]/)[0];
        if (host.indexOf('.') === -1) {
          errors.push({ line: i + 1, value: raw, reason: 'missing hostname' });
          continue;
        }

        if (seen[line] === true) {
          duplicates++;
          continue;
        }
        seen[line] = true;
        urls.push(line);
      }

      return { urls: urls, errors: errors, duplicates: duplicates };
    }

    /**
     * lastmod, changefreq and priority are omitted entirely when unset. An empty
     * <lastmod></lastmod> is not the same as an absent one — a validator reads
     * the empty element as a malformed date.
     */
    function buildSitemap(urls, lastmod, changefreq, priority) {
      var out = [];
      out.push('<?xml version="1.0" encoding="UTF-8"?>');
      out.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

      for (var i = 0; i < urls.length; i++) {
        out.push('  <url>');
        out.push('    <loc>' + xmlEscape(urls[i]) + '</loc>');
        if (lastmod) out.push('    <lastmod>' + xmlEscape(lastmod) + '</lastmod>');
        if (changefreq) out.push('    <changefreq>' + xmlEscape(changefreq) + '</changefreq>');
        if (priority) out.push('    <priority>' + xmlEscape(priority) + '</priority>');
        out.push('  </url>');
      }

      out.push('</urlset>');
      return out.join('\n');
    }

    function tile(label, value) {
      return '<div class="bg-gray-950 border border-gray-800 rounded-xl p-3">' +
        '<p class="text-[10px] uppercase tracking-wider text-gray-500 font-bold">' + escapeHtml(label) + '</p>' +
        '<p class="text-lg font-black text-gray-100 mt-1">' + escapeHtml(value) + '</p>' +
        '</div>';
    }

    function warning(text) {
      return '<p class="p-3 rounded-xl text-xs font-medium border ' + STATUS.warn + '">' +
        escapeHtml(text) + '</p>';
    }

    /**
     * Byte length, not character count. The 50 MB protocol limit is bytes on the
     * wire, and a URL with percent-encoded characters or an accented path is
     * longer in bytes than in UTF-16 code units.
     */
    function utf8Bytes(str) {
      var bytes = 0;
      for (var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        if (code < 0x80) {
          bytes += 1;
        } else if (code < 0x800) {
          bytes += 2;
        } else if (code >= 0xD800 && code <= 0xDBFF) {
          bytes += 4;
          i++;
        } else {
          bytes += 3;
        }
      }
      return bytes;
    }

    function formatBytes(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function render() {
      var parsed = parseUrls(input.value);
      var urls = parsed.urls;

      if (urls.length === 0 && parsed.errors.length === 0) {
        results.classList.add('hidden');
        showStatus('Paste at least one URL, one per line. Absolute addresses only — https://example.com/page.', 'info');
        return;
      }

      var lastmod = lastmodEl ? lastmodEl.value : '';
      var changefreq = changefreqEl ? changefreqEl.value : '';
      var priority = priorityEl ? priorityEl.value : '';

      var xml = buildSitemap(urls, lastmod, changefreq, priority);
      var bytes = utf8Bytes(xml);

      output.textContent = xml;

      statsEl.innerHTML =
        tile('URLs', String(urls.length)) +
        tile('Skipped lines', String(parsed.errors.length)) +
        tile('File size', formatBytes(bytes));

      var notes = [];
      if (parsed.duplicates === 1) {
        notes.push('1 duplicate URL was removed.');
      } else if (parsed.duplicates > 1) {
        notes.push(parsed.duplicates + ' duplicate URLs were removed.');
      }
      if (urls.length > 50000) {
        notes.push('More than 50,000 URLs. The protocol caps one file at 50,000 URLs and 50 MB: split it and publish a sitemap index listing the parts.');
      }
      if (bytes > 50 * 1024 * 1024) {
        notes.push('This file is over 50 MB uncompressed, which search engines reject.');
      }
      if (changefreq || priority) {
        notes.push('changefreq and priority are ignored by Google. They are valid protocol elements other crawlers may read, so keep them only if you have a reason to.');
      }
      if (!lastmod) {
        notes.push('No lastmod is set, so the urls carry no date. That is a perfectly valid sitemap — and safer than stamping today’s date on pages that did not change.');
      }

      var notesHtml = '';
      for (var n = 0; n < notes.length; n++) notesHtml += warning(notes[n]);
      warningsEl.innerHTML = notesHtml;

      if (parsed.errors.length > 0) {
        var items = '';
        for (var e = 0; e < parsed.errors.length; e++) {
          var item = parsed.errors[e];
          items += '<li class="p-3 rounded-xl text-xs border ' + STATUS.error + '">' +
            'Line ' + item.line + ': “' + escapeHtml(item.value) + '” — ' +
            escapeHtml(item.reason) + '</li>';
        }
        errorsEl.innerHTML = items;
        errorsWrap.classList.remove('hidden');
      } else {
        errorsEl.innerHTML = '';
        errorsWrap.classList.add('hidden');
      }

      results.classList.remove('hidden');

      var actions = root.querySelector('[data-ts-result-actions]');
      if (actions && window.ToolStack && window.ToolStack.reveal) {
        window.ToolStack.reveal(actions);
      }

      if (parsed.errors.length > 0) {
        showStatus(parsed.errors.length + ' line' + (parsed.errors.length === 1 ? ' was' : 's were') +
          ' skipped. Fix them below, or the sitemap will be missing those pages.', 'warn');
      } else {
        showStatus('Sitemap built from ' + urls.length + ' URL' + (urls.length === 1 ? '' : 's') +
          '. Save it as sitemap.xml at your site root.', 'ok');
      }
    }

    /* ------------------------------------------------------------- wiring */

    // The last entry carries an ampersand on purpose: it is the case that breaks
    // hand-written sitemaps, and the example should show it handled.
    var EXAMPLE = [
      'https://example.com/',
      'https://example.com/about',
      'https://example.com/pricing',
      'https://example.com/blog/seo-checklist',
      'https://example.com/search?q=free+tools&page=2'
    ].join('\n');

    function copyText(text, done) {
      if (window.ToolStack && window.ToolStack.copyText) {
        window.ToolStack.copyText(text, done);
        return;
      }
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.top = '-1000px';
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (err) {
        ok = false;
      }
      document.body.removeChild(area);
      done(ok);
    }

    var copyBtn = $('smCopy');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var xml = output.textContent;
        if (!xml) {
          showStatus('Nothing to copy yet — add some URLs first.', 'warn');
          return;
        }
        var original = copyBtn.textContent;
        copyText(xml, function (ok) {
          copyBtn.textContent = ok ? '✅ Copied!' : 'Copy failed';
          window.setTimeout(function () { copyBtn.textContent = original; }, 2000);
          if (!ok) showStatus('Copy failed — select the XML above and copy it manually.', 'error');
        });
      });
    }

    var generateBtn = $('smGenerate');
    if (generateBtn) generateBtn.addEventListener('click', render);

    var exampleBtn = $('smExample');
    if (exampleBtn) {
      exampleBtn.addEventListener('click', function () {
        input.value = EXAMPLE;
        if (lastmodEl) lastmodEl.value = '';
        if (changefreqEl) changefreqEl.value = '';
        if (priorityEl) priorityEl.value = '';
        render();
        showStatus('Example loaded — including a URL with an ampersand in the query string, which is escaped in the output.', 'info');
      });
    }

    var clearBtn = $('smClear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        input.value = '';
        output.textContent = '';
        results.classList.add('hidden');
        showStatus('Cleared. Paste your URLs to start again.', 'info');
      });
    }

    /* -------------------------------------------------- live regeneration */

    // Debounced: pasting a few thousand URLs should not rebuild the XML on
    // every keystroke of the paste.
    var timer = null;
    function schedule() {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(render, 250);
    }

    input.addEventListener('input', schedule);

    var selects = [lastmodEl, changefreqEl, priorityEl];
    for (var s = 0; s < selects.length; s++) {
      if (selects[s]) selects[s].addEventListener('change', render);
    }

    showStatus('Paste your URLs, one per line, then press Generate Sitemap.', 'info');

    return { render: render };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createSitemapGenerator = createSitemapGenerator;

})(window, document);

/**
 * ToolStack AI — Robots.txt Generator engine.
 *
 * Ids required in tools/robotstxt-generator.html:
 *   rbPreset, rbUserAgent, rbDisallow, rbAllow, rbCrawlDelay, rbSitemap,
 *   rbOutput, rbCopy, rbDownload, rbExample, rbClear, rbStatus, rbResults,
 *   rbStats, rbWarnings
 *
 * Deliberate choices:
 *
 * 1. The notes describe consequences, not style. Blocking /wp-content/ also
 *    blocks the theme's CSS and JavaScript, and Google renders pages with those
 *    files — that is a real, common, self-inflicted problem, so it is called out
 *    by name rather than left to a general warning.
 *
 * 2. Presets write into the fields instead of replacing the form. You can start
 *    from WordPress defaults and edit two lines, which is how people actually
 *    work; selecting a preset never wipes out typing without a way back.
 *
 * 3. A rule line that is not a path is reported, not silently emitted. A
 *    robots.txt with a malformed line is a file whose behaviour you cannot
 *    predict from reading it.
 */
(function (window, document) {
  'use strict';

  function createRobotstxtGenerator(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var presetEl = $('rbPreset');
    var agentEl = $('rbUserAgent');
    var disallowEl = $('rbDisallow');
    var allowEl = $('rbAllow');
    var delayEl = $('rbCrawlDelay');
    var sitemapEl = $('rbSitemap');
    var output = $('rbOutput');
    var statsEl = $('rbStats');
    var warningsEl = $('rbWarnings');
    var results = $('rbResults');
    var statusEl = $('rbStatus');

    if (!agentEl || !disallowEl || !output || !results) return null;

    var PRESETS = {
      allow: {
        agents: '*',
        disallow: '',
        allow: '',
        delay: 0
      },
      block: {
        agents: '*',
        disallow: '/',
        allow: '',
        delay: 0
      },
      admin: {
        agents: '*',
        disallow: '/admin/\n/cart/\n/checkout/\n/search/\n/*?s=',
        allow: '/admin/public/',
        delay: 0
      },
      wordpress: {
        agents: '*',
        disallow: '/wp-admin/\n/wp-login.php\n/xmlrpc.php\n/readme.html',
        allow: '/wp-admin/admin-ajax.php',
        delay: 0
      }
    };

    // Paths whose blocking also removes the files a page needs to render. The
    // list is not exhaustive and does not need to be: it covers the folders
    // people actually block by accident.
    var ASSET_PATHS = ['/wp-content/', '/wp-includes/', '/assets/', '/static/', '/js/', '/css/', '/images/', '/img/', '/fonts/'];

    var STATUS = {
      ok: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      info: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      warn: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      error: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    };

    function showStatus(message, kind) {
      if (!statusEl) return;
      var keys = ['ok', 'info', 'warn', 'error'];
      for (var i = 0; i < keys.length; i++) {
        statusEl.classList.remove.apply(statusEl.classList, STATUS[keys[i]].split(' '));
      }
      statusEl.classList.add.apply(statusEl.classList, (STATUS[kind] || STATUS.info).split(' '));
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

    /**
     * Split one of the rule boxes into usable rules. Blank lines go, comments
     * are kept (crawlers ignore them, people do not), duplicates collapse, and
     * anything that is not a path is handed back as an error so the page can
     * say which line it could not use.
     */
    function parseLines(text) {
      var raw = String(text || '').split(/\r?\n/);
      var rules = [];
      var comments = [];
      var invalid = [];
      var seen = {};

      for (var i = 0; i < raw.length; i++) {
        var line = raw[i].replace(/^\s+|\s+$/g, '');
        if (line === '') continue;

        if (line.charAt(0) === '#' || line.charAt(0) === ';') {
          comments.push(line);
          continue;
        }

        if (line.charAt(0) !== '/' && line.charAt(0) !== '*') {
          invalid.push(line);
          continue;
        }

        if (seen[line] === true) continue;
        seen[line] = true;
        rules.push(line);
      }

      return { rules: rules, comments: comments, invalid: invalid };
    }

    function parseAgents(text) {
      var raw = String(text || '').split(/[\r\n,]+/);
      var agents = [];
      var seen = {};
      for (var i = 0; i < raw.length; i++) {
        var value = raw[i].replace(/^\s+|\s+$/g, '');
        if (value === '' || seen[value] === true) continue;
        seen[value] = true;
        agents.push(value);
      }
      return agents;
    }

    function build(config) {
      var out = [];

      for (var c = 0; c < config.comments.length; c++) out.push(config.comments[c]);

      var agents = config.agents.length > 0 ? config.agents : ['*'];
      for (var a = 0; a < agents.length; a++) out.push('User-agent: ' + agents[a]);

      if (config.disallow.length === 0) {
        // An empty Disallow is the documented way to say "nothing is blocked".
        // Omitting the line entirely is not the same thing.
        out.push('Disallow:');
      } else {
        for (var d = 0; d < config.disallow.length; d++) out.push('Disallow: ' + config.disallow[d]);
      }

      for (var l = 0; l < config.allow.length; l++) out.push('Allow: ' + config.allow[l]);

      if (config.delay > 0) out.push('Crawl-delay: ' + config.delay);

      if (config.sitemap !== '') {
        out.push('');
        out.push('Sitemap: ' + config.sitemap);
      }

      return out.join('\n') + '\n';
    }

    /* -------------------------------------------------------------- render */

    function tile(label, value, tone) {
      return '<div class="bg-gray-950 border border-gray-800 rounded-xl p-3">' +
        '<p class="text-[10px] uppercase tracking-wider text-gray-500 font-bold">' + escapeHtml(label) + '</p>' +
        '<p class="text-lg font-black ' + (tone || 'text-gray-100') + ' mt-1">' + escapeHtml(value) + '</p>' +
        '</div>';
    }

    function note(text, kind) {
      return '<p class="p-3 rounded-xl text-xs font-medium border ' + (STATUS[kind] || STATUS.info) + '">' +
        escapeHtml(text) + '</p>';
    }

    function utf8Bytes(str) {
      var bytes = 0;
      for (var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        if (code < 0x80) bytes += 1;
        else if (code < 0x800) bytes += 2;
        else if (code >= 0xD800 && code <= 0xDBFF) { bytes += 4; i++; }
        else bytes += 3;
      }
      return bytes;
    }

    function render() {
      var agents = parseAgents(agentEl.value);
      var disallow = parseLines(disallowEl.value);
      var allow = parseLines(allowEl.value);

      var delay = delayEl ? parseInt(delayEl.value, 10) : 0;
      if (isNaN(delay) || delay < 0) delay = 0;
      if (delay > 3600) delay = 3600;

      var sitemap = sitemapEl ? sitemapEl.value.replace(/^\s+|\s+$/g, '') : '';

      var config = {
        agents: agents,
        disallow: disallow.rules,
        allow: allow.rules,
        comments: disallow.comments.concat(allow.comments),
        delay: delay,
        sitemap: sitemap
      };

      var text = build(config);
      output.textContent = text;

      var invalid = disallow.invalid.concat(allow.invalid);
      var ruleCount = disallow.rules.length + allow.rules.length;
      var blocksEverything = false;

      var notes = [];

      // The one setting that can take a live site out of search entirely.
      for (var b = 0; b < disallow.rules.length; b++) {
        if (disallow.rules[b] !== '/') continue;
        if (agents.length === 0 || agents.indexOf('*') !== -1) {
          blocksEverything = true;
          notes.push(['User-agent: * together with Disallow: / blocks every crawler from the whole site. That is the correct file for a staging domain and almost never for a live one. Check the user-agent box before you upload.', 'error']);
        } else {
          notes.push(['Disallow: / blocks ' + agents.join(', ') + ' from the entire site. If that is not what you meant, replace it with the specific paths.', 'error']);
        }
        break;
      }

      if (invalid.length > 0) {
        var shown = invalid.slice(0, 3).join('”, “');
        notes.push([invalid.length + ' line' + (invalid.length === 1 ? ' is' : 's are') +
          ' not a path and ' + (invalid.length === 1 ? 'was' : 'were') + ' left out of the file: “' + shown + '”. ' +
          'Every rule must start with / (or * for a wildcard).', 'warn']);
      }

      for (var f = 0; f < disallow.rules.length; f++) {
        var rule = disallow.rules[f].toLowerCase();
        for (var p = 0; p < ASSET_PATHS.length; p++) {
          if (rule.indexOf(ASSET_PATHS[p]) === 0) {
            notes.push(['Disallow: ' + disallow.rules[f] + ' also blocks the files inside it — stylesheets, scripts and images. Google renders pages with those files, so a blocked theme folder can change how the page is evaluated. Block the specific pages instead of the folder.', 'warn']);
            break;
          }
        }
      }

      // A shorter Allow never beats the longer Disallow that contains it, which
      // is the opposite of what most people expect when they write the pair.
      for (var s = 0; s < allow.rules.length; s++) {
        for (var t = 0; t < disallow.rules.length; t++) {
          var a = allow.rules[s];
          var d = disallow.rules[t];
          if (a !== '/' && d.indexOf(a) === 0 && d.length > a.length) {
            notes.push(['Allow: ' + a + ' is shorter than Disallow: ' + d + ', so the disallow still wins for that path. The most specific rule applies, and the longer pattern is the more specific one here.', 'warn']);
            break;
          }
        }
      }

      if (delay > 0) {
        notes.push(['Google ignores Crawl-delay entirely — it has said so outright. Bing and Yandex honour it. If the goal is to slow Google down, use the crawl rate setting in Search Console, which is the control that actually does something.', 'info']);
      }

      if (sitemap !== '') {
        if (!/^https?:\/\//i.test(sitemap)) {
          notes.push(['The sitemap address needs to be a full URL including https://, or crawlers cannot use it.', 'warn']);
        }
      } else {
        notes.push(['No Sitemap line. If you publish a sitemap, listing it here is the quickest way to point crawlers at it — though it is a hint rather than a rule, and leaving it out breaks nothing.', 'info']);
      }

      if (ruleCount > 0 && /\$/.test(disallowEl.value)) {
        notes.push(['The $ anchor is supported by Google and not by Bing, which reads it as a literal character. A rule that depends on it behaves differently on the two crawlers.', 'info']);
      }

      if (ruleCount === 0) {
        notes.push(['Nothing is blocked. This file allows every crawler to request every page, which is a sensible default for most sites — a missing or empty robots.txt has the same effect.', 'info']);
      }

      statsEl.innerHTML =
        tile('Rules', String(ruleCount)) +
        tile('User-agents', String(agents.length > 0 ? agents.length : 1)) +
        tile('Crawl-delay', delay > 0 ? delay + ' s' : 'omitted',
          delay > 0 ? 'text-amber-400' : 'text-gray-100') +
        tile('File size', utf8Bytes(text) + ' B');

      var notesHtml = '';
      for (var n = 0; n < notes.length; n++) notesHtml += note(notes[n][0], notes[n][1]);
      warningsEl.innerHTML = notesHtml;

      results.classList.remove('hidden');

      var actions = root.querySelector('[data-ts-result-actions]');
      if (actions && window.ToolStack && window.ToolStack.reveal) {
        window.ToolStack.reveal(actions);
      }

      if (blocksEverything) {
        showStatus('This file blocks every crawler from the entire site. Correct for a staging domain, dangerous anywhere else.', 'error');
      } else if (invalid.length > 0 || ruleCount === 0) {
        showStatus('robots.txt built with ' + ruleCount + ' rule' + (ruleCount === 1 ? '' : 's') + ' — read the notes below.', 'warn');
      } else {
        showStatus('robots.txt built: ' + ruleCount + ' rule' + (ruleCount === 1 ? '' : 's') +
          ' for ' + (agents.length > 0 ? agents.length : 1) + ' user-agent' + (agents.length === 1 ? '' : 's') +
          '. Save it as robots.txt in your site root.', 'ok');
      }
    }

    /* -------------------------------------------------------------- wiring */

    function applyPreset(name) {
      var preset = PRESETS[name];
      if (!preset) return;
      agentEl.value = preset.agents;
      disallowEl.value = preset.disallow;
      allowEl.value = preset.allow;
      if (delayEl) delayEl.value = String(preset.delay);
    }

    if (presetEl) {
      presetEl.addEventListener('change', function () {
        if (presetEl.value === 'custom') return;
        applyPreset(presetEl.value);
        render();
        showStatus('Preset applied. Editing any field switches the selector back to Custom, so nothing you type here is ever overwritten.', 'info');
      });
    }

    // The fields no longer match the preset once they are edited by hand, and
    // leaving the selector claiming otherwise would misdescribe the file.
    function markCustom() {
      if (presetEl && presetEl.value !== 'custom') presetEl.value = 'custom';
    }

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

    var copyBtn = $('rbCopy');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var text = output.textContent;
        if (!text) {
          showStatus('Nothing to copy yet.', 'warn');
          return;
        }
        var original = copyBtn.textContent;
        copyText(text, function (ok) {
          copyBtn.textContent = ok ? '✅ Copied!' : 'Copy failed';
          window.setTimeout(function () { copyBtn.textContent = original; }, 2000);
          if (!ok) showStatus('Copy failed — select the file above and copy it manually.', 'error');
        });
      });
    }

    var downloadBtn = $('rbDownload');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', function () {
        var text = output.textContent;
        if (!text) return;

        if (!window.Blob || !window.URL || !window.URL.createObjectURL) {
          showStatus('This browser cannot save files directly. Copy the text and save it as robots.txt yourself.', 'warn');
          return;
        }

        var blob = new Blob([text], { type: 'text/plain' });
        var url = window.URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = 'robots.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.setTimeout(function () { window.URL.revokeObjectURL(url); }, 1000);

        showStatus('Saved as robots.txt — upload it to your site root, not to a subfolder.', 'ok');
      });
    }

    var exampleBtn = $('rbExample');
    if (exampleBtn) {
      exampleBtn.addEventListener('click', function () {
        if (presetEl) presetEl.value = 'admin';
        applyPreset('admin');
        if (delayEl) delayEl.value = '0';
        if (sitemapEl) sitemapEl.value = 'https://example.com/sitemap.xml';
        render();
        showStatus('Example loaded — a store blocking cart, checkout and internal search, with an Allow that overrides part of the admin rule.', 'info');
      });
    }

    var clearBtn = $('rbClear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (presetEl) presetEl.value = 'allow';
        applyPreset('allow');
        if (sitemapEl) sitemapEl.value = '';
        render();
        showStatus('Reset to the default: every crawler allowed everywhere.', 'info');
      });
    }

    /* --------------------------------------------------------- live rebuild */

    var timer = null;
    function schedule() {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(render, 200);
    }

    var liveFields = [agentEl, disallowEl, allowEl, delayEl, sitemapEl];
    for (var i = 0; i < liveFields.length; i++) {
      if (!liveFields[i]) continue;
      liveFields[i].addEventListener('input', function () {
        markCustom();
        schedule();
      });
    }

    render();

    return { render: render };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createRobotstxtGenerator = createRobotstxtGenerator;

})(window, document);

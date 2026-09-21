/**
 * Meta Tag Generator — shared engine.
 *
 * Factory, not a singleton: the same code backs the standalone page at
 * /tools/meta-tag-generator.html and any future modal. All lookups are scoped to
 * `root` so two instances would never collide.
 *
 * Required markup (ids, inside `root`):
 *   #mtTitle #mtDescription #mtUrl #mtKeywords #mtAuthor #mtRobots #mtLang
 *   #mtTheme #mtViewport #mtGenerateBtn #mtCopyBtn #mtStatus #mtResults #mtOutput
 * Optional:
 *   #mtTitleHint #mtDescriptionHint — live length feedback
 *   [data-ts-result-actions] — the shared support + share strip
 *
 * Everything is assembled client-side from the field values, so the page can
 * honestly claim nothing is uploaded. Values are escaped before they are placed
 * in an attribute, because a single unescaped quote in a title would otherwise
 * produce markup that silently breaks the whole head.
 */
(function (window, document) {
  'use strict';

  // Google truncates a result title near 600px, which lands around 60
  // characters for average-width Latin text. Description snippets run to about
  // 155–160. The boundaries are advisory only — the counter never blocks a
  // generate — but they are the numbers SEO tools converge on.
  var TITLE_GOOD = 60;
  var TITLE_MAX = 70;
  var DESC_GOOD = 160;
  var DESC_MIN = 120;

  function escapeAttr(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Collapse newlines and runs of whitespace — a description is one line. */
  function oneLine(str) {
    return String(str).replace(/\s+/g, ' ').trim();
  }

  function createMetaTagGenerator(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var fields = {
      title: $('mtTitle'),
      description: $('mtDescription'),
      url: $('mtUrl'),
      keywords: $('mtKeywords'),
      author: $('mtAuthor'),
      robots: $('mtRobots'),
      lang: $('mtLang'),
      theme: $('mtTheme'),
      viewport: $('mtViewport')
    };

    var generateBtn = $('mtGenerateBtn');
    var copyBtn = $('mtCopyBtn');
    var statusEl = $('mtStatus');
    var resultsEl = $('mtResults');
    var outputEl = $('mtOutput');
    var titleHint = $('mtTitleHint');
    var descHint = $('mtDescriptionHint');

    if (!generateBtn || !outputEl) return null;

    var lastBlock = '';

    /* ------------------------------------------------------------ feedback */

    function showStatus(message, isError) {
      if (!statusEl) return;
      statusEl.classList.remove(
        'hidden', 'bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/20',
        'bg-rose-500/10', 'text-rose-400', 'border-rose-500/20',
        'bg-amber-500/10', 'text-amber-400', 'border-amber-500/20'
      );
      if (isError) {
        statusEl.classList.add('bg-rose-500/10', 'text-rose-400', 'border-rose-500/20');
        statusEl.textContent = '❌ ' + message;
      } else {
        statusEl.classList.add('bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/20');
        statusEl.textContent = '✅ ' + message;
      }
    }

    function countClass(len, good, hard, lowIsBad) {
      if (len === 0) return 'text-gray-500';
      if (len > hard || (lowIsBad && len < good)) return 'text-rose-400';
      if (len > good) return 'text-amber-400';
      return 'text-emerald-400';
    }

    function updateCounters() {
      if (titleHint && fields.title) {
        var t = fields.title.value.trim().length;
        titleHint.textContent = t + ' / ' + TITLE_GOOD + ' characters' +
          (t > TITLE_MAX ? ' — Google will truncate this.' :
           t > TITLE_GOOD ? ' — slightly long, may truncate.' :
           t === 0 ? ' — aim for 50–60 characters.' : ' — good length.');
        titleHint.className = 'text-[10px] mt-1 ' +
          countClass(t, TITLE_GOOD, TITLE_MAX, false);
      }

      if (descHint && fields.description) {
        var d = oneLine(fields.description.value).length;
        descHint.textContent = d + ' / ' + DESC_GOOD + ' characters' +
          (d > DESC_GOOD ? ' — may be cut off in results.' :
           d > 0 && d < DESC_MIN ? ' — a little short; 120–160 works best.' :
           d === 0 ? ' — aim for 120–160 characters.' : ' — good length.');
        descHint.className = 'text-[10px] mt-1 ' +
          countClass(d, DESC_GOOD, DESC_GOOD + 20, true);
      }
    }

    /* -------------------------------------------------------------- builder */

    /**
     * Emit only the tags the user actually filled in. Empty tags are worse than
     * missing ones: `<meta name="description" content="">` is a real signal to a
     * crawler that the page has no description, whereas omitting the tag lets
     * Google write its own snippet from page content.
     */
    function build() {
      var val = function (key) {
        return fields[key] ? fields[key].value.trim() : '';
      };

      var title = oneLine(val('title'));
      var description = oneLine(val('description'));
      var url = val('url');
      var keywords = oneLine(val('keywords'));
      var author = oneLine(val('author'));
      var robots = fields.robots ? fields.robots.value : 'index, follow';
      var lang = fields.lang ? fields.lang.value : 'en';
      var theme = val('theme');
      var viewport = oneLine(val('viewport'));

      var lines = [];

      lines.push('<meta charset="UTF-8">');
      if (viewport) {
        lines.push('<meta name="viewport" content="' + escapeAttr(viewport) + '">');
      }
      if (title) {
        lines.push('<title>' +
          title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') +
          '</title>');
      }
      if (description) {
        lines.push('<meta name="description" content="' + escapeAttr(description) + '">');
      }
      if (keywords) {
        lines.push('<meta name="keywords" content="' + escapeAttr(keywords) + '">');
      }
      if (author) {
        lines.push('<meta name="author" content="' + escapeAttr(author) + '">');
      }
      lines.push('<meta name="robots" content="' + escapeAttr(robots) + '">');
      if (url) {
        lines.push('<link rel="canonical" href="' + escapeAttr(url) + '">');
      }
      if (theme) {
        lines.push('<meta name="theme-color" content="' + escapeAttr(theme) + '">');
      }

      return {
        text: lines.join('\n'),
        lang: lang,
        hasTitle: !!title,
        hasDescription: !!description,
        titleLength: title.length,
        descriptionLength: description.length
      };
    }

    function revealActions() {
      var actionsEl = root.querySelector('[data-ts-result-actions]');
      if (!actionsEl) return;
      actionsEl.classList.remove('hidden');
      if (window.ToolStack) {
        window.ToolStack.reveal(actionsEl);
        window.ToolStack.track('tool_output', { tool: 'meta-tag-generator' });
      }
    }

    function guidance(block) {
      var notes = [];
      if (!block.hasTitle) notes.push('add a title');
      else if (block.titleLength > TITLE_MAX) notes.push('shorten the title — it will truncate');
      if (!block.hasDescription) notes.push('add a description');
      else if (block.descriptionLength > DESC_GOOD + 20) notes.push('trim the description');
      return notes;
    }

    function generate() {
      var block = build();

      if (!block.text) {
        showStatus('Nothing to generate yet — fill in at least a title or a description.', true);
        return;
      }

      lastBlock = block.text;
      outputEl.textContent = block.text;

      // The lang attribute belongs on <html>, not in <head>, so it is reported
      // separately rather than folded into the block where it would be wrong.
      var notes = guidance(block);
      var base = 'Generated ' + block.text.split('\n').length + ' tags. ' +
        'Set <html lang="' + block.lang + '"> on the page.';
      showStatus(base + (notes.length ? ' Heads up: ' + notes.join(', ') + '.' : ''), notes.length > 0);

      resultsEl.classList.remove('hidden');
      revealActions();
    }

    /* --------------------------------------------------------------- events */

    if (fields.title) fields.title.addEventListener('input', updateCounters);
    if (fields.description) fields.description.addEventListener('input', updateCounters);

    generateBtn.addEventListener('click', generate);

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!lastBlock) {
          showStatus('Generate the tags first, then copy them.', true);
          return;
        }

        var original = copyBtn.textContent;
        var done = function (ok) {
          copyBtn.textContent = ok ? '✅ Copied!' : '❌ Copy failed';
          window.setTimeout(function () { copyBtn.textContent = original; }, 2000);
        };

        if (window.ToolStack) {
          window.ToolStack.copyText(lastBlock, done);
        } else {
          done(false);
        }
      });
    }

    updateCounters();

    return {
      generate: generate,
      value: function () { return lastBlock; }
    };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createMetaTagGenerator = createMetaTagGenerator;
})(window, document);

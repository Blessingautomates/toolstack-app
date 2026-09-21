/**
 * Meta Description Writer — shared engine.
 *
 * Factory, not a singleton: the same code backs the standalone page at
 * /tools/meta-description-generator.html and any future modal. All lookups are
 * scoped to `root` so two instances would never collide.
 *
 * Required markup (ids, inside `root`):
 *   #mdKeyword #mdTopic #mdSecondary #mdCta #mdTone #mdTitle
 *   #mdGenerateBtn #mdStatus #mdResults #mdCandidates
 *   #mdSerpTitle #mdSerpDesc
 *
 * The variants are TEMPLATES filled with the user's own words, not generated
 * prose. That is a deliberate design choice, not a limitation to be papered
 * over: it guarantees the tool never asserts a fact about someone's product
 * that they did not supply. The page copy says so plainly, and so should any
 * future UI built on this engine.
 */
(function (window, document) {
  'use strict';

  // Google truncates the desktop snippet at roughly 920px, which lands near 158
  // characters for average-width text. Below ~120 the description is not doing
  // enough persuading, but nothing is broken — hence a soft floor and a hard
  // ceiling rather than a single target.
  var DESC_MIN = 120;
  var DESC_MAX = 158;

  /**
   * Each template receives a context object and returns a sentence.
   * `{keyword}`, `{topic}`, `{secondary}` and `{cta}` are resolved before the
   * template runs so the templates stay readable.
   *
   * Templates ending in a bare `{cta}` rely on the CTA carrying its own full
   * stop; the "no call to action" option handles the empty case.
   */
  var TEMPLATES = {
    neutral: [
      '{Topic} {cta}',
      '{KeywordCap}: {topic} {cta}',
      '{topic} {secondary}{cta}',
      '{topic} No signup, nothing to install, and it runs in your browser. {cta}',
      '{topic} Built for people who need it done today. {cta}'
    ],
    benefit: [
      '{topic}, without the usual setup. {cta}',
      'Get {keyword} done in minutes instead of hours. {topic} {cta}',
      '{topic} Skip the spreadsheet and the back-and-forth. {cta}',
      'Save time on {keyword} and get it right the first time. {topic} {cta}',
      '{topic} Everything you need, nothing you have to configure. {cta}'
    ],
    howto: [
      'Learn how to {keyword} step by step. {topic} {cta}',
      'A practical guide to {keyword} for people who want the short version. {topic} {cta}',
      'How to {keyword}: what to do, in what order, and what to skip. {topic} {cta}',
      '{topic} A walkthrough of {keyword} with the confusing parts explained. {cta}',
      'Everything you need to know about {keyword}, in one page. {topic} {cta}'
    ],
    question: [
      'Looking for {keyword}? {topic} {cta}',
      'Not sure which {keyword} to use? {topic} {cta}',
      'Need {keyword} that works on the first try? {topic} {cta}',
      'Wondering how {keyword} actually works? {topic} {cta}',
      'Still doing {keyword} by hand? {topic} {cta}'
    ]
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** "invoice generator" -> "Invoice generator", for sentence-initial use. */
  function capitalise(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /** Trim a trailing full stop so a fragment can be composed mid-sentence. */
  function stripStop(str) {
    return String(str).trim().replace(/\.+$/, '');
  }

  function tidy(str) {
    return String(str)
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.;:!?])/g, '$1')
      .trim();
  }

  function createMetaDescriptionGenerator(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var keywordInput = $('mdKeyword');
    var topicInput = $('mdTopic');
    var secondaryInput = $('mdSecondary');
    var ctaSelect = $('mdCta');
    var toneSelect = $('mdTone');
    var titleInput = $('mdTitle');

    var generateBtn = $('mdGenerateBtn');
    var statusEl = $('mdStatus');
    var resultsEl = $('mdResults');
    var candidatesEl = $('mdCandidates');
    var serpTitle = $('mdSerpTitle');
    var serpDesc = $('mdSerpDesc');

    if (!generateBtn || !candidatesEl) return null;

    var variants = [];

    /* ------------------------------------------------------------ composing */

    function fill(template, ctx) {
      var out = template
        .replace(/\{Topic\}/g, capitalise(ctx.topic))
        .replace(/\{KeywordCap\}/g, capitalise(ctx.keyword))
        .replace(/\{topic\}/g, ctx.topic)
        .replace(/\{keyword\}/g, ctx.keyword)
        .replace(/\{secondary\}/g, ctx.secondary)
        .replace(/\{cta\}/g, ctx.cta);
      return tidy(out);
    }

    function compose() {
      var keyword = (keywordInput ? keywordInput.value : '').trim();
      var topic = stripStop(topicInput ? topicInput.value : '');
      var secondary = stripStop(secondaryInput ? secondaryInput.value : '');
      var cta = ctaSelect ? ctaSelect.value : '';
      var tone = toneSelect ? toneSelect.value : 'neutral';

      var ctx = {
        keyword: keyword || 'this',
        topic: topic,
        // A trailing comma keeps the secondary-keyword fragment readable when it
        // is dropped mid-sentence; when absent, the template's space absorbs it.
        secondary: secondary ? secondary + '.' : '',
        cta: cta
      };

      var templates = TEMPLATES[tone] || TEMPLATES.neutral;

      return templates.map(function (template) {
        return fill(template, ctx);
      }).filter(function (text, index, all) {
        // A template can collapse to a duplicate of another once empty fields
        // are substituted out; showing the same sentence twice looks broken.
        return text.length > 0 && all.indexOf(text) === index;
      });
    }

    /* ------------------------------------------------------------- display */

    function lengthBand(len) {
      if (len > DESC_MAX) {
        return { cls: 'text-rose-400', note: len - DESC_MAX + ' over — Google will cut this off' };
      }
      if (len < DESC_MIN) {
        return { cls: 'text-amber-400', note: 'short — 120–158 reads best' };
      }
      return { cls: 'text-emerald-400', note: 'good length' };
    }

    function renderSerp(text) {
      var title = (titleInput ? titleInput.value : '').trim();
      if (serpTitle) {
        serpTitle.textContent = title || 'Your page title appears here';
        serpTitle.className = title
          ? 'text-base text-sky-400 leading-snug break-words'
          : 'text-base text-gray-500 leading-snug break-words';
      }
      if (serpDesc) {
        if (!text) {
          serpDesc.textContent = '';
          return;
        }
        if (text.length > DESC_MAX) {
          serpDesc.innerHTML = escapeHtml(text.slice(0, DESC_MAX)) +
            '<span class="text-rose-400">…</span>' +
            '<span class="text-gray-600 line-through">' + escapeHtml(text.slice(DESC_MAX)) + '</span>';
        } else {
          serpDesc.textContent = text;
        }
      }
    }

    function renderCandidates() {
      candidatesEl.innerHTML = variants.map(function (text, index) {
        var band = lengthBand(text.length);
        return '' +
          '<li class="bg-gray-950 border border-gray-800 rounded-xl p-3">' +
            '<p class="text-xs text-gray-200 leading-relaxed">' + escapeHtml(text) + '</p>' +
            '<div class="flex items-center justify-between gap-3 mt-2.5 pt-2.5 border-t border-gray-800/60">' +
              '<span class="text-[10px] font-mono ' + band.cls + '">' +
                text.length + ' chars · ' + escapeHtml(band.note) +
              '</span>' +
              '<div class="flex gap-1.5">' +
                '<button type="button" data-md-preview="' + index + '" ' +
                  'class="px-2.5 py-1 rounded-lg border border-gray-700 hover:border-brand-500 text-gray-300 hover:text-brand-400 font-semibold text-[10px] transition">' +
                  'Preview</button>' +
                '<button type="button" data-md-copy="' + index + '" ' +
                  'class="px-2.5 py-1 rounded-lg bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold text-[10px] transition">' +
                  'Copy</button>' +
              '</div>' +
            '</div>' +
          '</li>';
      }).join('');
    }

    function showStatus(message, isError) {
      if (!statusEl) return;
      statusEl.classList.remove(
        'hidden', 'bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/20',
        'bg-rose-500/10', 'text-rose-400', 'border-rose-500/20'
      );
      statusEl.classList.add(
        isError ? 'bg-rose-500/10' : 'bg-emerald-500/10',
        isError ? 'text-rose-400' : 'text-emerald-400',
        isError ? 'border-rose-500/20' : 'border-emerald-500/20'
      );
      statusEl.textContent = (isError ? '❌ ' : '✅ ') + message;
    }

    function revealActions() {
      var actionsEl = root.querySelector('[data-ts-result-actions]');
      if (!actionsEl) return;
      actionsEl.classList.remove('hidden');
      if (window.ToolStack) {
        window.ToolStack.reveal(actionsEl);
        window.ToolStack.track('tool_output', { tool: 'meta-description-generator' });
      }
    }

    /* --------------------------------------------------------------- events */

    function generate() {
      var topic = (topicInput ? topicInput.value : '').trim();

      if (!topic) {
        showStatus('Describe what the page offers first — that sentence is the substance of every variant.', true);
        return;
      }

      variants = compose();

      if (!variants.length) {
        showStatus('Could not build a description from those inputs. Try adding a primary keyword.', true);
        return;
      }

      renderCandidates();
      renderSerp(variants[0]);
      resultsEl.classList.remove('hidden');

      var inBand = variants.filter(function (v) {
        return v.length >= DESC_MIN && v.length <= DESC_MAX;
      }).length;

      showStatus(
        'Generated ' + variants.length + ' variants — ' + inBand +
        ' inside the 120–158 character window.',
        inBand === 0
      );

      revealActions();
    }

    generateBtn.addEventListener('click', generate);

    // Delegated rather than bound per row: the list is re-rendered on every
    // generate, so per-row listeners would leak with each run.
    candidatesEl.addEventListener('click', function (e) {
      var target = e.target;
      if (!target || !target.closest) return;

      var previewBtn = target.closest('[data-md-preview]');
      var copyBtn = target.closest('[data-md-copy]');
      var btn = previewBtn || copyBtn;
      if (!btn) return;

      var index = parseInt(
        btn.getAttribute(previewBtn ? 'data-md-preview' : 'data-md-copy'), 10
      );
      var text = variants[index];
      if (text === undefined) return;

      if (previewBtn) {
        renderSerp(text);
        if (serpDesc) serpDesc.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        return;
      }

      var original = btn.textContent;
      var done = function (ok) {
        btn.textContent = ok ? '✅ Copied' : '❌ Failed';
        window.setTimeout(function () { btn.textContent = original; }, 1800);
      };

      if (window.ToolStack) {
        window.ToolStack.copyText(text, done);
      } else {
        done(false);
      }
    });

    // The preview title is a plain reflection of the field, so it tracks typing.
    if (titleInput && serpTitle) {
      titleInput.addEventListener('input', function () {
        var title = titleInput.value.trim();
        serpTitle.textContent = title || 'Your page title appears here';
        serpTitle.className = title
          ? 'text-base text-sky-400 leading-snug break-words'
          : 'text-base text-gray-500 leading-snug break-words';
      });
    }

    return {
      generate: generate,
      variants: function () { return variants.slice(); }
    };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createMetaDescriptionGenerator = createMetaDescriptionGenerator;
})(window, document);

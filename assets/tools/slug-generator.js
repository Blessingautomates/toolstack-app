/**
 * ToolStack AI — URL Slug Generator engine.
 *
 * Ids required in tools/slug-generator.html:
 *   slugInput, slugSeparator, slugLowercase, slugStripStop, slugMaxLength,
 *   slugResult, slugCopy, slugExample, slugClear, slugStatus, slugResults,
 *   slugStats, slugWarnings
 *
 * Three deliberate choices worth knowing about:
 *
 * 1. Accented Latin letters are transliterated to ASCII rather than
 *    percent-encoded. café as caf%C3%A9 is a perfectly valid URL and completely
 *    unreadable everywhere a URL is displayed.
 *
 * 2. The length limit cuts at a separator, never mid-word. A slug ending
 *    "free-invoice-gen" reads like a mistake; "free-invoice" reads like a
 *    decision. No separator means there is nothing to cut at, and the tool says
 *    so rather than pretending otherwise.
 *
 * 3. Nothing is dropped silently. Characters with no ASCII equivalent and words
 *    removed as stop words are both listed under the result, because those are
 *    exactly the changes that turn a working slug into a wrong one.
 */
(function (window, document) {
  'use strict';

  function createSlugGenerator(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var input = $('slugInput');
    var separatorEl = $('slugSeparator');
    var lowercaseEl = $('slugLowercase');
    var stripStopEl = $('slugStripStop');
    var maxLengthEl = $('slugMaxLength');
    var output = $('slugResult');
    var results = $('slugResults');
    var statsEl = $('slugStats');
    var warningsEl = $('slugWarnings');
    var statusEl = $('slugStatus');

    if (!input || !output || !results) return null;

    var PLACEHOLDER = 'your-slug-appears-here';

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

    /* -------------------------------------------------------------- slugify */

    // Latin letters with diacritics, mapped to the nearest ASCII letter. Not a
    // complete Unicode fold — a complete one needs the full decomposition
    // tables, which are far larger than this tool justifies — but it covers
    // every language a slug is realistically written in.
    var TRANSLIT = {
      'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a',
      'å': 'a', 'ā': 'a', 'ă': 'a', 'ą': 'a',
      'ç': 'c', 'ć': 'c', 'č': 'c',
      'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e', 'ē': 'e',
      'ę': 'e', 'ě': 'e',
      'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i', 'ī': 'i',
      'į': 'i',
      'ñ': 'n', 'ń': 'n', 'ň': 'n',
      'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
      'ø': 'o', 'ō': 'o', 'ő': 'o',
      'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u', 'ū': 'u',
      'ů': 'u', 'ű': 'u',
      'ý': 'y', 'ÿ': 'y',
      'ß': 'ss', 'æ': 'ae', 'œ': 'oe', 'ð': 'd', 'þ': 'th',
      'ł': 'l', 'ś': 's', 'š': 's', 'ş': 's', 'ř': 'r',
      'ť': 't', 'ţ': 't', 'ŧ': 't', 'ž': 'z', 'ź': 'z',
      'ż': 'z', 'ğ': 'g', 'ı': 'i', 'ď': 'd'
    };

    /**
     * One letter's ASCII equivalent, or null when there is none. Uppercase
     * accented letters are looked up in lowercase and re-cased, so É survives as
     * E when lowercasing is switched off.
     */
    function translit(ch, lowercase) {
      var key = ch.toLowerCase();
      var ascii = TRANSLIT[key];
      if (ascii === undefined) return null;
      if (ch === key || lowercase) return ascii;
      return ascii.charAt(0).toUpperCase() + ascii.slice(1);
    }

    // Punctuation a reader would expect a slug to lose. Anything else that is
    // not a letter or a digit — emoji, currency signs, CJK — is reported: those
    // are the removals that quietly change what a URL says.
    var EXPECTED = ' \t\r\n-_/\\.,;:!?\'"()[]{}&+*|@#$%^~`<>=';

    function isExpected(ch) {
      return EXPECTED.indexOf(ch) !== -1;
    }

    /**
     * Split the input into the words that will make up the slug, recording
     * everything that could not be carried across.
     */
    function tokenize(text, lowercase, dropped) {
      var tokens = [];
      var current = '';

      for (var i = 0; i < text.length; i++) {
        var ch = text.charAt(i);
        var ascii = translit(ch, lowercase);

        if (ascii === null && /[A-Za-z0-9]/.test(ch)) {
          ascii = lowercase ? ch.toLowerCase() : ch;
        }

        if (ascii !== null) {
          current += ascii;
          continue;
        }

        if (current !== '') {
          tokens.push(current);
          current = '';
        }
        if (!isExpected(ch)) {
          dropped[ch] = (dropped[ch] || 0) + 1;
        }
      }

      if (current !== '') tokens.push(current);
      return tokens;
    }

    var STOP = {
      a: 1, an: 1, the: 1, and: 1, or: 1, of: 1, to: 1, in: 1, for: 1, on: 1,
      at: 1, with: 1, by: 1, from: 1
    };

    function clampLength(slug, max, separator) {
      if (max <= 0 || slug.length <= max) {
        return { slug: slug, cut: false, midWord: false };
      }

      var cut = slug.slice(0, max);
      var midWord = false;

      if (separator !== '') {
        var at = cut.lastIndexOf(separator);
        // at === -1 means the very first word is already longer than the limit,
        // so there is no boundary to fall back to.
        if (at > 0) cut = cut.slice(0, at);
        else midWord = true;
      } else {
        midWord = true;
      }

      cut = cut.replace(/[-_]+$/, '');
      if (cut === '') {
        cut = slug.slice(0, max);
        midWord = true;
      }

      return { slug: cut, cut: true, midWord: midWord };
    }

    function readOptions() {
      var value = separatorEl ? separatorEl.value : 'hyphen';
      var separator = value === 'none' ? '' : (value === 'underscore' ? '_' : '-');

      var max = 0;
      if (maxLengthEl) {
        max = parseInt(maxLengthEl.value, 10);
        if (isNaN(max) || max < 0) max = 0;
        if (max > 200) max = 200;
      }

      return {
        separator: separator,
        lowercase: !lowercaseEl || lowercaseEl.checked,
        stripStop: !!(stripStopEl && stripStopEl.checked),
        max: max
      };
    }

    function build(raw, opts) {
      var dropped = {};
      var tokens = tokenize(raw, opts.lowercase, dropped);

      var removed = [];
      if (opts.stripStop) {
        var contentWords = 0;
        for (var i = 0; i < tokens.length; i++) {
          if (STOP[tokens[i].toLowerCase()] !== 1) contentWords++;
        }

        // Only strip when something is left behind. "the-and-or" as a title is
        // nonsense, but an empty slug is worse than a silly one.
        if (contentWords > 0) {
          var kept = [];
          for (var j = 0; j < tokens.length; j++) {
            if (STOP[tokens[j].toLowerCase()] === 1) removed.push(tokens[j]);
            else kept.push(tokens[j]);
          }
          tokens = kept;
        }
      }

      var limited = clampLength(tokens.join(opts.separator), opts.max, opts.separator);

      var separators = 0;
      if (opts.separator !== '') {
        for (var s = 0; s < limited.slug.length; s++) {
          if (limited.slug.charAt(s) === opts.separator) separators++;
        }
      }

      return {
        slug: limited.slug,
        words: tokens.length,
        separators: separators,
        dropped: dropped,
        removed: removed,
        cut: limited.cut,
        midWord: limited.midWord
      };
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

    function chars(n) {
      return n + (n === 1 ? ' character' : ' characters');
    }

    function setOutput(slug) {
      var empty = slug === '';
      output.textContent = empty ? PLACEHOLDER : slug;
      output.classList.remove('text-brand-400', 'text-gray-600');
      output.classList.add(empty ? 'text-gray-600' : 'text-brand-400');
    }

    /**
     * Characters that were dropped, as a readable list. Insertion order is the
     * order they first appeared in the input, which is the order a reader scans.
     */
    function droppedList(dropped) {
      var keys = [];
      var total = 0;
      for (var ch in dropped) {
        if (Object.prototype.hasOwnProperty.call(dropped, ch)) {
          keys.push(ch);
          total += dropped[ch];
        }
      }

      var shown = keys.slice(0, 6).join(' ');
      if (keys.length > 6) shown += ' …';

      return {
        total: total,
        shown: shown,
        more: keys.length > 6 ? ' (' + keys.length + ' distinct characters)' : ''
      };
    }

    function render() {
      var opts = readOptions();
      var raw = input.value;

      if (raw.replace(/^\s+|\s+$/g, '') === '') {
        setOutput('');
        results.classList.add('hidden');
        showStatus('Paste a headline, a page title or a messy URL — the slug builds as you type.', 'info');
        return;
      }

      var built = build(raw, opts);
      setOutput(built.slug);

      var notes = [];

      if (built.slug === '') {
        notes.push(['Nothing usable survived. The input had no letters or digits this tool could keep, so there is no slug to build from.', 'error']);
      }

      var droppedInfo = droppedList(built.dropped);
      if (droppedInfo.total > 0) {
        notes.push([droppedInfo.total + ' character' + (droppedInfo.total === 1 ? ' was' : 's were') +
          ' dropped because they have no ASCII equivalent: ' + droppedInfo.shown + droppedInfo.more +
          '. If one of them carried meaning, spell it out in the source title instead.', 'warn']);
      }

      if (built.removed.length > 0) {
        notes.push([built.removed.length + ' stop word' + (built.removed.length === 1 ? '' : 's') +
          ' removed: ' + built.removed.join(', ') +
          '. Read the result again — dropping “the” from a title like “The Who” leaves a slug about somebody else entirely.', 'info']);
      }

      if (built.cut) {
        if (built.midWord) {
          notes.push(['Cut to ' + opts.max + ' characters mid-word, because there was no separator to cut at before the limit. Shorten the title, raise the limit, or accept a truncated word.', 'warn']);
        } else {
          notes.push(['Cut to ' + opts.max + ' characters at the last separator before the limit, so the slug ends on a whole word.', 'info']);
        }
      }

      if (built.slug.length > 60 && !built.cut) {
        notes.push([chars(built.slug.length) + '. Long slugs are truncated in some search results, in chat previews and in analytics reports, and it is always the end that gets lost — so the last words are doing nothing.', 'warn']);
      }

      if (opts.separator === '' && built.slug.length > 25) {
        notes.push(['With no separator the slug is one long unbroken word. That is hard to read aloud, hard to retype from a screenshot, and some systems will not break it across lines.', 'info']);
      }

      statsEl.innerHTML =
        tile('Input length', chars(raw.length)) +
        tile('Slug length', chars(built.slug.length),
          built.slug.length > 60 ? 'text-amber-400' : 'text-emerald-400') +
        tile('Words kept', String(built.words)) +
        tile('Separators', String(built.separators));

      var notesHtml = '';
      for (var i = 0; i < notes.length; i++) notesHtml += note(notes[i][0], notes[i][1]);
      warningsEl.innerHTML = notesHtml;

      results.classList.remove('hidden');

      var actions = root.querySelector('[data-ts-result-actions]');
      if (actions && window.ToolStack && window.ToolStack.reveal) {
        window.ToolStack.reveal(actions);
      }

      if (built.slug === '') {
        showStatus('No slug could be built from that input — it contained no letters or digits.', 'error');
      } else if (built.cut || droppedInfo.total > 0) {
        showStatus('Slug built, with changes worth reading: ' + built.slug, 'warn');
      } else {
        showStatus('Slug built from ' + chars(raw.length) + ' of input.', 'ok');
      }
    }

    /* -------------------------------------------------------------- wiring */

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

    var copyBtn = $('slugCopy');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var slug = output.textContent;
        if (slug === PLACEHOLDER || slug === '') {
          showStatus('Nothing to copy yet — paste a title first.', 'warn');
          return;
        }
        var original = copyBtn.textContent;
        copyText(slug, function (ok) {
          copyBtn.textContent = ok ? '✅ Copied!' : 'Copy failed';
          window.setTimeout(function () { copyBtn.textContent = original; }, 2000);
          if (!ok) showStatus('Copy failed — select the slug above and copy it manually.', 'error');
        });
      });
    }

    // Chosen to exercise every branch at once: an accented letter, an ampersand,
    // a number, and a parenthesised year.
    var EXAMPLE = 'The 10 Best Café & Bakery Invoice Generators for Freelancers (2026 Update!)';

    var exampleBtn = $('slugExample');
    if (exampleBtn) {
      exampleBtn.addEventListener('click', function () {
        input.value = EXAMPLE;
        if (stripStopEl) stripStopEl.checked = true;
        render();
        showStatus('Example loaded — an accented word, an ampersand and a bracketed year, all handled.', 'info');
      });
    }

    var clearBtn = $('slugClear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        input.value = '';
        setOutput('');
        results.classList.add('hidden');
        showStatus('Cleared. Paste a title to start again.', 'info');
      });
    }

    /* --------------------------------------------------------- live rebuild */

    var timer = null;
    function schedule() {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(render, 150);
    }

    input.addEventListener('input', schedule);

    var toggles = [separatorEl, lowercaseEl, stripStopEl];
    for (var t = 0; t < toggles.length; t++) {
      if (toggles[t]) toggles[t].addEventListener('change', render);
    }
    if (maxLengthEl) maxLengthEl.addEventListener('input', schedule);

    showStatus('Paste a headline or page title — the slug builds as you type.', 'info');

    return { render: render };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createSlugGenerator = createSlugGenerator;

})(window, document);

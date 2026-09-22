/**
 * ToolStack AI — Keyword Density Checker engine.
 *
 * Ids required in tools/keyword-density-checker.html:
 *   kdInput, kdKeyword, kdPhraseLen, kdIgnoreStop, kdStatus, kdStats,
 *   kdWarnings, kdTable, kdResults, kdCopy, kdExample, kdClear
 *
 * Two things this engine is careful about, because the tool's whole subject is
 * a piece of folklore:
 *
 * 1. Density is presented as a diagnostic. Google has said for years that
 *    keyword density is not a ranking factor, and no threshold triggers a
 *    penalty, so nothing here is labelled "too high" or "too low" — the notes
 *    describe what the pattern is, and leave the judgement to the writer.
 *
 * 2. The denominator is always the full word count, including the common words
 *    that the "ignore common words" switch hides from the table. Otherwise the
 *    percentages would silently change meaning when the switch is toggled, and
 *    would not match any other tool's figure for the same text.
 *
 * Density is count / total words. An n-word phrase counts once per occurrence,
 * not n times, which is the convention every comparable tool uses.
 */
(function (window, document) {
  'use strict';

  function createKeywordDensityChecker(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var input = $('kdInput');
    var keywordEl = $('kdKeyword');
    var phraseLenEl = $('kdPhraseLen');
    var ignoreStopEl = $('kdIgnoreStop');
    var statsEl = $('kdStats');
    var warningsEl = $('kdWarnings');
    var tableEl = $('kdTable');
    var results = $('kdResults');
    var statusEl = $('kdStatus');

    if (!input || !results || !statsEl || !tableEl) return null;

    var TOP_N = 15;

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

    var STOP = {
      a: 1, an: 1, the: 1, and: 1, or: 1, of: 1, to: 1, in: 1, on: 1, at: 1,
      for: 1, with: 1, by: 1, from: 1, is: 1, are: 1, was: 1, were: 1, be: 1,
      as: 1, it: 1, its: 1, this: 1, that: 1, you: 1, your: 1, we: 1, our: 1
    };

    /**
     * Words, lowercased, with punctuation dropped. Apostrophes and hyphens are
     * kept inside a word so "state-of-the-art" and "reader's" stay whole.
     */
    function tokenize(text) {
      var parts = text.toLowerCase().split(/[^a-z0-9'’-]+/);
      var out = [];
      for (var i = 0; i < parts.length; i++) {
        var token = parts[i].replace(/^['’-]+/, '').replace(/['’-]+$/, '');
        if (token !== '') out.push(token);
      }
      return out;
    }

    // Scripts this tokenizer cannot see. A page of Chinese text would otherwise
    // produce an empty table with no explanation.
    var NON_LATIN = /[Ͱ-ϿЀ-ӿ֐-׿؀-ۿ぀-ヿ一-鿿가-힯]/;

    function countPhrases(list, size, ignoreStop) {
      var map = {};
      var rows = [];

      for (var i = 0; i + size <= list.length; i++) {
        var parts = [];
        var stopOnly = true;
        for (var j = 0; j < size; j++) {
          parts.push(list[i + j]);
          if (STOP[list[i + j]] !== 1) stopOnly = false;
        }

        if (ignoreStop && stopOnly) continue;

        var phrase = parts.join(' ');
        if (map[phrase] === undefined) {
          map[phrase] = { phrase: phrase, count: 0, first: rows.length };
          rows.push(map[phrase]);
        }
        map[phrase].count++;
      }

      // Count first, then first appearance — so equal counts read in the order
      // the writer actually introduced them.
      rows.sort(function (a, b) {
        if (b.count !== a.count) return b.count - a.count;
        return a.first - b.first;
      });

      return rows;
    }

    /** Occurrences of an exact token sequence, used for the target phrase. */
    function countSequence(list, sequence) {
      if (sequence.length === 0 || sequence.length > list.length) return 0;

      var count = 0;
      for (var i = 0; i + sequence.length <= list.length; i++) {
        var match = true;
        for (var j = 0; j < sequence.length; j++) {
          if (list[i + j] !== sequence[j]) {
            match = false;
            break;
          }
        }
        if (match) count++;
      }
      return count;
    }

    function percent(count, total) {
      if (total === 0) return 0;
      return (count / total) * 100;
    }

    function formatPercent(value) {
      if (value === 0) return '0%';
      if (value < 0.01) return '<0.01%';
      return (Math.round(value * 100) / 100) + '%';
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

    // Bar widths are relative to the most frequent phrase, so the table shows
    // the shape of the distribution rather than an absolute scale it would
    // never reach on a real page.
    function tableRow(phrase, count, share, topCount) {
      var width = topCount > 0 ? Math.max(2, Math.round((count / topCount) * 100)) : 0;
      return '<div class="flex items-center gap-3">' +
        '<span class="w-28 sm:w-44 shrink-0 truncate font-mono text-xs text-gray-200" title="' + escapeHtml(phrase) + '">' +
          escapeHtml(phrase) + '</span>' +
        '<div class="flex-1 h-2 rounded-full bg-gray-800 overflow-hidden">' +
          '<div class="h-full bg-brand-500" style="width: ' + width + '%"></div>' +
        '</div>' +
        '<span class="w-20 shrink-0 text-right font-mono text-[10px] text-gray-400">' +
          count + ' · ' + formatPercent(share) + '</span>' +
        '</div>';
    }

    // Kept from the last render so the copy button exports exactly the table on
    // screen instead of recounting and risking a different result.
    var lastTable = '';

    function render() {
      var text = input.value;

      if (text.replace(/\s+/g, '') === '') {
        results.classList.add('hidden');
        lastTable = '';
        showStatus('Paste some text to see which words and phrases it repeats.', 'info');
        return;
      }

      var list = tokenize(text);
      var total = list.length;

      var size = phraseLenEl ? parseInt(phraseLenEl.value, 10) : 1;
      if (isNaN(size) || size < 1) size = 1;
      if (size > 3) size = 3;

      var ignoreStop = !!(ignoreStopEl && ignoreStopEl.checked);

      var rows = countPhrases(list, size, ignoreStop);
      var top = rows.slice(0, TOP_N);
      var maxCount = top.length > 0 ? top[0].count : 0;

      var keyword = keywordEl ? keywordEl.value.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '') : '';
      var keywordCount = 0;
      var keywordDensity = 0;
      if (keyword !== '') {
        keywordCount = countSequence(list, tokenize(keyword));
        keywordDensity = percent(keywordCount, total);
      }

      var uniqueLabel = size === 1 ? 'Unique words' : 'Unique ' + size + '-word phrases';

      statsEl.innerHTML =
        tile('Words', String(total)) +
        tile(uniqueLabel, String(rows.length)) +
        tile('Target count', keyword === '' ? '—' : String(keywordCount),
          keyword === '' ? 'text-gray-100' : (keywordCount === 0 ? 'text-amber-400' : 'text-emerald-400')) +
        tile('Target density', keyword === '' ? '—' : formatPercent(keywordDensity),
          keywordDensity > 4 ? 'text-amber-400' : 'text-gray-100');

      var notes = [];

      if (total < 100) {
        notes.push(['Only ' + total + ' words. On a text this short one extra occurrence moves a percentage by a whole point, so read the counts rather than the percentages.', 'info']);
      }

      if (NON_LATIN.test(text)) {
        notes.push(['This text contains characters outside the Latin alphabet. The table counts Latin letters and digits only, so scripts such as Cyrillic, Greek, Arabic or Chinese are not represented in it.', 'warn']);
      }

      if (keyword !== '' && keywordCount === 0) {
        notes.push(['The exact phrase “' + keyword + '” does not appear in the text. Search engines match close variants, so that is not automatically a problem — but if it is the phrase you want the page to rank for, it should probably appear at least once.', 'warn']);
      } else if (keyword !== '' && keywordDensity > 4) {
        notes.push(['“' + keyword + '” makes up ' + formatPercent(keywordDensity) + ' of the text. No threshold triggers a penalty, but repetition at that rate is visible to a reader, and that costs more than the keyword is worth.', 'warn']);
      } else if (keyword !== '' && keywordDensity > 0 && keywordDensity < 0.3) {
        notes.push(['“' + keyword + '” appears rarely in ' + total + ' words. That is not a fault either — a page can rank for a phrase it mentions once, if the rest of the text is about the same thing.', 'info']);
      }

      if (!ignoreStop && rows.length > 0 && STOP[rows[0].phrase] === 1) {
        notes.push(['The top of the table is common words. Switch on Ignore common words to see the vocabulary that describes the topic — the total word count, and so every percentage, stays the same.', 'info']);
      }

      if (ignoreStop) {
        notes.push(['Common words are hidden from the table but still counted in the total, so these percentages match what a tool showing everything would report.', 'info']);
      }

      var html = '';
      for (var i = 0; i < top.length; i++) {
        html += tableRow(top[i].phrase, top[i].count, percent(top[i].count, total), maxCount);
      }
      tableEl.innerHTML = html !== ''
        ? html
        : '<p class="text-xs text-gray-500">Nothing to show — every ' + (size === 1 ? 'word' : 'phrase') + ' in this text is on the common-word list.</p>';

      var lines = [];
      for (var k = 0; k < top.length; k++) {
        lines.push(top[k].phrase + ' — ' + top[k].count + ' (' + formatPercent(percent(top[k].count, total)) + ')');
      }
      lastTable = 'Keyword density: ' + total + ' words, ' + rows.length + ' ' + uniqueLabel.toLowerCase() + '\n\n' + lines.join('\n');
      if (keyword !== '') {
        lastTable = 'Target "' + keyword + '": ' + keywordCount + ' occurrences (' + formatPercent(keywordDensity) + ')\n\n' + lastTable;
      }

      var notesHtml = '';
      for (var n = 0; n < notes.length; n++) notesHtml += note(notes[n][0], notes[n][1]);
      warningsEl.innerHTML = notesHtml;

      results.classList.remove('hidden');

      var actions = root.querySelector('[data-ts-result-actions]');
      if (actions && window.ToolStack && window.ToolStack.reveal) {
        window.ToolStack.reveal(actions);
      }

      if (keyword !== '' && (keywordCount === 0 || keywordDensity > 4)) {
        showStatus('“' + keyword + '”: ' + keywordCount + ' occurrence' + (keywordCount === 1 ? '' : 's') + ' at ' + formatPercent(keywordDensity) + ' — see the notes.', 'warn');
      } else if (maxCount > 0) {
        showStatus(total + ' words counted. Most frequent: “' + top[0].phrase + '” at ' + top[0].count + ' (' + formatPercent(percent(maxCount, total)) + ').', 'ok');
      } else {
        showStatus(total + ' words counted, but nothing left after the common-word filter.', 'info');
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

    var copyBtn = $('kdCopy');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (lastTable === '') {
          showStatus('Nothing to copy yet — paste some text first.', 'warn');
          return;
        }
        var original = copyBtn.textContent;
        copyText(lastTable, function (ok) {
          copyBtn.textContent = ok ? '✅ Copied!' : 'Copy failed';
          window.setTimeout(function () { copyBtn.textContent = original; }, 2000);
          if (!ok) showStatus('Copy failed — the table is on screen above.', 'error');
        });
      });
    }

    // Deliberately repetitive copy: it demonstrates the one thing the table is
    // genuinely good at, which is showing a phrase the writer leaned on.
    var EXAMPLE = [
      'A free invoice generator should take less time to use than writing the invoice by hand. That sounds obvious, and most invoice generators fail it: by the time you have made an account, confirmed an email and chosen a template, you could have typed the invoice yourself.',
      '',
      'This invoice generator does one thing differently. It runs entirely in the browser, so there is no account, no email, and no server holding your client list.',
      '',
      'If you send more than a handful of invoices a month, the difference is the setup time you never pay.'
    ].join('\n');

    var exampleBtn = $('kdExample');
    if (exampleBtn) {
      exampleBtn.addEventListener('click', function () {
        input.value = EXAMPLE;
        if (keywordEl) keywordEl.value = 'invoice generator';
        if (ignoreStopEl) ignoreStopEl.checked = true;
        render();
        showStatus('Example loaded — a deliberately repetitive paragraph, with "invoice generator" as the target phrase.', 'info');
      });
    }

    var clearBtn = $('kdClear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        input.value = '';
        if (keywordEl) keywordEl.value = '';
        results.classList.add('hidden');
        lastTable = '';
        showStatus('Cleared. Paste your text to start again.', 'info');
      });
    }

    /* --------------------------------------------------------- live rebuild */

    var timer = null;
    function schedule() {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(render, 150);
    }

    input.addEventListener('input', schedule);
    if (keywordEl) keywordEl.addEventListener('input', schedule);
    if (phraseLenEl) phraseLenEl.addEventListener('change', render);
    if (ignoreStopEl) ignoreStopEl.addEventListener('change', render);

    showStatus('Paste some text to see which words and phrases it repeats.', 'info');

    return { render: render };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createKeywordDensityChecker = createKeywordDensityChecker;

})(window, document);

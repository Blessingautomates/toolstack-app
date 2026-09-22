/**
 * ToolStack AI — Keyword Counter engine.
 *
 * Ids required in tools/keyword-counter.html:
 *   kcInput, kcStatus, kcStats, kcWarnings, kcResults, kcCopy, kcExample,
 *   kcClear
 *
 * What the numbers mean, and what they do not:
 *
 * 1. Words are counted by splitting on whitespace. That is the same rule a
 *    word processor roughly follows, but not exactly the same one — so a count
 *    can differ from Word or Google Docs by a few on a long document, and the
 *    page says so rather than implying the figure is authoritative.
 *
 * 2. Sentences are counted by finding terminal punctuation. An abbreviation
 *    like "e.g." or "Dr." therefore adds one that is not there. Under-counting
 *    would need a dictionary of abbreviations; over-counting is at least
 *    visible in the sentence list.
 *
 * 3. Reading and speaking speeds are averages, not measurements: 225 words per
 *    minute for silent reading, 130 for speaking aloud. Both are stated on the
 *    page so nobody has to guess where they came from.
 */
(function (window, document) {
  'use strict';

  function createKeywordCounter(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var input = $('kcInput');
    var statsEl = $('kcStats');
    var warningsEl = $('kcWarnings');
    var results = $('kcResults');
    var statusEl = $('kcStatus');

    if (!input || !results || !statsEl) return null;

    var WORDS_PER_MINUTE_READING = 225;
    var WORDS_PER_MINUTE_SPEAKING = 130;

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

    /* -------------------------------------------------------------- counting */

    function words(text) {
      var trimmed = text.replace(/^\s+|\s+$/g, '');
      if (trimmed === '') return [];
      return trimmed.split(/\s+/);
    }

    /**
     * Every sentence, terminated or not. A final fragment with no full stop is
     * still a sentence — the writer simply has not finished it yet, and
     * dropping it would make the count jump around while they type.
     */
    function sentences(text) {
      var out = [];
      var re = /[^.!?…]+[.!?…]+/g;
      var m;
      while ((m = re.exec(text)) !== null) {
        if (m[0].replace(/\s+/g, '') !== '') out.push(m[0]);
      }

      var tail = text.replace(/[\s\S]*[.!?…]/, '');
      if (tail.replace(/\s+/g, '') !== '') out.push(tail);

      return out;
    }

    // Blank-line separated blocks. A single newline inside a block is a line
    // break within a paragraph, not a new paragraph.
    function countParagraphs(text) {
      var blocks = text.split(/\n\s*\n/);
      var count = 0;
      for (var i = 0; i < blocks.length; i++) {
        if (blocks[i].replace(/\s+/g, '') !== '') count++;
      }
      return count;
    }

    function countWithoutSpaces(text) {
      return text.replace(/\s+/g, '').length;
    }

    /**
     * A duration a person would say out loud, rounded to the second. Rounding
     * is done once, on the seconds, so 1.999 minutes reads as 2 min rather than
     * 1 min 60 sec.
     */
    function duration(minutes) {
      var totalSeconds = Math.round(minutes * 60);

      if (totalSeconds < 60) {
        return Math.max(1, totalSeconds) + ' sec';
      }

      var wholeMinutes = Math.floor(totalSeconds / 60);
      var seconds = totalSeconds - wholeMinutes * 60;

      if (seconds === 0) return wholeMinutes + ' min';
      return wholeMinutes + ' min ' + seconds + ' sec';
    }

    function round(value, places) {
      var factor = Math.pow(10, places);
      return Math.round(value * factor) / factor;
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

    // Kept from the last render so the copy button hands over exactly the
    // figures on screen, without counting the text a second time.
    var lastSummary = '';

    function render() {
      var text = input.value;

      if (text.replace(/\s+/g, '') === '') {
        results.classList.add('hidden');
        lastSummary = '';
        showStatus('Paste or type some text — every count updates as you go.', 'info');
        return;
      }

      var wordList = words(text);
      var sentenceList = sentences(text);
      var wordCount = wordList.length;
      var charCount = text.length;
      var charNoSpaces = countWithoutSpaces(text);
      var sentenceCount = sentenceList.length;
      var paraCount = countParagraphs(text);

      var longest = 0;
      var longestText = '';
      for (var i = 0; i < sentenceList.length; i++) {
        var length = words(sentenceList[i]).length;
        if (length > longest) {
          longest = length;
          longestText = sentenceList[i].replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
        }
      }

      var average = sentenceCount > 0 ? wordCount / sentenceCount : 0;
      var reading = wordCount / WORDS_PER_MINUTE_READING;
      var speaking = wordCount / WORDS_PER_MINUTE_SPEAKING;

      statsEl.innerHTML =
        tile('Words', String(wordCount)) +
        tile('Characters', String(charCount)) +
        tile('No spaces', String(charNoSpaces)) +
        tile('Sentences', String(sentenceCount)) +
        tile('Paragraphs', String(paraCount)) +
        tile('Words / sentence', sentenceCount > 0 ? String(round(average, 1)) : '—',
          sentenceCount > 0 && average > 25 ? 'text-amber-400' : 'text-gray-100') +
        tile('Reading time', duration(reading)) +
        tile('Speaking time', duration(speaking));

      var notes = [];

      if (sentenceCount > 0 && average > 25) {
        notes.push(['Average sentence length is ' + round(average, 1) + ' words. Past roughly 25 the reader is holding more of the sentence in their head than they can comfortably carry, and that is usually the point where a paragraph stops being readable.', 'warn']);
      }

      if (longest > 40) {
        var shown = longestText.length > 90 ? longestText.slice(0, 90) + '…' : longestText;
        notes.push(['The longest sentence runs to ' + longest + ' words: “' + shown + '”', 'warn']);
      }

      if (wordCount > 150 && paraCount <= 1) {
        notes.push([wordCount + ' words with no blank line anywhere in them. On screen that reads as one grey block — break it up even if the original had no paragraph breaks.', 'info']);
      }

      if (wordCount > 1800) {
        notes.push(['Long-form, at about ' + duration(reading) + ' of reading. Reading time is counted at ' + WORDS_PER_MINUTE_READING + ' words per minute, the average for silent reading of non-fiction; a technical or unfamiliar passage takes longer.', 'info']);
      }

      if (wordCount > 0 && charCount / wordCount > 15) {
        notes.push(['Very few words for that many characters. If this text is Chinese, Japanese or Thai then it has no spaces between words, and the word count means nothing — use the character count instead.', 'info']);
      }

      if (wordCount > 60 && average > 0 && average < 8) {
        notes.push(['Sentences average under 8 words. Short sentences are not a fault on their own, but a whole piece of them reads as choppy.', 'info']);
      }

      var notesHtml = '';
      for (var n = 0; n < notes.length; n++) notesHtml += note(notes[n][0], notes[n][1]);
      warningsEl.innerHTML = notesHtml;

      lastSummary = [
        'Words: ' + wordCount,
        'Characters: ' + charCount,
        'Characters without spaces: ' + charNoSpaces,
        'Sentences: ' + sentenceCount,
        'Paragraphs: ' + paraCount,
        'Average words per sentence: ' + (sentenceCount > 0 ? round(average, 1) : 'n/a'),
        'Reading time: ' + duration(reading),
        'Speaking time: ' + duration(speaking)
      ].join('\n');

      results.classList.remove('hidden');

      var actions = root.querySelector('[data-ts-result-actions]');
      if (actions && window.ToolStack && window.ToolStack.reveal) {
        window.ToolStack.reveal(actions);
      }

      var plural = wordCount === 1 ? '' : 's';
      if (longest > 40 || (sentenceCount > 0 && average > 25)) {
        showStatus(wordCount + ' word' + plural + ' counted — with long sentences worth a look.', 'warn');
      } else {
        showStatus(wordCount + ' word' + plural + ', ' + charCount + ' characters, ' + sentenceCount + ' sentence' + (sentenceCount === 1 ? '' : 's') + '.', 'ok');
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

    var copyBtn = $('kcCopy');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (lastSummary === '') {
          showStatus('Nothing counted yet — paste some text first.', 'warn');
          return;
        }
        var original = copyBtn.textContent;
        copyText(lastSummary, function (ok) {
          copyBtn.textContent = ok ? '✅ Copied!' : 'Copy failed';
          window.setTimeout(function () { copyBtn.textContent = original; }, 2000);
          if (!ok) showStatus('Copy failed — the counts are on screen above.', 'error');
        });
      });
    }

    var EXAMPLE = [
      'Free browser tools have one advantage over the software they replace: there is nothing to install, nothing to sign up for, and nothing to uninstall when you are done. You open a page, paste your text, and leave.',
      '',
      'That convenience is also the limit. A tool that runs entirely in the page cannot read a file you have not opened, cannot remember your last session, and cannot work offline unless it was built to.'
    ].join('\n');

    var exampleBtn = $('kcExample');
    if (exampleBtn) {
      exampleBtn.addEventListener('click', function () {
        input.value = EXAMPLE;
        render();
        showStatus('Example loaded — two paragraphs, five sentences, no markup.', 'info');
      });
    }

    var clearBtn = $('kcClear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        input.value = '';
        results.classList.add('hidden');
        lastSummary = '';
        showStatus('Cleared. Paste your text to start again.', 'info');
      });
    }

    /* --------------------------------------------------------- live counting */

    // Debounced: counting is cheap, but the DOM writes underneath are not, and
    // a fast typist does not need a new tile set per keystroke.
    var timer = null;
    input.addEventListener('input', function () {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(render, 150);
    });

    showStatus('Paste or type some text — every count updates as you go.', 'info');

    return { render: render };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createKeywordCounter = createKeywordCounter;

})(window, document);

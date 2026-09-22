/**
 * ToolStack AI — FAQ Schema Generator engine.
 *
 * Ids required in tools/faq-schema-generator.html:
 *   fqQuestion, fqAnswer, fqAdd, fqList, fqEmpty, fqOutput, fqStats, fqWarnings,
 *   fqResults, fqCopy, fqExample, fqClear, fqStatus
 *
 * Deliberate choices:
 *
 * 1. The output is a bare JSON object with no <script> wrapper. The wrapper is
 *    the same three lines every time and the object is the part worth reading;
 *    the page says what to wrap it in. All the schema tools here do the same.
 *
 * 2. The pairs live in a list rather than one big textarea. Answers contain
 *    blank lines, and a textarea needs a separator convention that somebody
 *    will get wrong — which produces a malformed block that still looks fine
 *    on screen. Adding pairs one at a time cannot be got wrong.
 *
 * 3. JSON.stringify does the escaping, so quotes, apostrophes, angle brackets
 *    and newlines are handled by the same code that browsers use. Hand-rolled
 *    escaping is where these blocks actually break.
 *
 * What the notes are for: the rules Google enforces are about the page, not
 * the JSON — the answer has to be visible, it has to match, and it has to be
 * about the page it sits on. The JSON can be flawless and the markup still
 * rejected, so the honest warnings are the ones about the page.
 */
(function (window, document) {
  'use strict';

  function createFaqSchemaGenerator(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var questionEl = $('fqQuestion');
    var answerEl = $('fqAnswer');
    var addBtn = $('fqAdd');
    var listEl = $('fqList');
    var emptyEl = $('fqEmpty');
    var output = $('fqOutput');
    var statsEl = $('fqStats');
    var warningsEl = $('fqWarnings');
    var results = $('fqResults');
    var statusEl = $('fqStatus');

    if (!questionEl || !answerEl || !output || !results) return null;

    // Long enough to be worth marking up. Below this an answer tends to be a
    // fragment rather than something a reader would call an answer.
    var SHORT_ANSWER = 40;

    // Not a rule from any documentation — a page with thirty marked-up
    // questions is usually a page where the markup has drifted away from what
    // a visitor actually sees.
    var CROWDED = 12;

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

    function trim(text) {
      return String(text == null ? '' : text).replace(/^\s+|\s+$/g, '');
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

    function wordCount(text) {
      var parts = trim(text).split(/\s+/);
      var count = 0;
      for (var i = 0; i < parts.length; i++) {
        if (parts[i] !== '') count++;
      }
      return count;
    }

    function truncate(text, max) {
      if (text.length <= max) return text;
      return text.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
    }

    /* ---------------------------------------------------------------- state */

    // The pairs the reader has added, in the order they added them. Order is
    // preserved in the output because the list is the only ordering signal the
    // page gives them.
    var pairs = [];

    function build() {
      var entities = [];
      for (var i = 0; i < pairs.length; i++) {
        entities.push({
          '@type': 'Question',
          name: pairs[i].question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: pairs[i].answer
          }
        });
      }

      return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: entities
      };
    }

    /* --------------------------------------------------------------- render */

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

    function paintList() {
      if (!listEl) return;

      if (pairs.length === 0) {
        listEl.innerHTML = '';
        if (emptyEl) emptyEl.classList.remove('hidden');
        return;
      }

      if (emptyEl) emptyEl.classList.add('hidden');

      var html = '';
      for (var i = 0; i < pairs.length; i++) {
        html += '<li class="flex items-start gap-3 bg-gray-950 border border-gray-800 rounded-xl p-3">' +
          '<span class="shrink-0 w-6 h-6 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-black flex items-center justify-center">' +
            (i + 1) + '</span>' +
          '<div class="min-w-0 flex-1">' +
            '<p class="text-xs font-bold text-gray-200 break-words">' + escapeHtml(pairs[i].question) + '</p>' +
            '<p class="text-[11px] text-gray-500 mt-1 leading-relaxed break-words">' + escapeHtml(truncate(pairs[i].answer, 140)) + '</p>' +
          '</div>' +
          '<button type="button" data-fq-remove="' + i + '" aria-label="Remove question ' + (i + 1) + '"' +
            ' class="shrink-0 px-2 py-1 rounded-lg border border-gray-800 hover:border-rose-500/40 text-gray-500 hover:text-rose-400 text-[10px] font-bold transition">' +
            '✕</button>' +
          '</li>';
      }
      listEl.innerHTML = html;
    }

    function render() {
      paintList();

      if (pairs.length === 0) {
        results.classList.add('hidden');
        return;
      }

      var block = build();
      var json = JSON.stringify(block, null, 2);
      output.textContent = json;

      var notes = [];

      // Identical questions in one FAQPage describe a page that contradicts
      // itself, and search engines will pick one of them arbitrarily.
      var seenQuestions = {};
      var duplicateQuestions = [];
      for (var d = 0; d < pairs.length; d++) {
        var key = pairs[d].question.toLowerCase();
        if (seenQuestions[key] === true) duplicateQuestions.push(pairs[d].question);
        seenQuestions[key] = true;
      }
      if (duplicateQuestions.length > 0) {
        notes.push([duplicateQuestions.length + ' question' + (duplicateQuestions.length === 1 ? ' is' : 's are') +
          ' in the set more than once: “' + duplicateQuestions.slice(0, 2).join('”, “') +
          '”. Delete the repeat — two identical questions in one FAQPage make the block self-contradictory.', 'warn']);
      }

      var seenAnswers = {};
      var duplicateAnswers = 0;
      for (var a = 0; a < pairs.length; a++) {
        var answerKey = pairs[a].answer.toLowerCase();
        if (seenAnswers[answerKey] === true) duplicateAnswers++;
        seenAnswers[answerKey] = true;
      }
      if (duplicateAnswers > 0) {
        notes.push([duplicateAnswers + ' answer' + (duplicateAnswers === 1 ? ' is' : 's are') +
          ' repeated word for word. Two questions with the same answer usually means the questions are really one question.', 'info']);
      }

      var shortAnswers = [];
      for (var s = 0; s < pairs.length; s++) {
        if (pairs[s].answer.length < SHORT_ANSWER) shortAnswers.push(pairs[s].question);
      }
      if (shortAnswers.length > 0) {
        notes.push([shortAnswers.length + ' answer' + (shortAnswers.length === 1 ? ' is' : 's are') +
          ' under ' + SHORT_ANSWER + ' characters. There is no minimum length, but a markup answer shorter than the question it answers tends to read as a placeholder to anyone who sees it.', 'info']);
      }

      var statements = [];
      for (var q = 0; q < pairs.length; q++) {
        if (pairs[q].question.indexOf('?') === -1) statements.push(pairs[q].question);
      }
      if (statements.length > 0) {
        notes.push([statements.length + ' question' + (statements.length === 1 ? ' does' : 's do') +
          ' not end in a question mark. That is allowed — statement-style headings work — but keep ' +
          'it to what the page\'s own heading says, word for word.', 'info']);
      }

      var withMarkup = [];
      for (var h = 0; h < pairs.length; h++) {
        if (/<[a-z][\s\S]*>/i.test(pairs[h].answer)) withMarkup.push(pairs[h].question);
      }
      if (withMarkup.length > 0) {
        notes.push([withMarkup.length + ' answer' + (withMarkup.length === 1 ? ' contains' : 's contain') +
          ' HTML tags, and they have been escaped — the markup will read the tags aloud as text. Plain text is what the answer property expects.', 'warn']);
      }

      if (pairs.length > CROWDED) {
        notes.push([pairs.length + ' questions is a lot to mark up on one page. There is no limit in the specification, but every pair has to be visible to a visitor, so a set this size is worth a second look before you publish it.', 'info']);
      }

      notes.push(['Google requires every question and answer here to be visible on the page, in these words. If you shortened an answer for the markup, put the full text back on the page or shorten the answer in both places.', 'info']);

      var answerWords = 0;
      for (var w = 0; w < pairs.length; w++) answerWords += wordCount(pairs[w].answer);

      statsEl.innerHTML =
        tile('Questions', String(pairs.length)) +
        tile('Answer words', String(answerWords)) +
        tile('Size', utf8Bytes(json) + ' B');

      var notesHtml = '';
      for (var n = 0; n < notes.length; n++) notesHtml += note(notes[n][0], notes[n][1]);
      warningsEl.innerHTML = notesHtml;

      results.classList.remove('hidden');

      var actions = root.querySelector('[data-ts-result-actions]');
      if (actions && window.ToolStack && window.ToolStack.reveal) {
        window.ToolStack.reveal(actions);
      }

      if (duplicateQuestions.length > 0 || withMarkup.length > 0) {
        showStatus('FAQPage built with ' + pairs.length + ' question' + (pairs.length === 1 ? '' : 's') +
          ' — read the notes before you paste it in.', 'warn');
      } else {
        showStatus('FAQPage built with ' + pairs.length + ' question' + (pairs.length === 1 ? '' : 's') +
          ', ' + answerWords + ' words of answers.', 'ok');
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

    function addPair() {
      var question = trim(questionEl.value);
      var answer = trim(answerEl.value);

      if (question === '' && answer === '') {
        showStatus('Type a question and an answer first.', 'info');
        questionEl.focus();
        return;
      }
      if (question === '') {
        showStatus('The question is empty — the name property is the only part of a Question that Google requires.', 'error');
        questionEl.focus();
        return;
      }
      if (answer === '') {
        showStatus('The answer is empty. An acceptedAnswer with no text is worse than leaving the question out.', 'error');
        answerEl.focus();
        return;
      }

      pairs.push({ question: question, answer: answer });
      questionEl.value = '';
      answerEl.value = '';
      render();
      showStatus('Added. ' + pairs.length + ' question' + (pairs.length === 1 ? '' : 's') +
        ' in the set — add another, or copy the markup below.', 'info');
      questionEl.focus();
    }

    if (addBtn) addBtn.addEventListener('click', addPair);

    // Ctrl/Cmd + Enter in either box adds the pair, which is how a list like
    // this gets filled in without reaching for the mouse between every entry.
    function keyHandler(event) {
      if (event.keyCode !== 13 && event.key !== 'Enter') return;
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      addPair();
    }
    questionEl.addEventListener('keydown', keyHandler);
    answerEl.addEventListener('keydown', keyHandler);

    // Delegated, so a row added by a later render is removable without
    // reattaching anything. Walks up by hand rather than using closest(), which
    // older browsers in this site's support range do not have.
    if (listEl) {
      listEl.addEventListener('click', function (event) {
        var node = event.target;
        var button = null;
        while (node && node !== listEl) {
          if (node.nodeType === 1 && node.getAttribute && node.getAttribute('data-fq-remove') !== null) {
            button = node;
            break;
          }
          node = node.parentNode;
        }
        if (!button) return;

        var index = parseInt(button.getAttribute('data-fq-remove'), 10);
        if (isNaN(index) || index < 0 || index >= pairs.length) return;

        pairs.splice(index, 1);
        render();
        showStatus(pairs.length === 0
          ? 'Removed. The set is empty again.'
          : 'Removed. ' + pairs.length + ' question' + (pairs.length === 1 ? '' : 's') + ' left in the set.', 'info');
      });
    }

    var copyBtn = $('fqCopy');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var json = output.textContent;
        if (!json) {
          showStatus('Nothing to copy yet — add a question first.', 'warn');
          return;
        }
        var original = copyBtn.textContent;
        copyText(json, function (ok) {
          copyBtn.textContent = ok ? '✅ Copied!' : 'Copy failed';
          window.setTimeout(function () { copyBtn.textContent = original; }, 2000);
          if (!ok) showStatus('Copy failed — select the JSON above and copy it manually.', 'error');
        });
      });
    }

    // Answers deliberately include an apostrophe, a curly quote, a double
    // quote and a line break, because those are the four characters that break
    // a hand-written FAQ block — and none of them break this one.
    var EXAMPLE = [
      {
        question: 'Do you ship internationally?',
        answer: 'Yes. We ship to every country except those under export restrictions, and orders leave the warehouse within one working day.\n\nDelivery is 3-5 working days within the UK and 7-14 days elsewhere.'
      },
      {
        question: 'What is your returns policy?',
        answer: 'You can return anything within 30 days of delivery for a full refund, including the original postage. Items need to be unused — “as new” is the standard we apply, and we do not charge a restocking fee.'
      },
      {
        question: 'Can I change my order after placing it?',
        answer: 'If the order has not shipped, yes. Reply to your confirmation email with the change and we will apply it before dispatch. Once it has left the warehouse the order cannot be altered, but you can return it under the 30-day policy.'
      }
    ];

    var exampleBtn = $('fqExample');
    if (exampleBtn) {
      exampleBtn.addEventListener('click', function () {
        pairs = [];
        for (var i = 0; i < EXAMPLE.length; i++) {
          pairs.push({ question: EXAMPLE[i].question, answer: EXAMPLE[i].answer });
        }
        questionEl.value = '';
        answerEl.value = '';
        render();
        showStatus('Example loaded — three shipping and returns questions, one of them with a line break and curly quotes in the answer.', 'info');
      });
    }

    var clearBtn = $('fqClear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        pairs = [];
        questionEl.value = '';
        answerEl.value = '';
        output.textContent = '';
        render();
        showStatus('Cleared. Add a question and an answer to start again.', 'info');
      });
    }

    render();
    showStatus('Add a question and its answer, then press Add question. The JSON-LD builds as you go.', 'info');

    return { render: render };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createFaqSchemaGenerator = createFaqSchemaGenerator;

})(window, document);

/**
 * ToolStack AI — Yes or No engine.
 *
 * Ids required in tools/yes-or-no.html:
 *   ynStatus, ynQuestion, ynAskBtn, ynClearBtn, ynCopyBtn, ynResults,
 *   ynAnswer, ynMeta, ynHistory
 *
 * A straight fifty-fifty, with one addition that the format usually lacks: it
 * counts how many times you have asked. Asking a yes-or-no question four times
 * is not a search for information, it is a search for permission, and the page
 * says so rather than pretending the fourth answer is more considered than the
 * first.
 *
 * There is no weighting, no "certainty" score, and no hidden bias in favour of
 * yes. A coin that leans is a coin that lies, and the entire value of a tool
 * like this is that it does not care what you want.
 */
(function (window, document) {
  'use strict';

  var MAX_QUESTION = 120;

  function createYesOrNo(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var questionEl = $('ynQuestion');
    var askBtn = $('ynAskBtn');
    var clearBtn = $('ynClearBtn');
    var copyBtn = $('ynCopyBtn');
    var resultsEl = $('ynResults');
    var answerEl = $('ynAnswer');
    var metaEl = $('ynMeta');
    var historyEl = $('ynHistory');
    var statusEl = $('ynStatus');

    if (!askBtn || !resultsEl || !answerEl) return null;

    var status = fun.makeStatus(statusEl);
    var history = [];
    var asked = 0;      // times the current question has been asked
    var lastQuestion = '';

    function renderHistory() {
      if (!historyEl) return;
      historyEl.innerHTML = '';

      if (!history.length) {
        var empty = document.createElement('p');
        empty.className = 'text-[11px] text-gray-500';
        empty.textContent = 'Nothing asked yet.';
        historyEl.appendChild(empty);
        return;
      }

      history.slice(-8).reverse().forEach(function (entry, i) {
        var row = fun.row(entry.a, entry.q || 'Question ' + (history.length - i));
        var value = row.lastChild;
        if (value) {
          value.classList.add(entry.a === 'YES' ? 'text-emerald-400' : 'text-rose-400');
        }
        historyEl.appendChild(row);
      });
    }

    /* The count is the honest part of this tool. It is also the only thing here
     * that is not random, which is a nice inversion: the answer is noise, the
     * tally of how many times you have asked is a real fact about you. */
    function renderMeta() {
      if (!metaEl) return;
      if (asked <= 0) {
        metaEl.textContent = '';
        return;
      }

      var yes = 0;
      history.forEach(function (entry) { if (entry.a === 'YES') yes += 1; });
      var distinct = history.length - yes;

      var text = 'Asked ' + asked + (asked === 1 ? ' time' : ' times') + ' on this question.';
      if (asked === 1) {
        text += ' That is the answer. Asking again will not make it better informed.';
      } else if (yes === 0 || distinct === 0) {
        text += ' It has come out the same way every time, which is what a coin does sometimes.';
      } else if (yes === distinct) {
        text += ' It has split evenly, which is the most likely thing to happen.';
      } else {
        text += ' It has changed its mind ' + Math.min(yes, distinct) + ' time' +
          (Math.min(yes, distinct) === 1 ? '' : 's') + '. It was never tracking anything.';
      }

      if (asked >= 4) {
        text += ' You have asked four or more times, which usually means you already know which answer you were hoping for.';
      }

      metaEl.textContent = text;
    }

    function ask() {
      var question = fun.inputValue(questionEl, '') || '';
      question = question.slice(0, MAX_QUESTION);

      /* A repeat of the same question increments the counter. A new question
       * resets it, because the tally is about persistence on one decision, not
       * about how many questions you have asked in total. */
      if (question && question === lastQuestion) asked += 1;
      else { asked = 1; lastQuestion = question; }

      var answer = Math.random() < 0.5 ? 'YES' : 'NO';

      history.push({ q: question, a: answer });
      if (history.length > 40) history.shift();

      resultsEl.classList.remove('hidden');
      answerEl.textContent = answer;
      answerEl.className = 'text-5xl font-black tracking-tight ' +
        (answer === 'YES' ? 'text-emerald-400' : 'text-rose-400');

      renderMeta();
      renderHistory();
      status.hide();
    }

    askBtn.addEventListener('click', ask);

    if (questionEl) {
      questionEl.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          ask();
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        history = [];
        asked = 0;
        lastQuestion = '';
        if (questionEl) questionEl.value = '';
        resultsEl.classList.add('hidden');
        answerEl.textContent = '';
        renderMeta();
        renderHistory();
        status.show('Cleared. Every answer so far is gone.', 'info');
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!history.length) {
          status.show('Ask something first.', 'warn');
          return;
        }
        var last = history[history.length - 1];
        var text = last.q ? last.q + '\n\n' + last.a : 'The answer is ' + last.a;
        fun.copy(text, status);
      });
    }

    renderHistory();
    status.show('Type the question if you want it recorded, then ask. The answer is a fair coin.', 'info');

    return { ask: ask, history: function () { return history.slice(); } };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createYesOrNo = createYesOrNo;
})(window, document);

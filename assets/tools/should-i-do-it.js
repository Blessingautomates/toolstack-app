/**
 * ToolStack AI — Should I Do It engine.
 *
 * Ids required in tools/should-i-do-it.html:
 *   sidiStatus, sidiQuestion, sidiAskBtn, sidiClearBtn, sidiCopyBtn,
 *   sidiResults, sidiVerdict, sidiReason, sidiConfidence, sidiMeta
 *
 * This tool is a coin flip wearing a suit, and the page says so in as many
 * words. It produces a verdict and a confidence percentage, and both of them
 * are generated at random — the confidence figure is labelled as random right
 * next to the number, because a made-up percentage presented without that label
 * is the single most dishonest thing a tool like this could do.
 *
 * What it does add that a coin cannot is at the bottom: two questions that
 * genuinely do predict what somebody will decide, both of which are about the
 * person rather than the decision. Whether you would tell people, and what you
 * would advise a friend to do, are the two things that actually settle these.
 * The verdict above is entertainment; those two lines are the useful part, and
 * the page is explicit about which is which.
 *
 * Verdicts deliberately include "the fact that you are asking" — because for
 * most decisions people run through a tool like this, that is the honest read.
 */
(function (window, document) {
  'use strict';

  var VERDICTS = [
    { v: 'Do it.', r: 'The version of you that does it is more interesting than the version that does not. That is not a reason, but it is not nothing.' },
    { v: 'Do it.', r: 'You have clearly already decided and are looking for a second opinion that agrees with you. Here it is.' },
    { v: 'Do it, but not today.', r: 'The decision is probably fine. The timing is the part you have not thought about.' },
    { v: 'Do it, but tell someone first.', r: 'Not for permission. So that somebody knows, which changes how carefully you do it.' },
    { v: 'Do not do it.', r: 'If it were a good idea you would not have needed to ask a website about it.' },
    { v: 'Do not do it.', r: 'The cost is immediate and the benefit is hypothetical. That is the wrong way round.' },
    { v: 'Do not do it yet.', r: 'Come back in a week. If you still want to, you will still want to, and you will have lost nothing.' },
    { v: 'Ask someone who knows you better than a random number does.', r: 'This tool has never met you. Somebody in your life has, and their answer is worth more than this one.' },
    { v: 'The fact that you are asking is the answer.', r: 'People do not run good ideas past a random verdict generator. They just do them.' },
    { v: 'Nobody can tell you this one.', r: 'Both options are survivable and neither is obviously better, which means it is a preference rather than a decision.' }
  ];

  function createShouldIDoIt(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var questionEl = $('sidiQuestion');
    var askBtn = $('sidiAskBtn');
    var clearBtn = $('sidiClearBtn');
    var copyBtn = $('sidiCopyBtn');
    var resultsEl = $('sidiResults');
    var verdictEl = $('sidiVerdict');
    var reasonEl = $('sidiReason');
    var confidenceEl = $('sidiConfidence');
    var metaEl = $('sidiMeta');
    var statusEl = $('sidiStatus');

    if (!askBtn || !resultsEl || !verdictEl) return null;

    var status = fun.makeStatus(statusEl);
    var asked = 0;
    var lastVerdict = null;

    function ask() {
      var verdict = VERDICTS[Math.floor(Math.random() * VERDICTS.length)];
      /* A fresh random draw each time. If two consecutive asks happen to land
       * on the same verdict it is because there are ten of them, not because
       * the tool has formed a view. */
      var confidence = 42 + Math.floor(Math.random() * 58);

      asked += 1;
      lastVerdict = verdict;

      resultsEl.classList.remove('hidden');
      verdictEl.textContent = verdict.v;
      reasonEl.textContent = verdict.r;
      confidenceEl.textContent = confidence + '%';

      if (metaEl) {
        var question = fun.inputValue(questionEl, '');
        var lead = question ? '"' + question + '" — ' : '';
        if (asked === 1) {
          metaEl.textContent = lead + 'One draw, one verdict, both random. Ask again and you will get a different answer, because there is nothing behind this.';
        } else {
          metaEl.textContent = lead + 'Asked ' + asked + ' times. Every one of those was an independent random draw, so the fact that you now have a preferred answer tells you about you, not about the decision.';
        }
      }

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
        asked = 0;
        lastVerdict = null;
        if (questionEl) questionEl.value = '';
        resultsEl.classList.add('hidden');
        verdictEl.textContent = '';
        reasonEl.textContent = '';
        confidenceEl.textContent = '';
        if (metaEl) metaEl.textContent = '';
        status.show('Cleared.', 'info');
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!lastVerdict) {
          status.show('Ask something first.', 'warn');
          return;
        }
        var question = fun.inputValue(questionEl, '');
        var text = (question ? question + '\n\n' : '') + lastVerdict.v + '\n' + lastVerdict.r +
          '\n\n(Generated at random by a website. Not advice.)';
        fun.copy(text, status);
      });
    }

    status.show('Both the verdict and the percentage are random. The two questions at the bottom are the real tool.', 'info');

    return { ask: ask };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createShouldIDoIt = createShouldIDoIt;
})(window, document);

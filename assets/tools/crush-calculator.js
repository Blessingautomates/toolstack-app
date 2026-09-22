/**
 * ToolStack AI — Crush Calculator engine.
 *
 * Ids required in tools/crush-calculator.html:
 *   crushStatus, crushYourName, crushTheirName, crushCalcBtn, crushClearBtn,
 *   crushResults, crushScore, crushVerdict, crushWorking, crushCopyBtn
 *
 * What this is: a name game. It takes two names, counts the letters they have
 * in common, mixes in a fixed numeric hash of the two names, and prints a
 * number between 1 and 99. That is the entire mechanism, and the result screen
 * shows the working so nobody has to guess what happened.
 *
 * What this is not: a prediction. It cannot know anything about a person from
 * their name. It cannot tell you whether someone likes you, whether you should
 * say something, or how anything will go. The page says this plainly and the
 * verdict text says it again, because a number that looks like a measurement
 * is exactly the kind of thing somebody might act on.
 *
 * Two deliberate properties:
 *
 * 1. It is deterministic. The same two names always produce the same number,
 *    forever. That is a feature — a calculator that gave you a different answer
 *    each time you pressed the button would be obviously, insultingly random,
 *    and this way the number at least feels like it belongs to the two names.
 *
 * 2. It is symmetric in the letters but not in the hash, so "sam" and "alex"
 *    share their letter overlap in either order. The order only shifts the
 *    hash component, which is noise either way.
 *
 * Names are normalised to a-z before anything happens, so accents, spaces,
 * hyphens and emoji are stripped rather than causing an error. A name the tool
 * does not recognise still produces a sensible result — there is no fallback
 * that reads as a joke at the user's expense.
 */
(function (window, document) {
  'use strict';

  var VERDICTS = [
    { min: 1, max: 29, name: 'School-yard shrug', text: 'The letters do not have much to say to each other. This is a fact about spelling and nothing else.' },
    { min: 30, max: 54, name: 'Mild sparks', text: 'A middling number from a middling overlap. It is a name game; it has no opinion about the actual situation.' },
    { min: 55, max: 74, name: 'Noticeable overlap', text: 'Your names share a good few letters, which is genuinely all this measures. Whether you do anything about it is not a question a calculator can help with.' },
    { min: 75, max: 100, name: 'Statistically implausible', text: 'A very high number, produced by a very arbitrary formula. Enjoy it, and remember that the formula is counting letters.' }
  ];

  function createCrushCalculator(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var yourEl = $('crushYourName');
    var theirEl = $('crushTheirName');
    var calcBtn = $('crushCalcBtn');
    var clearBtn = $('crushClearBtn');
    var copyBtn = $('crushCopyBtn');
    var resultsEl = $('crushResults');
    var scoreEl = $('crushScore');
    var verdictEl = $('crushVerdict');
    var workingEl = $('crushWorking');
    var statusEl = $('crushStatus');

    if (!calcBtn || !resultsEl || !scoreEl || !yourEl || !theirEl) return null;

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

    function hideStatus() {
      if (statusEl) statusEl.classList.add('hidden');
    }

    /** Lowercase a-z only. Accents, spaces and punctuation are dropped rather
     *  than rejected, so any name at all produces a usable result. */
    function normalise(value) {
      return String(value || '')
        .toLowerCase()
        .replace(/[^a-z]/g, '');
    }

    function distinctLetters(name) {
      var seen = {};
      var out = [];
      for (var i = 0; i < name.length; i++) {
        var ch = name.charAt(i);
        if (!seen[ch]) {
          seen[ch] = true;
          out.push(ch);
        }
      }
      return out;
    }

    /** Fixed, seedless hash. Deterministic by construction — no Date, no
     *  Math.random — which is what makes the same two names always agree. */
    function hash(text) {
      var h = 7;
      for (var i = 0; i < text.length; i++) {
        h = (h * 31 + text.charCodeAt(i)) % 1000003;
      }
      return h;
    }

    function compute(a, b) {
      var yourLetters = distinctLetters(a);
      var theirLetters = distinctLetters(b);

      var shared = yourLetters.filter(function (ch) {
        return theirLetters.indexOf(ch) !== -1;
      });

      var ratio = yourLetters.length ? shared.length / yourLetters.length : 0;
      var overlapPart = Math.round(ratio * 60);
      var hashPart = hash(a + '|' + b) % 40;

      var score = overlapPart + hashPart + 1;
      if (score < 1) score = 1;
      if (score > 99) score = 99;

      return {
        score: score,
        shared: shared,
        yourLetters: yourLetters,
        theirLetters: theirLetters,
        overlapPart: overlapPart,
        hashPart: hashPart
      };
    }

    function verdictFor(score) {
      for (var i = 0; i < VERDICTS.length; i++) {
        if (score >= VERDICTS[i].min && score <= VERDICTS[i].max) return VERDICTS[i];
      }
      return VERDICTS[VERDICTS.length - 1];
    }

    function calculate() {
      var a = normalise(yourEl.value);
      var b = normalise(theirEl.value);

      if (!a || !b) {
        showStatus('Both names need at least one letter. Numbers and symbols do not count.', 'warn');
        return;
      }

      var result = compute(a, b);
      var verdict = verdictFor(result.score);

      hideStatus();
      scoreEl.textContent = result.score + '%';
      if (verdictEl) verdictEl.textContent = verdict.name + '. ' + verdict.text;

      /* The working is shown rather than hidden. A number nobody can account
       * for invites people to believe it; a number with its arithmetic on
       * display is much harder to take seriously, which is the point. */
      if (workingEl) {
        workingEl.innerHTML = '';

        var lines = [
          'Letters in your name: ' + (result.yourLetters.join(', ') || 'none'),
          'Letters in their name: ' + (result.theirLetters.join(', ') || 'none'),
          'Letters you share: ' + (result.shared.length ? result.shared.join(', ') : 'none') +
            ' (' + result.shared.length + ')',
          'Letter overlap contributes ' + result.overlapPart + ' points.',
          'The name hash contributes ' + result.hashPart + ' points.',
          'Total: ' + result.score + ', capped to the 1–99 range.'
        ];

        lines.forEach(function (line) {
          var p = document.createElement('p');
          p.className = 'text-[11px] text-gray-400 leading-relaxed';
          p.textContent = line;
          workingEl.appendChild(p);
        });
      }

      resultsEl.classList.remove('hidden');
    }

    calcBtn.addEventListener('click', calculate);

    // Enter in either field runs it, since this is a two-field form and reaching
    // for the mouse to submit one is friction nobody wants.
    [yourEl, theirEl].forEach(function (el) {
      el.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          calculate();
        }
      });
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        yourEl.value = '';
        theirEl.value = '';
        resultsEl.classList.add('hidden');
        hideStatus();
        yourEl.focus();
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var score = scoreEl.textContent;
        if (!score) {
          showStatus('Work out a score first.', 'warn');
          return;
        }
        var text = score + ' according to a name game that counts letters. No actual meaning was measured.';
        var copy = window.ToolStack && window.ToolStack.copyText;
        if (!copy) {
          showStatus('Copying is unavailable in this browser.', 'error');
          return;
        }
        copy(text, function (ok) {
          if (ok) showStatus('Copied.', 'ok');
          else showStatus('Could not reach the clipboard. Select the text and copy it manually.', 'error');
        });
      });
    }

    return { calculate: calculate };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createCrushCalculator = createCrushCalculator;
})(window, document);

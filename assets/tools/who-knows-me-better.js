/**
 * ToolStack AI — Who Knows Me Better engine.
 *
 * Ids required in tools/who-knows-me-better.html:
 *   wkmbStatus, wkmbIntro, wkmbStartBtn, wkmbQuiz, wkmbRole, wkmbProgress,
 *   wkmbBar, wkmbQuestion, wkmbOptions, wkmbResults, wkmbBoard, wkmbVerdict,
 *   wkmbBreakdown, wkmbRestartBtn
 *
 * This is a three-pass party game rather than a quiz, which is what makes it a
 * different tool from the friendship test and the best friend quiz. The subject
 * answers ten questions about themselves first; two other people then guess the
 * same ten, one after the other; and the result is a leaderboard of who read the
 * subject more accurately.
 *
 * The pass structure is the whole design, so it is worth being careful with:
 * every pass stores into its own array, and the scoring compares each guesser
 * against pass zero. Nothing is shown between passes except which pass is
 * running, because a leaderboard that leaks mid-game ruins the game.
 *
 * The questions are all preferences and habits. None of them ask the subject to
 * reveal anything personal, and none of them can produce an embarrassing answer
 * — a party game that puts somebody on the spot is a bad party game.
 *
 * On results: the board says who guessed more of ten preferences correctly. It
 * does not say who is the better friend, and the copy is written so that nobody
 * reads it that way.
 */
(function (window, document) {
  'use strict';

  var QUESTIONS = [
    { q: 'My ideal holiday is…', a: ['Beach', 'City break', 'Mountains', 'Staying at home'] },
    { q: 'Sweet or savoury?', a: ['Sweet', 'Savoury'] },
    { q: 'My music is usually…', a: ['Pop', 'Rock', 'Hip-hop', 'Podcasts, honestly'] },
    { q: 'I would rather…', a: ['A night in', 'A night out'] },
    { q: 'My perfect pet would be…', a: ['A dog', 'A cat', 'Something scaly', 'None, thanks'] },
    { q: 'I am more of a…', a: ['Early bird', 'Night owl'] },
    { q: 'My go-to drink is…', a: ['Coffee', 'Tea', 'Something fizzy', 'Water'] },
    { q: 'On a free evening I am…', a: ['Out with people', 'Home with a series', 'Gaming', 'Reading'] },
    { q: 'My alarm is set for…', a: ['Before 7', '7 to 8', '8 to 9', 'I do not use an alarm'] },
    { q: 'I would rather be given…', a: ['Something thoughtful', 'Money towards a thing', 'A trip', 'A surprise'] }
  ];

  var ROLES = ['the subject', 'Player 2', 'Player 3'];

  function createWhoKnowsMeBetter(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var introEl = $('wkmbIntro');
    var startBtn = $('wkmbStartBtn');
    var quizEl = $('wkmbQuiz');
    var roleEl = $('wkmbRole');
    var progressEl = $('wkmbProgress');
    var barEl = $('wkmbBar');
    var questionEl = $('wkmbQuestion');
    var optionsEl = $('wkmbOptions');
    var resultsEl = $('wkmbResults');
    var boardEl = $('wkmbBoard');
    var verdictEl = $('wkmbVerdict');
    var breakdownEl = $('wkmbBreakdown');
    var restartBtn = $('wkmbRestartBtn');
    var statusEl = $('wkmbStatus');

    if (!startBtn || !quizEl || !optionsEl || !resultsEl) return null;

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

    /* One array per pass: [0] is the truth, [1] and [2] are the guesses. */
    var passes = [[], [], []];
    var pass = 0;
    var index = 0;

    function renderQuestion() {
      var question = QUESTIONS[index];
      if (!question) return;

      if (roleEl) roleEl.textContent = ROLES[pass];
      if (progressEl) {
        progressEl.textContent =
          'Question ' + (index + 1) + ' of ' + QUESTIONS.length +
          ' · pass ' + (pass + 1) + ' of 3';
      }
      if (barEl) {
        var done = pass * QUESTIONS.length + index;
        barEl.style.width = Math.round((done / (QUESTIONS.length * 3)) * 100) + '%';
      }
      if (questionEl) questionEl.textContent = question.q;

      optionsEl.innerHTML = '';
      question.a.forEach(function (label, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className =
          'w-full text-left px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 ' +
          'hover:border-brand-500 hover:bg-gray-900 text-sm text-gray-300 ' +
          'hover:text-gray-100 transition font-medium';
        btn.textContent = label;
        btn.addEventListener('click', function () { choose(i); });
        optionsEl.appendChild(btn);
      });
    }

    function choose(optionIndex) {
      passes[pass][index] = optionIndex;
      index += 1;

      if (index >= QUESTIONS.length) {
        index = 0;
        pass += 1;
        if (pass > 2) {
          finish();
          return;
        }
        // A handover prompt between passes, so the next player picks up a clean
        // screen without having seen any of the previous answers.
        showStatus(
          pass === 1
            ? 'Over to Player 2. Guess how the subject answered.'
            : 'Over to Player 3. Last round — no conferring.',
          'info'
        );
      }
      renderQuestion();
    }

    function finish() {
      var truth = passes[0];
      var scores = [0, 0];
      for (var p = 1; p <= 2; p++) {
        for (var i = 0; i < QUESTIONS.length; i++) {
          if (passes[p][i] === truth[i]) scores[p - 1] += 1;
        }
      }

      quizEl.classList.add('hidden');
      resultsEl.classList.remove('hidden');
      if (barEl) barEl.style.width = '100%';

      if (boardEl) {
        boardEl.innerHTML = '';
        var rows = [
          { name: 'Player 2', value: scores[0] },
          { name: 'Player 3', value: scores[1] }
        ];
        var best = Math.max(scores[0], scores[1]);

        rows.forEach(function (row) {
          var card = document.createElement('div');
          card.className = 'bg-gray-950 border rounded-xl p-4 text-center ' +
            (row.value === best && scores[0] !== scores[1]
              ? 'border-brand-500'
              : 'border-gray-800');

          var label = document.createElement('p');
          label.className = 'text-[11px] uppercase tracking-wider text-gray-500 font-bold';
          label.textContent = row.name;

          var value = document.createElement('p');
          value.className = 'text-3xl font-black text-gray-50 mt-1';
          value.textContent = row.value + ' / ' + QUESTIONS.length;

          card.appendChild(label);
          card.appendChild(value);
          boardEl.appendChild(card);
        });
      }

      if (verdictEl) {
        if (scores[0] === scores[1]) {
          verdictEl.textContent =
            'A dead heat on ' + scores[0] + ' out of ' + QUESTIONS.length +
            '. Nobody read the subject better this time — which is a result in itself.';
        } else {
          var winner = scores[0] > scores[1] ? 'Player 2' : 'Player 3';
          var loser = scores[0] > scores[1] ? 'Player 3' : 'Player 2';
          verdictEl.textContent =
            winner + ' read the subject more accurately, ' + Math.max(scores[0], scores[1]) +
            ' to ' + Math.min(scores[0], scores[1]) + '. That is a fact about ten preferences, ' +
            'not about who ' + loser + ' is as a person.';
        }
      }

      if (breakdownEl) {
        breakdownEl.innerHTML = '';
        QUESTIONS.forEach(function (question, i) {
          var row = document.createElement('div');
          row.className = 'py-2.5 border-b border-gray-800 last:border-0';

          var q = document.createElement('p');
          q.className = 'text-[11px] text-gray-500';
          q.textContent = question.q;

          var truthLine = document.createElement('p');
          truthLine.className = 'text-xs text-gray-200 mt-1 font-medium';
          truthLine.textContent = 'Truth: ' + question.a[passes[0][i]];

          var guesses = document.createElement('p');
          guesses.className = 'text-xs text-gray-400 mt-1';
          var parts = [];
          for (var p = 1; p <= 2; p++) {
            var right = passes[p][i] === passes[0][i];
            parts.push(
              'Player ' + (p + 1) + ': ' + question.a[passes[p][i]] + (right ? ' ✓' : ' ✗')
            );
          }
          guesses.textContent = parts.join('   ·   ');

          row.appendChild(q);
          row.appendChild(truthLine);
          row.appendChild(guesses);
          breakdownEl.appendChild(row);
        });
      }

      hideStatus();
    }

    function start() {
      passes = [[], [], []];
      pass = 0;
      index = 0;
      if (introEl) introEl.classList.add('hidden');
      resultsEl.classList.add('hidden');
      quizEl.classList.remove('hidden');
      showStatus('Player 2 and Player 3, look away. The subject answers first, and nobody sees these.', 'info');
      renderQuestion();
    }

    startBtn.addEventListener('click', start);

    if (restartBtn) {
      restartBtn.addEventListener('click', function () {
        resultsEl.classList.add('hidden');
        quizEl.classList.add('hidden');
        if (introEl) introEl.classList.remove('hidden');
        if (barEl) barEl.style.width = '0%';
        hideStatus();
      });
    }

    return { start: start };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createWhoKnowsMeBetter = createWhoKnowsMeBetter;
})(window, document);

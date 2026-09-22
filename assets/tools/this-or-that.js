/**
 * ToolStack AI — This or That engine.
 *
 * Ids required in tools/this-or-that.html:
 *   totStatus, totIntro, totStartBtn, totQuiz, totProgress, totBar,
 *   totOptionA, totOptionB, totResults, totSummary, totProfile, totPicks,
 *   totRestartBtn, totCopyBtn
 *
 * A rapid run rather than a draw. Twelve pairs are pulled at random from the
 * pool, you pick one side of each with no going back, and at the end you get a
 * summary of which way you leaned in each category you happened to see.
 *
 * Two deliberate choices:
 *
 * 1. No back button. The whole point of this format is the speed — the first
 *    answer is the honest one, and a back button turns a two-second decision
 *    into a two-minute one. The restart button is there if the run goes wrong.
 *
 * 2. Only twelve of the pairs are used in a run, chosen fresh each time, so
 *    two runs are different. The summary reports the categories actually seen
 *    rather than all of them, because a category you were never asked about
 *    has nothing to report.
 *
 * The summary is a description of the twelve taps you made. It is not a
 * personality profile and the page does not call it one — it says which way
 * you leaned on a handful of arbitrary preferences, which is all it knows.
 */
(function (window, document) {
  'use strict';

  var ROUNDS = 12;

  var PAIRS = [
    { c: 'food', a: 'Sweet', b: 'Savoury' },
    { c: 'food', a: 'Coffee', b: 'Tea' },
    { c: 'food', a: 'Cook at home', b: 'Order in' },
    { c: 'food', a: 'Starter', b: 'Dessert' },
    { c: 'food', a: 'Sparkling water', b: 'Still water' },
    { c: 'food', a: 'Breakfast', b: 'Brunch' },

    { c: 'travel', a: 'Beach', b: 'Mountains' },
    { c: 'travel', a: 'City break', b: 'Quiet countryside' },
    { c: 'travel', a: 'Window seat', b: 'Aisle seat' },
    { c: 'travel', a: 'Plan everything', b: 'Wing it' },
    { c: 'travel', a: 'Long trip, one place', b: 'Short trip, many places' },
    { c: 'travel', a: 'Fly', b: 'Train' },

    { c: 'evenings', a: 'Night in', b: 'Night out' },
    { c: 'evenings', a: 'Film', b: 'Series' },
    { c: 'evenings', a: 'Early night', b: 'Late night' },
    { c: 'evenings', a: 'Book', b: 'Podcast' },
    { c: 'evenings', a: 'Cook properly', b: 'Something quick' },
    { c: 'evenings', a: 'Music on', b: 'Total quiet' },

    { c: 'work', a: 'Early start', b: 'Late finish' },
    { c: 'work', a: 'Long list', b: 'One big task' },
    { c: 'work', a: 'Work from home', b: 'Work in an office' },
    { c: 'work', a: 'Message', b: 'Call' },
    { c: 'work', a: 'Plan first', b: 'Start and adjust' },
    { c: 'work', a: 'Deadline pressure', b: 'Plenty of time' },

    { c: 'taste', a: 'Films', b: 'Books' },
    { c: 'taste', a: 'Comedy', b: 'Thriller' },
    { c: 'taste', a: 'Live music', b: 'Recorded' },
    { c: 'taste', a: 'Factual', b: 'Fiction' },
    { c: 'taste', a: 'Cinema', b: 'Sofa' },
    { c: 'taste', a: 'Chart music', b: 'Something older' },

    { c: 'weekend', a: 'Busy', b: 'Nothing planned' },
    { c: 'weekend', a: 'Outdoors', b: 'Indoors' },
    { c: 'weekend', a: 'See people', b: 'Time alone' },
    { c: 'weekend', a: 'Lie in', b: 'Up and out' },
    { c: 'weekend', a: 'Tidy up', b: 'Leave it' },
    { c: 'weekend', a: 'Day trip', b: 'Stay local' }
  ];

  var CATEGORY_LABELS = {
    food: 'Food and drink',
    travel: 'Travel',
    evenings: 'Evenings',
    work: 'Work',
    taste: 'Films, music and books',
    weekend: 'Weekends'
  };

  function createThisOrThat(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var introEl = $('totIntro');
    var startBtn = $('totStartBtn');
    var quizEl = $('totQuiz');
    var progressEl = $('totProgress');
    var barEl = $('totBar');
    var optionAEl = $('totOptionA');
    var optionBEl = $('totOptionB');
    var resultsEl = $('totResults');
    var summaryEl = $('totSummary');
    var profileEl = $('totProfile');
    var picksEl = $('totPicks');
    var restartBtn = $('totRestartBtn');
    var copyBtn = $('totCopyBtn');
    var statusEl = $('totStatus');

    if (!startBtn || !quizEl || !optionAEl || !optionBEl || !resultsEl) return null;

    var status = fun.makeStatus(statusEl);

    var run = [];      // the twelve pairs for this run
    var picks = [];    // parallel array of 'a' or 'b'
    var index = 0;

    function renderRound() {
      var pair = run[index];
      if (!pair) return;

      if (progressEl) progressEl.textContent = 'Round ' + (index + 1) + ' of ' + ROUNDS;
      if (barEl) barEl.style.width = Math.round((index / ROUNDS) * 100) + '%';
      optionAEl.textContent = pair.a;
      optionBEl.textContent = pair.b;
    }

    function choose(side) {
      picks[index] = side;
      index += 1;
      if (index >= run.length) finish();
      else renderRound();
    }

    function finish() {
      quizEl.classList.add('hidden');
      resultsEl.classList.remove('hidden');
      if (barEl) barEl.style.width = '100%';

      var countA = 0;
      picks.forEach(function (p) { if (p === 'a') countA += 1; });
      var countB = picks.length - countA;

      if (summaryEl) {
        summaryEl.textContent = countA + ' first options, ' + countB + ' second options, across ' +
          picks.length + ' rounds.';
      }

      /* The profile reports per category, and only for categories that came up.
       * A category with no rounds has nothing to say, and printing "0 of 0"
       * for it would be noise pretending to be data. */
      if (profileEl) {
        profileEl.innerHTML = '';
        var byCategory = {};
        run.forEach(function (pair, i) {
          if (!byCategory[pair.c]) byCategory[pair.c] = { a: 0, b: 0, n: 0 };
          byCategory[pair.c][picks[i]] += 1;
          byCategory[pair.c].n += 1;
        });

        Object.keys(byCategory).forEach(function (key) {
          var data = byCategory[key];
          var lean;
          if (data.a === data.b) lean = 'Split down the middle';
          else if (data.a > data.b) lean = 'Leaned towards the first option';
          else lean = 'Leaned towards the second option';

          profileEl.appendChild(
            fun.row(CATEGORY_LABELS[key] || key, lean + ' (' + data.n + ' round' + (data.n === 1 ? '' : 's') + ')')
          );
        });
      }

      if (picksEl) {
        picksEl.innerHTML = '';
        run.forEach(function (pair, i) {
          var chosen = picks[i] === 'a' ? pair.a : pair.b;
          picksEl.appendChild(fun.row(CATEGORY_LABELS[pair.c] || pair.c, chosen));
        });
      }

      status.hide();
    }

    function start() {
      // Shuffle the whole pool, then take a prefix. Shuffling first and slicing
      // is what guarantees the twelve are distinct — picking at random twelve
      // times could hand back the same pair twice.
      run = fun.shuffle(PAIRS).slice(0, ROUNDS);
      picks = [];
      index = 0;

      if (introEl) introEl.classList.add('hidden');
      resultsEl.classList.add('hidden');
      quizEl.classList.remove('hidden');
      status.hide();
      renderRound();
    }

    /* ------------------------------------------------------------- wiring */

    startBtn.addEventListener('click', start);

    [optionAEl, optionBEl].forEach(function (el, i) {
      el.addEventListener('click', function () { choose(i === 0 ? 'a' : 'b'); });
    });

    // 1 and 2 pick a side from the keyboard, which is what makes a twelve-round
    // run feel like a run rather than twelve trips to the mouse.
    document.addEventListener('keydown', function (event) {
      if (quizEl.classList.contains('hidden')) return;
      if (event.key === '1') { event.preventDefault(); choose('a'); }
      if (event.key === '2') { event.preventDefault(); choose('b'); }
    });

    if (restartBtn) {
      restartBtn.addEventListener('click', function () {
        resultsEl.classList.add('hidden');
        quizEl.classList.add('hidden');
        if (introEl) introEl.classList.remove('hidden');
        if (barEl) barEl.style.width = '0%';
        status.hide();
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!picks.length) {
          status.show('Do a run first, then copy the result.', 'warn');
          return;
        }
        var lines = run.map(function (pair, i) {
          return (CATEGORY_LABELS[pair.c] || pair.c) + ': ' +
            (picks[i] === 'a' ? pair.a : pair.b);
        });
        fun.copy('This or That — my picks:\n' + lines.join('\n'), status);
      });
    }

    return { start: start };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createThisOrThat = createThisOrThat;
})(window, document);

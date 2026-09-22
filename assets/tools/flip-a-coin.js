/**
 * ToolStack AI — Flip a Coin engine.
 *
 * Ids required in tools/flip-a-coin.html:
 *   coinStatus, coinFlipBtn, coinBulkBtn, coinResetBtn, coinCopyBtn,
 *   coinResults, coinFace, coinHeadsCount, coinTailsCount, coinStreak,
 *   coinHistory, coinMeta
 *
 * A single fair flip, plus the tally that makes it worth using more than once:
 * running heads and tails counts, the current streak, and the last twenty
 * results. The streak is the interesting number — people are reliably bad at
 * judging whether a sequence is random, and a visible run of five heads is a
 * much better demonstration of what randomness looks like than any explanation.
 *
 * The flip is Math.random(), which is a fair coin for a game and is not a
 * source of cryptographic randomness. That distinction does not matter here —
 * nobody is securing anything with a coin toss — but the page does not claim
 * more than it has.
 *
 * The flip animation is deliberately short and the button is disabled while it
 * runs, because a click that appears to do nothing for a second gets clicked
 * again, and the second click is what makes people think the tool is broken.
 */
(function (window, document) {
  'use strict';

  var FLIP_MS = 320;
  var HISTORY_MAX = 20;

  function createFlipACoin(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var flipBtn = $('coinFlipBtn');
    var bulkBtn = $('coinBulkBtn');
    var resetBtn = $('coinResetBtn');
    var copyBtn = $('coinCopyBtn');
    var resultsEl = $('coinResults');
    var faceEl = $('coinFace');
    var headsEl = $('coinHeadsCount');
    var tailsEl = $('coinTailsCount');
    var streakEl = $('coinStreak');
    var historyEl = $('coinHistory');
    var metaEl = $('coinMeta');
    var statusEl = $('coinStatus');

    if (!flipBtn || !faceEl) return null;

    var status = fun.makeStatus(statusEl);

    var history = [];   // 'H' or 'T', oldest first
    var flipping = false;

    function heads() {
      var n = 0;
      history.forEach(function (f) { if (f === 'H') n += 1; });
      return n;
    }

    function currentStreak() {
      if (!history.length) return 0;
      var last = history[history.length - 1];
      var run = 0;
      for (var i = history.length - 1; i >= 0; i--) {
        if (history[i] !== last) break;
        run += 1;
      }
      return run;
    }

    function render() {
      var h = heads();
      var t = history.length - h;
      var streak = currentStreak();
      var lastFace = history.length ? history[history.length - 1] : null;

      if (headsEl) headsEl.textContent = h;
      if (tailsEl) tailsEl.textContent = t;

      if (streakEl) {
        if (streak <= 1) {
          streakEl.textContent = history.length ? 'No run going.' : '';
        } else {
          streakEl.textContent = streak + ' in a row (' + (lastFace === 'H' ? 'heads' : 'tails') + ')';
        }
      }

      if (historyEl) {
        historyEl.innerHTML = '';
        if (!history.length) {
          var empty = document.createElement('p');
          empty.className = 'text-[11px] text-gray-500';
          empty.textContent = 'No flips yet.';
          historyEl.appendChild(empty);
        } else {
          var row = document.createElement('div');
          row.className = 'flex flex-wrap gap-1.5';
          history.slice(-HISTORY_MAX).forEach(function (f) {
            var chip = document.createElement('span');
            chip.className = 'w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border ' +
              (f === 'H'
                ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                : 'bg-gray-900 border-gray-800 text-gray-400');
            chip.textContent = f;
            row.appendChild(chip);
          });
          historyEl.appendChild(row);
        }
      }

      if (metaEl) {
        if (!history.length) {
          metaEl.textContent = '';
        } else {
          var pct = Math.round((h / history.length) * 100);
          metaEl.textContent = history.length + (history.length === 1 ? ' flip' : ' flips') +
            ' — ' + pct + '% heads. Over a small number of flips that number will swing wildly, and that is what a fair coin looks like.';
        }
      }
    }

    function record(face) {
      history.push(face);
      if (history.length > 400) history.shift();
    }

    function showFace(face) {
      faceEl.textContent = face === 'H' ? 'HEADS' : 'TAILS';
      faceEl.className = 'text-5xl font-black tracking-tight ' +
        (face === 'H' ? 'text-brand-400' : 'text-gray-300');
    }

    function flipOne() {
      if (flipping) return;
      flipping = true;
      resultsEl.classList.remove('hidden');
      flipBtn.disabled = true;
      if (bulkBtn) bulkBtn.disabled = true;

      faceEl.textContent = '—';
      faceEl.className = 'text-5xl font-black tracking-tight text-gray-600 animate-pulse';

      window.setTimeout(function () {
        var face = Math.random() < 0.5 ? 'H' : 'T';
        record(face);
        showFace(face);
        render();
        flipping = false;
        flipBtn.disabled = false;
        if (bulkBtn) bulkBtn.disabled = false;
      }, FLIP_MS);
    }

    /* The bulk flip exists because the single flip cannot show you a
     * distribution. Ten at once can, and the summary line afterwards is the
     * most useful thing this page produces. */
    function flipTen() {
      if (flipping) return;
      resultsEl.classList.remove('hidden');

      var run = { H: 0, T: 0 };
      for (var i = 0; i < 10; i++) {
        var face = Math.random() < 0.5 ? 'H' : 'T';
        run[face] += 1;
        record(face);
      }

      showFace(history[history.length - 1]);
      render();
      status.show('Ten flips: ' + run.H + ' heads, ' + run.T + ' tails. Any split is possible — ten flips is a very small sample.', 'info');
    }

    flipBtn.addEventListener('click', flipOne);
    if (bulkBtn) bulkBtn.addEventListener('click', flipTen);

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        history = [];
        resultsEl.classList.add('hidden');
        faceEl.textContent = '';
        render();
        status.show('Tally cleared.', 'info');
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!history.length) {
          status.show('Flip the coin first.', 'warn');
          return;
        }
        var h = heads();
        var last = history[history.length - 1];
        fun.copy('Coin flip: ' + (last === 'H' ? 'heads' : 'tails') +
          '\n\nSession tally: ' + h + ' heads, ' + (history.length - h) + ' tails over ' + history.length + ' flips.',
          status);
      });
    }

    render();
    status.show('A fair coin. Flip it as many times as you like — the tally is the interesting part.', 'info');

    return { flip: flipOne, tally: function () { return { h: heads(), t: history.length - heads() }; } };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createFlipACoin = createFlipACoin;
})(window, document);

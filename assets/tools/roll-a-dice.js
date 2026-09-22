/**
 * ToolStack AI — Roll a Dice engine.
 *
 * Ids required in tools/roll-a-dice.html:
 *   diceStatus, diceCount, diceSides, diceRollBtn, diceResetBtn, diceCopyBtn,
 *   diceResults, diceFaces, diceTotal, diceBreakdown, diceHistory, diceMeta
 *
 * One to six dice, four to twenty sides each, with the total and a face-by-face
 * breakdown. The breakdown is what makes this more than a random number
 * generator: rolling four six-sided dice and seeing that you got two 3s is a
 * different experience from being told the total is 14.
 *
 * The page carries one piece of actual probability, because it is the thing
 * people get wrong about dice: with two six-sided dice, 7 is six times more
 * likely than 2 or 12. That is why the total is shown alongside the individual
 * faces rather than instead of them — a single number hides exactly the
 * structure that makes dice interesting.
 *
 * Each die is an independent call to Math.random() rather than one call scaled
 * up, so the dice are genuinely independent of each other. It is not
 * cryptographic randomness and does not claim to be.
 */
(function (window, document) {
  'use strict';

  var HISTORY_MAX = 10;

  var FACE_CLASS =
    'w-12 h-12 rounded-xl bg-gray-900 border border-gray-800 flex items-center ' +
    'justify-center text-lg font-black text-brand-400';

  function createRollADice(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var countEl = $('diceCount');
    var sidesEl = $('diceSides');
    var rollBtn = $('diceRollBtn');
    var resetBtn = $('diceResetBtn');
    var copyBtn = $('diceCopyBtn');
    var resultsEl = $('diceResults');
    var facesEl = $('diceFaces');
    var totalEl = $('diceTotal');
    var breakdownEl = $('diceBreakdown');
    var historyEl = $('diceHistory');
    var metaEl = $('diceMeta');
    var statusEl = $('diceStatus');

    if (!rollBtn || !facesEl || !totalEl) return null;

    var status = fun.makeStatus(statusEl);
    var history = [];   // { dice: [], total: n, sides: n }

    function readCount() {
      var n = countEl ? parseInt(countEl.value, 10) : 2;
      if (isNaN(n) || n < 1) n = 1;
      if (n > 6) n = 6;
      return n;
    }

    function readSides() {
      var n = sidesEl ? parseInt(sidesEl.value, 10) : 6;
      if (isNaN(n) || n < 2) n = 6;
      return n;
    }

    function renderHistory() {
      if (!historyEl) return;
      historyEl.innerHTML = '';

      if (!history.length) {
        var empty = document.createElement('p');
        empty.className = 'text-[11px] text-gray-500';
        empty.textContent = 'No rolls yet.';
        historyEl.appendChild(empty);
        return;
      }

      history.slice().reverse().forEach(function (entry) {
        historyEl.appendChild(
          fun.row(entry.dice.join(' + '), entry.total + '  (' + entry.dice.length + 'd' + entry.sides + ')')
        );
      });
    }

    function roll() {
      var count = readCount();
      var sides = readSides();
      var dice = [];
      var total = 0;

      for (var i = 0; i < count; i++) {
        var face = Math.floor(Math.random() * sides) + 1;
        dice.push(face);
        total += face;
      }

      history.push({ dice: dice, total: total, sides: sides });
      if (history.length > 50) history.shift();

      resultsEl.classList.remove('hidden');

      facesEl.innerHTML = '';
      dice.forEach(function (face) {
        var chip = document.createElement('span');
        chip.className = FACE_CLASS;
        chip.textContent = face;
        facesEl.appendChild(chip);
      });

      totalEl.textContent = total;

      if (breakdownEl) {
        breakdownEl.innerHTML = '';
        if (count === 1) {
          breakdownEl.appendChild(fun.row('Roll', '1d' + sides + ' came up ' + dice[0]));
        } else {
          var counts = {};
          dice.forEach(function (face) { counts[face] = (counts[face] || 0) + 1; });

          Object.keys(counts)
            .map(function (k) { return parseInt(k, 10); })
            .sort(function (a, b) { return a - b; })
            .forEach(function (face) {
              var n = counts[face];
              breakdownEl.appendChild(fun.row('Face ' + face, n + (n === 1 ? ' die' : ' dice')));
            });

          breakdownEl.appendChild(
            fun.row('Range', 'possible totals run from ' + count + ' to ' + (count * sides))
          );
        }
      }

      if (metaEl) {
        var note = dice.length + 'd' + sides + ' rolled once. ';
        if (count === 2 && sides === 6) {
          note += 'With two six-sided dice, 7 is six times more likely than 2 or 12 — the middle of the range is where most rolls land.';
        } else if (count >= 2) {
          note += 'The more dice you roll, the more the totals bunch up in the middle of the range rather than spreading evenly across it.';
        } else {
          note += 'A single die is flat: every face is equally likely, every time.';
        }
        metaEl.textContent = note;
      }

      status.hide();
      renderHistory();
    }

    rollBtn.addEventListener('click', roll);

    if (countEl) countEl.addEventListener('change', function () { status.show('Dice count set. Press Roll.', 'info'); });
    if (sidesEl) sidesEl.addEventListener('change', function () { status.show('Sides set. Press Roll.', 'info'); });

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        history = [];
        resultsEl.classList.add('hidden');
        facesEl.innerHTML = '';
        totalEl.textContent = '';
        if (breakdownEl) breakdownEl.innerHTML = '';
        if (metaEl) metaEl.textContent = '';
        renderHistory();
        status.show('Cleared.', 'info');
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!history.length) {
          status.show('Roll first.', 'warn');
          return;
        }
        var last = history[history.length - 1];
        fun.copy('Rolled ' + last.dice.length + 'd' + last.sides + ': ' +
          last.dice.join(', ') + ' — total ' + last.total, status);
      });
    }

    renderHistory();
    status.show('Pick how many dice and how many sides, then roll.', 'info');

    return { roll: roll };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createRollADice = createRollADice;
})(window, document);

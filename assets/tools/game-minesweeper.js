/**
 * ToolStack AI — Minesweeper engine.
 *
 * Ids required in tools/game-minesweeper.html:
 *   mineStatus, mineBoard, mineDifficulty, mineFlagMode, mineCount, mineTime,
 *   mineResult, mineFaceBtn
 *
 * The ordinary rules, with two concessions to the fact that this is a web page
 * rather than a desktop game:
 *
 *   1. The first click is always safe. The mines are placed after it, and the
 *      clicked cell and its eight neighbours are excluded. A first click that
 *      ends the game is not difficulty, it is a coin toss.
 *   2. There is a flag mode toggle, because a right-click is not available on a
 *      touchscreen and long-press is claimed by the browser's own context menu
 *      on most of them. Right-click still works with a mouse.
 *
 * The numbers are painted with the semantic Tailwind colours the rest of the
 * site uses, which the light theme already re-cuts — so one, two and three stay
 * tellable apart on a white cell and on a near-black one without a second
 * palette in this file.
 */
(function (window, document) {
  'use strict';

  var LEVELS = {
    easy: { cols: 9, rows: 9, mines: 10 },
    medium: { cols: 12, rows: 12, mines: 22 },
    hard: { cols: 16, rows: 16, mines: 40 }
  };

  var NUMBER_CLASSES = [
    '',                  /* 0 — never drawn */
    'text-sky-400',
    'text-emerald-400',
    'text-red-400',
    'text-violet-400',
    'text-amber-400',
    'text-teal-400',
    'text-pink-400',
    'text-gray-300'
  ];

  var CLASS_HIDDEN = 'bg-gray-800 hover:bg-gray-700';
  var CLASS_OPEN = 'bg-gray-950';

  function createMinesweeper(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var boardEl = $('mineBoard');
    var levelEl = $('mineDifficulty');
    var flagModeBtn = $('mineFlagMode');
    var countEl = $('mineCount');
    var timeEl = $('mineTime');
    var resultEl = $('mineResult');
    var statusEl = $('mineStatus');

    if (!boardEl) return null;

    var status = fun.makeStatus(statusEl);

    var cells = [];
    var buttons = [];
    var cols = 0;
    var rows = 0;
    var mineTotal = 0;
    var flags = 0;
    var revealedCount = 0;
    var placed = false;
    var finished = false;
    var flagMode = false;
    var seconds = 0;
    var timer = null;

    function level() {
      var key = levelEl ? levelEl.value : 'easy';
      return LEVELS[key] || LEVELS.easy;
    }

    function formatTime(total) {
      var m = Math.floor(total / 60);
      var s = total % 60;
      return m + ':' + (s < 10 ? '0' + s : s);
    }

    function indexOf(row, col) {
      return row * cols + col;
    }

    function neighbours(index) {
      var row = Math.floor(index / cols);
      var col = index % cols;
      var out = [];

      for (var dr = -1; dr <= 1; dr++) {
        for (var dc = -1; dc <= 1; dc++) {
          if (!dr && !dc) continue;
          var r = row + dr;
          var c = col + dc;
          if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
          out.push(indexOf(r, c));
        }
      }
      return out;
    }

    /* --------------------------------------------------------------- the board */

    function newGame() {
      stopClock();

      var config = level();
      cols = config.cols;
      rows = config.rows;
      mineTotal = config.mines;

      cells = [];
      buttons = [];
      flags = 0;
      revealedCount = 0;
      placed = false;
      finished = false;
      seconds = 0;

      for (var i = 0; i < cols * rows; i++) {
        cells.push({ mine: false, open: false, flagged: false, wrongFlag: false, adjacent: 0 });
      }

      boardEl.innerHTML = '';
      boardEl.style.display = 'grid';
      boardEl.style.gridTemplateColumns = 'repeat(' + cols + ', minmax(0, 1fr))';
      boardEl.style.gap = '2px';

      var fontSize = cols >= 16 ? '10px' : (cols >= 12 ? '12px' : '14px');

      for (var index = 0; index < cols * rows; index++) {
        (function (i) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'aspect-square rounded-[3px] flex items-center justify-center ' +
            'font-bold leading-none select-none ' + CLASS_HIDDEN;
          btn.style.fontSize = fontSize;
          btn.style.cursor = 'pointer';
          btn.addEventListener('click', function () { onLeft(i); });
          btn.addEventListener('contextmenu', function (event) {
            event.preventDefault();
            onRight(i);
          });
          boardEl.appendChild(btn);
          buttons.push(btn);
        })(index);
      }

      if (resultEl) resultEl.textContent = '';
      if (timeEl) timeEl.textContent = '0:00';
      flagMode = false;
      paintFlagMode();

      paintAll();
      paintCount();
      status.show('Click a square to start. The first one is always safe.', 'info');
    }

    function paintFlagMode() {
      if (!flagModeBtn) return;
      flagModeBtn.textContent = 'Flag mode: ' + (flagMode ? 'on' : 'off');
      flagModeBtn.className = flagMode
        ? 'bg-brand-500 text-gray-950 font-bold rounded-xl px-4 py-2 text-sm transition-colors'
        : 'bg-gray-800 hover:bg-gray-700 rounded-xl px-4 py-2 text-sm transition-colors';
    }

    function stopClock() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function startClock() {
      timer = window.setInterval(function () {
        seconds += 1;
        if (timeEl) timeEl.textContent = formatTime(seconds);
      }, 1000);
    }

    function paintCount() {
      if (countEl) countEl.textContent = String(mineTotal - flags);
    }

    function paintCell(index) {
      var cell = cells[index];
      var btn = buttons[index];

      if (cell.open) {
        btn.className = 'aspect-square rounded-[3px] flex items-center justify-center ' +
          'font-bold leading-none select-none ' + CLASS_OPEN +
          (cell.mine ? ' text-red-400' : ' ' + (NUMBER_CLASSES[cell.adjacent] || 'text-gray-300'));
        btn.textContent = cell.mine ? '●' : (cell.adjacent ? String(cell.adjacent) : '');
        btn.style.cursor = 'default';
        return;
      }

      btn.className = 'aspect-square rounded-[3px] flex items-center justify-center ' +
        'font-bold leading-none select-none ' + CLASS_HIDDEN;
      btn.style.cursor = 'pointer';

      if (cell.flagged) {
        btn.textContent = '⚑';
        btn.className += ' text-amber-400';
      } else if (cell.wrongFlag) {
        btn.textContent = '✕';
        btn.className += ' text-red-400';
      } else {
        btn.textContent = '';
      }
    }

    function paintAll() {
      for (var i = 0; i < cells.length; i++) paintCell(i);
    }

    /* --------------------------------------------------------------- the mines */

    function placeMines(safeIndex) {
      var forbidden = {};
      var safe = [safeIndex].concat(neighbours(safeIndex));
      for (var s = 0; s < safe.length; s++) forbidden[safe[s]] = true;

      var pool = [];
      for (var i = 0; i < cells.length; i++) {
        if (!forbidden[i]) pool.push(i);
      }

      /* If the board were ever too dense to leave a nine-cell hole — it is not,
       * at any of the three levels — the exclusion is dropped rather than the
       * mine count. Better a hard first click than a board with missing mines. */
      if (pool.length < mineTotal) {
        pool = [];
        for (var j = 0; j < cells.length; j++) {
          if (j !== safeIndex) pool.push(j);
        }
      }

      var chosen = fun.shuffle(pool).slice(0, mineTotal);
      for (var c = 0; c < chosen.length; c++) {
        cells[chosen[c]].mine = true;
      }

      for (var k = 0; k < cells.length; k++) {
        if (cells[k].mine) continue;
        var around = neighbours(k);
        var count = 0;
        for (var a = 0; a < around.length; a++) {
          if (cells[around[a]].mine) count += 1;
        }
        cells[k].adjacent = count;
      }

      placed = true;
    }

    /* -------------------------------------------------------------- revealing */

    function reveal(index) {
      var stack = [index];

      while (stack.length) {
        var i = stack.pop();
        var cell = cells[i];

        if (cell.open || cell.flagged) continue;

        cell.open = true;
        revealedCount += 1;
        paintCell(i);

        if (cell.adjacent === 0 && !cell.mine) {
          var around = neighbours(i);
          for (var a = 0; a < around.length; a++) {
            if (!cells[around[a]].open) stack.push(around[a]);
          }
        }
      }
    }

    function onLeft(index) {
      if (finished) return;
      var cell = cells[index];
      if (cell.open) return;

      if (flagMode) {
        onRight(index);
        return;
      }
      if (cell.flagged) return;

      if (!placed) {
        placeMines(index);
        startClock();
      }

      if (cell.mine) {
        lose(index);
        return;
      }

      reveal(index);
      checkWin();
    }

    function onRight(index) {
      if (finished) return;
      var cell = cells[index];
      if (cell.open) return;

      if (cell.flagged) {
        cell.flagged = false;
        flags -= 1;
      } else {
        cell.flagged = true;
        flags += 1;
      }

      paintCell(index);
      paintCount();
    }

    function checkWin() {
      if (revealedCount === cells.length - mineTotal) {
        win();
      }
    }

    function win() {
      finished = true;
      stopClock();

      /* Every remaining mine is flagged on the way out, which is both a visual
       * full stop and a correction for however many flags were placed wrongly
       * or not at all. */
      for (var i = 0; i < cells.length; i++) {
        if (cells[i].mine && !cells[i].flagged) {
          cells[i].flagged = true;
        }
      }
      flags = mineTotal;
      paintAll();
      paintCount();

      if (resultEl) resultEl.textContent = 'Cleared in ' + formatTime(seconds) + '.';
      status.show('Board cleared in ' + formatTime(seconds) + ', with ' + mineTotal +
        ' mines on a ' + cols + ' by ' + rows + ' grid.', 'good');
    }

    function lose(hitIndex) {
      finished = true;
      stopClock();

      for (var i = 0; i < cells.length; i++) {
        if (cells[i].mine) {
          /* A mine that was flagged correctly stays flagged — the flag was
           * right, and flipping it over to show the mine would hide that. */
          if (!cells[i].flagged) cells[i].open = true;
        } else if (cells[i].flagged) {
          /* A flag on a cell with no mine under it. Marked rather than silently
           * removed, because knowing which flag was wrong is the useful part. */
          cells[i].flagged = false;
          cells[i].wrongFlag = true;
        }
      }

      paintAll();
      buttons[hitIndex].className = 'aspect-square rounded-[3px] flex items-center ' +
        'justify-center font-bold leading-none select-none bg-red-500 text-white';
      buttons[hitIndex].textContent = '●';

      if (resultEl) resultEl.textContent = 'Hit a mine.';
      status.show('That one was a mine. Press New game to try the same level again.', 'warn');
    }

    /* -------------------------------------------------------------- controls */

    if (levelEl) levelEl.addEventListener('change', newGame);

    var faceBtn = $('mineFaceBtn');
    if (faceBtn) faceBtn.addEventListener('click', newGame);

    if (flagModeBtn) {
      flagModeBtn.addEventListener('click', function () {
        flagMode = !flagMode;
        paintFlagMode();
        status.show(flagMode
          ? 'Flag mode on. A tap now places a flag instead of opening a square.'
          : 'Flag mode off. A tap opens a square. Right-click still flags with a mouse.', 'info');
      });
    }

    newGame();

    return { reset: newGame };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createMinesweeper = createMinesweeper;
})(window, document);

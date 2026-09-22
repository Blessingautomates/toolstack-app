/**
 * ToolStack AI — Connect Four engine.
 *
 * Ids required in tools/game-connect-four.html:
 *   c4Status, c4Board, c4Mode, c4Turn, c4Result, c4ResetBtn,
 *   c4Wins, c4Losses, c4Draws, c4ClearRecordBtn
 *
 * A column is a single button containing six slot elements rather than forty-two
 * separate targets, so the whole stack is the hit area — which is how the
 * physical game works, and it removes the need for a separate arrow row above
 * the board.
 *
 * The computer searches for its own win, then for yours, and otherwise plays a
 * weighted preference for the middle columns with a random tiebreak. It does not
 * look two moves ahead, so it will happily set up a double threat and lose to
 * it. That is a deliberate ceiling: a solver plays Connect Four perfectly from
 * the first move and the game stops being a game.
 *
 * The record is kept in localStorage and every access to it is wrapped, because
 * private browsing throws rather than returning null.
 */
(function (window, document) {
  'use strict';

  var COLS = 7;
  var ROWS = 6;
  var RECORD_KEY = 'ts-c4-record';

  var CLASS_EMPTY = 'bg-gray-800';
  var CLASS_RED = 'bg-rose-500';
  var CLASS_YELLOW = 'bg-amber-500';

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function createConnectFour(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var boardEl = $('c4Board');
    var modeEl = $('c4Mode');
    var turnEl = $('c4Turn');
    var resultEl = $('c4Result');
    var winsEl = $('c4Wins');
    var lossesEl = $('c4Losses');
    var drawsEl = $('c4Draws');
    var statusEl = $('c4Status');

    if (!boardEl) return null;

    var status = fun.makeStatus(statusEl);

    /* grid[row][col], row 0 is the top. Empty is '', otherwise 'R' or 'Y'. */
    var grid = [];
    var turn = 'R';
    var finished = false;
    var busy = false;
    var slots = [];

    function vsComputer() {
      return !modeEl || modeEl.value === 'computer';
    }

    function colourOf(mark) {
      return mark === 'R' ? CLASS_RED : (mark === 'Y' ? CLASS_YELLOW : CLASS_EMPTY);
    }

    function labelOf(mark) {
      return mark === 'R' ? 'Red' : 'Yellow';
    }

    /* ------------------------------------------------------------- the board */

    boardEl.style.display = 'grid';
    boardEl.style.gridTemplateColumns = 'repeat(' + COLS + ', minmax(0, 1fr))';
    boardEl.style.gap = '6px';

    (function buildBoard() {
      boardEl.innerHTML = '';
      slots = [];

      for (var c = 0; c < COLS; c++) {
        (function (col) {
          var column = document.createElement('button');
          column.type = 'button';
          column.className = 'flex flex-col gap-1.5 rounded-lg p-1 transition-colors';
          column.setAttribute('aria-label', 'Drop into column ' + (col + 1));
          column.addEventListener('click', function () { play(col); });

          var columnSlots = [];
          for (var r = 0; r < ROWS; r++) {
            var slot = document.createElement('div');
            slot.className = 'rounded-full ' + CLASS_EMPTY;
            slot.style.aspectRatio = '1 / 1';
            column.appendChild(slot);
            columnSlots.push(slot);
          }
          slots.push(columnSlots);
          boardEl.appendChild(column);
        })(c);
      }
    })();

    function paint() {
      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          slots[c][r].className = 'rounded-full ' + colourOf(grid[r][c]);
        }
      }

      if (turnEl) {
        if (finished) turnEl.textContent = '—';
        else if (vsComputer()) turnEl.textContent = turn === 'R' ? 'Your turn (red)' : 'Computer is thinking…';
        else turnEl.textContent = labelOf(turn) + ' to play';
      }
    }

    /* ------------------------------------------------------------ game rules */

    function emptyGrid() {
      var rows = [];
      for (var r = 0; r < ROWS; r++) {
        rows.push(['', '', '', '', '', '', '']);
      }
      return rows;
    }

    /* The lowest empty row in a column, or -1 if the column is full. */
    function landingRow(state, col) {
      for (var r = ROWS - 1; r >= 0; r--) {
        if (!state[r][col]) return r;
      }
      return -1;
    }

    var DIRECTIONS = [
      [0, 1],   /* horizontal */
      [1, 0],   /* vertical */
      [1, 1],   /* down-right */
      [1, -1]   /* down-left */
    ];

    function winsAt(state, row, col) {
      var mark = state[row][col];
      if (!mark) return null;

      for (var d = 0; d < DIRECTIONS.length; d++) {
        var dr = DIRECTIONS[d][0];
        var dc = DIRECTIONS[d][1];
        var line = [[row, col]];

        var step = 1;
        while (step < 4) {
          var r = row + dr * step;
          var c = col + dc * step;
          if (r < 0 || r >= ROWS || c < 0 || c >= COLS || state[r][c] !== mark) break;
          line.push([r, c]);
          step += 1;
        }

        step = 1;
        while (step < 4) {
          var br = row - dr * step;
          var bc = col - dc * step;
          if (br < 0 || br >= ROWS || bc < 0 || bc >= COLS || state[br][bc] !== mark) break;
          line.unshift([br, bc]);
          step += 1;
        }

        if (line.length >= 4) return line;
      }
      return null;
    }

    function someoneWon(state) {
      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          if (!state[r][c]) continue;
          var line = winsAt(state, r, c);
          if (line) return { mark: state[r][c], line: line };
        }
      }
      return null;
    }

    function full(state) {
      for (var c = 0; c < COLS; c++) {
        if (landingRow(state, c) !== -1) return false;
      }
      return true;
    }

    /* ------------------------------------------------------------- the record */

    function readRecord() {
      try {
        var raw = window.localStorage.getItem(RECORD_KEY);
        if (!raw) return { w: 0, l: 0, d: 0 };
        var parsed = JSON.parse(raw);
        return {
          w: parseInt(parsed.w, 10) || 0,
          l: parseInt(parsed.l, 10) || 0,
          d: parseInt(parsed.d, 10) || 0
        };
      } catch (error) {
        return { w: 0, l: 0, d: 0 };
      }
    }

    function writeRecord(record) {
      try {
        window.localStorage.setItem(RECORD_KEY, JSON.stringify(record));
      } catch (error) {
        /* Not persisted; the tally still holds for this session. */
      }
    }

    var record = readRecord();

    function paintRecord() {
      if (winsEl) winsEl.textContent = String(record.w);
      if (lossesEl) lossesEl.textContent = String(record.l);
      if (drawsEl) drawsEl.textContent = String(record.d);
    }

    function finish(outcome) {
      finished = true;

      var label;
      var note;
      var kind;

      if (outcome === 'draw') {
        record.d += 1;
        label = 'A draw. The board is full.';
        note = 'Drawn. The board filled up with nobody connecting four.';
        kind = 'info';
      } else if (!vsComputer()) {
        label = labelOf(outcome) + ' wins.';
        note = labelOf(outcome) + ' connected four.';
        kind = 'good';
      } else if (outcome === 'R') {
        record.w += 1;
        label = 'You win.';
        note = 'You win. Four in a row, and the computer never saw it coming.';
        kind = 'good';
      } else {
        record.l += 1;
        label = 'The computer wins.';
        note = 'The computer connected four. Reset and take the middle column earlier.';
        kind = 'warn';
      }

      writeRecord(record);
      paintRecord();
      if (resultEl) resultEl.textContent = label;
      status.show(note, kind);
      paint();
    }

    /* --------------------------------------------------------- the computer */

    function drop(state, col, mark) {
      var row = landingRow(state, col);
      if (row === -1) return null;
      state[row][col] = mark;
      return row;
    }

    function winningColumn(state, mark) {
      for (var c = 0; c < COLS; c++) {
        var trial = state.map(function (row) { return row.slice(); });
        var row = drop(trial, c, mark);
        if (row === null) continue;
        if (winsAt(trial, row, c)) return c;
      }
      return -1;
    }

    /* Centre columns are worth more, and the bias is in the weights rather than
     * in a rule, so the computer still wanders off-centre sometimes. */
    var COLUMN_WEIGHTS = [1, 2, 4, 7, 4, 2, 1];

    function computerColumn() {
      var win = winningColumn(grid, 'Y');
      if (win !== -1) return win;

      var block = winningColumn(grid, 'R');
      if (block !== -1) return block;

      var options = [];
      for (var c = 0; c < COLS; c++) {
        if (landingRow(grid, c) !== -1) options.push(c);
      }
      if (!options.length) return -1;

      /* The row directly above the opponent is a bad place to leave a gap, so
       * a move that hands them an immediate win on top is discounted — but not
       * forbidden, which is what keeps the game winnable. */
      var safe = options.filter(function (col) {
        var row = landingRow(grid, col);
        if (row <= 0) return true;
        var trial = grid.map(function (r) { return r.slice(); });
        trial[row][col] = 'Y';
        trial[row - 1][col] = 'R';
        return !winsAt(trial, row - 1, col);
      });

      var pool = safe.length ? safe : options;

      var total = 0;
      pool.forEach(function (col) { total += COLUMN_WEIGHTS[col]; });

      var roll = Math.random() * total;
      for (var i = 0; i < pool.length; i++) {
        roll -= COLUMN_WEIGHTS[pool[i]];
        if (roll <= 0) return pool[i];
      }
      return pick(pool);
    }

    /* --------------------------------------------------------------- playing */

    function play(col) {
      if (finished || busy) return;
      if (vsComputer() && turn === 'Y') return;

      var row = landingRow(grid, col);
      if (row === -1) {
        status.show('That column is full. Pick another one.', 'warn');
        return;
      }

      grid[row][col] = turn;
      paint();

      var win = winsAt(grid, row, col);
      if (win) {
        finish(turn);
        return;
      }
      if (full(grid)) {
        finish('draw');
        return;
      }

      turn = turn === 'R' ? 'Y' : 'R';
      paint();

      if (vsComputer() && turn === 'Y') {
        busy = true;
        window.setTimeout(function () {
          var choice = computerColumn();
          busy = false;
          if (choice === -1 || finished) return;

          var r = landingRow(grid, choice);
          grid[r][choice] = 'Y';
          paint();

          var computerWin = winsAt(grid, r, choice);
          if (computerWin) {
            finish('Y');
            return;
          }
          if (full(grid)) {
            finish('draw');
            return;
          }

          turn = 'R';
          paint();
        }, 420);
      }
    }

    function reset() {
      grid = emptyGrid();
      turn = 'R';
      finished = false;
      busy = false;
      if (resultEl) resultEl.textContent = '';
      paint();
      status.show(vsComputer()
        ? 'You are red and you drop first. Click a column to drop into it.'
        : 'Two players, one device. Red drops first.', 'info');
    }

    /* -------------------------------------------------------------- controls */

    if (modeEl) modeEl.addEventListener('change', reset);

    var resetBtn = $('c4ResetBtn');
    if (resetBtn) resetBtn.addEventListener('click', reset);

    var clearBtn = $('c4ClearRecordBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        record = { w: 0, l: 0, d: 0 };
        writeRecord(record);
        paintRecord();
        status.show('Record cleared.', 'info');
      });
    }

    paintRecord();
    reset();

    return { reset: reset };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createConnectFour = createConnectFour;
})(window, document);

/**
 * ToolStack AI — Tic Tac Toe engine.
 *
 * Ids required in tools/game-tictactoe.html:
 *   tttStatus, tttBoard, tttMode, tttTurn, tttResult, tttResetBtn,
 *   tttWins, tttLosses, tttDraws
 *
 * Two modes: two players on one device, or one player against the computer.
 *
 * The computer is deliberately beatable. It plays a fixed priority list — win if
 * you can, block if you must, then centre, then a corner, then a side — with a
 * random choice inside each tier. A perfect opponent is a solved game and a
 * solved game is not a game; anybody who has played tic tac toe knows the
 * correct reply to every opening, so an unbeatable version would be a coin that
 * always lands on its edge. This one will lose to a player paying attention,
 * which is the point.
 *
 * The running record is kept in localStorage and every touch of it is wrapped,
 * because private browsing throws on access rather than returning null.
 */
(function (window, document) {
  'use strict';

  var LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  var CORNERS = [0, 2, 6, 8];
  var SIDES = [1, 3, 5, 7];
  var RECORD_KEY = 'ts-ttt-record';

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function createTicTacToe(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var boardEl = $('tttBoard');
    var modeEl = $('tttMode');
    var turnEl = $('tttTurn');
    var resultEl = $('tttResult');
    var winsEl = $('tttWins');
    var lossesEl = $('tttLosses');
    var drawsEl = $('tttDraws');
    var statusEl = $('tttStatus');

    if (!boardEl) return null;

    var status = fun.makeStatus(statusEl);

    var board = ['', '', '', '', '', '', '', '', ''];
    var turn = 'X';
    var finished = false;
    var busy = false;
    var cells = [];

    function vsComputer() {
      return !modeEl || modeEl.value === 'computer';
    }

    /* ------------------------------------------------------------- the board */

    boardEl.style.display = 'grid';
    boardEl.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
    boardEl.style.gap = '8px';

    (function buildBoard() {
      boardEl.innerHTML = '';
      for (var i = 0; i < 9; i++) {
        (function (index) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'aspect-square rounded-xl bg-gray-950 border border-gray-800 ' +
            'text-3xl font-black flex items-center justify-center transition-colors';
          btn.setAttribute('aria-label', 'Square ' + (index + 1));
          btn.addEventListener('click', function () { play(index); });
          boardEl.appendChild(btn);
          cells.push(btn);
        })(i);
      }
    })();

    function paint() {
      for (var i = 0; i < 9; i++) {
        var mark = board[i];
        cells[i].textContent = mark;
        cells[i].className = 'aspect-square rounded-xl bg-gray-950 border border-gray-800 ' +
          'text-3xl font-black flex items-center justify-center transition-colors' +
          (mark === 'X' ? ' text-sky-400' : '') +
          (mark === 'O' ? ' text-rose-400' : '');
        /* Inline, because Tailwind's preflight gives every button a pointer and
         * a class-vs-class override would depend on stylesheet order. */
        cells[i].style.cursor = mark || finished ? 'default' : 'pointer';
      }

      if (turnEl) {
        if (finished) turnEl.textContent = '—';
        else if (vsComputer()) turnEl.textContent = turn === 'X' ? 'Your turn (X)' : 'Computer is thinking…';
        else turnEl.textContent = turn + ' to play';
      }
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
        /* Not saved; the tally still works for this session. */
      }
    }

    var record = readRecord();

    function paintRecord() {
      if (winsEl) winsEl.textContent = String(record.w);
      if (lossesEl) lossesEl.textContent = String(record.l);
      if (drawsEl) drawsEl.textContent = String(record.d);
    }

    /* ------------------------------------------------------------ game rules */

    function winnerOf(state) {
      for (var i = 0; i < LINES.length; i++) {
        var line = LINES[i];
        var a = state[line[0]];
        if (a && a === state[line[1]] && a === state[line[2]]) {
          return { mark: a, line: line };
        }
      }
      return null;
    }

    function full(state) {
      for (var i = 0; i < 9; i++) {
        if (!state[i]) return false;
      }
      return true;
    }

    function finish(outcome) {
      finished = true;

      var label;
      var note;
      var kind;

      if (outcome === 'draw') {
        record.d += 1;
        label = 'A draw.';
        note = 'Drawn. Nobody got three in a row.';
        kind = 'info';
      } else if (!vsComputer()) {
        label = outcome + ' wins.';
        note = outcome + ' takes it.';
        kind = 'good';
      } else if (outcome === 'X') {
        record.w += 1;
        label = 'You win.';
        note = 'You win. The computer did not see it coming, which is by design.';
        kind = 'good';
      } else {
        record.l += 1;
        label = 'The computer wins.';
        note = 'The computer got there first. Reset and go again.';
        kind = 'warn';
      }

      writeRecord(record);
      paintRecord();
      if (resultEl) resultEl.textContent = label;
      status.show(note, kind);
      paint();
    }

    function checkEnd() {
      var win = winnerOf(board);
      if (win) {
        finish(win.mark);
        return true;
      }
      if (full(board)) {
        finish('draw');
        return true;
      }
      return false;
    }

    /* --------------------------------------------------------- the computer */

    function emptyCells(state) {
      var out = [];
      for (var i = 0; i < 9; i++) {
        if (!state[i]) out.push(i);
      }
      return out;
    }

    function winningMove(state, mark) {
      var options = emptyCells(state);
      for (var i = 0; i < options.length; i++) {
        var trial = state.slice();
        trial[options[i]] = mark;
        if (winnerOf(trial)) return options[i];
      }
      return -1;
    }

    function computerMove() {
      var open = emptyCells(board);
      if (!open.length) return -1;

      var win = winningMove(board, 'O');
      if (win !== -1) return win;

      var block = winningMove(board, 'X');
      if (block !== -1) return block;

      if (!board[4]) return 4;

      var freeCorners = CORNERS.filter(function (i) { return !board[i]; });
      if (freeCorners.length) return pick(freeCorners);

      var freeSides = SIDES.filter(function (i) { return !board[i]; });
      if (freeSides.length) return pick(freeSides);

      return pick(open);
    }

    /* --------------------------------------------------------------- playing */

    function play(index) {
      if (finished || busy) return;
      if (board[index]) return;
      if (vsComputer() && turn === 'O') return;

      board[index] = turn;
      paint();

      if (checkEnd()) return;

      turn = turn === 'X' ? 'O' : 'X';
      paint();

      if (vsComputer() && turn === 'O') {
        busy = true;
        window.setTimeout(function () {
          var move = computerMove();
          busy = false;
          if (move === -1 || finished) return;
          board[move] = 'O';
          paint();
          if (checkEnd()) return;
          turn = 'X';
          paint();
        }, 380);
      }
    }

    function reset() {
      board = ['', '', '', '', '', '', '', '', ''];
      turn = 'X';
      finished = false;
      busy = false;
      if (resultEl) resultEl.textContent = '';
      paint();
      status.show(vsComputer()
        ? 'You are X and you move first.'
        : 'Two players, one device. X starts.', 'info');
    }

    /* -------------------------------------------------------------- controls */

    if (modeEl) {
      modeEl.addEventListener('change', function () {
        /* The record is the record against the computer, so switching to two
         * players leaves it alone — it is not reset, and it is not incremented
         * while two people are playing. */
        reset();
      });
    }

    var resetBtn = $('tttResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        reset();
      });
    }

    var clearBtn = $('tttClearRecordBtn');
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
  window.ToolStackTools.createTicTacToe = createTicTacToe;
})(window, document);

/**
 * ToolStack AI — Snake engine.
 *
 * Ids required in tools/game-snake.html:
 *   snakeStatus, snakeBoard, snakeScore, snakeBest, snakeSpeed, snakeStartBtn,
 *   snakePauseBtn, snakeResetBtn, snakeUp, snakeDown, snakeLeft, snakeRight
 *
 * The board is a grid of real elements rather than a canvas. That is slower, and
 * at sixteen by sixteen it does not matter, and it buys the one thing a canvas
 * cannot have: every cell is styled with the same Tailwind utilities as the rest
 * of the site, so the light theme's CSS remapping repaints the board without a
 * line of drawing code or a single colour constant in this file.
 *
 * The rules are the ordinary ones. Walls kill, the snake cannot reverse into
 * itself, food is placed only on free cells, and the tick shortens slightly with
 * every item eaten down to a floor. The best score is kept in localStorage and
 * the read is wrapped, because a browser in private mode throws on access rather
 * than returning null.
 */
(function (window, document) {
  'use strict';

  var COLS = 16;
  var ROWS = 16;
  var START_MS = 170;
  var MIN_MS = 80;
  var STEP_MS = 5;
  var BEST_KEY = 'ts-snake-best';

  var CLASS_EMPTY = 'bg-gray-800';
  var CLASS_BODY = 'bg-emerald-500';
  var CLASS_HEAD = 'bg-emerald-600';
  var CLASS_FOOD = 'bg-rose-500';

  function createSnakeGame(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var boardEl = $('snakeBoard');
    var scoreEl = $('snakeScore');
    var bestEl = $('snakeBest');
    var speedEl = $('snakeSpeed');
    var statusEl = $('snakeStatus');

    if (!boardEl) return null;

    var status = fun.makeStatus(statusEl);

    var cells = [];
    var snake = [];
    var dir = { x: 1, y: 0 };
    var queued = { x: 1, y: 0 };
    var food = null;
    var score = 0;
    var tick = START_MS;
    var timer = null;
    var running = false;
    var over = false;

    /* ---------------------------------------------------------------- board */

    boardEl.style.display = 'grid';
    boardEl.style.gridTemplateColumns = 'repeat(' + COLS + ', minmax(0, 1fr))';
    boardEl.style.gap = '2px';
    boardEl.style.aspectRatio = COLS + ' / ' + ROWS;

    (function buildBoard() {
      boardEl.innerHTML = '';
      for (var y = 0; y < ROWS; y++) {
        for (var x = 0; x < COLS; x++) {
          var cell = document.createElement('div');
          cell.className = 'rounded-[2px] ' + CLASS_EMPTY;
          cell.style.aspectRatio = '1 / 1';
          boardEl.appendChild(cell);
          cells.push(cell);
        }
      }
    })();

    function cellAt(x, y) {
      return cells[y * COLS + x];
    }

    /* ------------------------------------------------------------ best score */

    function readBest() {
      try {
        var raw = window.localStorage.getItem(BEST_KEY);
        var value = parseInt(raw, 10);
        return isNaN(value) || value < 0 ? 0 : value;
      } catch (error) {
        return 0;
      }
    }

    function writeBest(value) {
      try {
        window.localStorage.setItem(BEST_KEY, String(value));
      } catch (error) {
        /* Private mode, or storage disabled. The score is still shown for this
         * session; it just will not survive a reload. */
      }
    }

    var best = readBest();
    if (bestEl) bestEl.textContent = String(best);

    /* ---------------------------------------------------------------- render */

    function paint() {
      for (var i = 0; i < cells.length; i++) {
        cells[i].className = 'rounded-[2px] ' + CLASS_EMPTY;
      }
      if (food) {
        cellAt(food.x, food.y).className = 'rounded-[2px] ' + CLASS_FOOD;
      }
      for (var s = 0; s < snake.length; s++) {
        cellAt(snake[s].x, snake[s].y).className =
          'rounded-[2px] ' + (s === 0 ? CLASS_HEAD : CLASS_BODY);
      }
    }

    function paintMeta() {
      if (scoreEl) scoreEl.textContent = String(score);
      if (speedEl) speedEl.textContent = String(Math.round(1000 / tick)) + '/s';
    }

    /* ------------------------------------------------------------- mechanics */

    function placeFood() {
      var free = [];
      for (var y = 0; y < ROWS; y++) {
        for (var x = 0; x < COLS; x++) {
          if (!occupies(x, y)) free.push({ x: x, y: y });
        }
      }
      if (!free.length) {
        food = null;
        return;
      }
      food = free[Math.floor(Math.random() * free.length)];
    }

    function occupies(x, y) {
      for (var i = 0; i < snake.length; i++) {
        if (snake[i].x === x && snake[i].y === y) return true;
      }
      return false;
    }

    function reset() {
      stop();
      snake = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }];
      dir = { x: 1, y: 0 };
      queued = { x: 1, y: 0 };
      score = 0;
      tick = START_MS;
      running = false;
      over = false;
      placeFood();
      paint();
      paintMeta();
    }

    function stop() {
      if (timer) {
        window.clearTimeout(timer);
        timer = null;
      }
      running = false;
    }

    function end() {
      stop();
      over = true;
      if (score > best) {
        best = score;
        writeBest(best);
        if (bestEl) bestEl.textContent = String(best);
        status.show('Game over at ' + score + '. That is a new best — it has been saved in this browser.', 'good');
      } else {
        status.show('Game over at ' + score + '. Best is still ' + best + '.', 'warn');
      }
    }

    function step() {
      if (!running) return;

      dir = queued;

      var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
        end();
        return;
      }

      var willEat = food && head.x === food.x && head.y === food.y;
      /* The tail cell is about to move out of the way, so following your own
       * tail is legal — unless you are eating, in which case it stays put. */
      var limit = willEat ? snake.length : snake.length - 1;
      for (var i = 0; i < limit; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
          end();
          return;
        }
      }

      snake.unshift(head);

      if (willEat) {
        score += 1;
        tick = Math.max(MIN_MS, tick - STEP_MS);
        placeFood();
        if (!food) {
          paint();
          paintMeta();
          stop();
          status.show('Board full at ' + score + '. There is nowhere left to put anything.', 'good');
          return;
        }
      } else {
        snake.pop();
      }

      paint();
      paintMeta();
      timer = window.setTimeout(step, tick);
    }

    function start() {
      if (running) return;
      if (over) reset();
      running = true;
      status.hide();
      timer = window.setTimeout(step, tick);
      if (pauseBtn) pauseBtn.textContent = 'Pause';
    }

    function pause() {
      if (!running) return;
      stop();
      if (pauseBtn) pauseBtn.textContent = 'Resume';
      status.show('Paused.', 'info');
    }

    /* --------------------------------------------------------------- turning */

    function turn(x, y) {
      if (!running) return;
      /* Reversing into your own neck is not a move, so it is dropped silently
       * rather than treated as an error. */
      if (x === -dir.x && y === -dir.y) return;
      queued = { x: x, y: y };
    }

    var KEY_MAP = {
      ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
      w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
      W: [0, -1], S: [0, 1], A: [-1, 0], D: [1, 0]
    };

    document.addEventListener('keydown', function (event) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;

      var move = KEY_MAP[event.key];
      if (!move) return;

      /* Only swallow the arrow keys while a game is actually in progress, so the
       * page still scrolls normally the rest of the time. */
      if (!running) return;
      event.preventDefault();
      turn(move[0], move[1]);
    });

    /* --------------------------------------------------------------- controls */

    var pauseBtn = $('snakePauseBtn');

    var startBtn = $('snakeStartBtn');
    if (startBtn) startBtn.addEventListener('click', start);

    if (pauseBtn) {
      pauseBtn.addEventListener('click', function () {
        if (running) pause();
        else start();
      });
    }

    var resetBtn = $('snakeResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        reset();
        if (pauseBtn) pauseBtn.textContent = 'Pause';
        status.show('Board reset. Press Start when you are ready.', 'info');
      });
    }

    var DIRECTIONS = [
      ['snakeUp', 0, -1],
      ['snakeDown', 0, 1],
      ['snakeLeft', -1, 0],
      ['snakeRight', 1, 0]
    ];

    DIRECTIONS.forEach(function (entry) {
      var btn = $(entry[0]);
      if (!btn) return;
      btn.addEventListener('click', function () {
        if (!running && !over) start();
        turn(entry[1], entry[2]);
      });
    });

    reset();
    status.show('Press Start, then steer with the arrow keys or the buttons.', 'info');

    return {
      start: start,
      pause: pause,
      reset: reset,
      score: function () { return score; }
    };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createSnakeGame = createSnakeGame;
})(window, document);

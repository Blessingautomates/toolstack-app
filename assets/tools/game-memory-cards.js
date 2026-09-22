/**
 * ToolStack AI — Memory Cards engine.
 *
 * Ids required in tools/game-memory-cards.html:
 *   memStatus, memBoard, memMoves, memPairs, memTime, memBest, memSize,
 *   memResetBtn
 *
 * Three board sizes, a move counter, a clock that starts on the first flip
 * rather than on load, and a best score kept per size in localStorage.
 *
 * The symbols are geometric and typographic rather than emoji. Emoji render at
 * wildly different sizes and colours across platforms, and half of them come
 * back as full-colour glyphs that ignore the text colour entirely — which would
 * make a matched pair indistinguishable from an unmatched one in the light
 * theme. These all take the colour they are given.
 *
 * A mismatched pair stays face up for a moment before turning back, and input is
 * locked while it does, so a fast double-click cannot flip a third card into the
 * comparison.
 */
(function (window, document) {
  'use strict';

  var SYMBOLS = ['★', '●', '▲', '◆', '✦', '✚',
                 '♣', '♠', '♦', '♪', '☂', '⚑'];

  var HOLD_MS = 760;

  var SIZES = {
    '6': { pairs: 6, columns: 4 },
    '8': { pairs: 8, columns: 4 },
    '12': { pairs: 12, columns: 6 }
  };

  var CARD_BASE = 'aspect-square rounded-xl flex items-center justify-center ' +
    'text-2xl font-black transition-colors select-none';

  function createMemoryCards(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var boardEl = $('memBoard');
    var movesEl = $('memMoves');
    var pairsEl = $('memPairs');
    var timeEl = $('memTime');
    var bestEl = $('memBest');
    var sizeEl = $('memSize');
    var statusEl = $('memStatus');

    if (!boardEl) return null;

    var status = fun.makeStatus(statusEl);

    var deck = [];
    var cards = [];
    var first = -1;
    var second = -1;
    var lock = false;
    var moves = 0;
    var matched = 0;
    var started = false;
    var seconds = 0;
    var timer = null;

    function config() {
      var key = sizeEl ? sizeEl.value : '8';
      return SIZES[key] || SIZES['8'];
    }

    function bestKey() {
      return 'ts-memory-best-' + config().pairs;
    }

    /* ------------------------------------------------------------ best score */

    function readBest() {
      try {
        var raw = window.localStorage.getItem(bestKey());
        var value = parseInt(raw, 10);
        return isNaN(value) || value <= 0 ? null : value;
      } catch (error) {
        return null;
      }
    }

    function writeBest(value) {
      try {
        window.localStorage.setItem(bestKey(), String(value));
      } catch (error) {
        /* Not persisted. The game is unaffected. */
      }
    }

    function paintBest() {
      var best = readBest();
      if (bestEl) {
        bestEl.textContent = best === null
          ? 'No score yet at this size'
          : best + ' moves';
      }
    }

    /* --------------------------------------------------------------- the deck */

    function build() {
      var size = config();
      var chosen = SYMBOLS.slice(0, size.pairs);
      deck = fun.shuffle(chosen.concat(chosen));
    }

    boardEl.style.display = 'grid';
    boardEl.style.gap = '8px';

    function layout() {
      var size = config();
      boardEl.style.gridTemplateColumns = 'repeat(' + size.columns + ', minmax(0, 1fr))';
    }

    function cardClasses(index) {
      var card = cards[index];
      if (card.matched) {
        return CARD_BASE + ' bg-emerald-500/10 border border-emerald-500/20 text-emerald-400';
      }
      if (card.up) {
        return CARD_BASE + ' bg-gray-950 border border-gray-800 text-gray-100';
      }
      return CARD_BASE + ' bg-gray-800 border border-gray-800 text-transparent';
    }

    function paintCard(index) {
      var el = cards[index].el;
      el.className = cardClasses(index);
      el.textContent = cards[index].up || cards[index].matched ? cards[index].symbol : ' ';
      el.style.cursor = cards[index].matched ? 'default' : 'pointer';
    }

    function paintAll() {
      for (var i = 0; i < cards.length; i++) paintCard(i);
    }

    function paintStats() {
      if (movesEl) movesEl.textContent = String(moves);
      if (pairsEl) pairsEl.textContent = matched + ' / ' + config().pairs;
      if (timeEl) timeEl.textContent = formatTime(seconds);
    }

    function formatTime(total) {
      var m = Math.floor(total / 60);
      var s = total % 60;
      return m + ':' + (s < 10 ? '0' + s : s);
    }

    /* ------------------------------------------------------------- the clock */

    function startClock() {
      if (started) return;
      started = true;
      seconds = 0;
      paintStats();
      timer = window.setInterval(function () {
        seconds += 1;
        if (timeEl) timeEl.textContent = formatTime(seconds);
      }, 1000);
    }

    function stopClock() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    /* --------------------------------------------------------------- playing */

    function setup() {
      stopClock();
      lock = false;
      first = -1;
      second = -1;
      moves = 0;
      matched = 0;
      started = false;
      seconds = 0;

      build();
      layout();

      boardEl.innerHTML = '';
      cards = [];

      for (var i = 0; i < deck.length; i++) {
        (function (index) {
          var el = document.createElement('button');
          el.type = 'button';
          el.addEventListener('click', function () { flip(index); });
          boardEl.appendChild(el);
          cards.push({ symbol: deck[index], up: false, matched: false, el: el });
        })(i);
      }

      paintAll();
      paintStats();
      paintBest();
    }

    function flip(index) {
      if (lock) return;
      if (cards[index].matched || cards[index].up) return;

      startClock();

      cards[index].up = true;
      paintCard(index);

      if (first === -1) {
        first = index;
        return;
      }

      second = index;
      moves += 1;
      paintStats();

      if (cards[first].symbol === cards[second].symbol) {
        cards[first].matched = true;
        cards[second].matched = true;
        paintCard(first);
        paintCard(second);
        first = -1;
        second = -1;
        matched += 1;
        paintStats();

        if (matched === config().pairs) complete();
        else status.hide();
        return;
      }

      lock = true;
      var a = first;
      var b = second;
      first = -1;
      second = -1;

      window.setTimeout(function () {
        cards[a].up = false;
        cards[b].up = false;
        paintCard(a);
        paintCard(b);
        lock = false;
      }, HOLD_MS);
    }

    function complete() {
      stopClock();

      var best = readBest();
      var isBest = best === null || moves < best;
      if (isBest) writeBest(moves);
      paintBest();

      if (isBest) {
        status.show('Cleared in ' + moves + ' moves and ' + formatTime(seconds) +
          '. That is the best score at this size, and it has been saved in this browser.', 'good');
      } else {
        status.show('Cleared in ' + moves + ' moves and ' + formatTime(seconds) +
          '. Best at this size is ' + best + ' moves.', 'good');
      }
    }

    /* -------------------------------------------------------------- controls */

    if (sizeEl) sizeEl.addEventListener('change', function () {
      setup();
      status.show('New board dealt at ' + config().pairs + ' pairs.', 'info');
    });

    var resetBtn = $('memResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        setup();
        status.show('Board redealt. Same size, new arrangement.', 'info');
      });
    }

    setup();
    status.show('Turn two cards at a time. The clock starts on your first flip.', 'info');

    return { reset: setup };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createMemoryCards = createMemoryCards;
})(window, document);

/**
 * ToolStack AI — shared plumbing for the Fun & Games tools.
 *
 * Twenty-odd tools on this site are the same shape underneath: a filter, a
 * draw button, a result card, a copy button, and a status line. They differ in
 * their data, their labels, and what they render — not in how a bag empties or
 * how a status class is swapped out.
 *
 * Without this file that wiring gets hand-copied into every one of them, and
 * hand-copied wiring drifts: one tool ends up without the no-repeat guarantee,
 * another forgets to clear the status on reset, a third spells a status colour
 * wrong and silently renders an unstyled box. This is the same relationship
 * assets/toolstack.js already has with the tool modules — shared behaviour
 * lives in one place, and each tool keeps its own data and its own create
 * function.
 *
 * Load order matters: this file must come before any tool module that uses it.
 *
 *   <script src="../assets/toolstack.js"></script>
 *   <script src="../assets/tools/fun-shared.js"></script>
 *   <script src="../assets/tools/<slug>.js"></script>
 *
 * Nothing in here touches the network, storage, or the DOM outside the root it
 * is handed.
 */
(function (window, document) {
  'use strict';

  /**
   * The four status tones, matching the reference tool. Kept identical across
   * every tool so a "copied" confirmation looks the same everywhere.
   */
  var STATUS = {
    ok: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    info: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    warn: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    error: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  var STATUS_KEYS = ['ok', 'info', 'warn', 'error'];

  /** Fisher-Yates on a copy. The input array is never mutated — callers pass
   *  their module-level data straight in and would be quietly corrupted by an
   *  in-place shuffle. */
  function shuffle(list) {
    var out = list.slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  /** Wraps a status element, or a no-op pair if the page has none. */
  function makeStatus(el) {
    return {
      show: function (message, kind) {
        if (!el) return;
        for (var i = 0; i < STATUS_KEYS.length; i++) {
          el.classList.remove.apply(el.classList, STATUS[STATUS_KEYS[i]].split(' '));
        }
        el.classList.add.apply(el.classList, (STATUS[kind] || STATUS.info).split(' '));
        el.textContent = message;
        el.classList.remove('hidden');
      },
      hide: function () {
        if (el) el.classList.add('hidden');
      }
    };
  }

  /**
   * A shuffled bag over a pool function.
   *
   * Drawing with Math.random() over the whole array hands out the same item
   * three times in a row often enough to feel broken, and "it gave me the same
   * one twice" is the fastest way to make a generator feel fake. The bag
   * guarantees every item in the current pool appears once before any of them
   * repeats. Refilling drops the item still on screen, so topping up never
   * repeats what the user is looking at.
   *
   * `signature()` returns a string identifying the current filter. When it
   * changes, the bag refills — which is what stops a stale "already seen" list
   * from the previous filter leaking into the new one.
   */
  function makeBag(pool, signature) {
    var items = [];
    var current = null;
    var last = null;
    var drawn = 0;
    var total = 0;

    function refill(exclude) {
      var fresh = pool();
      total = fresh.length;
      if (exclude && fresh.length > 1) {
        fresh = fresh.filter(function (item) { return item !== exclude; });
      }
      items = shuffle(fresh);
      drawn = 0;
    }

    return {
      draw: function () {
        var sig = signature ? signature() : '';
        if (current !== sig) {
          current = sig;
          last = null;
        }
        if (items.length === 0) refill(last);
        if (items.length === 0) return null;
        var item = items.pop();
        drawn += 1;
        last = item;
        return item;
      },
      reset: function () {
        items = [];
        current = null;
        last = null;
        drawn = 0;
      },
      drawn: function () { return drawn; },
      total: function () { return total; }
    };
  }

  /**
   * Clipboard with a status message attached, since every tool wants the same
   * three outcomes: worked, browser said no, nothing to copy yet.
   */
  function copy(text, status, emptyMessage) {
    if (!text || !String(text).trim()) {
      status.show(emptyMessage || 'Nothing to copy yet.', 'warn');
      return;
    }
    var write = window.ToolStack && window.ToolStack.copyText;
    if (!write) {
      status.show('Copying is unavailable in this browser.', 'error');
      return;
    }
    write(text, function (ok) {
      if (ok) status.show('Copied to your clipboard.', 'ok');
      else status.show('Could not reach the clipboard. Select the text and copy it manually.', 'error');
    });
  }

  /**
   * Wires the standard draw-tool skeleton.
   *
   * The factory owns: the status element, the bag, the four buttons and the
   * empty-pool message. The tool owns everything the user actually sees —
   * `render` writes the result card, `copyText` decides what goes on the
   * clipboard, and the pool function decides which items are in play.
   *
   * Returns null when the required elements are missing, so a page that has
   * drifted out of sync with its module fails quietly instead of throwing
   * halfway through wiring listeners.
   */
  function drawTool(root, config) {
    if (!root || !config || !config.data) return null;

    var $ = function (id) { return id ? root.querySelector('#' + id) : null; };

    var filterEl = $(config.filterId);
    var drawBtn = $(config.drawBtnId);
    var clearBtn = $(config.clearBtnId);
    var copyBtn = $(config.copyBtnId);
    var resultsEl = $(config.resultsId);
    var status = makeStatus($(config.statusId));

    if (!drawBtn && !config.autoDraw) return null;

    var allValue = config.allValue || 'all';
    var filterKey = config.filterKey;

    function currentValue() {
      return filterEl ? filterEl.value : allValue;
    }

    function pool() {
      var value = currentValue();
      return config.data.filter(function (item) {
        if (config.pool) return config.pool(item, value);
        return value === allValue || item[filterKey] === value;
      });
    }

    var bag = makeBag(pool, currentValue);
    var latest = null;

    function draw() {
      var item = bag.draw();
      if (!item) {
        status.show(config.emptyMessage || 'Nothing matches that filter yet. Try another one.', 'warn');
        return null;
      }
      latest = item;
      status.hide();
      if (resultsEl) resultsEl.classList.remove('hidden');
      if (config.render) {
        config.render(item, {
          drawn: bag.drawn(),
          total: bag.total(),
          value: currentValue()
        });
      }
      if (config.afterDraw) config.afterDraw(item);
      return item;
    }

    if (drawBtn) drawBtn.addEventListener('click', draw);

    if (filterEl && !config.noResetOnFilter) {
      filterEl.addEventListener('change', function () {
        bag.reset();
        status.hide();
        if (config.onFilterChange) config.onFilterChange(filterEl.value);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        bag.reset();
        latest = null;
        if (resultsEl) resultsEl.classList.add('hidden');
        status.hide();
        if (config.onClear) config.onClear();
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!latest) {
          status.show(config.emptyCopyMessage || 'Draw one first, then copy it.', 'warn');
          return;
        }
        copy(config.copyText ? config.copyText(latest) : String(latest), status, config.emptyCopyMessage);
      });
    }

    if (config.autoDraw) draw();

    return { draw: draw, bag: bag, status: status, latest: function () { return latest; } };
  }

  /** Reads a trimmed value from an input, capped so a pasted essay cannot
   *  blow out the layout. Returns a fallback when the field is empty. */
  function inputValue(el, fallback) {
    var value = el && el.value ? el.value.trim() : '';
    return value ? value.slice(0, 40) : (fallback || '');
  }

  /** Title-cases a single word or name for use inside generated aliases. */
  function titleCase(text) {
    return String(text || '').replace(/\S+/g, function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
  }

  /** Builds a uniform result row, used by the tools that list several lines of
   *  output rather than one card. */
  function row(label, value) {
    var wrap = document.createElement('div');
    wrap.className = 'flex items-start justify-between gap-4 py-2 border-b border-gray-800 last:border-0';

    var l = document.createElement('span');
    l.className = 'text-[11px] uppercase tracking-wider text-gray-500 font-bold shrink-0 pt-0.5';
    l.textContent = label;

    var v = document.createElement('span');
    v.className = 'text-sm text-gray-200 text-right leading-snug';
    v.textContent = value;

    wrap.appendChild(l);
    wrap.appendChild(v);
    return wrap;
  }

  window.ToolStackFun = {
    STATUS: STATUS,
    shuffle: shuffle,
    makeStatus: makeStatus,
    makeBag: makeBag,
    copy: copy,
    drawTool: drawTool,
    inputValue: inputValue,
    titleCase: titleCase,
    row: row
  };
})(window, document);

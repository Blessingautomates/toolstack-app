/**
 * ToolStack AI — Most Likely To engine.
 *
 * Ids required in tools/most-likely-to.html:
 *   mltStatus, mltCategory, mltDrawBtn, mltClearBtn, mltCopyBtn, mltResults,
 *   mltPrompt, mltBadge, mltNameInput, mltAwardBtn, mltBoard, mltMeta
 *
 * The mechanic is an accumulating leaderboard. Drawing the prompt is only the
 * start — the game is the group pointing at somebody, and the tool's job is to
 * keep score across the session so a pattern emerges. That is what makes this
 * different from the other party tools, which all reset with each draw.
 *
 * Two things the scoring deliberately does not do:
 *
 * 1. It never suggests a name. The tool has no idea who is in the room, and a
 *    game that volunteers a victim is a game that picks on somebody.
 *
 * 2. It is revealed only on demand. The running board can turn a bit of fun
 *    into a pile-on if it is always on screen, so it sits behind a toggle and
 *    the page says what it is: a count of how often a name was typed, which is
 *    not a ranking of anybody as a person.
 *
 * Prompts are all mockable-in-a-nice-way — chaotic, forgetful, over-prepared.
 * Nothing here is about appearance, intelligence, money or anything a person
 * cannot laugh at, and nothing targets a group.
 *
 * The board lives in memory only and clears with the tab.
 */
(function (window, document) {
  'use strict';

  var PROMPTS = [
    /* -------------------------------------------------------------- habits */
    { c: 'habits', text: 'turn up twenty minutes late and blame the traffic' },
    { c: 'habits', text: 'fall asleep first at a party' },
    { c: 'habits', text: 'reply to a message three days later' },
    { c: 'habits', text: 'have 47 unread notifications and no plans to change that' },
    { c: 'habits', text: 'order the same thing at every restaurant' },
    { c: 'habits', text: 'say "I will be there in five" from their bed' },

    /* --------------------------------------------------------------- chaos */
    { c: 'chaos', text: 'suggest something reckless at 11pm' },
    { c: 'chaos', text: 'lose their phone while holding it' },
    { c: 'chaos', text: 'start a group chat that dies within a day' },
    { c: 'chaos', text: 'agree to a plan and then immediately forget it' },
    { c: 'chaos', text: 'get talked into something within ten minutes' },
    { c: 'chaos', text: 'spend an entire evening on a completely pointless detour' },

    /* ------------------------------------------------------------- success */
    { c: 'success', text: 'become unexpectedly famous for something small' },
    { c: 'success', text: 'have a five-year plan and actually follow it' },
    { c: 'success', text: 'be the one who reads the terms and conditions' },
    { c: 'success', text: 'own a business one day' },
    { c: 'success', text: 'be the first to arrive and the one with the spreadsheet' },
    { c: 'success', text: 'fix everyone else’s problems before their own' },

    /* -------------------------------------------------------------- social */
    { c: 'social', text: 'talk to a stranger for an hour' },
    { c: 'social', text: 'know everyone at the party within twenty minutes' },
    { c: 'social', text: 'give a speech with no preparation and nail it' },
    { c: 'social', text: 'be the one who organises the group holiday' },
    { c: 'social', text: 'leave a party without saying goodbye' },
    { c: 'social', text: 'be everyone’s emergency contact' },

    /* -------------------------------------------------------------- absurd */
    { c: 'absurd', text: 'survive longest in a zombie film' },
    { c: 'absurd', text: 'be voted off a reality show first' },
    { c: 'absurd', text: 'win an argument with a parking attendant' },
    { c: 'absurd', text: 'accidentally become mayor of a small town' },
    { c: 'absurd', text: 'eat something they cannot identify and ask for seconds' },
    { c: 'absurd', text: 'be the last one standing at a wedding' }
  ];

  var CATEGORY_LABELS = {
    habits: 'Everyday habits',
    chaos: 'Chaos',
    success: 'Doing well',
    social: 'Social',
    absurd: 'Absurd'
  };

  function createMostLikelyTo(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var promptEl = $('mltPrompt');
    var badgeEl = $('mltBadge');
    var nameEl = $('mltNameInput');
    var awardBtn = $('mltAwardBtn');
    var boardEl = $('mltBoard');
    var metaEl = $('mltMeta');

    var board = {};
    var current = null;

    function sortedNames() {
      return Object.keys(board).sort(function (a, b) {
        if (board[b] !== board[a]) return board[b] - board[a];
        // Alphabetical tiebreak, so the order does not jump around between
        // renders when two people are level.
        return a.localeCompare(b);
      });
    }

    function renderBoard() {
      if (!boardEl) return;
      boardEl.innerHTML = '';

      var names = sortedNames();
      if (!names.length) {
        var empty = document.createElement('p');
        empty.className = 'text-[11px] text-gray-500';
        empty.textContent = 'No names yet. Type one above and award the prompt to them.';
        boardEl.appendChild(empty);
        return;
      }

      var top = board[names[0]];
      names.forEach(function (name) {
        var row = fun.row(name, board[name] + (board[name] === 1 ? ' prompt' : ' prompts'));
        if (board[name] === top) {
          var value = row.lastChild;
          if (value) value.classList.add('text-brand-400', 'font-bold');
        }
        boardEl.appendChild(row);
      });
    }

    function award() {
      var name = fun.inputValue(nameEl);
      if (!name) {
        tool.status.show('Type a name first — the tool will not guess who you mean.', 'warn');
        return;
      }
      if (!current) {
        tool.status.show('Draw a prompt first.', 'warn');
        return;
      }
      var key = fun.titleCase(name);
      board[key] = (board[key] || 0) + 1;
      if (nameEl) nameEl.value = '';
      renderBoard();
      tool.status.show(key + ' takes "' + current.text + '".', 'ok');
    }

    var tool = fun.drawTool(root, {
      data: PROMPTS,
      filterId: 'mltCategory',
      drawBtnId: 'mltDrawBtn',
      clearBtnId: 'mltClearBtn',
      copyBtnId: 'mltCopyBtn',
      resultsId: 'mltResults',
      statusId: 'mltStatus',
      render: function (item, info) {
        current = item;
        if (promptEl) promptEl.textContent = 'Who is most likely to ' + item.text + '?';
        if (badgeEl) badgeEl.textContent = CATEGORY_LABELS[item.c] || item.c;
        if (metaEl) {
          metaEl.textContent = 'Prompt ' + info.drawn + ' of ' + info.total +
            ' in this category before any of them come round again.';
        }
      },
      copyText: function (item) {
        return 'Who is most likely to ' + item.text + '?';
      },
      onClear: function () {
        current = null;
        board = {};
        renderBoard();
        if (nameEl) nameEl.value = '';
      }
    });

    if (!tool) return null;

    if (awardBtn) awardBtn.addEventListener('click', award);

    // Enter in the name field awards, so a round is: draw, type, Enter, draw.
    if (nameEl) {
      nameEl.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          award();
        }
      });
    }

    renderBoard();
    tool.status.show('Point at somebody, type their name, and the board keeps score for the evening.', 'info');

    return tool;
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createMostLikelyTo = createMostLikelyTo;
})(window, document);

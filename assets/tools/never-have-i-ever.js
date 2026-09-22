/**
 * ToolStack AI — Never Have I Ever engine.
 *
 * Ids required in tools/never-have-i-ever.html:
 *   nhieStatus, nhieDeck, nhieDrawBtn, nhieClearBtn, nhieCopyBtn, nhieResults,
 *   nhieStatement, nhieBadge, nhieCounts, nhieLog, nhieMeta
 *
 * The mechanic is a tally, not a draw. Drawn statements are only half the
 * game: the point is counting how many people in the room have actually done
 * the thing, and keeping a running log so the group can see the pattern build
 * up. That log is what makes this a different tool from truth or dare rather
 * than the same card deck with different text.
 *
 * The counts are kept in memory only. Persisting them across reloads would
 * mean writing a record of what a group of people admitted to into the
 * browser, which is not something a party game should leave behind on a shared
 * device. Closing the tab clears it, and the page says so.
 *
 * Content rules, which are the same hard rules as the rest of this suite: the
 * clean deck is the default and is genuinely clean. The bolder deck is mild
 * social embarrassment — ghosting somebody, re-gifting a present — and never
 * anything sexual, illegal, or about anyone's body. Nothing in either deck
 * asks a player to admit to something that could hurt a relationship, and
 * nothing targets a group of people.
 */
(function (window, document) {
  'use strict';

  var STATEMENTS = [
    /* ------------------------------------------------------------ clean deck */
    { deck: 'clean', text: 'pretended to be on the phone to avoid talking to someone' },
    { deck: 'clean', text: 're-gifted a present that somebody gave me' },
    { deck: 'clean', text: 'fallen asleep in a cinema' },
    { deck: 'clean', text: 'claimed to have read a book I have not read' },
    { deck: 'clean', text: 'sung in the shower at full volume' },
    { deck: 'clean', text: 'eaten something off the floor' },
    { deck: 'clean', text: 'cried at a film in front of other people' },
    { deck: 'clean', text: 'forgotten someone’s name halfway through a conversation' },
    { deck: 'clean', text: 'laughed at completely the wrong moment' },
    { deck: 'clean', text: 'walked into a glass door' },
    { deck: 'clean', text: 'sent a message to the wrong person' },
    { deck: 'clean', text: 'nodded along to a film I had not actually seen' },
    { deck: 'clean', text: 'stayed in bed past noon' },
    { deck: 'clean', text: 'bought something and never once used it' },
    { deck: 'clean', text: 'had a full conversation with a pet' },
    { deck: 'clean', text: 'missed a flight, a train or a bus' },
    { deck: 'clean', text: 'googled myself' },
    { deck: 'clean', text: 'eaten dessert before dinner' },
    { deck: 'clean', text: 'fallen over in public' },
    { deck: 'clean', text: 'made an entire meal out of snacks' },
    { deck: 'clean', text: 'clapped when the plane landed' },
    { deck: 'clean', text: 'pretended to understand a joke and laughed anyway' },

    /* ----------------------------------------------------------- bolder deck */
    { deck: 'bolder', text: 'pretended to love a gift I did not like' },
    { deck: 'bolder', text: 'scrolled through somebody else’s photos without asking' },
    { deck: 'bolder', text: 'broken something and not owned up to it' },
    { deck: 'bolder', text: 'read a message that was not meant for me' },
    { deck: 'bolder', text: 'ghosted somebody' },
    { deck: 'bolder', text: 'lied about why I was late' },
    { deck: 'bolder', text: 'cancelled plans and stayed home instead' },
    { deck: 'bolder', text: 'pretended to be ill to get out of something' },
    { deck: 'bolder', text: 'said "five minutes away" while still in bed' },
    { deck: 'bolder', text: 'taken credit for something I did not do' },
    { deck: 'bolder', text: 'kept a library book for more than a year' },
    { deck: 'bolder', text: 'eavesdropped on a conversation that was not mine' },
    { deck: 'bolder', text: 'left a party without saying goodbye to anyone' },
    { deck: 'bolder', text: 'rehearsed a conversation in the mirror first' }
  ];

  var DECK_LABELS = { clean: 'Clean deck', bolder: 'Bolder deck' };

  function createNeverHaveIEver(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var statementEl = $('nhieStatement');
    var badgeEl = $('nhieBadge');
    var countsEl = $('nhieCounts');
    var logEl = $('nhieLog');
    var metaEl = $('nhieMeta');

    /* Keyed by statement text so the tally survives the bag reshuffling and
     * re-drawing a statement the group has already counted. */
    var log = [];
    var current = null;

    function totalCount() {
      return log.reduce(function (sum, entry) { return sum + entry.count; }, 0);
    }

    function renderLog() {
      if (!logEl) return;
      logEl.innerHTML = '';

      if (!log.length) {
        var empty = document.createElement('p');
        empty.className = 'text-[11px] text-gray-500';
        empty.textContent = 'Nothing logged yet. Count who has done it and the running total appears here.';
        logEl.appendChild(empty);
        return;
      }

      log.forEach(function (entry) {
        logEl.appendChild(fun.row(entry.count + (entry.count === 1 ? ' person' : ' people'), 'Never have I ever ' + entry.text));
      });

      var summary = document.createElement('p');
      summary.className = 'text-[11px] text-gray-500 pt-3';
      summary.textContent = log.length + ' statements logged, ' + totalCount() + ' admissions counted in total.';
      logEl.appendChild(summary);
    }

    function logCount(count) {
      if (!current) {
        tool.status.show('Draw a statement first.', 'warn');
        return;
      }
      current.count = count;
      if (log.indexOf(current) === -1) log.push(current);
      renderLog();
    }

    /* The count buttons are rebuilt on every draw rather than bound once,
     * because the row is the only thing on the page whose meaning depends on
     * which statement is currently showing. */
    function renderCounts() {
      if (!countsEl) return;
      countsEl.innerHTML = '';

      var label = document.createElement('p');
      label.className = 'text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-2';
      label.textContent = 'How many people here have done it?';
      countsEl.appendChild(label);

      var row = document.createElement('div');
      row.className = 'flex flex-wrap gap-2';

      ['0', '1', '2', '3', '4', '5+'].forEach(function (value) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className =
          'px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 ' +
          'font-semibold text-sm transition';
        btn.textContent = value;
        btn.addEventListener('click', function () {
          logCount(value === '5+' ? 5 : parseInt(value, 10));
        });
        row.appendChild(btn);
      });

      countsEl.appendChild(row);
    }

    var tool = fun.drawTool(root, {
      data: STATEMENTS,
      filterId: 'nhieDeck',
      drawBtnId: 'nhieDrawBtn',
      clearBtnId: 'nhieClearBtn',
      copyBtnId: 'nhieCopyBtn',
      resultsId: 'nhieResults',
      statusId: 'nhieStatus',
      render: function (item, info) {
        current = { text: item.text, count: 0 };
        // Re-drawing a statement the group already counted restores its tally
        // instead of starting it from zero again.
        for (var i = 0; i < log.length; i++) {
          if (log[i].text === item.text) current = log[i];
        }

        if (statementEl) statementEl.textContent = 'Never have I ever ' + item.text + '.';
        if (badgeEl) badgeEl.textContent = DECK_LABELS[item.deck] || item.deck;
        if (metaEl) {
          metaEl.textContent = 'Statement ' + info.drawn + ' of ' + info.total +
            ' in this deck before any of them come round again.';
        }
        renderCounts();
      },
      copyText: function (item) {
        return 'Never have I ever ' + item.text + '.';
      },
      onClear: function () {
        current = null;
        log = [];
        renderLog();
        if (countsEl) countsEl.innerHTML = '';
      }
    });

    if (!tool) return null;

    renderLog();
    tool.status.show('Nobody has to admit to anything. Count only what people are happy to say out loud.', 'info');

    return tool;
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createNeverHaveIEver = createNeverHaveIEver;
})(window, document);

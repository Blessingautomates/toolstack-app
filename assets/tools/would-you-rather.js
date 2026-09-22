/**
 * ToolStack AI — Would You Rather engine.
 *
 * Ids required in tools/would-you-rather.html:
 *   wyrStatus, wyrCategory, wyrDrawBtn, wyrClearBtn, wyrCopyBtn, wyrResults,
 *   wyrOptionA, wyrOptionB, wyrCountA, wyrCountB, wyrBarA, wyrBarB,
 *   wyrBadge, wyrTally, wyrMeta
 *
 * The mechanic is a live vote split, which is what makes this different from
 * the other party tools. The device gets passed around; each person taps the
 * option they would pick; and the bar updates as they go. Nobody has to say
 * anything out loud, which matters — the reason this format works at a party
 * is that a tap is a much lower-stakes contribution than an answer.
 *
 * Votes are keyed by the pair's text rather than by its position in the bag.
 * The bag reshuffles on every filter change and refill, so a positional key
 * would attach one group's votes to a different question the next time it came
 * up. Keying by text means re-drawing a question restores its tally.
 *
 * Tallies are in memory only and are gone when the tab closes. They are not a
 * poll and they are not representative of anything — they are the votes of the
 * people in the room, which the page says plainly rather than implying the
 * numbers mean something wider.
 */
(function (window, document) {
  'use strict';

  var PAIRS = [
    /* ---------------------------------------------------------------- food */
    { c: 'food', a: 'Never eat pizza again', b: 'Never eat chips again' },
    { c: 'food', a: 'Only ever eat sweet food', b: 'Only ever eat savoury food' },
    { c: 'food', a: 'Give up coffee forever', b: 'Give up tea forever' },
    { c: 'food', a: 'Everything you eat is slightly too salty', b: 'Everything you eat is slightly too sweet' },
    { c: 'food', a: 'Never eat out again', b: 'Never order a takeaway again' },
    { c: 'food', a: 'Eat the same meal every day', b: 'Never eat the same meal twice' },

    /* -------------------------------------------------------------- travel */
    { c: 'travel', a: 'A free flight anywhere, economy', b: 'A half-price flight, business class' },
    { c: 'travel', a: 'Always arrive three hours early', b: 'Always arrive ten minutes late' },
    { c: 'travel', a: 'A month somewhere new', b: 'A year somewhere familiar' },
    { c: 'travel', a: 'Only window seats forever', b: 'Only aisle seats forever' },
    { c: 'travel', a: 'Holiday with no phone signal', b: 'Holiday with no hot water' },
    { c: 'travel', a: 'Always pack the night before', b: 'Always pack an hour before leaving' },

    /* ------------------------------------------------------------- comfort */
    { c: 'comfort', a: 'A permanently warm house', b: 'A permanently cool house' },
    { c: 'comfort', a: 'Never wait in a queue again', b: 'Never sit in traffic again' },
    { c: 'comfort', a: 'A perfect memory', b: 'The ability to forget anything on request' },
    { c: 'comfort', a: 'Always be ten minutes early', b: 'Always be exactly on time' },
    { c: 'comfort', a: 'Never lose your keys again', b: 'Never lose your phone again' },
    { c: 'comfort', a: 'Unlimited free streaming', b: 'Unlimited free books' },

    /* ---------------------------------------------------------------- work */
    { c: 'work', a: 'Four-day week, longer days', b: 'Five-day week, shorter days' },
    { c: 'work', a: 'Work from home forever', b: 'Work from an office forever' },
    { c: 'work', a: 'A job you love that pays little', b: 'A job you tolerate that pays well' },
    { c: 'work', a: 'No meetings ever again', b: 'No emails ever again' },
    { c: 'work', a: 'Always know what to say', b: 'Always know when to stay quiet' },

    /* -------------------------------------------------------------- absurd */
    { c: 'absurd', a: 'Fight one horse-sized duck', b: 'Fight a hundred duck-sized horses' },
    { c: 'absurd', a: 'Have a tail you cannot control', b: 'Have ears that swivel towards sound' },
    { c: 'absurd', a: 'Sneeze glitter every time', b: 'Hiccup bubbles every time' },
    { c: 'absurd', a: 'Everything you touch turns slightly blue', b: 'Everything you touch plays a soft note' },
    { c: 'absurd', a: 'Communicate only in song', b: 'Communicate only in mime' },
    { c: 'absurd', a: 'Always speak in rhyme', b: 'Always speak in the third person' },
    { c: 'absurd', a: 'A rewind button for the last ten seconds', b: 'A pause button for the next ten minutes' },
    { c: 'absurd', a: 'Know every language but never be believed', b: 'Be believed always but understand nothing' },

    /* -------------------------------------------------------------- social */
    { c: 'social', a: 'Always be the first to arrive', b: 'Always be the last to leave' },
    { c: 'social', a: 'Know what everyone really thinks of you', b: 'Never find out' },
    { c: 'social', a: 'Never be invited to anything again', b: 'Never be able to say no to anything' },
    { c: 'social', a: 'Only ever text, never call', b: 'Only ever call, never text' }
  ];

  var CATEGORY_LABELS = {
    food: 'Food',
    travel: 'Travel',
    comfort: 'Everyday comfort',
    work: 'Work',
    absurd: 'Absurd',
    social: 'Social'
  };

  function createWouldYouRather(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var optionAEl = $('wyrOptionA');
    var optionBEl = $('wyrOptionB');
    var countAEl = $('wyrCountA');
    var countBEl = $('wyrCountB');
    var barAEl = $('wyrBarA');
    var barBEl = $('wyrBarB');
    var badgeEl = $('wyrBadge');
    var tallyEl = $('wyrTally');
    var metaEl = $('wyrMeta');

    /* Keyed by the pair text. See the note at the top of the file — a
     * positional key would leak one group's votes onto a different question. */
    var votes = {};
    var current = null;
    var questionsSeen = 0;

    function keyOf(item) {
      return item.a + '\u0000' + item.b;
    }

    function votesFor(item) {
      var key = keyOf(item);
      if (!votes[key]) votes[key] = { a: 0, b: 0 };
      return votes[key];
    }

    function renderSplit() {
      if (!current) return;
      var tally = votesFor(current);
      var total = tally.a + tally.b;
      var pctA = total ? Math.round((tally.a / total) * 100) : 50;
      var pctB = total ? 100 - pctA : 50;

      if (countAEl) countAEl.textContent = tally.a + (tally.a === 1 ? ' vote' : ' votes');
      if (countBEl) countBEl.textContent = tally.b + (tally.b === 1 ? ' vote' : ' votes');
      if (barAEl) barAEl.style.width = pctA + '%';
      if (barBEl) barBEl.style.width = pctB + '%';

      if (tallyEl) {
        if (!total) {
          tallyEl.textContent = 'No votes yet on this one. Pass the device round and let people tap.';
        } else {
          tallyEl.textContent = total + (total === 1 ? ' vote so far' : ' votes so far') +
            ' — ' + pctA + '% picked the first option, ' + pctB + '% the second.';
        }
      }
    }

    function vote(side) {
      if (!current) {
        tool.status.show('Draw a question first.', 'warn');
        return;
      }
      votesFor(current)[side] += 1;
      renderSplit();
    }

    var tool = fun.drawTool(root, {
      data: PAIRS,
      filterId: 'wyrCategory',
      drawBtnId: 'wyrDrawBtn',
      clearBtnId: 'wyrClearBtn',
      copyBtnId: 'wyrCopyBtn',
      resultsId: 'wyrResults',
      statusId: 'wyrStatus',
      render: function (item, info) {
        current = item;
        questionsSeen += 1;
        if (optionAEl) optionAEl.textContent = item.a;
        if (optionBEl) optionBEl.textContent = item.b;
        if (badgeEl) badgeEl.textContent = CATEGORY_LABELS[item.c] || item.c;
        if (metaEl) {
          metaEl.textContent = 'Question ' + info.drawn + ' of ' + info.total +
            ' in this category before any of them come round again.';
        }
        renderSplit();
      },
      copyText: function (item) {
        return 'Would you rather ' + item.a.toLowerCase() + ', or ' + item.b.toLowerCase() + '?';
      },
      onClear: function () {
        current = null;
        votes = {};
        questionsSeen = 0;
        if (barAEl) barAEl.style.width = '50%';
        if (barBEl) barBEl.style.width = '50%';
        if (tallyEl) tallyEl.textContent = '';
      }
    });

    if (!tool) return null;

    // The two option cards are the vote buttons. Bound once here rather than in
    // render, because the elements persist across draws — only their text and
    // their tally change.
    if (optionAEl) optionAEl.addEventListener('click', function () { vote('a'); });
    if (optionBEl) optionBEl.addEventListener('click', function () { vote('b'); });

    tool.status.show('Pass the device round. Each person taps their pick and the bar updates.', 'info');

    return tool;
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createWouldYouRather = createWouldYouRather;
})(window, document);

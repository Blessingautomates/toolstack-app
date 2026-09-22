/**
 * ToolStack AI — POV Generator engine.
 *
 * Ids required in tools/pov-generator.html:
 *   povStatus, povCategory, povDrawBtn, povClearBtn, povCopyBtn, povResults,
 *   povLine, povBadge, povMeta
 *
 * Short "POV:" lines, filtered by setting. The format has one rule that makes
 * the difference between a good one and a bad one: the second half has to be a
 * situation rather than a feeling. "POV: you are happy" is not a POV, it is an
 * emotion with a label on it; "POV: you are third in a queue that has not moved
 * in eleven minutes" is, because the reader supplies the feeling themselves.
 * Everything in the pool is written to the second rule.
 *
 * Lines are drawn from a shuffled bag per setting, so nothing repeats until the
 * category is exhausted.
 */
(function (window, document) {
  'use strict';

  var LINES = [
    /* ------------------------------------------------------------ everyday */
    { c: 'everyday', t: 'you are third in a queue that has not moved in eleven minutes' },
    { c: 'everyday', t: 'you have just waved at somebody who was waving at the person behind you' },
    { c: 'everyday', t: 'you are walking behind somebody at exactly their pace and cannot overtake' },
    { c: 'everyday', t: 'you have said "you too" and it is already too late' },
    { c: 'everyday', t: 'you are waiting for the kettle and have nothing to look at' },
    { c: 'everyday', t: 'you have just realised your phone is in the other room' },
    { c: 'everyday', t: 'you are holding a door for somebody who is much further away than you thought' },
    { c: 'everyday', t: 'you have walked into a room and the reason has gone' },
    { c: 'everyday', t: 'your name is called and you did not hear the question before it' },

    /* ----------------------------------------------------------------- work */
    { c: 'work', t: 'you are on a call and your name has just been said' },
    { c: 'work', t: 'you have been asked to "quickly run through" something that took three weeks' },
    { c: 'work', t: 'the meeting is over but nobody is leaving' },
    { c: 'work', t: 'you are the only one who has read the document' },
    { c: 'work', t: 'somebody says "let us take this offline" and looks directly at you' },
    { c: 'work', t: 'a calendar invite arrives for something starting in four minutes' },
    { c: 'work', t: 'you are presenting and the screen has gone to the wrong slide' },
    { c: 'work', t: 'the reply-all has already happened and cannot be undone' },

    /* --------------------------------------------------------------- social */
    { c: 'social', t: 'you are at a party and have just forgotten the name mid-sentence' },
    { c: 'social', t: 'everybody at the table is laughing and you did not hear the joke' },
    { c: 'social', t: 'you are saying goodbye and it has entered its fourth round' },
    { c: 'social', t: 'you have been introduced to somebody you have met three times' },
    { c: 'social', t: 'a group photo is being taken and you do not know where to look' },
    { c: 'social', t: 'you are the first to arrive and the host is still getting ready' },
    { c: 'social', t: 'somebody is telling a story you were also there for, and getting it wrong' },
    { c: 'social', t: 'you are leaving and every person you pass wants a full conversation' },

    /* ----------------------------------------------------------------- home */
    { c: 'home', t: 'you have opened the fridge for the fourth time with no new information' },
    { c: 'home', t: 'a delivery is due and you have been listening for it for two hours' },
    { c: 'home', t: 'you are watching something and cannot remember what happened in the last ten minutes' },
    { c: 'home', t: 'the washing machine has finished and you are pretending not to hear it' },
    { c: 'home', t: 'you have just sat down and remembered the one thing you did not do' },
    { c: 'home', t: 'somebody knocks and you are not dressed for visitors' },
    { c: 'home', t: 'you are looking for something you are holding' },
    { c: 'home', t: 'you have made a cup of tea and immediately forgotten where you put it' },

    /* --------------------------------------------------------------- absurd */
    { c: 'absurd', t: 'you are the third person to be told the same piece of news' },
    { c: 'absurd', t: 'you have been put in charge of something you do not understand' },
    { c: 'absurd', t: 'the entire room turns to look at the one person who was not listening' },
    { c: 'absurd', t: 'you are the only one who took the instruction literally' },
    { c: 'absurd', t: 'the music has stopped and you are still the only one dancing' },
    { c: 'absurd', t: 'you are the person the group has decided will hold the map' },
    { c: 'absurd', t: 'the plan has been agreed and you are the only one who noticed the problem' },
    { c: 'absurd', t: 'you have been asked to explain something you only did by accident' }
  ];

  var CATEGORY_LABELS = {
    everyday: 'Everyday',
    work: 'Work',
    social: 'Social',
    home: 'At home',
    absurd: 'Absurd'
  };

  function createPovGenerator(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var lineEl = $('povLine');
    var badgeEl = $('povBadge');
    var metaEl = $('povMeta');

    if (!lineEl) return null;

    var tool = fun.drawTool(root, {
      data: LINES,
      filterId: 'povCategory',
      filterKey: 'c',
      drawBtnId: 'povDrawBtn',
      clearBtnId: 'povClearBtn',
      copyBtnId: 'povCopyBtn',
      resultsId: 'povResults',
      statusId: 'povStatus',
      render: function (item, info) {
        if (lineEl) lineEl.textContent = 'POV: ' + item.t;
        if (badgeEl) badgeEl.textContent = CATEGORY_LABELS[item.c] || item.c;
        if (metaEl) {
          metaEl.textContent = 'Line ' + info.drawn + ' of ' + info.total +
            ' in this setting before any of them come round again.';
        }
      },
      copyText: function (item) {
        return 'POV: ' + item.t;
      },
      onClear: function () {
        if (lineEl) lineEl.textContent = '';
        if (badgeEl) badgeEl.textContent = '';
        if (metaEl) metaEl.textContent = '';
      }
    });

    if (!tool) return null;

    tool.status.show('Every line is a situation rather than a feeling — you supply the feeling.', 'info');

    return tool;
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createPovGenerator = createPovGenerator;
})(window, document);

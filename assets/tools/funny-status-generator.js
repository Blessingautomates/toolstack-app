/**
 * ToolStack AI — Funny Status Generator engine.
 *
 * Ids required in tools/funny-status-generator.html:
 *   statStatus, statVibe, statDrawBtn, statClearBtn, statCopyBtn, statResults,
 *   statLine, statBadge, statCount, statMeta
 *
 * Short status lines by mood, with a live character count under the result.
 * The counter is not decoration: most status fields have a hard limit, and a
 * generator that hands you a line without telling you it will be truncated is a
 * generator that has wasted your time. Anything over 60 characters is flagged
 * rather than silently offered.
 *
 * Lines are drawn from a shuffled bag per mood, so a mood will not repeat one
 * until its pool is exhausted.
 */
(function (window, document) {
  'use strict';

  var SHORT_LIMIT = 60;

  var LINES = [
    /* ----------------------------------------------------------------- calm */
    { c: 'calm', t: 'around, mostly' },
    { c: 'calm', t: 'slow day. good day.' },
    { c: 'calm', t: 'not doing much, doing it well' },
    { c: 'calm', t: 'quiet one' },
    { c: 'calm', t: 'on a break from the internet' },
    { c: 'calm', t: 'here, just not loudly' },

    /* ----------------------------------------------------------------- busy */
    { c: 'busy', t: 'buried. back soon.' },
    { c: 'busy', t: 'three deadlines, one of me' },
    { c: 'busy', t: 'heads down until further notice' },
    { c: 'busy', t: 'busy week. good week.' },
    { c: 'busy', t: 'catching up on everything at once' },
    { c: 'busy', t: 'answering messages in the order they arrived' },

    /* -------------------------------------------------------------- chaotic */
    { c: 'chaotic', t: 'we go again' },
    { c: 'chaotic', t: 'no plan, full speed' },
    { c: 'chaotic', t: 'the plot is lost' },
    { c: 'chaotic', t: 'making it up as i go' },
    { c: 'chaotic', t: 'i have made a decision' },
    { c: 'chaotic', t: 'this is fine' },

    /* ------------------------------------------------------------- wholesome */
    { c: 'wholesome', t: 'grateful for small things today' },
    { c: 'wholesome', t: 'sunshine and a full kettle' },
    { c: 'wholesome', t: 'doing my best, which is enough' },
    { c: 'wholesome', t: 'hope you are well. genuinely.' },
    { c: 'wholesome', t: 'trying to be a bit kinder this week' },
    { c: 'wholesome', t: 'reminder that you are doing fine' },

    /* ------------------------------------------------------------ unbothered */
    { c: 'unbothered', t: 'unavailable and at peace' },
    { c: 'unbothered', t: 'not today' },
    { c: 'unbothered', t: 'reading, not replying' },
    { c: 'unbothered', t: 'on aeroplane mode in my head' },
    { c: 'unbothered', t: 'left it on read. sleeping fine.' },
    { c: 'unbothered', t: 'no thoughts, just a quiet afternoon' },

    /* ----------------------------------------------------------------- work */
    { c: 'work', t: 'in meetings until further notice' },
    { c: 'work', t: 'available after five' },
    { c: 'work', t: 'shipping something. back soon.' },
    { c: 'work', t: 'doing the thing i said i would' },
    { c: 'work', t: 'focused. do not disturb.' },
    { c: 'work', t: 'deadline mode, back on the other side' }
  ];

  var VIBE_LABELS = {
    calm: 'Calm',
    busy: 'Busy',
    chaotic: 'Chaotic',
    wholesome: 'Wholesome',
    unbothered: 'Unbothered',
    work: 'Work'
  };

  function createFunnyStatus(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var lineEl = $('statLine');
    var badgeEl = $('statBadge');
    var countEl = $('statCount');
    var metaEl = $('statMeta');

    if (!lineEl) return null;

    var tool = fun.drawTool(root, {
      data: LINES,
      filterId: 'statVibe',
      filterKey: 'c',
      drawBtnId: 'statDrawBtn',
      clearBtnId: 'statClearBtn',
      copyBtnId: 'statCopyBtn',
      resultsId: 'statResults',
      statusId: 'statStatus',
      render: function (item, info) {
        if (lineEl) lineEl.textContent = item.t;
        if (badgeEl) badgeEl.textContent = VIBE_LABELS[item.c] || item.c;

        /* The count is worth showing because most status fields truncate. A
         * line that will be cut off mid-word is worse than no line at all. */
        if (countEl) {
          var length = item.t.length;
          countEl.textContent = length + (length === 1 ? ' character' : ' characters') +
            (length > SHORT_LIMIT ? ' — longer than most status fields allow' : '');
          countEl.className = length > SHORT_LIMIT
            ? 'text-[11px] text-amber-400'
            : 'text-[11px] text-gray-500';
        }

        if (metaEl) {
          metaEl.textContent = 'Line ' + info.drawn + ' of ' + info.total +
            ' in this mood before any of them come round again.';
        }
      },
      copyText: function (item) {
        return item.t;
      },
      onClear: function () {
        if (lineEl) lineEl.textContent = '';
        if (badgeEl) badgeEl.textContent = '';
        if (countEl) countEl.textContent = '';
        if (metaEl) metaEl.textContent = '';
      }
    });

    if (!tool) return null;

    tool.status.show('Pick a mood and draw. The character count is there because most status fields truncate.', 'info');

    return tool;
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createFunnyStatus = createFunnyStatus;
})(window, document);

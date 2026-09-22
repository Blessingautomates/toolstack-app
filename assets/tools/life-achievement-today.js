/**
 * ToolStack AI — Life Achievement Today engine.
 *
 * Ids required in tools/life-achievement-today.html:
 *   achStatus, achInput, achDrawBtn, achClearBtn, achCopyBtn, achResults,
 *   achTitle, achDesc, achScore, achBadge, achMeta
 *
 * Awards a game-style achievement for something ordinary. The score is
 * deliberately uneven — some trivial things are worth a lot of points and some
 * genuinely difficult things are worth almost nothing, which is exactly how
 * real achievement systems behave and is the joke.
 *
 * If you type what you actually did, the tool shows it as the unlock condition.
 * It does not read or interpret the text; it is printed back as the reason for
 * the award, because that is what makes the output feel like it is about your
 * day rather than about a random line from a list.
 *
 * Achievements are drawn from a shuffled bag, so nothing repeats until the pool
 * is exhausted.
 */
(function (window, document) {
  'use strict';

  var ACHIEVEMENTS = [
    /* ------------------------------------------------------------- everyday */
    { c: 'everyday', t: 'Up On The First Alarm', d: 'You got out of bed at the time you said you would. No snooze. No negotiating.', s: 40 },
    { c: 'everyday', t: 'The Full Glass Of Water', d: 'You drank an entire glass of water unprompted. Hydration is a lifestyle and you are living it.', s: 15 },
    { c: 'everyday', t: 'Answered That Message', d: 'A message had been sitting there for an unspecified amount of time. It is now answered. The weight has lifted.', s: 55 },
    { c: 'everyday', t: 'Left The House On Time', d: 'Not early. Not late. On time, which is the hardest of the three.', s: 70 },
    { c: 'everyday', t: 'Remembered The Thing', d: 'You remembered the thing without anybody reminding you. This is the rarest achievement on the list.', s: 85 },
    { c: 'everyday', t: 'Went To Bed At A Sensible Hour', d: 'You closed the laptop and went to bed. Legendary behaviour, rarely witnessed.', s: 90 },

    /* ----------------------------------------------------------------- work */
    { c: 'work', t: 'Inbox Zero (Temporary)', d: 'Your inbox is empty. This state will last approximately eleven minutes. Enjoy it.', s: 75 },
    { c: 'work', t: 'Survived The Meeting', d: 'You attended a meeting that could have been an email and said nothing you regret.', s: 30 },
    { c: 'work', t: 'Said The Thing', d: 'You raised the point everybody was thinking and nobody was saying. The room went quiet.', s: 95 },
    { c: 'work', t: 'Left On Time', d: 'You closed the laptop at the time your contract says you can, and felt briefly guilty, and did it anyway.', s: 80 },
    { c: 'work', t: 'Declined A Meeting', d: 'You said no to a meeting with no explanation and no apology. A masterclass.', s: 100 },

    /* --------------------------------------------------------------- social */
    { c: 'social', t: 'Made The Plans', d: 'You were the one who actually put a date in the group chat instead of saying "we should do this sometime".', s: 88 },
    { c: 'social', t: 'Cancelled Without Guilt', d: 'You cancelled something and did not write three paragraphs of apology. Growth.', s: 65 },
    { c: 'social', t: 'Remembered The Name', d: 'You used somebody’s name correctly on the second meeting. Nobody noticed. You did.', s: 45 },
    { c: 'social', t: 'The Good Question', d: 'You asked somebody a question and then actually listened to the whole answer.', s: 60 },
    { c: 'social', t: 'Left The Party At The Right Time', d: 'You left while it was still good. This is a skill and almost nobody has it.', s: 85 },

    /* ----------------------------------------------------------------- home */
    { c: 'home', t: 'The Drawer', d: 'You dealt with the drawer. You know the one. It is done.', s: 100 },
    { c: 'home', t: 'Emptied The Dishwasher', d: 'The dishwasher was empty before the next load went in. A perfect cycle, rarely achieved.', s: 35 },
    { c: 'home', t: 'Threw It Away', d: 'You finally got rid of the thing you have been moving from surface to surface for two years.', s: 95 },
    { c: 'home', t: 'Watered The Plant', d: 'The plant is still alive. This is now a relationship.', s: 20 },
    { c: 'home', t: 'Made A Real Meal', d: 'Not a snack. Not cereal. An actual meal, with more than one component, on a plate.', s: 70 },

    /* ---------------------------------------------------------------- chaos */
    { c: 'chaos', t: 'Winged It Successfully', d: 'You had no plan and it worked anyway. This will teach you entirely the wrong lesson.', s: 50 },
    { c: 'chaos', t: 'Made A Decision', d: 'You chose between two options instead of thinking about them for another week. Historic.', s: 90 },
    { c: 'chaos', t: 'The Accidental Nap', d: 'You sat down for a moment and woke up two hours later. The evening has been restructured.', s: 25 },
    { c: 'chaos', t: 'Bought The Thing', d: 'You have been looking at it for three months. It is bought. The looking is over.', s: 55 },
    { c: 'chaos', t: 'Said No To Something', d: 'Somebody asked and you declined, and the world did not end, and you did not explain yourself.', s: 100 },
    { c: 'chaos', t: 'Did The Small Thing', d: 'The task had been on the list for eleven days and would have taken four minutes. It took four minutes.', s: 65 }
  ];

  var CATEGORY_LABELS = {
    everyday: 'Everyday',
    work: 'Work',
    social: 'Social',
    home: 'At home',
    chaos: 'Life admin'
  };

  function createLifeAchievement(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var inputEl = $('achInput');
    var titleEl = $('achTitle');
    var descEl = $('achDesc');
    var scoreEl = $('achScore');
    var badgeEl = $('achBadge');
    var metaEl = $('achMeta');
    var resultsEl = $('achResults');
    var statusEl = $('achStatus');

    if (!titleEl) return null;

    var status = fun.makeStatus(statusEl);

    var bag = fun.makeBag(function () { return ACHIEVEMENTS; }, null);

    function draw() {
      var item = bag.draw();
      if (!item) {
        status.show('Nothing left to unlock. Clear the tool to reset the pool.', 'warn');
        return;
      }

      var what = fun.inputValue(inputEl, '');

      if (resultsEl) resultsEl.classList.remove('hidden');
      titleEl.textContent = item.t;
      descEl.textContent = item.d;
      if (scoreEl) scoreEl.textContent = item.s + 'G';
      if (badgeEl) badgeEl.textContent = CATEGORY_LABELS[item.c] || item.c;
      if (metaEl) {
        metaEl.textContent = what
          ? 'Unlocked for: ' + what
          : 'Unlocked for something you did today. Type what it was and it will be shown here.';
      }

      status.hide();
    }

    var drawBtn = $('achDrawBtn');
    var clearBtn = $('achClearBtn');
    var copyBtn = $('achCopyBtn');

    if (drawBtn) drawBtn.addEventListener('click', draw);

    if (inputEl) {
      inputEl.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          draw();
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        bag.reset();
        if (inputEl) inputEl.value = '';
        if (resultsEl) resultsEl.classList.add('hidden');
        titleEl.textContent = '';
        descEl.textContent = '';
        if (scoreEl) scoreEl.textContent = '';
        if (badgeEl) badgeEl.textContent = '';
        if (metaEl) metaEl.textContent = '';
        status.show('Cleared. The full pool is available again.', 'info');
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!titleEl.textContent) {
          status.show('Unlock an achievement first.', 'warn');
          return;
        }
        fun.copy(
          'Achievement unlocked: ' + titleEl.textContent +
          '\n' + descEl.textContent +
          '\n' + (scoreEl ? scoreEl.textContent : '') +
          (metaEl && metaEl.textContent ? '\n\n' + metaEl.textContent : ''),
          status
        );
      });
    }

    status.show('Something you did today probably counts. Type it in and find out what it was worth.', 'info');

    return { draw: draw };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createLifeAchievement = createLifeAchievement;
})(window, document);

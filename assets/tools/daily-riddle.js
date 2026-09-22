/**
 * ToolStack AI — Daily Riddle engine.
 *
 * Ids required in tools/daily-riddle.html:
 *   drStatus, drDate, drQuestion, drHintBtn, drHint, drRevealBtn, drAnswer,
 *   drArchive, drStreak, drCopyBtn
 *
 * The mechanic is a calendar, not a draw. There is exactly one riddle a day and
 * everyone gets the same one, which is what makes it a daily: the point is that
 * two people can compare answers without comparing which button they pressed.
 * The choice is derived from the date rather than stored, so the same day gives
 * the same riddle on every device and in every browser, with no server and no
 * state to lose.
 *
 * Two implementation details that matter more than they look:
 *
 * 1. The day number is built from the *local* date parts, not from
 *    toISOString(). A UTC-based key would flip the riddle at midnight UTC,
 *    which is the middle of the afternoon for some users and the middle of the
 *    evening for others. A daily puzzle should change when the user's day
 *    changes.
 *
 * 2. The streak is the only thing written to storage, and it is wrapped in
 *    try/catch. Private browsing and blocked site data both make localStorage
 *    throw on access rather than return null, and a streak counter is not worth
 *    a broken page. If storage is unavailable the page simply shows no streak.
 */
(function (window, document) {
  'use strict';

  var STORE_KEY = 'toolstack.dailyRiddle';
  var ARCHIVE_DAYS = 6;

  var RIDDLES = [
    { q: 'What has keys but no locks, space but no room, and you can enter but not go in?', a: 'A keyboard.', h: 'You are probably within arm’s reach of one.' },
    { q: 'The more you take, the more you leave behind. What am I?', a: 'Footsteps.', h: 'Always behind you, never in front.' },
    { q: 'What gets wetter the more it dries?', a: 'A towel.', h: 'It is useful and useless at the same moment.' },
    { q: 'What can travel around the world while staying in a corner?', a: 'A stamp.', h: 'It never moves on its own.' },
    { q: 'Which word becomes shorter when you add two letters to it?', a: 'Short.', h: 'Add two letters to the end.' },
    { q: 'What occurs once in a minute, twice in a moment, and never in a thousand years?', a: 'The letter M.', h: 'Spelling, not meaning.' },
    { q: 'A farmer has seventeen sheep. All but nine run away. How many are left?', a: 'Nine.', h: 'The seventeen is doing no work.' },
    { q: 'You are in a race and you overtake the person in second place. What position are you in?', a: 'Second place.', h: 'You took their place, not the leader’s.' },
    { q: 'A bat and a ball cost £1.10 together. The bat costs £1 more than the ball. How much is the ball?', a: 'Five pence.', h: 'Not ten pence. Check both sentences.' },
    { q: 'A doctor gives you three pills and says take one every half hour. How long do they last?', a: 'One hour.', h: 'The first is taken straight away.' },
    { q: 'How many times can you subtract 5 from 25?', a: 'Once.', h: 'What are you subtracting from the second time?' },
    { q: 'Which weighs more: a kilogram of feathers or a kilogram of steel?', a: 'Neither.', h: 'Read the units.' },
    { q: 'You have a bowl of six apples and you take away four. How many do you have?', a: 'Four.', h: 'The question asks what you have.' },
    { q: 'How many months of the year have twenty-eight days?', a: 'All twelve.', h: 'Twenty-eight is a minimum.' },
    { q: 'What has a face and two hands but no arms or legs?', a: 'A clock.', h: 'You would have to be very late to miss it.' },
    { q: 'What has many teeth but cannot bite?', a: 'A comb.', h: 'It goes through hair.' },
    { q: 'What has a neck but no head?', a: 'A bottle.', h: 'Often on a dinner table.' },
    { q: 'What has one eye but cannot see?', a: 'A needle.', h: 'Its eye is for something else to use.' },
    { q: 'What five-letter word, written in capitals, reads the same upside down?', a: 'SWIMS.', h: 'Very few letters survive being flipped.' },
    { q: 'Which English word has three consecutive pairs of double letters?', a: 'Bookkeeper.', h: 'It is a job.' },
    { q: 'What word contains twenty-six letters but only three syllables?', a: 'Alphabet.', h: 'The letters are in the word.' },
    { q: 'What is at the end of a rainbow?', a: 'The letter W.', h: 'Not about weather.' },
    { q: 'What has a ring but no finger?', a: 'A telephone.', h: 'It used to live in a hallway.' },
    { q: 'What has a thumb and four fingers but is not alive?', a: 'A glove.', h: 'It only has them when you do.' },
    { q: 'What has legs but does not walk?', a: 'A table.', h: 'You probably eat off one.' },
    { q: 'What has a head and a tail but no body?', a: 'A coin.', h: 'Toss it.' },
    { q: 'Which building has the most stories?', a: 'A library.', h: 'One word, two meanings.' },
    { q: 'What can you catch but never throw?', a: 'A cold.', h: 'Not an object.' },
    { q: 'What has one head, one foot and four legs?', a: 'A bed.', h: 'A third of your life.' },
    { q: 'What has a spine but no bones?', a: 'A book.', h: 'You might find it in a library.' },
    { q: 'What has roots nobody sees, is taller than trees, and yet never grows?', a: 'A mountain.', h: 'Large and patient.' },
    { q: 'What kind of tree can you carry in your hand?', a: 'A palm.', h: 'A pun on a body part.' },
    { q: 'What runs but never walks, and has a bed but never sleeps?', a: 'A river.', h: 'It has a mouth too.' },
    { q: 'I am tall when I am young and short when I am old. What am I?', a: 'A candle.', h: 'Being short means nearly finished.' },
    { q: 'What goes up but never comes down?', a: 'Your age.', h: 'Once a year, no physical form.' },
    { q: 'What falls but never breaks, and breaks but never falls?', a: 'Night and day.', h: 'Two halves of one cycle.' },
    { q: 'What can fill an entire room but takes up no space?', a: 'Light.', h: 'You would notice at once if it went.' },
    { q: 'What is full of holes but still holds water?', a: 'A sponge.', h: 'Soft, and lives by a sink.' },
    { q: 'What begins with T, ends with T, and has T in it?', a: 'A teapot.', h: 'It holds tea, which is not a coincidence.' },
    { q: 'What is at the end of everything?', a: 'The letter G.', h: 'Same trick as the rainbow.' }
  ];

  /* ------------------------------------------------------------- date maths */

  /* Local calendar date, zero-padded, used as the storage key and the label. */
  function dateKey(date) {
    var m = date.getMonth() + 1;
    var d = date.getDate();
    return date.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d);
  }

  /* A stable integer for a local calendar day. Built via Date.UTC from the
   * local parts so it never shifts with the user's timezone offset. */
  function dayNumber(date) {
    return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  }

  function dayLabel(date) {
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'];
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()] + ' ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
  }

  function riddleFor(dayNum) {
    var index = ((dayNum % RIDDLES.length) + RIDDLES.length) % RIDDLES.length;
    return RIDDLES[index];
  }

  /* ---------------------------------------------------------------- storage */

  function readStreak() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.last !== 'string') return null;
      return parsed;
    } catch (error) {
      return null;
    }
  }

  function writeStreak(value) {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(value));
    } catch (error) {
      /* Private browsing, blocked site data, or a full quota. A streak counter
       * is not worth breaking the page over, so this fails silently. */
    }
  }

  function createDailyRiddle(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var dateEl = $('drDate');
    var questionEl = $('drQuestion');
    var hintEl = $('drHint');
    var hintBtn = $('drHintBtn');
    var answerEl = $('drAnswer');
    var revealBtn = $('drRevealBtn');
    var archiveEl = $('drArchive');
    var streakEl = $('drStreak');
    var copyBtn = $('drCopyBtn');
    var statusEl = $('drStatus');

    if (!questionEl) return null;

    var status = fun.makeStatus(statusEl);

    /* "Today" is fixed at load. A tab left open across midnight keeps showing
     * the riddle it opened with, which is the right behaviour — swapping the
     * puzzle out from under somebody mid-solve would be worse than being a few
     * hours stale. */
    var today = new Date();
    var todayKey = dateKey(today);
    var todayNumber = dayNumber(today);
    var riddle = riddleFor(todayNumber);

    var revealed = false;

    /* ------------------------------------------------------------ rendering */

    function renderToday() {
      if (dateEl) dateEl.textContent = dayLabel(today);
      questionEl.textContent = riddle.q;
      if (answerEl) { answerEl.textContent = ''; answerEl.classList.add('hidden'); }
      if (hintEl) { hintEl.textContent = ''; hintEl.classList.add('hidden'); }
      if (revealBtn) {
        revealBtn.disabled = false;
        revealBtn.textContent = 'Reveal the answer';
        revealBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      }
      if (hintBtn) {
        hintBtn.disabled = false;
        hintBtn.textContent = 'Give me a hint';
        hintBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    }

    function renderArchive() {
      if (!archiveEl) return;
      archiveEl.innerHTML = '';

      for (var back = 1; back <= ARCHIVE_DAYS; back++) {
        var when = new Date(today.getFullYear(), today.getMonth(), today.getDate() - back);
        var past = riddleFor(dayNumber(when));

        var details = document.createElement('details');
        details.className = 'ts-faq border border-gray-800 rounded-xl bg-gray-950 overflow-hidden';

        var summary = document.createElement('summary');
        summary.className = 'cursor-pointer px-4 py-3 text-xs font-semibold text-gray-300 hover:text-brand-400 transition';
        summary.textContent = dayLabel(when);

        var body = document.createElement('div');
        body.className = 'px-4 pb-4 space-y-2';

        var q = document.createElement('p');
        q.className = 'text-xs text-gray-400 leading-relaxed';
        q.textContent = past.q;

        var a = document.createElement('p');
        a.className = 'text-xs text-brand-400 font-semibold';
        a.textContent = past.a;

        body.appendChild(q);
        body.appendChild(a);
        details.appendChild(summary);
        details.appendChild(body);
        archiveEl.appendChild(details);
      }
    }

    /* The streak counts consecutive days the page has been opened, not
     * consecutive days the riddle was solved — the tool has no way to verify a
     * solution and would rather count something it can actually observe. */
    function renderStreak() {
      var stored = readStreak();
      var count = 1;

      if (stored) {
        if (stored.last === todayKey) {
          count = stored.streak || 1;
        } else {
          var last = new Date(stored.last + 'T00:00:00');
          var gap = isNaN(last.getTime()) ? 999 : todayNumber - dayNumber(last);
          count = gap === 1 ? (stored.streak || 0) + 1 : 1;
        }
      }

      writeStreak({ last: todayKey, streak: count });

      if (!streakEl) return;
      if (count <= 1) {
        streakEl.textContent = 'First day. Come back tomorrow and this starts counting.';
      } else {
        streakEl.textContent = count + ' days in a row.';
      }
    }

    /* --------------------------------------------------------------- wiring */

    renderToday();
    renderArchive();
    renderStreak();

    if (hintBtn) {
      hintBtn.addEventListener('click', function () {
        if (hintEl) {
          hintEl.textContent = riddle.h;
          hintEl.classList.remove('hidden');
        }
        hintBtn.disabled = true;
        hintBtn.textContent = 'Hint shown';
        hintBtn.classList.add('opacity-50', 'cursor-not-allowed');
      });
    }

    if (revealBtn) {
      revealBtn.addEventListener('click', function () {
        revealed = true;
        if (answerEl) {
          answerEl.textContent = riddle.a;
          answerEl.classList.remove('hidden');
        }
        revealBtn.disabled = true;
        revealBtn.textContent = 'Answer revealed';
        revealBtn.classList.add('opacity-50', 'cursor-not-allowed');
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var text = 'Daily riddle for ' + dayLabel(today) + ':\n\n' + riddle.q;
        text += revealed ? '\n\nAnswer: ' + riddle.a : '\n\n(Answer not revealed yet.)';
        fun.copy(text, status);
      });
    }

    status.show('One riddle a day, the same one for everybody. Come back tomorrow for the next.', 'info');

    return {
      today: todayKey,
      riddle: riddle,
      reveal: function () { if (revealBtn) revealBtn.click(); }
    };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createDailyRiddle = createDailyRiddle;
})(window, document);

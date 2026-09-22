/**
 * ToolStack AI — Bad Joke Generator engine.
 *
 * Ids required in tools/bad-joke-generator.html:
 *   badTopic, badTellBtn, badClearBtn, badCopyBtn, badResults,
 *   badSetup, badPunchline, badBadge, badAwful, badMeta, badStatus
 *
 * The premise of this tool is that the jokes are supposed to be bad, which
 * makes it the one generator on the site where a weak joke is the feature. The
 * set leans on anti-jokes — the ones that set up a rhythm and then refuse to
 * deliver — because that is the shape that reliably produces the "wait, that
 * was it?" reaction the tool exists for.
 *
 * Two mechanical choices:
 *
 * 1. The set is embedded rather than fetched. That makes the tool instant and
 *    offline-capable, and means no third party learns which joke you got. The
 *    cost is that the list is fixed.
 *
 * 2. Draws come from a shuffled bag rather than Math.random() over the array,
 *    so every joke in a topic appears once before any of them repeats. A
 *    generator that hands you the same joke twice in a row reads as broken,
 *    which is the last thing a joke tool can afford.
 *
 * The awfulness score on each joke is authored by hand, not computed. How badly
 * a joke lands is a judgement, and a formula would only be pretending otherwise.
 *
 * Everything here is clean and safe for a general audience. Deliberately
 * unfunny is the goal; offensive is not, and the two are not the same thing.
 */
(function (window, document) {
  'use strict';

  /**
   * t = topic, s = setup, p = punchline, awful = 1-5, the tool's own rating of
   * how badly the joke fails. Higher is worse, which here means better.
   */
  var JOKES = [
    /* ----------------------------------------------------------- anti-jokes */
    { t: 'anti', s: "What's red and bad for your teeth?", p: 'A brick.', awful: 5 },
    { t: 'anti', s: "What's orange and sounds like a parrot?", p: 'A carrot.', awful: 4 },
    { t: 'anti', s: 'Why did the chicken cross the road?', p: 'To get to the other side.', awful: 5 },
    { t: 'anti', s: "What's brown and sticky?", p: 'A stick.', awful: 5 },
    { t: 'anti', s: "What's green and has wheels?", p: 'Grass. I lied about the wheels.', awful: 4 },
    { t: 'anti', s: "What's blue and smells like red paint?", p: 'Blue paint.', awful: 5 },
    { t: 'anti', s: "What's yellow and dangerous?", p: 'Shark-infested custard.', awful: 3 },
    { t: 'anti', s: "What's grey and comes in litres?", p: 'A litre of grey.', awful: 5 },

    /* --------------------------------------------------------- literal ones */
    { t: 'literal', s: 'What do you call a deer with no eyes?', p: 'No idea.', awful: 5 },
    { t: 'literal', s: 'What do you call a deer with no eyes and no legs?', p: 'Still no idea.', awful: 5 },
    { t: 'literal', s: 'What do you call a fly with no wings?', p: 'A walk.', awful: 5 },
    { t: 'literal', s: 'What has four wheels and flies?', p: 'A bin lorry.', awful: 4 },
    { t: 'literal', s: 'Why did the man put his money in the freezer?', p: 'He wanted cold hard cash.', awful: 4 },
    { t: 'literal', s: 'What do you call a man who has lost his dog?', p: 'A man who has lost his dog.', awful: 5 },
    { t: 'literal', s: 'How do you make holy water?', p: 'You boil the hell out of it.', awful: 4 },
    { t: 'literal', s: 'What is the difference between a duck?', p: 'One of its legs is both the same.', awful: 5 },

    /* ----------------------------------------------------------------- work */
    { t: 'work', s: 'Why did the office worker bring a ladder to work?', p: 'He wanted to get to the bottom of things.', awful: 3 },
    { t: 'work', s: 'My boss told me to have a good day.', p: 'So I went home.', awful: 4 },
    { t: 'work', s: 'I asked my boss for a raise.', p: 'He gave me a ladder.', awful: 3 },
    { t: 'work', s: 'What did the spreadsheet say to the accountant?', p: 'You can count on me.', awful: 4 },
    { t: 'work', s: 'Why was the worker fired from the orange juice factory?', p: 'He could not concentrate.', awful: 3 },
    { t: 'work', s: 'I got a job at the bakery.', p: 'They promised me a lot of dough. I was paid in bread.', awful: 4 },
    { t: 'work', s: 'What do you call a meeting that could have been an email?', p: 'Every meeting.', awful: 4 },
    { t: 'work', s: 'Why did the printer break?', p: 'It sensed I was in a hurry.', awful: 3 },

    /* ---------------------------------------------------------------- sport */
    { t: 'sport', s: 'Why did the footballer bring string to the match?', p: 'To tie the game.', awful: 4 },
    { t: 'sport', s: 'I went to a seafood disco last week.', p: 'I pulled a mussel.', awful: 3 },
    { t: 'sport', s: 'Why did the runner stop in the middle of the race?', p: 'He forgot why he started.', awful: 4 },
    { t: 'sport', s: 'What do you call a failed gym?', p: 'A gym.', awful: 5 },
    { t: 'sport', s: 'I do not do cardio.', p: 'If I am running, something has gone very wrong.', awful: 3 },
    { t: 'sport', s: 'Why did the swimmer wear a coat?', p: 'The pool was closed.', awful: 5 },
    { t: 'sport', s: 'How did the footballer do in his exams?', p: 'Lots of goals. No marks.', awful: 3 },
    { t: 'sport', s: "What is a tennis player's favourite drink?", p: 'Anything he can serve.', awful: 4 },

    /* -------------------------------------------------------------- general */
    { t: 'general', s: 'Why did the man put his car in the oven?', p: 'He wanted a hot rod.', awful: 4 },
    { t: 'general', s: 'I have a stepladder.', p: 'My real ladder left.', awful: 4 },
    { t: 'general', s: 'What do you call a magic dog?', p: 'A labracadabrador.', awful: 3 },
    { t: 'general', s: 'Why did the coffee file a police report?', p: 'It got mugged.', awful: 3 },
    { t: 'general', s: 'What did the zero say to the eight?', p: 'Nice belt.', awful: 4 },
    { t: 'general', s: 'Why did the man run around his bed?', p: 'To catch up on his sleep.', awful: 3 },
    { t: 'general', s: 'What do you call a can opener that does not work?', p: "A can't opener.", awful: 4 },
    { t: 'general', s: 'I told my computer I needed a break.', p: 'Now it keeps sending me holiday photos.', awful: 4 }
  ];

  var TOPIC_LABELS = {
    anti: 'Anti-joke',
    literal: 'Painfully literal',
    work: 'Work',
    sport: 'Sport',
    general: 'General'
  };

  function createBadJokeGenerator(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var topicEl = $('badTopic');
    var tellBtn = $('badTellBtn');
    var clearBtn = $('badClearBtn');
    var copyBtn = $('badCopyBtn');
    var resultsEl = $('badResults');
    var setupEl = $('badSetup');
    var punchEl = $('badPunchline');
    var badgeEl = $('badBadge');
    var awfulEl = $('badAwful');
    var metaEl = $('badMeta');
    var statusEl = $('badStatus');

    if (!tellBtn || !resultsEl || !setupEl || !punchEl) return null;

    var STATUS = {
      ok: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      info: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      warn: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      error: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    };

    function showStatus(message, kind) {
      if (!statusEl) return;
      var keys = ['ok', 'info', 'warn', 'error'];
      for (var i = 0; i < keys.length; i++) {
        statusEl.classList.remove.apply(statusEl.classList, STATUS[keys[i]].split(' '));
      }
      statusEl.classList.add.apply(statusEl.classList, (STATUS[kind] || STATUS.info).split(' '));
      statusEl.textContent = message;
      statusEl.classList.remove('hidden');
    }

    function hideStatus() {
      if (statusEl) statusEl.classList.add('hidden');
    }

    function pool(topic) {
      return JOKES.filter(function (joke) {
        return topic === 'all' || joke.t === topic;
      });
    }

    var bag = [];
    var bagTopic = '';
    var last = null;
    var drawn = 0;
    var total = 0;

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

    function refill(topic, exclude) {
      var fresh = pool(topic);
      if (exclude && fresh.length > 1) {
        fresh = fresh.filter(function (joke) { return joke !== exclude; });
      }
      bag = shuffle(fresh);
      bagTopic = topic;
      total = pool(topic).length;
      drawn = 0;
    }

    function draw(topic) {
      if (bagTopic !== topic) refill(topic, null);
      if (bag.length === 0) refill(topic, last);
      if (bag.length === 0) return null;
      var joke = bag.pop();
      drawn += 1;
      last = joke;
      return joke;
    }

    /**
     * The awfulness score, drawn from block characters rather than a CSS bar so
     * it stays legible in both themes without needing its own colour rules.
     */
    function awfulMeter(rating) {
      var filled = Math.max(1, Math.min(5, rating || 3));
      var out = '';
      for (var i = 0; i < 5; i++) out += i < filled ? '■' : '□';
      return out;
    }

    function render(joke) {
      setupEl.textContent = joke.s;
      punchEl.textContent = joke.p;
      if (badgeEl) badgeEl.textContent = TOPIC_LABELS[joke.t] || 'Bad joke';
      if (awfulEl) awfulEl.textContent = awfulMeter(joke.awful);
      if (metaEl) {
        metaEl.textContent = 'Joke ' + drawn + ' of ' + total +
          ' in this topic before any of them come round again.';
      }
      resultsEl.classList.remove('hidden');
    }

    function tell() {
      var topic = topicEl ? topicEl.value : 'all';
      var joke = draw(topic);
      if (!joke) {
        showStatus('No jokes in that topic yet. Try another one.', 'warn');
        return;
      }
      hideStatus();
      render(joke);
    }

    tellBtn.addEventListener('click', tell);

    if (topicEl) {
      topicEl.addEventListener('change', function () {
        refill(topicEl.value, null);
        hideStatus();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        resultsEl.classList.add('hidden');
        setupEl.textContent = '';
        punchEl.textContent = '';
        if (awfulEl) awfulEl.textContent = '';
        bag = [];
        bagTopic = '';
        last = null;
        hideStatus();
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var text = setupEl.textContent + ' ' + punchEl.textContent;
        if (!text.trim()) {
          showStatus('Tell a joke first, then copy it.', 'warn');
          return;
        }
        var copy = window.ToolStack && window.ToolStack.copyText;
        if (!copy) {
          showStatus('Copying is unavailable in this browser.', 'error');
          return;
        }
        copy(text, function (ok) {
          if (ok) showStatus('Joke copied to your clipboard.', 'ok');
          else showStatus('Could not reach the clipboard. Select the text and copy it manually.', 'error');
        });
      });
    }

    return { tell: tell };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createBadJokeGenerator = createBadJokeGenerator;
})(window, document);

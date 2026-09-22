/**
 * ToolStack AI — Dark Humour Joke Generator engine.
 *
 * Ids required in tools/dark-humor-joke.html:
 *   darkTopic, darkTellBtn, darkClearBtn, darkCopyBtn, darkResults,
 *   darkSetup, darkPunchline, darkBadge, darkGloom, darkMeta, darkStatus
 *
 * A note on what "dark" means in this file, because the edges here matter.
 *
 * Dark humour done badly is cruelty with a punchline, and that is not what this
 * is. Everything in this set is absurdist gloom: existential dread, the heat
 * death of the universe, Mondays, bins, printer errors. The comedy is aimed at
 * the universe and at the narrator's own mild despair — never at a person,
 * never at a group, and never at anybody's actual misfortune.
 *
 * That rules out, deliberately and permanently: illness, bereavement, self-harm,
 * violence, tragedy, and anything that treats a real event or a real person as
 * material. If you are editing this file and reaching for one of those, the
 * answer is no. There are five billion years of the sun expanding ahead of us;
 * there is plenty to work with.
 *
 * Two mechanical choices, same as the site's other generators:
 *
 * 1. The set is embedded rather than fetched, so the tool is instant and works
 *    offline. The cost is that the list is fixed.
 *
 * 2. Draws come from a shuffled bag, so every joke in a topic appears once
 *    before any of them repeats.
 */
(function (window, document) {
  'use strict';

  /**
   * t = topic, s = setup, p = punchline, gloom = 1-5 rating shown on the card.
   * The rating is authored by hand — it is a tone judgement, not a measurement.
   */
  var JOKES = [
    /* ---------------------------------------------------------- existential */
    { t: 'existential', s: 'I keep a to-do list.', p: 'It is the word "entropy" written four hundred times.', gloom: 4 },
    { t: 'existential', s: 'Every morning I make a fresh start.', p: 'By lunchtime it is a stale start.', gloom: 3 },
    { t: 'existential', s: 'I asked the universe for a sign.', p: 'It sent a parking ticket.', gloom: 4 },
    { t: 'existential', s: 'My horoscope said big changes were coming.', p: 'It was the bins.', gloom: 3 },
    { t: 'existential', s: 'I am at peace with the void.', p: 'The void has not confirmed whether it is at peace with me.', gloom: 4 },
    { t: 'existential', s: 'Nothing lasts forever.', p: 'Including that sentence.', gloom: 5 },
    { t: 'existential', s: 'I plan to live forever.', p: 'So far, so good.', gloom: 4 },
    { t: 'existential', s: 'Time is a flat circle.', p: 'So is my commute.', gloom: 3 },

    /* --------------------------------------------------------------- cosmic */
    { t: 'cosmic', s: 'The sun will expand and consume the Earth in about five billion years.', p: 'So I have cancelled my gym membership.', gloom: 5 },
    { t: 'cosmic', s: 'There are more stars than grains of sand on Earth.', p: 'And I still cannot find my keys.', gloom: 3 },
    { t: 'cosmic', s: 'The universe is mostly empty space.', p: 'So is my calendar.', gloom: 4 },
    { t: 'cosmic', s: 'Astronomers found a planet where it rains glass sideways.', p: 'Still sounds better than my Tuesday.', gloom: 4 },
    { t: 'cosmic', s: 'The nearest star is four light years away.', p: 'Which is roughly how long my emails take to get answered.', gloom: 3 },
    { t: 'cosmic', s: 'Scientists say the universe is expanding.', p: 'So is my list of unfinished projects.', gloom: 4 },
    { t: 'cosmic', s: 'A black hole would stretch me into a strand of spaghetti in seconds.', p: 'My calendar does that every Monday.', gloom: 4 },
    { t: 'cosmic', s: 'We are all made of stardust.', p: 'Mine appears to be the kind that settles on the skirting board.', gloom: 4 },

    /* -------------------------------------------------------------- mundane */
    { t: 'mundane', s: 'I opened the fridge for inspiration.', p: 'The fridge had none. It just stood there. Cold. Judging.', gloom: 3 },
    { t: 'mundane', s: 'My houseplant died.', p: 'It was the only thing in the house that depended on me, and it made its choice.', gloom: 4 },
    { t: 'mundane', s: 'I sorted my socks today.', p: 'That is the whole achievement. That is the entire thing.', gloom: 4 },
    { t: 'mundane', s: 'I have a fitness tracker.', p: 'It tracks how little I move. It is very accurate.', gloom: 3 },
    { t: 'mundane', s: 'I went for a walk to clear my head.', p: 'There was nothing in there to clear.', gloom: 4 },
    { t: 'mundane', s: 'I made a lovely dinner.', p: 'Ate it standing over the sink. Chef’s kiss.', gloom: 3 },
    { t: 'mundane', s: 'My phone says I have forty-seven thousand unread emails.', p: 'I say they are not unread. They are archived by neglect.', gloom: 4 },
    { t: 'mundane', s: 'I bought a book on time management.', p: 'I have not had time to read it.', gloom: 4 },

    /* ----------------------------------------------------------- technology */
    { t: 'technology', s: 'My smart speaker heard me sigh.', p: 'It suggested a podcast.', gloom: 3 },
    { t: 'technology', s: 'The update finished installing.', p: 'Now nothing works, but in a new way.', gloom: 3 },
    { t: 'technology', s: 'I asked the chatbot for advice.', p: 'It told me to consult a professional. About everything.', gloom: 4 },
    { t: 'technology', s: 'My printer has entered an error state.', p: 'It will not say which error. That is between it and the universe.', gloom: 4 },
    { t: 'technology', s: 'The cloud is just someone else’s computer.', p: 'And it is having a worse day than mine.', gloom: 4 },
    { t: 'technology', s: 'I got an alert about my screen time.', p: 'The alert took eleven minutes to read.', gloom: 4 },
    { t: 'technology', s: 'My phone battery dies at three in the afternoon.', p: 'Honestly, a reasonable response to the day.', gloom: 3 },
    { t: 'technology', s: 'I have two hundred browser tabs open.', p: 'They are not tabs. They are intentions.', gloom: 4 },

    /* ------------------------------------------------------------ the beyond */
    { t: 'beyond', s: 'I would like to come back as a cat.', p: 'Sleep eighteen hours, be fed, feel no shame. That is the whole plan.', gloom: 2 },
    { t: 'beyond', s: 'If there is a light at the end of the tunnel, I hope it is not a Monday.', gloom: 4, p: '' },
    { t: 'beyond', s: 'I imagine the afterlife is a waiting room.', p: 'With a number system. My number was called in 2011.', gloom: 4 },
    { t: 'beyond', s: 'My ghost will absolutely haunt this house.', p: 'Mostly by moving the keys slightly to the left.', gloom: 3 },
    { t: 'beyond', s: 'I have left clear instructions.', p: 'They are in a drawer I have forgotten about.', gloom: 4 },
    { t: 'beyond', s: 'I would like my tombstone to say "he was fine".', gloom: 5, p: '' },
    { t: 'beyond', s: 'Reincarnation sounds exhausting.', p: 'I have only just got the hang of this one.', gloom: 3 },
    { t: 'beyond', s: 'If I haunt anywhere, it will be the office kitchen.', p: 'Standing slightly too close to the kettle.', gloom: 3 }
  ];

  var TOPIC_LABELS = {
    existential: 'Existential',
    cosmic: 'Cosmic',
    mundane: 'Everyday doom',
    technology: 'Technology',
    beyond: 'The beyond'
  };

  function createDarkHumorJoke(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var topicEl = $('darkTopic');
    var tellBtn = $('darkTellBtn');
    var clearBtn = $('darkClearBtn');
    var copyBtn = $('darkCopyBtn');
    var resultsEl = $('darkResults');
    var setupEl = $('darkSetup');
    var punchEl = $('darkPunchline');
    var badgeEl = $('darkBadge');
    var gloomEl = $('darkGloom');
    var metaEl = $('darkMeta');
    var statusEl = $('darkStatus');

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

    function gloomMeter(rating) {
      var filled = Math.max(1, Math.min(5, rating || 3));
      var out = '';
      for (var i = 0; i < 5; i++) out += i < filled ? '■' : '□';
      return out;
    }

    function render(joke) {
      setupEl.textContent = joke.s;
      // Some entries are a single line with no separate punchline. Hiding the
      // empty element rather than printing a blank keeps the card from ending
      // in dead space.
      punchEl.textContent = joke.p || '';
      punchEl.classList.toggle('hidden', !joke.p);
      if (badgeEl) badgeEl.textContent = TOPIC_LABELS[joke.t] || 'Dark';
      if (gloomEl) gloomEl.textContent = gloomMeter(joke.gloom);
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
        if (gloomEl) gloomEl.textContent = '';
        bag = [];
        bagTopic = '';
        last = null;
        hideStatus();
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var text = (setupEl.textContent + ' ' + punchEl.textContent).trim();
        if (!text) {
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
  window.ToolStackTools.createDarkHumorJoke = createDarkHumorJoke;
})(window, document);

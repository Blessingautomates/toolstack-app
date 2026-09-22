/**
 * ToolStack AI — Dad Joke Generator engine.
 *
 * Ids required in tools/dad-joke-generator.html:
 *   dadTopic, dadTellBtn, dadClearBtn, dadCopyBtn, dadResults,
 *   dadSetup, dadPunchline, dadBadge, dadMeta, dadStatus
 *
 * Two choices worth knowing about:
 *
 * 1. The set is embedded rather than fetched. 56 jokes is small enough to ship,
 *    which is what makes the tool instant, offline-capable, and private — no
 *    third party ever learns which joke you were sent. The cost is that the
 *    list is fixed; it cannot grow on its own.
 *
 * 2. Draws come from a shuffled bag rather than Math.random() over the whole
 *    array. Random-with-replacement repeats a joke three times in a row often
 *    enough to feel broken, and "it gave me the same one twice" is the single
 *    fastest way to make a generator feel fake. The bag guarantees every joke
 *    in the chosen topic appears once before any of them repeats.
 *
 * Every joke here is clean. That is a hard constraint on this file, not a
 * preference — a dad joke that needs a warning label has missed the point.
 */
(function (window, document) {
  'use strict';

  /**
   * t = topic, s = setup, p = punchline. The setup and punchline are kept
   * apart rather than stored as one blob so the page can render the beat
   * between them, which is most of what makes a dad joke land.
   */
  var JOKES = [
    /* -------------------------------------------------------------- family */
    { t: 'family', s: 'Why did Dad bring a ladder to the bar?', p: 'He heard the drinks were on the house.' },
    { t: 'family', s: 'What do you call a dad who cannot keep a secret?', p: 'A tell-tale parent.' },
    { t: 'family', s: 'Why did the whole family sit on the ceiling?', p: 'Dad said the party was going through the roof.' },
    { t: 'family', s: 'How does a dad carry a baby?', p: 'With great care — and one arm free for the remote.' },
    { t: 'family', s: 'Why did Dad name the dog "Five Miles"?', p: 'So he could tell everyone he walked Five Miles today.' },
    { t: 'family', s: "What is a dad's favourite kind of family meeting?", p: 'One that ends before it starts.' },
    { t: 'family', s: 'Why did the dad put the kids to bed at six?', p: 'They were clearly past their bed-time zone.' },
    { t: 'family', s: 'What did the dad say when his son became a blacksmith?', p: 'Well, that is a forge-able career.' },

    /* ---------------------------------------------------------------- food */
    { t: 'food', s: 'Why did the dad put sugar in his shoes?', p: 'He wanted a sweet pair of trainers.' },
    { t: 'food', s: 'How do you know a dad made the salad?', p: 'There is a crouton in it the size of a fist.' },
    { t: 'food', s: 'What did the dad say about the burnt toast?', p: 'That is charcoal-grilled, and we are charging extra for it.' },
    { t: 'food', s: 'Why did the dad cook pasta for four hours?', p: 'He misread "al dente" as "a long time".' },
    { t: 'food', s: "What is a dad's favourite vegetable?", p: 'The one that is already in the fridge.' },
    { t: 'food', s: 'Why did the dad season the empty pan?', p: 'He said he was pre-paring.' },
    { t: 'food', s: 'What did the dad call his experimental stew?', p: 'A slow-cooker mystery.' },
    { t: 'food', s: 'Why did the dad eat his dinner standing up?', p: 'He was on a balanced diet.' },

    /* ------------------------------------------------------------- animals */
    { t: 'animals', s: 'What do you call a dad who runs with the dogs?', p: 'A paw-rental figure.' },
    { t: 'animals', s: 'Why did the dad take the cat to the vet?', p: 'The cat said it was feeling a little fur-down.' },
    { t: 'animals', s: "What is a dad's favourite bird?", p: 'The one that has already been carved.' },
    { t: 'animals', s: 'How do you stop a dog barking in the back seat?', p: 'Put it in the front seat. That is the dad solution.' },
    { t: 'animals', s: 'Why did the dad buy a donkey?', p: 'He wanted a stable income.' },
    { t: 'animals', s: 'What did the dad say to the very slow snail?', p: 'You are really picking up pace there, champ.' },
    { t: 'animals', s: 'Why did the dad name the goldfish "Legs"?', p: 'So he could say the whole family had Legs.' },
    { t: 'animals', s: 'What do you call a cow that has had a long day?', p: 'A moo-dy cow, according to Dad.' },

    /* ---------------------------------------------------------------- work */
    { t: 'work', s: 'Why did the dad take his laptop to the barbecue?', p: 'He wanted to grill on both sides.' },
    { t: 'work', s: "What is a dad's idea of a power nap?", p: 'Falling asleep in a meeting and waking up promoted.' },
    { t: 'work', s: 'Why did the dad get promoted instantly?', p: 'He was outstanding in his field. It was a farm job.' },
    { t: 'work', s: 'What did the dad say at the end of his first day?', p: 'Same time tomorrow, sport.' },
    { t: 'work', s: 'Why does a dad never get lost at work?', p: 'He has been in the same chair for eighteen years.' },
    { t: 'work', s: "What is a dad's favourite business model?", p: 'One where the meeting could have been an email.' },
    { t: 'work', s: 'Why did the dad print the entire internet?', p: 'He wanted something to read on the train.' },
    { t: 'work', s: 'What did the dad call his stationery business?', p: 'A pending venture.' },

    /* ------------------------------------------------------------- driving */
    { t: 'driving', s: 'Why did the dad take the long way home?', p: 'He wanted to finish the podcast.' },
    { t: 'driving', s: 'What does a dad do at a roundabout?', p: 'One more lap for luck.' },
    { t: 'driving', s: 'Why did the dad refuse to ask for directions?', p: 'The map was in his heart, and his heart was in 1987.' },
    { t: 'driving', s: "What is a dad's favourite road?", p: 'The one with a services stop on it.' },
    { t: 'driving', s: 'Why did the dad reverse into the driveway six times?', p: 'He was lining it up perfectly. Allegedly.' },
    { t: 'driving', s: 'What did the dad say when the satnav said "recalculating"?', p: 'Join the club.' },
    { t: 'driving', s: 'How does a dad know the car needs a wash?', p: 'When he can write his name on the bonnet. So he does.' },
    { t: 'driving', s: 'Why did the dad drive with the windows down in winter?', p: 'He said it was an air-conditioned car.' },

    /* ----------------------------------------------------------------- DIY */
    { t: 'diy', s: 'Why did the dad read the instructions?', p: 'To laugh at them. Then he built it his way.' },
    { t: 'diy', s: "What is a dad's favourite tool?", p: 'The one he already owns three of.' },
    { t: 'diy', s: 'Why did the dad buy a second drill?', p: 'The first one was for best.' },
    { t: 'diy', s: 'How does a dad fix a wobbly chair?', p: 'Folds a beer mat in half and calls it structural.' },
    { t: 'diy', s: 'What did the dad say when the shelf fell down?', p: 'That is a load-bearing shelf. It is meant to do that.' },
    { t: 'diy', s: 'Why did the dad keep every offcut of wood since 1998?', p: 'Because you never know.' },
    { t: 'diy', s: 'What is the dad estimate for a twenty-minute job?', p: 'Three weekends and a trip to the shop.' },
    { t: 'diy', s: 'Why did the dad paint the wall twice?', p: 'The first coat was a practice coat.' },

    /* ------------------------------------------------------------- general */
    { t: 'general', s: 'Why did the dad sit on his sandwich?', p: 'He wanted a seat meal.' },
    { t: 'general', s: 'What do you call a dad on a trampoline?', p: 'A bouncing baby boomer.' },
    { t: 'general', s: 'Why did the dad wear two jackets?', p: 'In case one of them got cold.' },
    { t: 'general', s: 'What did the dad say when he stepped on the Lego?', p: 'I am fine. That was a dad noise, not a pain noise.' },
    { t: 'general', s: 'Why did the dad take a pencil to bed?', p: 'To draw the curtains.' },
    { t: 'general', s: 'How does a dad end every phone call?', p: 'Alright, bye. Bye. Bye then. Bye.' },
    { t: 'general', s: 'Why did the dad stand in front of the mirror with his eyes shut?', p: 'He wanted to see what he looked like asleep.' },
    { t: 'general', s: "What is a dad's favourite dance?", p: 'The one where he hurts his knee and pretends it was intentional.' }
  ];

  var TOPIC_LABELS = {
    family: 'Family',
    food: 'Food',
    animals: 'Animals',
    work: 'Work',
    driving: 'Driving',
    diy: 'DIY',
    general: 'General'
  };

  function createDadJokeGenerator(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var topicEl = $('dadTopic');
    var tellBtn = $('dadTellBtn');
    var clearBtn = $('dadClearBtn');
    var copyBtn = $('dadCopyBtn');
    var resultsEl = $('dadResults');
    var setupEl = $('dadSetup');
    var punchEl = $('dadPunchline');
    var badgeEl = $('dadBadge');
    var metaEl = $('dadMeta');
    var statusEl = $('dadStatus');

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

    /*
     * The bag holds what is left to draw, shuffled once. Refilling on empty is
     * what produces the guarantee. The joke currently on screen is dropped from
     * the refill so that topping the bag up never repeats what the user is
     * still reading.
     */
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

    function render(joke) {
      setupEl.textContent = joke.s;
      punchEl.textContent = joke.p;
      if (badgeEl) badgeEl.textContent = TOPIC_LABELS[joke.t] || 'Dad joke';
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
      // Switching topic resets the bag, so the first joke from a new topic is
      // never filtered by a stale "already seen" list from the last one.
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
  window.ToolStackTools.createDadJokeGenerator = createDadJokeGenerator;
})(window, document);

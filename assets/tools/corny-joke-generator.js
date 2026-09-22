/**
 * ToolStack AI — Corny Joke Generator engine.
 *
 * Ids required in tools/corny-joke-generator.html:
 *   cornyStyle, cornyTellBtn, cornyClearBtn, cornyCopyBtn, cornyResults,
 *   cornySetup, cornyPunchline, cornyBadge, cornyCheese, cornyMeta, cornyStatus
 *
 * Corny is a specific register, and it is worth being precise about what it
 * means here, because "corny" and "bad" are not the same joke. A bad joke is
 * deliberately unfunny. A corny joke is a joke that is trying very hard to be
 * wholesome and gentle — the kind that makes you groan and smile at the same
 * time, and would be completely at home on a greetings card. Nothing in this
 * file is cynical, mean, or aimed at anybody.
 *
 * Two mechanical choices:
 *
 * 1. The jokes are embedded rather than fetched, so the tool is instant and
 *    works offline. The cost is that the list is fixed.
 *
 * 2. Draws come from a shuffled bag, not from Math.random() over the array.
 *    Sampling with replacement repeats a joke three times in a row often
 *    enough to feel broken; the bag means every joke in a style appears once
 *    before any of them comes round again.
 *
 * Every joke here is clean and safe for a general audience, including young
 * children. That is a hard constraint on this file, not a preference.
 */
(function (window, document) {
  'use strict';

  /**
   * st = style, s = setup, p = punchline, cheese = 1-5 groan rating shown on
   * the card. The rating is a bit of fun, not a measurement — it is authored
   * by hand per joke rather than computed, because how much a pun hurts is a
   * judgement call, not a function of its character count.
   */
  var JOKES = [
    /* ------------------------------------------------------------- animals */
    { st: 'animals', s: 'What do you call a sleeping bull?', p: 'A bulldozer.', cheese: 4 },
    { st: 'animals', s: 'Why do cows wear bells?', p: 'Because their horns do not work.', cheese: 5 },
    { st: 'animals', s: 'What do you call a bear with no teeth?', p: 'A gummy bear.', cheese: 5 },
    { st: 'animals', s: 'Why did the teddy bear say no to dessert?', p: 'Because she was stuffed.', cheese: 4 },
    { st: 'animals', s: 'What do you call a pig that does karate?', p: 'A pork chop.', cheese: 4 },
    { st: 'animals', s: 'Why did the chicken join a band?', p: 'Because it already had the drumsticks.', cheese: 5 },
    { st: 'animals', s: 'How do you organise a party in space?', p: 'You planet.', cheese: 5 },
    { st: 'animals', s: 'What do you call a duck that gets all A grades?', p: 'A wise quacker.', cheese: 5 },
    { st: 'animals', s: 'Why are fish so clever?', p: 'Because they live in schools.', cheese: 4 },

    /* ---------------------------------------------------------------- food */
    { st: 'food', s: 'What did the grape do when it got stepped on?', p: 'It let out a little wine.', cheese: 4 },
    { st: 'food', s: 'Why did the banana go to the doctor?', p: 'It was not peeling well.', cheese: 5 },
    { st: 'food', s: 'What do you call a sad strawberry?', p: 'A blueberry.', cheese: 5 },
    { st: 'food', s: 'Why did the tomato turn red?', p: 'It saw the salad dressing.', cheese: 5 },
    { st: 'food', s: 'What do you call a lonely piece of cheese?', p: 'A lonely piece of cheese. It has no friends, but it is very mature.', cheese: 4 },
    { st: 'food', s: 'Why did the biscuit go to the dentist?', p: 'It had a cracker.', cheese: 5 },
    { st: 'food', s: 'What is a scarecrow\'s favourite fruit?', p: 'Strawberries — he is outstanding in his field at picking them.', cheese: 4 },
    { st: 'food', s: 'Why did the bread go to the party alone?', p: 'It could not find a roll model.', cheese: 5 },
    { st: 'food', s: 'What do you call a sad cup of coffee?', p: 'Depresso.', cheese: 5 },

    /* --------------------------------------------------------------- school */
    { st: 'school', s: 'Why did the student eat his homework?', p: 'The teacher told him it was a piece of cake.', cheese: 5 },
    { st: 'school', s: 'What is a maths book\'s favourite food?', p: 'Square meals.', cheese: 4 },
    { st: 'school', s: 'Why did the pencil go to school?', p: 'To get a little sharper.', cheese: 4 },
    { st: 'school', s: 'How do you make a tissue dance?', p: 'Put a little boogie in it.', cheese: 5 },
    { st: 'school', s: 'What did the paper say to the pencil?', p: 'You have a real point.', cheese: 4 },
    { st: 'school', s: 'Why was the music teacher locked out of the classroom?', p: 'She could not find the right key.', cheese: 5 },
    { st: 'school', s: 'What do you call a teacher who cannot control her class?', p: 'A referee with no whistle.', cheese: 3 },
    { st: 'school', s: 'Why did the clock go back four seconds?', p: 'It had a little too much time on its hands.', cheese: 4 },
    { st: 'school', s: 'What is the strongest creature in the sea?', p: 'A mussel.', cheese: 5 },

    /* ---------------------------------------------------------------- house */
    { st: 'house', s: 'Why did the broom stop working?', p: 'It was swept off its feet.', cheese: 4 },
    { st: 'house', s: 'What did the carpet say to the floor?', p: 'I have got you covered.', cheese: 4 },
    { st: 'house', s: 'Why was the washing machine so happy?', p: 'It had a whole load off its mind.', cheese: 5 },
    { st: 'house', s: 'What do you call a fridge that tells jokes?', p: 'A cool comedian.', cheese: 5 },
    { st: 'house', s: 'Why did the lamp go to therapy?', p: 'It had too many bright ideas and nowhere to put them.', cheese: 3 },
    { st: 'house', s: 'What did one wall say to the other wall?', p: 'I will meet you at the corner.', cheese: 5 },
    { st: 'house', s: 'Why did the window get a medal?', p: 'It was outstanding in its pane.', cheese: 5 },
    { st: 'house', s: 'What do you call a chair that will not sit still?', p: 'A rocking chair. It has always been that way.', cheese: 4 },
    { st: 'house', s: 'Why did the kettle start singing?', p: 'It was under a lot of steam.', cheese: 5 },

    /* --------------------------------------------------------------- nature */
    { st: 'nature', s: 'What did the tree say to spring?', p: 'I am rooting for you.', cheese: 4 },
    { st: 'nature', s: 'Why did the flower go to the party with a friend?', p: 'Because it could not go alone — it needed a bud.', cheese: 4 },
    { st: 'nature', s: 'What do you call a snowman in July?', p: 'A puddle.', cheese: 5 },
    { st: 'nature', s: 'Why did the sun go to school?', p: 'To get a little brighter.', cheese: 5 },
    { st: 'nature', s: 'What did the ocean say to the shore?', p: 'Nothing at all. It just waved.', cheese: 4 },
    { st: 'nature', s: 'Why did the leaf go to the doctor?', p: 'It was feeling green around the edges.', cheese: 4 },
    { st: 'nature', s: 'What do you call a cloud that has had a lovely day?', p: 'A happy little cumulus. It is on cloud nine.', cheese: 5 },
    { st: 'nature', s: 'Why did the mountain go to the seaside?', p: 'It needed a change of scenery.', cheese: 4 },
    { st: 'nature', s: 'What is a volcano\'s favourite song?', p: 'Anything with a good beat and a lot of eruption.', cheese: 3 },

    /* ------------------------------------------------------------- everyday */
    { st: 'everyday', s: 'Why did the bicycle fall over?', p: 'It was two-tired.', cheese: 5 },
    { st: 'everyday', s: 'What do you call a broken boomerang?', p: 'A stick.', cheese: 5 },
    { st: 'everyday', s: 'Why did the scarf go to the party?', p: 'It wanted to hang around.', cheese: 4 },
    { st: 'everyday', s: 'What did the hat say to the coat?', p: 'You go on ahead. I will top things off here.', cheese: 4 },
    { st: 'everyday', s: 'Why did the shoe go to the cobbler?', p: 'It had a hole lot of problems.', cheese: 5 },
    { st: 'everyday', s: 'What do you call a well-dressed umbrella?', p: 'A cover story.', cheese: 3 },
    { st: 'everyday', s: 'Why did the phone go to the gym?', p: 'It wanted better reception.', cheese: 4 },
    { st: 'everyday', s: 'What did the button say to the needle?', p: 'You are right on point.', cheese: 5 },
    { st: 'everyday', s: 'Why did the soap win an award?', p: 'It was squeaky clean.', cheese: 5 }
  ];

  /*
   * The style labels double as the badge text on the result card. Keeping them
   * here rather than in the HTML means the page and the engine cannot disagree
   * about what a style is called.
   */
  var STYLE_LABELS = {
    animals: 'Animals',
    food: 'Food',
    school: 'School',
    house: 'Around the house',
    nature: 'Nature',
    everyday: 'Everyday things'
  };

  function createCornyJokeGenerator(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var styleEl = $('cornyStyle');
    var tellBtn = $('cornyTellBtn');
    var clearBtn = $('cornyClearBtn');
    var copyBtn = $('cornyCopyBtn');
    var resultsEl = $('cornyResults');
    var setupEl = $('cornySetup');
    var punchEl = $('cornyPunchline');
    var badgeEl = $('cornyBadge');
    var cheeseEl = $('cornyCheese');
    var metaEl = $('cornyMeta');
    var statusEl = $('cornyStatus');

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

    function pool(style) {
      return JOKES.filter(function (joke) {
        return style === 'all' || joke.st === style;
      });
    }

    var bag = [];
    var bagStyle = '';
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

    function refill(style, exclude) {
      var fresh = pool(style);
      if (exclude && fresh.length > 1) {
        fresh = fresh.filter(function (joke) { return joke !== exclude; });
      }
      bag = shuffle(fresh);
      bagStyle = style;
      total = pool(style).length;
      drawn = 0;
    }

    function draw(style) {
      if (bagStyle !== style) refill(style, null);
      if (bag.length === 0) refill(style, last);
      if (bag.length === 0) return null;
      var joke = bag.pop();
      drawn += 1;
      last = joke;
      return joke;
    }

    /** The groan rating, drawn as filled and empty blocks rather than a bar. */
    function cheeseMeter(rating) {
      var filled = Math.max(1, Math.min(5, rating || 3));
      var out = '';
      for (var i = 0; i < 5; i++) out += i < filled ? '■' : '□';
      return out;
    }

    function render(joke) {
      setupEl.textContent = joke.s;
      punchEl.textContent = joke.p;
      if (badgeEl) badgeEl.textContent = STYLE_LABELS[joke.st] || 'Corny';
      if (cheeseEl) cheeseEl.textContent = cheeseMeter(joke.cheese);
      if (metaEl) {
        metaEl.textContent = 'Joke ' + drawn + ' of ' + total +
          ' in this style before any of them come round again.';
      }
      resultsEl.classList.remove('hidden');
    }

    function tell() {
      var style = styleEl ? styleEl.value : 'all';
      var joke = draw(style);
      if (!joke) {
        showStatus('No jokes in that style yet. Try another one.', 'warn');
        return;
      }
      hideStatus();
      render(joke);
    }

    tellBtn.addEventListener('click', tell);

    if (styleEl) {
      styleEl.addEventListener('change', function () {
        refill(styleEl.value, null);
        hideStatus();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        resultsEl.classList.add('hidden');
        setupEl.textContent = '';
        punchEl.textContent = '';
        if (cheeseEl) cheeseEl.textContent = '';
        bag = [];
        bagStyle = '';
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
  window.ToolStackTools.createCornyJokeGenerator = createCornyJokeGenerator;
})(window, document);

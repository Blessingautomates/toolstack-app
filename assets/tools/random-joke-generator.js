/**
 * ToolStack AI — Random Joke Generator engine.
 *
 * Ids required in tools/random-joke-generator.html:
 *   jokeCategory, jokeTone, jokeTellBtn, jokeClearBtn, jokeCopyBtn,
 *   jokeResults, jokeSetup, jokePunchline, jokeBadge, jokeMeta, jokeStatus
 *
 * Three deliberate choices worth knowing about:
 *
 * 1. The jokes live in this file rather than behind an API. The set is small
 *    enough to ship, and keeping it local is what makes the tool instant, makes
 *    it work offline, and means no third party ever sees what you were reading.
 *    The cost is that the list is fixed — it cannot learn or grow on its own.
 *
 * 2. Draws come from a shuffled bag, not from Math.random() on the whole array.
 *    Random-with-replacement hands out the same joke three times in a row often
 *    enough to feel broken; a bag guarantees every joke in the category appears
 *    once before any of them repeats.
 *
 * 3. The category filter and the length filter compose, and the combination can
 *    be empty — there are no story-length food puns. When that happens the tool
 *    says so and holds the previous joke, rather than silently widening the
 *    filter and handing back something the user did not ask for.
 *
 * Every joke here is clean: no profanity, no adult material, nothing aimed at a
 * group of people. That is a hard constraint on this file, not a preference.
 */
(function (window, document) {
  'use strict';

  /**
   * c = category, s = setup, p = punchline. One-liners carry an empty
   * punchline and are rendered as a single block.
   */
  var JOKES = [
    /* ---------------------------------------------------------------- puns */
    { c: 'pun', s: "I'm reading a book about anti-gravity.", p: "It's impossible to put down." },
    { c: 'pun', s: "I used to be a banker.", p: "But I lost interest." },
    { c: 'pun', s: "Why did the scarecrow win an award?", p: "Because he was outstanding in his field." },
    { c: 'pun', s: "I don't trust stairs.", p: "They're always up to something." },
    { c: 'pun', s: "What do you call a fish with no eyes?", p: "A fsh." },
    { c: 'pun', s: "I stayed up all night wondering where the sun had gone.", p: "Then it dawned on me." },
    { c: 'pun', s: "Why don't skeletons fight each other?", p: "They don't have the guts." },
    { c: 'pun', s: "I'm on a seafood diet.", p: "I see food and I eat it." },
    { c: 'pun', s: "What did the ocean say to the beach?", p: "Nothing. It just waved." },
    { c: 'pun', s: "Time flies like an arrow.", p: "Fruit flies like a banana." },
    { c: 'pun', s: "I wondered why the baseball kept getting bigger.", p: "Then it hit me." },
    { c: 'pun', s: "Why did the golfer bring two pairs of trousers?", p: "In case he got a hole in one." },
    { c: 'pun', s: "I've been trying to think of a good carpentry joke.", p: "But I keep drawing a blank." },
    { c: 'pun', s: "What do you call cheese that isn't yours?", p: "Nacho cheese." },
    { c: 'pun', s: "The past, the present and the future walked into a bar.", p: "It was tense." },
    { c: 'pun', s: "Why did the bicycle fall over?", p: "It was two-tired." },
    { c: 'pun', s: "What do you call a factory that makes good products?", p: "A satisfactory." },
    { c: 'pun', s: "I'm friends with 25 letters of the alphabet.", p: "I don't know why." },

    /* ----------------------------------------------------------- one-liners */
    { c: 'oneliner', s: "I told my wife she was drawing her eyebrows too high. She looked surprised.", p: "" },
    { c: 'oneliner', s: "My wife said I should do lunges to stay in shape. That would be a big step forward.", p: "" },
    { c: 'oneliner', s: "I'm not lazy. I'm on energy-saving mode.", p: "" },
    { c: 'oneliner', s: "I have a joke about time travel, but you didn't like it.", p: "" },
    { c: 'oneliner', s: "My password is the last eight digits of pi.", p: "" },
    { c: 'oneliner', s: "I would tell you a UDP joke, but you might not get it.", p: "" },
    { c: 'oneliner', s: "I'm writing a book about the history of glue. I can't put it down.", p: "" },
    { c: 'oneliner', s: "I asked the gym trainer if he could teach me the splits. He asked how flexible I am. I said I can't make Tuesdays.", p: "" },
    { c: 'oneliner', s: "Nothing is impossible. I do nothing all day and it's quite possible.", p: "" },
    { c: 'oneliner', s: "I'm not saying I'm old, but my back goes out more than I do.", p: "" },
    { c: 'oneliner', s: "I finally got my head together. Now my body is falling apart.", p: "" },
    { c: 'oneliner', s: "A clear conscience is usually the sign of a bad memory.", p: "" },
    { c: 'oneliner', s: "I got fired from the calendar factory. All I did was take a day off.", p: "" },
    { c: 'oneliner', s: "I'm reading a book on the history of money. It makes cents.", p: "" },
    { c: 'oneliner', s: "The early bird gets the worm, but the second mouse gets the cheese.", p: "" },
    { c: 'oneliner', s: "I have the heart of a lion and a lifetime ban from the zoo.", p: "" },
    { c: 'oneliner', s: "My wallet is like an onion. Opening it makes me cry.", p: "" },
    { c: 'oneliner', s: "I'm not arguing. I'm just explaining why I'm right.", p: "" },

    /* ---------------------------------------------------------------- tech */
    { c: 'tech', s: "Why do programmers prefer dark mode?", p: "Because light attracts bugs." },
    { c: 'tech', s: "There are two hard things in computer science: cache invalidation, naming things, and off-by-one errors.", p: "" },
    { c: 'tech', s: "A SQL query walks into a bar, approaches two tables and asks:", p: "May I join you?" },
    { c: 'tech', s: "Why did the developer go broke?", p: "Because he used up all his cache." },
    { c: 'tech', s: "How many programmers does it take to change a light bulb?", p: "None. That's a hardware problem." },
    { c: 'tech', s: "I would tell you a joke about recursion.", p: "But I would have to tell you a joke about recursion first." },
    { c: 'tech', s: "Why do Java developers wear glasses?", p: "Because they don't C#." },
    { c: 'tech', s: "A programmer is sent to the shop: buy a loaf of bread, and if they have eggs, get a dozen.", p: "He came back with twelve loaves of bread." },
    { c: 'tech', s: "What's the object-oriented way to become wealthy?", p: "Inheritance." },
    { c: 'tech', s: "Why did the function stop calling the other function?", p: "It had too many arguments." },
    { c: 'tech', s: "There are 10 types of people in the world.", p: "Those who understand binary, and those who don't." },
    { c: 'tech', s: "Why was the JavaScript developer sad?", p: "Because he didn't know how to null his feelings." },
    { c: 'tech', s: "A byte walks into a bar looking down. The bartender asks what's wrong.", p: "'Parity check failed,' he says. 'I feel a bit off.'" },
    { c: 'tech', s: "Why do programmers hate nature?", p: "Too many bugs." },
    { c: 'tech', s: "What do you call a programmer from Finland?", p: "Nerdic." },
    { c: 'tech', s: "Why did the database administrator leave his partner?", p: "There were too many one-to-many relationships." },
    { c: 'tech', s: "I changed my password to 'incorrect'.", p: "Now when I forget it, the computer tells me my password is incorrect." },
    { c: 'tech', s: "Why is it called a building?", p: "Because it's still being built. Unlike your deploy." },

    /* ---------------------------------------------------------------- work */
    { c: 'work', s: "I love deadlines.", p: "I like the whooshing sound they make as they fly by." },
    { c: 'work', s: "My boss told me to have a good day.", p: "So I went home." },
    { c: 'work', s: "Why was the employee fired from the orange juice factory?", p: "He couldn't concentrate." },
    { c: 'work', s: "I asked for a raise today.", p: "They gave me a ladder instead." },
    { c: 'work', s: "What's the difference between a meeting and a funeral?", p: "At a funeral, fewer people are on their phones." },
    { c: 'work', s: "My performance review said I'm a joy to have around.", p: "It said nothing at all about my work." },
    { c: 'work', s: "Why don't managers look out of the window in the morning?", p: "So they have something to do in the afternoon." },
    { c: 'work', s: "I'm a great multitasker.", p: "I can ignore several things at once." },
    { c: 'work', s: "The office coffee machine broke.", p: "We're now running on decaf and denial." },
    { c: 'work', s: "How do you know someone works in IT?", p: "Don't worry, they'll tell you." },
    { c: 'work', s: "I put my phone on silent during the meeting. So did everyone else.", p: "It was the most productive hour of the week." },
    { c: 'work', s: "My to-do list has one item on it.", p: "Rewrite to-do list." },
    { c: 'work', s: "I'm not a morning person.", p: "I'm barely an afternoon person." },
    { c: 'work', s: "The team agreed to circle back.", p: "Nobody knows which circle, or in which direction." },
    { c: 'work', s: "Why did the intern bring a ladder to work?", p: "He heard there was room for growth." },
    { c: 'work', s: "My calendar is full of meetings about how busy we are.", p: "I've started attending them in my head." },
    { c: 'work', s: "I asked if I could work from home.", p: "They said I already do — nobody has seen me in weeks." },
    { c: 'work', s: "The company rebranded.", p: "Same thing, new font, everyone's thrilled." },

    /* -------------------------------------------------------------- school */
    { c: 'school', s: "Why did the student eat his homework?", p: "Because the teacher said it was a piece of cake." },
    { c: 'school', s: "What did the triangle say to the circle?", p: "You're pointless." },
    { c: 'school', s: "Why can't you trust an atom?", p: "They make up everything." },
    { c: 'school', s: "What do you call a number that can't stay in one place?", p: "A roamin' numeral." },
    { c: 'school', s: "Why did the history teacher get so many presents?", p: "Because he had a lot of past." },
    { c: 'school', s: "Why did the physics teacher break up with the biology teacher?", p: "There was no chemistry." },
    { c: 'school', s: "What did the zero say to the eight?", p: "Nice belt." },
    { c: 'school', s: "Why is the obtuse angle so unhappy?", p: "Because it's never right." },
    { c: 'school', s: "What do you get when you cross a maths book with a dog?", p: "A lot of problems." },
    { c: 'school', s: "Why did the student wear glasses to maths class?", p: "To improve his division." },
    { c: 'school', s: "What did the cell say when his sister stepped on his foot?", p: "Mitosis." },
    { c: 'school', s: "Why did the library book go to the doctor?", p: "It had a lot of issues." },
    { c: 'school', s: "Who is the king of the classroom?", p: "The ruler." },
    { c: 'school', s: "What did the calculator say to the student?", p: "You can count on me." },
    { c: 'school', s: "Why was the maths book sad?", p: "Because it had too many problems." },
    { c: 'school', s: "What did the geography teacher say about the ocean?", p: "It's swell." },
    { c: 'school', s: "How do you organise a party in space?", p: "You planet." },
    { c: 'school', s: "Why did the chemistry teacher keep a spare pair of trousers?", p: "In case of a chemical spill." },

    /* ------------------------------------------------------------- animals */
    { c: 'animal', s: "What do you call a bear with no teeth?", p: "A gummy bear." },
    { c: 'animal', s: "What do you call a cold dog?", p: "A chili dog." },
    { c: 'animal', s: "Why don't cats play poker in the jungle?", p: "Too many cheetahs." },
    { c: 'animal', s: "What do you call a fish wearing a bow tie?", p: "Sofishticated." },
    { c: 'animal', s: "Why did the chicken join a band?", p: "Because it had the drumsticks." },
    { c: 'animal', s: "What do you call a sleeping bull?", p: "A bulldozer." },
    { c: 'animal', s: "What do you call a dog that does magic?", p: "A labracadabrador." },
    { c: 'animal', s: "Why are cats so good at video games?", p: "They have nine lives." },
    { c: 'animal', s: "What do you call an alligator in a vest?", p: "An investigator." },
    { c: 'animal', s: "Why did the cow cross the road?", p: "To get to the udder side." },
    { c: 'animal', s: "What do you call a pig that does karate?", p: "A pork chop." },
    { c: 'animal', s: "What's a cat's favourite colour?", p: "Purr-ple." },
    { c: 'animal', s: "Why don't oysters share?", p: "Because they're shellfish." },
    { c: 'animal', s: "What do you call a pony with a sore throat?", p: "A little hoarse." },
    { c: 'animal', s: "How does a penguin build its house?", p: "Igloos it together." },
    { c: 'animal', s: "What do you call a deer with no eyes?", p: "No idea." },
    { c: 'animal', s: "Why do cows wear bells?", p: "Because their horns don't work." },
    { c: 'animal', s: "What do you call a rabbit with fleas?", p: "Bugs Bunny." },

    /* ---------------------------------------------------------------- food */
    { c: 'food', s: "Why did the tomato turn red?", p: "Because it saw the salad dressing." },
    { c: 'food', s: "What do you call a fake noodle?", p: "An impasta." },
    { c: 'food', s: "Why did the coffee file a police report?", p: "It got mugged." },
    { c: 'food', s: "What did the bread say to the knife?", p: "You're on a roll." },
    { c: 'food', s: "Why did the biscuit go to the doctor?", p: "It felt crummy." },
    { c: 'food', s: "What do you call a sad strawberry?", p: "A blueberry." },
    { c: 'food', s: "Why was the pizza so bad at sport?", p: "It kept getting tossed." },
    { c: 'food', s: "What did the egg say to the frying pan?", p: "You crack me up." },
    { c: 'food', s: "Why did the banana go to the hospital?", p: "It wasn't peeling well." },
    { c: 'food', s: "Why did the grape stop in the middle of the road?", p: "It ran out of juice." },
    { c: 'food', s: "What's a ghost's favourite dessert?", p: "Ice scream." },
    { c: 'food', s: "Why did the melon jump into the lake?", p: "It wanted to be a watermelon." },
    { c: 'food', s: "How do you fix a broken pizza?", p: "With tomato paste." },
    { c: 'food', s: "What do you call a sad cup of coffee?", p: "A depresso." },
    { c: 'food', s: "What did the lettuce say to the celery?", p: "Quit stalking me." },
    { c: 'food', s: "Why was the chef so mean?", p: "He had a lot on his plate." },
    { c: 'food', s: "What do you call a potato working undercover?", p: "A spec-tator." },
    { c: 'food', s: "Why did the bread win the award?", p: "It was the toast of the town." }
  ];

  var CATEGORY_LABEL = {
    pun: 'Pun',
    oneliner: 'One-liner',
    tech: 'Tech',
    work: 'Work',
    school: 'School',
    animal: 'Animals',
    food: 'Food & drink'
  };

  var PLACEHOLDER_SETUP = 'Your joke appears here.';
  var PLACEHOLDER_PUNCH = 'Press “Tell me a joke” to begin.';

  function createRandomJokeGenerator(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var categoryEl = $('jokeCategory');
    var toneEl = $('jokeTone');
    var tellBtn = $('jokeTellBtn');
    var clearBtn = $('jokeClearBtn');
    var copyBtn = $('jokeCopyBtn');
    var resultsEl = $('jokeResults');
    var setupEl = $('jokeSetup');
    var punchEl = $('jokePunchline');
    var badgeEl = $('jokeBadge');
    var metaEl = $('jokeMeta');
    var statusEl = $('jokeStatus');

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

    /* --------------------------------------------------------- the filters */

    function lengthOf(joke) {
      return (joke.s + ' ' + joke.p).trim().length;
    }

    /**
     * The pool the current controls describe. Both filters are applied here and
     * nowhere else, so the bag and the "no match" message cannot disagree about
     * what the user asked for.
     */
    function pool(category, tone) {
      return JOKES.filter(function (joke) {
        if (category !== 'all' && joke.c !== category) return false;
        if (tone === 'short') return lengthOf(joke) <= 80;
        if (tone === 'long') return joke.s.length >= 55;
        return true;
      });
    }

    /* ------------------------------------------------------------ the bag */

    /*
     * The bag holds the jokes left to draw, shuffled once. Refilling on empty
     * is what gives the guarantee: within a category you see everything once
     * before anything twice. The previous joke is dropped from the refill when
     * the pool is big enough to spare it, so a refill never repeats the joke
     * that is still on screen.
     */
    var bag = [];
    var bagKey = '';
    var bagSize = 0;
    var drawn = 0;
    var last = null;

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

    function key(category, tone) {
      return category + '|' + tone;
    }

    function refill(category, tone, exclude) {
      var fresh = pool(category, tone);
      if (exclude && fresh.length > 1) {
        fresh = fresh.filter(function (joke) { return joke !== exclude; });
      }
      bag = shuffle(fresh);
      bagSize = pool(category, tone).length;
      bagKey = key(category, tone);
      drawn = 0;
    }

    function draw(category, tone) {
      if (bagKey !== key(category, tone)) refill(category, tone, null);
      if (bag.length === 0) refill(category, tone, last);
      if (bag.length === 0) return null;
      var joke = bag.pop();
      drawn += 1;
      last = joke;
      return joke;
    }

    /* ---------------------------------------------------------- rendering */

    function render(joke) {
      setupEl.textContent = joke.s;
      setupEl.classList.remove('hidden');

      if (joke.p) {
        punchEl.textContent = joke.p;
        punchEl.classList.remove('hidden');
      } else {
        punchEl.textContent = '';
        punchEl.classList.add('hidden');
      }

      if (badgeEl) badgeEl.textContent = CATEGORY_LABEL[joke.c] || 'Joke';

      if (metaEl) {
        metaEl.textContent = drawn + ' drawn from ' + bagSize + ' in this set' +
          (bag.length === 0 ? ' — the set has been reshuffled.' : '.');
      }

      resultsEl.classList.remove('hidden');
    }

    function reset() {
      setupEl.textContent = PLACEHOLDER_SETUP;
      punchEl.textContent = PLACEHOLDER_PUNCH;
      punchEl.classList.remove('hidden');
      if (badgeEl) badgeEl.textContent = 'Ready';
      if (metaEl) metaEl.textContent = '';
      resultsEl.classList.add('hidden');
      bag = [];
      bagKey = '';
      bagSize = 0;
      drawn = 0;
      last = null;
      hideStatus();
    }

    /* ------------------------------------------------------------ actions */

    tellBtn.addEventListener('click', function () {
      var category = categoryEl ? categoryEl.value : 'all';
      var tone = toneEl ? toneEl.value : 'any';

      var joke = draw(category, tone);

      if (!joke) {
        showStatus(
          'No jokes match that combination — every joke in that category is longer or shorter ' +
          'than the length you picked. Try "Whatever comes up", or a different category.',
          'warn'
        );
        return;
      }

      hideStatus();
      render(joke);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', reset);
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var text = setupEl.textContent + (punchEl.classList.contains('hidden') ? '' : ' ' + punchEl.textContent);
        if (!text || text === PLACEHOLDER_SETUP) {
          showStatus('Nothing to copy yet — get a joke first.', 'warn');
          return;
        }
        var copy = (window.ToolStack && window.ToolStack.copyText) || null;
        if (!copy) return;
        copy(text, function (ok) {
          showStatus(ok ? 'Joke copied to your clipboard.' : 'Copy failed — select the text and copy it manually.', ok ? 'ok' : 'error');
        });
      });
    }

    /* Opening state: the results panel stays hidden until there is a result,
       so the tool never shows an empty card. */
    reset();

    return { draw: draw, reset: reset };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createRandomJokeGenerator = createRandomJokeGenerator;

})(window, document);

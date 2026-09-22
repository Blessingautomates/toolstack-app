/**
 * Specs for the joke-generator pages. Consumed by scripts/gen-fun-tools.mjs.
 * Plain text — the generator escapes it for HTML and reuses the FAQ strings
 * verbatim in the FAQPage JSON-LD.
 */

const jokeResultCard = (prefix, badgeLabel, meterLabel) => `    <div class="flex flex-wrap items-center gap-2 mt-5">
      <button id="${prefix}TellBtn" type="button"
        class="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold text-sm transition">
        Tell me a joke
      </button>
      <button id="${prefix}ClearBtn" type="button"
        class="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm transition">
        Clear
      </button>
    </div>

    <p class="text-[10px] text-gray-500 mt-3">Everything runs in your browser. Nothing is uploaded.</p>

    <div id="${prefix}Results" class="hidden mt-5 space-y-5">
      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div class="flex items-center gap-2 flex-wrap">
            <span id="${prefix}Badge" class="px-3 py-1 rounded-full text-[11px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">${badgeLabel}</span>
            <span class="text-[11px] text-gray-500 font-mono">${meterLabel} <span id="${prefix}${meterLabel === 'Groan' ? 'Cheese' : meterLabel === 'Awfulness' ? 'Awful' : 'Gloom'}" class="text-brand-400"></span></span>
          </div>
          <button id="${prefix}CopyBtn" type="button"
            class="px-3 py-1.5 rounded-xl border border-gray-700 hover:border-brand-500 text-gray-300 hover:text-brand-400 font-semibold text-xs transition">
            Copy
          </button>
        </div>
        <p id="${prefix}Setup" class="text-lg font-bold text-gray-100 leading-snug"></p>
        <p id="${prefix}Punchline" class="text-lg text-gray-300 mt-3 leading-snug"></p>
      </div>

      <div id="${prefix}Meta" class="text-[11px] text-gray-500"></div>

      <div data-ts-result-actions="SLUG" class="space-y-4"></div>
    </div>`;

const withSlug = (html, slug) => html.replace('data-ts-result-actions="SLUG"', `data-ts-result-actions="${slug}"`);

const statusBar = (prefix) =>
  `    <div id="${prefix}Status" class="hidden mb-4 p-3 rounded-xl text-xs font-medium border"></div>`;

export default [
  {
    slug: 'dad-joke-generator',
    name: 'Dad Joke Generator',
    create: 'createDadJokeGenerator',
    title: 'Dad Joke Generator — 56 Clean Dad Jokes | ToolStack AI',
    desc: 'Get a dad joke on demand — 56 clean, groan-worthy classics sorted by topic. Free, no signup, works offline and repeats nothing until you have seen them all.',
    tagline:
      'Fifty-six dad jokes sorted into seven topics, drawn from a shuffled bag so you never get the same one twice in a row. Clean enough to tell at a school gate, awful enough to be worth it.',
    widget: `${statusBar('dad')}
    <div>
      <label for="dadTopic" class="block text-xs text-gray-400 mb-1 font-mono">Topic:</label>
      <select id="dadTopic"
        class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-brand-500">
        <option value="all">Anything</option>
        <option value="family">Family</option>
        <option value="food">Food</option>
        <option value="animals">Animals</option>
        <option value="work">Work</option>
        <option value="driving">Driving</option>
        <option value="diy">DIY &amp; shed</option>
        <option value="general">General</option>
      </select>
    </div>

${withSlug(jokeResultCard('dad', 'Family', 'Groan'), 'dad-joke-generator')}`,
    what: [
      'This is a dad joke generator with the jokes actually inside it. All 56 live in the page’s own JavaScript rather than behind an API, which is what makes it instant, usable with no connection at all once the page has loaded, and private — no server anywhere learns which joke you were sent.',
      'The honest limitation is that the set is fixed. It cannot learn, grow, or notice that you have heard one before; 56 jokes is what there is, and once you have worked through a topic you will start seeing them again. It is also, deliberately, entirely clean. Every joke here could be told to a child or a grandparent without a warning, which does mean this is not the tool for anyone looking for an edge.'
    ],
    how: [
      'Pick a topic — family, food, animals, work, driving, DIY or general — or leave it on **Anything** to draw from all 56.',
      'Press **Tell me a joke**. The setup appears first, then the punchline underneath it, so there is a beat between the two.',
      'Press it again for another. Repeats are held back until you have been through the whole topic, and switching topic resets that.',
      'Use **Copy** to drop the joke onto your clipboard with the setup and punchline already joined up, ready to paste into a message.'
    ],
    cases: [
      { t: 'Telling a child a joke', d: 'The set is clean throughout, so there is nothing here you need to read first before handing the phone over.' },
      { t: 'Filling an awkward silence', d: 'A queue, a lift, a call that has stalled. One button press and you have something to say.' },
      { t: 'Caption research', d: 'Copy a joke straight to the clipboard and paste it under a photo that needs a caption nobody has to think about.' },
      { t: 'Testing a theory', d: 'There is a widely held belief that every dad joke is at least mildly funny to someone. This is a reasonable place to gather evidence.' }
    ],
    faqs: [
      { q: 'How many dad jokes does it have?', a: 'Fifty-six, sorted across seven topics with eight jokes each. The count is fixed because the set ships with the page rather than being fetched from a server.' },
      { q: 'Will it give me the same joke twice?', a: 'Not until you have seen them all. Jokes are drawn from a shuffled bag rather than picked at random, so every joke in a topic appears once before any of them comes round again. Switching topic resets the bag.' },
      { q: 'Is this suitable for children?', a: 'Yes. Every joke in the set is clean, with no profanity, no adult content and nothing aimed at a group of people. That is a hard rule for this tool, not a preference.' },
      { q: 'Does it work without an internet connection?', a: 'Once the page has loaded, yes. The jokes are embedded in the page rather than fetched, so pressing the button makes no network request at all.' }
    ]
  },

  {
    slug: 'bad-joke-generator',
    name: 'Bad Joke Generator',
    create: 'createBadJokeGenerator',
    title: 'Bad Joke Generator — Deliberately Terrible Jokes | ToolStack AI',
    desc: 'Anti-jokes and groaners, told badly on purpose — 40 terrible jokes with an awfulness rating. Free, no signup, and clean enough for any audience.',
    tagline:
      'Forty jokes that fail on purpose — anti-jokes, dead ends and punchlines that never arrive. Each one comes with an awfulness rating, because here the failure is the point.',
    widget: `${statusBar('bad')}
    <div>
      <label for="badTopic" class="block text-xs text-gray-400 mb-1 font-mono">Style of bad:</label>
      <select id="badTopic"
        class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-brand-500">
        <option value="all">Anything</option>
        <option value="anti">Anti-jokes</option>
        <option value="literal">Painfully literal</option>
        <option value="work">Work</option>
        <option value="sport">Sport</option>
        <option value="general">General</option>
      </select>
    </div>

${withSlug(jokeResultCard('bad', 'Anti-joke', 'Awfulness'), 'bad-joke-generator')}`,
    what: [
      'Most joke generators try to be funny. This one is built to fail, and the failure is the whole point. The set leans hard on anti-jokes — the ones that set up a familiar rhythm and then hand you nothing — because that is the shape that reliably produces the pause, the blink, and the reluctant laugh.',
      'The limitation is worth stating plainly: comedy is not a solved problem, and a rating printed next to a joke is a joke in itself. The awfulness score on each card is a hand-written tone judgement, not a measurement of anything, and two people will disagree with it constantly. If you are looking for jokes that are actually good, the random joke generator and the corny joke generator on this site are the better bets — this one is for the pleasure of a joke that refuses to land.'
    ],
    how: [
      'Choose a style — anti-jokes, painfully literal, work, sport or general — or leave it on **Anything**.',
      'Press **Tell me a joke** and read the awfulness rating next to the topic badge. Five filled blocks means it fails hardest.',
      'Press again. Every joke in the current style appears once before any of them repeats.',
      'Use **Copy** to send the joke to somebody, which is the traditional way these are shared and the traditional way friendships are tested.'
    ],
    cases: [
      { t: 'Winning an argument about who tells worse jokes', d: 'The rating gives you something to point at, even though it is admittedly made up.' },
      { t: 'Filling a group chat', d: 'An anti-joke lands differently in text, where nobody can see the other person waiting for a punchline that is not coming.' },
      { t: 'Testing comedic theory', d: 'There is a real argument that the anticipation of a joke is funnier than the joke. This set is the experiment.' },
      { t: 'Something safe for any room', d: 'Nothing here is offensive. It is bad, which is a different thing entirely, and a much safer one to be.' }
    ],
    faqs: [
      { q: 'Are the jokes actually bad?', a: 'Deliberately, yes. The set is built around anti-jokes and punchlines that refuse to arrive, so a joke failing to land is the intended result rather than a bug.' },
      { q: 'What does the awfulness rating mean?', a: 'It is a hand-written score from one to five blocks, where five means the joke fails hardest. It is a tone judgement rather than a measurement of anything, and it is part of the joke.' },
      { q: 'Are any of these jokes offensive?', a: 'No. Deliberately unfunny and offensive are different things, and this tool only does the first. There is no profanity, no adult content and nothing aimed at a group of people.' },
      { q: 'How many bad jokes are there?', a: 'Forty, spread across five styles. The list is fixed because the jokes ship inside the page rather than being fetched from an API.' }
    ]
  },

  {
    slug: 'dark-humor-joke',
    name: 'Dark Humour Joke Generator',
    create: 'createDarkHumorJoke',
    title: 'Dark Humour Joke Generator — Absurdist & Gloomy | ToolStack AI',
    desc: 'Deadpan, existential and absurdist humour — 40 gloomy jokes about the void, Mondays and printer errors. Free, no signup, and never cruel.',
    tagline:
      'Forty deadpan jokes about entropy, the heat death of the universe and printer error states. Gloomy in outlook, clean in content, and aimed at the cosmos rather than at people.',
    widget: `${statusBar('dark')}
    <div>
      <label for="darkTopic" class="block text-xs text-gray-400 mb-1 font-mono">Flavour of gloom:</label>
      <select id="darkTopic"
        class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-brand-500">
        <option value="all">Anything</option>
        <option value="existential">Existential</option>
        <option value="cosmic">Cosmic</option>
        <option value="mundane">Everyday doom</option>
        <option value="technology">Technology</option>
        <option value="beyond">The beyond</option>
      </select>
    </div>

    <div class="mt-4 p-3 rounded-xl bg-gray-950 border border-gray-800">
      <p class="text-[11px] text-gray-500 leading-relaxed">
        The comedy here is aimed at the universe and at the narrator’s own mild despair — never at a
        person, a group or anybody’s real misfortune. No illness, no bereavement, no violence.
      </p>
    </div>

${withSlug(jokeResultCard('dark', 'Existential', 'Gloom'), 'dark-humor-joke')}`,
    what: [
      'Dark humour done badly is cruelty with a punchline, and that is not what this is. Everything in this set is absurdist gloom: existential dread, the sun expanding to swallow the planet in five billion years, an unanswered email, a printer that will not say which error it has entered. The joke is always on the universe or on the narrator, never on a person.',
      'That rules some material out permanently, and it is worth being explicit rather than vague about it. There is nothing here about illness, bereavement, self-harm, violence or real events. If the word dark is making you expect material that trades on somebody’s actual misfortune, this is not that tool and will not become it. What is left is a very large amount of cosmic indifference to make jokes about.'
    ],
    how: [
      'Pick a flavour — existential, cosmic, everyday doom, technology or the beyond.',
      'Press **Tell me a joke**. The gloom rating beside the badge runs from one filled block to five.',
      'Press again for another. Some entries are a single line with no separate punchline, and the card adapts rather than leaving a gap.',
      'Use **Copy** to put the joke on your clipboard, which is the correct way to share existential dread.'
    ],
    cases: [
      { t: 'Acknowledging Monday', d: 'The everyday-doom set is largely about the specific weight of a weekday morning and the bins.' },
      { t: 'Group chats with a certain tone', d: 'Deadpan gloom reads particularly well in text, where the flat delivery is implied rather than performed.' },
      { t: 'A gentle antidote to forced cheer', d: 'Not every moment calls for relentless positivity, and a joke about entropy can be oddly calming.' },
      { t: 'Testing where the line is', d: 'The set is a working demonstration that dark humour does not need a victim to function.' }
    ],
    faqs: [
      { q: 'Is any of this actually offensive?', a: 'No, and deliberately so. The material is absurdist gloom aimed at the universe and at the narrator, with nothing about illness, bereavement, violence or real events. Dark in tone is not the same as cruel in content.' },
      { q: 'What does the gloom rating mean?', a: 'It is a hand-written score from one to five blocks, reflecting how bleak the joke is in tone. It is a judgement call rather than a measurement.' },
      { q: 'Why are some jokes only one line?', a: 'Some entries are a complete thought with no separate punchline. The card hides the empty punchline element rather than printing a blank line, so it does not end in dead space.' },
      { q: 'How many jokes are in the set?', a: 'Forty, across five topics with eight each. They ship inside the page rather than being fetched, so the tool works offline and the list does not change.' }
    ]
  },

  {
    slug: 'corny-joke-generator',
    name: 'Corny Joke Generator',
    create: 'createCornyJokeGenerator',
    title: 'Corny Joke Generator — Wholesome Pun Jokes | ToolStack AI',
    desc: 'Fifty-four corny jokes that are trying very hard to be wholesome — puns, groaners and greetings-card humour with a groan rating. Free and family-safe.',
    tagline:
      'Fifty-four jokes that are trying extremely hard to be nice to you. Puns, animal groaners and greetings-card humour, each with a groan rating on a five-block scale.',
    widget: `${statusBar('corny')}
    <div>
      <label for="cornyStyle" class="block text-xs text-gray-400 mb-1 font-mono">Style:</label>
      <select id="cornyStyle"
        class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-brand-500">
        <option value="all">Anything</option>
        <option value="animals">Animals</option>
        <option value="food">Food</option>
        <option value="school">School</option>
        <option value="house">Around the house</option>
        <option value="nature">Nature</option>
        <option value="everyday">Everyday things</option>
      </select>
    </div>

${withSlug(jokeResultCard('corny', 'Animals', 'Groan'), 'corny-joke-generator')}`,
    what: [
      'Corny is a specific register and it is worth being precise about it, because corny and bad are not the same joke. A bad joke refuses to land. A corny joke lands exactly where it aimed, which is a soft target: it is wholesome, gentle, and would be completely at home on a greetings card. The groan is the applause.',
      'The honest limitation is the flip side of the same quality. Fifty-four jokes that are all this nice are also all fairly similar in shape, and after a dozen you will be able to see the pun coming from a considerable distance. That is arguably the point, and it is still a real limit. There is no sharp material hiding further down the list.'
    ],
    how: [
      'Pick a style — animals, food, school, around the house, nature or everyday things.',
      'Press **Tell me a joke** and check the groan rating next to the badge. Five filled blocks is a joke operating at full power.',
      'Press again for another. Everything in the chosen style comes up once before anything repeats.',
      'Use **Copy** to put the joke on your clipboard and take it somewhere it can do some damage.'
    ],
    cases: [
      { t: 'Making a child laugh', d: 'The whole set is family-safe, and the puns are pitched at exactly the level where a seven-year-old finds them genuinely brilliant.' },
      { t: 'Being the person who tells jokes badly on purpose', d: 'Corny jokes are at their best when delivered with total commitment and no apology.' },
      { t: 'Breaking up a serious meeting', d: 'One groan is often enough to reset the room, which is a real and underrated skill.' },
      { t: 'Writing a card', d: 'Copy a joke straight onto the clipboard and paste it into a birthday message that was otherwise going to say many happy returns.' }
    ],
    faqs: [
      { q: 'What makes a joke corny rather than just bad?', a: 'A corny joke lands where it aimed. It is wholesome and gentle, the kind of thing that would suit a greetings card. A bad joke is one that refuses to land at all, and this site has a separate generator for those.' },
      { q: 'What is the groan rating?', a: 'A hand-written score from one to five blocks for how much a pun hurts. It is a judgement call rather than a measurement, and it is part of the fun.' },
      { q: 'Is this safe to share with children?', a: 'Yes. Every joke in the set is clean and family-friendly, with no profanity, no adult content and nothing aimed at any group of people.' },
      { q: 'How many corny jokes does it have?', a: 'Fifty-four, across six styles with nine each. They are embedded in the page rather than fetched, so the tool is instant and works offline.' }
    ]
  }
];

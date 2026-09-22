/**
 * Specs for the personality pages. Consumed by scripts/gen-fun-tools.mjs.
 *
 * All five set `shared: true` — the four generators use the shared draw tool and
 * bag helpers, and the quiz uses the shared status controller.
 *
 * What these pages have in common is that every one of them states what it is
 * not. A name generator is not a reading of your character, a quiz score is not
 * a personality assessment, and a superpower is not a latent ability. The copy
 * says so on the page rather than in a footer, because a tool that produces a
 * confident-sounding label about a person has an obligation to be clear about
 * where that label came from.
 */

const statusBar = (p) => `    <div id="${p}Status" class="hidden mb-4 p-3 rounded-xl text-xs font-medium border"></div>`;

const resultShell = (p, slug, inner) => `    <div id="${p}Results" class="hidden mt-5 space-y-5">
${inner}
      <div data-ts-result-actions="${slug}" class="space-y-4"></div>
    </div>`;

const drawButtons = (p, label) => `    <div class="flex flex-wrap items-center gap-2 mt-5">
      <button id="${p}DrawBtn" type="button"
        class="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold text-sm transition">
        ${label}
      </button>
      <button id="${p}ClearBtn" type="button"
        class="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm transition">
        Clear
      </button>
    </div>`;

const copyButton = (p) => `          <button id="${p}CopyBtn" type="button"
            class="px-3 py-1.5 rounded-xl border border-gray-700 hover:border-brand-500 text-gray-300 hover:text-brand-400 font-semibold text-xs transition">
            Copy
          </button>`;

const select = (id, label, options) => `    <div>
      <label for="${id}" class="block text-xs text-gray-400 mb-1 font-mono">${label}</label>
      <select id="${id}"
        class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-brand-500">
${options.map(([v, t]) => `        <option value="${v}">${t}</option>`).join('\n')}
      </select>
    </div>`;

/* A result field: a small mono label above a line of output. */
const field = (id, label, extra = '') => `        <div>
          <p class="text-[10px] font-mono uppercase tracking-wide text-gray-500 mb-1">${label}</p>
          <p id="${id}" class="text-sm text-gray-200 leading-relaxed${extra}"></p>
        </div>`;

export default [
  {
    slug: 'what-type-person',
    name: 'What Type of Person Are You?',
    create: 'createWhatTypePerson',
    shared: true,
    title: 'What Type of Person Are You? — 10 Question Quiz | ToolStack AI',
    desc: 'A ten-question quiz that sorts you into one of six types, and then shows you the full spread so you can see how close the margin actually was.',
    tagline:
      'Ten questions, six types. The result screen shows every type’s score, not just the winner — because most people land within a point of two or three of them.',
    widget: `${statusBar('wtp')}
    <div id="wtpIntro">
      <p class="text-sm text-gray-300 leading-relaxed">
        Ten questions about ordinary situations — a free evening, a friend who is not fine, a group
        that cannot agree where to eat. Pick the answer that is closest to what you actually do,
        not what you would like to do.
      </p>
      <div class="mt-4 p-3 rounded-xl bg-gray-950 border border-gray-800">
        <p class="text-[11px] text-gray-500 leading-relaxed">
          <strong class="text-gray-300">This is a game, not a measurement.</strong> It has no
          scientific basis and it is not a personality assessment. It is six descriptions written
          by hand and a tally. Nothing is uploaded and nothing is stored.
        </p>
      </div>
      <button id="wtpStartBtn" type="button"
        class="mt-5 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold text-sm transition">
        Start the quiz
      </button>
    </div>

    <div id="wtpQuiz" class="hidden">
      <div class="flex items-center justify-between mb-2">
        <span id="wtpProgress" class="text-xs text-gray-400 font-mono"></span>
      </div>
      <div class="h-1.5 rounded-full bg-gray-800 overflow-hidden mb-6">
        <div id="wtpBar" class="h-full bg-brand-500 transition-all duration-300" style="width: 0%"></div>
      </div>
      <p id="wtpQuestion" class="text-base sm:text-lg font-bold text-gray-100 mb-4 leading-snug"></p>
      <div id="wtpOptions" class="space-y-2"></div>
      <div class="mt-5">
        <button id="wtpBackBtn" type="button"
          class="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-xs transition">
          Back
        </button>
      </div>
    </div>

${resultShell(
      'wtp',
      'what-type-person',
      `      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <p class="text-[10px] font-mono uppercase tracking-wide text-gray-500 mb-2">Your type</p>
        <p id="wtpType" class="text-3xl font-black tracking-tight text-brand-400"></p>
        <p id="wtpTypeDesc" class="text-sm text-gray-300 leading-relaxed mt-3"></p>
        <div id="wtpTraits" class="flex flex-wrap gap-2 mt-4"></div>
      </div>

      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <p class="text-xs font-bold text-gray-200 mb-1">The whole spread</p>
        <p class="text-[11px] text-gray-500 leading-relaxed mb-4">
          Every type and what share of your answers it took. A winner at 30% against a runner-up at
          25% is not a verdict, and this is here so you can see that for yourself.
        </p>
        <div id="wtpSpread" class="space-y-3"></div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button id="wtpRestartBtn" type="button"
          class="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm transition">
          Start again
        </button>
${copyButton('wtp')}
      </div>`
    )}`,
    what: [
      'Ten questions, each with four answers, and six types to land in. Every answer adds a point to one type, and the type with the most points at the end is the one shown. There are no right answers and the questions are about ordinary situations rather than hypothetical dilemmas, because a quiz about what you would do in a burning building tells you nothing about what you are like on a Tuesday.',
      'The result screen shows the **full spread** rather than only the winning type. That is the part most quizzes leave out. Ten questions across six types produces small margins — a winner on three points with two types on two points each is extremely common — and presenting that as a settled answer would be the dishonest version of this tool. You get the winner at the top and the real numbers underneath it.'
    ],
    how: [
      'Press **Start the quiz**. The first question appears with a progress bar above it.',
      'Pick the answer closest to what you actually do. The quiz advances on its own after each pick.',
      'Use **Back** at any point to change an earlier answer. Your other answers are kept, so going back does not reset anything.',
      'The result appears once all ten are answered. Press **Start again** to run it a second time, or **Copy** to take the full spread away with you.'
    ],
    cases: [
      { t: 'Settling an argument', d: 'Two people who disagree about which of them is the organised one can take the same quiz and compare the spreads rather than the labels.' },
      { t: 'Something to do in a group chat', d: 'Ten questions is short enough to run in a chat and long enough that the answers are not obvious.' },
      { t: 'Finding out how close it was', d: 'If you have taken a quiz like this before and thought the result felt arbitrary, the spread is the part that explains why.' },
      { t: 'A writing prompt', d: 'The six types are usable as character sketches if you write fiction and need somebody whose behaviour is consistent.' }
    ],
    faqs: [
      { q: 'Is this a real personality test?', a: 'No. It is a game. There is no psychometric basis for it, the questions were written by hand, and the scoring is a plain tally. It is not a diagnosis and it should not be used to make any decision about anybody, including yourself.' },
      { q: 'Why does it show all six scores instead of just my type?', a: 'Because the margins are usually small. With ten questions and six types, a lot of people finish with two or three types within a point of each other. Showing only the winner would make a coin-flip margin look like a result, and showing the whole spread is more interesting anyway.' },
      { q: 'Does it store my answers?', a: 'No. The answers live in the page while you are on it and are gone when you close or reload it. Nothing is sent anywhere and there is no account.' },
      { q: 'Can I go back and change an answer?', a: 'Yes. The Back button steps to the previous question with your earlier answer still selected. Changing it re-scores from that point.' }
    ]
  },

  {
    slug: 'villain-name-generator',
    name: 'Villain Name Generator',
    create: 'createVillainName',
    shared: true,
    title: 'Villain Name Generator — Four Styles, With Backstory | ToolStack AI',
    desc: 'Generate a villain name with an origin story and a current scheme, across four styles from gothic to suburban. Free, no signup, and everything is fictional.',
    tagline:
      'A title, a name, an epithet, an origin and whatever they are currently up to — drawn independently, across four styles.',
    widget: `${statusBar('vil')}

${select('vilStyle', 'Style:', [
      ['gothic', 'Gothic — castles and old grievances'],
      ['corporate', 'Corporate — boardrooms and restructuring'],
      ['cosmic', 'Cosmic — scale, void, and similar'],
      ['suburban', 'Suburban — pettiness with a driveway']
    ])}

${drawButtons('vil', 'Generate a villain')}

${resultShell(
      'vil',
      'villain-name-generator',
      `      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <div class="flex items-start justify-between gap-4 mb-4">
          <p id="vilName" class="text-2xl sm:text-3xl font-black tracking-tight text-red-400 leading-tight"></p>
          <span id="vilBadge" class="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20"></span>
        </div>
        <div class="space-y-4">
${field('vilOrigin', 'Origin')}
${field('vilScheme', 'Current scheme')}
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
${copyButton('vil')}
      </div>

      <p id="vilMeta" class="text-[10px] text-gray-500 leading-relaxed"></p>`
    )}`,
    what: [
      'Four separate draws go into one name: a title, a name, an epithet, and an origin story. Each part has its own pool and its own shuffled bag, so no part repeats until that part is exhausted — which means you can keep pressing the button without seeing the same prefix twice in a row. The four styles are genuinely different registers rather than one list with the words swapped: gothic villains have dynastic grudges, corporate ones have quarterly targets, cosmic ones have a scale problem, and suburban ones are mostly annoyed about a fence.',
      'Every villain also gets a **current scheme**, drawn independently of the name. That mismatch is deliberate. A gothic name attached to a plan about parking permits is funnier than a matching pair, and it is closer to how the trope actually works in practice.'
    ],
    how: [
      'Choose a **style** from the dropdown. The style sets which pool every part of the name is drawn from.',
      'Press **Generate a villain**. The name, origin and scheme appear together.',
      'Press it again for a completely different combination. Each part is drawn from its own bag, so repeats are held off until a pool runs out.',
      'Press **Copy** to take the whole thing away, or **Clear** to empty the pool state and start the bags fresh.'
    ],
    cases: [
      { t: 'Naming a character', d: 'Enough parts to give you a name, a motive and a current activity in one press, which is most of what a background antagonist needs.' },
      { t: 'Running a game', d: 'Generate on the spot when a table asks who is behind something and you would rather not say "a wizard".' },
      { t: 'Writing prompts', d: 'The origin and the scheme are separate draws, so you can take one and leave the other.' },
      { t: 'Just pressing the button', d: 'The suburban style exists entirely for this.' }
    ],
    faqs: [
      { q: 'Are these names from anything real?', a: 'No. Every name, title, epithet and scheme is invented and drawn at random from pools written for this page. Nothing here references a real person, a real company or an existing fictional character.' },
      { q: 'Why do the name and the plan not match?', a: 'Because they are drawn from separate pools on purpose. A grand, ancient-sounding villain with a plan about a garden fence is a better joke than a matched pair, and most fictional villains are funnier for exactly that gap.' },
      { q: 'Can I use these in something I am writing?', a: 'Yes. The output is yours to use however you like. There is no attribution required and nothing here is licensed from anyone else.' },
      { q: 'What does Clear do?', a: 'It empties the result and resets the shuffled bags, so the next few draws can include names you have already seen. Without clearing, each part stays out of the rotation until its pool is used up.' }
    ]
  },

  {
    slug: 'superpower-generator',
    name: 'Superpower Generator (With Drawbacks)',
    create: 'createSuperpower',
    shared: true,
    title: 'Superpower Generator With Drawbacks — 36 Powers | ToolStack AI',
    desc: 'Generate a superpower and a drawback to go with it. Thirty-six powers across five categories, each paired with a catch drawn separately.',
    tagline:
      'A power and a catch. The drawback is drawn from a separate pool, so the two are never matched — which is usually where the interesting bit is.',
    widget: `${statusBar('pow')}

${select('powCategory', 'Category:', [
      ['any', 'Any category'],
      ['physical', 'Physical'],
      ['mental', 'Mental'],
      ['movement', 'Movement'],
      ['utility', 'Utility'],
      ['social', 'Social']
    ])}

${drawButtons('pow', 'Generate a power')}

${resultShell(
      'pow',
      'superpower-generator',
      `      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <div class="flex items-start justify-between gap-4 mb-4">
          <p id="powName" class="text-2xl sm:text-3xl font-black tracking-tight text-violet-400 leading-tight"></p>
          <span id="powBadge" class="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20"></span>
        </div>
        <div class="space-y-4">
${field('powDesc', 'What it does')}
        </div>
      </div>

      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <p class="text-[10px] font-mono uppercase tracking-wide text-amber-400 mb-1">The catch</p>
        <p id="powDrawback" class="text-sm text-gray-200 leading-relaxed"></p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
${copyButton('pow')}
      </div>

      <p id="powMeta" class="text-[10px] text-gray-500 leading-relaxed"></p>`
    )}`,
    what: [
      'Thirty-six powers across five categories, and twenty drawbacks in a separate pool. The power is what you asked for; the drawback is what makes it a character rather than a wish. A power with no cost is a boring answer to "what would you have", and every power in fiction that lasts more than one scene comes with a limitation that shapes how the person lives. The drawbacks are practical rather than cosmic — they are about inconvenience, social cost and side effects, not about curses.',
      'The two pools are **deliberately unpaired**. The drawback is drawn from its own bag and is not selected to fit the power, so you regularly get a small power with a serious catch or a large power with something trivial attached. That combination is the point. If you want a matched pair you can filter, draw again, or simply take the parts you like.'
    ],
    how: [
      'Pick a **category**, or leave it on any category to draw from everything.',
      'Press **Generate a power**. The power appears with its description, and a drawback appears below it.',
      'Press again for a new pair. The power pool and the drawback pool each run through their own shuffled bag, so neither repeats until it is used up.',
      'Press **Copy** to take both away, or **Clear** to reset the bags and the category.'
    ],
    cases: [
      { t: 'Character building', d: 'A power plus a cost is a character sketch. The drawback is usually the more useful half.' },
      { t: 'Tabletop games', d: 'Roll a power when a player gains something unexpected and needs a catch to go with it.' },
      { t: 'Writing exercises', d: 'Take the power and the drawback and write the scene where somebody finds out they have both.' },
      { t: 'Arguments about which power is best', d: 'The drawback pool makes the argument better by giving every answer a cost.' }
    ],
    faqs: [
      { q: 'What is the point of the drawback?', a: 'A power on its own is a list item. A power with a cost is a situation — it tells you something about how somebody would live, what they would avoid, and what they would give up. Every power in this pool has at least one drawback that fits it, and the separate pool means you usually get a more interesting mismatch.' },
      { q: 'Can I get a power without a drawback?', a: 'The drawback is always drawn. If you want the power on its own, ignore the second panel or copy only the first line. There is no setting to suppress it because the pairing is the tool.' },
      { q: 'Why do the power and the drawback not match?', a: 'They are drawn from separate pools and are not paired to each other. That is intentional: a modest power with a heavy cost, or a huge power with an inconvenience attached, is a better prompt than a tidy match.' },
      { q: 'Does this work offline?', a: 'Yes, once the page has loaded. Everything runs in your browser and no request is made when you press the button.' }
    ]
  },

  {
    slug: 'secret-talent-generator',
    name: 'Secret Talent Generator',
    create: 'createSecretTalent',
    shared: true,
    title: 'Secret Talent Generator — 30 Talents With Their Tell | ToolStack AI',
    desc: 'Generate a hidden talent, what it lets you do, and the small tell that would give it away. Thirty talents, all drawn at random.',
    tagline:
      'Thirty talents, each with a description and a tell — the small habit or detail that would give the whole thing away within a week.',
    widget: `${statusBar('tal')}

    <p class="text-xs text-gray-400 leading-relaxed">
      Every talent comes with a tell: the thing that would betray it. A talent on its own is a line
      of text; a talent plus the detail that gives it away is a character.
    </p>

${drawButtons('tal', 'Find a talent')}

${resultShell(
      'tal',
      'secret-talent-generator',
      `      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <p class="text-2xl sm:text-3xl font-black tracking-tight text-teal-400 leading-tight mb-4" id="talName"></p>
        <div class="space-y-4">
${field('talDesc', 'What it lets you do')}
${field('talTell', 'The tell')}
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
${copyButton('tal')}
      </div>

      <p id="talMeta" class="text-[10px] text-gray-500 leading-relaxed"></p>`
    )}`,
    what: [
      'Thirty talents, each with two parts: what the talent actually lets you do, and the tell — the small, specific habit or detail that would give it away. The second part is what makes this a generator rather than a list. Nobody is interesting because they can do something unusual; they are interesting because of how they behave about it, and the tell is where that lives. Every tell here is mundane and observable: a habit, a hesitation, an object that does not fit the cover story.',
      'The talents themselves are deliberately modest. Nothing in this pool is a superpower — they are things a person could plausibly have and choose not to mention, which is what makes "secret" mean something. A talent that would obviously change your life is not a secret talent, it is a career.'
    ],
    how: [
      'Press **Find a talent**. A talent, its description and its tell appear together.',
      'Press it again for a different one. Talents are drawn from a shuffled bag, so all thirty come up before any repeats.',
      'Press **Copy** to take the three lines away with you.',
      'Press **Clear** to empty the result and reset the bag.'
    ],
    cases: [
      { t: 'Character details', d: 'A tell is exactly the sort of detail that makes a background character feel like they have a life off the page.' },
      { t: 'Icebreakers', d: 'A better question than "what is your hidden talent" is "which of these is closest to true, and what is your tell".' },
      { t: 'Writing prompts', d: 'Write the scene where somebody notices the tell and the talent stops being secret.' },
      { t: 'Inventing a version of yourself', d: 'Pick the talent you would most like and the tell you would most plausibly have.' }
    ],
    faqs: [
      { q: 'What is a tell?', a: 'The small observable thing that would give the talent away — a habit, a pause, an object that does not fit, or a skill leaking out in conversation. It is the part that turns a talent into a character.' },
      { q: 'Are these real talents?', a: 'They are invented descriptions written for this page. Some are loosely plausible and some are not; none of them are being claimed as real abilities, and none of them are things you can learn here.' },
      { q: 'Can I get the same talent twice in a row?', a: 'Not until the pool is exhausted. Talents are drawn from a shuffled bag rather than picked at random each time, so all thirty appear once before any of them come round again. Press Clear to reset the bag.' },
      { q: 'Is anything saved?', a: 'No. Nothing is stored, nothing is uploaded, and there is no account. Closing the page discards everything.' }
    ]
  },

  {
    slug: 'superhero-name',
    name: 'Superhero Name Generator',
    create: 'createSuperheroName',
    shared: true,
    title: 'Superhero Name Generator — Four Styles & Team Names | ToolStack AI',
    desc: 'Generate a superhero name, a tagline, a team and an origin story across four styles, from classic to deliberately absurd.',
    tagline:
      'A name, a tagline, a team and an origin — four styles, including one that is not trying to be cool at all.',
    widget: `${statusBar('hero')}

${select('heroStyle', 'Style:', [
      ['classic', 'Classic — capes and conviction'],
      ['cosmic', 'Cosmic — stars and scale'],
      ['street', 'Street — rooftops and knuckles'],
      ['absurd', 'Absurd — do not take this one seriously']
    ])}

${drawButtons('hero', 'Generate a hero')}

${resultShell(
      'hero',
      'superhero-name',
      `      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <div class="flex items-start justify-between gap-4 mb-4">
          <p id="heroName" class="text-2xl sm:text-3xl font-black tracking-tight text-sky-400 leading-tight"></p>
          <span id="heroBadge" class="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20"></span>
        </div>
        <div class="space-y-4">
${field('heroTagline', 'Tagline')}
${field('heroTeam', 'Team')}
${field('heroOrigin', 'Origin')}
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
${copyButton('hero')}
      </div>

      <p id="heroMeta" class="text-[10px] text-gray-500 leading-relaxed"></p>`
    )}`,
    what: [
      'Four styles, each with its own prefixes, suffixes, taglines and origins, plus a shared pool of team names. The name is built from a prefix and a suffix drawn separately, which is why the combinations run into the hundreds and why some of them are much better than others — that variance is the honest behaviour of this kind of generator, and re-rolling costs one press.',
      'The **absurd** style exists because a superhero name generator that only produces serious names has no jokes in it. Every generator of this kind either leans into how silly the format is or spends its whole life pretending "Night Falcon" is a serious proposition. This one does both, and lets you choose.'
    ],
    how: [
      'Pick a **style**. Classic, cosmic and street are played straight; absurd is not.',
      'Press **Generate a hero**. The name, tagline, team and origin appear together.',
      'Press again for another. The prefix and suffix pools each run through their own shuffled bag, so the same half does not come back immediately.',
      'Press **Copy** to take the whole identity, or **Clear** to reset the bags and start fresh.'
    ],
    cases: [
      { t: 'Naming a character', d: 'Four parts in one press: what they are called, what they say, who they run with, and where they came from.' },
      { t: 'Group games', d: 'Everyone generates a hero and has to argue why theirs would win. The absurd style makes this considerably better.' },
      { t: 'Children’s writing projects', d: 'The classic and cosmic styles are safe, straightforward and easy to build a story around.' },
      { t: 'Taking the mickey', d: 'The absurd style is for this. It is doing it on purpose.' }
    ],
    faqs: [
      { q: 'Are these names from existing comics or films?', a: 'No. Every prefix, suffix, tagline, team and origin is invented for this page and drawn at random. Nothing here is taken from, or intended to resemble, an existing character or franchise.' },
      { q: 'Why do some of the names not work?', a: 'Because a prefix pool and a suffix pool crossed together will always produce some combinations that land badly. That is how generators of this kind behave, and the alternative — a hand-curated list of only the good ones — would exhaust itself in about twenty presses.' },
      { q: 'What is the absurd style for?', a: 'It is played for laughs on purpose. If you want a name you could use seriously, use classic, cosmic or street.' },
      { q: 'Can I use a generated name in my own project?', a: 'Yes. The output is yours, there is no attribution requirement, and nothing here is licensed from anybody.' }
    ]
  }
];

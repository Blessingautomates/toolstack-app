/**
 * Specs for the relationship and quiz pages. Consumed by
 * scripts/gen-fun-tools.mjs. Plain text — the generator escapes it for HTML
 * and reuses the FAQ strings verbatim in the FAQPage JSON-LD.
 *
 * Every one of these five produces a score, so every one of them has to say
 * plainly that the score is entertainment. That line is not boilerplate: a
 * quiz that implies it can measure a friendship or predict a relationship is
 * the single most damaging thing this site could ship.
 */

const statusBar = (p) => `    <div id="${p}Status" class="hidden mb-4 p-3 rounded-xl text-xs font-medium border"></div>`;

const bar = (p) => `    <div class="h-1.5 bg-gray-950 rounded-full overflow-hidden mt-3">
      <div id="${p}Bar" class="h-full bg-brand-500 transition-all duration-300" style="width:0%"></div>
    </div>`;

const optionsBlock = (p) => `      <div id="${p}Options" class="space-y-2 mt-5"></div>`;

/* Every quiz shares the same closing block: the entertainment disclaimer sits
   directly above the result actions so it cannot be scrolled past without
   being seen. */
const disclaimer = `    <div class="mt-6 p-3 rounded-xl bg-gray-950 border border-gray-800">
      <p class="text-[11px] text-gray-500 leading-relaxed">
        This is a scored game, not a measurement. No research went into the
        questions or the scoring, and the result says nothing about you or your
        relationships that is worth acting on.
      </p>
    </div>`;

const actions = (slug) => `      <div data-ts-result-actions="${slug}" class="space-y-4"></div>`;

export default [
  {
    slug: 'friendship-test',
    name: 'Friendship Test',
    create: 'createFriendshipTest',
    title: 'Friendship Test — 12 Question Quiz | ToolStack AI',
    desc: 'A 12-question friendship quiz that scores how well you show up for each other. Free, no signup, and honest that the score is entertainment rather than a measurement.',
    tagline:
      'Twelve questions about how you actually behave as a friend — the late-night replies, the moving vans, the in-jokes. You get a score, a band, and a full review of what you picked.',
    widget: `${statusBar('friends')}
    <div id="friendsIntro">
      <p class="text-sm text-gray-400 leading-relaxed">
        Twelve questions about how you and one particular friend actually operate. It takes about a
        minute, and at the end you get a score out of 48, a band, and a breakdown of every answer you
        gave so you can see where the points came from.
      </p>
      <button id="friendsStartBtn" type="button"
        class="mt-5 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold text-sm transition">
        Start the test
      </button>
    </div>

    <div id="friendsQuiz" class="hidden">
      <p id="friendsProgress" class="text-[11px] text-gray-500 font-mono"></p>
${bar('friends')}
      <p id="friendsQuestion" class="text-lg font-bold text-gray-100 mt-5 leading-snug"></p>
${optionsBlock('friends')}
      <button id="friendsBackBtn" type="button"
        class="hidden mt-4 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-xs transition">
        Back
      </button>
    </div>

    <div id="friendsResults" class="hidden">
      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6 text-center">
        <p id="friendsScoreNum" class="text-4xl font-black text-gray-50"></p>
        <p id="friendsBand" class="text-sm font-bold text-brand-400 mt-2"></p>
        <p id="friendsBandText" class="text-xs text-gray-400 mt-3 leading-relaxed max-w-md mx-auto"></p>
      </div>

      <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold mt-6 mb-2">Your answers</p>
      <div id="friendsReview" class="bg-gray-950 border border-gray-800 rounded-2xl p-4"></div>

      <button id="friendsRestartBtn" type="button"
        class="mt-5 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm transition">
        Start again
      </button>
    </div>

${disclaimer}

${actions('friendship-test')}`,
    what: [
      'Twelve questions about how you and one friend actually behave towards each other — whether you know their birthday, whether you would turn up at eight in the morning with a van, whether you have a shared in-joke that makes no sense to anybody else. Each answer is worth points, the points add to a total out of 48, and the total lands in one of four bands.',
      'Here is the honest limitation, and it is a big one: there is no research behind this. The questions were chosen because they felt like the right questions, and the weights were assigned by judgement. Friendship is not a quantity and this is not a measurement of it, so please do not use the result to settle an argument or to decide anything about a real relationship. What the quiz is genuinely good for is the conversation it starts, and the review screen at the end — seeing your own answers listed back is more interesting than the number.'
    ],
    how: [
      'Press **Start the test** to begin. You get one question at a time, each with four answers.',
      'Pick the answer closest to what you actually do, not the one that sounds best. The result is only interesting if the input is honest.',
      'Work through all twelve. The progress bar fills as you go, and **Back** lets you change the previous answer.',
      'Read the review at the end. It lists every question next to the answer you chose, which is the part people actually talk about.'
    ],
    cases: [
      { t: 'A long car journey', d: 'Twelve questions is about ten minutes with two people arguing over the answers, which is most of a motorway stint.' },
      { t: 'Testing a new friendship', d: 'If you have known someone for three months, the early questions are genuinely informative about how much you have bothered to learn.' },
      { t: 'Testing a very old friendship', d: 'If you have known someone for twenty years and score badly, that is a funny result rather than a worrying one.' },
      { t: 'Something to send a group', d: 'Everyone takes it about the same person and compares. The arguments about the scoring are the entertainment.' }
    ],
    faqs: [
      { q: 'Is this a real psychological test?', a: 'No. There is no research behind the questions or the scoring, and friendship is not something a twelve-question quiz can measure. It is a scored game that is fun to play and occasionally starts a good conversation.' },
      { q: 'Should I take the result seriously?', a: 'No. A low score means you picked certain options, and nothing more. Do not use it to judge a friendship or to settle an argument with anyone.' },
      { q: 'Do I need to answer about a specific friend?', a: 'Yes — pick one person and answer about them throughout. Answers about a general sort of friend tend to land in the middle and make for a duller result.' },
      { q: 'Does it save or send my answers?', a: 'No. Everything happens in your browser and nothing is stored or transmitted. Closing the tab loses the answers entirely.' }
    ]
  },

  {
    slug: 'couple-compatibility',
    name: 'Couple Compatibility Calculator',
    create: 'createCoupleCompatibility',
    title: 'Couple Compatibility Calculator — Compare Answers | ToolStack AI',
    desc: 'Two people answer the same ten either/or questions and see where they agree. Free, no signup, no data sent anywhere — and honest that it is not a prediction.',
    tagline:
      'Ten either/or questions, answered twice. The tool counts where you match and shows you exactly which answers split — which is the interesting part.',
    widget: `${statusBar('couple')}
    <div id="coupleIntro">
      <p class="text-sm text-gray-400 leading-relaxed">
        Both of you answer the same ten either/or questions, one after the other on this device. The
        result is a count of how often you picked the same thing, plus a breakdown showing exactly
        where you diverged.
      </p>
      <p class="text-[11px] text-gray-500 leading-relaxed mt-3">
        Nothing is uploaded and nothing is stored. The second person should look away during the first pass.
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
        <div>
          <label for="coupleAName" class="block text-xs text-gray-400 mb-1 font-mono">First person (optional):</label>
          <input id="coupleAName" type="text" maxlength="24" placeholder="Player 1"
            class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-500" />
        </div>
        <div>
          <label for="coupleBName" class="block text-xs text-gray-400 mb-1 font-mono">Second person (optional):</label>
          <input id="coupleBName" type="text" maxlength="24" placeholder="Player 2"
            class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-500" />
        </div>
      </div>

      <button id="coupleStartBtn" type="button"
        class="mt-5 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold text-sm transition">
        Start
      </button>
    </div>

    <div id="coupleQuiz" class="hidden">
      <p id="coupleTurn" class="text-sm font-bold text-brand-400"></p>
      <p id="coupleProgress" class="text-[11px] text-gray-500 font-mono mt-1"></p>
${bar('couple')}
      <p id="coupleQuestion" class="text-lg font-bold text-gray-100 mt-5 leading-snug"></p>
${optionsBlock('couple')}
    </div>

    <div id="coupleResults" class="hidden">
      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6 text-center">
        <p id="coupleScore" class="text-2xl font-black text-gray-50"></p>
        <p id="coupleVerdict" class="text-xs text-gray-400 mt-3 leading-relaxed max-w-md mx-auto"></p>
      </div>

      <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold mt-6 mb-2">Question by question</p>
      <div id="coupleBreakdown" class="bg-gray-950 border border-gray-800 rounded-2xl p-4"></div>

      <button id="coupleRestartBtn" type="button"
        class="mt-5 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm transition">
        Run it again
      </button>
    </div>

${disclaimer}

${actions('couple-compatibility')}`,
    what: [
      'This is a compare rather than a quiz. Nobody is graded. Both people answer the same ten either/or questions — beach or mountains, plan it or wing it, talk it out now or sleep on it — and the tool counts how many answers matched and shows you exactly which ones did not.',
      'It does not measure compatibility, and the page will keep saying so. Ten arbitrary preferences tell you nothing about whether two people can build a life together: some of the most durable couples disagree about every item on this list, and plenty of people who answer identically are not suited to each other at all. What the tool genuinely produces is a starting point for a conversation about the mismatches, which is the part worth having. Treat a low percentage as a list of interesting differences, not a warning.'
    ],
    how: [
      'Optionally type both names, so the breakdown refers to you rather than to Player 1 and Player 2.',
      'Press **Start**. The first person answers all ten questions while the second looks away.',
      'Hand the device over. The second person answers the same ten, guessing nothing — just picking their own preference.',
      'Read the breakdown together. Every question is listed with both answers and marked same or split, so the disagreements are easy to find.'
    ],
    cases: [
      { t: 'A first long trip together', d: 'Ten either/or questions about holidays and evenings is a low-stakes way to find out where you differ before you are stuck in a car.' },
      { t: 'A long-running couple', d: 'After years together the interesting output is the two or three questions you still answer differently, not the total.' },
      { t: 'Flatmates', d: 'The questions about planning, spending and nights in map surprisingly well onto sharing a kitchen.' },
      { t: 'A group activity', d: 'Run it as a tournament — everyone answers, and you find out who in the group is the outlier.' }
    ],
    faqs: [
      { q: 'Does this predict whether a relationship will work?', a: 'No, and it cannot. It counts how often two people picked the same option out of ten either/or questions. That number is real; any meaning attached to it is not. Plenty of strong relationships score low here.' },
      { q: 'Is a low score bad?', a: 'No. It means you picked differently, which is a fact about ten preferences. The mismatches are usually the most interesting part of the breakdown.' },
      { q: 'Is our data uploaded anywhere?', a: 'No. Both sets of answers live in the page and are discarded when you close the tab. Nothing is sent to a server and nothing is saved.' },
      { q: 'Why does it ask for names?', a: 'Only to label the breakdown. They are optional and stay in the browser — leave them blank and the tool will use Player 1 and Player 2.' }
    ]
  },

  {
    slug: 'best-friend-quiz',
    name: 'Best Friend Quiz',
    create: 'createBestFriendQuiz',
    title: 'Best Friend Quiz Maker — Build & Share a Quiz | ToolStack AI',
    desc: 'Answer eight questions about yourself, get a link, and find out how well your friends actually know you. Free, no signup, and answers never leave the browser.',
    tagline:
      'Build your own eight-question quiz, send the link, and watch your friends find out how much they have actually been paying attention.',
    widget: `${statusBar('bfq')}
    <div id="bfqIntro">
      <p class="text-sm text-gray-400 leading-relaxed">
        Answer eight quick questions about yourself. The tool packs your answers into a link — send
        it to anyone, and they get the same eight questions to guess at. At the end they see their
        score and every answer they got wrong.
      </p>
      <p class="text-[11px] text-gray-500 leading-relaxed mt-3">
        Your answers travel in the link itself, not through a server. Nothing is uploaded and no
        account is needed. Anyone who reads the link carefully can see the answers — it is a party
        game, not a vault.
      </p>
      <button id="bfqStartBtn" type="button"
        class="mt-5 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold text-sm transition">
        Build my quiz
      </button>
    </div>

    <div id="bfqQuiz" class="hidden">
      <p id="bfqMode" class="text-sm font-bold text-brand-400"></p>
      <p id="bfqProgress" class="text-[11px] text-gray-500 font-mono mt-1"></p>
${bar('bfq')}
      <p id="bfqQuestion" class="text-lg font-bold text-gray-100 mt-5 leading-snug"></p>
${optionsBlock('bfq')}
    </div>

    <div id="bfqLinkPanel" class="hidden">
      <p class="text-sm text-gray-300 font-bold">Your quiz is ready</p>
      <p class="text-xs text-gray-400 leading-relaxed mt-2">
        Send this link to whoever wants to try. It already contains your answers — anyone who opens
        it gets the same eight questions and a score at the end. Use the share buttons below, or copy
        the link directly.
      </p>
      <input id="bfqLink" type="text" readonly
        class="w-full mt-4 bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-gray-300 font-mono focus:outline-none focus:border-brand-500" />
      <div class="flex flex-wrap items-center gap-2 mt-3">
        <button id="bfqCopyLinkBtn" type="button"
          class="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm transition">
          Copy link
        </button>
        <span class="text-[11px] text-gray-500">Want to try it yourself first? Reload the page.</span>
      </div>
    </div>

    <div id="bfqResults" class="hidden">
      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6 text-center">
        <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold">You scored</p>
        <p id="bfqScore" class="text-4xl font-black text-gray-50 mt-1"></p>
        <p id="bfqBand" class="text-xs text-gray-400 mt-3 leading-relaxed max-w-md mx-auto"></p>
      </div>

      <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold mt-6 mb-2">What you got wrong</p>
      <div id="bfqBreakdown" class="bg-gray-950 border border-gray-800 rounded-2xl p-4"></div>

      <button id="bfqRestartBtn" type="button"
        class="mt-5 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm transition">
        Make my own quiz
      </button>
    </div>

${disclaimer}

${actions('best-friend-quiz')}`,
    what: [
      'This is a quiz builder rather than a fixed quiz. You answer eight questions about your own habits and preferences, and the tool packs those answers into the link itself, in the part of the URL after the hash. Send that link to anyone and they get the same eight questions to guess at, then a score and a list of everything they got wrong.',
      'Two honest limitations. First, the link is not encrypted or obfuscated — your answers are encoded in it in a straightforward way, and anyone who looks closely can read them. That is deliberate: scrambling eight multiple-choice answers would be security theatre on a party game. Second, and more importantly, this measures whether somebody remembers eight facts. It is a memory game about your takeaway order, not a measure of how much anyone cares about you, and the score bands are written to make that clear rather than to sting.'
    ],
    how: [
      'Press **Build my quiz** and answer the eight questions about yourself.',
      'When you finish, the page writes your quiz into the address bar and shows you the link. The page you are looking at is the quiz, so the share buttons send the right thing.',
      'Send the link to a friend. When they open it the quiz starts immediately, and they answer the same eight questions as guesses.',
      'They get a score out of eight and a breakdown showing which answers they missed and what you had actually picked.'
    ],
    cases: [
      { t: 'A group chat challenge', d: 'Drop the link in and let everyone post their scores. The low scores are funnier than the high ones.' },
      { t: 'A new relationship', d: 'Eight questions is a low-stakes way to find out how much someone has actually noticed.' },
      { t: 'A long-distance friend', d: 'The link travels well over a message and takes about a minute to play, which is the right length for a reply.' },
      { t: 'Testing a claim', d: 'When someone insists they know you better than anyone, this is a cheap way to check.' }
    ],
    faqs: [
      { q: 'How do my answers get into the link?', a: 'They are encoded into the part of the URL after the hash symbol, one digit per question in order. Nothing is sent to a server, which is also why no account is needed and nothing is stored.' },
      { q: 'Can someone read my answers from the link?', a: 'Yes, if they look carefully. The encoding is deliberately simple rather than scrambled, because obfuscating eight multiple-choice answers would be pretending at security on a party game.' },
      { q: 'Does this measure how good a friend someone is?', a: 'No. It measures whether somebody remembered eight facts about you. Scoring badly means they guessed wrong about your cinema snack, and nothing more than that.' },
      { q: 'Can I take my own quiz?', a: 'Reload the page and the quiz starts fresh against your saved answers. The link is for other people.' }
    ]
  },

  {
    slug: 'who-knows-me-better',
    name: 'Who Knows Me Better Quiz',
    create: 'createWhoKnowsMeBetter',
    title: 'Who Knows Me Better? — 3-Player Quiz | ToolStack AI',
    desc: 'One person answers ten questions about themselves, two others guess, and the tool shows who read them better. Free, no signup, nothing leaves the browser.',
    tagline:
      'The classic three-player game. One person answers honestly, two others guess the same ten answers, and the leaderboard settles it.',
    widget: `${statusBar('wkmb')}
    <div id="wkmbIntro">
      <p class="text-sm text-gray-400 leading-relaxed">
        Three people, one device. The subject answers ten questions about themselves first while the
        other two look away. Then each of them guesses the same ten answers, and the tool shows who
        read the subject more accurately.
      </p>
      <p class="text-[11px] text-gray-500 leading-relaxed mt-3">
        Keep the screen to yourself between passes — the answers are not hidden from anyone
        standing behind you.
      </p>
      <button id="wkmbStartBtn" type="button"
        class="mt-5 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold text-sm transition">
        Start the game
      </button>
    </div>

    <div id="wkmbQuiz" class="hidden">
      <p id="wkmbRole" class="text-sm font-bold text-brand-400"></p>
      <p id="wkmbProgress" class="text-[11px] text-gray-500 font-mono mt-1"></p>
${bar('wkmb')}
      <p id="wkmbQuestion" class="text-lg font-bold text-gray-100 mt-5 leading-snug"></p>
${optionsBlock('wkmb')}
    </div>

    <div id="wkmbResults" class="hidden">
      <div id="wkmbBoard" class="grid grid-cols-2 gap-3"></div>
      <p id="wkmbVerdict" class="text-xs text-gray-400 leading-relaxed mt-4 text-center max-w-md mx-auto"></p>

      <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold mt-6 mb-2">Every answer</p>
      <div id="wkmbBreakdown" class="bg-gray-950 border border-gray-800 rounded-2xl p-4"></div>

      <button id="wkmbRestartBtn" type="button"
        class="mt-5 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm transition">
        Play again
      </button>
    </div>

${disclaimer}

${actions('who-knows-me-better')}`,
    what: [
      'Three passes, ten questions, one leaderboard. First the subject answers ten questions about their own preferences and habits. Then two other players take turns guessing the same ten answers. The tool scores each guesser against the truth and puts the two scores side by side, with a full breakdown showing every question, the real answer, and what each player guessed.',
      'The limitation is the same one that applies to every quiz on this site, and it matters more here because there is a winner. Doing well means you remembered ten preferences correctly. It does not mean you are the better friend, the closer sibling, or the one who pays more attention in general — and the verdict text says so explicitly, including naming the player who lost. Somebody has to come second in a two-player game; that is a property of the format, not a judgement about them.'
    ],
    how: [
      'Press **Start the game**. Pass the device to the subject and have the other two players look away.',
      'The subject answers all ten questions honestly. Nothing is shown on screen afterwards that would give the answers away before the guessing starts.',
      'Hand the device to Player 2, then Player 3. Each answers the same ten questions as guesses, with a handover prompt between passes.',
      'Read the leaderboard and the breakdown together. Every question shows the truth, both guesses, and a tick or cross.'
    ],
    cases: [
      { t: 'Family gatherings', d: 'Siblings guessing about a parent, or parents guessing about a teenager, is a reliably good twenty minutes.' },
      { t: 'A group holiday', d: 'Three people and one phone is exactly the shape this needs, and it fills a wait at an airport.' },
      { t: 'Settling a long-running claim', d: 'For when somebody insists they know you best. Now there is a scoreboard.' },
      { t: 'A low-stakes icebreaker', d: 'Because the questions are all preferences, nobody has to disclose anything they would rather keep.' }
    ],
    faqs: [
      { q: 'How many people do I need?', a: 'Three: one subject who answers truthfully, and two players who guess. It works with two at a push, but the leaderboard is the point, so three is really the minimum.' },
      { q: 'What if both players score the same?', a: 'The result screen calls it a dead heat and shows the shared score. There is no tiebreak, because inventing one would be pretending the game is more precise than it is.' },
      { q: 'Does a low score mean someone is a bad friend?', a: 'No. It means they guessed wrong about a handful of preferences. The results screen names the losing player explicitly and then says exactly this, because the game should not be able to hurt anyone.' },
      { q: 'Is anything saved between passes?', a: 'Only in the page, and only until you close the tab. Nothing is uploaded and nothing is written to storage.' }
    ]
  },

  {
    slug: 'crush-calculator',
    name: 'Crush Calculator',
    create: 'createCrushCalculator',
    title: 'Crush Calculator — Name Compatibility Game | ToolStack AI',
    desc: 'A name game that counts the letters two names share and prints a number from 1 to 99. Free, no signup, and upfront that it cannot predict anything real.',
    tagline:
      'Two names in, a number out. It counts the letters you share and shows you the arithmetic — which is the honest way to present a game like this.',
    widget: `${statusBar('crush')}
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label for="crushYourName" class="block text-xs text-gray-400 mb-1 font-mono">Your name:</label>
        <input id="crushYourName" type="text" maxlength="40" placeholder="Your name"
          class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-500" />
      </div>
      <div>
        <label for="crushTheirName" class="block text-xs text-gray-400 mb-1 font-mono">Their name:</label>
        <input id="crushTheirName" type="text" maxlength="40" placeholder="Their name"
          class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-500" />
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2 mt-5">
      <button id="crushCalcBtn" type="button"
        class="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold text-sm transition">
        Calculate
      </button>
      <button id="crushClearBtn" type="button"
        class="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm transition">
        Clear
      </button>
    </div>

    <div id="crushResults" class="hidden mt-5 space-y-5">
      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6 text-center">
        <p id="crushScore" class="text-5xl font-black text-gray-50"></p>
        <p id="crushVerdict" class="text-xs text-gray-400 mt-3 leading-relaxed max-w-md mx-auto"></p>
        <button id="crushCopyBtn" type="button"
          class="mt-4 px-3 py-1.5 rounded-xl border border-gray-700 hover:border-brand-500 text-gray-300 hover:text-brand-400 font-semibold text-xs transition">
          Copy
        </button>
      </div>

      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-4">
        <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-2">How the number was made</p>
        <div id="crushWorking" class="space-y-1"></div>
      </div>

      <div class="p-3 rounded-xl bg-gray-950 border border-gray-800">
        <p class="text-[11px] text-gray-500 leading-relaxed">
          This is a name game and it has no predictive power. A name cannot tell you whether someone
          likes you or whether anything will work out. Please do not make a decision, or avoid one,
          because of a number this tool printed.
        </p>
      </div>

${actions('crush-calculator')}
    </div>`,
    what: [
      'This is a name game, and the page is going to be straightforward about that. It strips both names down to letters, works out which letters they share, mixes in a fixed numeric hash of the two names, and prints a number between 1 and 99. The result screen shows every step of that arithmetic, so you can see exactly where the number came from.',
      'That transparency is the point. A compatibility percentage with no visible mechanism invites people to believe it; one with the working on display is much harder to take seriously, which is the correct response. The tool cannot know anything about a person from their name. It cannot tell you whether someone likes you, whether you should say something, or how anything will turn out. It is a school-exercise-book game with better typography, and it is genuinely fun for about ninety seconds, which is all it claims to be.'
    ],
    how: [
      'Type two names. Accents, spaces, hyphens and emoji are stripped, so any name works.',
      'Press **Calculate**, or just press Enter in either field.',
      'Read the number, then read the working underneath it — the shared letters are listed, and so are the two components that made up the score.',
      'Press **Copy** to grab a line you can paste into a message, with the caveat attached so nobody mistakes it for a prediction.'
    ],
    cases: [
      { t: 'Being thirteen', d: 'This is the original use case and the tool has no intention of pretending otherwise.' },
      { t: 'A group chat bit', d: 'Run everyone in the chat against everyone else and find out who the algorithm likes. It means nothing and that is the joke.' },
      { t: 'Testing the tool', d: 'Because it is deterministic, you can put the same names in twice and check. Same answer every time — which is a more interesting property than the number itself.' },
      { t: 'Naming a pet', d: 'Genuinely how some people choose between two names for a dog. No worse a method than most.' }
    ],
    faqs: [
      { q: 'Can this actually predict compatibility?', a: 'No. It counts the letters two names share and mixes in a fixed numeric hash. It cannot know anything about a person from their name, and it should never be a reason to do or avoid doing something.' },
      { q: 'Why does the same pair of names always give the same score?', a: 'Because the calculation is deterministic — there is no randomness and no date involved. A calculator that produced a different answer each time you pressed the button would make it obvious the number was meaningless.' },
      { q: 'What is the hash for?', a: 'It mixes the two names together so that pairs sharing the same letters do not all get identical scores. It contributes at most forty points, and the working shows you exactly how many it added.' },
      { q: 'What happens to names I type in?', a: 'They stay in the page. Nothing is uploaded, nothing is stored, and closing the tab loses them. There is no server involved in the calculation at all.' }
    ]
  }
];

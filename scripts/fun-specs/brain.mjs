/**
 * Specs for the brain-games pages. Consumed by scripts/gen-fun-tools.mjs.
 *
 * All five set `shared: true` — they use the shared status controller, the
 * shuffled bag or the draw tool from assets/tools/fun-shared.js.
 *
 * The three quizzes are deliberately three different formats rather than one
 * format with three sets of questions: the trivia quiz is a shuffled ten marked
 * as you go, the general knowledge paper is a fixed fifteen marked at the end,
 * and the geography quiz is twelve rounds with a regional breakdown. The copy on
 * each page says so, because a reader who has used one should know why the
 * other two exist.
 */

const statusBar = (p) => `    <div id="${p}Status" class="hidden mb-4 p-3 rounded-xl text-xs font-medium border"></div>`;

const select = (id, label, options) => `    <div>
      <label for="${id}" class="block text-xs text-gray-400 mb-1 font-mono">${label}</label>
      <select id="${id}"
        class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-brand-500">
${options.map(([v, t]) => `        <option value="${v}">${t}</option>`).join('\n')}
      </select>
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

const copyBtn = (p) => `          <button id="${p}CopyBtn" type="button"
            class="px-3 py-1.5 rounded-xl border border-gray-700 hover:border-brand-500 text-gray-300 hover:text-brand-400 font-semibold text-xs transition">
            Copy
          </button>`;

const quizActions = (p, slug) => `      <div class="flex flex-wrap items-center gap-2 mt-5">
        <button id="${p}RestartBtn" type="button"
          class="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm transition">
          Start again
        </button>
        <button id="${p}CopyBtn" type="button"
          class="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm transition">
          Copy my result
        </button>
      </div>

      <div data-ts-result-actions="${slug}" class="space-y-4 mt-5"></div>`;

export default [
  {
    slug: 'riddle-generator',
    name: 'Riddle Generator',
    create: 'createRiddleGenerator',
    shared: true,
    title: 'Riddle Generator — Classic Riddles with Hints | ToolStack AI',
    desc: 'Forty classic riddles drawn at random, each with a hint and a held-back answer. Free, no signup, and the answer never spoils the next one.',
    tagline:
      'Forty long-established riddles across five kinds. Read it out, take a hint if you are stuck, and reveal the answer only when you have given up.',
    widget: `${statusBar('rid')}
${select('ridCategory', 'Category:', [['all', 'Anything'], ['classic', 'Classic'], ['wordplay', 'Wordplay'], ['logic', 'Logic'], ['objects', 'Everyday objects'], ['nature', 'Nature and time']])}

${drawButtons('rid', 'Draw a riddle')}

    <p class="text-[10px] text-gray-500 mt-3">The answer is held back until you ask for it. The hint sits in between.</p>

    <div id="ridResults" class="hidden mt-5 space-y-5">
      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <div class="flex items-start justify-between gap-4 mb-5">
          <span id="ridBadge" class="px-3 py-1 rounded-full text-[11px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">Classic</span>
${copyBtn('rid')}
        </div>

        <p id="ridQuestion" class="text-lg font-bold text-gray-100 leading-snug"></p>

        <div id="ridHint" class="hidden mt-4 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 leading-relaxed"></div>

        <div id="ridAnswer" class="hidden mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-base font-bold text-emerald-300"></div>

        <div class="flex flex-wrap items-center gap-2 mt-5 pt-5 border-t border-gray-800">
          <button id="ridHintBtn" type="button"
            class="px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-brand-500 text-gray-200 font-semibold text-sm transition">
            Give me a hint
          </button>
          <button id="ridRevealBtn" type="button"
            class="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm transition">
            Reveal the answer
          </button>
        </div>
      </div>

      <div id="ridMeta" class="text-[11px] text-gray-500"></div>

      <div data-ts-result-actions="riddle-generator" class="space-y-4"></div>
    </div>`,
    what: [
      'A bank of forty classic riddles, drawn one at a time from a shuffled bag so the same one does not come round twice until you have worked through the category. Each riddle has a hint that nudges at the reasoning, and an answer that stays hidden until you press the button for it.',
      'Every riddle here is a long-established public-domain classic rather than something written for this page, and that is a deliberate constraint. An invented riddle is often original because it is ambiguous, and an ambiguous riddle is a bad riddle — the solver cannot tell the difference between missing the trick and the trick not being there. These all have settled answers that people have agreed on for a very long time. The limitation is the flip side: a well-known riddle is one somebody in the room may already have heard, which is why the category filter exists.'
    ],
    how: [
      'Pick a category, or leave it on **Anything** for all forty. Riddles are drawn from a shuffled bag, so nothing repeats until the category is exhausted.',
      'Press **Draw a riddle** and read it out. Give the room a minute before anyone reaches for a button.',
      'Press **Give me a hint** if it stalls. Each riddle has one hint, and it points at the reasoning rather than restating the question.',
      'Press **Reveal the answer** when everyone has given up. The answer is only added to the copied text once you have revealed it, so copying a riddle to send to somebody does not hand them the solution.'
    ],
    cases: [
      { t: 'A long car journey', d: 'Riddles need no equipment and no screen for the person solving them — read it out and let the car argue.' },
      { t: 'A pub table', d: 'The logic category is the one that starts arguments, particularly the bat and ball.' },
      { t: 'Kids who are bored', d: 'The classic and everyday-objects categories are the most approachable, and the hint button means nobody is left stuck.' },
      { t: 'A warm-up before a quiz', d: 'Ten minutes of riddles is a good way to get a room thinking before something more structured.' }
    ],
    faqs: [
      { q: 'Are these original riddles?', a: 'No, and that is on purpose. They are long-established classics with settled answers. An invented riddle is often ambiguous, and a solver cannot tell the difference between missing the trick and there being no trick.' },
      { q: 'Does the answer show up in the copied text?', a: 'Only if you have revealed it. If you copy a riddle to send to somebody before pressing Reveal, the copied text says so instead of including the answer.' },
      { q: 'Will I see the same riddle twice?', a: 'Not until you have worked through the category. Riddles are drawn from a shuffled bag, and the bag refills without the riddle that is currently on screen.' },
      { q: 'Is there more than one hint per riddle?', a: 'No. Each riddle has a single hint, and pressing the button twice says so rather than inventing a second one. The answer button is right there if the hint is not enough.' }
    ]
  },

  {
    slug: 'daily-riddle',
    name: 'Daily Riddle',
    create: 'createDailyRiddle',
    shared: true,
    title: 'Daily Riddle — One New Riddle Every Day | ToolStack AI',
    desc: 'A single riddle a day, the same one for everybody, with a hint, an answer and a six-day archive. Free, no signup, and the date decides the riddle.',
    tagline:
      'One riddle a day, the same one for everyone. Come back tomorrow for the next, or look back through the last six days.',
    widget: `${statusBar('dr')}
    <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <p id="drDate" class="text-[11px] uppercase tracking-wider text-gray-500 font-bold"></p>
        <span id="drStreak" class="text-[11px] text-brand-400 font-semibold"></span>
      </div>

      <p id="drQuestion" class="text-lg font-bold text-gray-100 leading-snug"></p>

      <div id="drHint" class="hidden mt-4 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 leading-relaxed"></div>

      <div id="drAnswer" class="hidden mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-base font-bold text-emerald-300"></div>

      <div class="flex flex-wrap items-center gap-2 mt-5 pt-5 border-t border-gray-800">
        <button id="drHintBtn" type="button"
          class="px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-brand-500 text-gray-200 font-semibold text-sm transition">
          Give me a hint
        </button>
        <button id="drRevealBtn" type="button"
          class="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm transition">
          Reveal the answer
        </button>
        <button id="drCopyBtn" type="button"
          class="px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-brand-500 text-gray-200 font-semibold text-sm transition">
          Copy today’s riddle
        </button>
      </div>
    </div>

    <div class="mt-5">
      <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-2">The last six days</p>
      <div id="drArchive" class="space-y-2"></div>
    </div>

    <div data-ts-result-actions="daily-riddle" class="space-y-4 mt-5"></div>`,
    what: [
      'One riddle a day, chosen from the date rather than drawn at random. That is what makes it a daily: everybody who opens the page on the same day gets the same riddle, so two people can compare without comparing which button they pressed. Below today’s riddle is an archive of the previous six days, each with its answer, so missing a day does not mean losing it.',
      'Two honest limitations. The riddle changes at your local midnight rather than a global one, because a daily puzzle should turn over when your day does — which means somebody a few timezones away is a few hours ahead or behind you. And the streak counts days you opened the page, not days you solved the riddle: the tool has no way to check an answer typed nowhere, and inventing a way to verify it would mean asking you to type answers into a box for no reason.'
    ],
    how: [
      'Open the page. Today’s riddle is already there, along with the date and your current streak.',
      'Read it. Take the hint only if you want it — there is one per riddle and it points at the reasoning.',
      'Reveal the answer when you are done. The archive below opens each of the last six days, answer included.',
      'Press **Copy today’s riddle** to send it to somebody. The answer is included only if you have revealed it.'
    ],
    cases: [
      { t: 'A morning habit', d: 'One riddle with a coffee is a small, finite thing — it ends, which is the point of a daily.' },
      { t: 'A shared office', d: 'Because everyone gets the same riddle, the comparison at lunch is the actual game.' },
      { t: 'Sending to a friend', d: 'Copy the riddle and paste it into a message. The answer is withheld unless you have revealed it yourself.' },
      { t: 'Catching up', d: 'The six-day archive means a missed weekend is not a lost weekend.' }
    ],
    faqs: [
      { q: 'When does the riddle change?', a: 'At your local midnight. The date is read from your device in local time rather than UTC, so the riddle turns over when your day does — which means people in other timezones may be a few hours ahead or behind.' },
      { q: 'Do I get the same riddle as everyone else?', a: 'On the same day, yes, as long as you are in a similar timezone. The riddle is derived from the date rather than drawn at random, so there is nothing to store and nothing to lose.' },
      { q: 'What does the streak count?', a: 'Days in a row you have opened the page — not days you solved it. The tool cannot check an answer that is never typed anywhere, and it would rather count something it can actually observe than invent a verification step.' },
      { q: 'Where is my streak stored?', a: 'In your own browser, under a single key. Nothing is uploaded. If you are in private browsing or have site data blocked, the streak simply does not appear — the riddle itself still works.' }
    ]
  },

  {
    slug: 'trivia-quiz',
    name: 'Trivia Quiz',
    create: 'createTriviaQuiz',
    shared: true,
    title: 'Trivia Quiz — 10 Shuffled Questions, Marked Instantly | ToolStack AI',
    desc: 'Ten trivia questions drawn from a pool of forty-eight, marked as you go. Pick a category or take the whole pool. Free, no signup, no timer.',
    tagline:
      'Ten questions from a pool of forty-eight, shuffled fresh every round and marked the moment you pick. Choose a category or take the whole pool.',
    widget: `${statusBar('triv')}
    <div id="trivIntro">
      <div class="mb-4">
${select('trivCategory', 'Category:', [['all', 'Everything — the whole pool'], ['science', 'Science'], ['history', 'History'], ['arts', 'Arts and music'], ['sport', 'Sport'], ['nature', 'Nature'], ['technology', 'Technology']])}
      </div>
      <p class="text-sm text-gray-400 leading-relaxed">
        Ten questions, shuffled fresh each round, marked as soon as you pick. There is no timer —
        the questions are not written for speed, and a countdown turns a bit of fun into a stress test.
      </p>
      <button id="trivStartBtn" type="button"
        class="mt-5 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold text-sm transition">
        Start a round
      </button>
    </div>

    <div id="trivQuiz" class="hidden">
      <p id="trivProgress" class="text-[11px] text-gray-500 font-mono"></p>
      <div class="h-1.5 bg-gray-950 rounded-full overflow-hidden mt-3">
        <div id="trivBar" class="h-full bg-brand-500 transition-all duration-300" style="width:0%"></div>
      </div>

      <p id="trivQuestion" class="text-base font-bold text-gray-100 mt-6 leading-snug"></p>
      <div id="trivOptions" class="mt-4 space-y-2"></div>
      <div id="trivFeedback" class="hidden mt-4 p-3 rounded-xl text-xs font-medium border"></div>

      <button id="trivNextBtn" type="button"
        class="hidden mt-4 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold text-sm transition">
        Next question
      </button>
    </div>

    <div id="trivResults" class="hidden">
      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6 text-center">
        <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Your score</p>
        <p id="trivScore" class="text-4xl font-black text-brand-400 mt-2"></p>
        <p id="trivBand" class="text-xs text-gray-400 mt-3 leading-relaxed"></p>
      </div>

      <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold mt-6 mb-2">Every question</p>
      <div id="trivReview" class="bg-gray-950 border border-gray-800 rounded-2xl p-4"></div>

${quizActions('triv', 'trivia-quiz')}
    </div>`,
    what: [
      'A ten-question round drawn from a pool of forty-eight, optionally narrowed to a single category. Questions are shuffled and sliced, so the ten in a round are always distinct. Each answer is marked the moment you pick it, with the correct one highlighted if you missed it, and the whole round is reviewed at the end.',
      'What this quiz deliberately is not: it is not a measure of intelligence, and it is not a timed challenge. Ten questions from a mixed pool tells you how you did on those ten, and the score will move by two or three points between rounds purely because the draw was different. Questions also avoid anything that expires — no current record holders, no population figures, no "tallest building" — because a quiz whose answers go stale is a quiz that quietly becomes wrong. If you want a comparable result, take the general knowledge paper instead, which is the same fifteen questions every time.'
    ],
    how: [
      'Choose a category, or leave it on **Everything** to draw from the whole pool of forty-eight.',
      'Press **Start a round**. Ten questions are shuffled out and the first one appears.',
      'Pick an answer. It is marked immediately — green for the right one, red if you missed it — and the correct answer is always shown.',
      'Work through to the end for a score, then read the review of every question or copy the round to send to somebody.'
    ],
    cases: [
      { t: 'A quick break', d: 'A round takes about two minutes and needs no setup, which makes it a decent thing to do while waiting for something.' },
      { t: 'Comparing with a friend', d: 'Both do a round and compare scores, with the caveat that the draws differ — which is itself worth knowing.' },
      { t: 'Testing a category', d: 'Filter to a single subject to find out where your gaps actually are rather than getting a mixed score.' },
      { t: 'A pub quiz warm-up', d: 'Read the questions out loud and let a table shout answers, using the tool purely as the question source.' }
    ],
    faqs: [
      { q: 'Are the questions the same every time?', a: 'No. Ten are shuffled out of a pool of forty-eight each round, so two rounds rarely overlap much. If you want a fixed paper that is comparable between people, the general knowledge quiz on this site is exactly that.' },
      { q: 'Is there a timer?', a: 'No, deliberately. The questions are written to be thought about rather than recalled at speed, and a countdown would turn a bit of fun into a stress test.' },
      { q: 'Does the score mean anything?', a: 'It means you got that many of those ten right. The score will move by a couple of points between rounds just because the draw changed, so it is not a stable measurement of anything.' },
      { q: 'How many questions are in the pool?', a: 'Forty-eight, spread across science, history, arts and music, sport, nature and technology. Facts are chosen to be settled and slow-moving, so nothing here goes out of date.' }
    ]
  },

  {
    slug: 'general-knowledge-quiz',
    name: 'General Knowledge Quiz',
    create: 'createGeneralKnowledgeQuiz',
    shared: true,
    title: 'General Knowledge Quiz — A Fixed 15-Question Paper | ToolStack AI',
    desc: 'Fifteen general knowledge questions, the same paper every time, marked at the end with an explanation for each answer. Free, no signup.',
    tagline:
      'The same fifteen questions in the same order for everybody, marked only at the end — so two people can take the same paper and compare properly.',
    widget: `${statusBar('gk')}
    <div id="gkIntro">
      <p class="text-sm text-gray-400 leading-relaxed">
        This is a paper rather than a round. The same fifteen questions, in the same order, every
        time. Nothing is marked until the end, and you can go back and change an answer — so the
        result is comparable between people in a way a shuffled quiz is not.
      </p>
      <p class="text-[11px] text-gray-500 leading-relaxed mt-3">
        Every question has an explanation in the review at the end, including several where the
        common wrong answer is more interesting than the right one.
      </p>
      <button id="gkStartBtn" type="button"
        class="mt-5 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold text-sm transition">
        Start the paper
      </button>
    </div>

    <div id="gkQuiz" class="hidden">
      <p id="gkProgress" class="text-[11px] text-gray-500 font-mono"></p>
      <div class="h-1.5 bg-gray-950 rounded-full overflow-hidden mt-3">
        <div id="gkBar" class="h-full bg-brand-500 transition-all duration-300" style="width:0%"></div>
      </div>

      <p id="gkQuestion" class="text-base font-bold text-gray-100 mt-6 leading-snug"></p>
      <div id="gkOptions" class="mt-4 space-y-2"></div>

      <div class="flex flex-wrap items-center gap-2 mt-5">
        <button id="gkPrevBtn" type="button"
          class="px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-brand-500 text-gray-200 font-semibold text-sm transition">
          Back
        </button>
        <button id="gkNextBtn" type="button"
          class="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold text-sm transition">
          Next
        </button>
      </div>
    </div>

    <div id="gkResults" class="hidden">
      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6 text-center">
        <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Your paper</p>
        <p id="gkScore" class="text-4xl font-black text-brand-400 mt-2"></p>
        <p id="gkBand" class="text-xs text-gray-400 mt-3 leading-relaxed"></p>
      </div>

      <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold mt-6 mb-2">The answers, with explanations</p>
      <div id="gkReview" class="bg-gray-950 border border-gray-800 rounded-2xl p-6"></div>

${quizActions('gk', 'general-knowledge-quiz')}
    </div>`,
    what: [
      'A fixed fifteen-question paper. The questions, and their order, are the same for everybody every time. Nothing is marked until you finish, you can move backwards and change an answer, and blank answers are allowed. At the end you get a score and a full review with an explanation for every question — including why the popular wrong answer is wrong.',
      'The fixed paper is the whole design, and it is the opposite of the trivia quiz on this site. A shuffled quiz gives you variety; a fixed paper gives you comparability. Two people can take this and genuinely argue about who did better, which is impossible when each attempt draws different questions. The trade is that you can only take it fresh once — after that you know the answers, and the explanations become the reason to come back rather than the score.'
    ],
    how: [
      'Press **Start the paper**. Question one appears; nothing is marked yet.',
      'Pick an answer and use **Next**, or **Back** to change your mind on an earlier one.',
      'You can move on without answering. A blank is recorded as blank and counted wrong, and the tool will tell you which questions you left before it scores you.',
      'Read the review. Each question shows your answer, the correct one, and a short explanation.'
    ],
    cases: [
      { t: 'Two people, one scoreboard', d: 'The fixed paper exists so that a comparison is fair. Take it, then hand the device over.' },
      { t: 'A family quiz night', d: 'Fifteen questions is about the right length for a table, and the explanations give people something to argue about afterwards.' },
      { t: 'Learning something', d: 'Several questions here are ones people get wrong for an interesting reason — the Australian capital, the smallest prime, the boiling point that moves with altitude.' },
      { t: 'A classroom warm-up', d: 'The paper format with a held-back result works well as a five-minute start to a lesson.' }
    ],
    faqs: [
      { q: 'Is this the same every time?', a: 'Yes. The same fifteen questions in the same order, for everybody. That is the point — it makes the score comparable between people, which a shuffled quiz cannot be.' },
      { q: 'Why is nothing marked until the end?', a: 'Because that is what makes it a paper. Marking as you go tells you how you are doing and changes how you answer the rest. Holding it back means the score reflects the fifteen answers you actually gave.' },
      { q: 'Can I leave a question blank?', a: 'Yes. Blanks count as wrong, but the tool tells you which questions you skipped before it scores you, so nothing is lost by accident. Recording "I do not know" is a legitimate answer to a quiz.' },
      { q: 'What is the difference between this and the trivia quiz?', a: 'The trivia quiz is ten shuffled questions from a pool of forty-eight, marked as you go, so every round is different. This is a fixed fifteen, marked at the end, so every attempt is the same. Different formats for different things — variety versus comparability.' }
    ]
  },

  {
    slug: 'geography-quiz',
    name: 'Geography Quiz',
    create: 'createGeographyQuiz',
    shared: true,
    title: 'Geography Quiz — 12 Rounds with a Regional Breakdown | ToolStack AI',
    desc: 'Twelve geography questions from a pool of forty-eight, with a breakdown by region at the end so you can see where your gaps are. Free, no signup.',
    tagline:
      'Twelve rounds from forty-eight questions, marked as you go, with a breakdown by region at the end — so you find out which part of the world you actually know.',
    widget: `${statusBar('geo')}
    <div id="geoIntro">
      <p class="text-sm text-gray-400 leading-relaxed">
        Twelve questions drawn from a pool of forty-eight, marked the moment you pick. At the end you
        get a breakdown by region — so rather than a single number, you find out that you are solid
        on Europe and shaky on Oceania.
      </p>
      <p class="text-[11px] text-gray-500 leading-relaxed mt-3">
        Capitals, rivers, mountain ranges and straits only. Nothing that changes with a census or an
        election.
      </p>
      <button id="geoStartBtn" type="button"
        class="mt-5 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold text-sm transition">
        Start a round
      </button>
    </div>

    <div id="geoQuiz" class="hidden">
      <p id="geoProgress" class="text-[11px] text-gray-500 font-mono"></p>
      <div class="h-1.5 bg-gray-950 rounded-full overflow-hidden mt-3">
        <div id="geoBar" class="h-full bg-brand-500 transition-all duration-300" style="width:0%"></div>
      </div>

      <p id="geoQuestion" class="text-base font-bold text-gray-100 mt-6 leading-snug"></p>
      <div id="geoOptions" class="mt-4 space-y-2"></div>
      <div id="geoFeedback" class="hidden mt-4 p-3 rounded-xl text-xs font-medium border"></div>

      <button id="geoNextBtn" type="button"
        class="hidden mt-4 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold text-sm transition">
        Next
      </button>
    </div>

    <div id="geoResults" class="hidden">
      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6 text-center">
        <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Your score</p>
        <p id="geoScore" class="text-4xl font-black text-brand-400 mt-2"></p>
        <p id="geoBand" class="text-xs text-gray-400 mt-3 leading-relaxed"></p>
      </div>

      <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold mt-6 mb-2">Where you stand, region by region</p>
      <div id="geoRegions" class="bg-gray-950 border border-gray-800 rounded-2xl p-4"></div>

      <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold mt-6 mb-2">Every question</p>
      <div id="geoReview" class="bg-gray-950 border border-gray-800 rounded-2xl p-4"></div>

${quizActions('geo', 'geography-quiz')}
    </div>`,
    what: [
      'Twelve geography questions from a pool of forty-eight, marked as you go. What separates this from a general quiz is the end: results are grouped by region, so you get a picture of where your knowledge is thin rather than a single number. Only regions that actually came up are reported, because a twelve-question draw will not touch all six and printing "Oceania: 0 of 0" would be noise pretending to be a result.',
      'The questions stick to things that do not move: capitals, rivers, mountain ranges, straits, oceans. Nothing that depends on a census, an election or a disputed border, because a quiz whose answers expire is worse than no quiz. Where a question has a famous trap — the largest desert is the obvious one — the feedback names the trap when you get it wrong, since being wrong for an interesting reason is the part worth learning from.'
    ],
    how: [
      'Press **Start a round**. Twelve questions are shuffled out of the pool and the first appears.',
      'Pick an answer. It is marked at once, and if you fell for a well-known trap the feedback says which one.',
      'Work through all twelve. There is no timer and no going back — the round moves forward only.',
      'Read the regional breakdown to see which parts of the world let you down, then the full review of every question.'
    ],
    cases: [
      { t: 'Finding your gaps', d: 'The regional breakdown is the reason to use this over a general quiz — it turns a score into something you can act on.' },
      { t: 'Revision', d: 'Take a few rounds and watch which region keeps appearing at the bottom.' },
      { t: 'A geography student', d: 'The physical geography questions — trenches, deserts, lines of latitude — are the ones that catch people out most often.' },
      { t: 'A table quiz', d: 'Read the questions out and let people shout, using the regional breakdown at the end to settle who actually knew the map.' }
    ],
    faqs: [
      { q: 'How does the regional breakdown work?', a: 'Every question is tagged with a region — Europe, Asia, Africa, the Americas, Oceania or physical geography. At the end, your answers are grouped by tag so you can see which areas you got right and which you did not.' },
      { q: 'Why do only some regions appear in my breakdown?', a: 'Because only twelve questions are drawn from forty-eight. A region that never came up has nothing to report, and showing it as "0 of 0" would be noise rather than a result.' },
      { q: 'Do the answers go out of date?', a: 'No. The pool sticks to capitals, rivers, mountain ranges, straits and oceans — nothing that changes with a census, an election or a border dispute.' },
      { q: 'What is the trap question?', a: 'The largest desert on Earth. Most people answer the Sahara, which is the largest hot desert, but a desert is defined by precipitation rather than temperature — so the answer is Antarctica. If you fall for it, the feedback tells you why.' }
    ]
  }
];

/**
 * Specs for the random-decision pages. Consumed by scripts/gen-fun-tools.mjs.
 *
 * All four set `shared: true` — they use the shared status controller and copy
 * helper from assets/tools/fun-shared.js.
 *
 * These four are the tools on this site most likely to be mistaken for
 * something they are not: a verdict, a forecast, a sign. Every one of them says
 * plainly that it is random, and two of them go further — yes-or-no counts how
 * many times you have asked, and should-i-do-it labels its confidence figure as
 * generated rather than measured. That is not decoration. A tool that produces
 * a number and lets somebody believe the number means something is a tool that
 * has lied to them.
 */

const statusBar = (p) => `    <div id="${p}Status" class="hidden mb-4 p-3 rounded-xl text-xs font-medium border"></div>`;

const neutralButton = (id, label) => `      <button id="${id}" type="button"
        class="px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-brand-500 text-gray-200 font-semibold text-sm transition">
        ${label}
      </button>`;

const greyButton = (id, label) => `      <button id="${id}" type="button"
        class="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm transition">
        ${label}
      </button>`;

const questionField = (id, placeholder) => `    <div>
      <label for="${id}" class="block text-xs text-gray-400 mb-1 font-mono">Your question (optional):</label>
      <input id="${id}" type="text" maxlength="120" placeholder="${placeholder}"
        class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-500" />
    </div>`;

export default [
  {
    slug: 'yes-or-no',
    name: 'Yes or No',
    create: 'createYesOrNo',
    shared: true,
    title: 'Yes or No — A Fair Coin for a Straight Answer | ToolStack AI',
    desc: 'Type a question, get a straight yes or no. It also counts how many times you have asked, which is usually the more useful number. Free, no signup.',
    tagline:
      'A straight yes or no, with no weighting and no leaning. It also counts how many times you have asked the same thing, which tends to be the honest part.',
    widget: `${statusBar('yn')}
${questionField('ynQuestion', 'Should I text them back?')}

    <div class="flex flex-wrap items-center gap-2 mt-5">
      <button id="ynAskBtn" type="button"
        class="px-7 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold text-sm transition">
        Ask
      </button>
${neutralButton('ynClearBtn', 'Clear')}
${neutralButton('ynCopyBtn', 'Copy the answer')}
    </div>

    <div id="ynResults" class="hidden mt-5 space-y-5">
      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-8 text-center">
        <p id="ynAnswer" class="text-5xl font-black tracking-tight"></p>
        <p id="ynMeta" class="text-[11px] text-gray-500 mt-4 leading-relaxed"></p>
      </div>

      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-4">
        <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-2">What you have asked</p>
        <div id="ynHistory" class="space-y-1"></div>
      </div>

      <div data-ts-result-actions="yes-or-no" class="space-y-4"></div>
    </div>`,
    what: [
      'A fair fifty-fifty, with one thing most versions of this tool leave out: a count of how many times you have asked the same question. Ask once and you get an answer. Ask four times and the page tells you that you have asked four times, that the answer has changed its mind, and that the fourth draw is no more informed than the first. Asking a yes-or-no question repeatedly is not research, it is a search for permission.',
      'There is no weighting, no "confidence" score, and no hidden lean towards yes. A coin that leans is a coin that lies, and the only reason to use a tool like this is that it genuinely does not care what you want. The other honest limitation is that it has no idea what you asked: the question is recorded so you can see it in the list, and it is never read, scored or interpreted.'
    ],
    how: [
      'Type your question if you want it recorded in the list below. It is optional — the tool cannot read it either way.',
      'Press **Ask**, or just press Enter in the field.',
      'Read the answer. Press Ask again for another independent draw, and watch the count above it climb.',
      'Press **Copy the answer** to paste the verdict, and the question, into a message.'
    ],
    cases: [
      { t: 'Two options, no difference', d: 'When both choices are genuinely fine, a coin is a perfectly good decision procedure and faster than deliberating.' },
      { t: 'Breaking a deadlock', d: 'In a group that has argued itself into a stalemate, an arbitrary answer is often the only way out.' },
      { t: 'Finding out what you wanted', d: 'Ask, notice your reaction to the answer, then decide. That reaction is the real information and the tool is just there to produce it.' },
      { t: 'Settling something trivial', d: 'Who pays, who drives, which film. Low stakes, immediate answer.' }
    ],
    faqs: [
      { q: 'Is it really fifty-fifty?', a: 'Yes. There is no weighting, no hidden preference for yes, and no memory of previous answers. Every draw is independent and even.' },
      { q: 'Why does it count how many times I have asked?', a: 'Because asking the same yes-or-no question four times is not a search for information, it is a search for permission. The count is the only part of this page that is not random, and it is usually the more useful number.' },
      { q: 'Does the tool read my question?', a: 'No. The question is stored in the page so the list below can show what you asked. Nothing is interpreted, scored, uploaded or looked at.' },
      { q: 'Can I use this to decide something important?', a: 'No, and the page will not help you do it. It is a fair coin. For anything that actually matters, the answer is a conversation with somebody who knows the situation, not a random number.' }
    ]
  },

  {
    slug: 'should-i-do-it',
    name: 'Should I Do It',
    create: 'createShouldIDoIt',
    shared: true,
    title: 'Should I Do It? — A Random Verdict (and Two Real Questions) | ToolStack AI',
    desc: 'A verdict on your dilemma, generated at random and labelled as such — plus two questions that genuinely do predict what you will decide. Free, no signup.',
    tagline:
      'A verdict, a reason, and a confidence figure that is labelled as generated rather than measured. Then two questions that are actually useful.',
    widget: `${statusBar('sidi')}
${questionField('sidiQuestion', 'Should I book the trip?')}

    <div class="flex flex-wrap items-center gap-2 mt-5">
      <button id="sidiAskBtn" type="button"
        class="px-7 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold text-sm transition">
        Give me a verdict
      </button>
${neutralButton('sidiClearBtn', 'Clear')}
${neutralButton('sidiCopyBtn', 'Copy the verdict')}
    </div>

    <p class="text-[10px] text-gray-500 mt-3 leading-relaxed">
      The verdict below is random. So is the percentage next to it. The page says so on the label,
      because a made-up number presented without one is the dishonest version of this tool.
    </p>

    <div id="sidiResults" class="hidden mt-5 space-y-5">
      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <p id="sidiVerdict" class="text-2xl font-black text-gray-100 leading-tight"></p>
        <p id="sidiReason" class="text-sm text-gray-400 mt-3 leading-relaxed"></p>

        <div class="mt-5 pt-5 border-t border-gray-800 flex items-center justify-between gap-4">
          <span class="text-[11px] text-gray-500">Confidence (generated at random, not measured)</span>
          <span id="sidiConfidence" class="text-xl font-black text-brand-400"></span>
        </div>

        <p id="sidiMeta" class="text-[11px] text-gray-500 mt-4 leading-relaxed"></p>
      </div>

      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold">The two questions that actually work</p>
        <div class="mt-4 space-y-4">
          <div>
            <p class="text-sm font-bold text-gray-200">1. Would you do it if nobody ever found out?</p>
            <p class="text-xs text-gray-500 mt-1 leading-relaxed">
              If the answer is no, you are deciding about an audience rather than about the thing
              itself. That is worth knowing before you decide anything.
            </p>
          </div>
          <div>
            <p class="text-sm font-bold text-gray-200">2. What would you tell a friend to do?</p>
            <p class="text-xs text-gray-500 mt-1 leading-relaxed">
              People are reliably better at other people’s decisions than their own. If your advice
              to a friend differs from your plan for yourself, the gap is the interesting part.
            </p>
          </div>
        </div>
      </div>

      <div data-ts-result-actions="should-i-do-it" class="space-y-4"></div>
    </div>`,
    what: [
      'A verdict generator for decisions you are stuck on. It gives you a verdict, a wry reason, and a confidence percentage — and it labels the percentage, in the interface rather than in small print, as generated at random rather than measured. Producing a number that looks like a probability and letting somebody believe it is the single most dishonest thing a tool like this could do, so the label is right there next to the number.',
      'Underneath the entertainment are two questions that genuinely do predict what people decide, and they are the reason this page is worth more than a coin. Whether you would do it if nobody found out tells you whether the decision is about the thing or about being seen doing it. What you would tell a friend tells you the answer you would give if you were not the one who had to live with it. Neither is a formula, but both are considerably better than a random verdict — and the page is explicit about which part is which.'
    ],
    how: [
      'Type the decision if you want it echoed back in the verdict summary. It is optional and is never interpreted.',
      'Press **Give me a verdict**, or press Enter in the field.',
      'Read the verdict, then read the label next to the percentage. Ask again and you will get a different verdict, because there is nothing behind it.',
      'Work through the two questions at the bottom. If your answer to either surprises you, that is the actual output of this page.'
    ],
    cases: [
      { t: 'A decision you keep circling', d: 'If you have been going back and forth for days, the problem is usually not a lack of information, and a random verdict is a legitimate way to break the loop.' },
      { t: 'Testing your own reaction', d: 'Ask, notice whether you are disappointed, and act on that instead. The reaction is real information; the verdict is not.' },
      { t: 'Two options, both fine', d: 'Sometimes there genuinely is no better answer, and treating it as a coin flip is the correct call.' },
      { t: 'Starting a conversation', d: 'Copy the verdict into a message to a friend if you want to explain why you are asking them about it.' }
    ],
    faqs: [
      { q: 'Is the confidence percentage real?', a: 'No, and the label says so right next to it. It is generated at random along with the verdict. Showing a number like that without the label would be the dishonest version of this tool, which is why the label is in the interface rather than in small print.' },
      { q: 'Will I get the same verdict if I ask twice?', a: 'Probably not. Each ask is an independent random draw from ten verdicts, so seeing the same one twice is just what happens with ten options.' },
      { q: 'Should I actually act on this?', a: 'No. Treat it as a prompt rather than advice. The two questions at the bottom of the page are the part that is worth acting on, and they are the part that does not involve a random number.' },
      { q: 'Does it read what I type?', a: 'No. The decision text is stored in the page so the copied summary can include it. Nothing is interpreted, scored or uploaded.' }
    ]
  },

  {
    slug: 'flip-a-coin',
    name: 'Flip a Coin',
    create: 'createFlipACoin',
    shared: true,
    title: 'Flip a Coin Online — With a Running Tally and Streak | ToolStack AI',
    desc: 'Flip a fair coin online, with running heads and tails counts, the current streak, and the last twenty results. Free, no signup, no ads in the way.',
    tagline:
      'A fair coin, plus the tally that makes it worth flipping more than once. The streak is the interesting number — runs of five look wrong and are not.',
    widget: `${statusBar('coin')}
    <div class="flex flex-wrap items-center gap-2">
      <button id="coinFlipBtn" type="button"
        class="px-7 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold text-sm transition">
        Flip the coin
      </button>
      <button id="coinBulkBtn" type="button"
        class="px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-brand-500 text-gray-200 font-semibold text-sm transition">
        Flip ten times
      </button>
${neutralButton('coinResetBtn', 'Reset the tally')}
${neutralButton('coinCopyBtn', 'Copy the result')}
    </div>

    <div id="coinResults" class="hidden mt-5 space-y-5">
      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-8 text-center">
        <p id="coinFace" class="text-5xl font-black tracking-tight"></p>
        <p id="coinStreak" class="text-[11px] text-gray-500 mt-3"></p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="bg-gray-950 border border-gray-800 rounded-2xl p-4 text-center">
          <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Heads</p>
          <p id="coinHeadsCount" class="text-3xl font-black text-brand-400 mt-1">0</p>
        </div>
        <div class="bg-gray-950 border border-gray-800 rounded-2xl p-4 text-center">
          <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Tails</p>
          <p id="coinTailsCount" class="text-3xl font-black text-gray-300 mt-1">0</p>
        </div>
      </div>

      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-4">
        <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-2">The last twenty</p>
        <div id="coinHistory"></div>
        <p id="coinMeta" class="text-[11px] text-gray-500 mt-3 leading-relaxed"></p>
      </div>

      <div data-ts-result-actions="flip-a-coin" class="space-y-4"></div>
    </div>`,
    what: [
      'A fair coin with a scoreboard. One press gives you heads or tails; the tally underneath keeps the running counts, the current streak, and the last twenty results as a row of chips. That tally is the reason to use this rather than a coin on a table: people are reliably bad at judging whether a sequence is random, and seeing five heads in a row in your own results is a far better demonstration of what randomness actually looks like than any explanation.',
      'Two honest limits. The flip is JavaScript’s Math.random(), which is a fair coin for a game and is not a source of cryptographic randomness — nobody is securing anything with a coin toss, but the page does not claim more than it has. And on a small number of flips the percentages swing wildly: ten flips landing 70% heads is not evidence of a biased coin, it is what ten flips look like. The tool says so rather than letting the number imply otherwise.'
    ],
    how: [
      'Press **Flip the coin** for a single result. The button locks for a moment while the animation runs, so a double-click cannot produce two flips.',
      'Watch the tally underneath. Heads and tails counts, the current streak, and the last twenty results all update together.',
      'Press **Flip ten times** if you want to see a distribution rather than a single result. Ten flips at once is where the tool gets interesting.',
      'Press **Copy the result** to paste the last flip and the session tally into a message.'
    ],
    cases: [
      { t: 'Settling an argument', d: 'One flip, one answer, and the tally means you can go again without losing track of what has already happened.' },
      { t: 'Demonstrating randomness', d: 'Flip ten at once and count the heads. Runs that look suspiciously long turn up far more often than people expect.' },
      { t: 'Deciding something arbitrary', d: 'Who goes first, who pays, which way to walk. Low stakes and immediate.' },
      { t: 'Teaching probability', d: 'The running percentage converging towards 50% over a few hundred flips is a decent demonstration, and the streaky path it takes to get there is the more interesting lesson.' }
    ],
    faqs: [
      { q: 'Is the coin fair?', a: 'Yes. It is a fifty-fifty draw with no weighting and no memory of previous flips. It is not cryptographic randomness, and it does not claim to be, but for a game it is a fair coin.' },
      { q: 'Why did I get five heads in a row?', a: 'Because that happens. Over twenty flips, a run of four or five in a row is unremarkable — people consistently underestimate how streaky real randomness is. The last twenty chips are shown so you can see the pattern rather than imagine it.' },
      { q: 'Does the tally persist if I reload?', a: 'No. Everything is held in the page, and reloading or closing the tab clears it. There is a Reset button if you want to clear it without reloading.' },
      { q: 'What does Flip ten times do?', a: 'It rolls ten independent flips at once and adds them all to the tally. It is the quickest way to see a distribution rather than a single result, and the summary line afterwards explains why ten is still a very small sample.' }
    ]
  },

  {
    slug: 'roll-a-dice',
    name: 'Roll a Dice',
    create: 'createRollADice',
    shared: true,
    title: 'Roll a Dice Online — 1 to 6 Dice, D4 to D20 | ToolStack AI',
    desc: 'Roll one to six dice with four, six, eight, ten, twelve or twenty sides. Each die is shown individually, with the total and a face-by-face breakdown.',
    tagline:
      'One to six dice, D4 through D20. Every die is shown on its own alongside the total — because a single number hides the part that is interesting.',
    widget: `${statusBar('dice')}
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label for="diceCount" class="block text-xs text-gray-400 mb-1 font-mono">How many dice:</label>
        <select id="diceCount"
          class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-brand-500">
          <option value="1">1 die</option>
          <option value="2" selected>2 dice</option>
          <option value="3">3 dice</option>
          <option value="4">4 dice</option>
          <option value="5">5 dice</option>
          <option value="6">6 dice</option>
        </select>
      </div>
      <div>
        <label for="diceSides" class="block text-xs text-gray-400 mb-1 font-mono">How many sides:</label>
        <select id="diceSides"
          class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-brand-500">
          <option value="4">D4 — four sides</option>
          <option value="6" selected>D6 — six sides</option>
          <option value="8">D8 — eight sides</option>
          <option value="10">D10 — ten sides</option>
          <option value="12">D12 — twelve sides</option>
          <option value="20">D20 — twenty sides</option>
        </select>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2 mt-5">
      <button id="diceRollBtn" type="button"
        class="px-7 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold text-sm transition">
        Roll
      </button>
${neutralButton('diceResetBtn', 'Clear')}
${neutralButton('diceCopyBtn', 'Copy the roll')}
    </div>

    <div id="diceResults" class="hidden mt-5 space-y-5">
      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-4">The dice</p>
        <div id="diceFaces" class="flex flex-wrap gap-2"></div>

        <div class="mt-5 pt-5 border-t border-gray-800 flex items-baseline justify-between">
          <span class="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Total</span>
          <span id="diceTotal" class="text-3xl font-black text-brand-400"></span>
        </div>
      </div>

      <div id="diceBreakdown" class="bg-gray-950 border border-gray-800 rounded-2xl p-4 space-y-1"></div>

      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-4">
        <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-2">Earlier rolls</p>
        <div id="diceHistory" class="space-y-1"></div>
        <p id="diceMeta" class="text-[11px] text-gray-500 mt-3 leading-relaxed"></p>
      </div>

      <div data-ts-result-actions="roll-a-dice" class="space-y-4"></div>
    </div>`,
    what: [
      'A dice roller covering one to six dice with four, six, eight, ten, twelve or twenty sides. Each die is displayed on its own rather than only as a total, and the breakdown underneath counts how many dice showed each face. That breakdown is what makes this more than a random number: rolling four six-sided dice and seeing that two of them came up 3 is a different experience from being handed the number 14.',
      'Each die is an independent draw, so the dice genuinely do not influence each other — this is what makes the totals bunch up in the middle of the range rather than spreading evenly across it. The page carries one piece of actual probability because it is the thing people most often get wrong: with two six-sided dice, 7 is six times more likely than 2 or 12. It is not cryptographic randomness and it does not claim to be. It is also not a substitute for real dice at a table, where the physical roll is half the point.'
    ],
    how: [
      'Pick how many dice, from one to six, and how many sides, from four to twenty. Two D6 is the default.',
      'Press **Roll**. Each die appears on its own, with the total underneath and a face-by-face breakdown below that.',
      'Roll again to build up a history of earlier rolls at the bottom, which shows each set alongside its notation.',
      'Press **Copy the roll** to paste the individual dice, the notation and the total into a message.'
    ],
    cases: [
      { t: 'Tabletop games', d: 'Everything from a D4 to a D20, with the individual dice shown so you can see what each one did.' },
      { t: 'Board games with lost dice', d: 'Two D6 covers most board games, and the breakdown settles any argument about what was actually rolled.' },
      { t: 'Teaching probability', d: 'Roll two D6 a dozen times and watch how rarely 2 and 12 come up compared to 7. The shape of the distribution is the lesson.' },
      { t: 'Picking at random', d: 'A single D20 is a convenient way to pick a number from 1 to 20 without a random number generator.' }
    ],
    faqs: [
      { q: 'Are the dice independent of each other?', a: 'Yes. Each die is a separate random draw, so no die influences any other. That is why totals bunch up in the middle of the range: with two D6 there is only one way to roll 2, but six different ways to roll 7.' },
      { q: 'Why is 7 more likely than 2?', a: 'Because there is one combination that makes 2 (1+1) and six that make 7 (1+6, 2+5, 3+4, 4+3, 5+2, 6+1). The middle of the range always has more ways to be reached than the ends.' },
      { q: 'What is the notation in the history?', a: 'It is standard dice notation: 2d6 means two six-sided dice, 4d20 means four twenty-sided dice. The history shows each set with its notation so you can see what was rolled and how.' },
      { q: 'Does the history persist?', a: 'No. It is held in the page and clears when you reload or close the tab. The Clear button empties it without a reload.' }
    ]
  }
];

/**
 * Specs for the party-game pages. Consumed by scripts/gen-fun-tools.mjs.
 *
 * All five set `shared: true`, which adds the fun-shared.js script tag ahead
 * of the tool module — they all use the shared draw tool, bag or row helpers.
 *
 * The safety copy is load-bearing on these pages rather than ornamental. Truth
 * or dare and never have I ever are the two tools on this site that a group
 * could use to pressure somebody, so both pages state plainly, in the visible
 * copy and in an FAQ answer, that skipping is expected rather than a forfeit.
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

/* Shown on the two tools where a group could lean on somebody to take part. */
const skipNote = `    <div class="mt-4 p-3 rounded-xl bg-gray-950 border border-gray-800">
      <p class="text-[11px] text-gray-500 leading-relaxed">
        <strong class="text-gray-300">Skipping is always allowed.</strong> Nobody has to answer
        anything or do anything they would rather not. Passing on a turn is part of the game, not a
        forfeit, and there is no scoring that punishes it.
      </p>
    </div>`;

export default [
  {
    slug: 'truth-or-dare',
    name: 'Truth or Dare Generator',
    create: 'createTruthOrDare',
    shared: true,
    title: 'Truth or Dare Generator — Clean & Bolder Decks | ToolStack AI',
    desc: 'Truth or dare prompts on demand, with a clean deck and a mildly bolder one. Free, no signup, and built so skipping a turn is always allowed.',
    tagline:
      'Sixty prompts across two decks. The clean deck is genuinely clean and loads first; the bolder one is mildly embarrassing rather than revealing. Both are skippable.',
    widget: `${statusBar('tod')}
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
${select('todDeck', 'Deck:', [['clean', 'Clean — family and mixed company'], ['bolder', 'Bolder — PG-13, mildly embarrassing'], ['all', 'Both decks']])}
${select('todType', 'Draw a:', [['any', 'Anything'], ['truth', 'Truths only'], ['dare', 'Dares only']])}
    </div>

${skipNote}

${drawButtons('tod', 'Draw a prompt')}

    <p class="text-[10px] text-gray-500 mt-3">Everything runs in your browser. Nothing is uploaded.</p>

${resultShell(
      'tod',
      'truth-or-dare',
      `      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <div class="flex items-start justify-between gap-4 mb-4">
          <p id="todKind" class="text-2xl font-black tracking-tight text-sky-400">TRUTH</p>
${copyButton('tod')}
        </div>
        <p id="todPrompt" class="text-lg font-bold text-gray-100 leading-snug"></p>
        <div class="mt-4 pt-4 border-t border-gray-800">
          <span id="todBadge" class="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Clean deck</span>
        </div>
      </div>

      <div id="todMeta" class="text-[11px] text-gray-500"></div>`
    )}`,
    what: [
      'A prompt generator for the classic party game. Sixty prompts across two decks, filtered by whether you want a truth or a dare, drawn from a shuffled bag so you do not see the same one twice until the pool runs out. The clean deck loads first and is the default.',
      'Two limitations worth stating. The first is the decks themselves: the bolder deck is PG-13 and stays there. It is mildly embarrassing rather than revealing — there is nothing sexual, nothing illegal, and nothing that asks a player to confess something that could damage a real relationship. The second is that a prompt generator cannot referee. The rules that keep this game fun are social ones, and the tool cannot enforce them, which is why the page keeps saying that skipping is fine. If your group is treating a skipped turn as a loss, the game has stopped being a game.'
    ],
    how: [
      'Pick a deck — clean, bolder, or both. Start with clean if there is any doubt about the room.',
      'Filter by **Truths only** or **Dares only** if you want a particular flavour, or leave it on Anything.',
      'Press **Draw a prompt** and read it out. The deck it came from is labelled on the card.',
      'Use **Copy** to paste the prompt into a group chat if you are playing remotely.'
    ],
    cases: [
      { t: 'Mixed company', d: 'The clean deck is the default for a reason — it works with family, colleagues and people you have just met.' },
      { t: 'A long-running group', d: 'The bolder deck is for the group that has already heard each other’s clean answers and wants something slightly less comfortable.' },
      { t: 'A remote game', d: 'Copy a prompt straight into a group chat and let people answer in text, which removes the performance anxiety entirely.' },
      { t: 'Filling a dead evening', d: 'Sixty prompts is enough to keep a group going well past the point where anybody intended to stop.' }
    ],
    faqs: [
      { q: 'Is the clean deck actually clean?', a: 'Yes. Nothing sexual, nothing about anyone’s body, nothing that asks for a confession that could hurt a real relationship, and nothing a parent would object to. It is the deck that loads by default.' },
      { q: 'What is in the bolder deck?', a: 'Mild social embarrassment rather than anything revealing — admitting to ghosting somebody, or to re-gifting a present. It is PG-13 and stays there. There is nothing sexual, illegal, or about anybody’s body.' },
      { q: 'Does anyone have to do the dare?', a: 'No, and the page says so twice. Skipping is part of the game rather than a forfeit, and nothing here scores you down for passing. A version of this game where somebody feels pressured has stopped being fun.' },
      { q: 'Can I play this remotely?', a: 'Yes. Press Copy and paste the prompt into a group chat. Truths work particularly well in text, where nobody has to perform an answer out loud.' }
    ]
  },

  {
    slug: 'never-have-i-ever',
    name: 'Never Have I Ever',
    create: 'createNeverHaveIEver',
    shared: true,
    title: 'Never Have I Ever — Statements & Tally | ToolStack AI',
    desc: 'Never have I ever statements with a running tally of how many people in the room have done it. Free, no signup, and nothing is stored after you close the tab.',
    tagline:
      'Thirty-six statements and a counter. Draw one, find out how many people in the room have actually done it, and watch the running log build up.',
    widget: `${statusBar('nhie')}
${select('nhieDeck', 'Deck:', [['clean', 'Clean — everyday embarrassments'], ['bolder', 'Bolder — mild social confessions'], ['all', 'Both decks']])}

${skipNote}

${drawButtons('nhie', 'Draw a statement')}

    <p class="text-[10px] text-gray-500 mt-3">The tally lives in the page and clears when you close the tab.</p>

${resultShell(
      'nhie',
      'never-have-i-ever',
      `      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <div class="flex items-start justify-between gap-4 mb-4">
          <span id="nhieBadge" class="px-3 py-1 rounded-full text-[11px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">Clean deck</span>
${copyButton('nhie')}
        </div>
        <p id="nhieStatement" class="text-lg font-bold text-gray-100 leading-snug"></p>
        <div id="nhieCounts" class="mt-5 pt-5 border-t border-gray-800"></div>
      </div>

      <div id="nhieMeta" class="text-[11px] text-gray-500"></div>

      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-4">
        <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-2">The running log</p>
        <div id="nhieLog" class="space-y-1"></div>
      </div>`
    )}`,
    what: [
      'A statement generator with a scorekeeper attached. The tool draws a never-have-I-ever statement, then asks how many people in the room have actually done it. Tap a number, and the statement and its count go into a running log so the group can see the pattern accumulate over an evening.',
      'The honest limitations are about what the tally is. It is not a survey and it is not anonymous — it is a count of hands in one room, and it means nothing outside it. It also cannot verify anything, and it would not want to: the game works because people answer honestly, and a tool that pressed for proof would ruin it. Finally, the counts live in memory only. Nothing is written to the device, so a shared tablet does not end up holding a record of what everyone admitted to.'
    ],
    how: [
      'Pick a deck. The clean deck is everyday embarrassments; the bolder deck is mild social confessions. Both are safe for a general room.',
      'Press **Draw a statement** and read it out loud.',
      'Ask how many people have done it, and tap the matching number. The statement joins the running log with its count.',
      'Draw again. Re-drawing a statement you have already counted restores its tally rather than resetting it, so nothing is lost.'
    ],
    cases: [
      { t: 'A group of old friends', d: 'The log gets genuinely interesting when you have known each other long enough for the counts to be high.' },
      { t: 'Meeting new people', d: 'The clean deck is entirely everyday stuff, which is a low-stakes way to find common ground.' },
      { t: 'A family evening', d: 'The clean deck has nothing in it that would be awkward across generations.' },
      { t: 'A long car journey', d: 'Play it without the counting if you are driving — the statements work as conversation prompts on their own.' }
    ],
    faqs: [
      { q: 'What happens to the tally?', a: 'It stays in the page and is gone when you close the tab. Nothing is written to the device, which matters if you are playing on a shared tablet or a family computer.' },
      { q: 'Is this anonymous?', a: 'No, and it does not pretend to be. The tally is a count of hands in the room, not a survey. It means nothing outside the people you are playing with.' },
      { q: 'Are the statements safe for any room?', a: 'The clean deck is. The bolder deck is mild social embarrassment rather than anything revealing, with nothing sexual, illegal or about anybody’s body. Both skip the group-targeting material entirely.' },
      { q: 'Do I have to answer?', a: 'No. Skipping a statement is always allowed and nothing here counts it against you. The tool never asks who specifically has done something — only how many, and only if people choose to say.' }
    ]
  },

  {
    slug: 'would-you-rather',
    name: 'Would You Rather',
    create: 'createWouldYouRather',
    shared: true,
    title: 'Would You Rather Questions — Live Vote Split | ToolStack AI',
    desc: 'Thirty-four would you rather questions with a live vote split. Pass the device round and watch the bar move. Free, no signup, nothing sent anywhere.',
    tagline:
      'Pass the device around and let everyone tap. The bar updates with each vote, so you see the split build in real time without anyone having to say anything out loud.',
    widget: `${statusBar('wyr')}
${select('wyrCategory', 'Category:', [['all', 'Anything'], ['food', 'Food and drink'], ['travel', 'Travel'], ['comfort', 'Everyday comfort'], ['work', 'Work'], ['absurd', 'Absurd'], ['social', 'Social']])}

${drawButtons('wyr', 'Next question')}

    <p class="text-[10px] text-gray-500 mt-3">Tap either option card to cast a vote. The tally resets when you close the tab.</p>

${resultShell(
      'wyr',
      'would-you-rather',
      `      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <div class="flex items-start justify-between gap-4 mb-5">
          <span id="wyrBadge" class="px-3 py-1 rounded-full text-[11px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">Food</span>
${copyButton('wyr')}
        </div>

        <div class="space-y-3">
          <button id="wyrOptionA" type="button"
            class="w-full text-left p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-brand-500 transition">
            <p class="text-sm font-bold text-gray-100 leading-snug"></p>
          </button>
          <button id="wyrOptionB" type="button"
            class="w-full text-left p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-brand-500 transition">
            <p class="text-sm font-bold text-gray-100 leading-snug"></p>
          </button>
        </div>

        <div class="mt-5 space-y-2">
          <div class="flex items-center justify-between text-[11px] text-gray-500">
            <span id="wyrCountA">0 votes</span>
            <span id="wyrCountB">0 votes</span>
          </div>
          <div class="h-2 bg-gray-900 rounded-full overflow-hidden flex">
            <div id="wyrBarA" class="h-full bg-brand-500 transition-all duration-300" style="width:50%"></div>
            <div id="wyrBarB" class="h-full bg-gray-700 transition-all duration-300" style="width:50%"></div>
          </div>
        </div>

        <p id="wyrTally" class="text-[11px] text-gray-500 mt-3"></p>
      </div>

      <div id="wyrMeta" class="text-[11px] text-gray-500"></div>`
    )}`,
    what: [
      'A would-you-rather generator with a vote counter built in. The device gets passed around, each person taps the option they would pick, and the bar updates as the votes arrive. Thirty-four questions across six categories, drawn from a shuffled bag so you do not repeat one until the category is exhausted.',
      'The limitation is that this is a room, not a poll. The percentages are the votes of the people currently holding the device, and they say nothing about anyone else. There is no server, no account and no aggregation across users — the tally lives in the page and vanishes when the tab closes. It is also a novelty rather than a personality instrument: picking the beach over the mountains tells you somebody likes the beach.'
    ],
    how: [
      'Choose a category, or leave it on **Anything** for the full set of thirty-four.',
      'Press **Next question** to draw a pair. Both options appear as cards.',
      'Pass the device. Each person taps the option they would pick, and the split updates immediately.',
      'Press **Next question** when everyone has voted. Going back to a question you have already used restores its tally.'
    ],
    cases: [
      { t: 'A party warm-up', d: 'Nobody has to speak, which makes it the least intimidating way to get a quiet room involved.' },
      { t: 'Long car journeys', d: 'The absurd category is written for exactly this, and the questions need no props or setup.' },
      { t: 'A family dinner', d: 'The food and comfort categories are entirely safe ground across generations.' },
      { t: 'Finding out about your friends', d: 'The split is usually more revealing than the answers, particularly when the group is evenly divided on something trivial.' }
    ],
    faqs: [
      { q: 'Where do the vote percentages come from?', a: 'Only from the people who tapped the device in this session. There is no server, no account and no cross-user data — the tally is in the page and disappears when you close the tab.' },
      { q: 'How many questions are there?', a: 'Thirty-four, spread across food, travel, everyday comfort, work, absurd and social. Questions are drawn from a shuffled bag, so a category will not repeat one until you have seen them all.' },
      { q: 'Do the votes persist if I reload?', a: 'No. Everything is held in memory, and closing or reloading the page clears the tally. That is deliberate — a shared device should not keep a record of how everyone voted.' },
      { q: 'Is this a personality test?', a: 'No. It is a set of either/or questions with a counter. Your answers describe some preferences and nothing else, and the page does not claim otherwise.' }
    ]
  },

  {
    slug: 'this-or-that',
    name: 'This or That',
    create: 'createThisOrThat',
    shared: true,
    title: 'This or That — Rapid Fire 12-Round Quiz | ToolStack AI',
    desc: 'Twelve rapid either/or rounds, then a summary of which way you leaned in each category. Free, no signup, and playable entirely with the keyboard.',
    tagline:
      'Twelve rounds, two seconds each, no going back. At the end you get a summary of which way you leaned, category by category.',
    widget: `${statusBar('tot')}
    <div id="totIntro">
      <p class="text-sm text-gray-400 leading-relaxed">
        Twelve rounds of either/or, drawn at random from a pool of thirty-six. Pick the one that
        sounds more like you, as fast as you can — the first answer is the honest one. There is no
        back button, because second-guessing is the opposite of the point.
      </p>
      <p class="text-[11px] text-gray-500 leading-relaxed mt-3">
        You can also press <strong class="text-gray-300">1</strong> and <strong class="text-gray-300">2</strong>
        on the keyboard instead of tapping.
      </p>
      <button id="totStartBtn" type="button"
        class="mt-5 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold text-sm transition">
        Start the run
      </button>
    </div>

    <div id="totQuiz" class="hidden">
      <p id="totProgress" class="text-[11px] text-gray-500 font-mono"></p>
      <div class="h-1.5 bg-gray-950 rounded-full overflow-hidden mt-3">
        <div id="totBar" class="h-full bg-brand-500 transition-all duration-300" style="width:0%"></div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
        <button id="totOptionA" type="button"
          class="p-6 rounded-xl bg-gray-950 border border-gray-800 hover:border-brand-500 hover:bg-gray-900 transition">
          <p class="text-base font-bold text-gray-100"></p>
        </button>
        <button id="totOptionB" type="button"
          class="p-6 rounded-xl bg-gray-950 border border-gray-800 hover:border-brand-500 hover:bg-gray-900 transition">
          <p class="text-base font-bold text-gray-100"></p>
        </button>
      </div>
    </div>

    <div id="totResults" class="hidden">
      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Your run</p>
        <p id="totSummary" class="text-sm text-gray-200 mt-2 leading-relaxed"></p>
        <div id="totProfile" class="mt-4 pt-4 border-t border-gray-800 space-y-1"></div>
      </div>

      <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold mt-6 mb-2">Every pick</p>
      <div id="totPicks" class="bg-gray-950 border border-gray-800 rounded-2xl p-4"></div>

      <div class="flex flex-wrap items-center gap-2 mt-5">
        <button id="totRestartBtn" type="button"
          class="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm transition">
          Run again
        </button>
        <button id="totCopyBtn" type="button"
          class="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm transition">
          Copy my picks
        </button>
      </div>

      <div data-ts-result-actions="this-or-that" class="space-y-4 mt-5"></div>
    </div>`,
    what: [
      'A rapid-fire either/or game. Each run pulls twelve pairs at random from a pool of thirty-six, and you pick a side of each with no going back and no time to deliberate. At the end you get a summary of how many first options you took, which way you leaned in each category that came up, and a list of every pick you made.',
      'The honest limitation is that this is twelve decisions about arbitrary preferences. The summary describes what you tapped — it is not a personality profile, and the page does not call it one. Categories you were never asked about are left out rather than reported as zero, because there is nothing to say about them. The run is also short by design: twelve rounds is enough to be fun and nowhere near enough to conclude anything about a person.'
    ],
    how: [
      'Press **Start the run**. Twelve pairs are drawn fresh, so no two runs are the same.',
      'Tap whichever option sounds more like you, or press **1** and **2** on the keyboard, which is much faster.',
      'Keep going. There is deliberately no back button — a first answer is more interesting than a considered one here.',
      'Read the summary at the end, or press **Copy my picks** to paste the whole run into a message.'
    ],
    cases: [
      { t: 'A quick break', d: 'A full run takes well under a minute, which makes it a good filler between other things.' },
      { t: 'Comparing with a friend', d: 'Both do a run and compare categories where you leaned differently — which is usually where the conversation is.' },
      { t: 'Keyboard on a laptop', d: 'The 1 and 2 shortcuts turn it into a genuine twelve-second sprint.' },
      { t: 'A group activity', d: 'Read the pairs out loud and let everyone shout, using the tool purely as the prompt source.' }
    ],
    faqs: [
      { q: 'Why is there no back button?', a: 'Because the format is a sprint. A first answer is more interesting than a deliberated one, and a back button turns a two-second decision into a two-minute one. The run-again button is there if it goes wrong.' },
      { q: 'Is this a personality test?', a: 'No. It is twelve either/or picks summarised by category. The summary describes what you tapped, and the page does not claim it means anything more than that.' },
      { q: 'Why do only some categories appear in my summary?', a: 'Because only twelve of thirty-six pairs are used in a run. A category you were never asked about has nothing to report, so it is left out rather than shown as zero.' },
      { q: 'Can I do it again for a different result?', a: 'Yes, and you will get different questions. The pairs are shuffled fresh each run and only twelve are used, so two runs rarely overlap much.' }
    ]
  },

  {
    slug: 'most-likely-to',
    name: 'Most Likely To',
    create: 'createMostLikelyTo',
    shared: true,
    title: 'Most Likely To — Party Game with Scoreboard | ToolStack AI',
    desc: 'Most likely to prompts with a running scoreboard for the evening. Draw a prompt, award it to somebody, and watch the board build. Free, no signup, nothing stored.',
    tagline:
      'Thirty prompts and a scoreboard that keeps count all evening. The tool never suggests a name — that part is the group’s job, and it is the whole game.',
    widget: `${statusBar('mlt')}
${select('mltCategory', 'Category:', [['all', 'Anything'], ['habits', 'Everyday habits'], ['chaos', 'Chaos'], ['success', 'Doing well'], ['social', 'Social'], ['absurd', 'Absurd']])}

    <div class="mt-4 p-3 rounded-xl bg-gray-950 border border-gray-800">
      <p class="text-[11px] text-gray-500 leading-relaxed">
        Point at somebody, then type their name. The scoreboard is a count of how often a name was
        typed this evening — it is not a ranking of anybody as a person, and the prompts are all
        things people can laugh at.
      </p>
    </div>

${drawButtons('mlt', 'Draw a prompt')}

${resultShell(
      'mlt',
      'most-likely-to',
      `      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <div class="flex items-start justify-between gap-4 mb-4">
          <span id="mltBadge" class="px-3 py-1 rounded-full text-[11px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">Chaos</span>
${copyButton('mlt')}
        </div>
        <p id="mltPrompt" class="text-lg font-bold text-gray-100 leading-snug"></p>

        <div class="flex flex-wrap items-center gap-2 mt-5 pt-5 border-t border-gray-800">
          <input id="mltNameInput" type="text" maxlength="24" placeholder="Who got it?"
            class="flex-1 min-w-[10rem] bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-500" />
          <button id="mltAwardBtn" type="button"
            class="px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm transition">
            Award
          </button>
        </div>
      </div>

      <div id="mltMeta" class="text-[11px] text-gray-500"></div>

      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-4">
        <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-2">The scoreboard</p>
        <div id="mltBoard" class="space-y-1"></div>
      </div>`
    )}`,
    what: [
      'A prompt generator with a scoreboard attached. The tool draws a most-likely-to prompt, the group points at somebody, and you type that name in. The board keeps count across the whole evening, so a pattern builds up over the session and there is something to argue about at the end.',
      'Two things it deliberately does not do. It never suggests a name — the tool has no idea who is in the room, and a game that volunteers a victim is a game that picks on somebody. And it keeps the board behind the draw, so the running tally is something you look at rather than something permanently on screen, which is the difference between a game and a pile-on. The prompts are all things a person can laugh at: chaotic, forgetful, over-prepared. None of them are about appearance, intelligence or money.'
    ],
    how: [
      'Pick a category, or leave it on **Anything** for all thirty prompts.',
      'Press **Draw a prompt** and read it out. Everyone points at once — that is the actual game.',
      'Type the name of whoever got the most fingers and press **Award**, or just press Enter.',
      'Keep going. The scoreboard at the bottom updates as you play, and it resets with the Clear button or when you close the tab.'
    ],
    cases: [
      { t: 'A big group', d: 'The pointing is the fun part and it needs no equipment beyond the prompt on a screen.' },
      { t: 'A long evening', d: 'Because the scoreboard accumulates, this one gets better the longer it runs.' },
      { t: 'A work social', d: 'The everyday-habits category is safe ground for colleagues — forgetfulness and lateness rather than anything personal.' },
      { t: 'Family', d: 'Every prompt is something a person can laugh at, and nothing targets anybody’s appearance or circumstances.' }
    ],
    faqs: [
      { q: 'Does the tool pick who the prompt is about?', a: 'No. It only draws the prompt. Deciding who it applies to is the group’s job, and that is the actual game. A tool that named somebody would just be picking on them.' },
      { q: 'Is the scoreboard a ranking of people?', a: 'No. It counts how often a name was typed this evening. It says nothing about anybody as a person, and it clears when you close the tab or press Clear.' },
      { q: 'Are the prompts ever mean?', a: 'No. They are all habits and behaviour a person can laugh at — being late, being chaotic, being over-prepared. Nothing about appearance, intelligence, money or anyone’s circumstances.' },
      { q: 'Is anything saved between sessions?', a: 'No. The board lives in the page and is gone when the tab closes. Nothing is uploaded and nothing is written to storage.' }
    ]
  }
];

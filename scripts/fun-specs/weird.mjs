/**
 * Specs for the weird and addictive pages. Consumed by scripts/gen-fun-tools.mjs.
 *
 * All five set `shared: true`.
 *
 * The one rule these pages share: everything they produce is invented, and the
 * pages say so where the output is, not only in a footer. The celebrity scandal
 * generator is the sharpest case — it uses two word lists combined at random and
 * every "scandal" is a non-event, because a generator that produced real
 * accusations about real people would be a defamation machine rather than a
 * joke. The billionaire page is written the same way: invented companies,
 * invented fortunes, and a net worth that is explicitly labelled as a random
 * number rather than an estimate of anything.
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

const field = (id, label) => `        <div>
          <p class="text-[10px] font-mono uppercase tracking-wide text-gray-500 mb-1">${label}</p>
          <p id="${id}" class="text-sm text-gray-200 leading-relaxed"></p>
        </div>`;

const textInput = (id, label, placeholder) => `    <div>
      <label for="${id}" class="block text-xs text-gray-400 mb-1 font-mono">${label}</label>
      <input id="${id}" type="text" autocomplete="off" placeholder="${placeholder}"
        class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-500" />
    </div>`;

export default [
  {
    slug: 'life-achievement-today',
    name: 'Life Achievement Today',
    create: 'createLifeAchievement',
    shared: true,
    title: 'Life Achievement Today — Unlock an Achievement for Your Day | ToolStack AI',
    desc: 'Get a game-style achievement for something ordinary you did today, with a score. Type what you did and it becomes the unlock condition. Free, no signup.',
    tagline:
      'Type something ordinary you did today and find out what it was worth in points. The scoring is deliberately unfair, which is the joke.',
    widget: `${statusBar('ach')}

${textInput('achInput', 'What did you do today? (optional):', 'emptied the dishwasher')}

    <p class="text-[11px] text-gray-500 mt-2 leading-relaxed">
      Optional. Type it in and it will be shown as the reason for the award. Leave it blank and the
      achievement is just for something you did.
    </p>

${drawButtons('ach', 'Unlock an achievement')}

${resultShell(
      'ach',
      'life-achievement-today',
      `      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <div class="flex items-start justify-between gap-4 mb-4">
          <p class="text-[10px] font-mono uppercase tracking-wide text-gray-500">Achievement unlocked</p>
          <span id="achBadge" class="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20"></span>
        </div>
        <p id="achTitle" class="text-2xl font-black tracking-tight text-gray-50 leading-tight"></p>
        <p id="achDesc" class="text-sm text-gray-300 leading-relaxed mt-3"></p>
        <p id="achScore" class="text-3xl font-black text-amber-400 mt-5"></p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
${copyButton('ach')}
      </div>

      <p id="achMeta" class="text-[10px] text-gray-500 leading-relaxed"></p>`
    )}`,
    what: [
      'Awards a game-style achievement for something ordinary. Twenty-seven achievements across five areas of life, drawn from a shuffled bag, each with a name, a description and a points value. If you type what you actually did, it is printed back as the unlock condition — the tool does not read or interpret the text, it just shows it, which is what makes the output feel like it is about your day rather than about a random line from a list.',
      'The **scoring is deliberately unfair**. "Watered the plant" is worth 20 and "declined a meeting" is worth 100; emptying the dishwasher before the next load is worth 35 and dealing with the drawer is worth 100. That is not a bug. Real achievement systems award points on the basis of how the designer felt about the task, and every one of them has a trivial achievement worth more than a difficult one. The unevenness is what makes it recognisable.'
    ],
    how: [
      'Type what you did, or leave the box empty. Both work — typing it just makes the result about your actual day.',
      'Press **Unlock an achievement**. A name, a description, a category and a points value appear.',
      'Press again for another. Achievements are drawn from a shuffled bag, so all of them come up before any repeat.',
      'Press **Copy** to take the whole unlock, or **Clear** to empty the box and reset the pool.'
    ],
    cases: [
      { t: 'End of a long day', d: 'Type the one thing you actually managed and get a points value for it. The number is meaningless and that is the point.' },
      { t: 'Group chats', d: 'Everybody types what they did and compares scores. The scoring is unfair enough to make this an argument.' },
      { t: 'Noticing the small things', d: 'A lot of the pool is about things nobody counts as achievements. That is the part people respond to.' },
      { t: 'Something to send somebody', d: 'Press it until you get one that fits a friend and send them the unlock.' }
    ],
    faqs: [
      { q: 'Is the points value meaningful?', a: 'No. It is a fixed number attached to each achievement and the amounts are deliberately uneven — several trivial achievements are worth more than genuinely difficult ones, which is how real achievement systems behave. The number is a joke about scoring, not a measurement of anything.' },
      { q: 'What happens to what I type?', a: 'It is printed back as the unlock condition and nothing else. It is not read, analysed, stored or sent anywhere, and it is gone when you close the page.' },
      { q: 'Why is the scoring so inconsistent?', a: 'Because that is what makes it funny. Dealt with the drawer: 100 points. Finished a meal you cooked: 70. The gap is the joke, and it is also true of almost every game you have played.' },
      { q: 'Can I get the same achievement twice?', a: 'Not until the pool is exhausted. Achievements are drawn from a shuffled bag, so all twenty-seven appear once before any of them come round again. Clear resets the bag.' }
    ]
  },

  {
    slug: 'celebrity-scandal-generator',
    name: 'Celebrity Scandal Generator',
    create: 'createCelebrityScandal',
    shared: true,
    title: 'Celebrity Scandal Generator — Invented Headlines | ToolStack AI',
    desc: 'Generate a tabloid headline about an entirely fictional celebrity, with an eyewitness line and a publicist statement. Free, no signup, nobody real.',
    tagline:
      'BREAKING: an invented person has been photographed queuing. Every name is assembled at random and every scandal is a non-event.',
    widget: `${statusBar('scan')}

    <div class="p-3 rounded-xl bg-gray-950 border border-gray-800">
      <p class="text-[11px] text-gray-500 leading-relaxed">
        <strong class="text-gray-300">Nobody real appears here.</strong> Names are assembled at
        random from two word lists, and every event is a non-event — queuing, holding a
        sandwich, wearing a coat. There is nothing in this tool that could be said about a real
        person, which is the only way a generator like this should work.
      </p>
    </div>

${drawButtons('scan', 'Break a story')}

${resultShell(
      'scan',
      'celebrity-scandal-generator',
      `      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <div class="flex items-start justify-between gap-4 mb-4">
          <p id="scanBadge" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20"></p>
        </div>
        <p id="scanHeadline" class="text-xl font-black tracking-tight text-gray-50 leading-tight"></p>
        <p id="scanDetail" class="text-sm text-gray-300 leading-relaxed mt-4"></p>
        <p id="scanStatement" class="text-sm text-gray-400 leading-relaxed mt-5 pt-4 border-t border-gray-800 italic"></p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
${copyButton('scan')}
      </div>

      <p id="scanMeta" class="text-[10px] text-gray-500 leading-relaxed"></p>`
    )}`,
    what: [
      'Builds a tabloid story in three parts: a headline, the eyewitness line that would run underneath it, and a statement from a representative. The names are assembled at random from a pool of first names and a pool of surnames, and the sixteen events are all **non-events** — being photographed queuing, holding a sandwich with two hands, wearing a coat, taking the train. Nothing in this tool can be said about a real person, because nothing in it describes anything a real person could be accused of.',
      'The comedy is in the **register**, not the content. Real tabloid coverage has a very specific cadence: the word BREAKING applied to nothing, an eyewitness who saw something completely ordinary, and a publicist statement that comments at length on having no comment. The statement lines are where most of the joke lives, and they are the part people quote back.'
    ],
    how: [
      'Press **Break a story**. A headline, a detail and a statement appear together.',
      'Press again. The event pool rotates through a shuffled bag, and the name is reassembled from the two lists each time.',
      'Press **Copy** to take the whole item, including a line making clear that everything in it is invented.',
      'Press **Clear** to empty the result and reset the pool.'
    ],
    cases: [
      { t: 'Sending something to a group chat', d: 'The headline and the statement together read as a complete bit, and the copy line makes the fictional nature explicit if you forward it.' },
      { t: 'Writing satire', d: 'The statement lines are usable as a model for the register, which is the hard part to get right.' },
      { t: 'Naming a fictional character', d: 'The two-list construction produces names that sound real without being anybody, which is useful for background characters.' },
      { t: 'Demonstrating how the format works', d: 'Applying the full tabloid cadence to a completely empty event shows how much of that coverage is register rather than content.' }
    ],
    faqs: [
      { q: 'Is any of this about a real person?', a: 'No. Names are assembled at random by combining a first name from one list with a surname from another, and every event is a deliberate non-event. There is no real person, real event or real statement anywhere in this tool, and nothing it produces could be mistaken for a claim about somebody who exists.' },
      { q: 'Can I use a real name with it?', a: 'The tool does not accept input at all, so there is no way to attach a real name to it. That is deliberate. A generator of accusations that accepted a name would be a defamation tool, and the interesting part of the joke is the register anyway.' },
      { q: 'Why are the scandals so boring?', a: 'Because the format is funnier applied to nothing. "BREAKING: a person has been photographed queuing" is a better joke about tabloid coverage than an invented serious accusation would be, and it cannot do any harm to anybody.' },
      { q: 'Does it store anything?', a: 'No. Everything is generated in the page and nothing is sent anywhere or saved.' }
    ]
  },

  {
    slug: 'billionaire-name',
    name: 'Billionaire Name Generator',
    create: 'createBillionaireName',
    shared: true,
    title: 'Billionaire Name Generator — Invented Fortunes & Advice | ToolStack AI',
    desc: 'Generate a fictional billionaire: a name, a net worth, where the money came from and a piece of advice. Every company and fortune is invented.',
    tagline:
      'A name, a fortune, an absurd backstory and a piece of business advice delivered with total confidence. All four are invented.',
    widget: `${statusBar('bil')}

    <p class="text-xs text-gray-400 leading-relaxed">
      A fortune, a backstory and a piece of advice. No real person, company or figure is described
      anywhere in this tool, and the net worth is a random number rather than an estimate of
      anything.
    </p>

${drawButtons('bil', 'Make a billionaire')}

${resultShell(
      'bil',
      'billionaire-name',
      `      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <div class="flex items-start justify-between gap-4 mb-4">
          <p id="bilName" class="text-2xl font-black tracking-tight text-gray-50 leading-tight"></p>
          <span id="bilBadge" class="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20"></span>
        </div>
        <p id="bilWorth" class="text-3xl font-black text-emerald-400 mb-5"></p>
${field('bilSource', 'Where it came from')}
        <p id="bilQuote" class="text-sm text-gray-300 leading-relaxed mt-5 pt-4 border-t border-gray-800"></p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
${copyButton('bil')}
      </div>

      <p id="bilMeta" class="text-[10px] text-gray-500 leading-relaxed"></p>`
    )}`,
    what: [
      'Produces a fictional fortune in four parts: a name assembled from two word lists, a net worth, a backstory and a piece of advice. Twelve backstories and fourteen quotes, all invented. The page states plainly that no real person or company is described and that the net worth is a randomly generated number rather than an estimate of anything — a figure like "$412 billion" attached to a name is exactly the kind of thing that gets screenshotted without its context.',
      'The **quote** is the part doing the work. Business advice from billionaires has a very specific shape: a banal observation delivered as a revelation, with just enough specificity to sound earned. Every line in the quote pool is written to that shape, and the backstories are deliberately absurd rather than plausible-sounding — vending machines, car parks, land with no roads on it — so that nothing reads as a claim about anybody who exists.'
    ],
    how: [
      'Press **Make a billionaire**. A name, a fortune, a backstory and a quote appear together.',
      'Press again. The backstory and quote pools each rotate through their own shuffled bag, and the name is reassembled each time.',
      'Read the quote last. It is the part people actually send to each other.',
      'Press **Copy** to take all four parts, or **Clear** to empty the result and reset the bags.'
    ],
    cases: [
      { t: 'Group chats', d: 'The quote is the shareable part. It is short enough to paste on its own.' },
      { t: 'Writing a parody', d: 'Fourteen quotes in one consistent register is a usable model for how this kind of advice is phrased.' },
      { t: 'Naming a fictional tycoon', d: 'The two-list name construction produces names that sound plausible without belonging to anybody.' },
      { t: 'Mock interviews', d: 'The backstory panel is written as an answer somebody would give in an interview and never fully explain.' }
    ],
    faqs: [
      { q: 'Is the net worth real?', a: 'No. It is a randomly generated number and the page says so under the result. It is not an estimate, an average, or a comparison with anybody. It is a large number chosen at random because the size of the number is the joke.' },
      { q: 'Are these real companies or people?', a: 'No. Every name, company and backstory is invented for this page. No real business, brand or billionaire is referenced or described anywhere in the tool.' },
      { q: 'Are the quotes real quotes?', a: 'No. All fourteen are written for this page. They are parodies of the register rather than quotations from anybody, and none of them should be attributed to a real person.' },
      { q: 'Can I use the output anywhere?', a: 'Yes, and the copy button adds a line making clear that the person, company and figure are all invented, so a forwarded result carries that with it.' }
    ]
  },

  {
    slug: 'secret-identity',
    name: 'Secret Identity Generator',
    create: 'createSecretIdentity',
    shared: true,
    title: 'Secret Identity Generator — Cover Name, Job & Tell | ToolStack AI',
    desc: 'Generate a cover identity: a name matched to your initial, an unremarkable job, a hideout and the tell that would give you away. Free, no signup.',
    tagline:
      'A cover name, a job nobody will ask about, a hideout, and the small habit that would give the whole thing away inside a week.',
    widget: `${statusBar('sid')}

${textInput('sidNameInput', 'Your name (optional):', 'type a name for a matching initial')}

    <p class="text-[11px] text-gray-500 mt-2 leading-relaxed">
      Optional, and it does one thing: the cover name is chosen to share your initial. That is the
      oldest trick in the genre, which is why it is worth pointing out that it would not survive a
      week.
    </p>

${drawButtons('sid', 'Build a cover')}

${resultShell(
      'sid',
      'secret-identity',
      `      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6 space-y-4">
        <p id="sidCover" class="text-2xl font-black tracking-tight text-gray-50 leading-tight"></p>
${field('sidJob', 'Cover occupation')}
${field('sidTell', 'The tell')}
${field('sidHideout', 'Hideout')}
      </div>

      <div class="flex flex-wrap items-center gap-2">
${copyButton('sid')}
      </div>

      <p id="sidMeta" class="text-[10px] text-gray-500 leading-relaxed"></p>`
    )}`,
    what: [
      'Builds a cover identity in four parts: a name, an occupation, a hideout and a tell. If you type your name, the cover name is chosen to **share its initial** — which is the oldest and worst tradecraft in the genre, and the reason the tool asks for a name at all. With nothing typed it draws one freely. That single rule is what turns the name pool into something that responds to you rather than a random picker.',
      'The jobs are all deliberately dull, because that is the only kind of cover that works: nobody remembers a person who services commercial refrigeration. The **tell** is the part that makes it a character rather than a form — it is the small habit that would betray the whole thing within a week, which is funnier and truer than a list of impressive spy skills. Every tell is mundane and observable: checking exits, flipping a pen, knowing a language the cover job would never require.'
    ],
    how: [
      'Type your name, or leave it blank. Typing it matches the cover name’s initial to yours.',
      'Press **Build a cover**. A name, an occupation, a tell and a hideout appear together.',
      'Press again for a different cover. The job, tell and hideout pools each rotate independently.',
      'Press **Copy** to take the whole identity, or **Clear** to empty the box and reset the pools.'
    ],
    cases: [
      { t: 'Writing a spy or thriller', d: 'Four parts in one press, and the tell is the part that makes the character work on the page.' },
      { t: 'Tabletop games', d: 'Generate a cover on the spot when a player needs one and you would rather not improvise a whole backstory.' },
      { t: 'Party icebreakers', d: 'Everyone builds one and reads out their tell. The tells are more revealing than the names.' },
      { t: 'Naming a fictional persona', d: 'The initial-matching rule gives you a name that feels deliberately chosen rather than random.' }
    ],
    faqs: [
      { q: 'What does typing my name change?', a: 'It makes the cover name start with the same letter as yours. That is the only effect. It is the classic fictional tradecraft move, and the tool points out that it would not survive a week of scrutiny.' },
      { q: 'Is my name stored or sent anywhere?', a: 'No. It is used in the page to pick an initial and is never uploaded, saved or logged. Closing or reloading the page discards it.' },
      { q: 'Why are the jobs so boring?', a: 'Because a cover job that is interesting is a cover job that gets remembered. Commercial flooring, industrial hand dryers and lift inspection are all chosen because nobody has ever asked a follow-up question about any of them.' },
      { q: 'Is any of this real tradecraft?', a: 'No. It is written for fiction and for fun. The initial-matching rule in particular is a well-known cliche rather than a technique, and the tells are jokes about character rather than advice about anything.' }
    ]
  },

  {
    slug: 'supervillain-plan',
    name: 'Supervillain Plan Generator',
    create: 'createSupervillainPlan',
    shared: true,
    title: 'Supervillain Plan Generator — Objective, Method & Fatal Flaw | ToolStack AI',
    desc: 'Generate a supervillain plan: a petty objective, an overcomplicated method, and the small flaw that will end it. Free, no signup, stakes kept tiny.',
    tagline:
      'An objective, a method, and the reason it will not work. The stakes are deliberately tiny and the flaw is always something administrative.',
    widget: `${statusBar('svp')}

    <p class="text-xs text-gray-400 leading-relaxed">
      Every objective here is petty and harmless — mild civic inconvenience, aesthetic crimes,
      administrative nuisance. The joke only works when the stakes are absurdly low.
    </p>

${drawButtons('svp', 'Draw up a plan')}

${resultShell(
      'svp',
      'supervillain-plan',
      `      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <div class="flex items-start justify-between gap-4 mb-4">
          <p class="text-[10px] font-mono uppercase tracking-wide text-gray-500">The plan</p>
          <span id="svpBadge" class="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20"></span>
        </div>
        <p id="svpGoal" class="text-lg font-bold text-gray-50 leading-snug"></p>
      </div>

      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6 space-y-4">
${field('svpMethod', 'Method')}
${field('svpFlaw', 'Fatal flaw')}
      </div>

      <div class="flex flex-wrap items-center gap-2">
${copyButton('svp')}
      </div>

      <p id="svpMeta" class="text-[10px] text-gray-500 leading-relaxed"></p>`
    )}`,
    what: [
      'Three parts: what the villain wants, how they intend to get it, and the small flaw that will end the whole thing. Fourteen objectives, twelve methods, twelve flaws, all drawn from separate bags so the method and the flaw are not matched to the objective or to each other.',
      'The **flaw** is the point. Every plan here fails for a reason that has nothing to do with a hero — a subscription nobody checked, a committee that has not agreed on anything since 1998, a door that only opens from the other side, a landlord inspection in three weeks. That is how the format actually works: the interesting part of a villain is never the scheme, it is the personality defect that makes the scheme collapse. Every objective is also **petty and harmless** — making every lift announce the floor dramatically, moving every road sign two metres to the left — because the joke needs the stakes to be as low as possible.'
    ],
    how: [
      'Press **Draw up a plan**. An objective, a method and a fatal flaw appear together.',
      'Press again for a different combination. The method and flaw pools each rotate through their own shuffled bags.',
      'Read the flaw last. It is the punchline, and the meta line underneath explains how the pools relate.',
      'Press **Copy** to take all three parts, or **Clear** to empty the result and reset the bags.'
    ],
    cases: [
      { t: 'Writing a comedy villain', d: 'A petty objective plus an administrative flaw is a complete comic antagonist in three lines.' },
      { t: 'Tabletop games', d: 'Generate the plan the players are trying to stop, and let them discover the flaw rather than fight the scheme.' },
      { t: 'Group chats', d: 'The objectives are the shareable part. Most of them describe something somebody in the chat has already complained about.' },
      { t: 'Writing prompts', d: 'Take the objective and the flaw and write the scene where the villain explains the plan and somebody points out the problem.' }
    ],
    faqs: [
      { q: 'Are any of these plans actually harmful?', a: 'No, and deliberately so. Every objective is petty civic or aesthetic inconvenience — lifts that announce floors dramatically, bread that does not fit in a toaster, hold messages replaced with silence. Nothing here describes violence, anything aimed at a group of people, or any act that would hurt somebody. The joke requires the stakes to be tiny.' },
      { q: 'Why do the plans always fail?', a: 'Because that is the format. The flaws are administrative rather than heroic — an unchecked subscription, a committee that never agrees, a landlord inspection — because a villain undone by their own paperwork is funnier and more true to the genre than one undone by a punch.' },
      { q: 'Are the method and the flaw matched to the objective?', a: 'No. All three come from separate pools. A method about shell companies attached to an objective about supermarket music is better than a tidy set, and the mismatch is deliberate.' },
      { q: 'Does this reference any real villain or franchise?', a: 'No. Every objective, method and flaw is invented for this page. There are no real people, organisations or existing characters anywhere in the pools.' }
    ]
  }
];

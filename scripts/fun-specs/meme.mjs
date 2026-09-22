/**
 * Specs for the meme and social pages. Consumed by scripts/gen-fun-tools.mjs.
 *
 * All five set `shared: true`.
 *
 * The select option values here are a contract with the modules in
 * assets/tools/ — the draw tool matches them against each item's `c` field via
 * `filterKey`, so a value that does not exist in the pool produces an empty bag
 * and a "nothing matches" message rather than an error. They are checked
 * against the modules rather than guessed.
 *
 * One thing these pages have in common: none of them produces an image, and
 * none of them pretends to. The caption tools produce words, the idea tool
 * produces a structure, and the copy says so on the page rather than leaving
 * somebody to press the button and find out.
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

const field = (id, label) => `        <div>
          <p class="text-[10px] font-mono uppercase tracking-wide text-gray-500 mb-1">${label}</p>
          <p id="${id}" class="text-sm text-gray-200 leading-relaxed"></p>
        </div>`;

/* Every meme and social page carries this, because every one of them is a text
 * tool and a reader who expects an image should find that out before pressing
 * the button rather than after. */
const textOnlyNote = `    <div class="mt-4 p-3 rounded-xl bg-gray-950 border border-gray-800">
      <p class="text-[11px] text-gray-500 leading-relaxed">
        <strong class="text-gray-300">Words only.</strong> This tool writes the words. It does not
        make an image, find one, or upload anything — you take the text and put it wherever you
        were going to put it.
      </p>
    </div>`;

export default [
  {
    slug: 'meme-caption-generator',
    name: 'Meme Caption Generator',
    create: 'createMemeCaption',
    shared: true,
    title: 'Meme Caption Generator — Top and Bottom Lines | ToolStack AI',
    desc: 'Generate a meme caption with a described image, a top line and a bottom line, across five tones. Words only, free, and no signup.',
    tagline:
      'A described image, a top line and a bottom line. Five tones, and the image is drawn from its own pool so the picture and the words are never paired.',
    widget: `${statusBar('mem')}

${select('memTone', 'Tone:', [
      ['classic', 'Classic — the standard format'],
      ['wholesome', 'Wholesome — nothing mean in it'],
      ['chaotic', 'Chaotic — no plan, no regrets'],
      ['work', 'Work — meetings and inboxes'],
      ['relatable', 'Relatable — too close to home']
    ])}

${textOnlyNote}

${drawButtons('mem', 'Generate a caption')}

${resultShell(
      'mem',
      'meme-caption-generator',
      `      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <div class="flex items-start justify-between gap-4 mb-5">
          <p class="text-[10px] font-mono uppercase tracking-wide text-gray-500">The picture</p>
          <span id="memBadge" class="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20"></span>
        </div>
        <p id="memFormat" class="text-sm text-gray-300 leading-relaxed italic mb-6"></p>

        <div class="rounded-xl bg-gray-900 border border-gray-800 p-5 text-center space-y-3">
          <p id="memTop" class="text-base font-black tracking-tight text-gray-50 uppercase"></p>
          <p id="memBottom" class="text-base font-black tracking-tight text-gray-50 uppercase"></p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
${copyButton('mem')}
      </div>

      <p id="memMeta" class="text-[10px] text-gray-500 leading-relaxed"></p>`
    )}`,
    what: [
      'Three parts, from three separate pools: a described image, a top line and a bottom line. The image pool has no tone and is drawn independently, so the picture and the words are regularly mismatched — which is deliberate, because the mismatch is often the joke. The two line pools are matched to each other by tone, so the top and bottom at least belong to the same register.',
      'The images are **described rather than supplied**. Every one is a sentence describing a photograph — a cat on a keyboard, a person holding a phone at arm’s length — so the output is usable with whatever picture you actually have, and no image is ever downloaded, generated or stored. The page says this in the widget rather than in the small print, because pressing a button labelled "generate a meme" and getting text is a surprise worth preventing.'
    ],
    how: [
      'Choose a **tone**. The top and bottom lines are drawn from that tone’s pools; the image is tone-independent.',
      'Press **Generate a caption**. The image description, top line and bottom line appear together.',
      'Press again for a new set. The image bag and the two line bags each track their own repeats, so nothing comes back immediately.',
      'Press **Copy** to take the whole caption, or **Clear** to empty the pools and start the rotation again.'
    ],
    cases: [
      { t: 'Captioning a photo you already have', d: 'Take the described image as a prompt for what kind of picture would work, and use the lines on the one you have.' },
      { t: 'Group chats', d: 'The classic and relatable tones are written for this. Both are short enough to paste directly.' },
      { t: 'Work channels', d: 'The work tone is specific rather than generic — it uses the actual phrases, which is what makes it land.' },
      { t: 'Breaking a blank page', d: 'If you know the picture you want to caption but not the words, the bottom line pool is usually the fastest way in.' }
    ],
    faqs: [
      { q: 'Does this make an image?', a: 'No. It writes text and describes a picture in words. There is no image generation, no image search and no upload. You take the caption and use it with a photo you already have.' },
      { q: 'Why is the described picture unrelated to the caption?', a: 'Because the image pool is drawn separately from the line pools and has no tone attached. The mismatch is intentional — a caption about a meeting over a picture of a pigeon is a better prompt than a tidy match.' },
      { q: 'Is any of this taken from real memes?', a: 'No. The image descriptions and the lines are all written for this page. There are no named templates, no real people and no brands anywhere in the pools.' },
      { q: 'Can I use the captions commercially?', a: 'Yes. The output is yours and there is no attribution requirement. The pictures you pair it with are your responsibility, as they always were.' }
    ]
  },

  {
    slug: 'meme-idea-generator',
    name: 'Meme Idea Generator',
    create: 'createMemeIdea',
    shared: true,
    title: 'Meme Idea Generator — Concept, Structure & Why It Works | ToolStack AI',
    desc: 'Generate a meme idea with a suggested structure and a note on why the joke works. Twenty-four ideas across six settings, free and no signup.',
    tagline:
      'An idea, a structure for it, and an explanation of which part is doing the work. The third part is the reason this is not just a caption generator.',
    widget: `${statusBar('mid')}

${select('midCategory', 'Setting:', [
      ['all', 'All settings'],
      ['everyday', 'Everyday'],
      ['work', 'Work'],
      ['chats', 'Group chats'],
      ['weekend', 'Weekends'],
      ['food', 'Food'],
      ['technology', 'Technology']
    ])}

${textOnlyNote}

${drawButtons('mid', 'Generate an idea')}

${resultShell(
      'mid',
      'meme-idea-generator',
      `      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <div class="flex items-start justify-between gap-4 mb-4">
          <p class="text-[10px] font-mono uppercase tracking-wide text-gray-500">The idea</p>
          <span id="midBadge" class="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20"></span>
        </div>
        <p id="midIdea" class="text-base font-semibold text-gray-100 leading-relaxed"></p>
      </div>

      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6 space-y-4">
${field('midFormat', 'Suggested structure')}
${field('midWhy', 'Why it works')}
      </div>

      <div class="flex flex-wrap items-center gap-2">
${copyButton('mid')}
      </div>

      <p id="midMeta" class="text-[10px] text-gray-500 leading-relaxed"></p>`
    )}`,
    what: [
      'An idea, a structure to build it with, and a note on why the joke works. The third part is what makes this a different tool from the caption generator next door. A caption generator hands you words; this hands you the shape of a joke and tells you which part of it is carrying the weight — which is the part people actually get stuck on. If you have ever had a funny observation and no idea how to turn it into something, the middle panel is the answer.',
      'The structures are described **generically** — two-panel comparison, expectation versus reality, escalating list, one image with one caption — rather than by the names of specific templates. Named templates go in and out of fashion and a lot of them are somebody else’s artwork, so describing the shape is both more durable and more useful: you can build it with whatever you already have.'
    ],
    how: [
      'Pick a **setting**, or leave it on all settings to draw from everything.',
      'Press **Generate an idea**. The concept appears with a structure and an explanation underneath it.',
      'Read the third panel first if you are stuck. It names the specific thing that has to be true for the joke to land.',
      'Press **Copy** to take all three parts, or **Clear** to reset the pools and the filter.'
    ],
    cases: [
      { t: 'Turning an observation into a joke', d: 'You have the funny thing. The structure panel is how you find out what shape it needs to be.' },
      { t: 'Learning the format', d: 'The explanations are the useful part if you want to write these yourself rather than generate them.' },
      { t: 'Content planning', d: 'Six settings, four ideas each, with a structure attached to every one — usable as a short backlog.' },
      { t: 'Writing practice', d: 'Take the idea and the structure, then write the thing without using any of the generated words.' }
    ],
    faqs: [
      { q: 'How is this different from the meme caption generator?', a: 'The caption generator gives you finished words. This gives you an idea, a structure and an explanation of why it works, so you write the words yourself. If you want something to paste, use the caption generator; if you want to build something, use this.' },
      { q: 'Are these based on real meme templates?', a: 'No. The structures are described in plain terms — two-panel comparison, expectation versus reality, escalating list — rather than named after specific templates. That avoids using anybody’s artwork and makes the ideas usable with whatever format is current.' },
      { q: 'Does it make images?', a: 'No. It produces text only. There is no image generation and nothing is uploaded.' },
      { q: 'Can I filter by setting?', a: 'Yes. The dropdown narrows the pool to everyday, work, group chats, weekends, food or technology, or leaves it on all settings. Changing the filter resets the rotation for that pool.' }
    ]
  },

  {
    slug: 'pov-generator',
    name: 'POV Generator',
    create: 'createPov',
    shared: true,
    title: 'POV Generator — Short POV Lines by Setting | ToolStack AI',
    desc: 'Generate short POV lines for captions, videos and posts. Forty lines across five settings, with a category filter. Free, no signup, no images.',
    tagline:
      'Forty short POV lines across five settings. Every one is a situation rather than a feeling, which is the only rule the format has.',
    widget: `${statusBar('pov')}

${select('povCategory', 'Setting:', [
      ['all', 'All settings'],
      ['everyday', 'Everyday'],
      ['work', 'Work'],
      ['social', 'Social'],
      ['home', 'At home'],
      ['absurd', 'Absurd']
    ])}

${drawButtons('pov', 'Generate a POV')}

${resultShell(
      'pov',
      'pov-generator',
      `      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <div class="flex items-start justify-between gap-4 mb-4">
          <p class="text-[10px] font-mono uppercase tracking-wide text-gray-500">Caption</p>
          <span id="povBadge" class="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20"></span>
        </div>
        <p id="povLine" class="text-lg font-bold text-gray-100 leading-snug"></p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
${copyButton('pov')}
      </div>

      <p id="povMeta" class="text-[10px] text-gray-500 leading-relaxed"></p>`
    )}`,
    what: [
      'Short lines in the "POV:" format, filtered by setting. The format has exactly one rule that separates a good one from a bad one: the second half has to be a **situation**, not a feeling. "POV: you are happy" is not a POV, it is a mood label. "POV: you are the third person to be told the same piece of news" is a POV, because it puts the reader somewhere specific. Every line in the pool follows the second pattern, which is why they are longer and more particular than the ones you usually see.',
      'Five settings, forty lines, and a filter. The absurd setting is there because the format takes itself very seriously and that is funny on its own — a line about being the person the group has decided will hold the map works because it is completely ordinary and completely specific.'
    ],
    how: [
      'Choose a **setting**, or leave it on all settings.',
      'Press **Generate a POV**. The line appears with its setting shown above it.',
      'Press again for another. Lines are drawn from a shuffled bag within the current filter, so all of them come up before any repeat.',
      'Press **Copy** to take the line, or **Clear** to empty the result and reset the filter.'
    ],
    cases: [
      { t: 'Video captions', d: 'Short enough to sit on screen for two seconds, which is roughly what the format allows.' },
      { t: 'Post text', d: 'The line works as the whole post. There is nothing to add to it.' },
      { t: 'Photo captions', d: 'Generated independently of any image, so it works with whatever picture you have.' },
      { t: 'Writing prompts', d: 'Each line is a scene with a person in a specific position. Take one and write the next thirty seconds.' }
    ],
    faqs: [
      { q: 'What makes a good POV line?', a: 'Specificity. The second half has to put the reader in a situation rather than describe a feeling. If it could apply to anybody at any time, it is too general to land. Every line in this pool is written to a particular moment.' },
      { q: 'Does this generate video or images?', a: 'No. It produces one line of text. There is no video, no image and no upload.' },
      { q: 'What are the settings?', a: 'Everyday, work, social, at home and absurd. The filter narrows the pool, and changing it resets the rotation so you start that setting from the beginning.' },
      { q: 'Can I use these in my own posts?', a: 'Yes. The lines are written for this page and the output is yours to use, with no attribution required.' }
    ]
  },

  {
    slug: 'reaction-caption-generator',
    name: 'Reaction Caption Generator',
    create: 'createReactionCaption',
    shared: true,
    title: 'Reaction Caption Generator — Described Reactions & Lines | ToolStack AI',
    desc: 'Generate a described reaction image with a short caption, across five tones. Words only, free, no signup, nothing uploaded.',
    tagline:
      'A described reaction and a single caption line. Five tones, drawn separately — so the image and the words are never matched to each other.',
    widget: `${statusBar('rea')}

${select('reaTone', 'Tone:', [
      ['deadpan', 'Deadpan'],
      ['hype', 'Hype'],
      ['defeated', 'Defeated'],
      ['warm', 'Warm'],
      ['chaotic', 'Chaotic']
    ])}

${textOnlyNote}

${drawButtons('rea', 'Generate a reaction')}

${resultShell(
      'rea',
      'reaction-caption-generator',
      `      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <div class="flex items-start justify-between gap-4 mb-4">
          <p class="text-[10px] font-mono uppercase tracking-wide text-gray-500">The reaction</p>
          <span id="reaBadge" class="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20"></span>
        </div>
        <p id="reaReaction" class="text-sm text-gray-300 leading-relaxed italic mb-5"></p>
        <p id="reaCaption" class="text-xl font-black tracking-tight text-gray-50"></p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
${copyButton('rea')}
      </div>

      <p id="reaMeta" class="text-[10px] text-gray-500 leading-relaxed"></p>`
    )}`,
    what: [
      'A described reaction image and a single caption line. The difference from the meme caption generator next door is the shape of the output: that one builds a two-line top-and-bottom meme, whereas this is one reaction and one line — the format you use when somebody says something and you need to respond with a picture and three words. Both pools are drawn separately, so the reaction and the caption are not matched to each other, and the resulting mismatch is usually better than a tidy pair.',
      'The reactions are **described rather than supplied**, so the output works with whatever image you actually have. Five tones cover the useful registers: deadpan for the flat response, hype for genuine enthusiasm, defeated for the specific tiredness of a long week, warm for the ones with no edge on them, and chaotic for everything else.'
    ],
    how: [
      'Choose a **tone**. The caption is drawn from that tone’s pool; the reactions are tone-independent.',
      'Press **Generate a reaction**. The described reaction and the caption appear together.',
      'Press again for a new pair. Both pools rotate through their contents before repeating anything.',
      'Press **Copy** to take the reaction and the caption, or **Clear** to reset the pools.'
    ],
    cases: [
      { t: 'Replying to a message', d: 'One line and a described picture is the whole reply. Short enough to be a reaction rather than a response.' },
      { t: 'Group chats', d: 'The deadpan and chaotic tones are built for this. Neither is mean.' },
      { t: 'Choosing what to post', d: 'The described reaction tells you what kind of image would work, which is useful when you have the line but not the picture.' },
      { t: 'Finding the right register', d: 'If you know the feeling and not the words, cycling the five tones is faster than trying to write it.' }
    ],
    faqs: [
      { q: 'Does this create the image?', a: 'No. It describes a reaction in words and gives you a caption line. No image is generated, searched for or uploaded. You pair the text with a picture you already have.' },
      { q: 'Why do the reaction and the caption not match?', a: 'They come from separate pools and are not paired. A deadpan caption on an enthusiastic reaction is often funnier than a matched set, and the mismatch gives you more to work with.' },
      { q: 'What are the tones?', a: 'Deadpan, hype, defeated, warm and chaotic. Each has its own caption pool. The reactions themselves have no tone, so any reaction can come up with any tone.' },
      { q: 'Is anything stored?', a: 'No. Everything happens in the page. There is no account, no history and nothing is sent anywhere.' }
    ]
  },

  {
    slug: 'funny-status-generator',
    name: 'Funny Status Generator',
    create: 'createFunnyStatus',
    shared: true,
    title: 'Funny Status Generator — Short Lines With Character Count | ToolStack AI',
    desc: 'Generate a short funny status line by mood, with a live character count so you know whether it will fit before you paste it. Free, no signup.',
    tagline:
      'Thirty-six short status lines across six moods, each with a character count — because most status fields truncate and finding that out after pasting is annoying.',
    widget: `${statusBar('stat')}

${select('statVibe', 'Mood:', [
      ['all', 'All moods'],
      ['calm', 'Calm'],
      ['busy', 'Busy'],
      ['chaotic', 'Chaotic'],
      ['wholesome', 'Wholesome'],
      ['unbothered', 'Unbothered'],
      ['work', 'Work']
    ])}

${drawButtons('stat', 'Generate a status')}

${resultShell(
      'stat',
      'funny-status-generator',
      `      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <div class="flex items-start justify-between gap-4 mb-4">
          <p class="text-[10px] font-mono uppercase tracking-wide text-gray-500">Status</p>
          <span id="statBadge" class="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20"></span>
        </div>
        <p id="statLine" class="text-xl font-black tracking-tight text-gray-50 leading-snug"></p>
        <p id="statCount" class="text-[11px] text-gray-500 mt-3"></p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
${copyButton('stat')}
      </div>

      <p id="statMeta" class="text-[10px] text-gray-500 leading-relaxed"></p>`
    )}`,
    what: [
      'Short lines for a status field, filtered by mood. The character count underneath is the part that earns its place: most status fields have a hard limit somewhere between 60 and 140 characters, and a generator that hands you a line without telling you it will be cut off mid-word is worse than no generator at all. Anything over 60 characters is flagged in amber with a note, so you can see it before you paste it rather than after.',
      'Six moods, thirty-six lines, all of them short by construction. The lines are written as statuses rather than as jokes — a status sits under your name for days, so the ones that work are the ones that read as something a person would actually write about themselves.'
    ],
    how: [
      'Choose a **mood**, or leave it on all moods.',
      'Press **Generate a status**. The line appears with its mood badge and its character count.',
      'Check the count. If it is amber, the line is longer than most status fields allow and will probably be truncated.',
      'Press **Copy** to take the line, or **Clear** to empty the result and reset the filter.'
    ],
    cases: [
      { t: 'Work chat statuses', d: 'The work mood is written for exactly this — short, plausible, and not a complaint about your employer.' },
      { t: 'Away messages', d: 'Calm and busy are the two that read correctly as an away status rather than as a joke.' },
      { t: 'Profile bios', d: 'Check the count first. Bios are usually the strictest limit of the lot.' },
      { t: 'Group chat names', d: 'The short ones work as chat titles, which is a use the format did not anticipate but handles fine.' }
    ],
    faqs: [
      { q: 'What is the character count for?', a: 'Most status fields have a hard limit and will truncate a line that is too long, usually mid-word and usually without warning. The count tells you the length, and anything over 60 characters is flagged so you know before you paste it.' },
      { q: 'How many characters do status fields allow?', a: 'It varies by platform and it changes. 60 is used here as the flag threshold because it is comfortably inside most limits; if your particular field is stricter, the count still tells you the number you need.' },
      { q: 'Are the lines about anything specific?', a: 'No. There are no references to real people, employers, brands or events. Every line is generic enough to be about nobody in particular, which is what makes it safe to use as a status.' },
      { q: 'Does it remember what I generated?', a: 'No. Nothing is stored between visits and nothing leaves the page. Each session starts with a full rotation available.' }
    ]
  }
];

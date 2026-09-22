/**
 * Specs for the pet pages. Consumed by scripts/gen-fun-tools.mjs.
 *
 * All five set `shared: true`.
 *
 * The two select values here — `any`, `dog`, `cat` — are a contract with the
 * pet-caption and pet-nickname modules, which read `.value` directly and fall
 * back to `any` for anything they do not recognise.
 *
 * The dog and cat thought generators are deliberately different tools rather
 * than one tool with the noun changed, and the copy on each page says so. A dog
 * thought is one short present-tense sentence with no context. A cat thought is
 * a long formal sentence that ends in a ruling. Swapping the animal in a shared
 * pool would have produced neither.
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

const textInput = (id, label, placeholder) => `    <div>
      <label for="${id}" class="block text-xs text-gray-400 mb-1 font-mono">${label}</label>
      <input id="${id}" type="text" autocomplete="off" placeholder="${placeholder}"
        class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-500" />
    </div>`;

/* Stated on every page in this category, because "pet" tools are the ones where
 * somebody might reasonably wonder what happens to a name they type in. */
const privacyNote = `    <p class="text-[10px] text-gray-500 mt-3 leading-relaxed">
      Anything you type stays in this page. Nothing is uploaded, stored or sent anywhere.
    </p>`;

export default [
  {
    slug: 'pet-caption-generator',
    name: 'Pet Caption Generator',
    create: 'createPetCaption',
    shared: true,
    title: 'Pet Caption Generator — Dog & Cat Captions | ToolStack AI',
    desc: 'Generate a pet photo caption: a described scene and a line to go with it, filtered for dogs, cats or either. Free, no signup, words only.',
    tagline:
      'A described photo and a caption to go with it. Filter for dogs or cats, or leave it on both — the two pools are drawn separately.',
    widget: `${statusBar('pet')}

${select('petAnimal', 'Animal:', [
      ['any', 'Dogs and cats'],
      ['dog', 'Dogs only'],
      ['cat', 'Cats only']
    ])}

    <div class="mt-4 p-3 rounded-xl bg-gray-950 border border-gray-800">
      <p class="text-[11px] text-gray-500 leading-relaxed">
        <strong class="text-gray-300">Words only.</strong> This writes a caption and describes a
        photo. It does not make or find an image, and nothing is uploaded.
      </p>
    </div>

${drawButtons('pet', 'Generate a caption')}

${resultShell(
      'pet',
      'pet-caption-generator',
      `      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <div class="flex items-start justify-between gap-4 mb-4">
          <p class="text-[10px] font-mono uppercase tracking-wide text-gray-500">The photo</p>
          <span id="petBadge" class="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20"></span>
        </div>
        <p id="petScene" class="text-sm text-gray-300 leading-relaxed italic mb-5"></p>
        <p id="petCaption" class="text-xl font-black tracking-tight text-gray-50"></p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
${copyButton('pet')}
      </div>

      <p id="petMeta" class="text-[10px] text-gray-500 leading-relaxed"></p>`
    )}`,
    what: [
      'Two pools — sixteen described photos and sixteen captions — both tagged for dogs or cats and both filtered by the animal selector. The two are drawn **independently**, so the scene and the line are not matched to each other. That mismatch is usually where the joke is: a caption about shameless behaviour over a photo of a dog waiting politely by a door works better than a tidy pair.',
      'Neither pool contains a photograph. Every scene is a sentence describing one, which means the output is usable with whatever picture you actually have of your own animal, and nothing is ever uploaded. The dog and cat pools are written in different registers rather than swapped nouns, because a caption that works on a dog usually does not work on a cat. Dogs get enthusiasm and no interior life; cats get entitlement and a formal register.'
    ],
    how: [
      'Choose an **animal** — dogs, cats, or both.',
      'Press **Generate a caption**. A described photo and a caption appear together.',
      'Press again for a new pair. Both pools rotate through the current filter before repeating anything.',
      'Press **Copy** to take the caption, or **Clear** to empty the result and reset the pools.'
    ],
    cases: [
      { t: 'Captioning a photo of your own pet', d: 'The described scene tells you which of your photos fits, and the line is short enough to paste straight in.' },
      { t: 'Pet accounts', d: 'Sixteen captions per animal is a reasonable backlog, and the register is right for the format.' },
      { t: 'Group chats', d: 'Short, no edge on them, and nothing that depends on knowing the animal.' },
      { t: 'A photo you cannot think of a caption for', d: 'Press the button three times. Sixteen scenes and sixteen captions cross into far more combinations than there are photos of your pet.' }
    ],
    faqs: [
      { q: 'Does this make or find an image?', a: 'No. It describes a photo in words and writes a caption. There is no image generation, no search and no upload. You use it with a picture you already have.' },
      { q: 'Why do the photo and the caption not match?', a: 'They are drawn from separate pools on purpose. The mismatch is usually funnier than a matched pair, and it means the caption pool stays usable no matter what your actual photo is.' },
      { q: 'Are the dog and cat captions different?', a: 'Yes. They are written as two separate pools in two different registers rather than one pool with the animal name swapped. Dog captions are enthusiastic and uncomplicated; cat captions are formal and entitled.' },
      { q: 'Can I use these for a pet account?', a: 'Yes. The output is yours, there is no attribution requirement, and nothing in the pools references a real person, brand or animal.' }
    ]
  },

  {
    slug: 'dog-thought-generator',
    name: 'Dog Thought Generator',
    create: 'createDogThought',
    shared: true,
    title: 'Dog Thought Generator — What Your Dog Is Thinking | ToolStack AI',
    desc: 'Forty dog thoughts in a dog’s own voice, with an excitement meter that is honestly labelled as random. Free, no signup, nothing stored.',
    tagline:
      'Forty thoughts in one consistent voice — short sentences, present tense, no context — plus an excitement meter that is drawn at random and says so.',
    widget: `${statusBar('dog')}

    <p class="text-xs text-gray-400 leading-relaxed">
      What the dog is thinking, as far as anyone can tell. Short sentences, enormous enthusiasm,
      no context whatsoever.
    </p>

${drawButtons('dog', 'Find out what the dog thinks')}

${resultShell(
      'dog',
      'dog-thought-generator',
      `      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <p class="text-[10px] font-mono uppercase tracking-wide text-gray-500 mb-3">Current thought</p>
        <p id="dogThought" class="text-lg font-bold text-gray-50 leading-snug"></p>
        <p id="dogMeter" class="text-[11px] font-mono text-amber-400 mt-5"></p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
${copyButton('dog')}
      </div>

      <p id="dogMeta" class="text-[10px] text-gray-500 leading-relaxed"></p>`
    )}`,
    what: [
      'Forty thoughts written in one consistent voice: short sentences, immediate present tense, no reasoning about consequences. That last part is the constraint the whole pool is built on. A dog thought that weighs up an outcome is not a dog thought, so nothing here does — the thoughts are all reaction, repetition and total conviction about something trivial.',
      'The **excitement meter** is a joke rather than a measurement, and the page says so in the meta line under the result. It is drawn at random on every thought and has no relationship to what the thought says. There is no dog, nothing is being assessed, and a meter that pretended otherwise would be the dishonest version of this page. The cat generator next door is the opposite voice on purpose: long formal sentences that end in a verdict.'
    ],
    how: [
      'Press **Find out what the dog thinks**. A thought and an excitement level appear together.',
      'Press again. Thoughts are drawn from a shuffled bag, so all forty come up before any of them repeat.',
      'Press **Copy** to take the thought. The meter is not included, because it is not part of the thought.',
      'Press **Clear** to empty the result and reset the bag.'
    ],
    cases: [
      { t: 'Captioning a photo of a dog', d: 'The thought works as the caption and the photo supplies the context the sentence deliberately lacks.' },
      { t: 'Pet accounts', d: 'Forty thoughts is a long run of posts, and the voice is consistent enough to build a character on.' },
      { t: 'Cheering somebody up', d: 'The register is enthusiastic and entirely harmless, which is the point of it.' },
      { t: 'Comparing with the cat version', d: 'The two pages are written as opposites. Running both is more interesting than running either.' }
    ],
    faqs: [
      { q: 'Is the excitement meter real?', a: 'No. It is drawn at random every time and has nothing to do with the thought. The page says so under the result rather than only here, because a number presented without that context looks like a measurement.' },
      { q: 'Can this tell me what my actual dog is thinking?', a: 'No. It is a generator with a written pool of forty thoughts. It has no information about your dog or any other dog.' },
      { q: 'How is this different from the cat thought generator?', a: 'The voice. Dog thoughts are short, immediate and enthusiastic; cat thoughts are long, formal, and end in a ruling on the situation. They are two separate pools written to be opposites rather than one pool with the animal changed.' },
      { q: 'Does anything get saved?', a: 'No. Nothing is stored between visits and nothing leaves your browser. Pressing Clear only resets the rotation within the current page.' }
    ]
  },

  {
    slug: 'cat-thought-generator',
    name: 'Cat Thought Generator',
    create: 'createCatThought',
    shared: true,
    title: 'Cat Thought Generator — Inner Monologue & Verdict | ToolStack AI',
    desc: 'Forty cat thoughts in a cat’s own voice, each followed by a formal verdict on the situation. Free, no signup, nothing stored or uploaded.',
    tagline:
      'Forty thoughts in the register of a landlord who believes himself a minor deity, each followed by a formal ruling on the matter.',
    widget: `${statusBar('cat')}

    <p class="text-xs text-gray-400 leading-relaxed">
      What the cat is thinking, followed by its formal ruling on the situation. The verdict is drawn
      separately from the thought, so the two are not matched.
    </p>

${drawButtons('cat', 'Find out what the cat thinks')}

${resultShell(
      'cat',
      'cat-thought-generator',
      `      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <p class="text-[10px] font-mono uppercase tracking-wide text-gray-500 mb-3">Current thought</p>
        <p id="catThought" class="text-base text-gray-100 leading-relaxed"></p>
        <p id="catVerdict" class="text-sm font-bold text-brand-400 mt-5 pt-4 border-t border-gray-800"></p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
${copyButton('cat')}
      </div>

      <p id="catMeta" class="text-[10px] text-gray-500 leading-relaxed"></p>`
    )}`,
    what: [
      'Two parts: a thought, and a formal verdict on it. The thought is a long, complete sentence in a register somewhere between a landlord and a minor deity — nothing in the pool is affectionate in an obvious way, because the humour of the format comes from the gap between how a cat behaves and how it evidently regards itself. The verdict is a short ruling drawn from a **separate bag**, so it is not matched to the thought it follows, and "Verdict: not my problem" lands after almost anything.',
      'This page is the deliberate opposite of the dog generator next door. A dog thought is one short enthusiastic sentence; a cat thought is a complete formal statement. That difference is the reason they are two tools rather than one, and running both is more interesting than running either.'
    ],
    how: [
      'Press **Find out what the cat thinks**. A thought and a verdict appear together.',
      'Press again for another pair. The thought pool and the verdict pool each rotate independently.',
      'Press **Copy** to take the thought and the verdict together, which is the form they work in.',
      'Press **Clear** to empty the result and reset both bags.'
    ],
    cases: [
      { t: 'Captioning a photo of a cat', d: 'The thought is long enough to be the whole caption, and the verdict gives it a punchline.' },
      { t: 'Pet accounts', d: 'The voice is consistent across all forty, which is enough to build a recognisable character.' },
      { t: 'Sending to another cat owner', d: 'The specific observations — the door being open rather than being let out, the box that fits — are the ones that get recognised.' },
      { t: 'Comparing with the dog version', d: 'The two pages are written as opposites by design.' }
    ],
    faqs: [
      { q: 'Are the thoughts and verdicts matched to each other?', a: 'No. They are drawn from two separate pools, so the verdict is not chosen to suit the thought. That mismatch is intentional — a grand ruling after a thought about a box works better than a tidy pair.' },
      { q: 'Can this tell me what my cat is thinking?', a: 'No. It is a written pool of forty thoughts and ten verdicts. It has no information about your cat or any other cat.' },
      { q: 'Why is this so different from the dog generator?', a: 'Because the two animals are funny for opposite reasons. Dog humour comes from enthusiasm without context; cat humour comes from formality without justification. One shared pool with the animal swapped would have produced neither.' },
      { q: 'Is anything uploaded?', a: 'No. Everything runs in the page and nothing is sent anywhere. There is no account and no history.' }
    ]
  },

  {
    slug: 'pet-nickname-generator',
    name: 'Pet Nickname Generator',
    create: 'createPetNickname',
    shared: true,
    title: 'Pet Nickname Generator — Nicknames From Your Pet’s Name | ToolStack AI',
    desc: 'Generate pet nicknames built from your pet’s actual name, with a dog, cat or any-pet setting. Free, no signup, and nothing you type leaves the page.',
    tagline:
      'Type your pet’s name and get six nicknames derived from it — not drawn from a list, but built out of the name you typed.',
    widget: `${statusBar('nick')}

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
${textInput('nickNameInput', 'Your pet’s name:', 'Biscuit')}
${select('nickPetType', 'Type:', [
        ['any', 'Any pet'],
        ['dog', 'Dog'],
        ['cat', 'Cat']
      ])}
    </div>

    <div class="flex flex-wrap items-center gap-2 mt-5">
      <button id="nickBuildBtn" type="button"
        class="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold text-sm transition">
        Build nicknames
      </button>
      <button id="nickClearBtn" type="button"
        class="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm transition">
        Clear
      </button>
    </div>
${privacyNote}

${resultShell(
      'nick',
      'pet-nickname-generator',
      `      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <div class="flex items-start justify-between gap-4 mb-4">
          <p class="text-[10px] font-mono uppercase tracking-wide text-gray-500">Nicknames</p>
          <span id="nickBadge" class="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20"></span>
        </div>
        <div id="nickList" class="grid grid-cols-2 sm:grid-cols-3 gap-3"></div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
${copyButton('nick')}
      </div>

      <p id="nickMeta" class="text-[10px] text-gray-500 leading-relaxed"></p>`
    )}`,
    what: [
      'This one derives rather than draws. Type a name and the tool builds nicknames **out of it** — a rough first syllable, a handful of suffixes, an honorific, a title — and shows you six of the candidates at random. That is the difference between this and a random noun generator: "Biscuit" producing "Bisc", "Biscy" and "Sir Biscuit of the Sofa" is funny because you can see the name in it, and a pool of unrelated nicknames would not be about your pet at all.',
      'The transformations are crude on purpose. Real nickname formation is not something a regular expression can do well, and a cleverer system would produce output you could not trace back to the input. Crude and legible beats clever and wrong, so the split is a simple first-syllable rule and the page shows six candidates rather than one so you can take the one that actually sounds right. The dog and cat settings add species-specific titles and suffixes.'
    ],
    how: [
      'Type your pet’s **name**. The nicknames are built from it, so this is required.',
      'Choose a **type** — dog, cat, or any pet — to change the titles and honorifics that get used.',
      'Press **Build nicknames**. Six candidates appear. Press it again for a different six from the full set of transformations.',
      'Press **Copy** to take the list, or **Clear** to empty the box and the results.'
    ],
    cases: [
      { t: 'Finding one that sticks', d: 'Six at a time from a longer list. Most people find the one they want within two presses.' },
      { t: 'Registering a new pet', d: 'The formal options — Sir Biscuit, Lady Biscuit, Biscuit the Third — are useful when the paperwork needs a full name.' },
      { t: 'Naming a pet account', d: 'The derived forms are recognisably about your animal, which a random noun would not be.' },
      { t: 'Settling a household argument', d: 'Everyone types the same name and argues about which set is better. The tool does not take a side.' }
    ],
    faqs: [
      { q: 'Why do the nicknames depend on the name I type?', a: 'Because they are built from it rather than picked from a list. The tool takes a rough first syllable, adds suffixes, and combines it with titles and honorifics. That is what makes the output recognisably about your pet.' },
      { q: 'What happens to the name I type?', a: 'Nothing. It stays in the page, is used to build the list, and is never sent anywhere or stored. Closing or reloading the page discards it.' },
      { q: 'Why are the nicknames so rough?', a: 'Because real nickname formation is not something a simple rule can do well. The transformations are deliberately crude and legible so you can see where each one came from, and the tool shows six candidates so you can take the one that sounds right rather than being given one answer.' },
      { q: 'Does the dog or cat setting change much?', a: 'It changes the titles, honorifics and suffixes that get used. Cats get titles like "the Unbothered" and honorifics like "Lady"; dogs get "the Bold" and "Captain". The rest of the transformation is the same.' }
    ]
  },

  {
    slug: 'pet-superhero-name',
    name: 'Pet Superhero Name Generator',
    create: 'createPetSuperheroName',
    shared: true,
    title: 'Pet Superhero Name Generator — Powers & Origins | ToolStack AI',
    desc: 'Turn your pet into a superhero, with a name, a power and an origin story. Works with or without typing a name. Free, no signup, nothing uploaded.',
    tagline:
      'A hero name, a power and an origin. Type your pet’s name for a personal one, or leave it blank and one will be drawn for you.',
    widget: `${statusBar('psh')}

${textInput('pshNameInput', 'Your pet’s name (optional):', 'leave blank to draw one')}

    <div class="mt-3 p-3 rounded-xl bg-gray-950 border border-gray-800">
      <p class="text-[11px] text-gray-500 leading-relaxed">
        <strong class="text-gray-300">The powers are pet powers.</strong> Not flight, not
        super-strength — the ability to hear a packet being opened from four rooms away. Every
        one of them is something a pet owner will recognise as basically true.
      </p>
    </div>

${drawButtons('psh', 'Create a superhero')}
${privacyNote}

${resultShell(
      'psh',
      'pet-superhero-name',
      `      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6 space-y-4">
        <p id="pshHeroName" class="text-2xl sm:text-3xl font-black tracking-tight text-brand-400 leading-tight"></p>
${field('pshPower', 'Power')}
${field('pshOrigin', 'Origin')}
      </div>

      <div class="flex flex-wrap items-center gap-2">
${copyButton('psh')}
      </div>

      <p id="pshMeta" class="text-[10px] text-gray-500 leading-relaxed"></p>`
    )}`,
    what: [
      'Builds a superhero identity around a pet, using the name you type if there is one and drawing from a pool of invented names if there is not. That ordering matters: the tool works with no input at all, and works better with it. Every name follows the same shape — a title, the pet’s name, and an epithet — which is the format these names actually take, and the pool of epithets includes the domestic ones ("of the Back Garden", "Guardian of the Sofa") alongside the grand ones.',
      'The powers are all **plausible pet abilities** rather than generic superhero ones. A cat that can fly is not funny; a cat that can detect an upcoming vet visit three days in advance is, and every power in the pool is written to be something a pet owner would recognise as basically true. The origins are written the same way — found in a hedge, chosen this house, arrived unannounced — because the joke only works if it is specific.'
    ],
    how: [
      'Type your pet’s **name**, or leave the box empty. Leaving it empty works and is stated on the page.',
      'Press **Create a superhero**. A hero name, a power and an origin appear together.',
      'Press again for different powers and a different origin. The name stays built around the same input.',
      'Press **Copy** to take all three parts, or **Clear** to empty the box and the result.'
    ],
    cases: [
      { t: 'A pet account with a theme', d: 'Name, power and origin in one press is a complete character, and the powers are recognisable enough to build posts on.' },
      { t: 'Children’s writing', d: 'The format is straightforward, the powers are funny rather than scary, and the pet is the hero.' },
      { t: 'Family group chats', d: 'Everyone generates one for the same pet and compares origins. The origins are the part people argue about.' },
      { t: 'A gift or a card', d: 'The three parts read as a short character description, which is roughly the length of a card.' }
    ],
    faqs: [
      { q: 'What if I do not type a name?', a: 'The tool draws one from a pool of invented pet names and says so under the result. Everything else works the same way. Typing a real name produces a more personal result, which is why the box is there.' },
      { q: 'Are the powers real superhero powers?', a: 'No, and deliberately so. They are pet abilities written to be recognisable — hearing a packet open from four rooms away, locating dropped food, occupying the exact centre of a bed. A generic power pool would have made this the same tool as the superhero generator elsewhere on the site.' },
      { q: 'Is the name I type stored anywhere?', a: 'No. It is used in the page to build the name and is never sent anywhere or saved. Closing or reloading discards it.' },
      { q: 'Does this reference any real animal or character?', a: 'No. Every name, power, origin and epithet is invented for this page. Nothing here references a real pet, a real person or an existing character.' }
    ]
  }
];

/**
 * ToolStack AI — related-tool map.
 *
 * One place to say what each tool is called, what it does in a line, and which
 * other tools genuinely belong next to it. `node scripts/toolstack.mjs
 * sync-related` stamps the result into the marked block on every tool page, so
 * the linking graph has a single source of truth instead of drifting per page.
 *
 * Two rules for this file:
 *
 *   - A blurb describes what the tool actually does. Nothing here should claim
 *     a capability the tool does not have.
 *   - Related tools are chosen for the person, not for the crawler. A page
 *     belongs next to the tools someone would plausibly reach for next, which
 *     usually means the same job (another PDF operation) or the same occasion
 *     (another party game) — not the same category label.
 */

/** slug -> [display name, one-line description] */
export const TOOLS = {
  // --- AI ------------------------------------------------------------------
  'ai-model-comparison': ['AI Model Comparison Matrix', 'Compare ChatGPT, Claude, DeepSeek and Gemini side by side.'],
  'ai-status-board': ['AI Service Status Board', 'A reference layout for an AI uptime dashboard, on simulated data.'],
  'ai-tool-quiz': ['Which AI Tool Should I Use?', 'Answer five questions and get a specific AI tool recommendation.'],
  'ai-tools-directory': ['Free AI Tools Directory', 'A searchable directory of 28 AI tools with usable free tiers.'],

  // --- SEO / site ------------------------------------------------------------
  'meta-tag-generator': ['Meta Tag Generator', 'Build a complete, correctly escaped HTML head block.'],
  'og-tag-generator': ['Open Graph Generator', 'Build og: tags and preview the link card they produce.'],
  'twitter-card-generator': ['Twitter/X Card Generator', 'Build summary and summary_large_image tags with a preview.'],
  'seo-title-generator': ['SEO Title & Snippet Optimizer', 'Measure real pixel width and fix a truncated headline.'],
  'meta-description-generator': ['Meta Description Generator', 'Five description variants with live character counts.'],
  'serp-preview': ['Google SERP Preview Tool', 'See the title, URL and description as Google would show them.'],
  'slug-generator': ['URL Slug Generator', 'Turn a headline into a lowercase, hyphenated, accent-stripped slug.'],
  'keyword-counter': ['Keyword Counter', 'Count keyword occurrences with density and reading time.'],
  'keyword-density-checker': ['Keyword Density Checker', 'Top 1-, 2- and 3-word phrases, with an over-stuffing flag.'],
  'robotstxt-generator': ['Robots.txt Generator', 'Per-bot crawl rules, a sitemap location and crawl-delay.'],
  'sitemap-generator': ['Sitemap.xml Generator', 'Turn a list of URLs into valid sitemap XML.'],
  'schema-generator': ['Schema Markup Generator', 'JSON-LD for Organization, WebSite, Product and more.'],
  'faq-schema-generator': ['FAQ Schema Generator', 'Turn question and answer pairs into FAQPage JSON-LD.'],
  'article-schema-generator': ['Article Schema Generator', 'Build Article, BlogPosting or NewsArticle JSON-LD.'],
  'local-business-schema': ['Local Business Schema Generator', 'Build LocalBusiness JSON-LD with address and opening hours.'],

  // --- Developer -------------------------------------------------------------
  'json-formatter': ['JSON Formatter & Validator', 'Format, validate and minify JSON in the browser.'],
  'base64-encoder': ['Base64 Encoder & Decoder', 'Encode text to Base64, or decode it back to plain text.'],

  // --- PDF -------------------------------------------------------------------
  'pdf-compressor': ['PDF Compressor', 'Re-render each page at a resolution you choose to shrink the file.'],
  'pdf-to-jpg': ['PDF to JPG Converter', 'Turn each page into a JPEG at the resolution you pick.'],
  'pdf-to-png': ['PDF to PNG Converter', 'Turn each page into a lossless PNG.'],
  'pdf-to-text': ['PDF to Text', 'Copy the text layer out of a PDF, page by page.'],
  'jpg-to-pdf': ['JPG to PDF Converter', 'Combine JPG photos and scans into a single PDF.'],
  'png-to-pdf': ['PNG to PDF Converter', 'Combine PNG images and screenshots into one PDF.'],
  'image-to-pdf': ['Image to PDF', 'Combine JPG and PNG images into one PDF, in any order.'],
  'text-to-pdf': ['Text to PDF', 'Turn plain text into a paginated PDF with your own font and margins.'],
  'pdf-page-extractor': ['PDF Page Extractor', 'Pull specific pages out into a new document.'],
  'pdf-page-rotator': ['PDF Page Rotator', 'Rotate one page, a range, or the whole file by 90°, 180° or 270°.'],
  'pdf-page-reorderer': ['PDF Page Reorderer', 'Rearrange pages by editing a simple list of page numbers.'],
  'pdf-password-protector': ['PDF Password Protector', 'Add a password and set printing, copying and editing permissions.'],
  'pdf-unlocker': ['PDF Unlocker', 'Remove a password you already know, or clear print and copy restrictions.'],
  'pdf-metadata-remover': ['PDF Metadata Remover', 'See and clear the author, title, subject and timestamps inside a PDF.'],
  'pdf-watermark': ['PDF Watermark Tool', 'Stamp text across every page, or only the ones you choose.'],

  // --- Image / media ---------------------------------------------------------
  'image-converter': ['Image Converter', 'Convert PNG, JPG and WebP, and compress with a quality slider.'],
  'thumbnail-downloader': ['Video Thumbnail Downloader', 'Grab a YouTube or Vimeo thumbnail in maximum, HD or medium quality.'],

  // --- Creator / marketing ---------------------------------------------------
  'script-hook-checker': ['Script Hook & Retention Checker', 'Score the first three seconds of a Reels, TikTok or Shorts script.'],
  'social-chat-generator': ['Social Chat Generator', 'Create WhatsApp or Instagram chat mockups and export them as PNG.'],
  'spam-word-checker': ['Cold Email Spam-Word Checker', 'Scan outbound copy for spam triggers and get a deliverability score.'],

  // --- Client / business ------------------------------------------------------
  'quote-generator': ['Client Quotation Generator', 'Build a quotation with line items and tax, then download it as a PDF.'],

  // --- Fun: jokes -------------------------------------------------------------
  'random-joke-generator': ['Random Joke Generator', 'Puns, one-liners and tech jokes, filtered by category.'],
  'dad-joke-generator': ['Dad Joke Generator', 'Clean, groan-worthy classics sorted by topic.'],
  'bad-joke-generator': ['Bad Joke Generator', 'Anti-jokes and groaners, told badly on purpose.'],
  'dark-humor-joke': ['Dark Humour Joke Generator', 'Deadpan, existential humour that never turns cruel.'],
  'corny-joke-generator': ['Corny Joke Generator', 'Wholesome puns and greetings-card humour with a groan rating.'],

  // --- Fun: quizzes and personality --------------------------------------------
  'best-friend-quiz': ['Best Friend Quiz', 'Build a quiz link and find out how well your friends know you.'],
  'friendship-test': ['Friendship Test', 'A twelve-question quiz on how you show up for each other.'],
  'who-knows-me-better': ['Who Knows Me Better Quiz', 'Three players, ten questions, and who read you better.'],
  'couple-compatibility': ['Couple Compatibility Calculator', 'Two people answer the same questions and see where they agree.'],
  'crush-calculator': ['Crush Calculator', 'A name game that counts the letters two names share.'],
  'what-type-person': ['What Type of Person Are You?', 'A ten-question quiz that sorts you into one of six types.'],
  'general-knowledge-quiz': ['General Knowledge Quiz', 'A fixed fifteen-question paper, marked at the end.'],
  'geography-quiz': ['Geography Quiz', 'Twelve rounds with a breakdown by region.'],
  'trivia-quiz': ['Trivia Quiz', 'Ten questions drawn from a pool of forty-eight, marked as you go.'],
  'this-or-that': ['This or That', 'Twelve rapid either/or rounds with a summary of how you leaned.'],

  // --- Fun: party ---------------------------------------------------------------
  'truth-or-dare': ['Truth or Dare Generator', 'A clean deck and a bolder one, with skipping always allowed.'],
  'never-have-i-ever': ['Never Have I Ever', 'Statements with a running tally of how many have done it.'],
  'would-you-rather': ['Would You Rather', 'Thirty-four questions with a live vote split.'],
  'most-likely-to': ['Most Likely To', 'Party prompts with a running scoreboard for the evening.'],

  // --- Fun: random decisions ------------------------------------------------------
  'yes-or-no': ['Yes or No', 'A straight answer, and a count of how often you have asked.'],
  'should-i-do-it': ['Should I Do It?', 'A random verdict, plus two questions that do predict your choice.'],
  'flip-a-coin': ['Flip a Coin Online', 'A fair coin flip with counts, the current streak and recent history.'],
  'roll-a-dice': ['Roll a Dice', 'One to six dice, D4 to D20, shown individually with the total.'],
  'daily-riddle': ['Daily Riddle', 'One riddle a day — the same for everybody — with a hint and an archive.'],
  'riddle-generator': ['Riddle Generator', 'Classic riddles drawn at random, each with a hint.'],

  // --- Fun: name and identity generators ---------------------------------------------
  'superhero-name': ['Superhero Name Generator', 'A name, tagline, team and origin across four styles.'],
  'villain-name-generator': ['Villain Name Generator', 'A villain name with an origin story and a current scheme.'],
  'superpower-generator': ['Superpower Generator (With Drawbacks)', 'Thirty-six powers, each paired with a separate catch.'],
  'secret-identity': ['Secret Identity Generator', 'A cover name, an unremarkable job, a hideout and the tell.'],
  'secret-talent-generator': ['Secret Talent Generator', 'A hidden talent and the small tell that would give it away.'],
  'supervillain-plan': ['Supervillain Plan Generator', 'A petty objective, an overcomplicated method and a fatal flaw.'],
  'billionaire-name': ['Billionaire Name Generator', 'An invented fortune, its source, and a piece of advice.'],
  'celebrity-scandal-generator': ['Celebrity Scandal Generator', 'Tabloid headlines about an entirely fictional celebrity.'],

  // --- Fun: captions and memes ---------------------------------------------------------
  'meme-caption-generator': ['Meme Caption Generator', 'A described image with a top line and a bottom line.'],
  'meme-idea-generator': ['Meme Idea Generator', 'A meme concept, a structure to shoot it in, and why it works.'],
  'pov-generator': ['POV Generator', 'Short POV lines for captions and posts, filtered by setting.'],
  'reaction-caption-generator': ['Reaction Caption Generator', 'A described reaction image with a short caption.'],
  'funny-status-generator': ['Funny Status Generator', 'Short status lines by mood, with a live character count.'],

  // --- Fun: pets -------------------------------------------------------------------------
  'pet-caption-generator': ['Pet Caption Generator', 'A described pet scene and a caption, filtered by species.'],
  'dog-thought-generator': ['Dog Thought Generator', 'What your dog is thinking, with an excitement meter.'],
  'cat-thought-generator': ['Cat Thought Generator', "Cat thoughts in a cat's own voice, each with a verdict."],
  'pet-nickname-generator': ['Pet Nickname Generator', "Nicknames built from your pet's actual name."],
  'pet-superhero-name': ['Pet Superhero Name Generator', 'A superhero name, power and origin for your pet.'],

  // --- Fun: games ---------------------------------------------------------------------------
  'game-connect-four': ['Connect Four', 'Play against the computer or a friend on one device.'],
  'game-tictactoe': ['Tic Tac Toe', 'Play against the computer or a friend, with a running record.'],
  'game-memory-cards': ['Memory Cards', 'Flip cards and match the pairs, at three board sizes.'],
  'game-minesweeper': ['Minesweeper', 'Three difficulty levels, with a safe first click and a flag mode.'],
  'game-snake': ['Snake Game', 'The classic, with arrow keys, WASD or on-screen buttons.'],

  // --- Fun: everything else ----------------------------------------------------------------------
  'life-achievement-today': ['Life Achievement Today', 'A game-style achievement for something ordinary you did today.'],
};

/**
 * slug -> the tools shown in that page's "Related tools" block.
 *
 * Every target must exist in TOOLS, and no page may link to itself; `sync-related`
 * refuses to run otherwise.
 */
export const RELATED = {
  // AI
  'ai-model-comparison': ['ai-tool-quiz', 'ai-tools-directory', 'ai-status-board'],
  'ai-status-board': ['ai-tools-directory', 'ai-model-comparison', 'ai-tool-quiz'],
  'ai-tool-quiz': ['ai-model-comparison', 'ai-tools-directory', 'ai-status-board'],
  'ai-tools-directory': ['ai-tool-quiz', 'ai-model-comparison', 'ai-status-board'],

  // SEO / site
  'meta-tag-generator': ['og-tag-generator', 'twitter-card-generator', 'serp-preview'],
  'og-tag-generator': ['twitter-card-generator', 'meta-tag-generator', 'serp-preview'],
  'twitter-card-generator': ['og-tag-generator', 'meta-tag-generator', 'serp-preview'],
  'seo-title-generator': ['meta-description-generator', 'serp-preview', 'slug-generator'],
  'meta-description-generator': ['seo-title-generator', 'serp-preview', 'meta-tag-generator'],
  'serp-preview': ['seo-title-generator', 'meta-description-generator', 'slug-generator'],
  'slug-generator': ['seo-title-generator', 'serp-preview', 'meta-description-generator'],
  'keyword-counter': ['keyword-density-checker', 'meta-description-generator', 'seo-title-generator'],
  'keyword-density-checker': ['keyword-counter', 'seo-title-generator', 'meta-description-generator'],
  'robotstxt-generator': ['sitemap-generator', 'serp-preview', 'meta-tag-generator'],
  'sitemap-generator': ['robotstxt-generator', 'meta-tag-generator', 'schema-generator'],
  'schema-generator': ['faq-schema-generator', 'article-schema-generator', 'local-business-schema'],
  'faq-schema-generator': ['article-schema-generator', 'local-business-schema', 'schema-generator'],
  'article-schema-generator': ['faq-schema-generator', 'schema-generator', 'local-business-schema'],
  'local-business-schema': ['schema-generator', 'faq-schema-generator', 'article-schema-generator'],

  // Developer
  'json-formatter': ['base64-encoder', 'schema-generator', 'sitemap-generator'],
  'base64-encoder': ['json-formatter', 'meta-tag-generator', 'slug-generator'],

  // PDF — the neighbours are the other operations on the same file
  'pdf-compressor': ['pdf-to-jpg', 'pdf-to-png', 'image-to-pdf'],
  'pdf-to-jpg': ['pdf-to-png', 'pdf-compressor', 'pdf-page-extractor'],
  'pdf-to-png': ['pdf-to-jpg', 'pdf-compressor', 'pdf-page-extractor'],
  'pdf-to-text': ['pdf-metadata-remover', 'text-to-pdf', 'pdf-page-extractor'],
  'jpg-to-pdf': ['png-to-pdf', 'image-to-pdf', 'pdf-page-reorderer'],
  'png-to-pdf': ['jpg-to-pdf', 'image-to-pdf', 'pdf-page-reorderer'],
  'image-to-pdf': ['jpg-to-pdf', 'png-to-pdf', 'image-converter'],
  'text-to-pdf': ['pdf-to-text', 'image-to-pdf', 'pdf-watermark'],
  'pdf-page-extractor': ['pdf-page-reorderer', 'pdf-page-rotator', 'pdf-compressor'],
  'pdf-page-rotator': ['pdf-page-reorderer', 'pdf-page-extractor', 'pdf-watermark'],
  'pdf-page-reorderer': ['pdf-page-extractor', 'pdf-page-rotator', 'pdf-watermark'],
  'pdf-password-protector': ['pdf-unlocker', 'pdf-metadata-remover', 'pdf-watermark'],
  'pdf-unlocker': ['pdf-password-protector', 'pdf-metadata-remover', 'pdf-compressor'],
  'pdf-metadata-remover': ['pdf-watermark', 'pdf-password-protector', 'pdf-unlocker'],
  'pdf-watermark': ['pdf-metadata-remover', 'pdf-page-rotator', 'pdf-page-reorderer'],

  // Image / media
  'image-converter': ['thumbnail-downloader', 'image-to-pdf', 'pdf-to-jpg'],
  'thumbnail-downloader': ['image-converter', 'social-chat-generator', 'script-hook-checker'],

  // Creator / marketing
  'script-hook-checker': ['social-chat-generator', 'thumbnail-downloader', 'spam-word-checker'],
  'social-chat-generator': ['thumbnail-downloader', 'image-converter', 'script-hook-checker'],
  'spam-word-checker': ['meta-description-generator', 'seo-title-generator', 'script-hook-checker'],

  // Client / business
  'quote-generator': ['text-to-pdf', 'pdf-watermark', 'image-to-pdf'],

  // Fun — jokes
  'random-joke-generator': ['dad-joke-generator', 'corny-joke-generator', 'bad-joke-generator'],
  'dad-joke-generator': ['random-joke-generator', 'corny-joke-generator', 'bad-joke-generator'],
  'bad-joke-generator': ['random-joke-generator', 'corny-joke-generator', 'dark-humor-joke'],
  'dark-humor-joke': ['bad-joke-generator', 'random-joke-generator', 'riddle-generator'],
  'corny-joke-generator': ['dad-joke-generator', 'random-joke-generator', 'bad-joke-generator'],

  // Fun — quizzes
  'best-friend-quiz': ['who-knows-me-better', 'friendship-test', 'couple-compatibility'],
  'friendship-test': ['best-friend-quiz', 'who-knows-me-better', 'crush-calculator'],
  'who-knows-me-better': ['best-friend-quiz', 'friendship-test', 'couple-compatibility'],
  'couple-compatibility': ['crush-calculator', 'who-knows-me-better', 'this-or-that'],
  'crush-calculator': ['couple-compatibility', 'friendship-test', 'flip-a-coin'],
  'what-type-person': ['this-or-that', 'general-knowledge-quiz', 'secret-talent-generator'],
  'general-knowledge-quiz': ['trivia-quiz', 'geography-quiz', 'what-type-person'],
  'geography-quiz': ['trivia-quiz', 'general-knowledge-quiz', 'daily-riddle'],
  'trivia-quiz': ['general-knowledge-quiz', 'geography-quiz', 'riddle-generator'],
  'this-or-that': ['would-you-rather', 'what-type-person', 'most-likely-to'],

  // Fun — party
  'truth-or-dare': ['never-have-i-ever', 'would-you-rather', 'most-likely-to'],
  'never-have-i-ever': ['truth-or-dare', 'would-you-rather', 'most-likely-to'],
  'would-you-rather': ['this-or-that', 'never-have-i-ever', 'truth-or-dare'],
  'most-likely-to': ['never-have-i-ever', 'truth-or-dare', 'would-you-rather'],

  // Fun — random decisions
  'yes-or-no': ['should-i-do-it', 'flip-a-coin', 'roll-a-dice'],
  'should-i-do-it': ['yes-or-no', 'flip-a-coin', 'would-you-rather'],
  'flip-a-coin': ['roll-a-dice', 'yes-or-no', 'should-i-do-it'],
  'roll-a-dice': ['flip-a-coin', 'yes-or-no', 'game-snake'],
  'daily-riddle': ['riddle-generator', 'trivia-quiz', 'flip-a-coin'],
  'riddle-generator': ['daily-riddle', 'trivia-quiz', 'dark-humor-joke'],

  // Fun — identity generators
  'superhero-name': ['superpower-generator', 'villain-name-generator', 'supervillain-plan'],
  'villain-name-generator': ['supervillain-plan', 'superhero-name', 'superpower-generator'],
  'superpower-generator': ['superhero-name', 'villain-name-generator', 'pet-superhero-name'],
  'secret-identity': ['secret-talent-generator', 'supervillain-plan', 'billionaire-name'],
  'secret-talent-generator': ['secret-identity', 'superpower-generator', 'what-type-person'],
  'supervillain-plan': ['villain-name-generator', 'superhero-name', 'secret-identity'],
  'billionaire-name': ['secret-identity', 'supervillain-plan', 'life-achievement-today'],
  'celebrity-scandal-generator': ['billionaire-name', 'dark-humor-joke', 'funny-status-generator'],

  // Fun — captions and memes
  'meme-caption-generator': ['meme-idea-generator', 'reaction-caption-generator', 'pov-generator'],
  'meme-idea-generator': ['meme-caption-generator', 'pov-generator', 'reaction-caption-generator'],
  'pov-generator': ['reaction-caption-generator', 'meme-caption-generator', 'funny-status-generator'],
  'reaction-caption-generator': ['meme-caption-generator', 'pov-generator', 'funny-status-generator'],
  'funny-status-generator': ['pov-generator', 'reaction-caption-generator', 'meme-idea-generator'],

  // Fun — pets
  'pet-caption-generator': ['pet-nickname-generator', 'pet-superhero-name', 'dog-thought-generator'],
  'dog-thought-generator': ['cat-thought-generator', 'pet-caption-generator', 'pet-nickname-generator'],
  'cat-thought-generator': ['dog-thought-generator', 'pet-caption-generator', 'pet-nickname-generator'],
  'pet-nickname-generator': ['pet-superhero-name', 'pet-caption-generator', 'dog-thought-generator'],
  'pet-superhero-name': ['pet-nickname-generator', 'superhero-name', 'pet-caption-generator'],

  // Fun — games
  'game-connect-four': ['game-tictactoe', 'game-minesweeper', 'game-memory-cards'],
  'game-tictactoe': ['game-connect-four', 'game-minesweeper', 'game-memory-cards'],
  'game-memory-cards': ['game-snake', 'game-minesweeper', 'game-tictactoe'],
  'game-minesweeper': ['game-snake', 'game-connect-four', 'game-memory-cards'],
  'game-snake': ['game-minesweeper', 'game-memory-cards', 'game-tictactoe'],

  // Fun — misc
  'life-achievement-today': ['secret-talent-generator', 'billionaire-name', 'yes-or-no'],
};

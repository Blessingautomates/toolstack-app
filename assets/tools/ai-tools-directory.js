/**
 * Free AI Tools Directory — shared engine.
 *
 * Factory, not a singleton. Modal open/close is deliberately NOT here — that is
 * page chrome, not tool logic.
 *
 * Required markup (ids, inside `root`):
 *   #aiDirSearch #aiDirChips #aiDirGrid #aiDirEmpty #aiDirCount #clearAiDirBtn
 *   — filter buttons are .dir-chip[data-category] inside #aiDirChips
 *
 * The TOOLS table below is the substance of this tool. Treat it as data, not
 * code: every entry is hand-checked and the `keywords` field is what makes the
 * search feel like it understands intent rather than just matching names.
 * Free tiers change often — the page must keep the "confirm current pricing"
 * disclaimer.
 */
(function (window, document) {
  'use strict';

  var CATEGORY_STYLES = {
    Writing: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    Coding:  'bg-violet-500/10 text-violet-400 border-violet-500/20',
    Image:   'bg-pink-500/10 text-pink-400 border-pink-500/20',
    Video:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Audio:   'bg-teal-500/10 text-teal-400 border-teal-500/20'
  };

  var TOOLS = [
    // Writing
    { name: 'ChatGPT', category: 'Writing', icon: '💬', url: 'https://chatgpt.com',
      desc: 'General-purpose assistant for drafting, rewriting, brainstorming, and everyday questions. Free tier includes current models with usage caps.',
      keywords: 'openai gpt chatbot text assistant brainstorm summary' },
    { name: 'Claude', category: 'Writing', icon: '🧠', url: 'https://claude.ai',
      desc: 'Anthropic assistant that handles long documents, careful editing, and structured writing. Free tier available.',
      keywords: 'anthropic long context editing documents analysis' },
    { name: 'Gemini', category: 'Writing', icon: '✨', url: 'https://gemini.google.com',
      desc: 'Google assistant with Docs, Gmail, and search integration plus a generous free tier.',
      keywords: 'google text assistant workspace email' },
    { name: 'Perplexity', category: 'Writing', icon: '🔎', url: 'https://www.perplexity.ai',
      desc: 'Answer engine that cites its sources, useful for research and fact-checked first drafts.',
      keywords: 'search research citations sources fact check' },
    { name: 'Grammarly', category: 'Writing', icon: '✍️', url: 'https://www.grammarly.com',
      desc: 'Real-time grammar, clarity, and tone suggestions across the browser. The free plan covers the essentials.',
      keywords: 'grammar proofreading spelling tone editing' },
    { name: 'QuillBot', category: 'Writing', icon: '🪶', url: 'https://quillbot.com',
      desc: 'Paraphrasing, summarizing, and citation helper with a usable free plan.',
      keywords: 'paraphrase rewrite summarize citation plagiarism' },

    // Coding
    { name: 'Cursor', category: 'Coding', icon: '🖱️', url: 'https://cursor.com',
      desc: 'AI-first code editor with codebase chat, multi-file edits, and fast autocomplete. Free tier with limited requests.',
      keywords: 'ide editor autocomplete codebase agent programming' },
    { name: 'GitHub Copilot', category: 'Coding', icon: '🐙', url: 'https://github.com/features/copilot',
      desc: 'In-editor completions and chat across major IDEs, with a free tier for individual developers.',
      keywords: 'github autocomplete ide programming assistant' },
    { name: 'Windsurf', category: 'Coding', icon: '🏄', url: 'https://windsurf.com',
      desc: 'Agentic code editor that plans and applies multi-step changes. Free plan for individuals.',
      keywords: 'codeium editor agent refactor programming' },
    { name: 'v0', category: 'Coding', icon: '▲', url: 'https://v0.dev',
      desc: 'Generates React and Tailwind UI from a text prompt. Free monthly credits included.',
      keywords: 'vercel react tailwind ui frontend generator' },
    { name: 'Bolt.new', category: 'Coding', icon: '⚡', url: 'https://bolt.new',
      desc: 'Prompt-to-app builder that scaffolds and runs a full stack project in the browser. Free daily tokens.',
      keywords: 'fullstack app generator scaffold browser no code' },
    { name: 'Replit', category: 'Coding', icon: '🛠️', url: 'https://replit.com',
      desc: 'Cloud IDE with an AI agent for building and hosting small projects. Free plan available.',
      keywords: 'cloud ide hosting deploy beginner programming' },

    // Image
    { name: 'Midjourney', category: 'Image', icon: '🎨', url: 'https://www.midjourney.com',
      desc: 'Highly stylised, high-fidelity image generation via web app or Discord. Paid plans only, with occasional free trials.',
      keywords: 'art illustration stylised generation discord' },
    { name: 'Leonardo AI', category: 'Image', icon: '🖼️', url: 'https://leonardo.ai',
      desc: 'Daily free credits for image generation, upscaling, and canvas editing.',
      keywords: 'art generation upscale canvas credits' },
    { name: 'Ideogram', category: 'Image', icon: '🔤', url: 'https://ideogram.ai',
      desc: 'Best-in-class text rendering inside generated images, with free daily generations.',
      keywords: 'text in image typography logo poster generation' },
    { name: 'Microsoft Designer', category: 'Image', icon: '🪟', url: 'https://designer.microsoft.com',
      desc: 'DALL-E powered image creation plus design templates. Free with a Microsoft account.',
      keywords: 'dalle bing creator design templates social graphics' },
    { name: 'Playground', category: 'Image', icon: '🎠', url: 'https://playground.com',
      desc: 'Free-tier image generator with canvas editing, filters, and templates.',
      keywords: 'generation canvas editing filters templates' },
    { name: 'remove.bg', category: 'Image', icon: '✂️', url: 'https://www.remove.bg',
      desc: 'One-click automatic background removal. Free for standard-resolution downloads.',
      keywords: 'background removal cutout transparent product photo' },

    // Video
    { name: 'Runway', category: 'Video', icon: '🎬', url: 'https://runwayml.com',
      desc: 'Text and image to video generation with editing tools. Free credits refreshed monthly.',
      keywords: 'generation text to video editing vfx diffusion' },
    { name: 'Pika', category: 'Video', icon: '🐰', url: 'https://pika.art',
      desc: 'Prompt-to-video generation with playful effects and lip sync. Free starter credits.',
      keywords: 'generation effects lip sync short clips' },
    { name: 'Luma Dream Machine', category: 'Video', icon: '🌙', url: 'https://lumalabs.ai/dream-machine',
      desc: 'Smooth text and image to video generation with free monthly generations.',
      keywords: 'generation image to video camera motion' },
    { name: 'Kling AI', category: 'Video', icon: '🎥', url: 'https://klingai.com',
      desc: 'Image-to-video and text-to-video with daily free credits and strong motion quality.',
      keywords: 'generation image to video motion clips' },
    { name: 'CapCut', category: 'Video', icon: '📱', url: 'https://www.capcut.com',
      desc: 'Free editor with auto-captions, background removal, and short-form templates.',
      keywords: 'editor captions subtitles templates tiktok reels shorts' },
    { name: 'HeyGen', category: 'Video', icon: '🧑💼', url: 'https://www.heygen.com',
      desc: 'AI avatars, voiceover, and video translation. Free plan with limited minutes.',
      keywords: 'avatar spokesperson translation voiceover talking head' },

    // Audio
    { name: 'ElevenLabs', category: 'Audio', icon: '🔊', url: 'https://elevenlabs.io',
      desc: 'Realistic text-to-speech and voice cloning. Free monthly character quota.',
      keywords: 'text to speech tts voiceover dubbing voice clone' },
    { name: 'Suno', category: 'Audio', icon: '🎵', url: 'https://suno.com',
      desc: 'Generates full songs with vocals from a text prompt. Free daily credits.',
      keywords: 'music generation song vocals lyrics' },
    { name: 'Udio', category: 'Audio', icon: '🎼', url: 'https://www.udio.com',
      desc: 'Music generation with finer control over structure and style. Free monthly credits.',
      keywords: 'music generation song instrumental remix' },
    { name: 'Adobe Podcast', category: 'Audio', icon: '🎧', url: 'https://podcast.adobe.com',
      desc: 'Free browser-based AI audio cleanup that makes voice recordings sound studio-quality.',
      keywords: 'audio enhance cleanup noise removal voice recording' }
  ];

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function createAiToolsDirectory(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var searchEl = $('aiDirSearch');
    var gridEl = $('aiDirGrid');
    var emptyEl = $('aiDirEmpty');
    var countEl = $('aiDirCount');
    var clearBtn = $('clearAiDirBtn');
    var chipEls = root.querySelectorAll('.dir-chip');

    if (!gridEl) return null;

    var activeCategory = 'all';

    function toolCard(tool) {
      var badge = CATEGORY_STYLES[tool.category] || 'bg-gray-800 text-gray-300 border-gray-700';
      return '' +
        '<div class="bg-gray-950 border border-gray-800 rounded-xl p-4 flex flex-col justify-between hover:border-brand-500/40 transition-colors">' +
          '<div>' +
            '<div class="flex items-start justify-between gap-3 mb-3">' +
              '<div class="flex items-center gap-2.5 min-w-0">' +
                '<span class="text-xl flex-shrink-0">' + tool.icon + '</span>' +
                '<p class="text-sm font-bold text-gray-100 truncate">' + escapeHtml(tool.name) + '</p>' +
              '</div>' +
              '<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border flex-shrink-0 ' + badge + '">' + escapeHtml(tool.category) + '</span>' +
            '</div>' +
            '<p class="text-xs text-gray-400 leading-relaxed">' + escapeHtml(tool.desc) + '</p>' +
          '</div>' +
          '<a href="' + escapeHtml(tool.url) + '" target="_blank" rel="noopener noreferrer" class="mt-4 inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg bg-gray-900 hover:bg-brand-500 text-gray-300 hover:text-gray-950 border border-gray-800 hover:border-brand-500 text-[11px] font-bold transition">' +
            'Visit Site ↗' +
          '</a>' +
        '</div>';
    }

    function renderChips() {
      Array.prototype.forEach.call(chipEls, function (chip) {
        var on = chip.getAttribute('data-category') === activeCategory;
        chip.className = 'dir-chip px-3 py-1.5 rounded-xl text-[11px] font-semibold transition ' +
          (on
            ? 'bg-brand-500 text-gray-950 shadow-lg'
            : 'bg-gray-900 text-gray-400 hover:text-gray-200 border border-gray-800');
        chip.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    function render() {
      var query = ((searchEl && searchEl.value) || '').trim().toLowerCase();

      var matches = TOOLS.filter(function (tool) {
        var matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
        var haystack = (tool.name + ' ' + tool.category + ' ' + tool.desc + ' ' + tool.keywords).toLowerCase();
        return matchesCategory && (!query || haystack.indexOf(query) !== -1);
      });

      gridEl.innerHTML = matches.map(toolCard).join('');
      if (emptyEl) emptyEl.classList.toggle('hidden', matches.length > 0);
      if (countEl) {
        countEl.textContent = matches.length === TOOLS.length
          ? 'Showing all ' + TOOLS.length + ' tools'
          : 'Showing ' + matches.length + ' of ' + TOOLS.length + ' tools';
      }

      if (window.ToolStack && query) {
        window.ToolStack.track('dir_search', { query: query, category: activeCategory });
      }
    }

    if (searchEl) {
      searchEl.addEventListener('input', render);

      // The site-wide "/" shortcut focuses the header search. Keep keystrokes in
      // this field local, and let Escape clear it.
      searchEl.addEventListener('keydown', function (e) {
        e.stopPropagation();
        if (e.key === 'Escape') {
          searchEl.value = '';
          render();
        }
      });
    }

    Array.prototype.forEach.call(chipEls, function (chip) {
      chip.addEventListener('click', function () {
        activeCategory = chip.getAttribute('data-category') || 'all';
        renderChips();
        render();
      });
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (searchEl) searchEl.value = '';
        activeCategory = 'all';
        renderChips();
        render();
        if (searchEl) searchEl.focus();
      });
    }

    renderChips();
    render();

    return {
      render: render,
      tools: TOOLS
    };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createAiToolsDirectory = createAiToolsDirectory;
})(window, document);

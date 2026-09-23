/**
 * ToolStack AI — shared runtime.
 *
 * Loaded as a plain <script> on every page (homepage + /tools/*). Deliberately
 * NOT an ES module: index.html already uses plain scripts, and `type="module"`
 * would break when the site is opened from disk (file://) without buying
 * anything on a static host with no bundler.
 *
 * Exposes window.ToolStack. See partials/ for the static header/footer, which
 * this file does NOT render — chrome must survive a JS failure, so it lives in
 * the HTML. This file only owns post-interaction UI, which by definition
 * requires JS to have run already.
 *
 * Adding a new tool: give its result area
 *     <div data-ts-result-actions="my-tool-key"></div>
 * and add a TOOLS entry below. Everything else is inherited.
 */
(function (window, document) {
  'use strict';

  var SITE = 'https://toolstackai.xyz';
  var SUPPORT_URL = 'https://selar.com/showlove/toolstackai';
  var COPYRIGHT = '© 2026 ToolStack AI. All rights reserved.';

  /**
   * Tool registry. `path` is the dedicated SEO page where one exists,
   * otherwise '/' so a shared link still lands somewhere useful.
   * The key is the contract between the markup and this file.
   */
  var TOOLS = {
    'quote-generator':       { name: 'Client Quotation Generator',        path: '/tools/quote-generator.html' },
    'image-converter':       { name: 'Image Converter & WebP Optimizer',  path: '/tools/image-converter.html' },
    'json-formatter':        { name: 'JSON Formatter & Validator',        path: '/tools/json-formatter.html' },
    'base64-encoder':        { name: 'Base64 Encoder / Decoder',          path: '/tools/base64-encoder.html' },
    'social-chat-generator': { name: 'Social Chat Generator',             path: '/tools/social-chat-generator.html' },
    'thumbnail-downloader':  { name: 'Thumbnail Downloader',              path: '/tools/thumbnail-downloader.html' },
    'ai-status-board':       { name: 'AI Service Status Board',           path: '/tools/ai-status-board.html' },
    'ai-tools-directory':    { name: 'Free AI Tools Directory',           path: '/tools/ai-tools-directory.html' },
    'spam-word-checker':     { name: 'Cold Email Spam-Word Checker',      path: '/tools/spam-word-checker.html' },
    'script-hook-checker':   { name: 'Script Hook & Retention Checker',   path: '/tools/script-hook-checker.html' },

    // SEO & Website Tools
    'meta-tag-generator':       { name: 'Meta Tag Generator',              path: '/tools/meta-tag-generator.html' },
    'og-tag-generator':         { name: 'Open Graph Generator',            path: '/tools/og-tag-generator.html' },
    'twitter-card-generator':   { name: 'Twitter/X Card Generator',        path: '/tools/twitter-card-generator.html' },
    'seo-title-generator':      { name: 'SEO Title & Snippet Optimizer',   path: '/tools/seo-title-generator.html' },
    'meta-description-generator': { name: 'Meta Description Writer',       path: '/tools/meta-description-generator.html' },
    'serp-preview':             { name: 'SERP Preview Tool',               path: '/tools/serp-preview.html' },
    'slug-generator':           { name: 'URL Slug Generator',              path: '/tools/slug-generator.html' },
    'keyword-density-checker':  { name: 'Keyword Density Checker',         path: '/tools/keyword-density-checker.html' },
    'keyword-counter':          { name: 'Keyword Counter',                 path: '/tools/keyword-counter.html' },
    'robotstxt-generator':      { name: 'Robots.txt Generator',            path: '/tools/robotstxt-generator.html' },
    'sitemap-generator':        { name: 'Sitemap.xml Generator',           path: '/tools/sitemap-generator.html' },
    'schema-generator':         { name: 'Schema Markup Generator',         path: '/tools/schema-generator.html' },
    'faq-schema-generator':     { name: 'FAQ Schema Generator',            path: '/tools/faq-schema-generator.html' },
    'article-schema-generator': { name: 'Article Schema Generator',        path: '/tools/article-schema-generator.html' },
    'local-business-schema':    { name: 'Local Business Schema Generator',  path: '/tools/local-business-schema.html' },

    // AI Support
    'ai-model-comparison':   { name: 'AI Model Comparison Matrix',         path: '/tools/ai-model-comparison.html' },
    'ai-tool-quiz':          { name: 'Which AI Tool Should I Use? Quiz',   path: '/tools/ai-tool-quiz.html' },

    // Fun & Games — hub first, then one entry per standalone page.
    'fun-games':                 { name: 'Fun & Games Hub',                    path: '/tools/fun-games.html' },

    // Joke generators
    'random-joke-generator':     { name: 'Random Joke Generator',              path: '/tools/random-joke-generator.html' },
    'dad-joke-generator':        { name: 'Dad Joke Generator',                 path: '/tools/dad-joke-generator.html' },
    'bad-joke-generator':        { name: 'Bad Joke Generator',                 path: '/tools/bad-joke-generator.html' },
    'dark-humor-joke':           { name: 'Dark Humor Joke Generator',          path: '/tools/dark-humor-joke.html' },
    'corny-joke-generator':      { name: 'Corny Joke Generator',               path: '/tools/corny-joke-generator.html' },

    // Relationship & quizzes
    'friendship-test':           { name: 'Friendship Test',                    path: '/tools/friendship-test.html' },
    'couple-compatibility':      { name: 'Couple Compatibility Calculator',    path: '/tools/couple-compatibility.html' },
    'best-friend-quiz':          { name: 'Best Friend Quiz',                   path: '/tools/best-friend-quiz.html' },
    'who-knows-me-better':       { name: 'Who Knows Me Better Quiz',           path: '/tools/who-knows-me-better.html' },
    'crush-calculator':          { name: 'Crush Calculator',                   path: '/tools/crush-calculator.html' },

    // Party games
    'truth-or-dare':             { name: 'Truth or Dare Generator',            path: '/tools/truth-or-dare.html' },
    'never-have-i-ever':         { name: 'Never Have I Ever',                  path: '/tools/never-have-i-ever.html' },
    'would-you-rather':          { name: 'Would You Rather',                   path: '/tools/would-you-rather.html' },
    'this-or-that':              { name: 'This or That',                       path: '/tools/this-or-that.html' },
    'most-likely-to':            { name: 'Most Likely To',                     path: '/tools/most-likely-to.html' },

    // Brain games
    'riddle-generator':          { name: 'Riddle Generator',                   path: '/tools/riddle-generator.html' },
    'daily-riddle':              { name: 'Daily Riddle',                       path: '/tools/daily-riddle.html' },
    'trivia-quiz':               { name: 'Trivia Quiz',                        path: '/tools/trivia-quiz.html' },
    'general-knowledge-quiz':    { name: 'General Knowledge Quiz',             path: '/tools/general-knowledge-quiz.html' },
    'geography-quiz':            { name: 'Geography Quiz',                     path: '/tools/geography-quiz.html' },

    // Random decision
    'yes-or-no':                 { name: 'Yes or No Oracle',                   path: '/tools/yes-or-no.html' },
    'should-i-do-it':            { name: 'Should I Do It?',                    path: '/tools/should-i-do-it.html' },
    'flip-a-coin':               { name: 'Flip a Coin',                        path: '/tools/flip-a-coin.html' },
    'roll-a-dice':               { name: 'Roll a Dice',                        path: '/tools/roll-a-dice.html' },

    // Personality
    'what-type-person':          { name: 'What Type of Person Are You?',       path: '/tools/what-type-person.html' },
    'villain-name-generator':    { name: 'Villain Name Generator',             path: '/tools/villain-name-generator.html' },
    'superpower-generator':      { name: 'Superpower Generator',               path: '/tools/superpower-generator.html' },
    'secret-talent-generator':   { name: 'Secret Talent Generator',            path: '/tools/secret-talent-generator.html' },
    'superhero-name':            { name: 'Superhero Name Generator',           path: '/tools/superhero-name.html' },

    // Meme & social
    'meme-caption-generator':    { name: 'Meme Caption Generator',             path: '/tools/meme-caption-generator.html' },
    'meme-idea-generator':       { name: 'Meme Idea Generator',                path: '/tools/meme-idea-generator.html' },
    'pov-generator':             { name: 'POV Generator',                      path: '/tools/pov-generator.html' },
    'reaction-caption-generator': { name: 'Reaction Caption Generator',        path: '/tools/reaction-caption-generator.html' },
    'funny-status-generator':    { name: 'Funny Status Generator',             path: '/tools/funny-status-generator.html' },

    // Pet tools
    'pet-caption-generator':     { name: 'Pet Caption Generator',              path: '/tools/pet-caption-generator.html' },
    'dog-thought-generator':     { name: 'Dog Thought Generator',              path: '/tools/dog-thought-generator.html' },
    'cat-thought-generator':     { name: 'Cat Thought Generator',              path: '/tools/cat-thought-generator.html' },
    'pet-nickname-generator':    { name: 'Pet Nickname Generator',             path: '/tools/pet-nickname-generator.html' },
    'pet-superhero-name':        { name: 'Pet Superhero Name Generator',       path: '/tools/pet-superhero-name.html' },

    // Weird & addictive
    'life-achievement-today':    { name: 'Life Achievement Today',             path: '/tools/life-achievement-today.html' },
    'celebrity-scandal-generator': { name: 'Celebrity Scandal Generator',      path: '/tools/celebrity-scandal-generator.html' },
    'billionaire-name':          { name: 'Billionaire Name Generator',         path: '/tools/billionaire-name.html' },
    'secret-identity':           { name: 'Secret Identity Generator',          path: '/tools/secret-identity.html' },
    'supervillain-plan':         { name: 'Supervillain Plan Generator',        path: '/tools/supervillain-plan.html' },

    // Tiny games
    'game-snake':                { name: 'Snake Game',                         path: '/tools/game-snake.html' },
    'game-tictactoe':            { name: 'Tic Tac Toe',                        path: '/tools/game-tictactoe.html' },
    'game-connect-four':         { name: 'Connect Four',                       path: '/tools/game-connect-four.html' },
    'game-memory-cards':         { name: 'Memory Card Game',                   path: '/tools/game-memory-cards.html' },
    'game-minesweeper':          { name: 'Minesweeper',                        path: '/tools/game-minesweeper.html' }
  };

  var DEFAULT_TOOL = { name: 'ToolStack AI', path: '/' };

  function tool(key) {
    return TOOLS[key] || DEFAULT_TOOL;
  }

  function toolUrl(key) {
    var t = tool(key);
    return t.path === '/' ? SITE + '/' : SITE + t.path;
  }

  function shareText(key) {
    return 'Check out ' + tool(key).name +
      ' — free, no signup, runs right in your browser.';
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ---------------------------------------------------------------- sharing */

  var SHARE_BTN_CLASS =
    'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-700 ' +
    'hover:border-brand-500 text-gray-300 hover:text-brand-400 font-semibold ' +
    'text-xs transition';

  function shareLinks(key) {
    var url = toolUrl(key);
    var text = shareText(key);
    var both = encodeURIComponent(text + ' ' + url);
    return {
      whatsapp: 'https://api.whatsapp.com/send?text=' + both,
      x: 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) +
         '&url=' + encodeURIComponent(url),
      linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' +
                encodeURIComponent(url),
      facebook: 'https://www.facebook.com/sharer/sharer.php?u=' +
                encodeURIComponent(url)
    };
  }

  /**
   * YouTube and Instagram have no web share intent that accepts a URL, so those
   * two are buttons rather than links: they copy the tool link (and YouTube also
   * opens the site, where the link can be pasted into a post or community tab).
   */
  var YOUTUBE_URL = 'https://www.youtube.com/';

  /**
   * The post-result support card + share strip. Rendered from one place so
   * every tool — present and future — gets identical markup.
   */
  function resultActionsHTML(key) {
    var links = shareLinks(key);
    var external = 'target="_blank" rel="noopener noreferrer"';

    function link(href, network, glyph, label) {
      return '<a href="' + href + '" ' + external + ' data-ts-share="' + network +
             '" class="' + SHARE_BTN_CLASS + '">' +
             '<span aria-hidden="true">' + glyph + '</span> ' + label + '</a>';
    }

    function button(network, glyph, label) {
      return '<button type="button" data-ts-share="' + network +
             '" class="' + SHARE_BTN_CLASS + '">' +
             '<span aria-hidden="true">' + glyph + '</span> ' + label + '</button>';
    }

    return '' +
      '<div class="rounded-2xl border border-brand-500/25 bg-gradient-to-br from-brand-500/10 via-transparent to-transparent p-5">' +
        '<p class="text-sm text-gray-300 leading-relaxed">' +
          'Enjoying this tool? Support ToolStack AI so we can keep building and keeping these tools free for everyone.' +
        '</p>' +
        '<a href="' + SUPPORT_URL + '" ' + external + ' data-ts-support="' + escapeHtml(key) + '" ' +
           'class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold text-xs transition shadow-lg shadow-brand-500/20">' +
          '<span aria-hidden="true">❤️</span> Support toolstackai' +
        '</a>' +
      '</div>' +

      '<div class="rounded-2xl border border-gray-800 bg-gray-950/60 p-4">' +
        '<p class="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-3">Share this tool</p>' +
        '<div class="flex flex-wrap gap-2">' +
          link(links.whatsapp, 'whatsapp', '💬', 'WhatsApp') +
          link(links.x, 'x', '𝕏', 'X / Twitter') +
          link(links.linkedin, 'linkedin', 'in', 'LinkedIn') +
          link(links.facebook, 'facebook', 'f', 'Facebook') +
          button('youtube', '▶', 'YouTube') +
          button('instagram', '📸', 'Instagram') +
          button('copy', '🔗', 'Copy Link') +
        '</div>' +
      '</div>';
  }

  /* ------------------------------------------------------------------ toast */

  function toast(message) {
    var host = document.getElementById('ts-toast-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'ts-toast-host';
      host.className =
        'fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] flex flex-col ' +
        'items-center gap-2 pointer-events-none px-4 w-full max-w-sm';
      host.setAttribute('role', 'status');
      host.setAttribute('aria-live', 'polite');
      document.body.appendChild(host);
    }

    var el = document.createElement('div');
    el.className =
      'ts-toast px-4 py-2.5 rounded-xl bg-gray-900 border border-brand-500/40 ' +
      'text-gray-100 text-xs font-semibold shadow-2xl text-center';
    el.textContent = message;
    host.appendChild(el);

    window.setTimeout(function () {
      el.classList.add('ts-toast-out');
      window.setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 250);
    }, 2200);
  }

  /* --------------------------------------------------------------- clipboard */

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (err) {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }

  // navigator.clipboard is unavailable on non-secure origins, which is exactly
  // where a static preview or a LAN test tends to run.
  function copyText(text, done) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(
        function () { done(true); },
        function () { done(fallbackCopy(text)); }
      );
    } else {
      done(fallbackCopy(text));
    }
  }

  /* ------------------------------------------------------------- analytics */

  function track(name, params) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params || {});
    }
  }

  /* ------------------------------------------------------------- mounting */

  // Feedback shown after a copy-type share. Keyed by the data-ts-share value.
  var COPY_TOAST = {
    copy: 'Tool link copied!',
    youtube: 'Link copied — paste it into your video description or post.',
    instagram: "Link copied — Instagram won't link out, so paste it in your bio or story."
  };

  function wire(el, key) {
    el.addEventListener('click', function (e) {
      var target = e.target;
      if (!target || !target.closest) return;

      var shareEl = target.closest('[data-ts-share]');
      if (!shareEl) {
        if (target.closest('[data-ts-support]')) {
          track('support_click', {
            tool: key,
            location: el.getAttribute('data-ts-location') || 'result'
          });
        }
        return;
      }

      var method = shareEl.getAttribute('data-ts-share');

      // Networks with no web share intent that accepts a URL: the link goes to
      // the clipboard instead and the user pastes it.
      if (COPY_TOAST[method]) {
        e.preventDefault();
        var url = toolUrl(key);

        // Opened synchronously so it stays inside the user gesture — a
        // window.open() from the async copy callback would be popup-blocked.
        if (method === 'youtube') window.open(YOUTUBE_URL, '_blank', 'noopener');

        copyText(url, function (ok) {
          toast(ok ? COPY_TOAST[method] : 'Copy failed: ' + url);
          track('share', { method: method, tool: key });
        });
        return;
      }

      // WhatsApp / X / LinkedIn / Facebook are real anchors; just instrument.
      track('share', { method: method, tool: key });
    });
  }

  /**
   * Fill every [data-ts-result-actions] placeholder under `root`.
   * Add data-ts-deferred to start hidden until reveal() is called.
   */
  function mount(root) {
    var scope = root || document;
    if (!scope.querySelectorAll) return;

    var nodes = scope.querySelectorAll('[data-ts-result-actions]');
    Array.prototype.forEach.call(nodes, function (el) {
      if (el.getAttribute('data-ts-mounted') === '1') return;

      var key = el.getAttribute('data-ts-result-actions');
      el.innerHTML = resultActionsHTML(key);
      el.setAttribute('data-ts-mounted', '1');

      if (el.hasAttribute('data-ts-deferred')) {
        el.classList.add('hidden');
      }
      wire(el, key);
    });
  }

  /** Show a deferred strip once the tool has produced real output. */
  function reveal(el) {
    if (!el) return;
    el.classList.remove('hidden');
    el.removeAttribute('data-ts-deferred');
  }

  /* ----------------------------------------------------------------- theme */

  var THEME_KEY = 'theme';

  /**
   * The stored theme has already been applied to <html> by the inline snippet in
   * each page's <head> — that runs before first paint, which is the only way to
   * avoid a flash of the wrong theme. This module owns everything after that:
   * the click handler, persistence, and the accessibility state.
   *
   * Light — the magenta poster — is the default. The snippet only ever *adds*
   * the `dark` class, so a visitor with nothing stored, or with storage blocked
   * entirely, gets the light palette rather than whatever the OS prefers.
   *
   * The glyph swap is pure CSS (.ts-theme-dark / .ts-theme-light), so it tracks
   * <html class="dark"> with no chance of showing the wrong icon on load.
   */
  function isDark() {
    return document.documentElement.classList.contains('dark');
  }

  function syncThemeToggle() {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    var dark = isDark();
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  function setTheme(theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch (err) {
      // Private browsing / blocked storage: the theme still applies for this
      // page view, it just will not persist.
    }
    syncThemeToggle();
  }

  function initTheme() {
    syncThemeToggle();

    var btn = document.getElementById('themeToggle');
    if (!btn) return;

    btn.addEventListener('click', function () {
      setTheme(isDark() ? 'light' : 'dark');
    });
  }

  /* -------------------------------------------------- universal header search */

  /**
   * The header search box is one shared partial on every page, but only the
   * homepage has a tool grid to filter. Elsewhere it acts as a jump into the
   * homepage search so the control is never dead.
   */
  function initSearch() {
    var input = document.getElementById('searchInput');
    if (!input) return;
    if (document.getElementById('toolsGrid')) return; // homepage owns this

    input.placeholder = 'Search all tools...';

    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var q = input.value.trim();
      window.location.href = q
        ? '/?q=' + encodeURIComponent(q)
        : '/';
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== input) {
        e.preventDefault();
        input.focus();
      }
    });
  }

  function init() {
    initTheme();
    mount(document);
    initSearch();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.ToolStack = {
    SITE: SITE,
    SUPPORT_URL: SUPPORT_URL,
    COPYRIGHT: COPYRIGHT,
    TOOLS: TOOLS,
    toolUrl: toolUrl,
    shareText: shareText,
    shareLinks: shareLinks,
    resultActionsHTML: resultActionsHTML,
    mount: mount,
    reveal: reveal,
    toast: toast,
    copyText: copyText,
    track: track,
    setTheme: setTheme,
    isDark: isDark
  };
})(window, document);

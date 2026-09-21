/**
 * SEO Title & Snippet Optimizer — shared engine.
 *
 * Factory, not a singleton: the same code backs the standalone page at
 * /tools/seo-title-generator.html and any future modal. All lookups are scoped
 * to `root` so two instances would never collide.
 *
 * Required markup (ids, inside `root`):
 *   #stTitle #stKeyword #stBrand #stCharCount #stPixelCount #stWordCount #stScore
 *   #stSerpSite #stSerpUrl #stSerpTitle #stAnalyzeBtn #stCopyBtn #stStatus
 *   #stResults #stSuggestions
 *
 * The pixel measurement is the reason this tool exists, so it is worth being
 * precise about it: Google truncates a desktop result title at roughly 600
 * pixels of *rendered* text, not at a character count. A title of 58 characters
 * can overflow if it is full of capitals, and one of 68 can fit if it is mostly
 * narrow lowercase letters. Measuring with a canvas in the same font, weight and
 * size Google uses is the closest a browser-only tool can get without shipping
 * the actual font metrics.
 */
(function (window, document) {
  'use strict';

  // Google's desktop result title renders at 20px Arial. The 600px budget is the
  // widely observed truncation point; mobile is wider (~680px) but desktop is
  // the stricter of the two, so optimising for it satisfies both.
  var SERP_FONT = '20px Arial, sans-serif';
  var PIXEL_BUDGET = 600;
  var PIXEL_HARD = 640;

  // Words that reliably lift click-through in a result snippet. Deliberately
  // short and hand-checked rather than a scraped "power word" dump: a long list
  // stops meaning anything, because almost any title contains one of 300 words.
  var POWER_WORDS = [
    'free', 'best', 'guide', 'how to', 'template', 'checklist', 'examples',
    'tool', 'generator', 'calculator', 'comparison', 'vs', 'review', 'tips'
  ];

  var FILLER_STARTS = ['welcome to', 'home', 'untitled', 'page not found', 'index'];

  var STOP_WORDS = {
    a: 1, an: 1, the: 1, and: 1, or: 1, of: 1, for: 1, to: 1, in: 1,
    on: 1, with: 1, at: 1, by: 1, from: 1, is: 1, it: 1
  };

  var measureCtx = null;

  /** Measure a string the way Google renders it. Falls back to a heuristic. */
  function measurePixels(text) {
    if (!text) return 0;

    if (!measureCtx) {
      var canvas = document.createElement('canvas');
      if (canvas.getContext) measureCtx = canvas.getContext('2d');
    }

    if (measureCtx) {
      measureCtx.font = SERP_FONT;
      var width = measureCtx.measureText(text).width;
      // A zero reading means the canvas silently failed (blocked, or the font
      // never resolved). Fall back rather than reporting "0px, looks great".
      if (width > 0) return Math.round(width);
    }

    // Rough average for Arial at 20px: wide characters pull the mean up, which
    // is why capitals are weighted more heavily than lowercase.
    var total = 0;
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      total += ch >= 'A' && ch <= 'Z' ? 13 : 9.5;
    }
    return Math.round(total);
  }

  function words(str) {
    var trimmed = String(str).trim();
    return trimmed ? trimmed.split(/\s+/) : [];
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** True when `needle` appears in `haystack`, ignoring case and punctuation. */
  function contains(haystack, needle) {
    if (!needle) return false;
    var clean = function (s) {
      return String(s).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    };
    return clean(haystack).indexOf(clean(needle)) !== -1;
  }

  function createSeoTitleGenerator(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var titleInput = $('stTitle');
    var keywordInput = $('stKeyword');
    var brandInput = $('stBrand');

    var charEl = $('stCharCount');
    var pixelEl = $('stPixelCount');
    var wordEl = $('stWordCount');
    var scoreEl = $('stScore');

    var serpSite = $('stSerpSite');
    var serpUrl = $('stSerpUrl');
    var serpTitle = $('stSerpTitle');

    var analyzeBtn = $('stAnalyzeBtn');
    var copyBtn = $('stCopyBtn');
    var statusEl = $('stStatus');
    var resultsEl = $('stResults');
    var suggestionsEl = $('stSuggestions');

    if (!titleInput || !analyzeBtn) return null;

    /* ------------------------------------------------------------ analysis */

    /**
     * Build the report as data, not markup, so the SERP preview and the
     * suggestion list can never contradict each other.
     */
    function analyze() {
      var title = titleInput.value.trim();
      var keyword = keywordInput ? keywordInput.value.trim() : '';
      var brand = brandInput ? brandInput.value.trim() : '';

      var pixels = measurePixels(title);
      var wordList = words(title);
      var lower = title.toLowerCase();

      var report = {
        title: title,
        pixels: pixels,
        chars: title.length,
        wordCount: wordList.length,
        keywordPresent: contains(title, keyword),
        keywordEarly: false,
        keywordPosition: -1,
        issues: [],
        wins: [],
        score: 0
      };

      if (!title) {
        report.issues.push('There is no title yet — this is the single highest-impact tag on the page.');
        return report;
      }

      /* --- length ------------------------------------------------------- */
      if (pixels > PIXEL_HARD) {
        report.issues.push(
          'At ' + pixels + 'px this is roughly ' + (pixels - PIXEL_BUDGET) +
          'px over Google\'s desktop budget. Your headline will be cut off mid-phrase and replaced with an ellipsis.'
        );
      } else if (pixels > PIXEL_BUDGET) {
        report.issues.push(
          'At ' + pixels + 'px this slightly exceeds the ~' + PIXEL_BUDGET +
          'px Google renders on desktop. It may truncate on some queries.'
        );
      } else {
        report.wins.push('Fits inside the ~' + PIXEL_BUDGET + 'px Google renders on desktop (' + pixels + 'px used).');
      }

      if (title.length < 25) {
        report.issues.push('Under 25 characters is usually too short to say what the page is about or to match a real query.');
      }

      /* --- keyword ------------------------------------------------------ */
      if (keyword) {
        if (report.keywordPresent) {
          report.wins.push('Contains your primary keyword.');
          var idx = lower.indexOf(keyword.toLowerCase());
          if (idx !== -1) {
            report.keywordPosition = idx;
            if (idx <= Math.max(12, Math.floor(title.length * 0.25))) {
              report.keywordEarly = true;
              report.wins.push('The keyword appears near the front, which is where Google weighs it most.');
            } else {
              report.issues.push(
                'Your keyword first appears at character ' + (idx + 1) +
                '. Moving it towards the front means the part that survives truncation is the part that matches the query.'
              );
            }
          }
        } else {
          report.issues.push('The primary keyword "' + keyword + '" does not appear in the title at all.');
        }
      }

      /* --- structure ---------------------------------------------------- */
      FILLER_STARTS.forEach(function (filler) {
        if (lower.indexOf(filler) === 0) {
          report.issues.push('"' + filler + '" wastes the first characters of the title, which are the ones with the most weight and the least chance of being truncated.');
        }
      });

      if (brand && contains(title, brand)) {
        var brandIdx = lower.indexOf(brand.toLowerCase());
        if (brandIdx !== -1 && brandIdx < title.length * 0.35 && brandIdx < 30) {
          report.issues.push('The brand name is at the front. Unless people search for your brand specifically, lead with the descriptive phrase and move the brand to the end.');
        } else {
          report.wins.push('Brand name sits later in the title, leaving the front free for the descriptive phrase.');
        }
      }

      var hasPower = POWER_WORDS.some(function (w) { return lower.indexOf(w) !== -1; });
      if (hasPower) {
        report.wins.push('Uses a word that tends to lift click-through (free, guide, best, template and similar).');
      }

      var hasNumber = /\d/.test(title);
      if (hasNumber) {
        report.wins.push('Contains a number, which reliably draws the eye in a list of results.');
      }

      // Repeated non-stop-word terms read as keyword stuffing.
      var seen = {};
      var repeated = [];
      wordList.forEach(function (w) {
        var key = w.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!key || STOP_WORDS[key] || key.length < 4) return;
        if (seen[key]) {
          if (repeated.indexOf(key) === -1) repeated.push(key);
        } else {
          seen[key] = 1;
        }
      });
      if (repeated.length) {
        report.issues.push('Repeats ' + repeated.join(', ') + '. Duplicated terms read as keyword stuffing and cost you space.');
      }

      if (wordList.length > 12) {
        report.issues.push('At ' + wordList.length + ' words this is long for a title tag; most high-performing titles use 6–10.');
      }

      /* --- score -------------------------------------------------------- */
      // Starts at 100 and deducts for each problem; the weights reflect how
      // much each issue tends to matter, not a scientific measurement.
      var score = 100;
      score -= Math.max(0, pixels - PIXEL_BUDGET) / 12;
      if (title.length < 25) score -= 15;
      if (keyword && !report.keywordPresent) score -= 25;
      if (keyword && report.keywordPresent && !report.keywordEarly) score -= 8;
      score -= repeated.length * 6;
      if (wordList.length > 12) score -= 8;
      if (hasPower) score += 4;
      if (hasNumber) score += 3;

      report.score = Math.max(0, Math.min(100, Math.round(score)));
      return report;
    }

    /* ------------------------------------------------------------- display */

    function scoreClass(score) {
      if (score >= 80) return 'text-emerald-400';
      if (score >= 55) return 'text-amber-400';
      return 'text-rose-400';
    }

    function setMeters(report) {
      if (charEl) charEl.textContent = report.chars;
      if (wordEl) wordEl.textContent = report.wordCount;

      if (pixelEl) {
        pixelEl.innerHTML = report.pixels +
          '<span class="text-[10px] font-normal text-gray-500"> / ' + PIXEL_BUDGET + '</span>';
        pixelEl.className = 'text-lg font-black mt-1 ' +
          (report.pixels > PIXEL_BUDGET ? 'text-rose-400' : 'text-emerald-400');
      }

      if (scoreEl) {
        scoreEl.textContent = report.score;
        scoreEl.className = 'text-lg font-black mt-1 ' + scoreClass(report.score);
      }
    }

    function setSerp(report) {
      var title = report.title;
      if (serpTitle) {
        if (!title) {
          serpTitle.textContent = 'Your title appears here';
          serpTitle.className = 'text-base text-sky-400 leading-snug break-words';
        } else if (report.pixels > PIXEL_BUDGET) {
          // Show exactly where the cut lands rather than just saying "too long".
          var cut = Math.floor(title.length * (PIXEL_BUDGET / report.pixels));
          var shown = title.slice(0, cut);
          var space = shown.lastIndexOf(' ');
          if (space > cut * 0.6) shown = shown.slice(0, space);
          serpTitle.innerHTML = escapeHtml(shown) +
            '<span class="text-rose-400">…</span>' +
            '<span class="text-gray-600 line-through">' + escapeHtml(title.slice(shown.length)) + '</span>';
          serpTitle.className = 'text-base leading-snug break-words';
        } else {
          serpTitle.textContent = title;
          serpTitle.className = 'text-base text-sky-400 leading-snug break-words';
        }
      }

      // The site name and URL above a result come from the page's own domain,
      // not from the title — this tool has no URL field, so it shows the site
      // it is running on rather than inventing a plausible-looking one.
      if (serpSite) serpSite.textContent = 'ToolStack AI';
      if (serpUrl) serpUrl.textContent = 'https://toolstackai.xyz';
    }

    function renderSuggestions(report) {
      if (!suggestionsEl) return;

      var items = [];
      report.issues.forEach(function (text) {
        items.push({ kind: 'issue', text: text });
      });
      report.wins.forEach(function (text) {
        items.push({ kind: 'win', text: text });
      });

      if (!items.length) {
        items.push({ kind: 'win', text: 'No problems found. This title is well formed.' });
      }

      suggestionsEl.innerHTML = items.map(function (item) {
        var isIssue = item.kind === 'issue';
        return '<li class="flex gap-2.5 text-xs leading-relaxed rounded-xl border p-3 ' +
          (isIssue
            ? 'bg-rose-500/5 border-rose-500/20 text-gray-300'
            : 'bg-emerald-500/5 border-emerald-500/20 text-gray-300') + '">' +
          '<span aria-hidden="true" class="flex-shrink-0">' + (isIssue ? '⚠️' : '✅') + '</span>' +
          '<span>' + escapeHtml(item.text) + '</span>' +
          '</li>';
      }).join('');
    }

    function showStatus(message, isError) {
      if (!statusEl) return;
      statusEl.classList.remove(
        'hidden', 'bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/20',
        'bg-rose-500/10', 'text-rose-400', 'border-rose-500/20',
        'bg-amber-500/10', 'text-amber-400', 'border-amber-500/20'
      );
      statusEl.classList.add(
        isError ? 'bg-rose-500/10' : 'bg-emerald-500/10',
        isError ? 'text-rose-400' : 'text-emerald-400',
        isError ? 'border-rose-500/20' : 'border-emerald-500/20'
      );
      statusEl.textContent = (isError ? '❌ ' : '✅ ') + message;
    }

    function revealActions() {
      var actionsEl = root.querySelector('[data-ts-result-actions]');
      if (!actionsEl) return;
      actionsEl.classList.remove('hidden');
      if (window.ToolStack) {
        window.ToolStack.reveal(actionsEl);
        window.ToolStack.track('tool_output', { tool: 'seo-title-generator' });
      }
    }

    var lastReport = null;

    function live() {
      var report = analyze();
      setMeters(report);
      setSerp(report);
      return report;
    }

    function runAnalysis() {
      var report = live();
      lastReport = report;

      if (!report.title) {
        showStatus('Type a title first — there is nothing to analyze yet.', true);
        return;
      }

      renderSuggestions(report);
      resultsEl.classList.remove('hidden');

      showStatus(
        'Scored ' + report.score + '/100 — ' + report.pixels + 'px wide, ' +
        report.chars + ' characters, ' + report.wordCount + ' words. ' +
        report.issues.length + ' issue' + (report.issues.length === 1 ? '' : 's') + ' found.',
        report.issues.length > 0
      );

      revealActions();
    }

    /* --------------------------------------------------------------- events */

    [titleInput, keywordInput, brandInput].forEach(function (el) {
      if (el) el.addEventListener('input', live);
    });

    analyzeBtn.addEventListener('click', runAnalysis);

    // Enter in any field runs the analysis, which is what a form-shaped tool
    // trains people to expect.
    [titleInput, keywordInput, brandInput].forEach(function (el) {
      if (!el) return;
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          runAnalysis();
        }
      });
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var title = titleInput.value.trim();
        if (!title) {
          showStatus('There is no title to copy yet.', true);
          return;
        }

        var original = copyBtn.textContent;
        var done = function (ok) {
          copyBtn.textContent = ok ? '✅ Copied!' : '❌ Copy failed';
          window.setTimeout(function () { copyBtn.textContent = original; }, 2000);
        };

        if (window.ToolStack) {
          window.ToolStack.copyText(title, done);
        } else {
          done(false);
        }
      });
    }

    live();

    return {
      analyze: analyze,
      run: runAnalysis,
      report: function () { return lastReport; }
    };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createSeoTitleGenerator = createSeoTitleGenerator;
})(window, document);

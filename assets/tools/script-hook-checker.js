/**
 * Script Hook & Retention Checker — shared engine.
 *
 * Factory, not a singleton: the same scoring code backs the modal on
 * index.html and the standalone page at /tools/script-hook-checker.html.
 * Modal open/close is deliberately NOT here — that is page chrome.
 *
 * Required markup (ids, inside `root`):
 *   #hookInput #hookResults #hookStatus #hookScoreValue #hookScoreBar
 *   #hookGradeBadge #hookGradeNote #hookFrameworkCount #hookWordCount
 *   #hookReadTime #hookWordCounter #hookBreakdown #hookRewrites
 *   #analyzeHookBtn #clearHookBtn
 *
 * FRAMEWORKS and the topic-extraction helpers below are the substance of this
 * tool — they are tuned. The regexes encode editorial judgement about what
 * makes a short-form hook work; treat them as data.
 */
(function (window, document) {
  'use strict';

  function createHookChecker(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var hookInput = $('hookInput');
    var resultsBox = $('hookResults');
    var statusBanner = $('hookStatus');
    var scoreValueEl = $('hookScoreValue');
    var scoreBar = $('hookScoreBar');
    var gradeBadge = $('hookGradeBadge');
    var gradeNote = $('hookGradeNote');
    var frameworkCountEl = $('hookFrameworkCount');
    var wordCountEl = $('hookWordCount');
    var readTimeEl = $('hookReadTime');
    var counterEl = $('hookWordCounter');
    var breakdownEl = $('hookBreakdown');
    var rewritesEl = $('hookRewrites');

    if (!hookInput || !resultsBox) return null;

    // Retention frameworks. `weight` is what one distinct match earns, `extra` is
    // added per additional distinct match (capped at weight * 1.25).
    var FRAMEWORKS = [
      {
        key: 'curiosity',
        label: 'Curiosity Gap',
        icon: '🕳️',
        weight: 24,
        extra: 5,
        miss: 'No open loop. The viewer has no unanswered question forcing them to keep watching.',
        patterns: [
          /\b(nobody|no one|hardly anyone)\b/i,
          /\b(secret|secrets)\b/i,
          /\b(hidden|hiding|hide)\b/i,
          /\b(here'?s (why|what|how)|here is (why|what|how))\b/i,
          /\b(the reason (why|is))\b/i,
          /\b(you (won'?t|will not) believe)\b/i,
          /\b(most people (don'?t|do not|never))\b/i,
          /\b(until i (found|tried|learned|realised|realized))\b/i,
          /\b(didn'?t expect|wasn'?t expecting|did not expect)\b/i,
          /\b(this is (what|how|why))\b/i,
          /\b(what (happened|nobody|no one))\b/i,
          /\b(watch (this|until|till)|keep watching)\b/i,
          /\b(guess what|i bet you|you'?ll never guess)\b/i,
          /\b(what if i told you|they don'?t want you to know)\b/i
        ]
      },
      {
        key: 'boldclaim',
        label: 'Bold Claim',
        icon: '⚡',
        weight: 20,
        extra: 4,
        miss: 'No bold, specific claim. Nothing here promises a payoff worth staying for.',
        patterns: [
          /\b(best|worst|fastest|slowest|biggest|smallest|easiest|hardest|only way)\b/i,
          /\b(never|always|every single|everyone|nobody else)\b/i,
          /\b(guaranteed|instantly|overnight|in seconds|in minutes)\b/i,
          /\b(in \d+ (seconds|minutes|hours|days|weeks))\b/i,
          /\b(100%|zero effort|no effort|10x|2x|3x|doubled|tripled)\b/i,
          /\b(million|billion|thousand)\b/i,
          /\b(changed my life|game ?changer|life ?changing|never the same)\b/i
        ]
      },
      {
        key: 'negative',
        label: 'Negative Trigger',
        icon: '🚫',
        weight: 24,
        extra: 5,
        miss: 'No loss, mistake, or warning framing — the strongest scroll-stopper in short form.',
        patterns: [
          /\b(stop|quit|never)\b/i,
          /\b(don'?t|do not)\b/i,
          /\b(mistake|mistakes|messing up|screwing up)\b/i,
          /\b(wrong|backwards)\b/i,
          /\b(warning|danger|dangerous|risk|risky)\b/i,
          /\b(fail|failing|failed|failure)\b/i,
          /\b(ruin(ing|ed)?|kill(ing|ed)?|destroy(ing|ed)?)\b/i,
          /\b(lose|losing|lost|leak(ing|s|ed)?)\b/i,
          /\b(hate|scam|trap|trapped|nightmare|terrible|awful)\b/i,
          /\b(waste|wasting|wasted)\b/i,
          /\b(cost(ing|s)? you|killing your)\b/i
        ]
      },
      {
        key: 'problem',
        label: 'Direct Problem',
        icon: '🎯',
        weight: 22,
        extra: 4,
        miss: 'No audience callout or named pain point — the viewer cannot tell this is about them.',
        patterns: [
          /\b(if you'?re (a|an|the)?\s*\w+|if you are)\b/i,
          /\b(struggl(e|es|ing|ed)|stuck|frustrat(ed|ing|ion)|overwhelm(ed|ing))\b/i,
          /\b(tired of|sick of|fed up with)\b/i,
          /\b(can'?t (seem to|get|figure)|don'?t know (how|where) to)\b/i,
          /\b(you keep|keeps happening|every time you)\b/i,
          /\b(no (time|idea|clients|sales|views|traction))\b/i
        ],
        // A pain word only counts as a "direct problem" hook when it is aimed at the viewer.
        test: function (text) {
          var hits = [];
          var pain = /\b(struggl\w*|stuck|frustrat\w*|overwhelm\w*|problem|pain|hard|difficult|annoying|hate|wish|tired of|sick of|fed up|can'?t|don'?t know)\b/gi;
          var secondPerson = /\b(you|your|you'?re|yourself)\b/i;
          var m;
          while ((m = pain.exec(text)) !== null) {
            if (secondPerson.test(text)) hits.push(m[0]);
          }
          if (hits.length === 0 && /\b(if you'?re|if you are|tired of|sick of|fed up with|no (time|idea|clients|sales|views|traction))\b/i.test(text)) {
            var callout = text.match(/\b(if you'?re|if you are|tired of|sick of|fed up with|no (time|idea|clients|sales|views|traction))\b/i);
            hits.push(callout[0]);
          }
          return hits;
        }
      },
      {
        key: 'visual',
        label: 'Visual Cue',
        icon: '👀',
        weight: 16,
        extra: 4,
        miss: 'No instruction telling the eye where to look in frame — motion is what holds the first second.',
        patterns: [
          /\b(look at (this|that|these|him|her|it))\b/i,
          /\b(watch (this|what happens|closely))\b/i,
          /\b(right here|right there|over here)\b/i,
          /\b(this (thing|one|part|guy|tool|frame|clip))\b/i,
          /\b(see (this|how|what))\b/i,
          /\b(check (this|it) out)\b/i,
          /\b(on the (left|right|top|bottom)|behind me|in front of me)\b/i,
          /\b(as you can see|notice (this|how)|zoom in|look closely|point(ing)? at)\b/i,
          /\[[^\]]{2,60}\]/,
          /\([^)]*\b(shows?|cut to|close ?up|b-?roll|text on screen)\b[^)]*\)/i
        ]
      }
    ];

    // Openers that spend the hook on setup instead of tension.
    var WEAK_OPENERS = [
      { re: /^(hey|hi|hello|yo|sup|okay|ok|so|alright|um+|uh+)[\s,!.\-—]+(guys|everyone|everybody|friends|y'?all)?/i, label: 'a filler opener' },
      { re: /^(what'?s up|whats up|what is up)[\s,!.\-—]*(guys|everyone|y'?all)?/i, label: 'greeting' },
      { re: /\bwelcome back( to (my|the) channel)?\b/i, label: '"welcome back"' },
      { re: /\bin (this|today'?s) video\b/i, label: '"in this video"' },
      { re: /\bbefore we (start|begin|get into)\b/i, label: 'a pre-roll' },
      { re: /\b(don'?t forget to|make sure to) (like|subscribe|hit|follow|comment)\b/i, label: 'a subscribe ask' },
      { re: /\b(my name is|let me introduce myself)\b/i, label: 'an introduction' },
      { re: /\b(so today|today i'?m going to|in this video i)\b/i, label: '"today I\'m going to"' }
    ];

    var GRADES = [
      { min: 88, label: 'Viral', text: 'text-emerald-400', bar: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', note: 'This hook front-loads tension and a payoff promise — the pattern top short-form retention uses.' },
      { min: 60, label: 'Strong', text: 'text-sky-400', bar: 'bg-sky-500', badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20', note: 'Solid scroll-stopper: there is a reason to keep watching before the first cut.' },
      { min: 30, label: 'Moderate', text: 'text-amber-400', bar: 'bg-amber-500', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', note: 'It sets up a topic but leans on the viewer already caring. One sharper framework would lift it.' },
      { min: 0, label: 'Weak', text: 'text-red-400', bar: 'bg-red-500', badge: 'bg-red-500/10 text-red-400 border-red-500/20', note: 'This is a warm-up, not a hook — the first 3 seconds go by without tension, a claim, or a visual pull.' }
    ];

    // Appositive phrasing keeps these readable whether the topic came out as a
    // noun phrase ("social media marketing") or a verb phrase ("make a cake").
    var REWRITE_TEMPLATES = {
      curiosity: function (t) { return 'Here\'s the part nobody explains: ' + t + '.'; },
      negative: function (t) { return 'Nobody warns you about this: ' + t + ' — and it\'s quietly costing you reach.'; },
      boldclaim: function (t) { return 'This is the fastest way to fix it: ' + t + '.'; },
      problem: function (t) { return 'If this is your situation, stop scrolling: ' + t + '.'; },
      visual: function (t) { return 'Look at this — ' + t + ', and watch what happens.'; }
    };

    var POLISH_SUGGESTIONS = [
      'Move your strongest noun or number to the front. "3 seconds", "2 mistakes", "$400" all stop a scroll faster than an adjective.',
      'Cut every word before your sharpest claim so the promise lands inside the first second — you can explain after the cut.',
      'Say the hook out loud once. If you run out of breath before the point, it is two hooks fighting each other.'
    ];

    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, function (ch) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
      });
    }

    function showStatus(message, type) {
      statusBanner.textContent = message;
      statusBanner.className = 'mb-4 p-3 rounded-xl text-xs font-medium border ' + (type === 'error'
        ? 'bg-red-500/10 border-red-500/30 text-red-300'
        : 'bg-amber-500/10 border-amber-500/30 text-amber-300');
      statusBanner.classList.remove('hidden');
    }

    function hideStatus() {
      statusBanner.classList.add('hidden');
    }

    function matchPatterns(text, patterns) {
      var hits = [];
      patterns.forEach(function (re) {
        var m = text.match(re);
        if (m && m[0].trim()) hits.push(m[0].trim());
      });
      return hits;
    }

    // Words that carry no topic on their own, trimmed from either end of a phrase.
    var EDGE_WORDS = /^(a|an|the|i|i'?m|we|we'?re|you|you'?re|it|it'?s|this|that|these|those|my|your|our|to|of|in|on|at|for|and|but|if|so|then|is|are|was|were|be|do|does|did|just|really|very)$/i;

    // Setup phrasing stripped from the front of the topic, repeatedly. Order matters:
    // multi-word stage directions are consumed before the bare filler words inside them.
    var LEAD_STRIPS = [
      /^(look at (this|that|these)|watch (this|that)|check (this|that) out|see (this|that))\b[\s,!.\-—]*/i,
      /^(in (this|today'?s) video( i)?)[\s,!.\-—]+/i,
      /^(i'?m|i am|we'?re|we are|you'?re|you are|am|are|is)?\s*(going to|gonna|want to|about to)\s+/i,
      /^(talk about|talking about)\s+/i,
      /^(welcome back( to (my|the) channel)?)[\s,!.\-—]+/i,
      /^(stop|quit|never|don'?t|do not|avoid)\b[\s,!.\-—]*/i,
      /^(ok(ay)?|so|um+|uh+|hey|hi|hello|yo|guys|everyone|everybody|listen|look|alright|right|now|today)[\s,!.\-—]+/i,
      /^(if you'?re|if you are|when you'?re|when you are)\s+/i,
      /^(this is|that'?s|here'?s|here is|there'?s|there is)\s+/i,
      /^(the|a|an)\s+/i
    ];

    // Phrases that point at the frame rather than name the subject.
    var CUE_ONLY = /^(right|left|up|down|over|here|there|this|that|these|those|it|now)$/i;

    function wordList(text) {
      return text.split(/\s+/).filter(Boolean);
    }

    // Every place the fragment could be cut back to a single clause, shortest first.
    function clausePrefixes(fragment) {
      var re = /\s+(?:—|–|--|,|;)\s*|\s+\b(?:until|but|because|when|which)\b\s+/gi;
      var prefixes = [];
      var m;
      while ((m = re.exec(fragment)) !== null) {
        if (m.index > 0) prefixes.push(fragment.slice(0, m.index).trim());
        if (re.lastIndex === m.index) re.lastIndex++;
      }
      prefixes.push(fragment);
      return prefixes;
    }

    function cleanPhrase(phrase) {
      var t = phrase;
      var prev;
      do {
        prev = t;
        LEAD_STRIPS.forEach(function (re) { t = t.replace(re, ''); });
      } while (t !== prev && t.length > 0);

      var words = wordList(t.replace(/[.!?,;:]+$/g, '').trim());
      while (words.length > 1 && EDGE_WORDS.test(words[words.length - 1])) words.pop();
      while (words.length > 1 && EDGE_WORDS.test(words[0])) words.shift();
      return words.slice(0, 10).join(' ');
    }

    // Pull the subject out of the hook so rewrites read like the user's own idea.
    function extractTopic(raw) {
      var text = String(raw).replace(/\s+/g, ' ').replace(/\[[^\]]*\]/g, ' ').replace(/\([^)]*\)/g, ' ').trim();
      var fragments = text.split(/[.!?;:]+/).map(function (f) { return f.trim(); }).filter(function (f) { return f.length > 0; });
      if (fragments.length === 0) return 'this';

      // Longest fragment first — greetings and setup tend to be the short ones.
      var ordered = fragments.slice().sort(function (a, b) { return wordList(b).length - wordList(a).length; });
      for (var i = 0; i < ordered.length; i++) {
        var prefixes = clausePrefixes(ordered[i]);
        for (var j = 0; j < prefixes.length; j++) {
          var cleaned = cleanPhrase(prefixes[j]);
          var words = wordList(cleaned);
          // Skip empties, single words, phrases that still span two clauses,
          // and ones that only point at the frame ("right here").
          if (words.length >= 2 && !words.every(function (w) { return CUE_ONLY.test(w); }) && !/[;—]|,\s/.test(cleaned)) return cleaned;
        }
      }
      return 'this';
    }

    function updateCounter() {
      var words = wordList(hookInput.value.trim());
      counterEl.textContent = words.length + ' word' + (words.length === 1 ? '' : 's') + ' · ' + (words.length / 3).toFixed(1) + 's';
    }

    function analyze() {
      var raw = hookInput.value.trim();
      if (!raw) {
        showStatus('Paste your opening line first so there is something to score.', 'error');
        resultsBox.classList.add('hidden');
        return;
      }

      var text = raw.replace(/\s+/g, ' ');
      var words = wordList(text);
      var wordCount = words.length;

      var results = FRAMEWORKS.map(function (fw) {
        var hits = fw.test ? fw.test(text) : matchPatterns(text, fw.patterns);
        var points = hits.length === 0 ? 0 : Math.min(Math.round(fw.weight * 1.25), fw.weight + (hits.length - 1) * fw.extra);
        return { key: fw.key, label: fw.label, icon: fw.icon, miss: fw.miss, hits: hits, points: points, weight: fw.weight };
      });

      var score = results.reduce(function (sum, r) { return sum + r.points; }, 0);

      // Specificity and direct address sharpen any framework.
      var bonuses = [];
      if (/\b\d+\b/.test(text)) { score += 6; bonuses.push('specific number'); }
      if (/\b(you|your|you'?re|yourself)\b/i.test(text)) { score += 4; bonuses.push('direct address'); }
      if (/\b(but|except|until|yet|instead)\b/i.test(text)) { score += 4; bonuses.push('a turn'); }

      // Setup openers cost the first second.
      var weakHits = [];
      var setupWords = 0;
      WEAK_OPENERS.forEach(function (entry) {
        var m = entry.re.exec(text);
        if (m && weakHits.indexOf(entry.label) === -1) {
          weakHits.push(entry.label);
          setupWords += wordList(m[0]).length;
        }
      });
      var weakPenalty = Math.min(24, weakHits.length * 12);
      score -= weakPenalty;

      if (wordCount < 5) score -= 8;
      else if (wordCount > 20) score -= 8;

      score = Math.max(0, Math.min(100, score));

      var grade = GRADES.find(function (g) { return score >= g.min; });
      var hitsCount = results.filter(function (r) { return r.hits.length > 0; }).length;
      var misses = results.filter(function (r) { return r.hits.length === 0; }).sort(function (a, b) { return b.weight - a.weight; });

      scoreValueEl.className = 'text-3xl font-black ' + grade.text;
      scoreValueEl.innerHTML = score + '<span class="text-base font-bold text-gray-500">/100</span>';
      gradeBadge.textContent = grade.label;
      gradeBadge.className = 'px-3 py-1 rounded-full text-[11px] font-semibold border ' + grade.badge;
      scoreBar.className = 'h-full rounded-full transition-all duration-500 ' + grade.bar;
      scoreBar.style.width = score + '%';

      var seconds = wordCount / 3;
      frameworkCountEl.textContent = hitsCount + '/' + FRAMEWORKS.length;
      wordCountEl.textContent = wordCount;
      readTimeEl.textContent = seconds.toFixed(1) + 's';
      readTimeEl.className = 'text-lg font-bold ' + (seconds <= 3.2 ? 'text-emerald-400' : seconds <= 5 ? 'text-amber-400' : 'text-red-400');

      var notes = [grade.note];
      if (wordCount > 20) notes.push('At ' + wordCount + ' words this runs past 3 seconds — trim to 8–14.');
      else if (wordCount < 5) notes.push('Only ' + wordCount + ' words is thin for a spoken hook — the first frame has to carry it.');
      if (misses.length === 1) notes.push('Only ' + misses[0].label + ' is missing.');
      else if (misses.length > 1) notes.push('Biggest gaps: ' + misses.slice(0, 2).map(function (m) { return m.label; }).join(' and ') + '.');
      else notes.push('All five frameworks fire — the remaining work is delivery.');
      if (bonuses.length) notes.push('Working in your favour: ' + bonuses.join(', ') + '.');
      gradeNote.textContent = notes.join(' ');

      if (weakHits.length) {
        showStatus('Setup detected at the top (' + weakHits.join(', ') + ') — roughly ' + Math.min(3, setupWords / 3).toFixed(1) + 's of your first 3 go by before the point lands. Cut it and open on the tension.', 'warn');
      } else {
        hideStatus();
      }

      breakdownEl.innerHTML = results.map(function (r) {
        var hit = r.hits.length > 0;
        var detail = hit ? 'Matched: "' + r.hits.slice(0, 3).join('", "') + '"' : r.miss;
        return '<li class="bg-gray-950 border border-gray-800 rounded-xl p-3">'
          + '<div class="flex items-start justify-between gap-3">'
          + '<div class="flex items-start gap-2 min-w-0">'
          + '<span class="text-base leading-none">' + r.icon + '</span>'
          + '<div class="min-w-0">'
          + '<p class="text-xs font-bold text-gray-200">' + escapeHtml(r.label) + '</p>'
          + '<p class="text-[11px] mt-0.5 leading-relaxed ' + (hit ? 'text-emerald-400/90' : 'text-gray-500') + '">' + escapeHtml(detail) + '</p>'
          + '</div></div>'
          + '<span class="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border ' + (hit ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-800 text-gray-500 border-gray-700') + '">'
          + (hit ? '+' + r.points : 'Missing') + '</span>'
          + '</div></li>';
      }).join('');

      // Rewrites target the frameworks that are missing, strongest gap first.
      var topic = extractTopic(raw);
      var rewrites = misses.slice(0, 3).map(function (m) {
        return { framework: m.label, text: REWRITE_TEMPLATES[m.key](topic) };
      });
      POLISH_SUGGESTIONS.forEach(function (tip) {
        if (rewrites.length < 2) rewrites.push({ framework: 'Tighten It', text: tip });
      });

      rewritesEl.innerHTML = rewrites.map(function (item) {
        return ''
          + '<div class="bg-gray-950 border border-gray-800 rounded-xl p-3 flex items-start justify-between gap-3">'
          + '<div class="min-w-0">'
          + '<p class="text-[10px] uppercase tracking-wider text-brand-400 font-bold mb-1">' + escapeHtml(item.framework) + '</p>'
          + '<p class="text-xs text-gray-200 leading-relaxed">' + escapeHtml(item.text) + '</p>'
          + '</div>'
          + '<button type="button" class="hook-copy flex-shrink-0 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-[10px] font-semibold text-gray-300 transition" data-rewrite="' + escapeHtml(item.text) + '">Copy</button>'
          + '</div>';
      }).join('');

      resultsBox.classList.remove('hidden');
      if (window.ToolStack) window.ToolStack.track('tool_output', { tool: 'script-hook-checker', score: score });
    }

    rewritesEl.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.hook-copy') : null;
      if (!btn) return;
      var text = btn.getAttribute('data-rewrite') || '';
      var done = function () {
        btn.textContent = 'Copied';
        window.setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
      };

      if (window.ToolStack) {
        window.ToolStack.copyText(text, function (ok) {
          if (ok) { done(); return; }
          window.ToolStack.toast('Copy failed — select the text manually.');
        });
        return;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else {
        done();
      }
    });

    var analyzeBtn = $('analyzeHookBtn');
    if (analyzeBtn) analyzeBtn.addEventListener('click', analyze);

    var clearBtn = $('clearHookBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        hookInput.value = '';
        hideStatus();
        updateCounter();
        resultsBox.classList.add('hidden');
      });
    }

    // Re-score live once a first analysis has been run.
    hookInput.addEventListener('input', function () {
      updateCounter();
      if (!resultsBox.classList.contains('hidden')) analyze();
    });
    hookInput.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        analyze();
      }
    });

    updateCounter();

    return {
      analyze: analyze,
      focus: function () { hookInput.focus(); }
    };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createHookChecker = createHookChecker;
})(window, document);

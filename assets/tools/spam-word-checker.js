/**
 * Cold Email Spam-Word Checker — shared engine.
 *
 * Factory, not a singleton: the same scoring code backs the modal on
 * index.html and the standalone page at /tools/spam-word-checker.html.
 * Modal open/close is deliberately NOT here — that is page chrome, not tool
 * logic, and each host wires it differently.
 *
 * Required markup (ids, inside `root`):
 *   #spamSubject #spamBody #spamResults #spamStatus #spamScoreValue
 *   #spamScoreBar #spamGradeBadge #spamGradeNote #spamTermsCount
 *   #spamWordCount #spamDensity #spamHighlight #spamTips
 *   #analyzeSpamBtn #clearSpamBtn
 *
 * The trigger-word tables below are the substance of this tool. Treat them as
 * data, not code: they are tuned, and the weights (12 / 8 / 3) feed directly
 * into the score.
 */
(function (window, document) {
  'use strict';

  function createSpamChecker(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var subjectInput = $('spamSubject');
    var bodyInput = $('spamBody');
    var resultsBox = $('spamResults');
    var statusBanner = $('spamStatus');
    var scoreValue = $('spamScoreValue');
    var scoreBar = $('spamScoreBar');
    var gradeBadge = $('spamGradeBadge');
    var gradeNote = $('spamGradeNote');
    var termsCountEl = $('spamTermsCount');
    var wordCountEl = $('spamWordCount');
    var densityEl = $('spamDensity');
    var highlightEl = $('spamHighlight');
    var tipsEl = $('spamTips');

    if (!subjectInput || !bodyInput || !resultsBox) return null;

    // Trigger word tiers: [term, category]. Weight is set by the tier.
    var SEVERE_TERMS = [
      ['100% free', 'promise'], ['100% guaranteed', 'promise'], ['no risk', 'promise'], ['risk-free', 'promise'], ['risk free', 'promise'],
      ['guarantee', 'promise'], ['guaranteed', 'promise'], ['satisfaction guaranteed', 'promise'], ['no strings attached', 'promise'],
      ['once in a lifetime', 'promise'], ['why pay more', 'promise'], ['nothing to lose', 'promise'],
      ['act now', 'urgency'], ['limited time', 'urgency'], ['offer expires', 'urgency'], ['expires today', 'urgency'],
      ['while supplies last', 'urgency'], ['this will not last', 'urgency'], ['time limited', 'urgency'],
      ['apply now', 'cta'], ['buy now', 'cta'], ['click here', 'cta'], ['order now', 'cta'], ['call now', 'cta'],
      ['take action now', 'cta'], ['what are you waiting for', 'cta'],
      ['cash', 'money'], ['make money', 'money'], ['money back', 'money'], ['money-back', 'money'], ['fast cash', 'money'],
      ['extra cash', 'money'], ['earn extra cash', 'money'], ['easy money', 'money'], ['serious cash', 'money'],
      ['pure profit', 'money'], ['wire transfer', 'money'], ['million dollars', 'money'], ['double your', 'money'],
      ['extra income', 'money'], ['passive income', 'money'], ['financial freedom', 'money'], ['work from home', 'money'],
      ['be your own boss', 'money'], ['get paid', 'money'], ['instant approval', 'money'],
      ['no credit check', 'debt'], ['pre-approved', 'debt'], ['unsecured debt', 'debt'], ['eliminate debt', 'debt'],
      ['get out of debt', 'debt'], ['consolidate your debt', 'debt'], ['credit card', 'debt'], ['low interest rate', 'debt'],
      ['you have been selected', 'deception'], ['you are a winner', 'deception'], ['congratulations', 'deception'],
      ['winner', 'deception'], ['dear friend', 'deception'], ['this is not spam', 'deception'], ['not a scam', 'deception'],
      ['we hate spam', 'deception'], ['do not delete', 'deception'],
      ['viagra', 'health'], ['cialis', 'health'], ['no prescription', 'health'], ['weight loss', 'health'],
      ['miracle', 'health'], ['pharmacy', 'health'], ['pills', 'health'], ['supplement', 'health'],
      ['anti-aging', 'health'], ['all natural', 'health'],
      ['casino', 'deception'], ['lottery', 'deception'], ['lowest price', 'promise']
    ];

    var MODERATE_TERMS = [
      ['urgent', 'urgency'], ['limited offer', 'urgency'], ['special promotion', 'urgency'], ['exclusive deal', 'urgency'],
      ['expires soon', 'urgency'], ['today only', 'urgency'], ['last chance', 'urgency'], ['final notice', 'urgency'],
      ['do not miss', 'urgency'], ['hurry', 'urgency'],
      ['opt in', 'cta'], ['subscribe now', 'cta'], ['sign up free', 'cta'], ['download now', 'cta'],
      ['get started today', 'cta'], ['reserve your spot', 'cta'],
      ['great offer', 'promise'], ['amazing deal', 'promise'], ['incredible deal', 'promise'], ['special deal', 'promise'],
      ['best price', 'promise'], ['compare rates', 'promise'], ['save big', 'promise'], ['big savings', 'promise'],
      ['drastically reduced', 'promise'], ['free gift', 'promise'], ['free sample', 'promise'], ['free access', 'promise'],
      ['free consultation', 'promise'], ['free trial', 'promise'], ['trial offer', 'promise'], ['no obligation', 'promise'],
      ['no catch', 'promise'], ['no fees', 'promise'], ['no hidden costs', 'promise'], ['no hidden fees', 'promise'],
      ['hidden charges', 'promise'], ['promise you', 'promise'],
      ['discount', 'money'], ['cheap', 'money'], ['low interest', 'money'], ['potential earnings', 'money'],
      ['your income', 'money'], ['double your income', 'money'], ['join millions', 'money'], ['millions of', 'money'],
      ['stock pick', 'money'], ['day trading', 'money'], ['bitcoin investment', 'money'], ['crypto investment', 'money'],
      ['home based business', 'money'], ['no experience required', 'money'],
      ['information you requested', 'deception'], ['remove this', 'deception'], ['dear customer', 'deception'],
      ['valued customer', 'deception'], ['as seen on', 'deception'], ['bulk email', 'deception'], ['mass email', 'deception'],
      ['subject to credit approval', 'debt'], ['lower your', 'money'], ['unbelievable', 'deception']
    ];

    var MILD_TERMS = [
      ['free', 'promise'], ['offer', 'promise'], ['deal', 'promise'], ['sale', 'promise'], ['promotion', 'promise'],
      ['opportunity', 'promise'], ['profit', 'money'], ['income', 'money'], ['savings', 'money'], ['subscribe', 'cta'],
      ['newsletter', 'cta'], ['limited', 'urgency'], ['instant', 'urgency'], ['trial', 'promise'], ['exclusive', 'promise'],
      ['bonus', 'promise'], ['premium', 'promise']
    ];

    var SPAM_TERMS = []
      .concat(SEVERE_TERMS.map(function (pair) { return { term: pair[0], weight: 12, cat: pair[1] }; }))
      .concat(MODERATE_TERMS.map(function (pair) { return { term: pair[0], weight: 8, cat: pair[1] }; }))
      .concat(MILD_TERMS.map(function (pair) { return { term: pair[0], weight: 3, cat: pair[1] }; }));

    // Longest terms first, so "100% free" wins over the bare word "free".
    var SORTED_TERMS = SPAM_TERMS.slice().sort(function (a, b) { return b.term.length - a.term.length; });

    // Everyday phrases that contain a mild trigger but are not spammy.
    var MILD_EXCEPTIONS = ['feel free', 'free of charge', 'toll-free', 'toll free', 'freelance', 'free time', 'debt-free', 'paperless'];

    var CATEGORY_TIPS = {
      promise: 'Replace guarantees and "risk-free" claims with a specific, provable outcome — vague promises are the single biggest trigger.',
      urgency: 'Drop artificial deadlines. Genuine dated urgency informs; "act now" and "limited time" read as pressure tactics.',
      money: 'Money-claim language ("cash", "earn", "income") is weighted heavily by filters. Describe the value, not the payout.',
      cta: 'Use one natural call to action. Stacked "click here" / "buy now" phrasing is a hallmark of bulk mail.',
      debt: 'Credit, loan, and debt phrasing trips financial filters — lead with the customer outcome, not the product category.',
      health: 'Health, supplement, and pharmacy claims are aggressively filtered. Cite a source or drop the claim entirely.'
    };

    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, function (ch) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
      });
    }

    function escapeRegExp(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function buildRegex(term) {
      var left = /^[a-z0-9]/i.test(term) ? '\\b' : '';
      var right = /[a-z0-9]$/i.test(term) ? '\\b' : '';
      return new RegExp(left + escapeRegExp(term) + right, 'gi');
    }

    function isExcepted(text, start, end, term) {
      var ctxStart = Math.max(0, start - 10);
      var ctx = text.slice(ctxStart, Math.min(text.length, end + 10)).toLowerCase();
      var rel = start - ctxStart;
      return MILD_EXCEPTIONS.some(function (phrase) {
        var idx = ctx.indexOf(phrase);
        while (idx !== -1) {
          if (idx <= rel && rel + term.length <= idx + phrase.length) return true;
          idx = ctx.indexOf(phrase, idx + 1);
        }
        return false;
      });
    }

    // Non-overlapping matches, most specific phrase wins.
    function findMatches(text) {
      var taken = [];
      var found = [];
      SORTED_TERMS.forEach(function (entry) {
        var re = buildRegex(entry.term);
        var m;
        while ((m = re.exec(text)) !== null) {
          if (m[0].length === 0) { re.lastIndex++; continue; }
          var start = m.index;
          var end = start + m[0].length;
          var overlaps = taken.some(function (range) { return start < range[1] && end > range[0]; });
          if (overlaps) continue;
          if (entry.weight === 3 && isExcepted(text, start, end, m[0].toLowerCase())) continue;
          taken.push([start, end]);
          found.push({ term: entry.term, display: m[0], weight: entry.weight, cat: entry.cat, start: start, end: end });
        }
      });
      return found.sort(function (a, b) { return a.start - b.start; });
    }

    function highlight(text, matches) {
      var html = '';
      var cursor = 0;
      matches.forEach(function (m) {
        html += escapeHtml(text.slice(cursor, m.start));
        var cls = m.weight >= 12
          ? 'bg-red-500/25 text-red-300 border-b border-red-500/60'
          : m.weight >= 8
            ? 'bg-amber-500/25 text-amber-300 border-b border-amber-500/60'
            : 'bg-yellow-500/20 text-yellow-200 border-b border-yellow-500/50';
        html += '<mark class="' + cls + ' rounded px-0.5 font-semibold" title="' + escapeHtml(m.term) + '">' + escapeHtml(m.display) + '</mark>';
        cursor = m.end;
      });
      html += escapeHtml(text.slice(cursor));
      return html;
    }

    function gradeFor(score) {
      if (score >= 90) return { label: 'Excellent', text: 'text-emerald-400', bar: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', note: 'Inbox-ready. Keep the copy specific, personal, and free of hype.' };
      if (score >= 75) return { label: 'Good', text: 'text-lime-400', bar: 'bg-lime-500', badge: 'bg-lime-500/10 text-lime-400 border-lime-500/20', note: 'Minor tweaks will push this from Promotions into the primary inbox.' };
      if (score >= 55) return { label: 'Risky', text: 'text-amber-400', bar: 'bg-amber-500', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', note: 'Likely to land in Promotions, or in spam on a cold domain.' };
      return { label: 'High Risk', text: 'text-red-400', bar: 'bg-red-500', badge: 'bg-red-500/10 text-red-400 border-red-500/20', note: 'Filters will very likely block or junk this email. Rewrite before sending.' };
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

    function analyze() {
      var subject = subjectInput.value.trim();
      var body = bodyInput.value.trim();

      if (!subject && !body) {
        showStatus('Paste a subject line or email body to analyze.', 'error');
        resultsBox.classList.add('hidden');
        return;
      }
      hideStatus();

      var subjectMatches = findMatches(subject);
      var bodyMatches = findMatches(body);
      var matches = subjectMatches.concat(bodyMatches);

      var wordSource = (subject + ' ' + body).match(/[A-Za-z0-9'’-]+/g) || [];
      var words = wordSource.length;
      var termPenalty = Math.min(75, matches.reduce(function (sum, m) { return sum + m.weight; }, 0));

      var catTips = [];
      var structTips = [];
      var seenTips = new Set();
      var structurePenalty = 0;

      function addTip(list, text) {
        if (seenTips.has(text)) return;
        seenTips.add(text);
        list.push(text);
      }

      function addIssue(penalty, tip) {
        structurePenalty += penalty;
        addTip(structTips, tip);
      }

      matches.forEach(function (m) {
        var tip = CATEGORY_TIPS[m.cat];
        if (tip) addTip(catTips, tip);
      });

      // Shouting: ALL-CAPS words (common acronyms excluded).
      var capsWords = (subject + ' ' + body).match(/\b[A-Z]{3,}\b/g) || [];
      var realCaps = capsWords.filter(function (w) {
        return !/^(CEO|CTO|CFO|COO|API|CRM|SEO|URL|PDF|FAQ|USA|UK|EU|AI|SaaS|B2B|B2C|ROI|KPI|ASAP|Q[1-4]|P\.S|PS|OK)$/.test(w);
      });
      if (realCaps.length >= 5) {
        addIssue(10, realCaps.length + ' words are in ALL CAPS (' + realCaps.slice(0, 4).join(', ') + '…). Sentence case reads as a personal note instead of a blast.');
      } else if (realCaps.length >= 2) {
        addIssue(6, 'ALL-CAPS words detected (' + realCaps.join(', ') + '). Filters treat sustained capitalisation as shouting.');
      } else if (realCaps.length === 1) {
        addIssue(3, '"' + realCaps[0] + '" is in all caps — sentence case scores better with spam filters.');
      }

      // Punctuation & symbols.
      var bangs = (subject + ' ' + body).match(/!/g) || [];
      if (bangs.length >= 4) {
        addIssue(10, bangs.length + ' exclamation marks is a classic spam signature. Keep at most one, or none.');
      } else if (bangs.length >= 2) {
        addIssue(6, 'Multiple exclamation marks (' + bangs.length + ') lower deliverability. One calm sentence works better.');
      }

      var moneySymbols = (subject + ' ' + body).match(/[$€£]/g) || [];
      if (moneySymbols.length >= 3) {
        addIssue(8, 'Currency symbols appear ' + moneySymbols.length + ' times. Mention price once, or link to a pricing page.');
      } else if (moneySymbols.length >= 1) {
        addIssue(4, 'Currency symbols can trip financial filters. Keep at most one price reference in the copy.');
      }

      var links = (subject + ' ' + body).match(/https?:\/\/\S+|www\.\S+/gi) || [];
      if (links.length >= 3) {
        addIssue(10, links.length + ' links is too many for a cold email. Use one primary link plus your signature.');
      } else if (links.length === 2) {
        addIssue(6, 'Two links detected. Cold emails perform best with a single clear destination.');
      }

      if (/\b\d{1,3}\s?%\s*(off|discount|savings|free)/i.test(subject + ' ' + body)) {
        addIssue(6, 'Percent-off phrasing ("X% off") pushes mail toward the Promotions tab. Lead with the outcome, not the discount.');
      }

      // Structure.
      if (!subject) {
        addTip(structTips, 'Add a subject line — 4 to 7 specific words outperform generic ones and lift open rates.');
      } else if (subject.length > 65) {
        addIssue(5, 'Subject line is ' + subject.length + ' characters. Keep it under 60 so it is not truncated on mobile.');
      }

      if (body && words < 30) {
        addIssue(6, 'Only ' + words + ' words of copy. Thin, link-heavy emails get filtered — explain why you are reaching out.');
      }

      if (words >= 60 && !/unsubscribe|opt[\s-]?out|email preferences|manage preferences/i.test(body)) {
        addIssue(5, 'No opt-out line found. Longer outreach should include a simple "reply STOP or unsubscribe" line for CAN-SPAM/GDPR compliance.');
      }

      if (words > 0 && matches.length > 0) {
        var density = matches.length / words;
        if (density > 0.06) {
          addIssue(6, 'Trigger words make up ' + (density * 100).toFixed(1) + '% of your copy. That density alone can flag a filter — cut the hype words rather than rewording them.');
        }
      }

      var score = Math.max(0, Math.min(100, Math.round(100 - termPenalty - structurePenalty)));
      var grade = gradeFor(score);

      // Score panel
      scoreValue.textContent = score + '%';
      scoreValue.className = 'text-3xl font-black ' + grade.text;
      scoreBar.style.width = score + '%';
      scoreBar.className = 'h-full rounded-full transition-all duration-500 ' + grade.bar;
      gradeBadge.textContent = grade.label;
      gradeBadge.className = 'px-3 py-1 rounded-full text-[11px] font-semibold border ' + grade.badge;
      gradeNote.textContent = grade.note;
      termsCountEl.textContent = matches.length;
      wordCountEl.textContent = words;
      densityEl.textContent = words > 0 ? ((matches.length / words) * 100).toFixed(1) + '%' : '0%';

      // Highlighted preview
      var html = '';
      if (subject) {
        html += '<p class="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Subject</p>'
          + '<p class="mb-3 font-semibold text-gray-200">' + highlight(subject, subjectMatches) + '</p>';
      }
      if (body) {
        html += '<p class="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Body</p>'
          + highlight(body, bodyMatches);
      }
      highlightEl.innerHTML = html;

      // Tips
      var tips = catTips.concat(structTips);
      if (matches.length === 0 && tips.length === 0) {
        tips.push('No spam trigger words detected. Keep the copy this specific and you will stay in the inbox.');
      }
      tipsEl.innerHTML = tips.map(function (tip) {
        return '<li class="flex gap-2 text-xs text-gray-300 leading-relaxed">'
          + '<span class="text-brand-400 flex-shrink-0">→</span><span>' + escapeHtml(tip) + '</span></li>';
      }).join('');

      resultsBox.classList.remove('hidden');
      if (window.ToolStack) window.ToolStack.track('tool_output', { tool: 'spam-word-checker', score: score });
    }

    var analyzeBtn = $('analyzeSpamBtn');
    if (analyzeBtn) analyzeBtn.addEventListener('click', analyze);

    var clearBtn = $('clearSpamBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        subjectInput.value = '';
        bodyInput.value = '';
        hideStatus();
        resultsBox.classList.add('hidden');
      });
    }

    // Re-score live once a first analysis has been run.
    [subjectInput, bodyInput].forEach(function (el) {
      el.addEventListener('input', function () {
        if (!resultsBox.classList.contains('hidden')) analyze();
      });
      el.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          analyze();
        }
      });
    });

    return { analyze: analyze };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createSpamChecker = createSpamChecker;
})(window, document);

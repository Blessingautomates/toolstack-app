/**
 * Which AI Tool Should I Use? — recommendation quiz engine.
 *
 * Factory, not a singleton: the same code backs the standalone page at
 * /tools/ai-tool-quiz.html and any future modal. All lookups are scoped to
 * `root` so two instances would never collide.
 *
 * Required markup (ids, inside `root`):
 *   #aqQuestions #aqResult #aqProgressLabel #aqProgressBar #aqRestartBtn #aqStatus
 * Optional:
 *   [data-ts-result-actions] with data-ts-deferred — revealed with the result.
 *
 * The QUESTIONS table is the substance of this tool. Each option carries an
 * explicit `scores` map, so the reasoning shown to the user is derived from the
 * same numbers that produced the recommendation — the explanations cannot drift
 * away from the scoring.
 *
 * MAINTENANCE: weights encode real constraints, not preferences. A context
 * window requirement or a self-hosting requirement should be able to override
 * everything else, so those options carry decisive scores rather than nudges.
 */
(function (window, document) {
  'use strict';

  var MODELS = {
    chatgpt: {
      name: 'ChatGPT',
      maker: 'OpenAI',
      icon: '💬',
      url: 'https://chatgpt.com',
      blurb: 'The broadest ecosystem — voice, images, custom GPTs and integrations nearly everywhere.',
      paid: 'Plus, around $20/month'
    },
    claude: {
      name: 'Claude',
      maker: 'Anthropic',
      icon: '🧠',
      url: 'https://claude.ai',
      blurb: 'Long documents, careful editing and code work, with fewer confident mistakes.',
      paid: 'Pro, around $20/month'
    },
    deepseek: {
      name: 'DeepSeek',
      maker: 'DeepSeek',
      icon: '🐋',
      url: 'https://www.deepseek.com',
      blurb: 'By far the cheapest per token, with open weights you can self-host.',
      paid: 'API pricing far below the others'
    },
    gemini: {
      name: 'Gemini',
      maker: 'Google',
      icon: '✨',
      url: 'https://gemini.google.com',
      blurb: 'The largest context window, plus deep Google Workspace integration.',
      paid: 'Google AI Pro, around $20/month'
    }
  };

  /**
   * `scores` values are relative weights, not probabilities. 6 is decisive
   * (it should win on its own), 3 is a strong preference, 1 is a tie-breaker.
   */
  var QUESTIONS = [
    {
      id: 'task',
      question: 'What are you mostly trying to get done?',
      help: 'Pick the one that describes most of your week.',
      options: [
        {
          label: 'Writing, editing and rewriting text',
          scores: { claude: 3, chatgpt: 2, gemini: 1 },
          why: 'you are doing writing and editing work'
        },
        {
          label: 'Writing or debugging code',
          scores: { claude: 3, chatgpt: 2, deepseek: 2 },
          why: 'your work is code-heavy'
        },
        {
          label: 'Analysing long documents, contracts or transcripts',
          scores: { claude: 3, gemini: 3 },
          why: 'you need to work through long documents'
        },
        {
          label: 'Automating a product via API at volume',
          scores: { deepseek: 4, gemini: 1 },
          why: 'you are calling a model from code rather than chatting with it'
        }
      ]
    },
    {
      id: 'size',
      question: 'How big are your typical inputs?',
      help: 'This is the constraint that most often rules a model out.',
      options: [
        {
          label: 'A few paragraphs or a short prompt',
          scores: { chatgpt: 2, deepseek: 2 },
          why: 'your inputs are short, so context window is not a constraint'
        },
        {
          label: 'Several pages — reports, articles, long emails',
          scores: { claude: 2, chatgpt: 1, gemini: 1 },
          why: 'you are working with multi-page inputs'
        },
        {
          label: 'An entire codebase, book or hour-long transcript',
          scores: { gemini: 4, claude: 2 },
          why: 'your inputs are large enough that context window decides it'
        },
        {
          label: 'Not sure yet',
          scores: { chatgpt: 2 },
          why: 'you are still working out what you need'
        }
      ]
    },
    {
      id: 'integration',
      question: 'Where does the work already live?',
      help: 'A model that lives inside your existing tools saves a lot of copy-paste.',
      options: [
        {
          label: 'Google Workspace — Gmail, Docs, Sheets',
          scores: { gemini: 4 },
          why: 'your work lives in Google Workspace'
        },
        {
          label: 'Microsoft 365 or a mixed toolchain',
          scores: { chatgpt: 3 },
          why: 'you are on Microsoft 365 or a mixed toolchain'
        },
        {
          label: 'A code editor and a terminal',
          scores: { claude: 2, deepseek: 2 },
          why: 'you work primarily in an editor and terminal'
        },
        {
          label: 'A standalone chat window is fine',
          scores: { chatgpt: 1, claude: 1, deepseek: 1, gemini: 1 },
          why: 'you do not need deep integration with other software'
        }
      ]
    },
    {
      id: 'privacy',
      question: 'What are the rules on your data?',
      help: 'If data legally cannot leave your infrastructure, this answer decides everything.',
      options: [
        {
          label: 'Standard consumer terms are fine',
          scores: { chatgpt: 2, claude: 2, gemini: 2, deepseek: 1 },
          why: 'standard consumer data terms are acceptable for your work'
        },
        {
          label: 'It should stay within the US or EU',
          scores: { claude: 3, chatgpt: 3, gemini: 2, deepseek: -4 },
          why: 'you need data residency in the US or EU'
        },
        {
          label: 'It must never leave my own servers',
          scores: { deepseek: 8, chatgpt: -3, claude: -3, gemini: -3 },
          why: 'your data cannot leave your own infrastructure, which requires self-hosting'
        },
        {
          label: 'Haven\'t thought about it',
          scores: { chatgpt: 1, claude: 1 },
          why: 'data residency has not been a deciding factor so far'
        }
      ]
    },
    {
      id: 'budget',
      question: 'What is your budget?',
      help: 'All four have usable free tiers — this is about what you would pay for more.',
      options: [
        {
          label: 'Free tier only, for now',
          scores: { chatgpt: 1, claude: 1, deepseek: 3, gemini: 2 },
          why: 'you want to stay on a free tier'
        },
        {
          label: 'Around $20/month is fine',
          scores: { chatgpt: 2, claude: 2, gemini: 2 },
          why: 'a roughly $20/month plan fits your budget'
        },
        {
          label: 'Cheapest possible per token',
          scores: { deepseek: 6 },
          why: 'cost per token is the deciding factor'
        },
        {
          label: 'Whatever works best',
          scores: { claude: 1, chatgpt: 1, gemini: 1 },
          why: 'budget is not the constraint'
        }
      ]
    }
  ];

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function createAiToolQuiz(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var questionsEl = $('aqQuestions');
    var resultEl = $('aqResult');
    var progressLabel = $('aqProgressLabel');
    var progressBar = $('aqProgressBar');
    var restartBtn = $('aqRestartBtn');
    var statusEl = $('aqStatus');

    if (!questionsEl || !resultEl) return null;

    // answers[questionId] = option index
    var answers = {};

    /* --------------------------------------------------------------- render */

    function renderQuestions() {
      questionsEl.innerHTML = QUESTIONS.map(function (q, qIndex) {
        var chosen = answers[q.id];

        var options = q.options.map(function (opt, oIndex) {
          var on = chosen === oIndex;
          return '' +
            '<button type="button" data-question="' + q.id + '" data-option="' + oIndex + '" ' +
              'aria-pressed="' + (on ? 'true' : 'false') + '" ' +
              'class="w-full text-left px-4 py-3 rounded-xl border text-xs font-medium transition ' +
              (on
                ? 'bg-brand-500/10 border-brand-500 text-gray-100'
                : 'bg-gray-950 border-gray-800 text-gray-300 hover:border-gray-700 hover:text-gray-100') + '">' +
              '<span class="flex items-start gap-2.5">' +
                '<span aria-hidden="true" class="flex-shrink-0 w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ' +
                  (on ? 'border-brand-500 bg-brand-500' : 'border-gray-700') + '">' +
                  (on ? '<span class="w-1.5 h-1.5 rounded-full bg-gray-950"></span>' : '') +
                '</span>' +
                '<span>' + escapeHtml(opt.label) + '</span>' +
              '</span>' +
            '</button>';
        }).join('');

        return '' +
          '<fieldset class="rounded-2xl border border-gray-800 bg-gray-900/40 p-4">' +
            '<legend class="px-1 text-xs font-bold text-gray-200">' +
              '<span class="text-brand-500 font-mono mr-1.5">' + (qIndex + 1) + '.</span>' +
              escapeHtml(q.question) +
            '</legend>' +
            '<p class="text-[11px] text-gray-500 mb-3 mt-1 leading-relaxed">' + escapeHtml(q.help) + '</p>' +
            '<div class="grid gap-2">' + options + '</div>' +
          '</fieldset>';
      }).join('');
    }

    function answeredCount() {
      return QUESTIONS.filter(function (q) {
        return answers[q.id] !== undefined;
      }).length;
    }

    function renderProgress() {
      var done = answeredCount();
      var pct = Math.round((done / QUESTIONS.length) * 100);

      if (progressBar) progressBar.style.width = pct + '%';
      if (progressLabel) {
        progressLabel.textContent = done === QUESTIONS.length
          ? 'All ' + QUESTIONS.length + ' answered'
          : 'Question ' + Math.min(done + 1, QUESTIONS.length) + ' of ' + QUESTIONS.length;
      }
    }

    function showStatus(message, tone) {
      if (!statusEl) return;
      statusEl.classList.remove(
        'hidden', 'bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/20',
        'bg-brand-500/10', 'text-brand-400', 'border-brand-500/20'
      );
      if (tone === 'done') {
        statusEl.classList.add('bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/20');
      } else {
        statusEl.classList.add('bg-brand-500/10', 'text-brand-400', 'border-brand-500/20');
      }
      statusEl.textContent = (tone === 'done' ? '✅ ' : '') + message;
    }

    /* -------------------------------------------------------------- scoring */

    function tally() {
      var totals = { chatgpt: 0, claude: 0, deepseek: 0, gemini: 0 };
      var reasons = [];

      QUESTIONS.forEach(function (q) {
        var index = answers[q.id];
        if (index === undefined) return;

        var opt = q.options[index];
        Object.keys(opt.scores).forEach(function (key) {
          totals[key] += opt.scores[key];
        });

        // Keep the reason only when the answer actually pushed some model up,
        // so the summary explains the result rather than listing every click.
        var pushed = Object.keys(opt.scores).some(function (key) {
          return opt.scores[key] >= 3;
        });
        if (pushed) reasons.push(opt.why);
      });

      var ranked = Object.keys(totals).sort(function (a, b) {
        return totals[b] - totals[a];
      });

      return { totals: totals, ranked: ranked, reasons: reasons };
    }

    function renderResult() {
      var outcome = tally();
      var winner = outcome.ranked[0];
      var runnerUp = outcome.ranked[1];
      var win = MODELS[winner];
      var run = MODELS[runnerUp];

      var max = Math.max.apply(null, Object.keys(outcome.totals).map(function (k) {
        return outcome.totals[k];
      }));

      var bars = outcome.ranked.map(function (key) {
        var m = MODELS[key];
        var score = outcome.totals[key];
        // Negative scores are possible (a self-hosting requirement actively
        // rules models out); clamp the bar so it never renders backwards.
        var pct = max > 0 ? Math.max(0, Math.round((score / max) * 100)) : 0;
        return '' +
          '<div>' +
            '<div class="flex items-center justify-between text-[11px] mb-1">' +
              '<span class="text-gray-300 font-semibold">' + m.icon + ' ' + escapeHtml(m.name) + '</span>' +
              '<span class="font-mono text-gray-500">' + score + '</span>' +
            '</div>' +
            '<div class="h-1.5 rounded-full bg-gray-950 border border-gray-800 overflow-hidden">' +
              '<div class="h-full ' + (key === winner ? 'bg-brand-500' : 'bg-gray-700') +
                ' transition-all duration-500" style="width: ' + pct + '%"></div>' +
            '</div>' +
          '</div>';
      }).join('');

      resultEl.innerHTML = '' +
        '<div class="rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-500/10 via-transparent to-transparent p-5">' +
          '<p class="text-[10px] uppercase tracking-wider text-brand-400 font-bold mb-2">Your recommendation</p>' +
          '<div class="flex items-start gap-3">' +
            '<div class="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-2xl flex-shrink-0">' +
              win.icon + '</div>' +
            '<div class="min-w-0">' +
              '<p class="text-lg font-black text-gray-50">' + escapeHtml(win.name) +
                ' <span class="text-xs font-normal text-gray-500">by ' + escapeHtml(win.maker) + '</span></p>' +
              '<p class="text-xs text-gray-400 mt-1 leading-relaxed">' + escapeHtml(win.blurb) + '</p>' +
            '</div>' +
          '</div>' +

          '<p class="text-xs text-gray-300 mt-4 leading-relaxed">' +
            'This scored highest because ' +
            escapeHtml(outcome.reasons.slice(0, 3).join(', and ')) + '.' +
          '</p>' +

          '<div class="flex flex-wrap gap-2 mt-4">' +
            '<a href="' + escapeHtml(win.url) + '" target="_blank" rel="noopener noreferrer" ' +
              'class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold text-xs transition">' +
              'Try ' + escapeHtml(win.name) + ' free ↗</a>' +
            '<a href="/tools/ai-model-comparison.html" ' +
              'class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-700 hover:border-brand-500 text-gray-300 hover:text-brand-400 font-semibold text-xs transition">' +
              'See the full comparison →</a>' +
          '</div>' +
        '</div>' +

        '<div class="mt-4 rounded-2xl border border-gray-800 bg-gray-950 p-4">' +
          '<p class="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-3">How the four scored</p>' +
          '<div class="space-y-3">' + bars + '</div>' +
        '</div>' +

        '<div class="mt-4 rounded-2xl border border-gray-800 bg-gray-950 p-4">' +
          '<p class="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">Close second: ' +
            escapeHtml(run.name) + '</p>' +
          '<p class="text-xs text-gray-400 leading-relaxed">' +
            escapeHtml(run.blurb) + ' The top two are usually within a few points, so it is worth running the same real task ' +
            'through both free tiers before you commit to a subscription.' +
          '</p>' +
        '</div>';

      resultEl.classList.remove('hidden');

      var actionsEl = root.querySelector('[data-ts-result-actions]');
      if (actionsEl) {
        actionsEl.classList.remove('hidden');
        if (window.ToolStack) {
          window.ToolStack.reveal(actionsEl);
          window.ToolStack.track('tool_output', { tool: 'ai-tool-quiz', result: winner });
        }
      }

      showStatus('Result: ' + win.name + ' (runner-up ' + run.name + '). Treat it as a shortlist, not a verdict.', 'done');

      resultEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    function hideResult() {
      resultEl.classList.add('hidden');
      resultEl.innerHTML = '';
    }

    /* --------------------------------------------------------------- events */

    questionsEl.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-option]') : null;
      if (!btn) return;

      var questionId = btn.getAttribute('data-question');
      var optionIndex = parseInt(btn.getAttribute('data-option'), 10);

      // Clicking the current answer clears it, which is the only way to undo a
      // misclick without a separate "reset this question" control.
      if (answers[questionId] === optionIndex) {
        delete answers[questionId];
      } else {
        answers[questionId] = optionIndex;
      }

      renderQuestions();
      renderProgress();
      hideResult();

      var done = answeredCount();
      if (done === QUESTIONS.length) {
        renderResult();
      } else {
        showStatus(
          done + ' of ' + QUESTIONS.length + ' answered — ' +
          (QUESTIONS.length - done) + ' to go before the recommendation appears.'
        );
      }
    });

    if (restartBtn) {
      restartBtn.addEventListener('click', function () {
        answers = {};
        renderQuestions();
        renderProgress();
        hideResult();
        showStatus('Cleared. Answer the five questions to get a fresh recommendation.');
        if (window.ToolStack) {
          window.ToolStack.track('quiz_restart', { tool: 'ai-tool-quiz' });
        }
      });
    }

    renderQuestions();
    renderProgress();
    showStatus('Answer all ' + QUESTIONS.length + ' questions — the recommendation appears as soon as the last one is set.');

    return {
      questions: QUESTIONS,
      answers: function () { return answers; },
      reset: function () {
        answers = {};
        renderQuestions();
        renderProgress();
        hideResult();
      }
    };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createAiToolQuiz = createAiToolQuiz;
})(window, document);

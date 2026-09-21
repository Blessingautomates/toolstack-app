/**
 * AI Model Comparison Matrix — shared engine.
 *
 * Factory, not a singleton. The MODELS table below is the substance of this
 * tool: treat it as data, not code.
 *
 * Required markup (ids, inside `root`):
 *   #amcChips #amcTableBody #amcCount #amcEmpty #amcResetBtn #amcDetail #amcStatus
 *   — filter buttons are .amc-chip[data-filter] inside #amcChips
 *
 * MAINTENANCE: context windows, model names and prices move every few months at
 * every provider. These entries are hand-checked rather than scraped, so they
 * can lag — which is exactly why the page carries a visible "confirm current
 * pricing" warning and why nothing here should be presented as a live quote.
 * When updating, keep `watchOut` honest: a table with no downsides is an advert.
 */
(function (window, document) {
  'use strict';

  var FILTERS = [
    { id: 'all',       label: 'All models',   icon: '🌐' },
    { id: 'writing',   label: 'Writing',      icon: '✍️' },
    { id: 'coding',    label: 'Coding',       icon: '💻' },
    { id: 'longform',  label: 'Long documents', icon: '📚' },
    { id: 'budget',    label: 'Budget',       icon: '💸' },
    { id: 'ecosystem', label: 'Ecosystem',    icon: '🧩' }
  ];

  var MODELS = [
    {
      name: 'ChatGPT',
      maker: 'OpenAI',
      icon: '💬',
      context: 'Varies by model — roughly 128K, larger on the newest tiers',
      freeTier: 'Yes — capable models with usage caps',
      paidTier: 'Plus, around $20/month',
      strength: 'Widest ecosystem: voice, image generation, custom GPTs, and integrations everywhere',
      url: 'https://chatgpt.com',
      tags: ['writing', 'coding', 'ecosystem'],
      good: [
        'The safest default if you want one subscription that covers the most ground',
        'Best-in-class voice mode and image generation built into the same product',
        'Enormous third-party ecosystem — most tools integrate with it first'
      ],
      watchOut: [
        'Free tier rate-limits quickly during peak hours',
        'Model names and capabilities shift often, so older tutorials go stale fast',
        'Context window is smaller than Gemini\'s on comparable tiers'
      ],
      bestFor: 'General-purpose work where you want one tool that does a bit of everything.'
    },
    {
      name: 'Claude',
      maker: 'Anthropic',
      icon: '🧠',
      context: 'Large — around 200K as standard, extended on higher tiers',
      freeTier: 'Yes — daily message limits',
      paidTier: 'Pro, around $20/month',
      strength: 'Long-document analysis, careful editing and code work with fewer confident mistakes',
      url: 'https://claude.ai',
      tags: ['writing', 'coding', 'longform'],
      good: [
        'Handles very long inputs — contracts, transcripts, whole repositories — without losing the thread',
        'Tends to follow instructions precisely rather than improvising around them',
        'Strong at code review, refactoring and explaining unfamiliar code'
      ],
      watchOut: [
        'No image generation, so it is not a one-stop creative tool',
        'Free tier message limits are strict enough to interrupt a long session',
        'Smaller plugin ecosystem than ChatGPT\'s'
      ],
      bestFor: 'Long documents, codebases and editing work where accuracy matters more than breadth.'
    },
    {
      name: 'DeepSeek',
      maker: 'DeepSeek',
      icon: '🐋',
      context: 'Around 128K on the current chat models',
      freeTier: 'Yes — the chat app is free to use',
      paidTier: 'API pricing is dramatically lower than the mainstream providers',
      strength: 'Reasoning quality per dollar, plus open-weight models you can self-host',
      url: 'https://www.deepseek.com',
      tags: ['budget', 'coding'],
      good: [
        'By far the cheapest per token of the four for API work',
        'Open weights mean you can self-host and keep data entirely on your own infrastructure',
        'Strong step-by-step reasoning for maths, logic and structured problem solving'
      ],
      watchOut: [
        'Data residency and privacy policies differ from US and EU providers — check before sending sensitive material',
        'Smaller ecosystem: fewer integrations, plugins and third-party tools',
        'Throughput and availability have been less predictable during demand spikes'
      ],
      bestFor: 'High-volume API workloads and anyone who needs to self-host for privacy or cost.'
    },
    {
      name: 'Gemini',
      maker: 'Google',
      icon: '✨',
      context: 'The largest of the four — up to around 1M tokens on top tiers',
      freeTier: 'Yes — generous, tied to a Google account',
      paidTier: 'Google AI Pro, around $20/month',
      strength: 'Huge context window and deep Google Workspace integration',
      url: 'https://gemini.google.com',
      tags: ['longform', 'ecosystem', 'writing'],
      good: [
        'The context window to beat — useful for whole codebases and hour-long transcripts',
        'Works inside Gmail, Docs and Sheets where the work already lives',
        'Natively multimodal, with strong image and video understanding'
      ],
      watchOut: [
        'Quality can vary more between models in the family than at other providers',
        'The best context lengths require the paid tier — the free tier is much smaller',
        'Workspace features are only as good as your organisation\'s Google setup'
      ],
      bestFor: 'Very large inputs and teams already living inside Google Workspace.'
    }
  ];

  var CHIP_BASE =
    'amc-chip px-3 py-1.5 rounded-xl text-xs font-semibold border transition ';
  var CHIP_OFF =
    'bg-gray-950 border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700';
  var CHIP_ON =
    'bg-brand-500 border-brand-500 text-gray-950';

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function createAiModelComparison(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var chipsEl = $('amcChips');
    var tbody = $('amcTableBody');
    var countEl = $('amcCount');
    var emptyEl = $('amcEmpty');
    var resetBtn = $('amcResetBtn');
    var detailEl = $('amcDetail');
    var statusEl = $('amcStatus');

    if (!tbody || !chipsEl) return null;

    var activeFilter = 'all';
    var selected = null;

    /* --------------------------------------------------------------- render */

    function visible() {
      if (activeFilter === 'all') return MODELS;
      return MODELS.filter(function (m) {
        return m.tags.indexOf(activeFilter) !== -1;
      });
    }

    function renderChips() {
      chipsEl.innerHTML = FILTERS.map(function (f) {
        var on = f.id === activeFilter;
        return '<button type="button" data-filter="' + f.id + '" ' +
          'class="' + CHIP_BASE + (on ? CHIP_ON : CHIP_OFF) + '" ' +
          'aria-pressed="' + (on ? 'true' : 'false') + '">' +
          '<span aria-hidden="true">' + f.icon + '</span> ' + escapeHtml(f.label) +
          '</button>';
      }).join('');
    }

    function renderTable() {
      var models = visible();

      tbody.innerHTML = models.map(function (m) {
        var isSelected = selected === m.name;
        return '' +
          '<tr data-model="' + escapeHtml(m.name) + '" tabindex="0" role="button" ' +
              'aria-label="Show details for ' + escapeHtml(m.name) + '" ' +
              'class="cursor-pointer border-b border-gray-800/60 last:border-b-0 transition ' +
              (isSelected ? 'bg-brand-500/10' : 'hover:bg-gray-950') + '">' +
            '<th scope="row" class="px-4 py-3 text-left align-top">' +
              '<span class="flex items-center gap-2 text-sm font-bold text-gray-100 whitespace-nowrap">' +
                '<span aria-hidden="true">' + m.icon + '</span>' + escapeHtml(m.name) +
              '</span>' +
            '</th>' +
            '<td class="px-4 py-3 align-top text-xs text-gray-400 whitespace-nowrap">' + escapeHtml(m.maker) + '</td>' +
            '<td class="px-4 py-3 align-top text-xs text-gray-400">' + escapeHtml(m.context) + '</td>' +
            '<td class="px-4 py-3 align-top text-xs text-gray-400">' + escapeHtml(m.freeTier) + '</td>' +
            '<td class="px-4 py-3 align-top text-xs text-gray-400">' + escapeHtml(m.paidTier) + '</td>' +
            '<td class="px-4 py-3 align-top text-xs text-gray-300 min-w-[16rem]">' + escapeHtml(m.strength) + '</td>' +
          '</tr>';
      }).join('');

      if (emptyEl) emptyEl.classList.toggle('hidden', models.length > 0);

      if (countEl) {
        var label = activeFilter === 'all'
          ? 'All four models'
          : FILTERS.filter(function (f) { return f.id === activeFilter; })[0].label;
        countEl.textContent = models.length + ' of ' + MODELS.length +
          ' models · ' + label;
      }
    }

    function renderDetail() {
      if (!detailEl) return;

      var model = null;
      MODELS.forEach(function (m) { if (m.name === selected) model = m; });

      if (!model) {
        detailEl.classList.add('hidden');
        detailEl.innerHTML = '';
        return;
      }

      function list(items, marker, colour) {
        return '<ul class="space-y-2 text-xs text-gray-400 leading-relaxed">' +
          items.map(function (t) {
            return '<li class="flex gap-2.5"><span aria-hidden="true" class="flex-shrink-0 ' +
              colour + '">' + marker + '</span><span>' + escapeHtml(t) + '</span></li>';
          }).join('') + '</ul>';
      }

      detailEl.innerHTML = '' +
        '<div class="flex items-start justify-between gap-4 mb-4">' +
          '<div class="flex items-center gap-3">' +
            '<div class="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-xl">' +
              model.icon + '</div>' +
            '<div>' +
              '<p class="text-sm font-bold text-gray-100">' + escapeHtml(model.name) +
                ' <span class="text-gray-500 font-normal">by ' + escapeHtml(model.maker) + '</span></p>' +
              '<p class="text-[11px] text-gray-500">' + escapeHtml(model.bestFor) + '</p>' +
            '</div>' +
          '</div>' +
          '<button type="button" data-amc-close ' +
            'class="flex-shrink-0 px-3 py-1.5 rounded-xl border border-gray-700 hover:border-brand-500 text-gray-400 hover:text-brand-400 font-semibold text-[10px] transition">Close</button>' +
        '</div>' +

        '<div class="grid sm:grid-cols-2 gap-5">' +
          '<div>' +
            '<p class="text-[10px] uppercase tracking-wider text-emerald-400 font-bold mb-2">Good at</p>' +
            list(model.good, '✓', 'text-emerald-400') +
          '</div>' +
          '<div>' +
            '<p class="text-[10px] uppercase tracking-wider text-amber-400 font-bold mb-2">Watch out for</p>' +
            list(model.watchOut, '!', 'text-amber-400') +
          '</div>' +
        '</div>' +

        '<a href="' + escapeHtml(model.url) + '" target="_blank" rel="noopener noreferrer" ' +
          'class="mt-5 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-700 hover:border-brand-500 text-gray-300 hover:text-brand-400 font-semibold text-xs transition">' +
          'Open ' + escapeHtml(model.name) + ' ↗</a>';

      detailEl.classList.remove('hidden');
    }

    function showStatus(message) {
      if (!statusEl) return;
      statusEl.classList.remove('hidden', 'bg-brand-500/10', 'text-brand-400', 'border-brand-500/20');
      statusEl.classList.add('bg-brand-500/10', 'text-brand-400', 'border-brand-500/20');
      statusEl.textContent = message;
    }

    function render() {
      renderChips();
      renderTable();
      renderDetail();
    }

    function selectModel(name) {
      selected = selected === name ? null : name;
      renderTable();
      renderDetail();

      if (selected && window.ToolStack) {
        window.ToolStack.track('compare_select', { tool: 'ai-model-comparison', model: selected });
      }
    }

    /* --------------------------------------------------------------- events */

    chipsEl.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-filter]') : null;
      if (!btn) return;

      activeFilter = btn.getAttribute('data-filter');

      // A model hidden by the new filter would otherwise stay open in the
      // detail panel, describing a row the user can no longer see.
      if (selected) {
        var stillVisible = visible().some(function (m) { return m.name === selected; });
        if (!stillVisible) selected = null;
      }

      render();
      if (window.ToolStack) {
        window.ToolStack.track('compare_filter', { tool: 'ai-model-comparison', filter: activeFilter });
      }
    });

    tbody.addEventListener('click', function (e) {
      var row = e.target && e.target.closest ? e.target.closest('[data-model]') : null;
      if (!row) return;
      selectModel(row.getAttribute('data-model'));
    });

    tbody.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var row = e.target && e.target.closest ? e.target.closest('[data-model]') : null;
      if (!row) return;
      e.preventDefault();
      selectModel(row.getAttribute('data-model'));
    });

    if (detailEl) {
      detailEl.addEventListener('click', function (e) {
        if (e.target && e.target.closest && e.target.closest('[data-amc-close]')) {
          selected = null;
          renderTable();
          renderDetail();
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        activeFilter = 'all';
        selected = null;
        render();
      });
    }

    render();
    showStatus('Pick a task to filter the matrix, then click a model for the honest trade-offs.');

    return {
      models: MODELS,
      filter: function (id) { activeFilter = id; render(); },
      selected: function () { return selected; }
    };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createAiModelComparison = createAiModelComparison;
})(window, document);

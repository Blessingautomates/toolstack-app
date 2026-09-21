/**
 * AI Service Status Board — shared engine.
 *
 * Factory, not a singleton. Modal open/close is deliberately NOT here — that is
 * page chrome, not tool logic.
 *
 * Required markup (ids, inside `root`):
 *   #statusList #statusOverallDot #statusOverallText #statusLastChecked
 *   #refreshStatusBtn #refreshStatusIcon
 *
 * IMPORTANT — this board is a SIMULATION. It performs no network requests and
 * is not connected to any provider's status API. The figures are generated
 * locally to demonstrate the layout. Any host page MUST keep the on-page
 * disclaimer that says so; removing it would misrepresent the tool.
 */
(function (window, document) {
  'use strict';

  var STATUS_TYPES = {
    operational: {
      label: 'Operational',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dot: 'bg-emerald-500',
      weight: 0.78
    },
    degraded: {
      label: 'Degraded',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      dot: 'bg-amber-500',
      weight: 0.17
    },
    outage: {
      label: 'Outage',
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      dot: 'bg-rose-500',
      weight: 0.05
    }
  };

  function createAiStatusBoard(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var listEl = $('statusList');
    var overallDot = $('statusOverallDot');
    var overallText = $('statusOverallText');
    var lastChecked = $('statusLastChecked');
    var refreshBtn = $('refreshStatusBtn');
    var refreshIcon = $('refreshStatusIcon');

    if (!listEl) return null;

    var services = [
      { name: 'ChatGPT',    provider: 'OpenAI',      icon: '💬', status: 'operational', uptime: '99.98%', latency: 412 },
      { name: 'Claude',     provider: 'Anthropic',   icon: '🧠', status: 'operational', uptime: '99.95%', latency: 386 },
      { name: 'Midjourney', provider: 'Midjourney',  icon: '🎨', status: 'operational', uptime: '99.71%', latency: 1240 },
      { name: 'ElevenLabs', provider: 'ElevenLabs',  icon: '🔊', status: 'operational', uptime: '99.89%', latency: 640 },
      { name: 'Suno',       provider: 'Suno AI',     icon: '🎵', status: 'degraded',    uptime: '98.42%', latency: 2180 },
      { name: 'Cursor',     provider: 'Anysphere',   icon: '🖱️', status: 'operational', uptime: '99.93%', latency: 298 }
    ];

    function randomStatus() {
      var roll = Math.random();
      var acc = 0;
      for (var key in STATUS_TYPES) {
        if (!Object.prototype.hasOwnProperty.call(STATUS_TYPES, key)) continue;
        acc += STATUS_TYPES[key].weight;
        if (roll <= acc) return key;
      }
      return 'operational';
    }

    function renderRows() {
      listEl.innerHTML = services.map(function (svc) {
        var type = STATUS_TYPES[svc.status];
        return '' +
          '<div class="flex items-center justify-between gap-4 bg-gray-950 border border-gray-800 rounded-xl p-4">' +
            '<div class="flex items-center gap-3 min-w-0">' +
              '<div class="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-lg flex-shrink-0">' + svc.icon + '</div>' +
              '<div class="min-w-0">' +
                '<p class="text-sm font-bold text-gray-100 truncate">' + svc.name + '</p>' +
                '<p class="text-[11px] text-gray-500">' + svc.provider + ' · Uptime 30d: ' + svc.uptime + ' · ' + svc.latency + ' ms</p>' +
              '</div>' +
            '</div>' +
            '<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border flex-shrink-0 ' + type.badge + '">' +
              '<span class="w-1.5 h-1.5 rounded-full ' + type.dot + '"></span>' +
              type.label +
            '</span>' +
          '</div>';
      }).join('');
    }

    function renderOverall() {
      var hasOutage = services.some(function (s) { return s.status === 'outage'; });
      var hasDegraded = services.some(function (s) { return s.status === 'degraded'; });

      var text = 'All Systems Operational';
      var dot = 'bg-emerald-500';
      var textColor = 'text-emerald-400';

      if (hasOutage) {
        text = 'Service Disruption Detected';
        dot = 'bg-rose-500';
        textColor = 'text-rose-400';
      } else if (hasDegraded) {
        text = 'Minor Degradation Noticed';
        dot = 'bg-amber-500';
        textColor = 'text-amber-400';
      }

      if (overallDot) overallDot.className = 'w-2.5 h-2.5 rounded-full animate-pulse ' + dot;
      if (overallText) {
        overallText.textContent = text;
        overallText.className = 'text-sm font-bold ' + textColor;
      }
      if (lastChecked) lastChecked.textContent = 'Simulated at: ' + new Date().toLocaleTimeString();
    }

    function refresh() {
      if (refreshBtn) refreshBtn.disabled = true;
      if (refreshIcon) refreshIcon.classList.add('animate-spin');

      if (overallText) {
        overallText.textContent = 'Checking services...';
        overallText.className = 'text-sm font-bold text-gray-300';
      }
      if (overallDot) overallDot.className = 'w-2.5 h-2.5 rounded-full animate-pulse bg-gray-500';
      listEl.classList.add('opacity-50');

      window.setTimeout(function () {
        services.forEach(function (svc) {
          svc.status = randomStatus();
          svc.latency = Math.floor(180 + Math.random() * 2200);

          if (svc.status === 'operational') {
            svc.uptime = (99.5 + Math.random() * 0.49).toFixed(2) + '%';
          } else if (svc.status === 'degraded') {
            svc.uptime = (97.5 + Math.random() * 1.9).toFixed(2) + '%';
          } else {
            svc.uptime = (92 + Math.random() * 4).toFixed(2) + '%';
          }
        });

        listEl.classList.remove('opacity-50');
        if (refreshBtn) refreshBtn.disabled = false;
        if (refreshIcon) refreshIcon.classList.remove('animate-spin');

        renderRows();
        renderOverall();

        if (window.ToolStack) window.ToolStack.track('tool_output', { tool: 'ai-status-board' });
      }, 900);
    }

    if (refreshBtn) refreshBtn.addEventListener('click', refresh);

    renderRows();
    renderOverall();

    return {
      refresh: refresh,
      services: services
    };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createAiStatusBoard = createAiStatusBoard;
})(window, document);

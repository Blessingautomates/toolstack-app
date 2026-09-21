/**
 * JSON Formatter & Validator — shared engine.
 *
 * Factory, not a singleton: the same code backs the modal on index.html and
 * the standalone page at /tools/json-formatter.html. All lookups are scoped to
 * `root` so two instances would never collide.
 *
 * Required markup (ids, inside `root`):
 *   #jsonInput #jsonStatus #formatJsonBtn #minifyJsonBtn #copyJsonBtn
 * Optional:
 *   [data-ts-result-actions] — revealed once the tool produces output.
 */
(function (window, document) {
  'use strict';

  function createJsonFormatter(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var jsonInput = $('jsonInput');
    var jsonStatus = $('jsonStatus');
    var formatJsonBtn = $('formatJsonBtn');
    var minifyJsonBtn = $('minifyJsonBtn');
    var copyJsonBtn = $('copyJsonBtn');

    if (!jsonInput || !jsonStatus) return null;

    // The support/share strip stays hidden until the user has actually
    // produced output — see data-ts-deferred in the markup.
    var actionsEl = root.querySelector('[data-ts-result-actions]');
    var actionsShown = false;

    function revealActions() {
      if (actionsShown || !actionsEl) return;
      actionsShown = true;
      if (window.ToolStack) {
        window.ToolStack.reveal(actionsEl);
        window.ToolStack.track('tool_output', { tool: 'json-formatter' });
      } else {
        actionsEl.classList.remove('hidden');
      }
    }

    function showStatus(message, isError) {
      jsonStatus.classList.remove('hidden', 'bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/20', 'bg-rose-500/10', 'text-rose-400', 'border-rose-500/20');
      if (isError) {
        jsonStatus.classList.add('bg-rose-500/10', 'text-rose-400', 'border-rose-500/20');
        jsonStatus.textContent = '❌ ' + message;
      } else {
        jsonStatus.classList.add('bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/20');
        jsonStatus.textContent = '✅ ' + message;
      }
    }

    if (formatJsonBtn) {
      formatJsonBtn.addEventListener('click', function () {
        var raw = jsonInput.value.trim();
        if (!raw) return;
        try {
          var parsed = JSON.parse(raw);
          jsonInput.value = JSON.stringify(parsed, null, 2);
          showStatus('Valid JSON! Formatted successfully.', false);
          revealActions();
        } catch (err) {
          showStatus('Invalid JSON: ' + err.message, true);
        }
      });
    }

    if (minifyJsonBtn) {
      minifyJsonBtn.addEventListener('click', function () {
        var raw = jsonInput.value.trim();
        if (!raw) return;
        try {
          var parsed = JSON.parse(raw);
          jsonInput.value = JSON.stringify(parsed);
          showStatus('Valid JSON! Minified successfully.', false);
          revealActions();
        } catch (err) {
          showStatus('Invalid JSON: ' + err.message, true);
        }
      });
    }

    if (copyJsonBtn) {
      copyJsonBtn.addEventListener('click', function () {
        if (!jsonInput.value) return;
        var originalText = copyJsonBtn.textContent;

        function feedback(ok) {
          copyJsonBtn.textContent = ok ? '✅ Copied!' : '❌ Copy failed';
          window.setTimeout(function () {
            copyJsonBtn.textContent = originalText;
          }, 2000);
        }

        if (window.ToolStack) {
          window.ToolStack.copyText(jsonInput.value, feedback);
        } else {
          navigator.clipboard.writeText(jsonInput.value);
          feedback(true);
        }
      });
    }

    return {
      revealActions: revealActions,
      setValue: function (v) { jsonInput.value = v; }
    };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createJsonFormatter = createJsonFormatter;
})(window, document);

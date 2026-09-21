/**
 * Base64 Encoder / Decoder — shared engine.
 *
 * Factory, not a singleton: the same code backs the standalone page at
 * /tools/base64-encoder.html and any future host. Modal open/close is
 * deliberately NOT here — that is page chrome, not tool logic.
 *
 * Required markup (ids, inside `root`):
 *   #base64Input #base64Status #encodeBtn #decodeBtn #copyBase64Btn
 * Optional:
 *   [data-ts-result-actions] — revealed on the first successful conversion.
 */
(function (window, document) {
  'use strict';

  function createBase64Encoder(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var input = $('base64Input');
    var statusBanner = $('base64Status');
    var encodeBtn = $('encodeBtn');
    var decodeBtn = $('decodeBtn');
    var copyBtn = $('copyBase64Btn');

    if (!input || !statusBanner) return null;

    // The support/share strip stays hidden until the user has produced output —
    // see data-ts-deferred in the markup.
    var actionsEl = root.querySelector('[data-ts-result-actions]');
    var actionsShown = false;

    function revealActions() {
      if (actionsShown || !actionsEl) return;
      actionsShown = true;
      if (window.ToolStack) {
        window.ToolStack.reveal(actionsEl);
      } else {
        actionsEl.classList.remove('hidden');
      }
    }

    function showStatus(message, isError) {
      statusBanner.classList.remove(
        'hidden',
        'bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/20',
        'bg-rose-500/10', 'text-rose-400', 'border-rose-500/20'
      );
      if (isError) {
        statusBanner.classList.add('bg-rose-500/10', 'text-rose-400', 'border-rose-500/20');
        statusBanner.textContent = '❌ ' + message;
      } else {
        statusBanner.classList.add('bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/20');
        statusBanner.textContent = '✅ ' + message;
      }
    }

    // btoa/atob are byte-oriented, so the string is round-tripped through
    // percent-encoding first. Without that, any non-Latin1 character (accents,
    // emoji, non-English scripts) throws InvalidCharacterError.
    function toBase64(str) {
      return window.btoa(window.unescape(encodeURIComponent(str)));
    }

    function fromBase64(str) {
      return decodeURIComponent(window.escape(window.atob(str)));
    }

    if (encodeBtn) {
      encodeBtn.addEventListener('click', function () {
        var raw = input.value;
        if (!raw) return;
        try {
          input.value = toBase64(raw);
          showStatus('Successfully encoded to Base64!', false);
          revealActions();
        } catch (err) {
          showStatus('Encoding failed: ' + err.message, true);
        }
      });
    }

    if (decodeBtn) {
      decodeBtn.addEventListener('click', function () {
        var raw = input.value.trim();
        if (!raw) return;
        try {
          input.value = fromBase64(raw);
          showStatus('Successfully decoded from Base64!', false);
          revealActions();
        } catch (err) {
          showStatus('Invalid Base64 string! Could not decode.', true);
        }
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!input.value) return;
        var originalText = copyBtn.textContent;

        function feedback(ok) {
          copyBtn.textContent = ok ? '✅ Copied!' : '❌ Copy failed';
          window.setTimeout(function () { copyBtn.textContent = originalText; }, 2000);
        }

        if (window.ToolStack) {
          window.ToolStack.copyText(input.value, feedback);
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(input.value).then(function () { feedback(true); });
        }
      });
    }

    // Swap the two actions from the keyboard: these two are always used as a
    // pair, and re-typing a long string to decode it is the common annoyance.
    input.addEventListener('keydown', function (e) {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key === 'Enter' && encodeBtn) {
        e.preventDefault();
        encodeBtn.click();
      } else if (e.shiftKey && e.key === 'Enter' && decodeBtn) {
        e.preventDefault();
        decodeBtn.click();
      }
    });

    return {
      revealActions: revealActions,
      setValue: function (v) { input.value = v; }
    };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createBase64Encoder = createBase64Encoder;
})(window, document);

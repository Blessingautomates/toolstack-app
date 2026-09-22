/**
 * ToolStack AI — Google SERP Preview engine.
 *
 * Renders a Google-style result snippet from a title, URL and description, and
 * reports where Google's truncation would fall.
 *
 * Ids required in tools/serp-preview.html:
 *   serpTitle, serpUrl, serpDate, serpDescription, serpTitleCount, serpDescCount,
 *   serpDesktop, serpMobile, serpPreviewUrl, serpPreviewDate, serpPreviewTitle,
 *   serpPreviewDescription, serpStats, serpWarnings, serpResults, serpCopyBtn,
 *   serpStatus
 *
 * Truncation is measured, not counted. Google cuts by rendered pixel width, so a
 * title of capital W and M truncates far earlier than one made of lowercase l
 * and i, and a character count cannot tell you which one you have. A canvas
 * measures the string in Arial at the size Google uses in results.
 *
 * The budgets are the commonly observed first-line widths, and they are
 * averages rather than rules. Mobile is narrower than desktop because the
 * results column is narrower — but Google also lets a title wrap on mobile,
 * which is why some tools quote a higher character count for phones. This tool
 * reports the single-line budget, so treat the numbers as a target to stay
 * comfortably inside rather than an exact boundary.
 *
 * If the canvas is unavailable the engine falls back to a flat per-character
 * estimate and says so, rather than silently reporting numbers it did not
 * measure.
 */
(function (window, document) {
  'use strict';

  function createSerpPreview(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var titleEl = $('serpTitle');
    var urlEl = $('serpUrl');
    var dateEl = $('serpDate');
    var descEl = $('serpDescription');
    var outTitle = $('serpPreviewTitle');
    var outDesc = $('serpPreviewDescription');
    var outUrl = $('serpPreviewUrl');
    var outDate = $('serpPreviewDate');
    var statsEl = $('serpStats');
    var warningsEl = $('serpWarnings');
    var results = $('serpResults');
    var statusEl = $('serpStatus');

    if (!titleEl || !descEl || !outTitle || !outDesc) return null;

    var TITLE_FONT = '20px Arial, sans-serif';
    var DESC_FONT = '14px Arial, sans-serif';

    // Approximate per-character widths, used only when the canvas is missing.
    var TITLE_FALLBACK_PX = 9.5;
    var DESC_FALLBACK_PX = 6.8;

    var BUDGET = {
      desktop: { title: 600, desc: 920, titleHard: 640, descHard: 980 },
      mobile:  { title: 560, desc: 680, titleHard: 600, descHard: 720 }
    };

    var device = 'desktop';

    var STATUS = {
      ok: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      info: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      warn: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      error: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    };

    function showStatus(message, kind) {
      if (!statusEl) return;
      var keys = ['ok', 'info', 'warn', 'error'];
      for (var i = 0; i < keys.length; i++) {
        statusEl.classList.remove.apply(statusEl.classList, STATUS[keys[i]].split(' '));
      }
      statusEl.classList.add.apply(statusEl.classList, (STATUS[kind] || STATUS.info).split(' '));
      statusEl.textContent = message;
      statusEl.classList.remove('hidden');
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    /* ------------------------------------------------------------ measuring */

    var ctx = null;
    var canvasFailed = false;

    function context() {
      if (ctx || canvasFailed) return ctx;
      try {
        var canvas = document.createElement('canvas');
        ctx = canvas.getContext ? canvas.getContext('2d') : null;
        if (!ctx || typeof ctx.measureText !== 'function') {
          canvasFailed = true;
          ctx = null;
        }
      } catch (err) {
        canvasFailed = true;
        ctx = null;
      }
      return ctx;
    }

    function measure(text, font, fallbackPx) {
      if (!text) return 0;
      var c = context();
      if (c) {
        c.font = font;
        return c.measureText(text).width;
      }
      return text.length * fallbackPx;
    }

    /**
     * Longest prefix of `text` that still fits `budget` once an ellipsis is
     * appended, cut back to a word boundary. Google cuts at a word, and a
     * half-word reads like a rendering bug rather than a truncation.
     *
     * Binary search rather than a character-by-character walk: a 300-character
     * description measured one character at a time is 300 canvas calls on every
     * keystroke.
     */
    function truncate(text, font, fallbackPx, budget) {
      var value = String(text || '');
      var full = measure(value, font, fallbackPx);
      if (full <= budget) {
        return { text: value, truncated: false, px: full, kept: value.length };
      }

      var ellipsis = '…';
      var ellipsisPx = measure(ellipsis, font, fallbackPx);

      var lo = 0;
      var hi = value.length;
      while (lo < hi) {
        var mid = Math.ceil((lo + hi) / 2);
        if (measure(value.slice(0, mid), font, fallbackPx) + ellipsisPx <= budget) {
          lo = mid;
        } else {
          hi = mid - 1;
        }
      }

      var head = value.slice(0, lo);

      // Only honour the word boundary if it keeps most of the line. A single
      // long unbroken token would otherwise truncate to almost nothing.
      var space = head.lastIndexOf(' ');
      if (space > lo * 0.6) head = head.slice(0, space);

      // Trailing punctuation before an ellipsis reads as a typo: "fast, …".
      head = head.replace(/[\s,;:.\-–—]+$/, '');
      if (head === '') head = value.slice(0, lo);

      return {
        text: head + ellipsis,
        truncated: true,
        px: measure(head, font, fallbackPx) + ellipsisPx,
        kept: head.length
      };
    }

    /* -------------------------------------------------------------- render */

    function tile(label, value, tone) {
      return '<div class="bg-gray-950 border border-gray-800 rounded-xl p-3">' +
        '<p class="text-[10px] uppercase tracking-wider text-gray-500 font-bold">' + escapeHtml(label) + '</p>' +
        '<p class="text-lg font-black ' + (tone || 'text-gray-100') + ' mt-1">' + escapeHtml(value) + '</p>' +
        '</div>';
    }

    function note(text, kind) {
      return '<p class="p-3 rounded-xl text-xs font-medium border ' + (STATUS[kind] || STATUS.info) + '">' +
        escapeHtml(text) + '</p>';
    }

    function chars(n) {
      return n + (n === 1 ? ' character' : ' characters');
    }

    function setCount(el, text, tone) {
      if (!el) return;
      el.classList.remove('text-gray-500', 'text-emerald-400', 'text-amber-400');
      el.classList.add(tone || 'text-gray-500');
      el.textContent = text;
    }

    // The preview keeps Google's own colours — a blue title, a grey description —
    // so it stays a preview. The count lines underneath carry the verdict.
    function paint(el, value, placeholder, filledClass, emptyClass) {
      var empty = value === '';
      el.textContent = empty ? placeholder : value;
      el.classList.remove(filledClass, emptyClass);
      el.classList.add(empty ? emptyClass : filledClass);
    }

    /**
     * Google shows the address as a breadcrumb rather than a raw URL: scheme and
     * www are dropped and the path is split into crumbs. Long paths are elided
     * the way Google elides them.
     */
    function formatUrl(raw) {
      var value = String(raw || '').replace(/^\s+|\s+$/g, '');
      if (value === '') return { text: 'example.com', crumbs: 0 };

      value = value.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
      var parts = value.split('/');
      var host = parts.shift() || 'example.com';
      var crumbs = [];
      for (var i = 0; i < parts.length; i++) {
        if (parts[i] !== '') crumbs.push(parts[i]);
      }

      var text = host;
      var shown = Math.min(crumbs.length, 3);
      for (var c = 0; c < shown; c++) text += ' › ' + crumbs[c];
      if (crumbs.length > shown) text += ' › …';

      return { text: text, crumbs: crumbs.length };
    }

    var EMPTY_TITLE = 'Your page title appears here';
    var EMPTY_DESC = 'Your meta description appears here, truncated the way Google would show it.';

    function render() {
      var budget = BUDGET[device] || BUDGET.desktop;
      var where = device === 'mobile' ? 'mobile' : 'desktop';

      var rawTitle = titleEl.value.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
      var rawDesc = descEl ? descEl.value.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '') : '';
      var rawUrl = urlEl ? urlEl.value : '';
      var rawDate = dateEl ? dateEl.value.replace(/^\s+|\s+$/g, '') : '';

      var titlePx = measure(rawTitle, TITLE_FONT, TITLE_FALLBACK_PX);
      var descPx = measure(rawDesc, DESC_FONT, DESC_FALLBACK_PX);

      var t = truncate(rawTitle, TITLE_FONT, TITLE_FALLBACK_PX, budget.title);
      var d = truncate(rawDesc, DESC_FONT, DESC_FALLBACK_PX, budget.desc);

      paint(outTitle, t.text, EMPTY_TITLE, 'text-sky-400', 'text-gray-600');
      paint(outDesc, d.text, EMPTY_DESC, 'text-gray-300', 'text-gray-600');

      var url = formatUrl(rawUrl);
      if (outUrl) outUrl.textContent = url.text;

      if (outDate) {
        outDate.textContent = rawDate;
        if (rawDate === '') outDate.classList.add('hidden');
        else outDate.classList.remove('hidden');
      }

      setCount($('serpTitleCount'),
        chars(rawTitle.length) + ' · ' + Math.round(titlePx) + ' / ' + budget.title + ' px',
        rawTitle === '' ? 'text-gray-500' : (titlePx > budget.title ? 'text-amber-400' : 'text-emerald-400'));

      setCount($('serpDescCount'),
        chars(rawDesc.length) + ' · ' + Math.round(descPx) + ' / ' + budget.desc + ' px',
        rawDesc === '' ? 'text-gray-500' : (descPx > budget.desc ? 'text-amber-400' : 'text-emerald-400'));

      if (rawTitle === '' && rawDesc === '') {
        results.classList.add('hidden');
        showStatus('Type a title and a description — the preview updates as you type. Switch to Mobile to see the narrower column.', 'info');
        return;
      }

      var html = '';
      html += tile('Title width', Math.round(titlePx) + ' / ' + budget.title + ' px',
        rawTitle === '' ? 'text-gray-100' : (titlePx > budget.title ? 'text-amber-400' : 'text-emerald-400'));
      html += tile('Description width', Math.round(descPx) + ' / ' + budget.desc + ' px',
        rawDesc === '' ? 'text-gray-100' : (descPx > budget.desc ? 'text-amber-400' : 'text-emerald-400'));
      html += tile('Title length', chars(rawTitle.length));
      html += tile('Description length', chars(rawDesc.length));
      statsEl.innerHTML = html;

      var notes = [];

      if (canvasFailed) {
        notes.push(['This browser did not expose a text-measurement canvas, so the widths above are estimated from character counts rather than measured. Treat the pixel figures as rough.', 'warn']);
      }

      if (rawTitle === '') {
        notes.push(['No title. When a title tag is missing Google writes one from the page content, so the wording in the result is out of your hands.', 'warn']);
      } else if (t.truncated) {
        notes.push(['Truncated after ' + t.kept + ' characters. Google shows roughly the first ' + t.kept + ' at this ' + where + ' width and replaces the rest with an ellipsis — so the words that survive are the ones doing the work.', 'warn']);
        if (titlePx > budget.titleHard) {
          notes.push(['This title runs well past the first line. Google can rewrite a title it considers too long or too keyword-stuffed, and a rewrite is worse than a truncation because you lose control of the wording.', 'warn']);
        }
      } else if (titlePx < budget.title * 0.5) {
        notes.push(['The title uses less than half the space available at this width. That is not a fault — a short title is better than a padded one — but there is room for a qualifier that earns the click.', 'info']);
      }

      if (rawDesc === '') {
        notes.push(['No meta description. Google generates one from the page content, which usually means pulling a sentence that was never written as a summary.', 'info']);
      } else if (d.truncated) {
        notes.push(['Description truncated. Google rewrites and cuts descriptions often, so this is guidance rather than a guarantee — keep the substance in the first sentence.', 'warn']);
      } else if (rawDesc.length < 70) {
        notes.push(['Short description. Under about 70 characters the second line sits empty, and that line is the one most people read.', 'info']);
      }

      if (rawDate !== '') {
        notes.push(['The date line is only shown for content Google treats as time-sensitive, so most pages will not display it. It does not hurt to include.', 'info']);
      }

      var notesHtml = '';
      for (var i = 0; i < notes.length; i++) notesHtml += note(notes[i][0], notes[i][1]);
      warningsEl.innerHTML = notesHtml;

      results.classList.remove('hidden');

      var actions = root.querySelector('[data-ts-result-actions]');
      if (actions && window.ToolStack && window.ToolStack.reveal) {
        window.ToolStack.reveal(actions);
      }

      var cut = [];
      if (t.truncated) cut.push('title');
      if (d.truncated) cut.push('description');

      if (cut.length === 0) {
        showStatus('Both fit at ' + where + ' width — nothing would be truncated.', 'ok');
      } else {
        showStatus('Your ' + cut.join(' and ') + ' would be truncated at ' + where + ' width. Check the other device before you rewrite — the budgets differ.', 'warn');
      }
    }

    /* -------------------------------------------------------------- wiring */

    var DEVICE_ON = ['border-brand-500', 'text-brand-400'];
    var DEVICE_OFF = ['border-gray-700', 'hover:border-brand-500', 'text-gray-300', 'hover:text-brand-400'];
    var deviceButtons = [$('serpDesktop'), $('serpMobile')];

    function setDevice(next) {
      device = next === 'mobile' ? 'mobile' : 'desktop';
      for (var i = 0; i < deviceButtons.length; i++) {
        var btn = deviceButtons[i];
        if (!btn) continue;
        var on = btn.getAttribute('data-device') === device;
        btn.classList.remove.apply(btn.classList, on ? DEVICE_OFF : DEVICE_ON);
        btn.classList.add.apply(btn.classList, on ? DEVICE_ON : DEVICE_OFF);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      }
      render();
    }

    for (var bi = 0; bi < deviceButtons.length; bi++) {
      if (deviceButtons[bi]) {
        deviceButtons[bi].addEventListener('click', function () {
          setDevice(this.getAttribute('data-device'));
        });
      }
    }

    function copyText(text, done) {
      if (window.ToolStack && window.ToolStack.copyText) {
        window.ToolStack.copyText(text, done);
        return;
      }
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.top = '-1000px';
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (err) {
        ok = false;
      }
      document.body.removeChild(area);
      done(ok);
    }

    var copyBtn = $('serpCopyBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        // Copy what is on screen, not the raw input: the point of the button is
        // to hand someone the snippet Google would show, truncation included.
        var title = outTitle.textContent;
        var desc = outDesc.textContent;
        if (title === EMPTY_TITLE && desc === EMPTY_DESC) {
          showStatus('Nothing to copy yet — type a title or a description first.', 'warn');
          return;
        }

        var lines = [
          outUrl ? outUrl.textContent : '',
          (outDate && !outDate.classList.contains('hidden')) ? outDate.textContent : '',
          title,
          desc
        ];
        var text = '';
        for (var i = 0; i < lines.length; i++) {
          if (lines[i] === '') continue;
          text += (text === '' ? '' : '\n') + lines[i];
        }

        var original = copyBtn.textContent;
        copyText(text, function (ok) {
          copyBtn.textContent = ok ? '✅ Copied!' : 'Copy failed';
          window.setTimeout(function () { copyBtn.textContent = original; }, 2000);
          if (!ok) showStatus('Copy failed — select the preview text and copy it manually.', 'error');
        });
      });
    }

    /* --------------------------------------------------------- live update */

    // Debounced: measuring on every keystroke of a fast typist is wasted work,
    // and the canvas is the only expensive part of the render.
    var timer = null;
    function schedule() {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(render, 120);
    }

    var liveFields = [titleEl, urlEl, dateEl, descEl];
    for (var fi = 0; fi < liveFields.length; fi++) {
      if (liveFields[fi]) liveFields[fi].addEventListener('input', schedule);
    }

    // The budgets are fixed in pixels, so a resize does not change the verdict —
    // but the canvas font can resolve differently once webfonts settle, so the
    // measurement is refreshed rather than trusted from first paint.
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(render, 200);
    });

    render();

    return { render: render, setDevice: setDevice };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createSerpPreview = createSerpPreview;

})(window, document);

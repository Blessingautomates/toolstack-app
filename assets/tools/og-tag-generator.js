/**
 * Open Graph Generator — shared engine.
 *
 * Factory, not a singleton: the same code backs the standalone page at
 * /tools/og-tag-generator.html and any future modal. All lookups are scoped to
 * `root` so two instances would never collide.
 *
 * Required markup (ids, inside `root`):
 *   #ogTitle #ogDescription #ogUrl #ogImage #ogImageAlt #ogType #ogLocale
 *   #ogSiteName #ogGenerateBtn #ogCopyBtn #ogStatus #ogResults #ogOutput
 *   #ogPreviewImageWrap #ogPreviewImage #ogPreviewUrl #ogPreviewTitle #ogPreviewDesc
 *
 * The preview is driven off the same values as the generated block, so the two
 * can never disagree — which is the whole point of having a preview at all.
 * It is an approximation: each platform crops and truncates differently, and
 * the page says so rather than implying a pixel-accurate render.
 */
(function (window, document) {
  'use strict';

  function escapeAttr(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function oneLine(str) {
    return String(str).replace(/\s+/g, ' ').trim();
  }

  /** Trim to a word boundary so the preview truncates like a real card does. */
  function clamp(str, max) {
    if (str.length <= max) return str;
    var cut = str.slice(0, max);
    var space = cut.lastIndexOf(' ');
    return (space > max * 0.6 ? cut.slice(0, space) : cut) + '…';
  }

  function createOgTagGenerator(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var fields = {
      title: $('ogTitle'),
      description: $('ogDescription'),
      url: $('ogUrl'),
      image: $('ogImage'),
      imageAlt: $('ogImageAlt'),
      type: $('ogType'),
      locale: $('ogLocale'),
      siteName: $('ogSiteName')
    };

    var generateBtn = $('ogGenerateBtn');
    var copyBtn = $('ogCopyBtn');
    var statusEl = $('ogStatus');
    var resultsEl = $('ogResults');
    var outputEl = $('ogOutput');

    var previewWrap = $('ogPreviewImageWrap');
    var previewImage = $('ogPreviewImage');
    var previewUrl = $('ogPreviewUrl');
    var previewTitle = $('ogPreviewTitle');
    var previewDesc = $('ogPreviewDesc');

    if (!generateBtn || !outputEl) return null;

    var lastBlock = '';

    // Remember the URL that failed so a later keystroke does not resurrect a
    // broken image box — the src is unchanged, so it would fail again silently.
    var failedSrc = '';

    function val(key) {
      return fields[key] ? fields[key].value.trim() : '';
    }

    /* -------------------------------------------------------------- preview */

    /** Strip the scheme and a leading www so the preview reads like a real card. */
    function prettyUrl(raw) {
      if (!raw) return 'example.com';
      var stripped = raw.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
      return stripped.replace(/\/$/, '') || 'example.com';
    }

    function renderPreview() {
      var title = oneLine(val('title'));
      var description = oneLine(val('description'));
      var image = val('image');

      if (previewTitle) {
        previewTitle.textContent = title
          ? clamp(title, 90)
          : 'Your page title appears here';
      }
      if (previewDesc) {
        previewDesc.textContent = description
          ? clamp(description, 160)
          : 'Your description appears here. Facebook shows roughly two lines before it truncates with an ellipsis.';
      }
      if (previewUrl) {
        previewUrl.textContent = prettyUrl(val('url'));
      }

      if (!previewWrap || !previewImage) return;

      // Only swap src when it actually changed: re-assigning the same URL
      // restarts the browser's image load and makes a live preview flicker.
      if (image && /^https?:\/\//i.test(image) && image !== failedSrc) {
        if (previewImage.getAttribute('src') !== image) {
          previewImage.setAttribute('src', image);
        }
        previewWrap.classList.remove('hidden');
      } else {
        previewWrap.classList.add('hidden');
        if (!image) previewImage.removeAttribute('src');
      }
    }

    // A broken image URL is the single most common Open Graph mistake, so say so
    // rather than silently showing an empty box.
    if (previewImage) {
      previewImage.addEventListener('error', function () {
        failedSrc = previewImage.getAttribute('src') || '';
        previewWrap.classList.add('hidden');
        showStatus('That og:image URL could not be loaded. Check that it is an absolute https URL to a real image.', true);
      });
      previewImage.addEventListener('load', function () {
        failedSrc = '';
      });
    }

    /* ------------------------------------------------------------- feedback */

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

    /* -------------------------------------------------------------- builder */

    function build() {
      var title = oneLine(val('title'));
      var description = oneLine(val('description'));
      var url = val('url');
      var image = val('image');
      var imageAlt = oneLine(val('imageAlt'));
      var siteName = oneLine(val('siteName'));
      var type = fields.type ? fields.type.value : 'website';
      var locale = fields.locale ? fields.locale.value : 'en_US';

      var lines = [];

      // og:type and og:title are the only two tags Facebook treats as required;
      // everything else is optional and simply omitted when blank.
      lines.push('<meta property="og:type" content="' + escapeAttr(type) + '">');
      if (title) lines.push('<meta property="og:title" content="' + escapeAttr(title) + '">');
      if (description) lines.push('<meta property="og:description" content="' + escapeAttr(description) + '">');
      if (url) lines.push('<meta property="og:url" content="' + escapeAttr(url) + '">');
      if (siteName) lines.push('<meta property="og:site_name" content="' + escapeAttr(siteName) + '">');
      if (image) lines.push('<meta property="og:image" content="' + escapeAttr(image) + '">');
      if (image) lines.push('<meta property="og:image:width" content="1200">');
      if (image) lines.push('<meta property="og:image:height" content="630">');
      if (imageAlt) lines.push('<meta property="og:image:alt" content="' + escapeAttr(imageAlt) + '">');
      lines.push('<meta property="og:locale" content="' + escapeAttr(locale) + '">');

      return { text: lines.join('\n'), hasTitle: !!title, hasImage: !!image };
    }

    function revealActions() {
      var actionsEl = root.querySelector('[data-ts-result-actions]');
      if (!actionsEl) return;
      actionsEl.classList.remove('hidden');
      if (window.ToolStack) {
        window.ToolStack.reveal(actionsEl);
        window.ToolStack.track('tool_output', { tool: 'og-tag-generator' });
      }
    }

    function generate() {
      var block = build();

      if (!block.hasTitle && !val('description')) {
        showStatus('Add at least an og:title or an og:description before generating.', true);
        return;
      }

      lastBlock = block.text;
      outputEl.textContent = block.text;

      var notes = [];
      if (!block.hasTitle) notes.push('there is no og:title, so platforms will guess one');
      if (!block.hasImage) notes.push('there is no og:image, so the card will render without a picture');

      showStatus(
        'Generated ' + block.text.split('\n').length + ' tags.' +
          (notes.length ? ' Heads up: ' + notes.join(', and ') + '.' : ''),
        notes.length > 0
      );

      resultsEl.classList.remove('hidden');
      revealActions();
    }

    /* --------------------------------------------------------------- events */

    var inputIds = ['title', 'description', 'url', 'image'];
    inputIds.forEach(function (key) {
      if (fields[key]) {
        fields[key].addEventListener('input', renderPreview);
      }
    });

    generateBtn.addEventListener('click', generate);

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!lastBlock) {
          showStatus('Generate the tags first, then copy them.', true);
          return;
        }

        var original = copyBtn.textContent;
        var done = function (ok) {
          copyBtn.textContent = ok ? '✅ Copied!' : '❌ Copy failed';
          window.setTimeout(function () { copyBtn.textContent = original; }, 2000);
        };

        if (window.ToolStack) {
          window.ToolStack.copyText(lastBlock, done);
        } else {
          done(false);
        }
      });
    }

    renderPreview();

    return {
      generate: generate,
      renderPreview: renderPreview,
      value: function () { return lastBlock; }
    };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createOgTagGenerator = createOgTagGenerator;
})(window, document);

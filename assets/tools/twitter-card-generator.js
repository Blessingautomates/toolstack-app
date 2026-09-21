/**
 * Twitter/X Card Generator — shared engine.
 *
 * Factory, not a singleton: the same code backs the standalone page at
 * /tools/twitter-card-generator.html and any future modal. All lookups are
 * scoped to `root` so two instances would never collide.
 *
 * Required markup (ids, inside `root`):
 *   #tcCardType #tcTitle #tcDescription #tcImage #tcImageAlt #tcUrl #tcSite
 *   #tcCreator #tcGenerateBtn #tcCopyBtn #tcStatus #tcResults #tcOutput
 *   #tcPreviewHandle #tcPreviewLarge #tcPreviewSmall
 *   #tcPreviewLargeImageWrap #tcPreviewLargeImage
 *   #tcPreviewLargeTitle #tcPreviewLargeDesc #tcPreviewLargeUrl
 *   #tcPreviewSmallImageWrap #tcPreviewSmallImage
 *   #tcPreviewSmallTitle #tcPreviewSmallDesc #tcPreviewSmallUrl
 *
 * The preview is driven from the same values as the generated block, so the two
 * can never disagree. Both platform layouts live in the DOM at once and one is
 * toggled, which keeps the switch instant and means neither layout has to be
 * rebuilt when the card type changes.
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

  function clamp(str, max) {
    if (str.length <= max) return str;
    var cut = str.slice(0, max);
    var space = cut.lastIndexOf(' ');
    return (space > max * 0.6 ? cut.slice(0, space) : cut) + '…';
  }

  /** Handles are written both ways in the wild; normalise to a leading @. */
  function normaliseHandle(raw) {
    var handle = String(raw).trim();
    if (!handle) return '';
    return handle.charAt(0) === '@' ? handle : '@' + handle;
  }

  function prettyUrl(raw) {
    if (!raw) return 'example.com';
    var stripped = raw.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    return stripped.replace(/\/$/, '') || 'example.com';
  }

  function createTwitterCardGenerator(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var fields = {
      cardType: $('tcCardType'),
      title: $('tcTitle'),
      description: $('tcDescription'),
      image: $('tcImage'),
      imageAlt: $('tcImageAlt'),
      url: $('tcUrl'),
      site: $('tcSite'),
      creator: $('tcCreator')
    };

    var generateBtn = $('tcGenerateBtn');
    var copyBtn = $('tcCopyBtn');
    var statusEl = $('tcStatus');
    var resultsEl = $('tcResults');
    var outputEl = $('tcOutput');

    var previewHandle = $('tcPreviewHandle');
    var large = $('tcPreviewLarge');
    var small = $('tcPreviewSmall');
    var largeImageWrap = $('tcPreviewLargeImageWrap');
    var largeImage = $('tcPreviewLargeImage');
    var largeTitle = $('tcPreviewLargeTitle');
    var largeDesc = $('tcPreviewLargeDesc');
    var largeUrl = $('tcPreviewLargeUrl');
    var smallImageWrap = $('tcPreviewSmallImageWrap');
    var smallImage = $('tcPreviewSmallImage');
    var smallTitle = $('tcPreviewSmallTitle');
    var smallDesc = $('tcPreviewSmallDesc');
    var smallUrl = $('tcPreviewSmallUrl');

    if (!generateBtn || !outputEl) return null;

    var lastBlock = '';
    var failedSrc = '';

    function val(key) {
      return fields[key] ? fields[key].value.trim() : '';
    }

    function cardType() {
      return fields.cardType ? fields.cardType.value : 'summary_large_image';
    }

    function isLarge() {
      return cardType() === 'summary_large_image';
    }

    /* -------------------------------------------------------------- preview */

    function setImage(wrap, img, src) {
      if (!wrap || !img) return;

      if (src && /^https?:\/\//i.test(src) && src !== failedSrc) {
        if (img.getAttribute('src') !== src) img.setAttribute('src', src);
        wrap.classList.remove('hidden');
      } else {
        wrap.classList.add('hidden');
        if (!src) img.removeAttribute('src');
      }
    }

    function renderPreview() {
      var title = oneLine(val('title'));
      var description = oneLine(val('description'));
      var image = val('image');
      var url = prettyUrl(val('url'));
      var handle = normaliseHandle(val('site') || val('creator'));

      // The summary card truncates sooner than the large one, so the clamp
      // follows the selected layout rather than using one figure for both.
      var titleMax = isLarge() ? 70 : 60;
      var descMax = isLarge() ? 140 : 120;

      var shownTitle = title ? clamp(title, titleMax) : 'Your page title appears here';
      var shownDesc = description ? clamp(description, descMax) : 'Your description appears here.';

      if (largeTitle) largeTitle.textContent = shownTitle;
      if (largeDesc) largeDesc.textContent = shownDesc;
      if (largeUrl) largeUrl.textContent = url;

      if (smallTitle) smallTitle.textContent = shownTitle;
      if (smallDesc) smallDesc.textContent = shownDesc;
      if (smallUrl) smallUrl.textContent = url;

      if (previewHandle) {
        previewHandle.textContent = handle || '@toolstackai';
      }

      if (isLarge()) {
        if (large) large.classList.remove('hidden');
        if (small) small.classList.add('hidden');
      } else {
        if (large) large.classList.add('hidden');
        if (small) small.classList.remove('hidden');
      }

      setImage(largeImageWrap, largeImage, image);
      setImage(smallImageWrap, smallImage, image);
    }

    [largeImage, smallImage].forEach(function (img) {
      if (!img) return;
      img.addEventListener('error', function () {
        failedSrc = img.getAttribute('src') || '';
        renderPreview();
        showStatus('That image URL could not be loaded. Check it is an absolute https URL to a JPG, PNG or WebP file.', true);
      });
      img.addEventListener('load', function () {
        failedSrc = '';
      });
    });

    /* ------------------------------------------------------------- feedback */

    function showStatus(message, isError) {
      if (!statusEl) return;
      statusEl.classList.remove(
        'hidden', 'bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/20',
        'bg-rose-500/10', 'text-rose-400', 'border-rose-500/20'
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
      var image = val('image');
      var imageAlt = oneLine(val('imageAlt'));
      var site = normaliseHandle(val('site'));
      var creator = normaliseHandle(val('creator'));

      var lines = [];
      lines.push('<meta name="twitter:card" content="' + escapeAttr(cardType()) + '">');
      if (site) lines.push('<meta name="twitter:site" content="' + escapeAttr(site) + '">');
      if (creator) lines.push('<meta name="twitter:creator" content="' + escapeAttr(creator) + '">');
      if (title) lines.push('<meta name="twitter:title" content="' + escapeAttr(title) + '">');
      if (description) lines.push('<meta name="twitter:description" content="' + escapeAttr(description) + '">');
      if (image) lines.push('<meta name="twitter:image" content="' + escapeAttr(image) + '">');
      if (imageAlt) lines.push('<meta name="twitter:image:alt" content="' + escapeAttr(imageAlt) + '">');

      return {
        text: lines.join('\n'),
        hasTitle: !!title,
        hasImage: !!image,
        hasAlt: !!imageAlt
      };
    }

    function revealActions() {
      var actionsEl = root.querySelector('[data-ts-result-actions]');
      if (!actionsEl) return;
      actionsEl.classList.remove('hidden');
      if (window.ToolStack) {
        window.ToolStack.reveal(actionsEl);
        window.ToolStack.track('tool_output', { tool: 'twitter-card-generator' });
      }
    }

    function generate() {
      var block = build();

      if (!block.hasTitle && !val('description')) {
        showStatus('Add at least a title or a description before generating.', true);
        return;
      }

      lastBlock = block.text;
      outputEl.textContent = block.text;

      var notes = [];
      if (!block.hasImage) {
        notes.push(isLarge()
          ? 'there is no twitter:image, so the large card will collapse to a plain summary'
          : 'there is no twitter:image, so the card will render as text only');
      }
      if (block.hasImage && !block.hasAlt) {
        notes.push('twitter:image:alt is missing, so the image has no alt text for screen readers');
      }

      showStatus(
        'Generated ' + block.text.split('\n').length + ' tags.' +
          (notes.length ? ' Heads up: ' + notes.join(', and ') + '.' : ''),
        notes.length > 0
      );

      resultsEl.classList.remove('hidden');
      revealActions();
    }

    /* --------------------------------------------------------------- events */

    ['title', 'description', 'image', 'url', 'site', 'creator'].forEach(function (key) {
      if (fields[key]) fields[key].addEventListener('input', renderPreview);
    });
    if (fields.cardType) fields.cardType.addEventListener('change', renderPreview);

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
  window.ToolStackTools.createTwitterCardGenerator = createTwitterCardGenerator;
})(window, document);

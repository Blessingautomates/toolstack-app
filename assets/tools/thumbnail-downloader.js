/**
 * Thumbnail Downloader — shared engine.
 *
 * Factory, not a singleton: the same code backs the standalone page at
 * /tools/thumbnail-downloader.html and any future host. Modal open/close is
 * deliberately NOT here — that is page chrome, not tool logic.
 *
 * Required markup (ids, inside `root`):
 *   #thumbUrlInput #fetchThumbBtn #thumbError #thumbResults
 *   #thumbPlatformLabel #thumbIdLabel #platformIcon
 *   #imgMaxQuality #imgMaxFallback #imgHqQuality #imgMqQuality
 *   #dlMaxBtn #dlHqBtn #dlMqBtn
 *
 * The [data-ts-result-actions] strip lives *inside* #thumbResults, which starts
 * hidden — so the support/share block appears with the results and needs no
 * reveal call.
 *
 * YouTube thumbnails come straight from img.youtube.com and need no network
 * permission. Vimeo's public oEmbed-adjacent v2 endpoint is used instead, which
 * requires CORS; if it is blocked the tool reports the failure rather than
 * showing a broken image.
 */
(function (window, document) {
  'use strict';

  var YT_ICON =
    '<svg class="w-5 h-5 text-red-600 fill-current" viewBox="0 0 24 24">' +
    '<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>';

  var VIMEO_ICON =
    '<svg class="w-5 h-5 text-sky-400 fill-current" viewBox="0 0 24 24">' +
    '<path d="M22.396 7.164c-.093 2.026-1.507 4.8-4.245 8.32-2.817 3.633-5.205 5.449-7.165 5.449-1.22 0-2.253-1.127-3.102-3.383-.58-2.122-1.159-4.243-1.737-6.365-.63-2.254-1.306-3.381-2.026-3.381-.157 0-.702.33-1.637.988l-.988-1.268c1.034-.91 2.052-1.821 3.055-2.733 1.393-1.22 2.433-1.865 3.123-1.936 1.637-.157 2.646.953 3.029 3.332.41 2.56.7 4.152.871 4.776.516 2.121 1.071 3.182 1.666 3.182.47 0 1.181-.74 2.133-2.222.951-1.48 1.46-2.583 1.527-3.31.125-1.187-.34-1.782-1.4-1.782-.5 0-1.022.115-1.564.343 1.026-3.352 2.977-4.978 5.856-4.88 2.122.062 3.118 1.442 2.988 4.14z"/></svg>';

  function parseYouTubeId(url) {
    // A bare 11-character ID is accepted directly, which is what the caller
    // already checks; this handles the URL shapes.
    var re = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    var match = url.match(re);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  function parseVimeoId(url) {
    var re = /(?:www\.|player\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_-]+)?/;
    var match = url.match(re);
    return match ? match[1] : null;
  }

  function createThumbnailDownloader(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var urlInput = $('thumbUrlInput');
    var fetchBtn = $('fetchThumbBtn');
    var errorEl = $('thumbError');
    var resultsEl = $('thumbResults');
    var platformLabel = $('thumbPlatformLabel');
    var idLabel = $('thumbIdLabel');
    var platformIcon = $('platformIcon');
    var imgMax = $('imgMaxQuality');
    var fallback = $('imgMaxFallback');
    var imgHq = $('imgHqQuality');
    var imgMq = $('imgMqQuality');
    var dlMax = $('dlMaxBtn');
    var dlHq = $('dlHqBtn');
    var dlMq = $('dlMqBtn');

    if (!urlInput || !fetchBtn || !resultsEl) return null;

    function showError(message) {
      if (!errorEl) return;
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }

    function clearError() {
      if (errorEl) errorEl.classList.add('hidden');
    }

    /**
     * YouTube serves thumbnails from a different origin with no CORS header, so
     * a blob download is not possible; fetch() will throw and we fall back to
     * opening the image in a new tab, where the browser handles the save.
     */
    function forceDownload(imageUrl, fileName) {
      if (!imageUrl) return;

      fetch(imageUrl)
        .then(function (response) { return response.blob(); })
        .then(function (blob) {
          var blobUrl = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = blobUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
        })
        .catch(function () {
          window.open(imageUrl, '_blank', 'noopener');
        });
    }

    function showMaxQuality(src) {
      if (!imgMax) return;
      imgMax.src = src;
      imgMax.onload = function () {
        imgMax.classList.remove('hidden');
        if (fallback) fallback.classList.add('hidden');
      };
      // maxresdefault does not exist for every video; hqdefault always does.
      imgMax.onerror = function () {
        imgMax.onerror = null;
        imgMax.src = imgHq ? imgHq.src : src;
        imgMax.classList.remove('hidden');
        if (fallback) fallback.classList.add('hidden');
      };
    }

    function renderYouTube(id) {
      if (platformLabel) platformLabel.textContent = 'YouTube Video';
      if (idLabel) idLabel.textContent = 'ID: ' + id;
      if (platformIcon) platformIcon.innerHTML = YT_ICON;

      var maxRes = 'https://img.youtube.com/vi/' + id + '/maxresdefault.jpg';
      var hqRes = 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg';
      var mqRes = 'https://img.youtube.com/vi/' + id + '/mqdefault.jpg';

      showMaxQuality(maxRes);
      if (imgHq) imgHq.src = hqRes;
      if (imgMq) imgMq.src = mqRes;

      if (dlMax) dlMax.onclick = function (e) { e.preventDefault(); forceDownload(imgMax && imgMax.src, 'youtube-thumb-max-' + id + '.jpg'); };
      if (dlHq) dlHq.onclick = function (e) { e.preventDefault(); forceDownload(hqRes, 'youtube-thumb-hq-' + id + '.jpg'); };
      if (dlMq) dlMq.onclick = function (e) { e.preventDefault(); forceDownload(mqRes, 'youtube-thumb-mq-' + id + '.jpg'); };
    }

    function renderVimeo(id, data) {
      if (platformLabel) platformLabel.textContent = 'Vimeo Video';
      if (idLabel) idLabel.textContent = 'ID: ' + id;
      if (platformIcon) platformIcon.innerHTML = VIMEO_ICON;

      var large = data.thumbnail_large;
      var max = large.replace('_640', '_1280');

      if (imgMax) {
        imgMax.src = max;
        imgMax.classList.remove('hidden');
        if (fallback) fallback.classList.add('hidden');
      }
      if (imgHq) imgHq.src = large;
      if (imgMq) imgMq.src = data.thumbnail_medium;

      if (dlMax) dlMax.onclick = function (e) { e.preventDefault(); forceDownload(max, 'vimeo-thumb-max-' + id + '.jpg'); };
      if (dlHq) dlHq.onclick = function (e) { e.preventDefault(); forceDownload(large, 'vimeo-thumb-hq-' + id + '.jpg'); };
      if (dlMq) dlMq.onclick = function (e) { e.preventDefault(); forceDownload(data.thumbnail_medium, 'vimeo-thumb-mq-' + id + '.jpg'); };
    }

    fetchBtn.addEventListener('click', function (e) {
      e.preventDefault();

      var value = urlInput.value.trim();
      clearError();
      resultsEl.classList.add('hidden');

      if (!value) {
        showError('Please paste a YouTube or Vimeo link, or an 11-character YouTube ID.');
        return;
      }

      var ytId = parseYouTubeId(value) || (value.length === 11 ? value : null);
      var vimeoId = ytId ? null : parseVimeoId(value);

      if (ytId) {
        renderYouTube(ytId);
        resultsEl.classList.remove('hidden');
        if (window.ToolStack) window.ToolStack.track('tool_output', { tool: 'thumbnail-downloader' });
        return;
      }

      if (vimeoId) {
        fetch('https://vimeo.com/api/v2/video/' + vimeoId + '.json')
          .then(function (response) { return response.json(); })
          .then(function (data) {
            if (!data || !data[0] || !data[0].thumbnail_large) {
              showError('Vimeo returned no thumbnail for that video. Check the link.');
              return;
            }
            renderVimeo(vimeoId, data[0]);
            resultsEl.classList.remove('hidden');
            if (window.ToolStack) window.ToolStack.track('tool_output', { tool: 'thumbnail-downloader' });
          })
          .catch(function () {
            showError('Could not reach Vimeo for that video. Check the link, or your connection.');
          });
        return;
      }

      showError('That does not look like a YouTube or Vimeo link. Try a full video URL.');
    });

    urlInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        fetchBtn.click();
      }
    });

    return {
      fetch: function () { fetchBtn.click(); },
      parseYouTubeId: parseYouTubeId,
      parseVimeoId: parseVimeoId
    };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createThumbnailDownloader = createThumbnailDownloader;
})(window, document);

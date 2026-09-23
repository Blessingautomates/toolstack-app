/**
 * PDF → image rasteriser — shared by PDF to JPG and PDF to PNG.
 *
 * The two tools differ in exactly three things: the encoder, the file
 * extension, and whether the quality slider is shown at all (PNG is lossless,
 * so a quality control on it would be a lie). Everything else — page ranges,
 * resolution, the per-page result list — is identical, and lives here.
 *
 * Results are collected first and downloaded afterwards, rather than streamed
 * straight to disk page by page. That is deliberate: a browser only reliably
 * honours a download that is inside a user gesture, so fifteen pages fired from
 * one click get silently dropped by Safari and truncated by Chrome. Holding
 * the encoded pages and offering a button per page — plus an explicit Download
 * all — keeps every file reachable whatever the browser decides to allow.
 */
(function (window, document) {
  'use strict';

  /**
   * @param {object} config
   *   mime    'image/jpeg' | 'image/png'
   *   ext     'jpg' | 'png'
   *   tool    analytics key
   *   quality whether to show and apply the quality slider
   */
  function createRasterizer(config) {
    return function (root) {
      if (!root) return null;

      var P = window.ToolStackPDF;
      if (!P) return null;

      var $ = function (id) { return root.querySelector('#' + id); };

      var zone = $('pdfDropZone');
      var input = $('pdfFileInput');
      var dropLabel = $('pdfDropLabel');
      var fileMeta = $('pdfFileMeta');
      var options = $('pdfOptions');
      var resolution = $('pdfResolution');
      var quality = $('pdfQuality');
      var qualityVal = $('pdfQualityVal');
      var pageSpec = $('pdfPageSpec');
      var runBtn = $('pdfRunBtn');
      var result = $('pdfResult');
      var resultText = $('pdfResultText');
      var gallery = $('pdfGallery');
      var downloadAllBtn = $('pdfDownloadAllBtn');

      if (!zone || !input) return null;

      var status = P.createStatus($('pdfStatus'));
      var reveal = P.createReveal(root);

      var file = null;
      var rendered = []; // {name, blob, url}

      function clearRendered() {
        rendered.forEach(function (item) { URL.revokeObjectURL(item.url); });
        rendered = [];
      }

      function reset() {
        file = null;
        clearRendered();
        if (gallery) gallery.innerHTML = '';
        if (runBtn) runBtn.disabled = true;
        if (options) options.classList.add('hidden');
        if (result) result.classList.add('hidden');
      }

      function load(selected) {
        var candidate = selected[0];
        if (!candidate) return;

        if (!/pdf$/i.test(candidate.type) && !/\.pdf$/i.test(candidate.name)) {
          reset();
          status('"' + candidate.name + '" is not a PDF. Choose a .pdf file.', 'error');
          return;
        }

        file = candidate;
        clearRendered();
        if (gallery) gallery.innerHTML = '';
        if (result) result.classList.add('hidden');
        if (dropLabel) dropLabel.textContent = 'Loaded: ' + candidate.name;
        if (fileMeta) fileMeta.textContent = P.formatBytes(candidate.size);
        if (options) options.classList.remove('hidden');
        if (runBtn) runBtn.disabled = false;
        status('Ready. Choose a resolution and press Convert.', 'ok');
      }

      function convert() {
        if (!file) return;

        var scale = resolution ? Number(resolution.value) : 2;
        var q = config.quality && quality ? Number(quality.value) / 100 : undefined;
        var wanted = pageSpec && pageSpec.value.trim() ? pageSpec.value : null;

        runBtn.disabled = true;
        if (result) result.classList.add('hidden');
        clearRendered();
        status('Loading the renderer…', 'busy');

        var doc = null;

        P.openPdf(file).then(function (pdf) {
          doc = pdf;
          var indexes = wanted ? P.parseRanges(wanted, doc.numPages, { openEnded: true }) : null;
          return renderSelection(doc, indexes, scale, q);
        }).then(function () {
          return doc.destroy();
        }).then(function () {
          finish();
        }).catch(function (err) {
          status(message(err), 'error');
          runBtn.disabled = false;
        });
      }

      function renderSelection(doc, indexes, scale, q) {
        var total = indexes ? indexes.length : doc.numPages;
        var chain = Promise.resolve();

        for (var i = 0; i < total; i++) {
          (function (position) {
            var pageNumber = indexes ? indexes[position] + 1 : position + 1;

            chain = chain.then(function () {
              status('Rendering page ' + pageNumber + ' — ' + (position + 1) + ' of ' + total + '…', 'busy');
              return doc.getPage(pageNumber).then(function (page) {
                return P.renderPage(page, scale);
              }).then(function (canvas) {
                return encode(canvas, q).then(function (blob) {
                  var name = P.stem(file.name) + '-page-' + pageNumber + '.' + config.ext;
                  rendered.push({ name: name, blob: blob, url: URL.createObjectURL(blob) });
                });
              });
            });
          })(i);
        }

        return chain;
      }

      function encode(canvas, q) {
        return new Promise(function (resolve, reject) {
          canvas.toBlob(function (blob) {
            if (!blob) { reject(new Error('A page could not be encoded.')); return; }
            resolve(blob);
          }, config.mime, q);
        });
      }

      function finish() {
        if (!rendered.length) {
          status('No pages were rendered.', 'error');
          runBtn.disabled = false;
          return;
        }

        var bytes = rendered.reduce(function (sum, item) { return sum + item.blob.size; }, 0);

        if (gallery) {
          gallery.innerHTML = rendered.map(function (item, i) {
            return '' +
              '<div class="bg-gray-950 border border-gray-800 rounded-xl p-3 flex items-center justify-between gap-3">' +
                '<div class="min-w-0">' +
                  '<p class="text-xs font-bold text-gray-200 truncate">' + escapeHtml(item.name) + '</p>' +
                  '<p class="text-[10px] text-gray-500 mt-0.5">' + P.formatBytes(item.blob.size) + '</p>' +
                '</div>' +
                '<button type="button" data-ts-page="' + i + '" ' +
                  'class="flex-shrink-0 px-3 py-1.5 rounded-xl border border-gray-700 hover:border-brand-500 text-gray-300 hover:text-brand-400 font-semibold text-xs transition">' +
                  'Download' +
                '</button>' +
              '</div>';
          }).join('');
        }

        if (result) result.classList.remove('hidden');
        if (resultText) {
          resultText.textContent = rendered.length + ' page' + (rendered.length === 1 ? '' : 's') +
            ' rendered · ' + P.formatBytes(bytes) + ' total';
        }

        status('Done — ' + rendered.length + ' file' + (rendered.length === 1 ? '' : 's') + ' ready.', 'ok');
        runBtn.disabled = false;
        P.track(config.tool);
        reveal();
      }

      function downloadOne(index) {
        var item = rendered[index];
        if (!item) return;
        var link = document.createElement('a');
        link.href = item.url;
        link.download = item.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      /**
       * One click per file, spaced out. The gap is not cosmetic: Chrome drops
       * downloads fired in the same tick after the first few, and the delay is
       * what keeps a 40-page export from silently losing half its files.
       */
      function downloadAll() {
        rendered.forEach(function (item, i) {
          window.setTimeout(function () { downloadOne(i); }, i * 350);
        });
        P.toast(rendered.length + ' download' + (rendered.length === 1 ? '' : 's') +
          ' started. If your browser asks, allow multiple downloads.');
      }

      function escapeHtml(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }

      function message(err) {
        if (!err) return 'Something went wrong.';
        if (err.name === 'PasswordException') {
          return 'This PDF is password-protected. Unlock it first, then convert it.';
        }
        return err.message || String(err);
      }

      P.wireDropZone(zone, input, load);

      if (quality && qualityVal) {
        quality.addEventListener('input', function () { qualityVal.textContent = quality.value; });
      }

      if (runBtn) runBtn.addEventListener('click', convert);

      if (gallery) {
        gallery.addEventListener('click', function (e) {
          var btn = e.target.closest ? e.target.closest('[data-ts-page]') : null;
          if (!btn) return;
          downloadOne(Number(btn.getAttribute('data-ts-page')));
        });
      }

      if (downloadAllBtn) downloadAllBtn.addEventListener('click', downloadAll);

      reset();
      return { convert: convert, load: load };
    };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createRasterizer = createRasterizer;
})(window, document);

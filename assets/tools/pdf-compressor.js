/**
 * PDF Compressor — shared engine.
 *
 * How it compresses, stated plainly because the trade-off is real: each page is
 * rendered to a canvas and re-encoded as a JPEG, and the new PDF is built from
 * those images. That is what makes it work on the files people actually want
 * compressed — scans, photo-heavy exports, decks that were printed to PDF —
 * where the bulk of the bytes are already images and re-encoding them at a
 * lower resolution is exactly the right move.
 *
 * The cost is that the output is a picture of each page rather than the page
 * itself: text stops being selectable, stops being searchable, and stops being
 * readable by a screen reader. Upstream pdf-lib cannot recompress an existing
 * content stream, so there is no lossless mode to offer here, and pretending
 * otherwise would be the dishonest part. The page copy says so in as many words,
 * and so does the note next to the button.
 *
 * Required markup (ids, inside `root`):
 *   #pdfDropZone #pdfFileInput #pdfDropLabel #pdfFileMeta #pdfStatus
 *   #pdfOptions #pdfQuality #pdfQualityVal #pdfResolution #pdfRunBtn
 *   #pdfResult #pdfResultText
 */
(function (window, document) {
  'use strict';

  function createPdfCompressor(root) {
    if (!root) return null;

    var P = window.ToolStackPDF;
    if (!P) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var zone = $('pdfDropZone');
    var input = $('pdfFileInput');
    var dropLabel = $('pdfDropLabel');
    var fileMeta = $('pdfFileMeta');
    var options = $('pdfOptions');
    var quality = $('pdfQuality');
    var qualityVal = $('pdfQualityVal');
    var resolution = $('pdfResolution');
    var runBtn = $('pdfRunBtn');
    var result = $('pdfResult');
    var resultText = $('pdfResultText');

    if (!zone || !input) return null;

    var status = P.createStatus($('pdfStatus'));
    var reveal = P.createReveal(root);

    var file = null;
    var originalBytes = 0;

    /* The output document, created on the first run. Held as a promise so the
       per-page callback can embed into it while the renderer is still working,
       and cached so a second compression on the same page view reuses it. */
    var docPromise = null;

    function outputDoc() {
      if (!docPromise) {
        docPromise = P.loadPdfLib().then(function (PDFLib) {
          return PDFLib.PDFDocument.create();
        }).catch(function (err) {
          docPromise = null; // let a later attempt retry the download
          throw err;
        });
      }
      return docPromise;
    }

    function reset() {
      file = null;
      originalBytes = 0;
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
      originalBytes = candidate.size;
      if (dropLabel) dropLabel.textContent = 'Loaded: ' + candidate.name;
      if (fileMeta) fileMeta.textContent = P.formatBytes(originalBytes);
      if (options) options.classList.remove('hidden');
      if (runBtn) runBtn.disabled = false;
      if (result) result.classList.add('hidden');
      status('Ready. Pick a quality and press Compress.', 'ok');
    }

    function compress() {
      if (!file) return;

      var q = quality ? Number(quality.value) / 100 : 0.7;
      var scale = resolution ? Number(resolution.value) : 1.5;
      var pages = 0;

      runBtn.disabled = true;
      if (result) result.classList.add('hidden');
      status('Loading the PDF libraries…', 'busy');

      outputDoc().then(function () {
        return P.renderEachPage(file, {
          scale: scale,
          onProgress: function (n, total) {
            pages = total;
            status('Rendering page ' + n + ' of ' + total + '…', 'busy');
          }
        }, function (canvas) {
          return outputDoc().then(function (doc) {
            return P.embedCanvas(doc, canvas, 'image/jpeg', q).then(function (image) {
              // Canvas pixels at scale 1 are PDF points, so dividing by the
              // render scale gives back the page's original physical size: a
              // 144 dpi render still produces a page the same size in mm.
              var width = canvas.width / scale;
              var height = canvas.height / scale;
              var page = doc.addPage([width, height]);
              page.drawImage(image, { x: 0, y: 0, width: width, height: height });
            });
          });
        });
      }).then(function () {
        return outputDoc();
      }).then(function (doc) {
        return doc.save({ useObjectStreams: true });
      }).then(function (bytes) {
        P.download(bytes, P.stem(file.name) + '-compressed.pdf', 'application/pdf');

        var saved = originalBytes - bytes.length;
        var pct = originalBytes ? Math.round((saved / originalBytes) * 100) : 0;

        if (result) result.classList.remove('hidden');
        if (resultText) {
          resultText.textContent =
            pages + ' page' + (pages === 1 ? '' : 's') + ' · ' +
            P.formatBytes(originalBytes) + ' → ' + P.formatBytes(bytes.length) +
            (saved > 0 ? ' — ' + pct + '% smaller' : ' — no saving');
        }

        status(saved > 0
          ? 'Compressed and downloaded: ' + pct + '% smaller.'
          : 'Downloaded, but it came out no smaller. Try a lower quality or resolution.',
          saved > 0 ? 'ok' : 'error');

        runBtn.disabled = false;
        P.track('pdf-compressor');
        reveal();
      }).catch(function (err) {
        status(message(err), 'error');
        runBtn.disabled = false;
      });
    }

    function message(err) {
      if (!err) return 'Something went wrong.';
      if (err.name === 'PasswordException') {
        return 'This PDF is password-protected. Unlock it first, then compress it.';
      }
      return err.message || String(err);
    }

    P.wireDropZone(zone, input, load);

    if (quality && qualityVal) {
      quality.addEventListener('input', function () { qualityVal.textContent = quality.value; });
    }

    if (runBtn) runBtn.addEventListener('click', compress);

    reset();
    return { compress: compress, load: load };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createPdfCompressor = createPdfCompressor;
})(window, document);

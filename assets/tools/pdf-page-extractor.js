/**
 * PDF Page Extractor — pull a subset of pages into a new PDF.
 *
 * pdf-lib's copyPages keeps each page's own content stream, fonts and images
 * intact and copies only what the chosen pages reference, so the output is the
 * original page rather than a picture of it: text stays selectable and
 * searchable, and vectors stay vectors. That is the whole reason to use this
 * over screenshotting the pages you want.
 *
 * Required markup (ids, inside `root`):
 *   #pdfDropZone #pdfFileInput #pdfDropLabel #pdfFileMeta #pdfStatus
 *   #pdfOptions #pdfPageSpec #pdfRunBtn #pdfResult #pdfResultText
 */
(function (window, document) {
  'use strict';

  function createPdfPageExtractor(root) {
    if (!root) return null;

    var P = window.ToolStackPDF;
    if (!P) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var zone = $('pdfDropZone');
    var input = $('pdfFileInput');
    var dropLabel = $('pdfDropLabel');
    var fileMeta = $('pdfFileMeta');
    var options = $('pdfOptions');
    var pageSpec = $('pdfPageSpec');
    var runBtn = $('pdfRunBtn');
    var result = $('pdfResult');
    var resultText = $('pdfResultText');

    if (!zone || !input) return null;

    var status = P.createStatus($('pdfStatus'));
    var reveal = P.createReveal(root);

    var file = null;
    var pageCount = 0;

    function reset() {
      file = null;
      pageCount = 0;
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

      status('Reading the document…', 'busy');

      P.loadPdfLib().then(function (PDFLib) {
        return P.readFileBytes(candidate).then(function (bytes) {
          return PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true });
        });
      }).then(function (doc) {
        file = candidate;
        pageCount = doc.getPageCount();

        if (dropLabel) dropLabel.textContent = 'Loaded: ' + candidate.name;
        if (fileMeta) {
          fileMeta.textContent = pageCount + ' page' + (pageCount === 1 ? '' : 's') +
            ' · ' + P.formatBytes(candidate.size);
        }
        if (options) options.classList.remove('hidden');
        if (runBtn) runBtn.disabled = false;
        if (pageSpec) pageSpec.placeholder = 'e.g. 1-3, 7, 10-' + pageCount;

        status('Ready. Enter the pages to keep.', 'ok');
      }).catch(function (err) {
        reset();
        status(message(err), 'error');
      });
    }

    function extract() {
      if (!file) return;

      runBtn.disabled = true;
      if (result) result.classList.add('hidden');

      var indexes;

      try {
        indexes = P.parseRanges(pageSpec ? pageSpec.value : '', pageCount, { openEnded: true });
      } catch (err) {
        status(err.message, 'error');
        runBtn.disabled = false;
        return;
      }

      status('Extracting ' + indexes.length + ' page' + (indexes.length === 1 ? '' : 's') + '…', 'busy');

      P.loadPdfLib().then(function (PDFLib) {
        return Promise.all([
          P.readFileBytes(file).then(function (bytes) {
            return PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true });
          }),
          PDFLib.PDFDocument.create()
        ]);
      }).then(function (pair) {
        var source = pair[0];
        var out = pair[1];

        return out.copyPages(source, indexes).then(function (copied) {
          copied.forEach(function (page) { out.addPage(page); });
          return out.save({ useObjectStreams: true });
        });
      }).then(function (bytes) {
        P.download(bytes, P.stem(file.name) + '-pages.pdf', 'application/pdf');

        if (result) result.classList.remove('hidden');
        if (resultText) {
          resultText.textContent = indexes.length + ' of ' + pageCount + ' pages · ' +
            P.formatBytes(bytes.length);
        }

        status('Extracted and downloaded.', 'ok');
        runBtn.disabled = false;
        P.track('pdf-page-extractor');
        reveal();
      }).catch(function (err) {
        status(message(err), 'error');
        runBtn.disabled = false;
      });
    }

    function message(err) {
      if (!err) return 'Something went wrong.';
      if (err.name === 'PasswordException' || /encrypted/i.test(err.message || '')) {
        return 'This PDF is password-protected. Unlock it first, then extract pages.';
      }
      return err.message || String(err);
    }

    P.wireDropZone(zone, input, load);
    if (runBtn) runBtn.addEventListener('click', extract);

    reset();
    return { extract: extract, load: load };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createPdfPageExtractor = createPdfPageExtractor;
})(window, document);

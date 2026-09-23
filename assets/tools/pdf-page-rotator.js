/**
 * PDF Page Rotator — turn pages by 90°, 180° or 270°.
 *
 * pdf-lib writes the rotation into the page's own /Rotate entry rather than
 * redrawing anything, so the output is the original document with a different
 * instruction on the page: text stays selectable, the file size barely moves,
 * and rotating back is lossless.
 *
 * Rotation is relative, not absolute. Pressing it twice turns a page twice,
 * which is what the button implies; the amount is read back off the page's
 * current /Rotate and added to. Angles are normalised into 0/90/180/270
 * because a /Rotate of 450 is legal but confuses some readers.
 *
 * Required markup (ids, inside `root`):
 *   #pdfDropZone #pdfFileInput #pdfDropLabel #pdfFileMeta #pdfStatus
 *   #pdfOptions #pdfRotateAngle #pdfRotateScope #pdfPageSpec
 *   #pdfRunBtn #pdfResult #pdfResultText
 */
(function (window, document) {
  'use strict';

  function createPdfPageRotator(root) {
    if (!root) return null;

    var P = window.ToolStackPDF;
    if (!P) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var zone = $('pdfDropZone');
    var input = $('pdfFileInput');
    var dropLabel = $('pdfDropLabel');
    var fileMeta = $('pdfFileMeta');
    var options = $('pdfOptions');
    var angle = $('pdfRotateAngle');
    var scope = $('pdfRotateScope');
    var pageSpec = $('pdfPageSpec');
    var specRow = $('pdfPageSpecRow');
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

    /** The page-range box only matters for the "selected" scope. */
    function syncScope() {
      if (!specRow || !scope) return;
      specRow.classList.toggle('hidden', scope.value !== 'selected');
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

        status('Ready. Choose an angle and press Rotate.', 'ok');
      }).catch(function (err) {
        reset();
        status(message(err), 'error');
      });
    }

    function rotate() {
      if (!file) return;

      runBtn.disabled = true;
      if (result) result.classList.add('hidden');

      var degrees = angle ? Number(angle.value) : 90;
      var selectedOnly = scope && scope.value === 'selected';
      var indexes = null;

      if (selectedOnly) {
        try {
          indexes = P.parseRanges(pageSpec ? pageSpec.value : '', pageCount, { openEnded: true });
        } catch (err) {
          status(err.message, 'error');
          runBtn.disabled = false;
          return;
        }
      }

      status('Rotating…', 'busy');

      P.loadPdfLib().then(function (PDFLib) {
        return P.readFileBytes(file).then(function (bytes) {
          return PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true }).then(function (doc) {
            return { lib: PDFLib, doc: doc };
          });
        });
      }).then(function (pair) {
        var pages = pair.doc.getPages();
        var targets = indexes || pages.map(function (_, i) { return i; });

        targets.forEach(function (index) {
          var page = pages[index];
          if (!page) return;

          // The page's current angle, so this is a turn rather than a set.
          var current = page.getRotation().angle || 0;
          var next = (((current + degrees) % 360) + 360) % 360;
          page.setRotation(pair.lib.degrees(next));
        });

        return pair.doc.save({ useObjectStreams: true }).then(function (bytes) {
          return { bytes: bytes, count: targets.length };
        });
      }).then(function (out) {
        P.download(out.bytes, P.stem(file.name) + '-rotated.pdf', 'application/pdf');

        if (result) result.classList.remove('hidden');
        if (resultText) {
          resultText.textContent = out.count + ' page' + (out.count === 1 ? '' : 's') +
            ' turned by ' + degrees + '° · ' + P.formatBytes(out.bytes.length);
        }

        status('Rotated and downloaded.', 'ok');
        runBtn.disabled = false;
        P.track('pdf-page-rotator');
        reveal();
      }).catch(function (err) {
        status(message(err), 'error');
        runBtn.disabled = false;
      });
    }

    function message(err) {
      if (!err) return 'Something went wrong.';
      if (err.name === 'PasswordException' || /encrypted/i.test(err.message || '')) {
        return 'This PDF is password-protected. Unlock it first, then rotate it.';
      }
      return err.message || String(err);
    }

    P.wireDropZone(zone, input, load);
    if (runBtn) runBtn.addEventListener('click', rotate);
    if (scope) scope.addEventListener('change', syncScope);

    reset();
    syncScope();
    return { rotate: rotate, load: load };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createPdfPageRotator = createPdfPageRotator;
})(window, document);

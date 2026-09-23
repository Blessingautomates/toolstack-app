/**
 * PDF Page Reorderer — rebuild a document with its pages in a new order.
 *
 * The whole document is rewritten rather than patched, because a PDF's page
 * tree is what defines order and moving one page means renumbering the tree.
 * copyPages is used for the same reason as in the extractor: the pages come
 * across as real pages, so nothing is rasterised.
 *
 * The order box is seeded with the document's natural order the moment a file
 * loads. That is the whole interaction design: the common jobs — swap two
 * pages, move the cover to the front, reverse a scan — are then edits to a
 * list that is already correct, instead of a blank field the user has to fill
 * in from scratch and get exactly right.
 *
 * Required markup (ids, inside `root`):
 *   #pdfDropZone #pdfFileInput #pdfDropLabel #pdfFileMeta #pdfStatus
 *   #pdfOptions #pdfOrderSpec #pdfReverseBtn #pdfResetBtn
 *   #pdfRunBtn #pdfResult #pdfResultText #pdfOrderHint
 */
(function (window, document) {
  'use strict';

  function createPdfPageReorderer(root) {
    if (!root) return null;

    var P = window.ToolStackPDF;
    if (!P) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var zone = $('pdfDropZone');
    var input = $('pdfFileInput');
    var dropLabel = $('pdfDropLabel');
    var fileMeta = $('pdfFileMeta');
    var options = $('pdfOptions');
    var orderSpec = $('pdfOrderSpec');
    var hint = $('pdfOrderHint');
    var reverseBtn = $('pdfReverseBtn');
    var resetBtn = $('pdfResetBtn');
    var runBtn = $('pdfRunBtn');
    var result = $('pdfResult');
    var resultText = $('pdfResultText');

    if (!zone || !input) return null;

    var status = P.createStatus($('pdfStatus'));
    var reveal = P.createReveal(root);

    var file = null;
    var pageCount = 0;

    var naturalOrder = function () {
      var out = [];
      for (var i = 1; i <= pageCount; i++) out.push(i);
      return out;
    };

    function setOrder(list) {
      if (orderSpec) orderSpec.value = list.join(', ');
      updateHint();
    }

    /**
     * Say out loud what the current list will produce. A list that names every
     * page once is a reorder; anything else is also an extract, and the user
     * should be told which one they are about to get rather than discovering it
     * in the output.
     */
    function updateHint() {
      if (!hint) return;

      if (!pageCount) { hint.textContent = ''; return; }

      var raw = orderSpec ? orderSpec.value : '';
      if (!raw.trim()) { hint.textContent = 'Names every page, in the order given.'; return; }

      var numbers = raw.split(/[\s,]+/).filter(function (s) { return s !== ''; });
      var valid = numbers.every(function (s) { return /^\d+$/.test(s); });

      if (!valid || numbers.length !== pageCount) {
        hint.textContent = numbers.length + ' of ' + pageCount + ' pages listed — ' +
          'the rest will be dropped, so this also extracts.';
        return;
      }

      var seen = {};
      var duplicate = false;
      numbers.forEach(function (s) {
        if (seen[s]) duplicate = true;
        seen[s] = 1;
      });

      hint.textContent = duplicate
        ? 'A page appears more than once — it will be duplicated in the output.'
        : 'Names every page exactly once: a straight reorder.';
    }

    function reset() {
      file = null;
      pageCount = 0;
      if (runBtn) runBtn.disabled = true;
      if (options) options.classList.add('hidden');
      if (result) result.classList.add('hidden');
      if (orderSpec) orderSpec.value = '';
      if (hint) hint.textContent = '';
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

        setOrder(naturalOrder());
        status('Ready. Edit the order and press Rebuild PDF.', 'ok');
      }).catch(function (err) {
        reset();
        status(message(err), 'error');
      });
    }

    function build() {
      if (!file) return;

      runBtn.disabled = true;
      if (result) result.classList.add('hidden');

      var indexes;

      try {
        // openEnded is off here: a trailing dash in a reorder list is almost
        // always a half-finished edit, and quietly expanding it would produce
        // a plausible-looking document with the wrong pages in it.
        indexes = P.parseRanges(orderSpec ? orderSpec.value : '', pageCount, { openEnded: false });
      } catch (err) {
        status(err.message, 'error');
        runBtn.disabled = false;
        return;
      }

      status('Rebuilding ' + indexes.length + ' page' + (indexes.length === 1 ? '' : 's') + '…', 'busy');

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
        P.download(bytes, P.stem(file.name) + '-reordered.pdf', 'application/pdf');

        if (result) result.classList.remove('hidden');
        if (resultText) {
          resultText.textContent = indexes.length + ' page' + (indexes.length === 1 ? '' : 's') +
            ' · ' + P.formatBytes(bytes.length);
        }

        status('Rebuilt and downloaded.', 'ok');
        runBtn.disabled = false;
        P.track('pdf-page-reorderer');
        reveal();
      }).catch(function (err) {
        status(message(err), 'error');
        runBtn.disabled = false;
      });
    }

    function message(err) {
      if (!err) return 'Something went wrong.';
      if (err.name === 'PasswordException' || /encrypted/i.test(err.message || '')) {
        return 'This PDF is password-protected. Unlock it first, then reorder it.';
      }
      return err.message || String(err);
    }

    P.wireDropZone(zone, input, load);

    if (orderSpec) orderSpec.addEventListener('input', updateHint);

    if (reverseBtn) {
      reverseBtn.addEventListener('click', function () {
        if (!pageCount) return;
        setOrder(naturalOrder().reverse());
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (!pageCount) return;
        setOrder(naturalOrder());
      });
    }

    if (runBtn) runBtn.addEventListener('click', build);

    reset();
    return { build: build, load: load };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createPdfPageReorderer = createPdfPageReorderer;
})(window, document);

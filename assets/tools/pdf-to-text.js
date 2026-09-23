/**
 * PDF to Text — pull the text layer out of a PDF.
 *
 * This reads the text a PDF already contains. It is not OCR, and that
 * distinction is the whole honesty of the page: a scanner produces a PDF that
 * is a photograph of paper with no text layer at all, and this tool will
 * correctly return nothing for it. The result panel says so explicitly rather
 * than showing an empty box, because "no text found" and "the tool is broken"
 * look identical otherwise.
 *
 * Line grouping uses the y coordinate of each text run rather than the
 * hasEOL flag. hasEOL is only set by some producers, while the baseline y is
 * always there; grouping on it is what recovers paragraphs from the many PDFs
 * that emit one run per word.
 *
 * Required markup (ids, inside `root`):
 *   #pdfDropZone #pdfFileInput #pdfDropLabel #pdfFileMeta #pdfStatus
 *   #pdfOptions #pdfPageSpec #pdfRunBtn #pdfTextOutput #pdfTextMeta
 *   #pdfCopyBtn #pdfDownloadBtn #pdfResult #pdfResultText
 */
(function (window, document) {
  'use strict';

  function createPdfToText(root) {
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
    var output = $('pdfTextOutput');
    var outputMeta = $('pdfTextMeta');
    var copyBtn = $('pdfCopyBtn');
    var downloadBtn = $('pdfDownloadBtn');
    var result = $('pdfResult');
    var resultText = $('pdfResultText');

    if (!zone || !input) return null;

    var status = P.createStatus($('pdfStatus'));
    var reveal = P.createReveal(root);

    var file = null;
    var text = '';

    function reset() {
      file = null;
      text = '';
      if (runBtn) runBtn.disabled = true;
      if (options) options.classList.add('hidden');
      if (result) result.classList.add('hidden');
      if (output) output.value = '';
      if (outputMeta) outputMeta.textContent = '';
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
      if (dropLabel) dropLabel.textContent = 'Loaded: ' + candidate.name;
      if (fileMeta) fileMeta.textContent = P.formatBytes(candidate.size);
      if (options) options.classList.remove('hidden');
      if (runBtn) runBtn.disabled = false;
      if (result) result.classList.add('hidden');
      status('Ready. Press Extract text.', 'ok');
    }

    function extract() {
      if (!file) return;

      var wanted = pageSpec && pageSpec.value.trim() ? pageSpec.value : null;
      var doc = null;
      var chunks = [];

      runBtn.disabled = true;
      if (result) result.classList.add('hidden');
      status('Loading the PDF reader…', 'busy');

      P.openPdf(file).then(function (pdf) {
        doc = pdf;
        var indexes = wanted
          ? P.parseRanges(wanted, doc.numPages, { openEnded: true })
          : null;
        var total = indexes ? indexes.length : doc.numPages;
        var chain = Promise.resolve();

        for (var i = 0; i < total; i++) {
          (function (position) {
            var pageNumber = indexes ? indexes[position] + 1 : position + 1;

            chain = chain.then(function () {
              status('Reading page ' + pageNumber + ' — ' + (position + 1) + ' of ' + total + '…', 'busy');
              return doc.getPage(pageNumber).then(function (page) {
                return page.getTextContent();
              }).then(function (content) {
                chunks.push({
                  page: pageNumber,
                  text: itemsToText(content.items)
                });
              });
            });
          })(i);
        }

        return chain.then(function () { return total; });
      }).then(function (total) {
        return doc.destroy().then(function () { return total; });
      }).then(function (total) {
        // Page markers only when there is more than one page: on a single-page
        // document they are noise the user has to delete.
        text = total > 1
          ? chunks.map(function (c) {
              return '--- Page ' + c.page + ' ---\n' + c.text;
            }).join('\n\n')
          : (chunks[0] ? chunks[0].text : '');

        var characters = text.replace(/\s/g, '').length;
        var words = text.split(/\s+/).filter(Boolean).length;

        if (output) output.value = text;

        if (!characters) {
          if (outputMeta) outputMeta.textContent = 'No text layer found.';
          status('No text found. This PDF is probably a scan, which needs OCR — ' +
            'see the note below.', 'error');
          runBtn.disabled = false;
          return;
        }

        if (outputMeta) {
          outputMeta.textContent = words.toLocaleString() + ' words · ' +
            characters.toLocaleString() + ' characters';
        }

        if (result) result.classList.remove('hidden');
        if (resultText) {
          resultText.textContent = words.toLocaleString() + ' words from ' +
            total + ' page' + (total === 1 ? '' : 's');
        }

        status('Extracted ' + words.toLocaleString() + ' words.', 'ok');
        runBtn.disabled = false;
        P.track('pdf-to-text');
        reveal();
      }).catch(function (err) {
        status(message(err), 'error');
        runBtn.disabled = false;
      });
    }

    /**
     * Group text runs into lines by baseline position.
     *
     * pdf.js reports a run per word for most producers, with no trailing space,
     * so runs on the same line are joined with a space. A run that starts a new
     * line is joined with a newline. Runs with no transform at all are appended
     * in order, which is the best available guess for the rare generated PDF
     * that omits it.
     */
    function itemsToText(items) {
      var lines = [];
      var current = null;

      (items || []).forEach(function (item) {
        if (typeof item.str !== 'string') return;

        var y = item.transform && item.transform.length >= 6
          ? Math.round(item.transform[5])
          : null;

        if (current === null || (y !== null && Math.abs(y - current.y) > 1)) {
          if (current) lines.push(current.text);
          current = { y: y === null ? 0 : y, text: item.str };
          return;
        }

        current.text += (current.text && !/\s$/.test(current.text) ? ' ' : '') + item.str;
      });

      if (current) lines.push(current.text);

      return lines
        .map(function (line) { return line.replace(/\s+$/, ''); })
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }

    function message(err) {
      if (!err) return 'Something went wrong.';
      if (err.name === 'PasswordException') {
        return 'This PDF is password-protected. Unlock it first, then extract its text.';
      }
      return err.message || String(err);
    }

    P.wireDropZone(zone, input, load);

    if (runBtn) runBtn.addEventListener('click', extract);

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!text) return;
        if (window.ToolStack && window.ToolStack.copyText) {
          window.ToolStack.copyText(text, function (ok) {
            P.toast(ok ? 'Text copied to your clipboard.' : 'Copy failed — select the text and copy it manually.');
          });
        } else {
          P.toast('Select the text and copy it manually.');
        }
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', function () {
        if (!text || !file) return;
        P.download(new TextEncoder().encode(text), P.stem(file.name) + '.txt', 'text/plain');
      });
    }

    reset();
    return { extract: extract, load: load, text: function () { return text; } };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createPdfToText = createPdfToText;
})(window, document);

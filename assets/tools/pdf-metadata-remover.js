/**
 * PDF Metadata Remover — clear the identifying fields a PDF carries.
 *
 * What it clears, precisely: the document information dictionary — Title,
 * Author, Subject, Keywords, Creator, Producer — and the two timestamps. That
 * is the set most often overlooked, and the one that leaks things people
 * actively meant to keep: a client name in the title, a username in the
 * author, a full file path in the producer, an unredacted colleague's name in
 * the creator.
 *
 * What it does not claim to do: a forensic clean. pdf-lib rewrites the file
 * from its object model, so structures it does not model — including the XMP
 * packet that some scanners and Office exports embed — do not survive the
 * rewrite. But this is a side effect of how the file is written, not a scan
 * that reports what it removed, so the page says "strong clean, not a forensic
 * one" rather than overpromising. Anything that genuinely must not be
 * recoverable should be rasterised, which is what the PDF Compressor does.
 *
 * Required markup (ids, inside `root`):
 *   #pdfDropZone #pdfFileInput #pdfDropLabel #pdfFileMeta #pdfStatus
 *   #pdfOptions #pdfMetaList #pdfRunBtn #pdfResult #pdfResultText
 */
(function (window, document) {
  'use strict';

  /** The fields read for the report, in the order they are shown. */
  var FIELDS = [
    ['Title', 'getTitle'],
    ['Author', 'getAuthor'],
    ['Subject', 'getSubject'],
    ['Keywords', 'getKeywords'],
    ['Creator', 'getCreator'],
    ['Producer', 'getProducer']
  ];

  function createPdfMetadataRemover(root) {
    if (!root) return null;

    var P = window.ToolStackPDF;
    if (!P) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var zone = $('pdfDropZone');
    var input = $('pdfFileInput');
    var dropLabel = $('pdfDropLabel');
    var fileMeta = $('pdfFileMeta');
    var options = $('pdfOptions');
    var metaList = $('pdfMetaList');
    var runBtn = $('pdfRunBtn');
    var result = $('pdfResult');
    var resultText = $('pdfResultText');

    if (!zone || !input) return null;

    var status = P.createStatus($('pdfStatus'));
    var reveal = P.createReveal(root);

    var file = null;
    var doc = null;
    var found = [];

    function reset() {
      file = null;
      doc = null;
      found = [];
      if (runBtn) runBtn.disabled = true;
      if (options) options.classList.add('hidden');
      if (result) result.classList.add('hidden');
      if (metaList) metaList.innerHTML = '';
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
      }).then(function (loaded) {
        file = candidate;
        doc = loaded;

        if (dropLabel) dropLabel.textContent = 'Loaded: ' + candidate.name;

        found = [];
        FIELDS.forEach(function (pair) {
          var value = '';
          try {
            value = loaded[pair[1]]() || '';
          } catch (err) {
            value = '';
          }
          if (value) found.push({ label: pair[0], value: String(value) });
        });

        var dates = readDates(loaded);

        if (fileMeta) {
          fileMeta.textContent = (found.length + dates.length) +
            ' metadata field' + ((found.length + dates.length) === 1 ? '' : 's') + ' found · ' +
            P.formatBytes(candidate.size);
        }

        renderMeta(dates);
        if (options) options.classList.remove('hidden');
        if (runBtn) runBtn.disabled = false;

        status(found.length + dates.length
          ? 'Found ' + (found.length + dates.length) + ' metadata field' +
            ((found.length + dates.length) === 1 ? '' : 's') + '. Press Remove.'
          : 'No document metadata found. Removing it is still safe.', 'ok');
      }).catch(function (err) {
        reset();
        status(message(err), 'error');
      });
    }

    function readDates(document_) {
      var out = [];
      [['Created', 'getCreationDate'], ['Modified', 'getModificationDate']]
        .forEach(function (pair) {
          try {
            var value = document_[pair[1]]();
            if (value) out.push({ label: pair[0], value: value.toISOString() });
          } catch (err) {
            // A malformed date in an otherwise readable file is common enough;
            // it is not a reason to refuse the document.
          }
        });
      return out;
    }

    function renderMeta(dates) {
      if (!metaList) return;

      var rows = found.concat(dates);
      if (!rows.length) {
        metaList.innerHTML = '<p class="text-xs text-gray-500">Nothing to show — this file carries no document metadata.</p>';
        return;
      }

      metaList.innerHTML = rows.map(function (row) {
        return '' +
          '<div class="bg-gray-950 border border-gray-800 rounded-xl p-3">' +
            '<p class="text-[10px] uppercase tracking-wider text-gray-500 font-bold">' +
              escapeHtml(row.label) + '</p>' +
            '<p class="text-xs text-gray-200 mt-1 break-all">' + escapeHtml(row.value) + '</p>' +
          '</div>';
      }).join('');
    }

    function strip() {
      if (!file || !doc) return;

      runBtn.disabled = true;
      if (result) result.classList.add('hidden');
      status('Clearing metadata…', 'busy');

      // The document is already in memory from the load step; this reuses it
      // rather than reading the file a second time.
      var removed = found.length;

      try {
        doc.setTitle('');
        doc.setAuthor('');
        doc.setSubject('');
        doc.setKeywords([]);
        doc.setCreator('');
        doc.setProducer('');

        // The epoch, not "now". Stamping the current time onto a scrubbed file
        // would just be a different identifier; 1 Jan 1970 is unambiguous and
        // is what other scrubbers write.
        doc.setCreationDate(new Date(0));
        doc.setModificationDate(new Date(0));
      } catch (err) {
        status('A metadata field could not be cleared.', 'error');
        runBtn.disabled = false;
        return;
      }

      doc.save({ useObjectStreams: true }).then(function (bytes) {
        P.download(bytes, P.stem(file.name) + '-clean.pdf', 'application/pdf');

        if (result) result.classList.remove('hidden');
        if (resultText) {
          resultText.textContent = removed + ' field' + (removed === 1 ? '' : 's') +
            ' cleared · ' + P.formatBytes(bytes.length);
        }

        if (metaList) {
          metaList.innerHTML = '<p class="text-xs text-emerald-400">Metadata cleared. ' +
            'The downloaded copy no longer carries these fields.</p>';
        }

        status('Metadata removed and downloaded.', 'ok');
        runBtn.disabled = false;
        P.track('pdf-metadata-remover');
        reveal();
      }).catch(function (err) {
        status(err && err.message ? err.message : 'The file could not be saved.', 'error');
        runBtn.disabled = false;
      });
    }

    function escapeHtml(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function message(err) {
      if (!err) return 'Something went wrong.';
      if (err.name === 'PasswordException' || /encrypted/i.test(err.message || '')) {
        return 'This PDF is password-protected. Unlock it first, then remove its metadata.';
      }
      return err.message || String(err);
    }

    P.wireDropZone(zone, input, load);
    if (runBtn) runBtn.addEventListener('click', strip);

    reset();
    return { strip: strip, load: load };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createPdfMetadataRemover = createPdfMetadataRemover;
})(window, document);

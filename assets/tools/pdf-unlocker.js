/**
 * PDF Unlocker — remove a password you already know from your own PDF.
 *
 * The scope is deliberately narrow, and the UI enforces it: a password is
 * required before anything happens, and there is no dictionary, no guessing and
 * no "try common passwords" mode. This removes a restriction from a document
 * you can already open; it does not help anyone get into one they cannot. A
 * forgotten password is not recoverable here, and the FAQ says so.
 *
 * Two real cases it covers:
 *   - An owner password that only sets permissions (no printing, no copying).
 *     Any reader opens these without asking; the restriction is a flag, and
 *     this rewrites the file without it.
 *   - A user password you know, on your own bank statement, invoice or scan,
 *     where you want a copy that no longer prompts.
 *
 * The engine is the same fork the protector uses; see the note there for why
 * upstream pdf-lib cannot do this.
 *
 * Required markup (ids, inside `root`):
 *   #pdfDropZone #pdfFileInput #pdfDropLabel #pdfFileMeta #pdfStatus
 *   #pdfOptions #pdfOpenPassword #pdfRevealPassword #pdfRunBtn
 *   #pdfResult #pdfResultText
 */
(function (window, document) {
  'use strict';

  function createPdfUnlocker(root) {
    if (!root) return null;

    var P = window.ToolStackPDF;
    if (!P) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var zone = $('pdfDropZone');
    var input = $('pdfFileInput');
    var dropLabel = $('pdfDropLabel');
    var fileMeta = $('pdfFileMeta');
    var options = $('pdfOptions');
    var openPassword = $('pdfOpenPassword');
    var revealPassword = $('pdfRevealPassword');
    var runBtn = $('pdfRunBtn');
    var result = $('pdfResult');
    var resultText = $('pdfResultText');

    if (!zone || !input) return null;

    var status = P.createStatus($('pdfStatus'));
    var reveal = P.createReveal(root);

    var file = null;

    function reset() {
      file = null;
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
      if (dropLabel) dropLabel.textContent = 'Loaded: ' + candidate.name;
      if (fileMeta) fileMeta.textContent = P.formatBytes(candidate.size);
      if (options) options.classList.remove('hidden');
      if (runBtn) runBtn.disabled = false;
      if (result) result.classList.add('hidden');
      status('Ready. Enter the password the file currently opens with.', 'ok');
    }

    /**
     * Open an encrypted PDF, tolerating the two shapes this API has taken.
     *
     * The fork has exposed decryption both as a load option and as a method on
     * the loaded document across its releases. Trying the method first and
     * falling back to the option means one of the two paths is always taken,
     * and the capability check in pdf-shared.js has already established that
     * *some* decryption support is present before we get here.
     */
    function openUnlocked(PDFLib, bytes, password) {
      return PDFLib.PDFDocument.load(bytes, {
        ignoreEncryption: true,
        password: password
      }).then(function (doc) {
        if (typeof doc.decrypt === 'function') {
          return doc.decrypt(password).then(function () { return doc; });
        }
        return doc;
      }).catch(function () {
        return PDFLib.PDFDocument.load(bytes, { password: password });
      });
    }

    function unlock() {
      if (!file) return;

      var password = openPassword ? openPassword.value : '';
      if (!password) {
        status('Enter the password this PDF currently opens with.', 'error');
        return;
      }

      runBtn.disabled = true;
      if (result) result.classList.add('hidden');
      status('Loading the decryption engine…', 'busy');

      P.loadCryptoLib().then(function (PDFLib) {
        return P.readFileBytes(file).then(function (bytes) {
          return openUnlocked(PDFLib, bytes, password);
        }).then(function (doc) {
          status('Rewriting the document…', 'busy');
          // Object streams are off on purpose: a decrypted file that still
          // needs a modern reader is a worse outcome than a slightly larger
          // one that opens everywhere.
          return doc.save({ useObjectStreams: false });
        });
      }).then(function (bytes) {
        P.download(bytes, P.stem(file.name) + '-unlocked.pdf', 'application/pdf');

        if (result) result.classList.remove('hidden');
        if (resultText) {
          resultText.textContent = 'Password removed · ' + P.formatBytes(bytes.length);
        }

        status('Unlocked and downloaded.', 'ok');
        runBtn.disabled = false;
        P.track('pdf-unlocker');
        reveal();
      }).catch(function (err) {
        status(friendly(err), 'error');
        runBtn.disabled = false;
      });
    }

    function friendly(err) {
      var m = (err && err.message) || '';

      if (/could not be loaded|Failed to fetch|no encrypt/i.test(m)) {
        return 'The decryption engine could not be loaded, so no file was produced. ' +
          'Check your connection and try again — nothing has been downloaded.';
      }
      if (/password/i.test(m) || (err && err.name === 'PasswordException')) {
        return 'That password did not open this PDF. Check it and try again — ' +
          'there is no way to recover a forgotten password here.';
      }
      if (/encrypt/i.test(m)) {
        return 'This file uses an encryption type this tool cannot rewrite. ' +
          'iOS and macOS Preview, or qpdf on the command line, can usually still remove it.';
      }
      return m || 'The PDF could not be unlocked.';
    }

    P.wireDropZone(zone, input, load);

    if (revealPassword) {
      revealPassword.addEventListener('change', function () {
        if (openPassword) openPassword.type = revealPassword.checked ? 'text' : 'password';
      });
    }

    if (runBtn) runBtn.addEventListener('click', unlock);

    reset();
    return { unlock: unlock, load: load };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createPdfUnlocker = createPdfUnlocker;
})(window, document);

/**
 * PDF Password Protector — encrypt a PDF with a password.
 *
 * This is the one tool in the suite whose engine is not upstream pdf-lib.
 * pdf-lib has no Standard Security Handler: it cannot write an /Encrypt
 * dictionary, so it cannot produce a file that Acrobat, Preview or a phone
 * will ask a password for. The fork loaded here adds exactly that, and the
 * loader in pdf-shared.js checks for the capability rather than assuming it.
 *
 * If the engine cannot be loaded the tool says so and does nothing. That
 * direction matters: the alternative — quietly handing back the original,
 * unencrypted file with a success message — is the single worst thing this
 * page could do, because the user would then send a confidential document
 * believing it was protected.
 *
 * The password never leaves the browser. There is no key escrow, no recovery
 * and no server that could unlock the file later: lose the password and the
 * document is gone. The page says so before the button, not after.
 *
 * Required markup (ids, inside `root`):
 *   #pdfDropZone #pdfFileInput #pdfDropLabel #pdfFileMeta #pdfStatus
 *   #pdfOptions #pdfUserPassword #pdfOwnerPassword #pdfRevealPasswords
 *   #pdfPermPrint #pdfPermCopy #pdfPermModify #pdfRunBtn
 *   #pdfResult #pdfResultText
 */
(function (window, document) {
  'use strict';

  function createPdfPasswordProtector(root) {
    if (!root) return null;

    var P = window.ToolStackPDF;
    if (!P) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var zone = $('pdfDropZone');
    var input = $('pdfFileInput');
    var dropLabel = $('pdfDropLabel');
    var fileMeta = $('pdfFileMeta');
    var options = $('pdfOptions');
    var userPassword = $('pdfUserPassword');
    var ownerPassword = $('pdfOwnerPassword');
    var revealPasswords = $('pdfRevealPasswords');
    var permPrint = $('pdfPermPrint');
    var permCopy = $('pdfPermCopy');
    var permModify = $('pdfPermModify');
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
      status('Ready. Set a password and press Protect.', 'ok');
    }

    /**
     * The permissions dictionary. False means "not allowed" — the flag is a
     * statement of the restriction, not of the freedom, which is the opposite
     * of how it reads in the UI.
     *
     * 'highResolution' rather than true for printing: the fork's type accepts
     * both, and the string is the one that permits full-quality output rather
     * than a degraded 150 dpi print.
     */
    function permissions() {
      return {
        printing: permPrint && permPrint.checked ? 'highResolution' : false,
        copying: !!(permCopy && permCopy.checked),
        modifying: !!(permModify && permModify.checked),
        annotating: !!(permModify && permModify.checked),
        fillingForms: !!(permModify && permModify.checked),
        contentAccessibility: true,
        documentAssembly: !!(permModify && permModify.checked)
      };
    }

    function protect() {
      if (!file) return;

      var user = userPassword ? userPassword.value : '';
      var owner = ownerPassword ? ownerPassword.value : '';

      if (!user && !owner) {
        status('Enter a password. Without one there is nothing to protect the file with.', 'error');
        return;
      }

      // An empty owner password means the file cannot be opened for editing by
      // anyone who knows the user password — most readers then refuse to change
      // the permissions at all. Falling back to the user password keeps the
      // document self-consistent.
      if (!owner) owner = user;

      runBtn.disabled = true;
      if (result) result.classList.add('hidden');
      status('Loading the encryption engine…', 'busy');

      P.loadCryptoLib().then(function (PDFLib) {
        return P.readFileBytes(file).then(function (bytes) {
          return PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true });
        }).then(function (doc) {
          if (typeof doc.encrypt !== 'function') {
            throw new Error('This build of the PDF library has no encryption support.');
          }
          status('Encrypting…', 'busy');
          return doc.encrypt({
            userPassword: user,
            ownerPassword: owner,
            permissions: permissions()
          }).then(function () {
            return doc.save({ useObjectStreams: false });
          });
        });
      }).then(function (bytes) {
        P.download(bytes, P.stem(file.name) + '-protected.pdf', 'application/pdf');

        if (result) result.classList.remove('hidden');
        if (resultText) {
          resultText.textContent = 'AES-encrypted · ' + P.formatBytes(bytes.length) +
            ' — keep the password safe; it cannot be recovered';
        }

        status('Protected and downloaded.', 'ok');
        runBtn.disabled = false;
        P.track('pdf-password-protector');
        reveal();
      }).catch(function (err) {
        status(friendly(err), 'error');
        runBtn.disabled = false;
      });
    }

    function friendly(err) {
      var m = (err && err.message) || '';
      if (/could not be loaded|Failed to fetch|no encrypt/i.test(m)) {
        return 'The encryption engine could not be loaded, so no file was produced. ' +
          'Check your connection and try again — nothing has been downloaded.';
      }
      return m || 'The PDF could not be encrypted.';
    }

    P.wireDropZone(zone, input, load);

    if (revealPasswords) {
      revealPasswords.addEventListener('change', function () {
        var type = revealPasswords.checked ? 'text' : 'password';
        if (userPassword) userPassword.type = type;
        if (ownerPassword) ownerPassword.type = type;
      });
    }

    if (runBtn) runBtn.addEventListener('click', protect);

    reset();
    return { protect: protect, load: load };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createPdfPasswordProtector = createPdfPasswordProtector;
})(window, document);

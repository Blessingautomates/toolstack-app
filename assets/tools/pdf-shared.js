/**
 * ToolStack AI — shared runtime for the PDF suite.
 *
 * Every PDF tool on the site needs the same four things: a PDF parser/writer,
 * a PDF renderer, a file drop zone, and a download helper. This file owns all
 * four so the fifteen tool modules below stay about the fifteen operations
 * rather than about library plumbing.
 *
 * Two libraries, because they do genuinely different jobs and neither can do
 * the other's:
 *
 *   pdf-lib   reads a PDF's object graph and writes a new one — merge, split,
 *             rotate, reorder, watermark, embed an image. It never rasterises
 *             and never encrypts.
 *   pdf.js    Mozilla's renderer. It is the only way to get pixels (PDF → JPG,
 *             PDF → PNG, the compressor) or the text layer (PDF → text) out of
 *             a page, and it is the only one of the two that can open a file
 *             that is already password-protected.
 *
 * Both are loaded lazily, on the first tool that actually needs them, so a
 * visitor who only ever opens Text to PDF never pays for the renderer. The
 * libraries are ~1 MB together and none of it is on the critical path.
 *
 * THIRD-PARTY CODE: everything here is served from jsDelivr, pinned to an exact
 * version. That is deliberate — an unpinned URL would let a library update
 * change the bytes this site runs without a commit to show for it. If you bump
 * one of these versions, bump the matching worker URL too: pdf.js refuses to
 * run a worker whose version does not match its own, and the failure is a
 * console warning rather than an exception.
 */
(function (window, document) {
  'use strict';

  var CDN = 'https://cdn.jsdelivr.net/npm/';

  var PDFLIB_URL = CDN + 'pdf-lib@1.17.1/dist/pdf-lib.min.js';
  var PDFJS_URL = CDN + 'pdfjs-dist@3.11.174/build/pdf.min.js';
  var PDFJS_WORKER_URL = CDN + 'pdfjs-dist@3.11.174/build/pdf.worker.min.js';

  /**
   * The encryption engine, which is the one piece of this suite that pdf-lib
   * proper cannot supply: upstream pdf-lib has no Standard Security Handler, so
   * it can neither write a /Encrypt dictionary nor open a file that has one.
   *
   * @cantoo/pdf-lib is a drop-in fork of the same API that adds both. It is
   * loaded only by the two tools that need it, and the loader below *verifies*
   * the capability rather than trusting the URL — a 404, an HTML error page, or
   * a future release that drops the fork's additions all end the same way: a
   * clear message to the user, never a silently unprotected file.
   *
   * The unversioned URL is first on purpose. It tracks the fork's latest
   * release, which is the version most likely to still exist, and the exact
   * pins behind it are a fallback for the day a release ships broken.
   */
  var CRYPTO_URLS = [
    CDN + '@cantoo/pdf-lib/dist/pdf-lib.min.js',
    CDN + '@cantoo/pdf-lib@2.2.0/dist/pdf-lib.min.js',
    CDN + '@cantoo/pdf-lib@1.17.1/dist/pdf-lib.min.js'
  ];

  /* ------------------------------------------------------------ script loading */

  var pending = {};

  /**
   * Load a classic (non-module) script once, and hand every caller the same
   * promise. The site ships no bundler and no ES modules — see the note at the
   * top of toolstack.js — so this is a plain <script> tag with the load event
   * wired up, not an import().
   */
  function loadScript(url) {
    if (pending[url]) return pending[url];

    pending[url] = new Promise(function (resolve, reject) {
      var el = document.createElement('script');
      el.src = url;
      el.async = true;
      el.onload = function () { resolve(); };
      el.onerror = function () {
        // Forget the failure so a later retry (a different tool on the same
        // page view, or a second attempt after the network came back) is not
        // permanently poisoned by one flaky request.
        delete pending[url];
        reject(new Error('Could not load ' + url));
      };
      document.head.appendChild(el);
    });

    return pending[url];
  }

  function loadPdfLib() {
    if (window.PDFLib && window.PDFLib.PDFDocument) return Promise.resolve(window.PDFLib);
    return loadScript(PDFLIB_URL).then(function () {
      if (!window.PDFLib || !window.PDFLib.PDFDocument) {
        throw new Error('pdf-lib loaded but did not register window.PDFLib');
      }
      return window.PDFLib;
    });
  }

  /**
   * pdf.js v3 ships as a UMD bundle that registers window.pdfjsLib. v4 moved to
   * ES modules only, which would force type="module" on every tool page and
   * break file:// previews — see the reasoning in toolstack.js. That is why this
   * is pinned to the 3.x line.
   */
  function loadPdfJs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    return loadScript(PDFJS_URL).then(function () {
      if (!window.pdfjsLib) {
        throw new Error('pdf.js loaded but did not register window.pdfjsLib');
      }
      // Without a worker pdf.js falls back to running on the main thread,
      // which blocks the UI for the whole of a large render.
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
      return window.pdfjsLib;
    });
  }

  /**
   * The encryption fork, or a rejection the caller turns into a sentence.
   *
   * `PDFDocument.prototype.encrypt` is the capability test, not the presence of
   * the global: a build that loaded but lacks the fork's additions must fail
   * here rather than at the moment the user has typed a password.
   */
  function loadCryptoLib() {
    if (window.PDFLib && hasCrypto(window.PDFLib)) return Promise.resolve(window.PDFLib);

    var attempt = function (i) {
      if (i >= CRYPTO_URLS.length) {
        return Promise.reject(new Error('The PDF encryption engine could not be loaded.'));
      }
      return loadScript(CRYPTO_URLS[i]).then(function () {
        if (!hasCrypto(window.PDFLib)) throw new Error('no encrypt() on this build');
        return window.PDFLib;
      }).catch(function () {
        return attempt(i + 1);
      });
    };

    return attempt(0);
  }

  function hasCrypto(lib) {
    return !!(lib && lib.PDFDocument && lib.PDFDocument.prototype &&
              typeof lib.PDFDocument.prototype.encrypt === 'function');
  }

  /* ------------------------------------------------------------------ files */

  function readFileBytes(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function (e) { resolve(new Uint8Array(e.target.result)); };
      reader.onerror = function () { reject(new Error('That file could not be read.')); };
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Save bytes as a download. The object URL is revoked on the next tick rather
   * than immediately: Safari has been known to cancel a download whose blob URL
   * disappears in the same frame as the click.
   */
  function download(bytes, filename, mime) {
    var blob = new Blob([bytes], { type: mime || 'application/pdf' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  function formatBytes(bytes) {
    if (!bytes && bytes !== 0) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  /** `report.pdf` → `report` — the stem every output filename is built on. */
  function stem(name) {
    var base = String(name || 'document').replace(/^.*[\\/]/, '');
    var dot = base.lastIndexOf('.');
    return (dot > 0 ? base.slice(0, dot) : base) || 'document';
  }

  /* -------------------------------------------------------------- page ranges */

  /**
   * Parse a human page-range string into 0-based page indexes.
   *
   * Accepts what people actually type — `1-3, 7, 12-` — and returns the pages
   * sorted and de-duplicated so a caller never has to care that `3-5, 4` was
   * given. `openEnded` decides what a trailing dash means: for an extractor the
   * useful reading of `12-` is "to the end", and for an ordered reorder it is
   * not, so reordering refuses it instead of guessing.
   *
   * Throws with a message written for the user, not for a log.
   */
  function parseRanges(spec, pageCount, options) {
    var opts = options || {};
    var text = String(spec == null ? '' : spec).trim();
    if (!text) throw new Error('Enter at least one page number.');

    var out = [];
    var parts = text.split(',');

    for (var i = 0; i < parts.length; i++) {
      var part = parts[i].trim();
      if (!part) continue;

      var match = /^(\d+)\s*(?:-|–|to)\s*(\d*)$/.exec(part);
      if (!match) {
        // A bare number is the common case and the one people get right; the
        // error below is for everything else, including `abc` and `3.5`.
        if (!/^\d+$/.test(part)) {
          throw new Error('"' + part + '" is not a page number or range.');
        }
        out.push(Number(part) - 1);
        continue;
      }

      var from = Number(match[1]);
      var to = match[2] === '' ? (opts.openEnded ? pageCount : NaN) : Number(match[2]);
      if (!to) throw new Error('"' + part + '" needs a number after the dash.');

      var step = from <= to ? 1 : -1;
      for (var p = from; step > 0 ? p <= to : p >= to; p += step) out.push(p - 1);
    }

    var seen = {};
    var clean = [];
    for (var j = 0; j < out.length; j++) {
      var n = out[j];
      if (n < 0 || n >= pageCount) {
        throw new Error('This document has ' + pageCount + ' page' +
          (pageCount === 1 ? '' : 's') + ', so page ' + (n + 1) + ' does not exist.');
      }
      if (!seen[n]) { seen[n] = 1; clean.push(n); }
    }

    if (!clean.length) throw new Error('Enter at least one page number.');
    return clean;
  }

  /**
   * Build an output filename that does not collide with a sibling. Used by the
   * tools that emit one file per page, where `report-1.jpg` already existing is
   * the normal case rather than the exception.
   */
  function numbered(stemName, index, total, ext) {
    var pad = String(total).length;
    var n = String(index + 1);
    while (n.length < pad) n = '0' + n;
    return stemName + '-' + n + '.' + ext;
  }

  /* -------------------------------------------------------------- rendering */

  /**
   * Open a PDF with pdf.js. `password` is optional and only matters for a file
   * that is already encrypted; pdf.js rejects with a PasswordException whose
   * `name` is 'PasswordException', which the caller turns into a prompt rather
   * than an error.
   *
   * The bytes are copied into a fresh Uint8Array because pdf.js takes ownership
   * of the buffer it is handed and detaches it — passing the same array to a
   * second call would otherwise fail with a confusing "detached ArrayBuffer".
   */
  function openPdf(file, password) {
    return loadPdfJs().then(function (pdfjsLib) {
      return readFileBytes(file).then(function (bytes) {
        var task = pdfjsLib.getDocument({
          data: bytes.slice(),
          password: password || undefined,
          // Nothing here is fetched from the network, so the bundled standard
          // font and CMaps are enough; leave the defaults alone.
          isEvalSupported: false
        });
        return task.promise;
      });
    });
  }

  /**
   * Render one pdf.js page onto a canvas at `scale`, with a white matte.
   *
   * The matte is not cosmetic. A PDF page has no background, so it rasterises
   * to transparent pixels; saved as JPEG those become black, and saved as PNG
   * they stay invisible until the image is placed on a dark surface. Painting
   * white first is what makes the output look like the page did.
   */
  function renderPage(page, scale) {
    var viewport = page.getViewport({ scale: scale });
    var canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));

    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return page.render({ canvasContext: ctx, viewport: viewport }).promise
      .then(function () { return canvas; });
  }

  /**
   * Render every page in order, one at a time, handing each canvas to `visit`.
   *
   * Sequential rather than parallel on purpose: each render allocates a canvas
   * the size of the page at the chosen scale, and running a 40-page document in
   * parallel is how a mobile browser runs out of memory and kills the tab. The
   * await between pages gives the garbage collector somewhere to run.
   *
   * `visit` may return a promise, which is awaited before the next page starts.
   */
  function renderEachPage(file, options, visit) {
    var opts = options || {};
    var scale = opts.scale || 1.5;
    var password = opts.password;
    var onProgress = opts.onProgress || function () {};

    return openPdf(file, password).then(function (doc) {
      var total = doc.numPages;
      var chain = Promise.resolve();

      for (var i = 1; i <= total; i++) {
        (function (pageNumber) {
          chain = chain.then(function () {
            onProgress(pageNumber, total);
            return doc.getPage(pageNumber).then(function (page) {
              return renderPage(page, scale).then(function (canvas) {
                return visit(canvas, pageNumber, total);
              });
            });
          });
        })(i);
      }

      return chain.then(function () {
        return { pages: total };
      });
    });
  }

  /* --------------------------------------------------------------- embedding */

  /**
   * Embed a canvas into a pdf-lib document, choosing the encoder by the MIME
   * type so the caller does not have to branch. Returns a promise for the
   * embedded image.
   */
  function embedCanvas(pdfDoc, canvas, mime, quality) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (!blob) { reject(new Error('The page could not be encoded as an image.')); return; }
        var buffer = blob.arrayBuffer();
        var done = mime === 'image/png'
          ? buffer.then(function (b) { return pdfDoc.embedPng(b); })
          : buffer.then(function (b) { return pdfDoc.embedJpg(b); });
        done.then(resolve, reject);
      }, mime, quality);
    });
  }

  /**
   * Build a PDF from a list of images. Shared by Image to PDF, JPG to PDF and
   * PNG to PDF, which differ only in what they accept and what they default to.
   *
   * Page modes:
   *   'fit'      — one page per image, page sized to the image's own aspect
   *                ratio at the chosen page width, so nothing is letterboxed.
   *   'a4'/'letter' — a standard page, image scaled down to fit inside the
   *                margins and centred. Never scaled *up*: blowing a 600px
   *                screenshot onto A4 produces a soft, blurry page, and the
   *                honest default is to leave a small image small.
   */
  function imagesToPdf(files, options) {
    var opts = options || {};
    var onProgress = opts.onProgress || function () {};
    var mode = opts.pageSize || 'fit';
    var margin = typeof opts.margin === 'number' ? opts.margin : 36;
    var landscape = !!opts.landscape;

    var SIZES = { a4: [595.28, 841.89], letter: [612, 792] };

    return loadPdfLib().then(function (PDFLib) {
      return PDFLib.PDFDocument.create().then(function (doc) {
        var chain = Promise.resolve();

        Array.prototype.forEach.call(files, function (file, index) {
          chain = chain.then(function () {
            onProgress(index + 1, files.length);
            return readFileBytes(file).then(function (bytes) {
              var isPng = /png$/i.test(file.type) || /\.png$/i.test(file.name);
              var embedded = isPng ? doc.embedPng(bytes) : doc.embedJpg(bytes);

              return embedded.then(function (image) {
                if (mode === 'fit') {
                  var page = doc.addPage([image.width, image.height]);
                  page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
                  return;
                }

                var size = SIZES[mode] || SIZES.a4;
                var pw = landscape ? size[1] : size[0];
                var ph = landscape ? size[0] : size[1];
                var page = doc.addPage([pw, ph]);

                var boxW = pw - margin * 2;
                var boxH = ph - margin * 2;
                var ratio = Math.min(boxW / image.width, boxH / image.height, 1);
                var w = image.width * ratio;
                var h = image.height * ratio;

                page.drawImage(image, {
                  x: (pw - w) / 2,
                  y: (ph - h) / 2,
                  width: w,
                  height: h
                });
              });
            });
          });
        });

        return chain.then(function () { return doc; });
      });
    });
  }

  /* ---------------------------------------------------------------- UI plumbing */

  /**
   * A status line under a drop zone. Four states, each with its own colour, so
   * "reading", "done" and "failed" are distinguishable without reading.
   */
  function createStatus(el) {
    return function (message, kind) {
      if (!el) return;
      el.classList.remove('hidden', 'text-rose-400', 'text-emerald-400',
        'text-gray-400', 'text-brand-400');
      el.classList.add(
        kind === 'error' ? 'text-rose-400'
          : kind === 'ok' ? 'text-emerald-400'
            : kind === 'busy' ? 'text-brand-400'
              : 'text-gray-400'
      );
      el.textContent = message;
    };
  }

  /**
   * Wire a drop zone. `onFiles` receives the selected FileList; validation is
   * the caller's job because each tool accepts a different set.
   */
  function wireDropZone(zone, input, onFiles) {
    if (!zone || !input) return;

    zone.addEventListener('click', function () { input.click(); });

    zone.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        input.click();
      }
    });

    input.addEventListener('change', function (e) {
      if (e.target.files && e.target.files.length) onFiles(e.target.files);
    });

    ['dragenter', 'dragover'].forEach(function (type) {
      zone.addEventListener(type, function (e) {
        e.preventDefault();
        zone.classList.add('border-brand-500');
      });
    });

    ['dragleave', 'drop'].forEach(function (type) {
      zone.addEventListener(type, function (e) {
        e.preventDefault();
        zone.classList.remove('border-brand-500');
      });
    });

    zone.addEventListener('drop', function (e) {
      var dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length) onFiles(dt.files);
    });
  }

  /**
   * The result-actions strip is mounted by toolstack.js on DOMContentLoaded and
   * starts hidden when it carries data-ts-deferred. Every PDF tool defers it
   * until there is real output, which is why reveal is wrapped here rather than
   * repeated in fifteen modules.
   */
  function createReveal(root) {
    var el = root.querySelector('[data-ts-result-actions]');
    var shown = false;
    return function () {
      if (shown || !el) return;
      shown = true;
      if (window.ToolStack) window.ToolStack.reveal(el);
      else el.classList.remove('hidden');
    };
  }

  function track(tool, params) {
    if (window.ToolStack) window.ToolStack.track('tool_output', { tool: tool });
    void params;
  }

  /**
   * The site-wide toast, if toolstack.js is on the page. Wrapped so a PDF tool
   * can announce something without every call site re-checking for the global.
   */
  function toast(message) {
    if (window.ToolStack && window.ToolStack.toast) window.ToolStack.toast(message);
  }

  /**
   * Reject a file the tool cannot use, with a message that names what it wanted.
   * `accept` is a human phrase such as "a PDF" or "PNG or JPG images".
   */
  function checkTypes(files, test, accept) {
    for (var i = 0; i < files.length; i++) {
      if (!test(files[i])) {
        throw new Error('"' + files[i].name + '" is not ' + accept + '.');
      }
    }
  }

  window.ToolStackPDF = {
    loadPdfLib: loadPdfLib,
    loadPdfJs: loadPdfJs,
    loadCryptoLib: loadCryptoLib,
    loadScript: loadScript,
    readFileBytes: readFileBytes,
    download: download,
    formatBytes: formatBytes,
    stem: stem,
    parseRanges: parseRanges,
    numbered: numbered,
    openPdf: openPdf,
    renderPage: renderPage,
    renderEachPage: renderEachPage,
    embedCanvas: embedCanvas,
    imagesToPdf: imagesToPdf,
    createStatus: createStatus,
    createReveal: createReveal,
    wireDropZone: wireDropZone,
    checkTypes: checkTypes,
    track: track,
    toast: toast
  };
})(window, document);

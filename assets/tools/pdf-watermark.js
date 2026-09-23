/**
 * PDF Watermark Tool — stamp text across the pages of a PDF.
 *
 * The watermark is drawn as a real PDF text object on top of each page's
 * existing content, so the original page is untouched underneath: fonts, text
 * and vectors all survive, the file grows by roughly the size of one string,
 * and the stamp is selectable and searchable like any other text in the
 * document.
 *
 * Size is expressed as a percentage of the page's short edge rather than in
 * points. A 24pt stamp that looks right on A4 is invisible on an A0 plan and
 * overflows a 3-inch receipt; scaling to the page is what makes one setting
 * work across a mixed document. The size control therefore maps to a fraction,
 * and the code multiplies it out per page.
 *
 * Required markup (ids, inside `root`):
 *   #pdfDropZone #pdfFileInput #pdfDropLabel #pdfFileMeta #pdfStatus
 *   #pdfOptions #pdfWatermarkText #pdfWatermarkSize #pdfWatermarkOpacity
 *   #pdfWatermarkColor #pdfWatermarkLayout #pdfPageSpec
 *   #pdfRunBtn #pdfResult #pdfResultText
 */
(function (window, document) {
  'use strict';

  var LAYOUTS = {
    diagonal: { rotate: 45, tiles: 1 },
    cross: { rotate: 45, tiles: 3 },
    footer: { rotate: 0, anchor: 'bottom' },
    header: { rotate: 0, anchor: 'top' }
  };

  function createPdfWatermark(root) {
    if (!root) return null;

    var P = window.ToolStackPDF;
    if (!P) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var zone = $('pdfDropZone');
    var input = $('pdfFileInput');
    var dropLabel = $('pdfDropLabel');
    var fileMeta = $('pdfFileMeta');
    var options = $('pdfOptions');
    var textInput = $('pdfWatermarkText');
    var sizeSelect = $('pdfWatermarkSize');
    var opacityInput = $('pdfWatermarkOpacity');
    var opacityVal = $('pdfWatermarkOpacityVal');
    var colorSelect = $('pdfWatermarkColor');
    var layoutSelect = $('pdfWatermarkLayout');
    var pageSpec = $('pdfPageSpec');
    var runBtn = $('pdfRunBtn');
    var result = $('pdfResult');
    var resultText = $('pdfResultText');

    if (!zone || !input) return null;

    var status = P.createStatus($('pdfStatus'));
    var reveal = P.createReveal(root);

    var file = null;
    var pageCount = 0;

    var COLORS = {
      grey: [0.45, 0.45, 0.45],
      red: [0.75, 0.09, 0.16],
      blue: [0.15, 0.35, 0.75],
      black: [0, 0, 0]
    };

    var SIZES = { small: 0.04, medium: 0.075, large: 0.13 };

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
        if (pageSpec) pageSpec.placeholder = 'blank = every page, or e.g. 1-3, 7';

        status('Ready. Type the watermark and press Apply.', 'ok');
      }).catch(function (err) {
        reset();
        status(message(err), 'error');
      });
    }

    function apply() {
      if (!file) return;

      var text = textInput ? textInput.value.trim() : '';
      if (!text) {
        status('Type the watermark text first.', 'error');
        return;
      }

      var chosen = LAYOUTS[layoutSelect ? layoutSelect.value : 'diagonal'] || LAYOUTS.diagonal;
      var color = COLORS[colorSelect ? colorSelect.value : 'grey'] || COLORS.grey;
      var sizeRatio = SIZES[sizeSelect ? sizeSelect.value : 'medium'] || SIZES.medium;
      var opacity = opacityInput ? Number(opacityInput.value) / 100 : 0.18;

      var indexes;

      try {
        indexes = pageSpec && pageSpec.value.trim()
          ? P.parseRanges(pageSpec.value, pageCount, { openEnded: true })
          : null;
      } catch (err) {
        status(err.message, 'error');
        return;
      }

      runBtn.disabled = true;
      if (result) result.classList.add('hidden');
      status('Stamping the pages…', 'busy');

      P.loadPdfLib().then(function (PDFLib) {
        return P.readFileBytes(file).then(function (bytes) {
          return PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true }).then(function (doc) {
            return doc.embedFont(PDFLib.StandardFonts.HelveticaBold).then(function (font) {
              return { lib: PDFLib, doc: doc, font: font };
            });
          });
        });
      }).then(function (ctx) {
        var pages = ctx.doc.getPages();

        // Page numbers are used rather than coordinates so that report is
        // written in the same numbers the user typed.
        var targets = indexes
          ? indexes.map(function (i) { return { page: pages[i], number: i + 1 }; })
          : pages.map(function (page, i) { return { page: page, number: i + 1 }; });

        targets.forEach(function (entry) {
          if (!entry.page) return;
          stamp(ctx.lib, entry.page, ctx.font, {
            text: text,
            color: color,
            opacity: opacity,
            sizeRatio: sizeRatio,
            rotate: chosen.rotate,
            anchor: chosen.anchor,
            tiles: chosen.tiles
          });
        });

        return ctx.doc.save({ useObjectStreams: true }).then(function (bytes) {
          return { bytes: bytes, count: targets.length };
        });
      }).then(function (out) {
        P.download(out.bytes, P.stem(file.name) + '-watermarked.pdf', 'application/pdf');

        if (result) result.classList.remove('hidden');
        if (resultText) {
          resultText.textContent = out.count + ' page' + (out.count === 1 ? '' : 's') +
            ' stamped · ' + P.formatBytes(out.bytes.length);
        }

        status('Watermarked and downloaded.', 'ok');
        runBtn.disabled = false;
        P.track('pdf-watermark');
        reveal();
      }).catch(function (err) {
        status(message(err), 'error');
        runBtn.disabled = false;
      });
    }

    /**
     * Draw the stamp onto one page.
     *
     * pdf-lib rotates text anticlockwise about the anchor, and the anchor is
     * the left end of the baseline — not the corner of the text's bounding box.
     * Centring therefore means walking the centre of the box back to the anchor
     * through the rotation, which is what the offset calculation below does. A
     * naive "draw at width/2, height/2" leaves diagonal text visibly off-centre
     * on every page.
     */
    function stamp(PDFLib, page, font, opts) {
      var size = Math.max(6, Math.min(page.getWidth(), page.getHeight()) * opts.sizeRatio);
      var width = font.widthOfTextAtSize(opts.text, size);
      var height = font.heightAtSize(size);

      // font.heightAtSize gives the full line box; the baseline sits above the
      // descender, so half of the difference is the correction for centring.
      var baselineOffset = height * 0.36;

      var rotation = (opts.rotate || 0) * Math.PI / 180;
      var cos = Math.cos(rotation);
      var sin = Math.sin(rotation);

      var positions = [];

      if (opts.anchor === 'bottom' || opts.anchor === 'top') {
        positions.push({
          x: (page.getWidth() - width) / 2,
          y: opts.anchor === 'bottom'
            ? Math.max(size * 0.6, page.getHeight() * 0.04)
            : page.getHeight() - size * 1.6
        });
      } else if (opts.tiles > 1) {
        // A 3×3 grid, each stamp centred in its own cell, so the pattern reads
        // as evenly spaced rather than clustered around the middle.
        for (var row = 0; row < opts.tiles; row++) {
          for (var col = 0; col < opts.tiles; col++) {
            var cw = page.getWidth() / opts.tiles;
            var ch = page.getHeight() / opts.tiles;
            positions.push(centreAnchor(
              cw * (col + 0.5), ch * (row + 0.5), width, baselineOffset, cos, sin
            ));
          }
        }
      } else {
        positions.push(centreAnchor(
          page.getWidth() / 2, page.getHeight() / 2, width, baselineOffset, cos, sin
        ));
      }

      positions.forEach(function (pos) {
        page.drawText(opts.text, {
          x: pos.x,
          y: pos.y,
          size: size,
          font: font,
          color: PDFLib.rgb(opts.color[0], opts.color[1], opts.color[2]),
          opacity: opts.opacity,
          rotate: PDFLib.degrees(opts.rotate || 0)
        });
      });
    }

    /** Anchor that puts the text box's centre on (cx, cy) after rotation. */
    function centreAnchor(cx, cy, width, baselineOffset, cos, sin) {
      var halfW = width / 2;
      var offsetX = halfW * cos - baselineOffset * sin;
      var offsetY = halfW * sin + baselineOffset * cos;
      return { x: cx - offsetX, y: cy - offsetY };
    }

    function message(err) {
      if (!err) return 'Something went wrong.';
      if (err.name === 'PasswordException' || /encrypted/i.test(err.message || '')) {
        return 'This PDF is password-protected. Unlock it first, then watermark it.';
      }
      return err.message || String(err);
    }

    P.wireDropZone(zone, input, load);

    if (opacityInput && opacityVal) {
      opacityInput.addEventListener('input', function () {
        opacityVal.textContent = opacityInput.value + '%';
      });
    }

    if (runBtn) runBtn.addEventListener('click', apply);

    reset();
    return { apply: apply, load: load };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createPdfWatermark = createPdfWatermark;
})(window, document);

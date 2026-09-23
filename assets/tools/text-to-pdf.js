/**
 * Text to PDF — typeset plain text into a paginated PDF.
 *
 * The interesting problem here is not layout, it is encoding. pdf-lib's
 * standard fonts use WinAnsi (CP1252), which covers Latin-1 plus the usual
 * typographic marks — curly quotes, en and em dashes, ellipsis, bullet — but
 * nothing else. Handing it an emoji, a Cyrillic name or a CJK character throws
 * and the whole document fails to build.
 *
 * So the text is sanitised before layout, and the substitutions are reported
 * rather than made silently: characters that cannot be encoded are counted and
 * the page says how many were dropped. Quietly deleting someone's name because
 * it is in the wrong alphabet would be the bad version of this tool. Embedding a
 * Unicode font would fix it properly and is what a future revision should do;
 * it also means shipping a ~500 KB font file on every page load, which is why
 * it is not what this revision does.
 *
 * Required markup (ids, inside `root`):
 *   #pdfTextInput #pdfFontFamily #pdfFontSize #pdfPageSize #pdfMargin
 *   #pdfPageNumbers #pdfRunBtn #pdfStatus #pdfResult #pdfResultText
 */
(function (window, document) {
  'use strict';

  var PAGE_SIZES = {
    a4: [595.28, 841.89],
    letter: [612, 792],
    legal: [612, 1008]
  };

  var FONTS = {
    helvetica: 'Helvetica',
    times: 'TimesRoman',
    courier: 'Courier'
  };

  /**
   * Code points WinAnsi can encode beyond plain Latin-1. Everything here is a
   * character a word processor inserts on its own, which is why they matter:
   * pasting from Word or Google Docs brings curly quotes and em dashes along
   * whether or not the author typed them.
   */
  var WINANSI_EXTRAS = [
    0x20AC, 0x201A, 0x0192, 0x201E, 0x2026, 0x2020, 0x2021, 0x02C6,
    0x2030, 0x0160, 0x2039, 0x0152, 0x017D, 0x2018, 0x2019, 0x201C,
    0x201D, 0x2022, 0x2013, 0x2014, 0x02DC, 0x2122, 0x0161, 0x203A,
    0x0153, 0x017E, 0x0178
  ];

  var ALLOWED = (function () {
    var set = {};
    for (var c = 0x20; c <= 0x7E; c++) set[c] = 1;
    for (var d = 0xA0; d <= 0xFF; d++) set[d] = 1;
    WINANSI_EXTRAS.forEach(function (code) { set[code] = 1; });
    return set;
  })();

  /**
   * Tabs become four spaces rather than being dropped, since a tab usually
   * means a column the author wanted. Line endings are normalised so the
   * paragraph split below sees one shape. Anything the encoder cannot take is
   * removed and counted.
   */
  function sanitize(input) {
    var text = String(input == null ? '' : input)
      .replace(/\r\n?/g, '\n')
      .replace(/\t/g, '    ');

    var out = '';
    var dropped = 0;
    var seen = {};

    for (var i = 0; i < text.length; i++) {
      var code = text.charCodeAt(i);

      if (code === 0x0A) { out += '\n'; continue; }
      if (code < 0x20) continue; // control characters
      if (code === 0x7F) continue;

      if (ALLOWED[code]) {
        out += text.charAt(i);
        continue;
      }

      // Astral characters arrive as a surrogate pair; the low half would be
      // counted as a second drop if this did not skip it.
      if (code >= 0xD800 && code <= 0xDBFF && i + 1 < text.length) {
        var next = text.charCodeAt(i + 1);
        if (next >= 0xDC00 && next <= 0xDFFF) i++;
      }

      seen[text.charAt(i)] = 1;
      dropped++;
    }

    return { text: out, dropped: dropped, distinct: Object.keys(seen) };
  }

  function createTextToPdf(root) {
    if (!root) return null;

    var P = window.ToolStackPDF;
    if (!P) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var textarea = $('pdfTextInput');
    var fontSelect = $('pdfFontFamily');
    var sizeSelect = $('pdfFontSize');
    var pageSelect = $('pdfPageSize');
    var marginSelect = $('pdfMargin');
    var pageNumbers = $('pdfPageNumbers');
    var runBtn = $('pdfRunBtn');
    var status = P.createStatus($('pdfStatus'));
    var result = $('pdfResult');
    var resultText = $('pdfResultText');
    var warning = $('pdfCharWarning');

    if (!textarea || !runBtn) return null;

    var reveal = P.createReveal(root);

    function build() {
      var source = textarea.value;
      if (!source.trim()) {
        status('Type or paste some text first.', 'error');
        return;
      }

      var clean = sanitize(source);
      var size = sizeSelect ? Number(sizeSelect.value) : 11;
      var family = FONTS[fontSelect ? fontSelect.value : 'helvetica'] || FONTS.helvetica;
      var dimensions = PAGE_SIZES[pageSelect ? pageSelect.value : 'a4'] || PAGE_SIZES.a4;
      var margin = marginSelect ? Number(marginSelect.value) : 56;

      runBtn.disabled = true;
      if (result) result.classList.add('hidden');
      status('Typesetting…', 'busy');

      P.loadPdfLib().then(function (PDFLib) {
        return PDFLib.PDFDocument.create().then(function (doc) {
          return doc.embedFont(PDFLib.StandardFonts[family]).then(function (font) {
            var lineHeight = size * 1.45;
            var contentWidth = dimensions[0] - margin * 2;
            var contentHeight = dimensions[1] - margin * 2;

            var pages = 0;
            var page = null;
            var y = 0;

            function newPage() {
              page = doc.addPage([dimensions[0], dimensions[1]]);
              pages++;
              y = dimensions[1] - margin;
            }

            newPage();

            // A blank line becomes a full-width paragraph of one empty string,
            // which the wrapper turns into an empty line rather than a gap of
            // zero height — otherwise paragraph spacing is lost.
            clean.text.split('\n').forEach(function (paragraph) {
              var lines = wrap(paragraph, font, size, contentWidth);

              lines.forEach(function (line) {
                if (y - lineHeight < margin) newPage();
                page.drawText(line, { x: margin, y: y - size, size: size, font: font });
                y -= lineHeight;
              });
            });

            if (pageNumbers && pageNumbers.checked) {
              var all = doc.getPages();
              all.forEach(function (p, i) {
                var label = 'Page ' + (i + 1) + ' of ' + all.length;
                var width = font.widthOfTextAtSize(label, 8);
                p.drawText(label, {
                  x: (dimensions[0] - width) / 2,
                  y: margin / 2,
                  size: 8,
                  font: font,
                  color: PDFLib.rgb(0.45, 0.45, 0.45)
                });
              });
            }

            return doc.save({ useObjectStreams: true }).then(function (bytes) {
              return { bytes: bytes, pages: pages };
            });
          });
        });
      }).then(function (out) {
        P.download(out.bytes, 'document.pdf', 'application/pdf');

        if (result) result.classList.remove('hidden');
        if (resultText) {
          resultText.textContent = out.pages + ' page' + (out.pages === 1 ? '' : 's') +
            ' · ' + P.formatBytes(out.bytes.length);
        }

        reportDropped(clean);
        status('PDF created and downloaded.', 'ok');
        runBtn.disabled = false;
        P.track('text-to-pdf');
        reveal();
      }).catch(function (err) {
        status(err && err.message ? err.message : 'The PDF could not be built.', 'error');
        runBtn.disabled = false;
      });
    }

    /**
     * Say plainly what did not make it through. Silence here is what would turn
     * an encoding limitation into a data-loss bug the user never hears about.
     */
    function reportDropped(clean) {
      if (!warning) return;

      if (!clean.dropped) {
        warning.classList.add('hidden');
        warning.textContent = '';
        return;
      }

      var sample = clean.distinct.slice(0, 6).join(' ');
      warning.classList.remove('hidden');
      warning.textContent =
        clean.dropped + ' character' + (clean.dropped === 1 ? '' : 's') +
        ' could not be encoded in the built-in fonts and were left out' +
        (sample ? ' (' + sample + ')' : '') +
        '. The standard PDF fonts cover Latin text only — emoji, Cyrillic, Greek and CJK need an embedded font.';
    }

    /**
     * Greedy word wrap against real glyph widths.
     *
     * A word longer than the line — a URL, a hash, a long German compound — is
     * broken across lines by character rather than being allowed to run off the
     * page, which is what a naive wrapper does and what makes pasted links
     * disappear into the margin.
     */
    function wrap(paragraph, font, size, maxWidth) {
      if (!paragraph) return [''];

      var words = paragraph.split(/\s+/).filter(function (w) { return w !== ''; });
      if (!words.length) return [''];

      var lines = [];
      var line = '';

      function width(text) { return font.widthOfTextAtSize(text, size); }

      words.forEach(function (word) {
        if (!line) {
          if (width(word) <= maxWidth) { line = word; return; }
          var pieces = breakWord(word, font, size, maxWidth);
          lines = lines.concat(pieces.slice(0, -1));
          line = pieces[pieces.length - 1];
          return;
        }

        if (width(line + ' ' + word) <= maxWidth) {
          line += ' ' + word;
          return;
        }

        lines.push(line);

        if (width(word) <= maxWidth) {
          line = word;
          return;
        }

        var parts = breakWord(word, font, size, maxWidth);
        lines = lines.concat(parts.slice(0, -1));
        line = parts[parts.length - 1];
      });

      if (line) lines.push(line);
      return lines;
    }

    function breakWord(word, font, size, maxWidth) {
      var pieces = [];
      var current = '';

      for (var i = 0; i < word.length; i++) {
        var next = current + word.charAt(i);
        if (current && font.widthOfTextAtSize(next, size) > maxWidth) {
          pieces.push(current);
          current = word.charAt(i);
        } else {
          current = next;
        }
      }

      if (current) pieces.push(current);
      return pieces.length ? pieces : [word];
    }

    runBtn.addEventListener('click', build);

    return { build: build };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createTextToPdf = createTextToPdf;
})(window, document);

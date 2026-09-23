/**
 * Specs for the content tools: watermark, extract text, typeset text.
 *
 * These three are the ones where the honest limitation is the interesting part
 * of the page — a watermark that scales to the page, a text extractor that is
 * not OCR, and a typesetter that can only encode Latin text with the fonts it
 * ships. Each page says so rather than letting the user find out.
 */
import {
  dropZone, optionsPanel, runButton, resultPanel, field,
  select, range, row, check, note, rel
} from './_ui.mjs';

const INPUT_CLASS =
  'w-full bg-gray-950 border border-gray-700 focus:border-brand-500 rounded-xl px-3 py-2.5 text-sm text-gray-100 outline-none transition';

export default [
  /* ------------------------------------------------------------------ watermark */
  {
    slug: 'pdf-watermark',
    name: 'PDF Watermark Tool',
    create: 'createPdfWatermark',
    appCategory: 'BusinessApplication',
    title: 'PDF Watermark Tool — Stamp Text on Every Page | ToolStack AI',
    desc: 'Add a text watermark to a PDF — DRAFT, CONFIDENTIAL, a client name — across every page or only the ones you choose. The original content is untouched.',
    tagline: 'Mark a document as a draft, a copy or confidential, without flattening the pages underneath.',
    widget: dropZone({
      label: 'Click to choose a PDF, or drag & drop it',
      hint: 'PDF only · stamped in your browser, never uploaded'
    })
      + optionsPanel(
        field({
          label: 'Watermark text',
          for: 'pdfWatermarkText',
          control: `<input id="pdfWatermarkText" type="text" maxlength="80" placeholder="e.g. CONFIDENTIAL" class="${INPUT_CLASS}" />`,
          hint: 'Short is better — the text scales to the page, so a long sentence becomes very small.'
        })
        + row(
          field({
            label: 'Style',
            for: 'pdfWatermarkLayout',
            control: select({
              id: 'pdfWatermarkLayout',
              options: [
                ['diagonal', 'Diagonal — one across the middle', true],
                ['cross', 'Tiled — repeated across the page'],
                ['footer', 'Footer — centred at the bottom'],
                ['header', 'Header — centred at the top']
              ]
            })
          })
          + field({
            label: 'Size',
            for: 'pdfWatermarkSize',
            control: select({
              id: 'pdfWatermarkSize',
              options: [
                ['small', 'Small'],
                ['medium', 'Medium', true],
                ['large', 'Large']
              ]
            })
          })
        )
        + row(
          field({
            label: 'Colour',
            for: 'pdfWatermarkColor',
            control: select({
              id: 'pdfWatermarkColor',
              options: [
                ['grey', 'Grey — the most readable under text', true],
                ['red', 'Red'],
                ['blue', 'Blue'],
                ['black', 'Black']
              ]
            })
          })
          + range({
            id: 'pdfWatermarkOpacity',
            valueId: 'pdfWatermarkOpacityVal',
            label: 'Opacity',
            min: 5,
            max: 60,
            step: 5,
            value: 18
          })
        )
        + field({
          label: 'Pages',
          for: 'pdfPageSpec',
          control: `<input id="pdfPageSpec" type="text" placeholder="blank = every page, or e.g. 1-3, 7" class="${INPUT_CLASS}" />`,
          hint: 'Leave blank to stamp the whole document.'
        })
        + note(
          'Size is a proportion of the page rather than a fixed point size, so one setting looks right on an A4 ' +
          'report and on an A0 plan alike. The stamp is drawn over the page as real text — the content underneath ' +
          'is untouched, the file grows by roughly the length of the string, and the watermark is selectable and ' +
          'searchable like any other text in the document.'
        )
      )
      + runButton('Apply watermark')
      + resultPanel('pdf-watermark'),
    what: [
      'This tool draws text across the pages of a PDF — a diagonal **CONFIDENTIAL**, a footer with a client name, a tiled pattern marking every page of a preview copy.',
      'The watermark is added as a **real text object drawn on top of each page**, not by flattening the page into an image. That distinction is what makes the result good: the original text, fonts, images and links all survive underneath, the file grows by roughly the length of the string rather than being re-encoded, and the watermark itself is selectable and searchable like any other text in the document.',
      'Size is expressed as a proportion of the page\'s short edge rather than a fixed point size, so a single setting works across a document that mixes A4 pages with fold-outs. A 24-point stamp that looks right on A4 is invisible on a large drawing and overflows a small receipt.'
    ],
    how: [
      'Drop in your PDF and wait for the page count to appear.',
      'Type the **watermark text** — short phrases work best, since the text is scaled to fit the page.',
      'Choose a **style**, **size**, **colour** and **opacity**. Grey at around 18% is the combination that stays readable as a watermark without competing with the text above it.',
      'Optionally limit the **pages** field, then press **Apply watermark**. The stamped copy downloads immediately.'
    ],
    cases: [
      { t: 'Draft and review copies', d: 'Mark a document DRAFT so a version cannot be mistaken for the final one once it has been emailed around.' },
      { t: 'Confidential material', d: 'Stamp CONFIDENTIAL across a document that has to be shared but should not be forwarded casually.' },
      { t: 'Client and project marking', d: 'Put the recipient\'s name in the footer of a proposal so the copy is traceable to who received it.' },
      { t: 'Preview copies', d: 'Tile a watermark across every page of a sample so it cannot be passed off as the paid version.' }
    ],
    faqs: [
      {
        q: 'Does watermarking flatten or degrade the PDF?',
        a: 'No. The stamp is drawn on top of each page as an ordinary text object. The original content stream is not touched, nothing is re-encoded, and the underlying text stays selectable and searchable. If you need to preview the difference, the file size barely moves.'
      },
      {
        q: 'Can I remove a watermark afterwards?',
        a: 'Not with this tool. Because the stamp is drawn into the page content rather than stored as a separate layer, removing it cleanly would mean reconstructing the page. Keep the original before you watermark it.'
      },
      {
        q: 'Why does my long watermark text come out tiny?',
        a: 'The text is scaled to a proportion of the page, so the longer the string, the smaller each character has to be to fit across it. One or two words work best — "CONFIDENTIAL" or "DRAFT" rather than a full sentence.'
      }
    ],
    related: [
      rel('pdf-password-protector', 'PDF Password Protector', 'A harder barrier than a watermark when the file is confidential.'),
      rel('pdf-metadata-remover', 'PDF Metadata Remover', 'Clear the author details a watermark cannot hide.')
    ]
  },

  /* ---------------------------------------------------------------- PDF → text */
  {
    slug: 'pdf-to-text',
    name: 'PDF to Text',
    create: 'createPdfToText',
    appCategory: 'UtilitiesApplication',
    title: 'PDF to Text — Extract Text from a PDF Free | ToolStack AI',
    desc: 'Copy the text layer out of a PDF into plain text you can edit, search or reuse. Per-page extraction, copy or download as .txt. Free and browser-based.',
    tagline: 'Get the words out of a PDF and into something you can actually edit.',
    widget: dropZone({
      label: 'Click to choose a PDF, or drag & drop it',
      hint: 'PDF only · read in your browser, never uploaded'
    })
      + optionsPanel(
        field({
          label: 'Pages',
          for: 'pdfPageSpec',
          control: `<input id="pdfPageSpec" type="text" placeholder="blank = every page, or e.g. 1-3, 7" class="${INPUT_CLASS}" />`,
          hint: 'Leave blank to read the whole document.'
        })
      )
      + runButton('Extract text')
      + resultPanel(
        'pdf-to-text',
        `
        <div class="mt-3">
          <textarea id="pdfTextOutput" rows="12" readonly
                    class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-gray-200 font-mono leading-relaxed outline-none"
                    placeholder="Extracted text appears here…"></textarea>
          <p id="pdfTextMeta" class="text-[11px] text-gray-500 mt-2"></p>
          <div class="flex flex-wrap gap-2 mt-3">
            <button id="pdfCopyBtn" type="button"
                    class="px-3 py-2 rounded-xl border border-gray-700 hover:border-brand-500 text-gray-300 hover:text-brand-400 font-semibold text-xs transition">
              Copy all
            </button>
            <button id="pdfDownloadBtn" type="button"
                    class="px-3 py-2 rounded-xl border border-gray-700 hover:border-brand-500 text-gray-300 hover:text-brand-400 font-semibold text-xs transition">
              Download .txt
            </button>
          </div>
        </div>`
      ),
    what: [
      'This tool reads the text layer a PDF already contains and gives it back as plain text you can copy, edit or save as a `.txt` file.',
      'The limitation is the important part, and the tool states it rather than leaving you to work it out: **this is not OCR**. A PDF produced from a word processor carries the actual characters, and those come out cleanly. A **scanned** document is a photograph of paper with no text in it at all, and this tool will correctly find nothing. When that happens the page says so explicitly — "no text found, this is probably a scan" — because an empty box with no explanation looks exactly like a broken tool.',
      'Line breaks are reconstructed by grouping text runs that share a baseline position, which is what recovers readable paragraphs from the many PDFs that store each word as a separate run with no line information at all.'
    ],
    how: [
      'Drop in your PDF.',
      'Optionally narrow the **pages** field to the part of the document you need.',
      'Press **Extract text**. Progress is reported page by page on a long document.',
      'Use **Copy all** to put the text on your clipboard, or **Download .txt** to save it. The line underneath the box reports the word and character counts.'
    ],
    cases: [
      { t: 'Reusing content', d: 'Pull a paragraph or a table out of a report to quote it, rather than retyping it.' },
      { t: 'Searching a document', d: 'Turn a PDF into text so you can search it properly or feed it to another tool.' },
      { t: 'Translation', d: 'Extract the text, then run it through a translator that will not accept a PDF.' },
      { t: 'Data and analysis', d: 'Get statement or report text into a form you can paste into a spreadsheet or a script.' }
    ],
    faqs: [
      {
        q: 'It found no text. Is the tool broken?',
        a: 'Almost certainly not — the file is a scan. A scanned PDF is a photograph of each page with no text layer, so there are no characters to extract, only pixels. Getting text out of those needs OCR, which is a different job from this one. You would recognise the same result in any PDF reader: try selecting the text in Acrobat or Preview and you will find there is nothing to select.'
      },
      {
        q: 'Does the formatting survive?',
        a: 'Paragraphs and line breaks do; columns, tables and precise spacing do not. Plain text has no way to represent a two-column layout, so the columns are read in the order they appear on the page. For anything where layout matters, you want the page as an image rather than as text.'
      },
      {
        q: 'Can I extract text from a password-protected PDF?',
        a: 'Not directly. Unlock it first with the PDF Unlocker if you know the password, then extract the text from the unlocked copy.'
      }
    ],
    related: [
      rel('text-to-pdf', 'Text to PDF', 'The other direction — typeset plain text into a PDF.'),
      rel('pdf-to-png', 'PDF to PNG', 'Get a page as an image when the layout matters.')
    ]
  },

  /* ---------------------------------------------------------------- text → PDF */
  {
    slug: 'text-to-pdf',
    name: 'Text to PDF',
    create: 'createTextToPdf',
    appCategory: 'UtilitiesApplication',
    title: 'Text to PDF — Convert Plain Text into a PDF | ToolStack AI',
    desc: 'Turn plain text into a clean, paginated PDF. Choose the font, size, page size and margins, and add page numbers. Free and entirely in your browser.',
    tagline: 'Typeset plain text into a tidy, paginated PDF — no word processor required.',
    widget: `
      <div>
        <label for="pdfTextInput" class="block text-xs font-bold text-gray-300 mb-1.5">Your text</label>
        <textarea id="pdfTextInput" rows="12"
                  class="w-full bg-gray-950 border border-gray-700 focus:border-brand-500 rounded-xl px-3 py-2.5 text-sm text-gray-100 outline-none transition font-mono leading-relaxed"
                  placeholder="Paste or type your text here. Blank lines start a new paragraph; long lines wrap automatically."></textarea>
      </div>

      <p id="pdfStatus" class="hidden text-xs mt-3 leading-relaxed" role="status" aria-live="polite"></p>

      <div class="mt-5 space-y-4">
${row(
          field({
            label: 'Font',
            for: 'pdfFontFamily',
            control: select({
              id: 'pdfFontFamily',
              options: [
                ['helvetica', 'Helvetica — clean sans-serif', true],
                ['times', 'Times — classic serif'],
                ['courier', 'Courier — monospaced']
              ]
            })
          })
          + field({
            label: 'Font size',
            for: 'pdfFontSize',
            control: select({
              id: 'pdfFontSize',
              options: [
                ['9', '9 pt — compact'],
                ['11', '11 pt — standard', true],
                ['12', '12 pt'],
                ['14', '14 pt — large print']
              ]
            })
          })
        )}
${row(
          field({
            label: 'Page size',
            for: 'pdfPageSize',
            control: select({
              id: 'pdfPageSize',
              options: [
                ['a4', 'A4 — 210 × 297 mm', true],
                ['letter', 'US Letter — 8.5 × 11 in'],
                ['legal', 'US Legal — 8.5 × 14 in']
              ]
            })
          })
          + field({
            label: 'Margin',
            for: 'pdfMargin',
            control: select({
              id: 'pdfMargin',
              options: [
                ['36', 'Narrow — 0.5 in'],
                ['56', 'Standard — 0.78 in', true],
                ['85', 'Wide — 1.18 in']
              ]
            })
          })
        )}
${check({
          id: 'pdfPageNumbers',
          label: 'Add page numbers',
          hint: 'A centred "Page 1 of 4" footer in small grey type.'
        })}
${note(
          'The built-in fonts cover Latin text plus the usual typographic marks — curly quotes, en and em dashes, ' +
          'the ellipsis. Characters outside that set, including emoji, Cyrillic, Greek and CJK, cannot be encoded ' +
          'and are <strong class="font-bold">left out</strong>. If any are dropped, a warning appears above telling ' +
          'you exactly how many and which ones.'
        )}
      </div>`
      + runButton('Create PDF')
      + `
      <p id="pdfCharWarning" class="hidden mt-4 border border-amber-500/40 bg-amber-500/5 text-amber-200 rounded-xl px-3.5 py-3 text-[11px] leading-relaxed"></p>`
      + resultPanel('text-to-pdf'),
    what: [
      'This tool typesets plain text into a PDF: paragraphs, wrapping, pagination, the page size and margins you choose, and an optional page-number footer.',
      'It uses the **standard PDF fonts** — Helvetica, Times and Courier — which are built into every PDF reader and add nothing to the file size. The trade-off is encoding: those fonts cover Latin text and the usual typographic marks a word processor inserts, and nothing else. Emoji, Cyrillic, Greek and CJK characters cannot be encoded in them. Rather than failing or silently deleting them, the page **counts what it had to leave out and tells you**, with examples. An embedded Unicode font would fix this properly and would also mean shipping a large font file on every page load; that is the trade-off this revision makes, stated plainly rather than hidden.'
    ],
    how: [
      'Paste or type your text into the box. Blank lines start new paragraphs, and long lines are wrapped automatically — including very long words such as URLs, which are broken across lines rather than running off the edge of the page.',
      'Choose a **font**, **size**, **page size** and **margin**.',
      'Tick **Add page numbers** for a centred footer.',
      'Press **Create PDF**. The document downloads immediately, and any characters that could not be encoded are reported above.'
    ],
    cases: [
      { t: 'Notes and drafts', d: 'Turn a plain-text draft into something readable and printable without opening a word processor.' },
      { t: 'Documentation', d: 'Render a README, changelog or config file into a PDF you can attach or archive.' },
      { t: 'Anything that must be a PDF', d: 'Portals, applications and print shops that accept only PDF, when all you have is text.' },
      { t: 'Archiving correspondence', d: 'Save an email thread or a chat log as a fixed, paginated document.' }
    ],
    faqs: [
      {
        q: 'Why were some of my characters left out?',
        a: 'The built-in PDF fonts use a Latin encoding that cannot represent emoji, Cyrillic, Greek, Arabic or CJK text. The tool counts every character it could not encode and tells you how many were dropped and which ones, rather than deleting them silently. If you need those characters, you would need a tool that embeds a Unicode font.'
      },
      {
        q: 'Can I control bold, italic or headings?',
        a: 'Not currently — this is a plain-text typesetter, so every paragraph is set in the same face. It is the right tool for turning a block of text into a clean document, not for producing formatted prose.'
      },
      {
        q: 'Is my text sent anywhere?',
        a: 'No. The PDF is built in your browser and downloads directly to your device. Nothing you type is uploaded or stored, which is why the tool also works with no connection once the page has loaded.'
      }
    ],
    related: [
      rel('pdf-to-text', 'PDF to Text', 'The other direction — pull the text back out of a PDF.'),
      rel('pdf-watermark', 'PDF Watermark Tool', 'Mark the finished document as a draft or confidential.')
    ]
  }
];

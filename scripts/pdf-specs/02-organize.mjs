/**
 * Specs for the page-organisation tools: extract, rotate, reorder.
 *
 * All three copy real pages with pdf-lib rather than rasterising them, so the
 * copy on these pages is careful not to describe the output as an image of the
 * original — text stays text all the way through.
 */
import {
  dropZone, optionsPanel, runButton, resultPanel, field,
  select, row, note, rel
} from './_ui.mjs';

const SPEC_INPUT_CLASS =
  'w-full bg-gray-950 border border-gray-700 focus:border-brand-500 rounded-xl px-3 py-2.5 text-sm text-gray-100 outline-none transition';

export default [
  /* ------------------------------------------------------------- page extractor */
  {
    slug: 'pdf-page-extractor',
    name: 'PDF Page Extractor',
    create: 'createPdfPageExtractor',
    appCategory: 'UtilitiesApplication',
    title: 'PDF Page Extractor — Pull Pages into a New PDF | ToolStack AI',
    desc: 'Extract specific pages from a PDF into a new document. Keep the pages real — text stays selectable. Enter ranges like 1-3, 7, 10-. Free and browser-based.',
    tagline: 'Pull just the pages you need out of a long PDF, without the file getting any heavier than it has to.',
    widget: dropZone({
      label: 'Click to choose a PDF, or drag & drop it',
      hint: 'PDF only · processed in your browser, never uploaded'
    })
      + optionsPanel(
        field({
          label: 'Pages to keep',
          for: 'pdfPageSpec',
          control: `<input id="pdfPageSpec" type="text" placeholder="e.g. 1-3, 7" class="${SPEC_INPUT_CLASS}" />`,
          hint: 'Comma-separated. Use a dash for a range, or a trailing dash for "to the end" — <strong class="text-gray-400">1-3, 7, 12-</strong> keeps pages 1, 2, 3, 7 and everything from 12 onwards. Order does not matter here; the pages come out in document order.'
        })
        + note(
          'The extracted pages are copied as real pages, not as images. Text keeps its fonts and stays ' +
          'selectable and searchable, links keep working, and vectors stay vectors.'
        )
      )
      + runButton('Extract pages')
      + resultPanel('pdf-page-extractor'),
    what: [
      'This tool builds a new PDF containing only the pages you ask for. Nothing is rasterised and nothing is re-rendered: the pages are copied out of the original along with the fonts, images and vectors they reference, so **text in the result is still selectable, still searchable, and still readable by a screen reader**.',
      'Because only the resources the chosen pages actually use are carried across, the output is usually far smaller than the source — a five-page extract from a 300-page manual does not carry the manual with it.'
    ],
    how: [
      'Drop in your PDF. The tool reads it and reports the page count, which is what keeps the range you type honest.',
      'Type the pages you want in the **pages to keep** field, using the same shorthand you would use anywhere else: single numbers, ranges, or a trailing dash for the rest of the document.',
      'Press **Extract pages**. If a page number does not exist in this document, the tool says so and tells you how many pages there are instead of producing a wrong file.',
      'The new PDF downloads immediately.'
    ],
    cases: [
      { t: 'Sharing one section', d: 'Send a single chapter, case study or contract schedule rather than the whole 200-page document it lives in.' },
      { t: 'Building a new document', d: 'Pull the pages you want from several sources and merge them into one file.' },
      { t: 'Reducing file size', d: 'A five-page extract of a heavily illustrated report is a fraction of the size of the original.' },
      { t: 'Removing what should not travel', d: 'Drop the cover sheet, the internal appendix or the pricing table before a file goes out.' }
    ],
    faqs: [
      {
        q: 'Does the output come out in the order I typed?',
        a: 'No — the pages are returned in document order, sorted and de-duplicated. That is deliberate for an extractor, where typing "7, 2, 1" almost always means "these pages" rather than an instruction to shuffle them. If you want to set the order, use the PDF Page Reorderer.'
      },
      {
        q: 'Will the extracted text still be selectable?',
        a: 'Yes. Pages are copied whole, keeping the original content streams, fonts and images. Text remains text; it is not converted into an image the way the PDF Compressor does.'
      },
      {
        q: 'Can I extract from a PDF I can open but that has permissions set?',
        a: 'Usually yes. Open-permission restrictions do not stop the pages being read. If the file asks for a password to open it at all, run it through the PDF Unlocker first.'
      }
    ],
    related: [
      rel('pdf-page-reorderer', 'PDF Page Reorderer', 'Rebuild a document with its pages in a new order.'),
      rel('pdf-page-rotator', 'PDF Page Rotator', 'Fix pages that came out sideways or upside down.')
    ]
  },

  /* --------------------------------------------------------------- page rotator */
  {
    slug: 'pdf-page-rotator',
    name: 'PDF Page Rotator',
    create: 'createPdfPageRotator',
    appCategory: 'UtilitiesApplication',
    title: 'PDF Page Rotator — Turn Pages 90°, 180° or 270° | ToolStack AI',
    desc: 'Rotate one page, a range, or the whole PDF by 90°, 180° or 270°. Lossless — the original content is untouched. Free, in your browser, no upload.',
    tagline: 'Fix a sideways scan or an upside-down page without opening an editor or paying for one.',
    widget: dropZone({
      label: 'Click to choose a PDF, or drag & drop it',
      hint: 'PDF only · processed in your browser, never uploaded'
    })
      + optionsPanel(
        row(
          field({
            label: 'Rotate by',
            for: 'pdfRotateAngle',
            control: select({
              id: 'pdfRotateAngle',
              options: [
                ['90', '90° clockwise', true],
                ['180', '180° — upside down'],
                ['270', '270° clockwise (90° anticlockwise)']
              ]
            })
          })
          + field({
            label: 'Which pages',
            for: 'pdfRotateScope',
            control: select({
              id: 'pdfRotateScope',
              options: [
                ['all', 'Every page', true],
                ['selected', 'Only the pages I list']
              ]
            })
          })
        )
        + `
        <div id="pdfPageSpecRow" class="hidden">
${field({
          label: 'Pages to rotate',
          for: 'pdfPageSpec',
          control: `<input id="pdfPageSpec" type="text" placeholder="e.g. 1-3, 7" class="${SPEC_INPUT_CLASS}" />`,
          hint: 'Comma-separated, with dashes for ranges. A trailing dash means "to the end".'
        })}
        </div>`
        + note(
          'Rotation is applied each time you press the button, not set to a fixed angle — pressing it twice turns ' +
          'the page twice. That matches what the button says, and it means you can fix a sideways page and an ' +
          'upside-down one with two separate runs.'
        )
      )
      + runButton('Rotate pages')
      + resultPanel('pdf-page-rotator'),
    what: [
      'This tool turns pages in a PDF. It writes the rotation into each page\'s own orientation entry rather than redrawing anything, so **the original content is untouched**: text stays selectable, images are not re-encoded, the file size barely moves, and rotating back is completely lossless.',
      'The usual reason to need it is a scanner that fed a page in the wrong way round, or a phone photo imported as a PDF with the orientation baked in. It also handles the document that is entirely the wrong way up because it was produced that way.'
    ],
    how: [
      'Drop in your PDF.',
      'Choose the **angle** — 90°, 180° or 270° clockwise.',
      'Leave **which pages** set to "every page", or switch it to "only the pages I list" and type the page numbers you want turned.',
      'Press **Rotate pages**. The turned document downloads immediately.'
    ],
    cases: [
      { t: 'Sideways scans', d: 'Fix pages that the scanner fed in landscape when they should have been portrait.' },
      { t: 'One bad page', d: 'Turn a single upside-down page in an otherwise correct document, leaving the rest alone.' },
      { t: 'Wrong orientation throughout', d: 'Rotate a whole document that was produced the wrong way up, in one run.' },
      { t: 'Reading on a tablet', d: 'Rotate a wide chart or table to landscape so it fills the screen instead of shrinking to fit.' }
    ],
    faqs: [
      {
        q: 'Does rotating reduce quality?',
        a: 'No. Nothing is redrawn or re-encoded — the page keeps its original content and gains a rotation instruction. The output is the same quality as the input, and rotating it back returns the original exactly.'
      },
      {
        q: 'How do I go back if I rotate the wrong way?',
        a: 'Rotate again by the remaining amount. Because the tool adds to the page\'s current angle rather than setting it, three more 90° rotations return a page to where it started. The original file on your disk is never modified.'
      },
      {
        q: 'Can I rotate pages in different directions in one go?',
        a: 'Not in a single run — every page in one run turns by the same angle. Do it in two passes instead: rotate the first set, then take the output and rotate the second set the other way.'
      }
    ],
    related: [
      rel('pdf-page-reorderer', 'PDF Page Reorderer', 'Change the sequence pages appear in.'),
      rel('pdf-page-extractor', 'PDF Page Extractor', 'Keep only some of the pages.')
    ]
  },

  /* ------------------------------------------------------------- page reorderer */
  {
    slug: 'pdf-page-reorderer',
    name: 'PDF Page Reorderer',
    create: 'createPdfPageReorderer',
    appCategory: 'UtilitiesApplication',
    title: 'PDF Page Reorderer — Rearrange PDF Pages Free | ToolStack AI',
    desc: 'Rearrange the pages of a PDF by editing a simple list of page numbers. Reverse a scan, move a cover to the front, or duplicate a page. Free, no upload.',
    tagline: 'Put the pages of a PDF in the right order — by editing a list that starts out already correct.',
    widget: dropZone({
      label: 'Click to choose a PDF, or drag & drop it',
      hint: 'PDF only · processed in your browser, never uploaded'
    })
      + optionsPanel(
        field({
          label: 'Page order',
          for: 'pdfOrderSpec',
          control: `<textarea id="pdfOrderSpec" rows="3" class="${SPEC_INPUT_CLASS} font-mono leading-relaxed"></textarea>`,
          hint: 'Filled in with the document\'s own order as soon as a file loads, so the usual jobs are small edits rather than typing the whole sequence from scratch.'
        })
        + `
        <p id="pdfOrderHint" class="text-[11px] text-brand-400 leading-relaxed"></p>

        <div class="flex flex-wrap gap-2">
          <button id="pdfReverseBtn" type="button"
                  class="px-3 py-2 rounded-xl border border-gray-700 hover:border-brand-500 text-gray-300 hover:text-brand-400 font-semibold text-xs transition">
            Reverse the order
          </button>
          <button id="pdfResetBtn" type="button"
                  class="px-3 py-2 rounded-xl border border-gray-700 hover:border-brand-500 text-gray-300 hover:text-brand-400 font-semibold text-xs transition">
            Reset to original
          </button>
        </div>`
        + note(
          'List every page once for a straight reorder. List fewer and the rest are dropped, so the same box also ' +
          'extracts. List one twice and it is duplicated. The line above the buttons always tells you which of ' +
          'those you are about to get.'
        )
      )
      + runButton('Rebuild PDF')
      + resultPanel('pdf-page-reorderer'),
    what: [
      'This tool rebuilds a PDF with its pages in whatever order you specify. The pages themselves are copied across intact — fonts, images and vectors come with them — so **the output is the original pages rearranged, not pictures of them**, and nothing is re-encoded or softened along the way.',
      'The interaction is built around the fact that most reordering jobs are small. When a file loads, the order box is filled in with the document\'s own sequence, so moving the cover to the front or swapping two pages is an edit to a list that is already right rather than a sequence you have to type out from memory and get exactly correct.'
    ],
    how: [
      'Drop in your PDF. The order box fills in with **1, 2, 3, …** up to the page count.',
      'Edit the list. Move a number, or use **Reverse the order** for a scan that came out backwards, and **Reset to original** to start again.',
      'Watch the line under the box — it tells you whether the list is a straight reorder, an extract, or has a page listed twice.',
      'Press **Rebuild PDF** and the reordered document downloads immediately.'
    ],
    cases: [
      { t: 'Reversing a scan', d: 'A duplex scanner that fed pages back-to-front produces a document in exactly reverse order. One button fixes it.' },
      { t: 'Moving a cover page', d: 'Put the title page or the signed signature page at the front where it belongs.' },
      { t: 'Swapping two pages', d: 'Fix a document where pages 7 and 8 were printed in the wrong order.' },
      { t: 'Duplicating a page', d: 'List the same page number twice to produce two copies of a form in one file.' }
    ],
    faqs: [
      {
        q: 'What happens if I list fewer pages than the document has?',
        a: 'The unlisted pages are dropped, so the result is also an extract. That is genuinely useful, but it is easy to do by accident — the line under the box says exactly how many pages you have listed out of the total, so you are not guessing.'
      },
      {
        q: 'Can I duplicate a page?',
        a: 'Yes. List its number twice and it appears twice in the output. The hint line warns you that a page is listed more than once so you know it was intentional.'
      },
      {
        q: 'Does this change the files I already have?',
        a: 'No. Your original is never modified — it is read by the browser and a brand new PDF is generated and downloaded alongside it. If the result is wrong, nothing has been lost.'
      }
    ],
    related: [
      rel('pdf-page-extractor', 'PDF Page Extractor', 'Keep a subset of pages, in document order.'),
      rel('pdf-page-rotator', 'PDF Page Rotator', 'Fix pages that are the wrong way up or sideways.')
    ]
  }
];

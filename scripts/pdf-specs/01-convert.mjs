/**
 * Specs for the PDF ↔ image conversion tools.
 *
 * Each entry is data, not code: gen-pdf-tools.mjs turns it into tools/<slug>.html.
 * The widget string is built from the shared builders in _ui.mjs, and the ids it
 * produces are the contract with the matching assets/tools/<slug>.js — see the
 * "Required markup" note at the top of each module.
 */
import {
  dropZone, optionsPanel, runButton, resultPanel, field,
  select, range, row, check, note, rel
} from './_ui.mjs';

export default [
  /* ------------------------------------------------------------------ compress */
  {
    slug: 'pdf-compressor',
    name: 'PDF Compressor',
    create: 'createPdfCompressor',
    appCategory: 'UtilitiesApplication',
    title: 'PDF Compressor — Shrink a PDF in Your Browser | ToolStack AI',
    desc: 'Compress a PDF by re-rendering each page at the resolution you choose. Nothing is uploaded — the file is read and rebuilt entirely inside your browser.',
    tagline: 'Make a heavy PDF small enough to email or upload. Pick a quality, press one button, and see exactly how many bytes you saved.',
    widget: dropZone({
      label: 'Click to choose a PDF, or drag & drop it',
      hint: 'PDF only · processed in your browser, never uploaded'
    })
      + optionsPanel(
        range({
          id: 'pdfQuality',
          valueId: 'pdfQualityVal',
          label: 'JPEG quality',
          min: 30,
          max: 95,
          step: 5,
          value: 70,
          hint: 'Lower means a smaller file and a softer page. 70 is the usual sweet spot for scans and documents.'
        })
        + field({
          label: 'Resolution',
          for: 'pdfResolution',
          control: select({
            id: 'pdfResolution',
            options: [
              ['1', 'Low — 72 dpi (smallest)'],
              ['1.5', 'Medium — 108 dpi', true],
              ['2', 'High — 144 dpi'],
              ['3', 'Maximum — 216 dpi']
            ]
          }),
          hint: 'How many pixels each page is rendered at. 144 dpi is more than enough for on-screen reading and printing on a home printer.'
        })
        + note(
          '<strong class="font-bold">This rebuilds each page as an image.</strong> ' +
          'Text in the compressed file will no longer be selectable, searchable or read by a screen reader, ' +
          'and links and form fields become part of the picture. That is how this kind of compression works — ' +
          'keep your original.'
        )
      )
      + runButton('Compress PDF')
      + resultPanel('pdf-compressor'),
    what: [
      'This tool takes a PDF that is too large to email, upload or attach, and rebuilds it as a much smaller one. Each page is rendered at the resolution you choose and re-encoded as a JPEG, and a new document is assembled from those images.',
      'That approach suits the files that are actually too big — **scans, photo-heavy exports, and slide decks that were exported at full resolution** — because in those the bytes are almost entirely image data, and re-encoding an image at a lower resolution is precisely what saves the space. It is also the reason for the trade-off: the result is a picture of each page, so **text in the output is no longer selectable or searchable**. There is no lossless mode here, and the tool does not pretend otherwise.'
    ],
    how: [
      'Drop your PDF onto the box, or click it to choose a file. The file size appears underneath, and the options panel opens.',
      'Set **JPEG quality** and **Resolution**. Quality controls how aggressively each page image is compressed; resolution controls how many pixels each page is rendered at.',
      'Press **Compress PDF**. Progress is reported page by page — the renderer works through one page at a time by design, so a long scan will not run your browser out of memory.',
      'The new file downloads automatically. The panel shows the before and after size, so you can see what the settings actually bought you and try again if it was not enough.'
    ],
    cases: [
      { t: 'Email attachment limits', d: 'Get a scanned contract or a photographed receipt under a 10 MB or 25 MB cap without splitting it into pieces.' },
      { t: 'Upload portals', d: 'Government, university and job-application portals routinely reject files over a few megabytes. Compress once and the same document goes through.' },
      { t: 'Slide decks and reports', d: 'A deck exported with full-resolution photography is often 40 MB. At 144 dpi it is usually a fraction of that and still reads perfectly on screen.' },
      { t: 'Storage and archives', d: 'Shrink a folder of old scans before backing it up, where legibility matters far more than fidelity.' }
    ],
    faqs: [
      {
        q: 'Will my text still be selectable after compression?',
        a: 'No. The compressed file is rebuilt from page images, so text, links and form fields become part of the picture. That is inherent to how image-based compression works rather than a setting you can switch off. If selectable text matters, keep the original and compress a copy.'
      },
      {
        q: 'Is my file uploaded to a server?',
        a: 'No. The PDF is read by your own browser and the compressed file is generated on your device. Nothing is sent anywhere — which also means that once the page and its libraries have loaded, the tool keeps working if your connection drops.'
      },
      {
        q: 'How much smaller will my PDF get?',
        a: 'It depends entirely on what was in it. A 40 MB scan-heavy PDF typically drops to 2–6 MB at medium quality. A text-only PDF that was already written efficiently may not shrink at all, and the tool will say so rather than claim a win. If the result is not smaller, try a lower quality or resolution.'
      }
    ],
    related: [
      rel('pdf-to-jpg', 'PDF to JPG', 'One JPEG per page, at the resolution you pick.'),
      rel('pdf-metadata-remover', 'PDF Metadata Remover', 'Clear the author, title and timestamps hidden inside a file.')
    ]
  },

  /* ---------------------------------------------------------------- PDF → JPG */
  {
    slug: 'pdf-to-jpg',
    name: 'PDF to JPG',
    create: 'createPdfToJpg',
    appCategory: 'MultimediaApplication',
    title: 'PDF to JPG Converter — One Image per Page | ToolStack AI',
    desc: 'Turn each page of a PDF into a JPEG at the resolution you choose, then download them one at a time or all together. Runs in your browser — no upload.',
    tagline: 'Convert a PDF into images you can drop into a slide, a chat or a web page. Every page becomes its own JPEG, downloaded to your device.',
    widget: dropZone({
      label: 'Click to choose a PDF, or drag & drop it',
      hint: 'PDF only · pages are rendered in your browser, never uploaded'
    })
      + optionsPanel(
        field({
          label: 'Resolution',
          for: 'pdfResolution',
          control: select({
            id: 'pdfResolution',
            options: [
              ['1', 'Low — 72 dpi (smallest files)'],
              ['1.5', 'Medium — 108 dpi'],
              ['2', 'High — 144 dpi', true],
              ['3', 'Very high — 216 dpi'],
              ['4', 'Maximum — 288 dpi (largest files)']
            ]
          }),
          hint: 'Higher settings give sharper images and much larger files. 144 dpi is right for screens and slides; go higher only if you need to print.'
        })
        + range({
          id: 'pdfQuality',
          valueId: 'pdfQualityVal',
          label: 'JPEG quality',
          min: 30,
          max: 95,
          step: 5,
          value: 85,
          hint: 'Applies to every page. Below about 60 you start to see blocky artefacts around text.'
        })
        + field({
          label: 'Pages',
          for: 'pdfPageSpec',
          control: '<input id="pdfPageSpec" type="text" placeholder="blank = every page, or e.g. 1-3, 7" class="w-full bg-gray-950 border border-gray-700 focus:border-brand-500 rounded-xl px-3 py-2.5 text-sm text-gray-100 outline-none transition" />',
          hint: 'Leave blank to convert the whole document. A trailing dash means "to the end", so 12- converts from page 12 onwards.'
        })
      )
      + runButton('Convert to JPG')
      + resultPanel(
        'pdf-to-jpg',
        `
        <div id="pdfGallery" class="space-y-2 mt-3 max-h-72 overflow-y-auto"></div>
        <button id="pdfDownloadAllBtn" type="button"
                class="w-full mt-3 px-4 py-2.5 rounded-xl border border-gray-700 hover:border-brand-500 text-gray-300 hover:text-brand-400 font-semibold text-xs transition">
          Download all pages
        </button>`
      ),
    what: [
      'This tool renders every page of a PDF as a bitmap and saves it as a JPEG. It is the conversion you want when the destination is not a document — a slide deck, a chat message, a support ticket, a web page, a print shop that asked for images.',
      'The output is one JPEG per page, named after the source file and numbered (`report-page-1.jpg`, `report-page-2.jpg`). Pages are rendered at the resolution you choose, with a **white background painted underneath** — a PDF page has no background of its own, and without that step the transparent areas would turn black the moment they were saved as JPEG.'
    ],
    how: [
      'Drop in your PDF. The options panel opens once the file has been read.',
      'Pick a **resolution**. This is the single setting that decides how sharp the images are and how large they get.',
      'Adjust **JPEG quality** if you want smaller files, and narrow the **pages** field if you only need part of the document.',
      'Press **Convert to JPG**. Each page appears in a list with its own **Download** button; **Download all pages** grabs the set in one go.'
    ],
    cases: [
      { t: 'Slides and documents', d: 'Lift a chart or a diagram out of a PDF report and drop it straight into a presentation.' },
      { t: 'Web and social', d: 'Produce images from a one-page flyer or menu that can be posted directly, without a design tool.' },
      { t: 'Support and bug reports', d: 'Attach a screenshot of the exact page a problem appears on, rather than a PDF the other side has to open.' },
      { t: 'Printing and cropping', d: 'Hand a print shop images when that is what their workflow expects, at a resolution they can actually use.' }
    ],
    faqs: [
      {
        q: 'Why is my download blocked or only partly saved?',
        a: 'Browsers only reliably allow a download that happens inside a click, so a long document fired off in one go can be silently truncated or dropped. That is why each page has its own button and the "Download all" option spaces the files out. If your browser asks whether to allow multiple downloads, say yes.'
      },
      {
        q: 'Is there a page limit?',
        a: 'No hard limit. Pages are rendered one after another rather than all at once, which keeps memory flat, but a very long document will take a while and produce a lot of files. Use the pages field to convert it in batches if that suits you better.'
      },
      {
        q: 'Can I convert a password-protected PDF?',
        a: 'Not directly — the tool needs to open the document to render it. Use the PDF Unlocker first with the password you already have, then convert the unlocked copy.'
      }
    ],
    related: [
      rel('pdf-to-png', 'PDF to PNG', 'Lossless output, better for screenshots of text and line art.'),
      rel('pdf-compressor', 'PDF Compressor', 'Keep it a PDF but make it dramatically smaller.')
    ]
  },

  /* ---------------------------------------------------------------- JPG → PDF */
  {
    slug: 'jpg-to-pdf',
    name: 'JPG to PDF',
    create: 'createJpgToPdf',
    scripts: ['pdf-from-images'],
    appCategory: 'UtilitiesApplication',
    title: 'JPG to PDF Converter — Combine Photos into One PDF | ToolStack AI',
    desc: 'Combine JPG photos and scans into a single PDF. Reorder the pages, choose A4 or Letter, and download. Free and entirely browser-based.',
    tagline: 'Turn a set of photos or scans into one tidy PDF, in the order you want, on the page size you need.',
    widget: dropZone({
      label: 'Click to choose JPG images, or drag & drop them',
      hint: 'JPG only · add as many as you like, in any order',
      accept: 'image/jpeg,.jpg,.jpeg',
      multiple: true
    })
      + optionsPanel(
        row(
          field({
            label: 'Page size',
            for: 'pdfPageSize',
            control: select({
              id: 'pdfPageSize',
              options: [
                ['a4', 'A4 — 210 × 297 mm', true],
                ['letter', 'US Letter — 8.5 × 11 in'],
                ['fit', 'Fit the image — no white borders']
              ]
            })
          })
          + field({
            label: 'Orientation',
            for: 'pdfOrientation',
            control: select({
              id: 'pdfOrientation',
              options: [
                ['portrait', 'Portrait', true],
                ['landscape', 'Landscape']
              ]
            })
          })
        )
        + field({
          label: 'Margin',
          for: 'pdfMargin',
          control: '<input id="pdfMargin" type="number" value="36" min="0" max="144" step="6" class="w-full bg-gray-950 border border-gray-700 focus:border-brand-500 rounded-xl px-3 py-2.5 text-sm text-gray-100 outline-none transition" />',
          hint: 'In points — 72 points to an inch. 36 points is a half-inch border; set 0 for edge-to-edge.'
        })
        + note(
          'A portrait photo on an A4 page keeps its own shape and sits centred, leaving white space at the sides. ' +
          'Images are never scaled up: blowing a small phone photo onto A4 only makes it blurry.'
        )
        + `
        <div>
          <p class="text-xs font-bold text-gray-300 mb-1.5">Page order</p>
          <ul id="pdfFileList" class="space-y-2"></ul>
        </div>`
      )
      + runButton('Create PDF')
      + resultPanel('jpg-to-pdf'),
    what: [
      'This tool assembles a stack of JPEG images into a single PDF, one image per page. It is the reverse of PDF to JPG, and the usual reason to need it is that something demands a PDF: a portal upload, a landlord, an expense system, a print shop.',
      'The order of the pages is the part worth getting right, so it is not left to whatever order your operating system happened to hand the files over in. Every image is listed with its position, and you can **move any of them up or down, or remove them**, before anything is generated. A twelve-page scan assembled in the wrong order is the most annoying way this tool could fail.'
    ],
    how: [
      'Click the drop zone or drag your JPGs onto it. You can add more in a second batch if you need to.',
      'Check the **page order** list and fix anything that is out of sequence with the ↑ ↓ buttons. The × button drops an image entirely.',
      'Choose a **page size** — A4, US Letter, or "fit the image" for a PDF whose pages are exactly the size of the photos, with no borders at all.',
      'Press **Create PDF**. The finished document downloads straight away.'
    ],
    cases: [
      { t: 'Phone photos of documents', d: 'Photograph a passport, a receipt or a signed form and submit it as the PDF the portal expects.' },
      { t: 'Portfolio and applications', d: 'Combine a set of images into one attachment that stays in order and cannot be rearranged in transit.' },
      { t: 'Expense claims', d: 'Turn a pile of receipt photos into a single file that matches what the finance system asks for.' },
      { t: 'Scans from a phone app', d: 'Collect pages exported as separate JPEGs back into one continuous document.' }
    ],
    faqs: [
      {
        q: 'How many images can I add at once?',
        a: 'As many as you like, though a very large batch will take a moment and produce a large PDF. Images are embedded one at a time, so memory use stays flat regardless of the total count.'
      },
      {
        q: 'What is the difference between A4 and "fit the image"?',
        a: 'A4 puts every image on a standard 210 × 297 mm page, scaled down to fit inside the margins and centred — good for printing. "Fit the image" makes each PDF page exactly the size of its image, so there are no white borders and no scaling at all — good for reading on screen.'
      },
      {
        q: 'Can I mix JPG and PNG images?',
        a: 'Not on this page — it accepts JPEG only, so a PNG is rejected with a message rather than silently re-encoded into a larger, softer file. Use Image to PDF, which accepts both.'
      }
    ],
    related: [
      rel('png-to-pdf', 'PNG to PDF', 'The same tool for lossless PNG images and screenshots.'),
      rel('image-to-pdf', 'Image to PDF', 'Accepts JPG and PNG together in one document.')
    ]
  },

  /* ---------------------------------------------------------------- PNG → PDF */
  {
    slug: 'png-to-pdf',
    name: 'PNG to PDF',
    create: 'createPngToPdf',
    scripts: ['pdf-from-images'],
    appCategory: 'UtilitiesApplication',
    title: 'PNG to PDF Converter — Combine Images into a PDF | ToolStack AI',
    desc: 'Combine PNG images and screenshots into one PDF, in the order you choose, at A4, Letter or the image\'s own size. Free, private and browser-based.',
    tagline: 'Gather PNGs and screenshots into a single PDF — no quality loss, no upload, no watermark.',
    widget: dropZone({
      label: 'Click to choose PNG images, or drag & drop them',
      hint: 'PNG only · add as many as you like, in any order',
      accept: 'image/png,.png',
      multiple: true
    })
      + optionsPanel(
        row(
          field({
            label: 'Page size',
            for: 'pdfPageSize',
            control: select({
              id: 'pdfPageSize',
              options: [
                ['a4', 'A4 — 210 × 297 mm', true],
                ['letter', 'US Letter — 8.5 × 11 in'],
                ['fit', 'Fit the image — no white borders']
              ]
            })
          })
          + field({
            label: 'Orientation',
            for: 'pdfOrientation',
            control: select({
              id: 'pdfOrientation',
              options: [
                ['portrait', 'Portrait', true],
                ['landscape', 'Landscape']
              ]
            })
          })
        )
        + field({
          label: 'Margin',
          for: 'pdfMargin',
          control: '<input id="pdfMargin" type="number" value="36" min="0" max="144" step="6" class="w-full bg-gray-950 border border-gray-700 focus:border-brand-500 rounded-xl px-3 py-2.5 text-sm text-gray-100 outline-none transition" />',
          hint: 'In points — 72 points to an inch. Set 0 to run the image to the edge of the page.'
        })
        + note(
          'PNG is embedded as PNG, so a screenshot stays pixel-sharp and any transparency in the image ' +
          'is preserved by the PDF. On the page, transparent areas show as white.'
        )
        + `
        <div>
          <p class="text-xs font-bold text-gray-300 mb-1.5">Page order</p>
          <ul id="pdfFileList" class="space-y-2"></ul>
        </div>`
      )
      + runButton('Create PDF')
      + resultPanel('png-to-pdf'),
    what: [
      'This tool turns a set of PNG images into a single PDF, one image per page. PNG is the format screenshots, charts, diagrams and anything with sharp edges or transparency tends to arrive in, and it is embedded here **as PNG rather than re-encoded as JPEG** — so text in a screenshot stays crisp instead of picking up compression artefacts around every letter.',
      'As with the JPG version, the page order is explicit rather than inherited. Each image is listed with its position and can be moved up, moved down or removed before the PDF is built.'
    ],
    how: [
      'Click the drop zone or drag your PNGs in. Add more in a second batch if you need to.',
      'Rearrange the **page order** list if the sequence is wrong, using the ↑ ↓ and × buttons.',
      'Choose **A4**, **US Letter** or **fit the image**, plus an orientation and margin.',
      'Press **Create PDF** and the document downloads immediately.'
    ],
    cases: [
      { t: 'Screenshots into a report', d: 'Assemble a set of annotated screenshots into a single PDF that reads as a walkthrough.' },
      { t: 'Charts and diagrams', d: 'Export figures as PNG and combine them into a document, keeping every line and label sharp.' },
      { t: 'Design handoffs', d: 'Package mockups and exported assets into one file that survives being emailed.' },
      { t: 'Mixed paperwork', d: 'Combine a scanned page and a screenshot of an online form into one submission.' }
    ],
    faqs: [
      {
        q: 'Does converting to PDF lose quality?',
        a: 'No. The PNG data is embedded into the PDF as-is, so nothing is re-compressed on the way in. What you see in the PDF is exactly the image you supplied.'
      },
      {
        q: 'What happens to transparent areas?',
        a: 'The PDF keeps the transparency, and on a page it reads as white. If you need a solid background, flatten the image first — otherwise the result will look correct on screen but may show the page behind it in some viewers.'
      },
      {
        q: 'Can I add JPGs to the same document?',
        a: 'Not on this page — it accepts PNG only, and rejects anything else with a message rather than quietly re-encoding it. Use Image to PDF if your images are a mix of both formats.'
      }
    ],
    related: [
      rel('jpg-to-pdf', 'JPG to PDF', 'The same tool for photographs and JPEG scans.'),
      rel('image-to-pdf', 'Image to PDF', 'Accepts JPG and PNG together in one document.')
    ]
  },

  /* ---------------------------------------------------------------- PDF → PNG */
  {
    slug: 'pdf-to-png',
    name: 'PDF to PNG',
    create: 'createPdfToPng',
    scripts: ['pdf-raster'],
    appCategory: 'MultimediaApplication',
    title: 'PDF to PNG Converter — Lossless Page Images | ToolStack AI',
    desc: 'Convert each page of a PDF into a lossless PNG at the resolution you choose. Sharp text, no compression artefacts, no upload — all in your browser.',
    tagline: 'Turn PDF pages into lossless PNGs — the right choice when the page is text, a chart or line art.',
    widget: dropZone({
      label: 'Click to choose a PDF, or drag & drop it',
      hint: 'PDF only · pages are rendered in your browser, never uploaded'
    })
      + optionsPanel(
        field({
          label: 'Resolution',
          for: 'pdfResolution',
          control: select({
            id: 'pdfResolution',
            options: [
              ['1', 'Low — 72 dpi (smallest files)'],
              ['1.5', 'Medium — 108 dpi'],
              ['2', 'High — 144 dpi', true],
              ['3', 'Very high — 216 dpi'],
              ['4', 'Maximum — 288 dpi (largest files)']
            ]
          }),
          hint: 'PNG files are much larger than JPEG at the same resolution. Pick the lowest setting that still looks sharp to you.'
        })
        + field({
          label: 'Pages',
          for: 'pdfPageSpec',
          control: '<input id="pdfPageSpec" type="text" placeholder="blank = every page, or e.g. 1-3, 7" class="w-full bg-gray-950 border border-gray-700 focus:border-brand-500 rounded-xl px-3 py-2.5 text-sm text-gray-100 outline-none transition" />',
          hint: 'Leave blank to convert the whole document. A trailing dash means "to the end", so 12- starts at page 12.'
        })
        + note(
          'There is no quality slider here on purpose. PNG is lossless — a quality control would change nothing ' +
          'and imply a compromise that does not exist. Size is governed by resolution alone.'
        )
      )
      + runButton('Convert to PNG')
      + resultPanel(
        'pdf-to-png',
        `
        <div id="pdfGallery" class="space-y-2 mt-3 max-h-72 overflow-y-auto"></div>
        <button id="pdfDownloadAllBtn" type="button"
                class="w-full mt-3 px-4 py-2.5 rounded-xl border border-gray-700 hover:border-brand-500 text-gray-300 hover:text-brand-400 font-semibold text-xs transition">
          Download all pages
        </button>`
      ),
    what: [
      'This tool renders each page of a PDF and saves it as a PNG. The difference from the JPG version is not cosmetic: PNG is **lossless**, so nothing is thrown away on the way out. Text stays crisp, thin lines stay thin, and there are none of the soft grey halos that JPEG leaves around high-contrast edges.',
      'That makes PNG the better choice for screenshots of documents, charts, diagrams, signatures and anything with flat colour or sharp type. The cost is size — a PNG page is typically several times larger than the same page as a JPEG — which is why the resolution you choose matters more here than anywhere else in the suite.'
    ],
    how: [
      'Drop in your PDF and wait for it to be read.',
      'Choose a **resolution**. Start at 144 dpi and go up only if you genuinely need more detail; PNG file sizes climb steeply.',
      'Optionally limit the **pages** field to the part of the document you need.',
      'Press **Convert to PNG**, then download pages individually or use **Download all pages**.'
    ],
    cases: [
      { t: 'Screenshots of documents', d: 'Capture a page as a clean, sharp image for documentation or a support article.' },
      { t: 'Charts and diagrams', d: 'Export a figure at high resolution without the ringing and blocking JPEG introduces around lines and text.' },
      { t: 'Editing afterwards', d: 'Open the page in an image editor and annotate it, starting from a file that has not already lost detail.' },
      { t: 'Transparent-aware use', d: 'Drop a page image onto a coloured slide or web page without a JPEG\'s pale fringe showing at the edges.' }
    ],
    faqs: [
      {
        q: 'Why are the PNG files so much bigger than JPGs?',
        a: 'Because PNG keeps every pixel exactly as rendered while JPEG discards detail to save space. That is the whole trade-off: PNG is sharper and larger, JPEG is smaller and softer. Lower the resolution if the size is a problem.'
      },
      {
        q: 'Is there a quality setting?',
        a: 'No, and that is deliberate. PNG is a lossless format, so a quality slider would either do nothing or quietly switch to a different encoder. Resolution is the only control that genuinely changes the output.'
      },
      {
        q: 'Can I convert a password-protected PDF?',
        a: 'Not directly. Use the PDF Unlocker with the password you already have to make an unlocked copy, then convert that.'
      }
    ],
    related: [
      rel('pdf-to-jpg', 'PDF to JPG', 'Much smaller files, better for photographic pages.'),
      rel('pdf-to-text', 'PDF to Text', 'Extract the actual words rather than a picture of them.')
    ]
  },

  /* ------------------------------------------------------------ Image → PDF */
  {
    slug: 'image-to-pdf',
    name: 'Image to PDF',
    create: 'createImageToPdf',
    scripts: ['pdf-from-images'],
    appCategory: 'UtilitiesApplication',
    title: 'Image to PDF — Combine JPG and PNG into One PDF | ToolStack AI',
    desc: 'Combine JPG and PNG images into a single PDF in any order. Choose A4, Letter or the image\'s own size. Free, no upload, no watermark.',
    tagline: 'One tool for both formats: drop in JPGs, PNGs or a mix, put them in order, and get a single PDF back.',
    widget: dropZone({
      label: 'Click to choose images, or drag & drop them',
      hint: 'JPG and PNG · add as many as you like, in any order',
      accept: 'image/jpeg,image/png,.jpg,.jpeg,.png',
      multiple: true
    })
      + optionsPanel(
        row(
          field({
            label: 'Page size',
            for: 'pdfPageSize',
            control: select({
              id: 'pdfPageSize',
              options: [
                ['a4', 'A4 — 210 × 297 mm', true],
                ['letter', 'US Letter — 8.5 × 11 in'],
                ['fit', 'Fit the image — no white borders']
              ]
            })
          })
          + field({
            label: 'Orientation',
            for: 'pdfOrientation',
            control: select({
              id: 'pdfOrientation',
              options: [
                ['portrait', 'Portrait', true],
                ['landscape', 'Landscape']
              ]
            })
          })
        )
        + field({
          label: 'Margin',
          for: 'pdfMargin',
          control: '<input id="pdfMargin" type="number" value="36" min="0" max="144" step="6" class="w-full bg-gray-950 border border-gray-700 focus:border-brand-500 rounded-xl px-3 py-2.5 text-sm text-gray-100 outline-none transition" />',
          hint: 'In points — 72 points to an inch. 36 points is a half-inch border.'
        })
        + note(
          'Each image keeps its own format: JPEGs are embedded as JPEG, PNGs as PNG. Nothing is re-encoded, ' +
          'so a screenshot stays sharp and a photo stays small.'
        )
        + `
        <div>
          <p class="text-xs font-bold text-gray-300 mb-1.5">Page order</p>
          <ul id="pdfFileList" class="space-y-2"></ul>
        </div>`
      )
      + runButton('Create PDF')
      + resultPanel('image-to-pdf'),
    what: [
      'This tool does what JPG to PDF and PNG to PDF do, for the common case where you have both — a photo of a signed page next to a screenshot of the form it belongs to, or a folder exported from a phone that is a mixture of the two.',
      'Each image is **embedded in its own format** rather than being converted to a single one: JPEGs stay JPEG, PNGs stay PNG. Converting everything to one format would either bloat the file or soften the screenshots, so instead the tool keeps whatever each image already had.',
      'The order is yours to set. Every image is listed with its position and can be moved or removed before the PDF is assembled.'
    ],
    how: [
      'Drop your images onto the box, or click to choose them. JPG and PNG can be mixed freely, in any number of batches.',
      'Set the **page order** with the ↑ ↓ buttons, and use × to drop any image you do not want.',
      'Choose a **page size** — A4, US Letter, or "fit the image" for borderless pages exactly the size of each picture.',
      'Press **Create PDF** and the finished document downloads straight away.'
    ],
    cases: [
      { t: 'Mixed paperwork', d: 'Combine a photographed signature page with screenshots of the form it belongs to into one submission.' },
      { t: 'Phone exports', d: 'Phone galleries export a mixture of JPEG photos and PNG screenshots. This takes the folder as it is.' },
      { t: 'Receipts and invoices', d: 'Gather a set of images from different sources into one file an expense system will accept.' },
      { t: 'Anything that must be a PDF', d: 'Portals, landlords and print shops often accept only PDF. Drop the images in and hand them what they asked for.' }
    ],
    faqs: [
      {
        q: 'Is there a limit on how many images I can combine?',
        a: 'No. Images are embedded one at a time, so memory use stays flat however many you add. A very large batch produces a correspondingly large PDF and takes longer to write.'
      },
      {
        q: 'Does it matter what order I add them in?',
        a: 'Not at all — the list is the source of truth, not the order the files arrived in. Add everything first, then put the sequence right before you press the button.'
      },
      {
        q: 'Are my images uploaded anywhere?',
        a: 'No. They are read by your browser and the PDF is assembled on your device. Nothing leaves your computer, so the tool keeps working even with no connection once the page has loaded.'
      }
    ],
    related: [
      rel('pdf-to-jpg', 'PDF to JPG', 'The other direction — split a PDF back into images.'),
      rel('pdf-page-extractor', 'PDF Page Extractor', 'Pull a few pages out of an existing PDF instead.')
    ]
  }
];

/**
 * Specs for the security and privacy tools: protect, unlock, strip metadata.
 *
 * Two of the three depend on the encryption fork described in pdf-shared.js.
 * The copy on those pages is written to survive that dependency failing: it
 * promises a message, never a file, when the engine cannot be loaded.
 */
import {
  dropZone, optionsPanel, runButton, resultPanel, field,
  check, note, rel
} from './_ui.mjs';

const INPUT_CLASS =
  'w-full bg-gray-950 border border-gray-700 focus:border-brand-500 rounded-xl px-3 py-2.5 text-sm text-gray-100 outline-none transition';

export default [
  /* -------------------------------------------------------- password protector */
  {
    slug: 'pdf-password-protector',
    name: 'PDF Password Protector',
    create: 'createPdfPasswordProtector',
    appCategory: 'SecurityApplication',
    title: 'PDF Password Protector — Encrypt a PDF Free | ToolStack AI',
    desc: 'Add a password to a PDF and set printing, copying and editing permissions. Encrypted in your browser with AES — your password and your file never leave your device.',
    tagline: 'Put a password on a PDF before you send it. The document is encrypted on your own device; the password is never transmitted anywhere.',
    widget: dropZone({
      label: 'Click to choose a PDF, or drag & drop it',
      hint: 'PDF only · encrypted in your browser, never uploaded'
    })
      + optionsPanel(
        field({
          label: 'Password to open the file',
          for: 'pdfUserPassword',
          control: `<input id="pdfUserPassword" type="password" autocomplete="new-password" placeholder="Required" class="${INPUT_CLASS}" />`,
          hint: 'Anyone opening the document will be asked for this. It is the password that actually matters.'
        })
        + field({
          label: 'Owner password (optional)',
          for: 'pdfOwnerPassword',
          control: `<input id="pdfOwnerPassword" type="password" autocomplete="new-password" placeholder="Defaults to the password above" class="${INPUT_CLASS}" />`,
          hint: 'Controls who may change the permissions below. If you leave it blank, the open password is used for both.'
        })
        + check({
          id: 'pdfRevealPasswords',
          label: 'Show the passwords as I type',
          hint: 'Only if nobody can see your screen.'
        })
        + `
        <div class="space-y-2.5">
          <p class="text-xs font-bold text-gray-300">Permissions</p>
${check({ id: 'pdfPermPrint', label: 'Allow printing', checked: true })}
${check({ id: 'pdfPermCopy', label: 'Allow copying text and images', checked: true })}
${check({ id: 'pdfPermModify', label: 'Allow editing, annotating and form filling', checked: true })}
        </div>`
        + note(
          '<strong class="font-bold">There is no recovery.</strong> The password is not stored, sent or ' +
          'recoverable — not by this site and not by anyone else. If you lose it, the document is permanently ' +
          'unreadable. Save the password somewhere before you press the button.',
          'danger'
        )
      )
      + runButton('Protect PDF')
      + resultPanel('pdf-password-protector'),
    what: [
      'This tool encrypts a PDF so that opening it requires a password, and optionally restricts what a reader can do with it afterwards — printing, copying text and images, and editing.',
      'The encryption happens **in your browser**. Your file is not uploaded and your password is not sent anywhere: there is no server involved and no copy of either on this site. That is the privacy advantage, and it comes with a matching responsibility — there is also **no password recovery of any kind**. No reset link, no support process, nothing to fall back on.',
      'Two passwords are involved. The **open password** is the one a reader is asked for. The **owner password** controls who can change the permissions; if you leave it blank, the open password is used for both.'
    ],
    how: [
      'Drop in your PDF.',
      'Type the **password to open the file**. Confirm it by revealing it briefly if you want to check for typos — a typo here is unrecoverable.',
      'Optionally set the permissions, and an owner password if you want the restrictions to be changeable by someone else.',
      'Press **Protect PDF**. The encrypted copy downloads straight away. Keep the password somewhere safe before you close the page.'
    ],
    cases: [
      { t: 'Sending a confidential document', d: 'Email a contract, a payslip or a bank statement so that the attachment is useless to anyone who intercepts it.' },
      { t: 'Limit what a recipient can do', d: 'Allow reading and printing but block copying of the text, or block printing entirely.' },
      { t: 'Client and patient material', d: 'Add a second layer of protection to files that are already being sent over an unencrypted channel.' },
      { t: 'Stored copies', d: 'Protect an archive of identity documents sitting on a shared drive or a USB stick.' }
    ],
    faqs: [
      {
        q: 'Can ToolStack AI recover the password if I lose it?',
        a: 'No. The password is never transmitted, stored or logged — it exists only in your browser for the few seconds it takes to encrypt the file. There is no mechanism that could recover it, by design. Save it in a password manager before you press the button.'
      },
      {
        q: 'How strong is the encryption?',
        a: 'The document is written with the PDF Standard Security Handler using AES encryption, which is what Acrobat, Preview, and every mainstream reader expects. The encryption is genuinely strong; the weak point in practice is almost always the password you choose, so use a long one.'
      },
      {
        q: 'What happens if the encryption engine will not load?',
        a: 'The tool stops and tells you so, and downloads nothing. That is deliberate: the alternative would be handing back the original unencrypted file with a success message, which is the one outcome that could genuinely hurt someone. Check your connection and try again.'
      },
      {
        q: 'Does this work on a PDF that is already password-protected?',
        a: 'Not without the password. Use the PDF Unlocker first if you know it; if you do not, the file cannot be opened here at all.'
      }
    ],
    related: [
      rel('pdf-unlocker', 'PDF Unlocker', 'Remove a password from your own file when you know it.'),
      rel('pdf-metadata-remover', 'PDF Metadata Remover', 'Clear the hidden author, title and timestamps before sending.')
    ]
  },

  /* ------------------------------------------------------------------- unlocker */
  {
    slug: 'pdf-unlocker',
    name: 'PDF Unlocker',
    create: 'createPdfUnlocker',
    appCategory: 'SecurityApplication',
    title: 'PDF Unlocker — Remove a Known PDF Password | ToolStack AI',
    desc: 'Remove a password you already know from your own PDF, or clear restrictions that block printing and copying. Nothing is uploaded and no password is guessed.',
    tagline: 'Make an unlocked copy of a PDF you can already open — for your own file, with a password you already have.',
    widget: dropZone({
      label: 'Click to choose a PDF, or drag & drop it',
      hint: 'PDF only · decrypted in your browser, never uploaded'
    })
      + optionsPanel(
        field({
          label: 'Password the file currently opens with',
          for: 'pdfOpenPassword',
          control: `<input id="pdfOpenPassword" type="password" autocomplete="off" placeholder="Required" class="${INPUT_CLASS}" />`,
          hint: 'The password you already use to open this document. If the file opens without asking, use the PDF Password Protector to rewrite it without permissions instead — or try it here with any password that opens it.'
        })
        + check({
          id: 'pdfRevealPassword',
          label: 'Show the password as I type'
        })
        + note(
          '<strong class="font-bold">This is not a password cracker.</strong> There is no dictionary, no guessing ' +
          'and no "try common passwords" mode. It removes a restriction from a document you can already open. ' +
          'A forgotten password cannot be recovered here — that is a property of the encryption, not a limitation ' +
          'this tool has chosen.'
        )
      )
      + runButton('Unlock PDF')
      + resultPanel('pdf-unlocker'),
    what: [
      'This tool writes a new copy of a PDF with the password and its permission restrictions removed. It covers two real cases: a document with an **owner password that only sets permissions** — no printing, no copying — which any reader will open without asking but which refuses to print; and a **user password you already know**, on your own bank statement, invoice or scan, where you want a copy that stops prompting.',
      'The scope is deliberately narrow and the interface enforces it. A password is required before anything happens, and there is no guessing, no dictionary and no brute force. This removes a restriction from a document you can already open; it does not help anyone get into one they cannot.',
      'Everything runs in your browser. The password and the document never leave your device.'
    ],
    how: [
      'Drop in the PDF that asks for a password.',
      'Type the password the file currently opens with. Use the checkbox to check it for typos if you need to.',
      'Press **Unlock PDF**. If the password is wrong, the tool says so plainly and tells you there is no recovery — it does not keep trying.',
      'The unlocked copy downloads immediately. It is written without compressed object streams on purpose, so the result opens in older readers too.'
    ],
    cases: [
      { t: 'Statements and invoices', d: 'Banks, utilities and payroll systems send PDFs locked to your date of birth or account number. Make a copy that stops prompting.' },
      { t: 'Blocked printing', d: 'A document that opens fine but refuses to print or copy is usually restricted by an owner password. This clears it.' },
      { t: 'Your own archive', d: 'Remove passwords from old files you locked years ago so they stay readable without you.' },
      { t: 'Feeding other tools', d: 'The compressor, converter and text extractor cannot open an encrypted PDF. Unlock it first, then use them.' }
    ],
    faqs: [
      {
        q: 'Can this open a PDF whose password I have forgotten?',
        a: 'No. The tool requires the password up front and has no guessing mode of any kind. Modern PDF encryption is designed so that recovering a forgotten password is not feasible, and nothing here attempts it.'
      },
      {
        q: 'Is it legal to remove a password from a PDF?',
        a: 'For a document you own or have legitimate access to, removing a restriction on your own copy is routine — this is what qpdf and Preview do. It is not a tool for accessing material you were not given access to, and the requirement to supply the password is what keeps it that way.'
      },
      {
        q: 'What if the file opens without a password but will not let me print?',
        a: 'That is an owner-password restriction — the file is encrypted but readers open it silently. The password field still needs something in it before the tool will run; the value is not checked in this case, so type anything and press Unlock.'
      }
    ],
    related: [
      rel('pdf-password-protector', 'PDF Password Protector', 'Go the other way and add a password to a file.'),
      rel('pdf-metadata-remover', 'PDF Metadata Remover', 'Clear the author and timestamps still hiding inside it.')
    ]
  },

  /* ----------------------------------------------------------- metadata remover */
  {
    slug: 'pdf-metadata-remover',
    name: 'PDF Metadata Remover',
    create: 'createPdfMetadataRemover',
    appCategory: 'SecurityApplication',
    title: 'PDF Metadata Remover — Strip Author & Title Data | ToolStack AI',
    desc: 'See and clear the author, title, subject, keywords, creator and timestamps stored inside a PDF before you send it. Free and entirely browser-based.',
    tagline: 'Read what your PDF says about you, then wipe it — before the file leaves your machine.',
    widget: dropZone({
      label: 'Click to choose a PDF, or drag & drop it',
      hint: 'PDF only · read and rewritten in your browser, never uploaded'
    })
      + optionsPanel(
        `
        <div>
          <p class="text-xs font-bold text-gray-300 mb-2">Metadata found in this file</p>
          <div id="pdfMetaList" class="space-y-2"></div>
        </div>`
        + note(
          'This clears the document information fields and both timestamps. Because the file is rewritten from ' +
          'its object model, structures that are not part of that model — including the XMP packet some scanners ' +
          'and Office exports embed — do not survive either. That is a strong clean, not a forensic one: if a ' +
          'document must be beyond any recovery, the PDF Compressor turns it into images instead.'
        )
      )
      + runButton('Remove metadata')
      + resultPanel('pdf-metadata-remover'),
    what: [
      'Every PDF carries a block of information about itself: who wrote it, what program produced it, what it is called, and when it was created and last modified. It is invisible when you read the document and it travels with the file wherever you send it.',
      'This tool **shows you those fields and then clears them**. The ones that catch people out are mundane: a client name left in the title, a username in the author field, a full file path in the producer, or a colleague\'s name in the creator on a document that was supposed to be anonymous.',
      'What it does not claim to do is a forensic clean. The file is rewritten from its object model, so anything outside that model does not survive the rewrite — but that is a consequence of how the file is written rather than a scan that reports what it found. If a document genuinely must not be recoverable, rasterise it: the PDF Compressor turns every page into an image, which leaves nothing but pictures.'
    ],
    how: [
      'Drop in your PDF. The tool reads it and lists every metadata field it can find, with its current value — including the creation and modification timestamps.',
      'Read the list before you decide. It is often the point of the exercise: the author field on a document you are about to send anonymously is exactly what you want to see.',
      'Press **Remove metadata**. The six document information fields are cleared and both dates are set to 1 January 1970 rather than "now", so the scrubbed file carries no timestamp at all.',
      'The cleaned copy downloads immediately, and the panel confirms the file is on its way.'
    ],
    cases: [
      { t: 'Anonymous submissions', d: 'Strip your name and organisation from a manuscript, a bid or a review before it goes to a blind panel.' },
      { t: 'Client-facing documents', d: 'Remove internal usernames, machine names and file paths that leaked into the file when it was exported.' },
      { t: 'Publishing and press', d: 'Clear the authoring history from a PDF before it is posted publicly, where anyone can read it with a two-line script.' },
      { t: 'Before sharing a template', d: 'Remove your own details from a document you are handing to someone else to reuse.' }
    ],
    faqs: [
      {
        q: 'Is this a complete forensic clean?',
        a: 'No, and the page will not claim it is. It clears the document information dictionary and both dates, and rewriting the file drops structures outside pdf-lib\'s object model — including the XMP packet some producers embed. If a document must be beyond any recovery, run it through the PDF Compressor, which rebuilds every page as an image and leaves no text or metadata behind at all.'
      },
      {
        q: 'Why are the dates set to 1970 instead of today?',
        a: 'Because stamping the current time on a scrubbed file would just be a different identifier. Setting both dates to the Unix epoch is unambiguous and is what other metadata scrubbers write, so the result is recognisably cleaned rather than freshly dated.'
      },
      {
        q: 'Does removing metadata change how the document looks?',
        a: 'No. The visible pages, text, images and links are untouched — the fields being cleared are not rendered anywhere on the page.'
      }
    ],
    related: [
      rel('pdf-compressor', 'PDF Compressor', 'Rasterise the pages so nothing but images survives.'),
      rel('pdf-password-protector', 'PDF Password Protector', 'Encrypt the file before it goes out.')
    ]
  }
];

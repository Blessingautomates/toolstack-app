/**
 * Shared widget builders for the PDF tool specs.
 *
 * Every PDF tool page wears the same shell — a drop zone, a status line, an
 * options panel, a run button, a result panel — and only the controls in the
 * middle differ. Fifteen hand-written copies of that shell is how one page ends
 * up with a drop zone whose id is a typo, and an id typo in this suite fails
 * silently: the module's `$('pdfDropZone')` returns null, the early return
 * fires, and the page renders a widget that does nothing at all.
 *
 * So the shell lives here once and the specs compose it. These strings are
 * emitted as raw HTML by gen-pdf-tools.mjs (unlike the prose, which is escaped),
 * which is what lets a spec stay a data file rather than a template.
 */

/**
 * The click-and-drop target.
 *
 * `role="button"` + `tabindex` are what make it reachable by keyboard — the
 * module wires Enter and Space to it, but without these the element cannot be
 * focused to receive them in the first place.
 */
export const dropZone = ({
  id = 'pdf',
  label = 'Click to choose a file, or drag & drop it',
  hint = 'Your file is processed in the browser and is never uploaded.',
  accept = 'application/pdf,.pdf',
  multiple = false
} = {}) => `
      <div id="${id}DropZone" role="button" tabindex="0"
           class="border-2 border-dashed border-gray-700 hover:border-brand-500 rounded-2xl px-6 py-9 text-center cursor-pointer transition focus:outline-none focus:border-brand-500">
        <p id="${id}DropLabel" class="text-sm font-semibold text-gray-200">${label}</p>
        <p class="text-xs text-gray-500 mt-1.5">${hint}</p>
        <input id="${id}FileInput" type="file" class="hidden" accept="${accept}"${multiple ? ' multiple' : ''} />
        <p id="${id}FileMeta" class="text-xs text-brand-400 mt-3 font-semibold"></p>
      </div>

      <!-- aria-live so a screen reader announces "Rendering page 3 of 12" as it
           changes, rather than leaving the whole run silent. -->
      <p id="${id}Status" class="hidden text-xs mt-3 leading-relaxed" role="status" aria-live="polite"></p>`;

/**
 * The options panel. Starts hidden and is unhidden by the module once a file
 * has loaded, so the controls are never presented before there is anything to
 * apply them to.
 */
export const optionsPanel = (inner) => `
      <div id="pdfOptions" class="hidden mt-5 space-y-4">
${inner}
      </div>`;

/** The primary action. Starts disabled; the module enables it on load. */
export const runButton = (label) => `
      <button id="pdfRunBtn" type="button" disabled
              class="w-full mt-5 px-4 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-40 disabled:cursor-not-allowed text-gray-950 font-bold text-sm transition">
        ${label}
      </button>`;

/**
 * The success panel, with the share strip underneath.
 *
 * `data-ts-deferred` keeps the share buttons hidden until the tool has actually
 * produced a file — offering to share a tool the visitor has not managed to run
 * yet is the wrong moment for it.
 */
export const resultPanel = (slug, extra = '') => `
      <div id="pdfResult" class="hidden mt-5 bg-gray-950 border border-emerald-900/60 rounded-2xl p-4">
        <p class="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-2">Done</p>
        <p id="pdfResultText" class="text-sm text-gray-300 leading-relaxed"></p>${extra}
        <div data-ts-result-actions="${slug}" data-ts-deferred="1" class="mt-4"></div>
      </div>`;

/** A labelled control. `hint` is the small grey line under it. */
export const field = ({ label, for: target, control, hint = '' }) => `
        <div>
          <label for="${target}" class="block text-xs font-bold text-gray-300 mb-1.5">${label}</label>
          ${control}${hint ? `\n          <p class="text-[11px] text-gray-500 mt-1.5 leading-relaxed">${hint}</p>` : ''}
        </div>`;

const CONTROL_CLASS =
  'w-full bg-gray-950 border border-gray-700 focus:border-brand-500 rounded-xl px-3 py-2.5 text-sm text-gray-100 outline-none transition';

export const select = ({ id, options }) =>
  `<select id="${id}" class="${CONTROL_CLASS}">\n` +
  options.map((o) => `            <option value="${o[0]}"${o[2] ? ' selected' : ''}>${o[1]}</option>`).join('\n') +
  `\n          </select>`;

export const numberInput = ({ id, value, min, max, step = 1 }) =>
  `<input id="${id}" type="number" value="${value}" min="${min}" max="${max}" step="${step}" class="${CONTROL_CLASS}" />`;

export const textInput = ({ id, placeholder = '', value = '', type = 'text' }) =>
  `<input id="${id}" type="${type}"${value ? ` value="${value}"` : ''} placeholder="${placeholder}" class="${CONTROL_CLASS}" />`;

export const textArea = ({ id, rows = 8, placeholder = '' }) =>
  `<textarea id="${id}" rows="${rows}" placeholder="${placeholder}" class="${CONTROL_CLASS} font-mono leading-relaxed"></textarea>`;

/**
 * A slider with its live value beside the label.
 *
 * The value readout is a separate element with its own id because the module
 * needs to write to it: a range input's own bubble is not styleable and, more
 * to the point, not readable by the module.
 */
export const range = ({ id, valueId, label, min, max, step, value, hint = '' }) => `
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label for="${id}" class="text-xs font-bold text-gray-300">${label}</label>
            <span id="${valueId}" class="text-xs font-bold text-brand-400">${value}</span>
          </div>
          <input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"
                 class="w-full accent-brand-500" />${
            hint ? `\n          <p class="text-[11px] text-gray-500 mt-1.5 leading-relaxed">${hint}</p>` : ''
          }
        </div>`;

/** A two-column row of controls that stacks on a phone. */
export const row = (inner) => `
        <div class="grid sm:grid-cols-2 gap-4">
${inner}
        </div>`;

/** A checkbox with its label. `id` is the input's, so the module can read it. */
export const check = ({ id, label, hint = '', checked = false }) => `
        <label for="${id}" class="flex items-start gap-2.5 cursor-pointer">
          <input id="${id}" type="checkbox"${checked ? ' checked' : ''} class="mt-0.5 w-4 h-4 accent-brand-500 flex-shrink-0" />
          <span class="text-xs text-gray-300 leading-relaxed">${label}${
            hint ? `<span class="block text-[11px] text-gray-500 mt-0.5">${hint}</span>` : ''
          }</span>
        </label>`;

/** An inline note inside the options panel — used for the honest caveats. */
export const note = (html, tone = 'brand') => {
  const tones = {
    brand: 'border-brand-500/40 bg-brand-500/5 text-brand-200',
    warn: 'border-amber-500/40 bg-amber-500/5 text-amber-200',
    danger: 'border-rose-500/40 bg-rose-500/5 text-rose-200'
  };
  return `
        <div class="border ${tones[tone] || tones.brand} rounded-xl px-3.5 py-3 text-[11px] leading-relaxed">
          ${html}
        </div>`;
};

/** `related` entries for the footer cross-link grid. */
export const rel = (slug, name, d) => ({ slug, name, d });

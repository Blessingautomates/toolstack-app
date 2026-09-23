/**
 * Images → PDF — shared by JPG to PDF, PNG to PDF and Image to PDF.
 *
 * The three differ only in which formats they accept; the page-size maths,
 * the ordering, the drag-to-reorder list and the output are identical, and all
 * of it lives here. pdf-shared.js owns the actual embedding.
 *
 * Order is the one thing worth being careful about. A FileList arrives in the
 * order the OS handed it over, which for a multi-select is usually but not
 * reliably the name order, and never the order someone dragged files in. The
 * list below is therefore the source of truth, reorderable, with the numbers
 * shown — a twelve-page scan assembled in the wrong order is the single most
 * annoying way this tool could fail.
 */
(function (window, document) {
  'use strict';

  /**
   * @param {object} config
   *   accept      comma-separated accept attribute for the file input
   *   test        predicate deciding whether a File is usable
   *   acceptLabel human phrase for the error message, e.g. "a JPG image"
   *   tool        analytics key
   */
  function createImageToPdf(config) {
    return function (root) {
      if (!root) return null;

      var P = window.ToolStackPDF;
      if (!P) return null;

      var $ = function (id) { return root.querySelector('#' + id); };

      var zone = $('pdfDropZone');
      var input = $('pdfFileInput');
      var dropLabel = $('pdfDropLabel');
      var fileMeta = $('pdfFileMeta');
      var options = $('pdfOptions');
      var pageSize = $('pdfPageSize');
      var orientation = $('pdfOrientation');
      var margin = $('pdfMargin');
      var runBtn = $('pdfRunBtn');
      var list = $('pdfFileList');
      var result = $('pdfResult');
      var resultText = $('pdfResultText');

      if (!zone || !input) return null;

      var status = P.createStatus($('pdfStatus'));
      var reveal = P.createReveal(root);

      var files = [];

      function reset() {
        files = [];
        if (list) list.innerHTML = '';
        if (runBtn) runBtn.disabled = true;
        if (options) options.classList.add('hidden');
        if (result) result.classList.add('hidden');
      }

      function add(selected) {
        var incoming = Array.prototype.slice.call(selected);
        if (!incoming.length) return;

        try {
          P.checkTypes(incoming, config.test, config.acceptLabel);
        } catch (err) {
          status(err.message, 'error');
          return;
        }

        files = files.concat(incoming);
        if (options) options.classList.remove('hidden');
        if (result) result.classList.add('hidden');
        render();
        status(files.length + ' image' + (files.length === 1 ? '' : 's') + ' ready.', 'ok');
      }

      function render() {
        if (dropLabel) {
          dropLabel.textContent = files.length
            ? 'Add more images, or drop them here'
            : 'Click to choose images, or drag & drop them';
        }

        if (fileMeta) {
          var total = files.reduce(function (sum, f) { return sum + f.size; }, 0);
          fileMeta.textContent = files.length
            ? files.length + ' file' + (files.length === 1 ? '' : 's') + ' · ' + P.formatBytes(total)
            : '';
        }

        if (list) {
          list.innerHTML = files.map(function (f, i) {
            return '' +
              '<li class="bg-gray-950 border border-gray-800 rounded-xl p-2.5 flex items-center gap-3">' +
                '<span class="flex-shrink-0 w-6 h-6 rounded-lg bg-gray-800 text-gray-300 text-[10px] font-bold flex items-center justify-center">' +
                  (i + 1) +
                '</span>' +
                '<span class="min-w-0 flex-1 text-xs text-gray-300 truncate">' + escapeHtml(f.name) + '</span>' +
                '<span class="flex-shrink-0 flex items-center gap-1">' +
                  '<button type="button" data-ts-move="up" data-ts-index="' + i + '" ' +
                    (i === 0 ? 'disabled ' : '') +
                    'class="w-6 h-6 rounded-lg border border-gray-700 hover:border-brand-500 disabled:opacity-30 disabled:hover:border-gray-700 text-gray-400 text-xs transition" ' +
                    'aria-label="Move up">↑</button>' +
                  '<button type="button" data-ts-move="down" data-ts-index="' + i + '" ' +
                    (i === files.length - 1 ? 'disabled ' : '') +
                    'class="w-6 h-6 rounded-lg border border-gray-700 hover:border-brand-500 disabled:opacity-30 disabled:hover:border-gray-700 text-gray-400 text-xs transition" ' +
                    'aria-label="Move down">↓</button>' +
                  '<button type="button" data-ts-move="remove" data-ts-index="' + i + '" ' +
                    'class="w-6 h-6 rounded-lg border border-gray-700 hover:border-rose-500 text-gray-400 hover:text-rose-400 text-xs transition" ' +
                    'aria-label="Remove">×</button>' +
                '</span>' +
              '</li>';
          }).join('');
        }

        if (runBtn) runBtn.disabled = files.length === 0;
      }

      function build() {
        if (!files.length) return;

        runBtn.disabled = true;
        if (result) result.classList.add('hidden');
        status('Loading the PDF library…', 'busy');

        P.imagesToPdf(files, {
          pageSize: pageSize ? pageSize.value : 'fit',
          landscape: orientation ? orientation.value === 'landscape' : false,
          margin: margin ? Number(margin.value) : 36,
          onProgress: function (n, total) {
            status('Placing image ' + n + ' of ' + total + '…', 'busy');
          }
        }).then(function (doc) {
          status('Writing the PDF…', 'busy');
          return doc.save({ useObjectStreams: true });
        }).then(function (bytes) {
          var name = files.length === 1
            ? P.stem(files[0].name) + '.pdf'
            : config.tool + '.pdf';
          P.download(bytes, name, 'application/pdf');

          if (result) result.classList.remove('hidden');
          if (resultText) {
            resultText.textContent = files.length + ' image' + (files.length === 1 ? '' : 's') +
              ' · ' + P.formatBytes(bytes.length);
          }

          status('PDF created and downloaded.', 'ok');
          runBtn.disabled = false;
          P.track(config.tool);
          reveal();
        }).catch(function (err) {
          status(err && err.message ? err.message : 'Could not build the PDF.', 'error');
          runBtn.disabled = false;
        });
      }

      function move(index, direction) {
        var target = direction === 'up' ? index - 1
          : direction === 'down' ? index + 1
            : -1;

        if (direction === 'remove') {
          files.splice(index, 1);
        } else {
          if (target < 0 || target >= files.length) return;
          var held = files[index];
          files[index] = files[target];
          files[target] = held;
        }

        render();
        if (!files.length) {
          reset();
          status('No images selected.', 'idle');
        }
      }

      function escapeHtml(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }

      input.setAttribute('accept', config.accept);
      input.multiple = true;

      P.wireDropZone(zone, input, add);

      if (list) {
        list.addEventListener('click', function (e) {
          var btn = e.target.closest ? e.target.closest('[data-ts-move]') : null;
          if (!btn || btn.disabled) return;
          move(Number(btn.getAttribute('data-ts-index')), btn.getAttribute('data-ts-move'));
        });
      }

      if (runBtn) runBtn.addEventListener('click', build);

      reset();
      return { build: build, add: add };
    };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createImageToPdfTool = createImageToPdf;
})(window, document);

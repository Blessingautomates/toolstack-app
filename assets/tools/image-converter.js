/**
 * Image Converter & WebP Optimizer — shared engine.
 *
 * Factory, not a singleton: the same code backs the standalone page at
 * /tools/image-converter.html and any future host. Modal open/close is
 * deliberately NOT here — that is page chrome, not tool logic.
 *
 * Required markup (ids, inside `root`):
 *   #dropZone #dropZoneLabel #imageInput #imageControls #convertBtn
 *   #outputFormat #qualityRange #qualityVal
 * Optional:
 *   #convertStatus — banner for the "converted, saved N%" message.
 *   [data-ts-result-actions] — revealed after the first conversion.
 *
 * The image never leaves the browser: it is decoded into an <img>, redrawn on
 * a <canvas>, and re-encoded with canvas.toDataURL(). No upload, no fetch.
 */
(function (window, document) {
  'use strict';

  var ACCEPTED = /^image\/(png|jpeg|webp)$/;

  function createImageConverter(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var dropZone = $('dropZone');
    var dropLabel = $('dropZoneLabel');
    var imageInput = $('imageInput');
    var controls = $('imageControls');
    var convertBtn = $('convertBtn');
    var formatSelect = $('outputFormat');
    var qualityRange = $('qualityRange');
    var qualityVal = $('qualityVal');
    var statusBanner = $('convertStatus');

    if (!dropZone || !imageInput) return null;

    var loadedImage = null;
    var originalFileName = 'converted-image';
    var originalSize = 0;

    var actionsEl = root.querySelector('[data-ts-result-actions]');
    var actionsShown = false;

    function revealActions() {
      if (actionsShown || !actionsEl) return;
      actionsShown = true;
      if (window.ToolStack) {
        window.ToolStack.reveal(actionsEl);
      } else {
        actionsEl.classList.remove('hidden');
      }
    }

    function showStatus(message, isError) {
      if (!statusBanner) return;
      statusBanner.classList.remove('hidden', 'text-rose-400', 'text-emerald-400', 'text-gray-400');
      statusBanner.classList.add(isError ? 'text-rose-400' : 'text-emerald-400');
      statusBanner.textContent = message;
    }

    function formatBytes(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    function reset() {
      loadedImage = null;
      originalSize = 0;
      if (convertBtn) convertBtn.disabled = true;
      if (controls) controls.classList.add('hidden');
    }

    function loadFile(file) {
      if (!file) return;

      if (!ACCEPTED.test(file.type)) {
        showStatus('Unsupported file type. Use a PNG, JPG, or WebP image.', true);
        reset();
        return;
      }

      originalFileName = file.name.substring(0, file.name.lastIndexOf('.')) || 'converted-image';
      originalSize = file.size;

      var reader = new FileReader();
      reader.onload = function (event) {
        var img = new Image();
        img.onload = function () {
          loadedImage = img;
          if (controls) controls.classList.remove('hidden');
          if (convertBtn) convertBtn.disabled = false;
          if (dropLabel) dropLabel.textContent = 'Loaded: ' + file.name;
          showStatus('Ready — ' + img.width + '×' + img.height + ' · ' + formatBytes(originalSize), false);
        };
        img.onerror = function () {
          reset();
          showStatus('That file could not be decoded as an image.', true);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }

    function convert() {
      if (!loadedImage) return;

      var canvas = document.createElement('canvas');
      canvas.width = loadedImage.width;
      canvas.height = loadedImage.height;

      var ctx = canvas.getContext('2d');

      var format = formatSelect ? formatSelect.value : 'image/webp';
      var quality = qualityRange ? parseFloat(qualityRange.value) / 100 : 0.8;
      var ext = format.split('/')[1];

      // JPEG has no alpha channel: without a matte, transparent pixels come out
      // black. WebP and PNG keep their alpha.
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(loadedImage, 0, 0);

      var dataUrl = canvas.toDataURL(format, quality);

      // The re-encoded payload as bytes, for the size comparison.
      var base64 = dataUrl.split(',')[1] || '';
      var newSize = Math.round((base64.length * 3) / 4);

      var link = document.createElement('a');
      link.download = originalFileName + '.' + ext;
      link.href = dataUrl;
      link.click();

      if (originalSize && newSize) {
        var delta = Math.round(((originalSize - newSize) / originalSize) * 100);
        showStatus(
          'Converted to ' + ext.toUpperCase() + ' · ' + formatBytes(newSize) +
          (delta > 0 ? ' — ' + delta + '% smaller than the original.' : ' — larger than the original; try a lower quality.'),
          delta > 0
        );
      } else {
        showStatus('Converted to ' + ext.toUpperCase() + '.', false);
      }

      if (window.ToolStack) window.ToolStack.track('tool_output', { tool: 'image-converter' });
      revealActions();
    }

    // --- drop zone wiring -------------------------------------------------

    dropZone.addEventListener('click', function () { imageInput.click(); });

    dropZone.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        imageInput.click();
      }
    });

    imageInput.addEventListener('change', function (e) {
      loadFile(e.target.files && e.target.files[0]);
    });

    ['dragenter', 'dragover'].forEach(function (type) {
      dropZone.addEventListener(type, function (e) {
        e.preventDefault();
        dropZone.classList.add('border-brand-500');
      });
    });

    ['dragleave', 'drop'].forEach(function (type) {
      dropZone.addEventListener(type, function (e) {
        e.preventDefault();
        dropZone.classList.remove('border-brand-500');
      });
    });

    dropZone.addEventListener('drop', function (e) {
      var dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length) loadFile(dt.files[0]);
    });

    // --- controls ---------------------------------------------------------

    if (qualityRange && qualityVal) {
      qualityRange.addEventListener('input', function () {
        qualityVal.textContent = qualityRange.value;
      });
    }

    if (convertBtn) convertBtn.addEventListener('click', convert);

    reset();

    return {
      convert: convert,
      loadFile: loadFile,
      revealActions: revealActions
    };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createImageConverter = createImageConverter;
})(window, document);

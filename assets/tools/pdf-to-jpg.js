/**
 * PDF to JPG.
 *
 * The tool itself is pdf-raster.js; this file only names the encoder. JPEG is
 * the right default for a PDF page because pages are photographic more often
 * than they are line art — a scanned invoice, a slide with a gradient, a photo
 * spread — and JPEG handles those at a fraction of PNG's size.
 */
(function (window) {
  'use strict';

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createPdfToJpg = window.ToolStackTools.createRasterizer({
    mime: 'image/jpeg',
    ext: 'jpg',
    tool: 'pdf-to-jpg',
    quality: true
  });
})(window);

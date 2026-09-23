/**
 * PDF to PNG.
 *
 * The tool itself is pdf-raster.js; this file only names the encoder. PNG is
 * lossless and keeps transparency, which is what you want for a page of text,
 * a chart, a diagram or a screenshot-style export that will be annotated or
 * re-cropped — at the cost of a much larger file than the JPG route.
 *
 * No quality control is exposed: PNG has no quality setting, and offering a
 * slider that did nothing would be worse than offering none.
 */
(function (window) {
  'use strict';

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createPdfToPng = window.ToolStackTools.createRasterizer({
    mime: 'image/png',
    ext: 'png',
    tool: 'pdf-to-png',
    quality: false
  });
})(window);

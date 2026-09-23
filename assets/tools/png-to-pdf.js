/**
 * PNG to PDF.
 *
 * The tool itself is pdf-from-images.js; this file only names the accepted
 * format. pdf-lib embeds a PNG losslessly, so a screenshot or a chart exported
 * through here keeps every pixel — which is the reason to prefer this over the
 * JPG route for anything with text or flat colour in it.
 */
(function (window) {
  'use strict';

  var isPng = function (file) {
    return /png$/i.test(file.type) || /\.png$/i.test(file.name);
  };

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createPngToPdf = window.ToolStackTools.createImageToPdfTool({
    accept: 'image/png,.png',
    test: isPng,
    acceptLabel: 'a PNG image',
    tool: 'png-to-pdf'
  });
})(window);

/**
 * JPG to PDF.
 *
 * The tool itself is pdf-from-images.js; this file only names the accepted
 * format. JPEG is restricted to JPEG files on purpose — accepting a PNG here
 * and silently re-encoding it would produce a larger, softer page than the
 * PNG-to-PDF tool that exists for exactly that file.
 */
(function (window) {
  'use strict';

  var isJpeg = function (file) {
    return /jpe?g$/i.test(file.type) || /\.jpe?g$/i.test(file.name);
  };

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createJpgToPdf = window.ToolStackTools.createImageToPdfTool({
    accept: 'image/jpeg,.jpg,.jpeg',
    test: isJpeg,
    acceptLabel: 'a JPG image',
    tool: 'jpg-to-pdf'
  });
})(window);

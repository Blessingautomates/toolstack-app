/**
 * Image to PDF — the format-agnostic member of the family.
 *
 * Same engine as JPG to PDF and PNG to PDF, but it takes either format and
 * mixes them freely, which is the case that actually comes up: a phone photo
 * (JPEG) and a screenshot of a signature (PNG) in one document. The encoder is
 * chosen per file from its type, so neither is re-compressed into the other.
 */
(function (window) {
  'use strict';

  var isImage = function (file) {
    return /^image\/(jpeg|png)$/.test(file.type) || /\.(jpe?g|png)$/i.test(file.name);
  };

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createImageToPdf = window.ToolStackTools.createImageToPdfTool({
    accept: 'image/jpeg,image/png,.jpg,.jpeg,.png',
    test: isImage,
    acceptLabel: 'a PNG or JPG image',
    tool: 'image-to-pdf'
  });
})(window);

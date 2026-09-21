/**
 * Client Quotation Generator — shared engine.
 *
 * Factory, not a singleton: the same code backs the standalone page at
 * /tools/quote-generator.html and any future host. Modal open/close is
 * deliberately NOT here — that is page chrome, not tool logic.
 *
 * Required markup (ids, inside `root`):
 *   #quoteContainer #quoteNumber #quoteDate #clientName #providerName
 *   #lineItemsBody #addItemBtn #taxRate #subTotal #grandTotal #downloadPdfBtn
 *   — rows in #lineItemsBody must contain .item-qty .item-price .item-total
 *
 * Requires the html2pdf bundle (html2canvas + jsPDF) to be loaded by the host
 * page; the PDF button degrades to a toast if it is missing.
 */
(function (window, document) {
  'use strict';

  var CURRENCY = '$';

  function createQuoteGenerator(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var container = $('quoteContainer');
    var quoteNumber = $('quoteNumber');
    var quoteDate = $('quoteDate');
    var clientName = $('clientName');
    var lineItemsBody = $('lineItemsBody');
    var addItemBtn = $('addItemBtn');
    var taxRate = $('taxRate');
    var subTotalEl = $('subTotal');
    var grandTotalEl = $('grandTotal');
    var downloadBtn = $('downloadPdfBtn');

    if (!container || !lineItemsBody) return null;

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

    function money(value) {
      return CURRENCY + value.toFixed(2);
    }

    function calculateTotals() {
      var sub = 0;

      Array.prototype.forEach.call(lineItemsBody.querySelectorAll('tr'), function (row) {
        var qtyEl = row.querySelector('.item-qty');
        var priceEl = row.querySelector('.item-price');
        var totalEl = row.querySelector('.item-total');
        if (!qtyEl || !priceEl) return;

        var qty = parseFloat(qtyEl.value) || 0;
        var price = parseFloat(priceEl.value) || 0;
        // Negative quantities and prices would silently credit the client, so
        // they are clamped rather than trusted from the number inputs.
        var total = Math.max(0, qty) * Math.max(0, price);

        if (totalEl) totalEl.textContent = total.toFixed(2);
        sub += total;
      });

      var rate = Math.max(0, parseFloat(taxRate && taxRate.value) || 0);
      var grand = sub + (sub * (rate / 100));

      if (subTotalEl) subTotalEl.textContent = money(sub);
      if (grandTotalEl) grandTotalEl.textContent = money(grand);

      return { sub: sub, grand: grand };
    }

    function addRow() {
      var tr = document.createElement('tr');
      tr.className = 'line-item border-b border-gray-800/50';
      tr.innerHTML =
        '<td class="py-2.5"><input type="text" class="item-desc w-full bg-transparent focus:outline-none" placeholder="Service item..." /></td>' +
        '<td class="py-2.5"><input type="number" class="item-qty w-full bg-transparent text-center focus:outline-none" value="1" min="1" /></td>' +
        '<td class="py-2.5"><input type="number" class="item-price w-full bg-transparent text-right focus:outline-none" value="0" min="0" /></td>' +
        '<td class="py-2.5 text-right font-medium item-total">0.00</td>';
      lineItemsBody.appendChild(tr);
      calculateTotals();

      var desc = tr.querySelector('.item-desc');
      if (desc) desc.focus();

      return tr;
    }

    lineItemsBody.addEventListener('input', calculateTotals);
    if (taxRate) taxRate.addEventListener('input', calculateTotals);

    if (addItemBtn) addItemBtn.addEventListener('click', addRow);

    if (downloadBtn) {
      downloadBtn.addEventListener('click', function () {
        if (typeof window.html2pdf === 'undefined') {
          if (window.ToolStack) {
            window.ToolStack.toast('PDF library unavailable — check your connection.');
          }
          return;
        }

        var name = (quoteNumber && quoteNumber.value.trim()) || 'quotation';

        window.html2pdf().set({
          margin: 0.5,
          filename: name + '.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        }).from(container).save();

        if (window.ToolStack) window.ToolStack.track('tool_output', { tool: 'quote-generator' });
        revealActions();
      });
    }

    if (quoteDate) quoteDate.textContent = new Date().toLocaleDateString();

    calculateTotals();

    return {
      calculateTotals: calculateTotals,
      addRow: addRow,
      revealActions: revealActions
    };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createQuoteGenerator = createQuoteGenerator;
})(window, document);

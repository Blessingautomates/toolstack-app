/**
 * ToolStack AI — Schema Markup Generator engine.
 *
 * Ids required in tools/schema-generator.html:
 *   scType, scName, scUrl, scImage, scDescription, scSameAs, scPhone, scEmail,
 *   scPrice, scCurrency, scAvailability, scOutput, scStats, scWarnings,
 *   scResults, scCopy, scExample, scClear, scStatus
 *
 * Deliberate choices:
 *
 * 1. Required and recommended properties are tracked separately, per type, from
 *    Google's own documentation. "Required" means the rich result is not granted
 *    without it; "recommended" means it is granted but poorer. Collapsing the
 *    two would train people to ignore both.
 *
 * 2. Nothing is invented. A property with an empty field is left out of the
 *    output entirely, so the markup never claims something the page does not
 *    say — which is the one mistake in structured data that earns a manual
 *    action rather than simply being ignored.
 *
 * 3. The output is a bare JSON object, with no script wrapper, because the
 *    wrapper is the same three lines every time and the object is the part
 *    worth reading. The page tells you what to wrap it in.
 */
(function (window, document) {
  'use strict';

  function createSchemaGenerator(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var typeEl = $('scType');
    var nameEl = $('scName');
    var urlEl = $('scUrl');
    var imageEl = $('scImage');
    var descriptionEl = $('scDescription');
    var sameAsEl = $('scSameAs');
    var phoneEl = $('scPhone');
    var emailEl = $('scEmail');
    var priceEl = $('scPrice');
    var currencyEl = $('scCurrency');
    var availabilityEl = $('scAvailability');
    var productFields = $('scProductFields');
    var output = $('scOutput');
    var statsEl = $('scStats');
    var warningsEl = $('scWarnings');
    var results = $('scResults');
    var statusEl = $('scStatus');

    if (!typeEl || !nameEl || !output || !results) return null;

    // Straight from Google's structured data documentation: the properties it
    // will not grant a rich result without, and the ones it merely expects.
    var REQUIRED = {
      Organization: ['name'],
      WebSite: ['name', 'url'],
      WebPage: ['name', 'url'],
      Person: ['name'],
      Service: ['name', 'url'],
      Product: ['name', 'offers']
    };

    var RECOMMENDED = {
      Organization: ['url', 'logo', 'sameAs'],
      WebSite: ['url'],
      WebPage: ['description'],
      Person: ['url', 'sameAs'],
      Service: ['description'],
      Product: ['image', 'description']
    };

    // Readable names for the notes, since "sameAs" means nothing to most people
    // reading the warning.
    var LABELS = {
      name: 'name',
      url: 'URL',
      description: 'description',
      image: 'logo or image',
      logo: 'logo or image',
      sameAs: 'same-as profile links',
      offers: 'price and availability'
    };

    var STATUS = {
      ok: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      info: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      warn: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      error: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    };

    function showStatus(message, kind) {
      if (!statusEl) return;
      var keys = ['ok', 'info', 'warn', 'error'];
      for (var i = 0; i < keys.length; i++) {
        statusEl.classList.remove.apply(statusEl.classList, STATUS[keys[i]].split(' '));
      }
      statusEl.classList.add.apply(statusEl.classList, (STATUS[kind] || STATUS.info).split(' '));
      statusEl.textContent = message;
      statusEl.classList.remove('hidden');
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function value(el) {
      return el ? el.value.replace(/^\s+|\s+$/g, '') : '';
    }

    function isAbsoluteUrl(text) {
      return /^https?:\/\/[^\s/]+\.[^\s/]+/i.test(text);
    }

    function lines(text) {
      var raw = String(text || '').split(/\r?\n/);
      var out = [];
      var seen = {};
      for (var i = 0; i < raw.length; i++) {
        var line = raw[i].replace(/^\s+|\s+$/g, '');
        if (line === '' || seen[line] === true) continue;
        seen[line] = true;
        out.push(line);
      }
      return out;
    }

    function utf8Bytes(str) {
      var bytes = 0;
      for (var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        if (code < 0x80) bytes += 1;
        else if (code < 0x800) bytes += 2;
        else if (code >= 0xD800 && code <= 0xDBFF) { bytes += 4; i++; }
        else bytes += 3;
      }
      return bytes;
    }

    /* --------------------------------------------------------------- build */

    function build(input) {
      var obj = { '@context': 'https://schema.org', '@type': input.type };
      var present = {};

      if (input.name !== '') { obj.name = input.name; present.name = true; }
      if (input.url !== '') { obj.url = input.url; present.url = true; }
      if (input.description !== '') { obj.description = input.description; present.description = true; }

      if (input.image !== '') {
        obj.image = input.image;
        present.image = true;
        // Organization calls it logo, the other types call it image. One field
        // satisfies either, so both names count as present.
        present.logo = true;
      }

      if (input.sameAs.length > 0) { obj.sameAs = input.sameAs; present.sameAs = true; }
      if (input.phone !== '') { obj.telephone = input.phone; present.telephone = true; }
      if (input.email !== '') { obj.email = input.email; present.email = true; }

      if (input.type === 'Product' && input.price !== '') {
        obj.offers = {
          '@type': 'Offer',
          price: input.price,
          priceCurrency: input.currency,
          availability: 'https://schema.org/' + input.availability
        };
        present.offers = true;
      }

      return { object: obj, present: present };
    }

    function propertyCount(obj) {
      var count = 0;
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && key.charAt(0) !== '@') count++;
      }
      return count;
    }

    function listLabels(names) {
      var labels = [];
      for (var i = 0; i < names.length; i++) labels.push(LABELS[names[i]] || names[i]);
      return labels.join(', ');
    }

    /* -------------------------------------------------------------- render */

    function tile(label, value, tone) {
      return '<div class="bg-gray-950 border border-gray-800 rounded-xl p-3">' +
        '<p class="text-[10px] uppercase tracking-wider text-gray-500 font-bold">' + escapeHtml(label) + '</p>' +
        '<p class="text-lg font-black ' + (tone || 'text-gray-100') + ' mt-1">' + escapeHtml(value) + '</p>' +
        '</div>';
    }

    function note(text, kind) {
      return '<p class="p-3 rounded-xl text-xs font-medium border ' + (STATUS[kind] || STATUS.info) + '">' +
        escapeHtml(text) + '</p>';
    }

    function render() {
      var type = typeEl.value || 'Organization';

      // Price, currency and availability only mean anything for a Product, and
      // an Offer without a price is worse than no Offer at all.
      if (productFields) {
        if (type === 'Product') {
          productFields.classList.remove('hidden');
          productFields.classList.add('grid');
        } else {
          productFields.classList.add('hidden');
          productFields.classList.remove('grid');
        }
      }

      var sameAs = lines(value(sameAsEl));

      var price = value(priceEl);
      var priceLooksWrong = price !== '' && !/^\d+(\.\d+)?$/.test(price);

      var input = {
        type: type,
        name: value(nameEl),
        url: value(urlEl),
        image: value(imageEl),
        description: value(descriptionEl),
        sameAs: sameAs,
        phone: value(phoneEl),
        email: value(emailEl),
        price: priceLooksWrong ? '' : price,
        currency: currencyEl ? currencyEl.value : 'USD',
        availability: availabilityEl ? availabilityEl.value : 'InStock'
      };

      var built = build(input);
      var json = JSON.stringify(built.object, null, 2);
      output.textContent = json;

      var notes = [];

      var required = REQUIRED[type] || [];
      var missingRequired = [];
      for (var r = 0; r < required.length; r++) {
        if (built.present[required[r]] !== true) missingRequired.push(required[r]);
      }

      if (missingRequired.length > 0) {
        notes.push(['Missing ' + (missingRequired.length === 1 ? 'a required property' : 'required properties') +
          ' for ' + type + ': ' + listLabels(missingRequired) +
          '. Google will not grant the rich result without ' + (missingRequired.length === 1 ? 'it' : 'them') +
          ', however valid the JSON is.', 'error']);
      }

      if (priceLooksWrong) {
        notes.push(['The price has to be digits only — 29 or 29.00, with no currency symbol. “' + price + '” was left out of the offers block rather than written into it, because a malformed price invalidates the whole offer.', 'warn']);
      }

      if (input.url !== '' && !isAbsoluteUrl(input.url)) {
        notes.push(['The URL is not absolute. Search engines need the full address including https://, or they cannot resolve what the markup refers to.', 'warn']);
      }

      var badSameAs = [];
      for (var s = 0; s < sameAs.length; s++) {
        if (!isAbsoluteUrl(sameAs[s])) badSameAs.push(sameAs[s]);
      }
      if (badSameAs.length > 0) {
        notes.push([badSameAs.length + ' same-as ' + (badSameAs.length === 1 ? 'entry is' : 'entries are') +
          ' not a full URL: “' + badSameAs.slice(0, 3).join('”, “') + '”. Profile links must be absolute addresses.', 'warn']);
      }

      var recommended = RECOMMENDED[type] || [];
      var missingRecommended = [];
      for (var m = 0; m < recommended.length; m++) {
        if (built.present[recommended[m]] !== true) missingRecommended.push(recommended[m]);
      }
      if (missingRecommended.length > 0) {
        notes.push(['Recommended for ' + type + ' but not set: ' + listLabels(missingRecommended) +
          '. The rich result can still be granted without ' + (missingRecommended.length === 1 ? 'it' : 'them') +
          ', but it will be a thinner one.', 'info']);
      }

      if ((type === 'Organization' || type === 'Person') && built.present.sameAs !== true) {
        notes.push(['No same-as links. They are how a search engine ties this page to the entity it already knows about — without them you are describing a new company or person with a familiar name.', 'info']);
      }

      notes.push(['Structured data is meant to describe what a visitor can already see. If anything above is not visible on the page, take it out: markup that describes hidden content is a guidelines violation, and Google issues manual actions for it rather than simply ignoring it.', 'info']);

      var properties = propertyCount(built.object);

      statsEl.innerHTML =
        tile('Properties', String(properties)) +
        tile('Required', required.length === 0 ? '—' : (required.length - missingRequired.length) + ' / ' + required.length,
          missingRequired.length > 0 ? 'text-amber-400' : 'text-emerald-400') +
        tile('Size', utf8Bytes(json) + ' B');

      var notesHtml = '';
      for (var n = 0; n < notes.length; n++) notesHtml += note(notes[n][0], notes[n][1]);
      warningsEl.innerHTML = notesHtml;

      results.classList.remove('hidden');

      var actions = root.querySelector('[data-ts-result-actions]');
      if (actions && window.ToolStack && window.ToolStack.reveal) {
        window.ToolStack.reveal(actions);
      }

      if (missingRequired.length > 0) {
        showStatus(type + ' markup built, but ' + listLabels(missingRequired) + ' is missing — the rich result will not be granted until it is set.', 'error');
      } else if (notes.length > 0 && (priceLooksWrong || badSameAs.length > 0)) {
        showStatus(type + ' markup built with ' + properties + ' properties. Read the notes before you paste it in.', 'warn');
      } else {
        showStatus(type + ' markup built: ' + properties + ' propert' + (properties === 1 ? 'y' : 'ies') + ', all required properties present.', 'ok');
      }
    }

    /* -------------------------------------------------------------- wiring */

    function copyText(text, done) {
      if (window.ToolStack && window.ToolStack.copyText) {
        window.ToolStack.copyText(text, done);
        return;
      }
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.top = '-1000px';
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (err) {
        ok = false;
      }
      document.body.removeChild(area);
      done(ok);
    }

    var copyBtn = $('scCopy');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var json = output.textContent;
        if (!json) {
          showStatus('Nothing to copy yet.', 'warn');
          return;
        }
        var original = copyBtn.textContent;
        copyText(json, function (ok) {
          copyBtn.textContent = ok ? '✅ Copied!' : 'Copy failed';
          window.setTimeout(function () { copyBtn.textContent = original; }, 2000);
          if (!ok) showStatus('Copy failed — select the JSON above and copy it manually.', 'error');
        });
      });
    }

    // A complete Organization: every property the form can emit actually set, so
    // the example shows the shape of the output rather than a half-filled one.
    var EXAMPLE = {
      type: 'Organization',
      name: 'ToolStack AI',
      url: 'https://toolstack.example/',
      image: 'https://toolstack.example/logo.png',
      description: 'Free browser-based tools for SEO, content and developer work.',
      sameAs: 'https://twitter.com/toolstackai\nhttps://www.linkedin.com/company/toolstackai\nhttps://github.com/toolstackai',
      phone: '',
      email: 'hello@toolstack.example',
      price: '',
      currency: 'USD',
      availability: 'InStock'
    };

    var exampleBtn = $('scExample');
    if (exampleBtn) {
      exampleBtn.addEventListener('click', function () {
        typeEl.value = EXAMPLE.type;
        nameEl.value = EXAMPLE.name;
        if (urlEl) urlEl.value = EXAMPLE.url;
        if (imageEl) imageEl.value = EXAMPLE.image;
        if (descriptionEl) descriptionEl.value = EXAMPLE.description;
        if (sameAsEl) sameAsEl.value = EXAMPLE.sameAs;
        if (phoneEl) phoneEl.value = EXAMPLE.phone;
        if (emailEl) emailEl.value = EXAMPLE.email;
        if (priceEl) priceEl.value = EXAMPLE.price;
        if (currencyEl) currencyEl.value = EXAMPLE.currency;
        if (availabilityEl) availabilityEl.value = EXAMPLE.availability;
        render();
        showStatus('Example loaded — a full Organization block, with the same-as links filled in.', 'info');
      });
    }

    var clearBtn = $('scClear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        typeEl.value = 'Organization';
        nameEl.value = '';
        if (urlEl) urlEl.value = '';
        if (imageEl) imageEl.value = '';
        if (descriptionEl) descriptionEl.value = '';
        if (sameAsEl) sameAsEl.value = '';
        if (phoneEl) phoneEl.value = '';
        if (emailEl) emailEl.value = '';
        if (priceEl) priceEl.value = '';
        if (currencyEl) currencyEl.value = 'USD';
        if (availabilityEl) availabilityEl.value = 'InStock';
        render();
        showStatus('Cleared. Pick a type and fill in the name to start again.', 'info');
      });
    }

    /* --------------------------------------------------------- live rebuild */

    var timer = null;
    function schedule() {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(render, 200);
    }

    var liveFields = [nameEl, urlEl, imageEl, descriptionEl, sameAsEl, phoneEl, emailEl, priceEl];
    for (var i = 0; i < liveFields.length; i++) {
      if (!liveFields[i]) continue;
      liveFields[i].addEventListener('input', schedule);
    }

    // The selectors change the property list, not just a value, so they re-render
    // immediately rather than through the typing debounce.
    var instantFields = [currencyEl, availabilityEl];
    for (var j = 0; j < instantFields.length; j++) {
      if (!instantFields[j]) continue;
      instantFields[j].addEventListener('change', render);
    }
    typeEl.addEventListener('change', render);

    render();

    return { render: render };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createSchemaGenerator = createSchemaGenerator;

})(window, document);

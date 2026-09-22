/**
 * ToolStack AI — Local Business Schema Generator engine.
 *
 * Ids required in tools/local-business-schema.html:
 *   lbType, lbName, lbUrl, lbImage, lbPhone, lbPriceRange, lbStreet, lbCity,
 *   lbRegion, lbPostal, lbCountry, lbLatitude, lbLongitude, lbHours, lbOutput,
 *   lbStats, lbWarnings, lbResults, lbCopy, lbExample, lbClear, lbStatus
 *
 * Deliberate choices:
 *
 * 1. The address is emitted as a PostalAddress object, never as one string.
 *    A single-line address is the most common mistake in hand-written local
 *    markup: schema.org has a property for each part, and a crawler reading
 *    streetAddress: "14 Broad Street, Bristol, BS1 1AA" gets one useless field.
 *
 * 2. Coordinates are range-checked rather than merely parsed. 51.4545 is a
 *    latitude; 151.4545 is not, and a typo of that kind puts the business in
 *    the sea without producing any error anywhere.
 *
 * 3. Opening hours lines that do not parse are dropped and reported, not
 *    emitted. An unparseable hours string is not a lesser version of the
 *    information — it is a string nothing will ever read.
 *
 * What the notes keep saying, because it is the thing people get wrong: this
 * markup does not create, claim or influence a Google Business Profile. It
 * describes the page. The value is that the details agree with the profile.
 */
(function (window, document) {
  'use strict';

  function createLocalBusinessSchema(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var typeEl = $('lbType');
    var nameEl = $('lbName');
    var urlEl = $('lbUrl');
    var imageEl = $('lbImage');
    var phoneEl = $('lbPhone');
    var priceRangeEl = $('lbPriceRange');
    var streetEl = $('lbStreet');
    var cityEl = $('lbCity');
    var regionEl = $('lbRegion');
    var postalEl = $('lbPostal');
    var countryEl = $('lbCountry');
    var latitudeEl = $('lbLatitude');
    var longitudeEl = $('lbLongitude');
    var hoursEl = $('lbHours');
    var output = $('lbOutput');
    var statsEl = $('lbStats');
    var warningsEl = $('lbWarnings');
    var results = $('lbResults');
    var statusEl = $('lbStatus');

    if (!typeEl || !nameEl || !output || !results) return null;

    // Mo-Fr 09:00-17:00, Mo,We,Fr 09:00-17:00, Sa 10:00-14:00. Day codes,
    // optional ranges, optional comma-separated groups, 24-hour times.
    var HOURS_RE = /^[A-Za-z]{2}(-[A-Za-z]{2})?(,\s*[A-Za-z]{2}(-[A-Za-z]{2})?)*\s+\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/;

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

    /** A decimal number, or null if the box is empty or not a number. */
    function number(text) {
      if (text === '') return null;
      if (!/^-?\d+(\.\d+)?$/.test(text)) return null;
      var parsed = parseFloat(text);
      return isNaN(parsed) ? null : parsed;
    }

    /**
     * Split the hours box into the lines that parse and the lines that do not.
     * Duplicates collapse, because two identical rules are one rule.
     */
    function parseHours(text) {
      var raw = String(text || '').split(/\r?\n/);
      var valid = [];
      var invalid = [];
      var seen = {};

      for (var i = 0; i < raw.length; i++) {
        var line = raw[i].replace(/^\s+|\s+$/g, '');
        if (line === '') continue;

        if (!HOURS_RE.test(line)) {
          invalid.push(line);
          continue;
        }
        if (seen[line] === true) continue;
        seen[line] = true;
        valid.push(line);
      }

      return { valid: valid, invalid: invalid };
    }

    /* --------------------------------------------------------------- build */

    function build(input) {
      var obj = { '@context': 'https://schema.org', '@type': input.type };

      if (input.name !== '') obj.name = input.name;
      if (input.url !== '') obj.url = input.url;
      if (input.image !== '') obj.image = input.image;
      if (input.telephone !== '') obj.telephone = input.telephone;
      if (input.priceRange !== '') obj.priceRange = input.priceRange;

      var address = { '@type': 'PostalAddress' };
      var addressFields = 0;
      if (input.street !== '') { address.streetAddress = input.street; addressFields++; }
      if (input.city !== '') { address.addressLocality = input.city; addressFields++; }
      if (input.region !== '') { address.addressRegion = input.region; addressFields++; }
      if (input.postal !== '') { address.postalCode = input.postal; addressFields++; }
      if (input.country !== '') { address.addressCountry = input.country; addressFields++; }

      // Only worth emitting if there is something in it. An empty PostalAddress
      // is a claim that the business has no address.
      if (addressFields > 0) obj.address = address;

      // GeoCoordinates needs both parts. One alone is not a location.
      if (input.latitude !== null && input.longitude !== null) {
        obj.geo = {
          '@type': 'GeoCoordinates',
          latitude: input.latitude,
          longitude: input.longitude
        };
      }

      if (input.hours.length > 0) obj.openingHours = input.hours;

      return { object: obj, addressFields: addressFields };
    }

    function propertyCount(obj) {
      var count = 0;
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && key.charAt(0) !== '@') count++;
      }
      return count;
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
      var type = typeEl.value || 'LocalBusiness';
      var hoursText = hoursEl ? hoursEl.value : '';
      var parsedHours = parseHours(hoursText);

      var rawLatitude = value(latitudeEl);
      var rawLongitude = value(longitudeEl);
      var latitude = number(rawLatitude);
      var longitude = number(rawLongitude);

      var input = {
        type: type,
        name: value(nameEl),
        url: value(urlEl),
        image: value(imageEl),
        telephone: value(phoneEl),
        priceRange: value(priceRangeEl),
        street: value(streetEl),
        city: value(cityEl),
        region: value(regionEl),
        postal: value(postalEl),
        country: value(countryEl),
        latitude: latitude,
        longitude: longitude,
        hours: parsedHours.valid
      };

      var built = build(input);
      var json = JSON.stringify(built.object, null, 2);
      output.textContent = json;

      var notes = [];

      if (input.name === '') {
        notes.push(['No business name. Google requires a name for LocalBusiness markup, and it has to be the name the business actually trades under — not the site name if the two differ.', 'error']);
      }

      if (built.addressFields === 0) {
        notes.push(['No address at all. For a business with premises the address is required, and its absence is the difference between markup that describes a location and markup that describes a name.', 'error']);
      } else {
        if (input.street === '') {
          notes.push(['No street address. The address block was built from the other fields, but streetAddress is the part a map has to match — without it the address is a city, not a place.', 'warn']);
        }
        if (input.city === '') {
          notes.push(['No city. addressLocality is the field most local systems match on, so an address without one is unlikely to resolve to anything.', 'warn']);
        }
        if (input.country === '') {
          notes.push(['No country code. addressCountry expects the two-letter ISO code — GB, US, NG — and a country name in a different form is often not matched.', 'warn']);
        }
      }

      if (input.telephone === '') {
        notes.push(['No telephone number. It is recommended rather than required, but a local business without one is missing the detail people look for most.', 'info']);
      } else if (!/^\+/.test(input.telephone)) {
        notes.push(['The telephone number has no country code. Write it in international format — +1 555 0100, +44 117 496 0000 — so it means the same thing to a reader in another country.', 'info']);
      }

      // Latitude and longitude, checked for presence first and range second.
      if ((rawLatitude !== '' || rawLongitude !== '') && (latitude === null || longitude === null)) {
        if (rawLatitude !== '' && latitude === null) {
          notes.push(['The latitude is not a number: “' + rawLatitude + '”. Decimal degrees with a dot, and a minus sign for south.', 'error']);
        }
        if (rawLongitude !== '' && longitude === null) {
          notes.push(['The longitude is not a number: “' + rawLongitude + '”. Decimal degrees with a dot, and a minus sign for west.', 'error']);
        }
        if (latitude === null && longitude === null && rawLatitude !== '' && rawLongitude !== '') {
          notes.push(['Neither coordinate could be read, so the geo block was left out entirely rather than filled with a guess.', 'warn']);
        }
      } else if (latitude === null || longitude === null) {
        notes.push(['No coordinates. They are recommended for a physical location, and they are what ties the page to a point on a map — worth adding from the Google Maps right-click menu.', 'info']);
      } else {
        if (latitude < -90 || latitude > 90) {
          notes.push(['The latitude ' + latitude + ' is outside the range a map can hold, which runs from -90 to 90. This is usually two coordinates in the wrong boxes, or a longitude typed into the latitude field.', 'error']);
        }
        if (longitude < -180 || longitude > 180) {
          notes.push(['The longitude ' + longitude + ' is outside the range a map can hold, which runs from -180 to 180.', 'error']);
        }
        if (latitude === 0 && longitude === 0) {
          notes.push(['0, 0 is a point in the Atlantic Ocean, and it is what a form produces when nothing was filled in. Check both fields before publishing.', 'warn']);
        }
      }

      if (parsedHours.invalid.length > 0) {
        notes.push([parsedHours.invalid.length + ' opening hours ' + (parsedHours.invalid.length === 1 ? 'line was' : 'lines were') +
          ' left out because nothing would read ' + (parsedHours.invalid.length === 1 ? 'it' : 'them') + ': “' +
          parsedHours.invalid.slice(0, 3).join('”, “') +
          '”. The format is Mo-Fr 09:00-17:00 — two-letter day codes, a hyphen between days, 24-hour times.', 'warn']);
      } else if (built.object.openingHours === undefined) {
        notes.push(['No opening hours. For a shop, restaurant or clinic these are the details people search for, and stating them here keeps them with the page rather than only on the profile.', 'info']);
      }

      if (input.priceRange !== '') {
        if (input.priceRange.length > 12) {
          notes.push(['The price range reads as a sentence. The convention is a short symbol or word or two — $, $$, “moderate” — and a long description is not what the property is for.', 'info']);
        }
      }

      var badUrls = [];
      if (input.url !== '' && !isAbsoluteUrl(input.url)) badUrls.push(['website', input.url]);
      if (input.image !== '' && !isAbsoluteUrl(input.image)) badUrls.push(['image', input.image]);
      for (var b = 0; b < badUrls.length; b++) {
        notes.push(['The ' + badUrls[b][0] + ' is not an absolute URL: “' + badUrls[b][1] +
          '”. A crawler cannot resolve a relative path.', 'warn']);
      }

      notes.push(['The name, address and phone here have to match your Google Business Profile exactly — same spelling, same postcode format, same phone number. This markup does not create, claim or influence that listing; what it does is make the details agree, and disagreement between the two is the thing that costs you.', 'info']);

      notes.push(['One block per location, on that location\'s page. A LocalBusiness describes a place, so a single block listing several addresses describes nothing a crawler can use.', 'info']);

      var properties = propertyCount(built.object);

      statsEl.innerHTML =
        tile('Properties', String(properties)) +
        tile('Address fields', built.addressFields + ' / 5',
          built.addressFields >= 4 ? 'text-emerald-400' : (built.addressFields === 0 ? 'text-rose-400' : 'text-amber-400')) +
        tile('Size', utf8Bytes(json) + ' B');

      var notesHtml = '';
      for (var n = 0; n < notes.length; n++) notesHtml += note(notes[n][0], notes[n][1]);
      warningsEl.innerHTML = notesHtml;

      results.classList.remove('hidden');

      var actions = root.querySelector('[data-ts-result-actions]');
      if (actions && window.ToolStack && window.ToolStack.reveal) {
        window.ToolStack.reveal(actions);
      }

      var outOfRange = (latitude !== null && (latitude < -90 || latitude > 90)) ||
        (longitude !== null && (longitude < -180 || longitude > 180));
      var unreadable = (rawLatitude !== '' && latitude === null) || (rawLongitude !== '' && longitude === null);

      if (input.name === '' || built.addressFields === 0) {
        showStatus(input.name === ''
          ? 'No business name yet — it is required for LocalBusiness markup.'
          : 'No address yet — a local business without one cannot be matched to a place.', 'error');
      } else if (outOfRange || unreadable) {
        showStatus('Coordinates that could not be placed on a map. Fix those first — everything else in this block is sound.', 'error');
      } else if (parsedHours.invalid.length > 0) {
        showStatus('Markup built with ' + parsedHours.valid.length + ' opening hours ' +
          (parsedHours.valid.length === 1 ? 'rule' : 'rules') + ' — read the notes before you paste it in.', 'warn');
      } else {
        showStatus(type + ' built: ' + properties + ' properties, ' + built.addressFields +
          ' of 5 address fields, ' + parsedHours.valid.length + ' opening hours ' +
          (parsedHours.valid.length === 1 ? 'rule' : 'rules') + '.', 'ok');
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

    var copyBtn = $('lbCopy');
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

    // A complete single-location business: every field the form can emit is
    // set, so the example is the shape of a finished block rather than a
    // partly-filled one.
    var EXAMPLE = {
      type: 'LocalBusiness',
      name: 'Okafor & Sons Bakery',
      url: 'https://okafarandsons.example/',
      image: 'https://okafarandsons.example/img/shopfront.jpg',
      telephone: '+44 117 496 0000',
      priceRange: '$$',
      street: '14 Broad Street',
      city: 'Bristol',
      region: 'England',
      postal: 'BS1 1AA',
      country: 'GB',
      latitude: '51.4545',
      longitude: '-2.5879',
      hours: 'Mo-Fr 07:30-17:00\nSa 08:00-14:00'
    };

    var exampleBtn = $('lbExample');
    if (exampleBtn) {
      exampleBtn.addEventListener('click', function () {
        typeEl.value = EXAMPLE.type;
        nameEl.value = EXAMPLE.name;
        if (urlEl) urlEl.value = EXAMPLE.url;
        if (imageEl) imageEl.value = EXAMPLE.image;
        if (phoneEl) phoneEl.value = EXAMPLE.telephone;
        if (priceRangeEl) priceRangeEl.value = EXAMPLE.priceRange;
        if (streetEl) streetEl.value = EXAMPLE.street;
        if (cityEl) cityEl.value = EXAMPLE.city;
        if (regionEl) regionEl.value = EXAMPLE.region;
        if (postalEl) postalEl.value = EXAMPLE.postal;
        if (countryEl) countryEl.value = EXAMPLE.country;
        if (latitudeEl) latitudeEl.value = EXAMPLE.latitude;
        if (longitudeEl) longitudeEl.value = EXAMPLE.longitude;
        if (hoursEl) hoursEl.value = EXAMPLE.hours;
        render();
        showStatus('Example loaded — a single-location bakery with a full address, coordinates and two opening hours rules.', 'info');
      });
    }

    var clearBtn = $('lbClear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        typeEl.value = 'LocalBusiness';
        nameEl.value = '';
        if (urlEl) urlEl.value = '';
        if (imageEl) imageEl.value = '';
        if (phoneEl) phoneEl.value = '';
        if (priceRangeEl) priceRangeEl.value = '';
        if (streetEl) streetEl.value = '';
        if (cityEl) cityEl.value = '';
        if (regionEl) regionEl.value = '';
        if (postalEl) postalEl.value = '';
        if (countryEl) countryEl.value = '';
        if (latitudeEl) latitudeEl.value = '';
        if (longitudeEl) longitudeEl.value = '';
        if (hoursEl) hoursEl.value = '';
        render();
        showStatus('Cleared. Start with the name, address and phone from your business profile.', 'info');
      });
    }

    /* --------------------------------------------------------- live rebuild */

    var timer = null;
    function schedule() {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(render, 200);
    }

    var liveFields = [nameEl, urlEl, imageEl, phoneEl, priceRangeEl, streetEl, cityEl,
      regionEl, postalEl, countryEl, latitudeEl, longitudeEl, hoursEl];
    for (var i = 0; i < liveFields.length; i++) {
      if (!liveFields[i]) continue;
      liveFields[i].addEventListener('input', schedule);
    }

    typeEl.addEventListener('change', render);

    render();

    return { render: render };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createLocalBusinessSchema = createLocalBusinessSchema;

})(window, document);

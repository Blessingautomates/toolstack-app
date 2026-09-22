/**
 * ToolStack AI — Article Schema Generator engine.
 *
 * Ids required in tools/article-schema-generator.html:
 *   arType, arHeadline, arDescription, arUrl, arImage, arAuthorName, arAuthorUrl,
 *   arPublisherName, arPublisherLogo, arDatePublished, arDateModified, arSection,
 *   arKeywords, arOutput, arStats, arWarnings, arResults, arCopy, arExample,
 *   arClear, arStatus
 *
 * Deliberate choices:
 *
 * 1. Nothing is marked "required" and everything is marked "expected", because
 *    that is the truth: the schema.org specification requires none of these
 *    properties, and Google will not grant the article treatment without five
 *    of them. Calling the five "required" would be inaccurate; calling them
 *    "recommended" would let people skip them and wonder why nothing happens.
 *
 * 2. The 110-character headline limit is enforced as a warning rather than a
 *    silent truncation. The headline in the markup has to be the visible H1, so
 *    shortening it here would break the one rule that matters in order to
 *    satisfy a guideline about display.
 *
 * 3. Dates are compared as strings. A date input produces YYYY-MM-DD, which
 *    sorts correctly as text, so no parsing and no timezone surprises.
 *
 * 4. The output is a bare JSON object, with no script wrapper — the same choice
 *    every schema tool here makes. The page says what to wrap it in.
 */
(function (window, document) {
  'use strict';

  function createArticleSchemaGenerator(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var typeEl = $('arType');
    var headlineEl = $('arHeadline');
    var descriptionEl = $('arDescription');
    var urlEl = $('arUrl');
    var imageEl = $('arImage');
    var authorNameEl = $('arAuthorName');
    var authorUrlEl = $('arAuthorUrl');
    var publisherNameEl = $('arPublisherName');
    var publisherLogoEl = $('arPublisherLogo');
    var publishedEl = $('arDatePublished');
    var modifiedEl = $('arDateModified');
    var sectionEl = $('arSection');
    var keywordsEl = $('arKeywords');
    var output = $('arOutput');
    var statsEl = $('arStats');
    var warningsEl = $('arWarnings');
    var results = $('arResults');
    var statusEl = $('arStatus');

    if (!typeEl || !headlineEl || !output || !results) return null;

    // Google truncates the headline in the article treatment past this, and
    // says so in its own documentation.
    var HEADLINE_MAX = 110;

    // The properties the article treatment needs. Not one of them is required
    // by schema.org, which is why they are described as expected rather than
    // required — but leave one out and the markup is inert.
    var EXPECTED = ['headline', 'image', 'datePublished', 'author', 'publisher'];

    var LABELS = {
      headline: 'headline',
      image: 'main image',
      datePublished: 'date published',
      author: 'author',
      publisher: 'publisher'
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

    /** A comma-separated box into the array of strings schema.org expects. */
    function splitList(text) {
      var parts = String(text || '').split(',');
      var out = [];
      for (var i = 0; i < parts.length; i++) {
        var item = parts[i].replace(/^\s+|\s+$/g, '');
        if (item !== '') out.push(item);
      }
      return out;
    }

    /* --------------------------------------------------------------- build */

    function build(input) {
      var obj = { '@context': 'https://schema.org', '@type': input.type };
      var present = {};

      if (input.headline !== '') { obj.headline = input.headline; present.headline = true; }
      if (input.description !== '') { obj.description = input.description; }
      if (input.image !== '') { obj.image = input.image; present.image = true; }

      if (input.published !== '') { obj.datePublished = input.published; present.datePublished = true; }
      if (input.modified !== '') { obj.dateModified = input.modified; present.dateModified = true; }

      if (input.authorName !== '') {
        var author = { '@type': 'Person', name: input.authorName };
        if (input.authorUrl !== '') author.url = input.authorUrl;
        obj.author = author;
        present.author = true;
      }

      if (input.publisherName !== '') {
        var publisher = { '@type': 'Organization', name: input.publisherName };
        if (input.publisherLogo !== '') {
          publisher.logo = { '@type': 'ImageObject', url: input.publisherLogo };
        }
        obj.publisher = publisher;
        present.publisher = true;
      }

      if (input.url !== '') {
        // Both, because the two are read by different consumers: url is the
        // article's own address, mainEntityOfPage is the page it describes.
        obj.mainEntityOfPage = { '@type': 'WebPage', '@id': input.url };
        obj.url = input.url;
      }

      if (input.section !== '') { obj.articleSection = input.section; }
      if (input.keywords.length > 0) { obj.keywords = input.keywords.join(', '); }

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
      var type = typeEl.value || 'BlogPosting';

      var input = {
        type: type,
        headline: value(headlineEl),
        description: value(descriptionEl),
        image: value(imageEl),
        url: value(urlEl),
        authorName: value(authorNameEl),
        authorUrl: value(authorUrlEl),
        publisherName: value(publisherNameEl),
        publisherLogo: value(publisherLogoEl),
        published: value(publishedEl),
        modified: value(modifiedEl),
        section: value(sectionEl),
        keywords: splitList(value(keywordsEl))
      };

      var built = build(input);
      var json = JSON.stringify(built.object, null, 2);
      output.textContent = json;

      var notes = [];

      var missing = [];
      for (var e = 0; e < EXPECTED.length; e++) {
        if (built.present[EXPECTED[e]] !== true) missing.push(EXPECTED[e]);
      }
      if (missing.length > 0) {
        notes.push(['Not set: ' + listLabels(missing) + '. None of these is required by schema.org, ' +
          'but Google will not show the article treatment without ' + (missing.length === 1 ? 'this one' : 'all of these') +
          '. The markup is still valid and still parsed without ' + (missing.length === 1 ? 'it' : 'them') + '.', 'warn']);
      }

      // Google's own recommendation, and the point at which it truncates.
      if (input.headline !== '' && input.headline.length > HEADLINE_MAX) {
        notes.push(['The headline is ' + input.headline.length + ' characters. Google recommends ' +
          HEADLINE_MAX + ' or fewer and truncates past that in the article treatment. Trim the visible ' +
          'heading and this field together rather than trimming one of them.', 'warn']);
      }

      // Copying the <title> instead of the <h1> is the single most common
      // mistake here, and it looks correct until the headline is compared.
      if (input.headline.indexOf(' | ') !== -1 || input.headline.indexOf(' - ') !== -1) {
        notes.push(['The headline contains a " | " or " - " separator. If you copied this from the ' +
          'browser tab title, it probably includes the site name — the headline property has to be the ' +
          'visible heading of the article, without the branding suffix.', 'warn']);
      }

      if (input.published !== '' && input.modified !== '' && input.modified < input.published) {
        notes.push(['The modified date is earlier than the published date. A page cannot have been ' +
          'changed before it existed, and a pair of dates that contradicts itself is worse than ' +
          'omitting the modified date.', 'error']);
      }

      if (input.modified === '' && input.published !== '') {
        notes.push(['No modified date. Google falls back to the published date, which is fine for a ' +
          'page that has not been touched — but if you do revise the article, letting it say so is ' +
          'the point of the property.', 'info']);
      }

      if (input.modified !== '' && input.modified === input.published) {
        notes.push(['The two dates match, which is correct for an article that has never been edited. ' +
          'It becomes a problem only if it stays that way after a revision.', 'info']);
      }

      // Dates in the future are almost always a CMS timezone problem.
      var today = new Date();
      var todayKey = today.getFullYear() + '-' +
        (today.getMonth() + 1 < 10 ? '0' : '') + (today.getMonth() + 1) + '-' +
        (today.getDate() < 10 ? '0' : '') + today.getDate();
      if (input.published !== '' && input.published > todayKey) {
        notes.push(['The published date is in the future. Google may treat that as an error, and it is ' +
          'usually a timezone setting in the CMS rather than a deliberate schedule — check before you ship it.', 'warn']);
      }

      var badUrls = [];
      if (input.image !== '' && !isAbsoluteUrl(input.image)) badUrls.push(['main image', input.image]);
      if (input.publisherLogo !== '' && !isAbsoluteUrl(input.publisherLogo)) badUrls.push(['publisher logo', input.publisherLogo]);
      if (input.authorUrl !== '' && !isAbsoluteUrl(input.authorUrl)) badUrls.push(['author page', input.authorUrl]);
      if (input.url !== '' && !isAbsoluteUrl(input.url)) badUrls.push(['article URL', input.url]);

      for (var b = 0; b < badUrls.length; b++) {
        notes.push(['The ' + badUrls[b][0] + ' is not an absolute URL: “' + badUrls[b][1] +
          '”. A crawler cannot resolve a relative path, so it is written into the markup but never followed.', 'warn']);
      }

      if (input.publisherName !== '' && input.publisherLogo === '') {
        notes.push(['No publisher logo. The treatment uses it, and an organisation without one is ' +
          'harder to attribute — point it at a square logo at least 112 pixels wide.', 'info']);
      }

      if (input.description.length > 200) {
        notes.push(['The description is ' + input.description.length + ' characters. There is no limit, ' +
          'but a sentence is more useful here than a paragraph — this is not the meta description and ' +
          'it does not have to match it.', 'info']);
      }

      notes.push(['The headline has to be the same as the visible heading of the page, word for word. ' +
        'Google compares the two, and markup that describes a headline a visitor cannot see is treated ' +
        'as spam rather than ignored.', 'info']);

      notes.push(['A date with no time is accepted as-is. If you do add a time, include the timezone ' +
        'offset — a local time with no offset is the one date format that reliably causes problems.', 'info']);

      var properties = propertyCount(built.object);

      statsEl.innerHTML =
        tile('Properties', String(properties)) +
        tile('Expected', (EXPECTED.length - missing.length) + ' / ' + EXPECTED.length,
          missing.length > 0 ? 'text-amber-400' : 'text-emerald-400') +
        tile('Size', utf8Bytes(json) + ' B');

      var notesHtml = '';
      for (var n = 0; n < notes.length; n++) notesHtml += note(notes[n][0], notes[n][1]);
      warningsEl.innerHTML = notesHtml;

      results.classList.remove('hidden');

      var actions = root.querySelector('[data-ts-result-actions]');
      if (actions && window.ToolStack && window.ToolStack.reveal) {
        window.ToolStack.reveal(actions);
      }

      var dateProblem = (input.published !== '' && input.modified !== '' && input.modified < input.published);

      if (input.headline === '') {
        showStatus('No headline yet — it is the one value the article treatment cannot do without, and it has to match the visible H1.', 'error');
      } else if (missing.length > 0) {
        showStatus(type + ' built for “' + input.headline + '”, but ' + listLabels(missing) +
          ' is not set — the article treatment will not be granted without ' +
          (missing.length === 1 ? 'it' : 'them') + '.', 'warn');
      } else if (dateProblem || badUrls.length > 0) {
        showStatus(type + ' built with ' + properties + ' properties. Read the notes before you paste it in.', 'warn');
      } else {
        showStatus(type + ' built: ' + properties + ' properties, every property the article treatment needs.', 'ok');
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

    var copyBtn = $('arCopy');
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

    // Every field the form can emit is set, so the example shows the full
    // shape of the output rather than a partly-filled one.
    var EXAMPLE = {
      type: 'BlogPosting',
      headline: 'How to write a meta description that gets clicks',
      description: 'Why most meta descriptions are ignored, and the three things the ones that work have in common.',
      url: 'https://example.com/blog/meta-descriptions',
      image: 'https://example.com/img/meta-descriptions.jpg',
      authorName: 'Ada Okafor',
      authorUrl: 'https://example.com/authors/ada-okafor',
      publisherName: 'Example Media',
      publisherLogo: 'https://example.com/img/logo.png',
      published: '2026-03-04',
      modified: '2026-06-18',
      section: 'SEO',
      keywords: 'meta descriptions, click-through rate, SERP'
    };

    var exampleBtn = $('arExample');
    if (exampleBtn) {
      exampleBtn.addEventListener('click', function () {
        typeEl.value = EXAMPLE.type;
        headlineEl.value = EXAMPLE.headline;
        if (descriptionEl) descriptionEl.value = EXAMPLE.description;
        if (urlEl) urlEl.value = EXAMPLE.url;
        if (imageEl) imageEl.value = EXAMPLE.image;
        if (authorNameEl) authorNameEl.value = EXAMPLE.authorName;
        if (authorUrlEl) authorUrlEl.value = EXAMPLE.authorUrl;
        if (publisherNameEl) publisherNameEl.value = EXAMPLE.publisherName;
        if (publisherLogoEl) publisherLogoEl.value = EXAMPLE.publisherLogo;
        if (publishedEl) publishedEl.value = EXAMPLE.published;
        if (modifiedEl) modifiedEl.value = EXAMPLE.modified;
        if (sectionEl) sectionEl.value = EXAMPLE.section;
        if (keywordsEl) keywordsEl.value = EXAMPLE.keywords;
        render();
        showStatus('Example loaded — a blog post with every property set, including a later modified date.', 'info');
      });
    }

    var clearBtn = $('arClear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        typeEl.value = 'BlogPosting';
        headlineEl.value = '';
        if (descriptionEl) descriptionEl.value = '';
        if (urlEl) urlEl.value = '';
        if (imageEl) imageEl.value = '';
        if (authorNameEl) authorNameEl.value = '';
        if (authorUrlEl) authorUrlEl.value = '';
        if (publisherNameEl) publisherNameEl.value = '';
        if (publisherLogoEl) publisherLogoEl.value = '';
        if (publishedEl) publishedEl.value = '';
        if (modifiedEl) modifiedEl.value = '';
        if (sectionEl) sectionEl.value = '';
        if (keywordsEl) keywordsEl.value = '';
        render();
        showStatus('Cleared. Start with the headline, copied from the page\'s H1.', 'info');
      });
    }

    /* --------------------------------------------------------- live rebuild */

    var timer = null;
    function schedule() {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(render, 200);
    }

    var liveFields = [headlineEl, descriptionEl, urlEl, imageEl, authorNameEl, authorUrlEl,
      publisherNameEl, publisherLogoEl, publishedEl, modifiedEl, sectionEl, keywordsEl];
    for (var i = 0; i < liveFields.length; i++) {
      if (!liveFields[i]) continue;
      liveFields[i].addEventListener('input', schedule);
      liveFields[i].addEventListener('change', schedule);
    }

    // The type is a structural choice, not a value, so it re-renders at once.
    typeEl.addEventListener('change', render);

    render();

    return { render: render };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createArticleSchemaGenerator = createArticleSchemaGenerator;

})(window, document);

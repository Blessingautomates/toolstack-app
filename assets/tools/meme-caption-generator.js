/**
 * ToolStack AI — Meme Caption Generator engine.
 *
 * Ids required in tools/meme-caption-generator.html:
 *   memStatus, memTone, memDrawBtn, memClearBtn, memCopyBtn, memResults,
 *   memFormat, memTop, memBottom, memBadge, memMeta
 *
 * Produces a three-part meme in words: a described image, a top line and a
 * bottom line. Text only, deliberately — this tool cannot make an image, it
 * cannot find one, and it does not claim to. What it produces is the caption
 * set and a clear description of the picture, which is what you actually paste
 * into whatever you use to make the meme.
 *
 * Three independent bags — the image description is drawn from a tone-agnostic
 * pool while the two lines are drawn from tone-specific pools — so the picture
 * and the words are not matched to each other. That mismatch is usually the
 * funny part, and matching them would produce something far more sensible and
 * far less useful.
 *
 * Nothing here references a real person, a real brand or a real event. Meme
 * humour that names somebody is a different thing with a different set of
 * problems, and this tool does not do it.
 */
(function (window, document) {
  'use strict';

  var FORMATS = [
    'A dog sitting calmly at a table while the kitchen burns behind it',
    'Two identical spiders pointing at each other',
    'A cat that has just knocked a glass off the table, watching it fall',
    'Somebody standing in a doorway holding two cups of tea, saying nothing',
    'A person in a meeting nodding while clearly thinking about lunch',
    'A pigeon walking with tremendous confidence',
    'An empty fridge with the light on',
    'A person holding a phone at arm’s length, squinting at it',
    'A small dog in a very large jumper',
    'A houseplant that has been watered exactly once',
    'Someone mid-sentence with a finger raised, having forgotten the point',
    'A car with one headlight out, parked immaculately',
    'Three people all looking at the same laptop',
    'A person on hold with the phone pressed to their ear, staring into the middle distance',
    'A cat sitting directly on a keyboard',
    'Somebody opening the fridge for the fourth time in ten minutes',
    'A person at a party holding a drink they have not touched all evening',
    'Two people saying goodbye to each other for the eleventh time',
    'A dog waiting by the front door three hours early',
    'A person reading a menu they have read many times before',
    'Someone who has just remembered something at two in the morning',
    'A chair with a pile of clothes on it',
    'A person at the gym sitting on a machine, on their phone',
    'A plant leaning at a steep angle towards a window'
  ];

  var TONES = {
    classic: {
      label: 'Classic',
      tops: ['nobody:', 'me explaining:', 'my brain at 3am:', 'me:', 'everyone else:', 'the instructions:', 'me pretending to understand:'],
      bottoms: ['absolutely not', 'this is fine', 'i have made a terrible mistake', 'it is what it is', 'and i took that personally', 'we move', 'no thoughts', 'a decision was made']
    },
    wholesome: {
      label: 'Wholesome',
      tops: ['me:', 'my friend:', 'the dog:', 'us:', 'a small thing:'],
      bottoms: ['and that was enough', 'genuinely made my week', 'i will remember this forever', 'we are doing our best', 'and that is allowed', 'good. just good.']
    },
    chaotic: {
      label: 'Chaotic',
      tops: ['me at 2am:', 'my plan:', 'the situation:', 'my brain:', 'me, five minutes ago:'],
      bottoms: ['unstoppable', 'there was no plan', 'i have made it everyone’s problem', 'we go again', 'this is a threat', 'unhinged behaviour', 'and i regret nothing']
    },
    work: {
      label: 'Work',
      tops: ['this meeting:', 'the brief:', 'my calendar:', 'the client:', 'my inbox:'],
      bottoms: ['could have been an email', 'circling back', 'let us take this offline', 'per my last message', 'aligned', 'we will pick it up next week', 'adding it to the backlog']
    },
    relatable: {
      label: 'Relatable',
      tops: ['me:', 'every single time:', 'nobody asked but:', 'me, immediately:'],
      bottoms: ['why am i like this', 'i will not be elaborating', 'every time. without fail.', 'i stand by it', 'and i would do it again', 'no notes']
    }
  };

  function createMemeCaption(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var toneEl = $('memTone');
    var formatEl = $('memFormat');
    var topEl = $('memTop');
    var bottomEl = $('memBottom');
    var badgeEl = $('memBadge');
    var metaEl = $('memMeta');
    var resultsEl = $('memResults');
    var statusEl = $('memStatus');

    if (!formatEl || !topEl || !bottomEl) return null;

    var status = fun.makeStatus(statusEl);

    function tone() {
      var value = toneEl ? toneEl.value : 'classic';
      return TONES[value] ? value : 'classic';
    }

    /* The image pool has no tone, so its bag needs no signature. The two line
     * pools do. */
    var formatBag = fun.makeBag(function () { return FORMATS; }, null);
    var topBag = fun.makeBag(function () { return TONES[tone()].tops; }, tone);
    var bottomBag = fun.makeBag(function () { return TONES[tone()].bottoms; }, tone);

    function draw() {
      var set = TONES[tone()];
      var format = formatBag.draw();
      var top = topBag.draw();
      var bottom = bottomBag.draw();

      if (!format || !top || !bottom) {
        status.show('Nothing to draw from that tone. Try another one.', 'warn');
        return;
      }

      if (resultsEl) resultsEl.classList.remove('hidden');
      formatEl.textContent = format;
      topEl.textContent = top;
      bottomEl.textContent = bottom;
      if (badgeEl) badgeEl.textContent = set.label;
      if (metaEl) {
        metaEl.textContent = 'The picture is drawn from its own pool, so the image and the words are not matched to each other on purpose.';
      }

      status.hide();
    }

    var drawBtn = $('memDrawBtn');
    var clearBtn = $('memClearBtn');
    var copyBtn = $('memCopyBtn');

    if (drawBtn) drawBtn.addEventListener('click', draw);

    if (toneEl) {
      toneEl.addEventListener('change', function () {
        status.show('Tone set. Draw for a new caption.', 'info');
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        formatBag.reset();
        topBag.reset();
        bottomBag.reset();
        if (resultsEl) resultsEl.classList.add('hidden');
        formatEl.textContent = '';
        topEl.textContent = '';
        bottomEl.textContent = '';
        if (badgeEl) badgeEl.textContent = '';
        if (metaEl) metaEl.textContent = '';
        status.show('Cleared.', 'info');
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!formatEl.textContent) {
          status.show('Draw a caption set first.', 'warn');
          return;
        }
        fun.copy(
          'Top: ' + topEl.textContent +
          '\nBottom: ' + bottomEl.textContent +
          '\n\nPicture: ' + formatEl.textContent +
          '\n\n(Paste the lines into your meme maker; the picture line is a description, not an image.)',
          status
        );
      });
    }

    status.show('A described picture and two lines of text. This tool does not make the image — it makes the words for it.', 'info');

    return { draw: draw };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createMemeCaption = createMemeCaption;
})(window, document);

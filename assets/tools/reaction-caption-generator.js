/**
 * ToolStack AI — Reaction Caption Generator engine.
 *
 * Ids required in tools/reaction-caption-generator.html:
 *   reaStatus, reaTone, reaDrawBtn, reaClearBtn, reaCopyBtn, reaResults,
 *   reaReaction, reaCaption, reaBadge, reaMeta
 *
 * Pairs a described reaction image with a short caption. The difference from
 * the meme caption generator next door is the shape of the output: that one
 * builds a two-line meme from a top and a bottom, whereas this is a single
 * image with a single line — the format you use to reply to something, not the
 * format you use to post something.
 *
 * The captions are deliberately short and mostly lowercase. A reaction caption
 * that runs to a full sentence is doing too much work; the image is carrying
 * the joke and the text is only there to aim it.
 *
 * Both pools are text descriptions. This tool cannot make an image, cannot
 * search for one, and does not imply otherwise — it produces the caption and
 * the description of the picture you would put it on.
 */
(function (window, document) {
  'use strict';

  var REACTIONS = [
    'A person slowly turning to look directly at the camera',
    'A dog with its head tilted at a steep angle, entirely baffled',
    'Somebody nodding very slowly with their eyes closed',
    'A cat staring at a blank wall with total focus',
    'A person giving a thumbs up while visibly devastated',
    'Someone leaning back in a chair with both hands over their face',
    'A small child standing completely still, mid-tantrum, having forgotten why',
    'A person blinking several times in quick succession',
    'Somebody holding a phone away from their face as though it has said something offensive',
    'A dog that has just been caught doing something and is pretending to be asleep',
    'A person applauding alone, slowly',
    'Someone looking at a laptop with the expression of a person reading bad news',
    'A cat sitting in a box far too small for it, perfectly content',
    'A person with both hands raised, palms out, taking a step backwards',
    'Somebody squinting at a screen and leaning closer and closer',
    'A bird standing on one leg, staring into the middle distance',
    'A person who has just realised they are the only one who has not understood',
    'A dog waiting by a door with a lead in its mouth, three hours early',
    'Someone sitting perfectly upright in a chair, having fallen asleep',
    'A person holding a mug and staring at a wall',
    'A cat that has knocked something over and is watching it happen',
    'Somebody in a crowd, visible only from the shoulders up, looking delighted',
    'A person with their head in their hands, laughing',
    'An empty chair that is still spinning slowly'
  ];

  var TONES = {
    deadpan: {
      label: 'Deadpan',
      captions: ['this is fine', 'no notes', 'understood', 'noted', 'i see', 'correct', 'as expected', 'right.']
    },
    hype: {
      label: 'Hyped',
      captions: ['lets go', 'absolutely unstoppable', 'we are so back', 'immaculate', 'no further questions', 'best possible outcome']
    },
    defeated: {
      label: 'Defeated',
      captions: ['i am so tired', 'i cannot do this today', 'it is over', 'i have peaked', 'that is enough internet for today', 'i will be going home now']
    },
    warm: {
      label: 'Warm',
      captions: ['oh that is lovely', 'genuinely made my day', 'well that is just nice', 'i love this for you', 'perfect. no changes.']
    },
    chaotic: {
      label: 'Chaotic',
      captions: ['i have made a decision', 'this is everyone’s problem now', 'unhinged, but correct', 'and i would do it again', 'nothing can stop me']
    }
  };

  function createReactionCaption(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var toneEl = $('reaTone');
    var reactionEl = $('reaReaction');
    var captionEl = $('reaCaption');
    var badgeEl = $('reaBadge');
    var metaEl = $('reaMeta');
    var resultsEl = $('reaResults');
    var statusEl = $('reaStatus');

    if (!reactionEl || !captionEl) return null;

    var status = fun.makeStatus(statusEl);

    function tone() {
      var value = toneEl ? toneEl.value : 'deadpan';
      return TONES[value] ? value : 'deadpan';
    }

    var reactionBag = fun.makeBag(function () { return REACTIONS; }, null);
    var captionBag = fun.makeBag(function () { return TONES[tone()].captions; }, tone);

    function draw() {
      var reaction = reactionBag.draw();
      var caption = captionBag.draw();

      if (!reaction || !caption) {
        status.show('Nothing to draw from that tone. Try another one.', 'warn');
        return;
      }

      if (resultsEl) resultsEl.classList.remove('hidden');
      reactionEl.textContent = reaction;
      captionEl.textContent = caption;
      if (badgeEl) badgeEl.textContent = TONES[tone()].label;
      if (metaEl) {
        metaEl.textContent = 'The image and the caption are drawn separately, so they are not matched to each other.';
      }

      status.hide();
    }

    var drawBtn = $('reaDrawBtn');
    var clearBtn = $('reaClearBtn');
    var copyBtn = $('reaCopyBtn');

    if (drawBtn) drawBtn.addEventListener('click', draw);
    if (toneEl) toneEl.addEventListener('change', function () { status.show('Tone set. Draw for a new reaction.', 'info'); });

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        reactionBag.reset();
        captionBag.reset();
        if (resultsEl) resultsEl.classList.add('hidden');
        reactionEl.textContent = '';
        captionEl.textContent = '';
        if (badgeEl) badgeEl.textContent = '';
        if (metaEl) metaEl.textContent = '';
        status.show('Cleared.', 'info');
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!captionEl.textContent) {
          status.show('Draw a reaction first.', 'warn');
          return;
        }
        fun.copy(
          captionEl.textContent +
          '\n\nReaction image: ' + reactionEl.textContent +
          '\n\n(Use any image that matches the description — this tool does not supply one.)',
          status
        );
      });
    }

    status.show('A reaction image description and one short line to put on it.', 'info');

    return { draw: draw };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createReactionCaption = createReactionCaption;
})(window, document);

/**
 * ToolStack AI — Pet Caption Generator engine.
 *
 * Ids required in tools/pet-caption-generator.html:
 *   petStatus, petAnimal, petDrawBtn, petClearBtn, petCopyBtn, petResults,
 *   petScene, petCaption, petBadge, petMeta
 *
 * Pairs a described pet photo with a caption. Two pools, both filtered by the
 * animal selector, drawn independently — so the scene and the line are not
 * matched to each other. That mismatch is usually where the joke is.
 *
 * The two species have genuinely different caption pools rather than one pool
 * with the animal swapped in. Dog captions are about enthusiasm and a complete
 * absence of context; cat captions are about intent, ownership and a quiet
 * sense of grievance. Writing them as one pool would produce lines that fit
 * neither animal, which is the failure mode of most pet caption tools.
 *
 * There is a third option — any animal — which mixes both pools, for the
 * pictures that are neither.
 *
 * No real animals, owners or accounts appear in any of this. It is text; the
 * tool does not supply an image and does not claim to.
 */
(function (window, document) {
  'use strict';

  var SCENES = [
    /* ------------------------------------------------------------------ dog */
    { a: 'dog', t: 'A dog sitting perfectly still in front of a full food bowl, making direct eye contact' },
    { a: 'dog', t: 'A large dog squeezed into a bed clearly intended for a much smaller one' },
    { a: 'dog', t: 'A dog mid-yawn with its entire face involved' },
    { a: 'dog', t: 'A wet dog standing in a doorway waiting to be told it is allowed in' },
    { a: 'dog', t: 'A dog carrying a stick far too large for it' },
    { a: 'dog', t: 'A dog asleep in a position that cannot possibly be comfortable' },
    { a: 'dog', t: 'A dog watching somebody eat with total, unwavering concentration' },
    { a: 'dog', t: 'A dog that has heard the word "walk" from three rooms away' },

    /* ------------------------------------------------------------------ cat */
    { a: 'cat', t: 'A cat sitting directly on a laptop that somebody is trying to use' },
    { a: 'cat', t: 'A cat staring at a closed door, willing it to open' },
    { a: 'cat', t: 'A cat in a box far too small for it, perfectly content' },
    { a: 'cat', t: 'A cat that has just knocked a glass off a table and is watching it fall' },
    { a: 'cat', t: 'A cat sitting in the exact spot somebody was about to sit in' },
    { a: 'cat', t: 'A cat mid-yawn, showing an unreasonable number of teeth' },
    { a: 'cat', t: 'A cat that has just been discovered somewhere it should not be' },
    { a: 'cat', t: 'A cat asleep in a patch of sun that has since moved on' }
  ];

  var CAPTIONS = [
    /* ------------------------------------------------------------------ dog */
    { a: 'dog', t: 'he has no idea what is happening and he is thrilled about it' },
    { a: 'dog', t: 'this is the best day of his life and it is a tuesday' },
    { a: 'dog', t: 'the bowl is full. he must confirm the bowl is full.' },
    { a: 'dog', t: 'he has been waiting eleven minutes and has aged four years' },
    { a: 'dog', t: 'so we are just going to pretend that did not happen' },
    { a: 'dog', t: 'the stick is too big. the stick will be carried.' },
    { a: 'dog', t: 'he is not begging. he is supervising.' },
    { a: 'dog', t: 'the walk was mentioned. the walk is now the only topic.' },

    /* ------------------------------------------------------------------ cat */
    { a: 'cat', t: 'i have been sitting here four minutes. nothing has happened. i will remain.' },
    { a: 'cat', t: 'this door will open. i have decided.' },
    { a: 'cat', t: 'the box fits. i fit. everything is correct.' },
    { a: 'cat', t: 'the glass was in my way. gravity did the rest.' },
    { a: 'cat', t: 'this is my seat now. it was always my seat.' },
    { a: 'cat', t: 'do not read anything into this.' },
    { a: 'cat', t: 'i am not lost. i am exactly where i intended to be.' },
    { a: 'cat', t: 'the sun has moved. this is a personal insult.' }
  ];

  var ANIMAL_LABELS = { dog: 'Dog', cat: 'Cat', any: 'Any animal' };

  function createPetCaption(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var animalEl = $('petAnimal');
    var sceneEl = $('petScene');
    var captionEl = $('petCaption');
    var badgeEl = $('petBadge');
    var metaEl = $('petMeta');
    var resultsEl = $('petResults');
    var statusEl = $('petStatus');

    if (!sceneEl || !captionEl) return null;

    var status = fun.makeStatus(statusEl);

    function animal() {
      var value = animalEl ? animalEl.value : 'any';
      return ANIMAL_LABELS[value] ? value : 'any';
    }

    function poolFor(list) {
      var want = animal();
      if (want === 'any') return list;
      return list.filter(function (item) { return item.a === want; });
    }

    var sceneBag = fun.makeBag(function () { return poolFor(SCENES); }, animal);
    var captionBag = fun.makeBag(function () { return poolFor(CAPTIONS); }, animal);

    function draw() {
      var scene = sceneBag.draw();
      var caption = captionBag.draw();

      if (!scene || !caption) {
        status.show('Nothing to draw for that animal. Try another option.', 'warn');
        return;
      }

      if (resultsEl) resultsEl.classList.remove('hidden');
      sceneEl.textContent = scene.t;
      captionEl.textContent = caption.t;
      if (badgeEl) badgeEl.textContent = ANIMAL_LABELS[animal()];
      if (metaEl) {
        metaEl.textContent = 'The picture and the caption come from separate pools, so they are not matched to each other.';
      }

      status.hide();
    }

    var drawBtn = $('petDrawBtn');
    var clearBtn = $('petClearBtn');
    var copyBtn = $('petCopyBtn');

    if (drawBtn) drawBtn.addEventListener('click', draw);
    if (animalEl) animalEl.addEventListener('change', function () { status.show('Animal set. Draw for a new caption.', 'info'); });

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        sceneBag.reset();
        captionBag.reset();
        if (resultsEl) resultsEl.classList.add('hidden');
        sceneEl.textContent = '';
        captionEl.textContent = '';
        if (badgeEl) badgeEl.textContent = '';
        if (metaEl) metaEl.textContent = '';
        status.show('Cleared.', 'info');
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!captionEl.textContent) {
          status.show('Draw a caption first.', 'warn');
          return;
        }
        fun.copy(
          captionEl.textContent +
          '\n\nPicture: ' + sceneEl.textContent +
          '\n\n(The picture line is a description — use any photo that matches it.)',
          status
        );
      });
    }

    status.show('A described pet photo and a caption for it. The tool does not supply the photo.', 'info');

    return { draw: draw };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createPetCaption = createPetCaption;
})(window, document);

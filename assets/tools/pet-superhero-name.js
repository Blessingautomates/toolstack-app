/**
 * ToolStack AI — Pet Superhero Name engine.
 *
 * Ids required in tools/pet-superhero-name.html:
 *   pshStatus, pshNameInput, pshDrawBtn, pshClearBtn, pshCopyBtn, pshResults,
 *   pshHeroName, pshPower, pshOrigin, pshMeta
 *
 * Builds a superhero identity around a pet, using the name you type if there is
 * one and drawing from a pool of invented names if there is not. That ordering
 * matters: the tool works with no input at all, and works better with it.
 *
 * The powers are all plausible pet abilities rather than generic superhero
 * ones. A cat that can fly is not funny; a cat that can detect a vet visit
 * three days in advance is, and every power here is written to be something a
 * pet owner would recognise as basically true.
 *
 * All names are invented. Nothing here references a real animal, a real person
 * or an existing character.
 */
(function (window, document) {
  'use strict';

  var TITLES = ['The Amazing', 'Captain', 'The Incredible', 'Sergeant', 'The Mighty', 'Doctor'];
  var EPITHETS = [
    'the Unstoppable', 'of the Back Garden', 'the Swift', 'Guardian of the Sofa',
    'the Vigilant', 'the Very Good', 'the Relentless'
  ];

  var FALLBACK_NAMES = [
    'Biscuit', 'Pickle', 'Noodle', 'Waffle', 'Mango', 'Pepper', 'Socks', 'Bramble', 'Jasper', 'Olive'
  ];

  var POWERS = [
    'Can hear a packet being opened from four rooms away, through a closed door, while asleep.',
    'Can locate any dropped food within a four-mile radius and will not rest until it is found.',
    'Can sleep through anything except the specific sound of a lead being lifted off its hook.',
    'Can appear on a lap within two seconds of somebody sitting down, from anywhere in the house.',
    'Can identify the exact centre of any bed and occupy it before anybody else has sat down.',
    'Can detect an upcoming vet visit approximately three days in advance, by unknown means.',
    'Can make a full meal disappear without any witness being able to describe how.',
    'Can pass through a gap that is visibly narrower than they are, without slowing down.',
    'Can remember every person who has ever given them food, in order, with dates.',
    'Can produce a hairball at the least convenient possible moment with unerring accuracy.',
    'Can wake an entire household with one deliberate noise, at a time of their choosing.',
    'Can distinguish the car that belongs here from every other car on the street.'
  ];

  var ORIGINS = [
    'Was found in a hedge and has never fully explained how they got there.',
    'Arrived unannounced and was immediately given a name and a bed. Nobody regrets it.',
    'Was the smallest of the litter and has been compensating ever since.',
    'Chose this house and has never once behaved like a guest.',
    'Survived a week outdoors and now expects a specific brand of food.',
    'Came with a name already. It did not suit, so it was changed.',
    'Was collected as a "quiet one". The assessment was inaccurate.'
  ];

  function createPetSuperheroName(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var nameEl = $('pshNameInput');
    var heroEl = $('pshHeroName');
    var powerEl = $('pshPower');
    var originEl = $('pshOrigin');
    var metaEl = $('pshMeta');
    var resultsEl = $('pshResults');
    var statusEl = $('pshStatus');

    if (!heroEl) return null;

    var status = fun.makeStatus(statusEl);

    var powerBag = fun.makeBag(function () { return POWERS; }, null);
    var originBag = fun.makeBag(function () { return ORIGINS; }, null);
    var fallbackBag = fun.makeBag(function () { return FALLBACK_NAMES; }, null);

    function pick(list) {
      return list[Math.floor(Math.random() * list.length)];
    }

    function draw() {
      var typed = fun.inputValue(nameEl, '');
      var usedFallback = false;
      var name = typed;

      if (!name) {
        name = fallbackBag.draw() || 'Biscuit';
        usedFallback = true;
      } else {
        name = fun.titleCase(name);
      }

      var hero = pick(TITLES) + ' ' + name + ', ' + pick(EPITHETS);

      if (resultsEl) resultsEl.classList.remove('hidden');
      if (heroEl) heroEl.textContent = hero;
      if (powerEl) powerEl.textContent = powerBag.draw() || '';
      if (originEl) originEl.textContent = originBag.draw() || '';
      if (metaEl) {
        metaEl.textContent = usedFallback
          ? 'No name was typed, so one was drawn from a pool. Type your pet’s name for a personal one.'
          : 'Built around the name you typed. Press Draw again for different powers and a different origin.';
      }

      status.hide();
    }

    var drawBtn = $('pshDrawBtn');
    var clearBtn = $('pshClearBtn');
    var copyBtn = $('pshCopyBtn');

    if (drawBtn) drawBtn.addEventListener('click', draw);

    if (nameEl) {
      nameEl.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          draw();
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        powerBag.reset();
        originBag.reset();
        fallbackBag.reset();
        if (nameEl) nameEl.value = '';
        if (resultsEl) resultsEl.classList.add('hidden');
        if (heroEl) heroEl.textContent = '';
        if (powerEl) powerEl.textContent = '';
        if (originEl) originEl.textContent = '';
        if (metaEl) metaEl.textContent = '';
        status.show('Cleared.', 'info');
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!heroEl.textContent) {
          status.show('Draw a hero first.', 'warn');
          return;
        }
        fun.copy(
          heroEl.textContent +
          '\n\nPower: ' + (powerEl ? powerEl.textContent : '') +
          '\nOrigin: ' + (originEl ? originEl.textContent : '') +
          '\n\n(Fictional, assembled at random.)',
          status
        );
      });
    }

    status.show('Type your pet’s name, or leave it blank and one will be drawn for you.', 'info');

    return { draw: draw };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createPetSuperheroName = createPetSuperheroName;
})(window, document);

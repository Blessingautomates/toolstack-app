/**
 * ToolStack AI — Pet Nickname Generator engine.
 *
 * Ids required in tools/pet-nickname-generator.html:
 *   nickStatus, nickNameInput, nickPetType, nickBuildBtn, nickClearBtn,
 *   nickCopyBtn, nickResults, nickList, nickBadge, nickMeta
 *
 * Derives nicknames from the pet's actual name rather than drawing them from a
 * list. That is the whole difference between this and a random noun generator:
 * "Biscuit" producing "Bisc", "Biscy", "Bisbis" and "Sir Biscuit of the Sofa"
 * is funny because you can see the name in it, and a pool of unrelated
 * nicknames would not be about your pet at all.
 *
 * The transformations are crude on purpose — a rough first-syllable split, a
 * few suffixes, an honorific and a title. Real nickname formation is not
 * something a regex can do well, and pretending otherwise would produce
 * unrecognisable output. Crude and legible beats clever and wrong, and the page
 * shows the six candidates from a longer list so you can take the one that
 * actually sounds right.
 *
 * Nothing is stored or sent. The name never leaves the page.
 */
(function (window, document) {
  'use strict';

  var DOG_TITLES = ['the Bold', 'the Good', 'the Brave', 'the Small', 'the Loud', 'the Sleepy'];
  var CAT_TITLES = ['the Magnificent', 'the Unbothered', 'the Regal', 'the Silent', 'the Watching', 'the Ancient'];
  var ANY_TITLES = ['the Third', 'of the Sofa', 'the Inspector', 'the Unstoppable', 'the Reasonable', 'of the Garden'];

  var DOG_HONORIFICS = ['Sir', 'Captain', 'Lord'];
  var CAT_HONORIFICS = ['Lady', 'Madam', 'Dame'];
  var ANY_HONORIFICS = ['Sir', 'Lady', 'Captain', 'Madam'];

  var DOG_SUFFIXES = ['aroo', 'ster', 'face', 'boy'];
  var CAT_SUFFIXES = ['kins', 'face', 'cat', 'paws'];
  var ANY_SUFFIXES = ['y', 'ie', 'face', 'kins'];

  var PREFIXES = ['Little', 'The Mighty', 'Tiny', 'Old'];

  function createPetNickname(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var nameEl = $('nickNameInput');
    var typeEl = $('nickPetType');
    var buildBtn = $('nickBuildBtn');
    var clearBtn = $('nickClearBtn');
    var copyBtn = $('nickCopyBtn');
    var resultsEl = $('nickResults');
    var listEl = $('nickList');
    var badgeEl = $('nickBadge');
    var metaEl = $('nickMeta');
    var statusEl = $('nickStatus');

    if (!buildBtn || !listEl) return null;

    var status = fun.makeStatus(statusEl);
    var latest = [];

    function petType() {
      var value = typeEl ? typeEl.value : 'any';
      return value === 'dog' || value === 'cat' ? value : 'any';
    }

    function titlesFor(type) {
      if (type === 'dog') return DOG_TITLES.concat(ANY_TITLES);
      if (type === 'cat') return CAT_TITLES.concat(ANY_TITLES);
      return DOG_TITLES.concat(CAT_TITLES, ANY_TITLES);
    }

    function honorificsFor(type) {
      if (type === 'dog') return DOG_HONORIFICS.concat(ANY_HONORIFICS);
      if (type === 'cat') return CAT_HONORIFICS.concat(ANY_HONORIFICS);
      return ANY_HONORIFICS;
    }

    function suffixesFor(type) {
      if (type === 'dog') return DOG_SUFFIXES.concat(ANY_SUFFIXES);
      if (type === 'cat') return CAT_SUFFIXES.concat(ANY_SUFFIXES);
      return DOG_SUFFIXES.concat(CAT_SUFFIXES, ANY_SUFFIXES);
    }

    /* A rough first syllable: leading consonants plus the first vowel group.
     * "Biscuit" gives "Bis", "Milo" gives "Mi", "Oreo" gives "O". */
    function firstSyllable(name) {
      var match = name.toLowerCase().match(/^[^aeiouy]*[aeiouy]+/);
      var length = match ? match[0].length : Math.min(3, name.length);
      return name.slice(0, Math.max(1, length));
    }

    function endsInConsonant(name) {
      return /[^aeiouy]$/i.test(name);
    }

    function build(name) {
      var type = petType();
      var titles = titlesFor(type);
      var honorifics = honorificsFor(type);
      var suffixes = suffixesFor(type);
      var chunk = firstSyllable(name);
      var pick = function (list) { return list[Math.floor(Math.random() * list.length)]; };

      var candidates = [
        chunk + 'y',
        chunk + chunk.toLowerCase(),
        honorifics[Math.floor(Math.random() * honorifics.length)] + ' ' + name,
        pick(PREFIXES) + ' ' + name,
        name + ' ' + pick(titles),
        name + pick(suffixes),
        name + (endsInConsonant(name) ? 'y' : '-y'),
        'The ' + name,
        name + ' ' + pick(titles),
        chunk + 's',
        pick(PREFIXES) + ' ' + chunk,
        name + '-' + name.toLowerCase()
      ];

      /* Deduplicate, since several rules produce the same string for short
       * names — "Milo" hits `name + 'y'` and `name + suffix 'y'` identically. */
      var seen = {};
      var unique = [];
      candidates.forEach(function (candidate) {
        var trimmed = candidate.trim();
        var key = trimmed.toLowerCase();
        if (!trimmed || seen[key]) return;
        seen[key] = true;
        unique.push(trimmed);
      });

      return fun.shuffle(unique).slice(0, 6);
    }

    function render(names) {
      listEl.innerHTML = '';
      names.forEach(function (name) {
        var chip = document.createElement('div');
        chip.className = 'px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-sm font-bold text-gray-100';
        chip.textContent = name;
        listEl.appendChild(chip);
      });
    }

    function run() {
      var name = fun.inputValue(nameEl, '');
      if (!name) {
        status.show('Type your pet’s name first — the nicknames are built from it.', 'warn');
        return;
      }

      latest = build(name);
      if (!latest.length) {
        status.show('That name was too short to build from. Try the full name.', 'warn');
        return;
      }

      if (resultsEl) resultsEl.classList.remove('hidden');
      render(latest);

      var type = petType();
      if (badgeEl) {
        badgeEl.textContent = type === 'dog' ? 'Dog' : (type === 'cat' ? 'Cat' : 'Any pet');
      }
      if (metaEl) {
        metaEl.textContent = 'Six from a longer list of transformations, drawn at random — press Build again for a different set.';
      }

      status.hide();
    }

    buildBtn.addEventListener('click', run);

    if (nameEl) {
      nameEl.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          run();
        }
      });
    }

    if (typeEl) typeEl.addEventListener('change', function () { status.show('Type set. Press Build for a new set.', 'info'); });

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        latest = [];
        if (nameEl) nameEl.value = '';
        if (resultsEl) resultsEl.classList.add('hidden');
        listEl.innerHTML = '';
        if (badgeEl) badgeEl.textContent = '';
        if (metaEl) metaEl.textContent = '';
        status.show('Cleared.', 'info');
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!latest.length) {
          status.show('Build a set of nicknames first.', 'warn');
          return;
        }
        var name = fun.inputValue(nameEl, 'my pet');
        fun.copy('Nicknames for ' + name + ':\n' + latest.join('\n'), status);
      });
    }

    status.show('Type the name and press Build. The nicknames are derived from what you typed, not drawn from a list.', 'info');

    return { build: run };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createPetNickname = createPetNickname;
})(window, document);

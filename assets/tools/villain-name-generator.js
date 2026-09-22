/**
 * ToolStack AI — Villain Name Generator engine.
 *
 * Ids required in tools/villain-name-generator.html:
 *   vilStatus, vilStyle, vilDrawBtn, vilClearBtn, vilCopyBtn, vilResults,
 *   vilName, vilOrigin, vilScheme, vilBadge, vilMeta
 *
 * Builds a name from four independent draws — a title, a core, an epithet and
 * an origin story — plus a current scheme. Four bags rather than one, so a name
 * does not repeat any of its parts until that part's pool is exhausted.
 *
 * Every villain here is a fictional archetype assembled from invented words.
 * That is a hard rule rather than a stylistic preference: a generator that
 * produces the name of a real person attached to an invented crime is a
 * generator that defames somebody, and "it was random" is not a defence. So
 * there are no real names, no real companies, no real places, and every scheme
 * is petty and absurd rather than violent. These are villains in the sense of a
 * cartoon, not in the sense of a news story.
 *
 * The whole thing is meant to be funny rather than menacing, which is why the
 * suburban style exists — "Mrs Bramble of Number 42" is a better joke than
 * anything with a skull in it.
 */
(function (window, document) {
  'use strict';

  var PARTS = {
    gothic: {
      label: 'Gothic',
      titles: ['Doctor', 'Baron', 'Madame', 'Count', 'Lady'],
      cores: ['Obsidian', 'Velvet', 'Cinder', 'Thistle', 'Vellum', 'Umber'],
      epithets: ['of the Long Night', 'the Unread', 'of the Drowned Chapel', 'the Patient', 'of the Ninth Bell'],
      origins: [
        'Was passed over for a minor honour some decades ago and has been composing a response ever since.',
        'Was told, at a formative age, that the plan would never work. The plan is still going.',
        'Inherited a house, a grudge and an unusually complete set of keys.',
        'Spent eleven years in a library and came out with exactly one idea, which was enough.',
        'Was removed from a committee for reasons that were never minuted. This is the response.'
      ],
      schemes: [
        'Currently acquiring every bell in the county, for reasons that remain unclear even to the bells.',
        'Is rebuilding the family name one letter at a time, and has so far rebuilt none of it.',
        'Plans to be extremely polite at everybody until they agree.',
        'Is writing a very long letter. It is on the fourth draft.',
        'Has been standing outside the gates since Tuesday and intends to keep standing there.'
      ]
    },
    corporate: {
      label: 'Corporate',
      titles: ['Director', 'The Chief', 'Madame', 'The Senior Partner', 'The Regional Head of'],
      cores: ['Ledger', 'Quartz', 'Mandate', 'Cobalt', 'Threshold', 'Silver'],
      epithets: ['of the Fourth Quarter', 'the Restructuring', 'of the Open Plan', 'the Compliant', 'of Human Resources'],
      origins: [
        'Once scheduled a meeting that could have been an email and has never fully recovered from the power of it.',
        'Was cc’d into something they should not have been and has been using it carefully ever since.',
        'Rose through the ranks by being the only person who ever read the appendix.',
        'Was told the strategy was "aspirational". Took it as a personal instruction.',
        'Booked the large meeting room four years ago and has not given it back.'
      ],
      schemes: [
        'Currently standardising something that was working perfectly well.',
        'Is introducing a new process. The process is the old process, renamed.',
        'Plans to schedule a follow-up to the follow-up until everyone agrees out of exhaustion.',
        'Is migrating everything to a system nobody has been trained on.',
        'Has proposed a reorganisation that returns things to how they were in March.'
      ]
    },
    cosmic: {
      label: 'Cosmic',
      titles: ['The', 'Archon', 'Sentinel', 'Warden', 'The Last'],
      cores: ['Nova', 'Void', 'Halo', 'Zenith', 'Parallax', 'Aster'],
      epithets: ['of the Outer Ring', 'the Unlit', 'of the Ninth Orbit', 'the Silent', 'of the Long Dark'],
      origins: [
        'Was present at the beginning and has been mildly annoyed about it ever since.',
        'Fell a very long way and landed somewhere with excellent paperwork.',
        'Was appointed to guard something and has forgotten what, but not the appointment.',
        'Has been counting something for a very long time. The number is now extremely large.',
        'Was once a star. Misses it. Does not discuss it.'
      ],
      schemes: [
        'Is slowly rearranging a constellation into something that reads better from the ground.',
        'Plans to turn the lights off for a moment, just to see who notices.',
        'Is waiting for the orbits to line up, and has been waiting long enough that it is now a hobby.',
        'Has decided the tides should be tidier and is adjusting them.',
        'Is collecting silence and keeping it somewhere safe.'
      ]
    },
    suburban: {
      label: 'Suburban',
      titles: ['Mrs', 'Mr', 'The', 'Chair of the', 'The Neighbourhood'],
      cores: ['Bramble', 'Kettle', 'Lantern', 'Hedge', 'Paving', 'Rotary'],
      epithets: ['of Number 42', 'the Retired', 'of the Residents Committee', 'the Unbothered', 'of the Allotment'],
      origins: [
        'Was denied planning permission in 2011 and has been keeping a careful record ever since.',
        'Once had a hedge dispute escalate to a formal letter. The hedge is gone. The record remains.',
        'Was not consulted about the new bins, and has made this point several times.',
        'Won a village competition in 1998 and has never been quite the same.',
        'Has lived here longer than anybody else and would like that acknowledged.'
      ],
      schemes: [
        'Is preparing a strongly worded note. It is nearly finished. It has been nearly finished for a year.',
        'Plans to raise the matter at the next meeting, and the one after that.',
        'Is measuring the boundary. Again.',
        'Has started a petition. The petition is about the state of the pavement.',
        'Intends to win the competition this year by any means available.'
      ]
    }
  };

  function createVillainName(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var styleEl = $('vilStyle');
    var nameEl = $('vilName');
    var originEl = $('vilOrigin');
    var schemeEl = $('vilScheme');
    var badgeEl = $('vilBadge');
    var metaEl = $('vilMeta');
    var statusEl = $('vilStatus');

    if (!nameEl) return null;

    var status = fun.makeStatus(statusEl);

    function style() {
      var value = styleEl ? styleEl.value : 'gothic';
      return PARTS[value] ? value : 'gothic';
    }

    function pick(list) {
      return list[Math.floor(Math.random() * list.length)];
    }

    /* Names are assembled once per draw rather than tracked in bags: a name has
     * four components, and keeping four independent bags in step across a style
     * change is more machinery than the guarantee is worth here. A repeated
     * title is not the annoyance a repeated joke is. */
    function draw() {
      var key = style();
      var set = PARTS[key];

      var title = pick(set.titles);
      var core = pick(set.cores);
      var epithet = pick(set.epithets);
      var name = title + ' ' + core + ' ' + epithet;

      if (nameEl) nameEl.textContent = name;
      if (originEl) originEl.textContent = pick(set.origins);
      if (schemeEl) schemeEl.textContent = pick(set.schemes);
      if (badgeEl) badgeEl.textContent = set.label;
      if (metaEl) {
        metaEl.textContent = set.titles.length + ' titles, ' + set.cores.length + ' names, ' +
          set.epithets.length + ' epithets, ' + set.origins.length + ' origin stories and ' +
          set.schemes.length + ' schemes — drawn independently, so the combinations are plentiful.';
      }

      status.hide();
    }

    if (styleEl) styleEl.addEventListener('change', function () { status.show('Style set. Draw for a new villain.', 'info'); });

    var drawBtn = $('vilDrawBtn');
    var clearBtn = $('vilClearBtn');
    var copyBtn = $('vilCopyBtn');
    var resultsEl = $('vilResults');

    if (drawBtn) {
      drawBtn.addEventListener('click', function () {
        if (resultsEl) resultsEl.classList.remove('hidden');
        draw();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (resultsEl) resultsEl.classList.add('hidden');
        if (nameEl) nameEl.textContent = '';
        if (originEl) originEl.textContent = '';
        if (schemeEl) schemeEl.textContent = '';
        if (badgeEl) badgeEl.textContent = '';
        if (metaEl) metaEl.textContent = '';
        status.show('Cleared.', 'info');
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!nameEl.textContent) {
          status.show('Draw a villain first.', 'warn');
          return;
        }
        fun.copy(
          nameEl.textContent + '\n\nOrigin: ' + (originEl ? originEl.textContent : '') +
          '\nCurrently: ' + (schemeEl ? schemeEl.textContent : '') +
          '\n\n(Fictional, assembled at random.)',
          status
        );
      });
    }

    status.show('Pick a style and draw. Every villain is fictional and every scheme is petty.', 'info');

    return { draw: draw };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createVillainName = createVillainName;
})(window, document);

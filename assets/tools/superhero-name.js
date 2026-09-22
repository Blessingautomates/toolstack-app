/**
 * ToolStack AI — Superhero Name Generator engine.
 *
 * Ids required in tools/superhero-name.html:
 *   heroStatus, heroStyle, heroDrawBtn, heroClearBtn, heroCopyBtn, heroResults,
 *   heroName, heroTagline, heroTeam, heroOrigin, heroBadge, heroMeta
 *
 * Four styles, each with its own prefixes, suffixes, taglines and origins, plus
 * a shared pool of team names. The absurd style exists because a superhero
 * generator that only produces serious names is a generator with no jokes in
 * it, and "Captain Bread" is worth more than another Sentinel.
 *
 * Every name is assembled from invented words. No real person, no real
 * organisation, and no real publication's characters — a generator that emits
 * a trademarked hero name is a generator that gets somebody a letter, and "it
 * was random" is not a defence.
 */
(function (window, document) {
  'use strict';

  var STYLES = {
    classic: {
      label: 'Classic',
      prefixes: ['Captain', 'The Amazing', 'Doctor', 'Commander', 'Ms', 'The'],
      suffixes: ['Comet', 'Sentinel', 'Vanguard', 'Beacon', 'Bulwark', 'Warden'],
      taglines: [
        'Defender of the perfectly ordinary.',
        'Here when it matters, gone before the paperwork.',
        'Standing between you and the slightly worse option.',
        'Doing the right thing, reluctantly, and on time.'
      ],
      origins: [
        'Was in the right place at the wrong time, and then the wrong place at the right time, and it stuck.',
        'Trained for eleven years in a discipline that turned out not to be relevant. Improvising ever since.',
        'Inherited the role from somebody who did not want it any more, along with the cape and the filing.',
        'Was the only person who turned up. That turned out to be the whole qualification.'
      ]
    },
    cosmic: {
      label: 'Cosmic',
      prefixes: ['Star', 'Nova', 'Astral', 'The Eternal', 'Quantum', 'Orbital'],
      suffixes: ['Ranger', 'Herald', 'Nomad', 'Cipher', 'Vertex', 'Parallax'],
      taglines: [
        'Keeping the peace across a frankly unreasonable amount of space.',
        'The last line of defence, and the second-to-last one has gone home.',
        'Answering a question nobody has asked yet.',
        'Holding the line at the edge of the map.'
      ],
      origins: [
        'Fell through something that should not have been open and found it difficult to get back.',
        'Was appointed by a body that no longer exists and has decided to keep honouring the appointment.',
        'Has been awake for a very long time and has stopped mentioning it.',
        'Arrived from somewhere with a much better climate and considerably worse paperwork.'
      ]
    },
    street: {
      label: 'Street',
      prefixes: ['Night', 'Iron', 'Rook', 'Ash', 'Grey', 'The'],
      suffixes: ['Watch', 'Harbour', 'Alley', 'Signal', 'Ledger', 'Beat'],
      taglines: [
        'Knows every rooftop in the city and most of the shortcuts.',
        'Nobody notices, which is the entire point.',
        'Working the hours nobody else wants.',
        'On the ground, on the case, on the last bus home.'
      ],
      origins: [
        'Saw something they should not have and decided, unwisely, to do something about it.',
        'Was the only witness, and then the only person still asking questions.',
        'Grew up three streets from here and never quite left.',
        'Took on one job as a favour and has not been allowed to stop since.'
      ]
    },
    absurd: {
      label: 'Absurd',
      prefixes: ['The Incredible', 'Captain', 'Sir', 'Doctor', 'Baron', 'The'],
      suffixes: ['Bread', 'Kettle', 'Spreadsheet', 'Roundabout', 'Cardigan', 'Scone'],
      taglines: [
        'Fighting crime with whatever is in the fridge.',
        'Saving the day, approximately, and slightly late.',
        'A hero for people who have given up on heroes.',
        'Defending the right to a quiet afternoon.'
      ],
      origins: [
        'Was struck by something deeply unremarkable and has been making the most of it ever since.',
        'Developed the powers after a minor administrative error that nobody has been able to reverse.',
        'Was chosen by a prophecy that had clearly been written in a hurry.',
        'Ate something they should not have. The rest is history, and mostly embarrassing.'
      ]
    }
  };

  var TEAMS = [
    'The Unbroken', 'The Night Shift', 'The Long Weekend', 'The Second Attempt',
    'The Reasonable Eight', 'The Last Resort', 'The Committee', 'The Understudies',
    'The Quiet Majority', 'The Backup Plan', 'The Late Arrivals', 'The Others'
  ];

  function createSuperheroName(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var styleEl = $('heroStyle');
    var nameEl = $('heroName');
    var taglineEl = $('heroTagline');
    var teamEl = $('heroTeam');
    var originEl = $('heroOrigin');
    var badgeEl = $('heroBadge');
    var metaEl = $('heroMeta');
    var resultsEl = $('heroResults');
    var statusEl = $('heroStatus');

    if (!nameEl) return null;

    var status = fun.makeStatus(statusEl);

    /* Team names and origins come from bags so they do not repeat while the
     * pool lasts. The name parts are redrawn freely — a repeated prefix across
     * two names is not the annoyance a repeated team name is. */
    var teamBag = fun.makeBag(function () { return TEAMS; }, null);

    function pick(list) {
      return list[Math.floor(Math.random() * list.length)];
    }

    function currentStyle() {
      var value = styleEl ? styleEl.value : 'classic';
      return STYLES[value] ? value : 'classic';
    }

    function draw() {
      var key = currentStyle();
      var set = STYLES[key];

      var name = pick(set.prefixes) + ' ' + pick(set.suffixes);
      var team = teamBag.draw();

      if (nameEl) nameEl.textContent = name;
      if (taglineEl) taglineEl.textContent = pick(set.taglines);
      if (teamEl) teamEl.textContent = team ? ('Member of ' + team) : 'Currently operating alone.';
      if (originEl) originEl.textContent = pick(set.origins);
      if (badgeEl) badgeEl.textContent = set.label;
      if (metaEl) {
        metaEl.textContent = set.prefixes.length + ' first halves and ' + set.suffixes.length +
          ' second halves in this style, so ' + (set.prefixes.length * set.suffixes.length) +
          ' combinations before anything repeats.';
      }

      status.hide();
    }

    var drawBtn = $('heroDrawBtn');
    var clearBtn = $('heroClearBtn');
    var copyBtn = $('heroCopyBtn');

    if (drawBtn) {
      drawBtn.addEventListener('click', function () {
        if (resultsEl) resultsEl.classList.remove('hidden');
        draw();
      });
    }

    if (styleEl) {
      styleEl.addEventListener('change', function () {
        teamBag.reset();
        status.show('Style set. Draw for a new hero.', 'info');
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        teamBag.reset();
        if (resultsEl) resultsEl.classList.add('hidden');
        if (nameEl) nameEl.textContent = '';
        if (taglineEl) taglineEl.textContent = '';
        if (teamEl) teamEl.textContent = '';
        if (originEl) originEl.textContent = '';
        if (badgeEl) badgeEl.textContent = '';
        if (metaEl) metaEl.textContent = '';
        status.show('Cleared.', 'info');
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!nameEl.textContent) {
          status.show('Draw a hero first.', 'warn');
          return;
        }
        fun.copy(
          nameEl.textContent +
          '\n' + (taglineEl ? taglineEl.textContent : '') +
          '\n' + (teamEl ? teamEl.textContent : '') +
          '\n\nOrigin: ' + (originEl ? originEl.textContent : '') +
          '\n\n(Fictional, assembled at random.)',
          status
        );
      });
    }

    status.show('Pick a style and draw. Every name is invented — no real heroes, characters or organisations.', 'info');

    return { draw: draw };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createSuperheroName = createSuperheroName;
})(window, document);

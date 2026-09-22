/**
 * ToolStack AI — What Type of Person engine.
 *
 * Ids required in tools/what-type-person.html:
 *   wtpStatus, wtpIntro, wtpStartBtn, wtpQuiz, wtpProgress, wtpBar, wtpQuestion,
 *   wtpOptions, wtpBackBtn, wtpResults, wtpType, wtpTypeDesc, wtpTraits,
 *   wtpSpread, wtpRestartBtn, wtpCopyBtn
 *
 * Ten questions, six types, weighted scoring. The page states plainly that this
 * is a game and not a measurement, and the results screen backs that up rather
 * than just carrying a disclaimer: it shows the *whole* distribution, not only
 * the winning type. Most people come out of a quiz like this within a point or
 * two of two or three types, and hiding that to present one confident label
 * would be the dishonest version of this tool. The spread is the honest bit.
 *
 * Each question offers four options rather than a five-point agree/disagree
 * scale. That is deliberate: a Likert scale is the format of a real instrument,
 * and borrowing it would imply a rigour this does not have. Four concrete
 * choices read like a game, which is what it is.
 *
 * The types are deliberately non-judgemental and non-clinical. Nothing here
 * maps onto a real personality framework, and nothing here is a diagnosis.
 */
(function (window, document) {
  'use strict';

  var TYPES = {
    planner: {
      name: 'The Planner',
      desc: 'You are already thinking about next week. Not because you are anxious about it, but because the thinking is the enjoyable part — a plan is a thing you get to make before you have to do anything. People rely on you for this more than they say.',
      traits: ['Thinks in steps', 'Hates being late', 'Has a list somewhere']
    },
    wanderer: {
      name: 'The Wanderer',
      desc: 'You follow the interesting thing rather than the sensible one, and you have ended up in a lot of places you did not intend to be. You are excellent company on a long afternoon and slightly unreliable on a schedule.',
      traits: ['Says yes first', 'Notices the side street', 'Terrible at estimating time']
    },
    anchor: {
      name: 'The Anchor',
      desc: 'You are the one who notices who is missing and who is quiet. Groups hold together around people like you, and it usually goes unremarked — which is the whole point of being one.',
      traits: ['Counts the room', 'Remembers the follow-up', 'Everyone’s emergency contact']
    },
    spark: {
      name: 'The Spark',
      desc: 'You start things. Some of them finish and some of them do not, but the room is more awake when you are in it, and the ideas that go nowhere were still worth having out loud.',
      traits: ['Starts before planning', 'Talks with hands', 'Three projects deep']
    },
    diplomat: {
      name: 'The Diplomat',
      desc: 'You read a room before you speak in it. You are the person who works out what everybody actually wants and then finds the version of the plan that everybody can live with.',
      traits: ['Asks before answering', 'Notices the tension', 'Rarely the loudest']
    },
    tinkerer: {
      name: 'The Tinkerer',
      desc: 'You take things apart to see how they work, and you are happier with a problem than with an answer. Half of what you own has been improved and the other half has not been reassembled yet.',
      traits: ['Fixes rather than replaces', 'Reads the manual after', 'Owns too many cables']
    }
  };

  var QUESTIONS = [
    {
      q: 'It is Friday evening and nothing is planned. What actually happens?',
      a: [
        { t: 'I already have a rough idea of the weekend.', k: 'planner' },
        { t: 'I will see who is around and decide from there.', k: 'wanderer' },
        { t: 'I will check nobody has been left out and get something going.', k: 'anchor' },
        { t: 'I will start on the thing I have been meaning to make.', k: 'tinkerer' }
      ]
    },
    {
      q: 'A friend is clearly not fine but says they are.',
      a: [
        { t: 'I will ask once more, gently, and leave it there.', k: 'diplomat' },
        { t: 'I will sit with them and not say much.', k: 'anchor' },
        { t: 'I will try to make them laugh.', k: 'spark' },
        { t: 'I will give them space and check in tomorrow.', k: 'planner' }
      ]
    },
    {
      q: 'Six people are arguing about where to eat.',
      a: [
        { t: 'I will suggest somewhere that works for everyone’s constraints.', k: 'planner' },
        { t: 'I will ask each person what they actually want.', k: 'diplomat' },
        { t: 'I will pick somewhere nobody has been and see what happens.', k: 'wanderer' },
        { t: 'I will just decide and get everyone moving.', k: 'anchor' }
      ]
    },
    {
      q: 'You have a free afternoon and no obligations at all.',
      a: [
        { t: 'I will finally fix the thing that has been broken for months.', k: 'tinkerer' },
        { t: 'I will go somewhere I have not been.', k: 'wanderer' },
        { t: 'I will message the people I have been meaning to catch up with.', k: 'anchor' },
        { t: 'I will do the thing I have been putting off.', k: 'planner' }
      ]
    },
    {
      q: 'A project lands on your desk with no instructions.',
      a: [
        { t: 'I will break it into steps before touching it.', k: 'planner' },
        { t: 'I will start and figure it out as I go.', k: 'spark' },
        { t: 'I will find somebody who has done something like it and ask.', k: 'diplomat' },
        { t: 'I will take it apart to see how it works first.', k: 'tinkerer' }
      ]
    },
    {
      q: 'You are at a party where you know almost nobody.',
      a: [
        { t: 'I will find one person and have a proper conversation.', k: 'diplomat' },
        { t: 'I will introduce myself to whoever is standing alone.', k: 'anchor' },
        { t: 'I will end up discussing something obscure with a stranger.', k: 'wanderer' },
        { t: 'I will be in the middle of the loudest group within ten minutes.', k: 'spark' }
      ]
    },
    {
      q: 'Something you organised goes wrong at the last minute.',
      a: [
        { t: 'I will rework the plan and tell everyone what changed.', k: 'planner' },
        { t: 'I will improvise something else entirely.', k: 'spark' },
        { t: 'I will make sure everyone is all right with the change first.', k: 'diplomat' },
        { t: 'I will fix the thing that broke.', k: 'tinkerer' }
      ]
    },
    {
      q: 'What does a genuinely perfect evening look like?',
      a: [
        { t: 'Everyone I like, in one room, with no agenda.', k: 'anchor' },
        { t: 'Something I have never done before.', k: 'wanderer' },
        { t: 'A quiet project and no interruptions.', k: 'tinkerer' },
        { t: 'Something with momentum that goes later than planned.', k: 'spark' }
      ]
    },
    {
      q: 'Somebody asks what you honestly think of something they made.',
      a: [
        { t: 'I will find the specific thing that works and say why.', k: 'diplomat' },
        { t: 'I will tell them exactly what I think.', k: 'anchor' },
        { t: 'I will ask what they were going for first.', k: 'planner' },
        { t: 'I will suggest three things they could try next.', k: 'spark' }
      ]
    },
    {
      q: 'A year from now, what would make you call it a good year?',
      a: [
        { t: 'I finished the things I said I would.', k: 'planner' },
        { t: 'I saw places and things I had not seen.', k: 'wanderer' },
        { t: 'The people around me are doing well.', k: 'anchor' },
        { t: 'I made something I am proud of.', k: 'tinkerer' }
      ]
    }
  ];

  function createWhatTypePerson(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var introEl = $('wtpIntro');
    var startBtn = $('wtpStartBtn');
    var quizEl = $('wtpQuiz');
    var progressEl = $('wtpProgress');
    var barEl = $('wtpBar');
    var questionEl = $('wtpQuestion');
    var optionsEl = $('wtpOptions');
    var backBtn = $('wtpBackBtn');
    var resultsEl = $('wtpResults');
    var typeEl = $('wtpType');
    var typeDescEl = $('wtpTypeDesc');
    var traitsEl = $('wtpTraits');
    var spreadEl = $('wtpSpread');
    var restartBtn = $('wtpRestartBtn');
    var copyBtn = $('wtpCopyBtn');
    var statusEl = $('wtpStatus');

    if (!startBtn || !quizEl || !optionsEl || !resultsEl) return null;

    var status = fun.makeStatus(statusEl);

    var answers = [];   // parallel to QUESTIONS: the chosen option index, or undefined
    var index = 0;

    function renderQuestion() {
      var item = QUESTIONS[index];
      if (!item) return;

      if (progressEl) progressEl.textContent = 'Question ' + (index + 1) + ' of ' + QUESTIONS.length;
      if (barEl) barEl.style.width = Math.round((index / QUESTIONS.length) * 100) + '%';
      if (questionEl) questionEl.textContent = item.q;

      if (backBtn) {
        backBtn.disabled = index === 0;
        backBtn.classList.toggle('opacity-40', index === 0);
        backBtn.classList.toggle('cursor-not-allowed', index === 0);
      }

      optionsEl.innerHTML = '';
      item.a.forEach(function (option, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        var picked = answers[index] === i;
        btn.className = 'w-full text-left p-4 rounded-xl border text-sm font-semibold transition ' +
          (picked
            ? 'bg-brand-500/10 border-brand-500 text-brand-300'
            : 'bg-gray-950 border-gray-800 hover:border-brand-500 text-gray-200');
        btn.textContent = option.t;
        btn.addEventListener('click', function () {
          answers[index] = i;
          index += 1;
          if (index >= QUESTIONS.length) finish();
          else renderQuestion();
        });
        optionsEl.appendChild(btn);
      });
    }

    function tally() {
      var scores = {};
      Object.keys(TYPES).forEach(function (key) { scores[key] = 0; });
      QUESTIONS.forEach(function (item, i) {
        var picked = answers[i];
        if (picked === undefined) return;
        scores[item.a[picked].k] += 1;
      });
      return scores;
    }

    /* Descending by score, with an alphabetical tiebreak so the order does not
     * jump between renders when two types are level — which is common. */
    function ranked(scores) {
      return Object.keys(TYPES).sort(function (a, b) {
        if (scores[b] !== scores[a]) return scores[b] - scores[a];
        return a.localeCompare(b);
      });
    }

    function answeredCount() {
      var n = 0;
      QUESTIONS.forEach(function (_, i) { if (answers[i] !== undefined) n += 1; });
      return n;
    }

    function finish() {
      quizEl.classList.add('hidden');
      resultsEl.classList.remove('hidden');
      if (barEl) barEl.style.width = '100%';

      var scores = tally();
      var answered = answeredCount();
      var order = ranked(scores);
      var top = TYPES[order[0]];

      if (typeEl) typeEl.textContent = top.name;
      if (typeDescEl) typeDescEl.textContent = top.desc;

      if (traitsEl) {
        traitsEl.innerHTML = '';
        top.traits.forEach(function (trait) {
          var chip = document.createElement('span');
          chip.className = 'px-3 py-1.5 rounded-full text-[11px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20';
          chip.textContent = trait;
          traitsEl.appendChild(chip);
        });
      }

      /* The full spread, not just the winner. Most people land within a point
       * or two of two or three types, and showing only the top one would
       * present a coin-flip margin as a settled answer. */
      if (spreadEl) {
        spreadEl.innerHTML = '';
        order.forEach(function (key) {
          var pct = answered ? Math.round((scores[key] / answered) * 100) : 0;
          var row = document.createElement('div');
          row.className = 'space-y-1';

          var label = document.createElement('div');
          label.className = 'flex items-center justify-between text-[11px]';
          var nameSpan = document.createElement('span');
          nameSpan.className = key === order[0] ? 'text-brand-400 font-bold' : 'text-gray-400';
          nameSpan.textContent = TYPES[key].name;
          var pctSpan = document.createElement('span');
          pctSpan.className = 'text-gray-500 font-mono';
          pctSpan.textContent = pct + '%';
          label.appendChild(nameSpan);
          label.appendChild(pctSpan);

          var track = document.createElement('div');
          track.className = 'h-1.5 bg-gray-900 rounded-full overflow-hidden';
          var fill = document.createElement('div');
          fill.className = 'h-full ' + (key === order[0] ? 'bg-brand-500' : 'bg-gray-700');
          fill.style.width = pct + '%';
          track.appendChild(fill);

          row.appendChild(label);
          row.appendChild(track);
          spreadEl.appendChild(row);
        });
      }

      status.hide();
    }

    /* ------------------------------------------------------------- wiring */

    function start() {
      answers = [];
      index = 0;
      if (introEl) introEl.classList.add('hidden');
      resultsEl.classList.add('hidden');
      quizEl.classList.remove('hidden');
      status.hide();
      renderQuestion();
    }

    startBtn.addEventListener('click', start);

    if (backBtn) {
      backBtn.addEventListener('click', function () {
        if (index === 0) return;
        index -= 1;
        renderQuestion();
      });
    }

    if (restartBtn) {
      restartBtn.addEventListener('click', function () {
        resultsEl.classList.add('hidden');
        quizEl.classList.add('hidden');
        if (introEl) introEl.classList.remove('hidden');
        if (barEl) barEl.style.width = '0%';
        status.hide();
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!answers.length) {
          status.show('Answer the questions first.', 'warn');
          return;
        }
        var scores = tally();
        var answered = answeredCount();
        var order = ranked(scores);
        var lines = order.map(function (key) {
          return TYPES[key].name + ': ' + Math.round((scores[key] / answered) * 100) + '%';
        });
        fun.copy('What type of person am I? — ' + TYPES[order[0]].name + '\n\n' +
          lines.join('\n') + '\n\n(A game, not a measurement.)', status);
      });
    }

    status.show('Ten questions, six types, and a game rather than a measurement. Nothing here is a diagnosis.', 'info');

    return { start: start };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createWhatTypePerson = createWhatTypePerson;
})(window, document);

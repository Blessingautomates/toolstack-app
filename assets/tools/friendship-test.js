/**
 * ToolStack AI — Friendship Test engine.
 *
 * Ids required in tools/friendship-test.html:
 *   friendsStatus, friendsIntro, friendsStartBtn, friendsQuiz, friendsProgress,
 *   friendsBar, friendsQuestion, friendsOptions, friendsBackBtn, friendsResults,
 *   friendsScoreNum, friendsBand, friendsBandText, friendsReview,
 *   friendsRestartBtn
 *
 * One thing it is important to be straight about, because the page says it too:
 * this is a scored quiz, and a score is not a measurement. There is no research
 * behind the weights below and there is no such thing as a friendship index.
 * The questions are weighted by what felt right while writing them, which is a
 * fine way to build a party game and a terrible way to build an assessment.
 * Nothing here should be used to judge a real relationship, and no result is
 * worth an argument.
 *
 * Mechanically this is a stepper: one question at a time, a running score, and
 * a band at the end. Answers are kept so the result screen can show what was
 * picked rather than only a number — a bare score out of 48 means nothing to
 * the person reading it, but "you said you would help them move house" does.
 *
 * Every question is deliberately low-stakes and none of them ask the user to
 * disclose anything private. Someone should be able to play this with a friend
 * looking over their shoulder.
 */
(function (window, document) {
  'use strict';

  /*
   * Each option carries its own weight. The weights are not equal-spaced on
   * purpose: a couple of questions have a genuinely obvious "yes obviously"
   * answer and are worth more, which keeps the total from flattening out.
   */
  var QUESTIONS = [
    {
      q: 'How long have you known each other?',
      a: [
        { t: 'A few months', p: 1 },
        { t: 'A couple of years', p: 2 },
        { t: 'Most of a decade', p: 3 },
        { t: 'Since before either of us had opinions', p: 4 }
      ]
    },
    {
      q: 'How often do you actually speak?',
      a: [
        { t: 'Once or twice a year', p: 1 },
        { t: 'Every few months', p: 2 },
        { t: 'Most weeks', p: 3 },
        { t: 'Most days, usually about nothing', p: 4 }
      ]
    },
    {
      q: 'Do you know their birthday without checking?',
      a: [
        { t: 'No idea', p: 1 },
        { t: 'I know the month', p: 2 },
        { t: 'I know the day, I sometimes forget to say anything', p: 3 },
        { t: 'Yes, and I am already planning something', p: 4 }
      ]
    },
    {
      q: 'You are walking past their street. What happens?',
      a: [
        { t: 'I keep walking, they are probably busy', p: 1 },
        { t: 'I send a text saying I was nearby', p: 2 },
        { t: 'I knock, fully prepared to be turned away', p: 3 },
        { t: 'I knock and I am staying for dinner', p: 4 }
      ]
    },
    {
      q: 'Is there an in-joke that makes no sense to anybody else?',
      a: [
        { t: 'Not really', p: 1 },
        { t: 'There is one, but I would have to explain it', p: 2 },
        { t: 'Yes, and saying two words sets us both off', p: 4 },
        { t: 'Several, and one of them is a noise', p: 3 }
      ]
    },
    {
      q: 'They are moving house this weekend.',
      a: [
        { t: 'I am busy, and I say so', p: 1 },
        { t: 'I send a message wishing them luck', p: 2 },
        { t: 'I turn up for the morning', p: 3 },
        { t: 'I am there at eight and I have brought the van', p: 4 }
      ]
    },
    {
      q: 'How do your messages look?',
      a: [
        { t: 'Proper sentences, greetings, sign-offs', p: 2 },
        { t: 'Short and functional', p: 2 },
        { t: 'Twenty messages in a row with no reply needed', p: 4 },
        { t: 'Mostly links and no context', p: 3 }
      ]
    },
    {
      q: 'Have you ever had a proper falling out?',
      a: [
        { t: 'Never', p: 2 },
        { t: 'Once, and we never really sorted it', p: 1 },
        { t: 'Yes, and we got past it', p: 4 },
        { t: 'Several times, it is basically weather at this point', p: 3 }
      ]
    },
    {
      q: 'Do you know how they take their tea or coffee?',
      a: [
        { t: 'Not a clue', p: 1 },
        { t: 'Roughly', p: 2 },
        { t: 'Exactly, and I would get it right under pressure', p: 4 },
        { t: 'They do not drink it, and I know why', p: 3 }
      ]
    },
    {
      q: 'They ask to borrow your phone, unlocked.',
      a: [
        { t: 'No', p: 1 },
        { t: 'I would hand it over but hover', p: 2 },
        { t: 'Fine, and I would not think about it again', p: 4 },
        { t: 'They already know the passcode', p: 3 }
      ]
    },
    {
      q: 'What time do your best conversations happen?',
      a: [
        { t: 'In person, planned, in daylight', p: 2 },
        { t: 'On the phone, occasionally', p: 2 },
        { t: 'Late at night, when neither of us should be awake', p: 4 },
        { t: 'In the group chat, as a performance for others', p: 2 }
      ]
    },
    {
      q: 'They call you from a police station. What is your first question?',
      a: [
        { t: 'How did you get this number', p: 1 },
        { t: 'Are you alright', p: 3 },
        { t: 'What have you done', p: 3 },
        { t: 'I am already in the car, tell me where', p: 4 }
      ]
    }
  ];

  /*
   * Bands are written to be affectionate at every level. The lowest band is
   * not an insult and the highest is not a diagnosis — a quiz that makes
   * somebody feel bad about a friendship is a badly designed quiz.
   */
  var BANDS = [
    {
      min: 0,
      name: 'Acquaintance with potential',
      text: 'You know each other, and that is genuinely where every friendship starts. Nothing here says this one cannot grow into something enormous — it says you have not done the years yet.'
    },
    {
      min: 30,
      name: 'Solid mate',
      text: 'You show up, you remember the important bits, and you are reliably there when it matters. This is the tier most friendships actually live in, and it is a good place to live.'
    },
    {
      min: 39,
      name: 'Proper friend',
      text: 'You have the in-jokes, the late-night conversations and the willingness to spend a Saturday carrying somebody else’s sofa. That combination is rarer than it sounds.'
    },
    {
      min: 45,
      name: 'Ride or die',
      text: 'You would be in the car before they finished the sentence. Keep hold of this one, and tell them occasionally — people rarely hear it.'
    }
  ];

  function createFriendshipTest(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var introEl = $('friendsIntro');
    var startBtn = $('friendsStartBtn');
    var quizEl = $('friendsQuiz');
    var progressEl = $('friendsProgress');
    var barEl = $('friendsBar');
    var questionEl = $('friendsQuestion');
    var optionsEl = $('friendsOptions');
    var backBtn = $('friendsBackBtn');
    var resultsEl = $('friendsResults');
    var scoreEl = $('friendsScoreNum');
    var bandEl = $('friendsBand');
    var bandTextEl = $('friendsBandText');
    var reviewEl = $('friendsReview');
    var restartBtn = $('friendsRestartBtn');
    var statusEl = $('friendsStatus');

    if (!startBtn || !quizEl || !optionsEl || !resultsEl) return null;

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

    function hideStatus() {
      if (statusEl) statusEl.classList.add('hidden');
    }

    var answers = [];
    var index = 0;

    var MAX = QUESTIONS.reduce(function (sum, question) {
      return sum + Math.max.apply(null, question.a.map(function (o) { return o.p; }));
    }, 0);

    function renderQuestion() {
      var question = QUESTIONS[index];
      if (!question) return;

      if (progressEl) progressEl.textContent = 'Question ' + (index + 1) + ' of ' + QUESTIONS.length;
      if (barEl) {
        var pct = Math.round((index / QUESTIONS.length) * 100);
        barEl.style.width = pct + '%';
      }
      if (questionEl) questionEl.textContent = question.q;

      optionsEl.innerHTML = '';
      question.a.forEach(function (option, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className =
          'w-full text-left px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 ' +
          'hover:border-brand-500 hover:bg-gray-900 text-sm text-gray-300 ' +
          'hover:text-gray-100 transition font-medium';
        btn.textContent = option.t;
        // Marked with the option index rather than the text so the review screen
        // can find the choice again even though several options share wording.
        btn.setAttribute('data-option', String(i));
        btn.addEventListener('click', function () { choose(i); });
        optionsEl.appendChild(btn);
      });

      if (backBtn) backBtn.classList.toggle('hidden', index === 0);
    }

    function choose(optionIndex) {
      var question = QUESTIONS[index];
      var option = question.a[optionIndex];
      if (!option) return;

      answers[index] = optionIndex;
      index += 1;

      if (index >= QUESTIONS.length) finish();
      else renderQuestion();
    }

    function score() {
      return answers.reduce(function (sum, optionIndex, i) {
        var question = QUESTIONS[i];
        if (!question || optionIndex === undefined) return sum;
        return sum + question.a[optionIndex].p;
      }, 0);
    }

    function bandFor(value) {
      var found = BANDS[0];
      for (var i = 0; i < BANDS.length; i++) {
        if (value >= BANDS[i].min) found = BANDS[i];
      }
      return found;
    }

    function finish() {
      var value = score();
      var band = bandFor(value);

      quizEl.classList.add('hidden');
      resultsEl.classList.remove('hidden');

      if (scoreEl) scoreEl.textContent = value + ' / ' + MAX;
      if (bandEl) bandEl.textContent = band.name;
      if (bandTextEl) bandTextEl.textContent = band.text;

      if (reviewEl) {
        reviewEl.innerHTML = '';
        QUESTIONS.forEach(function (question, i) {
          var chosen = question.a[answers[i]];
          if (!chosen) return;
          var row = document.createElement('div');
          row.className = 'py-2 border-b border-gray-800 last:border-0';
          var q = document.createElement('p');
          q.className = 'text-[11px] text-gray-500';
          q.textContent = question.q;
          var a = document.createElement('p');
          a.className = 'text-xs text-gray-300 mt-0.5';
          a.textContent = chosen.t;
          row.appendChild(q);
          row.appendChild(a);
          reviewEl.appendChild(row);
        });
      }

      hideStatus();
    }

    function start() {
      answers = [];
      index = 0;
      if (introEl) introEl.classList.add('hidden');
      if (resultsEl) resultsEl.classList.add('hidden');
      quizEl.classList.remove('hidden');
      hideStatus();
      renderQuestion();
    }

    startBtn.addEventListener('click', start);

    if (restartBtn) {
      restartBtn.addEventListener('click', function () {
        resultsEl.classList.add('hidden');
        if (introEl) introEl.classList.remove('hidden');
        quizEl.classList.add('hidden');
        hideStatus();
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', function () {
        if (index === 0) return;
        index -= 1;
        // Clearing the stored answer as we step back means going forward again
        // re-asks rather than silently reusing the previous choice.
        answers.length = index;
        renderQuestion();
      });
    }

    return { start: start };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createFriendshipTest = createFriendshipTest;
})(window, document);

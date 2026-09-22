/**
 * ToolStack AI — Couple Compatibility engine.
 *
 * Ids required in tools/couple-compatibility.html:
 *   coupleStatus, coupleIntro, coupleStartBtn, coupleAName, coupleBName,
 *   coupleQuiz, coupleTurn, coupleProgress, coupleBar, coupleQuestion,
 *   coupleOptions, coupleResults, coupleScore, coupleVerdict, coupleBreakdown,
 *   coupleRestartBtn
 *
 * Read this before changing anything here.
 *
 * This tool does not measure compatibility, and the page says so in three
 * places. What it actually does is count how often two people pick the same
 * option out of ten either/or questions. That number is real; the meaning
 * attached to it is not. Agreeing about beaches versus mountains tells you
 * nothing about whether two people can build a life together, and the copy is
 * written so that nobody closes the tab believing otherwise.
 *
 * That is why the verdict language is deliberately soft and why there is no
 * percentage framed as a prediction. A couple who score 20% have disagreed
 * about some preferences. They have not failed at anything.
 *
 * Mechanically this is a two-pass compare rather than a scored quiz, which is
 * what makes it a different tool from the friendship test: nobody is being
 * graded, and the interesting output is the per-question breakdown showing
 * exactly where the two sets of answers diverged.
 */
(function (window, document) {
  'use strict';

  var QUESTIONS = [
    { q: 'Beach or mountains?', a: ['Beach', 'Mountains'] },
    { q: 'Long message or quick call?', a: ['Long message', 'Quick call'] },
    { q: 'Plan it properly or wing it?', a: ['Plan it properly', 'Wing it'] },
    { q: 'Early night or late night?', a: ['Early night', 'Late night'] },
    { q: 'Film at home or cinema?', a: ['Film at home', 'Cinema'] },
    { q: 'Save it or spend it?', a: ['Save it', 'Spend it'] },
    { q: 'Coffee or tea?', a: ['Coffee', 'Tea'] },
    { q: 'Big group or just the two of you?', a: ['Big group', 'Just the two of us'] },
    { q: 'Talk it out now or sleep on it?', a: ['Talk it out now', 'Sleep on it'] },
    { q: 'City or countryside?', a: ['City', 'Countryside'] }
  ];

  /*
   * Soft throughout, on purpose. The high band does not congratulate anyone on
   * a relationship and the low band does not warn them about one — it notes
   * that they differ, which is a fact about ten questions and nothing more.
   */
  var VERDICTS = [
    { min: 0, name: 'Different wiring', text: 'You picked differently on most of these. That is a fact about ten either/or questions and nothing else — plenty of people who disagree about beaches build very good lives together.' },
    { min: 30, name: 'Overlapping', text: 'You match on some of it and not the rest, which is what most pairs look like on a list of arbitrary preferences. The mismatches are the interesting part.' },
    { min: 55, name: 'Largely aligned', text: 'You agreed on more than half. It makes the small decisions easier, which is a genuine convenience and not a measure of anything deeper.' },
    { min: 80, name: 'Rarely split', text: 'You picked the same answer almost every time. Enjoy the fact that nobody has to negotiate where to eat.' }
  ];

  function createCoupleCompatibility(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var introEl = $('coupleIntro');
    var startBtn = $('coupleStartBtn');
    var nameAEl = $('coupleAName');
    var nameBEl = $('coupleBName');
    var quizEl = $('coupleQuiz');
    var turnEl = $('coupleTurn');
    var progressEl = $('coupleProgress');
    var barEl = $('coupleBar');
    var questionEl = $('coupleQuestion');
    var optionsEl = $('coupleOptions');
    var resultsEl = $('coupleResults');
    var scoreEl = $('coupleScore');
    var verdictEl = $('coupleVerdict');
    var breakdownEl = $('coupleBreakdown');
    var restartBtn = $('coupleRestartBtn');
    var statusEl = $('coupleStatus');

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

    function cleanName(el, fallback) {
      var value = el && el.value ? el.value.trim() : '';
      return value ? value.slice(0, 24) : fallback;
    }

    /* answers[0] is the first person's pass, answers[1] the second. Keeping
     * them as two arrays rather than one flat list is what lets the breakdown
     * line the two passes up question by question. */
    var answers = [[], []];
    var pass = 0;
    var index = 0;
    var names = ['Player 1', 'Player 2'];

    function renderQuestion() {
      var question = QUESTIONS[index];
      if (!question) return;

      if (turnEl) {
        turnEl.textContent = names[pass] + '’s turn';
      }
      if (progressEl) {
        progressEl.textContent =
          'Question ' + (index + 1) + ' of ' + QUESTIONS.length +
          ' · pass ' + (pass + 1) + ' of 2';
      }
      if (barEl) {
        var done = pass * QUESTIONS.length + index;
        barEl.style.width = Math.round((done / (QUESTIONS.length * 2)) * 100) + '%';
      }
      if (questionEl) questionEl.textContent = question.q;

      optionsEl.innerHTML = '';
      question.a.forEach(function (label, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className =
          'w-full text-left px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 ' +
          'hover:border-brand-500 hover:bg-gray-900 text-sm text-gray-300 ' +
          'hover:text-gray-100 transition font-medium';
        btn.textContent = label;
        btn.addEventListener('click', function () { choose(i); });
        optionsEl.appendChild(btn);
      });
    }

    function choose(optionIndex) {
      answers[pass][index] = optionIndex;
      index += 1;

      if (index >= QUESTIONS.length) {
        index = 0;
        pass += 1;
        if (pass > 1) {
          finish();
          return;
        }
        showStatus(names[1] + ', you are up. Same questions — do not look at the other screen.', 'info');
      }
      renderQuestion();
    }

    function finish() {
      var matches = 0;
      for (var i = 0; i < QUESTIONS.length; i++) {
        if (answers[0][i] === answers[1][i]) matches += 1;
      }
      var pct = Math.round((matches / QUESTIONS.length) * 100);

      var verdict = VERDICTS[0];
      for (var v = 0; v < VERDICTS.length; v++) {
        if (pct >= VERDICTS[v].min) verdict = VERDICTS[v];
      }

      quizEl.classList.add('hidden');
      resultsEl.classList.remove('hidden');
      if (barEl) barEl.style.width = '100%';

      if (scoreEl) scoreEl.textContent = matches + ' of ' + QUESTIONS.length + ' the same (' + pct + '%)';
      if (verdictEl) verdictEl.textContent = verdict.name + '. ' + verdict.text;

      if (breakdownEl) {
        breakdownEl.innerHTML = '';
        QUESTIONS.forEach(function (question, i) {
          var same = answers[0][i] === answers[1][i];
          var row = document.createElement('div');
          row.className = 'py-2.5 border-b border-gray-800 last:border-0';

          var head = document.createElement('div');
          head.className = 'flex items-center justify-between gap-3';
          var q = document.createElement('p');
          q.className = 'text-[11px] text-gray-500';
          q.textContent = question.q;
          var mark = document.createElement('span');
          mark.className = 'text-[10px] font-bold uppercase tracking-wider ' +
            (same ? 'text-emerald-400' : 'text-amber-400');
          mark.textContent = same ? 'Same' : 'Split';
          head.appendChild(q);
          head.appendChild(mark);

          var picks = document.createElement('p');
          picks.className = 'text-xs text-gray-300 mt-1';
          picks.textContent =
            names[0] + ': ' + question.a[answers[0][i]] +
            '  ·  ' + names[1] + ': ' + question.a[answers[1][i]];

          row.appendChild(head);
          row.appendChild(picks);
          breakdownEl.appendChild(row);
        });
      }

      hideStatus();
    }

    function start() {
      names = [cleanName(nameAEl, 'Player 1'), cleanName(nameBEl, 'Player 2')];
      answers = [[], []];
      pass = 0;
      index = 0;

      if (introEl) introEl.classList.add('hidden');
      resultsEl.classList.add('hidden');
      quizEl.classList.remove('hidden');

      showStatus(names[0] + ' goes first. ' + names[1] + ' should look away.', 'info');
      renderQuestion();
    }

    startBtn.addEventListener('click', start);

    if (restartBtn) {
      restartBtn.addEventListener('click', function () {
        resultsEl.classList.add('hidden');
        quizEl.classList.add('hidden');
        if (introEl) introEl.classList.remove('hidden');
        if (barEl) barEl.style.width = '0%';
        hideStatus();
      });
    }

    return { start: start };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createCoupleCompatibility = createCoupleCompatibility;
})(window, document);

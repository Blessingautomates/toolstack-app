/**
 * ToolStack AI — General Knowledge Quiz engine.
 *
 * Ids required in tools/general-knowledge-quiz.html:
 *   gkStatus, gkIntro, gkStartBtn, gkQuiz, gkProgress, gkBar, gkQuestion,
 *   gkOptions, gkPrevBtn, gkNextBtn, gkResults, gkScore, gkBand, gkReview,
 *   gkRestartBtn, gkCopyBtn
 *
 * This is a paper, not a round, and the difference is deliberate. The fifteen
 * questions are the same fifteen in the same order every time, answers are held
 * back until the end, and you can move backwards to change your mind. That is
 * the format of a pub quiz sheet, and it is what makes the result comparable:
 * two people can take this paper and argue about who did better, which is
 * impossible with a quiz that reshuffles for each attempt.
 *
 * The trivia quiz next door is the opposite design on purpose — shuffled, ten
 * questions, marked as you go. Having both is the point; they are different
 * games rather than one game with two names.
 *
 * Every question carries an explanation that appears in the review at the end.
 * A quiz that only tells you that you were wrong teaches nothing, and several
 * of these questions are ones people get wrong for an interesting reason: the
 * Australian capital, the prime number, the boiling point that moves with
 * altitude. The explanation is where the value is.
 *
 * The questions avoid anything that goes stale. No current holders, no
 * population figures, no "tallest building" records. A paper whose answers
 * expire is a paper that quietly becomes wrong.
 */
(function (window, document) {
  'use strict';

  var PAPER = [
    {
      q: 'What is the capital of Australia?',
      o: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
      k: 2,
      why: 'Sydney is the largest city but not the capital. Canberra was purpose-built as a compromise between Sydney and Melbourne, which were both competing for the role.'
    },
    {
      q: 'What is the largest planet in the Solar System?',
      o: ['Saturn', 'Jupiter', 'Neptune', 'Earth'],
      k: 1,
      why: 'Jupiter is more massive than every other planet in the Solar System combined.'
    },
    {
      q: 'What is the chemical symbol for sodium?',
      o: ['So', 'Sd', 'Na', 'Nu'],
      k: 2,
      why: 'It comes from the Latin natrium, which is why the symbol does not match the English name.'
    },
    {
      q: 'How many minutes are there in a full day?',
      o: ['1,200', '1,440', '1,680', '2,400'],
      k: 1,
      why: 'Twenty-four hours multiplied by sixty minutes is 1,440.'
    },
    {
      q: 'In which country is the ancient city of Petra?',
      o: ['Egypt', 'Jordan', 'Lebanon', 'Turkey'],
      k: 1,
      why: 'Petra is carved directly into rock faces in southern Jordan. It was unknown to the outside world until 1812.'
    },
    {
      q: 'Who wrote the novel Pride and Prejudice?',
      o: ['Jane Austen', 'Charlotte Brontë', 'George Eliot', 'Mary Shelley'],
      k: 0,
      why: 'Austen published it in 1813. Charlotte Brontë wrote Jane Eyre, and Mary Shelley wrote Frankenstein.'
    },
    {
      q: 'What is the smallest prime number?',
      o: ['Zero', 'One', 'Two', 'Three'],
      k: 2,
      why: 'A prime has exactly two distinct factors. One has only a single factor, so it is not prime. Two is the smallest, and the only even one.'
    },
    {
      q: 'Which is the largest ocean on Earth?',
      o: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
      k: 3,
      why: 'The Pacific covers more area than all of the land on Earth put together.'
    },
    {
      q: 'What is the currency of Japan?',
      o: ['The won', 'The yen', 'The yuan', 'The baht'],
      k: 1,
      why: 'The won is Korean, the yuan is Chinese and the baht is Thai.'
    },
    {
      q: 'Who developed the theory of general relativity?',
      o: ['Isaac Newton', 'Niels Bohr', 'Albert Einstein', 'Max Planck'],
      k: 2,
      why: 'Einstein published general relativity in 1915, a decade after special relativity.'
    },
    {
      q: 'What is the study of plants called?',
      o: ['Zoology', 'Botany', 'Mycology', 'Ecology'],
      k: 1,
      why: 'Zoology is animals and mycology is fungi. Ecology is the study of relationships between organisms and their environment, which is a different question.'
    },
    {
      q: 'How many pieces does each player start with in chess?',
      o: ['Twelve', 'Fourteen', 'Sixteen', 'Twenty'],
      k: 2,
      why: 'Eight pawns and eight pieces — two rooks, two knights, two bishops, a queen and a king.'
    },
    {
      q: 'Which is the tallest species of tree?',
      o: ['Eucalyptus', 'Coast redwood', 'Douglas fir', 'Sitka spruce'],
      k: 1,
      why: 'Coast redwoods in California include the tallest living trees on Earth, one of which is over 115 metres.'
    },
    {
      q: 'Which planet is known as the Red Planet?',
      o: ['Venus', 'Mars', 'Mercury', 'Jupiter'],
      k: 1,
      why: 'The colour comes from iron oxide — essentially rust — in the surface dust.'
    },
    {
      q: 'At sea level, what is the boiling point of water in Celsius?',
      o: ['90°C', '100°C', '110°C', '120°C'],
      k: 1,
      why: 'One hundred degrees at sea level, but it falls as you climb. Near the summit of Everest water boils at roughly 70°C.'
    }
  ];

  function createGeneralKnowledgeQuiz(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var introEl = $('gkIntro');
    var startBtn = $('gkStartBtn');
    var quizEl = $('gkQuiz');
    var progressEl = $('gkProgress');
    var barEl = $('gkBar');
    var questionEl = $('gkQuestion');
    var optionsEl = $('gkOptions');
    var prevBtn = $('gkPrevBtn');
    var nextBtn = $('gkNextBtn');
    var resultsEl = $('gkResults');
    var scoreEl = $('gkScore');
    var bandEl = $('gkBand');
    var reviewEl = $('gkReview');
    var restartBtn = $('gkRestartBtn');
    var copyBtn = $('gkCopyBtn');
    var statusEl = $('gkStatus');

    if (!startBtn || !quizEl || !optionsEl || !resultsEl) return null;

    var status = fun.makeStatus(statusEl);

    var answers = [];
    var index = 0;

    var BASE =
      'w-full text-left p-4 rounded-xl border text-sm font-semibold transition ';

    function renderQuestion() {
      var item = PAPER[index];
      if (!item) return;

      if (progressEl) progressEl.textContent = 'Question ' + (index + 1) + ' of ' + PAPER.length;
      if (barEl) barEl.style.width = Math.round((index / PAPER.length) * 100) + '%';
      if (questionEl) questionEl.textContent = item.q;

      if (prevBtn) {
        prevBtn.disabled = index === 0;
        prevBtn.classList.toggle('opacity-40', index === 0);
        prevBtn.classList.toggle('cursor-not-allowed', index === 0);
      }
      if (nextBtn) {
        nextBtn.textContent = index + 1 >= PAPER.length ? 'Finish and see the answers' : 'Next';
      }

      optionsEl.innerHTML = '';
      item.o.forEach(function (label, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        var picked = answers[index] === i;
        /* Selection is the only feedback on offer here. Nothing is marked right
         * or wrong until the end, because the whole point of a paper is that
         * you do not find out until you hand it in. */
        btn.className = BASE + (picked
          ? 'bg-brand-500/10 border-brand-500 text-brand-300'
          : 'bg-gray-950 border-gray-800 hover:border-brand-500 text-gray-200');
        btn.textContent = label;
        btn.addEventListener('click', function () {
          answers[index] = i;
          renderQuestion();
        });
        optionsEl.appendChild(btn);
      });
    }

    function back() {
      if (index === 0) return;
      index -= 1;
      renderQuestion();
    }

    function forward() {
      if (answers[index] === undefined) {
        status.show('Pick an answer, or leave it blank and come back to it.', 'warn');
        return;
      }
      index += 1;
      if (index >= PAPER.length) finish();
      else renderQuestion();
    }

    /* Blank answers are allowed through to the end. A paper you cannot hand in
     * half-finished is a paper that punishes the honest "I do not know", and
     * that is exactly the answer a quiz should be able to record. */
    function finish() {
      var blanks = 0;
      for (var i = 0; i < PAPER.length; i++) if (answers[i] === undefined) blanks += 1;

      if (blanks > 0) {
        var unanswered = [];
        for (var j = 0; j < PAPER.length; j++) if (answers[j] === undefined) unanswered.push(j + 1);
        status.show('Question' + (unanswered.length === 1 ? ' ' : 's ') + unanswered.join(', ') +
          ' left blank. Blank counts as wrong, so the score is final.', 'warn');
      }

      quizEl.classList.add('hidden');
      resultsEl.classList.remove('hidden');
      if (barEl) barEl.style.width = '100%';

      var score = 0;
      PAPER.forEach(function (item, i) { if (answers[i] === item.k) score += 1; });

      if (scoreEl) scoreEl.textContent = score + ' / ' + PAPER.length;

      var band;
      if (score === PAPER.length) band = 'Full marks. Nothing to add.';
      else if (score >= 13) band = 'Strong paper. A couple of gaps at most.';
      else if (score >= 9) band = 'A respectable middle. Most of it landed.';
      else if (score >= 5) band = 'Roughly a third. The explanations below are worth a read.';
      else band = 'A difficult paper this time. The explanations are the useful part.';
      if (bandEl) bandEl.textContent = band;

      if (reviewEl) {
        reviewEl.innerHTML = '';

        PAPER.forEach(function (item, i) {
          var got = answers[i];
          var right = got === item.k;

          var card = document.createElement('div');
          card.className = 'border-t border-gray-800 pt-4 mt-4 first:border-t-0 first:pt-0 first:mt-0';

          var head = document.createElement('p');
          head.className = 'text-xs font-bold leading-snug ' + (right ? 'text-emerald-400' : 'text-rose-400');
          head.textContent = (right ? '✓ ' : '✗ ') + (i + 1) + '. ' + item.q;
          card.appendChild(head);

          var yours = document.createElement('p');
          yours.className = 'text-[11px] text-gray-400 mt-2';
          yours.textContent = 'Your answer: ' + (got === undefined ? 'left blank' : item.o[got]);
          card.appendChild(yours);

          if (!right) {
            var correct = document.createElement('p');
            correct.className = 'text-[11px] text-emerald-400 mt-1';
            correct.textContent = 'Correct answer: ' + item.o[item.k];
            card.appendChild(correct);
          }

          var why = document.createElement('p');
          why.className = 'text-[11px] text-gray-500 mt-2 leading-relaxed';
          why.textContent = item.why;
          card.appendChild(why);

          reviewEl.appendChild(card);
        });
      }
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
    if (nextBtn) nextBtn.addEventListener('click', forward);
    if (prevBtn) prevBtn.addEventListener('click', back);

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
          status.show('Take the paper first, then copy the result.', 'warn');
          return;
        }
        var score = 0;
        PAPER.forEach(function (item, i) { if (answers[i] === item.k) score += 1; });
        var lines = PAPER.map(function (item, i) {
          var got = answers[i];
          return (got === item.k ? 'Correct' : 'Wrong') + ' — ' + item.q +
            ' (you said ' + (got === undefined ? 'nothing' : item.o[got]) + ', answer ' + item.o[item.k] + ')';
        });
        fun.copy('General Knowledge Quiz — ' + score + '/' + PAPER.length + '\n\n' + lines.join('\n'), status);
      });
    }

    status.show('Fifteen questions, the same paper every time. Nothing is marked until the end.', 'info');

    return { start: start };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createGeneralKnowledgeQuiz = createGeneralKnowledgeQuiz;
})(window, document);

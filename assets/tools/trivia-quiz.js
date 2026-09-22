/**
 * ToolStack AI — Trivia Quiz engine.
 *
 * Ids required in tools/trivia-quiz.html:
 *   trivStatus, trivIntro, trivStartBtn, trivCategory, trivQuiz, trivProgress,
 *   trivBar, trivQuestion, trivOptions, trivFeedback, trivNextBtn, trivResults,
 *   trivScore, trivBand, trivReview, trivRestartBtn, trivCopyBtn
 *
 * A shuffled ten-question round drawn from a pool of forty-eight, optionally
 * filtered to a category. Answers are marked the moment you pick, which is the
 * difference between this and the general knowledge paper on this site: here
 * the feedback is immediate and the point is the pace, whereas the paper holds
 * everything back to the end so it plays like a real quiz sheet.
 *
 * Two things the quiz deliberately does not do. It does not time you, because a
 * countdown turns a bit of fun into a stress test and the questions are not
 * written for speed. And it does not claim the score means anything — a ten
 * question sample from a mixed pool says how you did on those ten questions and
 * nothing else.
 *
 * Every answer in the pool is a settled fact rather than a matter of opinion,
 * and the questions avoid the categories that go stale: no "current" holders of
 * anything, no population figures, no records that move every few years. A quiz
 * whose answers expire is a quiz that quietly becomes wrong.
 */
(function (window, document) {
  'use strict';

  var ROUNDS = 10;

  var QUESTIONS = [
    /* -------------------------------------------------------------- science */
    { c: 'science', q: 'What is the chemical symbol for gold?', o: ['Au', 'Ag', 'Gd', 'Go'], k: 0 },
    { c: 'science', q: 'How many bones are in the adult human body?', o: ['186', '206', '226', '246'], k: 1 },
    { c: 'science', q: 'Which gas do plants absorb from the atmosphere for photosynthesis?', o: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], k: 2 },
    { c: 'science', q: 'What is the hardest naturally occurring substance?', o: ['Quartz', 'Granite', 'Titanium', 'Diamond'], k: 3 },
    { c: 'science', q: 'How many chambers does the human heart have?', o: ['Two', 'Three', 'Four', 'Five'], k: 2 },
    { c: 'science', q: 'Which gas is the most abundant in Earth’s atmosphere?', o: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Argon'], k: 1 },
    { c: 'science', q: 'Which planet is closest to the Sun?', o: ['Venus', 'Earth', 'Mercury', 'Mars'], k: 2 },
    { c: 'science', q: 'What force keeps the planets in orbit around the Sun?', o: ['Magnetism', 'Gravity', 'Friction', 'Tension'], k: 1 },

    /* -------------------------------------------------------------- history */
    { c: 'history', q: 'In which year did the Second World War end?', o: ['1943', '1944', '1945', '1946'], k: 2 },
    { c: 'history', q: 'Who was the first person to walk on the Moon?', o: ['Buzz Aldrin', 'Neil Armstrong', 'Yuri Gagarin', 'Michael Collins'], k: 1 },
    { c: 'history', q: 'In which year did the Berlin Wall fall?', o: ['1985', '1987', '1989', '1991'], k: 2 },
    { c: 'history', q: 'Which ancient civilisation built the Colosseum?', o: ['The Greeks', 'The Egyptians', 'The Romans', 'The Persians'], k: 2 },
    { c: 'history', q: 'In which year did the Titanic sink?', o: ['1905', '1912', '1918', '1923'], k: 1 },
    { c: 'history', q: 'Who was the first President of the United States?', o: ['Thomas Jefferson', 'John Adams', 'George Washington', 'Benjamin Franklin'], k: 2 },
    { c: 'history', q: 'The Magna Carta was sealed in which year?', o: ['1066', '1215', '1348', '1415'], k: 1 },
    { c: 'history', q: 'Which country gave the Statue of Liberty to the United States?', o: ['Britain', 'Spain', 'France', 'The Netherlands'], k: 2 },

    /* ----------------------------------------------------------------- arts */
    { c: 'arts', q: 'Who painted the Mona Lisa?', o: ['Michelangelo', 'Raphael', 'Leonardo da Vinci', 'Donatello'], k: 2 },
    { c: 'arts', q: 'How many strings does a standard violin have?', o: ['Four', 'Five', 'Six', 'Seven'], k: 0 },
    { c: 'arts', q: 'Who wrote the play Romeo and Juliet?', o: ['Christopher Marlowe', 'William Shakespeare', 'Ben Jonson', 'John Webster'], k: 1 },
    { c: 'arts', q: 'How many keys does a standard piano have?', o: ['66', '76', '88', '98'], k: 2 },
    { c: 'arts', q: 'Who composed The Four Seasons?', o: ['Bach', 'Mozart', 'Vivaldi', 'Handel'], k: 2 },
    { c: 'arts', q: 'What is the Japanese art of paper folding called?', o: ['Ikebana', 'Origami', 'Calligraphy', 'Bonsai'], k: 1 },
    { c: 'arts', q: 'Which painter famously cut off part of his own ear?', o: ['Claude Monet', 'Paul Gauguin', 'Vincent van Gogh', 'Edgar Degas'], k: 2 },
    { c: 'arts', q: 'How many lines does a sonnet have?', o: ['Ten', 'Twelve', 'Fourteen', 'Sixteen'], k: 2 },

    /* ---------------------------------------------------------------- sport */
    { c: 'sport', q: 'How many players from each team are on the pitch in a football match?', o: ['Nine', 'Ten', 'Eleven', 'Twelve'], k: 2 },
    { c: 'sport', q: 'In which sport would you perform a vault?', o: ['Diving', 'Gymnastics', 'Athletics', 'Swimming'], k: 1 },
    { c: 'sport', q: 'How often are the Summer Olympic Games normally held?', o: ['Every two years', 'Every three years', 'Every four years', 'Every five years'], k: 2 },
    { c: 'sport', q: 'How many points is a touchdown worth in American football?', o: ['Three', 'Five', 'Six', 'Seven'], k: 2 },
    { c: 'sport', q: 'In tennis, what is a score of zero called?', o: ['Nil', 'Love', 'Duck', 'Blank'], k: 1 },
    { c: 'sport', q: 'How many holes are there in a standard round of golf?', o: ['Nine', 'Twelve', 'Eighteen', 'Twenty-four'], k: 2 },
    { c: 'sport', q: 'Which sport uses a shuttlecock?', o: ['Squash', 'Badminton', 'Table tennis', 'Padel'], k: 1 },
    { c: 'sport', q: 'The Davis Cup is contested in which sport?', o: ['Golf', 'Rugby', 'Tennis', 'Cricket'], k: 2 },

    /* --------------------------------------------------------------- nature */
    { c: 'nature', q: 'What is the largest animal on Earth?', o: ['African elephant', 'Blue whale', 'Giraffe', 'Colossal squid'], k: 1 },
    { c: 'nature', q: 'What is a group of lions called?', o: ['A pack', 'A herd', 'A pride', 'A flock'], k: 2 },
    { c: 'nature', q: 'How many legs does a spider have?', o: ['Six', 'Eight', 'Ten', 'Twelve'], k: 1 },
    { c: 'nature', q: 'What is the fastest land animal?', o: ['Lion', 'Pronghorn', 'Cheetah', 'Greyhound'], k: 2 },
    { c: 'nature', q: 'What is a baby kangaroo called?', o: ['A cub', 'A kit', 'A joey', 'A fawn'], k: 2 },
    { c: 'nature', q: 'Which is the only mammal capable of true sustained flight?', o: ['Flying squirrel', 'Bat', 'Colugo', 'Sugar glider'], k: 1 },
    { c: 'nature', q: 'What is the largest species of shark?', o: ['Great white', 'Tiger shark', 'Whale shark', 'Hammerhead'], k: 2 },
    { c: 'nature', q: 'How many hearts does an octopus have?', o: ['One', 'Two', 'Three', 'Four'], k: 2 },

    /* ----------------------------------------------------------- technology */
    { c: 'technology', q: 'What does CPU stand for?', o: ['Central Processing Unit', 'Computer Power Unit', 'Central Program Utility', 'Core Processing Utility'], k: 0 },
    { c: 'technology', q: 'Who co-founded Apple with Steve Jobs?', o: ['Bill Gates', 'Steve Wozniak', 'Paul Allen', 'Jack Dorsey'], k: 1 },
    { c: 'technology', q: 'How many bits are in a byte?', o: ['Four', 'Eight', 'Sixteen', 'Thirty-two'], k: 1 },
    { c: 'technology', q: 'What does URL stand for?', o: ['Universal Reference Link', 'Uniform Resource Locator', 'Unified Routing Layer', 'User Registered Location'], k: 1 },
    { c: 'technology', q: 'Which language was originally created by Sun Microsystems?', o: ['Python', 'Ruby', 'Java', 'PHP'], k: 2 },
    { c: 'technology', q: 'What does GPU stand for?', o: ['General Processing Unit', 'Graphics Processing Unit', 'Grid Power Unit', 'Global Program Utility'], k: 1 },
    { c: 'technology', q: 'What does HTML stand for?', o: ['HyperText Markup Language', 'High Level Text Management Language', 'Hyperlink and Text Markup Language', 'Home Tool Markup Language'], k: 0 },
    { c: 'technology', q: 'In which decade was the first email sent?', o: ['1950s', '1960s', '1970s', '1980s'], k: 2 }
  ];

  var CATEGORY_LABELS = {
    science: 'Science',
    history: 'History',
    arts: 'Arts and music',
    sport: 'Sport',
    nature: 'Nature',
    technology: 'Technology'
  };

  function createTriviaQuiz(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var introEl = $('trivIntro');
    var startBtn = $('trivStartBtn');
    var categoryEl = $('trivCategory');
    var quizEl = $('trivQuiz');
    var progressEl = $('trivProgress');
    var barEl = $('trivBar');
    var questionEl = $('trivQuestion');
    var optionsEl = $('trivOptions');
    var feedbackEl = $('trivFeedback');
    var nextBtn = $('trivNextBtn');
    var resultsEl = $('trivResults');
    var scoreEl = $('trivScore');
    var bandEl = $('trivBand');
    var reviewEl = $('trivReview');
    var restartBtn = $('trivRestartBtn');
    var copyBtn = $('trivCopyBtn');
    var statusEl = $('trivStatus');

    if (!startBtn || !quizEl || !optionsEl || !resultsEl) return null;

    var status = fun.makeStatus(statusEl);

    var run = [];       // the ten questions for this round
    var answers = [];   // parallel array: chosen option index, or -1
    var index = 0;
    var answered = false;

    /* ---------------------------------------------------------- rendering */

    function pool() {
      var want = categoryEl ? categoryEl.value : 'all';
      if (!want || want === 'all') return QUESTIONS.slice();
      return QUESTIONS.filter(function (item) { return item.c === want; });
    }

    function renderQuestion() {
      var item = run[index];
      if (!item) return;

      answered = false;
      if (progressEl) progressEl.textContent = 'Question ' + (index + 1) + ' of ' + run.length;
      if (barEl) barEl.style.width = Math.round((index / run.length) * 100) + '%';
      if (questionEl) questionEl.textContent = item.q;
      if (feedbackEl) { feedbackEl.textContent = ''; feedbackEl.className = 'hidden mt-4 p-3 rounded-xl text-xs font-medium border'; }
      if (nextBtn) nextBtn.classList.add('hidden');

      optionsEl.innerHTML = '';
      item.o.forEach(function (label, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className =
          'w-full text-left p-4 rounded-xl bg-gray-950 border border-gray-800 ' +
          'hover:border-brand-500 text-sm font-semibold text-gray-200 transition';
        btn.textContent = label;
        btn.addEventListener('click', function () { choose(i); });
        optionsEl.appendChild(btn);
      });
    }

    function choose(pick) {
      if (answered) return;
      answered = true;

      var item = run[index];
      answers[index] = pick;
      var correct = pick === item.k;

      /* Colour the buttons in place rather than re-rendering, so the row does
       * not jump at the exact moment the user is looking at it. */
      var buttons = optionsEl.querySelectorAll('button');
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
        buttons[i].classList.remove('hover:border-brand-500');
        if (i === item.k) {
          buttons[i].classList.add('border-emerald-500/40', 'bg-emerald-500/10', 'text-emerald-300');
        } else if (i === pick) {
          buttons[i].classList.add('border-rose-500/40', 'bg-rose-500/10', 'text-rose-300');
        } else {
          buttons[i].classList.add('opacity-50');
        }
      }

      if (feedbackEl) {
        feedbackEl.className = 'mt-4 p-3 rounded-xl text-xs font-medium border ' + fun.STATUS[correct ? 'ok' : 'error'];
        feedbackEl.textContent = correct
          ? 'Correct.'
          : 'Not quite — the answer is ' + item.o[item.k] + '.';
      }

      if (nextBtn) {
        nextBtn.classList.remove('hidden');
        nextBtn.textContent = index + 1 >= run.length ? 'See the score' : 'Next question';
      }
    }

    function advance() {
      index += 1;
      if (index >= run.length) finish();
      else renderQuestion();
    }

    function finish() {
      quizEl.classList.add('hidden');
      resultsEl.classList.remove('hidden');
      if (barEl) barEl.style.width = '100%';

      var score = 0;
      run.forEach(function (item, i) { if (answers[i] === item.k) score += 1; });

      if (scoreEl) scoreEl.textContent = score + ' / ' + run.length;

      var band;
      if (score === run.length) band = 'A clean sweep. Every single one.';
      else if (score >= run.length * 0.8) band = 'Strong round — comfortably above half.';
      else if (score >= run.length * 0.5) band = 'A solid middle. Roughly half right.';
      else if (score > 0) band = 'A few landed. Worth another round.';
      else band = 'Nothing this time. The questions are shuffled, so the next round is different.';
      if (bandEl) bandEl.textContent = band;

      if (reviewEl) {
        reviewEl.innerHTML = '';
        run.forEach(function (item, i) {
          var got = answers[i];
          var right = got === item.k;
          var yours = got >= 0 ? item.o[got] : 'no answer';
          reviewEl.appendChild(
            fun.row(item.q, (right ? '✓ ' : '✗ ') + yours + (right ? '' : ' — ' + item.o[item.k]))
          );
        });
      }

      status.hide();
    }

    /* ------------------------------------------------------------- wiring */

    function start() {
      // Shuffle then slice, so the ten questions in a round are always
      // distinct. Drawing at random ten times could hand back a duplicate.
      run = fun.shuffle(pool()).slice(0, Math.min(ROUNDS, pool().length));
      answers = [];
      index = 0;

      if (introEl) introEl.classList.add('hidden');
      resultsEl.classList.add('hidden');
      quizEl.classList.remove('hidden');
      status.hide();
      renderQuestion();
    }

    startBtn.addEventListener('click', start);
    if (nextBtn) nextBtn.addEventListener('click', advance);

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
          status.show('Do a round first, then copy the result.', 'warn');
          return;
        }
        var score = 0;
        run.forEach(function (item, i) { if (answers[i] === item.k) score += 1; });
        var lines = run.map(function (item, i) {
          var got = answers[i];
          return (got === item.k ? 'Correct' : 'Wrong') + ' — ' + item.q +
            ' (you said ' + (got >= 0 ? item.o[got] : 'nothing') + ', answer ' + item.o[item.k] + ')';
        });
        fun.copy('Trivia Quiz — ' + score + '/' + run.length + '\n\n' + lines.join('\n'), status);
      });
    }

    status.show('Ten questions, shuffled fresh each round. Pick a category or take the whole pool.', 'info');

    return { start: start };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createTriviaQuiz = createTriviaQuiz;
})(window, document);

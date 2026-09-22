/**
 * ToolStack AI — Geography Quiz engine.
 *
 * Ids required in tools/geography-quiz.html:
 *   geoStatus, geoIntro, geoStartBtn, geoQuiz, geoProgress, geoBar, geoQuestion,
 *   geoOptions, geoFeedback, geoNextBtn, geoResults, geoScore, geoBand,
 *   geoRegions, geoReview, geoRestartBtn, geoCopyBtn
 *
 * Twelve rounds drawn from a pool of forty-eight, marked as you go. What makes
 * this different from the trivia quiz is the breakdown at the end: results are
 * grouped by region, so you find out that you are fine on Europe and hopeless
 * on Oceania rather than just getting a number. That is the thing a geography
 * quiz can offer that a general one cannot, and it is why the questions are
 * tagged by region rather than pooled anonymously.
 *
 * Only regions that actually came up are reported. A twelve-round draw will not
 * touch all six regions, and printing "Oceania: 0 of 0" for a region you were
 * never asked about is noise dressed up as data.
 *
 * Facts here are all settled and slow-moving: capitals, rivers, mountain
 * ranges, straits. Nothing that changes with a census, an election or a
 * border dispute. Where a question has a well-known trap answer — the biggest
 * desert, the longest river in Europe — the feedback names the trap, because
 * getting it wrong for an interesting reason is worth more than getting it
 * right by luck.
 */
(function (window, document) {
  'use strict';

  var ROUNDS = 12;

  var QUESTIONS = [
    /* -------------------------------------------------------------- europe */
    { r: 'europe', q: 'What is the capital of Portugal?', o: ['Porto', 'Lisbon', 'Madrid', 'Seville'], k: 1 },
    { r: 'europe', q: 'Which country is known as the Land of a Thousand Lakes?', o: ['Norway', 'Sweden', 'Finland', 'Denmark'], k: 2 },
    { r: 'europe', q: 'What is the longest river in Europe?', o: ['The Danube', 'The Rhine', 'The Volga', 'The Loire'], k: 2 },
    { r: 'europe', q: 'Which mountain range forms the border between France and Spain?', o: ['The Alps', 'The Pyrenees', 'The Carpathians', 'The Apennines'], k: 1 },
    { r: 'europe', q: 'What is the capital of Norway?', o: ['Bergen', 'Oslo', 'Stockholm', 'Copenhagen'], k: 1 },
    { r: 'europe', q: 'Which country is shaped like a boot?', o: ['Greece', 'Croatia', 'Italy', 'Bulgaria'], k: 2 },
    { r: 'europe', q: 'What is the smallest country in the world by area?', o: ['Monaco', 'San Marino', 'Vatican City', 'Liechtenstein'], k: 2 },
    { r: 'europe', q: 'Which sea lies between Italy and the Balkan peninsula?', o: ['The Adriatic Sea', 'The Aegean Sea', 'The Black Sea', 'The Tyrrhenian Sea'], k: 0 },

    /* ---------------------------------------------------------------- asia */
    { r: 'asia', q: 'What is the capital of Japan?', o: ['Osaka', 'Kyoto', 'Tokyo', 'Nagoya'], k: 2 },
    { r: 'asia', q: 'Which is the largest country in the world by area?', o: ['Canada', 'China', 'Russia', 'United States'], k: 2 },
    { r: 'asia', q: 'Which country is home to the Taj Mahal?', o: ['Pakistan', 'India', 'Bangladesh', 'Nepal'], k: 1 },
    { r: 'asia', q: 'What is the longest river in Asia?', o: ['The Ganges', 'The Mekong', 'The Yangtze', 'The Yellow River'], k: 2 },
    { r: 'asia', q: 'What is the capital of South Korea?', o: ['Busan', 'Seoul', 'Incheon', 'Daegu'], k: 1 },
    { r: 'asia', q: 'Which desert covers much of southern Mongolia and northern China?', o: ['The Gobi', 'The Taklamakan', 'The Thar', 'The Kyzylkum'], k: 0 },
    { r: 'asia', q: 'Which sea lies between Saudi Arabia and Egypt?', o: ['The Arabian Sea', 'The Red Sea', 'The Caspian Sea', 'The Persian Gulf'], k: 1 },
    { r: 'asia', q: 'Which mountain range runs along the northern edge of the Indian subcontinent?', o: ['The Hindu Kush', 'The Himalayas', 'The Urals', 'The Zagros'], k: 1 },

    /* -------------------------------------------------------------- africa */
    { r: 'africa', q: 'Which is the largest country in Africa by area?', o: ['Egypt', 'Algeria', 'Sudan', 'Libya'], k: 1 },
    { r: 'africa', q: 'What is the longest river in Africa?', o: ['The Congo', 'The Niger', 'The Nile', 'The Zambezi'], k: 2 },
    { r: 'africa', q: 'What is the capital of Kenya?', o: ['Mombasa', 'Nairobi', 'Kisumu', 'Nakuru'], k: 1 },
    { r: 'africa', q: 'Which is the largest hot desert in the world?', o: ['The Kalahari', 'The Sahara', 'The Namib', 'The Arabian'], k: 1 },
    { r: 'africa', q: 'What is the highest mountain in Africa?', o: ['Mount Kenya', 'Kilimanjaro', 'Mount Stanley', 'Ras Dashen'], k: 1 },
    { r: 'africa', q: 'Which African country has the largest population?', o: ['Egypt', 'Ethiopia', 'Nigeria', 'South Africa'], k: 2 },
    { r: 'africa', q: 'What is the capital of Egypt?', o: ['Alexandria', 'Cairo', 'Giza', 'Luxor'], k: 1 },
    { r: 'africa', q: 'Which strait separates Africa from Europe?', o: ['The Bosphorus', 'The Strait of Gibraltar', 'The Strait of Hormuz', 'The Bab-el-Mandeb'], k: 1 },

    /* ------------------------------------------------------------ americas */
    { r: 'americas', q: 'What is the longest river in South America?', o: ['The Paraná', 'The Orinoco', 'The Amazon', 'The São Francisco'], k: 2 },
    { r: 'americas', q: 'What is the capital of Canada?', o: ['Toronto', 'Vancouver', 'Montreal', 'Ottawa'], k: 3 },
    { r: 'americas', q: 'Which is the largest country in South America by area?', o: ['Argentina', 'Peru', 'Brazil', 'Colombia'], k: 2 },
    { r: 'americas', q: 'What is the highest mountain in North America?', o: ['Denali', 'Mount Logan', 'Mount Rainier', 'Mount Whitney'], k: 0 },
    { r: 'americas', q: 'In which country is the Panama Canal?', o: ['Costa Rica', 'Nicaragua', 'Panama', 'Colombia'], k: 2 },
    { r: 'americas', q: 'What is the capital of Argentina?', o: ['Santiago', 'Buenos Aires', 'Montevideo', 'Lima'], k: 1 },
    { r: 'americas', q: 'Which is the largest lake in South America?', o: ['Lake Maracaibo', 'Lake Titicaca', 'Lake Poopó', 'Lake Argentino'], k: 1 },
    { r: 'americas', q: 'Which is the largest US state by area?', o: ['Texas', 'California', 'Alaska', 'Montana'], k: 2 },

    /* ------------------------------------------------------------- oceania */
    { r: 'oceania', q: 'What is the capital of New Zealand?', o: ['Auckland', 'Wellington', 'Christchurch', 'Dunedin'], k: 1 },
    { r: 'oceania', q: 'Which is the largest country in Oceania by area?', o: ['Papua New Guinea', 'New Zealand', 'Australia', 'Fiji'], k: 2 },
    { r: 'oceania', q: 'What is the largest city in Australia?', o: ['Melbourne', 'Brisbane', 'Perth', 'Sydney'], k: 3 },
    { r: 'oceania', q: 'What is the capital of Fiji?', o: ['Nadi', 'Suva', 'Lautoka', 'Labasa'], k: 1 },
    { r: 'oceania', q: 'Which reef lies off the coast of Queensland?', o: ['The Great Barrier Reef', 'The Coral Sea Reef', 'The Rowley Shoals', 'The Ningaloo Reef'], k: 0 },
    { r: 'oceania', q: 'What is the highest mountain on the Australian mainland?', o: ['Mount Kosciuszko', 'Mount Bogong', 'Mount Ossa', 'Mount Bartle Frere'], k: 0 },
    { r: 'oceania', q: 'Which body of water separates Australia from Papua New Guinea?', o: ['The Bass Strait', 'The Torres Strait', 'The Cook Strait', 'The Timor Sea'], k: 1 },
    { r: 'oceania', q: 'Which ocean lies to the east of Australia?', o: ['The Indian Ocean', 'The Southern Ocean', 'The Pacific Ocean', 'The Atlantic Ocean'], k: 2 },

    /* -------------------------------------------------------------- physical */
    { r: 'physical', q: 'Which is the largest desert on Earth?', o: ['The Sahara', 'The Gobi', 'Antarctica', 'The Arabian'], k: 2, trap: 'The Sahara is the largest hot desert, but a desert is defined by how little rain it gets, not by how hot it is. Antarctica is the largest desert on Earth.' },
    { r: 'physical', q: 'What is the deepest ocean trench?', o: ['The Puerto Rico Trench', 'The Java Trench', 'The Mariana Trench', 'The Tonga Trench'], k: 2 },
    { r: 'physical', q: 'Which line of latitude sits at zero degrees?', o: ['The Tropic of Cancer', 'The Equator', 'The Prime Meridian', 'The Arctic Circle'], k: 1 },
    { r: 'physical', q: 'What is the largest island in the world?', o: ['New Guinea', 'Borneo', 'Greenland', 'Madagascar'], k: 2 },
    { r: 'physical', q: 'What is the longest mountain range on land?', o: ['The Rockies', 'The Andes', 'The Himalayas', 'The Great Dividing Range'], k: 1 },
    { r: 'physical', q: 'Which line divides the Earth into eastern and western hemispheres?', o: ['The Equator', 'The Prime Meridian', 'The International Date Line', 'The Tropic of Capricorn'], k: 1 },
    { r: 'physical', q: 'Which is the smallest ocean?', o: ['The Arctic Ocean', 'The Southern Ocean', 'The Indian Ocean', 'The Atlantic Ocean'], k: 0 },
    { r: 'physical', q: 'What is the main cause of ocean tides?', o: ['Prevailing winds', 'The Moon’s gravity', 'Ocean currents', 'The Earth’s magnetic field'], k: 1 }
  ];

  var REGION_LABELS = {
    europe: 'Europe',
    asia: 'Asia',
    africa: 'Africa',
    americas: 'The Americas',
    oceania: 'Oceania',
    physical: 'Physical geography'
  };

  function createGeographyQuiz(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var introEl = $('geoIntro');
    var startBtn = $('geoStartBtn');
    var quizEl = $('geoQuiz');
    var progressEl = $('geoProgress');
    var barEl = $('geoBar');
    var questionEl = $('geoQuestion');
    var optionsEl = $('geoOptions');
    var feedbackEl = $('geoFeedback');
    var nextBtn = $('geoNextBtn');
    var resultsEl = $('geoResults');
    var scoreEl = $('geoScore');
    var bandEl = $('geoBand');
    var regionsEl = $('geoRegions');
    var reviewEl = $('geoReview');
    var restartBtn = $('geoRestartBtn');
    var copyBtn = $('geoCopyBtn');
    var statusEl = $('geoStatus');

    if (!startBtn || !quizEl || !optionsEl || !resultsEl) return null;

    var status = fun.makeStatus(statusEl);

    var run = [];
    var answers = [];
    var index = 0;
    var answered = false;

    function renderQuestion() {
      var item = run[index];
      if (!item) return;

      answered = false;
      if (progressEl) progressEl.textContent = 'Round ' + (index + 1) + ' of ' + run.length;
      if (barEl) barEl.style.width = Math.round((index / run.length) * 100) + '%';
      if (questionEl) questionEl.textContent = item.q;
      if (feedbackEl) {
        feedbackEl.textContent = '';
        feedbackEl.className = 'hidden mt-4 p-3 rounded-xl text-xs font-medium border';
      }
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
        /* Where a question has a famous wrong answer, name it. Being wrong for
         * an interesting reason is the teachable moment; "the answer is
         * Antarctica" on its own just tells somebody they lost a point. */
        if (correct) {
          feedbackEl.textContent = item.trap ? 'Correct — and you avoided the obvious trap.' : 'Correct.';
        } else {
          feedbackEl.textContent = 'Not quite — ' + item.o[item.k] + '.' + (item.trap ? ' ' + item.trap : '');
        }
      }

      if (nextBtn) {
        nextBtn.classList.remove('hidden');
        nextBtn.textContent = index + 1 >= run.length ? 'See the breakdown' : 'Next';
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
      if (score === run.length) band = 'Every one. Nothing got past you.';
      else if (score >= run.length * 0.75) band = 'Strong round. The gaps below are narrow.';
      else if (score >= run.length * 0.5) band = 'About half. The regional breakdown is the useful part.';
      else if (score > 0) band = 'A difficult draw. Check which region let you down.';
      else band = 'Nothing this round. The breakdown will show you where to start.';
      if (bandEl) bandEl.textContent = band;

      /* Grouped by region, and only for regions that came up. A twelve-round
       * draw will miss some regions entirely, and "Oceania: 0 of 0" would be
       * noise pretending to be a result. */
      if (regionsEl) {
        regionsEl.innerHTML = '';
        var byRegion = {};
        run.forEach(function (item, i) {
          if (!byRegion[item.r]) byRegion[item.r] = { right: 0, total: 0 };
          byRegion[item.r].total += 1;
          if (answers[i] === item.k) byRegion[item.r].right += 1;
        });

        Object.keys(byRegion).forEach(function (key) {
          var data = byRegion[key];
          var verdict;
          if (data.right === data.total) verdict = 'All ' + data.total + '.';
          else if (data.right === 0) verdict = 'None of ' + data.total + '. Worth a look.';
          else verdict = data.right + ' of ' + data.total + '.';
          regionsEl.appendChild(fun.row(REGION_LABELS[key] || key, verdict));
        });
      }

      if (reviewEl) {
        reviewEl.innerHTML = '';
        run.forEach(function (item, i) {
          var got = answers[i];
          var right = got === item.k;
          reviewEl.appendChild(
            fun.row(item.q, (right ? '✓ ' : '✗ ') + item.o[got] +
              (right ? '' : ' — ' + item.o[item.k]))
          );
        });
      }

      status.hide();
    }

    /* ------------------------------------------------------------- wiring */

    function start() {
      run = fun.shuffle(QUESTIONS).slice(0, ROUNDS);
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
            ' (you said ' + item.o[got] + ', answer ' + item.o[item.k] + ')';
        });
        fun.copy('Geography Quiz — ' + score + '/' + run.length + '\n\n' + lines.join('\n'), status);
      });
    }

    status.show('Twelve rounds from forty-eight questions, with a regional breakdown at the end.', 'info');

    return { start: start };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createGeographyQuiz = createGeographyQuiz;
})(window, document);

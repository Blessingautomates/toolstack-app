/**
 * ToolStack AI — Best Friend Quiz engine.
 *
 * Ids required in tools/best-friend-quiz.html:
 *   bfqStatus, bfqIntro, bfqStartBtn, bfqQuiz, bfqMode, bfqProgress, bfqBar,
 *   bfqQuestion, bfqOptions, bfqLinkPanel, bfqLink, bfqCopyLinkBtn,
 *   bfqResults, bfqScore, bfqBand, bfqBreakdown, bfqRestartBtn
 *
 * This is a build-your-own quiz rather than a fixed one, which is what makes it
 * a different tool from the friendship test. You answer eight questions about
 * yourself; the answers are packed into the URL fragment; whoever you send the
 * link to answers the same eight questions guessing at yours and gets a score.
 *
 * The encoding is deliberately trivial: one digit per question, in order, in
 * the fragment after `#q=`. It is not obfuscated and it is not meant to be.
 * Anyone who looks at the URL can read the answers, and pretending otherwise
 * with a scramble or a hash would be security theatre on a party game. The
 * fragment is used rather than a query string because it never reaches a
 * server, which means the answers stay in the browser on both ends.
 *
 * The link is written into the address bar as soon as it is built, so the page
 * you are looking at is exactly the page you are copying. The share strip the
 * shared runtime injects uses the current URL, which is why that ordering
 * matters — build first, then let the user share.
 *
 * On results: this is a memory game about eight facts, not a measure of how
 * much anyone cares about anybody. The bands say so.
 */
(function (window, document) {
  'use strict';

  var QUESTIONS = [
    {
      q: 'What is my go-to takeaway?',
      a: ['Pizza', 'Chinese', 'Indian', 'Burgers']
    },
    {
      q: 'How do I take it?',
      a: ['Tea with milk', 'Coffee, black', 'Coffee with milk', 'Neither — water']
    },
    {
      q: 'What time do I actually go to bed?',
      a: ['Before 10pm', '10pm to midnight', 'Midnight to 2am', 'After 2am']
    },
    {
      q: 'My perfect day off is…',
      a: ['Absolutely nothing', 'Outdoors somewhere', 'Shops and coffee', 'Films or games at home']
    },
    {
      q: 'What is my phone battery usually sitting at?',
      a: ['Nearly dead', 'Under half', 'Over half', 'Basically always full']
    },
    {
      q: 'How do I feel about mornings?',
      a: ['Up before 7', 'Up 7 to 9', 'Up 9 to 11', 'Do not speak to me before noon']
    },
    {
      q: 'In the group chat, I am…',
      a: ['The planner', 'The lurker', 'The one who sends the memes', 'The one who replies three days later']
    },
    {
      q: 'Cinema snack of choice?',
      a: ['Popcorn', 'Sweets', 'Nachos', 'Nothing, I am here for the film']
    }
  ];

  var BANDS = [
    { min: 0, name: 'We have never met', text: 'That was a rough round. In fairness, none of these are things anybody announces about themselves.' },
    { min: 3, name: 'We have spoken', text: 'You have the outline. The specifics are still a mystery, which is what the next eight conversations are for.' },
    { min: 5, name: 'Solid effort', text: 'More right than wrong. You have clearly been paying attention to the small stuff.' },
    { min: 7, name: 'Suspiciously well informed', text: 'Seven or eight out of eight. Either you are genuinely close or you went through their camera roll.' }
  ];

  var CODE_KEY = '#q=';

  function createBestFriendQuiz(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var introEl = $('bfqIntro');
    var startBtn = $('bfqStartBtn');
    var quizEl = $('bfqQuiz');
    var modeEl = $('bfqMode');
    var progressEl = $('bfqProgress');
    var barEl = $('bfqBar');
    var questionEl = $('bfqQuestion');
    var optionsEl = $('bfqOptions');
    var linkPanel = $('bfqLinkPanel');
    var linkEl = $('bfqLink');
    var copyLinkBtn = $('bfqCopyLinkBtn');
    var resultsEl = $('bfqResults');
    var scoreEl = $('bfqScore');
    var bandEl = $('bfqBand');
    var breakdownEl = $('bfqBreakdown');
    var restartBtn = $('bfqRestartBtn');
    var statusEl = $('bfqStatus');

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

    /* ------------------------------------------------------------ the code */

    /**
     * Reads the answers out of the fragment. Anything malformed is treated as
     * "no quiz here" rather than throwing — a truncated link should quietly
     * offer to make a new quiz instead of showing an error nobody can act on.
     */
    function readCode() {
      var hash = window.location.hash || '';
      if (hash.indexOf(CODE_KEY) !== 0) return null;
      var raw = hash.slice(CODE_KEY.length);
      if (raw.length !== QUESTIONS.length) return null;
      var out = [];
      for (var i = 0; i < raw.length; i++) {
        var digit = raw.charCodeAt(i) - 48;
        if (digit < 0 || digit >= QUESTIONS[i].a.length) return null;
        out.push(digit);
      }
      return out;
    }

    function writeCode(list) {
      return list.join('');
    }

    /* --------------------------------------------------------------- state */

    var mode = 'create';   // 'create' | 'play'
    var answers = [];
    var index = 0;
    var target = null;     // the answers the player is trying to guess

    function renderQuestion() {
      var question = QUESTIONS[index];
      if (!question) return;

      if (modeEl) {
        modeEl.textContent = mode === 'create'
          ? 'Answer about yourself'
          : 'Guess their answers';
      }
      if (progressEl) progressEl.textContent = 'Question ' + (index + 1) + ' of ' + QUESTIONS.length;
      if (barEl) barEl.style.width = Math.round((index / QUESTIONS.length) * 100) + '%';
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
      answers[index] = optionIndex;
      index += 1;
      if (index >= QUESTIONS.length) finish();
      else renderQuestion();
    }

    function finish() {
      if (mode === 'create') finishCreate();
      else finishPlay();
    }

    function finishCreate() {
      var code = writeCode(answers);
      var url = window.location.origin + window.location.pathname + CODE_KEY + code;

      /* Writing the fragment before the panel is shown means the address bar
       * and the box agree, and the shared runtime's share buttons (which read
       * the current URL) send the quiz rather than the bare page. */
      try {
        window.history.replaceState(null, '', CODE_KEY + code);
      } catch (e) {
        window.location.hash = CODE_KEY + code;
      }

      target = answers.slice();
      mode = 'play';

      quizEl.classList.add('hidden');
      resultsEl.classList.add('hidden');
      if (introEl) introEl.classList.add('hidden');
      if (linkPanel) linkPanel.classList.remove('hidden');
      if (linkEl) linkEl.value = url;
      if (barEl) barEl.style.width = '0%';

      showStatus('Your quiz is ready. Copy the link below and send it to them — or just hand over the phone.', 'ok');
    }

    function finishPlay() {
      var correct = 0;
      for (var i = 0; i < QUESTIONS.length; i++) {
        if (answers[i] === target[i]) correct += 1;
      }

      var band = BANDS[0];
      for (var b = 0; b < BANDS.length; b++) {
        if (correct >= BANDS[b].min) band = BANDS[b];
      }

      quizEl.classList.add('hidden');
      if (linkPanel) linkPanel.classList.add('hidden');
      resultsEl.classList.remove('hidden');
      if (barEl) barEl.style.width = '100%';

      if (scoreEl) scoreEl.textContent = correct + ' out of ' + QUESTIONS.length;
      if (bandEl) bandEl.textContent = band.name + '. ' + band.text;

      if (breakdownEl) {
        breakdownEl.innerHTML = '';
        QUESTIONS.forEach(function (question, i) {
          var right = answers[i] === target[i];
          var row = document.createElement('div');
          row.className = 'py-2.5 border-b border-gray-800 last:border-0';

          var q = document.createElement('p');
          q.className = 'text-[11px] text-gray-500';
          q.textContent = question.q;

          var line = document.createElement('p');
          line.className = 'text-xs mt-1 ' + (right ? 'text-emerald-400' : 'text-amber-400');
          line.textContent = right
            ? 'Correct — ' + question.a[target[i]]
            : 'They said ' + question.a[target[i]] + ', you said ' + question.a[answers[i]];

          row.appendChild(q);
          row.appendChild(line);
          breakdownEl.appendChild(row);
        });
      }

      hideStatus();
    }

    function beginCreate() {
      mode = 'create';
      answers = [];
      target = null;
      index = 0;
      if (introEl) introEl.classList.add('hidden');
      if (resultsEl) resultsEl.classList.add('hidden');
      if (linkPanel) linkPanel.classList.add('hidden');
      quizEl.classList.remove('hidden');
      hideStatus();
      renderQuestion();
    }

    function beginPlay(code) {
      mode = 'play';
      target = code;
      answers = [];
      index = 0;
      if (introEl) introEl.classList.add('hidden');
      if (resultsEl) resultsEl.classList.add('hidden');
      if (linkPanel) linkPanel.classList.add('hidden');
      quizEl.classList.remove('hidden');
      showStatus('Someone sent you their quiz. Guess how they answered all eight.', 'info');
      renderQuestion();
    }

    /* ------------------------------------------------------------- wiring */

    startBtn.addEventListener('click', beginCreate);

    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', function () {
        var text = linkEl ? linkEl.value : '';
        if (!text) {
          showStatus('No quiz link yet — answer the questions first.', 'warn');
          return;
        }
        var copy = window.ToolStack && window.ToolStack.copyText;
        if (!copy) {
          if (linkEl) linkEl.select();
          showStatus('Select the link and copy it manually.', 'warn');
          return;
        }
        copy(text, function (ok) {
          if (ok) showStatus('Quiz link copied. Send it over.', 'ok');
          else showStatus('Could not reach the clipboard. Select the link and copy it manually.', 'error');
        });
      });
    }

    if (restartBtn) {
      restartBtn.addEventListener('click', function () {
        try {
          window.history.replaceState(null, '', window.location.pathname);
        } catch (e) {
          window.location.hash = '';
        }
        resultsEl.classList.add('hidden');
        quizEl.classList.add('hidden');
        if (linkPanel) linkPanel.classList.add('hidden');
        if (introEl) introEl.classList.remove('hidden');
        if (barEl) barEl.style.width = '0%';
        hideStatus();
      });
    }

    /* Opening a link with a quiz in it drops straight into playing. Anything
     * else lands on the intro screen. */
    var incoming = readCode();
    if (incoming) {
      beginPlay(incoming);
    } else {
      if (introEl) introEl.classList.remove('hidden');
    }

    return { beginCreate: beginCreate, beginPlay: beginPlay };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createBestFriendQuiz = createBestFriendQuiz;
})(window, document);

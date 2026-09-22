/**
 * ToolStack AI — Riddle Generator engine.
 *
 * Ids required in tools/riddle-generator.html:
 *   ridStatus, ridCategory, ridDrawBtn, ridClearBtn, ridCopyBtn, ridResults,
 *   ridQuestion, ridHintBtn, ridHint, ridRevealBtn, ridAnswer, ridBadge, ridMeta
 *
 * The mechanic is a draw with a held-back answer. The answer is in the markup
 * from the moment the riddle appears but stays hidden until you ask for it —
 * which is the whole shape of a riddle: the information exists, the work is in
 * getting to it. A hint button sits between the two so a stuck group has
 * somewhere to go that is not immediately the answer.
 *
 * The riddles are all long-established public-domain classics. That matters
 * for a tool like this: an original riddle that nobody has heard is often
 * original because it is ambiguous, and an ambiguous riddle is a bad riddle.
 * Every answer here is the settled one, and every hint nudges at the reasoning
 * rather than restating the question.
 */
(function (window, document) {
  'use strict';

  var RIDDLES = [
    /* -------------------------------------------------------------- classic */
    { c: 'classic', q: 'What has keys but no locks, space but no room, and you can enter but not go in?', a: 'A keyboard.', h: 'You are probably within arm’s reach of one right now.' },
    { c: 'classic', q: 'What gets wetter the more it dries?', a: 'A towel.', h: 'It is doing its job at the exact moment it becomes useless.' },
    { c: 'classic', q: 'What has a face and two hands but no arms or legs?', a: 'A clock.', h: 'You would have to be very late to miss this one.' },
    { c: 'classic', q: 'The more you take, the more you leave behind. What am I?', a: 'Footsteps.', h: 'You make them without thinking, and they are always behind you.' },
    { c: 'classic', q: 'What has a neck but no head?', a: 'A bottle.', h: 'Often found on a dinner table.' },
    { c: 'classic', q: 'What has many teeth but cannot bite?', a: 'A comb.', h: 'It goes through hair.' },
    { c: 'classic', q: 'What can travel around the world while staying in a corner?', a: 'A stamp.', h: 'It is stuck to something else for the entire journey.' },
    { c: 'classic', q: 'What has one eye but cannot see?', a: 'A needle.', h: 'It has an eye so that something else can.' },

    /* ------------------------------------------------------------- wordplay */
    { c: 'wordplay', q: 'What begins with T, ends with T, and has T in it?', a: 'A teapot.', h: 'You put tea in it, which is not a coincidence.' },
    { c: 'wordplay', q: 'Which word becomes shorter when you add two letters to it?', a: 'Short.', h: 'Add two letters to the end and you have described the result.' },
    { c: 'wordplay', q: 'What five-letter word, written in capitals, reads the same when turned upside down?', a: 'SWIMS.', h: 'The letters that survive being flipped are limited. Start there.' },
    { c: 'wordplay', q: 'Which English word has three consecutive pairs of double letters?', a: 'Bookkeeper.', h: 'It is a job. The double letters run in the middle.' },
    { c: 'wordplay', q: 'What occurs once in a minute, twice in a moment, and never in a thousand years?', a: 'The letter M.', h: 'Look at the spelling, not the meaning.' },
    { c: 'wordplay', q: 'What is at the end of a rainbow?', a: 'The letter W.', h: 'Read the question again. It is not about weather.' },
    { c: 'wordplay', q: 'What word contains twenty-six letters but only three syllables?', a: 'Alphabet.', h: 'The letters are the ones in the word itself.' },
    { c: 'wordplay', q: 'What is at the end of everything?', a: 'The letter G.', h: 'Spelling again. This one is the same trick as the rainbow.' },

    /* ---------------------------------------------------------------- logic */
    { c: 'logic', q: 'A farmer has seventeen sheep. All but nine run away. How many are left?', a: 'Nine.', h: 'Read it once more. The number seventeen is doing no work.' },
    { c: 'logic', q: 'You are in a race and you overtake the person in second place. What position are you in now?', a: 'Second place.', h: 'You took their place. You did not take the leader’s.' },
    { c: 'logic', q: 'A bat and a ball cost £1.10 together. The bat costs £1 more than the ball. How much is the ball?', a: 'Five pence.', h: 'It is not ten pence. Check that your answer satisfies both sentences.' },
    { c: 'logic', q: 'A doctor gives you three pills and says to take one every half hour. How long do the pills last?', a: 'One hour.', h: 'The first one is taken immediately. Count the gaps, not the pills.' },
    { c: 'logic', q: 'How many times can you subtract 5 from 25?', a: 'Once.', h: 'After the first subtraction, you are no longer subtracting from 25.' },
    { c: 'logic', q: 'Which weighs more: a kilogram of feathers or a kilogram of steel?', a: 'Neither — they weigh the same.', h: 'Look at the units, not the materials.' },
    { c: 'logic', q: 'You have a bowl with six apples and you take away four. How many do you have?', a: 'Four — the ones you took.', h: 'The question asks what you have, not what is left in the bowl.' },
    { c: 'logic', q: 'How many months of the year have twenty-eight days?', a: 'All twelve.', h: 'Twenty-eight is a minimum, not a total.' },

    /* -------------------------------------------------------------- objects */
    { c: 'objects', q: 'What has a ring but no finger?', a: 'A telephone.', h: 'It used to sit in a hallway.' },
    { c: 'objects', q: 'What has a thumb and four fingers but is not alive?', a: 'A glove.', h: 'It only has them when somebody else does.' },
    { c: 'objects', q: 'What has legs but does not walk?', a: 'A table.', h: 'You probably eat off one.' },
    { c: 'objects', q: 'What has a head and a tail but no body?', a: 'A coin.', h: 'You might toss it to decide.' },
    { c: 'objects', q: 'Which building has the most stories?', a: 'A library.', h: 'The clue is that the word has two meanings.' },
    { c: 'objects', q: 'What can you catch but never throw?', a: 'A cold.', h: 'It is not an object at all.' },
    { c: 'objects', q: 'What has one head, one foot and four legs?', a: 'A bed.', h: 'You probably spend a third of your life on one.' },
    { c: 'objects', q: 'What has a spine but no bones?', a: 'A book.', h: 'It is also the answer to the library riddle, in a sense.' },

    /* ---------------------------------------------------------- nature, time */
    { c: 'nature', q: 'What has roots nobody sees, is taller than trees, and yet never grows?', a: 'A mountain.', h: 'It is very large and very patient.' },
    { c: 'nature', q: 'What kind of tree can you carry in your hand?', a: 'A palm.', h: 'The answer is a pun on a part of your body.' },
    { c: 'nature', q: 'What runs but never walks, and has a bed but never sleeps?', a: 'A river.', h: 'It has a mouth too, and it is always going somewhere.' },
    { c: 'nature', q: 'I am tall when I am young and short when I am old. What am I?', a: 'A candle.', h: 'Being short is the same thing as being nearly finished.' },
    { c: 'nature', q: 'What goes up but never comes down?', a: 'Your age.', h: 'It is not a physical thing, and it happens once a year.' },
    { c: 'nature', q: 'What falls but never breaks, and breaks but never falls?', a: 'Night and day.', h: 'Two halves of the same cycle, one word each.' },
    { c: 'nature', q: 'What can fill an entire room but takes up no space?', a: 'Light.', h: 'You would notice immediately if it were gone.' },
    { c: 'nature', q: 'What is full of holes but still holds water?', a: 'A sponge.', h: 'It is soft and lives by a sink.' }
  ];

  var CATEGORY_LABELS = {
    classic: 'Classic',
    wordplay: 'Wordplay',
    logic: 'Logic',
    objects: 'Everyday objects',
    nature: 'Nature and time'
  };

  function createRiddleGenerator(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var questionEl = $('ridQuestion');
    var hintEl = $('ridHint');
    var hintBtn = $('ridHintBtn');
    var answerEl = $('ridAnswer');
    var revealBtn = $('ridRevealBtn');
    var badgeEl = $('ridBadge');
    var metaEl = $('ridMeta');

    var current = null;
    var hintShown = false;
    var revealed = false;

    /* Both the hint and the answer are reset on every draw. Leaving the previous
     * riddle's answer on screen for even a moment would spoil the next one, and
     * a stale hint is worse than no hint. */
    function resetPanels() {
      hintShown = false;
      revealed = false;
      if (hintEl) { hintEl.textContent = ''; hintEl.classList.add('hidden'); }
      if (answerEl) { answerEl.textContent = ''; answerEl.classList.add('hidden'); }
      if (hintBtn) {
        hintBtn.disabled = false;
        hintBtn.textContent = 'Give me a hint';
        hintBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      }
      if (revealBtn) {
        revealBtn.disabled = false;
        revealBtn.textContent = 'Reveal the answer';
        revealBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    }

    var tool = fun.drawTool(root, {
      data: RIDDLES,
      filterId: 'ridCategory',
      filterKey: 'c',
      drawBtnId: 'ridDrawBtn',
      clearBtnId: 'ridClearBtn',
      copyBtnId: 'ridCopyBtn',
      resultsId: 'ridResults',
      statusId: 'ridStatus',
      render: function (item, info) {
        current = item;
        resetPanels();
        if (questionEl) questionEl.textContent = item.q;
        if (badgeEl) badgeEl.textContent = CATEGORY_LABELS[item.c] || item.c;
        if (metaEl) {
          metaEl.textContent = 'Riddle ' + info.drawn + ' of ' + info.total +
            ' in this category before any of them come round again.';
        }
      },
      /* The answer is only included in the copied text once it has been asked
       * for. Otherwise copying a riddle to send to somebody would hand them the
       * answer along with it. */
      copyText: function (item) {
        var text = item.q;
        if (revealed) text += '\n\nAnswer: ' + item.a;
        else text += '\n\n(No answer — work it out.)';
        return text;
      },
      onClear: function () {
        current = null;
        resetPanels();
      }
    });

    if (!tool) return null;

    if (hintBtn) {
      hintBtn.addEventListener('click', function () {
        if (!current) {
          tool.status.show('Draw a riddle first.', 'warn');
          return;
        }
        if (hintShown) {
          tool.status.show('That is the only hint for this one. The answer is one button away.', 'info');
          return;
        }
        hintShown = true;
        if (hintEl) {
          hintEl.textContent = current.h;
          hintEl.classList.remove('hidden');
        }
        hintBtn.disabled = true;
        hintBtn.textContent = 'Hint shown';
        hintBtn.classList.add('opacity-50', 'cursor-not-allowed');
      });
    }

    if (revealBtn) {
      revealBtn.addEventListener('click', function () {
        if (!current) {
          tool.status.show('Draw a riddle first.', 'warn');
          return;
        }
        revealed = true;
        if (answerEl) {
          answerEl.textContent = current.a;
          answerEl.classList.remove('hidden');
        }
        revealBtn.disabled = true;
        revealBtn.textContent = 'Answer revealed';
        revealBtn.classList.add('opacity-50', 'cursor-not-allowed');
      });
    }

    tool.status.show('Read it out, give it a minute, then take a hint if you need one.', 'info');

    return tool;
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createRiddleGenerator = createRiddleGenerator;
})(window, document);

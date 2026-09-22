/**
 * ToolStack AI — Truth or Dare engine.
 *
 * Ids required in tools/truth-or-dare.html:
 *   todStatus, todDeck, todType, todDrawBtn, todClearBtn, todCopyBtn,
 *   todResults, todKind, todPrompt, todBadge, todMeta
 *
 * The single most important thing in this file is the balance of the two
 * decks, so read this before adding prompts.
 *
 * The clean deck is the default and it is genuinely clean: nothing sexual,
 * nothing about anyone's body, nothing that requires a player to confess
 * something that could damage a real relationship, nothing that a parent would
 * object to. The bolder deck is PG-13 and still none of those things — it is
 * mildly embarrassing rather than revealing. Both decks avoid anything that
 * could injure somebody, anything involving strangers or anyone who has not
 * agreed to play, anything with alcohol or drugs, and anything that humiliates
 * a player rather than making them laugh.
 *
 * The other rule that matters: every prompt is skippable. The page says so
 * twice and the status line says so on the first draw. Forcing somebody to
 * complete a dare to avoid "losing" turns a party game into a way to pressure
 * a person, and that is the failure mode this tool has to be built against.
 *
 * Mechanically this uses the shared draw tool from fun-shared.js: a shuffled
 * bag so prompts do not repeat until the pool is exhausted, with the deck and
 * the type filter composing. Both filters feed the pool, so an empty
 * combination reports itself rather than silently widening.
 */
(function (window, document) {
  'use strict';

  var PROMPTS = [
    /* --------------------------------------------------------- clean truths */
    { deck: 'clean', type: 'truth', text: 'What is the most embarrassing thing in your search history?' },
    { deck: 'clean', type: 'truth', text: 'What is the last photo you took?' },
    { deck: 'clean', type: 'truth', text: 'Who in this room would you trust with a secret?' },
    { deck: 'clean', type: 'truth', text: 'What is your most useless talent?' },
    { deck: 'clean', type: 'truth', text: 'What is the worst haircut you have ever had?' },
    { deck: 'clean', type: 'truth', text: 'What is your most irrational fear?' },
    { deck: 'clean', type: 'truth', text: 'What is the biggest mistake you have made this year?' },
    { deck: 'clean', type: 'truth', text: 'What is a compliment you have never forgotten?' },
    { deck: 'clean', type: 'truth', text: 'What is the strangest thing you have ever eaten?' },
    { deck: 'clean', type: 'truth', text: 'What is the most childish thing you still do?' },
    { deck: 'clean', type: 'truth', text: 'What is your worst habit, honestly?' },
    { deck: 'clean', type: 'truth', text: 'What is the last thing that made you cry?' },
    { deck: 'clean', type: 'truth', text: 'What is the most money you have spent on something pointless?' },
    { deck: 'clean', type: 'truth', text: 'What is a skill you wish you had?' },
    { deck: 'clean', type: 'truth', text: 'What is the pettiest reason you have disliked someone?' },
    { deck: 'clean', type: 'truth', text: 'What song do you know every word to and would never admit?' },
    { deck: 'clean', type: 'truth', text: 'What is the worst gift you have ever been given?' },
    { deck: 'clean', type: 'truth', text: 'What is the longest you have ever stayed awake?' },
    { deck: 'clean', type: 'truth', text: 'What is something you are unreasonably good at?' },
    { deck: 'clean', type: 'truth', text: 'What is the weirdest thing you have googled this month?' },

    /* ---------------------------------------------------------- clean dares */
    { deck: 'clean', type: 'dare', text: 'Speak in an accent of the group’s choosing until your next turn.' },
    { deck: 'clean', type: 'dare', text: 'Do your best impression of someone in the room.' },
    { deck: 'clean', type: 'dare', text: 'Send a friend one random emoji and nothing else.' },
    { deck: 'clean', type: 'dare', text: 'Whisper everything you say for the next two rounds.' },
    { deck: 'clean', type: 'dare', text: 'Do twenty seconds of your very worst dancing.' },
    { deck: 'clean', type: 'dare', text: 'Let the group give you a new nickname for the rest of the game.' },
    { deck: 'clean', type: 'dare', text: 'Say the alphabet backwards, out loud, right now.' },
    { deck: 'clean', type: 'dare', text: 'Do your best catwalk across the room and back.' },
    { deck: 'clean', type: 'dare', text: 'Hold a plank for thirty seconds.' },
    { deck: 'clean', type: 'dare', text: 'Sing the chorus of your favourite song, badly and loudly.' },
    { deck: 'clean', type: 'dare', text: 'Act out a famous film scene with no words allowed.' },
    { deck: 'clean', type: 'dare', text: 'Let the person on your right draw something on the back of your hand.' },
    { deck: 'clean', type: 'dare', text: 'Speak only in questions for the next two rounds.' },
    { deck: 'clean', type: 'dare', text: 'Do ten star jumps, counted out loud.' },
    { deck: 'clean', type: 'dare', text: 'Balance a shoe on your head for one full minute.' },
    { deck: 'clean', type: 'dare', text: 'Tell a story using no more than three words per sentence.' },
    { deck: 'clean', type: 'dare', text: 'Do your best robot dance for fifteen seconds.' },
    { deck: 'clean', type: 'dare', text: 'Pay every person in the room one honest compliment.' },
    { deck: 'clean', type: 'dare', text: 'Let the group choose the pose for your next profile photo.' },
    { deck: 'clean', type: 'dare', text: 'Narrate everything you do, out loud, until your next turn.' },

    /* -------------------------------------------------------- bolder truths */
    { deck: 'bolder', type: 'truth', text: 'What is the biggest lie you have told a parent?' },
    { deck: 'bolder', type: 'truth', text: 'What is the most trouble you have ever been in?' },
    { deck: 'bolder', type: 'truth', text: 'What is the most embarrassing thing you have done in front of someone you liked?' },
    { deck: 'bolder', type: 'truth', text: 'What is something you pretend to like but really do not?' },
    { deck: 'bolder', type: 'truth', text: 'What is the pettiest thing you have ever done to somebody?' },
    { deck: 'bolder', type: 'truth', text: 'What is the most awkward thing that has ever happened to you in public?' },
    { deck: 'bolder', type: 'truth', text: 'What is the real reason you last cancelled plans?' },
    { deck: 'bolder', type: 'truth', text: 'What is a rumour about you that turned out to be true?' },
    { deck: 'bolder', type: 'truth', text: 'What is the worst thing you have ever said to someone you cared about?' },
    { deck: 'bolder', type: 'truth', text: 'What is the most reckless thing you have ever done?' },
    { deck: 'bolder', type: 'truth', text: 'Whose opinion of you matters more than you would admit?' },
    { deck: 'bolder', type: 'truth', text: 'What is something you have never told anyone here, that you would be happy for them to know now?' },

    /* --------------------------------------------------------- bolder dares */
    { deck: 'bolder', type: 'dare', text: 'Let the group choose one word you are not allowed to say for the rest of the game.' },
    { deck: 'bolder', type: 'dare', text: 'Call a friend and sing them happy birthday, even if it is not their birthday.' },
    { deck: 'bolder', type: 'dare', text: 'Do a two-minute rant about something completely trivial, with feeling.' },
    { deck: 'bolder', type: 'dare', text: 'Show the group the last photo in your camera roll, or skip and say why.' },
    { deck: 'bolder', type: 'dare', text: 'Let the person on your left restyle your hair however they like.' },
    { deck: 'bolder', type: 'dare', text: 'Speak in a fake accent for the next three rounds.' },
    { deck: 'bolder', type: 'dare', text: 'Let the group ask you one follow-up question about your last truth.' },
    { deck: 'bolder', type: 'dare', text: 'Do a dramatic reading of the last message you sent.' },
    { deck: 'bolder', type: 'dare', text: 'Let the group pick your next profile picture from photos you already have.' },
    { deck: 'bolder', type: 'dare', text: 'Say something genuinely nice about every person here, and mean it.' }
  ];

  var DECK_LABELS = { clean: 'Clean deck', bolder: 'Bolder deck' };
  var KIND_LABELS = { truth: 'TRUTH', dare: 'DARE' };

  function createTruthOrDare(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var kindEl = $('todKind');
    var promptEl = $('todPrompt');
    var badgeEl = $('todBadge');
    var metaEl = $('todMeta');
    var typeEl = $('todType');

    /* Both filters feed the pool. Keeping them in one place means the "nothing
     * matches" message can never disagree with what the bag actually holds. */
    function pool(item, deck) {
      var type = typeEl ? typeEl.value : 'any';
      if (deck !== 'all' && item.deck !== deck) return false;
      if (type !== 'any' && item.type !== type) return false;
      return true;
    }

    var tool = fun.drawTool(root, {
      data: PROMPTS,
      filterId: 'todDeck',
      drawBtnId: 'todDrawBtn',
      clearBtnId: 'todClearBtn',
      copyBtnId: 'todCopyBtn',
      resultsId: 'todResults',
      statusId: 'todStatus',
      pool: pool,
      emptyMessage: 'No prompts match that combination. The clean deck has no dares of that type — try another filter.',
      render: function (item, info) {
        if (kindEl) {
          kindEl.textContent = KIND_LABELS[item.type] || 'PROMPT';
          kindEl.className = 'text-2xl font-black tracking-tight ' +
            (item.type === 'dare' ? 'text-orange-400' : 'text-sky-400');
        }
        if (promptEl) promptEl.textContent = item.text;
        if (badgeEl) badgeEl.textContent = DECK_LABELS[item.deck] || item.deck;
        if (metaEl) {
          metaEl.textContent = 'Prompt ' + info.drawn + ' of ' + info.total +
            ' in this filter before any of them come round again. Skipping is always allowed.';
        }
      },
      copyText: function (item) {
        return KIND_LABELS[item.type] + ': ' + item.text;
      }
    });

    if (!tool) return null;

    // The type select is the second half of the filter, so it has to reset the
    // bag too — otherwise switching from truths to dares would inherit a
    // half-empty bag from the old pool.
    if (typeEl) {
      typeEl.addEventListener('change', function () {
        tool.bag.reset();
        tool.status.hide();
      });
    }

    tool.status.show('Skipping is always allowed. Nobody has to do anything they do not want to.', 'info');

    return tool;
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createTruthOrDare = createTruthOrDare;
})(window, document);

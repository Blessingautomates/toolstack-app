/**
 * ToolStack AI — Meme Idea Generator engine.
 *
 * Ids required in tools/meme-idea-generator.html:
 *   midStatus, midCategory, midDrawBtn, midClearBtn, midCopyBtn, midResults,
 *   midIdea, midFormat, midWhy, midBadge, midMeta
 *
 * Produces an idea rather than a caption: a concept, a suggested structure, and
 * a line explaining why the joke works. The third part is the reason this is a
 * different tool from the caption generator next door. A caption generator
 * hands you words; this hands you the shape of a joke and tells you which part
 * of it is doing the work, which is the part people actually struggle with.
 *
 * The structures are described generically — two-panel comparison, expectation
 * versus reality, escalating list — rather than by the names of specific
 * templates. Named templates go in and out of fashion and a lot of them are
 * somebody's artwork; describing the shape is both more durable and more
 * useful, because you can build it with whatever you have.
 *
 * No real people, brands or events appear in any of these.
 */
(function (window, document) {
  'use strict';

  var IDEAS = [
    /* ------------------------------------------------------------ everyday */
    { c: 'everyday', idea: 'The specific panic of realising you said "you too" to somebody who did not say anything you could say "you too" to.', f: 'Two-panel comparison', w: 'The joke is the gap between how fast you said it and how long you spend thinking about it afterwards. Panel two should be much longer than panel one.' },
    { c: 'everyday', idea: 'Walking into a room and forgetting why, then standing there hoping the reason comes back before somebody notices.', f: 'One image, one caption', w: 'The humour is in the stillness. The caption should describe the waiting, not the forgetting.' },
    { c: 'everyday', idea: 'The way everybody in a lift silently agrees on which buttons to press, like a tiny committee with no chair.', f: 'Escalating list of panels', w: 'Each panel adds one more unspoken rule. The last one should be the most absurd and the most obviously true.' },
    { c: 'everyday', idea: 'Saying "I will be there in five minutes" while still in bed, and believing it at the time.', f: 'Expectation vs reality', w: 'The trick is that both halves are sincere. The joke is not the lie, it is that you meant it.' },
    { c: 'everyday', idea: 'The four-second window after you wave at somebody who was not waving at you.', f: 'Reaction image with a single line', w: 'Everything rests on the recovery. Keep the caption short and let the image do the embarrassment.' },

    /* ----------------------------------------------------------------- work */
    { c: 'work', idea: 'A meeting where everybody has quietly agreed the decision was made before the meeting started.', f: 'Escalating list of panels', w: 'The escalation is the number of people pretending to consider it. The last panel is everybody nodding at once.' },
    { c: 'work', idea: 'The phrase "let us take this offline" as a complete substitute for having an opinion.', f: 'Two-panel comparison', w: 'Panel one is the sentence; panel two is what it means. The wider the gap, the better it lands.' },
    { c: 'work', idea: 'How long a "quick question" actually takes, measured against how long it was described as taking.', f: 'Expectation vs reality', w: 'Use a specific unit of measurement rather than a general complaint. Specificity is what makes it recognisable.' },
    { c: 'work', idea: 'Being on a call where everybody is waiting for somebody else to say the thing nobody wants to say.', f: 'One image, one caption', w: 'The caption should be a silence rather than a statement. Describe what nobody is saying.' },

    /* ----------------------------------------------------------- group chats */
    { c: 'chats', idea: 'The group chat where the plan has been discussed for three weeks and nobody has actually booked anything.', f: 'Escalating list of panels', w: 'Each panel is a message. The escalation is enthusiasm rising while the booking stays at zero.' },
    { c: 'chats', idea: 'Typing a long reply, deleting it, and sending "haha yeah" instead.', f: 'Two-panel comparison', w: 'The first panel should be genuinely long. The joke is the ratio between the effort and the output.' },
    { c: 'chats', idea: 'The person who replies to a message from four days ago as if no time has passed.', f: 'One image, one caption', w: 'Treat the delay as completely normal in the caption. The joke lands harder if nobody acknowledges it.' },
    { c: 'chats', idea: 'A group chat called "Weekend Plans" that has not had a message in seven months.', f: 'One image, one caption', w: 'Contrast the name against the silence. The title does all the work; the caption should be minimal.' },

    /* -------------------------------------------------------------- weekends */
    { c: 'weekend', idea: 'The list of things you are going to do on Saturday, made on Friday, read again on Sunday evening.', f: 'Expectation vs reality', w: 'Both panels should be specific. A vague list is not funny; a list with six items on it is.' },
    { c: 'weekend', idea: 'The way a Sunday afternoon develops a sense of dread with no identifiable cause.', f: 'Reaction image with a single line', w: 'Do not explain where it comes from. Everybody already knows, and explaining it breaks it.' },
    { c: 'weekend', idea: 'Getting to Friday and being too tired to do any of the things you were too tired to do on Monday.', f: 'Two-panel comparison', w: 'Make the two panels nearly identical. The joke is that nothing changed except the permission.' },
    { c: 'weekend', idea: 'The moment on a day off when you realise you have spent four hours deciding what to do.', f: 'One image, one caption', w: 'Use a specific number. Precision is what turns a complaint into a joke.' },

    /* ----------------------------------------------------------------- food */
    { c: 'food', idea: 'Opening the fridge, finding nothing, closing it, and opening it again ninety seconds later in case.', f: 'Escalating list of panels', w: 'Each panel is another opening. Three is the right number — four makes it a bit.' },
    { c: 'food', idea: 'The gap between how long a meal takes to cook and how long it takes to eat.', f: 'Expectation vs reality', w: 'Use real numbers. A forty-minute cook against a six-minute meal is the whole joke.' },
    { c: 'food', idea: 'Buying a specific ingredient for one recipe and then using two spoonfuls of it forever.', f: 'One image, one caption', w: 'The caption should be about the jar still being there months later. Longevity is the punchline.' },
    { c: 'food', idea: 'The confidence of somebody who has read one recipe and now considers themselves capable.', f: 'Two-panel comparison', w: 'Panel one is the confidence, panel two is the kitchen. Keep the second one visual rather than described.' },

    /* ----------------------------------------------------------- technology */
    { c: 'technology', idea: 'Forty-seven tabs open, none of them being read, all of them essential.', f: 'One image, one caption', w: 'The caption should defend the tabs. A joke that apologises for them is much weaker than one that justifies them.' },
    { c: 'technology', idea: 'The moment a device updates and moves everything slightly to the left for no reason.', f: 'Reaction image with a single line', w: 'Focus on one specific thing that moved rather than the whole interface. Precision again.' },
    { c: 'technology', idea: 'Being asked to accept cookies by a website you have visited every day for six years.', f: 'Escalating list of panels', w: 'The escalation is the length of the friendship against the site still asking. The last panel should be the request itself, unchanged.' },
    { c: 'technology', idea: 'A password reset that requires a password you have not used before, on a site you last visited in 2019.', f: 'Two-panel comparison', w: 'Panel two should be the attempt count. Numbers do the work here.' }
  ];

  var CATEGORY_LABELS = {
    everyday: 'Everyday',
    work: 'Work',
    chats: 'Group chats',
    weekend: 'Weekends',
    food: 'Food',
    technology: 'Technology'
  };

  function createMemeIdea(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var ideaEl = $('midIdea');
    var formatEl = $('midFormat');
    var whyEl = $('midWhy');
    var badgeEl = $('midBadge');
    var metaEl = $('midMeta');

    if (!ideaEl) return null;

    var tool = fun.drawTool(root, {
      data: IDEAS,
      filterId: 'midCategory',
      filterKey: 'c',
      drawBtnId: 'midDrawBtn',
      clearBtnId: 'midClearBtn',
      copyBtnId: 'midCopyBtn',
      resultsId: 'midResults',
      statusId: 'midStatus',
      render: function (item, info) {
        if (ideaEl) ideaEl.textContent = item.idea;
        if (formatEl) formatEl.textContent = item.f;
        if (whyEl) whyEl.textContent = item.w;
        if (badgeEl) badgeEl.textContent = CATEGORY_LABELS[item.c] || item.c;
        if (metaEl) {
          metaEl.textContent = 'Idea ' + info.drawn + ' of ' + info.total +
            ' in this category before any of them come round again.';
        }
      },
      copyText: function (item) {
        return 'Meme idea: ' + item.idea + '\n\nStructure: ' + item.f + '\nWhy it works: ' + item.w;
      },
      onClear: function () {
        if (ideaEl) ideaEl.textContent = '';
        if (formatEl) formatEl.textContent = '';
        if (whyEl) whyEl.textContent = '';
        if (badgeEl) badgeEl.textContent = '';
        if (metaEl) metaEl.textContent = '';
      }
    });

    if (!tool) return null;

    tool.status.show('An idea, a structure and the reason it works. The third part is the useful one.', 'info');

    return tool;
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createMemeIdea = createMemeIdea;
})(window, document);

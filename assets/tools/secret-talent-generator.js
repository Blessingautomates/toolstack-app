/**
 * ToolStack AI — Secret Talent Generator engine.
 *
 * Ids required in tools/secret-talent-generator.html:
 *   talStatus, talDrawBtn, talClearBtn, talCopyBtn, talResults, talName,
 *   talDesc, talTell, talMeta
 *
 * Each talent comes with a "tell" — the small thing that would give it away.
 * That is the part that makes this a generator rather than a list: a talent on
 * its own is a line of text, whereas a talent plus the detail that betrays it
 * is a character. Every talent here is drawn from its own bag, so nothing
 * repeats until the pool is exhausted.
 *
 * The talents are all genuinely mundane and mostly useless. That is the joke,
 * and it is also the honest version of the premise — "secret talent" is funnier
 * when the talent is being able to tell when a kettle is about to boil than
 * when it is playing the piano, because the second one is just a skill.
 */
(function (window, document) {
  'use strict';

  var TALENTS = [
    { name: 'Perfect Pour', d: 'You can pour exactly the right amount of anything into any glass, first time, without measuring.', tell: 'You always stop mid-pour for a fraction of a second and look slightly away.' },
    { name: 'Kettle Sense', d: 'You know when a kettle is about to boil without hearing it or seeing it.', tell: 'You look up about four seconds before anybody else in the room does.' },
    { name: 'Instant Recall of Names', d: 'You remember the name of everybody you have ever been introduced to.', tell: 'You hesitate before using a name, because using it wrong once in 2004 is still with you.' },
    { name: 'The Exact Change', d: 'You can produce the right coins for any total without counting them out.', tell: 'You jingle a pocket briefly before committing.' },
    { name: 'Flawless Direction Sense', d: 'You always know which way north is, indoors, in a basement, on a plane.', tell: 'You point north without noticing you have done it.' },
    { name: 'Reading a Room', d: 'You can tell within ten seconds whether two people in a group have fallen out.', tell: 'You glance between them when neither is speaking.' },
    { name: 'Perfect Timing on Toast', d: 'You take toast out at the exact moment it reaches peak toast.', tell: 'You are already standing at the toaster before it pops.' },
    { name: 'Parallel Parking', d: 'You can park in a gap that is barely longer than the car, first attempt, every time.', tell: 'You turn the music down.' },
    { name: 'The Catch', d: 'Anything thrown at you, you catch. Anything.', tell: 'Your hands come up before the object has left the other person’s hand.' },
    { name: 'Spotting a Fake', d: 'You can tell when a photo has been edited, or a story has been embellished.', tell: 'You zoom in on the same three places everybody else skips.' },
    { name: 'Remembering Songs', d: 'You can recall the lyrics to a song you have heard twice, including the harmony.', tell: 'You mouth the second line before it arrives.' },
    { name: 'Estimating Distance', d: 'You can judge how far away something is to within a few metres, every time.', tell: 'You say a number out loud and then check it, and are quietly pleased.' },
    { name: 'Knowing When Someone Is About to Cry', d: 'You can tell, about thirty seconds out, when somebody is going to lose it.', tell: 'You move slightly closer to them without deciding to.' },
    { name: 'Fixing a Wobble', d: 'Any table, chair or shelf that rocks, you can stabilise with whatever is within reach.', tell: 'You test furniture for wobble on the way past.' },
    { name: 'Telling When a Photo Was Taken', d: 'You can date a photograph to within a couple of years from the details in it.', tell: 'You look at the cars and the light fittings, not the faces.' },
    { name: 'The Right Word', d: 'You always find the exact word, including for things that do not have one.', tell: 'You pause and look at the ceiling while you fetch it.' },
    { name: 'Losing Nothing', d: 'You have never lost a set of keys, a wallet or a phone.', tell: 'You pat a pocket once, casually, several times an hour.' },
    { name: 'Remembering Faces', d: 'You recognise people you met once, years ago, in a different city.', tell: 'You look at somebody a beat too long before deciding to say hello.' },
    { name: 'Judging a Queue', d: 'You pick the fastest queue in any shop, almost without fail.', tell: 'You count the items in each trolley before committing.' },
    { name: 'Falling Asleep Anywhere', d: 'You can sleep on any surface, at any time of day, within about four minutes.', tell: 'You are asleep before the plane has pushed back.' },
    { name: 'The Right Amount of Seasoning', d: 'You season food correctly without tasting it.', tell: 'You do it with a flick of the wrist and never check.' },
    { name: 'Spotting a Lie in Writing', d: 'You can tell when a message has been carefully worded to avoid something.', tell: 'You read the second paragraph first.' },
    { name: 'Remembering What Was Said', d: 'You can recall a conversation almost word for word, months later.', tell: 'You quote people back to themselves, which they find unsettling.' },
    { name: 'Tying Anything', d: 'Any knot, any material, first time, and it holds.', tell: 'You test it with one sharp tug and then forget about it entirely.' },
    { name: 'Knowing When to Leave', d: 'You always leave a party at exactly the right moment.', tell: 'You are already holding your coat when the good part ends.' },
    { name: 'Hearing a Song’s Key', d: 'You can tell what key a piece of music is in without a reference note.', tell: 'You hum a note quietly to yourself before answering.' },
    { name: 'Packing a Car Boot', d: 'Everything fits, every time, with room left over.', tell: 'You stand and look at the pile for a long moment before starting.' },
    { name: 'Knowing When Bread Is Done', d: 'You can tell when bread is baked by the smell alone, to the minute.', tell: 'You open the oven and close it again without looking in.' },
    { name: 'Finding the Stud', d: 'You can find the timber behind plasterboard by tapping it.', tell: 'You tap the wall on the way past, absent-mindedly.' },
    { name: 'Knowing What Somebody Will Order', d: 'You can predict what everybody at a table will order, before they order it.', tell: 'You smile slightly when you turn out to be right.' }
  ];

  function createSecretTalent(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var nameEl = $('talName');
    var descEl = $('talDesc');
    var tellEl = $('talTell');
    var metaEl = $('talMeta');

    if (!nameEl) return null;

    var tool = fun.drawTool(root, {
      data: TALENTS,
      drawBtnId: 'talDrawBtn',
      clearBtnId: 'talClearBtn',
      copyBtnId: 'talCopyBtn',
      resultsId: 'talResults',
      statusId: 'talStatus',
      render: function (item, info) {
        if (nameEl) nameEl.textContent = item.name;
        if (descEl) descEl.textContent = item.d;
        if (tellEl) tellEl.textContent = item.tell;
        if (metaEl) {
          metaEl.textContent = 'Talent ' + info.drawn + ' of ' + info.total +
            ' before any of them come round again.';
        }
      },
      copyText: function (item) {
        return 'My secret talent: ' + item.name + '\n' + item.d + '\n\nThe tell: ' + item.tell;
      },
      onClear: function () {
        if (nameEl) nameEl.textContent = '';
        if (descEl) descEl.textContent = '';
        if (tellEl) tellEl.textContent = '';
        if (metaEl) metaEl.textContent = '';
      }
    });

    if (!tool) return null;

    tool.status.show('Everybody has one useless talent. Draw to find out which is yours.', 'info');

    return tool;
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createSecretTalent = createSecretTalent;
})(window, document);

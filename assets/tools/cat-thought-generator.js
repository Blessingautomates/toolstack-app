/**
 * ToolStack AI — Cat Thought Generator engine.
 *
 * Ids required in tools/cat-thought-generator.html:
 *   catStatus, catDrawBtn, catClearBtn, catCopyBtn, catResults, catThought,
 *   catVerdict, catMeta
 *
 * An inner monologue for a cat, plus a formal verdict on the situation. The
 * verdict is what separates this from the dog version on this site: a dog
 * thought ends in enthusiasm, a cat thought ends in a ruling. Both parts are
 * drawn from their own bags so they are not matched to each other.
 *
 * The voice is the opposite of the dog generator by design. Cat thoughts are
 * long, complete sentences, in a register somewhere between a landlord and a
 * minor deity. Nothing in the pool is affectionate in an obvious way, because
 * the humour of the format comes from the gap between how the cat behaves and
 * how it evidently regards itself.
 */
(function (window, document) {
  'use strict';

  var THOUGHTS = [
    'i have been sitting here for four minutes. nothing has occurred. i will remain.',
    'the door is closed. this is a decision somebody made. they will reconsider.',
    'you are typing. my work here is more important than your work.',
    'i have knocked the glass from the table. this was necessary. i will not explain why.',
    'this box fits me. therefore i fit the box. your measurements were wrong.',
    'you have bought me a bed. i will sleep in the box the bed came in.',
    'i am not asleep. i am resting with intent. there is a difference.',
    'the sun has moved three inches. this is a personal betrayal.',
    'i have been fed. i will now sit beside the bowl and look starved.',
    'there is a new object. it is mine. it has always been mine.',
    'you have returned. i will ignore you for forty minutes to reassert the terms.',
    'i do not want to go outside. i want the door to be open. these are different things.',
    'a human is sitting in my chair. there are other chairs. that is irrelevant.',
    'i have knocked something else off the table. i am learning nothing.',
    'you are on a call. i will now become extremely vocal.',
    'i have been brushed. i do not forgive this.',
    'the bag has been taken out. you are leaving. i will sit in the bag.',
    'somebody new has entered the house. i will hide for three hours and then behave as though i live on them.',
    'i have located the highest point in the room. i am now the ceiling’s problem.',
    'you have removed the item from my paws. i will remember this.',
    'i have slept for eighteen hours. i could sleep for eighteen more.',
    'the middle of the bowl is empty. the edges remain full. this bowl is broken.',
    'there is a bird. i cannot reach the bird. the bird is aware of this.',
    'i have sat on the newspaper you were reading. that was the point.',
    'i am going to run from one end of the house to the other at three in the morning.',
    'you have opened the fridge. i want nothing from the fridge. i wanted to look.',
    'i have been unwell on the carpet in the room nobody uses. this was a considered choice.',
    'the carrier has appeared. i am now a liquid. i cannot be lifted.',
    'i will sit on your chest and stare at your face until you wake. this is affection.',
    'i have brought you a small dead thing. you are welcome. your reaction is noted.',
    'you have moved. i was comfortable. this was not discussed.',
    'i have been told no. i have heard no. i have chosen to understand it as later.',
    'there is a patch of sun. it is moving. i will move with it. this is the whole day.',
    'i am going to sit on the keyboard directly in front of the important part.',
    'the visitor has been here two hours. i have decided they may stay. they should be honoured.',
    'i have climbed something i cannot climb down from. this is now your problem.',
    'i do not want the food you have given me. i want the food you are eating.',
    'you have taken a photograph. i have turned away. this is the arrangement.',
    'the room is quiet. i will now make a noise for no reason, while looking directly at you.',
    'i have been asleep on your clean washing for four hours. it is now my washing.'
  ];

  var VERDICTS = [
    'Verdict: not my problem.',
    'Verdict: entirely justified.',
    'Verdict: you brought this on yourself.',
    'Verdict: i will be taking this no further.',
    'Verdict: the matter is closed.',
    'Verdict: no further questions.',
    'Verdict: this will be remembered.',
    'Verdict: i was right.',
    'Verdict: nothing to add.',
    'Verdict: as expected.'
  ];

  function createCatThought(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var thoughtEl = $('catThought');
    var verdictEl = $('catVerdict');
    var metaEl = $('catMeta');

    if (!thoughtEl) return null;

    var verdictBag = fun.makeBag(function () { return VERDICTS; }, null);

    var tool = fun.drawTool(root, {
      data: THOUGHTS,
      drawBtnId: 'catDrawBtn',
      clearBtnId: 'catClearBtn',
      copyBtnId: 'catCopyBtn',
      resultsId: 'catResults',
      statusId: 'catStatus',
      render: function (item, info) {
        if (thoughtEl) thoughtEl.textContent = item;
        if (verdictEl) verdictEl.textContent = verdictBag.draw() || '';
        if (metaEl) {
          metaEl.textContent = 'Thought ' + info.drawn + ' of ' + info.total +
            ' before any of them come round again. The verdict is drawn separately.';
        }
      },
      copyText: function (item) {
        return item + '\n\n' + (verdictEl ? verdictEl.textContent : '');
      },
      onClear: function () {
        verdictBag.reset();
        if (thoughtEl) thoughtEl.textContent = '';
        if (verdictEl) verdictEl.textContent = '';
        if (metaEl) metaEl.textContent = '';
      }
    });

    if (!tool) return null;

    tool.status.show('What the cat is thinking, followed by its formal ruling on the matter.', 'info');

    return tool;
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createCatThought = createCatThought;
})(window, document);

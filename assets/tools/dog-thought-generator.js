/**
 * ToolStack AI — Dog Thought Generator engine.
 *
 * Ids required in tools/dog-thought-generator.html:
 *   dogStatus, dogDrawBtn, dogClearBtn, dogCopyBtn, dogResults, dogThought,
 *   dogMeter, dogMeta
 *
 * An inner monologue for a dog, plus an excitement meter. The meter is the joke
 * rather than a measurement: it is drawn at random on every thought, and the
 * page says so. There is no dog, and nothing here is being assessed.
 *
 * The thoughts are written to one consistent voice — short sentences, immediate
 * present tense, no context, enormous enthusiasm. A dog thought that reasons
 * about consequences is not a dog thought, so nothing in the pool does. The cat
 * version on this site is the opposite voice on purpose; the two are different
 * tools rather than one tool with the noun swapped.
 */
(function (window, document) {
  'use strict';

  var THOUGHTS = [
    'somebody is at the door. somebody is at the door. SOMEBODY IS AT THE DOOR.',
    'the bowl. the bowl. the bowl. the bowl.',
    'there was a sound. i do not know what it was. i will now bark about it for four minutes.',
    'they said a word. i know that word. i have known that word my whole life.',
    'i have been left alone for eleven years. it has been nine minutes.',
    'that is my stick. i have decided. it is mine.',
    'it is a shoe. it is not my shoe. it is now my shoe.',
    'the lead. the lead. the lead. the lead. the lead.',
    'i do not know what is happening and i am very pleased about it.',
    'somebody stood up. this could mean anything. i am ready.',
    'there is a smell. it is the best smell. i must roll in it immediately.',
    'that is a dog. i am a dog. we should be friends. why are we not friends.',
    'i have done something. i do not know what. everybody is looking at me.',
    'i have found something in the garden. it is disgusting. i am very proud.',
    'the humans are eating. i am not eating. this is a problem.',
    'it is raining. i do not like the rain. i will stand in it anyway.',
    'you have returned. i had given up hope. it has been four minutes.',
    'my ball is under the sofa. this is the worst thing that has ever happened.',
    'the postman has been. i have seen him off. i am a hero.',
    'i am going to lie on your feet now. do not move. this is important.',
    'the car is moving. this means the park. this definitely means the park.',
    'there is a cat. i do not know what to do about the cat. i will stare.',
    'i have eaten. i do not remember eating. i would like to eat.',
    'the bin is available. the bin has things in it. i have a plan.',
    'i am a good boy. i would like this confirmed. more than once.',
    'the doorbell. the doorbell. the doorbell. the doorbell.',
    'something moved outside. it might be a leaf. it might be a burglar.',
    'i have the zoomies and no way to explain them.',
    'you are sad. i have noticed. i will sit on you until it stops.',
    'the walk was three hours ago. i have forgotten the walk.',
    'i am going to bark at that one specific part of the garden forever.',
    'that was a good smell and i would like to smell it again.',
    'water. the sea. the hose. any water. i am not picky.',
    'i do not understand the rules of this game but i am winning.',
    'the vacuum has returned from wherever it goes. i will defend us.',
    'i have been given a treat. i have eaten the treat. i would like another treat.',
    'you are eating. i am here. these two facts are related.',
    'that is a very small dog. it is being carried. i am outraged.',
    'i have rolled in something. you will find out shortly.',
    'i am coming with you. i do not need to know where.'
  ];

  function createDogThought(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var thoughtEl = $('dogThought');
    var meterEl = $('dogMeter');
    var metaEl = $('dogMeta');

    if (!thoughtEl) return null;

    /* Rendered as block characters rather than a CSS bar so the meter needs no
     * theme rules — it is plain text, and it reads correctly in both palettes. */
    function excitement(level) {
      var out = '';
      for (var i = 1; i <= 5; i++) out += i <= level ? '■' : '□';
      return out;
    }

    var tool = fun.drawTool(root, {
      data: THOUGHTS,
      drawBtnId: 'dogDrawBtn',
      clearBtnId: 'dogClearBtn',
      copyBtnId: 'dogCopyBtn',
      resultsId: 'dogResults',
      statusId: 'dogStatus',
      render: function (item, info) {
        var level = 1 + Math.floor(Math.random() * 5);

        if (thoughtEl) thoughtEl.textContent = item;
        if (meterEl) meterEl.textContent = excitement(level) + '  excitement ' + level + ' of 5';
        if (metaEl) {
          metaEl.textContent = 'Thought ' + info.drawn + ' of ' + info.total +
            ' before any of them come round again. The excitement level is drawn at random — there is no dog.';
        }
      },
      copyText: function (item) {
        return item;
      },
      onClear: function () {
        if (thoughtEl) thoughtEl.textContent = '';
        if (meterEl) meterEl.textContent = '';
        if (metaEl) metaEl.textContent = '';
      }
    });

    if (!tool) return null;

    tool.status.show('What the dog is thinking, as far as anyone can tell. The excitement meter is random.', 'info');

    return tool;
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createDogThought = createDogThought;
})(window, document);

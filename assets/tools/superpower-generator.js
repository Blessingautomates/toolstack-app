/**
 * ToolStack AI — Superpower Generator engine.
 *
 * Ids required in tools/superpower-generator.html:
 *   powStatus, powCategory, powDrawBtn, powClearBtn, powCopyBtn, powResults,
 *   powName, powDesc, powDrawback, powBadge, powMeta
 *
 * A power and a catch, drawn separately. The catch is the whole point: a
 * superpower with no cost is boring, and every interesting one in fiction comes
 * with a limitation that shapes how the person lives with it. So the drawback
 * pool is drawn from its own bag, deliberately unmatched to the power, which
 * produces pairings like invulnerability that only works on Tuesdays.
 *
 * The drawbacks are written to be generic on purpose. A drawback tailored to
 * its power reads like a rules clarification; a generic one applied to the
 * wrong power reads like a joke, which is what this is.
 */
(function (window, document) {
  'use strict';

  var POWERS = [
    /* ------------------------------------------------------------- physical */
    { c: 'physical', name: 'Impossible Strength', d: 'You can lift anything you can get a grip on. The problem is almost always the grip.' },
    { c: 'physical', name: 'Blinding Speed', d: 'You move faster than anyone can follow. Stopping is a separate skill you have not learned.' },
    { c: 'physical', name: 'Flight', d: 'You can fly. It is cold up there and you have never solved the landing.' },
    { c: 'physical', name: 'Near-Invulnerability', d: 'Nothing hurts you. Nothing heals you either, so the small stuff accumulates.' },
    { c: 'physical', name: 'Rapid Regeneration', d: 'You heal from anything, given a few hours and something to eat afterwards.' },
    { c: 'physical', name: 'Shapeshifting', d: 'Any face, any build. You keep the same voice, which rather gives the game away.' },
    { c: 'physical', name: 'Invisibility', d: 'Nobody can see you. Your clothes are still completely visible.' },
    { c: 'physical', name: 'Wall-Crawling', d: 'You can climb any surface. Getting down is faster than you would like.' },

    /* --------------------------------------------------------------- mental */
    { c: 'mental', name: 'Telepathy', d: 'You can hear thoughts. Not selectively, and not quietly.' },
    { c: 'mental', name: 'Precognition', d: 'You see what is about to happen, roughly four seconds before it does.' },
    { c: 'mental', name: 'Total Recall', d: 'You remember everything you have ever seen. Including all of it at once.' },
    { c: 'mental', name: 'Instant Fluency', d: 'Any language, after hearing one sentence of it.' },
    { c: 'mental', name: 'Lie Detection', d: 'You know when somebody is lying. You have no idea what the truth is.' },
    { c: 'mental', name: 'Technopathy', d: 'Any machine does what you want. It also tells you how it feels about it.' },
    { c: 'mental', name: 'Time Dilation', d: 'You can slow your perception of time. Your body does not slow down with it.' },
    { c: 'mental', name: 'Remote Viewing', d: 'You can see any place you have been before, right now, from here.' },

    /* ------------------------------------------------------------ elemental */
    { c: 'elemental', name: 'Pyrokinesis', d: 'You can start a fire with your mind. Putting it out is a bucket situation.' },
    { c: 'elemental', name: 'Cryokinesis', d: 'You freeze anything you touch. Everything you own has a frost problem.' },
    { c: 'elemental', name: 'Weather Control', d: 'You can change the weather. It takes about six hours to take effect.' },
    { c: 'elemental', name: 'Accelerated Growth', d: 'Plants do whatever you ask. They also follow you around.' },
    { c: 'elemental', name: 'Water Breathing', d: 'You can breathe underwater indefinitely. You cannot see very much down there.' },
    { c: 'elemental', name: 'Electrical Control', d: 'You command electricity. Every device you own is very slightly broken.' },
    { c: 'elemental', name: 'Gravity Manipulation', d: 'You can change what falls and which way. You cannot change your own weight.' },
    { c: 'elemental', name: 'Light Bending', d: 'You can redirect any light. Shadows do not obey you, which is the harder half.' },

    /* --------------------------------------------------------------- social */
    { c: 'social', name: 'Instant Trust', d: 'People believe you immediately. They also tell you everything, constantly.' },
    { c: 'social', name: 'Perfect Persuasion', d: 'Anyone will agree with you. They remember afterwards that they did.' },
    { c: 'social', name: 'Emotional Reading', d: 'You can see exactly how somebody feels. You cannot do anything about it.' },
    { c: 'social', name: 'Unshakable Calm', d: 'You can settle any room. Including rooms that were settling fine on their own.' },
    { c: 'social', name: 'Always the Right Words', d: 'You never say the wrong thing. You also never say anything surprising.' },

    /* --------------------------------------------------------------- absurd */
    { c: 'absurd', name: 'Object Conversation', d: 'You can talk to any object and it will answer. Objects are not good company.' },
    { c: 'absurd', name: 'The Chair', d: 'You can summon one specific chair. It is a good chair. It is only the one chair.' },
    { c: 'absurd', name: 'Ten-Second Rewind', d: 'You can undo the last ten seconds. Nobody else remembers it, which gets lonely.' },
    { c: 'absurd', name: 'Perfect Parking', d: 'A space is always available. You do not own a car.' },
    { c: 'absurd', name: 'Never Rained On', d: 'Rain avoids you entirely. So does every other kind of weather, including the nice kind.' },
    { c: 'absurd', name: 'Bread From Nowhere', d: 'You can produce a fresh loaf at will. Just the one kind of bread.' }
  ];

  var DRAWBACKS = [
    'It only works when nobody is watching.',
    'It works perfectly, but you have to explain it out loud every single time.',
    'You cannot switch it off.',
    'It only works on Tuesdays.',
    'It works, but it is exhausting and you need a long nap afterwards.',
    'Everybody assumes you are joking.',
    'It only works on things you do not care about.',
    'It works on everyone except the person you actually want it to work on.',
    'You have to be completely honest for it to activate.',
    'It works in ten-second bursts and then stops for an hour.',
    'It goes wrong roughly one time in ten, entirely at random.',
    'It only works when you are slightly annoyed.',
    'Somebody standing nearby gets the credit.',
    'It works, but you never remember doing it.',
    'It only works while you are standing completely still.',
    'It only works on strangers.',
    'You cannot use it on your own behalf.',
    'It arrives with a strong smell of oranges.',
    'It works, and everybody notices, and everybody mentions it.',
    'It works exactly once a day, whether you need it or not.'
  ];

  var CATEGORY_LABELS = {
    physical: 'Physical',
    mental: 'Mental',
    elemental: 'Elemental',
    social: 'Social',
    absurd: 'Absurd'
  };

  function createSuperpowerGenerator(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var nameEl = $('powName');
    var descEl = $('powDesc');
    var drawbackEl = $('powDrawback');
    var badgeEl = $('powBadge');
    var metaEl = $('powMeta');

    if (!nameEl) return null;

    /* The drawback bag runs separately from the power bag, so the two are not
     * correlated in any way. That is what produces the interesting pairings. */
    var drawbackBag = fun.makeBag(function () { return DRAWBACKS; }, null);

    var tool = fun.drawTool(root, {
      data: POWERS,
      filterId: 'powCategory',
      filterKey: 'c',
      drawBtnId: 'powDrawBtn',
      clearBtnId: 'powClearBtn',
      copyBtnId: 'powCopyBtn',
      resultsId: 'powResults',
      statusId: 'powStatus',
      render: function (item, info) {
        if (nameEl) nameEl.textContent = item.name;
        if (descEl) descEl.textContent = item.d;
        if (badgeEl) badgeEl.textContent = CATEGORY_LABELS[item.c] || item.c;

        var drawback = drawbackBag.draw();
        if (drawbackEl) {
          drawbackEl.textContent = drawback ||
            'No catch this time, which has never happened before.';
        }

        if (metaEl) {
          metaEl.textContent = 'Power ' + info.drawn + ' of ' + info.total +
            ' in this category. The catch is drawn separately, so it is not matched to the power on purpose.';
        }
      },
      copyText: function (item) {
        return item.name + '\n' + item.d +
          '\n\nThe catch: ' + (drawbackEl ? drawbackEl.textContent : '');
      },
      onClear: function () {
        drawbackBag.reset();
        if (nameEl) nameEl.textContent = '';
        if (descEl) descEl.textContent = '';
        if (drawbackEl) drawbackEl.textContent = '';
        if (badgeEl) badgeEl.textContent = '';
        if (metaEl) metaEl.textContent = '';
      }
    });

    if (!tool) return null;

    tool.status.show('A power and a catch, drawn separately. The catch is where the interesting part lives.', 'info');

    return tool;
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createSuperpowerGenerator = createSuperpowerGenerator;
})(window, document);

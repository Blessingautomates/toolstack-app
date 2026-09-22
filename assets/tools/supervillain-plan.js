/**
 * ToolStack AI — Supervillain Plan Generator engine.
 *
 * Ids required in tools/supervillain-plan.html:
 *   svpStatus, svpDrawBtn, svpClearBtn, svpCopyBtn, svpResults, svpGoal,
 *   svpMethod, svpFlaw, svpBadge, svpMeta
 *
 * Three parts: what the villain wants, how they intend to get it, and the small
 * flaw that will end the whole thing. The flaw is the point. Every plan here
 * fails for a reason that has nothing to do with the hero — a subscription, a
 * committee, a door that only opens one way — because that is how the format
 * actually works and it is funnier than a plan that fails for being evil.
 *
 * Every objective is petty and harmless: mild civic inconvenience, aesthetic
 * crimes, administrative nuisance. Nothing in the pools describes violence,
 * anything aimed at a group of people, or any act that would hurt somebody. The
 * joke only works if the stakes are absurdly low, so keeping the stakes low is a
 * constraint on the writing rather than a disclaimer bolted on afterwards.
 *
 * All names, organisations and plans are invented.
 */
(function (window, document) {
  'use strict';

  var GOALS = [
    'To have every lift in the city announce the floor in an unnecessarily dramatic voice.',
    'To replace all the background music in every supermarket with one specific song, on a loop, forever.',
    'To make every pedestrian crossing in the country take eleven seconds longer than it needs to.',
    'To ensure that every printer in every office, everywhere, prints one page slightly crooked.',
    'To have the phrase "you are on mute" removed from every video calling platform and replaced with nothing.',
    'To change the opening hours of every shop by four minutes, in opposite directions, with no announcement.',
    'To make all bread, nationally, slightly too thick to fit in a standard toaster.',
    'To have every automated phone system answer with a real person, immediately, which would bring the economy to its knees.',
    'To ensure every hotel shower is exactly one degree colder than anybody would like.',
    'To make all packaging resealable in a way that never quite reseals.',
    'To have every road sign in the country moved two metres to the left. Just two metres. Everything else identical.',
    'To introduce a nationwide requirement that all meetings begin with a five-minute summary of the previous meeting.',
    'To replace every hold message with complete silence, so callers cannot tell whether the call has dropped.',
    'To make all socks sold in pairs where the two socks are marginally different shades.'
  ];

  var METHODS = [
    'Through a shell company that owns a second shell company, which is owned by a third, which is owned by a man in a caravan who is not aware of any of this.',
    'By acquiring the relevant committee. Not bribing it. Acquiring it. It was cheap and nobody else wanted it.',
    'Using a piece of equipment that was going to be thrown away anyway and has been in a lock-up since 2014.',
    'By simply filing the correct forms, repeatedly, in the right order, until everybody gave up and approved it.',
    'With a modified version of something already in every home, which is the elegant part and the part that will be explained at length.',
    'By getting one person in one office to change one setting, which would do more than any amount of machinery.',
    'Through a subscription service with a free trial that nobody cancels because cancelling requires a phone call.',
    'By waiting. The plan requires nothing except patience and the assumption that everybody else will eventually move on.',
    'Using a network of volunteers who believe they are participating in a completely unrelated survey.',
    'By buying the debt of the one company that could have stopped it, for a surprisingly small amount of money.',
    'Through a loophole in a bylaw from 1873 that was never repealed because nobody could be bothered.',
    'By doing it openly, in daylight, with planning permission, because nobody believes anything is happening if the paperwork is in order.'
  ];

  var FLAWS = [
    'The entire scheme depends on a subscription that renews annually and the villain has never once checked the card details on file.',
    'The plan requires unanimous agreement from a committee of nine that meets twice a year and has not reached a unanimous decision since 1998.',
    'The villain has told four separate people the plan in full, in a lift, and two of them work for the people who would stop it.',
    'Everything hinges on one door in one building that can only be opened from the other side.',
    'The lair is rented and the landlord is doing an inspection in three weeks.',
    'The plan works perfectly except on Tuesdays, and the villain has never been able to establish why.',
    'It requires a specific piece of hardware that was discontinued in 2011 and the villain has bought eleven of them, all broken.',
    'The villain has insisted on a logo, a colour scheme, branded lanyards and a launch event, which has consumed the entire budget.',
    'The scheme has one employee, and that employee has been meaning to hand in their notice for eight months.',
    'The final step depends on nobody in the city noticing something extremely noticeable, outdoors, at noon.',
    'The villain has scheduled the whole thing to begin at 06:00 and has never successfully woken up before 09:30.',
    'The plan is flawless except that it requires the villain to explain it to somebody at the final moment, at length, with a diagram.'
  ];

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function createSupervillainPlan(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var goalEl = $('svpGoal');
    var methodEl = $('svpMethod');
    var flawEl = $('svpFlaw');
    var badgeEl = $('svpBadge');
    var metaEl = $('svpMeta');

    if (!goalEl) return null;

    var methodBag = fun.makeBag(function () { return METHODS; }, null);
    var flawBag = fun.makeBag(function () { return FLAWS; }, null);

    var tool = fun.drawTool(root, {
      data: GOALS,
      drawBtnId: 'svpDrawBtn',
      clearBtnId: 'svpClearBtn',
      copyBtnId: 'svpCopyBtn',
      resultsId: 'svpResults',
      statusId: 'svpStatus',
      render: function (item, info) {
        if (goalEl) goalEl.textContent = item;
        if (methodEl) methodEl.textContent = methodBag.draw() || '';
        if (flawEl) flawEl.textContent = flawBag.draw() || '';
        if (badgeEl) badgeEl.textContent = 'Will not survive contact with Tuesday';
        if (metaEl) {
          metaEl.textContent = 'Plan ' + info.drawn + ' of ' + info.total +
            ' before any of them come round again. The method and the flaw are drawn separately and are not matched to each other.';
        }
      },
      copyText: function (item) {
        return 'Objective: ' + item +
          '\nMethod: ' + (methodEl ? methodEl.textContent : '') +
          '\nFatal flaw: ' + (flawEl ? flawEl.textContent : '') +
          '\n\n(Invented. The stakes are deliberately tiny.)';
      },
      onClear: function () {
        methodBag.reset();
        flawBag.reset();
        if (goalEl) goalEl.textContent = '';
        if (methodEl) methodEl.textContent = '';
        if (flawEl) flawEl.textContent = '';
        if (badgeEl) badgeEl.textContent = '';
        if (metaEl) metaEl.textContent = '';
      }
    });

    if (!tool) return null;

    tool.status.show('An objective, a method, and the reason it will not work. None of the stakes are real.', 'info');

    return tool;
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createSupervillainPlan = createSupervillainPlan;
})(window, document);

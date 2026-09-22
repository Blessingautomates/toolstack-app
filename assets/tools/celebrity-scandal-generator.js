/**
 * ToolStack AI — Celebrity Scandal Generator engine.
 *
 * Ids required in tools/celebrity-scandal-generator.html:
 *   scanStatus, scanDrawBtn, scanClearBtn, scanCopyBtn, scanResults,
 *   scanHeadline, scanDetail, scanStatement, scanBadge, scanMeta
 *
 * Every name in this file is invented by combining a first-name pool with a
 * surname pool, and every "scandal" is deliberately trivial — queuing, holding
 * a sandwich, wearing a coat. Nothing here refers to a real person, and nothing
 * here is damaging, because a generator that produced real accusations about
 * real people would be a defamation machine rather than a joke. The names are
 * also written to sound invented, so a reader never has to work out whether the
 * subject exists.
 *
 * The comedy is in the register, not the content: a real tabloid headline
 * cadence applied to nothing at all. The statement line is written the way a
 * publicist writes, which is where most of the joke lives.
 */
(function (window, document) {
  'use strict';

  var FIRST_NAMES = [
    'Bramble', 'Toby', 'Cleo', 'Rufus', 'Marla', 'Dmitri', 'Perpetua', 'Hugo',
    'Suki', 'Alonzo', 'Wren', 'Barnaby', 'Nia', 'Ottoline', 'Caspian', 'Delphine'
  ];

  var LAST_NAMES = [
    'Vance', 'Marsh-Hendricks', 'Okafor-Bell', 'Pemberton', 'Quist', 'Alderman',
    'Featherstone', 'Nakamura-Reyes', 'Bishop', 'Calloway'
  ];

  /* Each incident is a headline fragment plus the eyewitness line that would
   * run underneath it. All of them are non-events. */
  var INCIDENTS = [
    {
      i: 'Has Been Photographed Queuing',
      d: 'Witnesses report the figure stood in a queue for approximately six minutes, moving forward when the queue moved forward, in what one onlooker described as "a completely standard way".'
    },
    {
      i: 'Was Seen Eating A Sandwich In Public',
      d: 'The sandwich was described by a bystander as "ordinary" and "held with two hands". No further details about the sandwich have been made available.'
    },
    {
      i: 'Wore A Coat',
      d: 'Sources close to the situation confirm the coat was worn outdoors, in the usual manner, over the top of other clothing. The coat has not been commented on by anyone involved.'
    },
    {
      i: 'Has Not Posted Anything For Nine Days',
      d: 'The absence of posts has been interpreted by fans as a signal, a statement, a rest, a rebrand, or nothing at all. Insiders say it is most likely the last one.'
    },
    {
      i: 'Was Spotted Buying A Plant',
      d: 'An eyewitness claims the plant was "definitely a plant" and that money changed hands. The plant is understood to be doing well.'
    },
    {
      i: 'Reportedly Left A Party At A Reasonable Hour',
      d: 'The departure took place at what one guest called "a normal time to leave". Others have described the decision as "sensible" and "not really a story".'
    },
    {
      i: 'Has Been Seen Walking A Dog',
      d: 'The dog was on a lead. The lead was attached. Both parties were moving in the same direction for the duration of the walk.'
    },
    {
      i: 'Was Overheard Saying "No Worries"',
      d: 'The phrase was deployed in response to a minor apology. Linguists have declined to comment, citing a lack of anything to say.'
    },
    {
      i: 'Sat On A Bench',
      d: 'The bench was public. The sitting lasted around eleven minutes. Nobody approached and nothing occurred.'
    },
    {
      i: 'Has Changed Their Hair Slightly',
      d: 'The change is described as "subtle" and "within the range of what hair does". A full comparison of before and after has been commissioned by nobody.'
    },
    {
      i: 'Was Seen Carrying Two Bags',
      d: 'One bag in each hand. Witnesses disagree about which bag was heavier, and this disagreement remains unresolved.'
    },
    {
      i: 'Ordered A Coffee And Then Another Coffee',
      d: 'The second coffee was ordered approximately forty minutes after the first. Insiders describe the sequence as "a pattern that has been going on for years".'
    },
    {
      i: 'Reportedly Enjoyed A Television Programme',
      d: 'The programme has not been named. The enjoyment has not been quantified. A spokesperson has confirmed only that it happened, in a room, on a sofa.'
    },
    {
      i: 'Was Photographed Looking At A Menu',
      d: 'The menu was being read. The reading took some time. No order was placed while the photograph was taken, because that is not how menus work.'
    },
    {
      i: 'Has Been Described As "Fine" By A Neighbour',
      d: 'The neighbour, who asked not to be identified and also to be identified, said things were "fine" and that there was "nothing to report", before reporting it.'
    },
    {
      i: 'Took The Train',
      d: 'A train was taken from one place to another place. The journey passed without incident, which is the incident.'
    }
  ];

  var STATEMENTS = [
    'A representative said: "We would ask that people respect the family’s privacy at this ordinary time."',
    'A spokesperson said: "This is a private matter and we will not be commenting further," before commenting further at length.',
    'A statement released this morning read: "Any suggestion that there is a story here is categorically untrue, and also we would prefer nobody looked into it."',
    'A representative confirmed the sequence of events "happened in the order in which it happened", and declined to elaborate.',
    'A spokesperson said the subject was "aware of the coverage" and "found it, on balance, quite a lot of coverage".',
    'A statement read: "We are disappointed that a completely unremarkable afternoon has been treated this way, and we would like everybody to move on, starting with us."',
    'A representative said: "There is no feud. There has never been a feud. We would like to be clear that the absence of a feud is not itself a story."',
    'A spokesperson said: "They are fine. Everybody is fine. Please go outside."'
  ];

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function createCelebrityScandal(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var headlineEl = $('scanHeadline');
    var detailEl = $('scanDetail');
    var statementEl = $('scanStatement');
    var badgeEl = $('scanBadge');
    var metaEl = $('scanMeta');

    if (!headlineEl) return null;

    var incidentBag = fun.makeBag(function () { return INCIDENTS; }, null);

    var tool = fun.drawTool(root, {
      data: INCIDENTS,
      drawBtnId: 'scanDrawBtn',
      clearBtnId: 'scanClearBtn',
      copyBtnId: 'scanCopyBtn',
      resultsId: 'scanResults',
      statusId: 'scanStatus',
      render: function (item, info) {
        var name = pick(FIRST_NAMES) + ' ' + pick(LAST_NAMES);
        var statement = pick(STATEMENTS);

        if (headlineEl) headlineEl.textContent = 'BREAKING: ' + name + ' ' + item.i;
        if (detailEl) detailEl.textContent = item.d;
        if (statementEl) statementEl.textContent = statement;
        if (badgeEl) badgeEl.textContent = 'Entirely invented';
        if (metaEl) {
          metaEl.textContent = 'Story ' + info.drawn + ' of ' + info.total +
            ' before any of them come round again. The name was assembled at random from two word lists.';
        }
      },
      copyText: function (item) {
        return (headlineEl ? headlineEl.textContent : '') +
          '\n\n' + item.d +
          '\n\n' + (statementEl ? statementEl.textContent : '') +
          '\n\n(Every name and event on this page is invented. Any resemblance to a real person is coincidental.)';
      },
      onClear: function () {
        if (headlineEl) headlineEl.textContent = '';
        if (detailEl) detailEl.textContent = '';
        if (statementEl) statementEl.textContent = '';
        if (badgeEl) badgeEl.textContent = '';
        if (metaEl) metaEl.textContent = '';
      }
    });

    if (!tool) return null;

    tool.status.show('Invented names, invented events, invented outrage. Nothing here is about a real person.', 'info');

    return tool;
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createCelebrityScandal = createCelebrityScandal;
})(window, document);

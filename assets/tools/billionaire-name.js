/**
 * ToolStack AI — Billionaire Name Generator engine.
 *
 * Ids required in tools/billionaire-name.html:
 *   bilStatus, bilDrawBtn, bilClearBtn, bilCopyBtn, bilResults, bilName,
 *   bilWorth, bilSource, bilQuote, bilBadge, bilMeta
 *
 * Produces a fictional fortune: a name, a net worth, where the money came from
 * and a piece of advice about it. Every company, person and product named here
 * is invented. No real business, brand or billionaire appears anywhere in this
 * file, and the sources of wealth are deliberately absurd rather than
 * plausible-sounding, so nothing reads as a claim about anybody who exists.
 *
 * The quote is the part doing the work. Business advice from billionaires has a
 * very specific shape — a banal observation delivered as revelation — and every
 * line in that pool is written to that shape.
 */
(function (window, document) {
  'use strict';

  var FIRST_NAMES = [
    'Rex', 'Constance', 'Ambrose', 'Verity', 'Duke', 'Portia', 'Landon',
    'Sable', 'Ford', 'Ingrid', 'Cyrus', 'Marisol', 'Auden', 'Tamsin',
    'Sterling', 'Juno', 'Harlan', 'Odette'
  ];

  var LAST_NAMES = [
    'Kestrel', 'Vanterpool', 'Ashgrove', 'Rothbury', 'Mallory-Crane', 'Stane',
    'Whitlock', 'Fairweather', 'Osgood', 'Bellamy', 'Thorne-Hale', 'Redgate'
  ];

  var SOURCES = [
    'Made it in logistics. Nobody has ever been able to establish what was being moved, or where, or why it needed so many warehouses.',
    'Founded a company that does something with data. The company’s own website takes eleven paragraphs to not explain it.',
    'Inherited a modest sum and, through a series of decisions, made it a slightly larger modest sum. The rest is compound interest and a very good accountant.',
    'Bought a chain of car parks in a year when everybody else was selling car parks. Has never fully explained the reasoning and no longer needs to.',
    'Started with one vending machine in a leisure centre. Now owns four thousand vending machines and has strong opinions about the crisps.',
    'Sold a business to a larger business, then bought it back when the larger business could not run it, then sold it again. Nobody knows how this made money.',
    'Built a subscription service for something that used to be free. It is free again, but the subscription remains, and so does the revenue.',
    'Owns a great deal of land in a place with no roads. Has been described by surveyors as "technically correct".',
    'Runs a private members’ club with no members, three locations and a waiting list of nine years.',
    'Wrote one piece of software in a fortnight in a spare room. Has spent the thirty years since describing that fortnight.',
    'Invested early in something that everybody else thought was a joke. It was, briefly, and then it was worth a great deal.',
    'Consolidated an industry that did not want to be consolidated, by asking politely and then asking less politely.'
  ];

  var QUOTES = [
    '"I get up at four in the morning. Not because it helps. I just do, and now it is part of the story."',
    '"Nobody ever got rich by doing the thing they said they would do on time."',
    '"Failure is the best teacher, which is why I have arranged for other people to experience it."',
    '"Money is not the goal. Money is the scoreboard. The goal is also money."',
    '"If you can count your money, you do not have enough money to need to count it."',
    '"I have never once looked at a balance sheet and felt joy. I have looked at it and felt calm, which is close enough."',
    '"The secret is hiring people smarter than you and then taking the credit in the interviews."',
    '"Work hard, stay humble, and make sure the humble part happens in front of a camera."',
    '"There are only three things you need: capital, timing and luck. I had two of them, and I will not be saying which."',
    '"Everybody asks what I would tell my younger self. My younger self would not have listened, and would have been right not to."',
    '"I do not believe in work-life balance. I believe in a very good assistant."',
    '"You cannot pour from an empty cup, which is why I have four hundred cups and somebody who fills them."',
    '"Do what you love and you will never work a day in your life. Alternatively, own what other people love."',
    '"My biggest risk was believing in myself. My second biggest risk was a bridge loan in the spring of 2009 that I do not discuss."'
  ];

  var CAVEATS = [
    'The number is generated at random and is not an estimate of anything.',
    'No company named above exists. No person named above exists.',
    'Net worth is a fictional figure, drawn at random, and carries no information about the real world.'
  ];

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function netWorth() {
    /* Biased towards the low hundreds, because "eleven billion" is funnier than
     * a uniformly random number that might land on 900 and read as a joke about
     * a specific real fortune. */
    var roll = Math.random();
    var billions;
    if (roll < 0.55) billions = 3 + Math.floor(Math.random() * 47);
    else if (roll < 0.9) billions = 50 + Math.floor(Math.random() * 250);
    else billions = 300 + Math.floor(Math.random() * 400);
    return '$' + billions + ' billion';
  }

  function createBillionaireName(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var nameEl = $('bilName');
    var worthEl = $('bilWorth');
    var sourceEl = $('bilSource');
    var quoteEl = $('bilQuote');
    var badgeEl = $('bilBadge');
    var metaEl = $('bilMeta');

    if (!nameEl) return null;

    var sourceBag = fun.makeBag(function () { return SOURCES; }, null);
    var quoteBag = fun.makeBag(function () { return QUOTES; }, null);

    var tool = fun.drawTool(root, {
      data: SOURCES,
      drawBtnId: 'bilDrawBtn',
      clearBtnId: 'bilClearBtn',
      copyBtnId: 'bilCopyBtn',
      resultsId: 'bilResults',
      statusId: 'bilStatus',
      render: function (item, info) {
        var fullName = pick(FIRST_NAMES) + ' ' + pick(LAST_NAMES);

        if (nameEl) nameEl.textContent = fullName;
        if (worthEl) worthEl.textContent = netWorth();
        if (sourceEl) sourceEl.textContent = item;
        if (quoteEl) quoteEl.textContent = quoteBag.draw() || '';
        if (badgeEl) badgeEl.textContent = 'Invented';
        if (metaEl) {
          metaEl.textContent = 'Fortune ' + info.drawn + ' of ' + info.total +
            ' before any of them come round again. ' + pick(CAVEATS);
        }
      },
      copyText: function (item) {
        return (nameEl ? nameEl.textContent : '') +
          '\n' + (worthEl ? worthEl.textContent : '') +
          '\n\n' + item +
          '\n\n' + (quoteEl ? quoteEl.textContent : '') +
          '\n\n(Invented. No real person, company or figure is described here.)';
      },
      onClear: function () {
        quoteBag.reset();
        if (nameEl) nameEl.textContent = '';
        if (worthEl) worthEl.textContent = '';
        if (sourceEl) sourceEl.textContent = '';
        if (quoteEl) quoteEl.textContent = '';
        if (badgeEl) badgeEl.textContent = '';
        if (metaEl) metaEl.textContent = '';
      }
    });

    if (!tool) return null;

    tool.status.show('A fortune, a backstory and a piece of advice. All of it invented.', 'info');

    return tool;
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createBillionaireName = createBillionaireName;
})(window, document);

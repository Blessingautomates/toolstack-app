/**
 * ToolStack AI — Secret Identity Generator engine.
 *
 * Ids required in tools/secret-identity.html:
 *   sidStatus, sidNameInput, sidDrawBtn, sidClearBtn, sidCopyBtn, sidResults,
 *   sidCover, sidJob, sidTell, sidHideout, sidMeta
 *
 * Builds a cover identity. If you type a name, the cover is chosen to share its
 * initial — the oldest and worst tradecraft in fiction, and the reason the tool
 * asks for a name at all. With no name typed it draws one freely.
 *
 * The jobs are all deliberately dull, because that is the only kind of cover
 * that works: nobody remembers a person who installs commercial flooring. The
 * "tell" is the part that makes it a character rather than a form — it is the
 * small habit that would give the whole thing away in a week, which is funnier
 * and truer than a list of impressive spy skills.
 *
 * Nothing is stored and nothing is transmitted. A typed name is used in the
 * browser and discarded when the page is closed.
 */
(function (window, document) {
  'use strict';

  /* Cover first names, tagged with their initial so a typed name can be matched
   * to one that starts the same way. */
  var COVER_FIRST = [
    { n: 'Alan', i: 'a' }, { n: 'Amanda', i: 'a' }, { n: 'Arthur', i: 'a' },
    { n: 'Brenda', i: 'b' }, { n: 'Barry', i: 'b' }, { n: 'Belinda', i: 'b' },
    { n: 'Colin', i: 'c' }, { n: 'Carol', i: 'c' }, { n: 'Clive', i: 'c' },
    { n: 'Denise', i: 'd' }, { n: 'Derek', i: 'd' }, { n: 'Diane', i: 'd' },
    { n: 'Elaine', i: 'e' }, { n: 'Eric', i: 'e' }, { n: 'Eileen', i: 'e' },
    { n: 'Fiona', i: 'f' }, { n: 'Frank', i: 'f' }, { n: 'Felicity', i: 'f' },
    { n: 'Graham', i: 'g' }, { n: 'Gail', i: 'g' }, { n: 'Gordon', i: 'g' },
    { n: 'Helen', i: 'h' }, { n: 'Howard', i: 'h' }, { n: 'Harriet', i: 'h' },
    { n: 'Ian', i: 'i' }, { n: 'Irene', i: 'i' }, { n: 'Ivan', i: 'i' },
    { n: 'Janet', i: 'j' }, { n: 'Jeffrey', i: 'j' }, { n: 'Joan', i: 'j' },
    { n: 'Karen', i: 'k' }, { n: 'Keith', i: 'k' }, { n: 'Kevin', i: 'k' },
    { n: 'Linda', i: 'l' }, { n: 'Leonard', i: 'l' }, { n: 'Lorraine', i: 'l' },
    { n: 'Malcolm', i: 'm' }, { n: 'Maureen', i: 'm' }, { n: 'Martin', i: 'm' },
    { n: 'Nigel', i: 'n' }, { n: 'Nicola', i: 'n' }, { n: 'Norman', i: 'n' },
    { n: 'Olive', i: 'o' }, { n: 'Owen', i: 'o' }, { n: 'Odette', i: 'o' },
    { n: 'Pauline', i: 'p' }, { n: 'Peter', i: 'p' }, { n: 'Philip', i: 'p' },
    { n: 'Quentin', i: 'q' }, { n: 'Rita', i: 'r' }, { n: 'Roger', i: 'r' },
    { n: 'Raymond', i: 'r' }, { n: 'Susan', i: 's' }, { n: 'Stephen', i: 's' },
    { n: 'Sheila', i: 's' }, { n: 'Trevor', i: 't' }, { n: 'Teresa', i: 't' },
    { n: 'Terence', i: 't' }, { n: 'Ursula', i: 'u' }, { n: 'Victor', i: 'v' },
    { n: 'Vera', i: 'v' }, { n: 'Wendy', i: 'w' }, { n: 'Walter', i: 'w' },
    { n: 'Yvonne', i: 'y' }, { n: 'Zoe', i: 'z' }, { n: 'Zachary', i: 'z' }
  ];

  var COVER_LAST = [
    { n: 'Ashworth', i: 'a' }, { n: 'Atkins', i: 'a' },
    { n: 'Brennan', i: 'b' }, { n: 'Bagshot', i: 'b' },
    { n: 'Craddock', i: 'c' }, { n: 'Chapman', i: 'c' },
    { n: 'Dunlop', i: 'd' }, { n: 'Doyle', i: 'd' },
    { n: 'Everett', i: 'e' }, { n: 'Ellery', i: 'e' },
    { n: 'Fenwick', i: 'f' }, { n: 'Fraser', i: 'f' },
    { n: 'Grimshaw', i: 'g' }, { n: 'Goodwin', i: 'g' },
    { n: 'Hollingsworth', i: 'h' }, { n: 'Hayes', i: 'h' },
    { n: 'Ingram', i: 'i' }, { n: 'Ives', i: 'i' },
    { n: 'Jarvis', i: 'j' }, { n: 'Jeffries', i: 'j' },
    { n: 'Kingsley', i: 'k' }, { n: 'Keaton', i: 'k' },
    { n: 'Langford', i: 'l' }, { n: 'Lomax', i: 'l' },
    { n: 'Marsden', i: 'm' }, { n: 'Mowbray', i: 'm' },
    { n: 'Nash', i: 'n' }, { n: 'Newton', i: 'n' },
    { n: 'Oakley', i: 'o' }, { n: 'Osborne', i: 'o' },
    { n: 'Pemberton', i: 'p' }, { n: 'Price', i: 'p' },
    { n: 'Quill', i: 'q' }, { n: 'Radcliffe', i: 'r' }, { n: 'Rowntree', i: 'r' },
    { n: 'Sandford', i: 's' }, { n: 'Sutcliffe', i: 's' },
    { n: 'Tremayne', i: 't' }, { n: 'Tucker', i: 't' },
    { n: 'Underhill', i: 'u' }, { n: 'Vance', i: 'v' }, { n: 'Vickers', i: 'v' },
    { n: 'Wainwright', i: 'w' }, { n: 'Whitcombe', i: 'w' },
    { n: 'Yardley', i: 'y' }, { n: 'Zeller', i: 'z' }
  ];

  var JOBS = [
    'Commercial flooring contractor. Twenty-two years in the trade. No opinions about it either way.',
    'Regional account manager for a company that supplies industrial hand dryers.',
    'Part-time librarian, three days a week, at a branch that is never busy.',
    'Freelance bookkeeper. Sole trader. Files early. Files accurately.',
    'Drives a delivery van on a fixed route. Has done the route for six years. Could do it blindfolded.',
    'Runs a small stationery shop that turns over just enough to be uninteresting.',
    'Certified to inspect and service lifts. Travels. Nobody asks follow-up questions about lifts.',
    'Teaches evening classes in basic accounting at a further education college.',
    'Insurance assessor for commercial property claims. Writes long reports nobody reads closely.',
    'Sells commercial refrigeration units, mostly to restaurants, mostly over the phone.',
    'Contract gardener for three local councils. Works alone. Weather permitting.',
    'Holds the licence for a small AM radio transmitter that broadcasts a farming report at five in the morning.'
  ];

  var TELLS = [
    'Cannot walk past a reflective surface without checking it. Has been asked about this twice.',
    'Answers the phone with a different greeting depending on who is calling, and has been caught doing it.',
    'Knows the layout of every building they have ever been in, including ones they visited once, and has mentioned this.',
    'Flips a pen between two fingers when thinking. Cannot do it when being watched. Everyone has noticed.',
    'Is fluent in a language the cover job would never require, and occasionally forgets which one they are speaking.',
    'Checks exits on the way in, every time, including at friends’ houses.',
    'Sits with their back to the wall in every restaurant and has a prepared explanation for why.',
    'Owns an unusually good watch for somebody in commercial flooring.',
    'Has never once been photographed with their eyes open, and has a story about it that does not hold up.',
    'Knows the difference between being followed and being coincidentally near somebody, and reacts to the first one visibly.',
    'Uses a different signature on every document and has never been asked why.',
    'Reads the room before reading the menu.'
  ];

  var HIDEOUTS = [
    'A flat above a dry cleaner that has been "available to let" for four years.',
    'The back office of a bowling alley, behind a door marked STAFF ONLY and a filing cabinet.',
    'A static caravan on a site that closes for five months of the year.',
    'A first-floor room above a branch of a hairdresser that closed in 2011 and never reopened.',
    'The upstairs of a pub that is technically still trading and has not served anybody since March.',
    'A lock-up garage rented under the name of a company that was dissolved nine years ago.',
    'A narrowboat moored in one of four places on rotation, never for more than a fortnight.',
    'A converted chapel with a leaking roof, which explains why nobody visits.'
  ];

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  /* Prefers an entry whose initial matches, falling back to the whole pool. This
   * is the entire trick, and it is deliberately a weak one. */
  function matchingInitial(pool, letter) {
    if (!letter) return pick(pool);
    var matches = [];
    pool.forEach(function (entry) {
      if (entry.i === letter) matches.push(entry);
    });
    return matches.length ? pick(matches) : pick(pool);
  }

  function createSecretIdentity(root) {
    if (!root) return null;
    if (!window.ToolStackFun) return null;

    var fun = window.ToolStackFun;
    var $ = function (id) { return root.querySelector('#' + id); };

    var nameEl = $('sidNameInput');
    var coverEl = $('sidCover');
    var jobEl = $('sidJob');
    var tellEl = $('sidTell');
    var hideoutEl = $('sidHideout');
    var metaEl = $('sidMeta');

    if (!coverEl) return null;

    var jobBag = fun.makeBag(function () { return JOBS; }, null);
    var tellBag = fun.makeBag(function () { return TELLS; }, null);
    var hideoutBag = fun.makeBag(function () { return HIDEOUTS; }, null);

    var tool = fun.drawTool(root, {
      data: JOBS,
      drawBtnId: 'sidDrawBtn',
      clearBtnId: 'sidClearBtn',
      copyBtnId: 'sidCopyBtn',
      resultsId: 'sidResults',
      statusId: 'sidStatus',
      render: function (item, info) {
        var typed = fun.inputValue(nameEl, '');
        var letter = typed ? typed.charAt(0).toLowerCase() : '';

        var cover = matchingInitial(COVER_FIRST, letter).n + ' ' +
                    matchingInitial(COVER_LAST, letter).n;

        if (coverEl) coverEl.textContent = cover;
        if (jobEl) jobEl.textContent = item;
        if (tellEl) tellEl.textContent = tellBag.draw() || '';
        if (hideoutEl) hideoutEl.textContent = hideoutBag.draw() || '';
        if (metaEl) {
          metaEl.textContent = typed
            ? 'Cover name matched to the initial of the name you typed (' + letter.toUpperCase() +
              '), which is the oldest trick there is and would not survive a week.'
            : 'No name was typed, so the cover name was drawn freely. Type your own name to have a matching initial chosen.';
        }
      },
      copyText: function (item) {
        return 'Cover name: ' + (coverEl ? coverEl.textContent : '') +
          '\nOccupation: ' + item +
          '\nTell: ' + (tellEl ? tellEl.textContent : '') +
          '\nHideout: ' + (hideoutEl ? hideoutEl.textContent : '');
      },
      onClear: function () {
        jobBag.reset();
        tellBag.reset();
        hideoutBag.reset();
        if (nameEl) nameEl.value = '';
        if (coverEl) coverEl.textContent = '';
        if (jobEl) jobEl.textContent = '';
        if (tellEl) tellEl.textContent = '';
        if (hideoutEl) hideoutEl.textContent = '';
        if (metaEl) metaEl.textContent = '';
      }
    });

    if (!tool) return null;

    tool.status.show('A cover name, a job nobody will ask about, and the habit that would give you away.', 'info');

    return tool;
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createSecretIdentity = createSecretIdentity;
})(window, document);

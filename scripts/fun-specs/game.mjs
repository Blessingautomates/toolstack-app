/**
 * Specs for the Tiny Games pages. Consumed by scripts/gen-fun-tools.mjs.
 *
 * All five set `shared: true`.
 *
 * Two things hold across the category and are worth stating once here.
 *
 * First, none of these games uses a canvas. Every board is a grid of real
 * elements carrying the same Tailwind utilities as the rest of the site, so the
 * light theme's CSS remapping repaints it along with everything else. That is
 * why the boards look right in both themes without a second palette anywhere in
 * the JavaScript.
 *
 * Second, none of them is unbeatable, and that is deliberate rather than a
 * limitation. A perfect tic tac toe opponent is a solved game; a Connect Four
 * solver wins from the first move. Both would be a coin that always lands on its
 * edge. The computer opponents here play a fixed priority list with a random
 * choice inside each tier, which means a player who is paying attention wins.
 *
 * The share strip is included on all five. It is not tied to a result — a game
 * has no output to copy — so it sits outside any results shell and is visible
 * from the start.
 */

const statusBar = (p) => `    <div id="${p}Status" class="hidden mb-4 p-3 rounded-xl text-xs font-medium border"></div>`;

const shareStrip = (slug) => `    <div data-ts-result-actions="${slug}" class="mt-6"></div>`;

const statChip = (label, id, value) => `      <span class="text-xs text-gray-500">${label}
        <strong id="${id}" class="text-gray-100 font-bold">${value}</strong>
      </span>`;

const button = (id, label, primary) =>
  `      <button id="${id}" type="button"
        class="px-5 py-2.5 rounded-xl ${primary
          ? 'bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold'
          : 'bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold'} text-sm transition">
        ${label}
      </button>`;

const select = (id, label, options) => `    <div class="flex items-center gap-2">
      <label for="${id}" class="text-xs text-gray-500 whitespace-nowrap">${label}</label>
      <select id="${id}"
        class="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-brand-500">
${options.map((o) => `        <option value="${o[0]}">${o[1]}</option>`).join('\n')}
      </select>
    </div>`;

const recordPanel = (p) => `    <div class="grid grid-cols-3 gap-3 mt-5 text-center">
      <div class="bg-gray-950 border border-gray-800 rounded-xl py-3">
        <p class="text-lg font-black text-emerald-400" id="${p}Wins">0</p>
        <p class="text-[10px] uppercase tracking-wide text-gray-500 font-bold mt-0.5">Won</p>
      </div>
      <div class="bg-gray-950 border border-gray-800 rounded-xl py-3">
        <p class="text-lg font-black text-rose-400" id="${p}Losses">0</p>
        <p class="text-[10px] uppercase tracking-wide text-gray-500 font-bold mt-0.5">Lost</p>
      </div>
      <div class="bg-gray-950 border border-gray-800 rounded-xl py-3">
        <p class="text-lg font-black text-gray-300" id="${p}Draws">0</p>
        <p class="text-[10px] uppercase tracking-wide text-gray-500 font-bold mt-0.5">Drawn</p>
      </div>
    </div>

    <p class="text-[10px] text-gray-500 mt-3 leading-relaxed">
      The record is kept against the computer only, and it is stored in this browser. It is not
      sent anywhere, and two-player games do not change it.
    </p>`;

const STATS = (rows) => `    <div class="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4">
${rows.join('\n')}
    </div>`;

export default [
  {
    slug: 'game-snake',
    name: 'Snake Game',
    create: 'createSnakeGame',
    shared: true,
    appCategory: 'GameApplication',
    title: 'Snake Game — Play Free in Your Browser | ToolStack AI',
    desc: 'The classic snake game, playable in the browser with arrow keys, WASD or on-screen buttons. No download, no signup, best score kept on your device.',
    tagline:
      'The ordinary rules: eat, grow, do not hit the wall and do not hit yourself. It speeds up as you go, and the best score is kept on your device.',
    widget: `${statusBar('snake')}

${STATS([
      statChip('Score', 'snakeScore', '0'),
      statChip('Best', 'snakeBest', '0'),
      statChip('Tick', 'snakeSpeed', '—')
    ])}

    <div id="snakeBoard" class="mx-auto w-full max-w-sm"></div>

    <div class="grid grid-cols-3 gap-2 w-44 mx-auto mt-5">
      <span></span>
      <button id="snakeUp" type="button" aria-label="Up"
        class="py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-lg leading-none transition">&#9650;</button>
      <span></span>
      <button id="snakeLeft" type="button" aria-label="Left"
        class="py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-lg leading-none transition">&#9664;</button>
      <span></span>
      <button id="snakeRight" type="button" aria-label="Right"
        class="py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-lg leading-none transition">&#9654;</button>
      <span></span>
      <button id="snakeDown" type="button" aria-label="Down"
        class="py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-lg leading-none transition">&#9660;</button>
      <span></span>
    </div>

    <div class="flex flex-wrap items-center gap-2 mt-5 justify-center">
${button('snakeStartBtn', 'Start', true)}
${button('snakePauseBtn', 'Pause', false)}
${button('snakeResetBtn', 'Reset', false)}
    </div>

${shareStrip('game-snake')}`,
    what: [
      'The classic game, at sixteen squares by sixteen. Eat the food, the snake gets longer, and the tick gets slightly faster with every item until it reaches a floor at about half the starting speed. Walls kill. So does running into your own body — with one exception, which is that following your own tail is legal, because the tail cell is moving out of the way in the same tick. That rule is the difference between a game that feels fair and one that kills you for something that looked safe.',
      'You can steer with the **arrow keys**, with **WASD**, or with the on-screen buttons, which exist because a phone has no arrow keys. Keys are only intercepted while a game is actually running, so the page still scrolls normally the rest of the time. The best score is kept in your browser and survives a reload; the read is wrapped so that private browsing, which throws on storage access rather than returning nothing, does not break the game.'
    ],
    how: [
      'Press **Start** to begin, or press any of the direction buttons, which starts the game and turns in one action.',
      'Steer with the arrow keys or WASD on a keyboard, or the buttons underneath the board on a touchscreen.',
      'Press **Pause** to stop the clock; the button becomes **Resume**. Press **Reset** for a fresh board at any time.',
      'Eat to score. The tick shortens with each item, and the board fills up if you get long enough — filling it completely ends the game as a win.'
    ],
    cases: [
      { t: 'A two-minute break', d: 'A run takes under a minute, and the speed ramp means most runs end quickly, so it is easy to stop at one.' },
      { t: 'On a phone', d: 'The direction buttons make it playable without a keyboard, and the board is sized to fit a narrow screen.' },
      { t: 'Beating your own score', d: 'The best score persists between visits, which turns it into something you can come back to.' },
      { t: 'Testing your reflexes', d: 'The tick floor at half the starting speed is the real difficulty. Most runs end in the last twenty seconds.' }
    ],
    faqs: [
      { q: 'How do I control it on a phone?', a: 'Use the four direction buttons under the board. The arrow keys and WASD work on a keyboard, but a phone has neither, which is the only reason the buttons exist.' },
      { q: 'Why did I die when I went into my own tail?', a: 'You should not have — following your own tail is legal, because the tail cell moves out of the way in the same tick. If the snake is long and you turn tightly, what you hit is usually the second or third segment rather than the tail itself.' },
      { q: 'Does it get faster?', a: 'Yes. Every item eaten shortens the tick by a few milliseconds, down to a floor of about half the starting speed. It stops getting faster after that, so a long game stays playable rather than becoming impossible.' },
      { q: 'Is the best score saved?', a: 'It is kept in your browser and survives a reload. Nothing is uploaded — it never leaves your device, and it is gone if you clear your browsing data.' }
    ]
  },

  {
    slug: 'game-tictactoe',
    name: 'Tic Tac Toe',
    create: 'createTicTacToe',
    shared: true,
    appCategory: 'GameApplication',
    title: 'Tic Tac Toe — Play vs Computer or a Friend | ToolStack AI',
    desc: 'Play tic tac toe against the computer or a friend on the same device. Free, no signup, no download, and a running record kept on your device.',
    tagline:
      'Against the computer or a friend on the same device. The computer is beatable, on purpose — an unbeatable opponent is a solved game, and a solved game is not a game.',
    widget: `${statusBar('ttt')}

    <div class="flex flex-wrap items-center gap-x-5 gap-y-3 mb-4">
${select('tttMode', 'Opponent', [
      ['computer', 'Computer'],
      ['two', 'Two players']
    ])}
${statChip('Turn:', 'tttTurn', 'X to play')}
    </div>

    <div id="tttBoard" class="mx-auto w-full max-w-xs"></div>

    <p id="tttResult" class="text-sm font-bold text-gray-100 text-center mt-4"></p>

${recordPanel('ttt')}

    <div class="flex flex-wrap items-center gap-2 mt-5">
${button('tttResetBtn', 'New game', true)}
${button('tttClearRecordBtn', 'Clear record', false)}
    </div>

${shareStrip('game-tictactoe')}`,
    what: [
      'Two modes: one player against the computer, or two players passing one device. In the computer mode you are X and you move first. The record underneath the board tracks wins, losses and draws **against the computer only** — a two-player game never touches it, because a tally of games where you played both sides would not mean anything.',
      'The computer is deliberately beatable. It plays a fixed priority list — win if it can, block you if it must, then take the centre, then a corner, then a side — with a random choice inside each tier. A perfect opponent would be trivial to write and useless to play: anybody who has played tic tac toe knows the correct reply to every opening, so an unbeatable version would be a coin that always lands on its edge. This one will lose to a player who is paying attention, which is the point. Switching mode starts a new game, and the record stays where it is.'
    ],
    how: [
      'Choose **Computer** or **Two players** from the opponent selector. Switching starts a fresh board and leaves the record alone.',
      'Click any empty square. In computer mode you are X and you always move first; in two-player mode X and O alternate on the same device.',
      'The line above the board tells you whose turn it is, and the line under it names the result once the game ends.',
      'Press **New game** to clear the board. Press **Clear record** to reset the running tally — the two are separate, so starting again never wipes your record by accident.'
    ],
    cases: [
      { t: 'A quick game against the computer', d: 'Games last under a minute, and the computer will lose if you take a corner and then the opposite corner.' },
      { t: 'Two people, one phone', d: 'Two-player mode needs no setup and no second device. The board tells you whose turn it is.' },
      { t: 'Teaching the game to a child', d: 'Two-player mode on one screen is the easiest way to show somebody why the centre square matters.' },
      { t: 'Keeping score over time', d: 'The record against the computer persists in your browser, so a session can turn into a long-running tally.' }
    ],
    faqs: [
      { q: 'Can the computer be beaten?', a: 'Yes, and it is meant to be. It only looks one move ahead, so it will not see a trap that needs two moves to spring — take a corner, then take the opposite corner, and it has no answer. A perfect player would be easy to write but would make every game a draw, which is not worth playing.' },
      { q: 'Does the record count two-player games?', a: 'No. The record is specifically your results against the computer. In two-player mode you are playing both sides, so a win or a loss there would not mean anything, and the tally is left untouched.' },
      { q: 'Is the record shared between devices?', a: 'No. It is stored in this browser only, and it is not sent anywhere. Clearing your browsing data will clear it, and the **Clear record** button does the same thing deliberately.' },
      { q: 'Why does the computer sometimes take a side square?', a: 'It works down a priority list — win, block, centre, corner, side — and picks at random inside whichever tier it reaches. If the centre and all four corners are taken, a side is the only thing left.' }
    ]
  },

  {
    slug: 'game-connect-four',
    name: 'Connect Four',
    create: 'createConnectFour',
    shared: true,
    appCategory: 'GameApplication',
    title: 'Connect Four — Play vs Computer or a Friend | ToolStack AI',
    desc: 'Play Connect Four against the computer or a friend on one device. Click a column to drop. Free, no signup, record kept on your device.',
    tagline:
      'Seven columns, six rows, four in a row. Click a column to drop a disc. The computer looks one move ahead and no further, so it can be trapped.',
    widget: `${statusBar('c4')}

    <div class="flex flex-wrap items-center gap-x-5 gap-y-3 mb-4">
${select('c4Mode', 'Opponent', [
      ['computer', 'Computer'],
      ['two', 'Two players']
    ])}
${statChip('Turn:', 'c4Turn', 'Red to play')}
    </div>

    <div class="overflow-x-auto pb-1">
      <div id="c4Board" class="mx-auto max-w-md"></div>
    </div>

    <p class="text-[11px] text-gray-500 mt-3 text-center leading-relaxed">
      Click anywhere in a column to drop into it. The lowest empty slot takes the disc.
    </p>

    <p id="c4Result" class="text-sm font-bold text-gray-100 text-center mt-4"></p>

${recordPanel('c4')}

    <div class="flex flex-wrap items-center gap-2 mt-5">
${button('c4ResetBtn', 'New game', true)}
${button('c4ClearRecordBtn', 'Clear record', false)}
    </div>

${shareStrip('game-connect-four')}`,
    what: [
      'The ordinary game: seven columns, six rows, and the first player to line up four discs horizontally, vertically or diagonally wins. Clicking anywhere in a column drops a disc into the lowest empty slot, which is how the physical game works — so the whole column is the target rather than a small arrow above it, and the board works on a touchscreen without any precision. If a column is full, clicking it tells you so rather than doing nothing.',
      'The computer searches for its own win first, then for yours, and otherwise plays a **weighted preference for the middle columns** with a random tiebreak. It does not look two moves ahead, which means it will happily build a position that lets you create two threats at once and then lose to one of them. That is a deliberate ceiling: a real solver plays Connect Four perfectly from the first move, and a game you cannot win is not a game. In computer mode you are red and you drop first.'
    ],
    how: [
      'Choose **Computer** or **Two players**. Switching starts a fresh board and leaves the record alone.',
      'Click anywhere in a column to drop a disc. It falls to the lowest empty slot in that column.',
      'In computer mode you are red and move first. In two-player mode red and yellow alternate on the same device.',
      'Press **New game** to clear the board, or **Clear record** to reset the win/loss/draw tally against the computer.'
    ],
    cases: [
      { t: 'A game that takes longer than tic tac toe', d: 'A full game runs a few minutes, which makes it a better fit for a real break than a game that ends in three moves.' },
      { t: 'Two people on one device', d: 'Two-player mode needs no setup, and the turn indicator under the board keeps it clear whose go it is.' },
      { t: 'Playing on a phone', d: 'The whole column is the hit area, so there is nothing small to aim at, and the board scrolls sideways only if it has to.' },
      { t: 'Trying to beat the computer', d: 'The way to win is to build two threats at once. The computer blocks one of them and cannot see the other.' }
    ],
    faqs: [
      { q: 'How do I beat the computer?', a: 'Set up two ways to win at the same time. The computer checks for its own win, then blocks yours, but it only looks one move ahead — so if you can create two separate threats in a single move, it can only stop one of them.' },
      { q: 'Why does the computer like the middle columns?', a: 'Because the middle columns are genuinely stronger in Connect Four — a disc in the centre is part of more possible lines than one at the edge. Its preference is a set of weights rather than a rule, so it still plays elsewhere when there is a reason to.' },
      { q: 'Does the record include two-player games?', a: 'No. The tally is your record against the computer only. In two-player mode you are playing both sides, so those results would not mean anything and they are not counted.' },
      { q: 'What happens if the board fills up?', a: 'It is a draw, and it is counted as one in the record. On a seven-by-six board that takes forty-two moves and is rare, but it is possible.' }
    ]
  },

  {
    slug: 'game-memory-cards',
    name: 'Memory Cards',
    create: 'createMemoryCards',
    shared: true,
    appCategory: 'GameApplication',
    title: 'Memory Cards — Free Matching Pairs Game | ToolStack AI',
    desc: 'Flip cards and match the pairs. Three board sizes, a move counter and a clock that starts on your first flip. Free, no signup, best score saved.',
    tagline:
      'Flip two cards and keep them if they match. Three board sizes, a move counter, and a clock that starts on your first flip rather than on load.',
    widget: `${statusBar('mem')}

    <div class="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 mb-4">
${select('memSize', 'Pairs', [
      ['6', '6 pairs'],
      ['8', '8 pairs'],
      ['12', '12 pairs']
    ])}
      <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
${statChip('Moves', 'memMoves', '0')}
${statChip('Pairs', 'memPairs', '0')}
${statChip('Time', 'memTime', '0:00')}
${statChip('Best', 'memBest', '—')}
      </div>
    </div>

    <div id="memBoard" class="mx-auto w-full max-w-md"></div>

    <div class="flex flex-wrap items-center gap-2 mt-5">
${button('memResetBtn', 'New game', true)}
    </div>

    <p class="text-[10px] text-gray-500 mt-3 leading-relaxed">
      The clock starts on your first flip, not when the page loads, so a board you leave open
      while you make a cup of tea does not count against you.
    </p>

${shareStrip('game-memory-cards')}`,
    what: [
      'The matching pairs game, on a board of six, eight or twelve pairs. Every card is face down; turn two over and if they match they stay up. The move counter and the clock both start on your **first flip** rather than on page load, which matters more than it sounds — a clock that runs from load punishes you for leaving the tab open, and the number it produces then says nothing about how you played.',
      'A pair that does not match stays face up for about three quarters of a second before turning back, and clicks are ignored while it does. Without that lock, a fast double-click flips a third card into the comparison and the board gets into a state that was never a legal move. The best score is kept **per board size**, because six pairs and twelve pairs are different games and a single record across both would be meaningless. The symbols are geometric and typographic rather than emoji: emoji render at wildly different sizes and colours across platforms, and many of them come back as full-colour glyphs that ignore the text colour, which would make a matched pair look like an unmatched one.'
    ],
    how: [
      'Pick a board size: **6, 8 or 12 pairs**. Changing size starts a new board and switches the best score to that size.',
      'Click or tap a card to turn it over. The clock starts on the first one.',
      'Turn a second card. A match stays face up; a miss turns back after a moment, and clicks are ignored while it does.',
      'Finish the board to see your moves and time. Press **New game** for a fresh shuffle at any time.'
    ],
    cases: [
      { t: 'A short break', d: 'Six pairs takes under a minute and twelve pairs takes a few, so the size selector doubles as a difficulty setting.' },
      { t: 'Playing with a child', d: 'Six pairs on a four-column board is small enough for young children to hold the whole layout in their head.' },
      { t: 'Testing your memory properly', d: 'Moves and time together are the honest measure. Few moves means good memory; a low time with many moves means guessing.' },
      { t: 'Coming back to beat a score', d: 'The best score per size persists in your browser, so there is something to return to.' }
    ],
    faqs: [
      { q: 'When does the clock start?', a: 'On your first flip, not when the page loads. A clock that ran from load would count the time you spent reading the page or making a cup of tea, and the number it produced would not be about your memory at all.' },
      { q: 'Why did a card not flip when I clicked it?', a: 'You clicked while a mismatched pair was still showing. Input is locked for about three quarters of a second after a miss, because otherwise a fast double-click can flip a third card and put the board into a state that was never a legal move.' },
      { q: 'Is the best score per board size?', a: 'Yes. Six, eight and twelve pairs are three different games, so each keeps its own record. The best shown switches when you change the size selector.' },
      { q: 'Why are the symbols shapes rather than emoji?', a: 'Emoji render at different sizes and colours on different platforms, and many of them come back as full-colour images that ignore the text colour entirely. That would make a matched pair and an unmatched one look identical in the light theme. These symbols all take the colour they are given.' }
    ]
  },

  {
    slug: 'game-minesweeper',
    name: 'Minesweeper',
    create: 'createMinesweeper',
    shared: true,
    appCategory: 'GameApplication',
    title: 'Minesweeper — Free Online with Flag Mode | ToolStack AI',
    desc: 'Play Minesweeper in the browser at three difficulty levels, with a safe first click and a flag mode for touchscreens. Free, no signup, no download.',
    tagline:
      'Three difficulty levels, a first click that is always safe, and a flag mode, because a right-click is not available on a touchscreen.',
    widget: `${statusBar('mine')}

    <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 mb-4">
${select('mineDifficulty', 'Level', [
      ['easy', 'Easy — 9×9, 10 mines'],
      ['medium', 'Medium — 12×12, 22 mines'],
      ['hard', 'Hard — 16×16, 40 mines']
    ])}
      <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
${statChip('Mines', 'mineCount', '0')}
${statChip('Time', 'mineTime', '0:00')}
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2 mb-4">
      <button id="mineFaceBtn" type="button"
        class="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm transition">
        New game
      </button>
      <button id="mineFlagMode" type="button"
        class="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm transition">
        Flag mode: off
      </button>
      <span class="text-[11px] text-gray-500">Right-click also flags, if you have a mouse.</span>
    </div>

    <div class="overflow-x-auto pb-1">
      <div id="mineBoard" class="mx-auto"></div>
    </div>

    <p id="mineResult" class="text-sm font-bold text-gray-100 text-center mt-4"></p>

    <p class="text-[10px] text-gray-500 mt-3 leading-relaxed">
      Your first click is always safe: the mines are placed after it, and the square you clicked and
      its eight neighbours are excluded. A first click that ends the game is not difficulty, it is
      a coin toss.
    </p>

${shareStrip('game-minesweeper')}`,
    what: [
      'Minesweeper with the ordinary rules and two concessions to being a web page. The first is that **your first click is always safe** — the mines are placed after you click, and the square you clicked plus its eight neighbours are excluded from the placement. A first click that ends the game is not difficulty, it is a coin toss, and every version of this game that has ever been frustrating has been frustrating for that reason. The numbers are the usual ones: a square tells you how many mines touch it, and clearing every non-mine square wins.',
      'The second is a **flag mode toggle**, because a right-click does not exist on a touchscreen and a long-press is claimed by the browser’s own context menu on most of them. Turn flag mode on and a tap places a flag instead of opening a square; turn it off to clear again. Right-click still works with a mouse, in either mode. Three levels, a mine counter that counts down as you flag, and a clock that starts on your first click. The game over screen keeps your correct flags standing and marks the ones that were wrong, because a flag that was right is information even when the game is lost.'
    ],
    how: [
      'Pick a level: **Easy** is nine by nine with ten mines, **Medium** is twelve by twelve with twenty-two, and **Hard** is sixteen by sixteen with forty.',
      'Click any square to start. That first click is always safe, and the clock starts with it.',
      'Read the numbers — each one is the count of mines touching that square — and work out where the mines must be. Opening an empty square clears its neighbours automatically.',
      'Flag the squares you are sure about, using right-click or **Flag mode**. Clear every square that is not a mine to win.'
    ],
    cases: [
      { t: 'A long break', d: 'Hard is a genuine few minutes of thinking rather than reflex, which is what separates this from the other games in this category.' },
      { t: 'On a phone', d: 'Flag mode exists precisely for this. Without it there is no way to flag on a touchscreen at all.' },
      { t: 'Learning the game', d: 'Easy is small enough that an early mistake is survivable, and the safe first click means the opening is never a lottery.' },
      { t: 'Testing your patience', d: 'Medium is where most people settle. Hard punishes guessing more than it punishes slowness.' }
    ],
    faqs: [
      { q: 'Is the first click really always safe?', a: 'Yes. The mines are not placed until after your first click, and the square you clicked and its eight neighbours are excluded when they are. That means your first click also opens a decent area rather than a single square.' },
      { q: 'How do I flag on a phone?', a: 'Turn on **Flag mode**. A tap then places or removes a flag instead of opening a square. Right-click still works if you have a mouse, in either mode.' },
      { q: 'What happens if I flag the wrong square?', a: 'Nothing until you lose. A wrong flag is only revealed at the end, along with the mines — and if you flag a square that turns out to be a mine, that flag is left standing in the final board, because a flag that was right is worth seeing.' },
      { q: 'Do I have to guess?', a: 'Not on easy, usually. On the larger boards there are positions where the information genuinely runs out and a guess is required — that is a property of the game rather than of this version, and the safe first click removes the one guess that was never fair.' }
    ]
  }
];

// Create an empty map (10x10 grid filled with 'water')
function createEmptyMap() {   // 1. Arrays (source of truth)
    const map = [];
    for (let row = 0; row < 10; row++) {
        map.push(new Array(10).fill('water'));
    }
    return map;
}

const myMap = createEmptyMap();
const enemyMap = createEmptyMap();

// Convert letter to index (A=0, B=1, ..., J=9)
function letterToIndex(letter) {
    return letter.toUpperCase().charCodeAt(0) - 65;
}

// Create the board with labels and cells
function createBoard(boardElement) {
    for (let row = 0; row <= 10; row++) {
        for (let col = 0; col <= 10; col++) {
            const cell = document.createElement('div');

            if (row === 0 && col === 0) {
                cell.classList.add('corner');
            } else if (row === 0) {
                cell.classList.add('label');
                cell.textContent = col;
            } else if (col === 0) {
                cell.classList.add('label');
                cell.textContent = String.fromCharCode(65 + row - 1);
            } else {
                cell.classList.add('cell');
                cell.dataset.row = String.fromCharCode(65 + row - 1);
                cell.dataset.col = col;
            }

            boardElement.appendChild(cell);
        }
    }
}

const myBoardElement = document.getElementById('myBoard');
const enemyBoardElement = document.getElementById('enemyBoard');
const myBoardTitle = document.getElementById('myBoardTitle');
const enemyBoardTitle = document.getElementById('enemyBoardTitle');
const status = document.getElementById('status');

createBoard(myBoardElement);
createBoard(enemyBoardElement);

// Create ships with their names, lengths, and positions
function createShips() {
    return [
        { name: 'Submarine', length: 1, positions: [] },
        { name: 'Destroyer', length: 2, positions: [] },
        { name: 'Cruiser', length: 3, positions: [] },
        { name: 'Battleship', length: 4, positions: [] }
    ];
}

const myShips = createShips();
const enemyShips = createShips();

// function to check if a ship can be placed at the given position without going out of bounds
function isValidPosition(row, col, length, orientation) {
    if (orientation === 'horizontal') {
        const endCol = col + length - 1;
        return endCol <= 9;
    } else {
        const endRow = row + length - 1;
        return endRow <= 9;
    }
}

// function to get the cells occupied by a ship based on its starting position, length, and orientation
function getShipCells(row, col, length, orientation) {
    const cells = [];
    for (let i = 0; i < length; i++) {
        if (orientation === 'horizontal') {
            cells.push({ row: row, col: col + i });
        } else {
            cells.push({ row: row + i, col: col });
        }
    }
    return cells;
}

// function to check if there are no adjacent ships around the proposed ship placement
function hasNoAdjacentShip(map, row, col, length, orientation) {
    const shipCells = getShipCells(row, col, length, orientation);

    for (let i = 0; i < shipCells.length; i++) {
        const cell = shipCells[i];

        for (let dRow = -1; dRow <= 1; dRow++) {
            for (let dCol = -1; dCol <= 1; dCol++) {
                const checkRow = cell.row + dRow;
                const checkCol = cell.col + dCol;

                if (checkRow < 0 || checkRow > 9 || checkCol < 0 || checkCol > 9) {
                    continue;
                }

                if (map[checkRow][checkCol] === 'ship') {
                    return false;
                }
            }
        }
    }

    return true;
}

// function to mark the cells around a placed ship as 'close', without overwriting the ship itself
function markCloseCells(map, row, col, length, orientation) {
    const shipCells = getShipCells(row, col, length, orientation);

    for (let i = 0; i < shipCells.length; i++) {
        const cell = shipCells[i];

        for (let dRow = -1; dRow <= 1; dRow++) {
            for (let dCol = -1; dCol <= 1; dCol++) {
                const checkRow = cell.row + dRow;
                const checkCol = cell.col + dCol;

                if (checkRow < 0 || checkRow > 9 || checkCol < 0 || checkCol > 9) {
                    continue;
                }

                if (map[checkRow][checkCol] === 'water') {
                    map[checkRow][checkCol] = 'close';
                }
            }
        }
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// function to place all ships randomly on the map, largest first
function placeShipsRandomly(map, ships) {
    const sortedShips = ships.slice().sort(function(a, b) {
        return b.length - a.length;
    });

    for (let i = 0; i < sortedShips.length; i++) {
        const ship = sortedShips[i];
        let placed = false;

        while (!placed) {
            const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
            const row = getRandomInt(10);
            const col = getRandomInt(10);

            if (isValidPosition(row, col, ship.length, orientation) &&
                hasNoAdjacentShip(map, row, col, ship.length, orientation)) {

                const cells = getShipCells(row, col, ship.length, orientation);

                for (let j = 0; j < cells.length; j++) {
                    map[cells[j].row][cells[j].col] = 'ship';
                }

                ship.positions = cells;
                markCloseCells(map, row, col, ship.length, orientation);
                placed = true;
            }
        }
    }
}

// function to draw the current state of a map onto its board element
// hideShips = true hides 'ship' and 'close' cells (shows them as 'water' instead)
function renderBoard(map, boardElement, hideShips) {
    const cells = boardElement.querySelectorAll('.cell');
    cells.forEach(function(cell) {
        const row = letterToIndex(cell.dataset.row);
        const col = Number(cell.dataset.col) - 1;
        let state = map[row][col];

        if (hideShips && (state === 'ship' || state === 'close')) {
            state = 'water';
        }

        cell.classList.remove('water', 'ship', 'close', 'hit', 'missed', 'sunken');
        cell.classList.add(state);
    });
}

// Function to process a shot on the map, updating the state and returning the result
function processShot(map, row, col) {
    const cellState = map[row][col];

    if (cellState === 'hit' || cellState === 'missed' || cellState === 'sunken') {
        return null;
    }

    if (cellState === 'ship') {
        map[row][col] = 'hit';
        return 'hit';
    } else {
        map[row][col] = 'missed';
        return 'missed';
    }
}

function isShipSunk(ship, map) {
    for (let i = 0; i < ship.positions.length; i++) {
        const pos = ship.positions[i];
        const state = map[pos.row][pos.col];
        if (state !== "hit" && state !== "sunken") {
            return false;
        }
    }
    return true;
}

function findShipAt(row, col, ships) {
    for (let i = 0; i < ships.length; i++) {
        const ship = ships[i];
        for (let j = 0; j < ship.positions.length; j++) {
            const pos = ship.positions[j];
            if (pos.row === row && pos.col === col) {
                return ship;
            }
        }
    }
    return null;
}

function allShipsSunk(ships, map) {
    for (let i = 0; i < ships.length; i++) {
        if (!isShipSunk(ships[i], map)) {
            return false;
        }
    }
    return true;
}

// --- Pass-screen mechanism (used between PvP turns) ---

const passScreen = document.getElementById('passScreen');
const passMessage = document.getElementById('passMessage');
const continueBtn = document.getElementById('continueBtn');

function showPassScreen(message, onContinue) {
    passMessage.textContent = message;
    passScreen.classList.remove('hidden');

    continueBtn.onclick = function() {
        passScreen.classList.add('hidden');
        onContinue();
    };
}

// --- Game mode selection ---

let gameMode = null;       // 'pvp', 'easy', or 'hard'
let gamePhase = 'setup';   // 'setup', 'placement1', 'placement2', 'playing', 'gameover'
let currentTurn = 'player1';
let currentOrientation = 'horizontal';
let awaitingTurnSwitch = false; // true during the short delay after a shot, before the pass screen appears

const modeButtons = document.querySelectorAll('[data-mode]');

modeButtons.forEach(function(button) {
    button.addEventListener('click', function() {
        gameMode = button.dataset.mode;

        modeButtons.forEach(function(btn) {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        startNewGame();
    });
});

document.getElementById('rotateBtn').addEventListener('click', function() {
    currentOrientation = currentOrientation === 'horizontal' ? 'vertical' : 'horizontal';
    status.textContent = 'Orientare: ' + currentOrientation;
});

// --- Generic manual ship placement (works for either player/board) ---

function createPlacementState(ships) {
    return {
        order: ships.slice().sort(function(a, b) {
            return b.length - a.length;
        }),
        index: 0
    };
}

let placement1 = createPlacementState(myShips);
let placement2 = createPlacementState(enemyShips);

function placeShipAt(map, boardElement, placementState, row, col, onAllPlaced) {
    if (placementState.index >= placementState.order.length) {
        return;
    }

    const ship = placementState.order[placementState.index];

    if (!isValidPosition(row, col, ship.length, currentOrientation) ||
        !hasNoAdjacentShip(map, row, col, ship.length, currentOrientation)) {
        status.textContent = 'Poziție invalidă, încearcă altă căsuță.';
        return;
    }

    const cells = getShipCells(row, col, ship.length, currentOrientation);
    for (let i = 0; i < cells.length; i++) {
        map[cells[i].row][cells[i].col] = 'ship';
    }
    ship.positions = cells;
    markCloseCells(map, row, col, ship.length, currentOrientation);

    renderBoard(map, boardElement);
    placementState.index++;

    if (placementState.index >= placementState.order.length) {
        onAllPlaced();
    } else {
        status.textContent = 'Plasează nava: ' + placementState.order[placementState.index].name;
    }
}

// --- Shooting logic (shared by PvP and vs-computer) ---

function handleShot(targetMap, targetBoardElement, targetShips, row, col, winnerLabel) {
    const result = processShot(targetMap, row, col);

    if (result === null) {
        return;
    }

    let justWon = false;

    if (result === 'hit') {
        const ship = findShipAt(row, col, targetShips);

        if (ship && isShipSunk(ship, targetMap)) {
            for (let i = 0; i < ship.positions.length; i++) {
                const pos = ship.positions[i];
                targetMap[pos.row][pos.col] = 'sunken';
            }

            if (allShipsSunk(targetShips, targetMap)) {
                justWon = true;
            } else {
                status.textContent = 'Felicitări, ai scufundat nava ' + ship.name + '!';
            }
        } else {
            status.textContent = 'Felicitări, ai nimerit o navă!';
        }
    } else {
        status.textContent = 'Din păcate, ai nimerit pe lângă.';
    }

    // targetMap is always the opponent's board from the shooter's perspective,
    // regardless of which physical board element it is - undiscovered ships stay hidden
    renderBoard(targetMap, targetBoardElement, true);

    if (justWon) {
        gamePhase = 'gameover';
        status.textContent = winnerLabel + ' a câștigat! Toate navele au fost distruse!';
        return;
    }

    if (gameMode === 'pvp') {
        awaitingTurnSwitch = true;

        setTimeout(function() {
            currentTurn = (currentTurn === 'player1') ? 'player2' : 'player1';
            const nextName = (currentTurn === 'player1') ? 'Player 1' : 'Player 2';

            showPassScreen('Pasează lui ' + nextName, function() {
                awaitingTurnSwitch = false;
                renderBoard(myMap, myBoardElement, currentTurn === 'player2');
                renderBoard(enemyMap, enemyBoardElement, currentTurn === 'player1');
                myBoardTitle.textContent = (currentTurn === 'player1') ? 'Harta ta (Player 1)' : 'Harta adversarului';
                enemyBoardTitle.textContent = (currentTurn === 'player2') ? 'Harta ta (Player 2)' : 'Harta adversarului';
                status.textContent = nextName + ': trage!';
            });
        }, 1500);
    }
    // vs-computer turn switching (computer's automatic shot) is Task 5.2 - next step
}

// --- Click handlers ---

myBoardElement.querySelectorAll('.cell').forEach(function(cell) {
    cell.addEventListener('click', function() {
        const row = letterToIndex(cell.dataset.row);
        const col = Number(cell.dataset.col) - 1;

        if (gamePhase === 'placement1') {
            placeShipAt(myMap, myBoardElement, placement1, row, col, function() {
                if (gameMode === 'pvp') {
                    showPassScreen('Pasează lui Player 2', function() {
                        gamePhase = 'placement2';
                        renderBoard(myMap, myBoardElement, true);
                        renderBoard(enemyMap, enemyBoardElement);
                        myBoardTitle.textContent = 'Harta lui Player 1 (ascunsă)';
                        status.textContent = 'Player 2: Plasează nava: ' + placement2.order[placement2.index].name;
                    });
                } else {
                    placeShipsRandomly(enemyMap, enemyShips);
                    gamePhase = 'playing';
                    currentTurn = 'player1';
                    renderBoard(enemyMap, enemyBoardElement, true);
                    status.textContent = 'Trage în harta calculatorului!';
                }
            });
        } else if (gamePhase === 'playing' && gameMode === 'pvp' && currentTurn === 'player2' && !awaitingTurnSwitch) {
            handleShot(myMap, myBoardElement, myShips, row, col, 'Player 2');
        }
    });
});

enemyBoardElement.querySelectorAll('.cell').forEach(function(cell) {
    cell.addEventListener('click', function() {
        const row = letterToIndex(cell.dataset.row);
        const col = Number(cell.dataset.col) - 1;

        if (gamePhase === 'placement2') {
            placeShipAt(enemyMap, enemyBoardElement, placement2, row, col, function() {
                showPassScreen('Pasează lui Player 1 - începe jocul!', function() {
                    gamePhase = 'playing';
                    currentTurn = 'player1';
                    renderBoard(myMap, myBoardElement, false);
                    renderBoard(enemyMap, enemyBoardElement, true);
                    myBoardTitle.textContent = 'Harta ta (Player 1)';
                    enemyBoardTitle.textContent = 'Harta adversarului';
                    status.textContent = 'Player 1: trage!';
                });
            });
        } else if (gamePhase === 'playing' && gameMode === 'pvp' && currentTurn === 'player1' && !awaitingTurnSwitch) {
            handleShot(enemyMap, enemyBoardElement, enemyShips, row, col, 'Player 1');
        } else if (gamePhase === 'playing' && (gameMode === 'easy' || gameMode === 'hard')) {
            handleShot(enemyMap, enemyBoardElement, enemyShips, row, col, 'Tu');
        }
    });
});

// --- Start / restart ---

function startNewGame() {
    // reset maps
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            myMap[row][col] = 'water';
            enemyMap[row][col] = 'water';
        }
    }

    myShips.forEach(function(ship) { ship.positions = []; });
    enemyShips.forEach(function(ship) { ship.positions = []; });

    placement1 = createPlacementState(myShips);
    placement2 = createPlacementState(enemyShips);

    currentOrientation = 'horizontal';
    currentTurn = 'player1';
    gamePhase = 'placement1';

    myBoardTitle.textContent = 'Harta ta';
    enemyBoardTitle.textContent = gameMode === 'pvp' ? 'Harta lui Player 2 (ascunsă)' : 'Harta adversarului';

    renderBoard(myMap, myBoardElement);
    renderBoard(enemyMap, enemyBoardElement, true);

    status.textContent = 'Player 1: Plasează nava: ' + placement1.order[placement1.index].name;
}

document.getElementById('restart').addEventListener('click', function() {
    if (gameMode) {
        startNewGame();
    }
});
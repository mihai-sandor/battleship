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
function letterToIndex(letter) {   // 2. Letter -> index conversion function
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
const status = document.getElementById('status');

createBoard(myBoardElement);
createBoard(enemyBoardElement);

// Console log just to count the numbers of elements created on each board
console.log(document.querySelectorAll('#myBoard .cell').length);
console.log(document.querySelectorAll('#enemyBoard .cell').length);

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
                    continue; // outside the map, nothing to check
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
function renderBoard(map, boardElement) {
    const cells = boardElement.querySelectorAll('.cell');
    cells.forEach(function(cell) {
        const row = letterToIndex(cell.dataset.row);
        const col = Number(cell.dataset.col) - 1;
        const state = map[row][col];

        cell.classList.remove('water', 'ship', 'close', 'hit', 'missed', 'sunken');
        cell.classList.add(state);
    });
}
// Function to process a shot on the map, updating the state and returning the result
function processShot(map, row, col) {
    const cellState = map[row][col];

    if(cellState ==='hit' || cellState ==='missed' || cellState ==='sunken') {
        return null; // Already shot here, do nothing
    }

    if (cellState === 'ship') {
        map[row][col] = 'hit';
        return 'hit';
    } else {
        map[row][col] = 'missed';
        return 'missed';
    }
}

enemyBoardElement.querySelectorAll('.cell').forEach(function(cell) {
    cell.addEventListener('click', function() {
        const row = letterToIndex(cell.dataset.row);
        const col = Number(cell.dataset.col) -1;

        const result = processShot(enemyMap, row, col);
        if (result === null) {
            return;
        }
        renderBoard(enemyMap, enemyBoardElement);

        status.textContent = result ==='hit' ? 'Lovit!' : 'Ratat!';
    });
});

// --- Manual ship placement for the human player ---

// Same ships, same objects, just placed largest-first (4 -> 1)
const placementOrder = myShips.slice().sort(function(a, b) {
    return b.length - a.length;
});

let currentShipIndex = 0;
let currentOrientation = 'horizontal';

function placeNextShip(row, col) {
    if (currentShipIndex >= placementOrder.length) {
        return;
    }

    const ship = placementOrder[currentShipIndex];

    if (!isValidPosition(row, col, ship.length, currentOrientation) ||
        !hasNoAdjacentShip(myMap, row, col, ship.length, currentOrientation)) {
        status.textContent = 'Poziție invalidă, încearcă altă căsuță.';
        return;
    }

    const cells = getShipCells(row, col, ship.length, currentOrientation);
    for (let i = 0; i < cells.length; i++) {
        myMap[cells[i].row][cells[i].col] = 'ship';
    }
    ship.positions = cells;
    markCloseCells(myMap, row, col, ship.length, currentOrientation);

    renderBoard(myMap, myBoardElement);
    currentShipIndex++;

    if (currentShipIndex >= placementOrder.length) {
        status.textContent = 'Toate navele au fost plasate!';
    } else {
        status.textContent = 'Plasează nava: ' + placementOrder[currentShipIndex].name;
    }
}

myBoardElement.querySelectorAll('.cell').forEach(function(cell) {
    cell.addEventListener('click', function() {
        const row = letterToIndex(cell.dataset.row);
        const col = Number(cell.dataset.col) - 1;
        placeNextShip(row, col);
    });
});

document.getElementById('rotateBtn').addEventListener('click', function() {
    currentOrientation = currentOrientation === 'horizontal' ? 'vertical' : 'horizontal';
    status.textContent = 'Orientare: ' + currentOrientation;
});

// Draw the initial (all-water) state, and show which ship to place first
renderBoard(myMap, myBoardElement);
renderBoard(enemyMap, enemyBoardElement);
status.textContent = 'Plasează nava: ' + placementOrder[currentShipIndex].name;

function isShipSunk(ship, map) {
    for (let i = 0; i < ship.positions.length; i++) {
        const pos = ship.positions[i];
        if (map[pos.row][pos.col]  !== "hit") {
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

// Test setup: manual ship, length 2 on  D5-D6 (row=3, col=4 and col=5)
const testShip = { name: 'TestShip', length: 2, positions: [{row: 3, col: 4}, {row: 3, col: 5}] };
const testShips = [testShip];

enemyMap[3][4] = 'ship';
enemyMap[3][5] = 'ship';

// expect: object testShip (not null)
console.log("Test 1 (find ship at correct position):", findShipAt(3, 4, testShips));
// expect: null
console.log("Test 2 (position without ship):", findShipAt(7, 7, testShips));
// expect: false
console.log("Test 3 (ship NOT sunk, no cells hit yet):", isShipSunk(testShip, enemyMap));

// Simulate one hit on the first cell of the ship
enemyMap[3][4] = 'hit';
// expect: false
console.log("Test 4 (ship NOT sunk, only 1 of 2 cells hit):", isShipSunk(testShip, enemyMap));

// Simulate hit on the second cell of the ship
enemyMap[3][5] = 'hit';
// expect: true
console.log("Test 5 (ship SUNK, both cells hit):", isShipSunk(testShip, enemyMap));

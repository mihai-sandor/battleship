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
        if (result === 'hit') {
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

//Test setup: Manual ship placement for testing on B2(row=1, col=1)
enemyMap[1][1] = "ship";
// expect: "hit"
console.log("Test 1 (hit on ship):", processShot(enemyMap, 1, 1));
// expect: "missed"
console.log("Test 2 (hit on water):", processShot(enemyMap, 5, 5));
// expect: null (already shot here)
console.log("Test 3 (shoot twice in the same place):", processShot(enemyMap, 1, 1));
// expect: "hit", "missed"
console.log("Initial state of map after test:", enemyMap[1][1], enemyMap[5][5]);

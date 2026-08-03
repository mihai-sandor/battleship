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

createBoard(document.getElementById('myBoard'));
createBoard(document.getElementById('enemyBoard'));

// Console log just to count the numbers of elements created on each board
console.log(document.querySelectorAll('#myBoard .cell').length);
console.log(document.querySelectorAll('#enemyBoard .cell').length);

const row = letterToIndex("C");  // 2
const col = 6 - 1;               // 5

myMap[row][col] = "ship";

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

// Reset map to 'water' before placing ships
const testMap = createEmptyMap();
const testShips = createShips();

placeShipsRandomly(testMap, testShips);

// Test 1: total number of ship cells should equal the sum of lengths of all ships 1+2+3+4 = 10
let shipCellCount = 0;
for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
        if (testMap[row][col] === 'ship') {
            shipCellCount++;
        }
    }
}
console.log("Test 1 - total ship cells (expected 10):", shipCellCount);

// Test 2: each ship has exactly as many positions as its length
for (let i = 0; i < testShips.length; i++) {
    const ship = testShips[i];
    console.log(
        "Test 2 -", ship.name,
        "| expected length:", ship.length,
        "| actual positions:", ship.positions.length,
        "| correct:", ship.positions.length === ship.length
    );
}

// Test 3: each position stored in ship.positions is indeed a "ship" cell on the map
let allPositionsMatch = true;
for (let i = 0; i < testShips.length; i++) {
    const ship = testShips[i];
    for (let j = 0; j < ship.positions.length; j++) {
        const pos = ship.positions[j];
        if (testMap[pos.row][pos.col] !== 'ship') {
            allPositionsMatch = false;
        }
    }
}
console.log("Test 3 - all positions in ship.positions are 'ship' cells on the map:", allPositionsMatch);

for (let attempt = 0; attempt < 20; attempt++) {
    const t = createEmptyMap();
    const s = createShips();
    placeShipsRandomly(t, s);
    console.log("Attempt", attempt, "- OK, no errors or blockages");
}
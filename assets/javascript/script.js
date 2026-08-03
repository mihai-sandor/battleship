function createEmptyMap() {   // 1. Arrays (source of truth)
    const map = [];
    for (let row = 0; row < 10; row++) {
        map.push(new Array(10).fill('water'));
    }
    return map;
}

const myMap = createEmptyMap();
const enemyMap = createEmptyMap();

function letterToIndex(letter) {   // 2. Letter -> index conversion function
    return letter.toUpperCase().charCodeAt(0) - 65;
}

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

function isValidPosition(row, col, length, orientation) {
    if (orientation === 'horizontal') {
        const endCol = col + length - 1;
        return endCol <= 9;
    } else {
        const endRow = row + length - 1;
        return endRow <= 9;
    }
}

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


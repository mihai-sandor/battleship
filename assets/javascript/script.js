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
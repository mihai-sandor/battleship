function createBoard(boardElement) {
    for (let row = 0; row < 10; row++) {
        const rowLetter = String.fromCharCode(65 + row);
       
        for (let col = 1; col <= 10; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = rowLetter;
            cell.dataset.col = col;

            boardElement.appendChild(cell);
         
        }
    }
}

createBoard(document.getElementById('myBoard'));
createBoard(document.getElementById('enemyBoard'));

// Console log just to count the numbers of elements created on each board
console.log(document.querySelectorAll('#myBoard .cell').length);
console.log(document.querySelectorAll('#enemyBoard .cell').length);
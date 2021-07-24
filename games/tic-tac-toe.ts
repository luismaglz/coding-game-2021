declare function readline(): string;

function gameLoop(gameState: GameState) {
  // game loop
  while (true) {
    var inputs = readline().split(" ");
    const opponentRow = parseInt(inputs[0]);
    const opponentCol = parseInt(inputs[1]);
    const validActionCount = parseInt(readline());

    const me = Move.X;
    const opp = Move.O;

    for (let i = 0; i < validActionCount; i++) {
      var inputs = readline().split(" ");
      const row = parseInt(inputs[0]);
      const col = parseInt(inputs[1]);
    }

    if (opponentRow === -1 && opponentCol === -1) {
      gameState.board = updateBoard(gameState.board, { row: 0, col: 0, value: me });
      debugMessage("first 0 0")
      playPosition(0, 0);

    } else {
      gameState.board = updateBoard(gameState.board, { row: opponentRow, col: opponentCol, value: opp });
      const blockMove = moveToBlock(gameState.board, opp);

      if (blockMove) {
        gameState.board = updateBoard(gameState.board, { row: blockMove.row, col: blockMove.col, value: me });
        debugMessage(`block ${JSON.stringify(blockMove)}`)
        playPosition(blockMove.row, blockMove.col);
      }
      else {
        const bestMove = <Cell>findBestMove(gameState.board, 0, me, opp, me);
        gameState.board = updateBoard(gameState.board, { row: bestMove.row, col: bestMove.col, value: me });
        debugMessage(`opt ${JSON.stringify(bestMove)}`)
        playPosition(bestMove.row, bestMove.col);
      }
    }
  }
}

function moveToBlock(board: Board, opp: Move): Action | null {

  for (let row = 0; row <= 2; row++) {
    if (board[row][0] === opp && board[row][1] === opp && board[row][2] == null) {
      return { row, col: 2 }
    }

    if (board[row][0] === opp && board[row][1] === null && board[row][2] == opp) {
      return { row, col: 1 }
    }

    if (board[row][0] === null && board[row][1] === opp && board[row][2] == opp) {
      return { row, col: 0 }
    }
  }

  for (let col = 0; col <= 2; col++) {
    if (board[0][col] === opp && board[1][col] === opp && board[2][col] == null) {
      return { row: 2, col }
    }

    if (board[0][col] === opp && board[1][col] === null && board[2][col] == opp) {
      return { row: 1, col }
    }

    if (board[0][col] === null && board[1][col] === opp && board[2][col] == opp) {
      return { row: 2, col }
    }
  }

  if (board[1][1] === opp) {
    if (board[0][0] === opp && board[2][2] === null) { return { row: 2, col: 2 } }
    if (board[2][2] === opp && board[0][0] === null) { return { row: 0, col: 0 } }
    if (board[0][2] === opp && board[2][0] === null) { return { row: 2, col: 0 } }
    if (board[2][0] === opp && board[0][2] === null) { return { row: 0, col: 2 } }
  }


  return null;
}

function playPosition(row: number, col: number): void {
  console.log(`${row} ${col}`);
}

function debugMessage(value: any): void {
  console.error(JSON.stringify(value));
}

enum Move {
  X,
  O,
}

interface Action {
  row: number;
  col: number;
}

interface Cell extends Action {
  value: Move | null;
}

type Board = Array<Array<Move | null>>;

class GameState {
  id: number;
  board: Board = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];

  constructor(id: number) {
    this.id = id;
  }
}

function toAction(ac: string): Action {
  return {
    row: parseInt(ac[0], 10),
    col: parseInt(ac[1], 10)
  }
}

const winningBoards: Action[][] = [
  ['00', '01', '02'],
  ['10', '11', '12'],
  ['20', '21', '22'],
  ['00', '10', '20'],
  ['01', '11', '21'],
  ['02', '12', '22'],
  ['00', '11', '22'],
  ['02', '11', '20'],
].map(winningBoard => winningBoard.map(ac => toAction(ac)))

function cloneBoard(board: Board): Board {
  return [[...board[0]], [...board[1]], [...board[2]]];
}

function updateBoard(board: Board, cell: Cell): Board {
  const newBoard = cloneBoard(board);
  newBoard[cell.row][cell.col] = cell.value;
  return newBoard;
}

function toCells(board: Board): Array<Cell> {
  const row0 = board[0].map((v, i) => ({ row: 0, col: i, value: v }));
  const row1 = board[1].map((v, i) => ({ row: 1, col: i, value: v }));
  const row2 = board[2].map((v, i) => ({ row: 2, col: i, value: v }));
  return row0.concat(row1).concat(row2);
}

function movesLeft(board: Board): Cell[] {
  const cells = toCells(board);
  return cells.filter((cell) => cell.value === null);
}

function isBoardWon(board: Board, player: Move, winningBoards: Action[][]): boolean {
  return winningBoards.some(winningBoard =>
    winningBoard.every(action => board[action.row][action.col] === player)
  )
}

function getOpponent(player: Move): Move {
  if (player === Move.O) {
    return Move.X
  }
  return Move.O
}


function findBestMove(board: Board, depth: number, me: Move, opponent: Move, current: Move): number | Cell {
  let score = depth;
  const nextMove = getOpponent(current);

  if (isBoardWon(board, me, winningBoards)) {
    return score - 10
  }

  if (isBoardWon(board, opponent, winningBoards)) {
    return 10 + score;
  }

  const moves = movesLeft(board);
  const scores = moves.map(move => {
    const newBoard = updateBoard(board, { ...move, value: current });
    const moveScore = score + <number>findBestMove(newBoard, depth + 1, me, opponent, nextMove);
    return moveScore
  })

  if (depth === 0) {
    const minScore = Math.min(...scores)
    return moves[scores.indexOf(minScore)];
  }

  return score;
};


const gameState = new GameState(1);
// debugMessage(gameState.board);
// debugMessage(movesLeft(gameState.board));
// gameState.board = updateBoard(gameState.board, { row: 0, col: 0, value: Move.X });
// debugMessage(movesLeft(gameState.board));

gameLoop(gameState);

// ORDER is ROW | COL

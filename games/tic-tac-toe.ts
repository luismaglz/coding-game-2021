declare function readline(): string;

enum Value {
  E,
  X,
  O,
}

interface Action {
  row: number;
  col: number;
}

interface Cell extends Action {
  value: Value;
}

type Board = Array<Array<Value>>;

interface MoveState {
  move: Action,
  score: number,
  outcome: 'W' | 'L' | 'T' | null
}


function gameLoop(gameState: GameState) {
  // game loop
  while (true) {
    var inputs = readline().split(" ");
    const opponentRow = parseInt(inputs[0]);
    const opponentCol = parseInt(inputs[1]);
    const validActionCount = parseInt(readline());

    const me = Value.X;
    const opp = Value.O;

    for (let i = 0; i < validActionCount; i++) {
      var inputs = readline().split(" ");
      const row = parseInt(inputs[0]);
      const col = parseInt(inputs[1]);
      debugMessage(`available ${row},${col}`);
    }

    if (opponentRow === -1 && opponentCol === -1) {
      gameState.board = updateBoard(gameState.board, {
        row: 0,
        col: 0,
        value: me,
      });
      playPosition(0, 0);
    } else {
      gameState.board = updateBoard(gameState.board, {
        row: opponentRow,
        col: opponentCol,
        value: opp,
      });
      const blockMove = moveToBlock(gameState.board, opp);

      if (blockMove) {
        gameState.board = updateBoard(gameState.board, {
          row: blockMove.row,
          col: blockMove.col,
          value: me,
        });
        debugMessage(`block ${JSON.stringify(blockMove)}`);
        playPosition(blockMove.row, blockMove.col);
      } else {
        const bestMove = findBestMoveV2(gameState.board, me);
        gameState.board = updateBoard(gameState.board, {
          row: bestMove.row,
          col: bestMove.col,
          value: me,
        });
        debugMessage(`opt ${JSON.stringify(bestMove)}`);
        playPosition(bestMove.row, bestMove.col);
      }
    }
  }
}

const sameBoards = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8],
  [6, 3, 0, 7, 4, 1, 8, 5, 2],
  [8, 7, 6, 5, 4, 3, 2, 1, 0],
  [2, 5, 8, 1, 4, 7, 0, 3, 6],
  [2, 1, 0, 5, 4, 3, 8, 7, 6],
  [6, 7, 8, 3, 4, 2, 0, 1, 2],
];



function isBoardTied(board: Board): boolean {
  return boardToArray(board).indexOf(Value.E) === -1 && isBoardWon(board, Value.O) && !isBoardWon(board, Value.X)
}

function createBoardIndexes(board: Board): string[] {
  const boardAasArray = boardToArray(board)

  return sameBoards
    .map((variation) => {
      return variation.map((index) => boardAasArray[index]).join("-");
    })
}

function areBoardsTheSame(boardA: Board, boardB: Board): boolean {
  // flip x, flip y, rotate 90,180,270

  const boardAasArray = boardToArray(boardA);
  const boardBString = boardToString(boardB);

  return sameBoards
    .map((variation) => {
      return variation.map((index) => boardAasArray[index]).join("-");
    })
    .includes(boardBString);
}

function moveToBlock(board: Board, opp: Value): Action | null {
  for (let row = 0; row <= 2; row++) {
    if (
      board[row][0] === opp &&
      board[row][1] === opp &&
      board[row][2] == null
    ) {
      return { row, col: 2 };
    }

    if (
      board[row][0] === opp &&
      board[row][1] === null &&
      board[row][2] == opp
    ) {
      return { row, col: 1 };
    }

    if (
      board[row][0] === null &&
      board[row][1] === opp &&
      board[row][2] == opp
    ) {
      return { row, col: 0 };
    }
  }

  for (let col = 0; col <= 2; col++) {
    if (
      board[0][col] === opp &&
      board[1][col] === opp &&
      board[2][col] == null
    ) {
      return { row: 2, col };
    }

    if (
      board[0][col] === opp &&
      board[1][col] === null &&
      board[2][col] == opp
    ) {
      return { row: 1, col };
    }

    if (
      board[0][col] === null &&
      board[1][col] === opp &&
      board[2][col] == opp
    ) {
      return { row: 2, col };
    }
  }

  if (board[1][1] === opp) {
    if (board[0][0] === opp && board[2][2] === null) {
      return { row: 2, col: 2 };
    }
    if (board[2][2] === opp && board[0][0] === null) {
      return { row: 0, col: 0 };
    }
    if (board[0][2] === opp && board[2][0] === null) {
      return { row: 2, col: 0 };
    }
    if (board[2][0] === opp && board[0][2] === null) {
      return { row: 0, col: 2 };
    }
  }

  return null;
}

function playPosition(row: number, col: number): void {
  console.log(`${row} ${col}`);
}

function debugMessage(value: any): void {
  console.error(JSON.stringify(value));
}

function boardToArray(board: Board): Value[] {
  return [
    board[0][0],
    board[0][1],
    board[0][2],
    board[1][0],
    board[1][1],
    board[1][2],
    board[2][0],
    board[2][1],
    board[2][2],
  ];
}

function boardToString(board: Board): string {
  return boardToArray(board).join("-");
}

class GameState {
  id: number;
  board: Board = [
    [Value.E, Value.E, Value.E],
    [Value.E, Value.E, Value.E],
    [Value.E, Value.E, Value.E],
  ];

  constructor(id: number) {
    this.id = id;
  }
}

function toAction(ac: string): Action {
  return {
    row: parseInt(ac[0], 10),
    col: parseInt(ac[1], 10),
  };
}

const winningBoards: Action[][] = [
  ["00", "01", "02"],
  ["10", "11", "12"],
  ["20", "21", "22"],
  ["00", "10", "20"],
  ["01", "11", "21"],
  ["02", "12", "22"],
  ["00", "11", "22"],
  ["02", "11", "20"],
].map((winningBoard) => winningBoard.map((ac) => toAction(ac)));

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

function isBoardWon(board: Board, player: Value): boolean {
  const boardWonIndexes = [
    [0, 4, 8],
    [2, 4, 6],
    [0, 1, 2],
    [2, 5, 8],
    [6, 7, 8],
    [0, 3, 6],
    [3, 4, 5],
    [1, 4, 7],
  ];

  const arrayBoard = boardToArray(board);

  return boardWonIndexes.some(
    (winningBoard) =>
      arrayBoard[winningBoard[0]] === player &&
      arrayBoard[winningBoard[1]] === player &&
      arrayBoard[winningBoard[2]] === player
  );
}

function getOpponent(player: Value): Value {
  if (player === Value.O) {
    return Value.X;
  }
  return Value.O;
}

function findBestMoveState(board: Board, me: Value, opponent: Value, current: Value, moveState: MoveState) {
  const nextMove = getOpponent(current);

  moveState.score = moveState.score + 1;
  if (isBoardWon(board, me)) {
    moveState.outcome = 'W';
    return;
  }
  if (isBoardWon(board, opponent)) {
    moveState.outcome = 'L';
    return;
  }
  if (isBoardTied(board)) {
    moveState.outcome = 'T';
    return;
  }
  movesLeft(board).forEach(move => {
    const newBoard = updateBoard(board, { ...move, value: current });
    findBestMoveState(newBoard, me, opponent, nextMove, moveState)
  })
}

function findBestMoveV2(board: Board, me: Value): Action {
  const opp = getOpponent(me);
  const moveStates: MoveState[] = movesLeft(board).map(move => {
    return {
      move,
      score: 0,
      outcome: null,
    }
  });

  moveStates.forEach((ms) => {
    const newBoard = updateBoard(board, { ...ms.move, value: me });
    findBestMoveState(newBoard, me, opp, me, ms)
  });

  const winMoves = moveStates.filter(move => move.outcome === 'W').sort((ma, mb) => ma.score - mb.score);
  return winMoves[0].move;
}

function findBestMove(
  board: Board,
  depth: number,
  me: Value,
  opponent: Value,
  current: Value
): number | Cell {
  let score = depth;
  const nextMove = getOpponent(current);

  if (isBoardWon(board, me)) {
    return score - 10;
  }

  if (isBoardWon(board, opponent)) {
    return 10 + score;
  }

  const moves = movesLeft(board);
  const scores = moves.map((move) => {
    const newBoard = updateBoard(board, { ...move, value: current });
    const moveScore =
      score + <number>findBestMove(newBoard, depth + 1, me, opponent, nextMove);
    return moveScore;
  });

  if (depth === 0) {
    const minScore = Math.min(...scores);
    return moves[scores.indexOf(minScore)];
  }

  return score;
}

const gameState = new GameState(1);
// debugMessage(gameState.board);
// debugMessage(movesLeft(gameState.board));
// gameState.board = updateBoard(gameState.board, { row: 0, col: 0, value: Move.X });
// debugMessage(movesLeft(gameState.board));

gameLoop(gameState);

// ORDER is ROW | COL


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
type BoardState = {
  id: number;
  board: Board;
  state: "Won" | "Lost" | "Clean" | "Playing" | "Tie";
};

interface MoveState {
  board: string;
  move: Action;
  score: number;
  outcome: "W" | "L" | "T" | null;
}

const emptyBoard = [
  [Value.E, Value.E, Value.E],
  [Value.E, Value.E, Value.E],
  [Value.E, Value.E, Value.E],
];

class GameState {
  boards: BoardState[] = [
    {
      id: 0,
      board: cloneBoard(emptyBoard),
      state: "Clean",
    },
    {
      id: 1,
      board: cloneBoard(emptyBoard),
      state: "Clean",
    },
    {
      id: 2,
      board: cloneBoard(emptyBoard),
      state: "Clean",
    },
    {
      id: 3,
      board: cloneBoard(emptyBoard),
      state: "Clean",
    },
    {
      id: 4,
      board: cloneBoard(emptyBoard),
      state: "Clean",
    },
    {
      id: 5,
      board: cloneBoard(emptyBoard),
      state: "Clean",
    },
    {
      id: 6,
      board: cloneBoard(emptyBoard),
      state: "Clean",
    },
    {
      id: 7,
      board: cloneBoard(emptyBoard),
      state: "Clean",
    },
    {
      id: 8,
      board: cloneBoard(emptyBoard),
      state: "Clean",
    },
  ];
  activeBoard: number = 0;
  bigBoard: Board = cloneBoard(emptyBoard);

  getBoard(id: number): BoardState {
    return this.boards[id];
  }

  getNextAvailableBoard(): BoardState {
    return this.boards.find(
      (b) => b.state === "Clean" || b.state === "Playing"
    )!;
  }

  updateFromPlay(
    row: number,
    col: number,
    value: Value,
    me: Value,
    opp: Value
  ): void {
    const boardId = getBoardFromPlay(row, col);
    const offSetAction = offSetToSmallBoard(row, col);
    this.updateBoard(
      boardId,
      offSetAction.row,
      offSetAction.col,
      value,
      me,
      opp
    );
  }

  updateBoard(
    boardId: number,
    row: number,
    col: number,
    value: Value,
    me: Value,
    opp: Value
  ): void {
    const boardState = this.boards[boardId];

    boardState.board = updateBoard(boardState.board, { row, col, value });

    if (boardState.state === "Clean") {
      boardState.state = "Playing";
    } else if (boardState.state === "Playing") {
      if (isBoardWon(boardState.board, me)) {
        boardState.state = "Won";
      } else if (isBoardWon(boardState.board, opp)) {
        boardState.state = "Lost";
      } else if (isBoardTied(boardState.board)) {
        boardState.state = "Tie";
      }
    }
  }
  constructor() {}
}

function getBoardFromPlay(row: number, col: number): number {
  if (row <= 2) {
    if (col <= 2) {
      return 0;
    } else if (col <= 5) {
      return 1;
    } else {
      return 2;
    }
  } else if (row <= 5) {
    if (col <= 2) {
      return 3;
    } else if (col <= 5) {
      return 4;
    } else {
      return 5;
    }
  } else {
    if (col <= 2) {
      return 6;
    } else if (col <= 5) {
      return 7;
    } else {
      return 8;
    }
  }
}
function getNextBoardFromPlay(row: number, col: number): number {
  const play = offSetToSmallBoard(row, col);
  if (play.row === 0) {
    return play.col;
  } else if (play.row === 1) {
    return play.col + 3;
  } else {
    return play.col + 6;
  }
}

function offSetToBigBoard(row: number, col: number, boardId: number): Action {
  let tRow = 0;
  let tCol = 0;

  switch (boardId) {
    case 1: {
      tCol = 3;
      break;
    }
    case 2: {
      tCol = 6;
      break;
    }
    case 3: {
      tRow = 3;
      break;
    }
    case 4: {
      tRow = 3;
      tCol = 3;
      break;
    }
    case 5: {
      tRow = 3;
      tCol = 6;
      break;
    }
    case 6: {
      tRow = 6;
      break;
    }
    case 7: {
      tRow = 6;
      tCol = 3;
      break;
    }
    case 8: {
      tRow = 6;
      tCol = 6;
      break;
    }
    default:
      break;
  }

  return {
    col: col + tCol,
    row: row + tRow,
  };
}

function offSetToSmallBoard(row: number, col: number): Action {
  let tRow = 0;
  let tCol = 0;

  if (row <= 2) {
    if (col <= 2) {
      // Remain
    } else if (col <= 5) {
      tCol = 3;
    } else {
      tCol = 6;
    }
  } else if (row <= 5) {
    if (col <= 2) {
      tRow = 3;
    } else if (col <= 5) {
      tRow = 3;
      tCol = 3;
    } else {
      tRow = 3;
      tCol = 6;
    }
  } else {
    if (col <= 2) {
      tRow = 6;
    } else if (col <= 5) {
      tRow = 6;
      tCol = 3;
    } else {
      tRow = 6;
      tCol = 6;
    }
  }

  return {
    col: col - tCol,
    row: row - tRow,
  };
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
    }

    if (opponentRow === -1 && opponentCol === -1) {
      gameState.updateBoard(0, 0, 0, me, me, opp);
      playPosition(0, 0);
    } else {
      // Update Board From Move
      gameState.updateFromPlay(opponentRow, opponentCol, opp, me, opp);

      const nextBoardId = getNextBoardFromPlay(opponentRow, opponentCol);
      let nextBoardState = gameState.getBoard(nextBoardId);

      if (
        nextBoardState.state === "Lost" ||
        nextBoardState.state === "Tie" ||
        nextBoardState.state === "Won"
      ) {
        nextBoardState = gameState.getNextAvailableBoard();
      }
      const boardId = nextBoardState.id;
      const board = nextBoardState.board;

      if (nextBoardState.state === "Clean") {
        gameState.updateBoard(boardId, 0, 0, me, me, opp);
        const bigBoardAction = offSetToBigBoard(0, 0, boardId);
        playPosition(bigBoardAction.row, bigBoardAction.col);
      } else {
        const blockMove = moveToBlock(board, opp);

        if (blockMove) {
          gameState.updateBoard(
            boardId,
            blockMove.row,
            blockMove.col,
            me,
            me,
            opp
          );
          const bigBoardAction = offSetToBigBoard(
            blockMove.row,
            blockMove.col,
            boardId
          );
          playPosition(bigBoardAction.row, bigBoardAction.col);
        } else {
          const bestMove = findBestMove(board, me, opp);
          gameState.updateBoard(
            boardId,
            bestMove.row,
            bestMove.col,
            me,
            me,
            opp
          );
          const bigBoardAction = offSetToBigBoard(
            bestMove.row,
            bestMove.col,
            boardId
          );
          playPosition(bigBoardAction.row, bigBoardAction.col);
        }
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
  return (
    boardToArray(board).indexOf(Value.E) === -1 &&
    isBoardWon(board, Value.O) &&
    !isBoardWon(board, Value.X)
  );
}

function createBoardIndexes(board: Board): string[] {
  const boardAasArray = boardToArray(board);

  return sameBoards.map((variation) => {
    return variation.map((index) => boardAasArray[index]).join("-");
  });
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
  //ROWS
  for (let c = 0; c <= 2; c++) {
    const row = c;

    if (
      board[row][0] === opp &&
      board[row][1] === opp &&
      board[row][2] === Value.E
    ) {
      return { row, col: 2 };
    }

    if (
      board[row][0] === opp &&
      board[row][1] === Value.E &&
      board[row][2] === opp
    ) {
      return { row, col: 1 };
    }

    if (
      board[row][0] === Value.E &&
      board[row][1] === opp &&
      board[row][2] === opp
    ) {
      return { row, col: 0 };
    }

    const col = c;

    if (
      board[0][col] === opp &&
      board[1][col] === opp &&
      board[2][col] === Value.E
    ) {
      return { row: 2, col };
    }

    if (
      board[0][col] === opp &&
      board[1][col] === Value.E &&
      board[2][col] === opp
    ) {
      return { row: 1, col };
    }

    if (
      board[0][col] === Value.E &&
      board[1][col] === opp &&
      board[2][col] === opp
    ) {
      return { row: 0, col };
    }
  }

  //COLS

  if (board[1][1] === opp) {
    if (board[0][0] === opp && board[2][2] === Value.E) {
      return { row: 2, col: 2 };
    }
    if (board[2][2] === opp && board[0][0] === Value.E) {
      return { row: 0, col: 0 };
    }
    if (board[0][2] === opp && board[2][0] === Value.E) {
      return { row: 2, col: 0 };
    }
    if (board[2][0] === opp && board[0][2] === Value.E) {
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
  return cells.filter((cell) => cell.value === Value.E);
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

const moveMap: { [key: string]: Action } = {
  "1-0-0-0-0-0-0-0-0": { row: 2, col: 2 },
  "0-0-0-0-0-0-0-0-1": { row: 0, col: 0 },
  "0-0-1-0-0-0-0-0-1": { row: 2, col: 0 },
  "0-0-1-0-0-0-1-0-0": { row: 0, col: 2 },
  "0-1-0-0-0-0-0-0-0": { row: 0, col: 0 },
  "0-0-0-0-1-0-0-0-0": { row: 0, col: 0 },
  "0-0-0-0-0-0-0-1-0": { row: 0, col: 0 },
  "0-0-0-1-0-0-0-0-0": { row: 0, col: 0 },
  "0-0-0-0-0-1-0-0-0": { row: 0, col: 0 },
  "2-0-0-0-0-0-0-0-0": { row: 2, col: 2 },
  "0-0-0-0-0-0-0-0-2": { row: 0, col: 0 },
  "0-0-2-0-0-0-0-0-2": { row: 2, col: 0 },
  "0-0-2-0-0-0-2-0-0": { row: 0, col: 2 },
  "0-2-0-0-0-0-0-0-0": { row: 0, col: 0 },
  "0-0-0-0-2-0-0-0-0": { row: 0, col: 0 },
  "0-0-0-0-0-0-0-2-0": { row: 0, col: 0 },
  "0-0-0-2-0-0-0-0-0": { row: 0, col: 0 },
  "0-0-0-0-0-2-0-0-0": { row: 0, col: 0 },
};

const moveScoreMap: { [key: string]: number } = {};

const gameState = new GameState();
gameLoop(gameState);

// ORDER is ROW | COL
interface ScoredMove {
  action: Action;
  score: number;
}

function findBestMove(board: Board, me: Value, opp: Value): Action {
  const boardAsString = boardToString(board);
  if (moveMap[boardAsString]) {
    return moveMap[boardAsString];
  }
  const moves = movesLeft(board);
  const scoredMoves = scoreMoves(board, me, opp, moves);
  return scoredMoves.sort((a, b) => b.score - a.score)[0].action;
}

function scoreMoves(
  board: Board,
  me: Value,
  opp: Value,
  moves: Action[]
): ScoredMove[] {
  return moves.map((move) => {
    return {
      score: minMax(
        updateBoard(board, { row: move.row, col: move.col, value: me }),
        me,
        opp,
        opp
      ),
      action: move,
    };
  });
}

function minMax(board: Board, me: Value, opp: Value, current: Value): number {
  if (isBoardWon(board, me)) {
    return 1;
  }
  if (isBoardWon(board, opp)) {
    return -1;
  }

  let move = -1;
  let score = -2;

  const movesAvailable = movesLeft(board);

  for (let mi = 0; mi < movesAvailable.length; mi++) {
    mi;
    const ma = movesAvailable[mi];
    const updatedBoard = updateBoard(board, {
      col: ma.col,
      row: ma.row,
      value: current,
    });
    const moveScore = minMax(updatedBoard, me, opp, getOpponent(current));
    if (moveScore > score) {
      score = moveScore;
      move = mi;
    }
  }

  if (move === -1) {
    return 0;
  }

  return score;
}

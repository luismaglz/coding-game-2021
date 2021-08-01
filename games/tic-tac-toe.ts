declare function readline(): string;

enum Value {
  E = 1,
  X = 2,
  O = 3,
}

interface ScoredMove {
  action: Action;
  score: number;
}
interface BigBoardAction extends Action {
  boardId: number;
}

interface Action {
  row: number;
  col: number;
}

interface Cell extends Action {
  value: Value;
}

type Board = Array<Array<Value>>;
interface BoardState {
  id: number;
  board: Board;
  state: "Won" | "Lost" | "Clean" | "Playing" | "Tie";
}

interface ScoredBoardState extends BoardState {
  score: ScoredMove[];
  scoreValue: number;
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

  getBoard(id: number): BoardState {
    return this.boards[id];
  }

  // getNextAvailableBoard(me: Value, opp: Value): BoardState {
  //   const scoredBoard = scoreMovesBigBoard(this.boards, me, opp).sort(
  //     (a, b) => b.scoreValue - a.scoreValue
  //   );
  //   return scoredBoard[0];
  // }

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

  getId(): string {
    return createBigBoardID(this.boards);
  }

  constructor(protected state?: GameState) {
    if (state) {
      this.boards = state.boards.map((boardState) => {
        return {
          ...boardState,
          board: cloneBoard(boardState.board),
        };
      });

      this.activeBoard = state.activeBoard;
    }
  }
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
///881196348

let log = true;
function gameLoop(gameState: GameState) {
  let moveCount = 0;
  // game loop
  while (true) {
    moveCount++;
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
      if (opponentRow === 2 && opponentCol === 7) {
        log = true;
      }
      const bestMoves = findBestBigBoardMove(
        gameState,
        nextBoardId,
        me,
        opp
      ).sort((a, b) => b.score - a.score);
      const winMove = bestMoves.filter((bestMove) => bestMove.score === 1);
      const loseMove = bestMoves.filter((bestMove) => bestMove.score === -1);
      debugMessage({ loseMove });

      if (winMove.length > 0) {
        gameState.updateFromPlay(
          winMove[0].action.row,
          winMove[0].action.col,
          me,
          me,
          opp
        );
        playPosition(winMove[0].action.row, winMove[0].action.col);
      } else {
        let nextBoardState = gameState.getBoard(nextBoardId);
        if (
          nextBoardState.state === "Lost" ||
          nextBoardState.state === "Tie" ||
          nextBoardState.state === "Won"
        ) {
          nextBoardState = gameState.boards.find(
            (boardState) =>
              boardState.state === "Clean" || boardState.state === "Playing"
          )!;
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
            const bestMoves = findBestMove(board, me, opp).sort(
              (a, b) => b.score - a.score
            );
            gameState.updateBoard(
              boardId,
              bestMoves[0].action.row,
              bestMoves[0].action.col,
              me,
              me,
              opp
            );
            const bigBoardAction = offSetToBigBoard(
              bestMoves[0].action.row,
              bestMoves[0].action.col,
              boardId
            );
            playPosition(bigBoardAction.row, bigBoardAction.col);
          }
        }
      }
    }
  }
}

function isBoardTied(board: Board): boolean {
  return (
    boardToArray(board).indexOf(Value.E) === -1 &&
    !isBoardWon(board, Value.O) &&
    !isBoardWon(board, Value.X)
  );
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
  if (log) {
    console.error(JSON.stringify(value));
  }
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
  return boardToArray(board).join("");
}

function boardToKey(board: Board): number {
  return parseInt(boardToArray(board).join(""));
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

function movesLeftBigBoard(
  bigBoard: BoardState[],
  nextBoardId: number
): BoardState[] {
  if (
    bigBoard[nextBoardId].state === "Playing" ||
    bigBoard[nextBoardId].state === "Clean"
  ) {
    return [bigBoard[nextBoardId]];
  }
  return bigBoard.filter(
    (boardState) =>
      boardState.state === "Clean" || boardState.state === "Playing"
  );
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

// ORDER is ROW | COL

function findBestMove(board: Board, me: Value, opp: Value): ScoredMove[] {
  const moves = movesLeft(board);
  return scoreMoves(board, me, opp, moves);
}

function findBestBigBoardMove(
  gameState: GameState,
  nextBoardId: number,
  me: Value,
  opp: Value
): ScoredMove[] {
  return scoreMovesBigBoard(gameState, nextBoardId, me, opp);
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

function scoreMovesBigBoard(
  gameState: GameState,
  nextBoardId: number,
  me: Value,
  opp: Value
): ScoredMove[] {
  const availableBoards = movesLeftBigBoard(gameState.boards, nextBoardId);
  const aMoves = availableBoards.map((boardState) =>
    movesLeft(boardState.board).map((move) =>
      offSetToBigBoard(move.row, move.col, boardState.id)
    )
  );
  debugMessage({ nextBoardId });
  const wins = gameState.boards.filter((gs) => gs.state === "Won").length;
  const loss = gameState.boards.filter((gs) => gs.state === "Lost").length;
  const tie = gameState.boards.filter((gs) => gs.state === "Tie").length;

  const moves = aMoves.reduce((acc, sm) => [...acc, ...sm], []);
  debugMessage({ moves });
  return moves.map((move) => {
    const updatedGameState = new GameState(gameState);
    updatedGameState.updateFromPlay(move.row, move.col, me, me, opp);

    const boardIndex = getNextBoardFromPlay(move.row, move.col);
    if (move.row === 6 && move.col === 1) {
      const a2 = movesLeftBigBoard(updatedGameState.boards, boardIndex);
      const m2 = a2
        .map((boardState) =>
          movesLeft(boardState.board).map((move) =>
            offSetToBigBoard(move.row, move.col, boardState.id)
          )
        )
        .reduce((acc, sm) => [...acc, ...sm], []);
      debugMessage({ m2, boardIndex, move });
    }
    return {
      score: minMaxBigBoardV2(
        updatedGameState,
        boardIndex,
        me,
        opp,
        opp,
        wins,
        loss,
        tie
      ),
      action: move,
    };
  });
}

function bigBoardStateToValue(
  state: "Won" | "Lost" | "Clean" | "Playing" | "Tie"
): Value {
  switch (state) {
    case "Won": {
      return Value.X;
      break;
    }
    case "Lost": {
      return Value.O;
    }
    default: {
      return Value.E;
      break;
    }
  }
}

function bigBoardToSmallBoard(bigBoard: BoardState[]): Board {
  return [
    [
      bigBoardStateToValue(bigBoard[0].state),
      bigBoardStateToValue(bigBoard[1].state),
      bigBoardStateToValue(bigBoard[2].state),
    ],
    [
      bigBoardStateToValue(bigBoard[3].state),
      bigBoardStateToValue(bigBoard[4].state),
      bigBoardStateToValue(bigBoard[5].state),
    ],
    [
      bigBoardStateToValue(bigBoard[6].state),
      bigBoardStateToValue(bigBoard[7].state),
      bigBoardStateToValue(bigBoard[8].state),
    ],
  ];
}

function isBigBoardWon(bigBoard: BoardState[]): boolean {
  // const bigBoardAsSmallBoard = bigBoardToSmallBoard(bigBoard);
  // const isWon = isBoardWon(bigBoardAsSmallBoard, Value.X);

  // if (isWon) {
  //   return true;
  // } else if (
  //   bigBoard.some(
  //     (boardState) =>
  //       boardState.state === "Clean" || boardState.state === "Playing"
  //   )
  // ) {
  //   return false;
  // }
  return (
    bigBoard.filter((boardState) => boardState.state === "Won").length >
    bigBoard.filter((boardState) => boardState.state === "Lost").length
  );
}

function isBigBoardLost(bigBoard: BoardState[]): boolean {
  // const bigBoardAsSmallBoard = bigBoardToSmallBoard(bigBoard);
  // const isWon = isBoardWon(bigBoardAsSmallBoard, Value.O);

  // if (isWon) {
  //   return true;
  // } else if (
  //   bigBoard.some(
  //     (boardState) =>
  //       boardState.state === "Clean" || boardState.state === "Playing"
  //   )
  // ) {
  //   return false;
  // }
  return (
    bigBoard.filter((boardState) => boardState.state === "Won").length <
    bigBoard.filter((boardState) => boardState.state === "Lost").length
  );
}

function isBigBoardTied(bigBoard: BoardState[]): boolean {
  return (
    !isBigBoardLost(bigBoard) &&
    !isBigBoardLost(bigBoard) &&
    !bigBoard.some(
      (boardState) =>
        boardState.state === "Clean" || boardState.state === "Playing"
    )
  );
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

    let moveScore;
    const boardKey = boardToString(updatedBoard);
    if (optimizedHash[boardKey]) {
      const [score, row, col] = optimizedHash[boardKey].split(",");
      moveScore = parseInt(score, 10);
    } else {
      moveScore = minMax(updatedBoard, me, opp, getOpponent(current));
      optimizedHash[boardKey] = [moveScore, ma.row, ma.col].join(",");
    }

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

function minMaxBigBoardV2(
  _gameState: GameState,
  boardIndex: number,
  me: Value,
  opp: Value,
  current: Value,
  winsBefore: number,
  lossBefore: number,
  tieBefore: number,
  depth: number = 0
): number {
  if (
    _gameState.boards.filter((gs) => gs.state === "Won").length > winsBefore
  ) {
    return 1;
  }

  if (
    _gameState.boards.filter((gs) => gs.state === "Lost").length > lossBefore
  ) {
    return -1;
  }

  if (depth === 2) {
    return 0;
  }
  depth++;
  const availableBoards = movesLeftBigBoard(_gameState.boards, boardIndex);
  const aMoves = availableBoards.map((boardState) =>
    movesLeft(boardState.board).map((move) =>
      offSetToBigBoard(move.row, move.col, boardState.id)
    )
  );

  let score = 0;

  for (let move of aMoves.reduce((acc, sm) => [...acc, ...sm], [])) {
    const updatedGameState = new GameState(_gameState);
    updatedGameState.updateFromPlay(move.row, move.col, current, me, opp);

    const boardIndex = getNextBoardFromPlay(move.row, move.col);
    const calculated = minMaxBigBoardV2(
      updatedGameState,
      boardIndex,
      me,
      opp,
      current,
      winsBefore,
      lossBefore,
      tieBefore,
      depth
    );
    if (move.row === 6 && move.col === 1) {
      // debugMessage({ move });
      // debugMessage({ board: updatedGameState.boards.map((b) => b.state) });
      // debugMessage({ move, calculated, depth });
    }
    if (calculated === -1) {
      return -1;
    }
  }

  return score;
  // let move = -1;
  // let score = -2;

  // // Create array with playable boards
  // let boardStates = [_gameState.boards[boardIndex]];
  // if (boardStates[0].state !== "Playing" && boardStates[0].state !== "Clean") {
  //   boardStates = _gameState.boards.filter(
  //     (board) => board.state === "Playing" || board.state === "Clean"
  //   );
  // }

  // // Get all moves from playable boards
  // const movesArray = boardStates.map((boardState) => {
  //   return movesLeft(boardState.board).map((move) =>
  //     offSetToBigBoard(move.row, move.col, boardState.id)
  //   );
  // });

  // // Combine them all into a single array
  // const allMoves: Action[] = movesArray.reduce((acc, moves) => {
  //   return acc.concat(moves);
  // }, []);

  // // Try all the moves
  // for (const [mi, ma] of Object.entries(allMoves)) {
  //   const newGameState = new GameState(_gameState);
  //   newGameState.updateFromPlay(ma.row, ma.col, current, me, opp);
  //   const nextId = getNextBoardFromPlay(ma.row, ma.col);

  //   let moveScore;

  //   moveScore = minMaxBigBoardV2(
  //     newGameState,
  //     nextId,
  //     me,
  //     opp,
  //     getOpponent(current),
  //     depth,
  //     winsBefore,
  //     lossBefore,
  //     tieBefore
  //   );

  // return score;
}
// function minMaxBigBoard(
//   mmGameState: GameState,
//   boardIndex: number,
//   me: Value,
//   opp: Value,
//   current: Value,
//   depth: number,
//   winsBefore: number,
//   lossBefore: number,
//   tieBefore: number
// ): number {
//   depth++;
//   if (depth === 1) {
//     return 0;
//   }

//   if (
//     mmGameState.boards.filter((gameState) => gameState.state === "Won").length >
//     winsBefore
//   ) {
//     return 1;
//   }
//   if (
//     mmGameState.boards.filter((gameState) => gameState.state === "Lost")
//       .length > lossBefore
//   ) {
//     return -1;
//   }

//   let move = -1;
//   let score = -2;

//   // Create array with playable boards
//   let boardStates = [mmGameState.boards[boardIndex]];
//   if (boardStates[0].state !== "Playing" && boardStates[0].state !== "Clean") {
//     boardStates = mmGameState.boards.filter(
//       (board) => board.state === "Playing" || board.state === "Clean"
//     );
//   }

//   // Get all moves from playable boards
//   const movesArray = boardStates.map((boardState) => {
//     return movesLeft(boardState.board).map((move) =>
//       offSetToBigBoard(move.row, move.col, boardState.id)
//     );
//   });

//   // Combine them all into a single array
//   const allMoves: Action[] = movesArray.reduce((acc, moves) => {
//     return acc.concat(moves);
//   }, []);

//   // Try all the moves
//   for (const [mi, ma] of Object.entries(allMoves)) {
//     const newGameState = new GameState(mmGameState);
//     newGameState.updateFromPlay(ma.row, ma.col, current, me, opp);

//     let moveScore;
//     const boardKey = newGameState.getId();
//     if (bigBoardHash[boardKey]) {
//       const [score, row, col] = bigBoardHash[boardKey].split(",");
//       moveScore = parseInt(score, 10);
//     } else {
//       const nextId = getNextBoardFromPlay(ma.row, ma.col);
//       moveScore = minMaxBigBoard(
//         newGameState,
//         nextId,
//         me,
//         opp,
//         getOpponent(current),
//         depth,
//         winsBefore,
//         lossBefore,
//         tieBefore
//       );
//       bigBoardHash[boardKey] = [moveScore, ma.row, ma.col].join(",");
//     }

//     if (moveScore > score) {
//       score = moveScore;
//       move = parseInt(mi, 10);
//     }
//   }

//   if (move === -1) {
//     return 0;
//   }

//   return score;
// }

function createBigBoardID(bigBoard: BoardState[]): string {
  return bigBoard.map((boardState) => boardToString(boardState.board)).join("");
}

// score,row,col
//

// const myBoard = cloneBoard(emptyBoard);
// minMax(myBoard, Value.X, Value.O, Value.X);

const values: string[] = [
  "1,0,0",
  "1,2,2",
  "1,2,1",
  "1,2,0",
  "1,1,2",
  "1,1,1",
  "-1,2,2",
  "0,2,0",
  "1,1,0",
  "0,2,2",
  "0,2,1",
  "0,1,2",
  "-1,2,1",
  "-1,1,2",
  "1,0,2",
  "0,1,1",
  "-1,2,0",
  "1,0,1",
  "-1,1,1",
  "0,1,0",
  "-1,0,2",
];

const hash: { [key: string]: string } = {};
const optimizedHash: { [key: string]: string } = {};
const bigBoardHash: { [key: string]: string } = {};

// Object.keys(hash).forEach((key) => {
//   hash[key] = `values[${values.indexOf(hash[key])}]`;
// });

// fs.writeFileSync(path.join(__dirname, "./hash"), JSON.stringify(hash));
const initial_gameState = new GameState();
// initial_gameState.updateBoard(0, 0, 0, Value.X, Value.X, Value.O);
// initial_gameState.updateBoard(0, 1, 0, Value.O, Value.X, Value.O);
// const v = scoreMovesBigBoard(initial_gameState, Value.X, Value.O);
// fs.writeFileSync(
//   path.join(__dirname, "./bigScore.json"),
//   JSON.stringify(bigBoardHash)
// );

gameLoop(initial_gameState);

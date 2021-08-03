declare function readline(): string;

enum Value {
  E = "-",
  X = "X",
  O = "O",
}

interface ScoredMove {
  action: Action;
  score: number;
}

interface ScoredBigMove {
  action: Action;
  outcome: "Win" | "Lose" | "Tie" | "Undetermined";
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

const possibleMoves: Action[] = [
  { row: 0, col: 0 },
  { row: 0, col: 2 },
  { row: 2, col: 0 },
  { row: 2, col: 2 },
  { row: 1, col: 1 },
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
    this.activeBoard = getNextBoardFromPlay(row, col);
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
  return getNextBoardFromAction(play.row, play.col);
}

function getNextBoardFromAction(row: number, col: number): number {
  if (row === 0) {
    return col;
  } else if (row === 1) {
    return col + 3;
  } else {
    return col + 6;
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

function createSmallBoardFromBigBoard(gameState: GameState, me: Value): Board {
  const opp = getOpponent(me);
  const values = gameState.boards.map((gameState) => {
    if (gameState.state === "Won") {
      return me;
    } else if (gameState.state === "Lost" || gameState.state === "Tie") {
      return opp;
    } else {
      return Value.E;
    }
  });
  const board: Board = [
    [values[0], values[1], values[2]],
    [values[3], values[4], values[5]],
    [values[6], values[7], values[8]],
  ];
  return board;
}

function isBoardPreTied(board: Board): boolean {
  const bestMovesMe = findBestMove(board, Value.X, Value.O);
  const bestMovesOpp = findBestMove(board, Value.O, Value.X);

  return bestMovesMe
    .concat(bestMovesOpp)
    .every((scoredMove) => scoredMove.score === 0);
}

function isBoardPlayable(
  state: "Won" | "Lost" | "Clean" | "Playing" | "Tie"
): boolean {
  return state === "Playing" || state === "Clean";
}

function canIBeBlocked(board: Board, me: Value): boolean {
  return movesLeft(board)
    .map((move) => updateBoard(board, { ...move, value: me }))
    .some((board) => isBoardWon(board, me));
}

function playMove(
  gameState: GameState,
  boardId: number,
  move: Action,
  me: Value,
  opp: Value
) {
  gameState.updateBoard(boardId, move.row, move.col, me, me, opp);
  const bigBoardAction = offSetToBigBoard(move.row, move.col, boardId);
  playPosition(bigBoardAction.row, bigBoardAction.col);
}

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
      const nextBoardToPlay = getNextBoardFromPlay(opponentRow, opponentCol);

      const bigBoardScoredMoves = scoreMovesBigBoard(gameState, me, opp);

      const loseMove = bigBoardScoredMoves.filter(
        (bestMove) => bestMove.outcome === "Lose"
      );
      const winMove = bigBoardScoredMoves.filter(
        (bestMove) => bestMove.outcome === "Win"
      );

      if (moveCount === 1 && opponentRow === 4 && opponentCol === 4) {
        gameState.updateBoard(4, 1, 0, me, me, opp);
        playPosition(4, 3);
      } else if (winMove.length > 0) {
        gameState.updateFromPlay(
          winMove[0].action.row,
          winMove[0].action.col,
          me,
          me,
          opp
        );
        playPosition(winMove[0].action.row, winMove[0].action.col);
      } else {
        let nextBoardState = gameState.getBoard(nextBoardToPlay);
        if (
          nextBoardState.state === "Lost" ||
          nextBoardState.state === "Tie" ||
          nextBoardState.state === "Won"
        ) {
          const bigAsSmall = createSmallBoardFromBigBoard(gameState, me);
          const bestMoves = findBestMove(bigAsSmall, me, opp).sort(
            (a, b) => b.score - a.score
          );

          const boards = bestMoves
            .map((move) =>
              getNextBoardFromAction(move.action.row, move.action.col)
            )
            .filter(
              (board) => !canIBeBlocked(gameState.boards[board].board, me)
            );

          let newBoardId: number;
          if (boards[0]) {
            newBoardId = boards[0];
          } else {
            const bestMove = bestMoves[0];
            newBoardId = getNextBoardFromAction(
              bestMove.action.row,
              bestMove.action.col
            );
          }

          nextBoardState = gameState.boards[newBoardId];
          // debugMessage({ nextBoardState });
        }

        const boardId = nextBoardState.id;
        const board = nextBoardState.board;

        if (nextBoardState.state === "Clean") {
          let move: Action = {
            row: 0,
            col: 0,
          };

          const availableMovesSmall = movesLeft(board);
          const availableMoves = possibleMoves
            .filter((posMove) =>
              availableMovesSmall.some(
                (availMove) =>
                  posMove.row === availMove.row && posMove.col === availMove.col
              )
            )
            .map((action) => offSetToBigBoard(action.row, action.col, boardId))
            .filter((availMove) => {
              return !loseMove.some(
                (l) =>
                  l.action.row === availMove.row &&
                  l.action.col === availMove.col
              );
            });

          if (availableMoves[0]) {
            move = availableMoves[0];
          }
          gameState.updateFromPlay(move.row, move.col, me, me, opp);
          // const bigBoardAction = offSetToBigBoard(move.row, move.col, boardId);
          playPosition(move.row, move.col);
        } else {
          const blockMove = moveToBlock(board, opp);

          if (blockMove) {
            const willBlockMoveLose = loseMove.some((loseMove) => {
              const bBlock = offSetToBigBoard(
                blockMove.row,
                blockMove.col,
                boardId
              );

              return (
                loseMove.action.row === bBlock.row &&
                loseMove.action.col === bBlock.col
              );
            });

            if (willBlockMoveLose) {
              const bestMoves = findBestMove(board, me, opp)
                .filter((bestMoves) => {
                  const bigBestMoves = offSetToBigBoard(
                    bestMoves.action.row,
                    bestMoves.action.col,
                    boardId
                  );
                  return !loseMove.some(
                    (lm) =>
                      lm.action.row === bigBestMoves.row &&
                      lm.action.col === bigBestMoves.col
                  );
                })
                .sort((a, b) => b.score - a.score);

              if (bestMoves.length > 0) {
                playMove(gameState, boardId, bestMoves[0].action, me, opp);
              } else {
                playMove(gameState, boardId, blockMove, me, opp);
              }
            } else {
              // Block move wont lose
              playMove(gameState, boardId, blockMove, me, opp);
            }
          } else {
            let nextMove: Action;
            const bestMoves = findBestMove(board, me, opp).sort(
              (a, b) => b.score - a.score
            );

            const bestMovesMinusLose = bestMoves.filter((bestMove) => {
              const bigBestMove = offSetToBigBoard(
                bestMove.action.row,
                bestMove.action.col,
                boardId
              );
              return !loseMove.some((loseMove) => {
                return (
                  loseMove.action.row === bigBestMove.row &&
                  loseMove.action.col === bigBestMove.col
                );
              });
            });

            if (bestMovesMinusLose.length > 0) {
              nextMove = bestMovesMinusLose[0].action;
            } else {
              nextMove = bestMoves[0].action;
            }

            gameState.updateBoard(
              boardId,
              nextMove.row,
              nextMove.col,
              me,
              me,
              opp
            );
            const bigBoardAction = offSetToBigBoard(
              nextMove.row,
              nextMove.col,
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

function movesLeftBigBoard(gameState: GameState): Action[] {
  const bigBoard = gameState.boards;
  const nextBoardId = gameState.activeBoard;

  if (isBoardPlayable(bigBoard[nextBoardId].state)) {
    return [bigBoard[nextBoardId]]
      .map((boardState) =>
        movesLeft(boardState.board).map((move) =>
          offSetToBigBoard(move.row, move.col, boardState.id)
        )
      )
      .reduce((acc, sm) => [...acc, ...sm], []);
  }
  return bigBoard
    .filter((boardState) => isBoardPlayable(boardState.state))
    .map((boardState) =>
      movesLeft(boardState.board).map((move) =>
        offSetToBigBoard(move.row, move.col, boardState.id)
      )
    )
    .reduce((acc, sm) => [...acc, ...sm], []);
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
  me: Value,
  opp: Value
): ScoredBigMove[] {
  const availableMoves = movesLeftBigBoard(gameState);

  const wins = gameState.boards.filter((gs) => gs.state === "Won").length;
  const loss = gameState.boards.filter((gs) => gs.state === "Lost").length;
  const tie = gameState.boards.filter((gs) => gs.state === "Tie").length;

  const current = me;
  const scoredBigMoves: ScoredBigMove[] = [];

  for (let moveIndex = 0; moveIndex < availableMoves.length; moveIndex++) {
    const move = availableMoves[moveIndex];
    const minMaxResult = minMaxBigBoardV3(
      gameState,
      move,
      me,
      opp,
      current,
      wins,
      loss,
      tie,
      availableMoves.length > 6 ? 1 : 0
    );

    const scoredBigMove: ScoredBigMove = {
      action: { row: move.row, col: move.col },
      outcome: "Undetermined",
    };

    if (minMaxResult.o === "W") {
      scoredBigMove.outcome = "Win";
    } else if (minMaxResult.r.some((result) => result.o === "L")) {
      scoredBigMove.outcome = "Lose";
    } else if (minMaxResult.r.some((result) => result.o === "T")) {
      scoredBigMove.outcome = "Tie";
    }

    scoredBigMoves.push(scoredBigMove);
  }

  return scoredBigMoves;
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
  return (
    bigBoard.filter((boardState) => boardState.state === "Won").length >
    bigBoard.filter((boardState) => boardState.state === "Lost").length
  );
}

function isBigBoardLost(bigBoard: BoardState[]): boolean {
  return (
    bigBoard.filter((boardState) => boardState.state === "Won").length <
    bigBoard.filter((boardState) => boardState.state === "Lost").length
  );
}

function isBigBoardTied(bigBoard: BoardState[]): boolean {
  return (
    !isBigBoardLost(bigBoard) &&
    !isBigBoardLost(bigBoard) &&
    !bigBoard.some((boardState) => isBoardPlayable(boardState.state))
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

interface MinMaxResult {
  d: number;
  o: "W" | "L" | "T" | "U";
  r: MinMaxResult[];
}
function minMaxBigBoardV3(
  gameState: GameState,
  move: Action,
  me: Value,
  opp: Value,
  current: Value,
  winsBefore: number,
  lossBefore: number,
  tieBefore: number,
  depth: number = 0
): MinMaxResult {
  const newGameState = new GameState(gameState);
  newGameState.updateFromPlay(move.row, move.col, current, me, opp);

  const movesAvailable = movesLeftBigBoard(newGameState);

  const minMaxResult: MinMaxResult = {
    d: depth,
    o: "U",
    r: [],
  };

  const boards = newGameState.boards;

  let winsNow = 0;
  let lossNow = 0;
  let tieNow = 0;

  for (let boardIndex = 0; boardIndex < boards.length; boardIndex++) {
    switch (boards[boardIndex].state) {
      case "Won": {
        winsNow++;
        break;
      }
      case "Lost": {
        lossNow++;
        break;
      }
      case "Tie": {
        tieNow++;
      }
    }

    if (winsNow > winsBefore) {
      minMaxResult.o = "W";
    } else if (lossNow > lossBefore) {
      minMaxResult.o = "L";
    } else if (tieNow > tieBefore) {
      minMaxResult.o = "T";
    }
  }

  depth++;
  if (depth <= 2) {
    for (let moveIndex = 0; moveIndex < movesAvailable.length; moveIndex++) {
      const m = movesAvailable[moveIndex];
      const subMinMaxResult = minMaxBigBoardV3(
        newGameState,
        m,
        me,
        opp,
        getOpponent(current),
        winsNow,
        lossNow,
        tieNow,
        depth
      );
      minMaxResult.r.push(subMinMaxResult);
      if (subMinMaxResult.o === "L" && depth === 2) {
        break;
      }
      if (subMinMaxResult.o === "W" && depth === 3) {
        break;
      }
    }
  }
  return minMaxResult;
}

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
//seed=310144971
//TfuPChSI1

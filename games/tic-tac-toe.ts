declare function readline(): string;

enum Value {
  E = "-",
  X = "X",
  O = "O",
  T = "T",
}

interface ScoredMove {
  action: Action;
  score: number;
}

interface ScoredBigMove {
  action: Action;
  outcome: "Win" | "Lose" | "Tie" | "Undetermined" | "WinLose";
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

enum GameStatus {
  Playing = -1,
  Tie = 0,
  Won = 1,
  Lost = 2,
}

function getIdFromPlay(
  gameState: GameState,
  row: number,
  col: number,
  value: Value
): string {
  const newState = createNewGameState(gameState, { row, col, value });
  return newState.id;
}

let id = 0;

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
  won: number = 0;
  lost: number = 0;
  tied: number = 0;

  me: Value = Value.X;
  opp: Value = Value.O;

  wonBoards: BoardState[] = [];
  lostBoards: BoardState[] = [];
  tiedBoards: BoardState[] = [];

  status: GameStatus = GameStatus.Playing;

  lastPlay: Action = { row: -1, col: -1 };
  lastValue: Value = Value.E;
  moveHistory: Cell[] = [];

  visitCount: number = 0;
  winScore: number = 0;
  loseScore: number = 0;
  tieScore: number = 0;
  totalMoves: number = 0;
  id: string =
    "------------------------------------------------------------------------";
  parentNodeId: string | null = null;

  wonChildren: GameState[] = [];
  tiedChildren: GameState[] = [];
  lostChildren: GameState[] = [];

  children: GameState[] = [];
}

function createNewGameState(gameState: GameState, cell: Cell): GameState {
  const newState = new GameState();
  newState.boards = gameState.boards.map((boardState) => {
    return {
      board: cloneBoard(boardState.board),
      id: boardState.id,
      state: boardState.state,
    };
  });

  newState.activeBoard = gameState.activeBoard;
  newState.won = gameState.won;
  newState.lost = gameState.lost;
  newState.tied = gameState.tied;

  newState.me = gameState.me;
  newState.opp = gameState.opp;

  newState.wonBoards = [...gameState.wonBoards];
  newState.lostBoards = [...gameState.lostBoards];
  newState.tiedBoards = [...gameState.tiedBoards];

  newState.status = gameState.status;

  newState.lastPlay = gameState.lastPlay;
  newState.lastValue = gameState.lastValue;
  newState.moveHistory = [...gameState.moveHistory];

  gameState_updateFromPlay(newState, cell.row, cell.col, cell.value);

  newState.id = createBigBoardID(newState);
  newState.parentNodeId = gameState.id;

  if (NodeTracker[newState.id]) {
    return NodeTracker[newState.id];
  } else {
    NodeTracker[newState.id] = newState;
  }

  return newState;
}

function gameState_getBoard(gameState: GameState, id: number): BoardState {
  return gameState.boards[id];
}

function gameState_updateState(
  gameState: GameState,
  row: number,
  col: number,
  value: Value
): void {
  gameState_updateStatus(gameState);
  gameState.lastPlay = { row, col };
  gameState.lastValue = value;
  gameState.moveHistory.push({ row, col, value });
  gameState.totalMoves++;
}

function gameState_updateFromPlay(
  gameState: GameState,
  row: number,
  col: number,
  value: Value
): void {
  const boardId = getBoardFromPlay(row, col);
  const offSetAction = offSetToSmallBoard(row, col);

  gameState_updateBoard(
    gameState,
    boardId,
    offSetAction.row,
    offSetAction.col,
    value
  );
  gameState.activeBoard = getNextBoardFromPlay(row, col);
  gameState.id = createBigBoardID(gameState);
}

function gameState_updateBoard(
  gameState: GameState,
  boardId: number,
  row: number,
  col: number,
  value: Value
): void {
  const boardState = gameState.boards[boardId];

  boardState.board = updateBoard(boardState.board, { row, col, value });

  if (boardState.state === "Clean") {
    boardState.state = "Playing";
  } else if (boardState.state === "Playing") {
    if (isBoardWon(boardState.board, gameState.me)) {
      boardState.state = "Won";
      gameState.won++;
      gameState.wonBoards.push(boardState);
    } else if (isBoardWon(boardState.board, gameState.opp)) {
      boardState.state = "Lost";
      gameState.lost++;
      gameState.lostBoards.push(boardState);
    } else if (isBoardTied(boardState.board)) {
      boardState.state = "Tie";
      gameState.tied++;
      gameState.tiedBoards.push(boardState);
    }
  }

  const big = offSetToBigBoard(row, col, boardId);
  gameState_updateState(gameState, big.row, big.col, value);
}

function gameState_updateStatus(gameState: GameState): void {
  if (
    gameState.wonBoards.length +
      gameState.lostBoards.length +
      gameState.tiedBoards.length ===
    gameState.boards.length
  ) {
    if (gameState.wonBoards.length >= gameState.lostBoards.length) {
      gameState.status = GameStatus.Won;
    } else {
      gameState.status = GameStatus.Lost;
    }
  } else {
    const board = bigBoardToSmallBoard(gameState.boards);
    if (isBoardWon(board, gameState.me)) {
      gameState.status = GameStatus.Won;
    } else if (isBoardWon(board, gameState.opp)) {
      gameState.status = GameStatus.Lost;
    }
  }
}

function gameState_getParentNode(gameState: GameState): GameState | null {
  if (!gameState.parentNodeId) {
    return null;
  } else {
    return NodeTracker[gameState.parentNodeId];
  }
}

function gameState_randomMove(gameState: GameState): Action {
  // const bestPlay = findBestMove(
  //   this.boards[this.activeBoard].board,
  //   getOpponent(this.lastValue),
  //   this.lastValue
  // );
  const moves = movesLeftBigBoard(gameState);
  // const win: Action[] = [];
  // const tie: Action[] = [];

  // for (let x = 0; x < moves.length; x++) {
  //   const move = moves[x];
  //   const newState = createNewGameState(gameState, {
  //     row: move.row,
  //     col: move.col,
  //     value: getOpponent(gameState.lastValue),
  //   });
  //   if (newState.won > gameState.won) {
  //     win.push(move);
  //   }
  //   if (newState.tied > gameState.tied) {
  //     tie.push(move);
  //   }
  // }

  // if (win.length > 0) {
  //   return win[Math.floor(Math.random() * win.length)];
  // } else if (tie.length > 0) {
  //   return tie[Math.floor(Math.random() * tie.length)];
  // } else {
  return moves[Math.floor(Math.random() * moves.length)];
  // }
}

function gameState_randomChild(gameState: GameState): GameState {
  // this.children.sort((ca, cb) => ca.lost - ca.won - (cb.lost - cb.won));
  // return this.children[0];

  // const bestPlay = findBestMove(
  //   this.boards[this.activeBoard].board,
  //   getOpponent(this.lastValue),
  //   this.lastValue
  // );
  // if (bestPlay[0]) {
  //   const found = this.children.find(
  //     (c) =>
  //       c.lastPlay.row === bestPlay[0].action.row &&
  //       c.lastPlay.col === bestPlay[0].action.col
  //   );
  //   if (found) {
  //     return found;
  //   }
  // }

  const values: string[] = [];

  if (gameState.wonChildren.length > 0) {
    values.push("won");
  } else if (gameState.tiedChildren.length > 0) {
    values.push("tied");
  } else if (gameState.lostChildren.length > 0) {
    values.push("lost");
  }

  if (values.length > 0) {
    const selectedValue = values[Math.floor(Math.random() * values.length)];

    if (selectedValue === "won") {
      return gameState.wonChildren[
        Math.floor(Math.random() * gameState.wonChildren.length)
      ];
    }

    if (selectedValue === "tied") {
      return gameState.tiedChildren[
        Math.floor(Math.random() * gameState.tiedChildren.length)
      ];
    }

    if (selectedValue === "lost") {
      return gameState.lostChildren[
        Math.floor(Math.random() * gameState.lostChildren.length)
      ];
    }
  }

  return gameState.children[
    Math.floor(Math.random() * gameState.children.length)
  ];

  // const sorted = this.children.sort((ca, cb) => cb.won - ca.won);
  // return sorted[0];
}

function gameState_selectPromisingNode(gameState: GameState): GameState {
  // console.log("gameState_selectPromisingNode");
  if (gameState.children.length === 0) {
    return gameState;
  }
  return findBestNodeWithUCB(gameState);
}

function gameState_getChildWithMaxScore(gameState: GameState): GameState {
  let max = gameState.children[0];
  let min = gameState.children[0];

  let optimal = gameState.children[0];

  for (let i = 0; i < gameState.children.length; i++) {
    if (gameState.children[i].winScore >= max.winScore) {
      max = gameState.children[i];
    }

    if (gameState.children[i].loseScore >= min.loseScore) {
      min = gameState.children[i];
    }

    if (
      gameState.children[i].winScore - gameState.children[i].loseScore >
      optimal.winScore - optimal.loseScore
    ) {
      optimal = gameState.children[i];
    }
  }

  if (!max) {
    console.error(gameState);
  }
  // return optimal;
  if (max.winScore === 0) {
    return min;
  } else {
    return max;
  }

  return max;
}

function gameState_expand(gameState: GameState): void {
  const moves = movesLeftBigBoard(gameState);
  moves.forEach((move) => {
    const childId = getIdFromPlay(
      gameState,
      move.row,
      move.col,
      getOpponent(gameState.lastValue)
    );

    if (NodeTracker[childId]) {
      gameState.children.push(NodeTracker[childId]);
    } else {
      const newGameState = createNewGameState(gameState, {
        ...move,
        value: getOpponent(gameState.lastValue),
      });

      if (newGameState.won > gameState.won) {
        gameState.wonChildren.push(newGameState);
      }
      if (newGameState.lost > gameState.lost) {
        gameState.lostChildren.push(newGameState);
      }
      if (newGameState.tied > gameState.tied) {
        gameState.tiedChildren.push(newGameState);
      }
      gameState.children.push(newGameState);
    }
  });
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
  gameState_updateBoard(gameState, boardId, move.row, move.col, me);
  const bigBoardAction = offSetToBigBoard(move.row, move.col, boardId);
  playPosition(bigBoardAction.row, bigBoardAction.col);
}

function isBoardTied(board: Board): boolean {
  return (
    boardToArray(board).indexOf(Value.E) === -1 &&
    !isBoardWon(board, Value.O) &&
    !isBoardWon(board, Value.X)
  );
}

function moveToBlock(board: Board, opp: Value): Action[] | null {
  const blockMoves: Action[] = [];
  //ROWS
  for (let c = 0; c <= 2; c++) {
    const row = c;

    if (
      board[row][0] === opp &&
      board[row][1] === opp &&
      board[row][2] === Value.E
    ) {
      blockMoves.push({ row, col: 2 });
    }

    if (
      board[row][0] === opp &&
      board[row][1] === Value.E &&
      board[row][2] === opp
    ) {
      blockMoves.push({ row, col: 1 });
    }

    if (
      board[row][0] === Value.E &&
      board[row][1] === opp &&
      board[row][2] === opp
    ) {
      blockMoves.push({ row, col: 0 });
    }

    const col = c;

    if (
      board[0][col] === opp &&
      board[1][col] === opp &&
      board[2][col] === Value.E
    ) {
      blockMoves.push({ row: 2, col });
    }

    if (
      board[0][col] === opp &&
      board[1][col] === Value.E &&
      board[2][col] === opp
    ) {
      blockMoves.push({ row: 1, col });
    }

    if (
      board[0][col] === Value.E &&
      board[1][col] === opp &&
      board[2][col] === opp
    ) {
      blockMoves.push({ row: 0, col });
    }
  }

  //COLS

  if (board[1][1] === opp) {
    if (board[0][0] === opp && board[2][2] === Value.E) {
      blockMoves.push({ row: 2, col: 2 });
    }
    if (board[2][2] === opp && board[0][0] === Value.E) {
      blockMoves.push({ row: 0, col: 0 });
    }
    if (board[0][2] === opp && board[2][0] === Value.E) {
      blockMoves.push({ row: 2, col: 0 });
    }
    if (board[2][0] === opp && board[0][2] === Value.E) {
      blockMoves.push({ row: 0, col: 2 });
    }
  }

  if (blockMoves.length > 0) {
    return blockMoves;
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
  return [
    [board[0][0], board[0][1], board[0][2]],
    [board[1][0], board[1][1], board[1][2]],
    [board[2][0], board[2][1], board[2][2]],
  ];
}

function updateBoard(board: Board, cell: Cell): Board {
  const newBoard = cloneBoard(board);
  newBoard[cell.row][cell.col] = cell.value;
  return newBoard;
}

function toCells(board: Board): Array<Cell> {
  // const row0 = board[0].map((v, i) => ({ row: 0, col: i, value: v }));
  // const row1 = board[1].map((v, i) => ({ row: 1, col: i, value: v }));
  // const row2 = board[2].map((v, i) => ({ row: 2, col: i, value: v }));
  // return row0.concat(row1).concat(row2);

  return [
    { row: 0, col: 0, value: board[0][0] },
    { row: 0, col: 1, value: board[0][1] },
    { row: 0, col: 2, value: board[0][2] },
    { row: 1, col: 0, value: board[1][0] },
    { row: 1, col: 1, value: board[1][1] },
    { row: 1, col: 2, value: board[1][2] },
    { row: 2, col: 0, value: board[2][0] },
    { row: 2, col: 1, value: board[2][1] },
    { row: 2, col: 2, value: board[2][2] },
  ];
}

function movesLeft(board: Board): Cell[] {
  const cells = toCells(board);

  const moves: Cell[] = [];
  for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
    if (cells[cellIndex].value === Value.E) {
      moves.push(cells[cellIndex]);
    }
  }
  return moves;
}

function movesLeftBigBoard(gameState: GameState): Action[] {
  const bigBoard = gameState.boards;
  const nextBoardId = gameState.activeBoard;

  if (
    bigBoard[nextBoardId].state === "Playing" ||
    bigBoard[nextBoardId].state === "Clean"
  ) {
    return [bigBoard[nextBoardId]]
      .map((boardState) =>
        movesLeft(boardState.board).map((move) =>
          offSetToBigBoard(move.row, move.col, boardState.id)
        )
      )
      .reduce((acc, sm) => [...acc, ...sm], []);
  }

  let bigBoardMovesLeft: Action[] = [];

  for (let boardIndex = 0; boardIndex < bigBoard.length; boardIndex++) {
    if (
      bigBoard[boardIndex].state === "Clean" ||
      bigBoard[boardIndex].state === "Playing"
    ) {
      const moves = movesLeft(bigBoard[boardIndex].board);
      for (let movesIndex = 0; movesIndex < moves.length; movesIndex++) {
        const move = moves[movesIndex];
        bigBoardMovesLeft.push(
          offSetToBigBoard(move.row, move.col, bigBoard[boardIndex].id)
        );
      }
    }
  }

  return bigBoardMovesLeft;
  // return bigBoard
  //   .filter(
  //     (boardState) =>
  //       boardState.state === "Clean" || boardState.state === "Playing"
  //   )
  //   .map((boardState) =>
  //     movesLeft(boardState.board).map((move) =>
  //       offSetToBigBoard(move.row, move.col, boardState.id)
  //     )
  //   )
  //   .reduce((acc, sm) => [...acc, ...sm], []);
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
  const scoredMoves: ScoredMove[] = [];

  for (let moveIndex = 0; moveIndex < moves.length; moveIndex++) {
    const move = moves[moveIndex];
    const scored: ScoredMove = {
      score: minMax(
        updateBoard(board, { row: move.row, col: move.col, value: me }),
        me,
        opp,
        opp
      ),
      action: move,
    };
    scoredMoves.push(scored);
  }

  return scoredMoves;
  // return moves.map((move) => {
  //   return {
  //     score: minMax(
  //       updateBoard(board, { row: move.row, col: move.col, value: me }),
  //       me,
  //       opp,
  //       opp
  //     ),
  //     action: move,
  //   };
  // });
}

function scoreMovesBigBoard(
  gameState: GameState,
  me: Value,
  opp: Value,
  override: number = 0
): ScoredBigMove[] {
  const availableMoves = movesLeftBigBoard(gameState);

  const wins = gameState.won;
  const loss = gameState.lost;
  const tie = gameState.tied;

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
      override
    );

    const scoredBigMove: ScoredBigMove = {
      action: { row: move.row, col: move.col },
      outcome: "Undetermined",
    };

    if (
      minMaxResult.o === "W" &&
      !minMaxResult.r.some((result) => result.o === "L")
    ) {
      scoredBigMove.outcome = "Win";
    } else if (
      minMaxResult.r.some((result) => result.o === "L") &&
      minMaxResult.o === "W"
    ) {
      scoredBigMove.outcome = "WinLose";
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
      break;
    }
    case "Tie": {
      return Value.T;
      break;
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
      const score = optimizedHash[boardKey][0];
      moveScore = parseInt(score, 10);
    } else {
      moveScore = minMax(updatedBoard, me, opp, getOpponent(current));
      optimizedHash[boardKey] = [moveScore, ma.row, ma.col];
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

function createIdFromMove(id: string, move: Cell): string {
  const moveIndex = move.col + move.row * 9;
  const split = id.split("");
  split[moveIndex] = move.value;
  return split.join("");
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
  const newGameState = createNewGameState(gameState, {
    row: move.row,
    col: move.col,
    value: current,
  });

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

function fullDepth(gameState: GameState, move: Action, current: Value): number {
  const newGameState = createNewGameState(gameState, {
    row: move.row,
    col: move.col,
    value: current,
  });
  const board = bigBoardToSmallBoard(gameState.boards);

  if (isBoardWon(board, gameState.me)) {
    return 1;
  }

  if (isBoardWon(board, gameState.opp)) {
    return -1;
  }

  if (isBoardTied(board)) {
    return 0;
  }

  const nextMove = movesLeftBigBoard(newGameState)[0];
  if (!nextMove) {
    return 5;
  }
  return fullDepth(newGameState, nextMove, getOpponent(current));
}

function createBigBoardID(gameState: GameState): string {
  return gameState.boards
    .map((boardState) => boardToString(boardState.board))
    .join("");
}

function willMoveLose(loseMoves: ScoredBigMove[], move: Action): boolean {
  for (
    let loseMoveIndex = 0;
    loseMoveIndex < loseMoves.length;
    loseMoveIndex++
  ) {
    const loseM = loseMoves[loseMoveIndex];

    if (loseM.action.row === move.row && loseM.action.col === move.col) {
      return true;
    }
  }
  return false;
}

function minMaxStrat(gameState: GameState, moveCount: number): void {
  const me = Value.X;
  const opp = Value.O;

  // Update Board From Move
  const nextBoardToPlay = gameState.activeBoard;

  const bigBoardScoredMoves = scoreMovesBigBoard(gameState, me, opp);

  const loseMove = bigBoardScoredMoves.filter(
    (bestMove) => bestMove.outcome === "Lose"
  );
  const winMove = bigBoardScoredMoves.filter(
    (bestMove) => bestMove.outcome === "Win"
  );
  const winLoseMove = bigBoardScoredMoves.filter(
    (bestMove) => bestMove.outcome === "WinLose"
  );

  const amIWinning = gameState.won < gameState.lost;

  if (winMove.length && !amIWinning) {
    gameState_updateFromPlay(
      gameState,
      winMove[0].action.row,
      winMove[0].action.col,
      me
    );
    playPosition(winMove[0].action.row, winMove[0].action.col);
  } else if (winLoseMove.length > 0) {
    gameState_updateFromPlay(
      gameState,
      winLoseMove[0].action.row,
      winLoseMove[0].action.col,
      me
    );
    playPosition(winLoseMove[0].action.row, winLoseMove[0].action.col);
  } else {
    let nextBoardState = gameState_getBoard(gameState, nextBoardToPlay);
    if (
      nextBoardState.state === "Lost" ||
      nextBoardState.state === "Tie" ||
      nextBoardState.state === "Won"
    ) {
      const bigAsSmall = createSmallBoardFromBigBoard(gameState, me);
      const bestMoves = findBestMove(bigAsSmall, me, opp).sort(
        (a, b) => b.score - a.score
      );

      let boards: number[] = [];

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
              l.action.row === availMove.row && l.action.col === availMove.col
          );
        });

      if (availableMoves[0]) {
        move = availableMoves[0];
      }
      gameState_updateFromPlay(gameState, move.row, move.col, me);
      // const bigBoardAction = offSetToBigBoard(move.row, move.col, boardId);
      playPosition(move.row, move.col);
    } else {
      const blockMoves = moveToBlock(board, opp);

      const won = gameState.won;
      const lost = gameState.lost;

      // TODO: Last chnge
      if (blockMoves) {
        let blockMove: Action = blockMoves[0];
        let willBlockMoveLose: boolean = false;

        const bBlock = offSetToBigBoard(
          blockMoves[0].row,
          blockMoves[0].col,
          boardId
        );
        for (
          let loseMoveIndex = 0;
          loseMoveIndex < loseMove.length;
          loseMoveIndex++
        ) {
          const loseM = loseMove[loseMoveIndex];

          if (
            loseM.action.row === bBlock.row &&
            loseM.action.col === bBlock.col
          ) {
            willBlockMoveLose = true;
            break;
          }
        }

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
          } else if (blockMoves[1]) {
            playMove(gameState, boardId, blockMoves[1], me, opp);
          } else {
            playMove(gameState, boardId, blockMoves[0], me, opp);
          }
        } else {
          // Block move wont lose
          playMove(gameState, boardId, blockMoves[0], me, opp);
        }
      } else {
        // debugMessage("here");
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

        gameState_updateBoard(
          gameState,
          boardId,
          nextMove.row,
          nextMove.col,
          me
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

let debug = false;
const WIN_SCORE: number = 10;
const LOSE_SCORE: number = 10;

function backPropogation(nodeToExplore: GameState, debug: boolean = false) {
  const endNode = nodeToExplore;

  // console.log(endNode.status);
  // console.log(endNode.parentNodeId);

  let tempNode: GameState | null = nodeToExplore;
  while (tempNode != null) {
    // console.log(tempNode.id);
    tempNode.visitCount++;
    // TODO: MAYBE NOT PLAYING NOT LOST
    if (endNode.status === GameStatus.Won) {
      tempNode.winScore += WIN_SCORE;
    }

    if (endNode.status === GameStatus.Tie) {
      tempNode.tieScore += 10;
    }

    if (endNode.status === GameStatus.Lost) {
      tempNode.loseScore += LOSE_SCORE;
    }

    if (!tempNode.parentNodeId) {
      tempNode = null;
    } else {
      tempNode = NodeTracker[tempNode.parentNodeId];
    }
  }
}

function simulateRandomPlayout(node: GameState): GameState {
  let boardStatus = node.status;
  let board = node;
  if (boardStatus == GameStatus.Lost || GameStatus.Tie) {
    if (board.parentNodeId) {
      NodeTracker[board.parentNodeId].winScore = Number.MIN_VALUE;
      board.winScore = 0;
    }
    return board;
  }
  let count = 0;
  while (boardStatus == GameStatus.Playing) {
    count++;
    const move = gameState_randomMove(board);

    const newBoard = createNewGameState(board, {
      ...move,
      value: getOpponent(board.lastValue),
    });
    boardStatus = newBoard.status;
    board = newBoard;
  }
  return board;
}

// Montecarlo
function findBestNodeWithUCB(node: GameState): GameState {
  // console.log("findBestNodeWithUCB");

  let parentVisitCt = node.visitCount;
  let childUCB: number[] = [];
  node.children.forEach((child) => {
    childUCB.push(ucbValue(parentVisitCt, child.winScore, child.visitCount));
  });
  const max: number = Math.max(...childUCB);
  const idx = childUCB.indexOf(max);
  // const { visitCount, winScore } = node.children[0];
  // console.log({
  //   visitCount,
  //   winScore,
  //   parentVisitCt,
  // });
  // console.log("result", ucbValue(0, 0, 1));
  return node.children[idx];
}

function ucbValue(totalVisit: number, nodeWinScore: number, nodeVisit: number) {
  if (nodeVisit === 0) {
    return Number.MAX_SAFE_INTEGER;
  }
  return (
    nodeWinScore / nodeVisit +
    1.41 * Math.sqrt(Math.log(totalVisit) / nodeVisit)
  );
}

const nodeVisitCount = {
  won: 0,
  lost: 0,
  tied: 0,
};

function monteCarloFindBestMove(gameState: GameState, time: number): Action {
  const startTime = Date.now();
  let count = 0;
  while (Date.now() - startTime < time) {
    count++;
    const promissingNode = gameState_selectPromisingNode(gameState);

    if (!promissingNode) {
      console.error("!promissingNode");
      console.error(gameState);
    }

    if (promissingNode.status === GameStatus.Playing) {
      gameState_expand(promissingNode);
    }

    let nodeToExplore = promissingNode;
    if (promissingNode.children.length > 0) {
      nodeToExplore = gameState_randomChild(promissingNode);
    }

    // if (count === 10) {
    //   debug = true;
    // } else {
    //   debug = false;
    // }
    const resultGameStateNode = simulateRandomPlayout(nodeToExplore);
    if (resultGameStateNode.status === GameStatus.Won) {
      nodeVisitCount.won += 1;
    }
    if (resultGameStateNode.status === GameStatus.Lost) {
      nodeVisitCount.lost += 1;
    }

    // if (count === 10) {
    //   console.log(resultGameStateNode.parentNodeId);
    //   console.log(resultGameStateNode.moveHistory);
    // }

    backPropogation(resultGameStateNode, debug);
  }
  // console.log(nodeVisitCount);
  // console.log(
  //   gameState.children.map((c) => {
  //     return {
  //       win: c.winScore,
  //       lose: c.loseScore,
  //       move: c.lastPlay,
  //     };
  //   })
  // );
  return gameState_getChildWithMaxScore(gameState).lastPlay;
}

function monteCarloStrat(
  gameState: GameState,
  moveCount: number,
  time: number
): Action {
  const bestMove = monteCarloFindBestMove(gameState, time);
  return bestMove;
}

const optimizedHash: { [key: string]: any[] } = {};
const NodeTracker: { [key: string]: GameState } = {};

function gameLoop(id: string) {
  let currentGameState: GameState = NodeTracker[id];
  let moveCount = 0;
  // game loop

  const me = Value.X;
  const opp = Value.O;
  while (true) {
    moveCount++;
    var inputs = readline().split(" ");
    const opponentRow = parseInt(inputs[0]);
    const opponentCol = parseInt(inputs[1]);
    const validActionCount = parseInt(readline());

    for (let i = 0; i < validActionCount; i++) {
      const i = readline();
      // const row = parseInt(inputs[0]);
      // const col = parseInt(inputs[1]);
    }

    if (opponentRow === -1 && opponentCol === -1) {
      const firstMoveState = createNewGameState(currentGameState, {
        row: 0,
        col: 0,
        value: Value.X,
      });

      currentGameState.children.push(firstMoveState);
      monteCarloFindBestMove(currentGameState, 900);
      currentGameState = firstMoveState;
      playPosition(0, 0);
    } else {
      let newId = getIdFromPlay(
        currentGameState,
        opponentRow,
        opponentCol,
        Value.O
      );
      if (NodeTracker[newId]) {
        currentGameState = NodeTracker[newId];
      } else {
        currentGameState = createNewGameState(currentGameState, {
          row: opponentRow,
          col: opponentCol,
          value: Value.O,
        });
      }

      const move = monteCarloStrat(currentGameState, moveCount, 65);
      newId = getIdFromPlay(currentGameState, move.row, move.col, Value.X);
      if (NodeTracker[newId]) {
        currentGameState = NodeTracker[newId];
      } else {
        currentGameState = createNewGameState(currentGameState, {
          row: opponentRow,
          col: opponentCol,
          value: Value.X,
        });
      }
      playPosition(move.row, move.col);
    }
  }
}
const initial_gameState = new GameState();
initial_gameState.visitCount = 1;
NodeTracker[initial_gameState.id] = initial_gameState;
// firstPlayGameState.generateId();
// // // let log = true;
gameLoop(initial_gameState.id);

// const initial_state: GameState = {
//   boards: [
//     {
//       id: 0,
//       board: [
//         [Value.X, Value.O, Value.E],
//         [Value.E, Value.E, Value.E],
//         [Value.E, Value.E, Value.E],
//       ],
//       state: "Playing",
//     },
//     {
//       id: 1,
//       board: [
//         [Value.E, Value.E, Value.E],
//         [Value.E, Value.E, Value.E],
//         [Value.E, Value.E, Value.E],
//       ],
//       state: "Clean",
//     },
//     {
//       id: 2,
//       board: [
//         [Value.E, Value.E, Value.E],
//         [Value.E, Value.E, Value.E],
//         [Value.E, Value.E, Value.E],
//       ],
//       state: "Clean",
//     },
//     {
//       id: 3,
//       board: [
//         [Value.E, Value.E, Value.E],
//         [Value.E, Value.E, Value.E],
//         [Value.E, Value.E, Value.E],
//       ],
//       state: "Clean",
//     },
//     {
//       id: 4,
//       board: [
//         [Value.E, Value.E, Value.E],
//         [Value.E, Value.E, Value.E],
//         [Value.E, Value.E, Value.E],
//       ],
//       state: "Clean",
//     },
//     {
//       id: 5,
//       board: [
//         [Value.E, Value.E, Value.E],
//         [Value.E, Value.E, Value.E],
//         [Value.E, Value.E, Value.E],
//       ],
//       state: "Clean",
//     },
//     {
//       id: 6,
//       board: [
//         [Value.E, Value.E, Value.E],
//         [Value.E, Value.E, Value.E],
//         [Value.E, Value.E, Value.E],
//       ],
//       state: "Clean",
//     },
//     {
//       id: 7,
//       board: [
//         [Value.E, Value.E, Value.E],
//         [Value.E, Value.E, Value.E],
//         [Value.E, Value.E, Value.E],
//       ],
//       state: "Clean",
//     },
//     {
//       id: 8,
//       board: [
//         [Value.E, Value.E, Value.E],
//         [Value.E, Value.E, Value.E],
//         [Value.E, Value.E, Value.E],
//       ],
//       state: "Clean",
//     },
//   ],
//   activeBoard: 1,
//   won: 0,
//   lost: 0,
//   tied: 0,
//   me: Value.X,
//   opp: Value.O,
//   wonBoards: [],
//   lostBoards: [],
//   tiedBoards: [],
//   status: -1,
//   lastPlay: { row: 0, col: 1 },
//   lastValue: Value.O,
//   moveHistory: [
//     { row: 0, col: 0, value: Value.X },
//     { row: 0, col: 1, value: Value.O },
//   ],
//   visitCount: 1,
//   winScore: 0,
//   loseScore: 0,
//   tieScore: 0,
//   totalMoves: 2,
//   id: "XO-------------------------------------------------------------------------------",
//   parentNodeId: null,
//   wonChildren: [],
//   tiedChildren: [],
//   lostChildren: [],
//   children: [],
// };

// gameState_expand(initial_state);
// // console.log(
// //   initial_state.children.map((c) => {
// //     return {
// //       id: c.id,
// //       parentId: c.parentNodeId,
// //     };
// //   })
// // );
// const move = monteCarloFindBestMove(initial_state, 100);
// console.log(move);

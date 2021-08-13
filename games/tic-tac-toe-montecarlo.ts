enum Value {
  E = "-",
  X = "X",
  O = "O",
  T = "T",
}

enum BoardState {
  IN_PROGRESS = -1,
  DRAW = 0,
  Me = 1,
  Opp = 2,
}

declare function readline(): string;

interface Position {
  row: number;
  col: number;
}

interface PositionValue extends Position {
  value: Value;
}

interface SmallBoardValue extends Position {
  value: Value;
}

type SmallBoard = Value[][];

function debugMessage(value: any): void {
  console.error(value);
}

function availableMoves(board: Value[]): Position[] {
  const moves: Position[] = [];

  for (let i = 0; i < board.length; i++) {
    if (board[i] === Value.E) {
      moves.push(indexToPosition(i));
    }
  }

  return moves;
}

function indexToPosition(index: number): Position {
  const row = Math.floor(index / 9);
  return {
    row,
    col: index - row * 9,
  };
}

function updateBoard(
  board: Value[],
  row: number,
  col: number,
  value: Value
): Value[] {
  const updatedBoard = [...board];
  const index = col + row * 9;
  updatedBoard[index] = value;
  return updatedBoard;
}

function findBestNodeWithUCB(node: State): State {
  let parentVisitCt = node.visitCount;
  let childUCB: number[] = [];
  node.children.forEach((child) => {
    childUCB.push(ucbValue(parentVisitCt, child.winScore, child.visitCount));
  });
  const max: number = Math.max(...childUCB);
  const idx = childUCB.indexOf(max);
  return node.children[idx];
}

function ucbValue(totalVisit: number, nodeWinScore: number, nodeVisit: number) {
  if (nodeVisit === 0) {
    return Number.MAX_SAFE_INTEGER;
  } else {
    return (
      nodeWinScore / nodeVisit +
      1.41 * Math.sqrt(Math.log(totalVisit) / nodeVisit)
    );
  }
}

function gameState_selectPromisingNode(state: State): State {
  if (state.children.length === 0) {
    return state;
  }
  return findBestNodeWithUCB(state);
}

function getOpponent(player: Value): Value {
  if (player === Value.O) {
    return Value.X;
  }
  return Value.O;
}

function gameState_expand(state: State): void {
  const moves = availableMoves(state.board);
  moves.forEach((move) => {
    const newState = new State(state, {
      row: move.row,
      col: move.col,
      value: getOpponent(state.lastMove.value),
    });
    state.children.push(newState);
  });
}

function checkStatus(board: Value[]): BoardState {
  const won = isBoardWon(board, Value.X);
  const lost = isBoardWon(board, Value.O);
  const tied = board.every(
    (value) => value === Value.X || value === Value.O || value === Value.T
  );

  if (won) {
    return BoardState.Me;
  } else if (lost) {
    return BoardState.Opp;
  } else if (tied) {
    return BoardState.DRAW;
  } else {
    return BoardState.IN_PROGRESS;
  }
}

function randomChild(state: State): State {
  return state.children[Math.floor(Math.random() * state.children.length)];
}

function randomMove(state: State): Position {
  const moves = availableMoves(state.board);
  return moves[Math.floor(Math.random() * moves.length)];
}

function simulateRandomPlayout(state: State) {
  let tempNode = cloneState(state);
  let boardStatus = checkStatus(tempNode.board);

  if (boardStatus === BoardState.Opp) {
    tempNode.parent!.winScore = Number.MIN_SAFE_INTEGER;
    return boardStatus;
  }
  while (boardStatus === -1) {
    const nextMove = randomMove(tempNode);
    tempNode = new State(tempNode, {
      row: nextMove.row,
      col: nextMove.col,
      value: getOpponent(tempNode.lastMove.value),
    });
    boardStatus = checkStatus(tempNode.board);
  }
  return boardStatus;
}

function backPropogation(nodeToExplore: State, playerNo: BoardState) {
  let tempNode = nodeToExplore;
  while (tempNode !== undefined) {
    tempNode.visitCount++;
    if (tempNode.playerNo === playerNo) {
      tempNode.state.addScore(1);
    }
    tempNode = tempNode.parent;
  }
}

function monteCarloFindBestMove(state: State, time: number): Action {
  const startTime = Date.now();

  while (Date.now() - startTime < time) {
    const promissingNode = gameState_selectPromisingNode(state);

    if (checkStatus(state.board) === BoardState.IN_PROGRESS) {
      gameState_expand(promissingNode);
    }

    let nodeToExplore = promissingNode;
    if (promissingNode.children.length > 0) {
      nodeToExplore = randomChild(promissingNode);
    }
    const resultGameStateNode = simulateRandomPlayout(nodeToExplore);

    backPropogation(resultGameStateNode, debug);
  }

  return gameState_getChildWithMaxScore(state).lastPlay;
}

function isBoardWon(board: Value[], player: Value): boolean {
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

  return boardWonIndexes.some(
    (winningBoard) =>
      board[winningBoard[0]] === player &&
      board[winningBoard[1]] === player &&
      board[winningBoard[2]] === player
  );
}

function cloneState(state: State): State {
  return {
    board: [...state.board],
    me: state.me,
    opp: state.opp,
    lastMove: {
      row: state.lastMove.row,
      col: state.lastMove.col,
      value: state.lastMove.value,
    },
    visitCount: 0,
    winScore: 0,
    children: [],
    parent: null,
    playerNo: state.playerNo,
  };
}

class State {
  board: Value[] = [];
  me: Value = Value.O;
  opp: Value = Value.X;
  lastMove: SmallBoardValue = { row: -1, col: -1, value: Value.X };
  visitCount: number = 0;
  winScore: number = 0;
  parent: State | null = null;
  children: State[] = [];
  playerNo: BoardState = BoardState.IN_PROGRESS;

  constructor(parentState?: State, value?: SmallBoardValue) {
    if (parentState && value) {
      this.board = updateBoard(
        parentState.board,
        value.row,
        value.col,
        value.value
      );
      this.me = parentState.me;
      this.opp = parentState.opp;
      this.lastMove = { row: value.row, col: value.col, value: value.value };
      this.parent = parentState;
      this.playerNo = checkStatus(this.board);
    }
  }
}

class Game extends State {
  turnCount: number = 0;
  boardIndexes: number[] = [0, 3, 6, 27, 30, 33, 54, 57, 60];

  playPosition(row: number, col: number): void {
    this.board = updateBoard(this.board, row, col, this.me);
    console.log(`${row} ${col}`);
  }

  updateOpponentPlay(row: number, col: number): void {
    this.board = updateBoard(this.board, row, col, this.opp);
  }

  stateToBoard(values: Value[]): SmallBoard {
    return [
      [values[0], values[1], values[2]],
      [values[3], values[4], values[5]],
      [values[6], values[7], values[8]],
    ];
  }

  loop() {
    while (true) {
      // BEGIN - READ INPUTS
      var inputs = readline().split(" ");
      const opponentRow = parseInt(inputs[0]);
      const opponentCol = parseInt(inputs[1]);
      const validActionCount = parseInt(readline());

      for (let i = 0; i < validActionCount; i++) {
        const i = readline();
        // const row = parseInt(inputs[0]);
        // const col = parseInt(inputs[1]);
      }
      // END - READ INPUTS

      const start: number = new Date().getTime();

      if (opponentRow === -1 && opponentCol === -1) {
        this.updateValuesIfIamFirst();
        this.playPosition(0, 0);
      } else {
        this.updateOpponentPlay(opponentRow, opponentCol);
        this.playPosition(move.row, move.col);
      }
    }
  }

  // Flip my and opponent value
  updateValuesIfIamFirst(): void {
    this.me = Value.X;
    this.opp = Value.O;
  }

  constructor(boardCount: number = 1) {
    super();
    for (let x = 0; x < boardCount; x++) {
      for (let x = 0; x < 9; x++) {
        this.board.push(Value.E);
      }
    }
  }
}

const game = new Game();
game.loop();

function gameLoop() {
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
    const start: number = new Date().getTime();

    if (opponentRow === -1 && opponentCol === -1) {
      const firstMoveState = createNewGameState(currentGameState, {
        row: 0,
        col: 0,
        value: Value.X,
      });
      firstMoveState.visitCount = 1;
      // debugMessage("here");

      currentGameState.children.push(firstMoveState);
      monteCarloFindBestMove(currentGameState, 900);
      currentGameState = firstMoveState;
      playPosition(0, 0);
    } else {
      console.error({ begin: new Date().getTime() - start });
      let newId = getIdFromPlay(
        currentGameState,
        opponentRow,
        opponentCol,
        Value.O
      );
      console.error({ id: new Date().getTime() - start });

      if (NodeTracker[newId]) {
        currentGameState = NodeTracker[newId];
        console.error({ reference: new Date().getTime() - start });
      } else {
        currentGameState = createNewGameState(currentGameState, {
          row: opponentRow,
          col: opponentCol,
          value: Value.O,
        });
        console.error({ create: new Date().getTime() - start });
      }
      // if (moveCount === 2 && opponentRow === 0 && opponentCol === 2) {
      //   const { children, ...state } = currentGameState;
      //   debugMessage(state);
      // }
      currentGameState.parentNodeId = null;
      currentGameState.visitCount = 1;
      const elapsed: number = new Date().getTime() - start;
      console.error({ elapsed });
      const move = monteCarloStrat(
        currentGameState,
        moveCount,
        90 - (new Date().getTime() - start)
      );
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
//added comments

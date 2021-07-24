declare function readline(): string;

function gameLoop() {
  // game loop
  while (true) {
    var inputs = readline().split(" ");
    const opponentRow = parseInt(inputs[0]);
    const opponentCol = parseInt(inputs[1]);
    const validActionCount = parseInt(readline());
    for (let i = 0; i < validActionCount; i++) {
      var inputs = readline().split(" ");
      const row = parseInt(inputs[0]);
      const col = parseInt(inputs[1]);
    }

    playPosition(0, 0);
  }
}

function playPosition(row: string, col: string): void {
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
  firstTurn: boolean = true;
  validActionCount: number = 9;
  validActions: Action[] = [];
  me:Move,
  opp:Move,
  board: Board = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];

  constructor(id: number, me: Move, opp:Move) {
    this.id = id;
    this.me = me;
    this.opp = opp;
  }
}

function cloneBoard(board: Board): Board {
  return [[...board[0]], [...board[1]], [...board[2]]];
}

function updateBoard(board: Board, cell: Cell, move: Move): Board {
  const newBoard = cloneBoard(board);
  newBoard[cell.row][cell.col] = move;
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

function findBestMove(board: Board, depth: number, isMax: boolean);

//https://www.geeksforgeeks.org/minimax-algorithm-in-game-theory-set-2-evaluation-function/
//https://www.geeksforgeeks.org/minimax-algorithm-in-game-theory-set-3-tic-tac-toe-ai-finding-optimal-move/

// ORDER is ROW | COL

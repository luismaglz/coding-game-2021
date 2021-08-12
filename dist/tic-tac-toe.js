"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var Value;
(function (Value) {
    Value["E"] = "-";
    Value["X"] = "X";
    Value["O"] = "O";
    Value["T"] = "T";
})(Value || (Value = {}));
var emptyBoard = [
    [Value.E, Value.E, Value.E],
    [Value.E, Value.E, Value.E],
    [Value.E, Value.E, Value.E],
];
var possibleMoves = [
    { row: 0, col: 0 },
    { row: 0, col: 2 },
    { row: 2, col: 0 },
    { row: 2, col: 2 },
    { row: 1, col: 1 },
];
var GameStatus;
(function (GameStatus) {
    GameStatus[GameStatus["Playing"] = -1] = "Playing";
    GameStatus[GameStatus["Tie"] = 0] = "Tie";
    GameStatus[GameStatus["Won"] = 1] = "Won";
    GameStatus[GameStatus["Lost"] = 2] = "Lost";
})(GameStatus || (GameStatus = {}));
var GameState = /** @class */ (function () {
    function GameState(state) {
        this.state = state;
        this.boards = [
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
        this.activeBoard = 0;
        this.won = 0;
        this.lost = 0;
        this.tied = 0;
        this.me = Value.X;
        this.opp = Value.O;
        this.wonBoards = [];
        this.lostBoards = [];
        this.tiedBoards = [];
        this.status = GameStatus.Playing;
        this.lastPlay = { row: -1, col: -1 };
        this.lastValue = Value.X;
        if (state) {
            this.boards = state.boards.map(function (boardState) {
                return __assign({}, boardState, { board: cloneBoard(boardState.board) });
            });
            this.activeBoard = state.activeBoard;
        }
    }
    GameState.prototype.getBoard = function (id) {
        return this.boards[id];
    };
    GameState.prototype.updateFromPlay = function (row, col, value) {
        var boardId = getBoardFromPlay(row, col);
        var offSetAction = offSetToSmallBoard(row, col);
        this.updateBoard(boardId, offSetAction.row, offSetAction.col, value);
        this.activeBoard = getNextBoardFromPlay(row, col);
        this.updateStatus();
        this.lastPlay = { row: row, col: col };
        this.lastValue = value;
    };
    GameState.prototype.updateBoard = function (boardId, row, col, value) {
        var boardState = this.boards[boardId];
        boardState.board = updateBoard(boardState.board, { row: row, col: col, value: value });
        if (boardState.state === "Clean") {
            boardState.state = "Playing";
        }
        else if (boardState.state === "Playing") {
            if (isBoardWon(boardState.board, this.me)) {
                boardState.state = "Won";
                this.won++;
                this.wonBoards.push(boardState);
            }
            else if (isBoardWon(boardState.board, this.opp)) {
                boardState.state = "Lost";
                this.lost++;
                this.lostBoards.push(boardState);
            }
            else if (isBoardTied(boardState.board)) {
                boardState.state = "Tie";
                this.tied++;
                this.tiedBoards.push(boardState);
            }
        }
    };
    GameState.prototype.getId = function () {
        return createBigBoardID(this.boards);
    };
    GameState.prototype.updateStatus = function () {
        if (this.wonBoards.length +
            this.lostBoards.length +
            this.tiedBoards.length ===
            this.boards.length) {
            if (this.wonBoards.length >= this.lostBoards.length) {
                this.status = GameStatus.Won;
            }
            else {
                this.status = GameStatus.Lost;
            }
        }
        else {
            var board = bigBoardToSmallBoard(this.boards);
            if (isBoardWon(board, this.me)) {
                this.status = GameStatus.Won;
            }
            else if (isBoardWon(board, this.opp)) {
                this.status = GameStatus.Lost;
            }
        }
    };
    GameState.prototype.movesLeft = function () {
        return movesLeftBigBoard(this);
    };
    return GameState;
}());
function getBoardFromPlay(row, col) {
    if (row <= 2) {
        if (col <= 2) {
            return 0;
        }
        else if (col <= 5) {
            return 1;
        }
        else {
            return 2;
        }
    }
    else if (row <= 5) {
        if (col <= 2) {
            return 3;
        }
        else if (col <= 5) {
            return 4;
        }
        else {
            return 5;
        }
    }
    else {
        if (col <= 2) {
            return 6;
        }
        else if (col <= 5) {
            return 7;
        }
        else {
            return 8;
        }
    }
}
function getNextBoardFromPlay(row, col) {
    var play = offSetToSmallBoard(row, col);
    return getNextBoardFromAction(play.row, play.col);
}
function getNextBoardFromAction(row, col) {
    if (row === 0) {
        return col;
    }
    else if (row === 1) {
        return col + 3;
    }
    else {
        return col + 6;
    }
}
function offSetToBigBoard(row, col, boardId) {
    var tRow = 0;
    var tCol = 0;
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
function offSetToSmallBoard(row, col) {
    var tRow = 0;
    var tCol = 0;
    if (row <= 2) {
        if (col <= 2) {
            // Remain
        }
        else if (col <= 5) {
            tCol = 3;
        }
        else {
            tCol = 6;
        }
    }
    else if (row <= 5) {
        if (col <= 2) {
            tRow = 3;
        }
        else if (col <= 5) {
            tRow = 3;
            tCol = 3;
        }
        else {
            tRow = 3;
            tCol = 6;
        }
    }
    else {
        if (col <= 2) {
            tRow = 6;
        }
        else if (col <= 5) {
            tRow = 6;
            tCol = 3;
        }
        else {
            tRow = 6;
            tCol = 6;
        }
    }
    return {
        col: col - tCol,
        row: row - tRow,
    };
}
function createSmallBoardFromBigBoard(gameState, me) {
    var opp = getOpponent(me);
    var values = gameState.boards.map(function (gameState) {
        if (gameState.state === "Won") {
            return me;
        }
        else if (gameState.state === "Lost" || gameState.state === "Tie") {
            return opp;
        }
        else {
            return Value.E;
        }
    });
    var board = [
        [values[0], values[1], values[2]],
        [values[3], values[4], values[5]],
        [values[6], values[7], values[8]],
    ];
    return board;
}
function isBoardPlayable(state) {
    return state === "Playing" || state === "Clean";
}
function canIBeBlocked(board, me) {
    return movesLeft(board)
        .map(function (move) { return updateBoard(board, __assign({}, move, { value: me })); })
        .some(function (board) { return isBoardWon(board, me); });
}
function playMove(gameState, boardId, move, me, opp) {
    gameState.updateBoard(boardId, move.row, move.col, me);
    var bigBoardAction = offSetToBigBoard(move.row, move.col, boardId);
    playPosition(bigBoardAction.row, bigBoardAction.col);
}
function isBoardTied(board) {
    return (boardToArray(board).indexOf(Value.E) === -1 &&
        !isBoardWon(board, Value.O) &&
        !isBoardWon(board, Value.X));
}
function moveToBlock(board, opp) {
    var blockMoves = [];
    //ROWS
    for (var c = 0; c <= 2; c++) {
        var row = c;
        if (board[row][0] === opp &&
            board[row][1] === opp &&
            board[row][2] === Value.E) {
            blockMoves.push({ row: row, col: 2 });
        }
        if (board[row][0] === opp &&
            board[row][1] === Value.E &&
            board[row][2] === opp) {
            blockMoves.push({ row: row, col: 1 });
        }
        if (board[row][0] === Value.E &&
            board[row][1] === opp &&
            board[row][2] === opp) {
            blockMoves.push({ row: row, col: 0 });
        }
        var col = c;
        if (board[0][col] === opp &&
            board[1][col] === opp &&
            board[2][col] === Value.E) {
            blockMoves.push({ row: 2, col: col });
        }
        if (board[0][col] === opp &&
            board[1][col] === Value.E &&
            board[2][col] === opp) {
            blockMoves.push({ row: 1, col: col });
        }
        if (board[0][col] === Value.E &&
            board[1][col] === opp &&
            board[2][col] === opp) {
            blockMoves.push({ row: 0, col: col });
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
function playPosition(row, col) {
    console.log(row + " " + col);
}
function debugMessage(value) {
    console.error(JSON.stringify(value));
}
function boardToArray(board) {
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
function boardToString(board) {
    return boardToArray(board).join("");
}
function boardToKey(board) {
    return parseInt(boardToArray(board).join(""));
}
function toAction(ac) {
    return {
        row: parseInt(ac[0], 10),
        col: parseInt(ac[1], 10),
    };
}
function cloneBoard(board) {
    return [
        [board[0][0], board[0][1], board[0][2]],
        [board[1][0], board[1][1], board[1][2]],
        [board[2][0], board[2][1], board[2][2]],
    ];
}
function updateBoard(board, cell) {
    var newBoard = cloneBoard(board);
    newBoard[cell.row][cell.col] = cell.value;
    return newBoard;
}
function toCells(board) {
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
function movesLeft(board) {
    var cells = toCells(board);
    var moves = [];
    for (var cellIndex = 0; cellIndex < cells.length; cellIndex++) {
        if (cells[cellIndex].value === Value.E) {
            moves.push(cells[cellIndex]);
        }
    }
    return moves;
}
function movesLeftBigBoard(gameState) {
    var bigBoard = gameState.boards;
    var nextBoardId = gameState.activeBoard;
    if (bigBoard[nextBoardId].state === "Playing" ||
        bigBoard[nextBoardId].state === "Clean") {
        return [bigBoard[nextBoardId]]
            .map(function (boardState) {
            return movesLeft(boardState.board).map(function (move) {
                return offSetToBigBoard(move.row, move.col, boardState.id);
            });
        })
            .reduce(function (acc, sm) { return acc.concat(sm); }, []);
    }
    var bigBoardMovesLeft = [];
    for (var boardIndex = 0; boardIndex < bigBoard.length; boardIndex++) {
        var moves = movesLeft(bigBoard[boardIndex].board);
        for (var movesIndex = 0; movesIndex < moves.length; movesIndex++) {
            var move = moves[movesIndex];
            bigBoardMovesLeft.push(offSetToBigBoard(move.row, move.col, bigBoard[boardIndex].id));
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
function isBoardWon(board, player) {
    var boardWonIndexes = [
        [0, 4, 8],
        [2, 4, 6],
        [0, 1, 2],
        [2, 5, 8],
        [6, 7, 8],
        [0, 3, 6],
        [3, 4, 5],
        [1, 4, 7],
    ];
    var arrayBoard = boardToArray(board);
    return boardWonIndexes.some(function (winningBoard) {
        return arrayBoard[winningBoard[0]] === player &&
            arrayBoard[winningBoard[1]] === player &&
            arrayBoard[winningBoard[2]] === player;
    });
}
function getOpponent(player) {
    if (player === Value.O) {
        return Value.X;
    }
    return Value.O;
}
// ORDER is ROW | COL
function findBestMove(board, me, opp) {
    var moves = movesLeft(board);
    return scoreMoves(board, me, opp, moves);
}
function scoreMoves(board, me, opp, moves) {
    var scoredMoves = [];
    for (var moveIndex = 0; moveIndex < moves.length; moveIndex++) {
        var move = moves[moveIndex];
        var scored = {
            score: minMax(updateBoard(board, { row: move.row, col: move.col, value: me }), me, opp, opp),
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
function scoreMovesBigBoard(gameState, me, opp) {
    var availableMoves = movesLeftBigBoard(gameState);
    var wins = gameState.won;
    var loss = gameState.lost;
    var tie = gameState.tied;
    var current = me;
    var scoredBigMoves = [];
    for (var moveIndex = 0; moveIndex < availableMoves.length; moveIndex++) {
        var move = availableMoves[moveIndex];
        var minMaxResult = minMaxBigBoardV3(gameState, move, me, opp, current, wins, loss, tie, availableMoves.length > 6 ? 1 : 0);
        var scoredBigMove = {
            action: { row: move.row, col: move.col },
            outcome: "Undetermined",
        };
        if (minMaxResult.o === "W" &&
            !minMaxResult.r.some(function (result) { return result.o === "L"; })) {
            scoredBigMove.outcome = "Win";
        }
        else if (minMaxResult.r.some(function (result) { return result.o === "L"; }) &&
            minMaxResult.o === "W") {
            scoredBigMove.outcome = "WinLose";
        }
        else if (minMaxResult.r.some(function (result) { return result.o === "L"; })) {
            scoredBigMove.outcome = "Lose";
        }
        else if (minMaxResult.r.some(function (result) { return result.o === "T"; })) {
            scoredBigMove.outcome = "Tie";
        }
        scoredBigMoves.push(scoredBigMove);
    }
    return scoredBigMoves;
}
function bigBoardStateToValue(state) {
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
function bigBoardToSmallBoard(bigBoard) {
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
function isBigBoardWon(bigBoard) {
    return (bigBoard.filter(function (boardState) { return boardState.state === "Won"; }).length >
        bigBoard.filter(function (boardState) { return boardState.state === "Lost"; }).length);
}
function isBigBoardLost(bigBoard) {
    return (bigBoard.filter(function (boardState) { return boardState.state === "Won"; }).length <
        bigBoard.filter(function (boardState) { return boardState.state === "Lost"; }).length);
}
function isBigBoardTied(bigBoard) {
    return (!isBigBoardLost(bigBoard) &&
        !isBigBoardLost(bigBoard) &&
        !bigBoard.some(function (boardState) {
            return boardState.state === "Clean" || boardState.state === "Playing";
        }));
}
function minMax(board, me, opp, current) {
    if (isBoardWon(board, me)) {
        return 1;
    }
    if (isBoardWon(board, opp)) {
        return -1;
    }
    var move = -1;
    var score = -2;
    var movesAvailable = movesLeft(board);
    for (var mi = 0; mi < movesAvailable.length; mi++) {
        mi;
        var ma = movesAvailable[mi];
        var updatedBoard = updateBoard(board, {
            col: ma.col,
            row: ma.row,
            value: current,
        });
        var moveScore = void 0;
        var boardKey = boardToString(updatedBoard);
        if (optimizedHash[boardKey]) {
            var score_1 = optimizedHash[boardKey][0];
            moveScore = parseInt(score_1, 10);
        }
        else {
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
function minMaxBigBoardV3(gameState, move, me, opp, current, winsBefore, lossBefore, tieBefore, depth) {
    if (depth === void 0) { depth = 0; }
    var newGameState = new GameState(gameState);
    newGameState.updateFromPlay(move.row, move.col, current);
    var movesAvailable = movesLeftBigBoard(newGameState);
    var minMaxResult = {
        d: depth,
        o: "U",
        r: [],
    };
    var boards = newGameState.boards;
    var winsNow = 0;
    var lossNow = 0;
    var tieNow = 0;
    for (var boardIndex = 0; boardIndex < boards.length; boardIndex++) {
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
        }
        else if (lossNow > lossBefore) {
            minMaxResult.o = "L";
        }
        else if (tieNow > tieBefore) {
            minMaxResult.o = "T";
        }
    }
    depth++;
    if (depth <= 2) {
        for (var moveIndex = 0; moveIndex < movesAvailable.length; moveIndex++) {
            var m = movesAvailable[moveIndex];
            var subMinMaxResult = minMaxBigBoardV3(newGameState, m, me, opp, getOpponent(current), winsNow, lossNow, tieNow, depth);
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
function fullDepth(gameState, move, current) {
    var newGameState = new GameState(gameState);
    newGameState.updateFromPlay(move.row, move.col, current);
    var board = bigBoardToSmallBoard(gameState.boards);
    if (isBoardWon(board, gameState.me)) {
        return 1;
    }
    if (isBoardWon(board, gameState.opp)) {
        return -1;
    }
    if (isBoardTied(board)) {
        return 0;
    }
    var nextMove = movesLeftBigBoard(newGameState)[0];
    if (!nextMove) {
        return 5;
    }
    return fullDepth(newGameState, nextMove, getOpponent(current));
}
function createBigBoardID(bigBoard) {
    return bigBoard.map(function (boardState) { return boardToString(boardState.board); }).join("");
}
function willMoveLose(loseMoves, move) {
    for (var loseMoveIndex = 0; loseMoveIndex < loseMoves.length; loseMoveIndex++) {
        var loseM = loseMoves[loseMoveIndex];
        if (loseM.action.row === move.row && loseM.action.col === move.col) {
            return true;
        }
    }
    return false;
}
// score,row,col
//
// const myBoard = cloneBoard(emptyBoard);
// minMax(myBoard, Value.X, Value.O, Value.X);
var hash = {};
var optimizedHash = {};
var bigBoardHash = {};
// Object.keys(hash).forEach((key) => {
//   hash[key] = `values[${values.indexOf(hash[key])}]`;
// });
// fs.writeFileSync(path.join(__dirname, "./hash"), JSON.stringify(hash));
// initial_gameState.updateBoard(0, 0, 0, Value.X, Value.X, Value.O);
// initial_gameState.updateBoard(0, 1, 0, Value.O, Value.X, Value.O);
// const v = scoreMovesBigBoard(initial_gameState, Value.X, Value.O);
// fs.writeFileSync(
//   path.join(__dirname, "./bigScore.json"),
//   JSON.stringify(bigBoardHash)
// );
var initial_gameState = new GameState();
var log = true;
function gameLoop(gameState) {
    var moveCount = 0;
    var _loop_1 = function () {
        moveCount++;
        inputs = readline().split(" ");
        var opponentRow = parseInt(inputs[0]);
        var opponentCol = parseInt(inputs[1]);
        var validActionCount = parseInt(readline());
        var me = Value.X;
        var opp = Value.O;
        for (var i = 0; i < validActionCount; i++) {
            inputs = readline().split(" ");
            var row = parseInt(inputs[0]);
            var col = parseInt(inputs[1]);
        }
        if (opponentRow === -1 && opponentCol === -1) {
            // const state = new GameState(gameState);
            // const start = new Date().getTime();
            // const result = fullDepth(state, { row: 4, col: 4 }, Value.X);
            // const end = new Date().getTime();
            // debugMessage({ result, time: end - start });
            gameState.updateBoard(0, 1, 2, me);
            playPosition(1, 2);
        }
        else {
            // Update Board From Move
            gameState.updateFromPlay(opponentRow, opponentCol, opp);
            var nextBoardToPlay = getNextBoardFromPlay(opponentRow, opponentCol);
            // debugMessage("beforeScore");
            var bigBoardScoredMoves = scoreMovesBigBoard(gameState, me, opp);
            // debugMessage("afterScore");
            var loseMove_1 = bigBoardScoredMoves.filter(function (bestMove) { return bestMove.outcome === "Lose"; });
            var winMove = bigBoardScoredMoves.filter(function (bestMove) { return bestMove.outcome === "Win"; });
            var winLoseMove = bigBoardScoredMoves.filter(function (bestMove) { return bestMove.outcome === "WinLose"; });
            if (moveCount === 1 && opponentRow === 4 && opponentCol === 4) {
                // debugMessage("here1");
                gameState.updateBoard(4, 1, 0, me);
                playPosition(4, 3);
            }
            else if (winMove.length > 0) {
                // debugMessage("here2");
                gameState.updateFromPlay(winMove[0].action.row, winMove[0].action.col, me);
                playPosition(winMove[0].action.row, winMove[0].action.col);
            }
            else if (winLoseMove.length > 0) {
                gameState.updateFromPlay(winLoseMove[0].action.row, winLoseMove[0].action.col, me);
                playPosition(winLoseMove[0].action.row, winLoseMove[0].action.col);
            }
            else {
                // debugMessage("here3");
                var nextBoardState = gameState.getBoard(nextBoardToPlay);
                // debugMessage("here4");
                if (nextBoardState.state === "Lost" ||
                    nextBoardState.state === "Tie" ||
                    nextBoardState.state === "Won") {
                    // debugMessage("here5");
                    var bigAsSmall = createSmallBoardFromBigBoard(gameState, me);
                    // debugMessage({ bigAsSmall, optimizedHash });
                    // debugMessage("before findBestMove");
                    var bestMoves = findBestMove(bigAsSmall, me, opp).sort(function (a, b) { return b.score - a.score; });
                    // debugMessage("after");
                    var boards = [];
                    // boards = bestMoves
                    //   .map((move) =>
                    //     getNextBoardFromAction(move.action.row, move.action.col)
                    //   )
                    //   .filter(
                    //     (board) => !canIBeBlocked(gameState.boards[board].board, me)
                    //   );
                    // debugMessage("here6");
                    var newBoardId = void 0;
                    if (boards[0]) {
                        newBoardId = boards[0];
                    }
                    else {
                        var bestMove = bestMoves[0];
                        newBoardId = getNextBoardFromAction(bestMove.action.row, bestMove.action.col);
                    }
                    nextBoardState = gameState.boards[newBoardId];
                    // debugMessage({ nextBoardState });
                }
                var boardId_1 = nextBoardState.id;
                var board = nextBoardState.board;
                if (nextBoardState.state === "Clean") {
                    // debugMessage("here7");
                    var move = {
                        row: 0,
                        col: 0,
                    };
                    var availableMovesSmall_1 = movesLeft(board);
                    var availableMoves = possibleMoves
                        .filter(function (posMove) {
                        return availableMovesSmall_1.some(function (availMove) {
                            return posMove.row === availMove.row && posMove.col === availMove.col;
                        });
                    })
                        .map(function (action) { return offSetToBigBoard(action.row, action.col, boardId_1); })
                        .filter(function (availMove) {
                        return !loseMove_1.some(function (l) {
                            return l.action.row === availMove.row &&
                                l.action.col === availMove.col;
                        });
                    });
                    if (availableMoves[0]) {
                        move = availableMoves[0];
                    }
                    gameState.updateFromPlay(move.row, move.col, me);
                    // const bigBoardAction = offSetToBigBoard(move.row, move.col, boardId);
                    playPosition(move.row, move.col);
                }
                else {
                    // debugMessage("here8");
                    var blockMoves = moveToBlock(board, opp);
                    var won = gameState.won;
                    var lost = gameState.lost;
                    // TODO: Last chnge
                    if (blockMoves) {
                        var blockMove = blockMoves[0];
                        var willBlockMoveLose = false;
                        var bBlock = offSetToBigBoard(blockMoves[0].row, blockMoves[0].col, boardId_1);
                        for (var loseMoveIndex = 0; loseMoveIndex < loseMove_1.length; loseMoveIndex++) {
                            var loseM = loseMove_1[loseMoveIndex];
                            if (loseM.action.row === bBlock.row &&
                                loseM.action.col === bBlock.col) {
                                willBlockMoveLose = true;
                                break;
                            }
                        }
                        if (willBlockMoveLose) {
                            var bestMoves = findBestMove(board, me, opp)
                                .filter(function (bestMoves) {
                                var bigBestMoves = offSetToBigBoard(bestMoves.action.row, bestMoves.action.col, boardId_1);
                                return !loseMove_1.some(function (lm) {
                                    return lm.action.row === bigBestMoves.row &&
                                        lm.action.col === bigBestMoves.col;
                                });
                            })
                                .sort(function (a, b) { return b.score - a.score; });
                            if (bestMoves.length > 0) {
                                playMove(gameState, boardId_1, bestMoves[0].action, me, opp);
                            }
                            else if (blockMoves[1]) {
                                playMove(gameState, boardId_1, blockMoves[1], me, opp);
                            }
                            else {
                                playMove(gameState, boardId_1, blockMoves[0], me, opp);
                            }
                        }
                        else {
                            // Block move wont lose
                            playMove(gameState, boardId_1, blockMoves[0], me, opp);
                        }
                    }
                    else {
                        // debugMessage("here");
                        var nextMove = void 0;
                        var bestMoves = findBestMove(board, me, opp).sort(function (a, b) { return b.score - a.score; });
                        var bestMovesMinusLose = bestMoves.filter(function (bestMove) {
                            var bigBestMove = offSetToBigBoard(bestMove.action.row, bestMove.action.col, boardId_1);
                            return !loseMove_1.some(function (loseMove) {
                                return (loseMove.action.row === bigBestMove.row &&
                                    loseMove.action.col === bigBestMove.col);
                            });
                        });
                        if (bestMovesMinusLose.length > 0) {
                            nextMove = bestMovesMinusLose[0].action;
                        }
                        else {
                            nextMove = bestMoves[0].action;
                        }
                        gameState.updateBoard(boardId_1, nextMove.row, nextMove.col, me);
                        var bigBoardAction = offSetToBigBoard(nextMove.row, nextMove.col, boardId_1);
                        playPosition(bigBoardAction.row, bigBoardAction.col);
                    }
                }
            }
        }
    };
    var inputs, inputs;
    // game loop
    while (true) {
        _loop_1();
    }
}
// gameLoop(initial_gameState);
// //seed=310144971
// //TfuPChSI1
var WIN_SCORE = 10;
var GameStateNode = /** @class */ (function (_super) {
    __extends(GameStateNode, _super);
    function GameStateNode(gameStateNode, parent) {
        var _this = _super.call(this, gameStateNode) || this;
        _this.visitCount = 0;
        _this.winScore = 0;
        _this.parentNode = null;
        _this.children = [];
        _this.totalMoves = 0;
        return _this;
    }
    GameStateNode.prototype.updateFromPlay = function (row, col, value) {
        this.totalMoves++;
        _super.prototype.updateFromPlay.call(this, row, col, value);
    };
    GameStateNode.prototype.randomPlay = function () {
        var moves = this.movesLeft();
        var randomMove = moves[Math.floor(Math.random() * moves.length)];
        this.updateFromPlay(randomMove.row, randomMove.col, getOpponent(this.lastValue));
    };
    GameStateNode.prototype.randomChild = function () {
        return this.children[Math.floor(Math.random() * this.children.length)];
    };
    GameStateNode.prototype.addScore = function (score) {
        this.winScore += score;
    };
    GameStateNode.prototype.setWinScore = function (score) {
        this.winScore = score;
    };
    GameStateNode.prototype.incrementVisit = function () {
        this.visitCount++;
    };
    GameStateNode.prototype.selectPromisingNode = function () {
        return findBestNodeWithUCB(this);
    };
    GameStateNode.prototype.getChildWithMaxScore = function () {
        var max = this.children[0];
        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].winScore >= max.winScore) {
                max = this.children[i];
            }
        }
        return max;
    };
    GameStateNode.prototype.expand = function () {
        var _this = this;
        var moves = this.movesLeft();
        moves.forEach(function (move) {
            var newGameState = new GameStateNode(_this, _this);
            newGameState.updateFromPlay(move.row, move.col, getOpponent(_this.lastValue));
            _this.children.push(newGameState);
        });
    };
    return GameStateNode;
}(GameState));
function backPropogation(nodeToExplore) {
    var tempNode = nodeToExplore;
    while (tempNode != null) {
        tempNode.incrementVisit();
        // TODO: MAYBE NOT PLAYING NOT LOST
        if (tempNode.status == GameStatus.Won) {
            tempNode.addScore(WIN_SCORE);
        }
        tempNode = tempNode.parentNode;
    }
}
function simulateRandomPlayout(node) {
    var boardStatus = node.status;
    if (node.status == GameStatus.Lost) {
        if (node.parentNode) {
            node.parentNode.setWinScore(Number.MIN_VALUE);
        }
        return GameStatus.Lost;
    }
    while (node.status == GameStatus.Playing) {
        node.randomPlay();
        boardStatus = node.status;
    }
    return boardStatus;
}
// Montecarlo
function findBestNodeWithUCB(node) {
    var parentVisitCt = node.visitCount;
    var childUCB = [];
    node.children.forEach(function (child) {
        childUCB.push(ucbValue(parentVisitCt, child.winScore, child.visitCount));
    });
    var max = Math.max.apply(Math, childUCB);
    var idx = childUCB.indexOf(max);
    return node.children[idx];
}
function ucbValue(totalVisit, nodeWinScore, nodeVisit) {
    if (nodeVisit === 0) {
        return Number.MAX_SAFE_INTEGER;
    }
    return (nodeWinScore / nodeVisit +
        1.41 * Math.sqrt(Math.log(totalVisit) / nodeVisit));
}
function monteCarloFindBestMove(gameStateNode, time) {
    var startTime = Date.now();
    while (Date.now() - startTime < time) {
        var promissingNode = gameStateNode.selectPromisingNode();
        if (promissingNode.status === GameStatus.Playing) {
            promissingNode.expand();
        }
        var nodeToExplore = promissingNode;
        if (promissingNode.children.length > 0) {
            nodeToExplore = promissingNode.randomChild();
        }
        var result = simulateRandomPlayout(nodeToExplore);
        backPropogation(nodeToExplore);
    }
    return gameStateNode.getChildWithMaxScore().lastPlay;
}
// function testing() {
//   const state = new GameState();
//   state.updateFromPlay(0, 0, Value.X);
//   const nodeState: GameStateNode = new GameStateNode(state);
// }
// testing();

import { checkWinner, checkEndTheGame } from "./GameLogic";

// Define types for board and difficulty
export type Board = Array<"x" | "o" | "">;
export type Difficulty = "easy" | "medium" | "hard";

export const minimax = (
    board: Board,
    depth: number,
    isMaximizing: boolean
): number => {
    const result = checkWinner(board);

    // Scoring with depth consideration
    if (result === "o") return 10 - depth;
    if (result === "x") return depth - 10;
    if (checkEndTheGame(board)) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = "o";
                const score = minimax(board, depth + 1, false);
                board[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = "x";
                const score = minimax(board, depth + 1, true);
                board[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
};

export const findBestMove = (
    board: Board,
    difficulty: Difficulty
): number => {
    // Easy Mode: Random move
    if (difficulty === "easy") {
        const emptySquares = board.reduce<number[]>(
            (acc, sq, idx) => (sq === "" ? [...acc, idx] : acc),
            []
        );
        return emptySquares[Math.floor(Math.random() * emptySquares.length)];
    }

    // Medium Mode: Mix of random and strategic moves
    if (difficulty === "medium") {
        if (Math.random() < 0.5) {
            const emptySquares = board.reduce<number[]>(
                (acc, sq, idx) => (sq === "" ? [...acc, idx] : acc),
                []
            );
            return emptySquares[
                Math.floor(Math.random() * emptySquares.length)
            ];
        }
    }

    // Hard Mode: Improved strategic moves
    let bestScore = -Infinity;
    let bestMove = -1;

    // Prioritize center and corners
    const prioritySquares = [4, 0, 2, 6, 8];

    // First, try to win
    for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
            board[i] = "o";
            const winner = checkWinner(board);
            board[i] = "";
            if (winner === "o") return i;
        }
    }

    // Block player's winning move
    for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
            board[i] = "x";
            const winner = checkWinner(board);
            board[i] = "";
            if (winner === "x") return i;
        }
    }

    // Use Minimax for remaining moves
    for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
            board[i] = "o";
            const score = minimax(board, 0, false);
            board[i] = "";

            // Prefer priority squares if scores are close
            const priorityBonus = prioritySquares.includes(i) ? 0.5 : 0;

            if (score + priorityBonus > bestScore) {
                bestScore = score + priorityBonus;
                bestMove = i;
            }
        }
    }

    return bestMove;
};

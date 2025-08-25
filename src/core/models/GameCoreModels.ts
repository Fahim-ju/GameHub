import type { GameId } from "../enum/EnumGameId";

export const GameCategory = {
    Strategy: "strategy",
    Puzzle: "puzzle",
    Card: "card",
    Arcade: "arcade",
    Board: "board",
    Word: "word",
    Math: "math",
    Action: "action",
    Multiplayer: "multiplayer",
    SinglePlayer: "singlePlayer",
    Adventure: "adventure",
    Simulation: "simulation",
    Sports: "sports",
    Trivia: "trivia",
    Racing: "racing",
    Educational: "educational",
    Shooter: "shooter",
    Platformer: "platformer",
    RolePlaying: "rolePlaying",
    Kid: "kid"
} as const;

export type GameCategoryType = typeof GameCategory[keyof typeof GameCategory];

export interface Game {
    gameId: GameId;
    name: string;
    description: string;
    categories: GameCategoryType[];
    searchText?: string;
    thumbnailImage: string;
    hoverImage?: string;
    /**
     * Difficulty level of the game (1-5, where 5 is most difficult)
     */
    difficulty?: number;
    featured?: boolean;
    enabled?: boolean;
    route?: string;
}

export type GameCollection = {
    collectionName: string;
    games: Game[];
};

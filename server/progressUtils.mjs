// interface IPlayer
// {
//     name: string;
//     score: number;
// }

// interface ICompletedQuestion
// {
//     category: string;
//     id: number;
//     player: string;
// }

// interface IRoundResult
// {
//     id: number;
//     completedQuestions: ICompletedQuestion[];
// }

// interface IGameProgress
// {
//     players: IPlayer[];
//     results:  IRoundResult[];
// }

import { readFileSync } from "node:fs";

const progressFile = "progress.json";
const playersFile = "players.json";

export function loadProgress()
{
    console.log("load progress from", progressFile);
    return JSON.parse(readFileSync(progressFile, 'utf8'));
}

export function loadPlayers()
{
    console.log("load players from", playersFile);
    return JSON.parse(readFileSync(playersFile, 'utf8'));
}
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

import { readFileSync, writeFileSync } from "node:fs";

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
    let players = JSON.parse(readFileSync(playersFile, 'utf8'));

    players.forEach(player => player.online = false);
    players = players.filter(p => p.score != 0);
    return players;
}

export function saveProgress(progress)
{
    var json = JSON.stringify(progress);
    writeFileSync(progressFile, json, 'utf8');
}

export function savePlayers(players)
{
    var json = JSON.stringify(players);
    writeFileSync(playersFile, json, 'utf8');
}
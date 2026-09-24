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
const settingsFile = "settings.json";

const defaultSettings = {
    answerTimeLimitSec: 30,
    answerQueueEnabled: true,
    answerCooldownSec: 5,
};

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
    var json = JSON.stringify(progress, null, 4);
    writeFileSync(progressFile, json, 'utf8');
}

export function savePlayers(players)
{
    var json = JSON.stringify(players);
    writeFileSync(playersFile, json, 'utf8');
}
export function loadSettings()
{
    console.log("load settings from", settingsFile);
    try
    {
        const raw = JSON.parse(readFileSync(settingsFile, "utf8"));
        return {
            answerTimeLimitSec: Number(raw.answerTimeLimitSec) || defaultSettings.answerTimeLimitSec,
            answerQueueEnabled: raw.answerQueueEnabled !== false,
            answerCooldownSec: Math.max(0, Number.isFinite(Number(raw.answerCooldownSec)) ? Number(raw.answerCooldownSec) : defaultSettings.answerCooldownSec),
        };
    }
    catch (e)
    {
        console.log("settings missing, using defaults");
        saveSettings(defaultSettings);
        return { ...defaultSettings };
    }
}

export function saveSettings(settings)
{
    const cool = Number(settings.answerCooldownSec);
    const next = {
        answerTimeLimitSec: Math.max(5, Math.min(300, Math.round(Number(settings.answerTimeLimitSec) || defaultSettings.answerTimeLimitSec))),
        answerQueueEnabled: settings.answerQueueEnabled !== false,
        answerCooldownSec: Math.max(0, Math.min(60, Math.round(Number.isFinite(cool) ? cool : defaultSettings.answerCooldownSec))),
    };
    writeFileSync(settingsFile, JSON.stringify(next, null, 2), "utf8");
    return next;
}

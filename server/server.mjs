import express from 'express';
import { createServer } from "node:http";
import { Server } from "socket.io";
import { loadPlayers, loadProgress, loadSettings, savePlayers, saveProgress, saveSettings } from "./progressUtils.mjs";

const hostname = "localhost";
const port = 4000;
const EMCEE = "Admin";
const TV = "TV";
const QUESTION_SELECT_HIGHLIGHT_MS = 2000;

let progress = loadProgress();
let players = loadPlayers();
let settings = loadSettings();
let answerPlayer = null;
let answerQueue = [];
let passedPlayers = [];
let answerTimer = null;
let answerTickInterval = null;
let answerDeadline = null;
let answerTimeLimitSec = settings.answerTimeLimitSec;
let currentQuestion = null;
let currentRound = findCurrentRound();
let isOpened = false;
let leaderPlayer = progress.leaderPlayer || undefined;
let catInBagSelected = false;

function persistLeaderPlayer(name)
{
    leaderPlayer = name || undefined;
    if (leaderPlayer)
        progress.leaderPlayer = leaderPlayer;
    else
        delete progress.leaderPlayer;
    saveProgress(progress);
}

function setLeaderPlayer(name, ioServer)
{
    persistLeaderPlayer(name);
    ioServer.sockets.emit("leaderPlayer", leaderPlayer);
}

let roundId = 0;
let category = "";
let questionId = 0;

console.log("players", players);
console.log("progress", progress);

function addPlayer(name)
{
    const player = players.find(p => p.name == name);

    if (player == null)
        players.push({ name, score: 0, online: true });
    else
        player.online = true;
}

function disconnectPlayer(name)
{
    const player = players.find(p => p.name == name);

    if (player == null)
        return;

    // Admin/TV always stay in list — otherwise header disappears on mobile reconnect
    if (name === EMCEE || name === TV || player.score != 0)
    {
        player.online = false;
        return;
    }

    players = players.filter(p => p.name != name);
}

function findQuestion(roundId, category, questionId)
{
    const categories = progress.rounds[roundId];
	const curCategory = categories.find(c => c.name === category);
	return curCategory.questions.find(q => q.id === questionId);
}

function completeQuestion(currentQuestion, answerPlayer)
{
    currentQuestion.completed = true;
    currentQuestion.answerPlayer = answerPlayer;
}

function roundFinished(round)
{
    let isFinished = true;

    if (round >= progress.rounds.length)
        return true;

    progress.rounds[round].forEach(category =>
    {
        category.questions.forEach(question =>
        {
            if (!question.completed)
                isFinished = false;
        })
    })

    return isFinished;
}

function findCurrentRound()
{
    for (let i = 0; i <= progress.rounds.length; i++)
    {
        if (!roundFinished(i))
            return i;
    }

    return progress.rounds.length;
}


function clearAnswerTimer()
{
    if (answerTimer != null)
    {
        clearTimeout(answerTimer);
        answerTimer = null;
    }

    if (answerTickInterval != null)
    {
        clearInterval(answerTickInterval);
        answerTickInterval = null;
    }

    answerDeadline = null;
}

function emitAnswerTimer(ioServer, secondsLeft)
{
    ioServer.sockets.emit("answerTimer", secondsLeft);
}

function emitAnswerTimeLimit(ioServer)
{
    ioServer.sockets.emit("answerTimeLimit", answerTimeLimitSec);
}

function emitGameSettings(ioServer)
{
    ioServer.sockets.emit("gameSettings", {
        answerTimeLimitSec,
        answerQueueEnabled: settings.answerQueueEnabled,
        answerCooldownSec: settings.answerCooldownSec,
    });
}

function applySettings(next, ioServer)
{
    settings = saveSettings({
        answerTimeLimitSec: next.answerTimeLimitSec ?? answerTimeLimitSec,
        answerQueueEnabled: next.answerQueueEnabled ?? settings.answerQueueEnabled,
        answerCooldownSec: next.answerCooldownSec ?? settings.answerCooldownSec,
    });
    answerTimeLimitSec = settings.answerTimeLimitSec;

    if (!settings.answerQueueEnabled && answerQueue.length > 1)
    {
        answerQueue = answerQueue.slice(0, 1);
        syncAnswerState(ioServer);
    }

    emitGameSettings(ioServer);
    emitAnswerTimeLimit(ioServer);

    if (answerPlayer != null && !isOpened)
        startAnswerTimer(ioServer);

    console.log("settings", settings);
}

function startAnswerTimer(ioServer)
{
    clearAnswerTimer();

    if (answerPlayer == null || isOpened || currentQuestion == null)
    {
        emitAnswerTimer(ioServer, null);
        return;
    }

    answerDeadline = Date.now() + answerTimeLimitSec * 1000;

    const tick = () =>
    {
        if (answerDeadline == null)
        {
            emitAnswerTimer(ioServer, null);
            return;
        }

        const left = Math.max(0, Math.ceil((answerDeadline - Date.now()) / 1000));
        emitAnswerTimer(ioServer, left);
    };

    tick();
    answerTickInterval = setInterval(tick, 1000);

    answerTimer = setTimeout(() =>
    {
        answerTimer = null;
        if (answerTickInterval != null)
        {
            clearInterval(answerTickInterval);
            answerTickInterval = null;
        }
        emitAnswerTimer(ioServer, 0);
        console.log("answer timeout", answerPlayer);
        if (markAnswerWrong != null)
            markAnswerWrong(true);
    }, answerTimeLimitSec * 1000);
}

function syncAnswerState(io)
{
    const previousAnswerPlayer = answerPlayer;
    answerPlayer = answerQueue.length > 0 ? answerQueue[0] : null;
    io.sockets.emit("answerPlayer", answerPlayer);
    io.sockets.emit("answerQueue", answerQueue);

    if (answerPlayer == null)
    {
        clearAnswerTimer();
        emitAnswerTimer(io, null);
    }
    else if (answerPlayer !== previousAnswerPlayer)
    {
        startAnswerTimer(io);
    }
}

function syncPassedState(io)
{
    io.sockets.emit("passedPlayers", passedPlayers);
}

function clearAnswerQueue(io)
{
    answerQueue = [];
    syncAnswerState(io);
}

function clearPassedPlayers(io)
{
    passedPlayers = [];
    syncPassedState(io);
}

function getEligiblePlayers()
{
    return players.filter(p => p.name !== EMCEE && p.name !== TV && p.online);
}

/** Set inside connection so timeout can reuse wrong/close logic. */
let markAnswerWrong = null;

function tryAutoOpenIfAllPassed(ioServer)
{
    if (isOpened || currentQuestion == null)
        return;

    const eligible = getEligiblePlayers();
    if (eligible.length === 0)
        return;

    if (!eligible.every(p => passedPlayers.includes(p.name)))
        return;

    console.log("all players passed, opening answer");
    isOpened = true;
    clearAnswerQueue(ioServer);
    ioServer.sockets.emit("openAnswer");
}

const app = express();
app.use(express.static("public", {
    maxAge: "7d",
    etag: true,
    lastModified: true,
}));

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
});

io.on("connection", (socket) => {
    let socketName = null;

    socket.onAny((event, ...args) =>
    {
        const who = socketName ?? socket.id;
        console.log("[in]", who, event, ...args);
    });

    function isAdmin()
    {
        return socketName === EMCEE;
    }

    function sendNextRound()
    {
        currentRound++;
        console.log("currentRound", currentRound);
        io.sockets.emit("currentRound", currentRound);
        setLeaderPlayer(undefined, io);
    }

    function closeQuestion()
    {
        //TODO помечаем вопрос выполненным
        completeQuestion(currentQuestion, answerPlayer);
        saveProgress(progress);

        io.sockets.emit("openAnswer");
        io.sockets.emit("progress", progress);
        catInBagSelected = false;
        io.sockets.emit("catInBagSelected", catInBagSelected);

        currentQuestion = null;
        clearAnswerQueue(io);
        clearPassedPlayers(io);

        if (roundFinished(currentRound))
            sendNextRound();
    }

    markAnswerWrong = (fromTimeout = false) =>
    {
        if (answerPlayer == null || currentQuestion == null)
            return;

        io.sockets.emit("audioPlay");
        console.log(fromTimeout ? "wrong(timeout)" : "wrong", answerPlayer, currentQuestion);

        const player = players.find(p => p.name == answerPlayer);
        if (player != null)
        {
            player.score -= currentQuestion.price;
            savePlayers(players);
            io.sockets.emit("players", players);
        }

        if (catInBagSelected)
        {
            setLeaderPlayer(answerPlayer, io);
            closeQuestion();
            return;
        }

        if (answerQueue.length > 0)
            answerQueue.shift();
        syncAnswerState(io);
        tryAutoOpenIfAllPassed(io);
    };

    socket.on("login", (name) =>
    {
        console.log(name, "logged in");
        socketName = name;

        addPlayer(name);
        savePlayers(players);

        socket.emit("progress", progress);
        socket.emit("currentRound", currentRound);
        socket.emit("leaderPlayer", leaderPlayer);
        emitAnswerTimeLimit(io);
        emitGameSettings(io);
        socket.emit("answerTimer", answerDeadline == null ? null : Math.max(0, Math.ceil((answerDeadline - Date.now()) / 1000)));
        io.sockets.emit("players", players);

        if (currentQuestion == null)
            socket.emit("to_game");
        else
        {
            io.sockets.emit("question", currentQuestion);
            socket.emit("to_question");

            syncAnswerState(io);
            syncPassedState(io);
            emitAnswerTimeLimit(io);
            emitGameSettings(io);
            socket.emit("answerTimer", answerDeadline == null ? null : Math.max(0, Math.ceil((answerDeadline - Date.now()) / 1000)));
        }

        socket.once("disconnect", () =>
        {
            console.log(name, "disconnected");
            disconnectPlayer(name);
            socket.broadcast.emit("players", players);
        });
    });

    socket.on("progress", () =>
    {
        console.log("request progress");
        socket.emit("progress", progress);
    });

    socket.on("players", () =>
    {
        console.log("request players");
        socket.emit("players", players);
    });

    socket.on("selected", (_roundId, _category, _questionId, _leaderPlayer) =>
    {
        isOpened = false;
        clearAnswerQueue(io);
        clearPassedPlayers(io);
        roundId = _roundId;
        category = _category;
        questionId = _questionId;
        setLeaderPlayer(_leaderPlayer, io);

        console.log("question", roundId, category, questionId);
        io.sockets.emit("selected", { roundId, category, questionId });

        currentQuestion = findQuestion(roundId, category, questionId);

        setTimeout(() => io.sockets.emit("question", currentQuestion), QUESTION_SELECT_HIGHLIGHT_MS);
    });

    socket.on("answerPlayer", (name) =>
    {
        if (isOpened)
        {
            console.log("try answer opened question");
            return;
        }

        if (name == null || name === EMCEE || name === TV)
            return;

        if (passedPlayers.includes(name))
        {
            console.log("already passed", name);
            return;
        }

        if (answerQueue.includes(name))
        {
            console.log("already in answer queue", name);
            return;
        }

        if (!settings.answerQueueEnabled && answerQueue.length > 0)
        {
            console.log("answer queue disabled, ignore", name);
            return;
        }

        const wasEmpty = answerQueue.length === 0;
        answerQueue.push(name);
        console.log("answer queue", answerQueue);

        if (wasEmpty)
            io.sockets.emit("audioStop");

        syncAnswerState(io);
    });

    socket.on("catInBagPlayer", (playerName) =>
    {
        clearAnswerQueue(io);
        clearPassedPlayers(io);
        console.log("catInBagPlayer", roundId, category, questionId, playerName);
        io.sockets.emit("selected", { roundId, category, questionId });
        setLeaderPlayer(playerName, io);
        catInBagSelected = true;
        io.sockets.emit("catInBagSelected", catInBagSelected);

        currentQuestion = findQuestion(roundId, category, questionId);

        io.sockets.emit("question", currentQuestion);
    });

    socket.on("passQuestion", (name) =>
    {
        if (isOpened)
            return;

        if (name == null || name === EMCEE || name === TV)
            return;

        if (passedPlayers.includes(name))
            return;

        passedPlayers.push(name);
        console.log("passQuestion", name, passedPlayers);

        if (answerQueue.includes(name))
        {
            answerQueue = answerQueue.filter(n => n !== name);
            syncAnswerState(io);
        }

        syncPassedState(io);
        tryAutoOpenIfAllPassed(io);
    });

    socket.on("openAnswer", () =>
    {
        if (isOpened)
        {
            console.log("openAnswer ignored: already opened");
            return;
        }

        clearAnswerTimer();
        emitAnswerTimer(io, null);
        isOpened = true;
        io.sockets.emit("openAnswer");
    });

    socket.on("right", () =>
    {
        console.log("right", answerPlayer, currentQuestion);

        // начисляем баллы
        const player = players.find(p => p.name == answerPlayer);
        player.score += currentQuestion.price;

        savePlayers(players);
        io.sockets.emit("players", players);

        setLeaderPlayer(answerPlayer, io);

        closeQuestion();
    });

    socket.on("wrong", () =>
    {
        markAnswerWrong(false);
    });

    socket.on("setAnswerTimeLimit", (seconds) =>
    {
        if (!isAdmin())
        {
            console.log("setAnswerTimeLimit ignored: not admin", socketName);
            return;
        }

        applySettings({ answerTimeLimitSec: seconds }, io);
    });

    socket.on("setGameSettings", (next) =>
    {
        if (!isAdmin())
        {
            console.log("setGameSettings ignored: not admin", socketName);
            return;
        }

        applySettings(next ?? {}, io);
    });

    socket.on("audioPlay", () => {
        socket.broadcast.emit("audioPlay");
    });

    socket.on("closeQuestion", () =>
    {
        if (currentQuestion != null)
            closeQuestion();

        io.sockets.emit("selected", null);
        io.sockets.emit("to_game");
    });

    socket.on("updatePlayerScore", (playerName, score) =>
    {
        if (!isAdmin())
        {
            console.log("updatePlayerScore ignored: not admin", socketName);
            return;
        }

        if (playerName === EMCEE || playerName === TV)
            return;

        const player = players.find(p => p.name == playerName);
        if (player == null)
            return;

        const nextScore = Number(score);
        if (!Number.isFinite(nextScore))
            return;

        player.score = nextScore;
        savePlayers(players);
        io.sockets.emit("players", players);
        console.log("updatePlayerScore", playerName, nextScore);
    });

    socket.on("deletePlayer", (playerName) =>
    {
        if (!isAdmin())
        {
            console.log("deletePlayer ignored: not admin", socketName);
            return;
        }

        if (playerName === EMCEE || playerName === TV)
            return;

        const exists = players.some(p => p.name == playerName);
        if (!exists)
            return;

        players = players.filter(p => p.name != playerName);

        if (answerQueue.includes(playerName))
        {
            answerQueue = answerQueue.filter(n => n !== playerName);
            syncAnswerState(io);
        }

        if (passedPlayers.includes(playerName))
        {
            passedPlayers = passedPlayers.filter(n => n !== playerName);
            syncPassedState(io);
        }

        if (leaderPlayer === playerName)
            setLeaderPlayer(undefined, io);

        savePlayers(players);
        io.sockets.emit("players", players);
        console.log("deletePlayer", playerName);
        tryAutoOpenIfAllPassed(io);
    });

    socket.on("renamePlayer", (newName) =>
    {
        if (socketName == null || socketName === EMCEE || socketName === TV)
        {
            socket.emit("renameError", "Нельзя сменить это имя");
            return;
        }

        const nextName = String(newName ?? "").trim();
        if (nextName === "")
        {
            socket.emit("renameError", "Введи имя");
            return;
        }

        if (nextName === socketName)
        {
            socket.emit("renamed", nextName);
            return;
        }

        if (nextName === EMCEE || nextName === TV || players.some(p => p.name === nextName))
        {
            socket.emit("renameError", "Имя уже занято");
            return;
        }

        const player = players.find(p => p.name === socketName);
        if (player == null)
        {
            socket.emit("renameError", "Игрок не найден");
            return;
        }

        const oldName = socketName;
        player.name = nextName;
        socketName = nextName;

        answerQueue = answerQueue.map(n => n === oldName ? nextName : n);
        passedPlayers = passedPlayers.map(n => n === oldName ? nextName : n);
        if (answerPlayer === oldName)
            answerPlayer = nextName;
        if (leaderPlayer === oldName)
            persistLeaderPlayer(nextName);

        savePlayers(players);
        syncAnswerState(io);
        syncPassedState(io);
        io.sockets.emit("players", players);
        io.sockets.emit("leaderPlayer", leaderPlayer);
        socket.emit("renamed", nextName);
        console.log("renamePlayer", oldName, "->", nextName);
    });

});

httpServer
    .once("error", (err) => {
        console.error(err);
        process.exit(1);
    })
    .listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
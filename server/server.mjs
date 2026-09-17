import express from 'express';
import { createServer } from "node:http";
import { Server } from "socket.io";
import { loadPlayers, loadProgress, savePlayers, saveProgress } from "./progressUtils.mjs";

const hostname = "localhost";
const port = 4000;
const EMCEE = "Admin";
const TV = "TV";
const QUESTION_SELECT_HIGHLIGHT_MS = 2000;

let progress = loadProgress();
let players = loadPlayers();
let answerPlayer = null;
let currentQuestion = null;
let currentRound = findCurrentRound();
let isOpened = false;
let leaderPlayer = undefined;
let catInBagSelected = false;

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

    function isAdmin()
    {
        return socketName === EMCEE;
    }

    function sendNextRound()
    {
        currentRound++;
        console.log("currentRound", currentRound);
        io.sockets.emit("currentRound", currentRound);
        io.sockets.emit("leaderPlayer");
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

        answerPlayer = null;
        currentQuestion = null;
        io.sockets.emit("answerPlayer", answerPlayer);

        if (roundFinished(currentRound))
            sendNextRound();
    }

    socket.on("login", (name) =>
    {
        console.log(name, "logged in");
        socketName = name;

        addPlayer(name);
        savePlayers(players);

        socket.emit("progress", progress);
        socket.emit("currentRound", currentRound);
        socket.emit("leaderPlayer", leaderPlayer);
        io.sockets.emit("players", players);

        if (currentQuestion == null)
            socket.emit("to_game");
        else
        {
            io.sockets.emit("question", currentQuestion);
            socket.emit("to_question");

            if (answerPlayer != null)
                io.sockets.emit("answerPlayer", answerPlayer);
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
        roundId = _roundId;
        category = _category;
        questionId = _questionId;
        leaderPlayer = _leaderPlayer;

        console.log("question", roundId, category, questionId);
        io.sockets.emit("selected", { roundId, category, questionId });
        io.sockets.emit("leaderPlayer", leaderPlayer);

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

        console.log("try answer", answerPlayer, name);
        io.sockets.emit("audioStop");

        if (answerPlayer == null)
        {
            answerPlayer = name;
            io.sockets.emit("answerPlayer", name);
        }
    });

    socket.on("catInBagPlayer", (playerName) =>
    {
        console.log("catInBagPlayer", roundId, category, questionId, playerName);
        io.sockets.emit("selected", { roundId, category, questionId });
        io.sockets.emit("leaderPlayer", playerName);
        catInBagSelected = true;
        io.sockets.emit("catInBagSelected", catInBagSelected);

        currentQuestion = findQuestion(roundId, category, questionId);

        io.sockets.emit("question", currentQuestion);
    });

    socket.on("openAnswer", () =>
    {
        io.sockets.emit("openAnswer");
        isOpened = true;
    });

    socket.on("right", () =>
    {
        console.log("right", answerPlayer, currentQuestion);

        // начисляем баллы
        const player = players.find(p => p.name == answerPlayer);
        player.score += currentQuestion.price;

        savePlayers(players);
        io.sockets.emit("players", players);

        leaderPlayer = answerPlayer;
        io.sockets.emit("leaderPlayer", leaderPlayer);

        closeQuestion();
    });

    socket.on("wrong", () =>
    {
        socket.broadcast.emit("audioPlay");
        console.log("wrong", answerPlayer, currentQuestion);

        // списываем баллы
        //TODO Списываем баллы и ждем следующего
        const player = players.find(p => p.name == answerPlayer);
        player.score -= currentQuestion.price;

        savePlayers(players);
        io.sockets.emit("players", players);

        if (!catInBagSelected)
        {
            answerPlayer = null;
            io.sockets.emit("answerPlayer", answerPlayer);
        }

        if (catInBagSelected)
        {
            leaderPlayer = answerPlayer;
            io.sockets.emit("leaderPlayer", leaderPlayer);
            closeQuestion();
        }
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

        if (answerPlayer === playerName)
        {
            answerPlayer = null;
            io.sockets.emit("answerPlayer", answerPlayer);
        }

        if (leaderPlayer === playerName)
        {
            leaderPlayer = undefined;
            io.sockets.emit("leaderPlayer", leaderPlayer);
        }

        savePlayers(players);
        io.sockets.emit("players", players);
        console.log("deletePlayer", playerName);
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
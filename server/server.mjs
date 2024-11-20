import express from 'express';
import { createServer } from "node:http";
import { Server } from "socket.io";
import { loadPlayers, loadProgress } from "./progressUtils.mjs";

const hostname = "localhost";
const port = 4000;

let progress = loadProgress();
let players = loadPlayers();

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

    if (player.score > 0)
    {
        player.online = false;
        return;
    }

    players = players.filter(p => p.name != name);
}

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
});

io.on("connection", (socket) => {
    socket.on("login", (name) =>
    {
        console.log(name, "logged in");

        addPlayer(name);

        socket.emit("hello");
        socket.emit("progress", progress);
        io.sockets.emit("players", players);

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

    socket.on("question", (roundId, category, questionId) =>
    {
        console.log("question", roundId, category, questionId);
        socket.emit("question", { roundId, category, questionId });
    });

    socket.on("right", (category, id, score) =>
    {
        console.log("right", category, id, score);
    });

    socket.on("wrong", (category, id, score) =>
    {
        console.log("right", category, id, score);
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
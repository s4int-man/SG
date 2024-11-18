import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { loadProgress } from "./progressUtils.mjs";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

let { players, progress } = loadProgress();
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

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer);

    io.on("connection", (socket) => {
        socket.on("login", (name) =>
        {
            console.log(name, "logged in");

            addPlayer(name);

            socket.broadcast.emit("players", players);

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
});
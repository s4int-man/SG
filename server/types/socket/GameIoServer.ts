import type { Server } from "socket.io";
import type { ClientToServerEvents } from "./ClientToServerEvents";
import type { InterServerEvents } from "./InterServerEvents";
import type { ServerToClientEvents } from "./ServerToClientEvents";
import type { SocketData } from "./SocketData";

/** Типизированный io-сервер: new GameIoServer(httpServer, { cors: { origin: "*" } }). */
export type GameIoServer = Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;

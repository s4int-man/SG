import type { Socket } from "socket.io";
import type { ClientToServerEvents } from "./ClientToServerEvents";
import type { InterServerEvents } from "./InterServerEvents";
import type { ServerToClientEvents } from "./ServerToClientEvents";
import type { SocketData } from "./SocketData";

/** Типизированный сокет внутри io.on("connection", (socket: GameSocket) => ...). */
export type GameSocket = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;

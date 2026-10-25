import type { PlayerName } from "../common/PlayerName";

/**
 * Данные сокета. socketName держится в замыкании обработчика connection,
 * но при желании его можно хранить здесь — тогда доступен как socket.data.
 */
export interface SocketData {
    socketName?: PlayerName;
}

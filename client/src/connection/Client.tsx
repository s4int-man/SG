import { io } from "socket.io-client";

export const serverUrl = "http://192.168.0.14:4000";
export const socket = io(serverUrl);
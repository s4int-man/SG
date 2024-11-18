import { io } from "socket.io-client";

export const socket = io();

socket.on("hello", (name: string): void =>
{
    console.log(name);
});
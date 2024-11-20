import { useNavigate } from "react-router-dom";
import { socket } from "../connection/Client";
import React from "react";
import { IPlayer } from "../types/IProgress";
import { useDispatch } from "react-redux";
import { GameReducer } from "../store/GameReducer";
import { IGame } from "../types/IGame";

export function useConnection()
{
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onConnect = () => console.log("Status: connected");
    const onDisconnect = () => console.log("Status: disconnected");
    const onHello = React.useCallback(() => navigate("/game"), [ navigate ]);
    const onPlayers = React.useCallback((players: IPlayer[]): void =>
    {
        console.log("players", players);

        dispatch(GameReducer.actions.setPlayers(players));
    }, [ dispatch ]);

    const onProgress = React.useCallback((progress: IGame): void =>
    {
        console.log("Progress", progress);

        dispatch(GameReducer.actions.setProgress(progress));
    }, [ dispatch ]);

    React.useEffect((): void =>
    {
        socket.on("connect", onConnect);
        socket.on("disconnect",onDisconnect);
        socket.on("hello", onHello);
        socket.on("players", onPlayers);
        socket.on("progress", onProgress);
    }, [ onHello, onPlayers, onProgress ]);
}
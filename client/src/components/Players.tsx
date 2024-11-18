
import React from "react";
import { IPlayer } from "../types/IProgress";
import { socket } from "../connection/Client";
import { Player } from "./Player";

export function Players()
{
    const [ players, setPlayers ] = React.useState<IPlayer[]>([]);

    React.useEffect(() =>
    {
        socket.on("players", (players: IPlayer[]) =>
        {
            console.log("players", players);
            setPlayers(players);
        });
        socket.emit("players");
    }, []);

    return <div className="players">
        Игроки:
        {players.map(player => <Player key={player.name} {...player} />)}
    </div>;
}
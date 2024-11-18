"use client";

import { IPlayer } from "@/app/types/IProgress";
import { socket } from "@/client";
import { Player } from "@/components/Player";
import React from "react";

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
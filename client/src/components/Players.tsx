
import React from "react";
import { IPlayer } from "../types/IProgress";
import { Player } from "./Player";
import { useSelector } from "react-redux";
import { RootState } from "../types/RootState";

export function Players()
{
    const players = useSelector((state: RootState): IPlayer[] => state.gameReducer.players);

    return <div className="players">
        Игроки:
        {players.map(player => <Player key={player.name} {...player} />)}
    </div>;
}
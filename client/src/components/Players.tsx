
import React from "react";
import { IPlayer } from "../types/IProgress";
import { Player } from "./Player";
import { useSelector } from "react-redux";
import { RootState } from "../types/RootState";
import styles from "../styles/Players.module.css";

export function Players()
{
    const players = useSelector((state: RootState): IPlayer[] => state.gameReducer.players);

    return <React.Fragment>
        <hr />
        <div className={styles.players}>
            {players.map(player => <Player key={player.name} {...player} />)}
        </div>
    </React.Fragment>;
}
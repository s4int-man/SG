import React from "react";
import { IPlayer } from "../types/IProgress";
import { Player } from "./Player";
import { PlayerEditDialog } from "./PlayerEditDialog";
import { useSelector } from "react-redux";
import { RootState } from "../types/RootState";
import styles from "../styles/Players.module.css";
import config from "../config.json";

export function Players()
{
    const players = useSelector((state: RootState): IPlayer[] => state.gameReducer.players);
    const name = localStorage.getItem("name") || "";
    const isAdmin = name === config.emcee;
    const [ editingPlayer, setEditingPlayer ] = React.useState<IPlayer | null>(null);

    return <React.Fragment>
        <div className={styles.players}>
            {players.map(player => (
                <Player
                    key={player.name}
                    {...player}
                    editable={isAdmin}
                    onSelect={isAdmin ? setEditingPlayer : undefined}
                />
            ))}
        </div>
        {editingPlayer != null && (
            <PlayerEditDialog
                player={editingPlayer}
                onClose={() => setEditingPlayer(null)}
            />
        )}
    </React.Fragment>;
}

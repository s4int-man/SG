import React from "react";
import { IPlayer } from "../types/IProgress";
import { Player } from "./Player";
import { PlayerEditDialog } from "./PlayerEditDialog";
import { PlayerRenameDialog } from "./PlayerRenameDialog";
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
    const [ renamingSelf, setRenamingSelf ] = React.useState(false);

    // re-read name after rename closes (localStorage updated)
    const [ selfName, setSelfName ] = React.useState(name);
    React.useEffect(() =>
    {
        if (!renamingSelf)
            setSelfName(localStorage.getItem("name") || "");
    }, [ renamingSelf, players ]);

    const onSelectPlayer = (player: IPlayer) =>
    {
        if (isAdmin)
        {
            setEditingPlayer(player);
            return;
        }

        if (player.name === selfName)
            setRenamingSelf(true);
    };

    return <React.Fragment>
        <div className={styles.players}>
            {players.map(player =>
            {
                const canClick = isAdmin || player.name === selfName;

                return (
                    <Player
                        key={player.name}
                        {...player}
                        editable={canClick}
                        onSelect={canClick ? onSelectPlayer : undefined}
                    />
                );
            })}
        </div>
        {editingPlayer != null && (
            <PlayerEditDialog
                player={editingPlayer}
                onClose={() => setEditingPlayer(null)}
            />
        )}
        {renamingSelf && (
            <PlayerRenameDialog
                currentName={selfName}
                onClose={() => setRenamingSelf(false)}
            />
        )}
    </React.Fragment>;
}

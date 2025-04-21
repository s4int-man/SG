import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import config from "../../config.json";
import { socket } from "../../connection/Client";
import styles from "../../styles/CatInBag.module.css";
import { IPlayer } from "../../types/IProgress";
import { RootState } from "../../types/RootState";

const EXCLUDE_PLAYERS = [ config.emcee, config.tv ];

export const CatInBagPlayer = () => 
{
    EXCLUDE_PLAYERS.push(localStorage.getItem("name")!);

    const players: IPlayer[] = useSelector(createSelector(
        (state: RootState): IPlayer[] => state.gameReducer.players,
        (players: IPlayer[]): IPlayer[] => players.filter((player: IPlayer): boolean => !EXCLUDE_PLAYERS.includes(player.name))
    ));

    const selectPlayer = (playerName: string) => 
    {
        socket.emit("catInBagPlayer", playerName);
    }

    return <div className={styles.container}>
        Тебе достался Кот в мешке<br />Выбери игрока, кому передать вопрос
        {players.map(player => <div key={player.name} onClick={() => selectPlayer(player.name)} className={styles.player}>{ player.name }</div>)}
    </div>;
}
import { useSelector } from "react-redux";
import { RootState } from "../../types/RootState";
import { createSelector } from "@reduxjs/toolkit";
import { IPlayer } from "../../types/IProgress";
import config from "../../config.json";

const EXCLUDE_PLAYERS = [ config.emcee, config.tv, localStorage.getItem("name") ];

export const CatInBagPlayer = () => 
{
    const players: IPlayer[] = useSelector(createSelector(
        (state: RootState): IPlayer[] => state.gameReducer.players,
        (players: IPlayer[]): IPlayer[] => players.filter((player: IPlayer): boolean => !EXCLUDE_PLAYERS.includes(player.name))
    ));

    return <div>
        Выбери игрока
        {players.map(player => <div key={player.name}>{ player.name }</div>)}
    </div>;
}
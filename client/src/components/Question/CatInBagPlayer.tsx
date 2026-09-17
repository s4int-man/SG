import { useSelector } from "react-redux";
import config from "../../config.json";
import { socket } from "../../connection/Client";
import styles from "../../styles/CatInBag.module.css";
import { IPlayer } from "../../types/IProgress";
import { RootState } from "../../types/RootState";

export const CatInBagPlayer = () =>
{
    const myName = localStorage.getItem("name") || "";

    const players: IPlayer[] = useSelector((state: RootState): IPlayer[] =>
        state.gameReducer.players.filter((player: IPlayer): boolean =>
            player.name !== config.emcee &&
            player.name !== config.tv &&
            player.name !== myName
        )
    );

    const selectPlayer = (playerName: string) =>
    {
        socket.emit("catInBagPlayer", playerName);
    };

    const selectRandom = () =>
    {
        if (players.length === 0)
            return;

        const index = Math.floor(Math.random() * players.length);
        selectPlayer(players[index].name);
    };

    return <div className={styles.container}>
        <div className={styles.title}>Кот в мешке</div>
        <div className={styles.text}>Выбери игрока, кому передать вопрос</div>
        {players.map(player => (
            <div
                key={player.name}
                onClick={() => selectPlayer(player.name)}
                className={styles.player}
            >
                {player.name}
            </div>
        ))}
        {players.length > 0 && (
            <button type="button" className={styles.random} onClick={selectRandom}>
                Random
            </button>
        )}
    </div>;
}

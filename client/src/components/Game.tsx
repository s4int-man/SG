import { Categories } from "./Categories";
import styles from "../styles/Game.module.css";
import { useSelector } from "react-redux";
import { RootState } from "../types/RootState";
import { GameEnd } from "./GameEnd";

export function Game()
{
    const roundsCount = useSelector((state: RootState) => state.gameReducer.progress.rounds.length);
    const currentRound = useSelector((state: RootState) => state.gameReducer.currentRound);
    const leaderPlayer = useSelector((state: RootState) => state.gameReducer.leaderPlayer);

    if (currentRound >= roundsCount)
        return <GameEnd />;

    return <div className={styles.game}>
        <Categories />
        {leaderPlayer != null && <div className={styles.select_text}>{"Вопрос выбирает: " + leaderPlayer}</div>}
    </div>;
}
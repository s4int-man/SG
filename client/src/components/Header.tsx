import { useSelector } from "react-redux";
import { RootState } from "../types/RootState";
import styles from "../styles/Header.module.css";
import config from "../config.json";

export function Header()
{
    const name = localStorage.getItem("name") || "";
    const myPlayer = useSelector((state: RootState) => state.gameReducer.players.find(p => p.name === name));
    const question = useSelector((state: RootState) => state.gameReducer.currentQuestion);

    if (myPlayer == null)
        return null;

    return <div className={styles.header}>
        <div className={styles.title} >Святая игра</div>
        {question != null && <div className={styles.question_price}>Вопрос на: {question.price}</div>}
        {myPlayer.name != config.emcee && myPlayer.name != "TV" &&
            <div className={styles.player_info}>
                <div className={styles.name}>{myPlayer.name}:</div>
                <div className={styles.score}>{myPlayer.score} очков</div>
        </div>}
    </div>;
}
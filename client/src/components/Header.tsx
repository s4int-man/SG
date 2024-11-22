import { useSelector } from "react-redux";
import { RootState } from "../types/RootState";
import styles from "../styles/Header.module.css";

export function Header()
{
    const name = localStorage.getItem("name") || "";
    const myPlayer = useSelector((state: RootState) => state.gameReducer.players.find(p => p.name === name));

    if (myPlayer == null)
        return null;

    return <div className={styles.header}>
        <div className="title">Святая игра</div>
        <div className="player-info">
            <div className="name">{myPlayer.name}:</div>
            <div className="score">{myPlayer.score} очков</div>
        </div>
    </div>;
}
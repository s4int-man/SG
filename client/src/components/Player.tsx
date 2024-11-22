
import styles from "../styles/Player.module.css";
import { IPlayer } from "../types/IProgress";

export function Player(props: IPlayer)
{
    if (props.name === "Святой")
        return null;
    if (props.name === "TV")
        return null;

    return <div className={`${styles.player} ${props.online ? styles.online : ""}`}>
        <div className="name">{props.name}</div>
        <div className="score">{props.score} очков</div>
    </div>;
}
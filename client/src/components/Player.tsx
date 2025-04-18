
import styles from "../styles/Player.module.css";
import { IPlayer } from "../types/IProgress";
import config from "../config.json";

export function Player(props: IPlayer)
{
    if (props.name === config.emcee)
        return null;
    if (props.name === config.tv)
        return null;

    return <div className={`${styles.player} ${props.online ? styles.online : ""}`}>
        <div className="name">{props.name}</div>
        <div className="score">{props.score} очков</div>
    </div>;
}
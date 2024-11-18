
import styles from "@/styles/Player.module.css";
import { IPlayer } from "../types/IProgress";

export function Player(props: IPlayer)
{
    return <div className={`${styles.player} ${props.online ? styles.online : ""}`}>
        {props.name}: {props.score} очков
    </div>;
}
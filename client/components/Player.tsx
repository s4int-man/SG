import { IPlayer } from "@/app/types/IProgress";
import styles from "@/styles/Player.module.css";

export function Player(props: IPlayer)
{
    return <div className={`${styles.player} ${props.online ? styles.online : ""}`}>
        {props.name}: {props.score} очков
    </div>;
}
import styles from "../styles/GameEnd.module.css";
import { VideoAnswer } from "./Question/VideoAnswer";

export function GameEnd()
{
    return <div className={styles.game_end}>
        <div>А на этом пока всё.</div>
        <div>Поздравим победителя!</div>
        <div>
            {localStorage.getItem("name") === "TV" && <VideoAnswer answer="/video/final.mp4" />}
        </div>
    </div>
}

import styles from "../styles/GameEnd.module.css";
import { VideoAnswer } from "./Question/VideoAnswer";

export function GameEnd()
{

    return <div className={styles.game_end}>
        А на этом пока все. Поздравим победителя!
        <br />
        <br />
        <br />
        <div>
            {localStorage.getItem("name") === "TV" && <VideoAnswer answer="/video/final.mp4" />}
        </div>
    </div>
}
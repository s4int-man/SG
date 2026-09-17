import config from "../../config.json";
import styles from "../../styles/Question.module.css";

export function VideoAnswer(props: { answer: string })
{
    return <div className={styles.videoWrap}>
        <video
            className={styles.video}
            src={config.server + props.answer}
            autoPlay
            playsInline
            controls
        />
    </div>;
}

import { useSelector } from "react-redux";
import styles from "../../styles/CatInBag.module.css";
import { RootState } from "../../types/RootState";

export const CatInBag = () =>
{
    const leaderPlayer = useSelector((state: RootState) => state.gameReducer.leaderPlayer);

    return <div className={styles.container}>
        <div className={styles.title}>Кот в мешке</div>
        <div className={styles.help_message}>
            {leaderPlayer} выбирает игрока, кому передать
        </div>
    </div>;
}
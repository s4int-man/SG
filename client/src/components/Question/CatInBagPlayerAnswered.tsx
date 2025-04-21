import { useSelector } from "react-redux";
import styles from "../../styles/CatInBag.module.css";
import { RootState } from "../../types/RootState";

export const CatInBagPlayerAnswered = () => 
{
    const leaderPlayer = useSelector((state: RootState) => state.gameReducer.leaderPlayer);

    return <div className={styles.container}>
        {leaderPlayer} отвечает на вопрос
    </div>;
}
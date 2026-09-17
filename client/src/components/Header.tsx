import { useSelector } from "react-redux";
import { RootState } from "../types/RootState";
import styles from "../styles/Header.module.css";
import config from "../config.json";

export function Header()
{
    const name = localStorage.getItem("name") || "";
    const myPlayer = useSelector((state: RootState) => state.gameReducer.players.find(p => p.name === name));
    const isAdmin = name === config.emcee;
    const isTv = name === config.tv;

    if (!name)
        return null;

    // Don't hide header if player briefly missing from list (mobile reconnect / score 0 cleanup)
    if (myPlayer == null && !isAdmin && !isTv)
        return null;

    const onAdminControls = () =>
    {
        // TODO: admin controls action
    };

    return <div className={styles.header}>
        <div className={styles.title}>Святая игра</div>
        {isAdmin && (
            <button
                type="button"
                className={styles.admin_button}
                onClick={onAdminControls}
            >
                Управление
            </button>
        )}
        {!isAdmin && !isTv && myPlayer != null &&
            <div className={styles.player_info}>
                <div className={styles.name}>{myPlayer.name}:</div>
                <div className={styles.score}>{myPlayer.score} очков</div>
        </div>}
    </div>;
}

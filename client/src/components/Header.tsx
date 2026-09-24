import { useSelector } from "react-redux";
import { RootState } from "../types/RootState";
import styles from "../styles/Header.module.css";
import config from "../config.json";
import React from "react";
import { AdminControlsDialog } from "./AdminControlsDialog";

export function Header()
{
    const name = localStorage.getItem("name") || "";
    const myPlayer = useSelector((state: RootState) => state.gameReducer.players.find(p => p.name === name));
    const isAdmin = name === config.emcee;
    const isTv = name === config.tv;
    const [ controlsOpen, setControlsOpen ] = React.useState(false);

    if (!name)
        return null;

    // Don't hide header if player briefly missing from list (mobile reconnect / score 0 cleanup)
    if (myPlayer == null && !isAdmin && !isTv)
        return null;

    return <React.Fragment>
        <div className={styles.header}>
            <div className={styles.title}>Святая игра</div>
            {isAdmin && (
                <button
                    type="button"
                    className={styles.admin_button}
                    onClick={() => setControlsOpen(true)}
                >
                    Управление
                </button>
            )}
            {!isAdmin && !isTv && myPlayer != null &&
                <div className={styles.player_info}>
                    <div className={styles.name}>{myPlayer.name}:</div>
                    <div className={styles.score}>{myPlayer.score} очков</div>
            </div>}
        </div>
        {controlsOpen && (
            <AdminControlsDialog onClose={() => setControlsOpen(false)} />
        )}
    </React.Fragment>;
}

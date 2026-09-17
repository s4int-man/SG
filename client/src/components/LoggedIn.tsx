"use client";
import React from "react";
import styles from "../styles/LoggedIn.module.css";
import { socket } from "../connection/Client";

export function LoggedIn(props: { name: string, setName: (name: string | null) => void }): React.ReactElement
{
    const yesClick = (): void =>
    {
        socket.emit("login", props.name);
    }

    const noClick = (): void =>
    {
        localStorage.removeItem("name");
        props.setName(null);
    }

    return <div className={styles.loggedIn}>
        <div className={styles.panel}>
            <div>Это ты?</div>
            <div className={styles.name}>{props.name}</div>
            <div className={styles.buttons}>
                <button className={`${styles.button} ${styles.buttonYes}`} onClick={yesClick}>Да</button>
                <button className={`${styles.button} ${styles.buttonNo}`} onClick={noClick}>Нет</button>
            </div>
        </div>
    </div>;
}

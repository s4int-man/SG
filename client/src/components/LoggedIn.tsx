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
        <div>Это ты: <b>{props.name}</b>?</div>
        <div className={styles.buttons}>
            <button className={styles.button} onClick={yesClick}>Да</button>
            <button className={styles.button} onClick={noClick}>Нет</button>
        </div>
    </div>;
}
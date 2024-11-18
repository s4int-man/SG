"use client";
import React from "react";
import styles from "/styles/LoggedIn.module.css";
import { useRouter } from "next/navigation";
import { socket } from "@/client";

export function LoggedIn(props: { name: string }): React.ReactElement
{
    const router = useRouter();

    const yesClick = (): void =>
    {
        router.push("/rounds/0");
        socket.emit("login", props.name);
    }

    const noClick = (): void =>
    {
        localStorage.removeItem("name");
        router.push("/");
    }

    return <div className={styles.loggedIn}>
        <div>Это ты: <b>{props.name}</b>?</div>
        <div className={styles.buttons}>
            <button className={styles.button} onClick={yesClick}>Да</button>
            <button className={styles.button} onClick={noClick}>Нет</button>
        </div>
    </div>;
}
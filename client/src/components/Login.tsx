"use client";
import React from "react";
import styles from "../styles/Login.module.css";
import { socket } from "../connection/Client";
// import { useRouter } from "next/navigation";

export function Login()
{
    const [text, setText] = React.useState("");

    const onChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
    {
        setText(e.target.value);
    }

    const onClick = (): void =>
    {
        localStorage.setItem("name", text);
        socket.emit("login", text);
    }

    return <div className={styles.login}>
        <div>Представься</div>
        <input className={styles.username} type="text" value={text} onChange={onChange} />
        <button className={styles.button} onClick={onClick}>ОК</button>
    </div>;
}
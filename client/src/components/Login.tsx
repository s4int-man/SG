"use client";
import React from "react";
import styles from "../styles/Login.module.css";
import { socket } from "../connection/Client";

export function Login()
{
    const [text, setText] = React.useState("");

    const onChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
    {
        setText(e.target.value);
    }

    const onClick = (): void =>
    {
        if (!text.trim())
            return;

        localStorage.setItem("name", text.trim());
        socket.emit("login", text.trim());
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void =>
    {
        if (e.key === "Enter")
            onClick();
    }

    return <div className={styles.login}>
        <h1 className={styles.brand}>Святая игра</h1>
        <div className={styles.panel}>
            <div className={styles.label}>Представься</div>
            <input
                className={styles.username}
                type="text"
                value={text}
                onChange={onChange}
                onKeyDown={onKeyDown}
                placeholder="Имя"
                autoFocus
            />
            <button className={styles.button} onClick={onClick}>ОК</button>
        </div>
    </div>;
}

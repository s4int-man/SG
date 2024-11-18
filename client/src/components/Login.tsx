"use client";
import React from "react";
import styles from "../styles/Login.module.css";
import { socket } from "../connection/Client";
// import { useRouter } from "next/navigation";

export function Login()
{
    const [text, setText] = React.useState("");

    // const router = useRouter();

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    {
        setText(e.target.value);
    }

    const onClick = (): void =>
    {
        // console.log("Login as", text);
        localStorage.setItem("name", text);

        if (!socket.connected)
            alert("Ты не подключен. Иди к Святому");

        socket.emit("login", text);
        // router.push("/rounds/0");
    }

    return <div className={styles.login}>
        <div>Представься</div>
        <input className={styles.username} type="text" value={text} onChange={onChange} />
        <button className={styles.button} onClick={onClick}>ОК</button>
    </div>;
}
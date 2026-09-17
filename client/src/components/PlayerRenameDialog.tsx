import React from "react";
import { socket } from "../connection/Client";
import styles from "../styles/PlayerEditDialog.module.css";

export function PlayerRenameDialog(props: {
    currentName: string;
    onClose: () => void;
})
{
    const [ name, setName ] = React.useState(props.currentName);
    const [ error, setError ] = React.useState("");

    React.useEffect(() =>
    {
        setName(props.currentName);
        setError("");
    }, [ props.currentName ]);

    React.useEffect(() =>
    {
        const onKeyDown = (e: KeyboardEvent) =>
        {
            if (e.key === "Escape")
                props.onClose();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [ props ]);

    React.useEffect(() =>
    {
        const onRenamed = (newName: string) =>
        {
            localStorage.setItem("name", newName);
            props.onClose();
        };

        const onRenameError = (message: string) =>
        {
            setError(message || "Не удалось сменить имя");
        };

        socket.on("renamed", onRenamed);
        socket.on("renameError", onRenameError);

        return () =>
        {
            socket.off("renamed", onRenamed);
            socket.off("renameError", onRenameError);
        };
    }, [ props ]);

    const onSave = () =>
    {
        const next = name.trim();
        if (!next)
        {
            setError("Введи имя");
            return;
        }

        if (next === props.currentName)
        {
            props.onClose();
            return;
        }

        setError("");
        socket.emit("renamePlayer", next);
    };

    return <div className={styles.overlay} onClick={props.onClose}>
        <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="player-rename-title"
            onClick={e => e.stopPropagation()}
        >
            <div id="player-rename-title" className={styles.title}>Смена имени</div>
            <label className={styles.field}>
                <span className={styles.label}>Новое имя</span>
                <input
                    className={styles.input}
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e =>
                    {
                        if (e.key === "Enter")
                            onSave();
                    }}
                    autoFocus
                    maxLength={24}
                />
            </label>
            {error !== "" && <div className={styles.error}>{error}</div>}
            <div className={styles.actions}>
                <button type="button" className={styles.save} onClick={onSave}>Сохранить</button>
                <button type="button" className={styles.cancel} onClick={props.onClose}>Отмена</button>
            </div>
        </div>
    </div>;
}

import React from "react";
import { useSelector } from "react-redux";
import { socket } from "../connection/Client";
import styles from "../styles/PlayerEditDialog.module.css";
import { RootState } from "../types/RootState";

export function AdminControlsDialog(props: { onClose: () => void })
{
    const answerTimeLimit = useSelector((state: RootState) => state.gameReducer.answerTimeLimit);
    const answerQueueEnabled = useSelector((state: RootState) => state.gameReducer.answerQueueEnabled);
    const answerCooldown = useSelector((state: RootState) => state.gameReducer.answerCooldown);
    const [ seconds, setSeconds ] = React.useState(String(answerTimeLimit));
    const [ cooldown, setCooldown ] = React.useState(String(answerCooldown));
    const [ queueEnabled, setQueueEnabled ] = React.useState(answerQueueEnabled);

    React.useEffect(() =>
    {
        setSeconds(String(answerTimeLimit));
        setCooldown(String(answerCooldown));
        setQueueEnabled(answerQueueEnabled);
    }, [ answerTimeLimit, answerCooldown, answerQueueEnabled ]);

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

    const onSave = () =>
    {
        const next = Number(seconds);
        const nextCooldown = Number(cooldown);
        if (!Number.isFinite(next) || !Number.isFinite(nextCooldown))
            return;

        socket.emit("setGameSettings", {
            answerTimeLimitSec: next,
            answerQueueEnabled: queueEnabled,
            answerCooldownSec: nextCooldown,
        });
        props.onClose();
    };

    return <div className={styles.overlay} onClick={props.onClose}>
        <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-controls-title"
            onClick={e => e.stopPropagation()}
        >
            <div id="admin-controls-title" className={styles.title}>Управление</div>
            <label className={styles.field}>
                <span className={styles.label}>Время на ответ (сек)</span>
                <input
                    className={styles.input}
                    type="number"
                    min={5}
                    max={300}
                    value={seconds}
                    onChange={e => setSeconds(e.target.value)}
                    onKeyDown={e =>
                    {
                        if (e.key === "Enter")
                            onSave();
                    }}
                    autoFocus
                />
            </label>
            <label className={styles.field}>
                <span className={styles.label}>Кулдаун «Ответить» (сек)</span>
                <input
                    className={styles.input}
                    type="number"
                    min={0}
                    max={60}
                    value={cooldown}
                    onChange={e => setCooldown(e.target.value)}
                    onKeyDown={e =>
                    {
                        if (e.key === "Enter")
                            onSave();
                    }}
                />
            </label>
            <label className={styles.check_field}>
                <input
                    type="checkbox"
                    checked={queueEnabled}
                    onChange={e => setQueueEnabled(e.target.checked)}
                />
                <span>Очередь игроков</span>
            </label>
            <div className={styles.hint}>Настройки пишутся в settings.json на сервере.</div>
            <div className={styles.actions}>
                <button type="button" className={styles.save} onClick={onSave}>Сохранить</button>
                <button type="button" className={styles.cancel} onClick={props.onClose}>Отмена</button>
            </div>
        </div>
    </div>;
}

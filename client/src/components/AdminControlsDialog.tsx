import React from "react";
import { useSelector } from "react-redux";
import { QRCodeSVG } from "qrcode.react";
import { socket } from "../connection/Client";
import config from "../config.json";
import styles from "../styles/PlayerEditDialog.module.css";
import { RootState } from "../types/RootState";

const CLIENT_PORT = 3000;

function clientJoinUrl(host: string): string
{
    return `http://${host}:${CLIENT_PORT}`;
}

export function AdminControlsDialog(props: { onClose: () => void })
{
    const answerTimeLimit = useSelector((state: RootState) => state.gameReducer.answerTimeLimit);
    const answerQueueEnabled = useSelector((state: RootState) => state.gameReducer.answerQueueEnabled);
    const answerCooldown = useSelector((state: RootState) => state.gameReducer.answerCooldown);
    const [ seconds, setSeconds ] = React.useState(String(answerTimeLimit));
    const [ cooldown, setCooldown ] = React.useState(String(answerCooldown));
    const [ queueEnabled, setQueueEnabled ] = React.useState(answerQueueEnabled);
    const [ joinUrl, setJoinUrl ] = React.useState<string | null>(null);
    const [ lanError, setLanError ] = React.useState<string | null>(null);

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

    React.useEffect(() =>
    {
        let cancelled = false;

        (async () =>
        {
            try
            {
                const base = config.server.replace(/\/$/, "");
                const res = await fetch(`${base}/api/lan`);
                if (!res.ok)
                    throw new Error(`Ошибка LAN (${res.status})`);
                const data = await res.json() as { preferred?: string | null; addresses?: string[] };
                const host = data.preferred || data.addresses?.[0];
                if (!host)
                    throw new Error("LAN-адрес не найден");
                if (!cancelled)
                {
                    setJoinUrl(clientJoinUrl(host));
                    setLanError(null);
                }
            }
            catch (err)
            {
                if (!cancelled)
                {
                    setJoinUrl(null);
                    setLanError(err instanceof Error ? err.message : "Не удалось получить LAN");
                }
            }
        })();

        return () => { cancelled = true; };
    }, []);

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
            <div className={styles.qr_block}>
                <span className={styles.label}>Вход для игроков</span>
                {joinUrl && (
                    <React.Fragment>
                        <div className={styles.qr_wrap}>
                            <QRCodeSVG value={joinUrl} size={160} bgColor="#f7f2dc" fgColor="#080c37" />
                        </div>
                        <div className={styles.qr_url}>{joinUrl}</div>
                    </React.Fragment>
                )}
                {!joinUrl && !lanError && <div className={styles.hint}>Ищем LAN-адрес…</div>}
                {lanError && <div className={styles.error}>{lanError}</div>}
            </div>
            <div className={styles.hint}>Настройки пишутся в settings.json на сервере.</div>
            <div className={styles.actions}>
                <button type="button" className={styles.save} onClick={onSave}>Сохранить</button>
                <button type="button" className={styles.cancel} onClick={props.onClose}>Отмена</button>
            </div>
        </div>
    </div>;
}

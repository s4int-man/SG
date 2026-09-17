import React from "react";
import { IPlayer } from "../types/IProgress";
import { socket } from "../connection/Client";
import styles from "../styles/PlayerEditDialog.module.css";

export function PlayerEditDialog(props: {
    player: IPlayer;
    onClose: () => void;
})
{
    const [ score, setScore ] = React.useState(String(props.player.score));
    const [ confirmDelete, setConfirmDelete ] = React.useState(false);

    React.useEffect(() =>
    {
        setScore(String(props.player.score));
        setConfirmDelete(false);
    }, [ props.player ]);

    React.useEffect(() =>
    {
        const onKeyDown = (e: KeyboardEvent) =>
        {
            if (e.key !== "Escape")
                return;

            if (confirmDelete)
                setConfirmDelete(false);
            else
                props.onClose();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [ props, confirmDelete ]);

    const onScoreChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    {
        setScore(e.target.value);
    };

    const onSave = () =>
    {
        const nextScore = Number(score);
        if (!Number.isFinite(nextScore))
            return;

        socket.emit("updatePlayerScore", props.player.name, nextScore);
        props.onClose();
    };

    const onConfirmDelete = () =>
    {
        socket.emit("deletePlayer", props.player.name);
        props.onClose();
    };

    return <div className={styles.overlay} onClick={props.onClose}>
        <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="player-edit-title"
            onClick={e => e.stopPropagation()}
        >
            {confirmDelete ? (
                <>
                    <div id="player-edit-title" className={styles.title}>Удалить?</div>
                    <div className={styles.confirm_text}>
                        Игрок <b>{props.player.name}</b> будет удалён.
                    </div>
                    <div className={styles.actions}>
                        <button type="button" className={styles.delete} onClick={onConfirmDelete}>
                            Да, удалить
                        </button>
                        <button type="button" className={styles.cancel} onClick={() => setConfirmDelete(false)}>
                            Назад
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div id="player-edit-title" className={styles.title}>{props.player.name}</div>
                    <label className={styles.field}>
                        <span className={styles.label}>Очки</span>
                        <input
                            className={styles.input}
                            type="number"
                            value={score}
                            onChange={onScoreChange}
                            autoFocus
                        />
                    </label>
                    <div className={styles.actions}>
                        <button type="button" className={styles.save} onClick={onSave}>Сохранить</button>
                        <button type="button" className={styles.delete} onClick={() => setConfirmDelete(true)}>Удалить</button>
                        <button type="button" className={styles.cancel} onClick={props.onClose}>Отмена</button>
                    </div>
                </>
            )}
        </div>
    </div>;
}

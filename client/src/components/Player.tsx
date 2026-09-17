import styles from "../styles/Player.module.css";
import { IPlayer } from "../types/IProgress";
import config from "../config.json";

export function Player(props: IPlayer & { editable?: boolean; onSelect?: (player: IPlayer) => void })
{
    if (props.name === config.emcee)
        return null;
    if (props.name === config.tv)
        return null;

    const onClick = () =>
    {
        if (!props.editable || props.onSelect == null)
            return;

        props.onSelect({ name: props.name, score: props.score, online: props.online });
    };

    return <div
        className={`${styles.player} ${props.online ? styles.online : ""} ${props.editable ? styles.editable : ""}`}
        onClick={onClick}
        role={props.editable ? "button" : undefined}
        tabIndex={props.editable ? 0 : undefined}
        onKeyDown={props.editable ? (e) =>
        {
            if (e.key === "Enter" || e.key === " ")
            {
                e.preventDefault();
                onClick();
            }
        } : undefined}
    >
        <div className="name">{props.name}</div>
        <div className="score">{props.score} очков</div>
    </div>;
}

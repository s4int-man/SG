import { Categories } from "./Categories";
import { Players } from "./Players";
import styles from "../styles/Game.module.css";

export function Game()
{
    return <div className={styles.game}>
        <Categories />
        <Players />
    </div>;
}
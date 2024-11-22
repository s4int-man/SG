import { Categories } from "./Categories";
import styles from "../styles/Game.module.css";

export function Game()
{
    return <div className={styles.game}>
        <Categories />
    </div>;
}
import styles from "../styles/Login.module.css";

export function Loading() {
    return <div className={styles.login}>
        <h1 className={styles.brand}>Святая игра</h1>
        <div className={styles.panel}>
            <div className={styles.label}>Загрузка…</div>
        </div>
    </div>;
}

import { Outlet } from "react-router";
import { Players } from "./Players";
import { Header } from "./Header";
import { useScreenOrientation } from "../hooks/useScreenOrientation";
import { useMediaPreload } from "../hooks/useMediaPreload";
import styles from "../styles/Root.module.css";

export function Layout()
{
    const orientation = useScreenOrientation();
    useMediaPreload();

    console.log(orientation);

    return <div className={styles.layout}>
        <Header />
        <Outlet />
        <Players />
    </div>
}
import { Outlet } from "react-router";
import { Players } from "./Players";
import { Header } from "./Header";
import { useScreenOrientation } from "../hooks/useScreenOrientation";

export function Layout()
{
    const orientation = useScreenOrientation();

    console.log(orientation);

    return <div className="layout">
        <Header />
        <Outlet />
        <Players />
    </div>
}
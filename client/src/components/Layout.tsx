import { Outlet } from "react-router";
import { Players } from "./Players";
import { Header } from "./Header";

export function Layout()
{
    return <div className="layout">
        <Header />
        <Outlet />
        <Players />
    </div>
}
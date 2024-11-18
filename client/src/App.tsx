import React from 'react';
import './App.css';
import { socket } from "../connection/Client";

export function App()
{
    const [isConnected, setIsConnected] = React.useState(socket.connected);

    React.useEffect((): void =>
    {
        socket.on("connect", () => setIsConnected(true));
        socket.on("disconnect", () => setIsConnected(false));
        socket.connect();
    }, []);

    console.log("Status:", isConnected ? "connected" : "disconnected");

    const name: string | null = localStorage.getItem("name");
    
    if (name == null)
        return <Login />;

    return <LoggedIn name={name} />;
};

import { useNavigate } from "react-router-dom";
import { socket } from "../connection/Client";
import React from "react";

export function useConnection()
{
    const navigate = useNavigate();

    const [ isConnected, setIsConnected ] = React.useState(socket.connected);
    console.log("Status:", isConnected ? "connected" : "disconnected");

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onHello = React.useCallback(() => navigate("/game"), [ navigate ]);

    React.useEffect((): void =>
    {
        socket.on("connect", onConnect);
        socket.on("disconnect",onDisconnect);
        socket.on("hello", onHello);
        socket.connect();
    }, [ onHello ]);
}
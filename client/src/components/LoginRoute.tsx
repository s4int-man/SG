import React from "react";
import { LoggedIn } from "./LoggedIn";
import { Login } from "./Login";

export function LoginRoute()
{
    const [ name, setName ] = React.useState<string | null>(localStorage.getItem("name"));
    
    if (name == null)
        return <Login />;

    return <LoggedIn name={name} setName={setName} />;
}
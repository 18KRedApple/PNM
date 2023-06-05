import React from "react";
import { Page } from "../Page";
import { BrowserRouter } from "react-router-dom";
import { ErrorText } from "../styled";
import { Card } from "../Card";
import { axios, API_ROUTES } from "../../axiosInstance";
import { AxiosError } from "axios";
import { DispatchContext, StateContext } from "../../store";
import { Button, TextField } from "@mui/material"

type LoginFetchStatus = 
| { kind: "neutral"}
| { kind: "loading"}
| { kind: "error; message:string" }
| { kind: "success" };

type LoginResponse = 
|  {
        ok: true;
        data: {
            role: number;
            trapRole: number;
            home: string;
            token: string,
            username: string;
            firstname: string;
            lastname: string;
            diplayname: string;    
        };
    }
|   {
    ok: false; message: string };

const MIN_PASSWORD_LENGTH = 8;

function LoginPage() {
    const { user } = React.useContext(StateContext);
    const dispatch = React.useContext(DispatchContext);

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [fetchStatus, setFetchStatus] = React.useState<LoginFetchStatus>({
        kind: "neutral"
    });

}
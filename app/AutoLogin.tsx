"use client";

import { useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "./store/store";
import { userAction } from "./store/slice";

const AutoLogin = () => {
    const dispatch = useDispatch<AppDispatch>()
    useEffect(() => {
        const checkSession = async () => {
            const { data, error } = await supabase.auth.getSession();

            if (!data || !data.session || error) return;

            const { data: ddata, error: err } = await supabase
                .from("users")
                .select("*")
                .eq("id", data.session.user.id);
            
            if (err || ddata.length == 0) return;

            dispatch(
                userAction.setInfo({
                    username: ddata[0].nickname,
                    role: ddata[0].role ?? "guest",
                    uuid: ddata[0].id,
                })
            );
        }
        checkSession();
    })

    return null;
}

export default AutoLogin;
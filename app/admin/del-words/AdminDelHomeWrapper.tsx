"use client";
import NotFound from '@/app/not-found-client';
import { supabase } from "@/app/lib/supabaseClient";
import { useSelector } from 'react-redux';
import { RootState } from "@/app/store/store";
import { useEffect, useState } from 'react';
import WordsDelHome from './DelWordsHome';

export default function AdminDelHomeWrapper(){
    const [isBlock,setIsBlock] = useState(false);
    const [checkingRole,setCheckingRole] = useState(true)
    const user = useSelector((state: RootState) => state.user);
    const [ok, setOk] = useState<boolean>(false)

    useEffect(()=>{
        const checkSession = async () => {
            const { data, error } = await supabase.auth.getSession();

            if (!data || !data.session || error) {
                setCheckingRole(false);
                setIsBlock(true)
                return;
            }

            const { data: ddata, error: err } = await supabase
                .from("users")
                .select("*")
                .eq("id", data.session.user.id);

            if (err || ddata.length == 0){
                setCheckingRole(false);
                setIsBlock(true)
                return;
            }
            setCheckingRole(false);
            setOk(true);
        }
        checkSession()
    },[])

    if (!["admin","r4"].includes(user.role) || isBlock || checkingRole){
        return <NotFound />
    }

    if (ok){
        return <WordsDelHome />
    }
}
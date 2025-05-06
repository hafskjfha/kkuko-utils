"use client";
import AdminHome from "./AdminHome";
import NotFound from '@/app/not-found-client';
import { supabase } from "../lib/supabaseClient";
import { useSelector } from 'react-redux';
import { RootState } from "@/app/store/store";
import { useEffect, useState } from 'react';
import LoadingPage, {useLoadingState } from '@/app/components/LoadingPage';
import ErrorPage from "../components/ErrorPage";
import type { PostgrestError } from "@supabase/supabase-js";
import { DefaultDict } from "../lib/collections";

type Theme = {
    theme_id: number;
    theme_name: string;
    typez?: "add" | "delete"; // 주제 추가/삭제 요청에서만 사용
}

type WordRequest = {
    id: number;
    word: string;
    request_type: "add" | "delete" | "theme_change";
    requested_at: string;
    requested_by_uuid?: string;
    requested_by: string;
    wait_themes?: Theme[];
    word_id?: number; // 주제 변경 요청에서만 사용
}

export default function AdminHomeWrapper(){
    const [isBlock,setIsBlock] = useState(false);
    const [checkingRole,setCheckingRole] = useState(true)
    const user = useSelector((state: RootState) => state.user);
    const { loadingState, updateLoadingState } = useLoadingState();
    const [errorMessage,setErrorMessage] = useState<string|null>(null);
    const [waitDatas,setWaitDatas] = useState<WordRequest[] | null>(null);

    const MakeError = (error: PostgrestError) => {
        setErrorMessage(`문서 정보 데이터 로드중 오류.\nErrorName: ${error.name ?? "알수없음"}\nError Message: ${error.message ?? "없음"}\nError code: ${error.code}`)
        updateLoadingState(100,"ERR");
        return;
    }

    useEffect(()=>{
        const getWaitQueue = async () => {
            updateLoadingState(10, "기존 단어 주제 수정 요청 목록 가져오는 중...");
            const {data: waitThemeWordData, error: waitThemeWordError} = await supabase.from('word_themes_wait').select('*,words(word),themes(name)')
            if (waitThemeWordError) {
                MakeError(waitThemeWordError);
                return;
            }

            updateLoadingState(30, "단어 삭제/추가 요청 단아 가져오는 중...");
            const {data: waitWordsData, error: waitWordsError} = await supabase.from('wait_words').select('*, users(nickname)');
            if (waitWordsError){
                MakeError(waitWordsError);
                return;
            }

            updateLoadingState(60,"추가 요청 단어의 주제 목록 가져오는 중...");
            const {data: waitWordsThemesData, error: waitWordsThemesError} = await supabase.from('wait_word_themes').select('*,themes(name)').in('wait_word_id',waitWordsData.filter((d)=>d.request_type === "add").map(({id})=>id));
            if (waitWordsThemesError){
                MakeError(waitWordsThemesError);
                return;
            }

            updateLoadingState(85, "데이터를 가공 중...");
            const waitQueue: WordRequest[] = [];

            type KK = {
                id: number;
                request_type: "theme_change";
                word: string;
                word_id: number
            }
            const waitThemes: DefaultDict<string, Theme[]> = new DefaultDict(() => []);
            const waitThemesWord: Record<string, KK> = {}
            waitThemeWordData.forEach((data, index)=>{
                waitThemesWord[data.words.word] = {
                    id: 10**8 + index,
                    request_type: "theme_change",
                    word: data.words.word,
                    word_id: data.word_id
                }

                waitThemes.get(data.words.word).push({
                    theme_id: data.theme_id,
                    theme_name: data.themes.name,
                    typez: data.typez
                })
            });

            waitThemes.sortedEntries().forEach((data)=>{
                const r: WordRequest ={
                    ...waitThemesWord[data[0]],
                    wait_themes: data[1],
                    requested_at: "unknown",
                    requested_by: "unknown"
                }
                waitQueue.push(r);
            });

            const waitWordsAddThemes: DefaultDict<number, Theme[]> = new DefaultDict(() => []);
            waitWordsThemesData.forEach((data)=>{
                waitWordsAddThemes.get(data.wait_word_id).push({
                    theme_id: data.theme_id,
                    theme_name: data.themes.name,
                    typez: "add"
                })
            })

            waitWordsData.forEach((data)=>{
                const r: WordRequest = {
                    id: data.id,
                    word: data.word,
                    request_type: data.request_type,
                    requested_at: data.requested_at,
                    requested_by_uuid: data.requested_by ?? undefined,
                    requested_by: data.users?.nickname ?? "unknown",
                    wait_themes: data.request_type === "add" ? waitWordsAddThemes.get(data.id) : undefined
                }
                waitQueue.push(r);
            });

            setWaitDatas(waitQueue);
            updateLoadingState(100, "완료!")
        }

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
            getWaitQueue();
        }
        checkSession();
    },[])







    if (!["admin","r4"].includes(user.role) || isBlock || checkingRole){
        return <NotFound />
    }

    if (loadingState.isLoading) {
        return (
            <LoadingPage title={"관리자 페이지"} />
        );
    }

    if (errorMessage){
        return <ErrorPage message={errorMessage}/>
    }

    if (waitDatas){
        return <AdminHome requestDatas={waitDatas} />
    }
}
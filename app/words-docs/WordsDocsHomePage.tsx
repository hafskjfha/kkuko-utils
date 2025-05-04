"use client";
import { useEffect, useState } from "react";
import WordsDocsHome from "./WordsDocsHome";
import { supabase } from "@/app/lib/supabaseClient";
import ErrorPage from "../components/ErrorPage";
import LoadingPage, {useLoadingState } from '@/app/components/LoadingPage';

type DocsType = {
    id: string;
        name: string;
        maker: string;
        last_update: string; // timestampz (ISO string)
        is_manager: boolean;
        typez: "letter" | "theme" | "ect";
        created_at: string;
};

export default function WordsDocsHomePage(){
    const { loadingState, updateLoadingState } = useLoadingState();
    const [errorMessage,setErrorMessage] = useState<string|null>(null);
    const [docsDatas, setDocsDatas] = useState<DocsType[] | null>(null);


    const setDataFunc = (docs: DocsType[]) => {
        setDocsDatas(docs);
    }
    

    useEffect(()=>{
        const getData = async () => {

            updateLoadingState(60, "문서 정보 가져오는 중...");
            const { data: docsData, error: docsError} = await supabase.from('docs').select('*, users(nickname)');

            if (docsError){
                setErrorMessage(`문서 정보 데이터 로드중 오류.\nErrorName: ${docsError.name ?? "알수없음"}\nError Message: ${docsError.message ?? "없음"}\nError code: ${docsError.code}`)
                updateLoadingState(100,"ERR");
                return;
            }
            updateLoadingState(90, "데이터 가공 중...");
            const docs:DocsType[] = docsData.map(({ id, name, users, typez, last_update, created_at }) => ({
                id: `${id}`, name, maker: users?.nickname ?? "알수없음", last_update, is_manager: false, typez, created_at
            }));
            
            setDataFunc(docs);
            updateLoadingState(100, "완료");
        }
        getData();
    },[])
    
    if (loadingState.isLoading) {
        return (
            <LoadingPage title={"문서 목록"} />
        );
    }

    if (errorMessage){
        return <ErrorPage message={errorMessage}/>
    }

    if (docsDatas){
        return <WordsDocsHome docs={docsDatas} />
    }

    return null
}
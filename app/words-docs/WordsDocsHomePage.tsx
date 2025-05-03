"use client";
import { useEffect, useState } from "react";
import WordsDocsHome from "./WordsDocsHome";
import { supabase } from "@/app/lib/supabaseClient";
import ProgressBar from "../components/ProgressBar";
import type { LoadingState } from "../types/type";
import Spinner from "../components/Spinner";
import ErrorPage from "../components/ErrorPage";

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
    const [loadingState, setLoadingState] = useState<LoadingState>({
            isLoading: true,
            progress: 0,
            currentTask: "초기화 중..."
        });
    const [errorMessage,setErrorMessage] = useState<string|null>(null);
    const [docsDatas, setDocsDatas] = useState<DocsType[] | null>(null);

    // 로딩 상태와 진행률 업데이트 함수
    const updateLoadingState = (progress: number, task: string) => {
        setLoadingState({
            isLoading: progress < 100,
            progress,
            currentTask: task
        });
    };

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
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow min-h-screen min-w-full">
                <h2 className="text-xl font-bold mb-4">단어 정보 로딩 중</h2>
                <div className="w-full max-w-md mb-4">
                    <ProgressBar
                        completed={loadingState.progress}
                        label={`${loadingState.progress}% 완료`}
                    />
                </div>
                <p className="text-gray-600 mt-2">{loadingState.currentTask}</p>
                <div className="mt-4">
                    <Spinner />
                </div>
            </div>
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
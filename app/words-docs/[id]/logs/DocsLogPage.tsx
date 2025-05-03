"use client";
import DocsLogs from "./DocsLogs";
import NotFound from "@/app/not-found-client";
import { supabase } from "@/app/lib/supabaseClient";
import { useState, useEffect, useCallback } from 'react';
import ProgressBar from "@/app/components/ProgressBar";
import type { LoadingState } from "@/app/types/type";
import Spinner from "@/app/components/Spinner";
import ErrorPage from "@/app/components/ErrorPage";

type log = {
    id: number;
    word: string;
    user: string | undefined;
    date: string;
    type: "add" | "delete";
}

export default function DocsLogPage({id}:{id: number}){
    const [isNotFound,setIsNotFound] = useState(false);
    const [loadingState, setLoadingState] = useState<LoadingState>({
            isLoading: true,
            progress: 0,
            currentTask: "초기화 중..."
        });
    const [errorMessage,setErrorMessage] = useState<string|null>(null);
    const [logsData, setLogsDatas] = useState<{logs:log[], docsName: string}|null>(null);

    const updateLoadingState = (progress: number, task: string) => {
        setLoadingState({
            isLoading: progress < 100,
            progress,
            currentTask: task
        });
    };

    const getDocs = useCallback(async () => {
        const { data, error } = await supabase
            .from("docs")
            .select("name")
            .eq("id", id)
            .maybeSingle();

        return {data, error};
    },[]);

    const getLogs = useCallback(async () => {
        const { data, error } = await supabase
            .from("docs_logs")
            .select("*, users(nickname)")
            .eq("docs_id", id)
            .order("date", { ascending: false });
    
        return {data, error};
    },[]);

    useEffect(()=>{
        const getData = async () => {
            updateLoadingState(25,"문서 정보 가져오는 중...");
            const {data: docsData, error: docsDataError} = await getDocs();
            if (docsData === null) return setIsNotFound(true);
            if (docsDataError){
                setErrorMessage(`문서 정보 데이터 로드중 오류.\nErrorName: ${docsDataError.name ?? "알수없음"}\nError Message: ${docsDataError.message ?? "없음"}\nError code: ${docsDataError.code}`)
                updateLoadingState(100,"ERR");
                return;
            }

            updateLoadingState(40,"로그 가져오는 중...");
            const {data: logData, error: logDataError} = await getLogs();
            if (logDataError){
                setErrorMessage(`문서 정보 데이터 로드중 오류.\nErrorName: ${logDataError.name ?? "알수없음"}\nError Message: ${logDataError.message ?? "없음"}\nError code: ${logDataError.code}`)
                updateLoadingState(100,"ERR");
                return;
            }

            updateLoadingState(90,"데이터 가공중...");
            const logsData = logData?.map((log) => ({
                id: log.id,
                word: log.word,
                user: log.users?.nickname,
                date: log.date,
                type: log.type,
            }));

            setLogsDatas({logs:logsData ?? [], docsName: docsData?.name});
            updateLoadingState(100,"완료!");
        }   
        getData()
    },[]);

    if (isNotFound) return <NotFound />;
    
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

    if (logsData){
        return <DocsLogs id={id} name={logsData.docsName} Logs={logsData.logs} />;
    }

}
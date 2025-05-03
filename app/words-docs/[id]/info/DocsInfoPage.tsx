"use client";
import { supabase } from "@/app/lib/supabaseClient";
import NotFound from "@/app/not-found-client";
import ErrorPage from "@/app/components/ErrorPage"
import { useCallback, useEffect, useState } from "react";
import type { LoadingState } from "@/app/types/type";
import Spinner from "@/app/components/Spinner";
import ProgressBar from "@/app/components/ProgressBar";
import DocsInfo from "./DocsInfo";

type docsInfoType = {
    metadata: {
        id: number;
        created_at: string;
        name: string;
        users: {
            nickname: string;
        } | null;
        typez: "letter" | "theme" | "ect";
        last_update: string;
    };
    wordsCount: number
}

export default function DocsInfoPage({ id }: { id: number }) {
    const [isNotFound, setIsNotFound] = useState(false);
    const [loadingState, setLoadingState] = useState<LoadingState>({
        isLoading: true,
        progress: 0,
        currentTask: "초기화 중..."
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [docsInfoData, setDocsInfoData] = useState<docsInfoType | null>(null);

    const updateLoadingState = (progress: number, task: string) => {
        setLoadingState({
            isLoading: progress < 100,
            progress,
            currentTask: task
        });
    };

    const getDocs = useCallback(async () => {
        const { data, error } = await supabase.from('docs').select('id, created_at, name, users(nickname), typez, last_update').eq('id', id).maybeSingle();
        return { data, error }
    }, []);

    const getDataOkWords = useCallback(async () => {
        const { data: dataA, error } = await supabase.from('docs_words').select('words(word)').eq('docs_id', id);
        if (error) return { words: null, error }

        const words = dataA.map((wordk) => wordk.words.word);
        return { words, error: null };
    }, []);

    useEffect(()=>{
        const getData = async () => {
            updateLoadingState(25,"문서 정보 가져오는 중...");
            const {data: docsData, error: docsDataError} = await getDocs();
            if (docsDataError){
                setErrorMessage(`문서 정보 데이터 로드중 오류.\nErrorName: ${docsDataError.name ?? "알수없음"}\nError Message: ${docsDataError.message ?? "없음"}\nError code: ${docsDataError.code}`)
                updateLoadingState(100,"ERR");
                return;
            }
            if (docsData === null) return setIsNotFound(true);

            updateLoadingState(40,"문서 정보 가져오는 중...");
            if (docsData.typez === "letter"){
                const {data:LetterDatas1, error:error1} = await supabase.from('words').select('word').eq('last_letter',docsData.name.trim()).eq('k_canuse',true);
                if (error1){
                    setErrorMessage(`문서 정보 데이터 로드중 오류.\nErrorName: ${error1.name ?? "알수없음"}\nError Message: ${error1.message ?? "없음"}\nError code: ${error1.code}`)
                    updateLoadingState(100,"ERR");
                    return;
                }

                updateLoadingState(90,"데이터 가공중...");
                setDocsInfoData({metadata:docsData, wordsCount: LetterDatas1.length});
                updateLoadingState(100,"완료!");
                return;
            }
            else if (docsData.typez === "theme"){
                // 추가 예정
            }
            else{
                const {words, error} = await getDataOkWords()
                if (error){
                    setErrorMessage(`문서 정보 데이터 로드중 오류.\nErrorName: ${error.name ?? "알수없음"}\nError Message: ${error.message ?? "없음"}\nError code: ${error.code}`)
                    updateLoadingState(100,"ERR");
                    return;
                }

                updateLoadingState(90,"데이터 가공중...");
                setDocsInfoData({metadata:docsData, wordsCount: words.length});
                updateLoadingState(100,"완료!");
                return;
            }
        };
        getData();
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

    if (errorMessage) {
        return <ErrorPage message={errorMessage} />
    }

    if (docsInfoData){
        return <DocsInfo metaData={docsInfoData.metadata} wordsCount={docsInfoData.wordsCount} />
    }
}

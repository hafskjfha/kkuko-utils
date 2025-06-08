"use client";
import { supabase } from "@/app/lib/supabaseClient";
import NotFound from "@/app/not-found-client";
import ErrorPage from "@/app/components/ErrorPage"
import { useCallback, useEffect, useState } from "react";
import DocsInfo from "./DocsInfo";
import LoadingPage, {useLoadingState } from '@/app/components/LoadingPage';

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
    wordsCount: number;
    starCount: number;
}

export default function DocsInfoPage({ id }: { id: number }) {
    const [isNotFound, setIsNotFound] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [docsInfoData, setDocsInfoData] = useState<docsInfoType | null>(null);
    const { loadingState, updateLoadingState } = useLoadingState();

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
            const {data: docsStarData, error: docsStarError} = await supabase.from('user_star_docs').select('user_id').eq('docs_id',docsData.id)
            if (docsStarError) return setErrorMessage(`문서 정보 데이터 로드중 오류.\nErrorName: ${docsStarError.name ?? "알수없음"}\nError Message: ${docsStarError.message ?? "없음"}\nError code: ${docsStarError.code}`);

            updateLoadingState(40,"문서의 단어 정보 가져오는 중...");
            if (docsData.typez === "letter"){
                const {data:LetterDatas1, error:error1} = await supabase.from('words').select('word').eq('last_letter',docsData.name.trim()).eq('k_canuse',true);
                if (error1){
                    setErrorMessage(`문서 정보 데이터 로드중 오류.\nErrorName: ${error1.name ?? "알수없음"}\nError Message: ${error1.message ?? "없음"}\nError code: ${error1.code}`)
                    updateLoadingState(100,"ERR");
                    return;
                }

                updateLoadingState(90,"데이터 가공중...");
                setDocsInfoData({metadata:docsData, wordsCount: LetterDatas1.length, starCount:docsStarData.length});
                updateLoadingState(100,"완료!");
                return;
            }
            else if (docsData.typez === "theme"){
                updateLoadingState(35,"주제 정보 가져오는 중...");
                const {data: themeData, error: themeDataError} = await supabase.from('themes').select('*').eq('name',docsData.name).maybeSingle();
                if (themeDataError){
                    setErrorMessage(`문서 정보 데이터 로드중 오류.\nErrorName: ${themeDataError.name ?? "알수없음"}\nError Message: ${themeDataError.message ?? "없음"}\nError code: ${themeDataError.code}`)
                    updateLoadingState(100,"ERR");
                    return;
                }
                if (!themeData) return setIsNotFound(true);

                updateLoadingState(50,"문서의 단어 정보 가져오는 중...");
                const {data: themeWordsData1, error: themeWordsError1} = await supabase.from('word_themes').select('words(*)').eq('theme_id',themeData.id);
                if (themeWordsError1){
                    setErrorMessage(`문서 정보 데이터 로드중 오류.\nErrorName: ${themeWordsError1.name ?? "알수없음"}\nError Message: ${themeWordsError1.message ?? "없음"}\nError code: ${themeWordsError1.code}`)
                    updateLoadingState(100,"ERR");
                    return;
                }

                updateLoadingState(90,"데이터 가공중...");
                setDocsInfoData({metadata:docsData, wordsCount: themeWordsData1.length, starCount:docsStarData.length});

                updateLoadingState(100,"완료!");
                return;
            }
            else{
                const {words, error} = await getDataOkWords()
                if (error){
                    setErrorMessage(`문서 정보 데이터 로드중 오류.\nErrorName: ${error.name ?? "알수없음"}\nError Message: ${error.message ?? "없음"}\nError code: ${error.code}`)
                    updateLoadingState(100,"ERR");
                    return;
                }

                updateLoadingState(90,"데이터 가공중...");
                setDocsInfoData({metadata:docsData, wordsCount: words.length, starCount:docsStarData.length});
                updateLoadingState(100,"완료!");
                return;
            }
        };
        getData();
    },[]);

    if (isNotFound) return <NotFound />;

    if (loadingState.isLoading) {
        return (
            <LoadingPage title={"문서 정보"}/>
        );
    }

    if (errorMessage) {
        return <ErrorPage message={errorMessage} />
    }

    if (docsInfoData){
        return <DocsInfo metaData={docsInfoData.metadata} wordsCount={docsInfoData.wordsCount} starCount={docsInfoData.starCount} />
    }
}

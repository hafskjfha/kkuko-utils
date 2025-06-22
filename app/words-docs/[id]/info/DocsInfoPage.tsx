"use client";
import { SCM } from "@/app/lib/supabaseClient";
import NotFound from "@/app/not-found-client";
import ErrorPage from "@/app/components/ErrorPage"
import { useEffect, useState } from "react";
import DocsInfo from "./DocsInfo";
import LoadingPage, { useLoadingState } from '@/app/components/LoadingPage';
import type { PostgrestError } from "@supabase/supabase-js";

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
        views: number;
    };
    wordsCount: number;
    starCount: number;
    rank: number

}

export default function DocsInfoPage({ id }: { id: number }) {
    const [isNotFound, setIsNotFound] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [docsInfoData, setDocsInfoData] = useState<docsInfoType | null>(null);
    const { loadingState, updateLoadingState } = useLoadingState();

    const hanldeError = (error: PostgrestError) => {
        setErrorMessage(`문서 정보 데이터 로드중 오류.\nErrorName: ${error.name ?? "알수없음"}\nError Message: ${error.message ?? "없음"}\nError code: ${error.code}`);
        updateLoadingState(100,"ERR");
    }

    useEffect(()=>{
        const getData = async () => {
            updateLoadingState(25,"문서 정보 가져오는 중...");
            // 문서 정보 가져오기
            const {data: docsData, error: docsDataError} = await SCM.get().docs(id);
            if (docsDataError){ return hanldeError(docsDataError); }
            if (docsData === null) return setIsNotFound(true);
            const {data: docsStarData, error: docsStarError} = await SCM.get().docsStarCount(docsData.id);
            if (docsStarError) return hanldeError(docsStarError);

            updateLoadingState(40,"문서의 단어 정보 가져오는 중...");
            // 문서 타입에 맞게 단어정보 가져오기
            if (docsData.typez === "letter"){
                const {count:LetterDatas1, error:error1} = await SCM.get().docsWordCount({name: docsData.name, duem: docsData.duem, typez: "letter"});
                if (error1){ return hanldeError(error1);}
                const {data, error} = await SCM.get().docsRank(docsData.id);
                if (error){ return hanldeError(error); }
                updateLoadingState(90,"데이터 가공중...");
                setDocsInfoData({metadata:docsData, wordsCount: LetterDatas1 ?? -1, rank:data, starCount:docsStarData});

                updateLoadingState(100,"완료!");
                return;
            }
            else if (docsData.typez === "theme"){
                updateLoadingState(35,"주제 정보 가져오는 중...");
                const {data: themeData, error: themeDataError} = await SCM.get().theme(docsData.name);
                if (themeDataError){ return hanldeError(themeDataError); }
                if (!themeData) return setIsNotFound(true);

                updateLoadingState(50,"문서의 단어 정보 가져오는 중...");
                const {count: themeWordsData1, error: themeWordsError1} = await SCM.get().docsWordCount({name: themeData.name, duem: docsData.duem, typez: "theme"});
                if (themeWordsError1){ return hanldeError(themeWordsError1); }
                const {data, error} = await SCM.get().docsRank(docsData.id);
                if (error){ return hanldeError(error); }

                updateLoadingState(90,"데이터 가공중...");
                setDocsInfoData({metadata:docsData, wordsCount: themeWordsData1 ?? -1, rank: data, starCount:docsStarData});
                updateLoadingState(100,"완료!");
                return;
            }
            else{
                const {words, error} = await SCM.get().docsOkWords(docsData.id);
                if (error){
                    setErrorMessage(`문서 정보 데이터 로드중 오류.\nErrorName: ${error.name ?? "알수없음"}\nError Message: ${error.message ?? "없음"}\nError code: ${error.code}`)
                    updateLoadingState(100,"ERR");
                    return;
                }
                const {data, error:errorl} = await SCM.get().docsRank(docsData.id);
                if (errorl){
                    setErrorMessage(`문서 정보 데이터 로드중 오류.\nErrorName: ${errorl.name ?? "알수없음"}\nError Message: ${errorl.message ?? "없음"}\nError code: ${errorl.code}`)
                    updateLoadingState(100,"ERR");
                    return;
                }
                updateLoadingState(90,"데이터 가공중...");
                setDocsInfoData({metadata:docsData, wordsCount: words.length, rank: data, starCount:docsStarData});
                updateLoadingState(100,"완료!");
                return;
            }
        };
        getData();
    },[]);

    if (isNotFound) return <NotFound />;

    if (loadingState.isLoading) return <LoadingPage title={"문서 정보"}/>;

    if (errorMessage) return <ErrorPage message={errorMessage} />;

    if (docsInfoData) return <DocsInfo metaData={docsInfoData.metadata} wordsCount={docsInfoData.wordsCount} docsViewRank={docsInfoData.rank} starCount={docsInfoData.starCount} />;
}

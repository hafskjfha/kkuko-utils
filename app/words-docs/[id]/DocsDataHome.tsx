"use client";
import DocsDataPage from "./DocsDataPage";
import { supabase } from "@/app/lib/supabaseClient";
import NotFound from "@/app/not-found-client";
import ErrorPage from "@/app/components/ErrorPage";
import { useState, useCallback, useEffect } from "react";
import type { PostgrestError } from "@supabase/supabase-js";
import LoadingPage, {useLoadingState } from '@/app/components/LoadingPage';

type wordsDataType = ({
    word: string;
    status: "add" | "delete";
    maker: string | null | undefined;
} | {
    word: string;
    status: "ok";
    maker: undefined;
} | {
    word: string;
    status: "eadd" | "edelete";
    maker: string | null | undefined;
})

export default function DocsDataHome({id}:{id:number}){
    const [isNotFound,setIsNotFound] = useState(false);
    const { loadingState, updateLoadingState } = useLoadingState();
    const [errorMessage,setErrorMessage] = useState<string|null>(null);
    const [wordsData,setWordsData] = useState<{words:wordsDataType[], metadata:{title:string, lastUpdate:string, typez: "letter" | "theme" | "ect"}} | null>(null);

    const getDataOkWords = useCallback(async () => {
        const {data:dataA, error:error} = await supabase.from('docs_words').select('words(word)').eq('docs_id',id);
        if (error) return {words: null, error};
        
        const words = dataA.map((wordk)=>({word: wordk.words.word, status: "ok"}));
        return {words, error: null};
    },[])

    const getDataWaitWords = useCallback(async () => {
        const {data, error} = await supabase.from('docs_wait_words').select('wait_words(word, status, request_type, users(id))').eq('docs_id',id);
        if (error)return {words:null, error}
    
        const words = data.map(({wait_words})=>({
            word: wait_words.word, 
            status: wait_words.status, 
            rType: wait_words.request_type, 
            maker: wait_words.users?.id }))
            .filter((w)=>w.status === "pending")
            .map(({word, rType, maker})=>({
                word, status: rType, maker })
            )
        return {words, error:null};
    },[]);

    const getDocsInfo = useCallback(async () => {
        const {data, error} = await supabase.from('docs').select('*').eq("id",id).maybeSingle();
        return {data, error}
    },[]);

    const getDataWaitWordsA = useCallback(async () => {
        const {data, error} = await supabase.from('docs_words_wait').select('words(word), typez, users(id)').eq('docs_id',id);
        if (error)return {words:null,error};
    
        const words = data.map((wordk)=>({
            word: wordk.words.word,
            status: wordk.typez === "add" ? "eadd" : "edelete" ,
            maker: wordk.users?.id
        } as const))
        return {words, error:null}
    },[]);

    const MakeError = (erorr: PostgrestError) => {
        setErrorMessage(`문서 정보 데이터 로드중 오류.\nErrorName: ${erorr.name ?? "알수없음"}\nError Message: ${erorr.message ?? "없음"}\nError code: ${erorr.code}`)
        updateLoadingState(100,"ERR");
        return;
    }

    useEffect(()=>{
        const getDatas = async () => {
            updateLoadingState(10,"문서 정보 가져오는 중...")
            const {data: docsData, error: docsDataError} = await getDocsInfo();
            if (docsDataError) return MakeError(docsDataError);
            if (docsData===null) return setIsNotFound(true);

            if (docsData.typez === "letter"){
                updateLoadingState(40, "문서에 들어간 단어 정보 가져오는 중...");
                const {data:LetterDatas1, error:error1} = await supabase.from('words').select('*').eq('last_letter',docsData.name.trim()).eq('k_canuse',true).neq('length',1);
                if (error1) return MakeError(error1);
                const {data:LetterDatas2, error:error2} = await supabase.from('wait_words').select('*').ilike('word',`%${docsData.name.trim()}`);
                if (error2) return MakeError(error2);
                
                updateLoadingState(70, "데이터를 가공중...")
                const wordsNotInB = LetterDatas1.filter(a => !LetterDatas2.some(b => b.word === a.word)).map((p)=>({word: p.word, status: "ok" as const, maker: undefined}));
                const wordsData = [...wordsNotInB, ...LetterDatas2.filter(({word})=>word.length > 1).map(({word,requested_by,request_type})=>({word, status: request_type, maker:requested_by}))]
                const p = {title: docsData.name, lastUpdate: docsData.last_update, typez:docsData.typez}
                setWordsData({words: wordsData, metadata: p});
                updateLoadingState(100, "완료!");
                return;
            }
            else if (docsData.typez === "theme"){
                updateLoadingState(30, "문서에 들어간 단어 정보 가져오는 중...");
                const {data: themeData, error: themeDataError} = await supabase.from('themes').select('*').eq('name',docsData.name).maybeSingle();
                if (themeDataError) return MakeError(themeDataError);
                if (!themeData) return setIsNotFound(true)
                const {data: themeWordsData1, error: themeWordsError1} = await supabase.from('word_themes').select('words(*)').eq('theme_id',themeData.id);
                if (themeWordsError1) return MakeError(themeWordsError1);
                const {data: themeWordsData2, error: themeWordsError2} = await supabase.from('word_themes_wait').select('words(*),typez').eq('theme_id', themeData.id)
                if (themeWordsError2) return MakeError(themeWordsError2);
                const {data: themeWordsData3, error: themeWordsError3} = await supabase.from('wait_word_themes').select('wait_words(*)').eq('theme_id', themeData.id)
                if (themeWordsError3) return MakeError(themeWordsError3);
                const {data: themeWordsData4, error: themeWordError4} = await supabase.from('wait_words').select('*').eq('request_type',"delete");
                if (themeWordError4) return MakeError(themeWordError4);
                const {data: wprdsA, error} = await supabase.from('words').select('word,id').in('word',themeWordsData4.map(({word})=>word))
                if (error) return MakeError(error);
                const themeWordsData5 = wprdsA.filter(({word})=>!themeWordsData3.some(b=>b.wait_words.word === word)).map(({id})=>id);
                const {data: themeWordsData6, error: themeWordError6} = await supabase.from('word_themes').select('*,words(word)').in('word_id',themeWordsData5);
                if (themeWordError6) return MakeError(themeWordError6);

                updateLoadingState(70, "데이터를 가공중...");
                const Data1NotInData2And3And6 = themeWordsData1
                    .filter(a=>!themeWordsData2.some(b=> b.words.word === a.words.word) && !themeWordsData3.some(c=>c.wait_words.word === a.words.word) && !themeWordsData6.some(d=>d.words.word === a.words.word))
                    .map(d=>({word: d.words.word, status: "ok" as const, maker: undefined}));
                const Data2InWaitAdd = themeWordsData2
                    .filter(d=>d.typez === "add" && !themeWordsData3.some(c=>c.wait_words.word === d.words.word))
                    .map(({words})=>({word: words.word, status: "add" as const, maker: undefined}));
                const Data2InWaitDelete = themeWordsData2
                    .filter(d=>d.typez === "delete" && !themeWordsData3.some(c=>c.wait_words.word === d.words.word))
                    .map(({words})=>({word: words.word, status: "delete" as const, maker: undefined}));
                const Data3InWait = themeWordsData3
                    .map(({wait_words})=>({word: wait_words.word, status: wait_words.request_type, maker: wait_words.requested_by ?? undefined}))
                const Data4In6Wait = themeWordsData4
                    .filter(({word})=>themeWordsData6.some((b=>b.words.word===word)))
                    .map(data=>({word:data.word, status: data.request_type, maker: data.requested_by ?? undefined}));
                
                const wordsData = [...Data3InWait, ...Data4In6Wait, ...Data2InWaitAdd, ...Data2InWaitDelete, ...Data1NotInData2And3And6 ];
                const p = {title: docsData.name, lastUpdate: docsData.last_update, typez: docsData.typez}
                setWordsData({words:wordsData, metadata:p});
                updateLoadingState(100, "완료!");
                return

            }
            else{
                updateLoadingState(30, "문서에 들어간 단어 정보 가져오는 중...");
                const [{words:A,error: errorA},{words:B,error:errorB},{words:C, error:errorC}] = await Promise.all([getDataOkWords(), getDataWaitWords(),getDataWaitWordsA()]);
                if (errorA) return MakeError(errorA);
                if (errorB) return MakeError(errorB);
                if (errorC) return MakeError(errorC);

                updateLoadingState(70, "데이터를 가공중...");
                const wordsNotInB = A.filter(a => !B.some(b => b.word === a.word)).map((p)=>({word: p.word, status: p.status as "ok", maker: undefined}))
                const wordsNotInC = wordsNotInB.filter(a => !C.some(c => c.word === a.word)).map((p)=>({word: p.word, status: p.status as "ok", maker: undefined}))
                const CwordsNotInB = C.filter(c => !B.some(b => b.word === c.word)).map((p)=>({word: p.word, status: p.status as "eadd" | "edelete", maker: p.maker}))
                const wordsData = [...wordsNotInC,...CwordsNotInB, ...B]
                const p = {title: docsData.name, lastUpdate: docsData.last_update, typez: docsData.typez}
                
                setWordsData({words:wordsData, metadata:p});
                updateLoadingState(100, "완료!");
                return;
            }
        }
        getDatas();
    },[])
    
    if (isNotFound) return <NotFound />;

    if (loadingState.isLoading) {
        return (
            <LoadingPage title={"문서"} />
        );
    }

    if (errorMessage){
        return <ErrorPage message={errorMessage}/>
    }

    if (wordsData){
        return <DocsDataPage id={id} data={wordsData.words} metaData={wordsData.metadata}/>
    }
}
"use client";
import { useState, lazy, Suspense, useCallback, useMemo } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, ColumnDef, SortingState } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { WordData } from "@/app/types/type";
import { useSelector } from 'react-redux';
import { RootState } from "@/app/store/store";
import ErrorModal from "@/app/components/ErrModal";
import type { ErrorMessage } from "@/app/types/type";
import { SCM, supabase } from '@/app/lib/supabaseClient';
import type { PostgrestError } from "@supabase/supabase-js";
import { noInjungTopicID } from "./const";
import Spinner from "@/app/components/Spinner";
import CompleteModal from "@/app/components/CompleteModal";
import Link from "next/link";

const WorkModal = lazy(() => import("./WorkModal"));

interface DocsLogData {
    readonly word: string;
    readonly docs_id: number;
    readonly add_by: string | null;
    readonly type: "add" | "delete";
}

interface WordLogData {
    readonly word: string;
    readonly make_by: string | null;
    readonly processed_by: string | null;
    readonly r_type: "add" | "delete";
    readonly state: "approved" | "rejected";
}

type DocsLogDatas = DocsLogData[];
type WordLogDatas = WordLogData[];

const useWorkFunc = ({makeError, setIsProcessing, user, isProcessing, id, CompleWork}:{
    makeError: (error: PostgrestError) => void,
    setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>,
    user: RootState['user'],
    id: string,
    CompleWork: () => void,
    isProcessing: boolean
}) => {
    const WriteDocsLog = useCallback(async (logsData: DocsLogDatas) => {
        const { error: insertDocsLogDataError } = await SCM.addDocsLog(logsData);
            if (insertDocsLogDataError) {
                makeError(insertDocsLogDataError);
                setIsProcessing(false);
                return;
            }
    },[]);

    const WriteWordLog = useCallback(async (logsData: WordLogDatas) => {
        const { error: insertWordLogDataError } = await SCM.addWordLog(logsData);
            if (insertWordLogDataError) {
                makeError(insertWordLogDataError);
                setIsProcessing(false);
                return;
            }
    },[]);
    
    const AddDocs = useCallback(async (docsAddData: { word_id: number; docs_id: number }[]) => {
        try {
            const { data: insertAddAcceptDocsData, error: insertAddAcceptDocsDataError } = await supabase
                .from('docs_words')
                .insert(docsAddData)
                .select('*');
            if (insertAddAcceptDocsDataError) {
                throw insertAddAcceptDocsDataError;
            }
            return insertAddAcceptDocsData;
        } catch (error) {
            makeError(error as PostgrestError);
            setIsProcessing(false);
            return null;
        }
    }, []);

    const AddAccept = useCallback(async (word: string) => {
        if (user.role !== "admin" && user.role !== "r4" && isProcessing) return;
        setIsProcessing(true);

        try {
            // 1. 추가 요청 단어 정보 가져오기
            const { data: getWaitWordData, error: getWaitWordDataError } = await SCM.getWaitWordInfo(word);
            if (getWaitWordDataError) return makeError(getWaitWordDataError)
            if (!getWaitWordData) return;

            // 2. 추가 요청 단어의 주제 정보 가져오기
            const { data: getWordThemesData, error: getWordThemesDataError } = await SCM.getWaitWordThemes(getWaitWordData.id);
            if (getWordThemesDataError) makeError(getWordThemesDataError);
            if (!getWordThemesData) return;

            // 3. 단어 데이터 추가
            const isNoinWord = getWordThemesData.some((t) => noInjungTopicID.includes(t.theme_id));
            const insertWordData = { word: getWaitWordData.word, noin_canuse: isNoinWord, added_by: getWaitWordData.requested_by};
            const { data: getAddAcceptDatab, error: getAddAcceptDataError } = await SCM.addWord([insertWordData])
            if (getAddAcceptDataError) return makeError(getAddAcceptDataError);

            const getAddAcceptData = getAddAcceptDatab[0];

            // 4. 단어 주제 데이터 추가
            const insertWordThemesData = getWordThemesData.map((t) => ({
                word_id: getAddAcceptData.id,
                theme_id: t.theme_id,
            }));
            const { error: getAddAcceptThemesDataError } = await SCM.addWordThemes(insertWordThemesData);
            if (getAddAcceptThemesDataError) return makeError(getAddAcceptThemesDataError);

            // 5. 단어 추가 로그 등록
            const insertWordLogData = {
                word: getWaitWordData.word,
                make_by: getWaitWordData.requested_by,
                processed_by: user.uuid || null,
                r_type: "add",
                state: "approved",
            } as const;
            await WriteWordLog([insertWordLogData]);

            // 6. 문서와 추가 요청 처리
            const { data: getAddAcceptDocsData, error: getAddAcceptDocsDataError } = await supabase
                .from('docs_wait_words')
                .select('*')
                .eq('wait_word_id', getWaitWordData.id);
            if (getAddAcceptDocsDataError) throw getAddAcceptDocsDataError;

            if (getAddAcceptDocsData) {
                const insertDocsData = getAddAcceptDocsData.map((d) => ({
                    docs_id: d.docs_id,
                    word_id: getAddAcceptData.id,
                }));
                const insertAddAcceptDocsData = await AddDocs(insertDocsData);
                if (!insertAddAcceptDocsData) return;

                // 문서 로그 추가
                const insertDocsLogData = insertAddAcceptDocsData.map((d) => ({
                    word: getWaitWordData.word,
                    docs_id: d.docs_id,
                    add_by: getWaitWordData.requested_by,
                    type: "add" as const,
                }));
                WriteDocsLog(insertDocsLogData);
            }

            const {data: docsDatas, error: docsError} = await supabase.from('docs').select('*');
            if (docsError) return makeError(docsError)
            const letterDocs = docsDatas.filter(({typez})=>typez==="letter");
            const themeDocs = docsDatas.filter(({typez})=>typez === "theme");

            const okLetterDocs = letterDocs
                .filter(({name})=>getAddAcceptData.word[getAddAcceptData.word.length-1]===name)
                .map(d=>({
                    word: getWaitWordData.word,
                    docs_id: d.id,
                    add_by: getWaitWordData.requested_by,
                    type: "add" as const
                }));
            WriteDocsLog(okLetterDocs);
            const okThemeDocs = themeDocs
                .filter(({name})=>getWordThemesData.some(b=>b.themes.name === name))
                .map(d=>({
                    word: getWaitWordData.word,
                    docs_id: d.id,
                    add_by: getWaitWordData.requested_by,
                    type: "add" as const
                }))
            const okThemeDocsA = themeDocs
                .filter(({name})=>getWordThemesData.some(b=>b.themes.name === name))
                .map(({id})=>id);
            WriteDocsLog(okThemeDocs);
            
            const okLetterDocsA = letterDocs
                .filter(({name})=>getAddAcceptData.word[getAddAcceptData.word.length-1]===name)
                .map(({id})=>id)
            
            okLetterDocsA.forEach(async (v)=>{
                await supabase.rpc('update_last_update',{docs_id:v})
            })
            
            okThemeDocsA.forEach(async (v)=>{
                await supabase.rpc('update_last_update',{docs_id:v})
            })

            if (getWaitWordData.requested_by){
                await supabase.rpc('increment_contribution',{target_id: getWaitWordData.requested_by, inc_amount:1})
            }

            // 7. 추가 요청 테이블에서 삭제
            const { error: deleteWaitWordDataError } = await supabase   
                .from('wait_words')
                .delete()
                .eq('id', getWaitWordData.id);
            if (deleteWaitWordDataError) throw deleteWaitWordDataError;

            setIsProcessing(false);
            CompleWork();
        } catch (error) {
            makeError(error as PostgrestError);
            setIsProcessing(false);
        }
    },[]);

    const AddReject = useCallback(async (word: string) => {
        // 권한 체크 및 중복 요청 방지
        if (user.role !== "admin" && user.role !== "r4" && isProcessing) return;
        setIsProcessing(true);

        // 1. 추가 요청단어 정보 가져오기
        const { data: getWaitWordData, error: getWaitWordDataError } = await supabase.from('wait_words').select('*').eq('word', word).maybeSingle();
        if (getWaitWordDataError) {
            makeError(getWaitWordDataError);
            setIsProcessing(false);
            return;
        }
        if (!getWaitWordData) return;

        // 2.1 추가 요청 거부
        const { error: deleteWaitWordDataError } = await supabase.from('wait_words').delete().eq('id', getWaitWordData.id);
        if (deleteWaitWordDataError) {
            makeError(deleteWaitWordDataError);
            setIsProcessing(false);
            return;
        }

        // 2.2 로그 등록
        const insertWordLogData = {
            word: getWaitWordData.word,
            make_by: getWaitWordData.requested_by,
            processed_by: user.uuid || null,
            r_type: "add",
            state: "rejected"
        } as const;
        WriteWordLog([insertWordLogData]);

        setIsProcessing(false);
        CompleWork();
        return;
    },[]);

    const DeleteAccept = useCallback(async (word: string) => {
        // 권한 체크 및 중복 요청 방지
        if (user.role !== "admin" && user.role !== "r4" && isProcessing) return;
        setIsProcessing(true);

        // 1. 삭제 요청단어 정보 가져오기
        const { data: getWaitWordData, error: getWaitWordDataError } = await supabase.from('wait_words').select('*').eq('word', word).maybeSingle();
        if (getWaitWordDataError) {
            makeError(getWaitWordDataError);
            setIsProcessing(false);
            return;
        }
        if (!getWaitWordData) return;
        const {data: getWordData, error: getWordError} = await supabase.from('words').select('*').eq('word',word).maybeSingle();
        if (getWordError) {
            makeError(getWordError);
            return setIsProcessing(false)
        }
        if (!getWordData) return;
        const {data: themeWordData, error: themeWordError} = await supabase.from('word_themes').select('*,themes(*)').eq('word_id',getWordData.id);
        if (themeWordError){
            makeError(themeWordError);
            return setIsProcessing(false);
        }

        const { data: getDeleteDocsData, error: getDeleteDocsDataError } = await supabase.from('docs_wait_words').select('*').eq('wait_word_id', getWaitWordData.id);
        if (getDeleteDocsDataError) {
            makeError(getDeleteDocsDataError);
            setIsProcessing(false);
            return;
        }

        // 2.1 삭제요청 단어를 words 테이블에서 삭제
        const { error: deleteWordDataError } = await supabase.from('words').delete().eq('word', getWaitWordData.word);
        if (deleteWordDataError) {
            makeError(deleteWordDataError);
            setIsProcessing(false);
            return;
        }

        // 2.2 대기큐에서 제거
        const { error: deleteWaitWordDataError } = await supabase.from('wait_words').delete().eq('id', getWaitWordData.id);
        if (deleteWaitWordDataError) {
            makeError(deleteWaitWordDataError);
            setIsProcessing(false);
            return;
        }

        // 2.3 로그 등록
        const insertWordLogData = {
            word: getWaitWordData.word,
            make_by: getWaitWordData.requested_by,
            processed_by: user.uuid || null,
            r_type: "delete",
            state: "approved"
        } as const;
        WriteWordLog([insertWordLogData]);

        // 2.4 문서 로그 등록
        const insertDocsLogData = getDeleteDocsData.map((d) => {
            return {
                word: getWaitWordData.word,
                docs_id: d.docs_id,
                add_by: getWaitWordData.requested_by,
                type: "delete"
            } as const;
        });
        WriteDocsLog(insertDocsLogData);

        const {data: docsDatas, error: docsError} = await supabase.from('docs').select('*');
        if (docsError) return makeError(docsError)
        const letterDocs = docsDatas.filter(({typez})=>typez==="letter");
        const themeDocs = docsDatas.filter(({typez})=>typez === "theme");

        const okLetterDocs = letterDocs
            .filter(({name})=>getWaitWordData.word[getWaitWordData.word.length-1]===name)
            .map(d=>({
                word: getWaitWordData.word,
                docs_id: d.id,
                add_by: getWaitWordData.requested_by,
                type: "delete" as const
            }));

        const okThemeDocs = themeDocs
                .filter(({name})=>themeWordData.some(b=>b.themes.name === name))
                .map(d=>({
                    word: getWaitWordData.word,
                    docs_id: d.id,
                    add_by: getWaitWordData.requested_by,
                    type: "delete" as const
                }))

        WriteDocsLog(okLetterDocs);
        WriteDocsLog(okThemeDocs);

        const okThemeDocsA = themeDocs
                .filter(({name})=>themeWordData.some(b=>b.themes.name === name))
                .map(({id})=>id);
            WriteDocsLog(okThemeDocs);
            
            const okLetterDocsA = letterDocs
                .filter(({name})=>getWaitWordData.word[getWaitWordData.word.length-1]===name)
                .map(({id})=>id)
            
            okLetterDocsA.forEach(async (v)=>{
                await supabase.rpc('update_last_update',{docs_id:v})
            })
            
            okThemeDocsA.forEach(async (v)=>{
                await supabase.rpc('update_last_update',{docs_id:v})
            })

            if (getWaitWordData.requested_by){
                await supabase.rpc('increment_contribution',{target_id: getWaitWordData.requested_by, inc_amount:1})
            }
            

        setIsProcessing(false);
        CompleWork();
        return;
    },[]);

    const DeleteReject = useCallback(async (word: string) => {
        // 권한 체크 및 중복 요청 방지
        if (user.role !== "admin" && user.role !== "r4" && isProcessing) return;
        setIsProcessing(true);

        // 1. 삭제 요청단어 정보 가져오기
        const { data: getWaitWordData, error: getWaitWordDataError } = await supabase.from('wait_words').select('*').eq('word', word).maybeSingle();
        if (getWaitWordDataError) {
            makeError(getWaitWordDataError);
            setIsProcessing(false);
            return;
        }
        if (!getWaitWordData) return;

        // 2.1 삭제 요청 거부
        const { error: deleteWaitWordDataError } = await supabase.from('wait_words').delete().eq('id', getWaitWordData.id);
        if (deleteWaitWordDataError) {
            makeError(deleteWaitWordDataError);
            setIsProcessing(false);
            return;
        }

        // 2.2 로그 등록
        const insertWordLogData = {
            word: getWaitWordData.word,
            make_by: getWaitWordData.requested_by,
            processed_by: user.uuid || null,
            r_type: "delete",
            state: "rejected"
        } as const;
        WriteWordLog([insertWordLogData]);

        setIsProcessing(false);
        CompleWork();
        return;
    },[]);

    const CancelAddRequest = useCallback(async (word: string) => {
        // 중복 요청 방지
        if (isProcessing) return;
        setIsProcessing(true);

        // 1. 삭제 요청단어 정보 가져오기
        const { data: getWaitWordData, error: getWaitWordDataError } = await supabase.from('wait_words').select('*').eq('word', word).maybeSingle();
        if (getWaitWordDataError) {
            makeError(getWaitWordDataError);
            setIsProcessing(false);
            return;
        }
        if (!getWaitWordData) return;

        // 2. 대기큐에서 삭제
        const { error: deleteWaitWordDataError } = await supabase.from('wait_words').delete().eq('id', getWaitWordData.id);
        if (deleteWaitWordDataError) {
            makeError(deleteWaitWordDataError);
            setIsProcessing(false);
            return;
        }

        setIsProcessing(false);
        CompleWork();
        return;
    },[]);

    const CancelDeleteRequest = useCallback(async (word: string) => {
        // 중복 요청 방지
        if (isProcessing) return;
        setIsProcessing(true);

        // 1. 삭제 요청단어 정보 가져오기
        const { data: getWaitWordData, error: getWaitWordDataError } = await supabase.from('wait_words').select('*').eq('word', word).maybeSingle();
        if (getWaitWordDataError) {
            makeError(getWaitWordDataError);
            setIsProcessing(false);
            return;
        }
        if (!getWaitWordData) return;

        // 2. 대기큐에서 삭제
        const { error: deleteWaitWordDataError } = await supabase.from('wait_words').delete().eq('id', getWaitWordData.id);
        if (deleteWaitWordDataError) {
            makeError(deleteWaitWordDataError);
            setIsProcessing(false);
            return;
        }

        setIsProcessing(false);
        CompleWork();
        return;
    },[]);

    const DeleteByAdmin = useCallback(async (word: string) => {
        // 권한 체크 및 중복 요청 방지
        if (user.role !== "admin" && user.role !== "r4" && isProcessing) return;
        setIsProcessing(true);

        // 1. 즉시 삭제할 단어 정보 가지고 오기
        const { data: getWordData, error: getWordDataError } = await supabase.from('words').select('*').eq('word', word).maybeSingle();
        if (getWordDataError) {
            makeError(getWordDataError);
            setIsProcessing(false);
            return;
        }
        if (!getWordData) return;

        // 1.1 즉시 삭제할 단어의 문서 정보 가지고 오기
        const { data: getDocsData, error: getDocsDataError } = await supabase.from('docs_words').select('*').eq('word_id', getWordData.id);
        if (getDocsDataError) {
            makeError(getDocsDataError);
            setIsProcessing(false);
            return;
        }

        if (getDocsData) {
            // 2.1 문서 로그 등록
            const insertDocsLogData = getDocsData.map((d) => {
                return {
                    word: word,
                    docs_id: d.docs_id,
                    add_by: user.uuid || null,
                    type: "delete"
                } as const;
            });
            WriteDocsLog(insertDocsLogData);
        }

        // 2.2 로그에 등록
        const insertWordLogData = {
            word: word,
            make_by: user.uuid || null,
            processed_by: user.uuid || null,
            r_type: "delete",
            state: "approved"
        } as const;
        WriteWordLog([insertWordLogData]);

        // 3. 단어 삭제
        const { error: deleteWordDataError } = await supabase.from('words').delete().eq('id', getWordData.id);
        if (deleteWordDataError) {
            makeError(deleteWordDataError);
            setIsProcessing(false);
            return;
        }

        setIsProcessing(false);
        CompleWork();
        return;

    },[]);

    const RequestDelete = useCallback(async (word: string) => {
        // 중복 요청 방지
        if (isProcessing) return;
        setIsProcessing(true);

        // 1. 삭제 요청할 타깃 단어 정보 가지고 오기
        const { data: getWordData, error: getWordDataError } = await supabase.from('words').select('*').eq('word', word).maybeSingle();
        if (getWordDataError) {
            makeError(getWordDataError);
            setIsProcessing(false);
            return;
        }
        if (!getWordData) return;

        // 2. 대기큐에 등록
        const insertWaitWordData = {
            word: word,
            requested_by: user.uuid || null,
            request_type: "delete"
        } as const;
        const { data: insertWaitWordDataA, error: insertWaitWordDataError } = await supabase.from('wait_words').insert(insertWaitWordData).select('id').maybeSingle();
        if (insertWaitWordDataError) {
            makeError(insertWaitWordDataError);
            setIsProcessing(false);
            return;
        }
        if (!insertWaitWordDataA) return;

        // 2.1 문서 데이터에 반영
        const { data: getDocsData, error: getDocsDataError } = await supabase.from('docs_words').select('*').eq('word_id', getWordData.id);
        if (getDocsDataError) {
            makeError(getDocsDataError);
            setIsProcessing(false);
            return;
        }
        if (getDocsData) {
            const insertDocsWaitData = getDocsData.map((d) => {
                return {
                    docs_id: d.docs_id,
                    wait_word_id: insertWaitWordDataA.id
                }
            });
            const { error: insertDocsWaitDataError } = await supabase.from('docs_wait_words').insert(insertDocsWaitData);
            if (insertDocsWaitDataError) {
                makeError(insertDocsWaitDataError);
                setIsProcessing(false);
                return;
            }
        }

        setIsProcessing(false);
        CompleWork();
        return;
    },[]);

    const DeleteWordFromDocsByAdin = useCallback(async (word: string) => {
        // 중복 요청 방지
        if (user.role !== "admin" && user.role !== "r4" && isProcessing) return;
        setIsProcessing(true);

        // 1. 문서에서 삭제할 단어의 정보 가지고 오기
        const { data: getWordData, error: getWordDataError } = await supabase.from('words').select('*').eq('word', word).maybeSingle();

        if (getWordDataError) {
            makeError(getWordDataError);
            setIsProcessing(false);
            return;
        }
        if (!getWordData) return;

        // 2. 해당 문서에서 삭제
        const { error: deleteWordFromDocsError } = await supabase.from('docs_words').delete().eq('word_id', getWordData.id).eq('docs_id', Number(id));
        if (deleteWordFromDocsError) {
            makeError(deleteWordFromDocsError);
            setIsProcessing(false);
            return;
        }

        // 3. 로그 등록
        const logData = {
            word: getWordData.word,
            docs_id: Number(id),
            add_by: user.uuid || null,
            type: "delete" as const
        }
        WriteDocsLog([logData]);

        setIsProcessing(false);
        CompleWork();
        return;
    },[]);

    const DeleteWordFromDocsRequest = useCallback(async (word: string) => {
        // 중복 요청 방지
        if (isProcessing) return;
        setIsProcessing(true);

        // 1. 삭제 요청할 단어 정보 가지고 오기
        const { data: getWordData, error: getWordDataError } = await supabase.from('words').select('*').eq('word', word).maybeSingle();
        if (getWordDataError) {
            makeError(getWordDataError);
            setIsProcessing(false);
            return;
        }

        if (!getWordData) return;

        // 2. 대기큐에 등록
        const insertWaitWordData = {
            word_id: getWordData.id,
            docs_id: Number(id),
            requested_by: user.uuid || null,
            typez: "delete"
        } as const;
        const { error: insertWaitWordDataError } = await supabase.from('docs_words_wait').insert(insertWaitWordData);
        if (insertWaitWordDataError) {
            makeError(insertWaitWordDataError);
            setIsProcessing(false);
            return;
        }

        setIsProcessing(false);
        CompleWork();
        return;
    },[]);

    const onCancelDeleteFromDocsRequest = useCallback(async (word: string) => {
        // 중복 요청 방지
        if (isProcessing) return;
        setIsProcessing(true);

        // 1. 삭제 요청할 단어 정보 가지고 오기
        const { data: getWordData, error: getWordDataError } = await supabase.from('words').select('*').eq('word', word).maybeSingle();
        if (getWordDataError) {
            makeError(getWordDataError);
            setIsProcessing(false);
            return;
        }
        if (!getWordData) return;

        // 2. 대기큐에서 삭제
        const { error: deleteWaitWordDataError } = await supabase.from('docs_words_wait').delete().eq('word_id', getWordData.id);
        if (deleteWaitWordDataError) {
            makeError(deleteWaitWordDataError);
            setIsProcessing(false);
            return;
        }

        setIsProcessing(false);
        CompleWork();
        return;

    },[]);

    const onDeleteFromDocsAccept = useCallback(async (word: string) => {
        // 중복 요청 방지
        if (user.role !== "admin" && user.role !== "r4" && isProcessing) return;
        setIsProcessing(true);

        // 1. 삭제할 단어 정보 가지고 오기
        const { data: getWordData, error: getWordDataError } = await supabase.from('words').select('*').eq('word', word).maybeSingle();
        if (getWordDataError) {
            makeError(getWordDataError);
            setIsProcessing(false);
            return;
        }
        if (!getWordData) return;

        const { data: getDeleteDocsData, error: getDeleteDocsDataError } = await supabase.from('docs_words_wait').select('words(word),docs_id,requested_by').eq('word_id', getWordData.id);
        if (getDeleteDocsDataError) {
            makeError(getDeleteDocsDataError);
            setIsProcessing(false);
            return;
        }

        // 2. 대기큐에서 삭제
        const { error: deleteWaitWordDataError } = await supabase.from('docs_words_wait').delete().eq('word_id', getWordData.id);
        if (deleteWaitWordDataError) {
            makeError(deleteWaitWordDataError);
            setIsProcessing(false);
            return;
        }

        // 3. 문서에서 삭제
        const { error: deleteWordFromDocsError } = await supabase.from('docs_words').delete().eq('word_id', getWordData.id).eq('docs_id', Number(id));
        if (deleteWordFromDocsError) {
            makeError(deleteWordFromDocsError);
            setIsProcessing(false);
            return;
        }

        // 2.3 문서 로그 등록
        const insertDocsLogData = getDeleteDocsData.map((d) => {
            return {
                word: d.words.word,
                docs_id: d.docs_id,
                add_by: d.requested_by,
                type: "delete"
            } as const;
        });
        WriteDocsLog(insertDocsLogData);

        setIsProcessing(false);
        CompleWork();
        return;
    },[]);

    const onDeleteFromDocsReject = useCallback(async (word: string) => {
        // 중복 요청 방지
        if (user.role !== "admin" && user.role !== "r4" && isProcessing) return;
        setIsProcessing(true);

        // 1. 삭제 요청단어 정보 가져오기
        const { data: getWaitWordData, error: getWaitWordDataError } = await supabase.from('words').select('*').eq('word', word).maybeSingle();
        if (getWaitWordDataError) {
            makeError(getWaitWordDataError);
            setIsProcessing(false);
            return;
        }
        if (!getWaitWordData) return;

        // 2. 대기큐에서 삭제
        const { error: deleteWaitWordDataError } = await supabase.from('docs_words_wait').delete().eq('word_id', getWaitWordData.id);
        if (deleteWaitWordDataError) {
            makeError(deleteWaitWordDataError);
            setIsProcessing(false);
            return;
        }

        setIsProcessing(false);
        CompleWork();
        return;
    },[]);

    const onAddFromDocsAccept = useCallback(async (word: string) => {
        // 중복 요청 방지
        if (user.role !== "admin" && user.role !== "r4" && isProcessing) return;
        setIsProcessing(true);

        // 1. 추가할 단어 정보 가지고 오기
        const { data: getWordData, error: getWordDataError } = await supabase.from('words').select('*').eq('word', word).maybeSingle();
        if (getWordDataError) {
            makeError(getWordDataError);
            setIsProcessing(false);
            return;
        }
        if (!getWordData) return;

        const { data: getWaitWordData, error: getWaitWordDataError } = await supabase.from('docs_words_wait').select('*').eq('word_id', getWordData.id).maybeSingle();
        if (getWaitWordDataError) {
            makeError(getWaitWordDataError);
            setIsProcessing(false);
            return;
        }
        if (!getWaitWordData) return;

        // 2. 대기큐에서 삭제
        const { error: deleteWaitWordDataError } = await supabase.from('docs_words_wait').delete().eq('word_id', getWordData.id);
        if (deleteWaitWordDataError) {
            makeError(deleteWaitWordDataError);
            setIsProcessing(false);
            return;
        }

        // 3. 문서에 등록
        const insertDocsData = {
            docs_id: Number(id),
            word_id: getWordData.id
        } as const;
        const { error: insertDocsDataError } = await supabase.from('docs_words').insert(insertDocsData);
        if (insertDocsDataError) {
            makeError(insertDocsDataError);
            setIsProcessing(false);
            return;
        }

        // 4. 문서 로그 등록
        const insertDocsLogData = {
            word: getWordData.word,
            docs_id: Number(id),
            add_by: getWaitWordData.requested_by,
            type: "add"
        } as const;
        WriteDocsLog([insertDocsLogData]);

        setIsProcessing(false);
        CompleWork();
        return;
    },[]);

    const onAddFromDocsReject = useCallback(async (word: string) => {
        // 중복 요청 방지
        if (user.role !== "admin" && user.role !== "r4" && isProcessing) return;
        setIsProcessing(true);

        // 1. 추가 요청단어 정보 가져오기
        const { data: getWaitWordData, error: getWaitWordDataError } = await supabase.from('words').select('*').eq('word', word).maybeSingle();
        if (getWaitWordDataError) {
            makeError(getWaitWordDataError);
            setIsProcessing(false);
            return;
        }
        if (!getWaitWordData) return;

        // 2. 대기큐에서 삭제
        const { error: deleteWaitWordDataError } = await supabase.from('docs_words_wait').delete().eq('word_id', getWaitWordData.id);
        if (deleteWaitWordDataError) {
            makeError(deleteWaitWordDataError);
            setIsProcessing(false);
            return;
        }

        setIsProcessing(false);
        CompleWork();
        return;
    },[]);

    return {AddAccept, DeleteAccept, AddReject, DeleteReject, CancelAddRequest, CancelDeleteRequest, DeleteByAdmin, RequestDelete, DeleteWordFromDocsByAdin, DeleteWordFromDocsRequest, onCancelDeleteFromDocsRequest, onAddFromDocsAccept, onAddFromDocsReject, onDeleteFromDocsAccept, onDeleteFromDocsReject}

}

const Table = ({ 
    initialData, 
    id, 
    isEct, 
    isM = { m: false, t: null },
    isL = false
}: { 
    initialData: WordData[], 
    id: string, 
    isEct: boolean, 
    isM?: { m: false, t: null } | { m: true, t: string } 
    isL?: boolean
}) => {
    const [data] = useState(initialData);
    
    // isM.m이 true일 때는 포함개수 기준 내림차순으로 기본 정렬
    const [sorting, setSorting] = useState<SortingState>(
        isM.m ? [{ id: "count", desc: true }] : isL ? [{ id: "length", desc: true }] : []
    );
    
    const [modal, setModal] = useState<{ 
        word: string, 
        status: "add" | "delete" | "ok" | "eadd" | "edelete", 
        requer: string 
    } | null>(null);
    
    const [errorModalView, seterrorModalView] = useState<ErrorMessage | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const user = useSelector((state: RootState) => state.user);

    // 특정 문자 포함 개수를 계산하는 함수
    const getCharCount = useCallback((word: string, char: string): number => {
        if (!char) return 0;
        return (word.match(new RegExp(char, 'g')) || []).length;
    }, []);

    const columns: ColumnDef<WordData>[] = useMemo(() => [
        {
            accessorFn: (row) => 
                isM.m && isM.t 
                    ? getCharCount(row.word, isM.t)
                    : row.word.length,
            id: isM.m ? "count" : "length",
            header: ({ column }) => {
                const isSorted = column.getIsSorted();
                return (
                    <button
                        className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        {isM.m ? `포함수` : "길이"}
                        {isSorted === "desc" ? (
                            <ArrowDown className="h-4 w-4" />
                        ) : isSorted === "asc" ? (
                            <ArrowUp className="h-4 w-4" />
                        ) : (
                            <ArrowUpDown className="h-4 w-4" />
                        )}
                    </button>
                );
            },
            cell: (info) => (
                <span className="font-medium text-blue-600">
                    {String(info.getValue())}
                </span>
            ),
            enableSorting: true,
        },
        { 
            accessorKey: "word", 
            header: ({ column }) => {
                const isSorted = column.getIsSorted();
                return (
                    <button
                        className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        단어
                        {isSorted === "desc" ? (
                            <ArrowDown className="h-4 w-4" />
                        ) : isSorted === "asc" ? (
                            <ArrowUp className="h-4 w-4" />
                        ) : (
                            <ArrowUpDown className="h-4 w-4" />
                        )}
                    </button>
                );
            },
            cell: ({ getValue }) => (
                <Link href={`/word/search/${getValue()}`} className="font-semibold text-gray-900 underline">
                    {getValue() as string}
                </Link>
            )
        },
        { 
            accessorKey: "status", 
            header: "상태",
            cell: ({ getValue }) => {
                const status = getValue() as string;
                const getStatusStyle = (status: string) => {
                    switch (status) {
                        case "ok":
                            return "bg-green-100 text-green-800 border-green-200";
                        case "add":
                            return "bg-blue-100 text-blue-800 border-blue-200";
                        case "delete":
                            return "bg-red-100 text-red-800 border-red-200";
                        case "eadd":
                            return "bg-purple-100 text-purple-800 border-purple-200";
                        case "edelete":
                            return "bg-orange-100 text-orange-800 border-orange-200";
                        default:
                            return "bg-gray-100 text-gray-800 border-gray-200";
                    }
                };
                
                return (
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusStyle(status)}`}>
                        {status}
                    </span>
                );
            }
        },
    ], [isM, getCharCount]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: { sorting },
        onSortingChange: setSorting,
    });

    const openWork = useCallback((word: string, status: "add" | "delete" | "ok" | "eadd" | "edelete", requer: string) => {
        setModal({ word, status, requer });
    }, []);

    const closeWork = () => {
        setModal(null);
    };

    const CompleWork = () => {
        setModal(null);
        setIsCompleteModalOpen(true);
    };

    const makeError = (error: PostgrestError) => {
        closeWork();
        seterrorModalView({
            ErrName: error.name,
            ErrMessage: error.message,
            ErrStackRace: error.stack,
            inputValue: null
        });
    };

    const { 
        AddAccept, 
        AddReject, 
        DeleteAccept, 
        DeleteReject, 
        CancelAddRequest, 
        CancelDeleteRequest, 
        RequestDelete, 
        DeleteByAdmin, 
        DeleteWordFromDocsByAdin, 
        DeleteWordFromDocsRequest, 
        onCancelDeleteFromDocsRequest, 
        onAddFromDocsReject, 
        onAddFromDocsAccept, 
        onDeleteFromDocsAccept, 
        onDeleteFromDocsReject 
    } = useWorkFunc({ makeError, setIsProcessing, user, id, CompleWork, isProcessing });

    return (
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : typeof header.column.columnDef.header === 'function'
                                                ? header.column.columnDef.header(header.getContext())
                                                : header.column.columnDef.header}
                                        </th>
                                    ))}
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                                        작업
                                    </th>
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {table.getRowModel().rows.map((row, index) => {
                                const wordData = row.original;
                                return (
                                    <tr 
                                        key={wordData.word}
                                        className={`hover:bg-gray-50 transition-colors ${
                                            index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                                        }`}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                className="px-6 py-4 text-sm whitespace-nowrap"
                                            >
                                                {typeof cell.column.columnDef.cell === 'function'
                                                    ? cell.column.columnDef.cell(cell.getContext())
                                                    : cell.getValue() as string}
                                            </td>
                                        ))}
                                        {/* 작업 버튼 */}
                                        <td className="min-w-[100px] px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                                            {openWork !== undefined && (
                                                <button
                                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                                                    onClick={user.uuid !== undefined ? 
                                                        () => openWork(wordData.word, wordData.status, wordData.maker ?? "") : 
                                                        undefined
                                                    }
                                                >
                                                    작업
                                                </button>
                                            )}
                                        </td>
                                        {/* <td className="px-6 py-4 text-sm whitespace-nowrap">
                                            <TableRow
                                                key={wordData.word}
                                                {...wordData}
                                                openWork={user.uuid !== undefined ? 
                                                    () => openWork(wordData.word, wordData.status, wordData.maker ?? "") : 
                                                    undefined
                                                }
                                            />
                                        </td> */}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                
                {/* 테이블이 비어있을 때 */}
                {table.getRowModel().rows.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">데이터가 없습니다.</p>
                    </div>
                )}
            </div>

            {/* 모달 영역 */}
            {modal && (
                <Suspense fallback={
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                        <div className="bg-white rounded-lg p-6">
                            <Spinner />
                        </div>
                    </div>
                }>
                    <WorkModal
                        isEct={isEct}
                        isSaving={isProcessing}
                        onClose={closeWork}
                        word={modal.word}
                        status={modal.status}
                        isAdmin={user.role === "admin"}
                        isRequester={user.uuid === modal.requer}
                        onAddAccept={() => AddAccept(modal.word)}
                        onDeleteAccept={() => DeleteAccept(modal.word)}
                        onAddReject={() => AddReject(modal.word)}
                        onDeleteReject={() => DeleteReject(modal.word)}
                        onCancelAddRequest={() => CancelAddRequest(modal.word)}
                        onCancelDeleteRequest={() => CancelDeleteRequest(modal.word)}
                        onDelete={() => DeleteByAdmin(modal.word)}
                        onRequestDelete={() => RequestDelete(modal.word)}
                        onDeleteFromDoc={() => DeleteWordFromDocsByAdin(modal.word)}
                        onRequestDeleteFromDoc={() => DeleteWordFromDocsRequest(modal.word)}
                        onCancelDeleteFromDocsRequest={() => onCancelDeleteFromDocsRequest(modal.word)}
                        onDeleteFromDocsAccept={() => onDeleteFromDocsAccept(modal.word)}
                        onDeleteFromDocsReject={() => onDeleteFromDocsReject(modal.word)}
                        onCancelAddFromDocsRequest={() => onCancelDeleteFromDocsRequest(modal.word)}
                        onAddFromDocsAccept={() => onAddFromDocsAccept(modal.word)}
                        onAddFromDocsReject={() => onAddFromDocsReject(modal.word)}
                    />
                </Suspense>
            )}

            {errorModalView && (
                <ErrorModal
                    onClose={() => seterrorModalView(null)}
                    error={errorModalView}
                />
            )}

            {isProcessing && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-6">
                        <Spinner />
                    </div>
                </div>
            )}
            
            {isCompleteModalOpen && (
                <CompleteModal 
                    onClose={() => setIsCompleteModalOpen(false)} 
                    open={isCompleteModalOpen}
                />
            )}
        </div>
    );
};

export default Table;
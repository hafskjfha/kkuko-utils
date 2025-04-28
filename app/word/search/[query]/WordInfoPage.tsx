"use client";
import WordInfo from './WordInfo';
import { supabase } from '@/app/lib/supabaseClient';
import ErrorModal from '@/app/components/ErrModal';
import { useEffect, useState } from 'react';
import NotFound from '@/app/not-found-client';
import type { PostgrestError } from '@supabase/supabase-js';
import { disassemble } from 'es-hangul';
import Spinner from '@/app/components/Spinner';

interface WordInfoProps {
    word: string;
    missionLetter: [string, number][];
    initial: string;
    length: number;
    topic: {
        ok: string[];
        waitAdd: string[];
        waitDel: string[];
    };
    isChainable: boolean;
    isSeniorApproved: boolean;
    status: "ok" | "추가요청" | "삭제요청";
    dbId: number;
    documents: { doc_id: number; doc_name: string }[];
    requester?: string;
    requester_uuid?: string;
    requestTime?: string;
}

const calculateKoreanInitials = (word: string): string => {
    return word.split("").map((c) => disassemble(c)[0]).join("");
};

export default function WordInfoPage({ query }: { query: string }) {
    const [errorView, setErrorView] = useState<ErrorMessage|null>(null);
    const [wordInfo, setWordInfo] = useState<WordInfoProps|null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isNotFound, setIsNotFound] = useState(false);
    

    const makeError = (error: PostgrestError) => {
            setErrorView({
                ErrName: error.name,
                ErrMessage: error.message,
                ErrStackRace: error.stack,
                inputValue: null
            });
        };

    const wordSetFunc = (wordInfo:{
            id:number,
            word: string,
            noin_canuse?: boolean,
            k_canuse?: boolean,
            typez: "ok" | "add" | "delete",
            requested_by?: string | null,
            requested_by_uuid?: string | null,
            requested_at?: string | null,
            documents: { doc_id: number; doc_name: string }[],
            themes: {
                ok: string[];
                waitAdd: string[];
                waitDel: string[];
            };
        }) => {
            const mission:[string,number][] = [];
            for (const c of "가나다라마바사아자차카타파하"){
                const pp = (wordInfo.word.match(new RegExp(c, "gi")) || []).length
                if (pp){
                    mission.push([c, pp]);
                }
            }
            setWordInfo({
                word: wordInfo.word,
                initial: calculateKoreanInitials(wordInfo.word),
                length: wordInfo.word.length,
                isChainable: wordInfo.k_canuse ?? true,
                isSeniorApproved: wordInfo.noin_canuse ?? false,
                dbId: wordInfo.id,
                missionLetter: mission,
                status: wordInfo.typez === "ok" ? "ok" : wordInfo.typez === "add" ? "추가요청" : "삭제요청",
                requester: wordInfo.requested_by ?? undefined,
                requester_uuid: wordInfo.requested_by_uuid ?? undefined,
                requestTime: wordInfo.requested_at ?? undefined,
                documents: wordInfo.documents,
                topic: wordInfo.themes,
            });
        };

    useEffect(()=>{
        const fetchWordInfo = async () => {
            const { data: wordTableCehck, error: wordTableCehckError} = await supabase.from('words').select('*,users(nickname)').eq('word',query).maybeSingle();
            const { data: waitTableCheck, error: waitTableCheckError} = await supabase.from('wait_words').select('*,users(nickname)').eq('word',query).maybeSingle();
            if (waitTableCheckError) {
                makeError(waitTableCheckError);
                return;
            }
            
            if (wordTableCehckError) {
                makeError(wordTableCehckError);
                return;
            }
            if (wordTableCehck) {
                const {data: wordThemes, error: wordThemesError} = await supabase.from('word_themes').select('themes(name)').eq('word_id', wordTableCehck.id);
                const {data: wodThemes2, error: wordThemesError2} = await supabase.from('word_themes_wait').select('themes(name), typez').eq('word_id', wordTableCehck.id);

                if (wordThemesError) {
                    makeError(wordThemesError);
                    return;
                }
                if (wordThemesError2) {
                    makeError(wordThemesError2);
                    return;
                }
                const {data: docsData1, error: docsData1Error} = await supabase.from('docs_words').select('docs_id,docs(name)').eq('word_id', wordTableCehck.id);
                const {data: docsData2, error: docsData2Error} = await supabase.from('docs_words_wait').select('docs_id,docs(name)').eq('word_id', wordTableCehck.id).eq('typez','add');
                if (docsData1Error) {
                    makeError(docsData1Error);
                    return;
                }
                if (docsData2Error) {
                    makeError(docsData2Error);
                    return;
                }
                wordSetFunc({
                    id: wordTableCehck.id,
                    word: wordTableCehck.word,
                    typez: waitTableCheck && waitTableCheck.request_type==="delete" ? "delete" : "ok",
                    documents: [...docsData1.map((d) => ({ doc_id: d.docs_id, doc_name: d.docs.name })), ...docsData2.map((d) => ({ doc_id: d.docs_id, doc_name: d.docs.name }))],
                    themes: {
                        ok: wordThemes ? wordThemes.map(theme => theme.themes.name) : [],
                        waitAdd: wodThemes2 ? wodThemes2.filter(theme => theme.typez === 'add').map(theme => theme.themes.name) : [],
                        waitDel: wodThemes2 ? wodThemes2.filter(theme => theme.typez === 'delete').map(theme => theme.themes.name) : [],
                    },
                    noin_canuse: wordTableCehck.noin_canuse,
                    k_canuse: wordTableCehck.k_canuse,
                    requested_by: waitTableCheck && waitTableCheck.request_type==="delete" ? waitTableCheck.users?.nickname : wordTableCehck.users?.nickname,
                    requested_by_uuid: waitTableCheck && waitTableCheck.request_type==="delete" ? waitTableCheck.requested_by : wordTableCehck.added_by,
                    requested_at: waitTableCheck && waitTableCheck.request_type==="delete" ? waitTableCheck.requested_at : wordTableCehck.added_at,
                })

            } else {
                const { data: waitTableCheck, error: waitTableCheckError} = await supabase.from('wait_words').select('*,users(nickname)').eq('word',query).maybeSingle();
                if (waitTableCheckError) {
                    makeError(waitTableCheckError);
                    return;
                }
                if (waitTableCheck) {
                    const {data: waitWordThemes, error: waitWordThemesError} = await supabase.from('wait_word_themes').select('themes(name)').eq('wait_word_id', waitTableCheck.id);
                    if (waitWordThemesError) {
                        
                        makeError(waitWordThemesError);
                        return;
                    }

                    const {data: waitDocsData1, error: waitDocsData1Error} = await supabase.from('docs_wait_words').select('docs_id,docs(name)').eq('wait_word_id', waitTableCheck.id);
                    if (waitDocsData1Error) {
                        makeError(waitDocsData1Error);
                        return;
                    }

                    wordSetFunc({
                            id: waitTableCheck.id,
                            word: waitTableCheck.word,
                            typez: waitTableCheck.request_type,
                            documents: waitDocsData1.map((d) => ({ doc_id: d.docs_id, doc_name: d.docs.name })),
                            themes: {
                                ok: [],
                                waitAdd: waitWordThemes ? waitWordThemes.map(theme => theme.themes.name) : [],
                                waitDel: [],
                            },
                            requested_by: waitTableCheck.users?.nickname,
                            requested_by_uuid: waitTableCheck.requested_by,
                            requested_at: waitTableCheck.requested_at,
                    });

                } else {
                    setIsNotFound(true);
                }
            }
        }
        try{
            setIsLoading(true);
            fetchWordInfo();
        } finally{
            setIsLoading(false);
        }
    }, [query]);

    if (isNotFound){
        return <NotFound />;
    }

    if (isLoading) {
        <Spinner />
    }

    if (errorView) {
            
            return (
                <ErrorModal error={errorView} onClose={()=>{}} />
            )
        }

    if (wordInfo){
        return (
            <WordInfo wordInfo={wordInfo} />
        )
    }
}
"use client";
import WordInfo from './WordInfo';
import { supabase } from '@/app/lib/supabaseClient';
import ErrorModal from '@/app/components/ErrModal';
import { useEffect, useState } from 'react';
import NotFound from '@/app/not-found-client';
import type { PostgrestError } from '@supabase/supabase-js';
import { disassemble } from 'es-hangul';
import LoadingPage, {useLoadingState } from '@/app/components/LoadingPage';
import axios from 'axios';
import  DuemRaw,{ reverDuemLaw } from '@/app/lib/DuemLaw';
import { useRouter } from 'next/navigation';
import { sum } from 'es-toolkit';

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
    goFirstLetterWords: number;
    goLastLetterWords: number;
    status: "ok" | "추가요청" | "삭제요청";
    dbId: number;
    documents: { doc_id: number; doc_name: string }[];
    requester?: string;
    requester_uuid?: string;
    requestTime?: string;
    moreExplanation?: React.ReactNode;
    goFirstLetterWord: (f:string[]) => Promise<void>;
    goLastLetterWord: (l: string[]) => Promise<void>
}

const calculateKoreanInitials = (word: string): string => {
    return word.split("").map((c) => disassemble(c)[0]).join("");
};

export default function WordInfoPage({ query }: { query: string }) {
    const [errorView, setErrorView] = useState<ErrorMessage | null>(null);
    const [wordInfo, setWordInfo] = useState<WordInfoProps | null>(null);
    const [isNotFound, setIsNotFound] = useState(false);
    const router = useRouter();

    // 로딩 상태를 더 상세하게 관리하기 위한 상태
    const { loadingState, updateLoadingState } = useLoadingState();

    const makeError = (error: PostgrestError) => {
        setErrorView({
            ErrName: error.name,
            ErrMessage: error.message,
            ErrStackRace: error.stack,
            inputValue: null
        });
    };

    const wordSetFunc = (wordInfo: {
        id: number,
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
        },
        goFirstLetterWords: number;
        goLastLetterWords: number;
        exp?: string;
    }) => {
        const mission: [string, number][] = [];
        for (const c of "가나다라마바사아자차카타파하") {
            const pp = (wordInfo.word.match(new RegExp(c, "gi")) || []).length
            if (pp) {
                mission.push([c, pp]);
            }
        }

        const gget = () => {
            return (<a
                href={wordInfo.exp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 transition-colors"
            >
                해당 단어가 끄코위키에 있습니다.
            </a>)
        }

        const gf = async (f: string[]) => {
            updateLoadingState(10, "단어 정보 확인 중...");
            const {data,error} = await supabase.rpc('random_word_ff',{fir1: f});
            const {data:data2, error:error2} = await supabase.rpc('random_wait_word_ff',{prefixes: f});
            if (error) return makeError(error)
            if (error2) return makeError(error2)
            if (data){
                router.push(`/word/search/${data[0].word}`)
            } else if (data2){
                router.push(`/word/search/${data2[0].word}`)
            } else {
                router.push(`/word/search/${wordInfo.word}`)
            }
            
        }

        const lf = async (l: string[]) => {
            updateLoadingState(10, "단어 정보 확인 중...");
            const {data, error} = await supabase.rpc('random_word_ll',{fir1:l})
            const {data:data2, error:error2} = await supabase.rpc('random_wait_word_ll',{prefixes: l}) 
            if (error) return makeError(error)
            if (error2) return makeError(error2)
            if (data){
                router.push(`/word/search/${data[0].word}`)
            } else if (data2){
                router.push(`/word/search/${data2[0].word}`)
            } else {
                router.push(`/word/search/${wordInfo.word}`)
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
            goFirstLetterWords: wordInfo.goFirstLetterWords,
            goLastLetterWords: wordInfo.goLastLetterWords,
            moreExplanation: wordInfo.exp ? gget() : undefined,
            goFirstLetterWord: gf,
            goLastLetterWord: lf
        });
    };

    useEffect(() => {
        const fetchWordInfo = async () => {
            try {
                updateLoadingState(10, "단어 정보 확인 중...");

                // 단어 테이블 확인
                const { data: wordTableCheck, error: wordTableCheckError } = await supabase.from('words').select('*,users(nickname)').eq('word', query).maybeSingle();
                if (wordTableCheckError) {
                    makeError(wordTableCheckError);
                    return;
                }

                updateLoadingState(20, "대기 단어 정보 확인 중...");

                // 대기 테이블 확인
                const { data: waitTableCheck, error: waitTableCheckError } = await supabase.from('wait_words').select('*,users(nickname)').eq('word', query).maybeSingle();
                if (waitTableCheckError) {
                    makeError(waitTableCheckError);
                    return;
                }

                if (wordTableCheck) {
                    updateLoadingState(40, "단어 주제 정보 가져오는 중...");

                    // 단어 주제 정보 가져오기
                    const { data: wordThemes, error: wordThemesError } = await supabase.from('word_themes').select('themes(name)').eq('word_id', wordTableCheck.id);
                    if (wordThemesError) {
                        makeError(wordThemesError);
                        return;
                    }

                    updateLoadingState(60, "단어 대기 주제 정보 가져오는 중...");

                    // 단어 대기 주제 정보 가져오기
                    const { data: wordThemes2, error: wordThemesError2 } = await supabase.from('word_themes_wait').select('themes(name), typez').eq('word_id', wordTableCheck.id);
                    if (wordThemesError2) {
                        makeError(wordThemesError2);
                        return;
                    }

                    updateLoadingState(70, "문서 연결 정보 가져오는 중...");

                    // 문서 연결 정보 가져오기
                    const { data: docsData3, error: docsData3Error} = await supabase.from('docs').select('*').eq('name',wordTableCheck.word[wordTableCheck.word.length - 1]);
                    if (docsData3Error){
                        return makeError(docsData3Error);
                    }
                    
                    const {data: docsData4, error: docsData4Error} = await supabase.from('docs').select('*').eq('typez','theme').in('name',[...wordThemes.map(d=>d.themes.name),...wordThemes2.map(d=>d.themes.name)]);
                    if (docsData4Error){
                        return makeError(docsData4Error);
                    }
                    const docc = docsData3.concat(docsData4).map(({id,name})=>({doc_id: id, doc_name: name}))

                    updateLoadingState(80, "단어의 연결되는 단어 가져오는 중...");

                    const fir1 = reverDuemLaw(wordTableCheck.word[0]);
                    const las1 = [DuemRaw(wordTableCheck.word[wordTableCheck.word.length - 1])];

                    // 🔸 firWords count
                    const { data: firWordsCount1, error: firWordsError1 } = await supabase
                    .from('word_last_letter_counts')
                    .select('*')
                    .in('last_letter', fir1);
                    

                    const { count: firWordsCount2, error: firWordsError2 } = await supabase
                    .from('wait_words')
                    .select('*', { count: 'exact', head: true })
                    .or(fir1.map(c => `word.ilike.%${c}%`).join(','));

                    // 🔸 lasWords count
                    const { data: lasWordsCount1, error: lasWordsError1 } = await supabase
                    .from('word_first_letter_counts')
                    .select('*')
                    .in('first_letter', las1);

                    const { count: lasWordsCount2, error: lasWordsError2 } = await supabase
                    .from('wait_words')
                    .select('*', { count: 'exact', head: true })
                    .or(las1.map(c => `word.ilike.%${c}%`).join(','));

                    if (firWordsError1 || firWordsError2 || lasWordsError1 || lasWordsError2) {
                        const error = firWordsError1 ?? firWordsError2 ?? lasWordsError1 ?? lasWordsError2;
                        if (error) {
                            makeError(error);
                            return;
                        }
                    }
                    
                    // 🔸 총합 (필요 시 null 체크 후 더하기)
                    const totalFirCount = (sum((firWordsCount1 ?? []).map(({count})=>count))) + (firWordsCount2 || 0);
                    const totalLasCount = (sum((lasWordsCount1 ?? []).map(({count})=>count))) + (lasWordsCount2 || 0);

                    let kkukoWikiok = false

                    const url = `/api/get_kkukowiki?title=${wordTableCheck.word}`;
                    try{
                        const response = await axios.get(url);
                          if (response.status === 200){
                            kkukoWikiok = true
                          }
                    } catch(error){
                        console.log(error)
                    }

                    updateLoadingState(90, "정보 가공 중...");
                    await new Promise(resolve => setTimeout(resolve, 1));

                    // 단어 정보 가공 및 설정
                    wordSetFunc({
                        id: wordTableCheck.id,
                        word: wordTableCheck.word,
                        typez: waitTableCheck && waitTableCheck.request_type === "delete" ? "delete" : "ok",
                        documents: [...docc],
                        themes: {
                            ok: wordThemes ? wordThemes.filter(theme => !wordThemes2.map(t => t.themes.name).includes(theme.themes.name)).map(theme => theme.themes.name) : [],
                            waitAdd: wordThemes2 ? wordThemes2.filter(theme => theme.typez === 'add').map(theme => theme.themes.name) : [],
                            waitDel: wordThemes2 ? wordThemes2.filter(theme => theme.typez === 'delete').map(theme => theme.themes.name) : [],
                        },
                        noin_canuse: wordTableCheck.noin_canuse,
                        k_canuse: wordTableCheck.k_canuse,
                        requested_by: waitTableCheck && waitTableCheck.request_type === "delete" ? waitTableCheck.users?.nickname : wordTableCheck.users?.nickname,
                        requested_by_uuid: waitTableCheck && waitTableCheck.request_type === "delete" ? waitTableCheck.requested_by : wordTableCheck.added_by,
                        requested_at: waitTableCheck && waitTableCheck.request_type === "delete" ? waitTableCheck.requested_at : wordTableCheck.added_at,
                        goFirstLetterWords: totalFirCount,
                        goLastLetterWords: totalLasCount,
                        exp: kkukoWikiok ? `https://kkukowiki.kr/w/${wordTableCheck.word}` : undefined
                    });

                } else if (waitTableCheck) {
                    updateLoadingState(50, "대기 단어 주제 정보 가져오는 중...");

                    // 대기 단어 주제 정보 가져오기
                    const { data: waitWordThemes, error: waitWordThemesError } = await supabase.from('wait_word_themes').select('themes(name)').eq('wait_word_id', waitTableCheck.id);
                    if (waitWordThemesError) {
                        makeError(waitWordThemesError);
                        return;
                    }

                    updateLoadingState(75, "대기 단어 문서 정보 가져오는 중...");

                    // 대기 단어 문서 정보 가져오기
                    const {data: waitDocsData4, error: waitDocsData4Error} = await supabase.from('docs').select('*').eq('typez','theme').in('name',[...waitWordThemes.map(d=>d.themes.name)]);
                    if (waitDocsData4Error){
                        return makeError(waitDocsData4Error);
                    }

                    const { data: waitDocsData2, error: waitDocsData2Error} = await supabase.from('docs').select('*').eq('name',waitTableCheck.word[waitTableCheck.word.length - 1]);
                    if (waitDocsData2Error){
                        return makeError(waitDocsData2Error);
                    }
                    const docc = waitDocsData2.concat(waitDocsData4).map(({id,name})=>({doc_id: id, doc_name: name}))

                    updateLoadingState(80, "단어의 연결되는 단어 가져오는 중...");

                    const fir1 = reverDuemLaw(waitTableCheck.word[0]);
                    const las1 = [DuemRaw(waitTableCheck.word[waitTableCheck.word.length - 1])];

                    // 🔸 firWords count
                    const { count: firWordsCount1, error: firWordsError1 } = await supabase
                    .from('words')
                    .select('*', { count: 'exact', head: true })
                    .eq('k_canuse', true)
                    .in('last_letter', fir1);

                    const { count: firWordsCount2, error: firWordsError2 } = await supabase
                    .from('wait_words')
                    .select('*', { count: 'exact', head: true })
                    .or(fir1.map(c => `word.ilike.%${c}%`).join(','));

                    // 🔸 lasWords count
                    const { count: lasWordsCount1, error: lasWordsError1 } = await supabase
                    .from('words')
                    .select('*', { count: 'exact', head: true })
                    .eq('k_canuse', true)
                    .in('first_letter', las1);

                    const { count: lasWordsCount2, error: lasWordsError2 } = await supabase
                    .from('wait_words')
                    .select('*', { count: 'exact', head: true })
                    .or(las1.map(c => `word.ilike.%${c}%`).join(','));

                    // 🔸 총합 (필요 시 null 체크 후 더하기)
                    const totalFirCount = (firWordsCount1 || 0) + (firWordsCount2 || 0);
                    const totalLasCount = (lasWordsCount1 || 0) + (lasWordsCount2 || 0);

                    if (firWordsError1 || firWordsError2 || lasWordsError1 || lasWordsError2) {
                        const error = firWordsError1 ?? firWordsError2 ?? lasWordsError1 ?? lasWordsError2;
                        if (error) {
                            makeError(error);
                            return;
                        }
                    }

                    updateLoadingState(90, "정보 가공 중...");

                    // 대기 단어 정보 가공 및 설정
                    wordSetFunc({
                        id: waitTableCheck.id,
                        word: waitTableCheck.word,
                        typez: waitTableCheck.request_type,
                        documents: [...docc],
                        themes: {
                            ok: [],
                            waitAdd: waitWordThemes ? waitWordThemes.map(theme => theme.themes.name) : [],
                            waitDel: [],
                        },
                        requested_by: waitTableCheck.users?.nickname,
                        requested_by_uuid: waitTableCheck.requested_by,
                        requested_at: waitTableCheck.requested_at,
                        goFirstLetterWords: totalFirCount,
                        goLastLetterWords: totalLasCount
                    });
                } else {
                    setIsNotFound(true);
                }

                updateLoadingState(100, "완료!");
            } catch (error) {
                console.error("데이터 로딩 중 오류 발생:", error);
                updateLoadingState(
                    100,
                    "오류 발생"
                );
            }
        };

        try{
            fetchWordInfo();
        } catch(error){
            if (error instanceof Error){
                updateLoadingState(
                    100,
                    "오류 발생"
                );
                setErrorView({
                    ErrName: error.name,
                    ErrMessage: error.message,
                    ErrStackRace: error.stack,
                    inputValue: "getDocData"
                })
            }
        }
        
    }, [query]);

    if (isNotFound) {
        return <NotFound />;
    }

    if (loadingState.isLoading) {
        return (
            <LoadingPage title={'단어 정보'} />
        );
    }

    if (errorView) {
        return (
            <ErrorModal error={errorView} onClose={() => { }} />
        );
    }

    if (wordInfo) {
        return (
            <WordInfo wordInfo={wordInfo} />
        );
    }

    return null;
}
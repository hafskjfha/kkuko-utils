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
    goFirstLetterWords: string[];
    goLastLetterWords: string[];
    status: "ok" | "추가요청" | "삭제요청";
    dbId: number;
    documents: { doc_id: number; doc_name: string }[];
    requester?: string;
    requester_uuid?: string;
    requestTime?: string;
    moreExplanation?: React.ReactNode;
}

const calculateKoreanInitials = (word: string): string => {
    return word.split("").map((c) => disassemble(c)[0]).join("");
};

export default function WordInfoPage({ query }: { query: string }) {
    const [errorView, setErrorView] = useState<ErrorMessage | null>(null);
    const [wordInfo, setWordInfo] = useState<WordInfoProps | null>(null);
    const [isNotFound, setIsNotFound] = useState(false);

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
        goFirstLetterWords: string[];
        goLastLetterWords: string[];
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
            moreExplanation: wordInfo.exp ? gget() : undefined
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
                    const { data: docsData1, error: docsData1Error } = await supabase.from('docs_words').select('docs_id,docs(name)').eq('word_id', wordTableCheck.id);
                    if (docsData1Error) {
                        makeError(docsData1Error);
                        return;
                    }

                    const { data: docsData2, error: docsData2Error } = await supabase.from('docs_words_wait').select('docs_id,docs(name)').eq('word_id', wordTableCheck.id).eq('typez', 'add');
                    if (docsData2Error) {
                        makeError(docsData2Error);
                        return;
                    }

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

                    const { data: firWords1, error: firWordsError1 } = await supabase.from('words').select('word').eq('k_canuse', true).eq('last_letter', wordTableCheck.word[0]);
                    const { data: firWords2, error: firWordsError2 } = await supabase.from('wait_words').select('word').ilike('word', `${wordTableCheck.word[0]}%`);

                    const { data: lasWords1, error: lasWordsError1 } = await supabase.from('words').select('word').eq('k_canuse', true).eq('first_letter', wordTableCheck.word[wordTableCheck.word.length - 1]);
                    const { data: lasWords2, error: lasWordsError2 } = await supabase.from('wait_words').select('word').ilike('word', `%${wordTableCheck.word[wordTableCheck.word.length - 1]}`);
                    if (firWordsError1 || firWordsError2 || lasWordsError1 || lasWordsError2) {
                        const error = firWordsError1 ?? firWordsError2 ?? lasWordsError1 ?? lasWordsError2;
                        if (error) {
                            makeError(error);
                            return;
                        }
                    }
                    
                    let kkukoWikiok = false

                    const url = `/api/get_kkukowiki?title=${wordTableCheck.word}`;
                    try{
                        const response = await axios.get(url);
                          if (response.status === 200){
                            kkukoWikiok = true
                          }
                    } catch{

                    }

                    updateLoadingState(90, "정보 가공 중...");

                    // 단어 정보 가공 및 설정
                    wordSetFunc({
                        id: wordTableCheck.id,
                        word: wordTableCheck.word,
                        typez: waitTableCheck && waitTableCheck.request_type === "delete" ? "delete" : "ok",
                        documents: [...docsData1.map((d) => ({ doc_id: d.docs_id, doc_name: d.docs.name })), ...docsData2.map((d) => ({ doc_id: d.docs_id, doc_name: d.docs.name })), ...docc],
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
                        goFirstLetterWords: [...firWords1?.map(w => w.word) ?? [], ...firWords2?.map(w => w.word) ?? []],
                        goLastLetterWords: [...lasWords1?.map(w => w.word) ?? [], ...lasWords2?.map(w => w.word) ?? []],
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
                    const { data: waitDocsData1, error: waitDocsData1Error } = await supabase.from('docs_wait_words').select('docs_id,docs(name)').eq('wait_word_id', waitTableCheck.id);
                    if (waitDocsData1Error) {
                        makeError(waitDocsData1Error);
                        return;
                    }

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

                    const { data: firWords1, error: firWordsError1 } = await supabase.from('words').select('word').eq('k_canuse', true).eq('last_letter', waitTableCheck.word[0]);
                    const { data: firWords2, error: firWordsError2 } = await supabase.from('wait_words').select('word').ilike('word', `${waitTableCheck.word[0]}%`);

                    const { data: lasWords1, error: lasWordsError1 } = await supabase.from('words').select('word').eq('k_canuse', true).eq('first_letter', waitTableCheck.word[waitTableCheck.word.length - 1]);
                    const { data: lasWords2, error: lasWordsError2 } = await supabase.from('wait_words').select('word').ilike('word', `%${waitTableCheck.word[waitTableCheck.word.length - 1]}`);
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
                        documents: [...waitDocsData1.map((d) => ({ doc_id: d.docs_id, doc_name: d.docs.name })), ...docc],
                        themes: {
                            ok: [],
                            waitAdd: waitWordThemes ? waitWordThemes.map(theme => theme.themes.name) : [],
                            waitDel: [],
                        },
                        requested_by: waitTableCheck.users?.nickname,
                        requested_by_uuid: waitTableCheck.requested_by,
                        requested_at: waitTableCheck.requested_at,
                        goFirstLetterWords: [...firWords1?.map(w => w.word) ?? [], ...firWords2?.map(w => w.word) ?? []],
                        goLastLetterWords: [...lasWords1?.map(w => w.word) ?? [], ...lasWords2?.map(w => w.word) ?? []]
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

        fetchWordInfo();
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
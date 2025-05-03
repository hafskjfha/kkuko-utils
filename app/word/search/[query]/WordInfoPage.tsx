"use client";
import WordInfo from './WordInfo';
import { supabase } from '@/app/lib/supabaseClient';
import ErrorModal from '@/app/components/ErrModal';
import { useEffect, useState } from 'react';
import NotFound from '@/app/not-found-client';
import type { PostgrestError } from '@supabase/supabase-js';
import { disassemble } from 'es-hangul';
import Spinner from '@/app/components/Spinner';

// 커스텀 프로그레스 바 컴포넌트
const ProgressBar = ({ completed, label }: { completed: number, label?: string }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
      <div
        className="bg-blue-600 h-4 rounded-full text-xs text-white flex items-center justify-center transition-all duration-300"
        style={{ width: `${completed}%` }}
      >
        {completed > 10 && `${completed}%`}
      </div>
      {label && <div className="text-xs text-center mt-1">{label}</div>}
    </div>
  );
};

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

interface LoadingState {
    isLoading: boolean;
    progress: number;
    currentTask: string;
}

const calculateKoreanInitials = (word: string): string => {
    return word.split("").map((c) => disassemble(c)[0]).join("");
};

export default function WordInfoPage({ query }: { query: string }) {
    const [errorView, setErrorView] = useState<ErrorMessage|null>(null);
    const [wordInfo, setWordInfo] = useState<WordInfoProps|null>(null);
    const [isNotFound, setIsNotFound] = useState(false);
    
    // 로딩 상태를 더 상세하게 관리하기 위한 상태
    const [loadingState, setLoadingState] = useState<LoadingState>({
        isLoading: true,
        progress: 0,
        currentTask: "초기화 중..."
    });

    // 로딩 상태와 진행률 업데이트 함수
    const updateLoadingState = (progress: number, task: string) => {
        setLoadingState({
            isLoading: progress < 100,
            progress,
            currentTask: task
        });
    };

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
            try {
                updateLoadingState(10, "단어 정보 확인 중...");
                
                // 단어 테이블 확인
                const { data: wordTableCheck, error: wordTableCheckError} = await supabase.from('words').select('*,users(nickname)').eq('word',query).maybeSingle();
                if (wordTableCheckError) {
                    makeError(wordTableCheckError);
                    return;
                }
                
                updateLoadingState(20, "대기 단어 정보 확인 중...");
                
                // 대기 테이블 확인
                const { data: waitTableCheck, error: waitTableCheckError} = await supabase.from('wait_words').select('*,users(nickname)').eq('word',query).maybeSingle();
                if (waitTableCheckError) {
                    makeError(waitTableCheckError);
                    return;
                }

                if (wordTableCheck) {
                    updateLoadingState(40, "단어 주제 정보 가져오는 중...");
                    
                    // 단어 주제 정보 가져오기
                    const {data: wordThemes, error: wordThemesError} = await supabase.from('word_themes').select('themes(name)').eq('word_id', wordTableCheck.id);
                    if (wordThemesError) {
                        makeError(wordThemesError);
                        return;
                    }

                    updateLoadingState(60, "단어 대기 주제 정보 가져오는 중...");
                    
                    // 단어 대기 주제 정보 가져오기
                    const {data: wordThemes2, error: wordThemesError2} = await supabase.from('word_themes_wait').select('themes(name), typez').eq('word_id', wordTableCheck.id);
                    if (wordThemesError2) {
                        makeError(wordThemesError2);
                        return;
                    }

                    updateLoadingState(80, "문서 연결 정보 가져오는 중...");
                    
                    // 문서 연결 정보 가져오기
                    const {data: docsData1, error: docsData1Error} = await supabase.from('docs_words').select('docs_id,docs(name)').eq('word_id', wordTableCheck.id);
                    if (docsData1Error) {
                        makeError(docsData1Error);
                        return;
                    }

                    const {data: docsData2, error: docsData2Error} = await supabase.from('docs_words_wait').select('docs_id,docs(name)').eq('word_id', wordTableCheck.id).eq('typez','add');
                    if (docsData2Error) {
                        makeError(docsData2Error);
                        return;
                    }

                    updateLoadingState(90, "정보 가공 중...");
                    
                    // 단어 정보 가공 및 설정
                    wordSetFunc({
                        id: wordTableCheck.id,
                        word: wordTableCheck.word,
                        typez: waitTableCheck && waitTableCheck.request_type==="delete" ? "delete" : "ok",
                        documents: [...docsData1.map((d) => ({ doc_id: d.docs_id, doc_name: d.docs.name })), ...docsData2.map((d) => ({ doc_id: d.docs_id, doc_name: d.docs.name }))],
                        themes: {
                            ok: wordThemes ? wordThemes.filter(theme => !wordThemes2.map(t => t.themes.name).includes(theme.themes.name)).map(theme => theme.themes.name) : [],
                            waitAdd: wordThemes2 ? wordThemes2.filter(theme => theme.typez === 'add').map(theme => theme.themes.name) : [],
                            waitDel: wordThemes2 ? wordThemes2.filter(theme => theme.typez === 'delete').map(theme => theme.themes.name) : [],
                        },
                        noin_canuse: wordTableCheck.noin_canuse,
                        k_canuse: wordTableCheck.k_canuse,
                        requested_by: waitTableCheck && waitTableCheck.request_type==="delete" ? waitTableCheck.users?.nickname : wordTableCheck.users?.nickname,
                        requested_by_uuid: waitTableCheck && waitTableCheck.request_type==="delete" ? waitTableCheck.requested_by : wordTableCheck.added_by,
                        requested_at: waitTableCheck && waitTableCheck.request_type==="delete" ? waitTableCheck.requested_at : wordTableCheck.added_at,
                    });

                } else if (waitTableCheck) {
                    updateLoadingState(50, "대기 단어 주제 정보 가져오는 중...");
                    
                    // 대기 단어 주제 정보 가져오기
                    const {data: waitWordThemes, error: waitWordThemesError} = await supabase.from('wait_word_themes').select('themes(name)').eq('wait_word_id', waitTableCheck.id);
                    if (waitWordThemesError) {
                        makeError(waitWordThemesError);
                        return;
                    }

                    updateLoadingState(75, "대기 단어 문서 정보 가져오는 중...");
                    
                    // 대기 단어 문서 정보 가져오기
                    const {data: waitDocsData1, error: waitDocsData1Error} = await supabase.from('docs_wait_words').select('docs_id,docs(name)').eq('wait_word_id', waitTableCheck.id);
                    if (waitDocsData1Error) {
                        makeError(waitDocsData1Error);
                        return;
                    }

                    updateLoadingState(90, "정보 가공 중...");
                    
                    // 대기 단어 정보 가공 및 설정
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
                
                updateLoadingState(100, "완료!");
            } catch (error) {
                console.error("데이터 로딩 중 오류 발생:", error);
                setLoadingState({
                    isLoading: false,
                    progress: 0,
                    currentTask: "오류 발생"
                });
            }
        };

        fetchWordInfo();
    }, [query]);

    if (isNotFound){
        return <NotFound />;
    }

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

    if (errorView) {
        return (
            <ErrorModal error={errorView} onClose={()=>{}} />
        );
    }

    if (wordInfo){
        return (
            <WordInfo wordInfo={wordInfo} />
        );
    }

    return null;
}
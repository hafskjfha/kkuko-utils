"use client";
import { useState, lazy, Suspense } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, ColumnDef, SortingState } from "@tanstack/react-table";
import type { WordData } from "@/app/types/type";
import TableRow from "./TableRow";
import { useSelector } from 'react-redux';
import { RootState } from "@/app/store/store";
import ErrorModal from "@/app/components/ErrModal";
import type { ErrorMessage } from "@/app/types/type";
import { supabase } from '@/app/lib/supabaseClient';
import type { PostgrestError } from "@supabase/supabase-js";
import { noInjungTopicID } from "./const";
import Spinner from "@/app/components/Spinner";
import CompleteModal from "@/app/components/CompleteModal";

const WorkModal = lazy(() => import("./WorkModal"));


const Table = ({ initialData, id }: { initialData: WordData[], id: string }) => {
    const [data] = useState(initialData);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [modal, setModal] = useState<{ word: string, status: "add" | "delete" | "ok" | "eadd" | "edelete", requer: string } | null>(null);
    const [errorModalView, seterrorModalView] = useState<ErrorMessage | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const user = useSelector((state: RootState) => state.user);

    const columns: ColumnDef<WordData>[] = [
        {
            accessorFn: (row) => row.word.length,
            id: "length",
            header: "길이",
            cell: (info) => info.getValue(),
            enableSorting: true,
        },
        { accessorKey: "word", header: "단어" },
        { accessorKey: "status", header: "상태" },
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: { sorting },
        onSortingChange: setSorting,
    });

    const openWork = (word: string, status: "add" | "delete" | "ok" | "eadd" | "edelete", requer: string) => {
        setModal({ word, status, requer });
        console.log(`요청자: ${requer},유저: ${user.uuid}`);
    } 

    const closeWork = () => {
        setModal(null);
    }

    const CompleWork = () => {
        setModal(null);
        setIsCompleteModalOpen(true);
    }

    const makeError = (error: PostgrestError) => {
        closeWork();
        seterrorModalView({
            ErrName: error.name,
            ErrMessage: error.message,
            ErrStackRace: error.stack,
            inputValue: null
        });
    }

    const AddAccept = async (word: string) => {
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

        // 2.1 추가 요청 단어의 주제 정보 가져오기
        const { data: getWordThemesData, error: getWordThemesDataError } = await supabase.from('wait_word_themes').select('*').eq('theme_id', getWaitWordData.id);
        if (getWordThemesDataError) {
            makeError(getWordThemesDataError);
            setIsProcessing(false);
            return;
        }
        if (!getWordThemesData) return;

        // 2.2 단어의 노인정 여부 체크
        let isNoinWord = false;
        for (const t of getWordThemesData) {
            if (noInjungTopicID.includes(t.theme_id)) {
                isNoinWord = true;
                break;
            }
        }

        // 3.1 단어 데이터 추가
        const insertWordData = {
            word: getWaitWordData.word,
            noin_canuse: isNoinWord
        }
        const { data: getAddAcceptData, error: getAddAcceptDataError } = await supabase.from('words').insert(insertWordData).select('*').single();
        if (getAddAcceptDataError) {
            makeError(getAddAcceptDataError);
            setIsProcessing(false);
            return;
        }

        // 3.2 단어 주제 데이터 추가
        const insertWordThemesData = getWordThemesData.map((t) => {
            return {
                word_id: getAddAcceptData.id,
                theme_id: t.theme_id
            }
        });
        const { error: getAddAcceptThemesDataError } = await supabase.from('word_themes').insert(insertWordThemesData);
        if (getAddAcceptThemesDataError) {
            makeError(getAddAcceptThemesDataError);
            setIsProcessing(false);
            return;
        }

        // 3.3 단어 추가 로그 등록
        const insertWordLogData = {
            word: getWaitWordData.word,
            make_by: getWaitWordData.requested_by,
            processed_by: user.uuid || null,
            r_type: "add",
            state: "approved"
        } as const;
        const { error: getAddAcceptLogDataError } = await supabase.from('logs').insert(insertWordLogData);
        if (getAddAcceptLogDataError) {
            makeError(getAddAcceptLogDataError);
            setIsProcessing(false);
            return;
        }

        // 4. 문서와 추가 요청있으면 처리
        const { data: getAddAcceptDocsData, error: getAddAcceptDocsDataError } = await supabase.from('docs_wait_words').select('*').eq('wait_word_id', getWaitWordData.id);
        if (getAddAcceptDocsDataError) {
            makeError(getAddAcceptDocsDataError);
            setIsProcessing(false);
            return;
        }
        if (getAddAcceptDocsData) {
            const insertDocsData = getAddAcceptDocsData.map((d) => {
                return {
                    docs_id: d.docs_id,
                    word_id: getAddAcceptData.id
                }
            });
            const { data: insertAddAcceptDocsData, error: insertAddAcceptDocsDataError } = await supabase.from('docs_words').insert(insertDocsData).select('*');
            if (insertAddAcceptDocsDataError) {
                makeError(insertAddAcceptDocsDataError);
                setIsProcessing(false);
                return;
            }
            // 4.1 문서 로그 추가
            const insertDocsLogData = insertAddAcceptDocsData.map((d) => {
                return {
                    word: getWaitWordData.word,
                    docs_id: d.docs_id,
                    add_by: getWaitWordData.requested_by,
                    type: "add"
                } as const;
            });
            const { error: insertDocsLogDataError } = await supabase.from('docs_logs').insert(insertDocsLogData);
            if (insertDocsLogDataError) {
                makeError(insertDocsLogDataError);
                setIsProcessing(false);
                return;
            }
        }

        // 5. 추가 요청 테이블에서 삭제
        const { error: deleteWaitWordDataError } = await supabase.from('wait_words').delete().eq('id', getWaitWordData.id);
        if (deleteWaitWordDataError) {
            makeError(deleteWaitWordDataError);
            setIsProcessing(false);
            return;
        }

        setIsProcessing(false);
        CompleWork();
        return;

    }

    const AddReject = async (word: string) => {
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
        const { error: getAddRejectLogDataError } = await supabase.from('logs').insert(insertWordLogData);
        if (getAddRejectLogDataError) {
            makeError(getAddRejectLogDataError);
            setIsProcessing(false);
            return;
        }

        setIsProcessing(false);
        CompleWork();
        return;
    }

    const DeleteAccept = async (word: string) => {
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
        const { error: getDeleteAcceptLogDataError } = await supabase.from('logs').insert(insertWordLogData);
        if (getDeleteAcceptLogDataError) {
            makeError(getDeleteAcceptLogDataError);
            setIsProcessing(false);
            return;
        }

        // 2.4 문서 로그 등록
        const insertDocsLogData = getDeleteDocsData.map((d) => {
            return {
                word: getWaitWordData.word,
                docs_id: d.docs_id,
                add_by: getWaitWordData.requested_by,
                type: "delete"
            } as const;
        });
        const { error: insertDocsLogDataError } = await supabase.from('docs_logs').insert(insertDocsLogData);
        if (insertDocsLogDataError) {
            makeError(insertDocsLogDataError);
            setIsProcessing(false);
            return;
        }

        setIsProcessing(false);
        CompleWork();
        return;
    }

    const DeleteReject = async (word: string) => {
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
        const { error: getDeleteRejectLogDataError } = await supabase.from('logs').insert(insertWordLogData);
        if (getDeleteRejectLogDataError) {
            makeError(getDeleteRejectLogDataError);
            setIsProcessing(false);
            return;
        }

        setIsProcessing(false);
        CompleWork();
        return;
    }

    const CancelAddRequest = async (word: string) => {
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
    }

    const CancelDeleteRequest = async (word: string) => {
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
    }

    const DeleteByAdmin = async (word: string) => {
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
            const { error: insertDocsLogDataError } = await supabase.from('docs_logs').insert(insertDocsLogData);
            if (insertDocsLogDataError) {
                makeError(insertDocsLogDataError);
                setIsProcessing(false);
                return;
            }
        }

        // 2.2 로그에 등록
        const insertWordLogData = {
            word: word,
            make_by: user.uuid || null,
            processed_by: user.uuid || null,
            r_type: "delete",
            state: "approved"
        } as const;
        const { error: insertWordLogDataError } = await supabase.from('logs').insert(insertWordLogData);
        if (insertWordLogDataError) {
            makeError(insertWordLogDataError);
            setIsProcessing(false);
            return;
        }

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

    }

    const RequestDelete = async (word: string) => {
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
    }

    const DeleteWordFromDocsByAdin = async (word: string) => {
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
        const { error: insertDocsLogDataError } = await supabase.from('docs_logs').insert(logData);
        if (insertDocsLogDataError) {
            makeError(insertDocsLogDataError);
            setIsProcessing(false);
            return;
        }

        setIsProcessing(false);
        CompleWork();
        return;
    }

    const DeleteWordFromDocsRequest = async (word: string) => {
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
    }

    const onCancelDeleteFromDocsRequest = async (word: string) => {
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

    }

    const onDeleteFromDocsAccept = async (word: string) => {
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
        const { error: insertDocsLogDataError } = await supabase.from('docs_logs').insert(insertDocsLogData);
        if (insertDocsLogDataError) {
            makeError(insertDocsLogDataError);
            setIsProcessing(false);
            return;
        }

        setIsProcessing(false);
        CompleWork();
        return;
    }

    const onDeleteFromDocsReject = async (word: string) => {
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
    }

    const onAddFromDocsAccept = async (word: string) => {
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
        const { error: insertDocsLogDataError } = await supabase.from('docs_logs').insert(insertDocsLogData);
        if (insertDocsLogDataError) {
            makeError(insertDocsLogDataError);
            setIsProcessing(false);
            return;
        }

        setIsProcessing(false);
        CompleWork();
        return;
    }

    const onAddFromDocsReject = async (word: string) => {
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
    }

    return (
        <div className="w-full mx-auto px-2 sm:px-3 overflow-x-auto">
            <table className="border-collapse border border-gray-300 w-full min-w-[600px] text-center">
                <thead>
                    <tr className="bg-gray-200">
                        <th
                            className="border px-3 py-2 cursor-pointer whitespace-nowrap"
                            onClick={() => table.getColumn("length")?.toggleSorting()}
                        >
                            <div className="flex items-center justify-center gap-1">
                                길이
                                {table.getState().sorting.find((s) => s.id === "length")?.desc === undefined ? "↕️" :
                                    table.getState().sorting.find((s) => s.id === "length")?.desc ? "🔽" : "🔼"}
                            </div>
                        </th>

                        <th
                            className="border px-3 py-2 cursor-pointer whitespace-nowrap"
                            onClick={() => table.getColumn("word")?.toggleSorting()}
                        >
                            <div className="flex items-center justify-center gap-1">
                                단어
                                {table.getState().sorting.find((s) => s.id === "word")?.desc === undefined ? "↕️" :
                                    table.getState().sorting.find((s) => s.id === "word")?.desc ? "🔽" : "🔼"}
                            </div>
                        </th>

                        <th className="border px-3 py-2 whitespace-nowrap">상태</th>
                        <th className="border px-3 py-2 whitespace-nowrap">작업</th>
                    </tr>
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => {
                        const wordData = row.original;
                        return (
                            <TableRow
                                key={wordData.word}
                                {...wordData}
                                openWork={user.uuid !== undefined ? () => openWork(wordData.word, wordData.status, wordData.maker ?? "") : undefined}
                            />
                        );
                    })}
                </tbody>
            </table>

            {/* 모달 영역 */}
            {modal && (
                <Suspense fallback={<div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 rounded-lg" ><Spinner /></div>}>
                    <WorkModal
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
                        onCancelAddFromDocsRequest={()=> onCancelDeleteFromDocsRequest(modal.word)}
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

            {isProcessing && <Spinner />}
            {isCompleteModalOpen && <CompleteModal onClose={() => setIsCompleteModalOpen(false)} open={isCompleteModalOpen}/>}
        </div>

    );
}

export default Table;
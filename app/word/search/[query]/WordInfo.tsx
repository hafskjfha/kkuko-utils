"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import Link from "next/link";
import { FileText, Edit, Trash2, AlertCircle, CheckCircle, Info } from "lucide-react";
import { useSelector } from 'react-redux';
import { RootState } from "@/app/store/store";
import useSWR from "swr";
import { fetcher } from "../../lib";
import Spinner from "@/app/components/Spinner";
import ErrorModal from "@/app/components/ErrModal";
import WordThemeEditModal from "./WordhemeEditModal";
import { noInjungTopic } from "../../const";
import CompleteModal from "@/app/components/CompleteModal";
import { supabase } from "@/app/lib/supabaseClient"
import ConfirmModal from "@/app/components/ConfirmModal";
import { josa } from "es-hangul";
import { useRouter } from 'next/navigation'

interface WordInfoProps {
    word: string;
    missionLetter: [string, number][]; // [["가", 1], ["나", 2]] 형태
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
    requester_uuid?: string;
    requester?: string;
    requestTime?: string;
}

const WordInfo = ({ wordInfo }: { wordInfo: WordInfoProps }) => {
    const user = useSelector((state: RootState) => state.user);
    const { data, error, isLoading } = useSWR("themes", fetcher);
    const [errorModalView, setErrorModalView] = useState<ErrorMessage | null>(null);
    const [topicInfo, setTopicInfo] = useState<{ topicsCode: Record<string, string>, topicsKo: Record<string, string>, topicsID: Record<string, number> }>({ topicsCode: {}, topicsKo: {}, topicsID: {} })
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [completeModalOpen, setCompleteModalOpen] = useState<{ word: string, isOpen: boolean, addThemes: string[], delThemes: string[], s: "t" } | { word: string, work: "dr" | "ca", s: "r" } | null>(null);
    const [conFirmModalOpen, setConFirmModalOpen] = useState(false);
    const router = useRouter()

    // 상태에 따른 스타일 설정
    const getStatusBadge = () => {
        switch (wordInfo.status) {
            case "ok":
                return <Badge className="bg-green-500 hover:bg-green-600">확인됨</Badge>;
            case "추가요청":
                return <Badge className="bg-blue-500 hover:bg-blue-600">추가요청</Badge>;
            case "삭제요청":
                return <Badge className="bg-red-500 hover:bg-red-600">삭제요청</Badge>;
            default:
                return null;
        }
    };

    if (error) {
        setErrorModalView({
            ErrMessage: "An error occurred while fetching data.",
            ErrName: "ErrorFetchingData",
            ErrStackRace: "",
            inputValue: "themes fetch"
        });
    }

    useEffect(() => {
        if (!data) return;
        const newTopicsCode = data.reduce((acc, d) => ({ ...acc, [d.code]: d.name }), {});
        const newTopicsKo = data.reduce((acc, d) => ({ ...acc, [d.name]: d.code }), {});
        const newTopicID = data.reduce((acc, d) => ({ ...acc, [d.code]: d.id }), {});
        setTopicInfo({ topicsCode: newTopicsCode, topicsKo: newTopicsKo, topicsID: newTopicID })
    }, [data]);

    const injungTheme = Object.entries(topicInfo.topicsKo)
        .filter(([label]) => !noInjungTopic.includes(label))
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map((lable) => lable[0]);
    const noInjungTheme = Object.entries(topicInfo.topicsKo)
        .filter(([label]) => noInjungTopic.includes(label))
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map((lable) => lable[0])

    // 미션 글자 표시를 위한 포맷팅
    const formatMissionLetters = () => {
        if (wordInfo.missionLetter.length === 0) return "없음";

        return (
            <div className="flex flex-wrap gap-2">
                {wordInfo.missionLetter.map((part, index) => {
                    const [letter, count] = part;
                    return (
                        <Badge key={`mission-${index}`} variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                            {letter} × {count || 1}
                        </Badge>
                    );
                })}
            </div>
        );
    };

    const handleThemeEditSave = async (newThemes: string[], delThemes: string[]) => {
        const delThemesQuery = delThemes.map((theme) => ({ word_id: wordInfo.dbId, theme_id: topicInfo.topicsID[topicInfo.topicsKo[theme]], typez: "delete" as const }));
        const newThemesQuery = newThemes.map((theme) => ({ word_id: wordInfo.dbId, theme_id: topicInfo.topicsID[topicInfo.topicsKo[theme]], typez: "add" as const }));

        const { data: editRequestData, error: editRequestError } = await supabase.from('word_themes_wait').upsert([...delThemesQuery, ...newThemesQuery], { onConflict: "word_id,theme_id", ignoreDuplicates: true }).select('themes(name), typez');
        if (editRequestError) {
            setErrorModalView({
                ErrMessage: "An error occurred while saving the theme edit.",
                ErrName: "ErrorSavingThemeEdit",
                ErrStackRace: editRequestError.message,
                inputValue: "theme edit save"
            });
            return;
        }

        const addThemesA = editRequestData.filter((item) => item.typez === "add").map((item) => item.themes.name);
        const delThemesA = editRequestData.filter((item) => item.typez === "delete").map((item) => item.themes.name);

        wordInfo.topic.ok = wordInfo.topic.ok.filter((t) => !addThemesA.includes(t) && !delThemesA.includes(t));
        wordInfo.topic.waitAdd = [...new Set([...wordInfo.topic.waitAdd, ...addThemesA])].sort((a, b) => a.localeCompare(b, "ko"));
        wordInfo.topic.waitDel = [...new Set([...wordInfo.topic.waitDel, ...delThemesA])].sort((a, b) => a.localeCompare(b, "ko"));

        setCompleteModalOpen({ word: wordInfo.word, isOpen: true, addThemes: addThemesA, delThemes: delThemesA, s: "t" });

    }

    const onCompleteModalClose = () => {
        if (completeModalOpen?.s === "r" && completeModalOpen?.work === "ca" && wordInfo.status === "추가요청") {
            router.back();
            return;
        }
        setCompleteModalOpen(null);

    }

    const onCancelOrDeleteRequest = async () => {
        setConFirmModalOpen(false)
        if (wordInfo.status === "ok" && user.uuid) {
            const { data: requestDeleteData, error: requestDeleteError } = await supabase.from('wait_words').insert({
                word: wordInfo.word,
                request_type: "delete" as const,
                requested_by: user.uuid
            }).select('*');

            if (requestDeleteError) {
                setErrorModalView({
                    ErrMessage: "An error occurred while delete request",
                    ErrName: "ErrorDeleteRequest",
                    ErrStackRace: requestDeleteError.message,
                    inputValue: "delete request"
                });
                return;
            };

            wordInfo.status = "삭제요청"
            wordInfo.requestTime = requestDeleteData[0].requested_at;
            setCompleteModalOpen({ word: wordInfo.word, work: "dr", s: "r" });
        }
        else if (wordInfo.status !== "ok" && user.uuid && wordInfo.requester_uuid === user.uuid) {
            const { error: requestCancelError } = await supabase.from('wait_words').delete().eq("word", wordInfo.word);
            if (requestCancelError) {
                setErrorModalView({
                    ErrMessage: "An error occurred while cancel request",
                    ErrName: "ErrorCancelRequest",
                    ErrStackRace: requestCancelError.message,
                    inputValue: "cancel request"
                });
                return;
            };
            if (wordInfo.status === "삭제요청") {
                wordInfo.status = "ok"
                const { data: originData, error: originDataError } = await supabase.from('words').select('*').eq('word', wordInfo.word).maybeSingle();
                if (originDataError) {
                    setErrorModalView({
                        ErrMessage: "An error occurred while cancel request",
                        ErrName: "ErrorCancelRequest",
                        ErrStackRace: originDataError.message,
                        inputValue: "cancel request"
                    });
                    return;
                }

                wordInfo.requestTime = originData?.added_at;
            }
            setCompleteModalOpen({ word: wordInfo.word, work: "ca", s: "r" })
        }
    }

    const handleWordChainClick = (wordList: string[]) => {
        if (wordList.length === 0) return;

        // Select a random word from the list
        const randomIndex = Math.floor(Math.random() * wordList.length);
        const randomWord = wordList[randomIndex];

        // Navigate to the selected word
        router.push(`/word/search/${randomWord}`);
    };


    // 주제가 모두 비어있는지 확인
    const isTopicEmpty =
        wordInfo.topic.ok.length === 0 &&
        wordInfo.topic.waitAdd.length === 0 &&
        wordInfo.topic.waitDel.length === 0;

    const utcRequestTime = wordInfo.requestTime ? new Date(wordInfo.requestTime) : null;
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localTime = utcRequestTime?.toLocaleString(undefined, { timeZone: userTimeZone });

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {isLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 rounded-lg" >
                    <Spinner />
                </div>
            )}
            <div className="max-w-4xl mx-auto">
                {/* 헤더 섹션 */}
                <Card className="mb-3 shadow-md border-none overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-3xl font-bold flex items-center gap-2">
                                    {wordInfo.word} {getStatusBadge()}
                                </CardTitle>
                                <p className="text-blue-100 mt-1">
                                    초성: {wordInfo.initial} | 길이: {wordInfo.length}자
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {(wordInfo.status === "ok" && user.uuid) &&
                                    <Button variant="secondary" className="flex items-center gap-1" onClick={() => setEditModalOpen(true)}>
                                        <Edit size={16} /> 수정
                                    </Button>
                                }
                                {((wordInfo.status === "ok" && user.uuid) || (wordInfo.status !== "ok" && wordInfo.requester_uuid === user.uuid)) &&
                                    (<Button variant="destructive" className="flex items-center gap-1" onClick={() => setConFirmModalOpen(true)}>
                                        <Trash2 size={16} /> {wordInfo.status === "ok" ? "삭제요청" : "요청취소"}
                                    </Button>)
                                }
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <Card className="mb-6 shadow-md border-none overflow-hidden">
                    <CardContent className="py-4 flex items-center justify-center gap-6">
                        {/* 첫 글자로 시작하는 단어 버튼 */}
                        {wordInfo.goFirstLetterWords.length > 0 ? (
                            <Button
                                variant="outline"
                                className="flex items-center gap-1 text-green-600 border-green-300 hover:bg-green-50"
                                onClick={() => handleWordChainClick(wordInfo.goFirstLetterWords)}
                            >
                                <span className="font-bold">&lt;{wordInfo.word[0]}</span>
                                <span className="text-sm ml-1">({wordInfo.goFirstLetterWords.length})</span>
                            </Button>
                        ) : (
                            <div className="flex items-center gap-1 text-red-400 border border-red-200 rounded-md px-3 py-2">
                                <AlertCircle size={16} />
                                <span className="font-bold">&lt;{wordInfo.word[0]}</span>
                            </div>
                        )}

                        {/* 연결 표시 */}
                        <div className="flex items-center">
                            <span className="text-gray-400 text-sm">단어 연결</span>
                        </div>

                        {/* 마지막 글자로 끝나는 단어 버튼 */}
                        {wordInfo.goLastLetterWords.length > 0 ? (
                            <Button
                                variant="outline"
                                className="flex items-center gap-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                                onClick={() => handleWordChainClick(wordInfo.goLastLetterWords)}
                            >
                                <span className="font-bold">{wordInfo.word[wordInfo.word.length - 1]}&gt;</span>
                                <span className="text-sm ml-1">({wordInfo.goLastLetterWords.length})</span>
                            </Button>
                        ) : (
                            <div className="flex items-center gap-1 text-red-400 border border-red-200 rounded-md px-3 py-2">
                                <AlertCircle size={16} />
                                <span className="font-bold">{wordInfo.word[wordInfo.word.length - 1]}&gt;</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 메인 콘텐츠 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 왼쪽 칼럼 - 상태 및 문서 정보 */}
                    <div className="md:col-span-1">
                        {/* 상태 정보 카드 */}
                        <Card className="mb-6 shadow-sm">
                            <CardHeader className={`pb-2 ${wordInfo.status === "추가요청" ? "bg-blue-50" : wordInfo.status === "ok" ? "bg-green-50" : "bg-red-50"}`}>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <AlertCircle size={18} className={wordInfo.status === "추가요청" ? "text-blue-500" : wordInfo.status === "ok" ? "text-green-500" : "text-red-500"} />
                                    {wordInfo.status === "추가요청" ? "추가 요청 정보" : wordInfo.status === "ok" ? "단어 등록 정보" : "삭제 요청 정보"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-600">{wordInfo.status === "ok" ? "추가자" : "요청자:"}</span>
                                        <span>{wordInfo.requester || "알 수 없음"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-600">{wordInfo.status === "ok" ? "추가 시각" : "요청 시간:"}</span>
                                        <span>{localTime || "알 수 없음"}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 미션 글자 카드 - 새로 추가 */}
                        <Card className="mb-6 shadow-sm">
                            <CardHeader className="pb-2 bg-gray-50">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Info size={18} className="text-blue-500" />
                                    미션 글자
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {formatMissionLetters()}
                            </CardContent>
                        </Card>

                        {/* 단어 특성 카드 */}
                        <Card className="mb-6 shadow-sm">
                            <CardHeader className="pb-2 bg-gray-50">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CheckCircle size={18} className="text-green-500" />
                                    단어 특성
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                        <span className="font-medium text-gray-600">끝말잇기:</span>
                                        <Badge variant={wordInfo.isChainable ? "default" : "outline"} className={wordInfo.isChainable ? "bg-green-500" : ""}>
                                            {wordInfo.isChainable ? "가능" : "불가능"}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                        <span className="font-medium text-gray-600">노인정 사용:</span>
                                        <Badge variant={wordInfo.isSeniorApproved ? "default" : "outline"} className={wordInfo.isSeniorApproved ? "bg-green-500" : ""}>
                                            {wordInfo.isSeniorApproved ? "가능" : "불가능"}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-600">DB ID:</span>
                                        <span className="text-gray-800">{wordInfo.dbId}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 단어 설명 카드 */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-2 bg-gray-50">
                                <CardTitle className="text-lg">단어 설명</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <p className="text-gray-700 italic">
                                    <strong className="text-blue-600">&quot;{wordInfo.word[0]}&quot;</strong>으로 시작하여 <strong className="text-blue-600">&quot;{wordInfo.word[wordInfo.word.length - 1]}&quot;</strong>로 끝나는 단어입니다.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 오른쪽 칼럼 - 주제 및 문서 */}
                    <div className="md:col-span-2">
                        {/* 주제 카드 */}
                        <Card className="mb-6 shadow-sm">
                            <CardHeader className="pb-2 bg-gray-50">
                                <CardTitle className="text-lg">주제 분류</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {isTopicEmpty ? (
                                    <div className="py-6 text-center text-gray-500 flex flex-col items-center gap-2">
                                        <Info size={24} className="text-gray-400" />
                                        <p>등록된 주제 정보가 없습니다.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {wordInfo.topic.ok.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 mb-2">승인된 주제</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {wordInfo.topic.ok.map((t, index) => (
                                                        <Badge key={t} variant="secondary" className="bg-gray-200 text-gray-800">
                                                            {t}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {wordInfo.topic.waitAdd.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 mb-2">추가 대기 주제</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {wordInfo.topic.waitAdd.map((t, index) => (
                                                        <Badge key={index} variant="outline" className="border-dashed border-blue-300 text-blue-700">
                                                            {t}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {wordInfo.topic.waitDel.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 mb-2">삭제 대기 주제</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {wordInfo.topic.waitDel.map((t, index) => (
                                                        <Badge key={index} variant="outline" className="border-red-300 text-red-700">
                                                            {t}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 연결된 문서 카드 */}
                        {wordInfo.documents.length > 0 ? (
                            <Card className="shadow-sm">
                                <CardHeader className="pb-2 bg-gray-50">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileText size={18} className="text-blue-500" />
                                        연결된 문서 ({wordInfo.documents.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="overflow-hidden rounded-lg border border-gray-200">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="py-3 px-4 text-sm font-medium text-gray-600 border-b">문서 ID</th>
                                                    <th className="py-3 px-4 text-sm font-medium text-gray-600 border-b">문서 이름</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {wordInfo.documents.map((doc) => (
                                                    <tr key={doc.doc_id} className="hover:bg-gray-50">
                                                        <td className="py-3 px-4 text-sm text-gray-500">{doc.doc_id}</td>
                                                        <td className="py-3 px-4">
                                                            <Link href={`/words-docs/${doc.doc_id}`} className="text-blue-600 hover:underline hover:text-blue-800 flex items-center gap-1">
                                                                <FileText size={14} /> {doc.doc_name}
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="shadow-sm">
                                <CardHeader className="pb-2 bg-gray-50">
                                    <CardTitle className="text-lg">연결된 문서</CardTitle>
                                </CardHeader>
                                <CardContent className="py-6 text-center text-gray-500">
                                    연결된 문서가 없습니다.
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
            {errorModalView &&
                <ErrorModal error={errorModalView} onClose={() => { setErrorModalView(null) }} />}
            {editModalOpen && <WordThemeEditModal wordInfo={wordInfo} onClose={() => setEditModalOpen(false)} isOpen={editModalOpen} onSave={handleThemeEditSave} injungTheme={injungTheme} noInjungTheme={noInjungTheme} />}
            {completeModalOpen &&
                <CompleteModal
                    open={completeModalOpen !== null}
                    onClose={onCompleteModalClose}
                    title={completeModalOpen.s === "t" ? `단어 "${completeModalOpen.word}"에 대한 주제 수정 완료` : `${josa(wordInfo.word, "을/를")} ${wordInfo.status === "ok" ? "삭제 요청을" : (wordInfo.status === "삭제요청" ? "삭제 요청취소" : "추가 요청취소") + "를"} 하였습니다`}
                    description={completeModalOpen.s === "t" ? `주제 수정이 요청이 완료되었습니다. ${completeModalOpen.addThemes.length > 0 ? `추가 요청된 주제: ${completeModalOpen.addThemes.join(", ")}` : ``} ${completeModalOpen.delThemes.length > 0 ? `삭제 요청된 주제: ${completeModalOpen.delThemes.join(", ")}` : ``}` : ``}
                />
            }
            {conFirmModalOpen &&
                <ConfirmModal
                    title={`"${wordInfo.word}"${josa(wordInfo.word, "을/를")[wordInfo.word.length]} ${wordInfo.status === "ok" ? "삭제 요청" : `${wordInfo.status === "삭제요청" ? "삭제" : "추가"} 요청 취소`}를 하시겠습니까?`}
                    description={"요청후 취소 할 수 " + (wordInfo.status === "ok" ? "있습니다." : "없습니다.")}
                    open={conFirmModalOpen}
                    onClose={() => setConFirmModalOpen(false)}
                    onConfirm={onCancelOrDeleteRequest}
                />
            }
        </div>
    );
};

export default WordInfo;
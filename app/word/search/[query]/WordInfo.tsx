import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import Link from "next/link";
import { FileText, Edit, Trash2, AlertCircle, CheckCircle, Info } from "lucide-react";

interface WordInfoProps {
    word: string;
    missionLetter: string; // "가*2 나*1" 형태 
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
    requestTime?: string;
}

const WordInfoPage: React.FC<{ wordInfo: WordInfoProps }> = ({ wordInfo }) => {
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

    // 미션 글자 표시를 위한 포맷팅
    const formatMissionLetters = () => {
        if (!wordInfo.missionLetter) return "없음";

        const missionParts = wordInfo.missionLetter.split(" ");
        return (
            <div className="flex flex-wrap gap-2">
                {missionParts.map((part, index) => {
                    const [letter, count] = part.split("*");
                    return (
                        <Badge key={index} variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                            {letter} × {count || 1}
                        </Badge>
                    );
                })}
            </div>
        );
    };

    // 주제가 모두 비어있는지 확인
    const isTopicEmpty =
        wordInfo.topic.ok.length === 0 &&
        wordInfo.topic.waitAdd.length === 0 &&
        wordInfo.topic.waitDel.length === 0;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                {/* 헤더 섹션 */}
                <Card className="mb-6 shadow-md border-none overflow-hidden">
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
                                <Button variant="secondary" className="flex items-center gap-1">
                                    <Edit size={16} /> 수정
                                </Button>
                                <Button variant="destructive" className="flex items-center gap-1">
                                    <Trash2 size={16} /> 삭제요청
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* 메인 콘텐츠 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 왼쪽 칼럼 - 상태 및 문서 정보 */}
                    <div className="md:col-span-1">
                        {/* 상태 정보 카드 */}
                        {(wordInfo.status === "추가요청" || wordInfo.status === "삭제요청") && (
                            <Card className="mb-6 shadow-sm">
                                <CardHeader className={`pb-2 ${wordInfo.status === "추가요청" ? "bg-blue-50" : "bg-red-50"}`}>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <AlertCircle size={18} className={wordInfo.status === "추가요청" ? "text-blue-500" : "text-red-500"} />
                                        {wordInfo.status === "추가요청" ? "추가 요청 정보" : "삭제 요청 정보"}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-600">요청자:</span>
                                            <span>{wordInfo.requester || "알 수 없음"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-600">요청 시간:</span>
                                            <span>{wordInfo.requestTime || "알 수 없음"}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

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
                                    <strong className="text-blue-600">"{wordInfo.word}"</strong>으로 시작하여 <strong className="text-blue-600">"{wordInfo.word}"</strong>로 끝나는 단어입니다.
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
                                                        <Badge key={index} variant="secondary" className="bg-gray-200 text-gray-800">
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
        </div>
    );
};

export default WordInfoPage;
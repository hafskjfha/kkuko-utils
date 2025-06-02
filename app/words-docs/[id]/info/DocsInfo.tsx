"use client";
import Link from "next/link";
import { Calendar, Clock, User, FileText, Tag, ArrowLeft, Eye, TrendingUp } from "lucide-react";

interface Metadata {
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

const DocsInfo = ({ metaData, wordsCount, docsViewRank }: { metaData: Metadata; wordsCount: number, docsViewRank:number }) => {
    const lastUpdateDate = new Date(metaData.last_update);
    const createdAtDate = new Date(metaData.created_at);
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // 날짜 포맷팅 개선
    const formatDate = (date: Date) => {
        return date.toLocaleString(undefined, {
            timeZone: userTimeZone,
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 문서 유형에 따른 색상 설정
    const getTypeColor = (type: string) => {
        switch (type) {
            case "letter":
                return "bg-indigo-100 text-indigo-800";
            case "theme":
                return "bg-emerald-100 text-emerald-800";
            default:
                return "bg-amber-100 text-amber-800";
        }
    };

    // 유형에 따른 한국어 텍스트 설정
    const getTypeText = (type: string) => {
        switch (type) {
            case "letter":
                return "letter";
            case "theme":
                return "theme";
            default:
                return "ect";
        }
    };

    return (
        <div className="min-h-screen max-w-6xl mx-auto px-4 py-8 space-y-8">
            {/* 이전 페이지로 돌아가기 */}
            <Link href={`/words-docs/${metaData.id}`} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft size={18} className="mr-2" />
                <span>문서로 돌아가기</span>
            </Link>

            {/* 헤더 섹션 - 그림자와 패딩 추가 */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 gap-3">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{metaData.name}</h1>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(metaData.typez)}`}>
                            {getTypeText(metaData.typez)}
                        </span>
                    </div>
                    {metaData.users && (
                        <Link href={`/profile?username=${metaData.users.nickname}`} className="flex items-center gap-2 hover:bg-gray-100 rounded-full px-3 py-1 transition-colors">
                            <User size={16} className="text-gray-600" />
                            <span className="font-medium text-gray-800">{metaData.users.nickname}</span>
                        </Link>
                    )}
                </div>

                {/* 메타데이터 섹션 - 더 시각적으로 개선 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                        <Calendar size={20} className="text-indigo-600 mt-1" />
                        <div>
                            <p className="text-sm text-gray-500 font-medium">생성일</p>
                            <p className="text-base text-gray-800">{formatDate(createdAtDate)}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                        <Clock size={20} className="text-emerald-600 mt-1" />
                        <div>
                            <p className="text-sm text-gray-500 font-medium">마지막 업데이트</p>
                            <p className="text-base text-gray-800">{formatDate(lastUpdateDate)}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                        <FileText size={20} className="text-amber-600 mt-1" />
                        <div>
                            <p className="text-sm text-gray-500 font-medium">단어 개수</p>
                            <p className="text-base text-gray-800">{new Intl.NumberFormat().format(wordsCount)}개</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                        <Tag size={20} className="text-rose-600 mt-1" />
                        <div>
                            <p className="text-sm text-gray-500 font-medium">문서 ID</p>
                            <p className="text-base text-gray-800">{metaData.id}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                        <Eye size={20} className="text-blue-600 mt-1" />
                        <div>
                            <p className="text-sm text-gray-500 font-medium">조회수</p>
                            <p className="text-base text-gray-800">{new Intl.NumberFormat().format(metaData.views)}회</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                        <TrendingUp size={20} className="text-purple-600 mt-1" />
                        <div>
                            <p className="text-sm text-gray-500 font-medium">조회수 랭킹</p>
                            <p className="text-base text-gray-800">{docsViewRank}위</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocsInfo;
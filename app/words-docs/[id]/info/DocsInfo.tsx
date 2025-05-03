"use client";
import Link from "next/link";

interface metadata {
    id: number;
    created_at: string;
    name: string;
    users: {
        nickname: string;
    } | null;
    typez: "letter" | "theme" | "ect";
    last_update: string;
}

const DocsInfo = ({ metaData, wordsCount }: { metaData: metadata, wordsCount: number }) => {
    const lastUpdateDate = new Date(metaData.last_update); // UTC 기준 Date 객체
    const createdAtDate = new Date(metaData.created_at);
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localTime = lastUpdateDate.toLocaleString(undefined, { timeZone: userTimeZone });
    const localTime2 = createdAtDate.toLocaleString(undefined, { timeZone: userTimeZone });

    return (
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-2">
                <Link href={`/words-docs/${metaData.id}`} className="underline">
                    <h1 className="text-2xl sm:text-3xl font-bold">{metaData.name} - 정보</h1>
                </Link>
                <span className="px-3 py-1 text-sm font-semibold bg-blue-100 text-blue-800 rounded-lg">
                    {metaData.typez.toUpperCase()}
                </span>
            </div>

            {/* Metadata Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg shadow-sm">
                <div>
                    <p className="text-sm text-gray-600">작성자</p>
                    <p className="text-lg font-medium break-words">
                        {metaData.users ? (
                            <Link href={`/profile?username=${metaData.users.nickname}`} className="hover:underline">
                                {metaData.users.nickname}
                            </Link>
                        ) : (
                            "알 수 없음"
                        )}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">생성일</p>
                    <p className="text-lg font-medium">{localTime2}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">마지막 업데이트</p>
                    <p className="text-lg font-medium">{localTime}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">단어 개수</p>
                    <p className="text-lg font-medium">{wordsCount}</p>
                </div>
            </div>
        </div>

    );
};


export default DocsInfo;
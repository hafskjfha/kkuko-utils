"use client";
import { useRef, useState } from "react";
import TableOfContents from "./TableOfContents";
import WordsTableBody from "./WordsTableBody";
import Link from "next/link";


interface WordData {
    word: string;
    status: "ok" | "delR" | "addR";
}
interface DocsPageProp{
    id: string
}
const initialData:WordData[] = [
    { word: "티티티", status: "ok" },
    { word: "ㅇㅇ", status: "addR" },
    { word: "인도네시아페칼롱간의바틱박물관과공동수행하는초중고등학교직업학교기술전문학교학생들에대한바틱무형문화유산교육및훈련", status: "delR" },
];

const DocsDataPage: React.FC<DocsPageProp> = ({ id }) => {
    const refA = useRef<HTMLDivElement>(null);
    const [showWords, setShowWords] = useState(true); // 단어 표시 여부
    const [hideDeleted, setHideDeleted] = useState(false); // 삭제 요청된 단어 숨김 여부

    const items = [
        { title: "가", ref: refA as React.RefObject<HTMLDivElement> },
    ];

    return (
        <div className="max-w-6xl mx-auto p-4">
            {/* 문서 헤더 */}
            <div className="flex justify-between items-center border-b pb-2">
                <h1 className="text-3xl font-bold">테스트중</h1>
                <div className="flex gap-2">
                    <Link href={`/words-docs/${id}/info`}>
                        <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                            문서 정보
                        </button>
                    </Link>
                    <Link href={`/words-docs/${id}/logs`}>
                        <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                            로그
                        </button>
                    </Link>
                </div>
            </div>

            {/* 마지막 업데이트 시간 */}
            <p className="text-sm text-gray-500 mt-2">마지막 업데이트: 2025-03-16</p>

            {/* 목차 컴포넌트 */}
            <div className="mt-4 p-2">
                <TableOfContents items={items} />
            </div>

            {/* 필터 체크박스 (테이블 위) */}
            <div className="mt-4 flex gap-4 items-center p-2 border rounded-lg">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={showWords}
                        onChange={() => setShowWords(!showWords)}
                    />
                    추가 요청 단어 표시
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={hideDeleted}
                        onChange={() => setHideDeleted(!hideDeleted)}
                    />
                    삭제 요청된 단어 미표시
                </label>
            </div>

            {/* 단어 테이블 */}
            <div ref={refA} className="mt-4">
                <WordsTableBody title="가" initialData={initialData}/> {/* 나중에 추가 */}
            </div>
        </div>
    );
};


export default DocsDataPage;
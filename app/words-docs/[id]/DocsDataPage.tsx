"use client";
import React, { useRef, useState, useEffect } from "react";
import TableOfContents from "./TableOfContents";
import WordsTableBody from "./WordsTableBody";
import Link from "next/link";
import type { WordData } from "@/app/types/type";

interface DocsPageProp {
    id: string
    data: WordData[]
}
const initialData: WordData[] = [
    { word: "티티티", status: "ok" },
    { word: "ㅇㅇ", status: "add" },
    { word: "인도네시아페칼롱간의바틱박물관과공동수행하는초중고등학교직업학교기술전문학교학생들에대한바틱무형문화유산교육및훈련", status: "delete" },
];

const DocsDataPage: React.FC<DocsPageProp> = ({ id, data }) => {
    const refs = useRef<{ [key: string]: React.RefObject<HTMLDivElement | null> }>({});
    const [showWords, setShowWords] = useState(true); // 추가 요청 단어 표시 여부
    const [hideDeleted, setHideDeleted] = useState(false); // 삭제 요청된 단어 숨김 여부
    const [tocList, setTocList] = useState<string[]>(["가","니"]);

    // `refs` 초기화 및 `tocList` 변경 시 `refs.current` 업데이트
    useEffect(() => {
        tocList.forEach((title) => {
            if (!refs.current[title]) {
                refs.current[title] = React.createRef<HTMLDivElement>(); // 동적으로 ref 생성
            }
        });
    }, [tocList]);

    const items = tocList.map((title) => ({
        title,
        ref: refs.current[title], // 동적으로 관리된 refs
    }));

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
            <div>
                {items.map(({ title, ref }) => (
                    <div key={title} ref={ref} className="mt-4">
                        <WordsTableBody title={title} initialData={data} /> {/* 나중에 추가 */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DocsDataPage;
"use client";
import React, { useRef, useState, useEffect } from "react";
import TableOfContents from "./TableOfContents";
import WordsTableBody from "./WordsTableBody";
import Link from "next/link";
import type { WordData } from "@/app/types/type";
import { DefaultDict } from "@/app/lib/collections";

interface DocsPageProp {
    id: string;
    data: WordData[];
    metaData: {
        title: string;
        lastUpdate: string;
    };
}

const DocsDataPage = ({ id, data, metaData }: DocsPageProp) => {
    const refs = useRef<{ [key: string]: React.RefObject<HTMLDivElement | null> }>({});
    const [_, setRefsState] = useState<{ [key: string]: React.RefObject<HTMLDivElement | null> }>({});
    const [showWords, setShowWords] = useState(true);
    const [hideDeleted, setHideDeleted] = useState(false);
    const [tocList, setTocList] = useState<string[]>([]);
    const [wordsData, setWordsData] = useState<WordData[]>(data);
    const [grouped, setGrouped] = useState<DefaultDict<string, WordData[]>>(new DefaultDict<string, WordData[]>(() => []));

    // `refs` 초기화
    useEffect(() => {
        const newRefs: { [key: string]: React.RefObject<HTMLDivElement | null> } = {};
        tocList.forEach((title) => {
            newRefs[title] = refs.current[title] || React.createRef<HTMLDivElement>();
        });

        refs.current = newRefs;
        setRefsState(newRefs);
    }, [tocList]);

    const groupWordsBySyllable = (data: WordData[]) => {
        const grouped: DefaultDict<string, WordData[]> = new DefaultDict<string, WordData[]>(() => []);
        data.forEach((item) => {
            const firstSyllable = item.word[0].toLowerCase();
            grouped.get(firstSyllable).push(item);
        });
        return grouped;
    };

    const updateToc = (data: WordData[]) => {
        return [...new Set(data.map((v) => v.word[0]))].sort((a, b) => a.localeCompare(b, "ko"));
    };

    useEffect(() => {
        let filteredData = data;
        if (!showWords) filteredData = filteredData.filter((v) => v.status !== "add");
        if (hideDeleted) filteredData = filteredData.filter((v) => v.status !== "delete");
        setWordsData(filteredData);
    }, [showWords, hideDeleted, data]);

    useEffect(() => {
        setTocList(updateToc(wordsData));
        setGrouped(groupWordsBySyllable(wordsData));
    }, [wordsData]);

    const items = tocList.map((title) => ({
        title,
        ref: refs.current[title],
    }));

    const lastUpdateDate = new Date(metaData.lastUpdate);
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localTime = lastUpdateDate.toLocaleString(undefined, { timeZone: userTimeZone });

    const handleDownload = () => {
        const wordsText = data.map((w) => w.word).sort((a, b) => a.localeCompare(b, "ko")).join("\n");
        const formattedDate = new Date(metaData.lastUpdate).toISOString().slice(0, 10);
        const fileName = `${metaData.title} 단어장(${formattedDate}).txt`;

        const blob = new Blob([wordsText], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b pb-2">
                <h1 className="text-2xl sm:text-3xl font-bold">{metaData.title}</h1>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Link href={`/words-docs/${id}/info`}>
                        <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 w-full sm:w-auto">문서 정보</button>
                    </Link>
                    <Link href={`/words-docs/${id}/logs`}>
                        <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 w-full sm:w-auto">로그</button>
                    </Link>
                    <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 w-full sm:w-auto" onClick={handleDownload}>
                        단어장 다운로드
                    </button>
                </div>
            </div>

            <p className="text-sm text-gray-500 mt-2">마지막 업데이트: {localTime}</p>

            <div className="mt-4 p-2">
                <TableOfContents items={items} />
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center p-2 border rounded-lg text-sm">
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={showWords} onChange={() => setShowWords(!showWords)} />
                    추가 요청 단어 표시
                </label>
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={hideDeleted} onChange={() => setHideDeleted(!hideDeleted)} />
                    삭제 요청된 단어 미표시
                </label>
            </div>

            <div>
                {items.map(({ title, ref }) => (
                    <div key={title} ref={ref} className="mt-4">
                        <LazyWordsTableBody title={title} id={id} data={grouped.get(title)} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DocsDataPage;

// Lazy 컴포넌트 아래에 같이 정의
const LazyWordsTableBody = ({
    title,
    id,
    data,
}: {
    title: string;
    id: string;
    data: WordData[];
}) => {
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "200px" }
        );
        if (ref.current) {
            observer.observe(ref.current);
        }
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref}>
            {visible ? (
                <WordsTableBody title={title} initialData={data} id={id} />
            ) : (
                <div className="h-40 flex items-center justify-center text-gray-400">Loading...</div>
            )}
        </div>
    );
};

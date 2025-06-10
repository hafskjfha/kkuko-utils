"use client";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { useVirtualizer } from '@tanstack/react-virtual';
import WordsTableBody from "./WordsTableBody";
import Link from "next/link";
import type { WordData } from "@/app/types/type";
import { DefaultDict } from "@/app/lib/collections";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Star } from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import LoginRequiredModal from "@/app/components/LoginRequiredModal";
import { PostgrestError } from "@supabase/supabase-js";
import ErrorModal from "@/app/components/ErrModal";
import VirtualTableOfContents from "./TableOfContents";

interface DocsPageProp {
    id: number;
    data: WordData[];
    metaData: {
        title: string;
        lastUpdate: string;
        typez: "letter" | "theme" | "ect"
    };
    starCount: number;
    isUserStarred: boolean;
}

interface VirtualTocItem {
    title: string;
    index: number;
}

const DocsDataPage = ({ id, data, metaData, starCount, isUserStarred }: DocsPageProp) => {
    const parentRef = useRef<HTMLDivElement>(null);
    const [tocList, setTocList] = useState<string[]>([]);
    const [wordsData] = useState<WordData[]>(data);
    const [isLoading, setIsLoading] = useState(true);
    const [isUserStarreda, setIsUserStarreda] = useState<boolean>(isUserStarred);
    const user = useSelector((state: RootState) => state.user);
    const [loginNeedModalOpen, setLoginNeedModalOpen] = useState<boolean>(false);
    const [errorModalView, seterrorModalView] = useState<ErrorMessage | null>(null);

    const groupWordsBySyllable = (data: WordData[]) => {
        const grouped = new DefaultDict<string, WordData[]>(() => []);
        data.forEach((item) => {
            const firstSyllable = item.word[0].toLowerCase();
            grouped.get(firstSyllable).push(item);
        });
        return grouped;
    };

    const memoizedGrouped = useMemo(() => {
        return groupWordsBySyllable(wordsData);
    }, [wordsData]);

    const updateToc = (data: WordData[]) => {
        return [...new Set(data.map((v) => v.word[0]))].sort((a, b) => a.localeCompare(b, "ko"));
    };

    // 가상화를 위한 아이템 목록 생성
    const virtualItems = useMemo(() => {
        return tocList.map((title, index) => ({
            title,
            data: memoizedGrouped.get(title),
            index
        }));
    }, [tocList, memoizedGrouped]);

    // TOC 아이템 생성
    const tocItems: VirtualTocItem[] = useMemo(() => {
        return tocList.map((title, index) => ({
            title,
            index
        }));
    }, [tocList]);

    // 가상화 설정 (동적 크기 지원)
    const virtualizer = useVirtualizer({
        count: virtualItems.length,
        getScrollElement: () => parentRef.current,
        estimateSize: (index) => {
            // 각 섹션의 단어 개수에 따라 동적으로 크기 추정
            const item = virtualItems[index];
            const wordCount = item?.data?.length || 0;
            // 기본 헤더 높이(80px) + 단어당 높이(약 50px) + 여백(40px)
            return Math.max(200, 80 + wordCount * 50 + 40);
        },
        overscan: 1, // 동적 크기에서는 overscan을 줄임
        measureElement: (element) => {
            // 실제 DOM 요소의 크기를 측정하여 정확한 크기 반영
            return element?.getBoundingClientRect().height ?? 0;
        },
    });

    useEffect(() => {
        setTocList(updateToc(wordsData));
        setIsLoading(false);
    }, [wordsData]);

    const lastUpdateDate = new Date(metaData.lastUpdate);
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localTime = lastUpdateDate.toLocaleString(undefined, { timeZone: userTimeZone });

    const handleDownload = () => {
        const wordsText = wordsData
            .map((w) => w.word)
            .sort((a, b) => a.localeCompare(b, "ko"))
            .join("\n");

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

    const hadnleDocsStar = async () => {
        console.log(user)
        if (!user.uuid) {
            return setLoginNeedModalOpen(true);
        }
        if (isUserStarreda) {
            const { error } = await supabase.from('user_star_docs').delete().eq('docs_id', id).eq('user_id', user.uuid);
            if (error) return makeError(error)
        } else {
            const { error } = await supabase.from('user_star_docs').insert({ docs_id: id, user_id: user.uuid })
            if (error) return makeError(error);
        }

        setIsUserStarreda(!isUserStarreda)
    }

    const makeError = (error: PostgrestError) => {
        seterrorModalView({
            ErrName: error.name,
            ErrMessage: error.message,
            ErrStackRace: error.stack,
            inputValue: null
        });
    };

    // TOC 클릭 시 해당 아이템으로 스크롤
    const handleTocClick = (index: number) => {
        virtualizer.scrollToIndex(index, { align: 'start' });
    };

    return (
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4">
            {/* 문서 헤더 */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b pb-2">
                <h1 className="text-2xl sm:text-3xl font-bold">{metaData.title}</h1>
                <div className="flex flex-col sm:flex-row gap-2">
                    <div
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 w-full sm:w-auto flex items-center gap-2 hover:cursor-pointer"
                        onClick={hadnleDocsStar}
                    >
                        <Star fill={isUserStarreda ? "gold" : "white"} />
                        <span>
                            {(isUserStarred && !isUserStarreda) ? starCount - 1 : (!isUserStarred && isUserStarreda) ? starCount + 1 : starCount}
                        </span>
                    </div>

                    <Link href={`/words-docs/${id}/info`}>
                        <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 w-full sm:w-auto">
                            문서 정보
                        </button>
                    </Link>
                    <Link href={`/words-docs/${id}/logs`}>
                        <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 w-full sm:w-auto">
                            로그
                        </button>
                    </Link>
                    <button
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 w-full sm:w-auto"
                        onClick={handleDownload}
                    >
                        단어장 다운로드
                    </button>
                </div>
            </div>

            {/* 마지막 업데이트 시간 */}
            <p className="text-sm text-gray-500 mt-2">마지막 업데이트: {localTime}</p>

            {/* 가상화된 목차 */}
            <div className="mt-4 p-2">
                <VirtualTableOfContents items={tocItems} onItemClick={handleTocClick} />
            </div>

            {/* 가상화된 단어 테이블 */}
            <div>
                {isLoading ? (
                    // 스켈레톤 UI
                    Array.from({ length: 5 }).map((_, idx) => (
                        <div key={idx} className="mt-6">
                            <Skeleton height={28} width={80} className="mb-2" />
                            <Skeleton height={40} count={3} className="mb-4" />
                        </div>
                    ))
                ) : (
                    // 가상화된 컨테이너
                    <div
                        ref={parentRef}
                        className="mt-4"
                        style={{
                            height: 'calc(100vh - 400px)', // 뷰포트 기준 동적 높이
                            minHeight: '1200px',
                            overflow: 'auto',
                        }}
                    >
                        <div
                            style={{
                                height: `${virtualizer.getTotalSize()}px`,
                                width: '100%',
                                position: 'relative',
                            }}
                        >
                            {virtualizer.getVirtualItems().map((virtualItem) => {
                                const item = virtualItems[virtualItem.index];
                                return (
                                    <div
                                        key={virtualItem.key}
                                        data-index={virtualItem.index}
                                        ref={virtualizer.measureElement}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            transform: `translateY(${virtualItem.start}px)`,
                                        }}
                                    >
                                        <div className="mt-4 mb-8">
                                            <WordsTableBody 
                                                title={item.title} 
                                                initialData={item.data} 
                                                id={`${id}`} 
                                                aoK={metaData.typez === "ect"} 
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {loginNeedModalOpen && (
                <LoginRequiredModal open={loginNeedModalOpen} onClose={() => setLoginNeedModalOpen(false)} />
            )}
            {errorModalView && (
                <ErrorModal
                    onClose={() => seterrorModalView(null)}
                    error={errorModalView}
                />
            )}
        </div>
    );
};

export default DocsDataPage;
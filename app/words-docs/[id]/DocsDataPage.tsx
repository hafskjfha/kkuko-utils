"use client";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { useVirtualizer } from '@tanstack/react-virtual';
import WordsTableBody from "./WordsTableBody";
import Link from "next/link";
import type { WordData } from "@/app/types/type";
import { DefaultDict } from "@/app/lib/collections";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Star, FileText, Target, AlignLeft } from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import LoginRequiredModal from "@/app/components/LoginRequiredModal";
import { PostgrestError } from "@supabase/supabase-js";
import ErrorModal from "@/app/components/ErrModal";
import ToC from "./TableOfContents";

interface DocsPageProp {
    id: number;
    data: WordData[];
    metaData: {
        title: string;
        lastUpdate: string;
        typez: "letter" | "theme" | "ect"
    };
    starCount: string[];
}

interface VirtualTocItem {
    title: string;
    index: number;
}

type TabType = "all" | "mission" | "long";

const MISSION_CHARS = "가나다라마바사아자차카타파하";

const DocsDataPage = ({ id, data, metaData, starCount }: DocsPageProp) => {
    const parentRef = useRef<HTMLDivElement>(null);
    const [tocList, setTocList] = useState<string[]>([]);
    const [wordsData] = useState<WordData[]>(data);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isTabSwitching, setIsTabSwitching] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<TabType>("all");
    const user = useSelector((state: RootState) => state.user);
    const [isUserStarreda, setIsUserStarreda] = useState<boolean>(false);
    const [loginNeedModalOpen, setLoginNeedModalOpen] = useState<boolean>(false);
    const [errorModalView, seterrorModalView] = useState<ErrorMessage | null>(null);

    useEffect(() => {
        if (user.uuid) {
            setIsUserStarreda(starCount.includes(user.uuid))
        }
    }, [user, starCount])

    // 탭별 데이터 필터링
    const getFilteredData = (tabType: TabType): WordData[] => {
        switch (tabType) {
            case "all":
                return wordsData;
            case "long":
                return wordsData.filter(item => item.word.length >= 9);
            case "mission":
                return wordsData.filter(item => {
                    return MISSION_CHARS.split('').some(char => {
                        const count = (item.word.match(new RegExp(char, 'g')) || []).length;
                        return count >= 2;
                    });
                });
            default:
                return wordsData;
        }
    };

    const filteredData = useMemo(() => getFilteredData(activeTab), [activeTab, wordsData]);

    const groupWordsBySyllable = (data: WordData[]) => {
        const grouped = new DefaultDict<string, WordData[]>(() => []);
        
        if (activeTab === "mission") {
            // 미션 모드에서는 각 미션 문자별로 그룹화
            MISSION_CHARS.split('').forEach(char => {
                const missionWords = data.filter(item => {
                    const count = (item.word.match(new RegExp(char, 'g')) || []).length;
                    return count >= 2;
                });
                if (missionWords.length > 0) {
                    grouped.get(`${char} (2개 이상)`).push(...missionWords);
                }
            });
        } else {
            // 일반 모드에서는 첫 글자별로 그룹화
            data.forEach((item) => {
                const firstSyllable = item.word[0].toLowerCase();
                grouped.get(firstSyllable).push(item);
            });
        }
        
        return grouped;
    };

    const memoizedGrouped = useMemo(() => {
        return groupWordsBySyllable(filteredData);
    }, [filteredData, activeTab]);

    const updateToc = (data: WordData[]): string[] => {
        if (activeTab === "mission") {
            // 미션 모드에서는 실제 단어가 있는 미션 문자만 표시
            return MISSION_CHARS.split('').filter(char => {
                const hasWords = data.some(item => {
                    const count = (item.word.match(new RegExp(char, 'g')) || []).length;
                    return count >= 2;
                });
                return hasWords;
            }).map(char => `${char} (2개 이상)`);
        } else {
            // 일반 모드
            return [...new Set(data.map((v) => v.word[0]))].sort((a, b) => a.localeCompare(b, "ko"));
        }
    };

    // 가상화를 위한 아이템 목록 생성
    const virtualItems = useMemo(() => {
        return tocList.map((title, index) => ({
            title,
            data: memoizedGrouped.get(title) || [],
            index
        }));
    }, [tocList, memoizedGrouped, activeTab]);

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
        const updateTabData = async () => {
            if (!isLoading) { // 초기 로딩이 아닌 경우만
                setIsTabSwitching(true);
                // 약간의 지연을 주어 부드러운 전환 효과
                await new Promise(resolve => setTimeout(resolve, 150));
            }
            
            setTocList(updateToc(filteredData));
            setIsLoading(false);
            setIsTabSwitching(false);
            
            // 탭 변경시 가상화 리셋
            if (virtualizer) {
                virtualizer.scrollToOffset(0);
            }
        };

        updateTabData();
    }, [filteredData, activeTab]);

    const lastUpdateDate = new Date(metaData.lastUpdate);
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localTime = lastUpdateDate.toLocaleString(undefined, { timeZone: userTimeZone });

    const handleDownload = () => {
        const currentData = getFilteredData(activeTab);
        const wordsText = currentData
            .map((w) => w.word)
            .sort((a, b) => a.localeCompare(b, "ko"))
            .join("\n");

        const formattedDate = new Date(metaData.lastUpdate).toISOString().slice(0, 10);
        const tabSuffix = activeTab === "all" ? "" : activeTab === "long" ? "_장문" : "_미션";
        const fileName = `${metaData.title}${tabSuffix} 단어장(${formattedDate}).txt`;

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

    const getTabIcon = (tab: TabType) => {
        switch (tab) {
            case "all":
                return <FileText className="w-4 h-4" />;
            case "mission":
                return <Target className="w-4 h-4" />;
            case "long":
                return <AlignLeft className="w-4 h-4" />;
        }
    };

    const getTabLabel = (tab: TabType) => {
        switch (tab) {
            case "all":
                return "전체";
            case "mission":
                return "미션";
            case "long":
                return "장문";
        }
    };

    const handleTabChange = async (newTab: TabType) => {
        if (newTab === activeTab) return;
        
        setIsTabSwitching(true);
        setActiveTab(newTab);
    };

    const getTabCount = (tab: TabType): number => {
        return getFilteredData(tab).length;
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
                            {(user.uuid && starCount.includes(user.uuid) && !isUserStarreda) ? starCount.length - 1 : (user.uuid && !starCount.includes(user.uuid) && isUserStarreda) ? starCount.length + 1 : starCount.length}
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
                        {activeTab === "all" ? "전체" : activeTab === "long" ? "장문" : "미션"} 단어 다운로드
                    </button>
                </div>
            </div>

            {/* 마지막 업데이트 시간 */}
            <p className="text-sm text-gray-500 mt-2">마지막 업데이트: {localTime}</p>

            {/* 탭 네ビ게이션 */}
            <div className="mt-4 border-b">
                <nav className="flex space-x-8" aria-label="Tabs">
                    {(["all", "mission", "long"] as TabType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            disabled={isTabSwitching}
                            className={`${
                                activeTab === tab
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            } ${
                                isTabSwitching ? "opacity-50 cursor-not-allowed" : ""
                            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-opacity duration-150`}
                        >
                            {getTabIcon(tab)}
                            {getTabLabel(tab)}
                            <span className="ml-2 bg-gray-100 text-gray-600 rounded-full px-2 py-1 text-xs">
                                {getTabCount(tab)}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* 목차 */}
            {!isTabSwitching && (
                <div className="mt-4 p-2">
                    <ToC 
                        items={tocItems} 
                        onItemClick={handleTocClick} 
                        isSp={activeTab === "mission"}
                    />
                </div>
            )}

            {/* 가상화된 단어 테이블 */}
            <div>
                {isLoading || isTabSwitching ? (
                    // 스켈레톤 UI 또는 스피너
                    <div className="mt-8">
                        {isTabSwitching ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                <span className="ml-3 text-gray-600">로드 중...</span>
                            </div>
                        ) : (
                            Array.from({ length: 5 }).map((_, idx) => (
                                <div key={idx} className="mt-6">
                                    <Skeleton height={28} width={80} className="mb-2" />
                                    <Skeleton height={40} count={3} className="mb-4" />
                                </div>
                            ))
                        )}
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="mt-8 text-center py-12">
                        <div className="text-gray-400 text-lg">
                            {activeTab === "long" && "9자 이상의 장문 단어가 없습니다."}
                            {activeTab === "mission" && "미션 조건에 해당하는 단어가 없습니다."}
                        </div>
                    </div>
                ) : (
                    // 가상화된 컨테이너
                    <div
                        ref={parentRef}
                        className="mt-4 opacity-100 transition-opacity duration-200"
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
                                                key={`${activeTab}-${item.title}-${item.data.length}`}
                                                title={item.title} 
                                                initialData={item.data || []} 
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
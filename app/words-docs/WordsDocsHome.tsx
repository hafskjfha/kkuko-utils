"use client";
import Link from "next/link";
import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon, ChevronUpIcon, ArrowUpIcon, ArrowDownIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { convertQwertyToHangul } from "es-hangul";

interface Document {
    id: string;
    name: string;
    maker: string;
    last_update: string;
    created_at: string;
    is_manager: boolean;
    typez: "letter" | "theme" | "ect";
}

interface WordsDocsHomeProps {
    docs: Document[];
}

const WordsDocsHome = ({ docs }: WordsDocsHomeProps) => {
    const typeOrder = ['letter', 'theme', 'ect'];
    const typeNames = {
        'letter': '글자',
        'theme': '주제',
        'ect': '특수'
    };

    const [expandedTypes, setExpandedTypes] = useState<{ [key: string]: boolean }>(
        typeOrder.reduce((acc, type) => ({ ...acc, [type]: true }), {})
    );

    const [sortOptions, setSortOptions] = useState<{ 
        [key: string]: { field: string; direction: 'asc' | 'desc' } 
    }>(
        typeOrder.reduce((acc, type) => ({ 
            ...acc, 
            [type]: { field: "last_update", direction: "desc" } 
        }), {})
    );

    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");

    const toggleType = (typez: string) => {
        setExpandedTypes(prev => ({ ...prev, [typez]: !prev[typez] }));
    };

    const handleSort = (typez: string, field: string) => {
        setSortOptions(prev => {
            const currentSort = prev[typez];
            const direction = currentSort.field === field && currentSort.direction === 'desc' ? 'asc' : 'desc';
            return { 
                ...prev, 
                [typez]: { field, direction } 
            };
        });
    };

    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    }, []);

    const clearSearch = useCallback(() => {
        setSearchQuery("");
    }, []);

    const sortDocs = (docs: Document[], sortType: { field: string; direction: 'asc' | 'desc' }) => {
        const sorted = [...docs];
        const { field, direction } = sortType;
        
        sorted.sort((a, b) => {
            let comparison = 0;
            
            switch (field) {
                case "name":
                    comparison = a.name.localeCompare(b.name);
                    break;
                case "created_at":
                    comparison = (a.created_at || "").localeCompare(b.created_at || "");
                    break;
                case "last_update":
                default:
                    comparison = a.last_update.localeCompare(b.last_update);
                    break;
            }
            
            return direction === 'asc' ? comparison : -comparison;
        });
        
        return sorted;
    };

    const formatDate = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ko });
        } catch {
            return dateString;
        }
    };

    // 검색 쿼리에 따른 필터링된 문서 목록
    const filteredDocs = useMemo(() => {
        if (!searchQuery.trim()) {
            return docs;
        }
        
        const query = searchQuery.toLowerCase().trim();
        return docs.filter(doc => 
            doc.name.toLowerCase().includes(query) || doc.name.toLocaleLowerCase().includes(convertQwertyToHangul(query))
        );
    }, [docs, searchQuery]);

    // 필터링된 문서를 타입별로 그룹화
    const groupedDocs = useMemo(() => {
        return filteredDocs.reduce<{ [key: string]: Document[] }>((acc, doc) => {
            acc[doc.typez] = acc[doc.typez] || [];
            acc[doc.typez].push(doc);
            return acc;
        }, {});
    }, [filteredDocs]);

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            {/* 검색창 */}
            <div className="w-full max-w-6xl mb-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="문서명 검색..."
                        className="w-full p-4 pl-10 pr-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100"
                    />
                    {searchQuery && (
                        <button
                            onClick={clearSearch}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                            ✕
                        </button>
                    )}
                </div>
                
                {searchQuery && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        검색 결과: {filteredDocs.length}개의 문서
                    </div>
                )}
            </div>

            {/* 필터링된 결과가 없을 때 보여줄 메시지 */}
            {searchQuery && filteredDocs.length === 0 && (
                <div className="w-full max-w-6xl p-8 bg-white dark:bg-gray-800 shadow rounded-md text-center">
                    <p className="text-gray-500 dark:text-gray-400">검색 결과가 없습니다.</p>
                </div>
            )}

            {/* 문서 목록 */}
            {typeOrder.map((typez) => (
                <div key={typez} className="w-full max-w-6xl mb-6">
                    <button
                        onClick={() => toggleType(typez)}
                        className="w-full text-left font-semibold text-lg p-4 bg-white dark:bg-gray-800 shadow rounded-md flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        <span className="text-gray-900 dark:text-gray-100">
                            {typeNames[typez as keyof typeof typeNames] || typez} ({groupedDocs[typez]?.length || 0})
                        </span>
                        {expandedTypes[typez] ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </button>

                    <AnimatePresence initial={false}>
                        {expandedTypes[typez] && groupedDocs[typez] && (
                            <motion.div
                                key={typez}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden bg-white dark:bg-gray-800 shadow rounded-md mt-2"
                            >
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                                            <tr>
                                                <th 
                                                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 w-1/2" 
                                                    onClick={() => handleSort(typez, "name")}
                                                >
                                                    <div className="flex items-center">
                                                        문서명
                                                        {sortOptions[typez].field === "name" && (
                                                            sortOptions[typez].direction === "desc" ? 
                                                            <ArrowDownIcon className="ml-1" /> : 
                                                            <ArrowUpIcon className="ml-1" />
                                                        )}
                                                    </div>
                                                </th>
                                                <th 
                                                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" 
                                                    onClick={() => handleSort(typez, "last_update")}
                                                >
                                                    <div className="flex items-center">
                                                        최근 업데이트
                                                        {sortOptions[typez].field === "last_update" && (
                                                            sortOptions[typez].direction === "desc" ? 
                                                            <ArrowDownIcon className="ml-1" /> : 
                                                            <ArrowUpIcon className="ml-1" />
                                                        )}
                                                    </div>
                                                </th>
                                                <th 
                                                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" 
                                                    onClick={() => handleSort(typez, "created_at")}
                                                >
                                                    <div className="flex items-center">
                                                        생성일
                                                        {sortOptions[typez].field === "created_at" && (
                                                            sortOptions[typez].direction === "desc" ? 
                                                            <ArrowDownIcon className="ml-1" /> : 
                                                            <ArrowUpIcon className="ml-1" />
                                                        )}
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortDocs(groupedDocs[typez] || [], sortOptions[typez]).map((doc) => (
                                                <tr 
                                                    key={doc.id}
                                                    className={`border-t border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900 ${hoveredRow === doc.id ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
                                                    onMouseEnter={() => setHoveredRow(doc.id)}
                                                    onMouseLeave={() => setHoveredRow(null)}
                                                >
                                                    <td className="px-4 py-3">
                                                        <Link 
                                                            href={`/words-docs/${doc.id}`}
                                                            className="font-semibold text-base text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline flex items-center"
                                                        >
                                                            <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-2"></div>
                                                            {doc.name}
                                                            {searchQuery && doc.name.toLowerCase().includes(searchQuery.toLowerCase()) && (
                                                                <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded">검색 일치</span>
                                                            )}
                                                        </Link>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-300">
                                                        {formatDate(doc.last_update)}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-300">
                                                        {formatDate(doc.created_at)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {(groupedDocs[typez]?.length === 0) && (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        {searchQuery ? '검색 결과가 없습니다.' : '문서가 없습니다.'}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
};

export default WordsDocsHome;
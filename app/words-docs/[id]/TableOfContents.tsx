"use client"
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TocProps {
    items: { title: string; ref: React.RefObject<HTMLDivElement | null> }[];
}

const TableOfContents = ({ items }: { items: { title: string; ref: React.RefObject<HTMLDivElement | null> }[] }) => {
    const [isOpen, setIsOpen] = useState(false);

    // 초성 리스트 (ㄱ과 ㄲ, ㄷ과 ㄸ 등은 같은 그룹으로 묶기 위함)
    const CHOSEONG_GROUP_MAP: Record<string, string> = {
        'ㄱ': 'ㄱ', 'ㄲ': 'ㄱ',
        'ㄴ': 'ㄴ',
        'ㄷ': 'ㄷ', 'ㄸ': 'ㄷ',
        'ㄹ': 'ㄹ',
        'ㅁ': 'ㅁ',
        'ㅂ': 'ㅂ', 'ㅃ': 'ㅂ',
        'ㅅ': 'ㅅ', 'ㅆ': 'ㅅ',
        'ㅇ': 'ㅇ',
        'ㅈ': 'ㅈ', 'ㅉ': 'ㅈ',
        'ㅊ': 'ㅊ',
        'ㅋ': 'ㅋ',
        'ㅌ': 'ㅌ',
        'ㅍ': 'ㅍ',
        'ㅎ': 'ㅎ'
    };

    const CHOSEONG_ORDER = [
        'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ',
        'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
    ];

    function getChoseongGroup(char: string): string {
        const code = char.charCodeAt(0);
        if (code < 0xac00 || code > 0xd7a3) return '기타';

        const uni = code - 0xac00;
        const choseongIndex = Math.floor(uni / (21 * 28));
        const choseongList = [
            'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ',
            'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ',
            'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
        ];
        const rawChoseong = choseongList[choseongIndex];
        return CHOSEONG_GROUP_MAP[rawChoseong] ?? '기타';
    }

    // 정렬 + 그룹화
    const groupedItems = items.reduce((acc, item) => {
        const group = getChoseongGroup(item.title[0]);
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
    }, {} as Record<string, TocProps['items']>);

    // 각 그룹 내부 항목 정렬 (한글 순서)
    for (const group in groupedItems) {
        groupedItems[group].sort((a, b) =>
            a.title.localeCompare(b.title, 'ko')
        );
    }

    // 그룹 정렬 순서대로 렌더링
    const orderedGroups = CHOSEONG_ORDER.filter(group => groupedItems[group]);

    const handleScroll = (ref: React.RefObject<HTMLDivElement | null>) => {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <div className="w-full max-w-full sm:max-w-2xl md:max-w-4xl xl:max-w-5xl p-4 sm:p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg max-h-[20rem] overflow-y-auto transition-colors duration-300">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">목차</h2>
                <button
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none flex items-center space-x-1"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span>{isOpen ? "[접기]" : "[펼치기]"}</span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>
            <hr className="mb-2 border-gray-300 dark:border-gray-700" />

            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
            >
                {orderedGroups.map(group => (
                    <div key={group} className="mb-4">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{group}</h3>
                        <ul className="flex flex-wrap gap-2 ml-2">
                            {groupedItems[group].map((item, index) => (
                                <li key={index}>
                                    <button
                                        className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 focus:outline-none"
                                        onClick={() => handleScroll(item.ref)}
                                    >
                                        {item.title}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </motion.div>
        </div>

    );
};

export default TableOfContents;

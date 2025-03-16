"use client"
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TocProps {
    items: { title: string; ref: React.RefObject<HTMLDivElement | null> }[];
}

const TableOfContents: React.FC<TocProps> = ({ items }) => {
    const [isOpen, setIsOpen] = useState(true);

    const sortedItems = [...items].sort((a, b) => a.title.localeCompare(b.title, 'ko'));

    const handleScroll = (ref: React.RefObject<HTMLDivElement | null>) => {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <div className="w-full max-w-40 p-4 bg-white rounded-2xl shadow-lg">
            {/* 목차 헤더 */}
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">목차</h2>
                <button
                    className="text-gray-500 hover:text-gray-700 focus:outline-none flex items-center space-x-1"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span>{isOpen ? "[접기]" : "[펼치기]"}</span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

            </div>
            <hr className="mb-2" />

            {/* 애니메이션 적용 */}
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
            >
                <ul className="space-y-2">
                    {sortedItems.map((item, index) => (
                        <li key={index}>
                            <button
                                className="text-left w-full text-blue-500 hover:text-blue-700 focus:outline-none"
                                onClick={() => handleScroll(item.ref)}
                            >
                                {item.title}
                            </button>
                        </li>
                    ))}
                </ul>
            </motion.div>
        </div>
    );
}

export default TableOfContents;
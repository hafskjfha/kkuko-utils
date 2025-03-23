"use client";

import Table from "./Table";
import type { WordData } from "@/app/types/type";
import { useState } from "react";
import WordAddModal from "./WordAddModal";
import { motion } from "framer-motion";

const WordsTableBody: React.FC<{ initialData: WordData[]; title: string }> = ({
    title,
    initialData,
}) => {
    const [wordAddModalOpen, setWordAddModalOpen] = useState(false);
    const [isTableVisible, setIsTableVisible] = useState(true);

    return (
        <div className="w-full mx-auto p-2">
            {/* 제목 표시 */}
            <div className="flex items-center px-4">
                <h1 className="text-3xl font-bold mb-0 text-left">{title}</h1>
                <button
                    className="ml-2 px-3 py-1 text-sm text-white bg-purple-500 hover:bg-purple-600 rounded"
                    onClick={() => setIsTableVisible(!isTableVisible)}
                >
                    {isTableVisible ? "접기" : "펼치기"}
                </button>
                <button
                    className="ml-4 px-3 py-1 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded"
                    onClick={() => setWordAddModalOpen(true)}
                >
                    추가
                </button>
            </div>

            {/* 단어 테이블 (애니메이션 적용) */}
            <motion.div
                initial={false}
                animate={{ height: isTableVisible ? "auto" : 0, opacity: isTableVisible ? 1 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
            >
                <Table initialData={initialData} />
            </motion.div>

            {wordAddModalOpen && (
                <WordAddModal
                    isOpen={wordAddModalOpen}
                    onClose={() => setWordAddModalOpen(false)}
                    alreadyAddedWords={new Set(initialData.map((d) => d.word))}
                />
            )}
            <hr className="mt-3 border-gray-400" />
        </div>
    );
};

export default WordsTableBody;

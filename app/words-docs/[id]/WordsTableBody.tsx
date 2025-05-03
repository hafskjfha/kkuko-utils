"use client";

import Table from "./Table";
import type { WordData } from "@/app/types/type";
import { useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { useSelector } from 'react-redux';
import { RootState } from "@/app/store/store";
import Spinner from "@/app/components/Spinner";

const WordAddModal = lazy(() => import("./WordAddModal"));

const WordsTableBody = ({
    title,
    initialData,
    id,
    aoK
}: { initialData: WordData[]; title: string, id: string, aoK: boolean }) => {
    const [wordAddModalOpen, setWordAddModalOpen] = useState(false);
    const [isTableVisible, setIsTableVisible] = useState(true);

    const user = useSelector((state: RootState) => state.user);

    return (
        <div className="w-full mx-auto px-3 sm:px-4 py-2">
            {/* 제목 표시 */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-left">{title}</h1>

                <button
                    className="px-3 py-1 text-sm text-white bg-purple-500 hover:bg-purple-600 rounded"
                    onClick={() => setIsTableVisible(!isTableVisible)}
                >
                    {isTableVisible ? "접기" : "펼치기"}
                </button>

                {user.uuid && (
                    <button
                        className="px-3 py-1 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded"
                        onClick={() => setWordAddModalOpen(true)}
                    >
                        추가
                    </button>
                )}
            </div>

            {/* 단어 테이블 (애니메이션 적용) */}
            <motion.div
                initial={false}
                animate={{ height: isTableVisible ? "auto" : 0, opacity: isTableVisible ? 1 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
            >
                <Table initialData={initialData} id={id} isEct={aoK}/>
            </motion.div>

            {wordAddModalOpen && (
                <Suspense fallback={<div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 rounded-lg"><Spinner /></div>}>
                    <WordAddModal
                        isOpen={wordAddModalOpen}
                        onClose={() => setWordAddModalOpen(false)}
                        alreadyAddedWords={new Set(initialData.map((d) => d.word))}
                        id = {Number(id)}
                        isAddok={aoK}
                    /> 
                </Suspense>
            )}

            <hr className="mt-3 border-gray-400" />
        </div>

    );
};

export default WordsTableBody;

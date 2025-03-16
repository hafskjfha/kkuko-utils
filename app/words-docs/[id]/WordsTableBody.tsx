"use client";

import Table from './Table';
import type { WordData } from "@/app/types/type";



const WordsTableBody: React.FC<{initialData:WordData[], title: string}> = ({title, initialData}) => {
    return (
        <div className="w-full mx-auto p-2">
            {/* 제목 표시 */}
            <div className="flex items-center px-4">
                <h1 className="text-3xl font-bold mb-0 text-left">{title}</h1>
                <button
                    className="ml-4 px-3 py-1 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded"
                    onClick={() => { }}
                >
                    추가
                </button>
            </div>

            {/* 단어 테이블 */}
            <Table initialData={initialData} />
        </div>
    )
}

export default WordsTableBody;
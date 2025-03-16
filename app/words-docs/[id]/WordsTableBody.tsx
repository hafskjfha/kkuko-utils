"use client";

import Table from './Table';

interface WordData {
    word: string;
    status: "ok" | "delR" | "addR";
}

const initialData:WordData[] = [
    { word: "티타임을위하여착한사람문성현열린사회와그적들눈사람속의검은항아리씨앗불목마른계절술먹고담배피우는엄마목련꽃그늘아래서", status: "ok" },
    { word: "약혼파기를노리고기억상실한척했더니냉담하던약혼자가기억을잃기전의넌나에게완전히푹빠져있었다는말도안되는거짓말을하기시작했다", status: "addR" },
    { word: "인도네시아페칼롱간의바틱박물관과공동수행하는초중고등학교직업학교기술전문학교학생들에대한바틱무형문화유산교육및훈련", status: "delR" },
];

const WordsTableBody: React.FC<{initialData:WordData[], title: string}> = ({title, initialData}) => {
    return (
        <div className="w-4/5 mx-auto p-2">
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
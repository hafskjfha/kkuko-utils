"use client";
import React, { useState } from "react";
import { disassemble } from "es-hangul";
import { noInjungTopic } from "./const";

const calculateKoreanInitials = (word: string): string => {
    return word.split("").map(c => disassemble(c)[0]).join("");
};

const filterTopi = (a: string, b: string) => {
    if (b === '') return true;
    let indexA = 0;
    let indexB = 0;

    while (indexA < a.length && indexB < b.length) {
        if (a[indexA] === b[indexB] || (('ㄱ' <= b[indexB] && b[indexB] <= 'ㅎ') && calculateKoreanInitials(a[indexA]) === calculateKoreanInitials(b[indexB]))) {
            indexB++; // b의 다음 문자를 찾는다
        }
        indexA++; // a에서 다음 문자를 탐색한다
    }

    // b 문자열의 모든 문자가 a 문자열에서 순서대로 찾아졌다면 true
    return indexB === b.length;

};

// ToggleButton 컴포넌트
const ToggleButton: React.FC<{ isOpen: boolean; onClick: () => void; label: string }> = ({ isOpen, onClick, label }) => (
    <button
        onClick={onClick}
        className="flex items-center text-blue-500 dark:text-blue-400 font-semibold py-1 px-2 sm:py-2 sm:px-4 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
    >
        <div
            className={`mr-2 inline-block w-2 h-2 transform transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"
                }`}
            style={{
                borderLeft: "4px solid transparent",
                borderRight: "4px solid transparent",
                borderTop: "4px solid currentColor",
            }}
        />
        {label}
    </button>
);

interface WordAddFormProps {
    onSave: (word: string, selectedTopics: string[]) => void;
}

const WordAddForm: React.FC<WordAddFormProps> = ({ onSave }) => {
    const [word, setWord] = useState<string>("");
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [groupVisibility, setGroupVisibility] = useState({ noInjung: false, other: false });
    const [searchTermNoInjung, setSearchTermNoInjung] = useState("");
    const [searchTermOther, setSearchTermOther] = useState("");
    const [invalidWord, setInvalidWord] = useState<boolean>(false);

    const { topicsCode, topicsKo }: {topicsCode:Record<string,string>, topicsKo:Record<string,string>} = {topicsCode:{"BLA":"블루아카이브", "1":"건설"}, topicsKo:{"블루아카이브":"BLA","건설":"1"}}; // 나중에 처리추가

    // 그룹 나누기
    const groupedTopics = {
        noInjung: Object.entries(topicsKo).filter(([label]) => noInjungTopic.includes(label)).sort((a, b) => a[0].localeCompare(b[0])),
        other: Object.entries(topicsKo).filter(([label]) => !noInjungTopic.includes(label)).sort((a, b) => a[0].localeCompare(b[0])),
    };

    const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWord(e.target.value);
        const regex = /^[0-9ㄱ-힣]*$/;
        let p = false;
        const regex1 = /[0-9ㄱ-ㅎ]+/;
        for (const c of e.target.value) {
            if (!regex1.test(disassemble(c)[0])) {
                p = true;
                break;
            }
        }
        setInvalidWord(!regex.test(e.target.value) || p);
    };

    const handleTopicChange = (topicCode: string) => {
        setSelectedTopics((prev) =>
            prev.includes(topicCode)
                ? prev.filter((code) => code !== topicCode)
                : [...prev, topicCode]
        );
    };

    const toggleGroupVisibility = (group: "noInjung" | "other") => {
        setGroupVisibility((prev) => ({ ...prev, [group]: !prev[group] }));
    };

    const wordInfo = {
        firstLetter: word.charAt(0) || "-",
        lastLetter: word.charAt(word.length - 1) || "-",
        length: word.length,
        initials: calculateKoreanInitials(word) || "-",
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 bg-white dark:bg-gray-900 transition-colors max-h-[70vh] overflow-y-auto">
            {/* 단어 정보 입력 */}
            <div className="p-6 border border-gray-300 dark:border-gray-700 rounded-lg w-full lg:w-96 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">단어 정보 입력</h3>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-800 dark:text-gray-100">
                        단어:
                        <input
                            type="text"
                            value={word}
                            onChange={handleWordChange}
                            placeholder="단어를 입력하세요"
                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mt-1"
                            // disabled={isSaving}
                        />
                    </label>
                </div>
                {invalidWord && (
                    <p className="text-red-500 text-sm mt-2">한글과 숫자만 입력할 수 있습니다.</p>
                )}

                <div className="mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <strong className="text-gray-800 dark:text-gray-100">주제 선택:</strong>

                        {/* 저장 버튼 */}
                        <button
                            onClick={()=>onSave(word, selectedTopics)}
                            disabled={word.length === 0 || selectedTopics.length === 0 || invalidWord}
                            className={`px-4 py-2 rounded font-medium transition-colors ${word.length > 0 && selectedTopics.length > 0
                                    ? "bg-green-500 hover:bg-green-600 text-white"
                                    : "bg-gray-400 text-gray-700 cursor-not-allowed"
                                }`}
                        >
                            저장
                        </button>
                    </div>
                    <div className="mb-2">
                        <ToggleButton
                            isOpen={groupVisibility.noInjung}
                            onClick={() => toggleGroupVisibility("noInjung")}
                            label={`노인정 ${groupVisibility.noInjung ? "닫기" : "열기"}`}
                        />
                        {groupVisibility.noInjung && (
                            <div className="flex flex-col mt-2">
                                <input
                                    type="text"
                                    value={searchTermNoInjung}
                                    onChange={(e) => setSearchTermNoInjung(e.target.value)}
                                    placeholder="주제 검색"
                                    className="mb-2 p-2 border border-gray-300 dark:border-gray-700 rounded"
                                />
                                {/* 스크롤 가능한 영역 추가 */}
                                <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded p-2">
                                    <div className="flex flex-wrap gap-4">
                                        {groupedTopics.noInjung
                                            .filter(([label]) => label.includes(searchTermNoInjung)) // 필터링
                                            .map(([label, code]) => (
                                                <label
                                                    key={code}
                                                    className="text-sm font-medium flex items-center w-1/4 text-gray-800 dark:text-gray-100"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        onChange={() => handleTopicChange(code)}
                                                        checked={selectedTopics.includes(code)}
                                                        className="mr-2"
                                                    />
                                                    {label}
                                                </label>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="mb-2">
                        <ToggleButton
                            isOpen={groupVisibility.other}
                            onClick={() => toggleGroupVisibility("other")}
                            label={`어인정 ${groupVisibility.other ? "닫기" : "열기"}`}
                        />
                        {groupVisibility.other && (
                            <div className="flex flex-col mt-2">
                                <input
                                    type="text"
                                    value={searchTermOther}
                                    onChange={(e) => setSearchTermOther(e.target.value)}
                                    placeholder="주제 검색"
                                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mt-1"
                                />
                                {/* 스크롤 가능한 영역 추가 */}
                                <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded p-2">
                                    <div className="flex flex-wrap gap-4">
                                        {groupedTopics.other
                                            .filter(([label]) => filterTopi(label, searchTermOther)) // 필터링
                                            .map(([label, code]) => (
                                                <label
                                                    key={code}
                                                    className="text-sm font-medium flex items-center w-1/4 text-gray-800 dark:text-gray-100"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        onChange={() => handleTopicChange(code)}
                                                        checked={selectedTopics.includes(code)}
                                                        className="mr-2"
                                                    />
                                                    {label}
                                                </label>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* 단어 정보 */}
            <div className="p-6 border border-gray-300 dark:border-gray-700 rounded-lg w-full lg:w-96 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">단어 정보</h3>
                <div className="mb-4">
                    <strong className="block mb-2 text-gray-800 dark:text-gray-100">단어 정보:</strong>
                    <p>단어: {word}</p>
                    <p>첫 글자: {wordInfo.firstLetter}</p>
                    <p>끝 글자: {wordInfo.lastLetter}</p>
                    <p>길이: {wordInfo.length}</p>
                    <p>한글 초성: {wordInfo.initials}</p>
                </div>
                <div className="mb-4">
                    <strong className="block mb-2 text-gray-800 dark:text-gray-100">주제 및 주제 코드:</strong>
                    <p>
                        주제:{" "}
                        {selectedTopics.length > 0
                            ? selectedTopics.map((code) => topicsCode[code]).join(", ")
                            : "-"}
                    </p>
                    <p>코드: {selectedTopics.join(", ") || "-"}</p>
                </div>
            </div>
        </div>
    )
}

export default WordAddForm;
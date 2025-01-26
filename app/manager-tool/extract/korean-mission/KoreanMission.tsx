"use client";
import React, { useState, useRef } from "react";
import { DefaultDict } from "@/app/lib/collections";

const WordExtractorApp: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [extractedWords, setExtractedWords] = useState<string[]>([]);
    const [oneMissionChecked, setOneMissionChecked] = useState<boolean>(false);
    const [missionLetterView, setMissionLetterView] = useState<boolean>(false);
    const [wordMod, setWordMod] = useState<"mode1" | "mode2" | "mode3" | "mode4" | "">('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                setFileContent(content);
                setExtractedWords([]);
            };
            reader.readAsText(file);
        }
    };

    const extractWords = () => {
        if (fileContent && wordMod) {
            const kkk = new DefaultDict<string, { word: string, mission: number }[]>(() => []);
            const include = oneMissionChecked ? 1 : 2;
            for (const m of "가나다라마바사아자차카타파하") {
                for (const word of fileContent.split('\n')) {
                    const pp = (word.match(new RegExp(m, "gi")) || []).length
                    if (pp >= include) {
                        kkk.get(m).push({ word, mission: pp });
                    }
                }
            }
            switch (wordMod) {
                case "mode1": 
                const words1: string[] = [];
                    for (const m of "가나다라마바사아자차카타파하") {
                        if (kkk.get(m).length > 0) {
                            kkk.get(m).sort((a, b) => {
                                // 1순위: mission 내림차순
                                if (b.mission !== a.mission) {
                                    return b.mission - a.mission;
                                }
                                // 2순위: word 길이 내림차순
                                if (b.word.length !== a.word.length) {
                                    return b.word.length - a.word.length;
                                }
                                // 3순위: ㄱㄴㄷ 순 (사전순)
                                return a.word.localeCompare(b.word);
                            })
                            words1.push(`=[${m}]=`);
                            words1.push(...kkk.get(m).map(i => i.word));
                            words1.push(' ');
                            setExtractedWords(words1);
                        }
                        else{
                            words1.push(`=[${m}]=`);
                            words1.push(' ');
                        }
                    }
                    break;

                case "mode2":
                    const words2:string[] = [];
                    for (const m of "가나다라마바사아자차카타파하") {
                        if (kkk.get(m).length > 0) {
                            kkk.get(m).sort((a, b) => {
                                // 1순위: ㄱㄴㄷ 순 (사전순)
                                const wordComparison = a.word.localeCompare(b.word);
                                if (wordComparison !== 0) {
                                    return wordComparison;
                                }
                                // 2순위: mission 내림차순
                                if (b.mission !== a.mission) {
                                    return b.mission - a.mission;
                                }
                                // 3순위: word 길이 내림차순
                                return b.word.length - a.word.length;
                            })
                            let ko:undefined | string = undefined;
                            let ww:{word:string,mission:number}[] = [];
                            words2.push(`==[[${m}]]==`)
                            for (const {word,mission} of kkk.get(m)){
                                if (!ko){
                                    ko= word[0];
                                    ww.push({word,mission});
                                }
                                else{
                                    if (word[0] === ko){
                                        ww.push({word,mission});
                                    }
                                    else{
                                        ww.sort((a,b)=>{
                                            if (b.mission !== a.mission) {
                                                return b.mission - a.mission;
                                            }
                                            return b.word.length - a.word.length;
                                        });
                                        words2.push(`=[${ko}]=`);
                                        words2.push(...ww.map(w=>w.word));
                                        words2.push(' ')
                                        ww=[];
                                        ww.push({word,mission});
                                        ko=word[0];
                                    }
                                }
                            }
                            words2.push(' ')
                        }
                        else{
                            words2.push(`==[[${m}]]==`)
                            words2.push(' ')
                        }
                    }
                    setExtractedWords(words2);
                    break;
                
                case "mode3":
                    const words3:string[] = [];
                    for (const m of "가나다라마바사아자차카타파하"){
                        words3.push(...kkk.get(m).map(w=>w.word));
                    }
                    words3.sort((a,b)=>b.length-a.length);
                    setExtractedWords(words3);
                    break;
                case "mode4":
                    const words4:string[] = [];
                    for (const m of "가나다라마바사아자차카타파하"){
                        words4.push(...kkk.get(m).map(w=>w.word));
                    }
                    words4.sort((a,b)=>a.localeCompare(b));
                    setExtractedWords(words4);
                    break;
            }
        }
    };

    const downloadExtractedWords = () => {
        if (extractedWords.length === 0) return;
        const blob = new Blob([extractedWords.join("\n")], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${file?.name.substring(0, file?.name.lastIndexOf(".")) || "unkown"}_미션단어 목록.txt`;
        link.click();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white">

            {/* Main Content */}
            <main className="flex-grow p-4">
                <div className="flex flex-col md:flex-row h-full gap-4">
                    {/* Left section */}
                    <div className="md:w-4/5 w-full flex flex-col gap-4">
                        <div className="p-4 border rounded shadow dark:border-gray-700 dark:bg-gray-800">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".txt"
                                onChange={handleFileUpload}
                                className="border p-2 rounded w-full dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                            <div className="p-4 border rounded shadow overflow-auto dark:border-gray-700 dark:bg-gray-800">
                                <h2 className="text-lg font-bold mb-2">업로드된 파일 내용</h2>
                                <div className="h-full max-h-96 overflow-y-auto">
                                    <pre>{fileContent || "아직 파일이 업로드 되지 않았습니다"}</pre>
                                </div>
                            </div>
                            <div className="p-4 border rounded shadow overflow-auto dark:border-gray-700 dark:bg-gray-800">
                                <h2 className="text-lg font-bold mb-2">{`미션 단어 목록`}</h2>
                                <div className="h-full max-h-96 overflow-y-auto">
                                    <pre>{extractedWords.length > 0 ? extractedWords.join("\n") : "아직 추출되지 않았거나 \n추출된 단어가 없습니다."}</pre>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right section */}
                    <div className="md:w-1/5 w-full p-4 border rounded shadow dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex flex-col space-y-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={oneMissionChecked}
                                    onChange={() => setOneMissionChecked(!oneMissionChecked)}
                                    className="h-5 w-5 border rounded dark:border-gray-600 dark:bg-gray-700 dark:accent-white"
                                />
                                <span className="dark:text-white">1미 포함 여부</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={missionLetterView}
                                    onChange={() => setMissionLetterView(!missionLetterView)}
                                    className="h-5 w-5 border rounded dark:border-gray-600 dark:bg-gray-700 dark:accent-white"
                                />
                                <span className="dark:text-white">미션글자 표시 여부</span>
                            </label>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <span className="text-lg font-semibold">정렬 모드 선택:</span>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="wordMod"
                                    value="mode1"
                                    checked={wordMod === "mode1"}
                                    onChange={(e) => setWordMod(e.target.value as "mode1")}
                                    className="mr-2"
                                />
                                1: 미션글자 포함순, 2: 글자길이순, 3: ㄱㄴㄷ순
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="wordMod"
                                    value="mode2"
                                    checked={wordMod === "mode2"}
                                    onChange={(e) => setWordMod(e.target.value as "mode2")}
                                    className="mr-2"
                                />
                                1: ㄱㄴㄷ순, 2:미션글자 포함순, 3: 글자길이순
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="wordMod"
                                    value="mode3"
                                    checked={wordMod === "mode3"}
                                    onChange={(e) => setWordMod(e.target.value as "mode3")}
                                    className="mr-2"
                                />
                                1. 길이순
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="wordMod"
                                    value="mode4"
                                    checked={wordMod === "mode4"}
                                    onChange={(e) => setWordMod(e.target.value as "mode4")}
                                    className="mr-2"
                                />
                                1. ㄱㄴㄷ순
                            </label>
                        </div>

                        <button
                            onClick={extractWords}
                            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4 dark:bg-blue-600 dark:hover:bg-blue-700"
                        >
                            추출
                        </button>
                        <button
                            onClick={downloadExtractedWords}
                            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                        >
                            추출된 단어목록 다운로드
                        </button>
                    </div>
                </div>
            </main>
        </div>

    );
};

export default WordExtractorApp;

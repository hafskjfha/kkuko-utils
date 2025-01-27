"use client";
import React, { useState, useRef } from "react";
import { Counter } from "@/app/lib/collections";
import ErrorModal from "@/app/components/ErrModal";
import type { ErrorMessage } from '@/app/types/type'
import Spinner from "@/app/components/Spinner";

const WordExtractorApp: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [extractedWords, setExtractedWords] = useState<string[]>([]);
    const [minMission, setMinMission] = useState<number>(0);
    const [sortChecked,setSortChecked] = useState<boolean>(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [errorModalView, seterrorModalView] = useState<ErrorMessage | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        try{    
            const file = e.target.files?.[0];
            if (file) {
                setFile(file);
                const reader = new FileReader();
                reader.onload = (event) => {
                    setLoading(true);
                    const content = event.target?.result as string;
                    setFileContent(content.replace(/\r/g, "").replace(/\s+$/, ""));
                    setLoading(false);
                };
                reader.onerror = (event) => {
                    const error = event.target?.error;
                    try{
                        if(error){
                            const errorObj = new Error(`FileReader Error: ${error.message}`);
                            errorObj.name = error.name; // DOMException의 name 속성을 Error 객체에 복사
                            throw errorObj;
                        }
                    }catch(err){
                        if (err instanceof Error) {
                            seterrorModalView({
                                ErrName: err.name,
                                ErrMessage: err.message,
                                ErrStackRace: err.stack,
                                inputValue: null
                            });
            
                        } else {
                            seterrorModalView({
                                ErrName: null,
                                ErrMessage: null,
                                ErrStackRace: err as string,
                                inputValue: null
                            });
                        }
                    }
                };

                reader.readAsText(file);
            }
        }catch(err){
            if (err instanceof Error) {
                seterrorModalView({
                    ErrName: err.name,
                    ErrMessage: err.message,
                    ErrStackRace: err.stack,
                    inputValue: null
                });

            } else {
                seterrorModalView({
                    ErrName: null,
                    ErrMessage: null,
                    ErrStackRace: err as string,
                    inputValue: null
                });
            }
        }
    };

    const extractWords = () => {
        try{    
            if (fileContent) {
                const words:string[] = [];
                for (const word of fileContent.split('\n')){
                    const counter = new Counter<string>();
                    for (const c of 'abcdefghijklmnopqrstuvwxyz'){
                        if ([...word].filter((char) => char === c).length >= minMission)
                        counter.set(c, [...word].filter((char) => char === c).length)
                    }
                    
                    const aa = sortChecked ? counter.entries().sort((a,b)=>b[1]-a[1]) : counter.entries();
                    
                    words.push(`${word} [${aa.map(([key, value]) => `${key}:${value}`).join(" ")}]`);
                }
                setExtractedWords(words);
            }
        }catch(err){
            if (err instanceof Error) {
                seterrorModalView({
                    ErrName: err.name,
                    ErrMessage: err.message,
                    ErrStackRace: err.stack,
                    inputValue: `EN_MISSION | ${fileContent}`
                });

            } else {
                seterrorModalView({
                    ErrName: null,
                    ErrMessage: null,
                    ErrStackRace: err as string,
                    inputValue: `EN_MISSION | ${fileContent}`
                });
            }
        }
    };

    const downloadExtractedWords = () => {
        try{    
            if (extractedWords.length === 0) return;
            const blob = new Blob([extractedWords.join("\n")], { type: "text/plain" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${file?.name.substring(0, file?.name.lastIndexOf(".")) || "unkown"}_미션단어 목록.txt`;
            link.click();
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }catch(err){
            if (err instanceof Error) {
                seterrorModalView({
                    ErrName: err.name,
                    ErrMessage: err.message,
                    ErrStackRace: err.stack,
                    inputValue: fileContent
                });

            } else {
                seterrorModalView({
                    ErrName: null,
                    ErrMessage: null,
                    ErrStackRace: err as string,
                    inputValue: fileContent
                });
            }
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
                    <span className="dark:text-white">최소 포함수</span>
                        <input
                            type="number"
                            value={minMission}
                            onChange={(e) => setMinMission(Math.max(Number(e.target.value),0))}
                            className="border p-2 rounded w-full mb-4 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            placeholder="최소 포함수를 입력하세요."
                        />
                        <div className="flex flex-col space-y-2">
                        <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={sortChecked}
                                    onChange={() => setSortChecked(!sortChecked)}
                                    className="h-5 w-5 border rounded dark:border-gray-600 dark:bg-gray-700 dark:accent-blue-300"
                                />
                                <span className="dark:text-white">정렬 여부</span>
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
                {errorModalView  && <ErrorModal onClose={()=>seterrorModalView(null)} error={errorModalView} />}
                {loading && (
                <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-50">
                    <Spinner />
                </div>
            )}
            </main>
        </div>

    );
};

export default WordExtractorApp;

"use client";
import React, { useState, useRef } from "react";
import ErrorModal from "@/app/components/ErrModal";
import type { ErrorMessage } from '@/app/types/type';

const WordExtractorApp: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [extractedWords, setExtractedWords] = useState<string[]>([]);
    const [wordLength, setWordLength] = useState<number>(5);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [errorModalView, seterrorModalView] = useState<ErrorMessage | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                setFileContent(content.replace(/\r/g, "").replace(/\s+$/, ""));
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
    };

    const extractWords = () => {
        try{    
            if (fileContent) {
                const words = fileContent.split(/\s+/).filter((word) => word.length === wordLength);
                setExtractedWords(words);
            }
        }catch(err){
            if (err instanceof Error) {
                seterrorModalView({
                    ErrName: err.name,
                    ErrMessage: err.message,
                    ErrStackRace: err.stack,
                    inputValue: `LENX | ${fileContent}`
                });

            } else {
                seterrorModalView({
                    ErrName: null,
                    ErrMessage: null,
                    ErrStackRace: err as string,
                    inputValue: `LENX | ${fileContent}`
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
            link.download = `${file?.name.substring(0, file?.name.lastIndexOf(".")) || "unkown"}_${wordLength}글자 목록.txt`;
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
                                <h2 className="text-lg font-bold mb-2">{`${wordLength}글자의 단어 목록`}</h2>
                                <div className="h-full max-h-96 overflow-y-auto">
                                    <pre>{extractedWords.length > 0 ? extractedWords.join("\n") : "아직 추출되지 않았거나 \n추출된 단어가 없습니다."}</pre>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right section */}
                    <div className="md:w-1/5 w-full p-4 border rounded shadow dark:border-gray-700 dark:bg-gray-800">
                        <input
                            type="number"
                            value={wordLength}
                            onChange={(e) => setWordLength(Math.max(Number(e.target.value), 0))}
                            className="border p-2 rounded w-full mb-4 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter word length"
                        />
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
                {errorModalView && <ErrorModal onClose={()=>seterrorModalView(null)} error={errorModalView} />}
            </main>
        </div>

    );
};

export default WordExtractorApp;

"use client";
import React, { useState, useRef } from "react";
import Image from 'next/image';
import DuemLaw from "@/app/lib/DuemLaw";
import HelpModal from "./HelpModal";
import ErrorModal from "@/app/components/ErrModal";
import type { ErrorMessage } from '@/app/types/type';

const WordExtractorApp: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [extractedWords, setExtractedWords] = useState<string[]>([]);
    const [wordMod, setWordMod] = useState<"mode1" | "mode2" | "mode3" | "mode4" | "">('');
    const [loopLetter, setLoopLetter] = useState<string>('');
    const [helpModalOpen, setHelpModalOpen] = useState<boolean>(false);
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
            if (!fileContent || !loopLetter) return;
            switch (wordMod) {
                case 'mode1':
                    const words1 = fileContent.split(/\s+/).filter(word => word.startsWith(loopLetter) && word.endsWith(loopLetter));
                    setExtractedWords(words1);
                    break;
                case 'mode2':
                    const loopl2 = DuemLaw(loopLetter[0]);
                    const words2 = fileContent.split(/\s+/).filter(word => (word.startsWith(loopLetter) || word.startsWith(loopl2)) && word.endsWith(loopLetter));
                    setExtractedWords(words2);
                    break;
                case 'mode3':
                    const loopl3 = DuemLaw(loopLetter[0]);
                    const words3 = fileContent.split(/\s+/).filter(word => word.startsWith(loopLetter) && (word.endsWith(loopLetter) || word.endsWith(loopl3)));
                    setExtractedWords(words3);
                    break;
                case 'mode4':
                    const loopl4 = DuemLaw(loopLetter[0]);
                    const words4 = fileContent.split(/\s+/).filter(word => (word.startsWith(loopLetter) || word.startsWith(loopl4)) && (word.endsWith(loopLetter) || word.endsWith(loopl4)));
                    setExtractedWords(words4);
                    break;
            }
        }catch(err){
            if (err instanceof Error) {
                seterrorModalView({
                    ErrName: err.name,
                    ErrMessage: err.message,
                    ErrStackRace: err.stack,
                    inputValue: `LOOP | MOD: ${wordMod} |${fileContent}` 
                });

            } else {
                seterrorModalView({
                    ErrName: null,
                    ErrMessage: null,
                    ErrStackRace: err as string,
                    inputValue: `LOOP | MOD: ${wordMod} |${fileContent}` 
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
            link.download = `${file?.name.substring(0, file?.name.lastIndexOf(".")) || "unkown"}_돌림단어 목록.txt`;
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
                                <h2 className="text-lg font-bold mb-2">{`돌림단어 목록`}</h2>
                                <div className="h-full max-h-96 overflow-y-auto">
                                    <pre>{extractedWords.length > 0 ? extractedWords.join("\n") : "아직 추출되지 않았거나 \n추출된 단어가 없습니다."}</pre>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right section */}
                    <div className="md:w-1/5 w-full p-4 border rounded shadow dark:border-gray-700 dark:bg-gray-800">
                        <input
                            value={loopLetter}
                            onChange={(e) => setLoopLetter(e.target.value)}
                            className="border p-2 rounded w-full mb-4 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            placeholder="돌림글자를 입력하세요."
                        />
                        <div className="flex items-center mb-4">
                            <label className="font-bold text-gray-700 dark:text-white">
                                추출 모드 선택:
                            </label>
                            <button
                                onClick={() => setHelpModalOpen(true)}
                                className="relative w-5 h-5"
                            >
                                <Image
                                    src="/help1-log.svg"
                                    alt="Info"
                                    fill
                                    className="cursor-pointer object-contain"
                                />
                            </button>
                        </div>


                        <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="wordMod"
                                    value="mode1"
                                    checked={wordMod === "mode1"}
                                    onChange={(e) => setWordMod(e.target.value as "mode1")}
                                    className="mr-2"
                                />
                                1
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
                                2
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
                                3
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
                                4
                            </label>
                        </div>
                        <button
                            onClick={extractWords}
                            disabled={!fileContent || !loopLetter}
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
                {helpModalOpen && <HelpModal onClose={() => setHelpModalOpen(false)} />}
                {errorModalView && <ErrorModal onClose={()=>seterrorModalView(null)} error={errorModalView} />}
            </main>
        </div>

    );
};

export default WordExtractorApp;

"use client";
import ErrorModal from "@/app/components/ErrModal";
import Spinner from "@/app/components/Spinner";
import type { ErrorMessage } from '@/app/types/type';
import React, { useState, useRef } from "react";
import { DefaultDict } from "@/app/lib/collections";

const f = (word:string) => {
    let r = `${word} `;
    for (const m of "가나다라마바사아자차카타파하") {
        const pp = (word.match(new RegExp(m, "gi")) || []).length
        if (pp >= 1) {
            r += `[${m}${pp}]`;
        }
    }
    return r;
}

const KoreanMissionB: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [extractedWords, setExtractedWords] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [errorModalView, seterrorModalView] = useState<ErrorMessage | null>(null);
    const [loading, setLoading] = useState(false);
    const [showMissionLetter, setShowMissionLetter] = useState<boolean>(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                setFile(file);
                const reader = new FileReader();
                reader.onload = (event) => {
    
                    const content = event.target?.result as string;
                    setFileContent(content.replace(/\r/g, "").replace(/\s+$/, "").replaceAll("\u200b",""));
                    setExtractedWords([]);
                    setLoading(false);
                };
                reader.onerror = (event) => {
                    const error = event.target?.error;
                    try {
                        if (error) {
                            const errorObj = new Error(`FileReader Error: ${error.message}`);
                            errorObj.name = error.name; // DOMException의 name 속성을 Error 객체에 복사
                            throw errorObj;
                        }
                    } catch (err) {
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
                setLoading(true);
                setExtractedWords([]);
                setFileContent("");
                reader.readAsText(file);
            }
        };

    const extractWords = () => {
        try{
            if (!fileContent) return;
            setLoading(true);
            const words = fileContent.split("\n")
            const kkk = new DefaultDict<string,string[]>(()=>[]);
            const result:string[] = [];
            for (const word of words){
                kkk.get(word[0]).push(word)
            }
            const ppp = kkk.sortedEntries();
            for (const [l,v] of ppp){
                
                let ww:string|undefined = undefined;
                let co:number = 0;
                for (const m of "가나다라마바사아자차카타파하"){
                    for (const word of v){
                        const pp = (word.match(new RegExp(m, "gi")) || []).length;
                        if (pp > 0){
                            if (ww === undefined) {
                                ww = word;
                                co = pp;
                            }
                            else{
                                if (co === pp && ww.length < word.length) ww = word;
                                else if (pp > co) {
                                    ww = word;
                                    co = pp;
                                }
                            }
                        }
                    }
                    if (ww !== undefined){
                        if (!result.includes(`=[${l}]=`)) result.push(`=[${l}]=`);
                        result.push(`-${m}-`);
                        if (showMissionLetter) result.push(f(ww));
                        else result.push(ww);
                        result.push("");
                        ww = undefined;
                        co = 0;
                    }
                }
            }
            setExtractedWords(result);

        }catch (err) {
            if (err instanceof Error) {
                seterrorModalView({
                    ErrName: err.name,
                    ErrMessage: err.message,
                    ErrStackRace: err.stack,
                    inputValue: `KOREAN_MISSION_B | ${fileContent}`
                });

            } else {
                seterrorModalView({
                    ErrName: null,
                    ErrMessage: null,
                    ErrStackRace: err as string,
                    inputValue: `KOREAN_MISSION_B | ${fileContent}`
                });
            }
        } finally {
            setLoading(false);
        }
    }

    const downloadExtractedWords = () => {
        try {
            if (extractedWords.length === 0) return;
            const blob = new Blob([extractedWords.join("\n")], { type: "text/plain" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${file?.name.substring(0, file?.name.lastIndexOf(".")) || "unkown"}_미션단어 목록.txt`;
            link.click();
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (err) {
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

    const handleHelp = () => {
        window.open("https://docs.google.com/document/d/1vbo0Y_kUKhCh_FUCBbpu-5BMXLBOOpvgxiJ_Hirvrt4/edit?tab=t.0#heading=h.4hk4plz6rbsd", "_blank", "noopener,noreferrer");
    }


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
                            <button
                                onClick={handleHelp}
                                className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 mb-4"
                            >
                                도움말
                            </button>
                            
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={showMissionLetter}
                                    onChange={() => setShowMissionLetter(!showMissionLetter)}
                                    className="h-5 w-5 border rounded dark:border-gray-600 dark:bg-gray-700 dark:accent-blue-300"
                                />
                                <span className="dark:text-white">미션글자 표시 여부</span>
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
                {errorModalView && <ErrorModal onClose={() => seterrorModalView(null)} error={errorModalView} />}
                {loading && (
                    <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-50">
                        <Spinner />
                    </div>
                )}
            </main>
        </div>
    )
}

export default KoreanMissionB;
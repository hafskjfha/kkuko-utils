"use client";
import React, { useState, useRef } from "react";

const WordExtractorApp: React.FC = () => {
    const [file,setFile] = useState<File | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [extractedWords, setExtractedWords] = useState<string[]>([]);
    const [wordLength, setWordLength] = useState<number>(5);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                setFileContent(content);
            };
            reader.readAsText(file);
        }
    };

    const extractWords = () => {
        if (fileContent) {
            const words = fileContent.split(/\s+/).filter((word) => word.length === wordLength);
            setExtractedWords(words);
        }
    };

    const downloadExtractedWords = () => {
        if(extractedWords.length === 0) return;
        const blob = new Blob([extractedWords.join("\n")], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${file?.name.substring(0, file?.name.lastIndexOf(".")) || "unkown"}_${wordLength}글자 목록.txt`;
        link.click();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex flex-col min-h-screen">

            {/* Main Content */}
            <main className="flex-grow p-4">
                <div className="flex flex-col md:flex-row h-full gap-4">
                    {/* Left section */}
                    <div className="md:w-4/5 w-full flex flex-col gap-4">
                        <div className="p-4 border rounded shadow">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".txt"
                                onChange={handleFileUpload}
                                className="border p-2 rounded w-full"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                            <div className="p-4 border rounded shadow overflow-auto">
                                <h2 className="text-lg font-bold mb-2">업로드된 파일 내용</h2>
                                <div className="h-full max-h-96 overflow-y-auto">
                                    <pre>{fileContent || "아직 파일이 업로드 되지 않았습니다"}</pre>
                                </div>
                            </div>
                            <div className="p-4 border rounded shadow overflow-auto">
                                <h2 className="text-lg font-bold mb-2">{`${wordLength}글자의 단어 목록`}</h2>
                                <div className="h-full max-h-96 overflow-y-auto">
                                    <pre>{extractedWords.length > 0 ? extractedWords.join("\n") : "아직 추출되지 않았거나 \n추출된 단어가 없습니다."}</pre>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right section */}
                    <div className="md:w-1/5 w-full p-4 border rounded shadow">
                        <input
                            type="number"
                            value={wordLength}
                            onChange={(e) => setWordLength(Math.max(Number(e.target.value), 0))}
                            className="border p-2 rounded w-full mb-4"
                            placeholder="Enter word length"
                        />
                        <button
                            onClick={extractWords}
                            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
                        >
                            추출
                        </button>
                        <button
                            onClick={downloadExtractedWords}
                            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
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

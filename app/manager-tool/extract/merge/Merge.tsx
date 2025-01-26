"use client";
import React, { useState, useRef } from "react";

const WordExtractorApp: React.FC = () => {
    const [fileContent1, setFileContent1] = useState("");
    const [fileContent2, setFileContent2] = useState("");
    const [mergedContent, setMergedContent] = useState("");
    const [sortChecked,setSortChecked] = useState<boolean>(true);

    const fileInputRef1 = useRef(null);
    const fileInputRef2 = useRef(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, fileNumber: number) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (fileNumber === 1) {
                    const r = e.target?.result as string
                    setFileContent1(r.replace(/\r/g, "").replace(/\s+$/, ""));
                } else {
                    const rr = e.target?.result as string
                    setFileContent2(rr.replace(/\r/g, "").replace(/\s+$/, ""));
                }
            };
            reader.readAsText(file);
        }
    };

    const mergeFiles = () => {
        if (fileContent1 && fileContent2) {
            const mergeResult = [...new Set([...fileContent1.split('\n'),...fileContent2.split('\n')])]
            setMergedContent(sortChecked ? mergeResult.sort((a,b)=>a.localeCompare(b)).join('\n') : mergeResult.join('\n'));
        }
    };

    const downloadMergedContent = () => {
        if (mergedContent) {
            const blob = new Blob([mergedContent], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "merged_file.txt";
            a.click();
            URL.revokeObjectURL(url);
        } else {
            alert("병합된 내용이 없습니다.");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white">
            {/* Main Content */}
            <main className="flex-grow p-4">
                <div className="flex flex-col md:flex-row h-full gap-4">
                    {/* Left section */}
                    <div className="md:w-4/5 w-full flex flex-col gap-4">
                        {/* File Upload Section */}
                        <div className="p-4 border rounded shadow dark:border-gray-700 dark:bg-gray-800">
                            <h2 className="text-lg font-bold mb-4">텍스트 파일 업로드</h2>
                            <input
                                ref={fileInputRef1}
                                type="file"
                                accept=".txt"
                                onChange={(e) => handleFileUpload(e, 1)}
                                className="border p-2 rounded w-full mb-4 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                            <input
                                ref={fileInputRef2}
                                type="file"
                                accept=".txt"
                                onChange={(e) => handleFileUpload(e, 2)}
                                className="border p-2 rounded w-full dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        {/* File Content Display */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                            <div className="p-4 border rounded shadow overflow-auto dark:border-gray-700 dark:bg-gray-800">
                                <h2 className="text-lg font-bold mb-2">업로드된 첫 번째 파일 내용</h2>
                                <div className="h-full max-h-96 overflow-y-auto">
                                    <pre>{fileContent1 || "파일이 아직 업로드되지 않았습니다."}</pre>
                                </div>
                            </div>
                            <div className="p-4 border rounded shadow overflow-auto dark:border-gray-700 dark:bg-gray-800">
                                <h2 className="text-lg font-bold mb-2">업로드된 두 번째 파일 내용</h2>
                                <div className="h-full max-h-96 overflow-y-auto">
                                    <pre>{fileContent2 || "파일이 아직 업로드되지 않았습니다."}</pre>
                                </div>
                            </div>
                            <div className="p-4 border rounded shadow overflow-auto dark:border-gray-700 dark:bg-gray-800">
                                <h2 className="text-lg font-bold mb-2">병합된 파일 내용</h2>
                                <div className="h-full max-h-96 overflow-y-auto">
                                    <pre>{mergedContent || "파일이 아직 병합되지 않았습니다."}</pre>
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
                                    checked={sortChecked}
                                    onChange={() => setSortChecked(!sortChecked)}
                                    className="h-5 w-5 border rounded dark:border-gray-600 dark:bg-gray-700 dark:accent-blue-300"
                                />
                                <span className="dark:text-white">정렬 여부</span>
                            </label>
                        </div>
                        <button
                            onClick={mergeFiles}
                            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4 dark:bg-blue-600 dark:hover:bg-blue-700"
                        >
                            파일 병합
                        </button>
                        <button
                            onClick={downloadMergedContent}
                            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                        >
                            병합된 파일 다운로드
                        </button>
                    </div>
                </div>
            </main>
        </div>


    );
};

export default WordExtractorApp;

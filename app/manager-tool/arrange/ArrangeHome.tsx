"use client";

import React, { useState } from "react";

const ArrangeHome: React.FC = () => {
    const [fileContent, setFileContent] = useState<string>("");
    const [lineCount, setLineCount] = useState<number>(0);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            // Check if the file is a .txt file
            if (file.type === "text/plain") {
                const reader = new FileReader();

                // Read the file as text
                reader.onload = (e) => {
                    const text = e.target?.result;
                    if (typeof text === "string") {
                        setFileContent(text); // Update state with file content
                        setLineCount(text.split("\n").length); // Count lines
                    }
                };

                reader.onerror = () => {
                    alert("파일을 읽는 중 오류가 발생했습니다.");
                };

                reader.readAsText(file, "utf-8");
            } else {
                alert("지원되지 않는 파일 형식입니다. UTF-8 형식의 .txt 파일만 업로드해주세요.");
            }
        }
    };

    return (
        <div className="flex h-screen">
            <div className="w-2/3 bg-blue-100 p-4 flex flex-col gap-3 h-screen">
                {/* 위쪽: 파일 업로드 (크기 줄임) */}
                <div className="bg-white p-1 shadow rounded">
                    <input
                        type="file"
                        className="border rounded p-1 w-full"
                        onChange={handleFileUpload}
                        accept=".txt"
                    />
                </div>

                {/* 가운데: 파일 내용 */}
                <div className="flex-1 bg-gray-50 p-4 shadow rounded border border-gray-300 overflow-hidden">
                    <div className="flex flex-col gap-2 h-full">
                        <div className="flex justify-between items-center">
                            <h2 className="text-base font-semibold">파일 내용</h2>
                            <span className="text-xs text-gray-500">
                                줄 개수: {lineCount}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto border border-gray-300 p-2">
                            <div className="text-xs text-gray-700 whitespace-pre-wrap">
                                {fileContent || "파일 내용을 불러오세요."}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 아래쪽: 파일 다운로드 버튼 (크기 줄임) */}
                <div className="bg-white p-1 shadow rounded text-center">
                    <button
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                        disabled={!fileContent}
                        onClick={() => {
                            const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = "download.txt";
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                    >
                        파일 다운로드
                    </button>
                </div>
            </div>

            {/* 오른쪽 영역 */}
            <div className="flex-1 bg-green-100 p-6">
                <h1 className="text-3xl font-bold">오른쪽 영역</h1>
                <p className="mt-4">
                    이곳은 화면의 나머지 1/3을 차지하는 영역입니다. 추가 콘텐츠를 여기에 배치하세요.
                </p>
            </div>
        </div>
    );
};

export default ArrangeHome;

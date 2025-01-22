"use client";

import React, { useState, useRef } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import Image from "next/image";


const ArrangeHome: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileContent, setFileContent] = useState<string>("");
    const [lineCount, setLineCount] = useState<number>(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [replaceOpen, setReplaceOpen] = useState<boolean>(false);
    const [replaceTarget, setReplaceTarget] = useState<string>("");
    const [replaceValue, setReplaceValue] = useState<string>("");
    const [removeWord, setRemoveWord] = useState<string>("");
    const [undoStack, setUndoStack] = useState<string[]>([]);
    const [redoStack, setRedoStack] = useState<string[]>([]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            setFile(file);
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

    const pushToUndoStack = (content: string) => {
        setUndoStack((prev) => [...prev, content]);
        setRedoStack([]); // 새로운 작업이 시작되면 Redo 스택 초기화
    };

    const handleUndo = () => {
        if (undoStack.length > 0) {
            const previousContent = undoStack[undoStack.length - 1];
            setUndoStack((prev) => prev.slice(0, -1));
            setRedoStack((prev) => [fileContent, ...prev]); // 현재 상태를 Redo 스택에 저장
            setFileContent(previousContent); // 이전 상태로 복원
            setLineCount(previousContent.split("\n").length);
        }
    };

    const handleRedo = () => {
        if (redoStack.length > 0) {
            const nextContent = redoStack[0];
            setRedoStack((prev) => prev.slice(1));
            setUndoStack((prev) => [...prev, fileContent]); // 현재 상태를 Undo 스택에 저장
            setFileContent(nextContent); // Redo 상태로 복원
            setLineCount(nextContent.split("\n").length);
        }
    };

    const handleReplaceSpacesWithNewlines = () => {
        const updatedContent = fileContent.replace(/ +/g, "\n");
        if(updatedContent === fileContent) return;
        pushToUndoStack(fileContent);
        setFileContent(updatedContent);
        setLineCount(updatedContent.split("\n").length);
    };

    const handleRemoveEmptyLines = () => {
        const updatedContent = fileContent
            .split("\n")
            .filter((line) => line.trim() !== "")
            .join("\n");
        if(updatedContent === fileContent) return;
        pushToUndoStack(fileContent);
        setFileContent(updatedContent);
        setLineCount(updatedContent.split("\n").length);
    };

    const handleRemoveWord = (word: string) => {
        const updatedContent = fileContent
            .split("\n")
            .map((line) => line.replaceAll(word, ""))
            .join("\n");
        if(updatedContent === fileContent) return;
        pushToUndoStack(fileContent);
        setFileContent(updatedContent);
        setLineCount(updatedContent.split("\n").length);
        setRemoveWord("");
    };

    const handleReplaceCharacter = (target: string, replacement: string) => {
        const updatedContent = fileContent.replaceAll(target, replacement);
        if(updatedContent === fileContent) return;
        pushToUndoStack(fileContent);
        setFileContent(updatedContent);
        setLineCount(updatedContent.split("\n").length);
        setReplaceTarget("");
        setReplaceValue("");
    };

    const handleRemoveDuplicates = () => {
        const okSet= new Set<string>();
        const temp:string[] = [];
        for (const w of fileContent.split("\n")) {
            if (okSet.has(w)) continue;
            okSet.add(w);
            temp.push(w);
        }
        const updatedContent = temp.join("\n");
        if(updatedContent === fileContent) return;
        pushToUndoStack(fileContent);
        setFileContent(updatedContent);
        setLineCount(updatedContent.length);
    };

    const handleSortWordv1 = () => {    
        const updatedContent = fileContent.split("\n").sort().join("\n");
        if(updatedContent === fileContent) return;
        pushToUndoStack(fileContent);
        setFileContent(updatedContent);
        setLineCount(updatedContent.length);
    };

    const handleSortWordv2 = () => {
        let groupedText  = '';
        let currentChar: string | null = null;
        for (const word of fileContent.split("\n").sort()) {
            if(!word || word.includes("=[")) continue;
            const firstChar = word[0].toLowerCase(); // 첫 글자 (대소문자 무시)
    
            if (currentChar !== firstChar) {
                // 새로운 그룹의 시작
                if (currentChar !== null) groupedText += '\n'; // 이전 그룹과 구분
                groupedText += `=[${firstChar.toUpperCase()}]=\n`;
                currentChar = firstChar;
            }
    
            // 현재 단어 추가
            groupedText += word + '\n';
        }
        const updatedContent = groupedText.trim();
        if(updatedContent === fileContent) return;
        pushToUndoStack(fileContent);
        setFileContent(updatedContent);
        setLineCount(updatedContent.split("\n").length);
    };

    return (
        <div className="flex h-screen">
            {/* 파일 관련 */}
            <div className="w-3/5 bg-blue-100 p-4 flex flex-col gap-3 h-screen">
                {/* 위쪽: 파일 업로드*/}
                <div className="bg-white p-1 shadow rounded">
                    <input
                        ref={fileInputRef}
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

                {/* 아래쪽: 파일 다운로드 */}
                <div className="bg-white p-1 shadow rounded text-center">
                    <button
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                        disabled={!fileContent}
                        onClick={() => {
                            const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            const today = new Date();
                            const formattedDate = `${today.getFullYear().toString().slice(-2)}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
                            a.download = `${file?.name.split(".")[0]}_${formattedDate}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                            if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                            }
                        }}
                    >
                        파일 다운로드
                    </button>
                </div>
            </div>

            {/* 도구 관련 */}
            <div className="flex-1 bg-green-100 p-6 overflow-y-scroll">
                <h1 className="text-3xl font-bold">도구</h1>

                <div className="flex flex-col gap-4">
                    {/* Undo / Redo */}
                    <div className="flex items-center gap-1 mb-1">
                        <button 
                            className={`px-3 py-1 rounded text-sm ${
                                undoStack.length > 0
                                    ? "bg-green-500 text-white hover:bg-green-600" // Undo 가능한 경우
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed" // Undo 불가능한 경우
                            }`}
                            onClick={handleUndo}
                            disabled={undoStack.length === 0} 
                        >
                            <FiArrowLeft className="text-lg" />
                            Undo
                        </button>
                        <button 
                            className={`px-3 py-1 rounded text-sm ${
                                redoStack.length > 0
                                    ? "bg-green-500 text-white hover:bg-green-600" // Redo 가능한 경우
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed" // Redo 불가능한 경우
                            }`}
                            onClick={handleRedo}
                            disabled={redoStack.length === 0} // Redo 스택이 비어 있으면 비활성화
                        >
                            <FiArrowRight className="text-lg" />
                            Redo
                        </button>
                    </div>

                    {/* ㄱㄴㄷ 순 정렬 v1*/}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">ㄱㄴㄷ 순 정렬 v1:</span>
                        <button 
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                            disabled={!fileContent}
                            onClick={handleSortWordv1}
                        >
                            확인
                        </button>
                        <Image
                            src="/help1-log.svg"
                            alt="도움말"
                            width={20}
                            height={20}
                            className="cursor-pointer"
                        />
                    </div>

                    {/* ㄱㄴㄷ 순 정렬 v2 */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">ㄱㄴㄷ 순 정렬 v2:</span>
                        <button 
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                            disabled={!fileContent}
                            onClick={handleSortWordv2}
                        >
                            확인
                        </button>
                        <Image
                            src="/help1-log.svg"
                            alt="도움말"
                            width={20}
                            height={20}
                            className="cursor-pointer"
                        />
                    </div>

                    {/* 단어 제거 */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">단어 제거:</span>
                        <input
                            type="text"
                            className="flex-1 border rounded px-1 py-0.5 text-xs"
                            placeholder="제거할 단어 입력"
                            value={removeWord}
                            onChange={(e) => setRemoveWord(e.target.value)}
                        />
                        <button 
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                            disabled={!fileContent || !removeWord}
                            onClick={() => handleRemoveWord(removeWord)}
                        >
                            확인
                        </button>
                    </div>

                    {/* 중복 제거 */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">중복제거:</span>
                        <button 
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                            disabled={!fileContent}
                            onClick={handleRemoveDuplicates}
                        >
                            확인
                        </button>
                    </div>

                    {/* 빈 줄 제거 */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">빈 줄 제거:</span>
                        <button 
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                            disabled={!fileContent}
                            onClick={handleRemoveEmptyLines}
                        >
                            확인
                        </button>
                    </div>

                    {/* 공백 -> 줄바꿈 */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">공백 → 줄바꿈:</span>
                        <button 
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                            disabled={!fileContent}
                            onClick={handleReplaceSpacesWithNewlines}
                        >
                            확인
                        </button>
                    </div>

                    {/* 특정 문자 제거 */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">특정 문자 제거:</span>
                            <button
                                className=" text-white px-3 py-1 rounded hover:bg-purple-600 text-sm bg-purple-500"
                                onClick={() => setReplaceOpen((prev) => !prev)}
                            >
                                {replaceOpen ? "도구 접기" : "도구 열기"}
                            </button>
                        </div>

                        {replaceOpen && (
                            <div className="flex flex-col gap-2 pl-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">대상:</span>
                                    <input
                                        type="text"
                                        className="border rounded px-2 py-1 text-sm flex-1"
                                        placeholder="대상 문자 입력"
                                        value={replaceTarget}
                                        onChange={(e) => setReplaceTarget(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">대체값:</span>
                                    <input
                                        type="text"
                                        className="border rounded px-2 py-1 text-sm flex-1"
                                        placeholder="대체값 문자 입력"
                                        value={replaceValue}
                                        onChange={(e) => setReplaceValue(e.target.value)}
                                    />
                                </div>
                                <button 
                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm self-start disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    disabled={!fileContent || !replaceTarget}
                                    onClick={() => handleReplaceCharacter(replaceTarget, replaceValue)}
                                >
                                    확인
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArrangeHome;

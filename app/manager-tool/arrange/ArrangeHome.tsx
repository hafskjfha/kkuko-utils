"use client";

import React, { useState, useRef } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import Image from "next/image";
import HelpModal from "./HelpModal";
import ErrorModal from "@/app/components/ErrModal";
import type { ErrorMessage } from '@/app/types/type'
import Spinner from "@/app/components/Spinner";

const FileSector: React.FC<{ fileContent: string, fileInputRef: React.RefObject<HTMLInputElement | null>, handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void, file: File | null, lineCount: number }> = ({ fileContent, fileInputRef, handleFileUpload, file, lineCount }) => {

    return (
        <>
            {/* 위쪽: 파일 업로드 */}
            <div className="bg-white dark:bg-gray-800 p-2 shadow rounded mb-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    className="border rounded p-2 w-full text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    onChange={handleFileUpload}
                    accept=".txt"
                />
            </div>

            {/* 가운데: 파일 내용 */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 shadow rounded border border-gray-300 dark:border-gray-700 overflow-y-auto mb-2 max-h-[400px]">
                <div className="flex flex-col gap-2 h-full">
                    <div className="flex justify-between items-center">
                        <h2 className="text-base font-semibold dark:text-gray-100">파일 내용</h2>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            줄 개수: {lineCount}
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto border border-gray-300 dark:border-gray-700 p-2">
                        <div className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {fileContent || "파일 내용을 불러오세요."}
                        </div>
                    </div>
                </div>
            </div>

            {/* 아래쪽: 파일 다운로드 */}
            <div className="bg-white dark:bg-gray-800 p-2 shadow rounded text-center">
                <button
                    className="bg-blue-500 dark:bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-700 text-sm w-full md:w-auto"
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
        </>



    )
}

const ToolSector: React.FC<{ fileContent: string, setFileContent: React.Dispatch<React.SetStateAction<string>>, setLineCount: React.Dispatch<React.SetStateAction<number>>, setHelpMoalOpen: React.Dispatch<React.SetStateAction<0|1|2>>, seterrorModalView: React.Dispatch<React.SetStateAction<ErrorMessage|null>> }> = ({ fileContent, setFileContent, setLineCount, setHelpMoalOpen, seterrorModalView }) => {
    const [undoStack, setUndoStack] = useState<string[]>([]);
    const [redoStack, setRedoStack] = useState<string[]>([]);
    const [replaceTarget, setReplaceTarget] = useState<string>("");
    const [replaceValue, setReplaceValue] = useState<string>("");
    const [removeWord, setRemoveWord] = useState<string>("");
    const [replaceOpen, setReplaceOpen] = useState<boolean>(false);

    const pushToUndoStack = (content: string) => {
        try{
            setUndoStack((prev) => [...prev, content]);
            setRedoStack([]);
        } catch(err){
            if (err instanceof Error) {
                seterrorModalView({
                    ErrName: err.name,
                    ErrMessage: err.message,
                    ErrStackRace: err.stack,
                    inputValue: `UNDO | ${content}`
                });

            } else {
                seterrorModalView({
                    ErrName: null,
                    ErrMessage: null,
                    ErrStackRace: err as string,
                    inputValue: `UNDO | ${content}`
                });
            }
        }
    };

    const handleUndo = () => {
        try{
            if (undoStack.length > 0) {
                const previousContent = undoStack[undoStack.length - 1];
                setUndoStack((prev) => prev.slice(0, -1));
                setRedoStack((prev) => [fileContent, ...prev]); // 현재 상태를 Redo 스택에 저장
                setFileContent(previousContent); // 이전 상태로 복원
                setLineCount(previousContent.split("\n").length);
            }
        }catch(err){
            if (err instanceof Error) {
                seterrorModalView({
                    ErrName: err.name,
                    ErrMessage: err.message,
                    ErrStackRace: err.stack,
                    inputValue: `UNDO | ${fileContent}`
                });

            } else {
                seterrorModalView({
                    ErrName: null,
                    ErrMessage: null,
                    ErrStackRace: err as string,
                    inputValue: `UNDO | ${fileContent}`
                });
            }
        }
    };

    const handleRedo = () => {
        try{    
            if (redoStack.length > 0) {
                const nextContent = redoStack[0];
                setRedoStack((prev) => prev.slice(1));
                setUndoStack((prev) => [...prev, fileContent]); // 현재 상태를 Undo 스택에 저장
                setFileContent(nextContent); // Redo 상태로 복원
                setLineCount(nextContent.split("\n").length);
            }
        } catch(err){
            if (err instanceof Error) {
                seterrorModalView({
                    ErrName: err.name,
                    ErrMessage: err.message,
                    ErrStackRace: err.stack,
                    inputValue: `REDO | ${fileContent}`
                });

            } else {
                seterrorModalView({
                    ErrName: null,
                    ErrMessage: null,
                    ErrStackRace: err as string,
                    inputValue: `REDO | ${fileContent}`
                });
            }
        }
    };

    const handleReplaceSpacesWithNewlines = () => {
        try{
            const updatedContent = fileContent.replace(/ +/g, "\n");
            if (updatedContent === fileContent) return;
            pushToUndoStack(fileContent);
            setFileContent(updatedContent);
            setLineCount(updatedContent.split("\n").length);
        }catch(err){
            if (err instanceof Error) {
                seterrorModalView({
                    ErrName: err.name,
                    ErrMessage: err.message,
                    ErrStackRace: err.stack,
                    inputValue: `ReplaceSpacesWithNewlines | ${fileContent}`
                });

            } else {
                seterrorModalView({
                    ErrName: null,
                    ErrMessage: null,
                    ErrStackRace: err as string,
                    inputValue: `ReplaceSpacesWithNewlines | ${fileContent}`
                });
            }
        }
    };

    const handleRemoveEmptyLines = () => {
        try{
            const updatedContent = fileContent
                .split("\n")
                .filter((line) => line.trim() !== "")
                .join("\n");
            if (updatedContent === fileContent) return;
            pushToUndoStack(fileContent);
            setFileContent(updatedContent);
            setLineCount(updatedContent.split("\n").length);
        } catch(err){
            if (err instanceof Error) {
                seterrorModalView({
                    ErrName: err.name,
                    ErrMessage: err.message,
                    ErrStackRace: err.stack,
                    inputValue: `RemoveEmptyLines | ${fileContent}`
                });

            } else {
                seterrorModalView({
                    ErrName: null,
                    ErrMessage: null,
                    ErrStackRace: err as string,
                    inputValue: `RemoveEmptyLines | ${fileContent}`
                });
            }
        }
    };

    const handleRemoveWord = (word: string) => {
        try{
            const updatedContent = fileContent
                .split("\n")
                .map((line) => line.replaceAll(word, ""))
                .join("\n");
            if (updatedContent === fileContent) return;
            pushToUndoStack(fileContent);
            setFileContent(updatedContent);
            setLineCount(updatedContent.split("\n").length);
            setRemoveWord("");
        }catch(err){
            if (err instanceof Error) {
                seterrorModalView({
                    ErrName: err.name,
                    ErrMessage: err.message,
                    ErrStackRace: err.stack,
                    inputValue: `RemoveWord | ${fileContent}`
                });

            } else {
                seterrorModalView({
                    ErrName: null,
                    ErrMessage: null,
                    ErrStackRace: err as string,
                    inputValue: `RemoveWord | ${fileContent}`
                });
            }
        }
    };

    const handleReplaceCharacter = (target: string, replacement: string) => {
        try{
            const updatedContent = fileContent.replaceAll(target, replacement);
            if (updatedContent === fileContent) return;
            pushToUndoStack(fileContent);
            setFileContent(updatedContent);
            setLineCount(updatedContent.split("\n").length);
            setReplaceTarget("");
            setReplaceValue("");
        }catch(err){
            if (err instanceof Error) {
                seterrorModalView({
                    ErrName: err.name,
                    ErrMessage: err.message,
                    ErrStackRace: err.stack,
                    inputValue: `ReplaceCharacter | ${fileContent}`
                });

            } else {
                seterrorModalView({
                    ErrName: null,
                    ErrMessage: null,
                    ErrStackRace: err as string,
                    inputValue: `ReplaceCharacter | ${fileContent}`
                });
            }
        }
    };

    const handleRemoveDuplicates = () => {
        try{
            const okSet = new Set<string>();
            const temp: string[] = [];
            for (const w of fileContent.split("\n")) {
                if (okSet.has(w)) continue;
                okSet.add(w);
                temp.push(w);
            }
            const updatedContent = temp.join("\n");
            if (updatedContent === fileContent) return;
            pushToUndoStack(fileContent);
            setFileContent(updatedContent);
            setLineCount(updatedContent.length);
        }catch(err){
            if (err instanceof Error) {
                seterrorModalView({
                    ErrName: err.name,
                    ErrMessage: err.message,
                    ErrStackRace: err.stack,
                    inputValue: `RemoveDuplicates | ${fileContent}`
                });

            } else {
                seterrorModalView({
                    ErrName: null,
                    ErrMessage: null,
                    ErrStackRace: err as string,
                    inputValue: `RemoveDuplicates | ${fileContent}`
                });
            }
        }
    };

    const handleSortWordv1 = () => {
        try{
            const updatedContent = fileContent.split("\n").sort((a, b) => a.localeCompare(b, "ko-KR"));
            if (updatedContent.join('\n') === fileContent) return;
            pushToUndoStack(fileContent);
            setFileContent(updatedContent.join('\n'));
            setLineCount(updatedContent.length);
            console.log(updatedContent)
        }catch(err){
            if (err instanceof Error) {
                seterrorModalView({
                    ErrName: err.name,
                    ErrMessage: err.message,
                    ErrStackRace: err.stack,
                    inputValue: `SortWordv1 | ${fileContent}`
                });

            } else {
                seterrorModalView({
                    ErrName: null,
                    ErrMessage: null,
                    ErrStackRace: err as string,
                    inputValue: `SortWordv1 | ${fileContent}`
                });
            }
        }
    };

    const handleSortWordv2 = () => {
        try{
            let groupedText = '';
            let currentChar: string | null = null;
            for (const word of fileContent.split("\n").sort((a, b) => a.localeCompare(b, "ko-KR"))) {
                if (!word || word.includes("=[")) continue;
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
            if (updatedContent === fileContent) return;
            pushToUndoStack(fileContent);
            setFileContent(updatedContent);
            setLineCount(updatedContent.split("\n").length);
        }catch(err){
            if (err instanceof Error) {
                seterrorModalView({
                    ErrName: err.name,
                    ErrMessage: err.message,
                    ErrStackRace: err.stack,
                    inputValue: `SortWordv2 | ${fileContent}`
                });

            } else {
                seterrorModalView({
                    ErrName: null,
                    ErrMessage: null,
                    ErrStackRace: err as string,
                    inputValue: `SortWordv2 | ${fileContent}`
                });
            }
        }
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-screen">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">도구</h1>

            <div className="flex flex-col gap-4">
                {/* Undo / Redo */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        className={`flex items-center justify-center px-3 py-1 rounded text-sm w-full sm:w-auto ${undoStack.length > 0
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
                            }`}
                        onClick={handleUndo}
                        disabled={undoStack.length === 0}
                    >
                        <FiArrowLeft className="text-lg mr-1" />
                        Undo
                    </button>
                    <button
                        className={`flex items-center justify-center px-3 py-1 rounded text-sm w-full sm:w-auto ${redoStack.length > 0
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
                            }`}
                        onClick={handleRedo}
                        disabled={redoStack.length === 0}
                    >
                        <FiArrowRight className="text-lg mr-1" />
                        Redo
                    </button>
                </div>

                {/* ㄱㄴㄷ 순 정렬 v1 */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">ㄱㄴㄷ 순 정렬 v1:</span>
                    <button
                        className="w-full sm:w-auto bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
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
                        onClick={()=>{setHelpMoalOpen(1)}}
                    />
                </div>

                {/* ㄱㄴㄷ 순 정렬 v2 */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">ㄱㄴㄷ 순 정렬 v2:</span>
                    <button
                        className="w-full sm:w-auto bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
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
                        onClick={()=>{setHelpMoalOpen(2)}}
                    />
                </div>

                {/* 단어 제거 */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">단어 제거:</span>
                    <input
                        type="text"
                        className="flex-1 border rounded px-2 py-1 text-sm w-full sm:w-auto dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        placeholder="제거할 단어 입력"
                        value={removeWord}
                        onChange={(e) => setRemoveWord(e.target.value)}
                    />
                    <button
                        className="w-full sm:w-auto bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                        disabled={!fileContent || !removeWord}
                        onClick={() => handleRemoveWord(removeWord)}
                    >
                        확인
                    </button>
                </div>

                {/* 중복 제거 */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">중복제거:</span>
                    <button
                        className="w-full sm:w-auto bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                        disabled={!fileContent}
                        onClick={handleRemoveDuplicates}
                    >
                        확인
                    </button>
                </div>

                {/* 빈 줄 제거 */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">빈 줄 제거:</span>
                    <button
                        className="w-full sm:w-auto bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                        disabled={!fileContent}
                        onClick={handleRemoveEmptyLines}
                    >
                        확인
                    </button>
                </div>

                {/* 공백 -> 줄바꿈 */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">공백 → 줄바꿈:</span>
                    <button
                        className="w-full sm:w-auto bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                        disabled={!fileContent}
                        onClick={handleReplaceSpacesWithNewlines}
                    >
                        확인
                    </button>
                </div>

                {/* 특정 문자 제거 */}
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">특정 문자 제거:</span>
                        <button
                            className="w-full sm:w-auto bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 text-sm"
                            onClick={() => setReplaceOpen((prev) => !prev)}
                        >
                            {replaceOpen ? "도구 접기" : "도구 열기"}
                        </button>
                    </div>

                    {replaceOpen && (
                        <div className="flex flex-col gap-2 pl-6">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium">대상:</span>
                                <input
                                    type="text"
                                    className="w-full sm:w-auto border rounded px-2 py-1 text-sm flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                    placeholder="대상 문자 입력"
                                    value={replaceTarget}
                                    onChange={(e) => setReplaceTarget(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium">대체값:</span>
                                <input
                                    type="text"
                                    className="w-full sm:w-auto border rounded px-2 py-1 text-sm flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                    placeholder="대체값 문자 입력"
                                    value={replaceValue}
                                    onChange={(e) => setReplaceValue(e.target.value)}
                                />
                            </div>
                            <button
                                className="w-full sm:w-auto bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
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

    )
}

const ArrangeHome: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileContent, setFileContent] = useState<string>("");
    const [lineCount, setLineCount] = useState<number>(0);
    const [helpModalopen,setHelpMoalOpen] = useState<0|1|2>(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [errorModalView, seterrorModalView] = useState<ErrorMessage | null>(null);
    const [loading, setLoading] = useState(false);

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
                        
                        
                        setFileContent(text.replace(/\r/g, "").replace(/\s+$/, "")); // Update state with file content
                        setLineCount(text.split("\n").length); // Count lines
                        setLoading(false);
                    }
                    else{
                        throw new Error('fail to read file');
                    }
                    
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
                    } finally{
                        setLoading(false);
                    }
                };
                setLoading(true);
                reader.readAsText(file, "utf-8");
                

            } else {
                alert("지원되지 않는 파일 형식입니다. UTF-8 형식의 .txt 파일만 업로드해주세요.");
            }
        }
    };



    return (
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* 파일 관련 */}
            <div className="w-full md:w-3/5 bg-blue-100 dark:bg-blue-900 p-4 flex flex-col gap-3 h-auto md:h-full overflow-y-auto">
                <FileSector
                    fileContent={fileContent}
                    fileInputRef={fileInputRef}
                    handleFileUpload={handleFileUpload}
                    file={file}
                    lineCount={lineCount}
                />
            </div>

            {/* 도구 관련 */}
            <div className="w-full md:flex-1 bg-green-100 dark:bg-green-900 p-6 overflow-y-auto h-auto md:h-full">
                <ToolSector
                    fileContent={fileContent}
                    setFileContent={setFileContent}
                    setLineCount={setLineCount}
                    setHelpMoalOpen={setHelpMoalOpen}
                    seterrorModalView={seterrorModalView}
                />
            </div>

            {helpModalopen && <HelpModal onClose={()=>setHelpMoalOpen(0)} wantGo={helpModalopen}/>}
            {errorModalView && <ErrorModal onClose={()=>seterrorModalView(null)} error={errorModalView} />}
            {loading && (
                <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-50">
                    <Spinner />
                </div>
            )}
        </div>



    );
};

export default ArrangeHome;

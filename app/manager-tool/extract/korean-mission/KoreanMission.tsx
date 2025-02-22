"use client";
import React, { useState, useRef } from "react";
import { DefaultDict } from "@/app/lib/collections";
import ErrorModal from "@/app/components/ErrModal";
import type { ErrorMessage } from '@/app/types/type';
import Spinner from "@/app/components/Spinner";

const sortedLength = (a: {word:string, mission: number}, b: {word:string, mission: number}) => b.word.length - a.word.length;
const sortedAlphabet = (a: {word:string, mission: number}, b: {word:string, mission: number}) => a.word.localeCompare(b.word, "ko-KR");
const sortedMission = (a: {word:string, mission: number}, b: {word:string, mission: number}) => b.mission - a.mission;
const pack = {"미션글자 포함순":sortedMission, "글자길이순":sortedLength, "ㄱㄴㄷ순":sortedAlphabet};

const WordExtractorApp: React.FC = () => {
    type op = "미션글자 포함순" | "글자길이순" | "ㄱㄴㄷ순";
    const [file, setFile] = useState<File | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [extractedWords, setExtractedWords] = useState<string[]>([]);
    const [oneMissionChecked, setOneMissionChecked] = useState<boolean>(false);
    const [showMissionLetter, setShowMissionLetter] = useState<boolean>(false);
    const [selected, setSelected] = useState<op[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [errorModalView, seterrorModalView] = useState<ErrorMessage | null>(null);
    const [loading, setLoading] = useState(false);
    
    const options: ["미션글자 포함순", "글자길이순", "ㄱㄴㄷ순"] = ["미션글자 포함순", "글자길이순", "ㄱㄴㄷ순"];

    const handleToggle = (option: op) => {
        setSelected((prev) => {
            if (prev.includes(option)) {
                return prev.filter((item) => item !== option); // 선택 해제
            }
            if (prev.length < 3) {
                return [...prev, option]; // 새로운 선택 추가
            }
            return prev; // 3개 초과 선택 방지
        });
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {

                const content = event.target?.result as string;
                setFileContent(content.replace(/\r/g, "").replace(/\s+$/, ""));
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
            reader.readAsText(file);
        }
    };

    const extractWords = () => {
        try {
            setLoading(true);
            if (fileContent && selected.length > 0) {
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

                const f = (word:string) => {
                    let r = `${word} `;
                    for (const m of "가나다라마바사아자차카타파하") {
                        const pp = (word.match(new RegExp(m, "gi")) || []).length
                        if (pp >= 1) {
                            r += `[${m} ${pp}]`;
                        }
                    }
                    return r;
                }
                const rank2 = pack[selected[1]];
                const rank3 = pack[selected[2]];
                switch (selected[0]){
                    case "미션글자 포함순":
                        const wordz:string[] = [];
                        for (const m of "가나다라마바사아자차카타파하"){
                            if (kkk.get(m).length > 0){
                                kkk.get(m).sort((a, b) =>{
                                    const k =pack[selected[0]](a,b);
                                    if (k!=0){
                                        return k;
                                    }
                                    if (rank2 !== undefined){
                                        const k = rank2(a,b);
                                        if (k!=0) return k;
                                    }
                                    if (rank3 !== undefined){
                                        const k = rank3(a,b)
                                        return k;
                                    }
                                    return sortedAlphabet(a,b);
                                });
                                wordz.push(`=[${m}]=`);
                                if (showMissionLetter){
                                    wordz.push(...kkk.get(m).map(i => f(i.word)));
                                }
                                else{
                                    wordz.push(...kkk.get(m).map(i => i.word));
                                }
                                wordz.push(' ');
                                
                            }
                            else{
                                wordz.push(`=[${m}]=`);
                                wordz.push(' ');
                            }
                        }
                        setExtractedWords(wordz);
                        break;
                    case "글자길이순":
                        const words2:string[] = [];
                        for (const m of "가나다라마바사아자차카타파하"){
                            if (kkk.get(m).length > 0){
                                kkk.get(m).sort((a, b) => {
                                    const k = pack[selected[0]](a,b);
                                    if (k!=0){
                                        return k;
                                    }
                                    if (rank2 != undefined){
                                        const k = rank2(a,b);
                                        if (k!=0) return k;
                                    }
                                    if (rank3 != undefined){
                                        const k = rank3(a,b);
                                        return k;
                                    }
                                    return sortedAlphabet(a,b);
                                })
                                if (showMissionLetter){
                                    words2.push(...kkk.get(m).map(i => f(i.word)));
                                }
                                else{
                                    words2.push(...kkk.get(m).map(i => i.word));
                                }
                            }
                        }
                        setExtractedWords(words2);
                        break;
                    case "ㄱㄴㄷ순":
                        const words3:string[] = [];
                        if (rank2 === undefined){
                            for (const m of "가나다라마바사아자차카타파하"){
                                words3.push(...kkk.get(m).map(w=>w.word));
                            }
                            words3.sort((a,b) => sortedAlphabet({word:a,mission:-1},{word:b,mission:-1}));
                            if (showMissionLetter) setExtractedWords(words3.map(w => f(w)));
                            else setExtractedWords(words3);
                            return;
                        }
                        
                        for (const m of "가나다라마바사아자차카타파하") {
                            if (kkk.get(m).length > 0){
                                
                                kkk.get(m).sort((a, b) => {
                                    const k = pack[selected[0]](a,b);
                                    if (k!=0) return k;
                                    
                                    if (rank2 !== undefined){
                                        const k = rank2(a,b)
                                        if (k!=0) return k;
                                    }

                                    if (rank3 != undefined){
                                        return rank3(a,b)
                                    }

                                    return sortedAlphabet(a,b);
                                })
                                let ko:undefined | string = undefined;
                                let ww:{word:string,mission:number}[] = [];
                                words3.push(`==[[${m}]]==`);
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
                                                if (rank2 !== undefined) {
                                                    const k = rank2(a,b);
                                                    if (k!=0) return k;
                                                }
                                                if (rank3 !== undefined) {
                                                    const k = rank3(a,b);
                                                    return k;
                                                }
                                                return sortedLength(a,b);
                                            });
                                            words3.push(`=[${ko}]=`);
                                            if (showMissionLetter){
                                                words3.push(...ww.map(w => f(w.word)));
                                            }
                                            else{
                                                words3.push(...ww.map(w => w.word));
                                            }
                                            words3.push(' ');
                                            ww = [];
                                            ww.push({word,mission});
                                            ko = word[0];
                                        }
                                    }
                                }
                                words3.push(' ');
                            }
                            else{
                                words3.push(`==[[${m}]]==`);
                                words3.push(' ');
                            }
                        }
                        setExtractedWords(words3);
                        
                }
            
            }
        } catch (err) {
            if (err instanceof Error) {
                seterrorModalView({
                    ErrName: err.name,
                    ErrMessage: err.message,
                    ErrStackRace: err.stack,
                    inputValue: `KOREAN_MISSION | MOD: ${selected.join(", ")} | ${fileContent}`
                });

            } else {
                seterrorModalView({
                    ErrName: null,
                    ErrMessage: null,
                    ErrStackRace: err as string,
                    inputValue: `KOREAN_MISSION | MOD: ${selected.join(", ")} | ${fileContent}`
                });
            }
        } finally {
            setLoading(false);
        }
    };

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
                                    className="h-5 w-5 border rounded dark:border-gray-600 dark:bg-gray-700 dark:accent-blue-300"
                                />
                                <span className="dark:text-white">1미 포함 여부</span>
                            </label>
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

                        <div className="flex flex-col space-y-2">
                            <span className="text-lg font-semibold dark:text-white">정렬 모드 선택:</span>
                            {options.map((option) => (
                                <label key={option} className="flex items-center space-x-2 py-2">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 accent-blue-500 dark:accent-blue-300 dark:bg-gray-700 dark:border-gray-600"
                                        checked={selected.includes(option)}
                                        onChange={() => handleToggle(option)}
                                    />
                                    <span className="text-lg dark:text-white">{option}</span>
                                    {selected.includes(option) && (
                                        <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                                            {selected.indexOf(option) + 1}순위
                                        </span>
                                    )}
                                </label>
                            ))}

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

    );
};

export default WordExtractorApp;

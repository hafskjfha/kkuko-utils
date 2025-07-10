"use client";
import React, { useState } from "react";
import ErrorModal from "@/app/components/ErrModal";
import type { ErrorMessage } from '@/app/types/type'
import Spinner from "@/app/components/Spinner";
import FileContentDisplay from "../components/FileContentDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Badge } from "@/app/components/ui/badge";
import { Download, Play, Settings, Zap, Home } from "lucide-react";
import { DefaultDict } from "@/app/lib/collections";
import Link from "next/link";
import HelpModal from "@/app/components/HelpModal";

const f = (word: string) => {
    let r = `${word} `;
    for (const m of "가나다라마바사아자차카타파하") {
        const pp = (word.match(new RegExp(m, "gi")) || []).length
        if (pp >= 1) {
            r += `[${m}${pp}]`;
        }
    }
    return r;
}

const WordExtractorApp = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [extractedWords, setExtractedWords] = useState<string[]>([]);
    const [errorModalView, seterrorModalView] = useState<ErrorMessage | null>(null);
    const [loading, setLoading] = useState(false);
    const [showMissionLetter, setShowMissionLetter] = useState<boolean>(false);

    // 파일 업로드 처리
    const handleFileUpload = (content: string) => {
        setFileContent(content);
    };

    // 에러 처리
    const handleError = (error: unknown) => {
        if (error instanceof Error) {
            seterrorModalView({
                ErrName: error.name,
                ErrMessage: error.message,
                ErrStackRace: error.stack,
                inputValue: null
            });
        } else {
            seterrorModalView({
                ErrName: null,
                ErrMessage: null,
                ErrStackRace: error as string,
                inputValue: null
            });
        }
    };

    // 단어 추출
    const extractWords = async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1))
            if (fileContent) {
                const words = fileContent.split(/\s+/);
                // {시작글자: 해당단어들 리스트}
                const kkk = new DefaultDict<string, string[]>(() => []);
                const result: string[] = [];
                for (const word of words) {
                    kkk.get(word[0]).push(word)
                }
                // 정렬하여 dict추출
                const ppp = kkk.sortedEntries();
                // [시작글자, 단어들 리스트]
                for (const [l, v] of ppp) {
                    // ww: 1티어 단어, co: 1티어 단어의 미션 글자 수
                    let ww: string | undefined = undefined;
                    let co: number = 0;

                    // 미션 단어수 체크
                    for (const m of "가나다라마바사아자차카타파하") {
                        for (const word of v) {
                            const pp = (word.match(new RegExp(m, "gi")) || []).length;
                            if (pp > 0) {
                                if (ww === undefined) {
                                    // 초기화
                                    ww = word;
                                    co = pp;
                                }
                                else {
                                    // 현재 1티어 미션 글자수 보다 미션글자수가 크거나 미션글자수가 같아도 길이가 길면 갱신 
                                    if (co === pp && ww.length < word.length) ww = word;
                                    else if (pp > co) {
                                        ww = word;
                                        co = pp;
                                    }
                                }
                            }
                        }
                        // 1티어 단어 존재한다면
                        if (ww !== undefined) {
                            // 결과 저장
                            if (!result.includes(`=[${l}]=`)) result.push(`=[${l}]=`);
                            result.push(`-${m}-`);
                            if (showMissionLetter) result.push(f(ww));
                            else result.push(ww);
                            result.push("");
                            // 초기화
                            ww = undefined;
                            co = 0;
                        }
                    }
                }
                setExtractedWords(result);
            }
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false)
        }
    };

    // 다운로드 처리
    const downloadExtractedWords = () => {
        try {
            if (extractedWords.length === 0) return;
            const blob = new Blob([extractedWords.join("\n")], { type: "text/plain" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${file?.name.substring(0, file?.name.lastIndexOf(".")) || "unkown"}_1티어미션단어 목록.txt`;
            link.click();
        } catch (err) {
            handleError(err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    한국어 미션 단어 추출 - B
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    텍스트 파일에서 미션단어중 1티어 단어만 추출합니다
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Link href="/manager-tool/extract">
                                <Button variant="outline" size="sm">
                                    <Home size="sm" />
                                    도구홈
                                </Button>
                            </Link>
                            <HelpModal
                                title="한국어 미션 단어 추출 - B 추출 사용법"
                                triggerText="도움말"
                                triggerClassName="border border-gray-200 border-1 rounded-md p-2"
                            >
                                <div className="space-y-6">
                                    {/* Step 0 */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">0</span>
                                            <h3 className="font-semibold">텍스트 파일을 업로드 합니다.</h3>
                                        </div>
                                    </div>

                                    {/* Step 1 */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">1</span>
                                            <h3 className="font-semibold">실행</h3>
                                        </div>
                                        <div className="ml-6 space-y-2">
                                            <p>실행 버튼을 누르고 기다립니다.</p>
                                            <div className="bg-gray-50 p-3 rounded-lg border">
                                                <Button className="w-full h-8" disabled>
                                                    <Play className="w-3 h-3 mr-2" />
                                                    단어 추출
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">2</span>
                                            <h3 className="font-semibold">결과 확인 및 다운로드</h3>
                                        </div>
                                        <div className="ml-6 space-y-2">
                                            <p>결과를 확인한 후 다운로드합니다.</p>
                                            <div className="bg-gray-50 p-3 rounded-lg border">
                                                <Button variant="secondary" className="w-full h-8" disabled>
                                                    <Download className="w-3 h-3 mr-2" />
                                                    결과 다운로드
                                                    <Badge variant="default" className="ml-2 text-xs">5</Badge>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 예시 */}
                                    <div className="space-y-3">
                                        <h3 className="font-semibold">1티어 기준</h3>
                                        <div className="space-y-3">
                                            <div className="bg-green-50 p-3 rounded border">
                                                <div className="text-sm space-y-1">
                                                    <div>• 1순위: 미션글자 포함 수</div>
                                                    <div>• 2순위: 단어 길이</div>
                                                    <div>• 참고: 동률단어중 랜덤 단어1개만 추출됩니다.</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-blue-800 text-sm">
                                            <strong>💡 팁:</strong> 미션글자 표시 옵션을 체크하면 단어 옆에 [가2] 이런 형식이 추가됩니다.
                                        </p>
                                    </div>
                                </div>
                            </HelpModal>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* File Content Display - 3/4 width */}
                    <div className="xl:col-span-3">
                        <FileContentDisplay
                            fileContent={fileContent}
                            setFileContent={setFileContent}
                            setFile={setFile}
                            file={file}
                            onFileUpload={handleFileUpload}
                            onError={handleError}
                            resultData={extractedWords}
                            resultTitle={`1티어 미션단어 목록`}
                        />
                    </div>

                    {/* Control Panel - 1/4 width */}
                    <div className="xl:col-span-1">
                        <div className="space-y-6">
                            {/* Settings Card */}
                            <Card className="dark:bg-gray-800 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-white">
                                        <Settings className="h-5 w-5 dark:text-gray-400" />
                                        설정
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="show-mletter"
                                            checked={showMissionLetter}
                                            onCheckedChange={(checked) => setShowMissionLetter(checked as boolean)}
                                        />
                                        <Label
                                            htmlFor="show-mletter"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-200"
                                        >
                                            미션글자 표시
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions Card */}
                            <Card className="dark:bg-gray-800 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-white">
                                        <Play className="h-5 w-5 dark:text-gray-400" />
                                        실행
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        onClick={extractWords}
                                        className="w-full"
                                        disabled={!fileContent || loading}
                                    >
                                        <Play className="w-4 h-4 mr-2" />
                                        {loading ? "처리중..." : "단어 추출"}
                                    </Button>

                                    <Button
                                        onClick={downloadExtractedWords}
                                        variant="secondary"
                                        className="w-full"
                                        disabled={extractedWords.length === 0}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        결과 다운로드
                                        {extractedWords.length > 0 && (
                                            <Badge variant="default" className="ml-2">
                                                {extractedWords.length}
                                            </Badge>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Status Card */}
                            {fileContent && (
                                <Card className="dark:bg-gray-800 dark:border-gray-700">
                                    <CardContent className="pt-6">
                                        <div className="text-center space-y-2">
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {fileContent.split('\n').length}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                파일의 총 단어 수
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {errorModalView && (
                <ErrorModal
                    onClose={() => seterrorModalView(null)}
                    error={errorModalView}
                />
            )}

            {/* loading */}
            {loading && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-4">
                        <Spinner />
                        <span className="text-gray-900 dark:text-white">처리 중입니다...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WordExtractorApp;
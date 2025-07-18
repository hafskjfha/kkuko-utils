"use client";
import React, { useState } from "react";
import ErrorModal from "@/app/components/ErrModal";
import type { ErrorMessage } from '@/app/types/type'
import Spinner from "@/app/components/Spinner";
import FileContentDisplay from "../components/FileContentDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Badge } from "@/app/components/ui/badge";
import { Download, Play, Settings, Zap, Home } from "lucide-react";
import HelpModal from "@/app/components/HelpModal";
import Link from "next/link";

const WordExtractorApp = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [extractedWords, setExtractedWords] = useState<string[]>([]);
    const [sortChecked, setSortChecked] = useState<boolean>(true);
    const [errorModalView, seterrorModalView] = useState<ErrorMessage | null>(null);
    const [loading, setLoading] = useState(false);
    const [wordEnd, setWordEnd] = useState<string>('');

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

            if (fileContent && wordEnd) {
                const words = fileContent.split(/\s+/).filter((word) => word.endsWith(wordEnd));
                // 중복 제거
                const uniqueSet = new Set();
                const result: string[] = [];
                words.forEach(word => {
                    const cleanedWord = word.replace(/[.,!?;:()]/g, ''); // 특수문자 제거
                    if (cleanedWord && !uniqueSet.has(cleanedWord)) {
                        uniqueSet.add(cleanedWord);
                        result.push(cleanedWord);
                    }
                });
                setExtractedWords(sortChecked ? result.sort((a, b) => a.localeCompare(b, "ko")) : result);

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
            link.download = `extracted_words_${wordEnd}_목록.txt`;
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
                                    X로 끝나는 단어 추출
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    텍스트 파일에서 X로 끝나는 단어들을 추출합니다
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Link href="/manager-tool/extract">
                                <Button variant="outline" size="sm" className="dark:text-gray-200 dark:bg-gray-800 dark:border-gray-700">
                                    <Home size="sm" />
                                    도구홈
                                </Button>
                            </Link>
                            <HelpModal
                                title="X로 끝나는 단어 추출 사용법"
                                triggerText="도움말"
                                triggerClassName="border border-gray-200 dark:border-gray-700 border-1 rounded-md p-2"
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
                                            <h3 className="font-semibold">설정</h3>
                                        </div>
                                        <div className="ml-6 space-y-2">
                                            <p>원하는 끝글자를 입력합니다. (예: &quot;다&quot;, &quot;션&quot;, &quot;시리즈&quot;)</p>
                                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium dark:text-gray-200">끝글자</Label>
                                                    <Input placeholder="끝글자를 입력하세요" className="h-8" disabled />
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox disabled checked />
                                                        <Label className="text-sm dark:text-gray-200">결과 정렬</Label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">2</span>
                                            <h3 className="font-semibold">실행</h3>
                                        </div>
                                        <div className="ml-6 space-y-2">
                                            <p>실행 버튼을 누르고 기다립니다.</p>
                                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700">
                                                <Button className="w-full h-8" disabled>
                                                    <Play className="w-3 h-3 mr-2" />
                                                    단어 추출
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">3</span>
                                            <h3 className="font-semibold">결과 확인 및 다운로드</h3>
                                        </div>
                                        <div className="ml-6 space-y-2">
                                            <p>결과를 확인한 후 다운로드합니다.</p>
                                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700">
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
                                        <h3 className="font-semibold">사용 예시</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">입력:</p>
                                                <pre className="bg-gray-100 dark:bg-gray-800 dark:text-gray-200 p-3 rounded text-xs overflow-x-auto">
                                                    이름
                                                    하품
                                                    늠름
                                                    가끔
                                                    들녘
                                                </pre>
                                            </div>
                                            <div className="flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">끝글자: &quot;름&quot; 추출</div>
                                                    <div className="text-2xl dark:text-gray-300">↓</div>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">추출 결과:</p>
                                                <div className="bg-green-50 dark:bg-green-950 p-3 rounded border border-green-200 dark:border-green-700">
                                                    <div className="text-sm space-y-1 dark:text-green-200">
                                                        <div>• 이름</div>
                                                        <div>• 늠름</div>
                                                    </div>
                                                    <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                                                        총 2개 단어 추출됨
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-700">
                                        <p className="text-blue-800 dark:text-blue-200 text-sm">
                                            <strong>💡 팁:</strong> 정렬 옵션을 체크하면 결과가 가나다순으로 정렬됩니다.
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
                            resultTitle={`"${wordEnd || "?"}"로 끝나는 단어 목록`}
                        />
                    </div>

                    {/* Control Panel - 1/4 width */}
                    <div className="xl:col-span-1">
                        <div className="space-y-6">
                            <Card className="dark:bg-gray-800 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-white">
                                        <Settings className="h-5 w-5 dark:text-gray-400" />
                                        설정
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="word-end" className="dark:text-gray-200">끝글자</Label>
                                        <Input
                                            id="word-end"
                                            value={wordEnd}
                                            onChange={(e) => setWordEnd(e.target.value)}
                                            placeholder="끝글자를 입력하세요"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="sort-option"
                                            checked={sortChecked}
                                            onCheckedChange={(checked) => setSortChecked(checked as boolean)}
                                        />
                                        <Label
                                            htmlFor="sort-option"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-200"
                                        >
                                            결과 정렬
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>
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
                                        disabled={!fileContent || loading || !wordEnd}
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
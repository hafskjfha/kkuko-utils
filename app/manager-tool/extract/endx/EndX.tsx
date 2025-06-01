"use client";
import React, { useState } from "react";
import { HelpCircle, Download } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import ErrorModal from "@/app/components/ErrModal";
import FileContentDisplay from "../components/FileContentDisplay";
import type { ErrorMessage } from '@/app/types/type';

const WordExtractorApp = () => {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [extractedWords, setExtractedWords] = useState<string[]>([]);
    const [wordEnd, setWordEnd] = useState<string>('');
    const [errorModalView, setErrorModalView] = useState<ErrorMessage | null>(null);

    // 파일 업로드 처리
    const handleFileUpload = (content: string) => {
        setFileContent(content);
        // 기존 추출 결과 초기화
        setExtractedWords([]);
    };

    // 단어 추출 함수
    const extractWords = () => {
        try {
            if (fileContent && wordEnd) {
                const words = fileContent.split(/\s+/).filter((word) => word.endsWith(wordEnd));
                setExtractedWords(words);
            }
        } catch (err) {
            handleError(err);
        }
    };

    // 다운로드 처리함수
    const downloadExtractedWords = () => {
        try {
            if (extractedWords.length === 0) return;
            
            const blob = new Blob([extractedWords.join("\n")], { type: "text/plain" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `extracted_words_${wordEnd}_목록.txt`;
            link.click();
            
            // Clean up
            URL.revokeObjectURL(link.href);
        } catch (err) {
            handleError(err);
        }
    };

    // 에러 처리
    const handleError = (err: unknown) => {
        if (err instanceof Error) {
            setErrorModalView({
                ErrName: err.name,
                ErrMessage: err.message,
                ErrStackRace: err.stack,
                inputValue: null
            });
        } else {
            setErrorModalView({
                ErrName: null,
                ErrMessage: null,
                ErrStackRace: err as string,
                inputValue: null
            });
        }
    };

    // 도움말 (TODO: 추후 수정)
    const handleHelp = () => {
        window.open(
            "https://docs.google.com/document/d/1vbo0Y_kUKhCh_FUCBbpu-5BMXLBOOpvgxiJ_Hirvrt4/edit?tab=t.0#heading=h.md5ray6sao6w", 
            "_blank", 
            "noopener,noreferrer"
        );
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">단어 추출기</h1>
                        <Button onClick={handleHelp} variant="outline" size="sm">
                            <HelpCircle className="h-4 w-4 mr-2" />
                            도움말
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left section - File Content Display */}
                    <div className="md:w-4/5 w-full">
                        <FileContentDisplay
                            setFileContent={setFileContent}
                            fileContent={fileContent}
                            onFileUpload={handleFileUpload}
                            onError={handleError}
                            resultData={extractedWords}
                            resultTitle={`"${wordEnd || "?"}"로 끝나는 단어 목록`}
                        />
                    </div>

                    {/* Right section - Controls */}
                    <div className="md:w-1/5 w-full">
                        <Card className="h-fit">
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="word-end">끝글자 입력</Label>
                                    <Input
                                        id="word-end"
                                        value={wordEnd}
                                        onChange={(e) => setWordEnd(e.target.value)}
                                        placeholder="끝글자를 입력하세요"
                                        disabled={!fileContent}
                                    />
                                </div>
                                
                                <Button 
                                    onClick={extractWords}
                                    disabled={!fileContent || !wordEnd}
                                    className="w-full"
                                >
                                    추출
                                </Button>
                                
                                <Button 
                                    onClick={downloadExtractedWords}
                                    disabled={extractedWords.length === 0}
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    다운로드
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Error Modal */}
            {errorModalView && (
                <ErrorModal 
                    onClose={() => setErrorModalView(null)} 
                    error={errorModalView}
                />
            )}
        </div>
    );
};

export default WordExtractorApp;
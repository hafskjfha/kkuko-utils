"use client";
import React, { useState, useRef } from "react";
import ErrorModal from "@/app/components/ErrModal";
import type { ErrorMessage } from '@/app/types/type';
import Spinner from "@/app/components/Spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Badge } from "@/app/components/ui/badge";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { 
    Download, 
    HelpCircle, 
    Settings, 
    Merge, 
    Upload, 
    FileText, 
    List,
    Zap
} from "lucide-react";

const WordExtractorApp = () => {
    const [fileContent1, setFileContent1] = useState("");
    const [fileContent2, setFileContent2] = useState("");
    const [mergedContent, setMergedContent] = useState("");
    const [sortChecked, setSortChecked] = useState<boolean>(true);
    const [errorModalView, seterrorModalView] = useState<ErrorMessage | null>(null);
    const [loading, setLoading] = useState(false);
    const [file1, setFile1] = useState<File | null>(null);
    const [file2, setFile2] = useState<File | null>(null);

    const fileInputRef1 = useRef<HTMLInputElement>(null);
    const fileInputRef2 = useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, fileNumber: number) => {
        const file = event.target.files?.[0];
        if (file) {
            if (fileNumber === 1) {
                setFile1(file);
            } else {
                setFile2(file);
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                if (fileNumber === 1) {
                    const r = e.target?.result as string
                    setFileContent1(r.replace(/\r/g, "").replace(/\s+$/, "").replaceAll("\u200b",""));
                } else {
                    const rr = e.target?.result as string
                    setFileContent2(rr.replace(/\r/g, "").replace(/\s+$/, "").replaceAll("\u200b",""));
                }
                setLoading(false);
            };
            
            reader.onerror = (event) => {
                const error = event.target?.error;
                try{
                    if(error){
                        const errorObj = new Error(`FileReader Error: ${error.message}`);
                        errorObj.name = error.name;
                        throw errorObj;
                    }
                }catch(err){
                    handleError(err);
                }
                setLoading(false);
            };
            setLoading(true);
            reader.readAsText(file);
        }
    };

    const handleError = (err: unknown) => {
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
    };

    const mergeFiles = () => {
        try{    
            if (fileContent1 && fileContent2) {
                // 합치고 set으로 중복 제거
                const mergeResult = [...new Set([...fileContent1.split('\n'),...fileContent2.split('\n')])]
                setMergedContent(sortChecked ? mergeResult.sort((a,b)=>a.localeCompare(b)).join('\n') : mergeResult.join('\n'));
            }
        }catch(err){
            handleError(err);
        }
    };

    const downloadMergedContent = () => {
        try{    
            if (mergedContent) {
                const blob = new Blob([mergedContent], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "merged_file.txt";
                a.click();
                URL.revokeObjectURL(url);
            }
        }catch(err){
            handleError(err);
        }
    };

    const handleHelp = () => {
        window.open("https://docs.google.com/document/d/1vbo0Y_kUKhCh_FUCBbpu-5BMXLBOOpvgxiJ_Hirvrt4/edit?tab=t.0#heading=h.4sz3wbmpl386", "_blank", "noopener,noreferrer");
    }

    const resetFile = (fileNumber: number) => {
        if (fileNumber === 1) {
            setFile1(null);
            setFileContent1("");
            if (fileInputRef1.current) {
                fileInputRef1.current.value = "";
            }
        } else {
            setFile2(null);
            setFileContent2("");
            if (fileInputRef2.current) {
                fileInputRef2.current.value = "";
            }
        }
    };

    const resetAll = () => {
        resetFile(1);
        resetFile(2);
        setMergedContent("");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    텍스트 파일 합성
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    두 개의 텍스트 파일을 병합합니다. 중복은 제거됩니다
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={handleHelp}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <HelpCircle className="w-4 h-4" />
                            도움말
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* File Content Display - 3/4 width */}
                    <div className="xl:col-span-3">
                        <div className="space-y-6">
                            {/* File Upload Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Upload className="h-5 w-5" />
                                        파일 업로드
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* File 1 Upload */}
                                    <div className="space-y-2">
                                        <Label htmlFor="file-upload-1">첫 번째 텍스트 파일</Label>
                                        <Input
                                            id="file-upload-1"
                                            ref={fileInputRef1}
                                            type="file"
                                            accept=".txt"
                                            onChange={(e) => handleFileUpload(e, 1)}
                                            disabled={loading}
                                        />
                                        {file1 && (
                                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    <span className="text-sm font-medium">{file1.name}</span>
                                                    <Badge variant="secondary">{(file1.size / 1024).toFixed(1)} KB</Badge>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => resetFile(1)}>
                                                    초기화
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* File 2 Upload */}
                                    <div className="space-y-2">
                                        <Label htmlFor="file-upload-2">두 번째 텍스트 파일</Label>
                                        <Input
                                            id="file-upload-2"
                                            ref={fileInputRef2}
                                            type="file"
                                            accept=".txt"
                                            onChange={(e) => handleFileUpload(e, 2)}
                                            disabled={loading}
                                        />
                                        {file2 && (
                                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    <span className="text-sm font-medium">{file2.name}</span>
                                                    <Badge variant="secondary">{(file2.size / 1024).toFixed(1)} KB</Badge>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => resetFile(2)}>
                                                    초기화
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {(file1 || file2) && (
                                        <Button variant="outline" onClick={resetAll} className="w-full">
                                            모든 파일 초기화
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Content Display Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* File 1 Content */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            첫 번째 파일 내용
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="h-[400px] w-full border rounded-md p-4">
                                            {loading ? (
                                                <div className="flex items-center justify-center h-full">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                </div>
                                            ) : (
                                                <pre className="text-sm whitespace-pre-wrap">
                                                    {fileContent1 || "파일이 아직 업로드되지 않았습니다."}
                                                </pre>
                                            )}
                                        </ScrollArea>
                                    </CardContent>
                                </Card>

                                {/* File 2 Content */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            두 번째 파일 내용
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="h-[400px] w-full border rounded-md p-4">
                                            {loading ? (
                                                <div className="flex items-center justify-center h-full">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                </div>
                                            ) : (
                                                <pre className="text-sm whitespace-pre-wrap">
                                                    {fileContent2 || "파일이 아직 업로드되지 않았습니다."}
                                                </pre>
                                            )}
                                        </ScrollArea>
                                    </CardContent>
                                </Card>

                                {/* Merged Content */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <List className="h-5 w-5" />
                                            병합된 파일 내용
                                            {mergedContent && (
                                                <Badge variant="default" className="ml-auto">
                                                    {mergedContent.split('\n').length}개
                                                </Badge>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="h-[400px] w-full border rounded-md p-4">
                                            <pre className="text-sm whitespace-pre-wrap">
                                                {mergedContent || "파일이 아직 병합되지 않았습니다."}
                                            </pre>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* Control Panel - 1/4 width */}
                    <div className="xl:col-span-1">
                        <div className="space-y-6">
                            {/* Settings Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="h-5 w-5" />
                                        설정
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="sort-option"
                                            checked={sortChecked}
                                            onCheckedChange={(checked) => setSortChecked(checked as boolean)}
                                        />
                                        <Label
                                            htmlFor="sort-option"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            결과 정렬
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Merge className="h-5 w-5" />
                                        실행
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        onClick={mergeFiles}
                                        className="w-full"
                                        disabled={!fileContent1 || !fileContent2 || loading}
                                    >
                                        <Merge className="w-4 h-4 mr-2" />
                                        {loading ? "처리중..." : "파일 병합"}
                                    </Button>

                                    <Button
                                        onClick={downloadMergedContent}
                                        variant="secondary"
                                        className="w-full"
                                        disabled={!mergedContent}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        병합된 파일 다운로드
                                        {mergedContent && (
                                            <Badge variant="default" className="ml-2">
                                                {mergedContent.split('\n').length}
                                            </Badge>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Status Cards */}
                            {fileContent1 && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center space-y-2">
                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {fileContent1.split('\n').length}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                첫 번째 파일의 라인 수
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {fileContent2 && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center space-y-2">
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {fileContent2.split('\n').length}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                두 번째 파일의 라인 수
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
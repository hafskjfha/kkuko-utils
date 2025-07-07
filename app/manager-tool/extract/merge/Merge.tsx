"use client";
import React, { useState, useRef, useMemo, useCallback } from "react";
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
    Settings, 
    Merge, 
    Upload, 
    FileText, 
    List,
    Zap,
    Search,
    Home
} from "lucide-react";
import Link from "next/link";
import HelpModal from "@/app/components/HelpModal";

// 가상화된 텍스트 뷰어 컴포넌트
const VirtualizedTextViewer = React.memo(({ 
    content, 
    placeholder = "내용이 없습니다.",
    searchable = false,
    height = "h-[400px]",
    ...rest
}: { 
    content: string; 
    placeholder?: string;
    searchable?: boolean;
    height?: string;
    [key: string]: unknown;
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 100 });
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // 검색 기능이 있을 때 필터링된 라인들
    const filteredLines = useMemo(() => {
        if (!content) return [];
        const lines = content.split('\n');
        
        if (!searchTerm.trim()) return lines;
        
        const searchLower = searchTerm.toLowerCase();
        return lines.filter(line => 
            line.toLowerCase().includes(searchLower)
        );
    }, [content, searchTerm]);

    // 현재 보여줄 라인들 (가상화)
    const visibleLines = useMemo(() => {
        return filteredLines.slice(visibleRange.start, visibleRange.end);
    }, [filteredLines, visibleRange]);

    // 스크롤 핸들러 - 가상화 범위 업데이트
    const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
        const target = event.target as HTMLDivElement;
        const scrollTop = target.scrollTop;
        const itemHeight = 20; // 대략적인 라인 높이
        const containerHeight = target.clientHeight;
        
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(
            startIndex + Math.ceil(containerHeight / itemHeight) + 50, // 버퍼 추가
            filteredLines.length
        );
        
        setVisibleRange({ start: Math.max(0, startIndex - 25), end: endIndex });
    }, [filteredLines.length]);

    // 대용량 텍스트인지 확인 (5천 줄 이상)
    const isLargeContent = filteredLines.length > 5000;

    if (!content) {
        return (
            <div className={`flex items-center justify-center ${height} text-muted-foreground`} {...rest}>
                {placeholder}
            </div>
        );
    }

    return (
        <div className="space-y-3" {...rest}>
            {searchable && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="내용 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 text-sm"
                    />
                    {searchTerm && (
                        <Badge variant="secondary" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs">
                            {filteredLines.length}줄
                        </Badge>
                    )}
                </div>
            )}
            
            <ScrollArea 
                className={`${height} w-full border rounded-md`}
                onScrollCapture={isLargeContent ? handleScroll : undefined}
                ref={scrollAreaRef}
            >
                <div className="p-4">
                    {isLargeContent ? (
                        // 대용량 텍스트 - 가상화 적용
                        <div 
                            style={{ 
                                height: `${filteredLines.length * 20}px`,
                                position: 'relative'
                            }}
                        >
                            <div 
                                style={{
                                    position: 'absolute',
                                    top: `${visibleRange.start * 20}px`,
                                    width: '100%'
                                }}
                            >
                                <pre className="text-sm whitespace-pre-wrap break-words leading-5">
                                    {visibleLines.join('\n')}
                                </pre>
                            </div>
                        </div>
                    ) : (
                        // 일반 크기 텍스트 - 전체 렌더링
                        <pre className="text-sm whitespace-pre-wrap break-words">
                            {filteredLines.join('\n')}
                        </pre>
                    )}
                </div>
            </ScrollArea>
            
            {isLargeContent && (
                <div className="text-xs text-muted-foreground text-center">
                    대용량 파일 - 가상화 모드 ({filteredLines.length.toLocaleString()}줄)
                </div>
            )}
        </div>
    );
});

VirtualizedTextViewer.displayName = 'VirtualizedTextViewer';

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

    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>, fileNumber: number) => {
        const file = event.target.files?.[0];
        if (file) {
            if (fileNumber === 1) {
                setFile1(file);
            } else {
                setFile2(file);
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const cleanContent = content.replace(/\r/g, "").replace(/\s+$/, "").replaceAll("\u200b","");
                    
                    if (fileNumber === 1) {
                        setFileContent1(cleanContent);
                    } else {
                        setFileContent2(cleanContent);
                    }
                } catch (err) {
                    handleError(err);
                } finally {
                    setLoading(false);
                }
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
    }, []);

    const handleError = useCallback((err: unknown) => {
        if (err instanceof Error) {
            console.error(err);
            seterrorModalView({
                ErrName: err.name,
                ErrMessage: err.message,
                ErrStackRace: err.stack,
                inputValue: null
            });
        } else {
            console.error(err);
            seterrorModalView({
                ErrName: null,
                ErrMessage: null,
                ErrStackRace: err as string,
                inputValue: null
            });
        }
    }, []);

    const mergeFiles = useCallback(async() => {
        try{    
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1))
            if (fileContent1 && fileContent2) {
                // 합치고 set으로 중복 제거
                const mergeResult = [...new Set([...fileContent1.split('\n'),...fileContent2.split('\n')])];
                setMergedContent(sortChecked ? mergeResult.sort((a,b)=>a.localeCompare(b)).join('\n') : mergeResult.join('\n'));
            }
        }catch(err){
            handleError(err);
        }finally{
            setLoading(false);
        }
    }, [fileContent1, fileContent2, sortChecked, handleError]);

    const downloadMergedContent = useCallback(() => {
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
    }, [mergedContent, handleError]);

    const resetFile = useCallback((fileNumber: number) => {
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
    }, []);

    const resetAll = useCallback(() => {
        resetFile(1);
        resetFile(2);
        setMergedContent("");
    }, [resetFile]);

    // 파일 라인 수 계산 (메모화)
    const file1LineCount = useMemo(() => {
        return fileContent1 ? fileContent1.split('\n').length : 0;
    }, [fileContent1]);

    const file2LineCount = useMemo(() => {
        return fileContent2 ? fileContent2.split('\n').length : 0;
    }, [fileContent2]);

    const mergedLineCount = useMemo(() => {
        return mergedContent ? mergedContent.split('\n').length : 0;
    }, [mergedContent]);

    // 검색 가능 여부 결정 (1000줄 이상일 때 검색 활성화)
    const shouldEnableSearch1 = file1LineCount > 1000;
    const shouldEnableSearch2 = file2LineCount > 1000;
    const shouldEnableSearchMerged = mergedLineCount > 1000;

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
                        <div className="flex items-center space-x-2">
                            <Link href="/manager-tool/extract">
                                <Button variant="outline" size="sm">
                                    <Home size="sm" />
                                    도구홈
                                </Button>
                            </Link>
                            <HelpModal
                                title="텍스트 파일 합성 사용법"
                                triggerText="도움말"
                                triggerClassName="border border-gray-200 border-1 rounded-md p-2"
                            >
                                <div className="space-y-6">
                                    {/* Step 0 */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">0</span>
                                            <h3 className="font-semibold">텍스트 파일을 2개 업로드 합니다.</h3>
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
                                                    <Merge className="w-3 h-3 mr-2" />
                                                        파일 병합
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
                                        <h3 className="font-semibold">사용 예시</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-600 mb-2">입력:</p>
                                                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                                                    이름 하품
                                                </pre>
                                                <div className="flex items-center justify-center">
                                                    <div className="text-center">
                                                        <div className="text-2xl">+</div>
                                                    </div>
                                                </div>
                                                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                                                    고객 이름 사격
                                                </pre>
                                            </div>
                                            <div className="flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="text-sm text-gray-500">병합</div>
                                                    <div className="text-2xl">↓</div>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-2">병합 결과:</p>
                                                <div className="bg-green-50 p-3 rounded border border-green-200">
                                                    <div className="text-sm space-y-1">
                                                        <div>• 고객</div>
                                                        <div>• 사격</div>
                                                        <div>• 이름</div>
                                                        <div>• 하품</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-blue-800 text-sm">
                                            <strong>💡 팁:</strong> 정렬 옵션을 체크하면 결과가 가나다순으로 정렬됩니다.
                                        </p>
                                    </div>
                                    <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-blue-800 text-sm">
                                            <strong>💡 팁:</strong> 중복된 단어는 1개만 남깁니다.
                                        </p>
                                    </div>
                                </div>
                            </HelpModal>
                        </div>
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
                                            {file1LineCount > 0 && (
                                                <Badge variant="outline" className="ml-auto">
                                                    {file1LineCount.toLocaleString()}줄
                                                </Badge>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {loading ? (
                                            <div className="flex items-center justify-center h-[400px]">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                            </div>
                                        ) : (
                                            <VirtualizedTextViewer
                                                data-testid="file-content-1"
                                                content={fileContent1}
                                                placeholder="파일이 아직 업로드되지 않았습니다."
                                                searchable={shouldEnableSearch1}
                                            />
                                        )}
                                    </CardContent>
                                </Card>

                                {/* File 2 Content */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            두 번째 파일 내용
                                            {file2LineCount > 0 && (
                                                <Badge variant="outline" className="ml-auto">
                                                    {file2LineCount.toLocaleString()}줄
                                                </Badge>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {loading ? (
                                            <div className="flex items-center justify-center h-[400px]">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                            </div>
                                        ) : (
                                            <VirtualizedTextViewer
                                                data-testid="file-content-2"
                                                content={fileContent2}
                                                placeholder="파일이 아직 업로드되지 않았습니다."
                                                searchable={shouldEnableSearch2}
                                            />
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Merged Content */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <List className="h-5 w-5" />
                                            병합된 파일 내용
                                            {mergedLineCount > 0 && (
                                                <Badge variant="default" className="ml-auto">
                                                    {mergedLineCount}개
                                                </Badge>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <VirtualizedTextViewer
                                            data-testid="merged-content"
                                            content={mergedContent}
                                            placeholder="파일이 아직 병합되지 않았습니다."
                                            searchable={shouldEnableSearchMerged}
                                        />
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
                                        {mergedLineCount > 0 && (
                                            <Badge variant="default" className="ml-2">
                                                {mergedLineCount}
                                            </Badge>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Status Cards */}
                            {file1LineCount > 0 && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center space-y-2">
                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {file1LineCount.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                첫 번째 파일의 라인 수
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {file2LineCount > 0 && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center space-y-2">
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {file2LineCount.toLocaleString()}
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
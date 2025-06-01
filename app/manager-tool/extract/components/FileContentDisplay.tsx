"use client";
import React, { useState, useRef } from "react";
import { Upload, FileText, List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

export interface FileContentDisplayProps {
    setFileContent: React.Dispatch<React.SetStateAction<string | null>>;
    setFile: React.Dispatch<React.SetStateAction<File | null>>
    file: File | null;
    fileContent: string | null;
    onFileUpload?: (content: string) => void;
    onError?: (error: unknown) => void;
    className?: string;
    resultData?: string[];
    resultTitle?: string;
}

const FileContentDisplay = ({
    setFileContent,
    setFile,
    file,
    fileContent,
    onFileUpload,
    onError,
    className = "",
    resultData = [],
    resultTitle = "처리 결과"
}: FileContentDisplayProps) => {
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 파일업로드 처리
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const content = event.target?.result as string;
                    const cleanContent = content.replace(/\r/g, "").replace(/\s+$/, "").replaceAll("\u200b", "");
                    setFileContent(cleanContent);
                    onFileUpload?.(cleanContent);
                } catch (err) {
                    onError?.(err);
                } finally {
                    setLoading(false);
                }
            };

            reader.onerror = (event) => {
                const error = event.target?.error;
                onError?.(error);
                setLoading(false);
            };

            setLoading(true);
            reader.readAsText(selectedFile);
        }
    };

    // 모두 삭제
    const resetAll = () => {
        setFile(null);
        setFileContent(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* File Upload Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        파일 업로드
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="file-upload">텍스트 파일 선택</Label>
                        <Input
                            id="file-upload"
                            ref={fileInputRef}
                            type="file"
                            accept=".txt"
                            onChange={handleFileUpload}
                            disabled={loading}
                        />
                    </div>

                    {file && (
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm font-medium">{file.name}</span>
                                <Badge variant="secondary">{(file.size / 1024).toFixed(1)} KB</Badge>
                            </div>
                            <Button variant="outline" size="sm" onClick={resetAll}>
                                초기화
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Content Display Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* File Content */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            업로드된 파일 내용
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-80">
                        <ScrollArea className="h-[400px] w-full border rounded-md p-4">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : (
                                <pre className="text-sm whitespace-pre-wrap">
                                    {fileContent || "아직 파일이 업로드되지 않았습니다."}
                                </pre>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Results Display */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <List className="h-5 w-5" />
                            {resultTitle}
                            {resultData.length > 0 && (
                                <Badge variant="default" className="ml-auto">
                                    {resultData.length}개
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px] w-full border rounded-md p-4">
                            <pre className="text-sm whitespace-pre-wrap">
                                {resultData.length > 0
                                    ? resultData.join("\n")
                                    : "아직 처리 결과가 없습니다."
                                }
                            </pre>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default FileContentDisplay;
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Button } from "@/app/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";

interface DocsLogsProps {
    id: number;
    name: string;
    Logs: {
        id: number;
        word: string;
        user: string | undefined;
        date: string;
        type: "add" | "delete";
    }[];
}

const DocsLogs = ({ id, name, Logs }: DocsLogsProps) => {
    const [page, setPage] = useState(1);
    const [filterType, setFilterType] = useState<string>("all");
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const convertToLocalTime = (date: string) => {
        const dateObj = new Date(date);
        return dateObj.toLocaleString(undefined, { timeZone: userTimeZone });
    };

    // 페이지네이션 설정
    const itemsPerPage = 30;
    
    // 필터링 적용
    const filteredLogs = Logs.filter((log) => {
        return filterType === "all" || log.type === filterType;
    });
    
    const startIdx = (page - 1) * itemsPerPage;
    const currentLogs = filteredLogs.slice(startIdx, startIdx + itemsPerPage);
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

    return (
        <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
            {/* 문서 제목 섹션 */}
            <div className="mb-6">
                <Link href={`/words-docs/${id}`}>
                    <h1 className="text-3xl font-bold text-gray-800 hover:underline">
                        {name} - 로그
                    </h1>
                </Link>
            </div>

            {/* 필터링 섹션 */}
            <div className="flex gap-4 mb-4">
                <Select value={filterType} onValueChange={(v) => { setPage(1); setFilterType(v); }}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="요청 타입 선택" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">전체 타입</SelectItem>
                        <SelectItem value="add">추가 요청</SelectItem>
                        <SelectItem value="delete">삭제 요청</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* 로그 테이블 */}
            <div className="bg-white rounded-md shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>생성 시각</TableHead>
                            <TableHead>단어</TableHead>
                            <TableHead>사용자</TableHead>
                            <TableHead>요청 타입</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentLogs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell>{log.id}</TableCell>
                                <TableCell>{convertToLocalTime(log.date)}</TableCell>
                                <TableCell>
                                    {log.type === "add" ? (
                                        <Link
                                            href={`/word/search/${log.word}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {log.word}
                                        </Link>
                                    ) : (
                                        log.word
                                    )}
                                </TableCell>
                                <TableCell>
                                    {log.user ? (
                                        <Link
                                            className="text-blue-600 hover:underline"
                                            href={`/profile?username=${log.user}`}
                                        >
                                            {log.user}
                                        </Link>
                                    ) : (
                                        "알수없음"
                                    )}
                                </TableCell>
                                <TableCell>
                                    {log.type === "add" ? (
                                        <span className="text-blue-600">추가</span>
                                    ) : (
                                        <span className="text-orange-600">삭제</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* 페이지네이션 */}
            <div className="flex justify-between items-center mt-6">
                <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                >
                    이전
                </Button>

                <span className="text-gray-600">
                    {page} / {totalPages} 페이지
                </span>

                <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                >
                    다음
                </Button>
            </div>
        </div>
    );
};

export default DocsLogs;
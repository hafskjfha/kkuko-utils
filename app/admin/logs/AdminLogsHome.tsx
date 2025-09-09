'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SCM } from "@/app/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/app/components/ui/pagination";
import { ArrowLeft, Filter, Download, Trash2 } from "lucide-react";
import { PostgrestError } from '@supabase/supabase-js';
import ErrorModal from '@/app/components/ErrModal';

type ErrorMessage = {
    ErrName: string;
    ErrMessage: string;
    ErrStackRace: string;
    inputValue: string;
}

type WordLog = {
    id: number;
    word: string;
    processed_by: string | null;
    make_by: string | null;
    state: "approved" | "rejected" | "pending";
    r_type: "add" | "delete";
    created_at: string;
    make_by_user: { nickname: string } | null;
    processed_by_user: { nickname: string | null } | null;
}

type DocsLog = {
    id: number;
    docs_id: number;
    word: string;
    add_by: string | null;
    type: "add" | "delete";
    date: string;
    docs: {
        id: number;
        name: string;
        typez: "letter" | "theme" | "ect";
        duem: boolean;
        maker: string | null;
        created_at: string;
        last_update: string;
        views: number;
        is_hidden: boolean;
    };
    users: { nickname: string } | null;
}

type Docs = {
    id: number;
    name: string;
    typez: "letter" | "theme" | "ect";
    duem: boolean;
    maker: string | null;
    created_at: string;
    last_update: string;
    views: number;
    is_hidden: boolean;
    users: {
        id: string;
        nickname: string;
        contribution: number;
        month_contribution: number;
        role: "r1" | "r2" | "r3" | "r4" | "admin";
    } | null;
}

interface AdminLogsHomeProps {
    initialWordLogs: WordLog[];
    initialDocsLogs: DocsLog[];
    allDocs: Docs[];
}

export default function AdminLogsHome({ initialWordLogs, initialDocsLogs, allDocs }: AdminLogsHomeProps) {
    const [selectedTab, setSelectedTab] = useState<string>("word_logs");
    const [selectedWordLogs, setSelectedWordLogs] = useState<Set<number>>(new Set());
    const [selectedDocsLogs, setSelectedDocsLogs] = useState<Set<number>>(new Set());
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [allSelected, setAllSelected] = useState<boolean>(false);
    const [errorModalView, setErrorModalView] = useState<ErrorMessage | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    
    // 필터 상태
    const [wordLogState, setWordLogState] = useState<"all" | "approved" | "rejected" | "pending">("all");
    const [wordLogType, setWordLogType] = useState<"all" | "add" | "delete">("all");
    const [docsLogType, setDocsLogType] = useState<"all" | "add" | "delete">("all");
    const [selectedDocsName, setSelectedDocsName] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("");
    
    // 로그 데이터 상태
    const [wordLogs, setWordLogs] = useState<WordLog[]>(initialWordLogs);
    const [docsLogs, setDocsLogs] = useState<DocsLog[]>(initialDocsLogs);
    
    const PAGE_SIZE = 30;

    // 현재 표시할 로그들
    const currentLogs = selectedTab === "word_logs" ? wordLogs : docsLogs;
    const totalPages = Math.ceil(currentLogs.length / PAGE_SIZE);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const currentPageLogs = currentLogs.slice(startIndex, startIndex + PAGE_SIZE);

    // 전체 선택 토글
    const toggleSelectAll = () => {
        if (selectedTab === "word_logs") {
            if (allSelected) {
                setSelectedWordLogs(new Set());
                setAllSelected(false);
            } else {
                const newSelected = new Set<number>();
                (currentPageLogs as WordLog[]).forEach(log => newSelected.add(log.id));
                setSelectedWordLogs(newSelected);
                setAllSelected(true);
            }
        } else {
            if (allSelected) {
                setSelectedDocsLogs(new Set());
                setAllSelected(false);
            } else {
                const newSelected = new Set<number>();
                (currentPageLogs as DocsLog[]).forEach(log => newSelected.add(log.id));
                setSelectedDocsLogs(newSelected);
                setAllSelected(true);
            }
        }
    };

    // 개별 로그 선택 토글
    const toggleLog = (id: number) => {
        if (selectedTab === "word_logs") {
            const newSelected = new Set(selectedWordLogs);
            if (newSelected.has(id)) {
                newSelected.delete(id);
                setAllSelected(false);
            } else {
                newSelected.add(id);
                if (newSelected.size === currentPageLogs.length) {
                    setAllSelected(true);
                }
            }
            setSelectedWordLogs(newSelected);
        } else {
            const newSelected = new Set(selectedDocsLogs);
            if (newSelected.has(id)) {
                newSelected.delete(id);
                setAllSelected(false);
            } else {
                newSelected.add(id);
                if (newSelected.size === currentPageLogs.length) {
                    setAllSelected(true);
                }
            }
            setSelectedDocsLogs(newSelected);
        }
    };

    const makeError = (error: PostgrestError) => {
        setErrorModalView({
            ErrName: error.name,
            ErrMessage: error.message,
            ErrStackRace: error.code,
            inputValue: ""
        });
    }

    // 로그 데이터 새로고침
    const refreshLogs = async () => {
        setLoading(true);
        try {
            if (selectedTab === "word_logs") {
                const { data, error } = await SCM.get().logsByFillter({ 
                    filterState: wordLogState, 
                    filterType: wordLogType, 
                    from: 0, 
                    to: 999 
                });
                if (error) {
                    makeError(error);
                } else {
                    setWordLogs(data || []);
                }
            } else {
                const { data, error } = await SCM.get().docsLogsByFilter({ 
                    docsName: selectedDocsName !== "all" ? selectedDocsName : undefined,
                    logType: docsLogType, 
                    from: 0, 
                    to: 999 
                });
                if (error) {
                    makeError(error);
                } else {
                    setDocsLogs(data || []);
                }
            }
        } catch (err) {
            console.error("로그 새로고침 중 오류:", err);
        } finally {
            setLoading(false);
        }
    };

    // 선택한 로그 삭제
    const deleteSelectedLogs = async () => {
        if (selectedTab === "word_logs") {
            if (selectedWordLogs.size === 0) {
                alert("선택된 로그가 없습니다.");
                return;
            }
            
            const { error } = await SCM.delete().logsByIds(Array.from(selectedWordLogs));
            if (error) {
                makeError(error);
            } else {
                setSelectedWordLogs(new Set());
                setAllSelected(false);
                await refreshLogs();
            }
        } else {
            if (selectedDocsLogs.size === 0) {
                alert("선택된 로그가 없습니다.");
                return;
            }
            
            const { error } = await SCM.delete().docsLogsByIds(Array.from(selectedDocsLogs));
            if (error) {
                makeError(error);
            } else {
                setSelectedDocsLogs(new Set());
                setAllSelected(false);
                await refreshLogs();
            }
        }
    };

    // 로그 다운로드
    const downloadLogs = () => {
        const logs = selectedTab === "word_logs" ? wordLogs : docsLogs;
        const lastUpdateDate = new Date();
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const localTime = lastUpdateDate.toLocaleString(undefined, { timeZone: userTimeZone });

        let content = "";
        if (selectedTab === "word_logs") {
            content = (logs as WordLog[]).map(log => 
                `${log.word}\t${log.state}\t${log.r_type}\t${log.created_at}\t${log.make_by_user?.nickname || 'N/A'}\t${log.processed_by_user?.nickname || 'N/A'}`
            ).join('\n');
            content = `단어\t상태\t타입\t처리일시\t요청자\t처리자\n${content}`;
        } else {
            content = (logs as DocsLog[]).map(log => 
                `${log.word}\t${log.docs.name}\t${log.type}\t${log.date}\t${log.users?.nickname || 'N/A'}`
            ).join('\n');
            content = `단어\t문서명\t타입\t처리일시\t처리자\n${content}`;
        }

        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedTab === "word_logs" ? "단어로그" : "문서로그"}(${localTime}).txt`;
        a.click();

        URL.revokeObjectURL(url);
    };

    // 필터 변경시 로그 새로고침
    useEffect(() => {
        refreshLogs();
    }, [wordLogState, wordLogType, docsLogType, selectedDocsName]);

    // 페이지 변경시 선택 상태 초기화
    useEffect(() => {
        setSelectedWordLogs(new Set());
        setSelectedDocsLogs(new Set());
        setAllSelected(false);
    }, [currentPage, selectedTab]);

    // 날짜 포맷 함수
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // 상태 뱃지 렌더링
    const renderStateBadge = (state: string) => {
        switch (state) {
            case 'approved':
                return <Badge className="bg-green-500">승인</Badge>;
            case 'rejected':
                return <Badge className="bg-red-500">거절</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-500">대기</Badge>;
            default:
                return <Badge className="bg-gray-500">{state}</Badge>;
        }
    };

    // 타입 뱃지 렌더링
    const renderTypeBadge = (type: string) => {
        switch (type) {
            case 'add':
                return <Badge className="bg-blue-500">추가</Badge>;
            case 'delete':
                return <Badge className="bg-red-500">삭제</Badge>;
            default:
                return <Badge className="bg-gray-500">{type}</Badge>;
        }
    };

    // 주제 문서 목록 (필터링용)
    const themeDocs = allDocs.filter(doc => doc.typez === "theme");

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto py-8">
                <Link href={'/admin'} className="mb-4 flex">
                    <Button variant="outline">
                        <ArrowLeft />
                        관리자 대시보드로 이동
                    </Button>
                </Link>
                
                <Card className="w-full bg-white dark:bg-gray-800 border border-transparent dark:border-gray-700 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-gray-100">로그 관리 페이지</CardTitle>
                        <CardDescription className="dark:text-gray-300">
                            단어 로그와 문서 로그를 관리합니다.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Tabs defaultValue="word_logs" value={selectedTab} onValueChange={setSelectedTab}>
                            <TabsList className="mb-4">
                                <TabsTrigger value="word_logs">단어 로그</TabsTrigger>
                                <TabsTrigger value="docs_logs">문서 로그</TabsTrigger>
                            </TabsList>

                            {/* 필터 섹션 */}
                            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {selectedTab === "word_logs" ? (
                                        <>
                                            <div>
                                                <Label htmlFor="state-filter">상태</Label>
                                                <Select value={wordLogState} onValueChange={(value: "all" | "approved" | "rejected" | "pending") => setWordLogState(value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="상태 선택" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">전체</SelectItem>
                                                        <SelectItem value="approved">승인</SelectItem>
                                                        <SelectItem value="rejected">거절</SelectItem>
                                                        <SelectItem value="pending">대기</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="type-filter">타입</Label>
                                                <Select value={wordLogType} onValueChange={(value: "all" | "add" | "delete") => setWordLogType(value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="타입 선택" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">전체</SelectItem>
                                                        <SelectItem value="add">추가</SelectItem>
                                                        <SelectItem value="delete">삭제</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <Label htmlFor="docs-filter">문서</Label>
                                                <Select value={selectedDocsName} onValueChange={setSelectedDocsName}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="문서 선택" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">전체</SelectItem>
                                                        {themeDocs.map(doc => (
                                                            <SelectItem key={doc.id} value={doc.name}>
                                                                {doc.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="docs-type-filter">타입</Label>
                                                <Select value={docsLogType} onValueChange={(value: "all" | "add" | "delete") => setDocsLogType(value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="타입 선택" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">전체</SelectItem>
                                                        <SelectItem value="add">추가</SelectItem>
                                                        <SelectItem value="delete">삭제</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </>
                                    )}
                                    <div>
                                        <Label htmlFor="date-filter">날짜 필터</Label>
                                        <Input
                                            type="date"
                                            value={dateFilter}
                                            onChange={(e) => setDateFilter(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button onClick={refreshLogs} disabled={loading} className="w-full">
                                            <Filter className="w-4 h-4 mr-2" />
                                            {loading ? "로딩..." : "필터 적용"}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <TabsContent value={selectedTab}>
                                <div className="flex justify-end mb-4 gap-2">
                                    <Button
                                        variant="outline"
                                        className="bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800"
                                        onClick={deleteSelectedLogs}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        선택 삭제
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800"
                                        onClick={downloadLogs}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        로그 다운로드
                                    </Button>
                                </div>

                                <div className="border rounded-md dark:border-gray-700">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12">
                                                    <Checkbox
                                                        checked={allSelected}
                                                        onCheckedChange={toggleSelectAll}
                                                        aria-label="전체 선택"
                                                    />
                                                </TableHead>
                                                <TableHead className="w-16 text-gray-700 dark:text-gray-200">ID</TableHead>
                                                <TableHead className="w-36 text-gray-700 dark:text-gray-200">단어</TableHead>
                                                {selectedTab === "word_logs" ? (
                                                    <>
                                                        <TableHead className="w-24 text-gray-700 dark:text-gray-200">상태</TableHead>
                                                        <TableHead className="w-24 text-gray-700 dark:text-gray-200">타입</TableHead>
                                                        <TableHead className="w-36 text-gray-700 dark:text-gray-200">요청자</TableHead>
                                                        <TableHead className="w-36 text-gray-700 dark:text-gray-200">처리자</TableHead>
                                                    </>
                                                ) : (
                                                    <>
                                                        <TableHead className="w-36 text-gray-700 dark:text-gray-200">문서명</TableHead>
                                                        <TableHead className="w-24 text-gray-700 dark:text-gray-200">타입</TableHead>
                                                        <TableHead className="w-36 text-gray-700 dark:text-gray-200">처리자</TableHead>
                                                    </>
                                                )}
                                                <TableHead className="w-40 text-gray-700 dark:text-gray-200">처리 시간</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentPageLogs.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={selectedTab === "word_logs" ? 8 : 7} className="text-center py-4 text-gray-500 dark:text-gray-400">
                                                        로그가 없습니다.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                currentPageLogs.map((log) => (
                                                    <TableRow key={`${selectedTab}-${log.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                                                        <TableCell>
                                                            <Checkbox
                                                                checked={selectedTab === "word_logs" ? selectedWordLogs.has(log.id) : selectedDocsLogs.has(log.id)}
                                                                onCheckedChange={() => toggleLog(log.id)}
                                                                aria-label={`로그 ${log.id} 선택`}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-gray-900 dark:text-gray-100">{log.id}</TableCell>
                                                        <TableCell className="text-gray-900 dark:text-gray-100">{log.word}</TableCell>
                                                        {selectedTab === "word_logs" ? (
                                                            <>
                                                                <TableCell>{renderStateBadge((log as WordLog).state)}</TableCell>
                                                                <TableCell>{renderTypeBadge((log as WordLog).r_type)}</TableCell>
                                                                <TableCell className="text-gray-900 dark:text-gray-100">
                                                                    {(log as WordLog).make_by_user?.nickname || 'N/A'}
                                                                </TableCell>
                                                                <TableCell className="text-gray-900 dark:text-gray-100">
                                                                    {(log as WordLog).processed_by_user?.nickname || 'N/A'}
                                                                </TableCell>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <TableCell className="text-gray-900 dark:text-gray-100">
                                                                    {(log as DocsLog).docs.name}
                                                                </TableCell>
                                                                <TableCell>{renderTypeBadge((log as DocsLog).type)}</TableCell>
                                                                <TableCell className="text-gray-900 dark:text-gray-100">
                                                                    {(log as DocsLog).users?.nickname || 'N/A'}
                                                                </TableCell>
                                                            </>
                                                        )}
                                                        <TableCell className="text-gray-900 dark:text-gray-100">
                                                            {formatDate(selectedTab === "word_logs" ? (log as WordLog).created_at : (log as DocsLog).date)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>

                    <CardFooter>
                        <div className="w-full">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>

                                    {/* 페이지네이션 렌더링 - 최대 5개 버튼 표시 */}
                                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                        let pageNum: number;

                                        if (totalPages <= 5) {
                                            // 5페이지 이하면 1부터 순차적으로
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            // 현재 페이지가 앞쪽이면 1~5 표시
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            // 현재 페이지가 뒤쪽이면 마지막 5개 표시
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            // 중간이면 현재 페이지 중심으로 표시
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <PaginationItem key={`p-${pageNum}`}>
                                                <PaginationLink
                                                    isActive={currentPage === pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className="cursor-pointer"
                                                >
                                                    {pageNum}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    })}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </CardFooter>
                </Card>
                
                {errorModalView && <ErrorModal error={errorModalView} onClose={() => setErrorModalView(null)} />}
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Button } from "@/app/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { useSelector } from 'react-redux';
import { RootState } from "@/app/store/store";
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabaseClient';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import ErrorModal from "@/app/components/ErrModal";


interface LogItem {
    id: number;
    created_at: string;
    word: string;
    processed_by: string | null;
    make_by: string | null;
    state: "approved" | "rejected" | "pending";
    r_type: "add" | "delete";
    make_by_user: {
        nickname: string;
    } | null;
    processed_by_user: {
        nickname: string | null;
    } | null;

}


export default function LogPage() {
    const [page, setPage] = useState(1);
    const [filterState, setFilterState] = useState<string>("all");
    const [filterType, setFilterType] = useState<string>("all");
    const [logs, setLogs] = useState<LogItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorModalView, setErrorModalView] = useState<ErrorMessage|null>(null);
    const user = useSelector((state: RootState) => state.user);
    const router = useRouter();

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            const { data: LogsData, error: LogsDataError } = await supabase.from('logs')
                .select(`
                *,
                make_by_user:users!logs_make_by_fkey(nickname),
                processed_by_user:users!logs_processed_by_fkey(nickname)
            `)
                .order('created_at', { ascending: false });

            if (LogsDataError) {
                setErrorModalView({
                    ErrName: LogsDataError.name,
                    ErrMessage: LogsDataError.message,
                    ErrStackRace: LogsDataError.stack,
                    inputValue: "/word/logs"
                });
                return;
            } else {
                setLogs(LogsData);
            }
            setIsLoading(false);
        };

        fetchLogs();
    }, []);


    const itemsPerPage = 30;

    const filteredLogs = logs.filter((log) => {
        const stateMatch = filterState === "all" || log.state === filterState;
        const typeMatch = filterType === "all" || log.r_type === filterType;
        return stateMatch && typeMatch;
    });

    const startIdx = (page - 1) * itemsPerPage;
    const currentLogs = filteredLogs.slice(startIdx, startIdx + itemsPerPage);
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Error Modal */}
            {errorModalView && (
                <ErrorModal
                    error={errorModalView}
                    onClose={() => setErrorModalView(null)}
                />
            )}

            <h1 className="text-3xl font-bold mb-6">단어 추가/삭제 로그</h1>

            {/* 필터링 섹션 */}
            <div className="flex gap-4 mb-4">
                <Select value={filterState} onValueChange={(v) => { setPage(1); setFilterState(v); }}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">전체 상태</SelectItem>
                        <SelectItem value="approved">승인됨</SelectItem>
                        <SelectItem value="rejected">거절됨</SelectItem>
                    </SelectContent>
                </Select>

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

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-16">ID</TableHead>
                        <TableHead className="w-48">생성 시각</TableHead>
                        <TableHead className="w-[30%]">단어</TableHead>
                        <TableHead>요청자</TableHead>
                        <TableHead>처리자</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>요청 타입</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {isLoading ? (
                        Array.from({ length: 10 }).map((_, idx) => (
                            <TableRow key={idx}>
                                <TableCell><Skeleton /></TableCell>
                                <TableCell><Skeleton width={120} /></TableCell>
                                <TableCell><Skeleton width={180} /></TableCell>
                                <TableCell><Skeleton width={100} /></TableCell>
                                <TableCell><Skeleton width={100} /></TableCell>
                                <TableCell><Skeleton width={80} /></TableCell>
                                <TableCell><Skeleton width={80} /></TableCell>
                            </TableRow>
                        ))
                    ) : (
                        currentLogs.map((log) => {
                            const isMyRequest = log.make_by === user.uuid;
                            const utcCreat_at = new Date(log.created_at);
                            const localTime = utcCreat_at.toLocaleString(undefined, { timeZone: userTimeZone });

                            return (
                                <TableRow key={log.id} className={isMyRequest ? "bg-blue-50" : ""}>
                                    <TableCell>{log.id}</TableCell>
                                    <TableCell>{localTime}</TableCell>
                                    <TableCell className={log.r_type === "add" ? "text-blue-600 underline hover:cursor-pointer" : ""} onClick={() => { log.r_type === "add" && router.push(`/word/search/${log.word}`) }} >{log.word}</TableCell>
                                    <TableCell className={log.make_by_user ? `text-blue-600 underline hover:cursor-pointer` : ""} onClick={() => { log.make_by_user && router.push(`/profile?username=${log.make_by_user?.nickname}`) }} >{log.make_by_user?.nickname || "-"}</TableCell>
                                    <TableCell className={log.processed_by_user ? `text-blue-600 underline hover:cursor-pointer` : ""} onClick={() => { log.processed_by_user && router.push(`/profile?username=${log.processed_by_user?.nickname}`) }}>{log.processed_by_user?.nickname || "-"}</TableCell>
                                    <TableCell>
                                        {log.state === "approved" ? (
                                            <span className="text-green-600 font-semibold">승인</span>
                                        ) : (
                                            <span className="text-red-600 font-semibold">거절</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {log.r_type === "add" ? (
                                            <span className="text-blue-600">추가</span>
                                        ) : (
                                            <span className="text-orange-600">삭제</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    )}
                </TableBody>

            </Table>

            {/* 페이지네이션 */}
            <div className="flex justify-between items-center mt-6">
                <Button
                    variant="outline"
                    disabled={page === 1 || isLoading}
                    onClick={() => setPage((prev) => prev - 1)}
                >
                    이전
                </Button>

                <span className="text-gray-600">
                    {page} / {totalPages} 페이지
                </span>

                <Button
                    variant="outline"
                    disabled={page === totalPages || isLoading} 
                    onClick={() => setPage((prev) => prev + 1)}
                >
                    다음
                </Button>
            </div>
        </div>
    );
}

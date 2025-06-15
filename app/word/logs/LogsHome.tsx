"use client";

import { useEffect, useState, useCallback } from "react";
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

interface CacheKey {
    page: number;
    filterState: string;
    filterType: string;
}

interface CachedData {
    logs: LogItem[];
    totalCount: number;
    timestamp: number;
}

export default function LogPage() {
    const [page, setPage] = useState(1);
    const [filterState, setFilterState] = useState<string>("all");
    const [filterType, setFilterType] = useState<string>("all");
    const [logs, setLogs] = useState<LogItem[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [errorModalView, setErrorModalView] = useState<ErrorMessage | null>(null);
    
    // 캐시 저장소 (Map으로 여러 페이지 캐싱)
    const [cache, setCache] = useState<Map<string, CachedData>>(new Map());
    
    const user = useSelector((state: RootState) => state.user);
    const router = useRouter();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const itemsPerPage = 30;
    const cacheExpireTime = 5 * 60 * 1000; // 5분 캐시 유효시간

    // 캐시 키 생성
    const getCacheKey = (page: number, filterState: string, filterType: string): string => {
        return `${page}-${filterState}-${filterType}`;
    };

    // 캐시에서 데이터 가져오기
    const getCachedData = (cacheKey: string): CachedData | null => {
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < cacheExpireTime) {
            return cached;
        }
        return null;
    };

    // 캐시에 데이터 저장
    const setCachedData = (cacheKey: string, data: CachedData) => {
        setCache(prev => new Map(prev.set(cacheKey, data)));
    };

    const fetchLogs = useCallback(async (
        currentPage: number, 
        currentFilterState: "approved" | "rejected" | "pending" | "all", 
        currentFilterType: "delete" | "add" | "all",
        forceRefresh = false
    ) => {
        const cacheKey = getCacheKey(currentPage, currentFilterState, currentFilterType);
        
        // 강제 새로고침이 아니면 캐시 확인
        if (!forceRefresh) {
            const cachedData = getCachedData(cacheKey);
            if (cachedData) {
                setLogs(cachedData.logs);
                setTotalCount(cachedData.totalCount);
                setIsLoading(false);
                return;
            }
        }

        setIsLoading(true);

        try {
            // Supabase 쿼리 빌더 시작
            let query = supabase
                .from('logs')
                .select(`
                    *,
                    make_by_user:users!logs_make_by_fkey(nickname),
                    processed_by_user:users!logs_processed_by_fkey(nickname)
                `, { count: 'exact' })
                .order('created_at', { ascending: false });

            // 필터 적용
            if (currentFilterState !== "all") {
                query = query.eq('state', currentFilterState);
            }
            if (currentFilterType !== "all") {
                query = query.eq('r_type', currentFilterType);
            }

            // 페이지네이션 적용
            const from = (currentPage - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;
            query = query.range(from, to);

            const { data: LogsData, error: LogsDataError, count } = await query;

            if (LogsDataError) {
                setErrorModalView({
                    ErrName: LogsDataError.name,
                    ErrMessage: LogsDataError.message,
                    ErrStackRace: LogsDataError.stack,
                    inputValue: "/word/logs"
                });
                return;
            }

            const logsData = LogsData || [];
            const totalCountData = count || 0;

            // 캐시에 저장
            setCachedData(cacheKey, {
                logs: logsData,
                totalCount: totalCountData,
                timestamp: Date.now()
            });

            setLogs(logsData);
            setTotalCount(totalCountData);
        } catch (error) {
            console.error('로그 fetch 오류:', error);
            setErrorModalView({
                ErrName: 'Fetch Error',
                ErrMessage: '로그를 불러오는 중 오류가 발생했습니다.',
                ErrStackRace: '',
                inputValue: "/word/logs"
            });
        } finally {
            setIsLoading(false);
        }
    }, [cache, itemsPerPage]);

    // 초기 로드 및 필터/페이지 변경 시 데이터 fetch
    useEffect(() => {
        fetchLogs(page, filterState as "all" | "approved" | "rejected" | "pending", filterType as "add" | "delete" | "all");
    }, [page, filterState, filterType, fetchLogs]);

    // 필터 변경 시 첫 페이지로 이동
    const handleFilterChange = (newFilterState: string, newFilterType: string) => {
        setPage(1);
        if (newFilterState !== undefined) setFilterState(newFilterState);
        if (newFilterType !== undefined) setFilterType(newFilterType);
    };

    // 새로고침 함수
    const handleRefresh = () => {
        fetchLogs(page, filterState as "all" | "approved" | "rejected" | "pending", filterType as "add" | "delete" | "all", true);
    };

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Error Modal */}
            {errorModalView && (
                <ErrorModal
                    error={errorModalView}
                    onClose={() => setErrorModalView(null)}
                />
            )}

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">단어 추가/삭제 로그</h1>
                <Button 
                    variant="outline" 
                    onClick={handleRefresh}
                    disabled={isLoading}
                >
                    새로고침
                </Button>
            </div>

            {/* 필터링 섹션 */}
            <div className="flex gap-4 mb-4">
                <Select 
                    value={filterState} 
                    onValueChange={(v) => handleFilterChange(v, filterType)}
                >
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">전체 상태</SelectItem>
                        <SelectItem value="approved">승인됨</SelectItem>
                        <SelectItem value="rejected">거절됨</SelectItem>
                        <SelectItem value="pending">대기중</SelectItem>
                    </SelectContent>
                </Select>

                <Select 
                    value={filterType} 
                    onValueChange={(v) => handleFilterChange(filterState, v)}
                >
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="요청 타입 선택" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">전체 타입</SelectItem>
                        <SelectItem value="add">추가 요청</SelectItem>
                        <SelectItem value="delete">삭제 요청</SelectItem>
                    </SelectContent>
                </Select>

                {/* 현재 결과 수 표시 */}
                <div className="flex items-center text-sm text-gray-500">
                    총 {totalCount}개 결과
                </div>
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
                        Array.from({ length: 30 }).map((_, idx) => (
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
                    ) : logs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                조건에 맞는 로그가 없습니다.
                            </TableCell>
                        </TableRow>
                    ) : (
                        logs.map((log) => {
                            const isMyRequest = log.make_by === user.uuid;
                            const utcCreat_at = new Date(log.created_at);
                            const localTime = utcCreat_at.toLocaleString(undefined, { timeZone: userTimeZone });

                            return (
                                <TableRow key={log.id} className={isMyRequest ? "bg-blue-50" : ""}>
                                    <TableCell>{log.id}</TableCell>
                                    <TableCell>{localTime}</TableCell>
                                    <TableCell 
                                        className={log.r_type === "add" || (log.r_type === "delete" && log.state === "rejected") ? "text-blue-600 underline hover:cursor-pointer" : ""} 
                                        onClick={() => {
                                            if (log.r_type === "add" || (log.r_type === "delete" && log.state === "rejected")) {
                                                router.push(`/word/search/${log.word}`);
                                            }
                                        }}
                                    >
                                        {log.word}
                                    </TableCell>
                                    <TableCell 
                                        className={log.make_by_user ? `text-blue-600 underline hover:cursor-pointer` : ""} 
                                        onClick={() => { 
                                            if (log.make_by_user) { 
                                                router.push(`/profile/${log.make_by_user?.nickname}`); 
                                            } 
                                        }}
                                    >
                                        {log.make_by_user?.nickname || "-"}
                                    </TableCell>
                                    <TableCell 
                                        className={log.processed_by_user ? `text-blue-600 underline hover:cursor-pointer` : ""} 
                                        onClick={() => { 
                                            if (log.processed_by_user) { 
                                                router.push(`/profile/${log.processed_by_user?.nickname}`); 
                                            } 
                                        }}
                                    >
                                        {log.processed_by_user?.nickname || "-"}
                                    </TableCell>
                                    <TableCell>
                                        {log.state === "approved" ? (
                                            <span className="text-green-600 font-semibold">승인</span>
                                        ) : log.state === "rejected" ? (
                                            <span className="text-red-600 font-semibold">거절</span>
                                        ) : (
                                            <span className="text-yellow-600 font-semibold">대기중</span>
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

                <div className="flex items-center gap-2">
                    <span className="text-gray-600">
                        {page} / {totalPages} 페이지
                    </span>
                    <span className="text-sm text-gray-400">
                        ({((page - 1) * itemsPerPage) + 1}-{Math.min(page * itemsPerPage, totalCount)} / {totalCount})
                    </span>
                </div>

                <Button
                    variant="outline"
                    disabled={page >= totalPages || isLoading}
                    onClick={() => setPage((prev) => prev + 1)}
                >
                    다음
                </Button>
            </div>
        </div>
    );
}
'use client'

import { useState, useEffect } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/app/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from "@/app/components/ui/pagination"
import { Checkbox } from "@/app/components/ui/checkbox"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/app/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { PostgrestError } from '@supabase/supabase-js'
import { useSelector } from 'react-redux';
import { RootState } from "@/app/store/store";
import ErrorModal from '../components/ErrModal'

// 타입 정의
type Theme = {
    theme_id: number;
    theme_name: string;
    typez?: "add" | "delete"; // 주제 추가/삭제 요청에서만 사용
}

type WordRequest = {
    id: number;
    word: string;
    request_type: "add" | "delete" | "theme_change";
    requested_at: string;
    requested_by_uuid?: string;
    requested_by: string;
    wait_themes?: Theme[];
    word_id?: number; // 주제 변경 요청에서만 사용
}

export default function AdminHome({requestDatas}:{requestDatas: WordRequest[]}) {
    const [selectedTab, setSelectedTab] = useState<string>("all");
    const [selectedRequests, setSelectedRequests] = useState<Set<number>>(new Set());
    const [selectedThemes, setSelectedThemes] = useState<Record<number, Set<number>>>({});
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [allSelected, setAllSelected] = useState<boolean>(false);
    const [errorModalView, setErrorModalView] = useState<ErrorMessage|null>(null);
    const router = useRouter();
    const user = useSelector((state: RootState) => state.user);

    const PAGE_SIZE = 30;

    // 요청 타입별 필터링
    const filteredRequests = requestDatas.filter(request => {
        if (selectedTab === "all") return true;
        return request.request_type === selectedTab;
    });

    // 페이지네이션 적용
    const totalPages = Math.ceil(filteredRequests.length / PAGE_SIZE);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const currentRequests = filteredRequests.slice(startIndex, startIndex + PAGE_SIZE);

    // 전체 선택 토글
    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedRequests(new Set());
            setAllSelected(false);
        } else {
            const newSelected = new Set<number>();
            currentRequests.forEach(req => newSelected.add(req.id));
            setSelectedRequests(newSelected);
            setAllSelected(true);
        }
    };

    // 개별 요청 선택 토글
    const toggleRequest = (id: number) => {
        const newSelected = new Set(selectedRequests);
        if (newSelected.has(id)) {
            newSelected.delete(id);
            setAllSelected(false);
        } else {
            newSelected.add(id);
            if (newSelected.size === currentRequests.length) {
                setAllSelected(true);
            }
        }
        setSelectedRequests(newSelected);
    };

    // 주제 선택 토글
    const toggleTheme = (requestId: number, themeId: number) => {
        const currentThemes = selectedThemes[requestId] || new Set<number>();
        const newSelectedThemes = { ...selectedThemes };

        if (currentThemes.has(themeId)) {
            currentThemes.delete(themeId);
        } else {
            currentThemes.add(themeId);
        }

        newSelectedThemes[requestId] = currentThemes;
        setSelectedThemes(newSelectedThemes);
    };

    const makeError = (error: PostgrestError) => {
        setErrorModalView({
            ErrName: error.name,
            ErrMessage: error.message,
            ErrStackRace: error.code,
            inputValue: ""
        })
    }

    // 선택한 요청 승인 처리
    const approveSelected = async () => {
        if (selectedRequests.size === 0) {
            alert("선택된 요청이 없습니다.");
            return;
        }

        // 승인 처리할 요청과 선택된 주제 정보 구성
        const requestsToApprove = Array.from(selectedRequests).map(reqId => {
            const request = requestDatas.find(r => r.id === reqId);
            const selectedThemeIds = selectedThemes[reqId] || new Set<number>();

            return {
                ...request,
                selectedThemes: request?.wait_themes?.filter(theme =>
                    selectedThemeIds.has(theme.theme_id)
                )
            };
        });

        // 작업 처리
        const wordAddThemesQuery: {word_id: number, theme_id: number}[] = []; // 단어의 주제 추가 요청 승인 쿼리
        const wordDeleteThemesQuery: {word_id: number, theme_id: number}[] = []; // 단어의 주제 삭제 요청 승인 쿼리
        const wordAddQuery: {word: string, added_by: string | null}[] = []; // 단어 추가 승인 쿼리
        const wordDeleteQuery: {word_id: number}[] = []; //단어 삭제 승인 쿼리
        const wordAddBeforeThemes: Record<string,number[]> = {}; // 단어 추가 되고 주제 추가 할 목록
        const RequestBy: Record<string, string | null> = {};

        // 승인할 목록에서 쿼리에 맞게 배분
        for (const req of requestsToApprove){
            switch (req.request_type){
                case "add":
                    if (!req.word || !req.selectedThemes) continue;
                    wordAddQuery.push({word: req.word, added_by: req.requested_by ?? null});
                    wordAddBeforeThemes[req.word] = req.selectedThemes.map((theme)=>theme.theme_id);
                    RequestBy[req.word] = req.requested_by_uuid ?? null;

                case "delete":
                    if (!req.word || !req.word_id) continue;
                    wordDeleteQuery.push({word_id: req.word_id});
                    RequestBy[req.word] = req.requested_by_uuid ?? null;

                case "theme_change":
                    if (!req.word_id || !req.selectedThemes) continue;
                    const addT: {word_id: number, theme_id: number}[] = [];
                    const delT: {word_id: number, theme_id: number}[] = [];
                    req.selectedThemes.forEach((theme)=>{
                        if (theme.typez === "add"){
                            addT.push({word_id: req.word_id as number, theme_id: theme.theme_id})
                        }
                        else if (theme.typez === "delete"){
                            delT.push({word_id: req.word_id as number, theme_id: theme.theme_id})
                        }
                    })

                    wordAddThemesQuery.concat(addT);
                    wordDeleteThemesQuery.concat(delT);

                default:
                    continue;
            }
        }

        // db에 올리기
        const {data: AddedWords, error: AddedWordsError} = await supabase.from('words').insert(wordAddQuery).select('*');
        if (AddedWordsError){
            makeError(AddedWordsError);
            return;
        }
        
        const {error: AddWordThemesError} = await supabase.from('word_themes').insert(wordAddThemesQuery);
        const conditions = wordDeleteThemesQuery
            .map(p => `(word_id.eq.${p.word_id},theme_id.eq.${p.theme_id})`)
            .join(',');
        const {error: DeleteWordThemesError} = await supabase.from('word_themes').delete().or(conditions);
        if (DeleteWordThemesError){
            makeError(DeleteWordThemesError);
            return;
        }

        if (AddWordThemesError){
            makeError(AddWordThemesError);
            return;
        }

        const {data: deletedWordsData ,error: DeleteWordsError} = await supabase.from('words').delete().in('id',wordDeleteQuery.map(({word_id})=>word_id)).select('*')
        if (DeleteWordsError){
            makeError(DeleteWordsError);
            return;
        }

        // 추가된 단어 주제 등록
        const wordAddThemesQuery2: {word_id: number, theme_id: number}[] = [];
        AddedWords.forEach(({word,id})=>{
            const themes = wordAddBeforeThemes[word]
            if (themes){
                wordAddThemesQuery2.concat(themes.map((tid)=>({
                    word_id: id,
                    theme_id: tid
                })))
            }
        });

        const {error: AddWordThemesError2} = await supabase.from('word_themes').insert(wordAddThemesQuery2);
        if (AddWordThemesError2) return makeError(AddWordThemesError2);

        // 로그 등록을 위한 문서 정보 가져오기
        const docsIdInfo: Record<string, number> = {};
        const {data: docsDatas, error: docsDataError} = await supabase.from('docs').select('*');
        if (docsDataError){
            return makeError(docsDataError)
        }
        docsDatas.filter(({typez})=>typez==="letter").forEach(({id, name})=>docsIdInfo[name]=id);

        // 문서 로그 등록
        const docsLogQuery: {docs_id: number, word: string, add_by: string | null, type: "add" | "delete"}[] = [];
        const wordsLogQuery: {word: string, processed_by: string, make_by: string | null, state: "approved" | "rejected", r_type: "add" | "delete"}[] = []

        for (const data of AddedWords){
            if (!docsIdInfo[data.word[data.word.length - 1]]) continue;
            const docsID = docsIdInfo[data.word[data.word.length - 1]];
            docsLogQuery.push({
                docs_id: docsID,
                word: data.word,
                add_by: RequestBy[data.word],
                type: "add"
            })
            wordsLogQuery.push({
                word: data.word,
                processed_by: user.uuid!,
                make_by: RequestBy[data.word],
                state: "approved",
                r_type: "add"
            })
        }
        for (const data of deletedWordsData){
            if (!docsIdInfo[data.word[data.word.length - 1]]) continue;
            const docsID = docsIdInfo[data.word[data.word.length - 1]];
            docsLogQuery.push({
                docs_id: docsID,
                word: data.word,
                add_by: RequestBy[data.word],
                type: "delete"
            });
            wordsLogQuery.push({
                word: data.word,
                processed_by: user.uuid!,
                make_by: RequestBy[data.word],
                state: "approved",
                r_type: "delete"
            })
        }

        const {error: insertDocsLogError} = await supabase.from('docs_logs').insert(docsLogQuery);
        if (insertDocsLogError) return makeError(insertDocsLogError);

        const {error: insertWordLogError} = await supabase.from('logs').insert(wordsLogQuery);
        if (insertWordLogError) return makeError(insertWordLogError);

        // 대기 큐에서 삭제
        const {error: deleteWaitQueueError} = await supabase.from('wait_words').delete().in('id',AddedWords.map(({id})=>id).concat(deletedWordsData.map(({id})=>id)));
        if (deleteWaitQueueError) return makeError(deleteWaitQueueError);

        const conditions2 = wordDeleteThemesQuery.concat(wordAddThemesQuery)
        .map(p => `(word_id.eq.${p.word_id},theme_id.eq.${p.theme_id})`)
        .join(',');
        const {error: deleteWaitQueueError2} = await supabase.from('word_themes_wait').delete().or(conditions2)
        if (deleteWaitQueueError2) return makeError(deleteWaitQueueError2);

        // 선택 상태 초기화
        setSelectedRequests(new Set());
        setSelectedThemes({});
        setAllSelected(false);
        router.refresh();
    };

    // 선택한 요청 거절 처리
    const rejectSelected = () => {
        if (selectedRequests.size === 0) {
            alert("선택된 요청이 없습니다.");
            return;
        }

        const requestsToReject = Array.from(selectedRequests).map(reqId => {
            const request = requestDatas.find(r => r.id === reqId);
            const selectedThemeIds = selectedThemes[reqId] || new Set<number>();

            return {
                ...request,
                selectedThemes: request?.wait_themes?.filter(theme =>
                    selectedThemeIds.has(theme.theme_id)
                )
            };
        });

        // 실제로는 API 호출할 부분
        console.log("거절할 요청:", Array.from(requestsToReject));
        alert(`${selectedRequests.size}개의 요청을 거절했습니다.`);

        // 선택 상태 초기화
        setSelectedRequests(new Set());
        setSelectedThemes({});
        setAllSelected(false);
    };

    // 페이지 변경시 선택 상태 초기화
    useEffect(() => {
        setSelectedRequests(new Set());
        setSelectedThemes({});
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

    // 요청 타입 뱃지 렌더링
    const renderRequestTypeBadge = (type: string) => {
        switch (type) {
            case 'add':
                return <Badge className="bg-green-500">추가</Badge>;
            case 'delete':
                return <Badge className="bg-red-500">삭제</Badge>;
            case 'theme_change':
                return <Badge className="bg-blue-500">주제 변경</Badge>;
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto py-8">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>단어 DB 관리자 페이지</CardTitle>
                    <CardDescription>
                        단어 추가, 삭제 및 주제 변경 요청을 관리합니다.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="all">전체 요청</TabsTrigger>
                            <TabsTrigger value="add">추가 요청</TabsTrigger>
                            <TabsTrigger value="delete">삭제 요청</TabsTrigger>
                            <TabsTrigger value="theme_change">주제 변경 요청</TabsTrigger>
                        </TabsList>

                        <TabsContent value={selectedTab}>
                            <div className="flex justify-end mb-4 gap-2">
                                <Button
                                    variant="outline"
                                    className="bg-green-100 hover:bg-green-200"
                                    onClick={()=>{
                                        return;
                                        approveSelected()
                                    }}
                                >
                                    선택 승인
                                </Button>
                                <Button
                                    variant="outline"
                                    className="bg-red-100 hover:bg-red-200"
                                    onClick={rejectSelected}
                                >
                                    선택 거절
                                </Button>
                            </div>

                            <div className="border rounded-md">
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
                                            <TableHead className="w-16">No.</TableHead>
                                            <TableHead className="w-36">단어</TableHead>
                                            <TableHead className="w-24">요청 타입</TableHead>
                                            <TableHead className="w-48">주제</TableHead>
                                            <TableHead className="w-40">요청 시간</TableHead>
                                            <TableHead className="w-36">요청자</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentRequests.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-4">
                                                    요청이 없습니다.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            currentRequests.map((request) => (
                                                <TableRow key={`r-${request.id}`}>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedRequests.has(request.id)}
                                                            onCheckedChange={() => toggleRequest(request.id)}
                                                            aria-label={`${request.word} 선택`}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{request.id}</TableCell>
                                                    <TableCell>{request.word}</TableCell>
                                                    <TableCell>
                                                        {renderRequestTypeBadge(request.request_type)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {request.wait_themes ? (
                                                            <div className="flex flex-col gap-2">
                                                                {request.wait_themes.map((theme, index) => (
                                                                    <div key={`t-${theme.theme_id}-${request.id}-${index ^ 10110}`} className="flex items-center gap-2">
                                                                        <Checkbox
                                                                            id={`theme-${request.id}-${theme.theme_id}`}
                                                                            checked={selectedThemes[request.id]?.has(theme.theme_id) || false}
                                                                            onCheckedChange={() => toggleTheme(request.id, theme.theme_id)}
                                                                        />
                                                                        <label htmlFor={`theme-${request.id}-${theme.theme_id}`} className="text-sm flex items-center">
                                                                            {theme.theme_name}
                                                                            {theme.typez && (
                                                                                <span className={`ml-1 text-xs px-1 rounded ${theme.typez === 'add' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                                                                                    }`}>
                                                                                    {theme.typez === 'add' ? '추가' : '삭제'}
                                                                                </span>
                                                                            )}
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-500">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{request.requested_at !== "unknown" ? formatDate(request.requested_at) : "unknown"}</TableCell>
                                                    <TableCell>{request.requested_by}</TableCell>
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
                                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
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
                                            >
                                                {pageNum}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                })}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </CardFooter>
            </Card>
            {errorModalView && <ErrorModal error={errorModalView} onClose={()=>setErrorModalView(null)} />}
        </div>
    )
}
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
import { SCM, supabase } from '../../lib/supabaseClient'
import { PostgrestError } from '@supabase/supabase-js'
import { useSelector } from 'react-redux';
import { RootState } from "@/app/store/store";
import ErrorModal from '../../components/ErrModal'
import { isNoin } from '@/app/lib/lib'
import { addWordQueryType } from '@/app/types/type'

// 타입 정의
type Theme = {
    theme_id: number;
    theme_name: string;
    theme_code: string;
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

export default function AdminHome({ requestDatas, refreshFn }: { requestDatas: WordRequest[], refreshFn: () => Promise<void> }) {
    const [selectedTab, setSelectedTab] = useState<string>("all");
    const [selectedRequests, setSelectedRequests] = useState<Set<number>>(new Set());
    const [selectedThemes, setSelectedThemes] = useState<Record<number, Set<number>>>({});
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [allSelected, setAllSelected] = useState<boolean>(false);
    const [errorModalView, setErrorModalView] = useState<ErrorMessage | null>(null);
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
            if (currentThemes.size === 0) {
                toggleRequest(requestId)
            }
        } else {
            currentThemes.add(themeId);
            const newSelected = new Set(selectedRequests);
            if (!newSelected.has(requestId)) {
                newSelected.add(requestId);
                if (newSelected.size === currentRequests.length) {
                    setAllSelected(true);
                }
                setSelectedRequests(newSelected);
            }
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
        const wordAddThemesQuery: { word_id: number, theme_id: number }[] = []; // 단어의 주제 추가 요청 승인 쿼리
        const wordDeleteThemesQuery: { word_id: number, theme_id: number }[] = []; // 단어의 주제 삭제 요청 승인 쿼리
        const wordAddQuery: addWordQueryType[] = []; // 단어 추가 승인 쿼리
        const wordDeleteQuery: { word_id: number }[] = []; //단어 삭제 승인 쿼리
        const wordAddBeforeThemes: Record<string, number[]> = {}; // 단어 추가 되고 주제 추가 할 목록
        const RequestBy: Record<string, string | null> = {};

        // 승인할 목록에서 쿼리에 맞게 배분
        for (const req of requestsToApprove) {
            switch (req.request_type) {
                case "add":
                    if (!req.word || !req.selectedThemes || req.selectedThemes.length === 0) continue;
                    wordAddQuery.push({ word: req.word, added_by: req.requested_by_uuid ?? null, noin_canuse: isNoin(req.selectedThemes.map((theme) => theme.theme_code)) });
                    wordAddBeforeThemes[req.word] = req.selectedThemes.map((theme) => theme.theme_id);
                    RequestBy[req.word] = req.requested_by_uuid ?? null;
                    continue

                case "delete":
                    if (!req.word || !req.word_id) continue;
                    wordDeleteQuery.push({ word_id: req.word_id });
                    RequestBy[req.word] = req.requested_by_uuid ?? null;
                    continue

                case "theme_change":
                    if (!req.word_id || !req.selectedThemes) continue;
                    const addT: { word_id: number, theme_id: number }[] = [];
                    const delT: { word_id: number, theme_id: number }[] = [];
                    req.selectedThemes.forEach((theme) => {
                        if (theme.typez === "add") {
                            addT.push({ word_id: req.word_id as number, theme_id: theme.theme_id })
                        }
                        else if (theme.typez === "delete") {
                            delT.push({ word_id: req.word_id as number, theme_id: theme.theme_id })
                        }
                    })

                    wordAddThemesQuery.push(...addT);
                    wordDeleteThemesQuery.push(...delT);
                    continue;

                default:
                    continue;
            }
        }

        const deleteWordIds = wordDeleteQuery.map(({ word_id }) => word_id);
        const {data: beforeDeleteWordThemes, error: beforeDeleteWordThemesError} = await SCM.getWordThemes(deleteWordIds);

        // db에 올리기
        const { data: AddedWords, error: AddedWordsError } = await SCM.addWord(wordAddQuery);
        if (AddedWordsError) { return makeError(AddedWordsError) }

        const { data: AddWordThemes, error: AddWordThemesError } = await SCM.addWordThemes(wordAddThemesQuery);
        const { data: DeleteWordThemes, error: DeleteWordThemesError } = await SCM.deleteWordTheme(wordDeleteThemesQuery);
        const { data: deletedWordsData, error: DeleteWordsError } = await SCM.deleteWordcIds(deleteWordIds)


        if (DeleteWordThemesError) { return makeError(DeleteWordThemesError) }
        if (AddWordThemesError) { return makeError(AddWordThemesError) }
        if (DeleteWordsError) { return makeError(DeleteWordsError) }
        if (beforeDeleteWordThemesError) { return makeError(beforeDeleteWordThemesError) }

        // 추가된 단어 주제 등록
        const wordAddThemesQuery2: { word_id: number, theme_id: number }[] = [];
        AddedWords.forEach(({ word, id }) => {
            const themes = wordAddBeforeThemes[word]
            if (themes) {
                wordAddThemesQuery2.push(...themes.map((tid) => ({
                    word_id: id,
                    theme_id: tid
                })))
            }
        });

        const { data: AddWordThemeData, error: AddWordThemesError2 } = await SCM.addWordThemes(wordAddThemesQuery2);
        if (AddWordThemesError2) return makeError(AddWordThemesError2);

        const AddedWordThemeRecord: Record<string, string[]> = {}
        AddWordThemeData.forEach(({ words, themes }) => { AddedWordThemeRecord[words.word] = (AddedWordThemeRecord[words.word] ?? []).concat([themes.name]) })

        // 삭제된 단어 주제 정보 연결
        const papa: Record<string,string[]> = {};
        for (const {words, themes} of beforeDeleteWordThemes){
            papa[words.word] = [...(papa[words.word] ?? []), themes.name]
        }

        // 로그 등록을 위한 문서 정보 가져오기
        const docsIdInfo: Record<string, number> = {};
        const docsThemeIdInfo: Record<string, number> = {};
        const { data: docsDatas, error: docsDataError } = await SCM.getAllDocs();
        if (docsDataError) { return makeError(docsDataError) }
        docsDatas.filter(({ typez }) => typez === "letter").forEach(({ id, name }) => docsIdInfo[name] = id);
        docsDatas.filter(({ typez }) => typez === "theme").forEach(({ id, name }) => docsThemeIdInfo[name] = id)

        // 문서 로그 등록
        const docsLogQuery: { docs_id: number, word: string, add_by: string | null, type: "add" | "delete" }[] = [];
        const wordsLogQuery: { word: string, processed_by: string, make_by: string | null, state: "approved", r_type: "add" | "delete" }[] = []

        for (const data of AddedWords) {
            const docsID = docsIdInfo[data.word[data.word.length - 1]];
            if (docsID) {
                docsLogQuery.push({
                    docs_id: docsID,
                    word: data.word,
                    add_by: RequestBy[data.word],
                    type: "add"
                })
            }
            const docsNames = AddedWordThemeRecord[data.word]
            if (docsNames.length > 0) {
                docsNames.forEach((name) => {
                    const docsId2 = docsThemeIdInfo[name]
                    if (docsId2) {
                        docsLogQuery.push({
                            docs_id: docsId2,
                            word: data.word,
                            add_by: RequestBy[data.word],
                            type: "add"
                        })
                    }
                })
            }
            wordsLogQuery.push({
                word: data.word,
                processed_by: user.uuid!,
                make_by: RequestBy[data.word],
                state: "approved",
                r_type: "add"
            })
        }

        for (const data of deletedWordsData) {
            const docsID = docsIdInfo[data.word[data.word.length - 1]];
            if (docsID) {
                docsLogQuery.push({
                    docs_id: docsID,
                    word: data.word,
                    add_by: RequestBy[data.word],
                    type: "delete"
                });
            }
            wordsLogQuery.push({
                word: data.word,
                processed_by: user.uuid!,
                make_by: RequestBy[data.word],
                state: "approved",
                r_type: "delete"
            })
            for (const theme of (papa[data.word] ?? [])){
                const docsID2 = docsThemeIdInfo[theme];
                if (docsID2){
                    docsLogQuery.push({
                        docs_id: docsID2,
                        word: data.word,
                        add_by: RequestBy[data.word] ?? null,
                        type: "delete"
                    });
                }
            }
        };

        for (const data of AddWordThemes) {
            const docsId = docsThemeIdInfo[data.themes.name]
            if (docsId) {
                docsLogQuery.push({
                    docs_id: docsId,
                    word: data.words.word,
                    add_by: null,
                    type: "add"
                })
            }
        }
        for (const data of DeleteWordThemes){
            const docsId = docsThemeIdInfo[data.theme_name]
            if (docsId){
                docsLogQuery.push({
                    docs_id: docsId,
                    word: data.word,
                    add_by: null,
                    type: "delete"
                })
            }
        }

        const cont: Record<string, number> = {};
        wordsLogQuery.forEach(({ make_by }) => {
            if (make_by) {
                cont[make_by] = (cont[make_by] ?? 0) + 1
            }
        });

        const { error: insertDocsLogError } = await SCM.addDocsLog(docsLogQuery);
        if (insertDocsLogError) return makeError(insertDocsLogError);

        const { error: insertWordLogError } = await SCM.addWordLog(wordsLogQuery);
        if (insertWordLogError) return makeError(insertWordLogError);

        // 대기 큐에서 삭제
        const { error: deleteWaitQueueError } = await supabase.from('wait_words').delete().in('word', AddedWords.map(({ word }) => word).concat(deletedWordsData.map(({ word }) => word)));
        if (deleteWaitQueueError) return makeError(deleteWaitQueueError);

        if (wordDeleteThemesQuery.concat(wordAddThemesQuery).length > 0) {
            const k:{word_id:number, theme_id: number}[] = [];
            wordDeleteThemesQuery.concat(wordAddThemesQuery)
                .forEach(p=>k.push({word_id: p.word_id, theme_id: p.theme_id}))
            const { error: deleteWaitQueueError2 } = await SCM.deleteWaitWordThemes(k);
            if (deleteWaitQueueError2) return makeError(deleteWaitQueueError2);
        }

        const upDocosId: Set<number> = new Set();
        docsLogQuery.forEach(({ docs_id })=>upDocosId.add(docs_id))
        await SCM.updateDocsLastUpdate([...upDocosId])

        for (const [key, value] of Object.entries(cont)) { await SCM.updateUserContribution({userId: key, amount: value}) }

        // 선택 상태 초기화
        setSelectedRequests(new Set());
        setSelectedThemes({});
        setAllSelected(false);
        refreshFn();
    };

    // 선택한 요청 거절 처리
    const rejectSelected = async () => {
        if (selectedRequests.size === 0) {
            alert("선택된 요청이 없습니다.");
            return;
        }

        // 거절할 처리할 요청과 선택된 주제 정보 구성
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


        // 배분
        const wordsLogQuery: { word: string, processed_by: string, make_by: string | null, state: "rejected", r_type: "add" | "delete" }[] = [];
        const deleteWaitQuery: number[] = [];
        const waitThemeQuery:  { word_id: number, theme_id: number }[] = [];

        for (const req of requestsToReject){
            switch (req.request_type){
                case "add":
                    if (!req.id || !req.word){ continue }
                    wordsLogQuery.push({
                        word: req.word,
                        processed_by: user.uuid!,
                        make_by: req.requested_by_uuid ?? null,
                        state: "rejected" as const,
                        r_type: req.request_type
                    })
                    deleteWaitQuery.push(req.id);
                    continue;
                case "delete":
                    if (!req.id || !req.word){ continue }
                    wordsLogQuery.push({
                        word: req.word,
                        processed_by: user.uuid!,
                        make_by: req.requested_by_uuid ?? null,
                        state: "rejected" as const,
                        r_type: req.request_type
                    })
                    deleteWaitQuery.push(req.id);
                    continue;
                case "theme_change":
                    if (!req.word_id || !req.selectedThemes) continue;
                    const addT: { word_id: number, theme_id: number }[] = [];
                    const delT: { word_id: number, theme_id: number }[] = [];
                    req.selectedThemes.forEach((theme) => {
                        if (theme.typez === "add") {
                            addT.push({ word_id: req.word_id as number, theme_id: theme.theme_id })
                        }
                        else if (theme.typez === "delete") {
                            delT.push({ word_id: req.word_id as number, theme_id: theme.theme_id })
                        }
                    })
                    waitThemeQuery.push(...addT);
                    waitThemeQuery.push(...delT);
                    continue;

                default:
                    continue;
            }
        }

        // 로그 등록
        const {error: logError} = await SCM.addWordLog(wordsLogQuery);

        // 대기큐에서 삭제
        const {error: deleteWaitQueueError } = await supabase.from('wait_words').delete().in('id',[...new Set(deleteWaitQuery)]);
        const { error: deleteWaitQueueError2 } = await SCM.deleteWaitWordThemes(waitThemeQuery);
        if (deleteWaitQueueError) { return makeError(deleteWaitQueueError); }
        if (deleteWaitQueueError2) { return makeError(deleteWaitQueueError2); }
        if (logError) { return makeError(logError) };

        // 선택 상태 초기화
        setSelectedRequests(new Set());
        setSelectedThemes({});
        setAllSelected(false);
        refreshFn();
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
                                    onClick={() => {
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
            {errorModalView && <ErrorModal error={errorModalView} onClose={() => setErrorModalView(null)} />}
        </div>
    )
}
"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
    User,
    Star,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Shield,
    Edit3,
    FileText,
    Plus,
    Trash2,
    Loader2
} from 'lucide-react';
import { ko } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from 'next/navigation';
import ErrorModal from '@/app/components/ErrModal';
import { AppDispatch, RootState } from '@/app/store/store';
import { useDispatch, useSelector } from 'react-redux';
import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/app/lib/supabaseClient';
import { userAction } from '@/app/store/slice';
import CompleteModal from '@/app/components/CompleteModal';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Separator } from '@radix-ui/react-select';

type role = "r1" | "r2" | "r3" | "r4" | "admin"
type status = "pending" | "approved" | "rejected"
type ttype = "add" | "delete"

type userInfo = {
    id: string;
    nickname: string;
    contribution: number;
    role: role;
    month_contribution: number;
    month_contribution_rank: number;
}

type waitWordList = {
    id: number;
    word: string;
    request_type: ttype;
    requested_at: string;
    status: status;
}[]

type logList = {
    id: number;
    word: string;
    created_at: string;
    state: status;
    r_type: ttype;
}[]

type starredDocsList = {
    id: number;
    name: string;
    last_update: string;
    typez: string;
}[]

// 로딩 중 표시해줄 더미 데이터 목록들
const dummyUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    nickname: 'dummyUser',
    contribution: 245,
    role: 'r3' as role,
    month_contribution: 42,
    month_contribution_rank: 4
};

const dummyWaitWords = [
    {
        id: 1,
        word: 'React',
        request_type: 'add' as ttype,
        requested_at: '2024-12-01T10:30:00Z',
        status: 'pending' as status
    },
    {
        id: 2,
        word: 'deprecated',
        request_type: 'delete' as ttype,
        requested_at: '2024-11-28T15:20:00Z',
        status: 'approved' as status
    },
    {
        id: 3,
        word: 'TypeScript',
        request_type: 'add' as ttype,
        requested_at: '2024-11-25T09:15:00Z',
        status: 'rejected' as status
    }
];

const dummyLogs = [
    {
        id: 1,
        word: 'JavaScript',
        created_at: '2024-12-02T14:30:00Z',
        state: 'approved' as status,
        r_type: 'add' as ttype
    },
    {
        id: 2,
        word: 'old',
        created_at: '2024-11-30T11:45:00Z',
        state: 'approved' as status,
        r_type: 'delete' as ttype
    },
    {
        id: 3,
        word: 'Vue',
        created_at: '2024-11-27T16:20:00Z',
        state: 'rejected' as status,
        r_type: 'add' as ttype
    }
];

const dummyStarredDocs = [
    {
        id: 1,
        name: 'React',
        last_update: '2024-11-30T10:00:00Z',
        typez: 'tutorial'
    },
    {
        id: 2,
        name: 'TypeScript',
        last_update: '2024-11-28T14:30:00Z',
        typez: 'guide'
    },
    {
        id: 3,
        name: 'Next',
        last_update: '2024-11-25T09:15:00Z',
        typez: 'documentation'
    }
];


const ProfilePage = ({ userName }: { userName: string }) => {
    const [user, setUser] = useState<userInfo>(dummyUser);
    const [waitWords, setWaitWords] = useState<waitWordList>(dummyWaitWords);
    const [logs, setLogs] = useState<logList>(dummyLogs);
    const [starredDocs, setStarredDocs] = useState<starredDocsList>(dummyStarredDocs);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [newNickname, setNewNickname] = useState<string>(user.nickname);
    const [nicknameError, setNicknameError] = useState<string>('');
    const [loading, setLoading] = useState<string | null>("유저 데이터 가져 오는 중...");
    const [errorModalView, seterrorModalView] = useState<ErrorMessage | null>(null);
    const [isOwnProfile, setIsOwnProfile] = useState<boolean>(false);
    const router = useRouter();
    const userReudx = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch<AppDispatch>();
    const [complete, setComplete] = useState<string | null>(null);
    const [isAdmin,setIsAdmin] = useState<boolean>(false);

    const makeError = (error: PostgrestError) => {
        seterrorModalView({
            ErrName: error.name,
            ErrMessage: error.message,
            ErrStackRace: error.code,
            inputValue: "admin"
        })
        setLoading(null)
    }

    useEffect(() => {
        const getData = async () => {
            const { data: getUserData, error: getUserError } = await supabase.from('users').select('*').eq('nickname', userName).maybeSingle();
            if (getUserError) {
                return makeError(getUserError)
            }
            if (!getUserData) {
                return makeError({
                    name: "unknown",
                    details: "",
                    code: "EEE1",
                    hint: "",
                    message: "알수 없는 에러"
                })
            }
            const {data: mcrankData, error: mcrankError} = await supabase.rpc('get_user_monthly_rank',{uid:getUserData.id})
            if (mcrankError){
                return makeError(mcrankError)
            }
            setUser({...getUserData, month_contribution_rank: mcrankData});
            setIsOwnProfile(getUserData.id === userReudx.uuid);
            setIsAdmin(getUserData.role === "admin")
            const getUserLog = async () => await supabase.from('logs').select('*').eq('make_by', getUserData.id).order('created_at', { ascending: false }).limit(30)
            const getUserWaitWord = async () => await supabase.from('wait_words').select('*').eq('requested_by', getUserData.id).order('requested_at', { ascending: false }).limit(30)
            const getUserStarredDocs = async () => await supabase.from('user_star_docs').select('*,docs(name,typez,last_update,id)').eq('user_id', getUserData.id)
            const [{ data: userLog, error: userLogError }, { data: userWaitWord, error: userWaitWordError }, { data: userStarredDocs, error: userStarredDocsError }] = await Promise.all([getUserLog(), getUserWaitWord(), getUserStarredDocs()]);
            if (userLogError) return makeError(userLogError)
            if (userWaitWordError) return makeError(userWaitWordError);
            if (userStarredDocsError) return makeError(userStarredDocsError);
            setWaitWords(userWaitWord)
            setStarredDocs(userStarredDocs.map(({ docs: { name, typez, last_update, id } }) => ({ name, id, typez, last_update })))
            setLogs(userLog);
            setLoading(null)
        }
        getData()
    }, [])


    const getRoleName = (role: role) => {
        const roleNames = {
            'r1': '새싹',
            'r2': '일반',
            'r3': '활동가',
            'r4': '베테랑',
            'admin': '관리자'
        };
        return roleNames[role] || role;
    };

    const getRoleColor = (role: role) => {
        const roleColors = {
            'r1': 'bg-green-100 text-green-800',
            'r2': 'bg-blue-100 text-blue-800',
            'r3': 'bg-purple-100 text-purple-800',
            'r4': 'bg-orange-100 text-orange-800',
            'admin': 'bg-red-100 text-red-800'
        };
        return roleColors[role] || 'bg-gray-100 text-gray-800';
    };

    const getRankColor = (rank: number) => {
        if (rank === 0) return "";
        if (rank === 1) return "bg-yellow-400 text-black";
        if (rank === 2) return "bg-gray-300 text-black";
        if (rank === 3) return "bg-orange-400 text-black";
        return "bg-black text-white";
    }

    const getStatusIcon = (status: status) => {
        switch (status) {
            case 'pending':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusText = (status: status) => {
        const statusTexts = {
            'pending': '대기중',
            'approved': '승인됨',
            'rejected': '거절됨'
        };
        return statusTexts[status] || status;
    };

    const getRequestTypeText = (type: ttype) => {
        return type === 'add' ? '추가' : '삭제';
    };

    const formatTimeAgo = (dateString: string) => {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ko });
    };

    const handleNicknameUpdate = async () => {
        setNicknameError('');

        if (newNickname.trim() === '') {
            setNicknameError('닉네임을 입력해주세요.');
            return;
        }

        if (newNickname === user.nickname || !userReudx.uuid) {
            setIsEditing(false);
            return;
        }

        setLoading("닉네임 변경 처리중...")
        const { data: existingUser, error: existingUserError } = await supabase
            .from("users")
            .select("id")
            .eq("nickname", newNickname)
            .maybeSingle();

        if (existingUserError) {
            return makeError(existingUserError)
        }
        if (existingUser) {
            setNicknameError("이미 존재하는 닉네임 입니다.")

        } else {
            const { data: updateNicknameData, error: updateNicknameError } = await supabase
                .from("users")
                .update({ nickname: newNickname })
                .eq("id", userReudx.uuid)
                .select("*")
                .maybeSingle();
            if (updateNicknameError) {
                return makeError(updateNicknameError)
            }
            if (!updateNicknameData) {
                return makeError({
                    name: "unknown",
                    details: "",
                    code: "EEE2",
                    hint: "",
                    message: "알수 없는 에러"
                })
            }
            setUser((prev) => ({ ...prev, nickname: updateNicknameData.nickname }))
            dispatch(
                userAction.setInfo({
                    username: updateNicknameData.nickname,
                    role: updateNicknameData.role,
                })
            );
            setComplete(`${updateNicknameData.nickname}으로 닉네임이 정상적으로 변경되었습니다!`)
        }
        setLoading(null);
    };

    const handleAdminRedirect = () => {
        router.push('/admin');
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl min-h-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 프로필 정보 */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                                <User className="h-10 w-10 text-white" />
                            </div>
                            <div className="space-y-2">
                                {isOwnProfile && isEditing ? (
                                    <div className="space-y-2">
                                        <Input
                                            value={newNickname}
                                            onChange={(e) => setNewNickname(e.target.value)}
                                            placeholder="새 닉네임"
                                            className="text-center"
                                        />
                                        {nicknameError && (
                                            <p className="text-sm text-red-500">{nicknameError}</p>
                                        )}
                                        <div className="flex gap-2 justify-center">
                                            <Button size="sm" onClick={handleNicknameUpdate}>
                                                저장
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setNewNickname(user.nickname);
                                                    setNicknameError('');
                                                }}
                                            >
                                                취소
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <CardTitle className="text-xl">{user.nickname}</CardTitle>
                                        {isOwnProfile && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setIsEditing(true)}
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                )}
                                <Badge className={getRoleColor(user.role)}>
                                    {getRoleName(user.role)}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-bold text-blue-600">{user.contribution}</p>
                                    <p className="text-sm text-muted-foreground">총 기여도</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-600">{user.month_contribution}</p>
                                    <p className="text-sm text-muted-foreground">이달 기여도</p>
                                    {user.month_contribution_rank && (
                                        <Badge className={getRankColor(user.month_contribution_rank)}>
                                            {`${user.month_contribution_rank}등`}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {isAdmin && (
                                <Button
                                    className="w-full"
                                    onClick={handleAdminRedirect}
                                    variant="outline"
                                >
                                    <Shield className="h-4 w-4 mr-2" />
                                    관리자 대시보드
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* 활동 내역 */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="starred" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="starred">즐겨찾기</TabsTrigger>
                            <TabsTrigger value="requests">요청 내역</TabsTrigger>
                            <TabsTrigger value="processed">처리 내역</TabsTrigger>
                        </TabsList>

                        {/* 즐겨찾기한 문서들 */}
                        <TabsContent value="starred">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Star className="h-5 w-5 text-yellow-500" />
                                        즐겨찾기한 문서
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ScrollArea className="h-[400px]">
                                        <div className="p-4">
                                            {starredDocs.length === 0 ? (
                                                <p className="text-center text-muted-foreground py-8">
                                                    즐겨찾기한 문서가 없습니다.
                                                </p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {starredDocs.map((doc, index) => (
                                                        <div key={doc.id}>
                                                            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                                                                <div className="flex items-center gap-3">
                                                                    <FileText className="h-4 w-4 text-blue-500" />
                                                                    <div>
                                                                        <p className="font-medium">{doc.name}</p>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {formatTimeAgo(doc.last_update)}에 업데이트
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Badge variant="outline">{doc.typez}</Badge>
                                                            </div>
                                                            {index < starredDocs.length - 1 && <Separator className="my-2" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* 요청 내역 */}
                        <TabsContent value="requests">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-blue-500" />
                                        단어 요청 내역
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ScrollArea className="h-[400px]">
                                        <div className="p-4">
                                            {waitWords.length === 0 ? (
                                                <p className="text-center text-muted-foreground py-8">
                                                    요청 내역이 없습니다.
                                                </p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {waitWords.map((item, index) => (
                                                        <div key={item.id}>
                                                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                                                <div className="flex items-center gap-3">
                                                                    {item.request_type === 'add' ? (
                                                                        <Plus className="h-4 w-4 text-green-500" />
                                                                    ) : (
                                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                                    )}
                                                                    <div>
                                                                        <p className="font-medium">{item.word}</p>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {getRequestTypeText(item.request_type)} 요청 • {formatTimeAgo(item.requested_at)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {getStatusIcon(item.status)}
                                                                    <span className="text-sm">{getStatusText(item.status)}</span>
                                                                </div>
                                                            </div>
                                                            {index < waitWords.length - 1 && <Separator className="my-2" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* 처리 내역 */}
                        <TabsContent value="processed">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        처리된 요청
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ScrollArea className="h-[400px]">
                                        <div className="p-4">
                                            {logs.length === 0 ? (
                                                <p className="text-center text-muted-foreground py-8">
                                                    처리된 요청이 없습니다.
                                                </p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {logs.map((log, index) => (
                                                        <div key={log.id}>
                                                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                                                <div className="flex items-center gap-3">
                                                                    {log.r_type === 'add' ? (
                                                                        <Plus className="h-4 w-4 text-green-500" />
                                                                    ) : (
                                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                                    )}
                                                                    <div>
                                                                        <p className="font-medium">{log.word}</p>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {getRequestTypeText(log.r_type)} • {formatTimeAgo(log.created_at)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {getStatusIcon(log.state)}
                                                                    <span className="text-sm">{getStatusText(log.state)}</span>
                                                                </div>
                                                            </div>
                                                            {index < logs.length - 1 && <Separator className="my-2" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
            {/* 로딩 오버레이 */}
            {loading && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                    <Card className="p-6">
                        <div className="flex items-center space-x-3">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                            <span className="text-slate-700 dark:text-slate-300">
                                {loading}
                            </span>
                        </div>
                    </Card>
                </div>
            )}

            {/* 오류 모달 */}
            {errorModalView && (
                <ErrorModal
                    error={errorModalView}
                    onClose={() => seterrorModalView(null)}
                />
            )}

            {/* 닉네임 변경 완료 모달 */}
            {complete && (
                <CompleteModal
                    open={complete !== null}
                    onClose={() => setComplete(null)}
                    title={"닉네임 변경 완료"}
                    description={complete}
                />
            )}
        </div>
    );
};

export default ProfilePage;
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import type { Database } from "../types/database.types";
import { Provider, useDispatch } from "react-redux";
import { store } from "../store/store";
import type { AppDispatch } from "../store/store";
import { userAction } from "../store/slice";
import { Suspense } from 'react';
import Spinner from "../components/Spinner";
import ErrorModal from '../components/ErrModal';
import type { ErrorMessage } from "../types/type";

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
        auth: {
            persistSession: true, // 세션을 자동으로 저장
            autoRefreshToken: true, // 토큰 자동 갱신 활성화
        },
    }
);

const AuthPage: React.FC = () => {
    const router = useRouter();
    const [nickname, setNickname] = useState<string>("");
    const [isNewUser, setIsNewUser] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [nicknameError, setNicknameError] = useState("");
    const dispatch = useDispatch<AppDispatch>();
    const [errorModalView, seterrorModalView] = useState<ErrorMessage | null>(null);

    useEffect(() => {
        const checkUser = async (session: Session | null) => {
            if (!session) {

                return;
            }
    
    
            const { data, error: err } = await supabase
                .from("users")
                .select("*")
                .eq("id", session.user.id);
    
            if (err) {
                seterrorModalView({
                    ErrName: err.name ?? null,
                    ErrMessage: err.message ?? null,
                    ErrStackRace: err.stack ?? null,
                    inputValue: null
                });
                return;
            }
    
            if (data.length === 0) {
                setIsNewUser(true);
            } else {
                dispatch(
                    userAction.setInfo({
                        username: data[0].nickname,
                        role: data[0].role ?? "guest",
                    })
                );
                router.push("/");
            }
    
        };
    
        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            await checkUser(session);
        });
    
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [router]);
    

    const signInWithGoogle = async () => {
        const { error: err } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo:
                    "https://refactored-space-journey-wrrxqrv54g9xf5xpq-3000.app.github.dev/auth", //개발 코드 스페이스
            },
        });
        if (err) {
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
        }
    };

    const completeSignup = async () => {
        setLoading(true);
        setNicknameError("");

        const session = await supabase.auth.getSession();
        if (!session.data.session) {
            setLoading(false);
            return;
        }

        // 닉네임 중복 확인
        const { data: checkData, error: checkErr } = await supabase.from("users").select("*").ilike("nickname", nickname.trim());
        if (checkErr) {
            seterrorModalView({
                ErrName: checkErr.name,
                ErrMessage: checkErr.message,
                ErrStackRace: checkErr.stack,
                inputValue: null
            });

            setLoading(false);
            return;
        }
        if (checkData.length > 0) {
            setNicknameError("이미 사용 중인 닉네임입니다.");
            setLoading(false);
            return;
        }

        // 닉네임 등록
        const { data, error:err } = await supabase
            .from("users")
            .insert([{ id: session.data.session.user.id, nickname: nickname.trim() }])
            .select("*")
            .single();

        if (err) {
            seterrorModalView({
                ErrName: err.name,
                ErrMessage: err.message,
                ErrStackRace: err.stack,
                inputValue: null
            });
            
            setLoading(false);
            return;
        }

        dispatch(
            userAction.setInfo({
                username: data.nickname,
                role: data.role ?? "guest",
            })
        );
        router.push("/");
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
            <div className="bg-white dark:bg-gray-800 p-8 shadow-lg rounded-lg w-full max-w-sm transition-all">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 text-center">
                    {isNewUser ? "회원가입" : "로그인 / 회원가입"}
                </h2>
                {isNewUser ? (
                    <div>
                        <input
                            type="text"
                            placeholder="닉네임 입력"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        {nicknameError && <p className="text-red-500 text-sm mb-2">{nicknameError}</p>}
                        <button
                            onClick={completeSignup}
                            className={`w-full text-white py-2 px-4 rounded-lg transition-all ${
                                !nickname || loading
                                    ? "bg-gray-500 dark:bg-gray-600 cursor-not-allowed"
                                    : "bg-green-500 hover:bg-green-600 dark:bg-green-400 dark:hover:bg-green-500"
                            }`}
                            disabled={!nickname || loading}
                        >
                            {loading ? "회원가입 중..." : "회원가입 완료"}
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={signInWithGoogle}
                        className="flex items-center justify-center w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500 transition-all"
                    >
                        Google로 로그인
                    </button>
                )}


                {/* 오류 모달 */}
                {errorModalView && <ErrorModal error={errorModalView} onClose={() => seterrorModalView(null)} />}
            </div>
        </div>
    );
};

const Auth: React.FC = () => {
    return (
        <Provider store={store}>
            <Suspense fallback={<Spinner />}>
                <AuthPage />
            </Suspense>
        </Provider>
    );
};

export default Auth;

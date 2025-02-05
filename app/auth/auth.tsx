"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AuthPage() {
    const router = useRouter();
    const [nickname, setNickname] = useState("");
    const [isNewUser, setIsNewUser] = useState(false);

    useEffect(() => {
        const checkUser = async (session: any) => {
            if (!session) return;
            const { data, error } = await supabase.from("users").select("id").eq("id", session.user.id);
            console.log(data, error)
            if (error) {
                console.error("유저 조회 오류:", error.message);
                return;
            }
            if (data.length === 0) {
                setIsNewUser(true);
            } else {
                router.push("/");
            }
        };

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (session) {
                    await checkUser(session);
                }
            }
        );
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [router]);

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: "https://refactored-space-journey-wrrxqrv54g9xf5xpq-3000.app.github.dev/auth", //개발 코드 스페이스
            },
        });
        if (error) console.error("Google 로그인 오류:", error.message);
    };

    const completeSignup = async () => {
        const session = await supabase.auth.getSession();
        console.log(session)
        if (!session.data.session) return;

        const { error } = await supabase.from("users").insert([
            { id: session.data.session.user.id, nickname },
        ]);

        if (error) {
            console.error("회원가입 오류:", error.message);
            return;
        }
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
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <button
                            onClick={completeSignup}
                            className={`w-full text-white py-2 px-4 rounded-lg transition-all ${!nickname
                                    ? "bg-gray-500 dark:bg-gray-600 cursor-not-allowed"
                                    : "bg-green-500 hover:bg-green-600 dark:bg-green-400 dark:hover:bg-green-500"
                                }`}
                            disabled={!nickname}
                        >
                            회원가입 완료
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
            </div>
        </div>

    );
}

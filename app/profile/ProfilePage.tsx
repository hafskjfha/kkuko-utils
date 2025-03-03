"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProfileCard from "./ProfileCard";
import { supabase } from "../lib/supabaseClient";
import type { UserInfo, ErrorMessage } from "../types/type";
import { Loader2 } from "lucide-react";
import ErrorModal from '../components/ErrModal';

export default function ProfilePage() {
    const searchParams = useSearchParams();
    const username = searchParams.get("username"); // URL에서 ?username= 값 가져오기
    const [userData, setUserData] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [errorModalView, seterrorModalView] = useState<ErrorMessage | null>(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                if (username) {
                    const { data, error } = await supabase
                        .from("users")
                        .select("*")
                        .eq("nickname", username)
                        .maybeSingle();
                    if (error || !data) {
                        if (error){
                            seterrorModalView({
                                ErrName: error.name ?? null,
                                ErrMessage: error.message ?? null,
                                ErrStackRace: error.stack ?? null,
                                inputValue: null
                            });
                        }
                        setError("사용자를 찾을 수 없습니다.");
                    } else {
                        setUserData({
                            nickname: data.nickname,
                            role: data.role,
                            id: data.id,
                            contribution: data.contribution,
                        });
                    }
                } else {
                    const { data, error } = await supabase.auth.getUser();
                    if (error) throw error;

                    const { data: userData, error: userError } = await supabase
                        .from("users")
                        .select("*")
                        .eq("id", data.user.id)
                        .single();
                    
                    if (userError) {
                        seterrorModalView({
                            ErrName: userError.name ?? null,
                            ErrMessage: userError.message ?? null,
                            ErrStackRace: userError.stack ?? null,
                            inputValue: null
                        });
                        setError("사용자 정보를 불러오는 중 오류가 발생했습니다.");
                    } else {
                        setUserData({
                            nickname: userData.nickname,
                            role: userData.role,
                            id: userData.id,
                            contribution: userData.contribution,
                        });
                    }
                }
            } catch (err) {
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
                setError("오류가 발생했습니다. 다시 시도해주세요.");
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, [username]);

    return (
        <div className="flex flex-col justify-center items-center w-full h-full min-h-screen bg-gray-100 dark:bg-gray-900 transition-all duration-300 ease-in-out">
            {loading && (
                <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin text-gray-600 dark:text-gray-300 w-10 h-10" />
                    <p className="mt-2 text-gray-600 dark:text-gray-300">로딩 중...</p>
                </div>
            )}
            
            {error && (
                <div className="text-center">
                    <p className="text-red-600 dark:text-red-400 text-lg font-semibold">{error}</p>
                    <button
                        onClick={() => window.history.back()}
                        className="mt-4 px-4 py-2 bg-gray-500 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-800 transition"
                    >
                        돌아가기
                    </button>
                </div>
            )}

            {userData && (
                <div className="w-full max-w-sm sm:max-w-md">
                    <ProfileCard user={userData} isEditable={!username} />
                </div>
            )}

            {/* 오류 모달 */}
            {errorModalView && <ErrorModal error={errorModalView} onClose={() => seterrorModalView(null)} />}
        </div>
    );
}

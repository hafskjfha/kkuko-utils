"use client";

import { useState } from "react";
import { UserInfo } from "../types/type";
import { supabase } from "../lib/supabaseClient";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store/store";
import { userAction } from "../store/slice";

export default function ProfileEdit({ user, onClose }: { user: UserInfo; onClose: () => void }) {
    const [name, setName] = useState(user.nickname || "");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch<AppDispatch>();

    const handleUpdate = async () => {
        setLoading(true);
        const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("nickname", name)
            .maybeSingle();

        if (existingUser) {
            // 이미 있는 유저 처리
        } else {
            const { data, error } = await supabase
                .from("users")
                .update({ nickname: name })
                .eq("id", user.id)
                .select("*")
                .single();

            if (error) {
                // 오류 처리
            } else {
                // 업데이트 성공 처리
                dispatch(
                    userAction.setInfo({
                        username: data.nickname,
                        role: data.role,
                    })
                );
                user.nickname = data.nickname;
                onClose();
            }
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-lg max-w-sm w-full transition-all">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">닉네임 변경</h2>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="새 닉네임 입력"
                />
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleUpdate}
                        className="w-full py-3 bg-blue-500 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-800 transition"
                    >
                        {loading ? "저장 중..." : "저장"}
                    </button>
                </div>
            </div>
        </div>
    );
}

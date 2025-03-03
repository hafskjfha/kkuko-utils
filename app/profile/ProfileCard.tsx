"use client";

import { useState } from "react";
import ProfileEdit from "./ProfileEdit";
import type { UserInfo } from "../types/type";
import { HelpCircle } from "lucide-react";

const roleDescriptions: Record<string, string> = {
    r1: "기본 등급입니다.",
    r2: "인증되었고 활동을 하는 등급입니다.",
    r3: "?? 등급입니다.",
    r4: "부관리자 등급의 사용자입니다.",
    admin: "관리자 권한을 가진 사용자입니다."
};

function RoleInfoModal({ role, onClose }: { role: string; onClose: () => void }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg w-80 text-center transition-all">
                <h3 className="text-xl font-semibold dark:text-white">등급 설명</h3>
                <p className="mt-4 text-gray-700 dark:text-gray-300">{roleDescriptions[role] || "알 수 없는 등급"}</p>
                <button
                    onClick={onClose}
                    className="mt-4 px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-500 transition"
                >
                    닫기
                </button>
            </div>
        </div>
    );
}

export default function ProfileCard({ user, isEditable }: { user: UserInfo; isEditable: boolean }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isRoleInfoOpen, setIsRoleInfoOpen] = useState(false);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl max-w-sm w-full text-center transition-all">
            <h2 className="text-2xl font-bold mt-4 dark:text-white">{user.nickname || "알 수 없음"}</h2>

            <div className="mt-4 text-lg text-gray-700 dark:text-gray-300 space-y-2">
                <p>
                    <span className="font-semibold text-gray-600 dark:text-gray-400">uid:</span> {user.id}
                </p>
                <p className="flex justify-center items-center gap-1">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">등급:</span> {user.role}
                    <button onClick={() => setIsRoleInfoOpen(true)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                        <HelpCircle size={18} />
                    </button>
                </p>
                <p>
                    <span className="font-semibold text-gray-600 dark:text-gray-400">기여수:</span> {user.contribution}
                </p>
            </div>

            {isEditable && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="mt-6 w-full py-3 bg-blue-600 dark:bg-blue-700 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition"
                >
                    닉네임 변경
                </button>
            )}

            {isEditing && <ProfileEdit user={user} onClose={() => setIsEditing(false)} />}
            {isRoleInfoOpen && <RoleInfoModal role={user.role} onClose={() => setIsRoleInfoOpen(false)} />}
        </div>
    );
}

"use client";
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@radix-ui/react-tooltip";
import { Trash2 } from "lucide-react";

interface DocumentCardProps {
    id: string;
    name: string;
    last_update: string; // timestampz (ISO string)
    is_manager: boolean;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
    id,
    name,
    last_update,
    is_manager,
}) => {
    const router = useRouter();
    const lastUpdateDate = new Date(last_update); // UTC 기준 Date 객체
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localTime = lastUpdateDate.toLocaleString(undefined, { timeZone: userTimeZone });
    let relativeTime = formatDistanceToNow(lastUpdateDate, { addSuffix: true, includeSeconds: false });
    relativeTime = relativeTime.replace(/\babout\b|\b약\b/g, "").trim().replace(' hours ago', '시간 전').replace(' days ago', '일 전').replace(' minutes ago', '분 전').replace(' hour ago', '시간 전').replace(' day ago', '일 전').replace(' minute ago', '분 전').replace(' seconds ago', '초 전').replace(' second ago', '초 전');
    relativeTime = `${relativeTime}`;

    return (
        <div
            className="p-4 sm:p-5 border rounded-2xl shadow-lg bg-white w-full sm:w-56 min-h-36 cursor-pointer flex flex-col justify-between"
            onClick={() => router.push(`/words-docs/${id}`)}
        >
            {/* 제목 */}
            <h1 className="text-xl font-bold break-words">{name}</h1>

            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                {/* 마지막 업데이트 (툴팁 포함) */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="cursor-pointer truncate">{relativeTime}</span>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <span className="bg-gray-800 text-white text-xs rounded-md px-2 py-1">
                                {localTime.toLocaleString()}
                            </span>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* 삭제 버튼 (관리자만) */}
                {is_manager && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log("Delete document");
                        }}
                        className="text-red-500 hover:text-red-700"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>
        </div>

    );
};

export default DocumentCard;

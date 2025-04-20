import Link from "next/link";
import { clsx } from "clsx";
import { memo } from "react";

type WordStatus = "ok" | "delete" | "add" | "eadd" | "edelete";


interface TableRowProps {
    word: string;
    status: WordStatus;
    maker?: string | undefined;
    openWork?: () => void
}

const TableRow = memo(({ word, status, openWork }:TableRowProps) => {
    const wordLength = word.length;

    return (
        <tr
            className={clsx(
                "border text-center text-base sm:text-lg", // 반응형 폰트 크기
                status === "ok" && "border-black",
                status === "delete" && "border-red-500",
                status === "add" && "border-gray-500 border-dashed"
            )}
        >
            {/* 단어 길이 */}
            <td className="min-w-[60px] px-3 py-2 sm:px-4 sm:py-3 border-r">
                {wordLength}
            </td>

            {/* 단어 (링크) */}
            <td className="min-w-[150px] px-3 py-2 sm:px-4 sm:py-3 border-r">
                <Link href={`/word/search/${word}`} className="text-blue-600 hover:underline break-keep">
                    {word}
                </Link>
            </td>

            {/* 상태 */}
            <td className="min-w-[100px] px-3 py-2 sm:px-4 sm:py-3 border-r whitespace-nowrap">
                {status === "ok" ? "" : (status === "add" || status === "eadd") ? "추가요청" : (
                    <div className="text-red-500">삭제요청</div>
                )}
            </td>

            {/* 작업 버튼 */}
            <td className="min-w-[100px] px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                {openWork !== undefined && (
                    <button
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                        onClick={openWork}
                    >
                        작업
                    </button>
                )}
            </td>
        </tr>

    )
})

export default TableRow;
import Link from "next/link";
import { clsx } from "clsx";

type WordStatus = "ok" | "delete" | "add";


interface TableRowProps {
    word: string;
    status: WordStatus;
    maker?: string | undefined;
    openWork?: () => void
}

const TableRow: React.FC<TableRowProps> = ({ word, status, openWork }) => {
    const wordLength = word.length;

    return (
        <tr
            className={clsx(
                "border px-4 py-5 my-2 text-center text-lg",
                status === "ok" && "border-black",
                status === "delete" && "border-red-500",
                status === "add" && "border-gray-500 border-dashed"
            )}
        >
            {/* 단어 길이 */}
            <td className="w-2/10 px-4 py-3 border-r">{wordLength}</td>

            {/* 단어 (링크) */}
            <td className="w-6/10 px-4 py-3 border-r">
                <Link href={`/word/search/${word}`} className="text-blue-600 hover:underline">
                    {word}
                </Link>
            </td>

            <td className="w-1/10 px-4 py-3 border-r whitespace-nowrap">
                {status === "ok" ? "" : status === "add" ? "추가요청" : <div className="text-red-500">삭제요청</div>}
            </td>

            <td className="w-1/10 px-4 py-3">
                {openWork !== undefined && (
                    <button className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition whitespace-nowrap" onClick={openWork}>
                        작업
                    </button>
                )}
            </td>
        </tr>
    )
}

export default TableRow;
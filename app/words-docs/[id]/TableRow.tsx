import Link from "next/link";
import { clsx } from "clsx";

type WordStatus = "ok" | "delR" | "addR";


interface TableRowProps {
    word: string;
    status: WordStatus;
}

const TableRow: React.FC<TableRowProps> = ({ word, status }) => {
    const wordLength = word.length;

    return (
        <tr
            className={clsx(
                "border px-4 py-5 my-2 text-center text-lg",
                status === "ok" && "border-black",
                status === "delR" && "border-red-500",
                status === "addR" && "border-gray-500 border-dashed"
            )}
        >
            {/* 단어 길이 */}
            <td className="w-1/10 px-4 py-3 border-r">{wordLength}</td>

            {/* 단어 (링크) */}
            <td className="w-8/10 px-4 py-3 border-r">
                <Link href={`/word/search/${word}`} className="text-blue-600 hover:underline">
                    {word}
                </Link>
            </td>

            <td className="w-1/10 px-4 py-3">
                {status === "ok" ? "" : status === "addR" ? "추가요청" : <div className="text-red-500">삭제요청</div>}
            </td>

        </tr>
    )
}

export default TableRow;
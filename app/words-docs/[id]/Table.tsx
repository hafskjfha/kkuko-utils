"use client";
import { useState } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, ColumnDef, SortingState } from "@tanstack/react-table";
import TableRow from "./TableRow";

interface WordData {
    word: string;
    status: "ok" | "delR" | "addR";
}

const Table: React.FC<{ initialData: WordData[] }> = ({ initialData }) => {
    const [data, setData] = useState(initialData);
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns: ColumnDef<WordData>[] = [
        {
            accessorFn: (row) => row.word.length,
            id: "length",
            header: "길이",
            cell: (info) => info.getValue(),
            enableSorting: true,
        },
        { accessorKey: "word", header: "단어" },
        { accessorKey: "status", header: "상태" },
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: { sorting },
        onSortingChange: setSorting,
    });

    return (
        <div className="w-full mx-auto p-3">
            <table className="border-collapse border border-gray-300 w-full text-center">
                <thead>
                    <tr className="bg-gray-200">
                        <th
                            className="border px-4 py-2 w-2/10 cursor-pointer whitespace-nowrap"
                            onClick={() => table.getColumn("length")?.toggleSorting()}
                        >
                            <div className="flex items-center justify-center gap-1">
                                길이
                                {table.getState().sorting.find((s) => s.id === "length")?.desc === undefined ? " ↕️" :
                                    table.getState().sorting.find((s) => s.id === "length")?.desc ? " 🔽" : " 🔼"}
                            </div>
                        </th>

                        <th
                            className="border px-4 py-2 w-6/10 cursor-pointer whitespace-nowrap"
                            onClick={() => table.getColumn("word")?.toggleSorting()}
                        >
                            <div className="flex items-center justify-center gap-1">
                                단어
                                {table.getState().sorting.find((s) => s.id === "word")?.desc === undefined ? " ↕️" :
                                    table.getState().sorting.find((s) => s.id === "word")?.desc ? " 🔽" : " 🔼"}
                            </div>
                        </th>

                        <th className="border border-gray-300 px-4 py-2 w-1/10">상태</th>
                        <th className="border border-gray-300 px-4 py-2 w-1/10">작업</th>
                    </tr>
                </thead>
                <tbody className="mb-2">
                    {table.getRowModel().rows.map((row) => {
                        const wordData = row.original;
                        return (
                            <TableRow
                                key={wordData.word}
                                {...wordData}
                                openWork={() => { }}
                            />
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default Table;
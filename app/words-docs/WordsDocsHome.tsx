"use client";
import DocumentCard from "./DocsInfoCard";
import { useEffect, useState } from "react";
import { PostgrestError } from "@supabase/supabase-js";
import type { ErrorMessage } from "../types/type";
import ErrorModal from "../components/ErrModal";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/components/ui/select";

interface Document {
    id: string;
    name: string;
    maker: string;
    last_update: string;
    created_at: string; // 생성일 필드 추가
    is_manager: boolean;
    typez: "letter" | "theme" | "ect";
}

interface WordsDocsHomeProps {
    docs: Document[];
    error: null | PostgrestError;
}

const Button = ({ onClick, className, children }: { onClick: () => void; className?: string; children: React.ReactNode }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition ${className}`}
    >
        {children}
    </button>
);

const WordsDocsHome = ({ docs, error }: WordsDocsHomeProps) => {
    const typeOrder = ['letter', 'theme', 'ect'];

    const [expandedTypes, setExpandedTypes] = useState<{ [key: string]: boolean }>(
        typeOrder.reduce((acc, type) => ({ ...acc, [type]: true }), {})
    );

    const [sortOptions, setSortOptions] = useState<{ [key: string]: string }>(
        typeOrder.reduce((acc, type) => ({ ...acc, [type]: "last_update" }), {})
    );

    const [errork, setError] = useState<ErrorMessage | null>(null);

    useEffect(() => {
        if (error) {
            setError({
                ErrName: error.name,
                ErrMessage: error.message,
                ErrStackRace: error.stack,
                inputValue: null,
            });
        }
    }, []);

    const toggleType = (typez: string) => {
        setExpandedTypes(prev => ({ ...prev, [typez]: !prev[typez] }));
    };

    const handleSortChange = (typez: string, sortType: string) => {
        setSortOptions(prev => ({ ...prev, [typez]: sortType }));
    };

    const sortDocs = (docs: Document[], sortType: string) => {
        const sorted = [...docs];
        switch (sortType) {
            case "name":
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "created_at":
                sorted.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
                break;
            case "last_update":
            default:
                sorted.sort((a, b) => b.last_update.localeCompare(a.last_update));
                break;
        }
        return sorted;
    };

    const groupedDocs = docs.reduce<{ [key: string]: Document[] }>((acc, doc) => {
        acc[doc.typez] = acc[doc.typez] || [];
        acc[doc.typez].push(doc);
        return acc;
    }, {});

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
            {typeOrder.map((typez) => (
                <div key={typez} className="w-full max-w-4xl mb-6">
                    <Button
                        onClick={() => toggleType(typez)}
                        className="w-full text-left font-semibold text-lg flex items-center justify-between"
                    >
                        <span>{typez} ({groupedDocs[typez]?.length || 0})</span>
                        {expandedTypes[typez] ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </Button>

                    <AnimatePresence initial={false}>
                        {expandedTypes[typez] && groupedDocs[typez] && (
                            <motion.div
                                key={typez}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="flex justify-end mb-2">
                                    <Select value={sortOptions[typez]} onValueChange={(v) => handleSortChange(typez, v)}>
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue placeholder="정렬기준 선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="last_update">마지막 업데이트순</SelectItem>
                                            <SelectItem value="created_at">생성일순</SelectItem>
                                            <SelectItem value="name">이름 가나다순</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    {sortDocs(groupedDocs[typez], sortOptions[typez]).map((doc) => (
                                        <DocumentCard
                                            key={doc.id}
                                            id={doc.id}
                                            name={doc.name}
                                            last_update={doc.last_update}
                                            is_manager={doc.is_manager}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            ))}
            {errork && <ErrorModal error={errork} onClose={() => setError(null)} />}
        </div>
    );
};

export default WordsDocsHome;

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { disassemble } from "es-hangul";
import { noInjungTopic } from "./const";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/app/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import { supabase } from "@/app/lib/supabaseClient";
import useSWR from "swr";
import Spinner from "@/app/components/Spinner";


const calculateKoreanInitials = (word: string): string => {
    return word.split("").map((c) => disassemble(c)[0]).join("");
};

const filterTopi = (a: string, b: string) => {
    if (b === "") return true;
    let indexA = 0;
    let indexB = 0;

    while (indexA < a.length && indexB < b.length) {
        if (
            a[indexA] === b[indexB] ||
            (("ㄱ" <= b[indexB] && b[indexB] <= "ㅎ") &&
                calculateKoreanInitials(a[indexA]) ===
                calculateKoreanInitials(b[indexB]))
        ) {
            indexB++;
        }
        indexA++;
    }

    return indexB === b.length;
};

const fetcher = async () => {
    const { data, error } = await supabase.from("themes").select("*");
    if (error) throw error;
    return data;
}

const TopicFlexList = React.memo(({ topics, selectedTopics, onChange }: {
    topics: [string, string][],
    selectedTopics: string[],
    onChange: (topicCode: string) => void
}) => {

    return (
        <div className="flex flex-wrap gap-2 overflow-y-auto h-48">
            {topics.map(([label, code]) => (
                <label
                    key={code}
                    className="text-sm font-medium flex items-center w-1/4 text-gray-800 dark:text-gray-100"
                >
                    <input
                        type="checkbox"
                        onChange={() => onChange(code)}
                        checked={selectedTopics.includes(code)}
                        className="mr-2"
                    />
                    {label}
                </label>

            ))}
        </div>
    );
})

const WordAddForm = ({ }) => {
    const [word, setWord] = useState<string>("");
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [groupVisibility, setGroupVisibility] = useState({
        noInjung: false,
        other: false,
    });
    const [searchTermNoInjung, setSearchTermNoInjung] = useState("");
    const [searchTermOther, setSearchTermOther] = useState("");
    const [invalidWord, setInvalidWord] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const { data, isLoading } = useSWR("themes", fetcher);
    const [topicInfo, setTopicInfo] = useState<{ topicsCode: Record<string, string>, topicsKo: Record<string, string> }>({ topicsCode: {}, topicsKo: {} })


    const onSave = (word: string, selectedTopics: string[]) => {
    }

    useEffect(() => {
        if (!data) return;
        const newTopicsCode = data.reduce((acc, d) => ({ ...acc, [d.code]: d.name }), {});
        const newTopicsKo = data.reduce((acc, d) => ({ ...acc, [d.name]: d.code }), {});
        setTopicInfo({ topicsCode: newTopicsCode, topicsKo: newTopicsKo })
    }, [data]);


    const groupedTopics = useMemo(() => {
        const noInjung = Object.entries(topicInfo.topicsKo)
            .filter(([label]) => noInjungTopic.includes(label))
            .sort((a, b) => a[0].localeCompare(b[0]));
        const other = Object.entries(topicInfo.topicsKo)
            .filter(([label]) => !noInjungTopic.includes(label))
            .sort((a, b) => a[0].localeCompare(b[0]));
        return { noInjung, other };
    }, [topicInfo]);

    const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWord(e.target.value);
        const regex = /^[0-9ㄱ-힣]*$/;
        let p = false;
        const regex1 = /[0-9ㄱ-ㅎ]+/;
        for (const c of e.target.value) {
            if (!regex1.test(disassemble(c)[0])) {
                p = true;
                break;
            }
        }
        setInvalidWord(!regex.test(e.target.value) || p);
    };

    const handleTopicChange = React.useCallback((topicCode: string) => {
        setSelectedTopics((prev) =>
            prev.includes(topicCode)
                ? prev.filter((code) => code !== topicCode)
                : [...prev, topicCode]
        );
    }, [])

    const toggleGroupVisibility = (group: "noInjung" | "other") => {
        setGroupVisibility((prev) => ({ ...prev, [group]: !prev[group] }));
    };

    const wordInfo = {
        firstLetter: word.charAt(0) || "-",
        lastLetter: word.charAt(word.length - 1) || "-",
        length: word.length,
        initials: calculateKoreanInitials(word) || "-",
    };

    return (
        <div className="flex flex-col lg:flex-row lg:flex-wrap gap-6 flex-1 min-h-0">
            {isLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 rounded-lg" >
                    <Spinner />
                </div>
            )}
            {/* 입력 카드 */}
            <Card className="w-full lg:flex-1 flex flex-col max-h-[calc(100vh-6rem)] shrink-0 min-w-0 ">
                <CardHeader>
                    <h3 className="text-2xl font-semibold">단어 정보 입력</h3>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 flex-1 overflow-y-auto min-w-0">
                    {/* 단어 입력 */}
                    <div className="space-y-2">
                        <Input
                            value={word}
                            onChange={handleWordChange}
                            placeholder="단어를 입력하세요"
                            disabled={isSaving}
                        />
                        {invalidWord && (
                            <p className="text-red-500 text-sm">한글과 숫자만 입력할 수 있습니다.</p>
                        )}
                    </div>

                    {/* 저장 버튼 */}
                    <div className="flex justify-between items-center">
                        <strong className="text-lg">주제 선택</strong>
                        <Button
                            onClick={() => {
                                setIsSaving(true);
                                onSave(word, selectedTopics);
                                setIsSaving(false);
                            }}
                            disabled={word.length === 0 || selectedTopics.length === 0 || invalidWord || isSaving}
                        >
                            저장
                        </Button>
                    </div>

                    {/* 노인정 Collapsible */}
                    <Collapsible
                        open={groupVisibility.noInjung}
                        onOpenChange={() => toggleGroupVisibility("noInjung")}
                    >
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 w-full justify-start">
                                <ChevronDown
                                    className={`transition-transform ${groupVisibility.noInjung ? "rotate-180" : ""}`}
                                />
                                노인정
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="w-full">
                            {groupVisibility.noInjung &&
                                (<>
                                    <Input
                                        value={searchTermNoInjung}
                                        onChange={(e) => setSearchTermNoInjung(e.target.value)}
                                        placeholder="주제 검색"
                                        className="my-2"
                                    />
                                    <ScrollArea className="h-48 border rounded-md p-2 w-full">
                                        <div className="flex flex-wrap gap-4">
                                            <TopicFlexList
                                                topics={groupedTopics.noInjung.filter(([label]) => label.includes(searchTermNoInjung))}
                                                selectedTopics={selectedTopics}
                                                onChange={handleTopicChange}
                                            />
                                        </div>
                                    </ScrollArea>
                                </>)
                            }
                        </CollapsibleContent>
                    </Collapsible>

                    {/* 어인정 Collapsible */}
                    <Collapsible
                        open={groupVisibility.other}
                        onOpenChange={() => toggleGroupVisibility("other")}
                    >
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 w-full justify-start">
                                <ChevronDown
                                    className={`transition-transform ${groupVisibility.other ? "rotate-180" : ""}`}
                                />
                                어인정
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="w-full">
                            {groupVisibility.other &&
                                (<>
                                    <Input
                                        value={searchTermOther}
                                        onChange={(e) => setSearchTermOther(e.target.value)}
                                        placeholder="주제 검색"
                                        className="my-2"
                                    />
                                    <ScrollArea className="h-48 border rounded-md p-2 w-full">
                                        <div className="flex flex-wrap gap-4">
                                            <TopicFlexList
                                                topics={groupedTopics.other.filter(([label]) => filterTopi(label, searchTermOther))}
                                                selectedTopics={selectedTopics}
                                                onChange={handleTopicChange}
                                            />
                                        </div>
                                    </ScrollArea>
                                </>)
                            }
                        </CollapsibleContent>
                    </Collapsible>
                </CardContent>
            </Card>

            {/* 정보 카드 */}
            <Card className="w-full lg:flex-1 flex flex-col max-h-[calc(100vh-6rem)] shrink-0 min-w-0">
                <CardHeader>
                    <h3 className="text-2xl font-semibold">단어 정보</h3>
                </CardHeader>
                <CardContent className="space-y-4 text-sm flex-1 overflow-y-auto">
                    <div>
                        <strong className="block mb-1">단어 정보:</strong>
                        <p>단어: {word}</p>
                        <p>첫 글자: {wordInfo.firstLetter}</p>
                        <p>끝 글자: {wordInfo.lastLetter}</p>
                        <p>길이: {wordInfo.length}</p>
                        <p>한글 초성: {wordInfo.initials}</p>
                    </div>
                    <div>
                        <strong className="block mb-1">주제 및 주제 코드:</strong>
                        <p>
                            주제:{" "}
                            {selectedTopics.length > 0
                                ? selectedTopics.map((code) => topicInfo.topicsCode[code]).join(", ")
                                : "-"}
                        </p>
                        <p>코드: {selectedTopics.join(", ") || "-"}</p>
                    </div>
                </CardContent>
            </Card>
        </div>


    );
};

export default WordAddForm;

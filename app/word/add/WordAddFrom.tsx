"use client";

import React, { useEffect, useMemo, useState } from "react";
import { disassemble } from "es-hangul";
import { noInjungTopic } from "../const";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/app/components/ui/collapsible";
import { Badge } from "@/app/components/ui/badge";
import { ChevronDown, Save, Search, Info, AlertTriangle, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/app/components/ui/card";
import { supabase } from "@/app/lib/supabaseClient";
import useSWR from "swr";
import { useSelector } from 'react-redux';
import { RootState } from "@/app/store/store";
import ErrorModal from "@/app/components/ErrModal";
import CompleteModal from "@/app/components/CompleteModal";
import LoginRequiredModal from "@/app/components/LoginRequiredModal";
import FailModal from "@/app/components/FailModal";
import { fetcher } from "../lib";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip";

// Define type for ErrorMessage
interface ErrorMessage {
  ErrMessage: string;
  ErrName: string;
  ErrStackRace: string;
  inputValue: string;
}

// Utility function to calculate Korean initials
const calculateKoreanInitials = (word: string) => {
    return word.split("").map((c) => disassemble(c)[0]).join("");
};

// Utility function for Korean search filtering
const filterKoreanText = (text: string, search: string) => {
    if (search === "") return true;
    let indexText = 0;
    let indexSearch = 0;

    while (indexText < text.length && indexSearch < search.length) {
        if (
            text[indexText] === search[indexSearch] ||
            (("ㄱ" <= search[indexSearch] && search[indexSearch] <= "ㅎ") &&
                calculateKoreanInitials(text[indexText]) === calculateKoreanInitials(search[indexSearch]))
        ) {
            indexSearch++;
        }
        indexText++;
    }

    return indexSearch === search.length;
};

type TopicItemProps = {
    label: string;
    code: string;
    isSelected: boolean;
    onChange: (code: string) => void;
};

// Topic selection component with better visual feedback
const TopicItem = React.memo(({ 
    label, 
    code, 
    isSelected, 
    onChange 
}:TopicItemProps) => {
    return (
        <label
            className={`flex items-center p-2 rounded cursor-pointer transition-colors 
                        ${isSelected 
                            ? "bg-primary/20 hover:bg-primary/30" 
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
        >
            <input
                type="checkbox"
                onChange={() => onChange(code)}
                checked={isSelected}
                className="mr-2 h-4 w-4"
            />
            <span className="truncate">{label}</span>
        </label>
    );
});

TopicItem.displayName = "TopicItem";

type TopicsListProps = {
    topics: [string, string][];
    selectedTopics: string[];
    onChange: (code: string) => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
};

// Topic list component with search functionality
const TopicsList = React.memo(({ 
    topics, 
    selectedTopics, 
    onChange, 
    searchTerm, 
    onSearchChange 
}:TopicsListProps) => {
    return (
        <div className="space-y-3 w-full">
            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="주제 검색"
                    className="pl-8"
                />
            </div>
            
            <ScrollArea className="h-48 border rounded-md p-1 w-full">
                <div className="grid grid-cols-2 gap-1">
                    {topics.length > 0 ? topics.map(([label, code]) => (
                        <TopicItem
                            key={code}
                            label={label}
                            code={code}
                            isSelected={selectedTopics.includes(code)}
                            onChange={onChange}
                        />
                    )) : (
                        <div className="col-span-2 flex items-center justify-center h-32 text-gray-500">
                            검색 결과가 없습니다
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
});

TopicsList.displayName = "TopicsList";

type TopicSectionProps = {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    topics: [string, string][];
    selectedTopics: string[];
    onChange: (code: string) => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
};

// Topic section with collapsible UI
const TopicSection = ({ 
    title, 
    isOpen, 
    onToggle, 
    topics, 
    selectedTopics, 
    onChange, 
    searchTerm, 
    onSearchChange 
}:TopicSectionProps) => {
    return (
        <Collapsible open={isOpen} onOpenChange={onToggle} className="border rounded-md">
            <CollapsibleTrigger asChild>
                <Button 
                    variant="ghost" 
                    className="flex items-center justify-between w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                    <span className="font-medium">{title}</span>
                    <ChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3">
                {isOpen && (
                    <TopicsList
                        topics={topics}
                        selectedTopics={selectedTopics}
                        onChange={onChange}
                        searchTerm={searchTerm}
                        onSearchChange={onSearchChange}
                    />
                )}
            </CollapsibleContent>
        </Collapsible>
    );
};

type SelectedTopic = {
    code: string;
    label: string;
};
  
type SelectedTopicsProps = {
    topics: SelectedTopic[];
    onRemove: (code: string) => void;
};

// Selected topics display component
const SelectedTopics = ({ topics, onRemove }: SelectedTopicsProps) => {
    if (topics.length === 0) {
        return (
            <div className="text-gray-500 italic text-sm">
                선택된 주제가 없습니다. 주제를 선택해 주세요.
            </div>
        );
    }
    
    return (
        <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
                <Badge 
                    key={topic.code} 
                    variant="secondary"
                    className="flex items-center gap-1 py-1"
                >
                    {topic.label}
                    <button 
                        onClick={() => onRemove(topic.code)}
                        className="hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-0.5"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>
            ))}
        </div>
    );
};

type InfoItemProps = {
    label: string;
    value: string | number;
};

// Info item for word details
const InfoItem = ({ label, value }:InfoItemProps) => (
    <div className="flex justify-between items-center py-1.5 border-b last:border-b-0">
        <span className="w-12 text-sm font-medium text-gray-600 whitespace-nowrap">{label}</span>
        <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{value}</span>
    </div>
);

interface TopicInfo {
    topicsCode: Record<string, string>;
    topicsKo: Record<string, string>;
    topicsID: Record<string, number>;
}

type WordAddFormProps = {
    compleSave?: (id: number, setErrorModalView: (data: ErrorMessage) => void) => Promise<void>;
};

// Main component
const WordAddForm = ({ compleSave }:WordAddFormProps) => {
    const [word, setWord] = useState<string>("");
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [groupVisibility, setGroupVisibility] = useState<{ noInjung: boolean; other: boolean }>({
        noInjung: false,
        other: false,
    });
    const [searchTermNoInjung, setSearchTermNoInjung] = useState("");
    const [searchTermOther, setSearchTermOther] = useState("");
    const [invalidWord, setInvalidWord] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { data, error, isLoading } = useSWR("themes", fetcher);
    const [topicInfo, setTopicInfo] = useState<TopicInfo>({
        topicsCode: {},
        topicsKo: {},
        topicsID: {}
    });
    const [errorModalView, setErrorModalView] = useState<ErrorMessage|null>(null);
    const [completeState, setCompleteState] = useState<{word:string, selectedTheme:string,onClose:()=> void}|null>(null);
    const [workFail, setWorkFail] = useState<string|null>(null);
    const user = useSelector((state: RootState) => state.user);
    const [isLogin, setIsLogin] = useState(!!user.uuid);

    useEffect(() => {
        setIsLogin(!!user.uuid);
    }, [user]);

    useEffect(() => {
        if (error) {
            setErrorModalView({
                ErrMessage: "An error occurred while fetching data.",
                ErrName: "ErrorFetchingData",
                ErrStackRace: "",
                inputValue: "themes fetch"
            });
        }
    }, [error]);

    // Transform API data into usable format
    useEffect(() => {
        if (!data) return;
        const newTopicsCode: Record<string, string> = {};
        const newTopicsKo: Record<string, string> = {};
        const newTopicID: Record<string, number> = {};
        
        data.forEach((d: {code: string, name: string, id: number}) => {
            newTopicsCode[d.code] = d.name;
            newTopicsKo[d.name] = d.code;
            newTopicID[d.code] = d.id;
        });
        
        setTopicInfo({ 
            topicsCode: newTopicsCode, 
            topicsKo: newTopicsKo, 
            topicsID: newTopicID 
        });
    }, [data]);

    useEffect(() => {
        setIsSaving(isLoading);
    }, [isLoading]);

    // Group topics into categories
    const groupedTopics = useMemo(() => {
        const noInjung = Object.entries(topicInfo.topicsKo)
            .filter(([label]) => noInjungTopic.includes(label))
            .sort((a, b) => a[0].localeCompare(b[0]))
            .filter(([label]) => filterKoreanText(label, searchTermNoInjung));
            
        const other = Object.entries(topicInfo.topicsKo)
            .filter(([label]) => !noInjungTopic.includes(label))
            .sort((a, b) => a[0].localeCompare(b[0]))
            .filter(([label]) => filterKoreanText(label, searchTermOther));
            
        return { noInjung, other };
    }, [topicInfo, searchTermNoInjung, searchTermOther]);

    // Generate word information for display
    const wordInfo = useMemo(() => ({
        firstLetter: word.charAt(0) || "-",
        lastLetter: word.charAt(word.length - 1) || "-",
        length: word.length,
        initials: calculateKoreanInitials(word) || "-",
    }), [word]);

    // Validate Korean word input
    const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newWord = e.target.value;
        setWord(newWord);
        
        const regex = /^[0-9ㄱ-힣]*$/;
        let hasInvalidChar = false;
        
        if (newWord) {
            const regex1 = /[0-9ㄱ-ㅎ]+/;
            for (const c of newWord) {
                if (!regex1.test(disassemble(c)[0])) {
                    hasInvalidChar = true;
                    break;
                }
            }
        }
        
        setInvalidWord(!regex.test(newWord) || hasInvalidChar);
    };

    // Toggle topic selection
    const handleTopicChange = React.useCallback((topicCode: string) => {
        setSelectedTopics((prev) =>
            prev.includes(topicCode)
                ? prev.filter((code) => code !== topicCode)
                : [...prev, topicCode]
        );
    }, []);

    // Remove a selected topic
    const handleRemoveTopic = (topicCode: string) => {
        setSelectedTopics((prev) => prev.filter((code) => code !== topicCode));
    };

    // Toggle section visibility
    const toggleGroupVisibility = (group: keyof typeof groupVisibility) => {
        setGroupVisibility((prev) => ({ ...prev, [group]: !prev[group] }));
    };

    // Get selected topics with labels for display
    const selectedTopicsWithLabels = useMemo(() => {
        return selectedTopics.map(code => ({
            code,
            label: topicInfo.topicsCode[code] || code
        }));
    }, [selectedTopics, topicInfo.topicsCode]);

    // Handle word save
    const onSave = async () => {
        if (isSaving) return;
        if (!user.uuid) return;
        
        setIsSaving(true);
        
        try {
            // Check if word already exists
            const { data: existingWord, error: exstedCheckError } = await supabase
                .from('words')
                .select('id')
                .eq('word', word);
                
            if (exstedCheckError) {
                throw exstedCheckError;
            }

            if (existingWord && existingWord.length > 0) {
                setWorkFail("이미 존재하는 단어입니다.");
                setIsSaving(false);
                return;
            }

            // Insert word into wait list
            const insertWaitWordData = {
                word,
                requested_by: user.uuid,
                request_type: "add" as const
            };
            
            const { data: insertedWaitWord, error: insertedWaitWordError } = await supabase
                .from('wait_words')
                .insert(insertWaitWordData)
                .select('*');
                
            if (insertedWaitWordError) {
                if (insertedWaitWordError.code === '23505') {
                    setWorkFail("이미 요청이 들어온 단어입니다.");
                    setIsSaving(false);
                    return;
                }
                throw insertedWaitWordError;
            }

            // Insert selected topics
            if (insertedWaitWord && insertedWaitWord.length > 0) {
                const insertWaitWordTopicsData = selectedTopics
                    .filter(tc => topicInfo.topicsID[tc])
                    .map(tc => ({
                        wait_word_id: insertedWaitWord[0].id,
                        theme_id: topicInfo.topicsID[tc]
                    }));
                    
                const { error: insertWaitWordTopicsDataError } = await supabase
                    .from('wait_word_themes')
                    .insert(insertWaitWordTopicsData);
                    
                if (insertWaitWordTopicsDataError) {
                    throw insertWaitWordTopicsDataError;
                }

                // Call completion callback if provided
                if (compleSave) {
                    
                    // Show completion state
                    setCompleteState({
                        word: word,
                        selectedTheme: selectedTopics.map(code => topicInfo.topicsCode[code]).join(', '),
                        onClose: async () => {
                            setCompleteState(null);
                            await compleSave?.(insertedWaitWord[0].id, setErrorModalView);
                        }
                    });
                } else {
                    setCompleteState({
                        word: word,
                        selectedTheme: selectedTopics.map(code => topicInfo.topicsCode[code]).join(', '),
                        onClose: () => {
                            setCompleteState(null);
                        }
                    });
                }
                
                // Reset form
                setWord("");
                setSelectedTopics([]);
            }
            
        } catch (error: any) {
            setErrorModalView({
                ErrName: error.name || "Unknown Error",
                ErrMessage: error.message || "An unknown error occurred",
                ErrStackRace: error.stack || "",
                inputValue: `word: ${word}, selected themes: ${selectedTopics.join(", ")}`
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 relative">
            {/* Loading overlay */}
            {isSaving && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
                        <Loader2 className="h-5 w-5 animate-spin" size={"lg"} />
                        <p className="mt-4 font-medium">저장 중...</p>
                    </div>
                </div>
            )}

            {/* Input card */}
            <Card className="w-full lg:w-[60%] flex flex-col max-h-[calc(100vh-6rem)]">
                <CardHeader className="pb-2">
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <span>단어 정보 입력</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="w-64">한글 단어와 관련 주제를 입력하세요</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </CardTitle>
                </CardHeader>
                
                <CardContent className="flex flex-col gap-4 overflow-y-auto">
                    {/* Word input section */}
                    <div className="space-y-2">
                        <label className="font-medium text-sm">단어</label>
                        <div>
                            <Input
                                value={word}
                                onChange={handleWordChange}
                                placeholder="단어를 입력하세요"
                                className={invalidWord ? "border-red-500 focus-visible:ring-red-500" : ""}
                                disabled={isSaving}
                            />
                            {invalidWord && (
                                <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    <span>한글과 숫자만 입력할 수 있습니다.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Selected topics display */}
                    <div className="space-y-2">
                        <label className="font-medium text-sm">선택된 주제</label>
                        <div className="min-h-10 bg-gray-50 dark:bg-gray-800 rounded-md p-2">
                            <SelectedTopics 
                                topics={selectedTopicsWithLabels} 
                                onRemove={handleRemoveTopic} 
                            />
                        </div>
                    </div>

                    {/* Topics selection */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="font-medium text-sm">주제 선택</label>
                            <span className="text-xs text-gray-500">
                                {selectedTopics.length} 개 선택됨
                            </span>
                        </div>
                        
                        <div className="space-y-3">
                            {/* 노인정 Topics */}
                            <TopicSection
                                title="노인정"
                                isOpen={groupVisibility.noInjung}
                                onToggle={() => toggleGroupVisibility("noInjung")}
                                topics={groupedTopics.noInjung}
                                selectedTopics={selectedTopics}
                                onChange={handleTopicChange}
                                searchTerm={searchTermNoInjung}
                                onSearchChange={setSearchTermNoInjung}
                            />
                            
                            {/* 어인정 Topics */}
                            <TopicSection
                                title="어인정"
                                isOpen={groupVisibility.other}
                                onToggle={() => toggleGroupVisibility("other")}
                                topics={groupedTopics.other}
                                selectedTopics={selectedTopics}
                                onChange={handleTopicChange}
                                searchTerm={searchTermOther}
                                onSearchChange={setSearchTermOther}
                            />
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="pt-2 mt-auto">
                    <Button
                        className="w-full"
                        onClick={onSave}
                        disabled={word.length === 0 || selectedTopics.length === 0 || invalidWord || isSaving}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        단어 저장
                    </Button>
                </CardFooter>
            </Card>

            {/* Info card */}
            <Card className="w-full lg:w-[40%] flex flex-col max-h-[calc(100vh-6rem)]">
                <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">단어 정보</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-6 overflow-y-auto">
                    {/* Word details */}
                    <div className="space-y-1">
                        <h4 className="font-medium text-sm text-gray-500">단어 특성</h4>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                            <InfoItem label="단어" value={word || "-"} />
                            <InfoItem label="길이" value={wordInfo.length || "0"} />
                            <InfoItem label="첫 글자" value={wordInfo.firstLetter} />
                            <InfoItem label="끝 글자" value={wordInfo.lastLetter} />
                            <InfoItem label="한글 초성" value={wordInfo.initials} />
                        </div>
                    </div>
                    
                    {/* Topics details */}
                    <div className="space-y-1">
                        <h4 className="font-medium text-sm text-gray-500">주제 정보</h4>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                            <InfoItem 
                                label="주제" 
                                value={selectedTopics.length > 0 
                                    ? selectedTopics.map(code => topicInfo.topicsCode[code]).join(", ")
                                    : "-"} 
                            />
                            <InfoItem 
                                label="코드" 
                                value={selectedTopics.join(", ") || "-"} 
                            />
                        </div>
                    </div>
                    
                </CardContent>
            </Card>

            {/* Modals */}
            {errorModalView && 
                <ErrorModal 
                    error={errorModalView} 
                    onClose={() => setErrorModalView(null)} 
                />
            }
            
            {completeState && 
                <CompleteModal 
                    open={!!completeState} 
                    onClose={completeState.onClose} 
                    title="단어 추가 요청이 완료되었습니다." 
                    description={`단어: ${completeState.word} 주제: ${completeState.selectedTheme}의 추가요청이 완료되었습니다.`}
                />
            }
            
            {workFail && 
                <FailModal 
                    open={!!workFail} 
                    onClose={() => setWorkFail(null)} 
                    description={workFail}
                />
            }
            
            {!isLogin && 
                <LoginRequiredModal 
                    open={!isLogin} 
                    onClose={() => setIsLogin(true)}
                />
            }
        </div>
    );
};

export default WordAddForm;
"use client";
import React, { useRef, useState, useEffect, useMemo } from "react";
import TableOfContents from "./TableOfContents";
import WordsTableBody from "./WordsTableBody";
import Link from "next/link";
import type { WordData } from "@/app/types/type";
import { DefaultDict } from "@/app/lib/collections";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Star } from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import LoginRequiredModal from "@/app/components/LoginRequiredModal";
import { PostgrestError } from "@supabase/supabase-js";
import ErrorModal from "@/app/components/ErrModal";
import { disassemble } from "es-hangul";

const CHOSEONG_LIST = [
  "ㄱ", "ㄴ", "ㄷ", "ㄹ",
  "ㅁ", "ㅂ", "ㅅ", "ㅇ",
  "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

interface DocsPageProp {
    id: number;
    data: WordData[];
    metaData: {
        title: string;
        lastUpdate: string;
        typez: "letter" | "theme" | "ect"
    };
    starCount: number;
    isUserStarred: boolean;
}

const DocsDataPage = ({ id, data, metaData, starCount, isUserStarred }: DocsPageProp) => {
    const refs = useRef<{ [key: string]: React.RefObject<HTMLDivElement | null> }>({});
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const [_, setRefsState] = useState<{ [key: string]: React.RefObject<HTMLDivElement | null> }>({});
    const [tocList, setTocList] = useState<string[]>([]);
    const [wordsData,setWordsData] = useState<WordData[]>([]);
    const [isLoading, setIsLoading] = useState(true); // ✅ 스켈레톤 상태
    const [isUserStarreda, setIsUserStarreda] = useState<boolean>(isUserStarred);
    const user = useSelector((state: RootState) => state.user);
    const [loginNeedModalOpen, setLoginNeedModalOpen] = useState<boolean>(false);
    const [errorModalView, seterrorModalView] = useState<ErrorMessage | null>(null);
    const [selectChGroup,setSelectChGroup] = useState<string>('ㄱ');
    const [grgr,setgrgr] = useState<Record<string,WordData[]>>({});

    useEffect(()=>{
        const k = makeChouGr(data);
        setgrgr(k);
        setWordsData(k['ㄱ'] ?? [])
    },[])

    const makeChouGr = (words: WordData[]) => {
        const grWords: Record<string,WordData[]> = {};
        const p: Record<string,string> = {"ㄲ":"ㄱ","ㄸ":"ㄷ","ㅉ":'ㅈ','ㅃ':'ㅂ','ㅆ':'ㅅ'};
        for (const data of words){
            const ch = disassemble(data.word)[0];
            grWords[p[ch] || ch] = [...(grWords[p[ch] || ch] ?? []), data]
        }
        return grWords;
    }

    // refs 초기화
    useEffect(() => {
        const newRefs: { [key: string]: React.RefObject<HTMLDivElement | null> } = {};
        tocList.forEach((title) => {
            newRefs[title] = refs.current[title] || React.createRef<HTMLDivElement>();
        });

        refs.current = newRefs;
        setRefsState(newRefs);
    }, [tocList]);

    const groupWordsBySyllable = (data: WordData[]) => {
        const grouped = new DefaultDict<string, WordData[]>(() => []);
        data.forEach((item) => {
            const firstSyllable = item.word[0].toLowerCase();
            grouped.get(firstSyllable).push(item);
        });
        return grouped;
    };

    const memoizedGrouped = useMemo(() => {
        return groupWordsBySyllable(wordsData);
    }, [wordsData]);

    const updateToc = (data: WordData[]) => {
        return [...new Set(data.map((v) => v.word[0]))].sort((a, b) => a.localeCompare(b, "ko"));
    };


    useEffect(() => {
        setTocList(updateToc(wordsData));
        setIsLoading(false); // ✅ 로딩 완료
    }, [wordsData]);

    const items = tocList.map((title) => ({
        title,
        ref: refs.current[title],
    }));

    const lastUpdateDate = new Date(metaData.lastUpdate);
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localTime = lastUpdateDate.toLocaleString(undefined, { timeZone: userTimeZone });

    const handleDownload = () => {
        const wordsText = wordsData
            .map((w) => w.word)
            .sort((a, b) => a.localeCompare(b, "ko"))
            .join("\n");

        const formattedDate = new Date(metaData.lastUpdate).toISOString().slice(0, 10);
        const fileName = `${metaData.title} 단어장(${formattedDate}).txt`;

        const blob = new Blob([wordsText], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const hadnleDocsStar = async () => {
        console.log(user)
        if (!user.uuid) {
            return setLoginNeedModalOpen(true);
        }
        if (isUserStarreda) {
            const { error } = await supabase.from('user_star_docs').delete().eq('docs_id', id).eq('user_id', user.uuid);
            if (error) return makeError(error)
        } else {
            const { error } = await supabase.from('user_star_docs').insert({ docs_id: id, user_id: user.uuid })
            if (error) return makeError(error);
        }

        setIsUserStarreda(!isUserStarreda)
    }

    const makeError = (error: PostgrestError) => {
        seterrorModalView({
            ErrName: error.name,
            ErrMessage: error.message,
            ErrStackRace: error.stack,
            inputValue: null
        });
    };

    return (
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4">
            {/* 문서 헤더 */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b pb-2">
                <h1 className="text-2xl sm:text-3xl font-bold">{metaData.title}</h1>
                <div className="flex flex-col sm:flex-row gap-2">
                    <div
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 w-full sm:w-auto flex items-center gap-2 hover:cursor-pointer"
                        onClick={hadnleDocsStar}
                    >
                        <Star fill={isUserStarreda ? "gold" : "white"} />
                        <span>
                            {(isUserStarred && !isUserStarreda) ? starCount - 1 : (!isUserStarred && isUserStarreda) ? starCount + 1 : starCount}
                        </span>
                    </div>

                    <Link href={`/words-docs/${id}/info`}>
                        <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 w-full sm:w-auto">
                            문서 정보
                        </button>
                    </Link>
                    <Link href={`/words-docs/${id}/logs`}>
                        <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 w-full sm:w-auto">
                            로그
                        </button>
                    </Link>
                    <button
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 w-full sm:w-auto"
                        onClick={handleDownload}
                    >
                        단어장 다운로드
                    </button>
                </div>
            </div>

            {/* 마지막 업데이트 시간 */}
            <p className="text-sm text-gray-500 mt-2">마지막 업데이트: {localTime}</p>

            {/* 초성 선택 UI */}
            <div className="flex flex-wrap gap-2 mt-4">
  {CHOSEONG_LIST.map((ch) => {
    const isDisabled = (grgr[ch]?.length ?? 0) === 0;

    return (
      <button
        key={ch}
        onClick={() => {
          if (!isDisabled) {
            setSelectChGroup(ch);
            setWordsData(grgr[ch]);
          }
        }}
        disabled={isDisabled}
        className={`px-3 py-1 rounded-full border transition
          ${selectChGroup === ch ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}
          ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-blue-400 hover:text-white'}
        `}
      >
        {ch}
      </button>
    );
  })}
</div>



            {/* 목차 */}
            <div className="mt-4 p-2">
                <TableOfContents items={items} />
            </div>

            {/* 단어 테이블 or 스켈레톤 */}
            <div>
                {isLoading ? (
                    // ✅ 스켈레톤 UI
                    Array.from({ length: 5 }).map((_, idx) => (
                        <div key={idx} className="mt-6">
                            <Skeleton height={28} width={80} className="mb-2" />
                            <Skeleton height={40} count={3} className="mb-4" />
                        </div>
                    ))
                ) : (
                    // ✅ 실제 데이터 렌더링
                    items.map(({ title, ref }) => (
                        <div key={title} ref={ref} className="mt-4">
                            <WordsTableBody title={title} initialData={memoizedGrouped.get(title)} id={`${id}`} aoK={metaData.typez === "ect"} />
                        </div>
                    ))
                )}
            </div>
            {loginNeedModalOpen && (
                <LoginRequiredModal open={loginNeedModalOpen} onClose={() => setLoginNeedModalOpen(false)} />
            )}
            {errorModalView && (
                <ErrorModal
                    onClose={() => seterrorModalView(null)}
                    error={errorModalView}
                />
            )}
        </div>
    );
};

export default DocsDataPage;

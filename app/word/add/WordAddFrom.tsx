"use client";

import React, { useEffect, useState } from "react";
import { disassemble } from "es-hangul";
import { noInjungTopic } from "./const";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Label } from "@/app/components/ui/label";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import { supabase } from "@/app/lib/supabaseClient";
import useSWR  from "swr";

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

const WordAddForm = ({  }) => {
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
  const {data, error, isLoading} = useSWR("themes", fetcher);
   

  const onSave = (word: string, selectedTopics: string[]) => {
  }

  const { topicsCode, topicsKo }: { topicsCode: Record<string, string>; topicsKo: Record<string, string> } = {
    topicsCode: { BLA: "블루아카이브", "1": "건설" },
    topicsKo: { 블루아카이브: "BLA", 건설: "1" },
  };

  const groupedTopics = {
    noInjung: Object.entries(topicsKo)
      .filter(([label]) => noInjungTopic.includes(label))
      .sort((a, b) => a[0].localeCompare(b[0])),
    other: Object.entries(topicsKo)
      .filter(([label]) => !noInjungTopic.includes(label))
      .sort((a, b) => a[0].localeCompare(b[0])),
  };

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

  const handleTopicChange = (topicCode: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicCode)
        ? prev.filter((code) => code !== topicCode)
        : [...prev, topicCode]
    );
  };

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
    <div className="flex flex-col lg:flex-row gap-6 h-[80vh] min-w-0">
  {/* 입력 카드 */}
  <Card className="w-full lg:flex-1 flex flex-col min-w-0">
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
          <Input
            value={searchTermNoInjung}
            onChange={(e) => setSearchTermNoInjung(e.target.value)}
            placeholder="주제 검색"
            className="my-2"
          />
          <ScrollArea className="h-48 border rounded-md p-2 w-full">
            <div className="flex flex-wrap gap-4">
              {groupedTopics.noInjung
                .filter(([label]) => label.includes(searchTermNoInjung))
                .map(([label, code]) => (
                  <Label key={code} className="w-1/4 flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedTopics.includes(code)}
                      onCheckedChange={() => handleTopicChange(code)}
                    />
                    {label}
                  </Label>
                ))}
            </div>
          </ScrollArea>
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
          <Input
            value={searchTermOther}
            onChange={(e) => setSearchTermOther(e.target.value)}
            placeholder="주제 검색"
            className="my-2"
          />
          <ScrollArea className="h-48 border rounded-md p-2 w-full">
            <div className="flex flex-wrap gap-4">
              {groupedTopics.other
                .filter(([label]) => filterTopi(label, searchTermOther))
                .map(([label, code]) => (
                  <Label key={code} className="w-1/4 flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedTopics.includes(code)}
                      onCheckedChange={() => handleTopicChange(code)}
                    />
                    {label}
                  </Label>
                ))}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
    </CardContent>
  </Card>

  {/* 정보 카드 */}
  <Card className="w-full lg:flex-1 flex flex-col min-w-0">
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
            ? selectedTopics.map((code) => topicsCode[code]).join(", ")
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

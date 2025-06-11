import { useState } from "react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { FileJson, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";
import { useSelector } from 'react-redux';
import { RootState } from "@/app/store/store";
import ErrorModal from "@/app/components/ErrModal";
import { PostgrestError } from "@supabase/supabase-js";
import { chunk as chunkArray } from "es-toolkit";
import JsonViewer from "./JosnViewer"


type WordData = {
    k_canuse: boolean;
    noin_canuse: boolean;
    themes: string[];
};

type WordEntry = {
    word: string;
} & WordData;

function isWordData(data: unknown): data is WordData {
    if (
        typeof data !== 'object' ||
        data === null
    ) {
        return false;
    }

    const obj = data as Record<string, unknown>;

    return (
        typeof obj.k_canuse === 'boolean' &&
        typeof obj.noin_canuse === 'boolean' &&
        Array.isArray(obj.themes) &&
        obj.themes.every((t) => typeof t === 'string')
    );
}



// 전체 JSON 데이터 구조 (배열 형태)
type JsonData = WordEntry[];

export default function WordsAddHome() {
    // 상태 관리
    const [jsonData, setJsonData] = useState<JsonData | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTask, setCurrentTask] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileUploaded, setFileUploaded] = useState(false);
    const user = useSelector((state: RootState) => state.user);
    const [errorModalView, setErrorModalView] = useState<ErrorMessage | null>(null);

    // 파일 업로드 처리
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const parsed = JSON.parse(content);

                if (
                    typeof parsed !== 'object' ||
                    parsed === null ||
                    Array.isArray(parsed)
                ) {
                    setError('JSON 데이터가 객체 형식이 아닙니다.');
                    setFileUploaded(false);
                    return;
                }

                const parsedData: WordEntry[] = [];

                for (const [word, value] of Object.entries(parsed)) {
                    if (isWordData(value)) {
                        parsedData.push({ word, ...value });
                    } else {
                        setError(`"${word}" 항목의 데이터 형식이 올바르지 않습니다.`);
                        setFileUploaded(false);
                        return;
                    }
                }

                setJsonData(parsedData);
                setFileUploaded(true);
                setError(null);
            } catch {
                setError('JSON 파일 파싱 중 오류가 발생했거나 형식이 올바르지 않습니다.');
                setFileUploaded(false);
            }
        };

        reader.readAsText(file);
    };



    // 처리 버튼 클릭 핸들러
    const handleProcess = async () => {
        if (!jsonData) {
            setError("처리할 JSON 데이터가 없습니다.");
            return;
        }

        setIsProcessing(true);
        setIsModalOpen(true);
        setProgress(0);
        setCurrentTask("데이터 초기화 중...");

        // 처리 로직 시뮬레이션 (실제로는 여기서 처리 로직을 구현하세요)
        await handleDbProcess();
    };

    const makeError = (error: PostgrestError) => {
        setErrorModalView({
            ErrName: error.name,
            ErrMessage: error.message,
            ErrStackRace: error.code,
            inputValue: "admin"
        })
        setIsProcessing(false)
    }

    const handleDbProcess = async () => {
        if (!user.uuid || !jsonData) return setIsProcessing(false);

        setProgress(0);
        setCurrentTask('필요한 정보 가져오는 중...');

        const { data: docsDatas, error: docsDataError } = await supabase.from('docs').select('*');
        if (docsDataError) return makeError(docsDataError);
        const { data: themeData, error: themeError } = await supabase.from('themes').select('*')
        if (themeError) return makeError(themeError);

        const letterDocsInfo: Record<string, number> = {};
        const themeDocsInfo: Record<string, number> = {};
        const themeCodeInfo: Record<string, number> = {}

        docsDatas.filter(({ typez }) => typez === "letter").forEach(({ id, name }) => {
            letterDocsInfo[name] = id
        })
        docsDatas.filter(({ typez }) => typez === "theme").forEach(({ id, name }) => {
            themeDocsInfo[name] = id
        })
        themeData.forEach(({ id, code }) => {
            themeCodeInfo[code] = id
        })

        const wordAddQuery: { word: string, k_canuse: boolean, noin_canuse: boolean, added_by: string }[] = [];
        const themesAddQuery: { word_id: number, theme_id: number }[] = [];
        const logsQuery: { word: string, processed_by: string, make_by: string, r_type: "add", state: "approved" }[] = []
        const docsLogsQuery: { docs_id: number, word: string, add_by: string, type: "add" }[] = []

        const inseredWordMap: Record<string, number> = {};

        for (const data of jsonData) {
            wordAddQuery.push({
                word: data.word,
                k_canuse: data.k_canuse,
                noin_canuse: data.noin_canuse,
                added_by: user.uuid
            })
        }

        const chuckQuerysA = chunkArray(wordAddQuery, 250)
        setProgress(20);
        for (let i = 0; i < chuckQuerysA.length; i++) {
            const chuckQuery = chuckQuerysA[i]
            setCurrentTask(`단어 추가중... ${i}/${chuckQuerysA.length}`);
            const { data: insertedWordsData, error: insertWordError } = await supabase.from('words').upsert(chuckQuery, { ignoreDuplicates: true, onConflict: "word" }).select('*');
            if (insertWordError) {
                return makeError(insertWordError)
            }
            if (!insertedWordsData) {
                continue
            }


            for (const data of insertedWordsData) {
                inseredWordMap[data.word] = data.id
                logsQuery.push({
                    word: data.word,
                    processed_by: user.uuid,
                    make_by: user.uuid,
                    r_type: "add" as const,
                    state: "approved" as const
                })
                const letterDocsId = letterDocsInfo[data.word[data.word.length - 1]]
                if (letterDocsId) {
                    docsLogsQuery.push({
                        docs_id: letterDocsId,
                        word: data.word,
                        add_by: user.uuid,
                        type: "add" as const
                    })
                }
            }
        }

        setProgress(40);
        let addWordCount = 0;
        const needCheckWord: string[] = [];
        for (const data of jsonData) {
            const wordId = inseredWordMap[data.word]
            if (wordId) {
                addWordCount += 1;
                for (const theme of data.themes) {
                    const themeId = themeCodeInfo[theme]
                    if (themeId) {
                        themesAddQuery.push({
                            word_id: wordId,
                            theme_id: themeId
                        })
                    }
                }
            } else {
                needCheckWord.push(data.word)
            }
        }

        setProgress(50);
        const needCheckedWordsDatas:{id: number, word: string}[] = []
        const abab = chunkArray(needCheckWord,100)
        for (let i=0;i<abab.length;i++){
            const chuckChecks = abab[i];
            setCurrentTask(`기존단어 체크중... ${i}/${abab.length}`);
            const { data: needCheckedWordsData, error: ff } = await supabase.from('words').select('id,word').in('word', chuckChecks);
            if (ff) return makeError(ff)
            needCheckedWordsDatas.push(...needCheckedWordsData)
        }
        

        const checkedData: Record<string, number> = {};
        for (const data of needCheckedWordsDatas) {
            checkedData[data.word] = data.id
        }

        for (const data of jsonData) {
            const exWordId = checkedData[data.word]
            if (exWordId) {
                for (const theme of data.themes) {
                    const themeId = themeCodeInfo[theme]
                    if (themeId) {
                        themesAddQuery.push({
                            word_id: exWordId,
                            theme_id: themeId
                        })
                    }
                }
            }
        }
        const insertThemeMap: Record<string, string[]> = {};

        const chuckQuerysB = chunkArray(themesAddQuery, 250)


        for (let i = 0; i < chuckQuerysB.length; i++) {
            const chuckQuery = chuckQuerysB[i]
            setCurrentTask(`주제 정보 추가 중...${i}/${chuckQuerysB.length}`)
            const { data: insertedThemesData, error: inseredThemeError } = await supabase.from('word_themes').upsert(chuckQuery, { ignoreDuplicates: true, onConflict: "word_id,theme_id" }).select('words(word),themes(name)')
            if (inseredThemeError) return makeError(inseredThemeError)
            if (!insertedThemesData) continue
            for (const data of insertedThemesData) {
                insertThemeMap[data.words.word] = [...(insertThemeMap[data.words.word] ?? []), data.themes.name]
            }
        }

        for (const [word, themes] of Object.entries(insertThemeMap)) {
            for (const theme of themes) {
                const themeDocsId = themeDocsInfo[theme]
                if (themeDocsId) {
                    docsLogsQuery.push({
                        docs_id: themeDocsId,
                        word: word,
                        add_by: user.uuid,
                        type: "add" as const
                    })
                }
            }
        }

        setProgress(60);
        setCurrentTask('로그 등록중...')
        const { error: logError } = await supabase.from('logs').insert(logsQuery);
        if (logError) {
            return makeError(logError);
        }
        const { data: docsLogData, error: docsLogError } = await supabase.from('docs_logs').insert(docsLogsQuery).select('*,docs(typez)');
        if (docsLogError) return makeError(docsLogError)

        const updateThemeDocsIds: Set<number> = new Set();
        for (const data of docsLogData) {
            if (data.docs.typez === "theme") {
                updateThemeDocsIds.add(data.docs_id);
            }
        }

        setProgress(80);
        setCurrentTask('마지막 처리 중...')
        const { error: rpcError1 } = await supabase.rpc('increment_contribution', { target_id: user.uuid, inc_amount: addWordCount })
        if (rpcError1) return makeError(rpcError1)

        const { error: rpcError2 } = await supabase.rpc('update_last_updates', { docs_ids: [...updateThemeDocsIds] })
        if (rpcError2) return makeError(rpcError2);

        setProgress(100);
        setCurrentTask('완료!')
        setIsProcessing(false);
    }

    // 모달 닫기
    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
            <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-8">
                <h1 className="text-3xl font-bold text-center mb-8">JSON 파일 처리</h1>

                {/* 파일 업로드 영역 */}
                <div className="mb-8">
                    <div className="flex items-center justify-center w-full">
                        <label
                            htmlFor="file-upload"
                            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300"
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <FileJson className="w-10 h-10 mb-3 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">클릭하여 파일 업로드</span>{" "}
                                    또는 드래그 앤 드롭
                                </p>
                                <p className="text-xs text-gray-500">JSON 파일만 가능합니다</p>
                            </div>
                            <input
                                id="file-upload"
                                type="file"
                                accept=".json"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </label>
                    </div>
                </div>

                {/* 파일 내용 표시 */}
                {/* 파일 내용 표시 - 가상화 적용 */}
                {fileUploaded && jsonData && (
                    <div className="mb-8 p-4 bg-gray-50 rounded-md">
                        <h2 className="text-lg font-semibold mb-2">업로드된 JSON 데이터</h2>
                        <div className="h-60">
                            <JsonViewer data={jsonData} />
                        </div>
                    </div>
                )}

                {/* 에러 메시지 */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 rounded-md border border-red-100 flex items-start">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* 처리 버튼 */}
                <div className="flex justify-center">
                    <Button
                        onClick={handleProcess}
                        disabled={!fileUploaded || isProcessing}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
                    >
                        {isProcessing ? "처리 중..." : "처리 시작"}
                    </Button>
                </div>
            </div>

            {/* 처리 모달 */}
            <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {isProcessing ? "처리 중..." : "처리 완료"}
                        </AlertDialogTitle>
                        {/* Fix: Replace AlertDialogDescription with a div to avoid nesting issues */}
                        <div className="text-sm text-muted-foreground">
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <p className="text-sm font-medium">{currentTask}</p>
                                </div>

                                <div className="space-y-2">
                                    <Progress value={progress} className="h-2" />
                                    <p className="text-xs text-right">{progress}% 완료</p>
                                </div>

                                {!isProcessing && (
                                    <div className="mt-4 flex justify-center">
                                        <div className="flex items-center text-green-600">
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            <span>처리가 완료되었습니다!</span>
                                        </div>
                                    </div>
                                )}

                                {!isProcessing && (
                                    <div className="mt-4 flex justify-end">
                                        <Button onClick={closeModal}>확인</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>
            {errorModalView && <ErrorModal error={errorModalView} onClose={() => setErrorModalView(null)} />}
        </div>

    );
}

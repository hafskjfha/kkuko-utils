import type { addWordQueryType, addWordThemeQueryType, DocsLogData, WordLogData } from '@/app/types/type';
import type { PostgrestError, PostgrestSingleResponse } from '@supabase/supabase-js';
import type { Database } from '@/app/types/database.types'

type docs_word = Database['public']['Tables']['docs_words']['Row']
type wait_word = Database['public']['Tables']['wait_words']['Row']
type theme = Database['public']['Tables']['themes']['Row']
type wait_word_theme = Database['public']['Tables']['wait_word_themes']['Row'] & { themes: theme; }
type word = Database['public']['Tables']['words']['Row']
type word_theme = {words: word, themes: theme }
type docs = Database['public']['Tables']['docs']['Row']
type user = Database['public']['Tables']['users']['Row'];
type docs_log = Database['public']['Tables']['docs_logs']['Row'];

type delete_word_themes_bulk = Database['public']['Functions']['delete_word_themes_bulk']['Returns'];

// add 관련 타입
export interface IAddManager {
    docsLog(logsData: DocsLogData[]): Promise<PostgrestSingleResponse<null>>;
    wordLog(logsData: WordLogData[]): Promise<PostgrestSingleResponse<null>>;
    wordToDocs(AddData: { word_id: number; docs_id: number }[]): Promise<PostgrestSingleResponse<docs_word[]>>;
    word(insertWordData: addWordQueryType[]): Promise<PostgrestSingleResponse<word[]>>;
    wordThemes(insertWordThemesData: addWordThemeQueryType[]): Promise<PostgrestSingleResponse<word_theme[]>>;
    waitWordTable(insertWaitWordData: { word: string, requested_by: string | null, request_type: "delete" }): Promise<PostgrestSingleResponse<{ id: number; } | null>>;
    docsWait({ word_id, docs_id, requested_by }: { word_id: number; docs_id: number; requested_by: string | null; }): Promise<PostgrestSingleResponse<null>>
}

// get 관련 타입
export interface IGetManager{
    waitWordInfo(word: string): Promise<PostgrestSingleResponse<wait_word | null>>;
    waitWordThemes(wordId: number): Promise<PostgrestSingleResponse<wait_word_theme[]>>;
    wordNomalInfo(word: string): Promise<PostgrestSingleResponse<word | null>>;
    allDocs(): Promise<PostgrestSingleResponse<(docs & { users: user | null })[]>>;
    wordThemes(wordIds: number[]): Promise<PostgrestSingleResponse<word_theme[]>>;
    docs(id: number): Promise<PostgrestSingleResponse<(docs & { users: user | null }) | null>>
    docsWordCount({ name, duem, typez }: { name: string; duem: boolean; typez: "letter" | "theme";}): Promise<{count: number | null; error: PostgrestError | null;}>
    docsOkWords(id: number): Promise<{ words: null; error: PostgrestError; } | { words: string[]; error: null; }>
    docsRank(id: number): Promise<PostgrestSingleResponse<number>>;
    allTheme(): Promise<PostgrestSingleResponse<theme[]>>
    theme(name: string): Promise<{ data: theme | null; error: PostgrestError | null;}>
    docsStarCount(id: number): Promise<{ data: number; error: PostgrestError | null;}>
    docsLogs(id:number): Promise<PostgrestSingleResponse<(docs_log & {users: user | null})[]>>
    searchWord(query: string, onlyWords?: boolean, addReqOnly?: boolean): Promise<{ data: null; error: PostgrestError; } | { data: { id: number; word: string; }[]; error: null;}>
    docsStar(id: number): Promise<PostgrestSingleResponse<{user_id: string;}[]>>;
    docsWords({ name, duem, typez }: { name: string; duem: boolean; typez: "letter" | "theme";}): Promise<{data: null, error: PostgrestError} | {data: {words: word[], waitWords: { word: string; requested_by: string | null; request_type: "add" | "delete"; }[]}, error: null}>
    allWaitWords(): Promise<PostgrestSingleResponse<(wait_word & {words: word | null;})[]>>;
    wordsThemes(word_ids: number[]): Promise<PostgrestSingleResponse<{ theme_id: number; word_id: number; words: word; }[]>>
}

// delete 관련 타입
export interface IDeleteManager{
    waitWord(wordId: number): Promise<PostgrestSingleResponse<null>>;
    wordcWord(word: string): Promise<PostgrestSingleResponse<word[]>>;
    wordcId(wordId: number): Promise<PostgrestSingleResponse<word[]>>;
    wordcIds(wordIds: number[]): Promise<PostgrestSingleResponse<word[]>>;
    wordTheme(deleteQuery: { word_id: number, theme_id: number }[]): Promise<PostgrestSingleResponse<delete_word_themes_bulk>>;
    waitWordThemes(query:{word_id: number, theme_id: number}[]): Promise<PostgrestSingleResponse<undefined>>;
}

// update 관련 타입
export interface IUpdateManager{
    userContribution({ userId, amount }: { userId: string, amount?: number }): Promise<PostgrestSingleResponse<undefined>>;
    docsLastUpdate(docs_ids: number[]): Promise<void>;
    docView(id: number): Promise<void>;
}

// 전체 supabaseManager 타입 
export interface ISupabaseClientManager {
    add(): IAddManager;
    get(): IGetManager;
    delete(): IDeleteManager;
    update(): IUpdateManager;
}
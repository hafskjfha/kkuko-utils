import type { addWordQueryType, addWordThemeQueryType, DocsLogData, WordLogData } from '@/app/types/type';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import type { Database } from '@/app/types/database.types'

type docs_words = Database['public']['Tables']['docs_words']['Row']
type wait_words = Database['public']['Tables']['wait_words']['Row']
type themes = Database['public']['Tables']['themes']['Row']
type wait_word_themes = Database['public']['Tables']['wait_word_themes']['Row'] & { themes: themes; }
type words = Database['public']['Tables']['words']['Row']
type word_themes = {words: words, themes: themes }
type docs = Database['public']['Tables']['docs']['Row']
type users = Database['public']['Tables']['users']['Row'];

type delete_word_themes_bulk = Database['public']['Functions']['delete_word_themes_bulk']['Returns'];


export interface ISupabaseClientManager {
    addDocsLog(logsData: DocsLogData[]): Promise<PostgrestSingleResponse<null>>;
    addWordLog(logsData: WordLogData[]): Promise<PostgrestSingleResponse<null>>;
    addWordToDocs(AddData: { word_id: number; docs_id: number }[]): Promise<PostgrestSingleResponse<docs_words[]>>;
    getWaitWordInfo(word: string): Promise<PostgrestSingleResponse<wait_words | null>>;
    getWaitWordThemes(wordId: number): Promise<PostgrestSingleResponse<wait_word_themes[]>>;
    addWord(insertWordData: addWordQueryType[]): Promise<PostgrestSingleResponse<words[]>>;
    addWordThemes(insertWordThemesData: addWordThemeQueryType[]): Promise<PostgrestSingleResponse<word_themes[]>>;
    updateUserContribution({ userId, amount }: { userId: string, amount?: number }): Promise<PostgrestSingleResponse<undefined>>;
    deleteWaitWord(wordId: number): Promise<PostgrestSingleResponse<null>>;
    deleteWordcWord(word: string): Promise<PostgrestSingleResponse<words[]>>;
    deleteWordcId(wordId: number): Promise<PostgrestSingleResponse<words[]>>;
    deleteWordcIds(wordIds: number[]): Promise<PostgrestSingleResponse<words[]>>;
    getWordNomalInfo(word: string): Promise<PostgrestSingleResponse<words | null>>;
    addWaitWordTable(insertWaitWordData: { word: string, requested_by: string | null, request_type: "delete" }): Promise<PostgrestSingleResponse<{ id: number; } | null>>;
    deleteWordTheme(deleteQuery: { word_id: number, theme_id: number }[]): Promise<PostgrestSingleResponse<delete_word_themes_bulk>>;
    getAllDocs(): Promise<PostgrestSingleResponse<(docs & { users: users | null })[]>>;
    updateDocsLastUpdate(docs_ids: number[]): Promise<void>;
    getWordThemes(wordIds: number[]): Promise<PostgrestSingleResponse<word_themes[]>>;
    deleteWaitWordThemes(query:{word_id: number, theme_id: number}[]): Promise<PostgrestSingleResponse<undefined>>;
}
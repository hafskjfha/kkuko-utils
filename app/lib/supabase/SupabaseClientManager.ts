import { ISupabaseClientManager } from './ISupabaseClientManager';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/app/types/database.types';
import type { addWordQueryType, addWordThemeQueryType, DocsLogData, WordLogData } from '@/app/types/type';

export class SupabaseClientManager implements ISupabaseClientManager {
    constructor(private readonly supabase: SupabaseClient<Database>) { }

    public async addDocsLog(logsData: DocsLogData[]) {
        return await this.supabase.from('docs_logs').insert(logsData);
    }

    public async addWordLog(logsData: WordLogData[]) {
        return await this.supabase.from('logs').insert(logsData);
    }

    public async addWordToDocs(AddData: { word_id: number; docs_id: number }[]) {
        return await this.supabase.from('docs_words').insert(AddData).select('*');
    }

    public async getWaitWordInfo(word: string) {
        return await this.supabase.from('wait_words').select('*').eq('word', word).maybeSingle();
    }

    public async getWaitWordThemes(wordId: number) {
        return await this.supabase.from('wait_word_themes').select('*,themes(*)').eq('wait_word_id', wordId);
    }
    public async addWord(insertWordData: addWordQueryType[]) {
        return await this.supabase.from('words').insert(insertWordData).select('*');
    }

    public async addWordThemes(insertWordThemesData: addWordThemeQueryType[]) {
        return await this.supabase.from('word_themes').insert(insertWordThemesData).select('words(*),themes(*)');
    }

    public async updateUserContribution({ userId, amount = 1 }: { userId: string, amount?: number }) {
        return await this.supabase.rpc('increment_contribution', { target_id: userId, inc_amount: amount })
    }

    public async deleteWaitWord(wordId: number) {
        return await this.supabase
            .from('wait_words')
            .delete()
            .eq('id', wordId);
    }

    public async deleteWordcWord(word: string) {
        return await this.supabase.from('words').delete().eq('word', word).select('*');
    }

    public async deleteWordcId(wordId: number) {
        return await this.supabase.from('words').delete().eq('id', wordId).select('*');
    }

    public async deleteWordcIds(wordIds: number[]) {
        return await this.supabase.from('words').delete().in('id', wordIds).select('*');
    }

    public async getWordNomalInfo(word: string) {
        return await this.supabase.from('words').select('*').eq('word', word).maybeSingle();
    }

    public async addWaitWordTable(insertWaitWordData: { word: string, requested_by: string | null, request_type: "delete" }) {
        return await this.supabase.from('wait_words').insert(insertWaitWordData).select('id').maybeSingle();
    }

    public async deleteWordTheme(deleteQuery: { word_id: number, theme_id: number }[]) {
        if (deleteQuery.length === 0) {
            return {
                data: [],
                error: null,
                count: null,
                status: 200,
                statusText: "OK"
            };
        }
        return await this.supabase.rpc('delete_word_themes_bulk', { pairs: deleteQuery });
    }

    public async getAllDocs() {
        return await this.supabase.from('docs').select('*, users(*)');
    }

    public async updateDocsLastUpdate(docs_ids: number[]) {
        await this.supabase.rpc('update_last_updates', { docs_ids })
    }

    public async getWordThemes(wordIds: number[]) {
        return await this.supabase.from('word_themes').select('words(*),themes(*)').in('word_id', wordIds);
    }

    public async deleteWaitWordThemes(query: { word_id: number, theme_id: number }[]){
        if (query.length === 0) {
            return {
                data: undefined,
                error: null,
                count: null,
                status: 200,
                statusText: "OK"
            };
        }
        return await this.supabase.rpc('delete_word_themes_wait_bulk', { pairs: query });
    }
}
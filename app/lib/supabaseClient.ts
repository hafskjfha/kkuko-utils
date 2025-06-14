import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../types/database.types'
import type { addWordQueryType, addWordThemeQueryType, DocsLogData, WordLogData } from '../types/type';

export const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export class SupabaseClientManager{
    public async addDocsLog(logsData:DocsLogData[]) {
        return await supabase.from('docs_logs').insert(logsData);
    }

    public async addWordLog(logsData: WordLogData[]){
        return await supabase.from('logs').insert(logsData);
    }

    public async addWordToDocs(AddData: { word_id: number; docs_id: number }[]){
        return await supabase.from('docs_words').insert(AddData).select('*');
    }

    public async getWaitWordInfo(word: string){
        return await supabase.from('wait_words').select('*').eq('word', word).maybeSingle();
    }

    public async getWaitWordThemes(wordId: number){
        return await supabase.from('wait_word_themes').select('*,themes(name)').eq('wait_word_id', wordId);
    }

    public async addWord(insertWordData: addWordQueryType[]){
        return await supabase.from('words').insert(insertWordData).select('*');
    }

    public async addWordThemes(insertWordThemesData: addWordThemeQueryType[]){
        return await supabase.from('word_themes').insert(insertWordThemesData).select('words(*),themes(*)');
    }

    public async getDocs(){
        return await supabase.from('docs').select('*');
    }

    public async updateUserContribution({userId, amount=1}: {userId: string, amount?: number}){
        return await supabase.rpc('increment_contribution',{target_id: userId, inc_amount:amount})
    }

    public async deleteWaitWord(wordId: number){
        return await supabase   
                .from('wait_words')
                .delete()
                .eq('id', wordId);
    }

    public async deleteWordcWord(word: string){
        return await supabase.from('words').delete().eq('word', word);
    }

    public async deleteWordcId(wordId: number){
        return await supabase.from('words').delete().eq('id',wordId);
    }

    public async deleteWordcIds(wordIds: number[]){
        return await supabase.from('words').delete().in('id',wordIds).select('*');
    }

    public async getWordNomalInfo(word: string){
        return await supabase.from('words').select('*').eq('word', word).maybeSingle();
    }

    public async addWaitWordTable(insertWaitWordData: {word: string, requested_by: string | null, request_type: "delete"}){
        return await supabase.from('wait_words').insert(insertWaitWordData).select('id').maybeSingle();
    }

    public async deleteWordTheme(deleteQuery: {word_id:number, theme_id: number}[]){
        if (deleteQuery.length === 0) { return {data: [], error: null} }
        return await supabase.rpc('delete_word_themes_bulk',{pairs: deleteQuery})
    }

    public async getAllDocs(){
        return await supabase.from('docs').select('*');
    }

    public async updateDocsLastUpdate(docs_ids: number[]){
        await supabase.rpc('update_last_updates',{docs_ids})
    }

    public async getWordThemes(wordIds: number[]){
        return await supabase.from('word_themes').select('words(id,word),themes(*)').in('word_id',wordIds);
    }

    public async deleteWaitWordThemes(query:{word_id: number, theme_id: number}[]){
        if (query.length === 0) { return {data: null, error: null} }
        return await supabase.rpc('delete_word_themes_wait_bulk',{pairs: query})
    }

}

export const SCM = new SupabaseClientManager()
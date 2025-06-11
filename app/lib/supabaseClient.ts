import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../types/database.types'
import type { addWordQueryType, addWordThemeQueryType, DocsLogData, WordLogData } from '../types/type';

export const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

class SupabaseClientManager{
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
        return await supabase.from('word_themes').insert(insertWordThemesData);
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

    public async getWordNomalInfo(word: string){
        return await supabase.from('words').select('*').eq('word', word).maybeSingle();
    }

    public async addWaitWordTable(insertWaitWordData: {word: string, requested_by: string | null, request_type: "delete"}){
        return await supabase.from('wait_words').insert(insertWaitWordData).select('id').maybeSingle();
    }

}

export const SCM = new SupabaseClientManager()
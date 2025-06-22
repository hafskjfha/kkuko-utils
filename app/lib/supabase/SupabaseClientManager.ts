import { ISupabaseClientManager, IAddManager, IGetManager, IDeleteManager, IUpdateManager } from './ISupabaseClientManager';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/app/types/database.types';
import type { addWordQueryType, addWordThemeQueryType, DocsLogData, WordLogData } from '@/app/types/type';
import { reverDuemLaw } from '../DuemLaw';
import { sum } from 'es-toolkit';

class AddManager implements IAddManager {
    constructor(private readonly supabase: SupabaseClient<Database>) { }

    public async docsLog(logsData: DocsLogData[]) {
        return await this.supabase.from('docs_logs').insert(logsData);
    }
    public async wordLog(logsData: WordLogData[]) {
        return await this.supabase.from('logs').insert(logsData);
    }
    public async wordToDocs(AddData: { word_id: number; docs_id: number }[]) {
        return await this.supabase.from('docs_words').insert(AddData).select('*');
    }
    public async word(insertWordData: addWordQueryType[]) {
        return await this.supabase.from('words').insert(insertWordData).select('*');
    }
    public async wordThemes(insertWordThemesData: addWordThemeQueryType[]) {
        return await this.supabase.from('word_themes').insert(insertWordThemesData).select('words(*),themes(*)');
    }
    public async waitWordTable(insertWaitWordData: { word: string, requested_by: string | null, request_type: "delete" }) {
        return await this.supabase.from('wait_words').insert(insertWaitWordData).select('id').maybeSingle();
    }
}

class GetManager implements IGetManager {
    constructor(private readonly supabase: SupabaseClient<Database>) { }

    public async waitWordInfo(word: string) {
        return await this.supabase.from('wait_words').select('*').eq('word', word).maybeSingle();
    }
    public async waitWordThemes(wordId: number) {
        return await this.supabase.from('wait_word_themes').select('*,themes(*)').eq('wait_word_id', wordId);
    }
    public async wordNomalInfo(word: string) {
        return await this.supabase.from('words').select('*').eq('word', word).maybeSingle();
    }
    public async allDocs() {
        return await this.supabase.from('docs').select('*, users(*)');
    }
    public async wordThemes(wordIds: number[]) {
        return await this.supabase.from('word_themes').select('words(*),themes(*)').in('word_id', wordIds);
    }
    public async docs(id: number){
        return await this.supabase.from('docs').select('*,users(*)').eq('id', id).maybeSingle();
    }
    public async docsWordCount({name, duem, typez}:{name: string, duem: boolean, typez: "letter" | "theme"}){
        if (typez==="letter"){
            if (duem){
                const {data, error} = await this.supabase.from('word_last_letter_counts').select('count').in('last_letter',reverDuemLaw(name[0]));
                return {count: sum(data?.map(({count})=>count) ?? []) ?? 0, error}
            }else{
                const {data, error} = await this.supabase.from('word_last_letter_counts').select('count').eq('last_letter',name[0]).maybeSingle();
                return {count: data?.count ?? 0, error}
            }
        }
        else{
            const {data: themeData, error: themeDataError} = await this.theme(name)
            if (themeDataError || !themeData) return {count:0, error: themeDataError}
            const{ count, error } = await this.supabase.from('word_themes').select('*',{ count: 'exact', head: true }).eq('theme_id',themeData.id);
            return {count, error}
        }
    }
    public async docsOkWords(id: number){
        const { data: dataA, error } = await this.supabase.from('docs_words').select('words(word)').eq('docs_id', id);
        if (error) return { words: null, error }

        const words = dataA.map((wordk) => wordk.words.word);
        return { words, error: null };
    }
    public async docsRank(id: number){
        return await this.supabase.rpc('get_doc_rank',{doc_id: id})
    }
    public async allTheme(){
        return await this.supabase.from('themes').select('*');
    }
    public async theme(name: string){
        const {data, error} = await this.supabase.from('themes').select('*').eq('name',name).maybeSingle();
        return {data, error}
    }
    public async docsStarCount(id: number){
        const { data, error } = await this.supabase.from('user_star_docs').select('*').eq('docs_id',id);
        return {data: data?.length ?? 0, error};
    }
    public async docsLogs(id: number){
        return await this.supabase.from("docs_logs").select("*, users(*)").eq("docs_id", id).order("date", { ascending: false });
    }
}

class DeleteManager implements IDeleteManager {
    constructor(private readonly supabase: SupabaseClient<Database>) { }

    public async waitWord(wordId: number) {
        return await this.supabase.from('wait_words').delete().eq('id', wordId);
    }
    public async wordcWord(word: string) {
        return await this.supabase.from('words').delete().eq('word', word).select('*');
    }
    public async wordcId(wordId: number) {
        return await this.supabase.from('words').delete().eq('id', wordId).select('*');
    }
    public async wordcIds(wordIds: number[]) {
        return await this.supabase.from('words').delete().in('id', wordIds).select('*');
    }
    public async wordTheme(deleteQuery: { word_id: number, theme_id: number }[]) {
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
    public async waitWordThemes(query: { word_id: number, theme_id: number }[]) {
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

class UpdateManager implements IUpdateManager {
    constructor(private readonly supabase: SupabaseClient<Database>) { }

    public async userContribution({ userId, amount = 1 }: { userId: string, amount?: number }) {
        return await this.supabase.rpc('increment_contribution', { target_id: userId, inc_amount: amount });
    }
    public async docsLastUpdate(docs_ids: number[]) {
        await this.supabase.rpc('update_last_updates', { docs_ids });
    }
}

export class SupabaseClientManager implements ISupabaseClientManager {
    private readonly _add: IAddManager;
    private readonly _get: IGetManager;
    private readonly _delete: IDeleteManager;
    private readonly _update: IUpdateManager;

    constructor(private readonly supabase: SupabaseClient<Database>) {
        this._add = new AddManager(supabase);
        this._get = new GetManager(supabase);
        this._delete = new DeleteManager(supabase);
        this._update = new UpdateManager(supabase);
    }

    public add() {
        return this._add;
    }
    public get() {
        return this._get;
    }
    public delete() {
        return this._delete;
    }
    public update() {
        return this._update;
    }
}
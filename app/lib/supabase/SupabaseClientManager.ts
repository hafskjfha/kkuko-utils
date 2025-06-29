import { ISupabaseClientManager, IAddManager, IGetManager, IDeleteManager, IUpdateManager } from './ISupabaseClientManager';
import type { PostgrestError, PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
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
    public async word(insertWordData: addWordQueryType[]) {
        return await this.supabase.from('words').insert(insertWordData).select('*');
    }
    public async wordThemes(insertWordThemesData: addWordThemeQueryType[]) {
        return await this.supabase.from('word_themes').insert(insertWordThemesData).select('words(*),themes(*)');
    }
    public async waitWordTable(insertWaitWordData: { word: string, requested_by: string | null, request_type: "delete", word_id: number } | {word: string, requested_by: string | null, request_type: "add"}) {
        return await this.supabase.from('wait_words').insert(insertWaitWordData).select('id').maybeSingle();
    }
    public async startDocs({ docsId, userId }: { docsId: number; userId: string; }): Promise<PostgrestSingleResponse<null>> {
        return await this.supabase.from('user_star_docs').insert({ docs_id: docsId, user_id: userId })
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
        return await this.supabase.from('docs').select('*, users(*)').eq('is_hidden',false)
    }
    public async wordThemes(wordIds: number[]) {
        return await this.supabase.from('word_themes').select('words(*),themes(*)').in('word_id', wordIds);
    }
    public async wordTheme(wordId: number) {
        return await this.supabase.from('word_themes').select('words(*),themes(*)').eq('word_id', wordId);
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
    public async searchWord(query: string, onlyWords: boolean = false, addReqOnly: boolean = false){
        if (query.length < 5) {
            const {data: wordsData, error: wordsError} = await this.supabase.from('words').select('id,word').eq('word',query);
            if (wordsError) return {data: null, error: wordsError};
            if (onlyWords) return {data: wordsData, error: null}
            else {
                const {data: waitWordsData, error: waitWordsError} = await this.supabase.from('wait_words').select('id,word,request_type').eq('word',query);
                if (waitWordsError) return {data: null, error: waitWordsError}
                return {data: wordsData.concat(waitWordsData.filter(({request_type})=>addReqOnly ? request_type === "add" : true)), error: null}
            }
        }else {
            const {data: wordsData, error: wordsError} = await this.supabase.from('words').select('id,word').ilike('word', `%${query}%`);
            if (wordsError) return {data: null, error: wordsError};
            if (onlyWords) return {data: wordsData, error: null}
            else {
                const {data: waitWordsData, error: waitWordsError} = await this.supabase.from('wait_words').select('id,word,request_type').ilike('word', `%${query}%`);
                if (waitWordsError) return {data: null, error: waitWordsError}
                return {data: wordsData.concat(waitWordsData.filter(({request_type})=>addReqOnly ? request_type === "add" : true)), error: null}
            }
        }
    }
    public async docsStar(id: number){
        return await this.supabase.from('user_star_docs').select('user_id').eq('docs_id',id);
    }
    public async docsWords({name, duem, typez}:{name: string, duem: boolean, typez: "letter" | "theme"} | {name: number, duem: boolean,typez: "ect"}){
        if (typez==="letter"){
            if (duem){
                const{data:wordsData, error: wordsError} = await this.supabase.from('words').select('*').in('last_letter',reverDuemLaw(name[0])).eq('k_canuse',true).neq('length',1);
                if (wordsError) return {data: null, error: wordsError}
                let q = this.supabase.from('wait_words').select('word,requested_by,request_type');
                for (const l of reverDuemLaw(name[0])){
                    q=q.ilike('word',`%${l}`)
                }
                const {data: waitWordsData, error: waitWordsError} = await q;
                if (waitWordsError) return {data: null, error: waitWordsError}
                return {data:{words: wordsData, waitWords: waitWordsData}, error: null}
            }else{
                const{data:wordsData, error: wordsError} = await this.supabase.from('words').select('*').eq('last_letter',name[0]).eq('k_canuse',true).neq('length',1);
                if (wordsError) return {data: null, error: wordsError}
                const {data: waitWordsData, error: waitWordsError} = await this.supabase.from('wait_words').select('word,requested_by,request_type').ilike('word',`${name.trim()[0]}`)
                if (waitWordsError) return {data: null, error: waitWordsError}
                return {data: {words: wordsData, waitWords: waitWordsData}, error: null}
            }
        }
        else if (typez==="theme"){
            const {data: themeData, error: themeDataError} = await this.theme(name)
            if (themeDataError) return {data: null, error: themeDataError};
            if (!themeData) return {data: {words: [], waitWords: []}, error: null}
            const {data: wordsData, error: wordsError} = await this.supabase.from('word_themes').select('words(*)').eq('theme_id',themeData.id);
            const {data: waitWordsData1, error: waitWordsError1} = await this.supabase.from('word_themes_wait').select('words(*),typez,req_by').eq('theme_id', themeData.id);
            const {data: waitAddWordsData2, error: waitAddWordsError2} = await this.supabase.from('wait_word_themes').select('wait_words(word,requested_by,request_type)').eq('theme_id', themeData.id);
            const {data: waitDelWordsData, error: waitDelWordsError} = await this.supabase.rpc('get_delete_requests_by_themeid',{input_theme_id: themeData.id })

            if (wordsError) return {data: null, error: wordsError}
            if (waitWordsError1) return {data: null, error: waitWordsError1}
            if (waitAddWordsError2) return {data: null, error: waitAddWordsError2}
            if (waitDelWordsError) return {data: null, error: waitDelWordsError}
            const Data1Set = new Set(waitWordsData1.map(({words})=>words.word))
            const waitWords: {
                word: string;
                requested_by: string | null;
                request_type: "add" | "delete";
            }[] = waitAddWordsData2
                .filter(({wait_words:{request_type}})=>request_type==="add")
                .map(({wait_words})=>wait_words);
            waitWordsData1.forEach(({words:{word},typez, req_by})=>{
                if (!Data1Set.has(word)){
                    waitWords.push({word, requested_by: req_by, request_type: typez})
                }
            })
            waitWords.push(...waitDelWordsData)

            return {data: {words: wordsData.filter(({words:{word}})=>!waitWords.some(w=>word===w.word)).map(({words})=>words), waitWords}, error: null}
        } else if (typez === "ect") {
            // docsDataPage확인
            return {data: null, error: {name: "unexcept", details: "", code : "", message: "", hint: ""} as PostgrestError}
        } else {
            return {data: null, error: {name: "unexcept", details: "", code : "", message: "", hint: ""} as PostgrestError}
        }
    }
    public async allWaitWords(){
        return await this.supabase.from('wait_words').select('*,words(*)');
    }
    public async wordsThemes(words_id: number[]){
        return await this.supabase.from('word_themes').select('*,words(*)').in('word_id',words_id);
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
    public async wordsFromWaitcId(ids: number[]){
        return await this.supabase.from('wait_words').delete().in('id',ids);
    }
    public async startDocs({docsId,userId}:{docsId: number, userId: string}){
        return await this.supabase.from('user_star_docs').delete().eq('docs_id', docsId).eq('user_id', userId);
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
    public async docView(id: number): Promise<void> {
        await this.supabase.rpc('increment_doc_views',{doc_id:id})
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
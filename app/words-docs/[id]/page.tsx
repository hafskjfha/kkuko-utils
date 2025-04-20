import DocsData from "./DocsDataPage";
import { supabase } from "@/app/lib/supabaseClient";
import NotFound from "@/app/not-found-client";
import ErrorPage from "@/app/components/ErrorPage";
import type { ErrorMessage } from "@/app/types/type";
import { PostgrestError } from "@supabase/supabase-js";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const {id} = await params;
    return {
        title: "끄코 유틸리티 - 단어장공유",
        description: `끄코 유틸리티 - 단어장 공유 ${id}번 문서`,
    };
}

const getDataOkWords = async (id: number) => {
    const {data:dataA, error:errorA} = await supabase.from('docs_words').select('words(word)').eq('docs_id',id);
    if (errorA) throw errorA;
    
    const words = dataA.map((wordk)=>({word: wordk.words.word, status: "ok"}));
    return words;
};

const getDataWaitWords = async (id: number) => {
    const {data, error} = await supabase.from('docs_wait_words').select('wait_words(word, status, request_type, users(id))').eq('docs_id',id);
    if (error)throw error;

    const words = data.map(({wait_words})=>({
        word: wait_words.word, 
        status: wait_words.status, 
        rType: wait_words.request_type, 
        maker: wait_words.users?.id }))
        .filter((w)=>w.status === "pending")
        .map(({word, rType, maker})=>({
            word, status: rType, maker })
        )
    return words
}

const getDataWaitWordsA = async (id: number) => {
    const {data, error} = await supabase.from('docs_words_wait').select('words(word), typez, users(id)').eq('docs_id',id);
    if (error)throw error;

    const words = data.map((wordk)=>({
        word: wordk.words.word,
        status: wordk.typez === "add" ? "eadd" : "edelete" ,
        maker: wordk.users?.id
    } as const))
    return words
}

const DocsDataHome = async ({ params }: { params: Promise<{ id: string }> }) => {
    const {id} = await params;

    if (isNaN(Number(id))) return <NotFound />
    const {data:docsDatas, error: docsError} = await supabase.from('docs').select('*').eq("id",Number(id)).maybeSingle();
    
    if (!docsDatas || docsError){
        if (docsError){
            const e:ErrorMessage = {
                ErrName: docsError.name,
                ErrMessage: docsError.message,
                ErrStackRace: docsError.stack,
                inputValue: `docs id: ${id}`
            }
            return <ErrorPage message={e.ErrMessage ?? undefined} />
        }
        else{
            return <NotFound />
        }
    }

    try{
        const [A,B,C] = await Promise.all([getDataOkWords(Number(id)), getDataWaitWords(Number(id)),getDataWaitWordsA(Number(id))]);
        const wordsNotInB = A.filter(a => !B.some(b => b.word === a.word)).map((p)=>({word: p.word, status: p.status as "ok", maker: undefined}))
        const wordsNotInC = wordsNotInB.filter(a => !C.some(c => c.word === a.word)).map((p)=>({word: p.word, status: p.status as "ok", maker: undefined}))
        const CwordsNotInB = C.filter(c => !B.some(b => b.word === c.word)).map((p)=>({word: p.word, status: p.status as "eadd" | "edelete", maker: p.maker}))
        const wordsData = [...wordsNotInC,...CwordsNotInB, ...B]
        const p = {title: docsDatas.name, lastUpdate: docsDatas.last_update}
        return <DocsData id={id} data={wordsData} metaData={p}/>
    }
    catch(error){
        if (error instanceof Error) {
            const e:ErrorMessage = {
                ErrName: error.name,
                ErrMessage: error.message,
                ErrStackRace: error.stack,
                inputValue: `docs id: ${id}`
            }
            return <ErrorPage message={e.ErrMessage ?? undefined} />
        }
        else if (error instanceof PostgrestError){
            const e:ErrorMessage = {
                ErrName: error.name,
                ErrMessage: error.message,
                ErrStackRace: error.stack,
                inputValue: `docs id: ${id}`
            }
            return <ErrorPage message={e.ErrMessage ?? undefined} />
        }
    }
    

    
}

export default DocsDataHome;
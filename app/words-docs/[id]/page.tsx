import DocsData from "./DocsDataPage";
import { supabase } from "@/app/lib/supabaseClient";
import NotFound from "@/app/not-found-client";
import ErrorPage from "@/app/ErrorPage";
import type { ErrorMessage } from "@/app/types/type";
import { PostgrestError } from "@supabase/supabase-js";

const getDataOkWords = async (id: number) => {
    const {data:dataA, error:errorA} = await supabase.from('docs_words').select('words(word)').eq('docs_id',id);
    if (errorA) throw errorA;
    
    const words = dataA.map((wordk)=>({word: wordk.words.word, status: "ok"}));
    return words;
};

const getDataWaitWords = async (id: number) => {
    const {data, error} = await supabase.from('docs_wait_words').select('wait_words(word, status, request_type, users(id))').eq('docs_id',id);
    if (error)throw error;

    const words = data.map((wordk)=>({
        word: wordk.wait_words.word, 
        status: wordk.wait_words.status, 
        rType: wordk.wait_words.request_type, 
        maker: wordk.wait_words.users?.id }))
        .filter((w)=>w.status === "pending")
        .map((wordk)=>({
            word: wordk.word, 
            status: wordk.rType, 
            maker: wordk.maker })
        )
    return words
}

const DocsDataHome = async ({ params }: { params: { id: string } }) => {
    const {id} = await params;

    const {data:docsData, error: docsError} = await supabase.from('docs').select('*').eq("id",Number(id)).maybeSingle();
    
    if (!docsData || docsError){
        if (docsError){
            const e:ErrorMessage = {
                ErrName: docsError.name,
                ErrMessage: docsError.message,
                ErrStackRace: docsError.stack,
                inputValue: `docs id: ${id}`
            }
            return <ErrorPage e={e} />
        }
        else{
            return <NotFound />
        }
    }

    try{
        const [A,B] = await Promise.all([getDataOkWords(Number(id)), getDataWaitWords(Number(id))]);
        const wordsNotInB = A.filter(a => !B.some(b => b.word === a.word)).map((p)=>({word: p.word, status: p.status as "ok", maker: undefined}))
        const wordsData = [...wordsNotInB, ...B]

        return <DocsData id={id} data={wordsData}/>
    }
    catch(error){
        if (error instanceof Error) {
            const e:ErrorMessage = {
                ErrName: error.name,
                ErrMessage: error.message,
                ErrStackRace: error.stack,
                inputValue: `docs id: ${id}`
            }
            return <ErrorPage e={e} />
        }
        else if (error instanceof PostgrestError){
            const e:ErrorMessage = {
                ErrName: error.name,
                ErrMessage: error.message,
                ErrStackRace: error.stack,
                inputValue: `docs id: ${id}`
            }
            return <ErrorPage e={e} />
        }
    }
    

    
}

export default DocsDataHome;
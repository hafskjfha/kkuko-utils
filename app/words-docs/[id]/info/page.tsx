
import { supabase } from "@/app/lib/supabaseClient";
import NotFound from "@/app/not-found-client";
import ErrorPage from "@/app/ErrorPage";
import type { ErrorMessage } from "@/app/types/type";
import { PostgrestError } from "@supabase/supabase-js";
import DocsInfoPage from "./DocsInfo";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return {
        title: "끄코 유틸리티 - 단어장공유",
        description: `끄코 유틸리티 - 단어장 공유 ${id}번 문서 정보`,
    };
}

const getData = async (id: number) => {
    const {data,error} = await supabase.from('docs').select('id, created_at, name, users(nickname), typez, last_update').eq('id',id).maybeSingle();
    if (error) throw error;
    return data
}

const getDataOkWords = async (id: number) => {
    const {data:dataA, error:errorA} = await supabase.from('docs_words').select('words(word)').eq('docs_id',id);
    if (errorA) throw errorA;
    
    const words = dataA.map((wordk)=>wordk.words.word);
    return words;
};

const InfoPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    if (isNaN(Number(id))) return <NotFound />

    try{
        const data = await getData(Number(id));
        if (data===null){
            return <NotFound />
        }
        else{
            const dataa = await getDataOkWords(Number(id));
            if (dataa.length === 0){
                return <NotFound />
            }
            return <DocsInfoPage metaData={data} wordsCount={dataa.length}/>
        }
    }
    catch (error){
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
};

export default InfoPage;
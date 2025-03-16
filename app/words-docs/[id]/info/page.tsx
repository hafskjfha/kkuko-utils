import type { GetServerSidePropsContext } from "next";
import { supabase } from "@/app/lib/supabaseClient";
import NotFound from "@/app/not-found-client";
import ErrorPage from "@/app/ErrorPage";
import type { ErrorMessage } from "@/app/types/type";
import { PostgrestError } from "@supabase/supabase-js";
import DocsInfoPage from "./DocsInfo";

const getData = async (id: number) => {
    const { data, error } = await supabase
        .from("docs")
        .select("id, created_at, name, users(nickname), typez, last_update")
        .eq("id", id)
        .maybeSingle();

    if (error) throw error;
    return data;
};

const getDataOkWords = async (id: number) => {
    const { data: dataA, error: errorA } = await supabase
        .from("docs_words")
        .select("words(word)")
        .eq("docs_id", id);

    if (errorA) throw errorA;

    const words = dataA.map((wordk) => wordk.words.word);
    return words;
};

const InfoPage = async ({ params }: GetServerSidePropsContext<{ id: string }>) => {
    const { id } = await params ?? { id: undefined }; // ❌ await 제거
    if (!id || isNaN(Number(id))) return <NotFound />;
    try {
        const data = await getData(Number(id));
        if (!data) return <NotFound />;

        const words = await getDataOkWords(Number(id));
        if (words.length === 0) return <NotFound />;

        return <DocsInfoPage metaData={data} wordsCount={words.length} />;
    } catch (error) {
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

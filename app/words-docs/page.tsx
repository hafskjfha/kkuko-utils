import WordsDocsHome from "./WordsDocsHome";
import { supabase } from "../lib/supabaseClient";

export const revalidate = 0;


export async function generateMetadata() {
    return {
        title: "끄코 유틸리티 - 단어장공유",
        description: `끄코 유틸리티 - 단어장 공유 홈`,
    };
}

type DocsType = {
    id: string;
        name: string;
        maker: string;
        last_update: string; // timestampz (ISO string)
        is_manager: boolean;
        typez: "letter" | "theme" | "ect"
}[]
const getData = async () => {
    const { data: lastUpdateData, error: lastUpdateError } = await supabase.from('last_update').select('*').eq('table_name','docs').maybeSingle();
    if (lastUpdateError || !lastUpdateData) return {error: lastUpdateError};


    const docss:DocsType = [];
    const { data: docsData, error: docsError} = await supabase.from('docs').select('id, name, users(nickname),typez, last_update');
    if (docsError){
        // 처리 추가
        return [];
    }
    for (const {id, name, users, typez, last_update} of docsData){
        docss.push({id: `${id}`, name, maker: users?.nickname ?? "알수없음", last_update, is_manager: false, typez})
    }

    return docss
}

const WordsDocsHomePage = async () => {
    const data = await getData();
    return(
        <WordsDocsHome docs={"error" in data ? [] : data} error= {"error" in data ? data.error : null} />
    )
}

export default WordsDocsHomePage;
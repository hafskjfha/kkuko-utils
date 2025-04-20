import WordsDocsHome from "./WordsDocsHome";
import { supabase } from "../lib/supabaseClient";
import ErrorPage from "../components/ErrorPage";

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
        typez: "letter" | "theme" | "ect";
        created_at: string;
}[]
const getData = async () => {
    const { data: lastUpdateData, error: lastUpdateError } = await supabase.from('last_update').select('*').eq('table_name','docs').maybeSingle();
    if (lastUpdateError || !lastUpdateData) return {error: lastUpdateError};


    const docss:DocsType = [];
    const { data: docsData, error: docsError} = await supabase.from('docs').select('id, name, users(nickname),typez, last_update,created_at');
    if (docsError){
        // 처리 추가
        return [];
    }
    for (const {id, name, users, typez, last_update, created_at} of docsData){
        docss.push({id: `${id}`, name, maker: users?.nickname ?? "알수없음", last_update, is_manager: false, typez, created_at})
    }

    return docss
}

const WordsDocsHomePage = async () => {
    const data = await getData();
    if ("error" in data){
        return <ErrorPage message={"데이터를 가져오는중 에러가 발생했습니다."} />
    }
    else{
        return(
            <WordsDocsHome docs={data} error= {null} />
        )
    }
    
}

export default WordsDocsHomePage;
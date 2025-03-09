import WordsDocsHome from "./WordsDocsHome";
import { supabase } from "../lib/supabaseClient";


const getData = async () => {
    const docss:{
        id: string;
        name: string;
        maker: string;
        last_update: string; // timestampz (ISO string)
        is_manager: boolean;
        typez: "letter" | "theme" | "ect"
    }[] = [];
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
        <WordsDocsHome docs={data} />
    )
}

export default WordsDocsHomePage;
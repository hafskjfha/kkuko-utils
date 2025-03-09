import WordsDocsHome from "./WordsDocsHome";
import { supabase } from "../lib/supabaseClient";
import { cache } from "react";

type DocsType = {
    id: string;
        name: string;
        maker: string;
        last_update: string; // timestampz (ISO string)
        is_manager: boolean;
        typez: "letter" | "theme" | "ect"
}[]
// ✅ last_update 값을 저장할 변수 (캐싱)
let cachedData: DocsType | null = null;
let lastFetchedTime: string | null = null; // 마지막으로 데이터 가져온 시간

const getData = cache(async () => {
    const { data: lastUpdateData, error: lastUpdateError } = await supabase.from('last_update').select('*').eq('table_name','docs').maybeSingle();
    if (lastUpdateError || !lastUpdateData) return {error: lastUpdateError};


    const currentLastUpdate = lastUpdateData.last_modified;
    if (cachedData && lastFetchedTime === currentLastUpdate) {
		return cachedData;
	}

    const docss:DocsType = [];
    const { data: docsData, error: docsError} = await supabase.from('docs').select('id, name, users(nickname),typez, last_update');
    if (docsError){
        // 처리 추가
        return [];
    }
    for (const {id, name, users, typez, last_update} of docsData){
        docss.push({id: `${id}`, name, maker: users?.nickname ?? "알수없음", last_update, is_manager: false, typez})
    }

    cachedData= docss;
    lastFetchedTime = currentLastUpdate;
    return docss
})

const WordsDocsHomePage = async () => {
    const data = await getData();
    return(
        <WordsDocsHome docs={"error" in data ? [] : data} error= {"error" in data ? data.error : null} />
    )
}

export default WordsDocsHomePage;
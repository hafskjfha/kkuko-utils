import WordsAddHome from "./AddWordsHome";

export async function generateMetadata() {
    return {
        title: "끄코 유틸리티 - 관리자 페이지",
        description: `끄코 유틸리티 - 관리자 페이지`,
    };
}

export default function WordsAddPage(){
    return <WordsAddHome/>
}
import WordsAddHome from "./WordsAddHome";

export async function generateMetadata() {
    return {
        title: "끄코 유틸리티 - 단어 대량 추가",
        description: `끄코 유틸리티 - 오픈DB 단어 대량 추가`,
    };
}

export default function AddsWordPage(){
    return <WordsAddHome />
}
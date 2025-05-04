import KoreanWordFilter from "./WordsDownloadHome";

export async function generateMetadata() {
    return {
        title: "끄코 유틸리티 - 오픈DB 다운로드",
        description: `끄코 유틸리티 - 오픈DB 다운로드`,
    };
}

export default function wordsDownloadPage(){
    return <KoreanWordFilter />
}
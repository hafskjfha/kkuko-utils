import WordsDocsHomePage from "./WordsDocsHomePage";

export async function generateMetadata() {
    return {
        title: "끄코 유틸리티 - 단어장공유",
        description: `끄코 유틸리티 - 단어장 공유 홈`,
        keywords: ["끄코", "끄투코리아", "단어장", "공유", "긴단어", "장문", "미션"]
    };
}

const WordsDocsHomeServerPage = async () => {
    return <WordsDocsHomePage />
}

export default WordsDocsHomeServerPage;
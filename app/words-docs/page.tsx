import WordsDocsHomePage from "./WordsDocsHomePage";

export async function generateMetadata() {
    return {
        title: "끄코 유틸리티 - 단어장공유",
        description: `끄코 유틸리티 - 단어장 공유 홈`,
    };
}

const WordsDocsHomeServerPage = async () => {
    return <WordsDocsHomePage />
}

export default WordsDocsHomeServerPage;
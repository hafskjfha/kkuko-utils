import WordsDocsHomePage from "./WordsDocsHomePage";

export async function generateMetadata() {
    return {
        title: "끄코 유틸리티 - 단어장공유",
        description: `끄코 유틸리티 - 단어장 공유 홈`,
        openGraph: {
            title: "끄코 유틸리티 - 단어장공유",
            description: "끄코 유틸리티 - 단어장 공유 홈",
            type: "website",
            url: "https://kkuko-utils.vercel.app/words-docs",
            siteName: "끄코 유틸리티",
            locale: "ko_KR",
        },
    };
}

const WordsDocsHomeServerPage = async () => {
    return <WordsDocsHomePage />
}

export default WordsDocsHomeServerPage;
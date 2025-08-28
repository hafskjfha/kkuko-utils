import WordSearch from './WordSearch';

export async function generateMetadata() {
    return {
        title: "끄코 유틸리티 - 오픈DB 단어검색",
        description: `끄코 유틸리티 - 오픈DB 단어 검색 홈`,
        openGraph: {
            title: "끄코 유틸리티 - 오픈DB 단어검색",
            description: "끄코 유틸리티 - 오픈DB 단어 검색 홈",
            type: "website",
            url: "https://kkuko-utils.vercel.app/word/search",
            siteName: "끄코 유틸리티",
            locale: "ko_KR",
        },
    };
}

const WordSearchPage = () => {
    return <WordSearch />;
}

export default WordSearchPage;
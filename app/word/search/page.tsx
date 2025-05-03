import WordSearch from './WordSearch';

export async function generateMetadata() {
    return {
        title: "끄코 유틸리티 - 오픈DB 단어검색",
        description: `끄코 유틸리티 - 오픈DB 단어 검색 홈`,
    };
}

const WordSearchPage = () => {
    return <WordSearch />;
}

export default WordSearchPage;
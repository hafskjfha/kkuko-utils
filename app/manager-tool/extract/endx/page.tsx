import WordExtractorApp from "./EndX";

export async function generateMetadata() {
    return {
        title: "끄코 유틸리티 - 단어장 관리",
        description: '끄코 유틸리티 - 단어장 관리',
    };
}

const EndXPage: React.FC = () => {
    return (
        <>
            <WordExtractorApp />
        </>
    )
}

export default EndXPage;
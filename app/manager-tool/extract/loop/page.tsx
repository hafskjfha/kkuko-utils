import WordExtractorApp from "./Loop";

export async function generateMetadata() {
    return {
        title: "끄코 유틸리티 - 단어장 관리",
        description: '끄코 유틸리티 - 단어장 관리',
    };
}

const LoopPage: React.FC = () => {
    return (
        <>
            <WordExtractorApp />
        </>
    )
}

export default LoopPage;
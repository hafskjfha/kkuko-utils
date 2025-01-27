import WordExtractorApp from "./StartX";

export async function generateMetadata() {
	return {
		title: "끄코 유틸리티 - 단어장 관리",
		description: '끄코 유틸리티 - 단어장 관리',
	};
}

const StartXPage: React.FC = () => {
    return (
        <>
            <WordExtractorApp />
        </>
    )
}

export default StartXPage;
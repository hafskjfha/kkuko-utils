import WordCombinerPage from "./WordCombinerPage";

export async function generateMetadata() {
	return {
		title: "끄코 유틸리티 - 단어조합기",
		description: '끄코 유틸리티 - 단어조합기',
	};
}

const word_combiner_Home: React.FC = () => {
	return (
		<WordCombinerPage />
	)
}

export default word_combiner_Home;
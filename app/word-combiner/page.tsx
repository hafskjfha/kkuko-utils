import React from 'react';
import WordCombinerClient from './WordCombinerClient';

export async function generateMetadata() {
	return {
		title: "끄코 유틸리티 - 단어조합기",
		description: '끄코 유틸리티 - 단어조합기',
	};
}

const word_combiner_Home: React.FC = () => {
	return (
		< WordCombinerClient />
	)
}

export default word_combiner_Home;
import React from 'react';
import Home from './Home';

export async function generateMetadata() {
    return {
        title: "끄코 유틸리티 - Home",
        description: '끄코 유틸리티',
    };
}

const HomePage: React.FC = () => (
	<Home />
)

export default HomePage;

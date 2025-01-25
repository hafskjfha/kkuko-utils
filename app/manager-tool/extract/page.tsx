import ExtractHome from './ExtractHome';

export async function generateMetadata() {
	return {
		title: "끄코 유틸리티 - 단어장 관리",
		description: '끄코 유틸리티 - 단어장 관리',
	};
}

const ExtractPage: React.FC = () => {
    return (
        <>
            <ExtractHome />
        </>
    )
}

export default ExtractPage;
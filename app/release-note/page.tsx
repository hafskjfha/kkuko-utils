import ReleaseNote from "./ReleaseNote";

export async function generateMetadata() {
	return {
		title: "끄코 유틸리티 - 릴리즈 노트",
		description: '끄코 유틸리티 - 릴리즈 노트',
	};
}

const ReleaseNotePage: React.FC = () => {
    return (
        <ReleaseNote />
    )
}

export default ReleaseNotePage;
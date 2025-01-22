import Home from "./Home";

export async function generateMetadata() {
	return {
		title: "끄코 유틸리티 - 단어장 관리",
		description: '끄코 유틸리티 - 단어장 관리',
	};
}

const Page: React.FC = () => {
    return (
        <>
            <Home />
        </> 
    )
};

export default Page;

import RequestPage from "./RequestsHome";

export async function generateMetadata() {
    return {
        title: "끄코 유틸리티 - 오픈DB 요청 목록",
        description: `끄코 유틸리티 - 오픈DB 요청 목록`,
    };
}

const Page = () => {
    return <RequestPage />;
};

export default Page;
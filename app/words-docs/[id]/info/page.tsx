import NotFound from "@/app/not-found-client";
import DocsInfoPage from "./DocsInfoPage";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return {
        title: "끄코 유틸리티 - 단어장공유",
        description: `끄코 유틸리티 - 단어장 공유 ${id}번 문서 정보`,
    };
}

const InfoPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const DocsID = Number(id)

    if (isNaN(DocsID)) return <NotFound />
    return <DocsInfoPage id={DocsID} />
    
};

export default InfoPage;
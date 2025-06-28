import NotFound from "@/app/not-found-client";
import DocsDataPage from "./DocsDataPage";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const {id} = await params;
    return {
        title: "끄코 유틸리티 - 단어장공유",
        description: `끄코 유틸리티 - 단어장 공유 ${id}번 문서`,
    };
}

const DocsDataHomePage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const {id} = await params;
    const nid = Number(id)

    if (isNaN(nid)) return <NotFound />
    return <DocsDataPage id={nid} />
    
}

export default DocsDataHomePage;
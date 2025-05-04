import NotFound from "@/app/not-found-client";
import DocsLogPage from "./DocsLogPage";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return {
        title: "끄코 유틸리티 - 단어장공유",
        description: `끄코 유틸리티 - 단어장 공유 ${id}번 문서 로그`,
    };
}

const LogsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const docsID = Number(id);

    if (isNaN(docsID)) return <NotFound />;
    return <DocsLogPage id={docsID}/>
};

export default LogsPage;

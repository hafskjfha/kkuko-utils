import { Metadata } from "next";
import AdminLogsHome from "./AdminLogsHome";
import { SCM } from "@/app/lib/supabaseClient";

export const metadata: Metadata = {
    title: "끄코 유틸 - 관리자 로그 관리",
    description: "관리자 로그 관리 페이지",
};

export default async function AdminLogsPage() {
    const [
        { data: allWordLogs, error: wordLogsError },
        { data: allDocsLogs, error: docsLogsError },
        { data: allDocs, error: allDocsError }
    ] = await Promise.all([
        SCM.get().logsByFillter({ filterState: "all", filterType: "all", from: 0, to: 49 }),
        SCM.get().docsLogsByFilter({ logType: "all", from: 0, to: 49 }),
        SCM.get().allDocs()
    ]);

    if (wordLogsError || docsLogsError || allDocsError) {
        return <div>데이터를 불러오는 중 오류가 발생했습니다.</div>;
    }

    return (
        <AdminLogsHome 
            initialWordLogs={allWordLogs || []}
            initialDocsLogs={allDocsLogs || []}
            allDocs={allDocs || []}
        />
    );
}

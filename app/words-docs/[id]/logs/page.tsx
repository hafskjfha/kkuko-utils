import DocsLogs from "./DocsLogs";
import NotFound from "@/app/not-found-client";
import { supabase } from "@/app/lib/supabaseClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return {
        title: "끄코 유틸리티 - 단어장공유",
        description: `끄코 유틸리티 - 단어장 공유 ${id}번 문서 로그`,
    };
}

const getDocs = async (id: number) => {
    const { data, error } = await supabase
        .from("docs")
        .select("name")
        .eq("id", id)
        .maybeSingle();
    if (error) throw error;
    return data;
};

const getLogs = async (id: number) => {
    const { data, error } = await supabase
        .from("docs_logs")
        .select("word, users(nickname), date, type")
        .eq("docs_id", id)
        .order("date", { ascending: false });
    if (error) throw error;

    return data;
};

const LogsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const docsID = Number(id);

    if (isNaN(docsID)) return <NotFound />;
    const docsData = await getDocs(docsID);
    if (!docsData) return <NotFound />;

    const logsData = (await getLogs(docsID)).map((log, index) => ({
        id: index,
        word: log.word,
        user: log.users?.nickname,
        date: log.date,
        type: log.type,
    }));

    return <DocsLogs id={docsID} name={docsData.name} Logs={logsData} />;
};

export default LogsPage;

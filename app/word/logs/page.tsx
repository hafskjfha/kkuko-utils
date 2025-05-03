import LogPage from './LogsHome'

export async function generateMetadata() {
    return {
        title: "끄코 유틸리티 - 오픈DB 로그",
        description: `끄코 유틸리티 - 오픈DB 로그`,
    };
}

export default function LogsPage() {
    return (
        <LogPage />
    )
}
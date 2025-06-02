import AdminHomeWrapper from "./AdminWrapper";

export async function generateMetadata() {
    return {
        title: "끄코 유틸리티 - 관리자 페이지",
        description: `끄코 유틸리티 - 관리자 페이지`,
    };
}

export default function AdminRequestPage(){
    return <AdminHomeWrapper />
}
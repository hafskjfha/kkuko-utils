import NoticeManagementPage from "./NoticeManagementPage";

export async function generateMetadata() {
    return {
        title: "끄코 유틸리티 - 공지사항 관리",
        description: `끄코 유틸리티 - 공지사항 관리`,
        openGraph: {
            title: "끄코 유틸리티 - 공지사항 관리",
            description: "끄코 유틸리티 - 공지사항 관리",
            type: "website",
            url: "https://kkuko-utils.vercel.app/admin/notice",
            siteName: "끄코 유틸리티",
            locale: "ko_KR",
        },
    };
}

export default function AdminNoticePage(){
    return <NoticeManagementPage />
}

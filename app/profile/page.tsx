import ProfileHomePage from "./ProfileHome";

export async function generateMetadata() {
    return {
        title: `끄코 유틸리티 - 프로필 페이지`,
        description: `끄코 유틸리티 - 프로필 페이지 홈`,
    }
}

export default function ProfilePageA() {
    return (
        <ProfileHomePage />
    );
}

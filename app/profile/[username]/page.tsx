import UserProfilePage from "./ProfilePage";


export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
    const {username} = await params;
    return {
        title: `끄코 유틸리티 - ${decodeURIComponent(username)} 프로필`,
        description: `끄코 유틸리티 - ${decodeURIComponent(username)}의 프로필`,
    }
}

export default async function Profile({ params }: { params: Promise<{ username: string }> }){
    // 서버에서 먼저 유저 체크후 404 / 유저 프로필 표시 결정
    const {username} = await params;
    return <UserProfilePage userName={decodeURIComponent(username)} />

}
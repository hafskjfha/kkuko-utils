import KoreanMissionB from "./KoreanMissionB";

export async function generateMetadata() {
    return {
        title: "끄코 유틸리티 - 단어장 관리",
        description: '끄코 유틸리티 - 단어장 관리',
    };
}

const KoreanMissionBPage: React.FC = () => {
    return (
        <>
            <KoreanMissionB />
        </>
    )
}

export default KoreanMissionBPage;
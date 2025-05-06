import Link from "next/link";

export async function generateMetadata() {
    return {
        title: "끄코 유틸리티 - 오픈DB",
        description: `끄코 유틸리티 - 오픈DB 홈`,
    };
}

const features = [
    { title: "단어 검색", description: "DB에 저장된 단어를 검색합니다.", link: "/word/search" },
    { title: "단어 추가", description: "새로운 단어를 오픈DB에 등록합니다.", link: "/word/add" },
    { title: "단어 로그", description: "단어의 최근 로그를 확인합니다.", link: "/word/logs" },
    { title: "요청 대기 현황", description: "추가/삭제 요청 대기 목록을 확인합니다.", link: "/word/requests" },
    { title: "DB 다운로드", description: "오픈DB의 단어들을 필터링해 다운로드합니다.", link: "/word/words-download" },
    { title: "API", description: "개발자들이 사용할수  있는 오픈 API문서 입니다.", link: "/word/open-api" }
];

export default function OpenDBHomePage() {
    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">한국어 오픈DB 관리</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, idx) => (
                    <div
                        key={idx}
                        className="border rounded-2xl p-6 hover:shadow-md transition flex flex-col justify-between"
                    >
                        <div>
                            <h2 className="text-2xl font-semibold mb-2">{feature.title}</h2>
                            <p className="text-gray-600">{feature.description}</p>
                        </div>
                        <Link
                            href={feature.link}
                            className="mt-4 inline-block text-blue-600 hover:underline font-medium"
                        >
                            바로가기 →
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

import Link from "next/link";

export async function generateMetadata() {
    return {
        title: "끄코 유틸리티 - 기타 기능",
        description: `끄코 유틸리티 - 기타 기능 홈`,
    };
}

const features = [
    { title: "오픈 DB", description: "단어 오픈 데이터베이스를 확인 및 활용하세요.", link: "/word" },
    
];

export default function ExtraFeaturesPage() {
    return (
        <div className="p-6 max-w-5xl mx-auto min-h-[500px]">
            <h1 className="text-3xl font-bold mb-8">추가 기능</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="border rounded-2xl p-6 hover:shadow-lg transition flex flex-col justify-between"
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
import WordAddHome from "./WordAddHome";

export async function generateMetadata() {
    return {
        title: "끄코 유틸리티 - 단어 추가",
        description: `끄코 유틸리티 - 오픈DB 단어 추가`,
    };
}

export default async function WordAddPage() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-8 mb-20 dark:bg-gray-900">
            <WordAddHome />
        </div>
    );
}

import WordInfoPage from './WordInfoPage';

export async function generateMetadata({ params }: { params: Promise<{ query: string }> }) {
    const query = decodeURIComponent((await params).query);
    return {
        title: "끄코 유틸리티 - 단어 검색",
        description: `끄코 유틸리티 - 단어 검색: ${query}`,
    };
}

export default async function SearchPage({ params }: { params: Promise<{ query: string }> }) {
    const query = decodeURIComponent((await params).query);
    return (
        <div className="flex flex-col items-center justify-center bg-gray-100">
            <WordInfoPage query={query} />
        </div>
    );
}
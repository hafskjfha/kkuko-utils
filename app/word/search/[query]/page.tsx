
import WordInfoPage from './WordInfoPage';

export default async function SearchPage({ params }: { params: Promise<{ query: string }> }) {
    const query = decodeURIComponent((await params).query);
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <WordInfoPage query={query} />
        </div>
    );
}
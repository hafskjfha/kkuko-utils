"use client";
import { useRouter } from 'next/navigation';

const Home: React.FC = () => {
    const router = useRouter();
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center py-10">
            {/* Header Section */}
            <header className="w-full bg-blue-600 dark:bg-blue-700 text-white py-5 text-center">
                <h1 className="text-2xl sm:text-3xl font-bold">끄코 도구 (kkuko-utils)</h1>
                <p className="mt-2 text-sm sm:text-lg">
                    끄코 사용자가 편리할 수 있게 하는 도구 웹사이트
                </p>
            </header>

            {/* Features Section */}
            <main className="flex flex-col items-center w-full px-4 mt-10">
                <h2 className="text-xl sm:text-2xl font-semibold mb-5 text-gray-900 dark:text-gray-100">
                    기능 (Features)
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 w-full max-w-4xl">
                    <div
                        className="p-5 bg-white dark:bg-gray-800 shadow-md rounded-lg cursor-pointer hover:shadow-lg transition"
                        onClick={() => router.push('/word-combiner')}
                    >
                        <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                            기능 1: 단어 조합기
                        </h3>
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                            글자 조각으로 6, 5글자 조합하여 낱장, 휘장 상자 획득.
                        </p>
                    </div>

                    <div
                        className="p-5 bg-white dark:bg-gray-800 shadow-md rounded-lg cursor-pointer hover:shadow-lg transition"
                        onClick={() => router.push('/manager-tool')}
                    >
                        <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                            기능 2: 단어장 정리 도구
                        </h3>
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                            글자순 정렬 및 특정 단어 추출 등 정리 도구 제공.
                        </p>
                    </div>

                    <div className="p-5 bg-white dark:bg-gray-800 shadow-md rounded-lg">
                        <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                            기능 3: 매달 단어추가 요청 정리
                        </h3>
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                            매달 끄코 단어추가 요청을 엑셀형식으로 정리 (개발 예정).
                        </p>
                    </div>

                    <div className="p-5 bg-white dark:bg-gray-800 shadow-md rounded-lg">
                        <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                            기능 4: 빌런 단어장 게시
                        </h3>
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                            빌런 단어장을 공유하고 사용하며 수정할 수 있게 하는 기능 (개발 예정).
                        </p>
                    </div>
                </div>
            </main>
        </div>

    );
};

export default Home;
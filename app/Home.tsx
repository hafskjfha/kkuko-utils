import Link from 'next/link';

const Home: React.FC = () => {
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
                    <Link href={"/word-combiner"}>
                        <div
                            className="p-5 bg-white dark:bg-gray-800 shadow-md rounded-lg cursor-pointer hover:shadow-lg transition"
                        >
                            <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                                기능 1: 단어 조합기
                            </h3>
                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                글자 조각으로 6, 5글자 조합하여 낱장, 휘장 상자 획득.
                            </p>
                        </div>
                    </Link>
                    
                    <Link href={"/manager-tool"}>
                        <div
                            className="p-5 bg-white dark:bg-gray-800 shadow-md rounded-lg cursor-pointer hover:shadow-lg transition"
                        >
                            <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                                기능 2: 단어장 정리 도구
                            </h3>
                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                글자순 정렬 및 특정 단어 추출 등 정리 도구 제공.
                            </p>
                        </div>
                    </Link>

                    <Link href={"/words-docs"}>
                        <div className="p-5 bg-white dark:bg-gray-800 shadow-md rounded-lg">
                            <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                                기능 3: 단어장 게시
                            </h3>
                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                단어장을 공유하고 사용하며 수정할 수 있게 하는 기능.
                            </p>
                        </div>
                    </Link>

                    <Link href={"/extra-features"}>
                        <div className="p-5 bg-white dark:bg-gray-800 shadow-md rounded-lg">
                            <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                                기타 기능
                            </h3>
                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                기타 기능. 오픈 DB확인, 타자연습(추가예정) 등.
                            </p>
                        </div>
                    </Link>
                    
                </div>
            </main>
        </div>

    );
};

export default Home;
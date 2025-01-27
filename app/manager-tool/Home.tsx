"use client";
import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-start">
            {/* 제목 영역 */}
            <header className="text-center mt-10 px-4">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                    단어장 관리 도구
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">
                    원하는 작업을 아래에서 선택하세요.
                </p>
            </header>

            {/* 기능 설명 영역 */}
            <main className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 px-4 w-full max-w-5xl">
                {/* 추출계열 */}
                <div className="bg-white dark:bg-gray-800 p-6 shadow-md dark:shadow-lg rounded-lg text-center flex flex-col items-center">
                    <h2 className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        추출 도구
                    </h2>
                    <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
                        텍스트파일 합치기 / 미션단어 ● 돌림단어 추출 / 그외 등등을 도와주는 도구입니다.
                    </p>
                    <Link href="/manager-tool/extract">
                        <button className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-700 w-full md:w-auto">
                            이동하기
                        </button>
                    </Link>
                </div>

                {/* 정리 계열 */}
                <div className="bg-white dark:bg-gray-800 p-6 shadow-md dark:shadow-lg rounded-lg text-center flex flex-col items-center">
                    <h2 className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                        정리 도구
                    </h2>
                    <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
                        단어장의 내용을 정렬 / 중복제거 / 특정글자 바꾸기 등등의 기능을 제공하는 도구입니다.
                    </p>
                    <Link href="/manager-tool/arrange">
                        <button className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded hover:bg-green-600 dark:hover:bg-green-700 w-full md:w-auto">
                            이동하기
                        </button>
                    </Link>
                </div>
            </main>
        </div>

    );
}

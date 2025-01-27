"use client";
import { useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();

    const goBack = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push("/");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-blue-600 dark:text-blue-400">
                404 NOT FOUND
            </h1>
            <p className="text-lg md:text-2xl mt-4 text-gray-800 dark:text-gray-300">
                페이지를 찾을 수 없습니다.
            </p>
            <button
                onClick={goBack}
                className="mt-6 px-4 py-2 text-sm md:text-base bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
                이전창으로 돌아가기
            </button>
        </div>
    );
}

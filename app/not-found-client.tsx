"use client";
import { useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();

    const goBack = () => {
        if (window.history.length > 1) {
            router.back(); // 뒤로 가기
        } else {
            router.push("/"); // 히스토리가 없으면 홈으로 이동
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-6xl font-bold text-blue-600">404 NOT FOUND</h1>
            <p className="text-2xl mt-4 text-gray-800">페이지를 찾을 수 없습니다.</p>
            <a
                onClick={goBack}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
            >
                이전창으로 돌아가기
            </a>
        </div>
    );
}
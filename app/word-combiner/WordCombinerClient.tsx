"use client"
import Image from 'next/image';
import { useState } from 'react';

export default function WordCombinerClient() {
    const [showHelpModal, setShowHelpModal] = useState(false);

    return (
        <div className="flex flex-col h-screen">
            {/* 도움말 버튼 */}
            <div className="p-4 flex justify-end bg-gray-50 border-b">
                <button
                    onClick={() => setShowHelpModal(true)}
                    className="flex items-center space-x-2 text-blue-500 hover:underline"
                >
                    <Image
                        src="/info-logo.svg"
                        alt="도움말"
                        width={24}
                        height={24}
                        className="inline-block"
                    />
                </button>
            </div>

            {/* 메인 컨테이너 */}
            <div className="flex flex-col md:flex-row flex-grow">
                {/* 왼쪽 컨테이너 */}
                <div className="w-full md:w-1/2 bg-gray-100 p-4 flex flex-col space-y-4">
                    <div className="flex items-center space-x-2">
                        <label className="w-20 text-gray-700 text-sm">이름 입력:</label>
                        <input
                            type="text"
                            placeholder="Input 1"
                            className="flex-1 p-2 border border-gray-300 rounded-md"
                        />
                        <button className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                            Button 1
                        </button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="w-20 text-gray-700 text-sm">이메일 입력:</label>
                        <input
                            type="text"
                            placeholder="Input 2"
                            className="flex-1 p-2 border border-gray-300 rounded-md"
                        />
                        <button className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                            Button 2
                        </button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="w-20 text-gray-700 text-sm">전화번호:</label>
                        <input
                            type="text"
                            placeholder="Input 3"
                            className="flex-1 p-2 border border-gray-300 rounded-md"
                        />
                        <button className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                            Button 3
                        </button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="w-20 text-gray-700 text-sm">주소 입력:</label>
                        <input
                            type="text"
                            placeholder="Input 4"
                            className="flex-1 p-2 border border-gray-300 rounded-md"
                        />
                        <button className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                            Button 4
                        </button>
                    </div>
                </div>

                {/* 오른쪽 컨테이너 */}
                <div className="w-full md:w-1/2 bg-white p-4 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <div className="flex flex-col w-full md:w-1/2 h-64">
                        <div className="p-2 text-center text-gray-600 bg-gray-100 rounded-t-md text-sm">
                            박스 제목 1
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-b-md flex items-center justify-center">
                            Result Box 1
                        </div>
                    </div>
                    <div className="flex flex-col w-full md:w-1/2 h-64">
                        <div className="p-2 text-center text-gray-600 bg-gray-100 rounded-t-md text-sm">
                            박스 제목 2
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-b-md flex items-center justify-center">
                            Result Box 2
                        </div>
                    </div>
                </div>
            </div>

            {/* 모달창 */}
            {showHelpModal && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-bold mb-4">도움말</h3>
                        <p className="text-sm text-gray-700">
                            이 애플리케이션은 ... (도움말 내용을 여기에 추가)
                        </p>
                        <button
                            onClick={() => setShowHelpModal(false)}
                            className="mt-4 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

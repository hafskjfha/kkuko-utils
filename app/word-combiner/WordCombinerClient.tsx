"use client"
import Image from 'next/image';
import { useState } from 'react';

export default function WordCombinerClient() {
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [nomalJOKAK,setNomalJOKAK] = useState<string>("");
    const [highJOKAK,setHighJOKAK] = useState<string>("");
    const [rareJOKAK,setRareJOKAK] = useState<string>("");
    const [inputHtml,setInputHtml] = useState<string>("");

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
                        <label className="w-16 text-gray-700 text-xs">(일반) <br></br>
                        글자조각:</label>
                        <textarea
                            placeholder="일반 글자조각 입력"
                            className="flex-1 p-2 border border-gray-300 rounded-md text-xs overflow-auto resize-none"
                            rows={4}
                            value={nomalJOKAK}
                            onChange={(e)=>{setNomalJOKAK(e.target.value)}}
                        />
                        <button className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                            확인
                        </button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="w-16 text-gray-700 text-xs">(고급)<br></br>
                            글자조각:</label>
                        <textarea
                            placeholder="고급 글자조각 입력"
                            className="flex-1 p-2 border border-gray-300 rounded-md text-xs overflow-auto resize-none"
                            rows={3}
                            value={highJOKAK}
                            onChange={(e)=>{setHighJOKAK(e.target.value)}}
                        />
                        <button className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                            확인
                        </button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="w-16 text-gray-700 text-sm">(희귀)<br></br>
                        글자조각:</label>
                        <textarea
                            placeholder="희귀 글자조각 입력"
                            className="flex-1 p-2 border border-gray-300 rounded-md text-xs overflow-auto resize-none"
                            rows={2}
                            value={rareJOKAK}
                            onChange={(e)=>{setRareJOKAK(e.target.value)}}
                        />
                        <button className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                            확인
                        </button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="w-16 text-gray-700 text-sm">html 입력:</label>
                        <textarea
                            placeholder="희귀 글자조각 입력"
                            className="flex-1 p-2 border border-gray-300 rounded-md text-xs overflow-auto resize-none"
                            rows={2}
                            value={inputHtml}
                            onChange={(e)=>{setInputHtml(e.target.value)}}
                        />
                        <button className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                            확인
                        </button>
                    </div>
                </div>

                {/* 오른쪽 컨테이너 */}
                <div className="w-full md:w-1/2 bg-white p-4 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <div className="flex flex-col w-full md:w-1/2 h-64">
                        <div className="p-2 text-center text-gray-600 bg-gray-100 rounded-t-md text-sm">
                            만들어진 6글자 단어
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-b-md flex items-center justify-center">
                            
                        </div>
                    </div>
                    <div className="flex flex-col w-full md:w-1/2 h-64">
                        <div className="p-2 text-center text-gray-600 bg-gray-100 rounded-t-md text-sm">
                            만들어진 5글자 단어
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-b-md flex items-center justify-center">
                            
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

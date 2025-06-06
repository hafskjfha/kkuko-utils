"use client";

import React from "react";
import Link from "next/link";

const ExtractHome: React.FC = () => {
    const menuItems = [
        { id: 1, name: "X글자수 단어 추출", description: "텍스트 파일에서 길이가 X인 글자들을 추출합니다.", link: "/lenx" },
        { id: 2, name: "X로 시작하는 단어 추출", description: "텍스트 파일에서 X로 시작하는 단어들을 추출합니다.", link: "/startx" },
        { id: 3, name: "X로 끝나는 단어 추출", description: "텍스트 파일에서 X로 끝나는 단어들을 추출합니다", link: "/endx" },
        { id: 4, name: "돌림단어 추출", description: "텍스트 파일에서 돌림단어들을 추출합니다.", link: "/loop" },
        { id: 5, name: "파일합성", description: "2개의 텍스트파일을 합성합니다.", link: "/merge" },
        { id: 6, name: "한국어 미션단어 추출 - A", description: "텍스트 파일에서 한국어 미션단어들을 추출합니다.", link: "/korean-mission" },
        { id: 7, name: "영어 미션단어 추출", description: "텍스트 파일에서 영어 미션단어들을 추출합니다.", link: "/english-mission" },
        { id: 8, name: "한국어 미션단어 추출 - B", description: "텍스트 파일에서 미션단어중 1티어만 추출합니다.", link: "/korean-mission-b" },
        { id: 9, name: "기능고민중", description: "원하는 기능을 추가해달라고 요청해주세요!" },
    ];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {menuItems.map((item) => (
                    item.link ? (
                        <Link key={item.id} href={`/manager-tool/extract${item.link}`}>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-lg p-6 flex flex-col items-center hover:shadow-lg dark:hover:shadow-xl transition-all cursor-pointer">
                                <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">{item.name}</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm text-center">{item.description}</p>
                            </div>
                        </Link>
                    ) : (
                        <div
                            key={item.id}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-lg p-6 flex flex-col items-center hover:shadow-lg dark:hover:shadow-xl transition-all">
                            <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">{item.name}</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">{item.description}</p>
                        </div>
                    )
                ))}
            </div>
        </div>

    );
};

export default ExtractHome;

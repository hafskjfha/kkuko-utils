"use client";
import { useState } from "react";
import Link from "next/link";

const Header:React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="bg-gray-900 text-white shadow-md">
            <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
                {/* 로고 */}
                <div className="text-2xl font-bold">
                    <Link href="/">
                        <span className="hover:text-gray-300 transition-colors">Kkuko utils</span>
                    </Link>
                </div>

                {/* 햄버거 메뉴 버튼 */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-gray-300 hover:text-white focus:outline-none"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {isOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16m-7 6h7"
                                />
                            )}
                        </svg>
                    </button>
                </div>

                {/* 네비게이션 링크 */}
                <div
                    className={`${isOpen ? "block" : "hidden"
                        } md:flex md:items-center md:space-x-6 text-sm`}
                >
                    <Link href="/about" className="block py-2 md:py-0 hover:text-gray-300">
                        단어조합기
                    </Link>
                    <Link href="/services" className="block py-2 md:py-0 hover:text-gray-300">
                        단어장 관리 도구
                    </Link>
                    <Link href="/blog" className="block py-2 md:py-0 hover:text-gray-300">
                        빌런 단어장 공유
                    </Link>
                    <Link href="/contact" className="block py-2 md:py-0 hover:text-gray-300">
                        단어 추가 요청 정리
                    </Link>
                </div>
            </nav>
        </header>
    );
};

export default Header;

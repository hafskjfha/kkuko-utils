import React, { useEffect, useRef } from 'react';

interface HelpModalprop {
    onClose: () => void;
    wantGo?: 1 | 2 | 3;
}

const HelpModal: React.FC<HelpModalprop> = ({ onClose, wantGo }) => {
    // 각 섹션에 대한 
    const sortRef1 = useRef<HTMLHeadingElement>(null);
    const sortRef2 = useRef<HTMLHeadingElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        if (wantGo) {
            switch (wantGo) {
                case 2:
                    scrollToSection(sortRef1);
                    break;
                case 3:
                    scrollToSection(sortRef2);
                    break;
            }
        }
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div
                ref={modalRef}
                className="bg-white dark:bg-gray-900 rounded-lg p-6 w-11/12 md:w-2/3 lg:w-1/2 max-h-[80vh] overflow-y-auto shadow-xl"
            >
                {/* Title */}
                <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
                    단어장 정리 도구 도움말
                </h3>

                {/* 목차 */}
                <ul className="mb-6 space-y-2">
                    <li>
                        <button
                            className="text-blue-500 dark:text-blue-400 hover:underline"
                            onClick={() => scrollToSection(sortRef1)}
                        >
                            ㄱㄴㄷ순 정렬 v1
                        </button>
                    </li>
                    <li>
                        <button
                            className="text-blue-500 dark:text-blue-400 hover:underline"
                            onClick={() => scrollToSection(sortRef2)}
                        >
                            ㄱㄴㄷ순 정렬 v2
                        </button>
                    </li>
                </ul>

                {/* 본문 */}
                <div>
                    <h3
                        ref={sortRef1}
                        className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100"
                    >
                        ㄱㄴㄷ순 정렬 v1
                    </h3>

                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        v1 버전은 기본적인 정렬 방법을 사용합니다.
                    </p>

                    <pre className="bg-gray-100 dark:bg-gray-800 text-sm p-3 rounded-md text-gray-800 dark:text-gray-200 mb-4">
{`나릅\n개두릅\n주릅\n사릅`}<br/> → <br/>{`개두릅\n나릅\n사릅\n주릅`}
                    </pre>

                    <h3
                        ref={sortRef2}
                        className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100"
                    >
                        ㄱㄴㄷ순 정렬 v2
                    </h3>

                    <p className="text-gray-700 dark:text-gray-300">
                        v2 버전은 앞글자가 같은것 끼리 모아서 정렬합니다.
                    </p>

                    <pre className="bg-gray-100 dark:bg-gray-800 text-sm p-3 rounded-md text-gray-800 dark:text-gray-200">
{`나릅\n개두릅\n주릅\n사릅`} <br/>→<br/>{`=[개]=\n개두릅\n\n=[나]=\n나릅\n\n=[사]=\n사릅\n\n=[주]=\n주릅`}
                    </pre>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="mt-4 w-full p-2 bg-blue-500 dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                >
                    닫기
                </button>
            </div>
        </div>
    )
}

export default HelpModal;
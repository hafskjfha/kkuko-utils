"use client";
import React, { useEffect, useRef } from "react";

interface HelpModalprop {
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalprop> = ({ onClose }) => {
    const Mod1Ref = useRef<HTMLHeadingElement>(null);
    const Mod2Ref = useRef<HTMLHeadingElement>(null);
    const Mod3Ref = useRef<HTMLHeadingElement>(null);
    const Mod4Ref = useRef<HTMLHeadingElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: "smooth" });
        }
    };

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
                className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 overflow-y-auto md:w-2/3 lg:w-1/2 max-h-[80vh] relative shadow-xl dark:text-white"
            >
                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                    aria-label="Close"
                >
                    ✕
                </button>

                {/* Title */}
                <h3 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">돌림 단어 모드 도움말</h3>

                {/* 목차 */}
                <ul className="mb-6 space-y-4">
                    {["모드 1", "모드 2", "모드 3", "모드 4"].map((mode, index) => (
                        <li key={index}>
                            <button
                                className="text-blue-600 font-semibold hover:underline flex items-center gap-2 dark:text-blue-400"
                                onClick={() => scrollToSection([Mod1Ref, Mod2Ref, Mod3Ref, Mod4Ref][index])}
                            >
                                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center dark:bg-blue-400 dark:text-blue-900">
                                    {index + 1}
                                </span>
                                {mode}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* 본문 */}
                <div className="space-y-6">
                    <div>
                        <h3 ref={Mod1Ref} className="text-xl font-semibold mb-2 border-b pb-2 text-gray-900 dark:text-white">모드 1</h3>
                        <p className="text-gray-600 dark:text-gray-300">[입력한 글자]--[입력한 글자]의 형식으로 추출됩니다.</p>
                        <p>예시</p>
                        <pre className="bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
                            라메디아노체루나라 <br/>
                            라멜라 <br/>
                            라미아벨라 <br/>
                            라비린툴라 <br/>
                            라사라 <br/>
                        </pre>
                    </div>
                    <div>
                        <h3 ref={Mod2Ref} className="text-xl font-semibold mb-2 border-b pb-2 text-gray-900 dark:text-white">모드 2</h3>
                        <p className="text-gray-600 dark:text-gray-300">[입력한 글자(두음 허용)]--[입력한 글자]의 형식으로 추출됩니다.</p>
                        <p>예시</p>
                        <pre className="bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
                            나라없는나라 <br/>
                            나를인간이라고부르지말라 <br/>
                            라미아벨라 <br/>
                            라비린툴라 <br/>
                            라사라 <br/>
                        </pre>
                    </div>
                    <div>
                        <h3 ref={Mod3Ref} className="text-xl font-semibold mb-2 border-b pb-2 text-gray-900 dark:text-white">모드 3</h3>
                        <p className="text-gray-600 dark:text-gray-300">[입력한 글자]--[입력한 글자(두음 허용)]의 형식으로 추출됩니다.</p>
                        <p>예시</p>
                        <pre className="bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
                            라그나로스님의힘이느껴지는구나 <br/>
                            라바하운드와불타오르는아레나 <br/>
                            라미아벨라 <br/>
                            라비린툴라 <br/>
                            라사라 <br/>
                        </pre>
                    </div>
                    <div>
                        <h3 ref={Mod4Ref} className="text-xl font-semibold mb-2 border-b pb-2 text-gray-900 dark:text-white">모드 4</h3>
                        <p className="text-gray-600 dark:text-gray-300">[입력한 글자(두음 허용)]--[입력한 글자(두음 허용)]의 형식으로 추출됩니다.</p>
                        <p>예시</p>
                        <pre className="bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
                            나가르주나 <br/>
                            나라없는나라 <br/>
                            라그나로스님의힘이느껴지는구나 <br/>
                            라비린툴라 <br/>
                            라사라 <br/>
                        </pre>
                    </div>
                </div>
            </div>
        </div>


    )
}

export default HelpModal;
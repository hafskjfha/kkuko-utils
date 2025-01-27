"use client";
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';

interface HelpModalprop {
    onClose: () => void;
    wantGo?: 1 | 2 | 3;
}

const HelpModal: React.FC<HelpModalprop> = ({ onClose, wantGo }) => {
    // 각 섹션에 대한 
    const nomalHelp = useRef<HTMLHeadingElement>(null);
    const HTMLHelp = useRef<HTMLHeadingElement>(null);
    const chromeHTML = useRef<HTMLHeadingElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(()=>{
        if (wantGo){
            switch(wantGo){
                case 3:
                    scrollToSection(HTMLHelp);
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
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 ">
            <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 overflow-y-auto md:w-2/3 lg:w-1/2 max-h-[80vh]">
            {/* Title */}
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">끄코 낱장 단어 조합기 사용설명서</h3>

            {/* 목차 */}
            <ul className="mb-6 space-y-2">
                <li>
                <button
                className="text-blue-500 hover:underline"
                onClick={() => scrollToSection(nomalHelp)}
                >
                기본적인 사용법
                </button>
                </li>
                <li>
                <button
                    className="text-blue-500 hover:underline"
                    onClick={() => scrollToSection(HTMLHelp)}
                >
                    HTML 입력창 사용법
                </button>
                <ul className="mb-6 space-y-2 pl-4 list-disc">
                    <li>
                        <button
                        className="text-blue-500 hover:underline"
                        onClick={() => scrollToSection(HTMLHelp)}
                    >
                        구글 크롬(chrome)
                    </button>
                    </li>
                </ul>
                </li>
            </ul>

            {/* 본문 */}
            <div>
                <h3 ref={nomalHelp} className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                기본 이용법
                </h3>
                <div className="mb-4 flex flex-col items-center">
                <div className="relative rounded-lg shadow-md mb-4 w-full h-0 pb-[56.25%]">
                    <Image
                    src="/nomal-help.png"
                    alt="nomal-help"
                    fill // 이미지가 부모 요소를 채우도록 함
                    className="rounded-lg"
                    />
                </div>

                <p className="text-center text-orange-500">
                    주황색 부분: 사용자 입력창 (글자는 각각 입력해야함 ex. 가가가각간간)
                </p>
                <p className='text-center text-gray-900 dark:text-gray-100'>
                    글자를 입력하고 확인버튼을 누르거나 HTML입력에 HTML코드를 입력후 확인을 누릅니다.
                </p>
                <p className='text-center text-blue-500 underline cursor-pointer' onClick={() => scrollToSection(HTMLHelp)} > 
                    html입력 활용하면 쉽게 입력처리됨. (html입력창 이용법) 
                </p>
                <p className='text-center text-gray-900 dark:text-gray-100'>
                    파란색 부분: 단어 출력되는 부분. <br></br> 6길이 단어를 우선 탐색후 남은 글자로 5길이 단어를 탐색후 출력함. <br></br>
                    남은 글자는 알아서 사용자입력창에 업데이트 됨.
                </p>
                <p className='text-center text-yellow-600'>
                    i버튼: 도움말 모달창 (지금 보고 있는 이 창)
                </p>
                </div>

                <h3 ref={HTMLHelp} className='text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100'>
                html입력창 이용법
                </h3>

                <h4 ref={chromeHTML} className='text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100'>
                구글 크롬(chrome)
                </h4>
                <p className="mb-4 text-gray-900 dark:text-gray-100">
                사진이 많은 관계로 구글문서로 연결됩니다. → 
                <a href='https://docs.google.com/document/d/1wlX4TaC4Y_b-Dnjjy5uXc0GwWpFy7GGE2EWwAAeLcSE/edit?tab=t.0#heading=h.djjvvf8p8lrr' className='text-blue-500 underline cursor-pointer' target='_blank' rel="noopener noreferrer">
                    구글문서로 이동하기
                </a>
                </p>
            </div>
            
            <button
                onClick={onClose}
                className="mt-4 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-full sm:w-auto"
            >
                닫기
            </button>
            </div>
        </div>
    )
}

export default HelpModal;
"use client"
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { SixCharString, FiveCharString } from '../types/type';
import axios from 'axios';
import CombinationManager from '../lib/CombinationsManger';

const Spinner = () => {
    return (
        <div className="flex justify-center items-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
};

export default function WordCombinerClient() {
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [nomalJOKAK, setNomalJOKAK] = useState<string>("");
    const [highJOKAK, setHighJOKAK] = useState<string>("");
    const [rareJOKAK, setRareJOKAK] = useState<string>("");
    const [inputHtml, setInputHtml] = useState<string>("");
    const [placeholderArray] = useState<[string, string, string]>(["일반 글자조각 입력", "고급 글자조각 입력", "희귀 글자조각 입력"]);
    const [len6Data, setLen6Date] = useState<SixCharString[]>([]);
    const [len5Data, setLen5Data] = useState<FiveCharString[]>([]);
    const [len6WordsData, setLen6WordsData] = useState<SixCharString[]>([]);
    const [len5WordsData, setLen5WordsData] = useState<FiveCharString[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage,setErrorMessage] = useState<{}>();

    useEffect(() => {
        try {
            const rr = async () => {
                const r6 = await axios.get<string>("https://raw.githubusercontent.com/hafskjfha/Kkuko-word-combiner/main/len6_words_listA.txt", {
                    responseType: "text",
                });
                if (r6.data) {
                    setLen6WordsData(r6.data.split("\n").map(w => w.trim()).filter(w => w.length > 0));
                }
            }
            const rrr = async () => {
                const r5 = await axios.get<string>("https://raw.githubusercontent.com/hafskjfha/Kkuko-word-combiner/main/len5_words_list2.txt", {
                    responseType: "text",
                });
                if (r5.data) {
                    setLen5WordsData(r5.data.split("\n").map(w => w.trim()).filter(w => w.length > 0));
                }
            }
            rr();
            rrr();
        } catch (err) {
            console.error(err);
        }
    }, []);



    const handleHtmlSubmit = () => {
        const htmlString = inputHtml;
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');

        let nomal = ""; // 일반
        let high = ""; // 고급
        let rare = ""; // 희귀

        const dressItems = doc.querySelectorAll('div.dress-item.expl-mother');

        dressItems.forEach(item => {
            const countTextElement = item.querySelector('div.jt-image.dress-item-image');
            const charNameElement = item.querySelector('div.dress-item-title');

            if (!countTextElement || !charNameElement) {
                // 하나라도 null이면 해당 item 건너뛰기
                return;
            }

            const countText = countTextElement.textContent?.trim() ?? '';
            const tCount = parseInt(countText.replace('x', ''), 10) || 0;
            const charName = charNameElement.textContent?.trim() ?? '';

            if (charName.includes("고급 글자 조각")) {
                const chName = charName.replace("고급 글자 조각 - ", "");
                high += chName.repeat(tCount);
            } else if (charName.includes("희귀 글자 조각")) {
                const chName = charName.replace("희귀 글자 조각 - ", "");
                rare += chName.repeat(tCount);
            } else if (charName.includes("글자 조각")) {
                const chName = charName.replace("글자 조각 - ", "");
                nomal += chName.repeat(tCount);
            }
        });
        setInputHtml("");
        setNomalJOKAK(nomal);
        setHighJOKAK(high);
        setRareJOKAK(rare);
    };

    const processCombN = () => {
        setLoading(true);
        setTimeout(() => {
            const manger6 = new CombinationManager(nomalJOKAK.replace(/\s+/g, '').split('').sort().join(''), len6WordsData);
            setLen6Date(manger6.getBests());
            const manger5 = new CombinationManager(manger6.remainstr(), len5WordsData);
            setLen5Data(manger5.getBests());
            setLoading(false);
            setNomalJOKAK(manger5.remainstr());
        }, 1)
    }

    const processCombH = () => {
        setLoading(true);
        setTimeout(() => {
            const manger6 = new CombinationManager(highJOKAK.replace(/\s+/g, '').split('').sort().join(''), len6WordsData);
            setLen6Date(manger6.getBests());
            const manger5 = new CombinationManager(manger6.remainstr(), len5WordsData);
            setLen5Data(manger5.getBests());
            setLoading(false);
            setHighJOKAK(manger5.remainstr());
        }, 1)
    }

    const processCombR = () => {
        setLoading(true);
        setTimeout(() => {
            const manger6 = new CombinationManager(rareJOKAK.replace(/\s+/g, '').split('').sort().join(''), len6WordsData);
            setLen6Date(manger6.getBests());
            const manger5 = new CombinationManager(manger6.remainstr(), len5WordsData);
            setLen5Data(manger5.getBests());
            setLoading(false);
            setRareJOKAK(manger5.remainstr());
        }, 1)
    }

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
                            placeholder={placeholderArray[0]}
                            className="flex-1 p-2 border border-gray-300 rounded-md text-xs overflow-auto resize-none"
                            rows={4}
                            value={nomalJOKAK}
                            onChange={(e) => { setNomalJOKAK(e.target.value) }}
                            disabled={loading}
                        />
                        <button
                            className={`p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                            disabled={loading}
                            onClick={processCombN}
                        >
                            확인
                        </button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="w-16 text-gray-700 text-xs">(고급)<br></br>
                            글자조각:</label>
                        <textarea
                            placeholder={placeholderArray[1]}
                            className="flex-1 p-2 border border-gray-300 rounded-md text-xs overflow-auto resize-none"
                            rows={3}
                            value={highJOKAK}
                            onChange={(e) => { setHighJOKAK(e.target.value) }}
                            disabled={loading}
                        />
                        <button
                            className={`p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                            disabled={loading}
                            onClick={processCombH}
                        >
                            확인
                        </button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="w-16 text-gray-700 text-sm">(희귀)<br></br>
                            글자조각:</label>
                        <textarea
                            placeholder={placeholderArray[2]}
                            className="flex-1 p-2 border border-gray-300 rounded-md text-xs overflow-auto resize-none"
                            rows={2}
                            value={rareJOKAK}
                            onChange={(e) => { setRareJOKAK(e.target.value) }}
                            disabled={loading}
                        />
                        <button
                            className={`p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                            disabled={loading}
                            onClick={processCombR}
                        >
                            확인
                        </button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="w-16 text-gray-700 text-sm">html 입력:</label>
                        <textarea
                            placeholder="html 입력"
                            className="flex-1 p-2 border border-gray-300 rounded-md text-xs overflow-auto resize-none"
                            rows={2}
                            value={inputHtml}
                            onChange={(e) => { setInputHtml(e.target.value) }}
                            disabled={loading}
                        />
                        <button
                            className={`p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                            onClick={handleHtmlSubmit}
                            disabled={loading}
                        >
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
                        <div className="flex-1 bg-gray-200 rounded-b-md flex items-start justify-center overflow-hidden">
                            {/* 결과 컨테이너 */}
                            {len6Data.length > 0 && (
                                <div className="flex flex-col w-full h-full border border-gray-300 p-2 mt-2 overflow-auto break-words">
                                    {len6Data.map((item, index) => (
                                        <div key={index} className="flex items-start py-1 border-b border-gray-400">
                                            <div className="flex-none w-[20%] text-right mr-2 border-r border-gray-300 pr-2 text-sm">
                                                {index + 1}
                                            </div>
                                            <div className="flex-grow pl-2 text-sm ">
                                                {item}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col w-full md:w-1/2 h-64">
                        <div className="p-2 text-center text-gray-600 bg-gray-100 rounded-t-md text-sm">
                            만들어진 5글자 단어
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-b-md flex items-start justify-center overflow-hidden">
                            {/* 결과 컨테이너 */}
                            {len5Data.length > 0 && (
                                <div className="flex flex-col w-full h-full border border-gray-300 p-2 mt-2 overflow-auto break-words">
                                    {len5Data.map((item, index) => (
                                        <div key={index} className="flex items-start py-1 border-b border-gray-400">
                                            <div className="flex-none w-[20%] text-right mr-2 border-r border-gray-300 pr-2 text-sm">
                                                {index + 1}
                                            </div>
                                            <div className="flex-grow pl-2 text-sm ">
                                                {item}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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

            {/* 스피너 */}
            {loading && (
                <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-50">
                    <Spinner />
                </div>
            )}
        </div>
    );
}

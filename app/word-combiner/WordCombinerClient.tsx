"use client"
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import type { SixCharString, FiveCharString, ErrorMessage } from '../types/type';
import axios, { AxiosError } from "axios";
import CombinationManager from '../lib/CombinationsManger';
import ErrorModal from '../components/ErrModal';
import HelpModal from './WordCombinerHelpModal';

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
    const [errorModalView, seterrorModalView] = useState<ErrorMessage | null>(null);
    const [HtmlHelpModalView, setHtmlHelpModalView] = useState<boolean>(false);

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
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const axiosError = err as AxiosError;
                seterrorModalView({
                    ErrName: axiosError.name,
                    ErrMessage: axiosError.message,
                    ErrStackRace: axiosError.stack || null,
                    inputValue: null,
                    HTTPStatus: axiosError.response?.status,
                    HTTPData: `${axiosError.response?.data}`
                });

            } else if (err instanceof Error) {
                seterrorModalView({
                    ErrName: err.name,
                    ErrMessage: err.message,
                    ErrStackRace: err.stack,
                    inputValue: null
                });

            } else {
                seterrorModalView({
                    ErrName: null,
                    ErrMessage: null,
                    ErrStackRace: err as string,
                    inputValue: null
                });
            }
        }
    }, []);



    const handleHtmlSubmit = () => {

        try {
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
        } catch (err: unknown) {
            if (err instanceof Error) {
                seterrorModalView({
                    ErrName: err.name,
                    ErrMessage: err.message,
                    ErrStackRace: err.stack,
                    inputValue: null
                });

            } else {
                seterrorModalView({
                    ErrName: null,
                    ErrMessage: null,
                    ErrStackRace: err as string,
                    inputValue: null
                });
            }
        }
    };

    const processCombN = () => {
        try {
            setLoading(true);
            setTimeout(() => {
                const manger6 = new CombinationManager(nomalJOKAK.replace(/\s+/g, '').split('').sort().join(''), len6WordsData);
                setLen6Date(manger6.getBests());
                const manger5 = new CombinationManager(manger6.remainstr(), len5WordsData);
                setLen5Data(manger5.getBests());
                setLoading(false);
                setNomalJOKAK(manger5.remainstr());
            }, 1)
        } catch (err: unknown) {
            if (err instanceof Error) {
                seterrorModalView({
                    ErrName: err.name,
                    ErrMessage: err.message,
                    ErrStackRace: err.stack,
                    inputValue: null
                });

            } else {
                seterrorModalView({
                    ErrName: null,
                    ErrMessage: null,
                    ErrStackRace: err as string,
                    inputValue: null
                });
            }
        } finally {
            setLoading(false);
        }
    }

    const processCombH = () => {

        try {
            setLoading(true);
            setTimeout(() => {
                const manger6 = new CombinationManager(highJOKAK.replace(/\s+/g, '').split('').sort().join(''), len6WordsData);
                setLen6Date(manger6.getBests());
                const manger5 = new CombinationManager(manger6.remainstr(), len5WordsData);
                setLen5Data(manger5.getBests());
                setLoading(false);
                setHighJOKAK(manger5.remainstr());
            }, 1)
        } catch (err: unknown) {
            if (err instanceof Error) {
                seterrorModalView({
                    ErrName: err.name,
                    ErrMessage: err.message,
                    ErrStackRace: err.stack,
                    inputValue: null
                });

            } else {
                seterrorModalView({
                    ErrName: null,
                    ErrMessage: null,
                    ErrStackRace: err as string,
                    inputValue: null
                });
            }
        } finally {
            setLoading(false);
        }
    }

    const processCombR = () => {
        try {
            setLoading(true);
            setTimeout(() => {
                const manger6 = new CombinationManager(rareJOKAK.replace(/\s+/g, '').split('').sort().join(''), len6WordsData);
                setLen6Date(manger6.getBests());
                const manger5 = new CombinationManager(manger6.remainstr(), len5WordsData);
                setLen5Data(manger5.getBests());
                setLoading(false);
                setRareJOKAK(manger5.remainstr());
            }, 1)
        } catch (err: unknown) {
            if (err instanceof Error) {
                seterrorModalView({
                    ErrName: err.name,
                    ErrMessage: err.message,
                    ErrStackRace: err.stack,
                    inputValue: null
                });

            } else {
                seterrorModalView({
                    ErrName: null,
                    ErrMessage: null,
                    ErrStackRace: err as string,
                    inputValue: null
                });
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col flex-grow min-h-screen">
            {/* 도움말 버튼 */}
            <div className="p-4 flex justify-end bg-gray-50 border-b">
                <button
                    onClick={() => setShowHelpModal(true)}
                    className="flex items-center space-x-2 text-blue-500 hover:underline"
                >
                    <Image
                        src="/info-logo.svg"
                        alt="도움말"
                        width={28}
                        height={28}
                        className="inline-block"
                    />
                </button>
            </div>

            {/* 메인 컨테이너 */}
            <div className="flex flex-col md:flex-row flex-grow p-4 md:p-6 lg:p-8">
                {/* 왼쪽 컨테이너 */}
                <div className="w-full md:w-1/2 bg-gray-100 p-4 flex flex-col space-y-6">
                    {[
                        { label: "(일반) 글자조각:", rows: 4, value: nomalJOKAK, onChange: setNomalJOKAK, onClick: processCombN, placeholder: placeholderArray[0] },
                        { label: "(고급) 글자조각:", rows: 3, value: highJOKAK, onChange: setHighJOKAK, onClick: processCombH, placeholder: placeholderArray[1] },
                        { label: "(희귀) 글자조각:", rows: 2, value: rareJOKAK, onChange: setRareJOKAK, onClick: processCombR, placeholder: placeholderArray[2] },
                    ].map((item, idx) => (
                        <div className="flex items-center space-x-4" key={idx}>
                            <label className="w-20 text-gray-700 text-sm">{item.label}</label>
                            <textarea
                                placeholder={item.placeholder}
                                className="flex-1 p-3 border border-gray-300 rounded-md text-sm overflow-auto resize-none"
                                rows={item.rows}
                                value={item.value}
                                onChange={(e) => item.onChange(e.target.value)}
                                disabled={loading}
                            />
                            <button
                                className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${loading ? "bg-gray-500 cursor-not-allowed" : ""
                                    }`}
                                onClick={item.onClick}
                                disabled={loading}
                            >
                                확인
                            </button>
                        </div>
                    ))}
                    <div className="flex items-center space-x-4">
                        v
                        <label className="w-20 text-gray-700 text-sm">html 입력:</label>
                        <textarea
                            placeholder="html 입력"
                            className="flex-1 p-3 border border-gray-300 rounded-md text-sm overflow-auto resize-none"
                            rows={3}
                            value={inputHtml}
                            onChange={(e) => setInputHtml(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${loading ? "bg-gray-500 cursor-not-allowed" : ""
                                }`}
                            onClick={handleHtmlSubmit}
                            disabled={loading}
                        >
                            확인
                        </button>
                    </div>
                </div>

                {/* 오른쪽 컨테이너 */}
                <div className="w-full md:w-1/2 bg-white p-4 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
                    {[{ title: "만들어진 6글자 단어", data: len6Data }, { title: "만들어진 5글자 단어", data: len5Data }].map((section, idx) => (
                        <div className="flex flex-col w-full md:w-1/2 h-[calc(100vh-200px)]" key={idx}>
                            <div className="p-3 text-center text-gray-600 bg-gray-100 rounded-t-md text-sm">
                                {section.title}
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-b-md overflow-y-auto">
                                {section.data.length > 0 ? (
                                    <div className="flex flex-col w-full border border-gray-300 p-3 overflow-auto break-words">
                                        {section.data.map((item, index) => (
                                            <div key={index} className="flex items-start py-2 border-b border-gray-400">
                                                <div className="flex-none w-[15%] text-right mr-2 border-r border-gray-300 pr-2 text-sm">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-grow pl-2 text-sm">{item}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-gray-500 text-center p-4">결과가 없습니다.</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 도움말 모달창 */}
            {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
            {HtmlHelpModalView && <HelpModal onClose={() => setHtmlHelpModalView(false)} wantGo={3} />}

            {/* 로딩 스피너 */}
            {loading && (
                <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-50">
                    <Spinner />
                </div>
            )}

            {/* 오류 모달 */}
            {errorModalView && <ErrorModal error={errorModalView} onClose={() => seterrorModalView(null)} />}
        </div>

    );
}

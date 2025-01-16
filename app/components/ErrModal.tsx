import React, { useState } from "react";
import { ErrorMessage } from "../types/type";

type ErrorModalProps = {
    error: ErrorMessage;
    onClose: () => void;
};

const ErrorModal: React.FC<ErrorModalProps> = ({ error, onClose }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copyStatus, setCopyStatus] = useState<string | null>(null);

    const handleCopy = () => {
        const errorText = `
Error Name: ${error.ErrName}
Error Message: ${error.ErrMessage}
Stack Trace: ${error.ErrStackRace}
User Input: ${error.inputValue}
HTTP Status: ${error.HTTPStatus}
HTTP Data: ${error.HTTPData}
        `;
        navigator.clipboard.writeText(errorText)
            .then(() => {
                setCopyStatus("복사되었습니다. 꼭 개발자에게 알려주세요!");
                setTimeout(() => setCopyStatus(null), 1500);
            })
            .catch(() => {
                setCopyStatus("복사를 실패하였습니다.");
                setTimeout(() => setCopyStatus(null), 1500);
            });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                <h2 className="text-lg md:text-xl font-bold text-red-600">
                    오류가 발생했습니다.
                </h2>
                <p className="mt-2 text-sm md:text-base">
                    <strong>오류명:</strong> {error.ErrName || "알 수 없음"}
                </p>
                <p className="text-sm md:text-base">
                    <strong>오류 메시지:</strong> {error.ErrMessage || "오류 메시지가 없습니다"}
                </p>
                <div className="mt-4">
                    <button
                        className={`px-4 py-2 text-sm font-medium rounded ${
                            isExpanded
                                ? "bg-gray-300 hover:bg-gray-400"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                        onClick={() => setIsExpanded((prev) => !prev)}
                    >
                        {isExpanded ? "정보 숨기기" : "정보 보기"}
                    </button>
                </div>
                {isExpanded && (
                    <div className="mt-4 bg-gray-100 p-4 rounded-lg overflow-auto max-h-40">
                        <p className="text-sm md:text-base">
                            <strong>사용자 입력:</strong> {error.inputValue || "NULL"}
                        </p>
                        <p className="text-sm md:text-base">
                            <strong>스택 레이스:</strong> 
                        </p>
                        <pre className="text-xs whitespace-pre-wrap">{error.ErrStackRace || "NULL"}</pre>
                        {error.HTTPStatus && (
                                <p className="text-sm md:text-base">
                                    <strong>HTTP 코드:</strong> {error.HTTPStatus || "unknow"}
                                </p>
                            )
                        }
                        {error.HTTPData && (
                                <p className="text-sm md:text-base">
                                    <strong>반환 데이터:</strong> {error.HTTPData || "NULL"}
                                </p>
                            )
                        }
                    </div>
                )}
                <div className="mt-6 flex justify-end space-x-2">
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-gray-400"
                        onClick={onClose}
                    >
                        닫기
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={handleCopy}
                    >
                        오류 메시지 복사
                    </button>
                </div>
                {copyStatus && (
                    <p className="mt-4 text-center text-sm md:text-base text-green-600 bg-gray-100 p-2 rounded">
                        {copyStatus}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ErrorModal;

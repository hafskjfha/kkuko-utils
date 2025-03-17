"use client";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    word: string;
    status: "addRequest" | "deleteRequest" | "word";
    isAdmin: boolean;
    isRequester: boolean;
    onAccept?: () => void;
    onReject?: () => void;
    onCancelRequest?: () => void;
    onDelete?: () => void;
    onRequestDelete?: () => void;
};


const WorkModal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    word,
    status,
    isAdmin,
    isRequester,
    onAccept,
    onReject,
    onCancelRequest,
    onDelete,
    onRequestDelete,
  }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        {/* Modal Content */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
          {/* Header */}
          <h2 className="text-xl font-bold text-center">{word}</h2>
  
          {/* Block Section */}
          <div className="space-y-2">
            {/* 공통 상태 표시 블록 */}
            <div className="flex items-center justify-between bg-gray-100 p-3 rounded-md">
              <span className="text-gray-700">
                {status === "addRequest" && "이 단어는 추가 요청 상태입니다."}
                {status === "deleteRequest" && "이 단어는 삭제 요청 상태입니다."}
                {status === "word" && "등록된 단어입니다."}
              </span>
            </div>
  
            {/* 추가 요청 상태 */}
            {status === "addRequest" && (
              <>
                {isAdmin && (
                  <>
                    {/* 추가 요청 수락 블록 */}
                    <div className="flex items-center justify-between bg-green-50 p-3 rounded-md">
                      <span className="text-green-700">추가 요청을 수락합니다.</span>
                      <button
                        className="bg-green-500 text-white px-4 py-1 rounded-md hover:bg-green-600"
                        onClick={onAccept}
                      >
                        수락
                      </button>
                    </div>
  
                    {/* 추가 요청 거절 블록 */}
                    <div className="flex items-center justify-between bg-red-50 p-3 rounded-md">
                      <span className="text-red-700">추가 요청을 거절합니다.</span>
                      <button
                        className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600"
                        onClick={onReject}
                      >
                        거절
                      </button>
                    </div>
                  </>
                )}
                {isRequester && (
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <span className="text-gray-700">추가 요청을 취소합니다.</span>
                    <button
                      className="bg-gray-500 text-white px-4 py-1 rounded-md hover:bg-gray-600"
                      onClick={onCancelRequest}
                    >
                      요청 취소
                    </button>
                  </div>
                )}
              </>
            )}
  
            {/* 삭제 요청 상태 */}
            {status === "deleteRequest" && (
              <>
                {isAdmin && (
                  <>
                    {/* 삭제 요청 수락 블록 */}
                    <div className="flex items-center justify-between bg-green-50 p-3 rounded-md">
                      <span className="text-green-700">삭제 요청을 수락합니다.</span>
                      <button
                        className="bg-green-500 text-white px-4 py-1 rounded-md hover:bg-green-600"
                        onClick={onAccept}
                      >
                        수락
                      </button>
                    </div>
  
                    {/* 삭제 요청 거절 블록 */}
                    <div className="flex items-center justify-between bg-red-50 p-3 rounded-md">
                      <span className="text-red-700">삭제 요청을 거절합니다.</span>
                      <button
                        className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600"
                        onClick={onReject}
                      >
                        거절
                      </button>
                    </div>
                  </>
                )}
                {isRequester && (
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <span className="text-gray-700">삭제 요청을 취소합니다.</span>
                    <button
                      className="bg-gray-500 text-white px-4 py-1 rounded-md hover:bg-gray-600"
                      onClick={onCancelRequest}
                    >
                      요청 취소
                    </button>
                  </div>
                )}
              </>
            )}
  
            {/* 등록된 단어 관리 블록 */}
            {status === "word" && (
              <>
                {isAdmin && (
                  <div className="flex items-center justify-between bg-red-50 p-3 rounded-md">
                    <span className="text-red-700">단어를 삭제합니다.</span>
                    <button
                      className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600"
                      onClick={onDelete}
                    >
                      삭제
                    </button>
                  </div>
                )}
  
                {/* 일반 유저와 관리자 모두 삭제 요청 가능 */}
                <div className="flex items-center justify-between bg-yellow-50 p-3 rounded-md">
                  <span className="text-yellow-700">삭제 요청을 보냅니다.</span>
                  <button
                    className="bg-yellow-500 text-white px-4 py-1 rounded-md hover:bg-yellow-600"
                    onClick={onRequestDelete}
                  >
                    삭제 요청
                  </button>
                </div>
              </>
            )}
          </div>
  
          {/* Close Button */}
          <div className="mt-4">
            <button
              className="w-full bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
              onClick={onClose}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
};

export default WorkModal;
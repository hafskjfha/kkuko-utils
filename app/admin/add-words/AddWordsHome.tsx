import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/app/components/ui/alert-dialog";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { FileJson, CheckCircle, AlertCircle } from "lucide-react";

// JSON 데이터의 인터페이스
interface JsonData {
  k_canuse: boolean;
  noin_canuse: boolean;
  themes: string[];
}

export default function WordsAddHome() {
  // 상태 관리
  const [jsonData, setJsonData] = useState<JsonData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileUploaded, setFileUploaded] = useState(false);

  // 파일 업로드 처리
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content) as JsonData;
        setJsonData(parsedData);
        setFileUploaded(true);
        setError(null);
      } catch (err) {
        setError("JSON 파일 파싱 중 오류가 발생했습니다.");
        setFileUploaded(false);
      }
    };
    reader.readAsText(file);
  };

  // 처리 버튼 클릭 핸들러
  const handleProcess = () => {
    if (!jsonData) {
      setError("처리할 JSON 데이터가 없습니다.");
      return;
    }

    setIsProcessing(true);
    setIsModalOpen(true);
    setProgress(0);
    setCurrentTask("데이터 초기화 중...");

    // 처리 로직 시뮬레이션 (실제로는 여기서 처리 로직을 구현하세요)
    simulateProcessing();
  };

  // 처리 과정 시뮬레이션 (데모용)
  const simulateProcessing = () => {
    const tasks = [
      "데이터 초기화 중...",
      "k_canuse 처리 중...",
      "noin_canuse 처리 중...",
      "테마 분석 중...",
      "결과 생성 중...",
    ];

    let taskIndex = 0;
    let currentProgress = 0;

    const interval = setInterval(() => {
      if (taskIndex < tasks.length) {
        setCurrentTask(tasks[taskIndex]);
        taskIndex++;
        currentProgress += 20;
        setProgress(currentProgress);
      } else {
        clearInterval(interval);
        setIsProcessing(false);
        // 실제 처리가 완료된 후에는 모달을 닫지 않고 사용자가 확인할 수 있도록 함
        // 사용자가 모달 외부를 클릭하거나 완료 버튼을 누르면 모달이 닫힘
      }
    }, 1000);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8">JSON 파일 처리</h1>

        {/* 파일 업로드 영역 */}
        <div className="mb-8">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileJson className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">클릭하여 파일 업로드</span>{" "}
                  또는 드래그 앤 드롭
                </p>
                <p className="text-xs text-gray-500">JSON 파일만 가능합니다</p>
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        {/* 파일 내용 표시 */}
        {fileUploaded && jsonData && (
          <div className="mb-8 p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">업로드된 JSON 데이터</h2>
            <div className="overflow-auto max-h-60">
              <pre className="text-sm">{JSON.stringify(jsonData, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-md border border-red-100 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* 처리 버튼 */}
        <div className="flex justify-center">
          <Button
            onClick={handleProcess}
            disabled={!fileUploaded || isProcessing}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
          >
            {isProcessing ? "처리 중..." : "처리 시작"}
          </Button>
        </div>
      </div>

      {/* 처리 모달 */}
      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isProcessing ? "처리 중..." : "처리 완료"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <div className="flex items-center">
                  <p className="text-sm font-medium">{currentTask}</p>
                </div>

                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-right">{progress}% 완료</p>
                </div>

                {!isProcessing && (
                  <div className="mt-4 flex justify-center">
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span>처리가 완료되었습니다!</span>
                    </div>
                  </div>
                )}

                {!isProcessing && (
                  <div className="mt-4 flex justify-end">
                    <Button onClick={closeModal}>확인</Button>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

"use client";
import type { LoadingState } from "@/app/types/type";
import Spinner from "@/app/components/Spinner";
import ProgressBar from "@/app/components/ProgressBar";
import { useState } from "react";

export const useLoadingState = () => {
    const [loadingState, setLoadingState] = useState<LoadingState>({
        isLoading: true,
        progress: 0,
        currentTask: "초기화 중..."
    });

    const updateLoadingState = (progress: number, task: string) => {
        setLoadingState({
            isLoading: progress < 100,
            progress,
            currentTask: task
        });
    };

    return { loadingState, updateLoadingState };
};

export default function LoadingPage({ title }: { title: string }){
    const { loadingState } = useLoadingState();

    if (loadingState.isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow min-h-screen min-w-full">
                <h2 className="text-xl font-bold mb-4">{title} 로딩 중</h2>
                <div className="w-full max-w-md mb-4">
                    <ProgressBar
                        completed={loadingState.progress}
                        label={`${loadingState.progress}% 완료`}
                    />
                </div>
                <p className="text-gray-600 mt-2">{loadingState.currentTask}</p>
                <div className="mt-4">
                    <Spinner />
                </div>
            </div>
        );
    }

    return null;
};

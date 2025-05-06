"use client";
import Spinner from "@/app/components/Spinner";
import ProgressBar from "@/app/components/ProgressBar";
import { useDispatch, useSelector } from 'react-redux';
import { updateLoadingState } from '@/app/store/slice';
import type { RootState } from '@/app/store/store';

export const useLoadingState = () => {
    const dispatch = useDispatch();
    const loadingState = useSelector((state: RootState) => state.loading);
  
    const updateState = (progress: number, task: string) => {
      dispatch(updateLoadingState({ progress, task }));
    };
  
    return {
      loadingState,
      updateLoadingState: updateState,
    };
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

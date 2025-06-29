"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { useRouter } from "next/navigation";

interface WordAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    id: number;
}

const WordAddModal = ({ isOpen, onClose, id }: WordAddModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-2xl h-auto p-6 flex flex-col">
                <DialogHeader>
                    <DialogTitle>단어 추가</DialogTitle>
                </DialogHeader>
                <div>
                    <AddWordForm docsID={id} />
                </div>
            </DialogContent>
        </Dialog>
    )
}

const AddWordForm = ({ docsID }: { docsID: number }) => {
    const router = useRouter();
    const onMoveToAddPage = () => {
        router.push('/word/add?docsID=' + docsID);
    };

    // 동적 ui모달창 만들기 귀찮아서 그냥 단어 추가 페이지로 이동시키기
    return (
        <div className="space-y-3 overflow-y-auto w-full max-w-[600px] mx-auto p-4 text-center">
            <div className="text-lg font-semibold">단어 추가는 별도 페이지에서 진행됩니다.</div>
            <div className="text-sm text-muted-foreground">페이지로 이동해서 단어를 입력해주세요.</div>
            <Button onClick={onMoveToAddPage} className="w-full">
                단어 추가 페이지로 이동
            </Button>
        </div>
    )
}

export default WordAddModal;
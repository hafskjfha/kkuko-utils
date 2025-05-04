"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { XCircle } from "lucide-react";

interface ErrorModalProps {
    open: boolean;
    title?: string;
    description: string;
    onClose: () => void;
}

export default function FailModal({ open, title = "작업을 완료할 수 없습니다", description, onClose }: ErrorModalProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm text-center">
                <DialogHeader className="flex flex-col items-center justify-center gap-2">
                    <XCircle className="text-red-500" size={48} />
                    <DialogTitle className="text-lg">{title}</DialogTitle>
                </DialogHeader>
                <div className="py-2 text-sm text-gray-600">{description}</div>
                <Button className="mt-4" onClick={onClose}>
                    확인
                </Button>
            </DialogContent>
        </Dialog>
    );
}
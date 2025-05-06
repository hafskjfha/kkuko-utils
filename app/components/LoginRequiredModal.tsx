"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { useRouter } from "next/navigation";

interface LoginRequiredModalProps {
    open: boolean;
    onClose: () => void;
}

export default function LoginRequiredModal({ open, onClose }: LoginRequiredModalProps) {
    const router = useRouter();

    const handleLogin = () => {
        onClose();
        router.push("/auth");
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>로그인이 필요합니다</DialogTitle>
                </DialogHeader>
                <div className="py-2 text-sm text-gray-600">
                    이 서비스를 이용하시려면 로그인이 필요합니다.
                </div>
                <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={onClose}>
                        닫기
                    </Button>
                    <Button onClick={handleLogin}>
                        로그인하기
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

"use client";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

type CompleteModalProps = {
    open: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
};

export default function CompleteModal({
    open,
    onClose,
    title = "작업이 완료되었습니다!",
    description = "정상적으로 처리되었습니다.",
}: CompleteModalProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center text-center gap-4"
                >
                    <CheckCircle className="w-12 h-12 text-green-500" />

                    {/* ✅ 접근성 향상: DialogTitle, DialogDescription */}
                    <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {description}
                    </DialogDescription>

                    <Button className="mt-4 px-6" onClick={onClose}>
                        확인
                    </Button>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}

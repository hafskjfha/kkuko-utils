import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/app/components/ui/dialog';

interface HelpModalProps {
    title: string;
    children: React.ReactNode;
    triggerClassName?: string;
    triggerText?: string;
    showIcon?: boolean;
}

const HelpModal = ({
    title,
    children,
    triggerClassName = "",
    triggerText,
    showIcon = true,
}: HelpModalProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button
                    className={`inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors ${triggerClassName}`}
                    aria-label="도움말 열기"
                >
                    {showIcon && <HelpCircle className="w-4 h-4" />}
                    {triggerText && <span className="text-sm">{triggerText}</span>}
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-md w-full max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                        <HelpCircle className="w-5 h-5 text-blue-600" />
                        {title}
                    </DialogTitle>
                </DialogHeader>
                <div className="mt-4 text-sm text-gray-700 leading-relaxed">
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default HelpModal;
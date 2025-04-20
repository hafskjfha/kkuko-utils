'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"

type ConfirmModalProps = {
    title?: string
    description?: string
    open: boolean
    onConfirm: () => void
    onClose: () => void
}

export default function ConfirmModal({
    title = "정말로 진행하시겠습니까?",
    description = "",
    open,
    onConfirm,
    onClose
}: ConfirmModalProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </DialogHeader>

                <DialogFooter className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={onClose}>
                        취소
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={onConfirm}>
                        확인
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

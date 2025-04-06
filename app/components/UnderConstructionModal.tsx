'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

export default function UnderConstructionModal({open, onColse}:{open: boolean, onColse: () => void}) {
    if (!open) return null
    return (
        <Dialog.Root defaultOpen>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
                <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <Dialog.Title className="text-xl font-semibold">알림</Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="text-gray-500 hover:text-gray-700 transition">
                                <X className="w-5 h-5" onClick={onColse} />
                            </button>
                        </Dialog.Close>
                    </div>
                    <div className="text-gray-700 text-center text-lg">
                        해당 기능은 아직 <span className="font-bold">제작 중</span>입니다.
                        <br />
                        조금만 기다려 주세요! 🙏
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

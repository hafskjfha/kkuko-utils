"use client";

import { ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { HelpCircle } from "lucide-react";

interface HelpModalProps {
  /**
   * 모달의 제목
   * @default "도움말"
   */
  title?: string;
  
  /**
   * 모달의 내용 (ReactNode)
   */
  contents: ReactNode;
  
  /**
   * 트리거 버튼 스타일 커스터마이징
   * @default undefined
   */
  triggerClassName?: string;
  
  /**
   * 모달 컨텐츠 스타일 커스터마이징
   * @default undefined
   */
  contentClassName?: string;
  
  /**
   * 커스텀 트리거 요소 제공
   * @default undefined
   */
  customTrigger?: ReactNode;
}

export default function HelpModal({
  title = "도움말",
  contents,
  triggerClassName = "",
  contentClassName = "",
  customTrigger,
}: HelpModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {customTrigger ? (
          customTrigger
        ) : (
          <Button 
            variant="ghost" 
            size="icon"
            className={`rounded-full hover:bg-slate-100 ${triggerClassName}`}
            aria-label="도움말 보기"
          >
            <HelpCircle className="h-5 w-5 text-slate-500" />
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className={`sm:max-w-md ${contentClassName}`}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {contents}
        </div>
        
        <div className="flex justify-end">
          <DialogClose asChild>
            <Button variant="outline">닫기</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
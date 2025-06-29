"use client";
import WordAddForm  from '@/app/word/add/WordAddFrom';
import { useRouter } from "next/navigation";

export default function WordAddWrapper({docsID}:{docsID:number}) {
    const router = useRouter();
    const onSaveWrapper = () => {
        return ()=>{router.push(`/words-docs/${docsID}`)};
    }

    return (
        <WordAddForm compleSave={onSaveWrapper} />
    )
}

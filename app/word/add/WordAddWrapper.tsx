"use client";
import { supabase } from "@/app/lib/supabaseClient";
import WordAddForm  from '@/app/word/add/WordAddFrom';
import { useRouter } from "next/navigation";

export default function WordAddWrapper({docsID}:{docsID:number}) {
    const router = useRouter();
    const onSaveWrapper = async (wordID:number, setErrorModalView:(value: React.SetStateAction<ErrorMessage | null>) => void) => {
        const {error: insertWordintoDocs} = await supabase.from('docs_wait_words').insert({
            wait_word_id: wordID,
            docs_id: docsID
        })
        
        if (insertWordintoDocs) {
            setErrorModalView({
                ErrName: insertWordintoDocs.name,
                ErrMessage: insertWordintoDocs.message,
                ErrStackRace: insertWordintoDocs.stack,
                inputValue: `wordID: ${wordID}, docsID: ${docsID}`
            });
            return;
        }

        return ()=>{router.push(`/words-docs/${docsID}`)};
        
    }

    return (
        <WordAddForm compleSave={onSaveWrapper} />
    )
}

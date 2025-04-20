"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import WordAddForm from "./WordAddForm";
import { supabase } from "@/app/lib/supabaseClient";
import Spinner from "@/app/components/Spinner";
import { PostgrestError } from "@supabase/supabase-js";
import CompleteModal from "@/app/components/CompleteModal";
import ConfirmModal from "@/app/components/ConfirmModal";
import { useSelector } from 'react-redux';
import { RootState } from "@/app/store/store";


interface WordAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    alreadyAddedWords: Set<string>
    id: number
}


const WordAddModal = ({ isOpen, onClose, alreadyAddedWords, id }: WordAddModalProps) => {
    const [query, setQuery] = useState("");
    const [showAddWord, setShowAddWord] = useState(false);
    const [searchResults, setSearchResults] = useState<{word:string, id:number}[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [WorkWord, setWorkWord] = useState<{word:string, id:number} | null>(null);
    const user = useSelector((state: RootState) => state.user);

    const handleSearchA = async (querys: string) => {
        if (querys.trim() === "") {
            setSearchResults(null);
            return [];
        }
        if (querys.length < 5) {
            const { data: words, error: err} = await supabase.from('words').select('word,id').eq('word', querys);
            if (err) {
                throw err;
            }
            return words;
        }
        else{
            const { data: words, error: err} = await supabase.from('words').select('word,id').ilike('word', `%${querys}%`);
            if (err) {
                throw err;
            }
            return words;
        }
        
    }

    const handleSearchB = async (querys: string) => {
        if (querys.trim() === "") {
            setSearchResults(null);
            return [];
        }
        if (querys.length < 5) {
            const { data: words, error: err} = await supabase.from('wait_words').select('word,id,request_type').eq('word', querys);
            if (err) {
                throw err;
            }
            return words.filter((word)=>word.request_type === "add");
        }
        else{
            const { data: words, error: err} = await supabase.from('wait_words').select('word,id,request_type').ilike('word', `%${querys}%`);
            if (err) {
                throw err;
            }
            return words.filter((word)=>word.request_type === "add");
        }
    }

    const handleSearch = async () => {
        if (query.trim() === "") {
            setSearchResults(null);
            return;
        }
        try {
            setIsLoading(true);
            const [A,B] = await Promise.all([handleSearchA(query), handleSearchB(query)]);
            setSearchResults([...A.map(({word, id})=>({word, id})), ...B.map(({word, id})=>({word, id}))]);
            setIsLoading(false);
        }
        catch (error) {
            console.error("Error searching words:", error);
            setErrorMessage(error instanceof Error || error instanceof PostgrestError ? error.message : "알수 없는 오류")
            setSearchResults(null);
            setIsLoading(false);
        }
    };

    const handleAddRequest = async () => {
        if (WorkWord === null) return;
        try {
            setIsLoading(true);
            const { error } = await supabase.from('docs_words_wait').insert({
                word_id: WorkWord.id,
                docs_id: id,
                typez: "add",
                requested_by: user.uuid
            });
            if (error) throw error;
            alreadyAddedWords.add(WorkWord.word);
            setShowCompleteModal(true);
            setShowConfirmModal(false);
            setIsLoading(false);
            setWorkWord(null);
        } catch (error) {
            console.error("Error adding word:", error);
            setErrorMessage(error instanceof Error || error instanceof PostgrestError ? error.message : "알수 없는 오류")
            setIsLoading(false);
        }
    }

    const handleAddClick = (word: {word:string, id:number}) => {
        setWorkWord(word);
        setShowConfirmModal(true);
    }

    useEffect(() => {
        if (query.trim() === "") {
            setSearchResults(null);
            setErrorMessage(null);
        }
    }, [query]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-2xl h-auto p-6 flex flex-col">
                <DialogHeader>
                    <DialogTitle>{!showAddWord ? "문서에" : ""} 단어 추가</DialogTitle>
                </DialogHeader>

                { showConfirmModal && (
                    <ConfirmModal
                        title={`문서에 추가 요청`}
                        description={`"${WorkWord?.word}" 단어를 문서에 추가 요청하시겠습니까?`}
                        onConfirm={() => {
                            handleAddRequest();
                        }}
                        onClose={() => setShowConfirmModal(false)}
                        open={showConfirmModal}
                    />
                )}

                { showCompleteModal && (
                    <CompleteModal
                        title="단어 추가 요청 완료"
                        description="단어 추가 요청이 완료되었습니다."
                        onClose={() => setShowCompleteModal(false)}
                        open={showCompleteModal}
                    />
                )}
                {!showAddWord ? (
                    <div className="flex flex-col gap-3 flex-grow">
                        {/* 검색 입력 필드 */}
                        <div className="flex gap-2 p-2">
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="단어 검색..."
                                className="w-full"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSearch();
                                }}
                            />
                            <Button onClick={handleSearch}>검색</Button>
                        </div>

                        {/* 리스트 크기 제한 (너무 길어지지 않도록 조정) */}
                        <div className="flex-grow overflow-hidden border rounded p-2">
                            <div className="max-h-[45vh] overflow-y-auto">
                                {isLoading && (
                                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 rounded-lg">
                                        <Spinner />
                                    </div>)}
                                {searchResults === null ? (
                                    <p className="text-gray-500 text-center">{!isLoading ? "검색어를 입력하세요." : ""}</p>
                                ) : searchResults.length > 0 ? (
                                    <ul className="space-y-2">
                                        {searchResults.map(({word,id}) => (
                                            <li key={word} className="flex justify-between items-center p-2 border-b">
                                                {word}
                                                {!alreadyAddedWords.has(word) ? (
                                                    <Button size="sm" onClick={()=>handleAddClick({word, id})} >문서에 추가요청</Button>
                                                ) : (
                                                    <span className="text-gray-500">등록된 단어</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 text-center">{errorMessage ? errorMessage : "검색결과가 존재하지 않습니다."}</p>
                                )}
                            </div>
                        </div>

                        {/* 이 부분이 리스트 아래로 밀리도록 조정됨 */}
                        <Button className="w-full mt-3" onClick={() => setShowAddWord(true)}>
                            단어 추가요청 및 문서에 추가요청
                        </Button>
                    </div>
                ) : (
                    <div>
                        <AddWordForm onClose={() => setShowAddWord(false)} />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}


const AddWordForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="space-y-3 overflow-y-auto max-w-full">
            <WordAddForm onSave={(word:string, selectedTopics:string[])=>{console.log(word,selectedTopics)}} />
            <Button onClick={onClose}>뒤로가기</Button>
        </div>
    )
}

export default WordAddModal;
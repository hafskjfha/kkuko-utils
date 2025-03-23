"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

const words = ["사과", "바나나", "포도", '사자', '사소', '사고', '사슴', '사랑', '사신', '사수']; // test data

interface WordAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    alreadyAddedWords: Set<string>
}


const WordAddModal: React.FC<WordAddModalProps> = ({ isOpen, onClose, alreadyAddedWords }) => {
    const [query, setQuery] = useState("");
    const [showAddWord, setShowAddWord] = useState(false);
    const [searchResults, setSearchResults] = useState<string[] | null>(null);

    const handleSearch = () => {
        // 추가예정 (백엔드 로직)
        if (query.trim() === "") {
            setSearchResults(null);
            return;
        }
        const filteredWords = words.filter(word => word.includes(query));
        setSearchResults(filteredWords);
    };

    useEffect(() => {
        if (query.trim() === "") {
            setSearchResults(null);
        }
    }, [query]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-2xl h-auto p-6 flex flex-col">
                <DialogHeader>
                    <DialogTitle>{!showAddWord ? "문서에" : ""} 단어 추가</DialogTitle>
                </DialogHeader>

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
                                {searchResults === null ? (
                                    <p className="text-gray-500 text-center">검색어를 입력하세요.</p>
                                ) : searchResults.length > 0 ? (
                                    <ul className="space-y-2">
                                        {searchResults.map((word) => (
                                            <li key={word} className="flex justify-between items-center p-2 border-b">
                                                {word}
                                                {!alreadyAddedWords.has(word) ? (
                                                    <Button size="sm" >문서에 추가요청</Button>
                                                ) : (
                                                    <span className="text-gray-500">등록된 단어</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 text-center">검색결과가 존재하지 않습니다.</p>
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
        <div className="space-y-3">
            <p>여기에 단어 추가 폼이 들어갑니다.</p>
            <Button onClick={onClose}>뒤로가기</Button>
        </div>
    )
}

export default WordAddModal;
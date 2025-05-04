import React, { useState } from "react";
import { X, ChevronDown, ChevronUp, Users, Book, Save } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Checkbox } from "@/app/components/ui/checkbox";
import ConfirmModal from "@/app/components/ConfirmModal";

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    wordInfo: WordInfoProps;
    onSave: (newThemes: string[], delThemes: string[]) => Promise<void>;
    injungTheme: string[];
    noInjungTheme: string[];
}

interface AccordionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

interface WordInfoProps {
    word: string;
    topic: {
        ok: string[];
        waitAdd: string[];
        waitDel: string[];
    };
}

const Accordion = ({ title, icon, children }: AccordionProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border rounded-md mb-4">
            <button
                className="flex items-center justify-between w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-t-md"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-medium">{title}</span>
                </div>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {isOpen && <div className="p-4 bg-white">{children}</div>}
        </div>
    );
};

const WordThemeEditModal = ({ isOpen, onClose, wordInfo, onSave, injungTheme, noInjungTheme }: EditModalProps) => {
    // 선택된 주제들을 관리하는 상태
    const [selectedSeniorTopics, setSelectedSeniorTopics] = useState<string[]>(
        // 초기값: ok 상태인 주제 중 노인정 주제에 해당하는 것들
        wordInfo.topic.ok.filter(topic =>
            noInjungTheme.includes(topic)
        )
    );

    const [selectedYouthTopics, setSelectedYouthTopics] = useState<string[]>(
        // 초기값: ok 상태인 주제 중 어인정 주제에 해당하는 것들
        wordInfo.topic.ok.filter(topic =>
            injungTheme.includes(topic)
        )
    );
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    // 주제 선택 가능 여부 확인 함수
    const isTopicInteractable = (topic: string) => {
        // 추가/삭제 요청 상태인 주제는 선택 불가능
        return !wordInfo.topic.waitAdd.includes(topic) && !wordInfo.topic.waitDel.includes(topic);
    };

    // 주제 선택/해제 핸들러
    const handleTopicToggle = (topic: string) => {
        // 추가/삭제 요청 상태의 주제는 선택 불가능
        if (!isTopicInteractable(topic)) return;

        if (noInjungTheme.includes(topic)) {
            if (selectedSeniorTopics.includes(topic)) {
                setSelectedSeniorTopics(prev => prev.filter(t => t !== topic));
            } else {
                setSelectedSeniorTopics(prev => [...prev, topic]);
            }
        } else {
            if (selectedYouthTopics.includes(topic)) {
                setSelectedYouthTopics(prev => prev.filter(t => t !== topic));
            } else {
                setSelectedYouthTopics(prev => [...prev, topic]);
            }
        }
    };

    // 저장 핸들러
    const handleSave = async () => {
        const newThemes: string[] = [];
        for (const topic of selectedSeniorTopics) {
            if (!wordInfo.topic.ok.includes(topic)) {
                newThemes.push(topic);
            }
        }
        for (const topic of selectedYouthTopics) {
            if (!wordInfo.topic.ok.includes(topic)) {
                newThemes.push(topic);
            }
        }
        const delThemes: string[] = [];
        for (const topic of wordInfo.topic.ok) {
            if (!selectedSeniorTopics.includes(topic) && !selectedYouthTopics.includes(topic)) {
                delThemes.push(topic);
            }
        }

        await onSave(newThemes, delThemes);
        onClose();
    };

    // 주제 상태에 따른 배지 스타일 결정
    const getTopicBadgeStyle = (topic: string) => {
        if (wordInfo.topic.ok.includes(topic)) {
            return "bg-green-100 text-green-800 hover:bg-green-200";
        } else if (wordInfo.topic.waitAdd.includes(topic)) {
            return "bg-blue-100 text-blue-800 border-dashed border-blue-300";
        } else if (wordInfo.topic.waitDel.includes(topic)) {
            return "bg-red-100 text-red-800 border-red-300";
        } else {
            return "bg-gray-100 text-gray-800 hover:bg-gray-200";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span className="text-xl font-bold">
                            &quot;{wordInfo.word}&quot; 주제 수정
                        </span>

                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4">
                    <p className="text-gray-500 mb-4">
                        이 단어에 적용할 주제를 선택해 주세요. 변경사항은 관리자 검토 후 반영됩니다.
                    </p>

                    {/* 선택된 주제 미리보기 */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">선택된 주제 ({selectedSeniorTopics.length + selectedYouthTopics.length})</h3>
                        <div className="flex flex-wrap gap-2 min-h-10 p-2 border rounded-md bg-gray-50">
                            {selectedSeniorTopics.concat(selectedYouthTopics).length > 0 ? (
                                selectedSeniorTopics.concat(selectedYouthTopics).map(topic => (
                                    <Badge
                                        key={`selected-${topic}`}
                                        variant="secondary"
                                        className="bg-blue-100 text-blue-800 pl-2 pr-1 py-1 flex items-center gap-1"
                                    >
                                        {topic}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 rounded-full ml-1 hover:bg-blue-200"
                                            onClick={() => handleTopicToggle(topic)}
                                        >
                                            <X size={10} />
                                        </Button>
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-gray-400 text-sm p-1">선택된 주제가 없습니다.</p>
                            )}
                        </div>
                    </div>

                    {/* 노인정 주제 아코디언 */}
                    <Accordion
                        title={`노인정 주제 (${selectedSeniorTopics.length}/${noInjungTheme.length})`}
                        icon={<Users size={18} className="text-blue-600" />}
                    >
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {noInjungTheme.map(topic => {
                                const isWaitState = wordInfo.topic.waitAdd.includes(topic) || wordInfo.topic.waitDel.includes(topic);

                                return (
                                    <div
                                        key={`senior-${topic}`}
                                        className="flex items-center space-x-2"
                                    >
                                        <Checkbox
                                            id={`senior-${topic}`}
                                            checked={selectedSeniorTopics.includes(topic)}
                                            onCheckedChange={() => handleTopicToggle(topic)}
                                            disabled={isWaitState}
                                            className={isWaitState ? "opacity-50" : ""}
                                        />
                                        <label
                                            htmlFor={`senior-${topic}`}
                                            className={`text-sm flex items-center ${isWaitState ? "cursor-not-allowed" : "cursor-pointer"}`}
                                        >
                                            <Badge
                                                variant="outline"
                                                className={getTopicBadgeStyle(topic)}
                                            >
                                                {topic}

                                            </Badge>
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </Accordion>

                    {/* 어인정 주제 아코디언 */}
                    <Accordion
                        title={`어인정 주제 (${selectedYouthTopics.length}/${injungTheme.length})`}
                        icon={<Book size={18} className="text-purple-600" />}
                    >
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {injungTheme.map(topic => {
                                const isWaitState = wordInfo.topic.waitAdd.includes(topic) || wordInfo.topic.waitDel.includes(topic);

                                return (
                                    <div
                                        key={`youth-${topic}`}
                                        className="flex items-center space-x-2"
                                    >
                                        <Checkbox
                                            id={`youth-${topic}`}
                                            checked={selectedYouthTopics.includes(topic)}
                                            onCheckedChange={() => handleTopicToggle(topic)}
                                            disabled={isWaitState}
                                            className={isWaitState ? "opacity-50" : ""}
                                        />
                                        <label
                                            htmlFor={`youth-${topic}`}
                                            className={`text-sm flex items-center ${isWaitState ? "cursor-not-allowed" : "cursor-pointer"}`}
                                        >
                                            <Badge
                                                variant="outline"
                                                className={getTopicBadgeStyle(topic)}
                                            >
                                                {topic}

                                            </Badge>
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </Accordion>
                </div>

                <DialogFooter className="mt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="mr-2"
                    >
                        취소
                    </Button>
                    <Button
                        onClick={()=> setConfirmModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Save size={16} />
                        변경사항 저장
                    </Button>
                </DialogFooter>
            </DialogContent>
            {confirmModalOpen && (
                <ConfirmModal
                    open={confirmModalOpen}
                    title={`"${wordInfo.word}" 단어의 주제 수정 요청을 넣으시겠습니까?`}
                    description={"요청 후 취소할 수 없습니다."}
                    onConfirm={handleSave}
                    onClose={() => setConfirmModalOpen(false)}
                />
            )}
        </Dialog>
    );
}

export default WordThemeEditModal;
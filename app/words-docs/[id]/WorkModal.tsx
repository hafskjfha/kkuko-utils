"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/app/components/ui/dialog";
import Spinner from "@/app/components/Spinner";

type ModalProps = {
	isSaving: boolean;
	onClose: () => void;
	word: string;
	status: "add" | "delete" | "ok" | "eadd" | "edelete";
	isAdmin: boolean;
	isRequester: boolean;
	onAddAccept?: () => void;
	onDeleteAccept?: () => void;
	onAddReject?: () => void;
	onDeleteReject?: () => void;
	onCancelAddRequest?: () => void;
	onCancelDeleteRequest?: () => void;
	onDelete?: () => void;
	onRequestDelete?: () => void;
	onRequestDeleteFromDoc?: () => void;
	onDeleteFromDoc?: () => void;
	onCancelDeleteFromDocsRequest?: () => void;
	onDeleteFromDocsAccept?: () => void;
	onDeleteFromDocsReject?: () => void;
	onCancelAddFromDocsRequest?: () => void;
	onAddFromDocsAccept?: () => void;
	onAddFromDocsReject?: () => void;
};

const WorkModal = ({
	isSaving,
	onClose,
	word,
	status,
	isAdmin,
	isRequester,
	onAddAccept,
	onDeleteAccept,
	onAddReject,
	onDeleteReject,
	onCancelAddRequest,
	onCancelDeleteRequest,
	onDelete,
	onRequestDelete,
	onRequestDeleteFromDoc,
	onDeleteFromDoc,
	onCancelDeleteFromDocsRequest,
	onDeleteFromDocsAccept,
	onDeleteFromDocsReject,
	onCancelAddFromDocsRequest,
	onAddFromDocsAccept,
	onAddFromDocsReject,
}: ModalProps) => {
	return (
		<Dialog open onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				{/* Spinner Overlay */}
				{isSaving && (
					<div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 rounded-lg">
						<Spinner />
					</div>
				)}
				<DialogHeader>
					<DialogTitle className="text-center">{word}</DialogTitle>
				</DialogHeader>

				<div className="space-y-2">
					{/* 상태 설명 */}
					<div className="flex items-center justify-between bg-gray-100 p-3 rounded-md">
						<span className="text-gray-700">
							{status === "add" && "현재 이 단어는 추가 요청 상태입니다."}
							{status === "delete" && "현재 이 단어는 삭제 요청 상태입니다."}
							{status === "ok" && "현재 등록된 단어입니다."}
							{status === "eadd" && "현재 문서에 추가 요청인 상태입니다."}
							{status === "edelete" && "현재 문서에서만 삭제 요청 상태입니다."}
						</span>
					</div>

					{/* 상태별 블록들 */}
					{status === "add" && (
						<>
							{isAdmin && (
								<>
									<ActionBlock
										text="추가 요청을 수락합니다."
										color="green"
										onClick={onAddAccept}
									/>
									<ActionBlock
										text="추가 요청을 거절합니다."
										color="red"
										onClick={onAddReject}
									/>
								</>
							)}
							{isRequester && (
								<ActionBlock
									text="추가 요청을 취소합니다."
									color="gray"
									onClick={onCancelAddRequest}
								/>
							)}
						</>
					)}

					{status === "delete" && (
						<>
							{isAdmin && (
								<>
									<ActionBlock
										text="삭제 요청을 수락합니다."
										color="green"
										onClick={onDeleteAccept}
									/>
									<ActionBlock
										text="삭제 요청을 거절합니다."
										color="red"
										onClick={onDeleteReject}
									/>
								</>
							)}
							{isRequester && (
								<ActionBlock
									text="삭제 요청을 취소합니다."
									color="gray"
									onClick={onCancelDeleteRequest}
								/>
							)}
						</>
					)}

					{status === "ok" && (
						<>
							{isAdmin && (
								<>
									<ActionBlock
										text="단어를 삭제합니다."
										color="red"
										onClick={onDelete}
									/>
									<ActionBlock
										text="단어를 문서에서만 삭제합니다."
										color="red"
										bg="bg-red-100"
										onClick={onDeleteFromDoc}
									/>
								</>
							)}
							<ActionBlock
								text="삭제 요청을 보냅니다."
								color="yellow"
								onClick={onRequestDelete}
							/>
							<ActionBlock
								text="문서에서만 삭제 요청을 보냅니다."
								color="yellow"
								bg="bg-yellow-100"
								onClick={onRequestDeleteFromDoc}
							/>
						</>
					)}

					{status === "edelete" && (
						<>
							{isAdmin && (
								<>
									<ActionBlock
										text="삭제 요청을 수락합니다."
										color="green"
										onClick={onDeleteFromDocsAccept}
									/>
									<ActionBlock
										text="삭제 요청을 거절합니다."
										color="red"
										onClick={onDeleteFromDocsReject}
									/>
								</>
							)}
							{isRequester && (
								<ActionBlock
									text="삭제 요청을 취소합니다."
									color="gray"
									onClick={onCancelDeleteFromDocsRequest}
								/>
							)}
						</>
						)}
						{status === "eadd" && (
							<>
								{isAdmin && (
									<>
										<ActionBlock
											text="추가 요청을 수락합니다."
											color="green"
											onClick={onAddFromDocsAccept}
										/>
										<ActionBlock
											text="추가 요청을 거절합니다."
											color="red"
											onClick={onAddFromDocsReject}
										/>
									</>
								)}
								{isRequester && (
									<ActionBlock
										text="추가 요청을 취소합니다."
										color="gray"
										onClick={onCancelAddFromDocsRequest}
									/>
								)}
							</>
						)}
				</div>

				<DialogFooter className="mt-4">
					<button
						className="w-full bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
						onClick={onClose}
					>
						닫기
					</button>
				</DialogFooter>


			</DialogContent>
		</Dialog>
	);
};

// 액션 버튼 블록 컴포넌트
const ActionBlock = ({
	text,
	color,
	onClick,
	bg,
}: {
	text: string;
	color: "green" | "red" | "gray" | "yellow";
	onClick?: () => void;
	bg?: string;
}) => {
	const bgClass =
		bg ||
		{
			green: "bg-green-50",
			red: "bg-red-50",
			gray: "bg-gray-50",
			yellow: "bg-yellow-50",
		}[color];

	const textClass = {
		green: "text-green-700",
		red: "text-red-700",
		gray: "text-gray-700",
		yellow: "text-yellow-700",
	}[color];

	const buttonClass = {
		green: "bg-green-500 hover:bg-green-600",
		red: "bg-red-500 hover:bg-red-600",
		gray: "bg-gray-500 hover:bg-gray-600",
		yellow: "bg-yellow-500 hover:bg-yellow-600",
	}[color];

	return (
		<div className={`flex items-center justify-between ${bgClass} p-3 rounded-md`}>
			<span className={textClass}>{text}</span>
			<button
				className={`${buttonClass} text-white px-4 py-1 rounded-md`}
				onClick={onClick}
			>
				{text.includes("요청을 보") ? "요청" : "실행"}
			</button>
		</div>
	);
};

export default WorkModal;

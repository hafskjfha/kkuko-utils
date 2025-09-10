"use client";
import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import {
    Megaphone,
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    AlertCircle,
    Info,
    Upload,

} from 'lucide-react';
import { SCM } from '@/app/lib/supabaseClient';
import Spinner from '@/app/components/Spinner';
import { PostgrestError } from '@supabase/supabase-js';
import { StorageError } from '@supabase/storage-js';
import ErrorModal from '@/app/components/ErrModal';
import CompleteModal from '@/app/components/CompleteModal';

interface NotificationData {
    id: number;
    title: string;
    body: string;
    img: string | null;
    created_at: string;
    end_at: string;
}

const NoticeManagementPage = () => {
    const [currentNotice, setCurrentNotice] = useState<NotificationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isImageUploading, setIsImageUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        img: '',
        end_at: ''
    });
    const [errorImageMessage, setErrorImageMessage] = useState('');
    const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
    const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState<ErrorMessage | null>(null);

    // 모달 표시 함수
    const makeError = (error: PostgrestError | StorageError, inputValue: string) => {
        setErrorModalOpen({
            ErrName: error.name,
            ErrMessage: error.message,
            ErrStackRace: error.stack,
            inputValue: inputValue
        })
    }

    const showSuccess = (message: string) => {
        setSuccessModal({ isOpen: true, message });
    };

    // 현재 공지사항 가져오기
    const fetchCurrentNotice = async () => {
        setIsLoading(true);
        const { data, error } = await SCM.get().notice();
        if (error) {
            setIsLoading(false);
            return makeError(error, '공지사항 조회');
        }
        setCurrentNotice(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCurrentNotice();
    }, []);

    // 폼 데이터 초기화
    const resetForm = () => {
        setFormData({
            title: '',
            body: '',
            img: '',
            end_at: ''
        });
        setSelectedFile(null);
        setImagePreview('');
    };

    // 파일 선택 핸들러
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        setErrorImageMessage('');
        const file = event.target.files?.[0];
        if (file) {
            // 파일 크기 체크 (5MB 제한)
            if (file.size > 5 * 1024 * 1024) {
                setErrorImageMessage('파일 크기는 5MB 이하여야 합니다.');
                return;
            }

            // 파일 타입 체크
            if (!file.type.startsWith('image/')) {
                setErrorImageMessage('이미지 파일만 업로드 가능합니다.');
                return;
            }

            setSelectedFile(file);

            // 미리보기 생성
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // 이미지 업로드
    const uploadImage = async () => {
        setErrorImageMessage('');
        if (!selectedFile) return null;

        setIsImageUploading(true);
        const fileName = `notice_img/${Date.now()}_${selectedFile.name}`;
        const { error } = await SCM.uploadImage(selectedFile, fileName);

        if (error) {
            makeError(error, '이미지 업로드');
            setIsImageUploading(false);
            return null;
        }

        // 공개 URL 가져오기
        const { data: publicUrlData } = SCM.getPublicUrl(fileName);
        setIsImageUploading(false);
        return publicUrlData.publicUrl;

    };

    // 이미지 제거
    const removeImage = () => {
        setSelectedFile(null);
        setImagePreview('');
        setErrorImageMessage('');
        setFormData(prev => ({ ...prev, img: '' }));
    };

    // 수정 모드 시작
    const startEdit = () => {
        if (currentNotice) {
            setFormData({
                title: currentNotice.title,
                body: currentNotice.body,
                img: currentNotice.img || '',
                end_at: currentNotice.end_at ? new Date(currentNotice.end_at).toISOString().slice(0, 16) : ''
            });
            setImagePreview(currentNotice.img || '');
        }
        setIsEditing(true);
    };

    // 작성 모드 시작
    const startCreate = () => {
        resetForm();
        setIsCreating(true);
    };

    // 공지사항 생성
    const handleCreate = async () => {
        if (!formData.title.trim() || !formData.body.trim()) {
            return;
        }

        setIsLoading(true);
        try {
            // 이미지 업로드 (선택된 파일이 있는 경우)
            let imageUrl = formData.img;
            if (selectedFile) {
                const uploadedUrl = await uploadImage();
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                } else {
                    return; // 업로드 실패 시 중단
                }
            }

            // 기존 공지사항이 있으면 삭제
            if (currentNotice) {
                const { error: deleteError } = await SCM.delete().notificationById(currentNotice.id);
                if (deleteError) {
                    makeError(deleteError, '기존 공지사항 삭제');
                    return;
                }
            }

            const insertData = {
                title: formData.title.trim(),
                body: formData.body.trim(),
                img: imageUrl.trim() || null,
                end_at: formData.end_at
            };

            const { data, error } = await SCM.add().notification(insertData);
            if (error) {
                makeError(error, '공지사항 생성');
                return;
            }

            setCurrentNotice(data);
            setIsCreating(false);
            resetForm();
            showSuccess('공지사항이 성공적으로 생성되었습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 공지사항 수정
    const handleUpdate = async () => {
        if (!currentNotice) {
            return;
        }

        setIsLoading(true);
        try {
            // 이미지 업로드 (선택된 파일이 있는 경우)
            let imageUrl = formData.img;
            if (selectedFile) {
                const uploadedUrl = await uploadImage();
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                } else {
                    return; // 업로드 실패 시 중단
                }
            }

            const updateData = {
                title: formData.title.trim(),
                body: formData.body.trim(),
                img: imageUrl.trim() || null,
                end_at: formData.end_at ? new Date(formData.end_at).toISOString() : null
            };

            const { data, error } = await SCM.update().notification(currentNotice.id, updateData);
            if (error) {
                makeError(error, '공지사항 수정');
                return;
            }

            setCurrentNotice(data);
            setIsEditing(false);
            resetForm();
            showSuccess('공지사항이 성공적으로 수정되었습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 삭제 확인 모달 열기
    const openDeleteConfirm = () => {
        setDeleteConfirmModal(true);
    };

    // 공지사항 삭제
    const handleDelete = async () => {
        if (!currentNotice) return;

        setDeleteConfirmModal(false);
        setIsLoading(true);
        try {
            const { error } = await SCM.delete().notificationById(currentNotice.id);
            if (error) {
                makeError(error, '공지사항 삭제');
                return;
            }

            setCurrentNotice(null);
            showSuccess('공지사항이 성공적으로 삭제되었습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 편집 취소
    const cancelEdit = () => {
        setIsEditing(false);
        setIsCreating(false);
        resetForm();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300 flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
                        <Megaphone className="w-8 h-8 text-orange-600" />
                        공지사항 관리
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        현재 등록된 공지사항을 관리하고 새로운 공지사항을 작성할 수 있습니다.
                    </p>
                </div>

                {/* 현재 공지사항 */}
                {!isCreating && (
                    <Card className="mb-6 bg-white dark:bg-gray-800 shadow-sm border border-transparent dark:border-gray-700">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <Info className="w-5 h-5" />
                                        현재 공지사항
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-300">
                                        {currentNotice ? '현재 서비스에 표시되고 있는 공지사항입니다.' : '등록된 공지사항이 없습니다.'}
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    {currentNotice && !isEditing && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={startEdit}
                                                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                            >
                                                <Edit className="w-4 h-4 mr-1" />
                                                수정
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={openDeleteConfirm}
                                                className="text-red-600 border-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                삭제
                                            </Button>
                                        </>
                                    )}
                                    {!currentNotice && !isEditing && (
                                        <Button
                                            onClick={startCreate}
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <Plus className="w-4 h-4 mr-1" />
                                            공지사항 작성
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {currentNotice && !isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                            {currentNotice.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                            {currentNotice.body}
                                        </p>
                                    </div>
                                    {currentNotice.img && (
                                        <div>
                                            <img
                                                src={currentNotice.img}
                                                alt="공지 이미지"
                                                className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                                            />
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                        <span>생성일: {new Date(currentNotice.created_at).toLocaleString('ko-KR')}</span>
                                        {currentNotice.end_at && (
                                            <span>만료일: {new Date(currentNotice.end_at).toLocaleString('ko-KR')}</span>
                                        )}
                                    </div>
                                </div>
                            ) : !currentNotice && !isEditing ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                                    <p>등록된 공지사항이 없습니다.</p>
                                    <p className="text-sm">새로운 공지사항을 작성해주세요.</p>
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                )}

                {/* 편집/생성 폼 */}
                {(isEditing || isCreating) && (
                    <Card className="bg-white dark:bg-gray-800 shadow-sm border border-transparent dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                {isCreating ? <Plus className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                                {isCreating ? '새 공지사항 작성' : '공지사항 수정'}
                            </CardTitle>
                            <CardDescription className="dark:text-gray-300">
                                {isCreating ? '새로운 공지사항을 작성합니다.' : '현재 공지사항을 수정합니다.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    제목 *
                                </Label>
                                <Input
                                    id="title"
                                    type="text"
                                    placeholder="공지사항 제목을 입력하세요"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="body" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    내용 *
                                </Label>
                                <Textarea
                                    id="body"
                                    placeholder="공지사항 내용을 입력하세요"
                                    value={formData.body}
                                    onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                                    className="mt-1 min-h-[200px]"
                                />
                            </div>

                            <div>
                                <Label htmlFor="img" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    이미지
                                </Label>
                                <div className="mt-1 space-y-3">
                                    {/* 파일 업로드 */}
                                    <div className="flex items-center gap-3">
                                        <Input
                                            id="img-file"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => document.getElementById('img-file')?.click()}
                                            disabled={isImageUploading}
                                            className="flex items-center gap-2"
                                        >
                                            {isImageUploading ? (
                                                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                            ) : (
                                                <Upload className="w-4 h-4" />
                                            )}
                                            {isImageUploading ? '업로드 중...' : '이미지 선택'}
                                        </Button>
                                    </div>

                                    {/* 이미지 미리보기 */}
                                    {(imagePreview || formData.img) && (
                                        <div className="relative">
                                            <img
                                                src={imagePreview || formData.img}
                                                alt="이미지 미리보기"
                                                className="max-w-full max-h-48 rounded-lg border border-gray-200 dark:border-gray-700"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={removeImage}
                                                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}

                                    {/* URL 직접 입력 */}
                                    <Input
                                        id="img"
                                        type="url"
                                        disabled
                                        value={formData.img}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, img: e.target.value }));
                                            if (e.target.value && !selectedFile) {
                                                setImagePreview(e.target.value);
                                            }
                                        }}
                                        className="text-sm"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        이미지 파일을 업로드하세요. (최대 5MB)
                                    </p>
                                    {errorImageMessage && (
                                        <div className="text-sm text-red-600 dark:text-red-400">
                                            {errorImageMessage}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="end_at" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    만료 일시 *
                                </Label>
                                <Input
                                    id="end_at"
                                    type="datetime-local"
                                    value={formData.end_at}
                                    onChange={(e) => setFormData(prev => ({ ...prev, end_at: e.target.value }))}
                                    className="mt-1"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    만료일자를 정확하게 하지 않으면 공지사항이 원하지 않을때 사라질 수 있습니다.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={isCreating ? handleCreate : handleUpdate}
                                    disabled={isImageUploading || !formData.title.trim() || !formData.body.trim() || !formData.end_at}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Save className="w-4 h-4 mr-1" />
                                    {isCreating ? '작성 완료' : '수정 완료'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={cancelEdit}
                                    disabled={isImageUploading}
                                    className="text-gray-600 border-gray-300 hover:bg-gray-50"
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    취소
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* 도움말 */}
                <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-4">
                        <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            사용 가이드
                        </h3>
                        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                            <li>• 시스템은 하나의 공지사항만 활성화됩니다.</li>
                            <li>• 새 공지사항을 작성하면 기존 공지사항은 자동으로 교체됩니다.</li>
                            <li>• 이미지는 파일 업로드를 해야 합니다.</li>
                            <li>• 업로드된 이미지는 Supabase 스토리지의 public_img/notice_img 경로에 저장됩니다.</li>
                            <li>• 이미지 파일은 최대 5MB까지 업로드 가능합니다.</li>
                            <li>• 만료 일시를 설정하면 해당 시간 이후 공지사항이 자동으로 숨겨집니다.</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* 에러 모달 */}
            {errorModalOpen && (
                <ErrorModal
                    error={errorModalOpen}
                    onClose={() => setErrorModalOpen(null)}
                />
            )}

            {/* 성공 모달 */}
            <CompleteModal
                open={successModal.isOpen}
                onClose={() => setSuccessModal({ isOpen: false, message: '' })}
                title={successModal.message}
            />

            {/* 삭제 확인 모달 */}
            {deleteConfirmModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4 bg-white dark:bg-gray-800">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                공지사항 삭제 확인
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                정말로 현재 공지사항을 삭제하시겠습니까?<br />
                                삭제된 공지사항은 복구할 수 없습니다.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setDeleteConfirmModal(false)}
                                    className="text-gray-600 border-gray-300 hover:bg-gray-50"
                                >
                                    취소
                                </Button>
                                <Button
                                    onClick={handleDelete}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    삭제
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}


        </div>
    );
};

export default NoticeManagementPage;

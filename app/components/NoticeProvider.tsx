"use client";

import { useNotice } from "@/app/hooks/useNotice";
import NoticeModal from "@/app/components/NoticeModal";

export default function NoticeProvider() {
    const { notice, showNoticeModal, closeNoticeModal } = useNotice();

    if (!notice || !showNoticeModal) {
        return null;
    }

    return (
        <NoticeModal
            open={showNoticeModal}
            onClose={closeNoticeModal}
            notice={notice}
        />
    );
}

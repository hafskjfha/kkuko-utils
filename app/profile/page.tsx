import ProfilePage from "./ProfilePage";
import { Suspense } from "react";

export default function ProfilePageA() {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <Suspense fallback={<div>Loading...</div>}>
                <ProfilePage />
            </Suspense>
        </div>
    );
}

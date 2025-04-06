import React from "react";
import AuthPage from "./auth";

export async function generateMetadata() {
	return {
		title: "끄코 유틸리티 - 로그인/회원가입",
		description: '끄코 유틸리티 - 로그인/회원가입',
	};
}

const OAuthpage: React.FC = () => {
    return (
        <AuthPage />
    )
}

export default OAuthpage;
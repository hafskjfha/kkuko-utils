const Footer:React.FC = () => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-8 md:flex md:justify-between md:items-center">
                {/* 로고 또는 제목 */}
                <div className="text-xl font-bold mb-4 md:mb-0">
                    <a href="/" className="hover:text-gray-300 transition-colors">
                        Kkuko Utils
                    </a>
                </div>
                {/* 네비게이션 링크 */}
                <div className="flex flex-col md:flex-row md:space-x-6 text-sm">
                    <a href="https://github.com/hafskjfha/kkuko-utils" target="_blank" className="hover:text-gray-300 transition-colors mb-2 md:mb-0">
                        Github
                    </a>
                    <a  className="hover:text-gray-300 transition-colors mb-2 md:mb-0">{/* href="" */}
                        Discord
                    </a>
                    <a  className="hover:text-gray-300 transition-colors mb-2 md:mb-0">{/* href="" */}
                        Bug report
                    </a>
                </div>
            </div>
            {/* 저작권 섹션 */}
            <div className="border-t border-gray-700">
                <div className="container mx-auto px-4 py-4 text-center text-sm">
                    © {new Date().getFullYear()} hafskjfha. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;

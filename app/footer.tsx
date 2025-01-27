import Link from 'next/link';
const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-900 text-white flex-shrink-0">
            <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                {/* 로고 또는 제목 */}
                <div className="text-xl font-bold">
                    <Link href="/" className="hover:text-gray-300 transition-colors">
                        Kkuko Utils
                    </Link>
                </div>
                {/* 네비게이션 링크 */}
                <nav className="flex flex-col md:flex-row md:space-x-6 text-sm space-y-2 md:space-y-0">
                    <a
                        href="https://github.com/hafskjfha/kkuko-utils"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gray-300 transition-colors"
                    >
                        Github
                    </a>
                    <a
                        href="#"
                        className="hover:text-gray-300 transition-colors"
                    >
                        Discord
                    </a>
                    <a
                        href="#"
                        className="hover:text-gray-300 transition-colors"
                    >
                        Bug report
                    </a>
                    <Link href="/release-note" className="hover:text-gray-300 transition-colors">
                        Release note
                    </Link>
                </nav>
            </div>
            {/* 저작권 섹션 */}
            <div className="border-t border-gray-700 mt-4">
                <div className="container mx-auto px-4 py-4 text-center text-sm">
                    © {new Date().getFullYear()} hafskjfha. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;

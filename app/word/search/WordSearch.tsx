'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SCM } from '@/app/lib/supabaseClient';
import { Search, Loader2, BookOpen, ArrowRight } from 'lucide-react';

export default function WordSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        
        setLoading(true);
        setSearchPerformed(true);
        setResults([]);
        
        try {
            const {data, error} = await SCM.get().wordsByQuery(query)
            if (error) return setLoading(false);
            setResults(data);
        } catch (error) {
            console.error('검색 중 오류 발생:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // 입력 필드에 포커스 설정
    useEffect(() => {
        const inputElement = document.getElementById('search-input');
        if (inputElement) {
            inputElement.focus();
        }
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 p-4">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sm:p-8">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
                    <span className="text-blue-600">단어</span> 검색
                </h1>
                
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                        id="search-input"
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="검색할 단어를 입력하세요"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                        onClick={handleSearch}
                        className="absolute inset-y-0 right-0 px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : '검색'}
                    </button>
                </div>
                
                {searchPerformed && (
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="font-medium text-gray-700 dark:text-gray-200">
                                검색 결과 {results.length > 0 ? `(${results.length}개)` : ''}
                            </h2>
                        </div>
                        
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                                <span className="ml-2 text-gray-600 dark:text-gray-300">검색 중...</span>
                            </div>
                        ) : results.length > 0 ? (
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
                                {results.map((word, index) => (
                                    <li 
                                        key={index} 
                                        className="hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                                            <div className="flex items-center">
                                                <BookOpen className="h-5 w-5 text-blue-500 mr-3" />
                                                <span className="text-gray-800 dark:text-gray-100 font-medium">{word}</span>
                                            </div>
                                            <Link 
                                                href={`/word/search/${word}`}
                                                className="ml-4 flex items-center px-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-colors text-gray-700 dark:text-gray-200 font-medium"
                                            >
                                                상세보기
                                                <ArrowRight className="ml-1 h-4 w-4" />
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="py-12 text-center">
                                <p className="text-gray-500 dark:text-gray-400">검색 결과가 없습니다</p>
                                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">다른 검색어로 시도해보세요</p>
                            </div>
                        )}
                    </div>
                )}
                
                <div className="text-xs text-center text-gray-400 dark:text-gray-500 mt-6">
                    정확한 단어를 입력하시거나, 5글자 이상 입력하시면 시작 부분이 일치하는 단어를 검색합니다
                </div>
            </div>
        </div>
    );

}
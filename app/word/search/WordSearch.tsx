'use client';

import { useState } from 'react';
import Link from 'next/link';
import Spinner from '@/app/components/Spinner';
import { supabase } from '@/app/lib/supabaseClient';

export default function WordSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query) return;
        setQuery((prev)=>prev.replace(/[^가-힣a-zA-Z0-9]/g, ''));
        setLoading(true);
        setResults([]);
        let dbqueryA =  supabase.from('words').select('word');
        if (query.length > 4){
            dbqueryA = dbqueryA.ilike('word', `${query}%`);
        }
        else{
            dbqueryA = dbqueryA.eq('word',query);
        }
        const { data: getWords, error: getWordsError } = await dbqueryA;
        
        let dbqueryB = supabase.from('wait_words').select('word');    
        if (query.length > 4){
            dbqueryB = dbqueryB.ilike('word', `${query}%`);
        }
        else{
            dbqueryB = dbqueryB.eq('word',query);
        }
        const { data: getWaitWords, error: getWaitWordsError } = await dbqueryB;
        if (getWordsError || getWaitWordsError) {
            console.error('Error fetching words:', getWordsError || getWaitWordsError);
            setLoading(false);
            return;
        }
        const words = getWords?.map((item) => item.word) || [];
        const waitWords = getWaitWords?.map((item) => item.word) || [];
        const allWords = [...words, ...waitWords];
        setResults(allWords);
        setLoading(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md mt-[-80px]">
                <h1 className="text-xl font-bold mb-4 text-center">단어 검색</h1>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="검색할 단어 입력"
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleSearch}
                    className="w-full mt-3 bg-blue-500 text-white py-3 rounded hover:bg-blue-600"
                    disabled={loading}
                >
                    {loading ? '검색중': '검색'}
                </button>
                <div className="mt-4 max-h-60 overflow-y-auto border-t border-gray-300">
                    <ul>
                        {results.length > 0 ? (
                            results.map((word, index) => (
                                <li key={index} className="p-3 border-b border-gray-200 flex justify-between items-center overflow-hidden">
                                    <span className="truncate max-w-[70%]">{word}</span>
                                    <Link href={`/word/search/${word}`}>
                                        <button className="ml-2 px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 whitespace-nowrap">
                                            단어 정보 보기
                                        </button>
                                    </Link>
                                </li>
                            ))
                        ) : 
                        loading ? (
                            <Spinner />
                        ) : (
                            <p className="text-center text-gray-500 mt-2">검색 결과가 없습니다.</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );

}

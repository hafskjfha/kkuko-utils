"use client";
import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/app/components/ui/card';
import {
    Plus,
    Trash2,
    FileText,
    BookOpen,
    Activity,
    AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

const AdminDashboard = () => {
    const router = useRouter();
    const [wordCount,setWordCount] = useState<number|null>(null);
    const [waitRequestCount,setWaitRequestCount] = useState<number|null>(null);

    const getWordCount = async () => {
        const {count, error} = await supabase.from('words').select('word',{ count: 'exact', head: true });
        if (error){
            console.log(error)
        }
        if (count){
            setWordCount(count)
        }
    }

    const getWaitRequestCount = async () => {
        const {count, error} = await supabase.from('wait_words').select('',{ count: 'exact', head: true });
        if (error){
            console.log(error)
            
        }
        if (count){
            setWaitRequestCount(count)
        }else{
            setWaitRequestCount(0);
        }
    }

    useEffect(()=>{
        getWordCount();
        getWaitRequestCount();
    },[])

    const handleNavigation = (path: string) => {
        router.push(path)
    };

    const menuItems = [
        {
            title: '단어 대량 추가',
            description: '새로운 단어들을 일괄적으로 시스템에 등록합니다',
            icon: Plus,
            path: '/add-words',
            color: 'text-green-600',
            bgColor: 'bg-green-50 hover:bg-green-100',
            borderColor: 'border-green-200'
        },
        {
            title: '단어 대량 삭제',
            description: '불필요한 단어들을 일괄적으로 제거합니다',
            icon: Trash2,
            path: '/del-words',
            color: 'text-red-600',
            bgColor: 'bg-red-50 hover:bg-red-100',
            borderColor: 'border-red-200'
        },
        {
            title: '요청 처리',
            description: '사용자 요청사항을 검토하고 처리합니다',
            icon: FileText,
            path: '/request-words',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 hover:bg-blue-100',
            borderColor: 'border-blue-200'
        }
    ];

    const stats = [
        {
            title: '총 단어 수',
            value: wordCount,
            icon: BookOpen,
        },
        {
            title: '처리 대기 요청',
            value: waitRequestCount,
            icon: AlertCircle,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">관리자 대시보드</h1>
                    <p className="text-gray-600">단어 관리 시스템의 전반적인 운영을 담당합니다</p>
                </div>

                {/* 통계 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                                        <p className="text-2xl font-bold text-gray-900">{stat.value===null ? "loading..." : stat.value}</p>
                                        <div className="flex items-center mt-2">
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <stat.icon className="w-6 h-6 text-gray-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* 주요 기능 메뉴 */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">주요 기능</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {menuItems.map((item, index) => (
                            <Card
                                key={index}
                                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${item.bgColor} ${item.borderColor} border-2`}
                                onClick={() => handleNavigation(item.path)}
                            >
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                                            <item.icon className={`w-6 h-6 ${item.color}`} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-semibold text-gray-900">
                                                {item.title}
                                            </CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <CardDescription className="text-gray-600 leading-relaxed">
                                        {item.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* 빠른 액세스 */}
                <Card className="bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900">빠른 액세스</CardTitle>
                        <CardDescription>자주 사용하는 기능들에 빠르게 접근할 수 있습니다</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <button
                                onClick={() => handleNavigation('/add-words')}
                                className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                            >
                                <Plus className="w-8 h-8 text-green-600 mb-2" />
                                <span className="text-sm font-medium text-gray-700">단어 추가</span>
                            </button>
                            <button
                                onClick={() => handleNavigation('/del-words')}
                                className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
                            >
                                <Trash2 className="w-8 h-8 text-red-600 mb-2" />
                                <span className="text-sm font-medium text-gray-700">단어 삭제</span>
                            </button>
                            <button
                                onClick={() => handleNavigation('/request-words')}
                                className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                            >
                                <FileText className="w-8 h-8 text-blue-600 mb-2" />
                                <span className="text-sm font-medium text-gray-700">요청 처리</span>
                            </button>
                            <button className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200">
                                <Activity className="w-8 h-8 text-purple-600 mb-2" />
                                <span className="text-sm font-medium text-gray-700">활동 로그</span>
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
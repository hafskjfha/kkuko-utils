"use client";
import DocumentCard from "./DocsInfoCard";
import { useState } from "react";

interface Document {
    id: string;
    name: string;
    maker: string;
    last_update: string;
    is_manager: boolean;
    typez: "letter" | "theme" | "ect";
}

interface WordsDocsHomeProps {
    docs: Document[];
}

const Button: React.FC<{ onClick: () => void; className?: string; children: React.ReactNode }> = ({ onClick, className, children }) => (
    <button 
        onClick={onClick} 
        className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition ${className}`}
    >
        {children}
    </button>
);

const WordsDocsHome: React.FC<WordsDocsHomeProps> = ({ docs }) => {
    const typeOrder = ['letter', 'theme', 'ect']; // 
    const [expandedTypes, setExpandedTypes] = useState<{ [key: string]: boolean }>(
        typeOrder.reduce((acc, type) => ({ ...acc, [type]: true }), {})
    );

    const toggleType = (typez: string) => {
        setExpandedTypes(prev => ({ ...prev, [typez]: !prev[typez] }));
    };

    const groupedDocs = docs.reduce<{ [key: string]: Document[] }>((acc, doc) => {
        acc[doc.typez] = acc[doc.typez] || [];
        acc[doc.typez].push(doc);
        return acc;
    }, {});

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
            {typeOrder.map((typez) => (
                <div key={typez} className="w-full max-w-4xl mb-6">
                    <Button onClick={() => toggleType(typez)} className="w-full text-left font-bold text-lg mb-2">
                        {typez} ({groupedDocs[typez]?.length || 0}) - {expandedTypes[typez] ? "펼쳐짐" : "접힘"}
                    </Button>
                    {expandedTypes[typez] && groupedDocs[typez] && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {groupedDocs[typez].map((doc) => (
                                <DocumentCard 
                                    key={doc.id} 
                                    id={doc.id} 
                                    name={doc.name} 
                                    maker={doc.maker} 
                                    last_update={doc.last_update} 
                                    is_manager={doc.is_manager} 
                                />
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default WordsDocsHome;
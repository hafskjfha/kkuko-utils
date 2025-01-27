"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import type { ErrorMessage } from '../types/type';
import type { AxiosError } from 'axios';
import ErrorModal from '../components/ErrModal';

interface Note {
    id: number;
    content: string;
    created_at: string;
    title: string;
}

const ReleaseNote: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorModalView, seterrorModalView] = useState<ErrorMessage | null>(null);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await axios.get<{data:Note[]}>('/api/get-note');
                setNotes(response.data.data);
                setLoading(false);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    const axiosError = err as AxiosError;
                    seterrorModalView({
                        ErrName: axiosError.name,
                        ErrMessage: axiosError.message,
                        ErrStackRace: axiosError.stack || null,
                        inputValue: null,
                        HTTPStatus: axiosError.response?.status,
                        HTTPData: `${axiosError.response?.data}`
                    });
    
                } else if (err instanceof Error) {
                    seterrorModalView({
                        ErrName: err.name,
                        ErrMessage: err.message,
                        ErrStackRace: err.stack,
                        inputValue: null
                    });
    
                } else {
                    seterrorModalView({
                        ErrName: null,
                        ErrMessage: null,
                        ErrStackRace: err as string,
                        inputValue: null
                    });
                }
                setLoading(false);
            }
        };

        fetchNotes();
    }, []);

    if (loading) {
        return <div className="text-center p-4">Loading...</div>;
    }


    return (
        <div className={`bg-white text-black dark:bg-gray-900 dark:text-white min-h-screen p-4`}>
            <header className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">릴리즈 노트</h1>
            </header>
            <main>
                {notes.map((note) => (
                    <section key={note.id} className="mb-4">
                        <h2 className="text-xl font-semibold">{note.title}</h2>
                        <p className="mt-2">{note.content}</p>
                        <p className="mt-1 text-sm text-gray-500">날짜: {new Date(note.created_at).toLocaleString()}</p>
                    </section>
                ))}
                {errorModalView && <ErrorModal error={errorModalView} onClose={() => seterrorModalView(null)} />}
            </main>
        </div>
    );
};

export default ReleaseNote;

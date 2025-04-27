import WordAddForm from './WordAddFrom';
import WordAddWrapper from './WordAddWrapper';
import { Suspense } from 'react';

export default async function WordAddPage({ searchParams }:{searchParams:Promise<{docsID?: string}>}) {
    const docsID = (await searchParams).docsID ? Number((await searchParams).docsID) : undefined;
    return (
        <div className="max-w-5xl mx-auto px-4 py-8 mb-20">
            <Suspense fallback={<div>Loading...</div>}>
                {!docsID || isNaN(docsID) ? <WordAddForm  /> : <WordAddWrapper docsID={docsID} /> }
            </Suspense>
        </div>
    );
}
import React, { Suspense } from 'react';
import WordCombinerClient from './WordCombinerClient';
import { supabase } from '../lib/supabaseClient';
import { PostgrestError } from '@supabase/supabase-js';
import Spinner from '../components/Spinner';

export const revalidate = 0;

interface WordCombinerWithData {
	len5: string[];
	len6: string[];
	error: null;
}


export async function generateMetadata() {
	return {
		title: "끄코 유틸리티 - 단어조합기",
		description: '끄코 유틸리티 - 단어조합기',
	};
}

const getWords = async () => {
	const { data: lastUpdateData, error: lastUpdateError } = await supabase.from('last_update').select('*').eq('table_name', 'words').maybeSingle();
	if (lastUpdateError || !lastUpdateData) {
		return { len5: [], len6: [], error: lastUpdateError ?? new PostgrestError({ message: "not found table", hint: "", code: "null", details: "null" }) };
	}
	

	const { data, error } = await supabase.from('words').select('word').in('length', [5, 6]);
	if (error) {
		return { len5: [], len6: [], error };
	}
	const datas: WordCombinerWithData = { len5: [], len6: [], error };
	for (const { word } of data) {
		if (word.length == 5) {
			datas.len5.push(word);
		}
		else {
			datas.len6.push(word);
		}
	}
	
	return datas;
}

const word_combiner_Home: React.FC = async () => {
	const prop = await getWords()
	return (
		<Suspense fallback={<Spinner />}>
			< WordCombinerClient prop={prop} />
		</Suspense>
	)
}

export default word_combiner_Home;
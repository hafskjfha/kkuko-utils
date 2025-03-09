import React from 'react';
import WordCombinerClient from './WordCombinerClient';
import { supabase } from '../lib/supabaseClient';
import { cache } from "react";
import { PostgrestError } from '@supabase/supabase-js';

interface WordCombinerWithData {
	len5: string[];
	len6: string[];
	error: null;
}

interface WordCombinerWithError {
	len5: never[];
	len6: never[];
	error: PostgrestError;
}

type WordCombinerClientProp = WordCombinerWithData | WordCombinerWithError;

// ✅ last_update 값을 저장할 변수 (캐싱)
let cachedData: WordCombinerClientProp | null = null;
let lastFetchedTime: string | null = null; // 마지막으로 데이터 가져온 시간

export async function generateMetadata() {
	return {
		title: "끄코 유틸리티 - 단어조합기",
		description: '끄코 유틸리티 - 단어조합기',
	};
}

const getWords = cache(async () => {
	const { data: lastUpdateData, error: lastUpdateError } = await supabase.from('last_update').select('*').eq('table_name','words').maybeSingle();
	if (lastUpdateError || !lastUpdateData){
		return { len5: [], len6: [], error: lastUpdateError ?? new PostgrestError({message: "not found table",hint:"",code:"null",details:"null"}) };
	}

	const currentLastUpdate = lastUpdateData.last_modified;
	if (cachedData && lastFetchedTime === currentLastUpdate){
		return cachedData;
	}

	const { data , error} =  await supabase.from('words').select('word').in('length', [5, 6]);
	if (error){
		return { len5: [], len6: [], error };
	}
	const datas:WordCombinerWithData = {len5:[], len6: [], error};
	for (const {word} of data){
		if (word.length == 5){
			datas.len5.push(word);
		}
		else{
			datas.len6.push(word);
		}
	}
	cachedData = datas;
	lastFetchedTime = currentLastUpdate;
	return datas;
})

const word_combiner_Home: React.FC = async () => {
	const prop = await getWords()
	return (
		< WordCombinerClient prop={prop}/>
	)
}

export default word_combiner_Home;
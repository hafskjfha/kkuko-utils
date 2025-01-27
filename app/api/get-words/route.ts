import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/app/types/database.types';
import zlib from 'zlib';

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient<Database>(supabaseUrl, serviceKey);

export async function GET() {
    const get5 = async () => {
        const {data:len5,error:len5Error} = await supabase.from('len5_word').select('word');
        if (!len5 || len5Error){
            throw len5Error;
        }
        else{
            return len5.map(w => w.word);
        }
    }
    const get6 = async () => {
        const {data:len6, error:len6Error} = await supabase.from('len6_word').select('word');
        if (!len6 || len6Error){
            throw len6Error;
        }
        else{
            return len6.map(w => w.word);
        }
    }

    try{
        const [len5, len6] = await Promise.all([get5(), get6()]);
        const jsonData = JSON.stringify({len5, len6});
        const compressedData = zlib.gzipSync(jsonData);
        return new NextResponse(compressedData, {
            headers: {
                'Content-Encoding': 'gzip',
                'Content-Type': 'application/json',
            },
        });

    } catch{
        return NextResponse.json(null,{status:500});
    }
}

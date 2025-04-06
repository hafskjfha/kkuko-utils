import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/app/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient<Database>(supabaseUrl, serviceKey);

export async function GET(){
    try{
        const {data,error} = await supabase.from('release_note').select('*');
        if (!data || error){
            throw error;
        }
        else{
            return NextResponse.json({data});
        }
    }catch{
        return NextResponse.json(null,{status:500})
    }


}
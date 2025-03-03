import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(
    supabaseUrl, 
    supabaseAnonKey,
    {
        auth: {
            persistSession: true, // 세션을 자동으로 저장
            autoRefreshToken: true, // 토큰 자동 갱신 활성화
        },
    }
);
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../types/database.types'
import { SupabaseClientManager } from './supabase/SupabaseClientManager';

export const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export const SCM = new SupabaseClientManager(supabase);